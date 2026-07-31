'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, Flame, ShoppingBag, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface FoodCardProps {
  id: number;
  name: string;
  description: string;
  image: string;
  isVeg: boolean;
  spiceLevel: 'Mild' | 'Medium' | 'Spicy' | 'Extra Spicy';
  rating: number;
  prepTime: string;
  portionType: 'four-sizes' | 'half-full' | 'single-full' | 'standard';
  price?: number;
  halfPrice?: number;
  fullPrice?: number;
  singlePrice?: number;
  familyPrice?: number;
  jumboPrice?: number;
  isBestSeller?: boolean;
  isChefSpecial?: boolean;
}

export const FoodCard: React.FC<FoodCardProps> = ({
  id,
  name,
  description,
  image,
  isVeg,
  spiceLevel,
  rating,
  prepTime,
  portionType,
  price,
  halfPrice,
  fullPrice,
  singlePrice,
  familyPrice,
  jumboPrice,
  isBestSeller,
  isChefSpecial,
}) => {
  const { cart, addToCart, updateQuantity } = useCart();
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedSpice, setSelectedSpice] = useState(spiceLevel);

  useEffect(() => {
    const isIframe = window.self !== window.top;
    const token = localStorage.getItem('vantillu_admin_token');
    if (isIframe && token) {
      setIsAdmin(true);
    }
  }, []);
  const [itemNotes, setItemNotes] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [showNotesField, setShowNotesField] = useState(false);

  // Portion State selection
  const [portion, setPortion] = useState<'Half' | 'Full' | 'Single' | 'Standard' | 'Family' | 'Jumbo'>(() => {
    if (portionType === 'four-sizes') return 'Single';
    if (portionType === 'half-full') return 'Half';
    if (portionType === 'single-full') return 'Single';
    return 'Standard';
  });

  // Dynamic price calculation
  const getActivePrice = () => {
    if (portion === 'Half') return halfPrice || 0;
    if (portion === 'Full') return fullPrice || 0;
    if (portion === 'Single') return singlePrice || 0;
    if (portion === 'Family') return familyPrice || 0;
    if (portion === 'Jumbo') return jumboPrice || 0;
    return price || 0;
  };

  const activePrice = getActivePrice();

  // Find if this specific item-portion combo is in the cart
  const cartItem = cart.find(
    (item) => item.id === id && item.portion === portion
  );
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = () => {
    // Add to cart with quantity 1
    const itemPayload = { id, name, price, halfPrice, fullPrice, singlePrice, familyPrice, jumboPrice, image, isVeg };
    addToCart(itemPayload, 1, selectedSpice, itemNotes, portion);
    
    // Reset notes
    setItemNotes('');
    setShowNotesField(false);
  };

  const handleIncrement = () => {
    if (cartItem) {
      updateQuantity(cartItem.cartId, cartItem.quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (cartItem) {
      updateQuantity(cartItem.cartId, cartItem.quantity - 1);
    }
  };

  const getSpiceFlames = (level: string) => {
    switch (level) {
      case 'Mild': return 1;
      case 'Medium': return 2;
      case 'Spicy': return 3;
      case 'Extra Spicy': return 4;
      default: return 2;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative bg-[#2E1A1C]/70 border border-brand-gold/20 hover:border-brand-gold/60 rounded-3xl p-5 flex flex-col justify-between shadow-xl transition-all duration-500 hover:shadow-[0_10px_30px_rgba(212,175,55,0.15)] group backdrop-blur-md"
    >
      {/* Decorative corners */}
      <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-brand-gold/30 rounded-tl group-hover:border-brand-gold/80 transition-colors duration-300" />
      <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-brand-gold/30 rounded-tr group-hover:border-brand-gold/80 transition-colors duration-300" />
      <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-brand-gold/30 rounded-bl group-hover:border-brand-gold/80 transition-colors duration-300" />
      <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-brand-gold/30 rounded-br group-hover:border-brand-gold/80 transition-colors duration-300" />

      {/* Badges */}
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-1.5 pointer-events-none">
        {isBestSeller && (
          <span className="bg-brand-gold text-brand-brown text-[9px] font-bold uppercase tracking-wider py-1 px-3 rounded-full shadow-md">
            Best Seller
          </span>
        )}
        {isChefSpecial && (
          <span className="bg-brand-orange text-white text-[9px] font-bold uppercase tracking-wider py-1 px-3 rounded-full shadow-md">
            Chef Special
          </span>
        )}
      </div>

      {/* Veg/Non-Veg & Rating Header */}
      <div className="flex justify-between items-center mb-4">
        <div className={`flex items-center gap-1.5 py-1 px-2.5 rounded-full border text-[10px] uppercase font-bold tracking-wider ${
          isVeg 
            ? 'border-green-500/30 bg-green-500/10 text-green-400' 
            : 'border-red-500/30 bg-red-500/10 text-red-400'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isVeg ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          {isVeg ? 'Veg' : 'Non-Veg'}
        </div>

        {/* Rating removed */}
      </div>

      {/* Image Panel */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-4 bg-black/20 flex items-center justify-center">
        {/* Steam animation on hover */}
        {isHovered && (
          <div className="absolute inset-0 pointer-events-none flex justify-center items-center z-10">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [20, -50],
                  x: [0, (i - 1.5) * 12],
                  opacity: [0, 0.45, 0],
                  scale: [0.8, 1.4],
                }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  delay: i * 0.35,
                }}
                className="absolute w-8 h-16 bg-white/10 rounded-full blur-[8px]"
              />
            ))}
          </div>
        )}

        <motion.img
          animate={isHovered ? { rotate: 8, scale: 1.08 } : { rotate: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          src={image}
          alt={name}
          className="w-[90%] h-[90%] object-contain drop-shadow-[0_15px_20px_rgba(0,0,0,0.5)]"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-brand-brown/40 to-transparent pointer-events-none" />
      </div>

      {/* Info Section */}
      <div>
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="text-white text-base font-serif tracking-wide font-bold group-hover:text-brand-gold transition-colors duration-300 leading-tight">
            {name}
          </h3>
          <span className="text-brand-gold text-base font-bold font-serif whitespace-nowrap">
            ₹{activePrice}
          </span>
        </div>

        <p className="text-white/60 text-xs leading-relaxed mb-4 min-h-[40px] line-clamp-2">
          {description}
        </p>

        {/* Portion Selector Buttons (Visible if portionType !== standard) */}
        {!isAdmin && portionType !== 'standard' && (
          <div className="mb-4">
            <span className="text-[9px] text-white/40 uppercase tracking-wider block mb-1.5">Choose Serving Size:</span>
            <div className={`grid ${portionType === 'four-sizes' ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2'} bg-black/40 border border-white/10 p-1 rounded-xl gap-1`}>
              {portionType === 'four-sizes' && (
                <>
                  <button
                    type="button"
                    onClick={() => setPortion('Single')}
                    className={`py-1 text-[8px] font-bold rounded-lg cursor-pointer transition-all ${
                      portion === 'Single' ? 'bg-brand-gold text-brand-brown' : 'text-white/50 hover:text-white'
                    }`}
                    title={`Single Serving (₹${singlePrice})`}
                  >
                    S (₹{singlePrice})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPortion('Full')}
                    className={`py-1 text-[8px] font-bold rounded-lg cursor-pointer transition-all ${
                      portion === 'Full' ? 'bg-brand-gold text-brand-brown' : 'text-white/50 hover:text-white'
                    }`}
                    title={`Full Serving (₹${fullPrice})`}
                  >
                    F (₹{fullPrice})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPortion('Family')}
                    className={`py-1 text-[8px] font-bold rounded-lg cursor-pointer transition-all ${
                      portion === 'Family' ? 'bg-brand-gold text-brand-brown' : 'text-white/50 hover:text-white'
                    }`}
                    title={`Family Pack (₹${familyPrice})`}
                  >
                    Fam (₹{familyPrice})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPortion('Jumbo')}
                    className={`py-1 text-[8px] font-bold rounded-lg cursor-pointer transition-all ${
                      portion === 'Jumbo' ? 'bg-brand-gold text-brand-brown' : 'text-white/50 hover:text-white'
                    }`}
                    title={`Jumbo Serving (₹${jumboPrice})`}
                  >
                    Jum (₹{jumboPrice})
                  </button>
                </>
              )}
              {portionType === 'half-full' && (
                <>
                  <button
                    type="button"
                    onClick={() => setPortion('Half')}
                    className={`py-1 text-[9px] uppercase font-bold tracking-widest rounded-lg cursor-pointer transition-all ${
                      portion === 'Half' ? 'bg-brand-gold text-brand-brown' : 'text-white/50 hover:text-white'
                    }`}
                  >
                    Half (₹{halfPrice})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPortion('Full')}
                    className={`py-1 text-[9px] uppercase font-bold tracking-widest rounded-lg cursor-pointer transition-all ${
                      portion === 'Full' ? 'bg-brand-gold text-brand-brown' : 'text-white/50 hover:text-white'
                    }`}
                  >
                    Full (₹{fullPrice})
                  </button>
                </>
              )}
              {portionType === 'single-full' && (
                <>
                  <button
                    type="button"
                    onClick={() => setPortion('Single')}
                    className={`py-1 text-[9px] uppercase font-bold tracking-widest rounded-lg cursor-pointer transition-all ${
                      portion === 'Single' ? 'bg-brand-gold text-brand-brown' : 'text-white/50 hover:text-white'
                    }`}
                  >
                    Single (₹{singlePrice})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPortion('Full')}
                    className={`py-1 text-[9px] uppercase font-bold tracking-widest rounded-lg cursor-pointer transition-all ${
                      portion === 'Full' ? 'bg-brand-gold text-brand-brown' : 'text-white/50 hover:text-white'
                    }`}
                  >
                    Full (₹{fullPrice})
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Metadata & Spice Level */}
        <div className="flex flex-wrap justify-between items-center gap-3 border-t border-white/5 pt-4 mb-4">
          <div className="flex items-center gap-1.5 text-white/50 text-xs">
            <Clock size={13} className="text-brand-gold" />
            {prepTime}
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px] text-white/40 uppercase tracking-wider mr-1">Spice:</span>
            {isAdmin ? (
              <span className="text-xs font-semibold text-brand-orange uppercase tracking-wider">
                {spiceLevel}
              </span>
            ) : (
              ['Mild', 'Medium', 'Spicy', 'Extra Spicy'].map((lvl) => {
                const count = getSpiceFlames(lvl);
                const isActive = selectedSpice === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSelectedSpice(lvl as any)}
                    title={lvl}
                    className={`p-1 rounded-md transition-colors cursor-pointer ${
                      isActive ? 'bg-brand-orange/20 text-brand-orange border border-brand-orange/40' : 'text-white/30 hover:text-white/70'
                    }`}
                  >
                    <div className="flex gap-0.5">
                      {[...Array(Math.min(count, 3))].map((_, f) => (
                        <Flame key={f} size={11} className={isActive ? 'fill-brand-orange' : ''} />
                      ))}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Notes input */}
        {!isAdmin && (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setShowNotesField(!showNotesField)}
              className="text-[10px] text-brand-gold/70 hover:text-brand-gold underline cursor-pointer"
            >
              {showNotesField ? 'Remove instruction' : '+ Add special instruction'}
            </button>
            
            {showNotesField && (
              <input
                type="text"
                placeholder="e.g. less oil, make spicy..."
                value={itemNotes}
                onChange={(e) => setItemNotes(e.target.value)}
                className="w-full mt-2 bg-black/30 border border-brand-gold/20 focus:border-brand-gold text-white text-xs px-3 py-1.5 rounded-lg outline-none transition-colors"
              />
            )}
          </div>
        )}
      </div>

      {/* Blinkit-Style Cart Controller */}
      {!isAdmin && (
        <div className="h-12 flex items-center">
          {quantityInCart > 0 ? (
            /* Counter showing when added */
            <div className="flex-1 flex justify-between items-center bg-brand-blue border border-brand-gold rounded-xl overflow-hidden shadow-lg h-full px-4">
              <button
                onClick={handleDecrement}
                className="p-1 text-white hover:text-brand-gold cursor-pointer transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="text-white text-sm font-bold">
                {quantityInCart} added
              </span>
              <button
                onClick={handleIncrement}
                className="p-1 text-white hover:text-brand-gold cursor-pointer transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          ) : (
            /* Add Button shown initially */
            <button
              onClick={handleAddToCart}
              className="w-full bg-brand-gold hover:bg-brand-gold/90 text-brand-brown font-bold text-xs py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 active:scale-95 shadow-[0_4px_12px_rgba(212,175,55,0.2)] h-full uppercase tracking-wider"
            >
              <ShoppingBag size={14} />
              Add to Cart
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};
