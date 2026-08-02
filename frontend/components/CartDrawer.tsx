'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, ArrowRight, CheckCircle, MapPin, Phone, User, Ticket } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { API_URL } from '../lib/api';
import dynamic from 'next/dynamic';

const LocationPickerMap = dynamic(() => import('./LocationPickerMap'), {
  ssr: false,
  loading: () => <div className="w-full bg-black/40 animate-pulse rounded-xl flex items-center justify-center text-white/50 text-xs mt-3" style={{ height: '256px' }}>Loading map...</div>
});

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    packagingFee,
    deliveryFee,
    setDeliveryFee,
    gst,
    discount,
    grandTotal,
    couponCode,
    applyCoupon,
    removeCoupon
  } = useCart();

  // Form states
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [tableNo, setTableNo] = useState('');
  const [customerLat, setCustomerLat] = useState<number | null>(null);
  const [customerLng, setCustomerLng] = useState<number | null>(null);
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [tempLat, setTempLat] = useState<number | null>(null);
  const [tempLng, setTempLng] = useState<number | null>(null);
  
  // Idempotency Key for Orders
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());
  
  // OTP Verification States
  const [otpInput, setOtpInput] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'UPI'>('COD');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'PHONEPE' | 'GPAY' | 'PAYTM'>('PHONEPE');
  const [deliveryType, setDeliveryType] = useState<'Delivery' | 'DineIn' | 'Takeaway'>('Delivery');
  const [locationChecking, setLocationChecking] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Auto-trigger location access for Delivery when drawer opens
  useEffect(() => {
    if (isOpen && deliveryType === 'Delivery') {
      handleServiceModeChange('Delivery');
    }
  }, [isOpen]);

  // ── Restaurant GPS coordinates ──────────────────────────────────────────────
  // UPDATE these to your exact restaurant GPS pin before going live.
  // Get them from Google Maps: right-click on your restaurant → "What's here?"
  const RESTAURANT_LAT = 17.3616;   // ← replace with your exact latitude
  const RESTAURANT_LNG = 78.5480;   // ← replace with your exact longitude
  const DINE_IN_RADIUS_METERS = 150; // customers must be within 150m

  /** Haversine great-circle distance between two GPS points (returns metres) */
  const haversineDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371000; // Earth radius in metres
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  /** Handles service mode selection. Dine-In and Delivery require GPS verification. */
  const handleServiceModeChange = (type: string) => {
    setLocationError(null);
    
    if (type === 'Takeaway') {
      setDeliveryType('Takeaway');
      setDeliveryFee(0);
      return;
    }

    if (!navigator.geolocation) {
      if (type === 'DineIn') setLocationError('Your browser does not support location access. Dine-In unavailable.');
      if (type === 'Delivery') {
        setDeliveryType('Delivery');
        setDeliveryFee(30); // fallback
      }
      return;
    }
    
    setLocationChecking(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const distance = haversineDistance(latitude, longitude, RESTAURANT_LAT, RESTAURANT_LNG);
        setLocationChecking(false);
        
        if (type === 'DineIn') {
          if (distance <= DINE_IN_RADIUS_METERS) {
            setDeliveryType('DineIn');
          } else {
            setLocationError(`You are not inside the Restaurant. You cannot place a Dine-In order. (${Math.round(distance)}m away)`);
          }
        } else if (type === 'Delivery') {
          if (distance > 18000) {
            setLocationError(`Sorry, we only deliver within 18km from the restaurant. Your distance is ${Math.round(distance/1000)}km.`);
            setDeliveryType('Takeaway');
          } else {
            setDeliveryType('Delivery');
            if (distance <= 2000) {
              setDeliveryFee(0);
            } else {
              const extraKms = (distance - 2000) / 1000;
              const calcFee = 15 + (extraKms * 5); // 15 base + 5 per extra km
              setDeliveryFee(Math.min(Math.max(Math.round(calcFee), 15), 30));
            }
          }
        }
      },
      (err) => {
        setLocationChecking(false);
        if (type === 'DineIn') {
          if (err.code === err.PERMISSION_DENIED) {
            setLocationError('Location access denied. Please allow location permission to place a Dine-In order.');
          } else {
            setLocationError('Unable to verify your location. Please try again or choose Delivery / Pickup.');
          }
        } else if (type === 'Delivery') {
          setDeliveryType('Delivery');
          setDeliveryFee(30); // fallback if location denied
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };
  
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsFetchingAddress(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setTempLat(latitude);
        setTempLng(longitude);
        setShowMapPicker(true);
        setIsFetchingAddress(false);
      },
      (err) => {
        setIsFetchingAddress(false);
        alert("Failed to get location. Please check permissions.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleConfirmLocation = async () => {
    if (!tempLat || !tempLng) return;
    setIsFetchingAddress(true);
    
    const distance = haversineDistance(tempLat, tempLng, RESTAURANT_LAT, RESTAURANT_LNG);
    
    if (distance > 18000) {
      alert(`Sorry, we only deliver within 18km of the restaurant. Your selected pin is ${Math.round(distance/1000)}km away.`);
      setIsFetchingAddress(false);
      return;
    }

    setCustomerLat(tempLat);
    setCustomerLng(tempLng);
    
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${tempLat}&lon=${tempLng}&format=json`);
      const data = await res.json();
      if (data && data.display_name) {
        const addressString = data.display_name.toLowerCase();
        // if (!addressString.includes("hyderabad") && !addressString.includes("secunderabad") && !addressString.includes("ranga reddy")) {
        //    alert("Sorry, we only deliver within Hyderabad.");
        //    setIsFetchingAddress(false);
        //    return;
        // }
        setCustomerAddress(data.display_name);
        setShowMapPicker(false);
      } else {
        alert("Could not fetch address for this pin. Please enter manually.");
      }
    } catch (err) {
      console.error(err);
      alert("Error fetching address. Please enter manually.");
    } finally {
      setIsFetchingAddress(false);
    }
  };
  
  // Checkout & Submission States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState<any | null>(null);
  const [showPhonePeModal, setShowPhonePeModal] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [utrInput, setUtrInput] = useState('');
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

  // OTP Timer countdown
  React.useEffect(() => {
    if (otpTimer > 0) {
      const interval = setInterval(() => setOtpTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [otpTimer]);

  const handleSendOtp = async () => {
    if (!customerEmail || !customerPhone) {
      setOtpError('Email and Phone Number are required to send OTP.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      setOtpError('Please enter a valid email address.');
      return;
    }
    
    setOtpError('');
    setIsSendingOtp(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/customer/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: customerEmail, phone: customerPhone })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOtpSent(true);
        setOtpTimer(60);
      } else {
        setOtpError(data.message || 'Failed to send OTP.');
      }
    } catch (err) {
      setOtpError('Network error while sending OTP.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpInput || otpInput.length !== 6) {
      setOtpError('Please enter the 6-digit OTP.');
      return;
    }
    
    setOtpError('');
    setIsVerifyingOtp(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/customer/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: customerEmail, otp: otpInput })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEmailVerified(true);
        setOtpError('');
      } else {
        setOtpError(data.message || 'Invalid OTP.');
      }
    } catch (err) {
      setOtpError('Network error while verifying OTP.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(false);
    const success = applyCoupon(couponInput);
    if (!success) {
      setCouponError(true);
      setTimeout(() => setCouponError(false), 2000);
    } else {
      setCouponInput('');
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!customerName || !customerPhone) {
      alert('Please enter your name and phone number.');
      return;
    }
    if (deliveryType === 'Delivery' && !customerAddress) {
      alert('Please enter your delivery address.');
      return;
    }
    if (deliveryType === 'DineIn' && !tableNo) {
      alert('Please specify your table number.');
      return;
    }

    // Check Restaurant Timings (11:00 AM to 11:00 PM)
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours + minutes / 60;
    
    // 11:00 AM is 11.0, 11:00 PM is 23.0
    if (currentTime < 11.0 || currentTime >= 23.0) {
      alert('Restaurant is currently closed. We are open from 11:00 AM to 11:00 PM daily.');
      return;
    }

    // Check Location for Delivery one last time
    if (deliveryType === 'Delivery') {
      if (!customerLat || !customerLng) {
        alert('Please select a precise location for delivery.');
        return;
      }
      const distance = haversineDistance(customerLat, customerLng, RESTAURANT_LAT, RESTAURANT_LNG);
      if (distance > 18000) {
        alert(`Sorry, your location is ${Math.round(distance/1000)}km away. We only deliver within 18km.`);
        return;
      }
    }

    if (paymentMethod === 'UPI') {
      setShowPhonePeModal(true);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);

    const orderPayload = {
      customer_name: customerName,
      phone: customerPhone,
      email: customerEmail,
      address: deliveryType === 'Delivery' ? customerAddress : '',
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        spice_level: item.spiceLevel,
        notes: item.itemNotes,
        portion: item.portion
      })),
      subtotal: subtotal,
      packaging: packagingFee,
      delivery_fee: deliveryFee,
      discount: discount,
      grand_total: grandTotal,
      order_type: deliveryType,
      notes: specialInstructions,
      table_no: deliveryType === 'DineIn' ? tableNo : '',
      latitude: deliveryType === 'Delivery' ? customerLat : null,
      longitude: deliveryType === 'Delivery' ? customerLng : null,
      payment_method: paymentMethod,
      idempotency_key: idempotencyKey
    };

    try {
      const response = await fetch(`${API_URL}/api/v1/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });

      const data = await response.json();
      if (response.ok) {
        setOrderConfirmed(data.data);
        clearCart();
        // Clear customer inputs
        setCustomerName('');
        setCustomerPhone('');
        setCustomerAddress('');
        setIdempotencyKey(crypto.randomUUID());
      } else {
        alert(data.message || 'Failed to place order.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert(
        'Could not connect to the server. Please check your internet connection and try again.\n\nIf the problem persists, call us directly to place your order.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleVerifyPayment = async () => {
    if (utrInput.length < 6) {
      setPaymentError('Please enter a valid UPI Ref No (UTR) to confirm payment.');
      return;
    }

    setIsVerifyingPayment(true);
    setPaymentError('');

    const orderPayload = {
      customer_name: customerName,
      phone: customerPhone,
      address: deliveryType === 'Delivery' ? customerAddress : '',
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        spice_level: item.spiceLevel,
        notes: item.itemNotes,
        portion: item.portion
      })),
      subtotal: subtotal,
      packaging: packagingFee,
      delivery_fee: deliveryFee,
      discount: discount,
      grand_total: grandTotal,
      order_type: deliveryType,
      notes: specialInstructions,
      table_no: deliveryType === 'DineIn' ? tableNo : '',
      latitude: deliveryType === 'Delivery' ? customerLat : null,
      longitude: deliveryType === 'Delivery' ? customerLng : null,
      payment_method: 'UPI',
      transaction_id: utrInput,
      idempotency_key: idempotencyKey
    };

    try {
      const response = await fetch(`${API_URL}/api/v1/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });

      const data = await response.json();
      if (response.ok) {
        setOrderConfirmed(data.data);
        setShowPhonePeModal(false);
        setUtrInput('');
        clearCart();
        // Clear customer inputs
        setCustomerName('');
        setCustomerPhone('');
        setCustomerAddress('');
        setIdempotencyKey(crypto.randomUUID());
      } else {
        setPaymentError(data.message || 'Failed to place order.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setPaymentError(
        'Could not connect to the server. Please check your connection and try again. Your cart has been preserved.'
      );
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Slider Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-[#2E1A1C] border-l border-brand-gold/20 flex flex-col shadow-2xl overflow-hidden font-sans text-white"
          >
            {/* Header */}
            <div className="p-6 border-b border-brand-gold/15 flex justify-between items-center bg-black/25">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} className="text-brand-gold" />
                <h2 className="text-lg font-bold font-serif uppercase tracking-widest text-brand-gold">
                  Your Vantillu Cart
                </h2>
              </div>
              <button
                onClick={() => {
                  setOrderConfirmed(null);
                  onClose();
                }}
                className="p-2 text-white/60 hover:text-brand-gold cursor-pointer transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {orderConfirmed ? (
                /* Order Receipt Mode */
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-8 space-y-6"
                >
                  <div className="flex justify-center">
                    <CheckCircle size={64} className="text-green-500 animate-bounce" />
                  </div>

                  <div>
                    <h3 className="text-2xl font-serif text-brand-gold font-bold">Happiness Ordered!</h3>
                    <p className="text-white/60 text-xs mt-1 uppercase tracking-wider">
                      Order ID: #VT-{orderConfirmed.id}
                    </p>
                  </div>

                  <div className="bg-black/30 border border-brand-gold/20 rounded-2xl p-4 text-left space-y-3">
                    <div className="flex justify-between text-xs border-b border-white/5 pb-2 text-white/50">
                      <span>Customer</span>
                      <span className="font-semibold text-white">{orderConfirmed.customer_name}</span>
                    </div>
                    <div className="flex justify-between text-xs border-b border-white/5 pb-2 text-white/50">
                      <span>Type</span>
                      <span className="font-semibold text-brand-gold">{orderConfirmed.order_type}</span>
                    </div>
                    <div className="flex justify-between text-xs border-b border-white/5 pb-2 text-white/50">
                      <span>Total Amount</span>
                      <span className="font-semibold text-brand-gold font-serif">₹{orderConfirmed.grand_total}</span>
                    </div>
                    <div className="flex justify-between text-xs text-white/50">
                      <span>Status</span>
                      <span className="font-bold text-green-400 animate-pulse">{orderConfirmed.status}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-white/40 leading-relaxed max-w-[280px] mx-auto">
                    {orderConfirmed.payment_method === 'UPI' ? (
                      <>
                        <p className="text-amber-400/80 bg-amber-400/10 border border-amber-400/20 rounded-xl px-3 py-2 text-[10px]">
                          ⏳ Payment pending verification. Our team will confirm your UPI payment and begin preparation shortly.
                        </p>
                        <p>📞 For any queries, contact us at +91 9440828238.</p>
                      </>
                    ) : (
                      <>
                        <p>✨ Our kitchen has started preparing your hot homemade feast with grandmother's love.</p>
                        <p>📞 For any queries, contact us at +91 9440828238.</p>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setOrderConfirmed(null);
                      onClose();
                    }}
                    className="w-full bg-brand-gold hover:bg-brand-gold/90 text-brand-brown font-semibold py-3 px-6 rounded-xl cursor-pointer transition-all duration-300"
                  >
                    Done
                  </button>
                </motion.div>
              ) : cart.length === 0 ? (
                /* Empty Cart Mode */
                <div className="h-full flex flex-col items-center justify-center text-center py-20 space-y-4 opacity-50">
                  <ShoppingBag size={48} className="text-white/30" />
                  <p className="text-sm font-serif italic text-white/60">Your cart is empty. Seed some delicacies!</p>
                </div>
              ) : (
                /* Cart Items & Form Mode */
                <>
                  {/* Cart Items List */}
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div
                        key={item.cartId}
                        className="flex gap-4 bg-black/20 p-3 rounded-2xl border border-white/5 items-center justify-between"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-contain bg-black/10 rounded-lg p-1"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold truncate">{item.name}</h4>
                          <div className="flex flex-wrap items-center gap-2 mt-0.5">
                            <span className="text-brand-orange text-[10px] uppercase font-bold">{item.spiceLevel}</span>
                            {item.portion !== 'Standard' && (
                              <span className="bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">{item.portion}</span>
                            )}
                            {item.itemNotes && (
                              <span className="text-white/40 text-[9px] truncate">({item.itemNotes})</span>
                            )}
                          </div>
                          <span className="text-brand-gold font-serif text-xs font-semibold">
                            ₹{item.price}
                          </span>
                        </div>

                        {/* Quantity adjusts */}
                        <div className="flex items-center bg-black/30 border border-white/10 rounded-lg overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                            className="p-1.5 text-brand-gold hover:bg-white/5 cursor-pointer"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold px-2">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                            className="p-1.5 text-brand-gold hover:bg-white/5 cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeFromCart(item.cartId)}
                          className="text-white/40 hover:text-red-500 p-1.5 cursor-pointer transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Delivery / Pickup / Dine-In Selector */}
                  <div className="space-y-2">
                    <label className="text-xs text-brand-gold uppercase tracking-wider font-semibold">
                      Service Mode
                    </label>
                    <div className="grid grid-cols-3 bg-black/40 border border-white/10 p-1 rounded-xl">
                      {[{ key: 'Delivery', label: 'Delivery' }, { key: 'Takeaway', label: 'Pickup' }, { key: 'DineIn', label: 'Dine-In' }].map(({ key, label }) => (
                        <button
                          key={key}
                          type="button"
                          disabled={locationChecking && key === 'DineIn'}
                          onClick={() => handleServiceModeChange(key)}
                          className={`
                            py-2 text-[10px] uppercase font-bold tracking-widest rounded-lg cursor-pointer transition-all duration-300
                            ${deliveryType === key ? 'bg-brand-gold text-brand-brown' : 'text-white/60 hover:text-white'}
                            ${locationChecking && key === 'DineIn' ? 'opacity-60 cursor-wait' : ''}
                          `}
                        >
                          {locationChecking && key === 'DineIn' ? (
                            <span className="flex items-center justify-center gap-1">
                              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              Verifying
                            </span>
                          ) : label}
                        </button>
                      ))}
                    </div>
                    {/* Dine-In location error */}
                    {locationError && (
                      <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2.5 mt-1">
                        <span className="text-red-400 text-sm leading-none mt-0.5">📍</span>
                        <p className="text-[10px] text-red-400 leading-relaxed font-semibold">{locationError}</p>
                      </div>
                    )}
                  </div>

                  {/* Pricing breakdown */}
                  <div className="bg-black/30 border border-white/5 rounded-2xl p-4 space-y-2.5 text-xs text-white/70">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-serif">₹{subtotal}</span>
                    </div>
                    {deliveryFee > 0 && (
                      <div className="flex justify-between">
                        <span>Delivery Fee</span>
                        <span className="font-serif">₹{deliveryFee}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-brand-gold font-bold text-sm border-t border-white/5 pt-2.5">
                      <span>Grand Total</span>
                      <span className="font-serif">₹{grandTotal}</span>
                    </div>
                  </div>

                  {/* Checkout details Form */}
                  <form onSubmit={handleCheckout} className="space-y-4 border-t border-white/5 pt-4">
                    <h3 className="text-xs text-brand-gold uppercase tracking-widest font-semibold">
                      Checkout Information
                    </h3>

                    {/* Customer Name */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-white/50 uppercase">Name</label>
                      <div className="relative">
                        <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="your full name"
                          className="w-full bg-black/30 border border-white/10 focus:border-brand-gold text-xs pl-9 pr-3 py-2.5 rounded-xl outline-none"
                        />
                      </div>
                    </div>

                    {/* Customer Email */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-white/50 uppercase flex justify-between">
                        <span>Email *</span>
                        {emailVerified && <span className="text-green-400 font-bold tracking-wider">✓ Verified</span>}
                      </label>
                      <div className="relative flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="email"
                            required
                            disabled={isSubmitting || emailVerified}
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            placeholder="your email address"
                            className="w-full bg-black/30 border border-white/10 focus:border-brand-gold text-xs px-3 py-2.5 rounded-xl outline-none disabled:opacity-60"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Customer Phone */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-white/50 uppercase">Phone Number *</label>
                      <div className="relative">
                        <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                        <input
                          type="tel"
                          required
                          disabled={isSubmitting || emailVerified}
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="10-digit mobile number"
                          className="w-full bg-black/30 border border-white/10 focus:border-brand-gold text-xs pl-9 pr-3 py-2.5 rounded-xl outline-none disabled:opacity-60"
                        />
                      </div>
                    </div>
                    
                    {/* OTP Verification Section */}
                    {!emailVerified && (
                      <div className="bg-black/20 p-3 rounded-xl border border-white/5 space-y-3">
                        {otpError && (
                          <div className="text-[10px] text-red-400 font-semibold bg-red-500/10 p-2 rounded border border-red-500/20">
                            {otpError}
                          </div>
                        )}
                        
                        {!otpSent ? (
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={isSendingOtp || !customerEmail || !customerPhone}
                            className="w-full bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold border border-brand-gold/30 font-semibold py-2 rounded-xl text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                          >
                            {isSendingOtp ? 'Sending OTP...' : 'Send OTP via Email'}
                          </button>
                        ) : (
                          <div className="space-y-2">
                            <input
                              type="text"
                              maxLength={6}
                              placeholder="Enter 6-digit OTP"
                              value={otpInput}
                              onChange={(e) => setOtpInput(e.target.value)}
                              className="w-full bg-black/40 border border-brand-gold/50 focus:border-brand-gold text-center text-sm tracking-widest px-3 py-2 rounded-xl outline-none text-white"
                            />
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={handleVerifyOtp}
                                disabled={isVerifyingOtp || otpInput.length !== 6}
                                className="flex-1 bg-brand-gold hover:bg-brand-gold/90 text-brand-brown font-bold py-2 rounded-xl text-xs uppercase transition-colors disabled:opacity-50"
                              >
                                {isVerifyingOtp ? 'Verifying...' : 'Verify OTP'}
                              </button>
                              <button
                                type="button"
                                onClick={handleSendOtp}
                                disabled={isSendingOtp || otpTimer > 0}
                                className="flex-1 bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 font-semibold py-2 rounded-xl text-xs transition-colors disabled:opacity-50"
                              >
                                {otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Resend'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Delivery Address OR Table No based on service mode */}
                    {deliveryType === 'Delivery' ? (
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] text-white/50 uppercase">Delivery Address *</label>
                          <button 
                            type="button" 
                            onClick={handleUseCurrentLocation}
                            disabled={isFetchingAddress}
                            className="text-[9px] text-brand-gold uppercase tracking-wider font-bold hover:underline disabled:opacity-50 cursor-pointer flex items-center gap-1"
                          >
                            <MapPin size={10} />
                            {isFetchingAddress ? 'Locating...' : 'Pick on Map'}
                          </button>
                        </div>
                        {showMapPicker && tempLat && tempLng ? (
                          <div className="bg-black/20 p-2 rounded-xl border border-white/5 mb-3 pointer-events-auto">
                            <p className="text-[10px] text-brand-gold font-bold uppercase tracking-wider mb-2">Adjust your precise location:</p>
                            <LocationPickerMap 
                              initialLat={tempLat} 
                              initialLng={tempLng} 
                              onLocationChange={(lat, lng) => {
                                setTempLat(lat);
                                setTempLng(lng);
                              }} 
                            />
                            <div className="flex gap-2 mt-3">
                              <button 
                                type="button" 
                                onClick={handleConfirmLocation} 
                                disabled={isFetchingAddress}
                                className="flex-1 bg-brand-gold hover:bg-brand-gold/90 text-brand-brown font-bold py-2 rounded-lg text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                              >
                                {isFetchingAddress ? 'Loading...' : 'Confirm Pin'}
                              </button>
                              <button 
                                type="button" 
                                onClick={() => setShowMapPicker(false)} 
                                className="px-4 bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 font-bold py-2 rounded-lg text-xs uppercase tracking-wider cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : null}
                        <div className="relative">
                          <MapPin size={13} className="absolute left-3 top-3 text-white/40" />
                          <textarea
                            required
                            value={customerAddress}
                            onChange={(e) => setCustomerAddress(e.target.value)}
                            placeholder="full street address, house no, landmark"
                            rows={3}
                            className="w-full bg-black/30 border border-white/10 focus:border-brand-gold text-xs pl-9 pr-3 py-2.5 rounded-xl outline-none resize-none"
                          />
                        </div>
                      </div>
                    ) : deliveryType === 'DineIn' ? (
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-white/50 uppercase">Table Number</label>
                        <input
                          type="text"
                          required
                          value={tableNo}
                          onChange={(e) => setTableNo(e.target.value)}
                          placeholder="e.g. Table 5, Lounge A"
                          className="w-full bg-black/30 border border-white/10 focus:border-brand-gold text-xs px-3 py-2.5 rounded-xl outline-none"
                        />
                      </div>
                    ) : null}

                    {/* General notes */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-white/50 uppercase">Order Note (Optional)</label>
                      <input
                        type="text"
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                        placeholder="any special instructions for delivery/chef"
                        className="w-full bg-black/30 border border-white/10 focus:border-brand-gold text-xs px-3 py-2.5 rounded-xl outline-none"
                      />
                    </div>

                    {/* Payment Method Selector */}
                    <div className="space-y-2">
                      <label className="text-xs text-brand-gold uppercase tracking-wider font-semibold">
                        Payment Method
                      </label>
                      <div className="grid grid-cols-2 bg-black/40 border border-white/10 p-1 rounded-xl">
                        {[
                          { id: 'COD', label: '💵 Cash on Delivery' },
                          { id: 'UPI', label: '📲 Scan & Pay (UPI)' }
                        ].map((method) => (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => setPaymentMethod(method.id as any)}
                            className={`
                              py-2.5 text-[9px] uppercase font-bold tracking-wider rounded-lg cursor-pointer transition-all duration-300
                              ${paymentMethod === method.id ? 'bg-brand-gold text-brand-brown' : 'text-white/60 hover:text-white'}
                            `}
                          >
                            {method.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Checkout Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting || !emailVerified || !customerPhone || customerPhone.length < 10 || !customerName}
                      className="w-full bg-brand-gold hover:bg-brand-gold/90 disabled:opacity-50 disabled:cursor-not-allowed text-brand-brown font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 active:scale-95 shadow-[0_4px_12px_rgba(212,175,55,0.2)] mt-6 text-sm"
                    >
                      {!emailVerified ? (
                        'Verify Email First'
                      ) : isSubmitting ? (
                        'Processing order...'
                      ) : (
                        <>
                          Proceed Checkout
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
              {showPhonePeModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 bg-[#251315] flex flex-col p-6 overflow-y-auto text-white border-l border-brand-gold/20"
                >
                  {/* Header */}
                  <div className="flex justify-between items-center border-b border-brand-gold/15 pb-4 mb-6">
                    <h3 className="font-serif text-brand-gold text-sm font-bold tracking-wider uppercase">
                       Scan QR &amp; Pay (UPI)
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPhonePeModal(false);
                        setUtrInput('');
                        setPaymentError('');
                      }}
                      className="text-white/60 hover:text-brand-gold text-xs cursor-pointer transition-colors"
                    >
                      Cancel Payment
                    </button>
                  </div>

                  {/* Amount Info */}
                  <div className="bg-black/35 border border-brand-gold/15 rounded-2xl p-4 text-center space-y-1 mb-6">
                    <p className="text-[10px] text-white/50 uppercase tracking-widest">Amount to Pay</p>
                    <p className="text-3xl font-serif text-brand-gold font-bold">₹{grandTotal}</p>
                    <p className="text-[9px] text-brand-orange uppercase font-bold tracking-wider">
                      Payee: Bharadwaj Rampa
                    </p>
                  </div>

                  {/* App Selection Tabs */}
                  <div className="flex gap-2 justify-center mb-6">
                    <button
                      onClick={() => setSelectedUpiApp('PHONEPE')}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider transition-colors ${selectedUpiApp === 'PHONEPE' ? 'bg-[#5f259f] text-white' : 'bg-white/10 text-white/50'}`}
                    >
                      PhonePe
                    </button>
                    <button
                      onClick={() => setSelectedUpiApp('GPAY')}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider transition-colors ${selectedUpiApp === 'GPAY' ? 'bg-[#1a73e8] text-white' : 'bg-white/10 text-white/50'}`}
                    >
                      GPay
                    </button>
                    <button
                      onClick={() => setSelectedUpiApp('PAYTM')}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider transition-colors ${selectedUpiApp === 'PAYTM' ? 'bg-[#002970] text-white' : 'bg-white/10 text-white/50'}`}
                    >
                      Paytm
                    </button>
                  </div>

                  {/* QR Code Segment */}
                  <div className="flex flex-col items-center justify-center space-y-4 mb-6">
                    <p className="text-[11px] text-white/70 text-center max-w-[280px] leading-relaxed">
                      Scan with <strong>{selectedUpiApp === 'PHONEPE' ? 'PhonePe' : selectedUpiApp === 'GPAY' ? 'Google Pay' : 'Paytm'}</strong>. Amount of <strong>₹{grandTotal}</strong> is pre-filled — do not change it.
                    </p>

                    <div className="bg-white p-3 rounded-2xl shadow-lg border-2 border-brand-gold/50">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=${
                          selectedUpiApp === 'PHONEPE' ? '5f259f' : selectedUpiApp === 'GPAY' ? '1a73e8' : '002970'
                        }&data=${encodeURIComponent(
                          selectedUpiApp === 'PHONEPE'
                            ? `upi://pay?pa=9440828238@ybl&pn=Bharadwaj%20Rampa&am=${grandTotal}&cu=INR&tn=Vantillu%20Order`
                            : selectedUpiApp === 'GPAY'
                            ? `upi://pay?pa=bharadwaj804@okhdfcbank&pn=Bharadwaj%20Rampa&am=${grandTotal}&cu=INR&tn=Vantillu%20Order`
                            : `upi://pay?pa=paytmqr6xneqx@ptys&pn=Bharadwaj%20Rampa&am=${grandTotal}&cu=INR&tn=Vantillu%20Order`
                        )}`}
                        alt={`${selectedUpiApp} QR Code`}
                        className="w-40 h-40 object-contain"
                      />
                    </div>

                    <p className="text-[9px] text-white/40 tracking-wider">
                      UPI ID: {selectedUpiApp === 'PHONEPE' ? '9440828238@ybl' : selectedUpiApp === 'GPAY' ? 'bharadwaj804@okhdfcbank' : 'paytmqr6xneqx@ptys'}
                    </p>
                  </div>

                  {/* UTR Reference Input */}
                  <div className="space-y-2 mb-6">
                    <label className="text-[10px] text-brand-gold uppercase tracking-wider font-semibold block text-center">
                      Enter UPI Ref No (UTR) After Paying
                    </label>
                    <input
                      type="text"
                      maxLength={20}
                      placeholder="e.g. 629472049102"
                      value={utrInput}
                      onChange={(e) => {
                        setPaymentError('');
                        // Only allow digits
                        const val = e.target.value.replace(/\D/g, '');
                        setUtrInput(val);
                      }}
                      className="w-full bg-black/45 border border-white/10 focus:border-brand-gold text-xs px-3 py-2.5 rounded-xl outline-none text-white font-mono text-center tracking-widest"
                    />
                    <p className="text-[9px] text-white/30 text-center">Find this in your UPI app under payment history</p>
                    {paymentError && (
                      <p className="text-[10px] text-red-400 font-semibold text-center mt-1">
                        {paymentError}
                      </p>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="space-y-3 mt-auto">
                    {/* Intent Button for mobile */}
                    <a
                      href={
                        selectedUpiApp === 'PHONEPE'
                          ? `upi://pay?pa=9440828238@ybl&pn=Bharadwaj%20Rampa&am=${grandTotal}&cu=INR&tn=Vantillu%20Order`
                          : selectedUpiApp === 'GPAY'
                          ? `upi://pay?pa=bharadwaj804@okhdfcbank&pn=Bharadwaj%20Rampa&am=${grandTotal}&cu=INR&tn=Vantillu%20Order`
                          : `upi://pay?pa=paytmqr6xneqx@ptys&pn=Bharadwaj%20Rampa&am=${grandTotal}&cu=INR&tn=Vantillu%20Order`
                      }
                      className={`w-full text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 active:scale-95 text-center text-xs uppercase tracking-wider ${
                        selectedUpiApp === 'PHONEPE' ? 'bg-[#5f259f] hover:bg-[#4c1e80]' : selectedUpiApp === 'GPAY' ? 'bg-[#1a73e8] hover:bg-[#1557af]' : 'bg-[#002970] hover:bg-[#001e52]'
                      }`}
                    >
                      📲 Open {selectedUpiApp === 'PHONEPE' ? 'PhonePe' : selectedUpiApp === 'GPAY' ? 'GPay' : 'Paytm'}
                    </a>

                    {/* Confirm Button */}
                    <button
                      type="button"
                      disabled={isVerifyingPayment}
                      onClick={handleVerifyPayment}
                      className="w-full bg-brand-gold hover:bg-brand-gold/90 text-brand-brown font-bold py-3 px-4 rounded-xl cursor-pointer transition-all duration-300 active:scale-95 text-xs uppercase tracking-wider shadow-[0_4px_12px_rgba(212,175,55,0.2)] disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isVerifyingPayment ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-brand-brown" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Placing Order...
                        </>
                      ) : (
                        'Confirm Order (Paid via UPI)'
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
