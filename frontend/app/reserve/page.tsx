'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, Phone, User, Mail, FileText, CheckCircle, Sparkles } from 'lucide-react';

export default function ReservePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState('2');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !date || !time || !guests) {
      alert('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name,
      email,
      phone,
      date,
      time,
      guests: parseInt(guests),
      special_requests: specialRequests
    };

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setConfirmed(true);
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to book table.');
      }
    } catch (err) {
      console.error('Reservation error:', err);
      alert(
        'Could not connect to the server. Please check your internet connection and try again.\n\nIf the problem persists, call us directly to reserve your table.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setPhone('');
    setDate('');
    setTime('');
    setGuests('2');
    setSpecialRequests('');
    setConfirmed(false);
  };

  return (
    <div className="min-h-screen bg-[#0c0607] pb-24 text-white relative flex flex-col items-center">
      {/* Background Lighting */}
      <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-[#153B72]/10 to-transparent blur-[100px] pointer-events-none" />

      {/* Header Banner */}
      <div className="pt-28 pb-6 px-6 text-center space-y-4">
        <span className="text-brand-gold text-xs uppercase tracking-[0.3em] font-semibold flex items-center justify-center gap-1.5">
          <Sparkles size={12} className="fill-brand-gold" />
          Telugu Village Hospitality
        </span>
        <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-wide">
          Reserve a Royal Table
        </h1>
        <div className="w-16 h-[2px] bg-brand-gold mx-auto mt-2" />
        <p className="text-white/60 text-xs md:text-sm max-w-md mx-auto leading-relaxed">
          Book your dining space to enjoy traditional homemade dishes cooked with warmth and love.
        </p>
      </div>

      {/* Form Container */}
      <div className="w-full max-w-lg px-6 z-10">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative bg-[#2E1A1C]/70 border border-brand-gold/30 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden backdrop-blur-md"
        >
          {/* Corner decoration */}
          <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-brand-gold/20 rounded-tl" />
          <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-brand-gold/20 rounded-tr" />
          <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-brand-gold/20 rounded-bl" />
          <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-brand-gold/20 rounded-br" />

          {confirmed ? (
            /* Success Receipt */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6 space-y-5"
            >
              <div className="flex justify-center">
                <CheckCircle size={64} className="text-green-500 animate-bounce" />
              </div>
              <div>
                <h3 className="text-2xl font-serif text-brand-gold font-bold">Reservation Confirmed!</h3>
                <p className="text-white/60 text-xs mt-1 uppercase tracking-widest">
                  We're looking forward to hosting you
                </p>
              </div>

              <div className="bg-black/30 border border-brand-gold/25 rounded-2xl p-4 text-left text-xs space-y-2.5 max-w-sm mx-auto">
                <div className="flex justify-between border-b border-white/5 pb-1.5 text-white/50">
                  <span>Date & Time</span>
                  <span className="font-semibold text-white">{date} at {time}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1.5 text-white/50">
                  <span>Guests</span>
                  <span className="font-semibold text-white">{guests} Persons</span>
                </div>
                <div className="flex justify-between text-white/50">
                  <span>Contact Name</span>
                  <span className="font-semibold text-brand-gold">{name}</span>
                </div>
              </div>

              <p className="text-xs text-white/40 max-w-[280px] mx-auto leading-relaxed">
                ✨ An email confirmation has been sent to {email}. We will hold your table up to 15 mins past your booking time.
              </p>

              <button
                onClick={handleReset}
                className="w-full max-w-xs mx-auto bg-brand-gold hover:bg-brand-gold/90 text-brand-brown font-semibold py-3 px-6 rounded-xl cursor-pointer transition-all duration-300"
              >
                Make Another Booking
              </button>
            </motion.div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Your Name</label>
                  <div className="relative">
                    <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rama Rao"
                      className="w-full bg-black/40 border border-white/10 focus:border-brand-gold text-xs pl-9 pr-3 py-2.5 rounded-xl outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Email Address</label>
                    <div className="relative">
                      <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full bg-black/40 border border-white/10 focus:border-brand-gold text-xs pl-9 pr-3 py-2.5 rounded-xl outline-none"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Phone Number</label>
                    <div className="relative">
                      <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="10-digit number"
                        className="w-full bg-black/40 border border-white/10 focus:border-brand-gold text-xs pl-9 pr-3 py-2.5 rounded-xl outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Date */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Date</label>
                    <div className="relative">
                      <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="date"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 focus:border-brand-gold text-xs pl-9 pr-3 py-2.5 rounded-xl outline-none text-white fill-white cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Time */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Time</label>
                    <div className="relative">
                      <Clock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="time"
                        required
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 focus:border-brand-gold text-xs pl-9 pr-3 py-2.5 rounded-xl outline-none cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Guests */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Guests Count</label>
                    <div className="relative">
                      <Users size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                      <select
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 focus:border-brand-gold text-xs pl-9 pr-3 py-2.5 rounded-xl outline-none cursor-pointer text-white appearance-none"
                      >
                        <option value="1" className="bg-[#2E1A1C]">1 Person</option>
                        <option value="2" className="bg-[#2E1A1C]">2 Persons</option>
                        <option value="3" className="bg-[#2E1A1C]">3 Persons</option>
                        <option value="4" className="bg-[#2E1A1C]">4 Persons</option>
                        <option value="5" className="bg-[#2E1A1C]">5 Persons</option>
                        <option value="6" className="bg-[#2E1A1C]">6+ Persons</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Special requests */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Special Requests</label>
                  <div className="relative">
                    <FileText size={13} className="absolute left-3 top-3 text-white/40" />
                    <textarea
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="e.g. high chair for children, window seat, table decorations..."
                      rows={3}
                      className="w-full bg-black/40 border border-white/10 focus:border-brand-gold text-xs pl-9 pr-3 py-2.5 rounded-xl outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-gold hover:bg-brand-gold/90 disabled:opacity-50 text-brand-brown font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 active:scale-95 shadow-[0_4px_12px_rgba(212,175,55,0.2)] text-xs uppercase tracking-wider"
              >
                {isSubmitting ? 'Confirming booking...' : 'Confirm Table Booking'}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
