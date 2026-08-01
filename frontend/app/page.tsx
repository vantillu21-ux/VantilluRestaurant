'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Star, Calendar, ChefHat, ArrowRight, MapPin, Camera, ChevronLeft, ChevronRight, Phone } from 'lucide-react';
import { IntroCinematic } from '../components/IntroCinematic';
import { Restaurant3D } from '../components/Restaurant3D';
import settings from '../data/settings.json';
import { API_URL } from '../lib/api';

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const galleryPhotos = [
    { src: '/gallery-1.png', caption: 'Warm Family Ambiance' },
    { src: '/gallery-2.png', caption: 'Signature Handi Biryani' },
    { src: '/gallery-3.png', caption: 'Festive Outdoor Dining' },
    { src: '/gallery-4.png', caption: 'Traditional Telugu Thali' },
  ];

  const prevPhoto = () => setGalleryIndex((i) => (i - 1 + galleryPhotos.length) % galleryPhotos.length);
  const nextPhoto = () => setGalleryIndex((i) => (i + 1) % galleryPhotos.length);

  const [settingsData, setSettingsData] = useState({
    restaurantName: settings.restaurantName || "Vantillu",
    tagline: settings.tagline || "Traditional Telugu Heritage",
    headline: settings.headline || "Experience the Taste of Home",
    subheadline: settings.subheadline || "Welcome to Vantillu. ప్రతి వంటలో సంప్రదాయం, ప్రతి ముద్దలో ఆప్యాయత.",
    prideTitle: settings.prideTitle || "Kona Seema Kodi Biryani",
    prideDescription: settings.prideDescription || "Traditional Andhra coastal-style spicy chicken biryani cooked with local Konaseema herbs.",
    pridePrice: settings.pridePrice || "220"
  });

  // Check sessionStorage so cinematic intro only plays once per session
  useEffect(() => {
    const isIframe = window.self !== window.top;
    const played = sessionStorage.getItem('vantillu_intro_played');
    if (played || isIframe) {
      setShowIntro(false);
    }

    // Load settings from backend API
    fetch(`${API_URL}/api/settings`)
      .then(res => res.json())
      .then(data => {
        if (data && data.restaurantName) {
          setSettingsData(data);
        }
      })
      .catch(err => console.error(err));

    // Check if logged in as admin AND running inside the simulator iframe
    const token = localStorage.getItem('vantillu_admin_token');
    if (isIframe && token) {
      setIsAdmin(true);
    }
  }, []);

  const saveSettingField = async (field: string, newValue: string) => {
    const updated = { ...settingsData, [field]: newValue };
    setSettingsData(updated);
    const token = localStorage.getItem('vantillu_admin_token');
    if (!token) return;
    try {
      await fetch(`${API_URL}/api/settings/admin/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updated)
      });
    } catch (err) {
      console.error("Failed to save setting field:", err);
    }
  };

  const handleIntroComplete = () => {
    sessionStorage.setItem('vantillu_intro_played', 'true');
    setShowIntro(false);
  };

  return (
    <div className="min-h-screen bg-[#0c0607] overflow-hidden">
      {/* Cinematic Intro Opener */}
      {showIntro && (
        <IntroCinematic onComplete={handleIntroComplete} />
      )}

      {/* Landing page body */}
      {!showIntro && (
        <div className="relative">
          {/* Ambient Lighting flares */}
          <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-[#153B72]/10 to-transparent blur-[120px] pointer-events-none" />

          {/* 1. HERO SECTION */}
          <section className="min-h-[90vh] flex flex-col lg:flex-row items-center justify-center pt-20 pb-12 px-6 md:px-16 lg:px-24 gap-12 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(21,59,114,0.18)_0%,transparent_70%),radial-gradient(circle_at_bottom,rgba(212,175,55,0.06)_0%,transparent_60%)] pointer-events-none" />

            {/* Left Content column */}
            <div className="flex-1 space-y-6 max-w-xl text-center lg:text-left z-10">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-center lg:justify-start gap-2 text-brand-gold text-xs uppercase tracking-[0.3em] font-semibold">
                  <Sparkles size={14} />
                  {isAdmin ? (
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => saveSettingField('tagline', e.currentTarget.textContent || '')}
                      className="border-b border-dashed border-brand-gold/30 hover:border-brand-gold outline-none cursor-text px-1"
                      title="Click to edit tagline"
                    >
                      {settingsData.tagline}
                    </span>
                  ) : (
                    <span>{settingsData.tagline}</span>
                  )}
                </div>
                <h1 className="font-serif text-white text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-wide">
                  {isAdmin ? (
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => saveSettingField('headline', e.currentTarget.textContent || '')}
                      className="border-b border-dashed border-white/20 hover:border-brand-gold outline-none cursor-text px-1 block"
                      title="Click to edit headline"
                    >
                      {settingsData.headline}
                    </span>
                  ) : (
                    <span>{settingsData.headline}</span>
                  )}
                </h1>
                {isAdmin ? (
                  <p
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => saveSettingField('subheadline', e.currentTarget.textContent || '')}
                    className="text-white/70 text-sm md:text-base max-w-md mx-auto lg:mx-0 leading-relaxed font-light pt-2 border-b border-dashed border-white/10 hover:border-brand-gold outline-none cursor-text px-1 block"
                    title="Click to edit subheadline"
                  >
                    {settingsData.subheadline}
                  </p>
                ) : (
                  <p className="text-white/70 text-sm md:text-base max-w-md mx-auto lg:mx-0 leading-relaxed font-light pt-2">
                    {settingsData.subheadline}
                  </p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="flex flex-wrap gap-4 justify-center lg:justify-start pt-4"
              >
                <Link
                  href="/menu"
                  className="bg-brand-blue hover:bg-brand-blue/90 border border-brand-gold text-white font-bold text-xs uppercase tracking-widest py-4 px-8 rounded-full shadow-[0_6px_20px_rgba(21,59,114,0.35)] transition-all duration-300 active:scale-95 text-center"
                >
                  Explore Menu Catalog
                </Link>
                <Link
                  href="/reserve"
                  className="bg-brand-brown border border-brand-gold/40 hover:border-brand-gold text-brand-gold font-bold text-xs uppercase tracking-widest py-4 px-8 rounded-full transition-all duration-300 active:scale-95 text-center"
                >
                  Reserve a Table
                </Link>
              </motion.div>

              {/* Micro stats banner */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-2 gap-4 pt-8 border-t border-white/5 max-w-sm mx-auto lg:mx-0 text-center lg:text-left"
              >
                <div>
                  <h4 className="font-serif text-brand-gold font-bold text-lg">233+</h4>
                  <p className="text-[9px] uppercase tracking-widest text-white/50">Google Reviews</p>
                </div>
                <div>
                  <h4 className="font-serif text-brand-gold font-bold text-lg">4.0 ★</h4>
                  <p className="text-[9px] uppercase tracking-widest text-white/50">Rating Score</p>
                </div>
              </motion.div>
            </div>

            {/* Right 3D House Element */}
            <div className="flex-1 w-full max-w-[500px] h-[350px] sm:h-[450px] lg:h-[500px] relative rounded-3xl overflow-hidden glass-panel shadow-2xl gold-glow border-brand-gold/30">
              <Restaurant3D />
            </div>
          </section>

          {/* 2. SPECIALS SECTION (Chef Choice / Signature Biryani spotlight) */}
          <section className="py-24 px-6 md:px-12 lg:px-24 bg-gradient-to-b from-[#0c0607] via-[#091427] to-[#140b0c] relative">
            <div className="max-w-7xl mx-auto space-y-12">
              <div className="text-center space-y-3">
                <span className="text-brand-gold text-xs uppercase tracking-[0.3em] font-semibold flex items-center justify-center gap-1.5">
                  <Star size={12} className="fill-brand-gold" />
                  Highly Recommended
                </span>
                <h2 className="font-serif text-white text-3xl md:text-5xl font-bold tracking-wide">
                  Signature Delicacies
                </h2>
                <div className="w-16 h-[2px] bg-brand-gold mx-auto mt-2" />
              </div>

              {/* Split spotlight of signature Hyderabadi Biryani */}
              <div className="flex flex-col lg:flex-row items-center gap-12 bg-gradient-to-br from-[#2E1A1C]/80 to-[#153B72]/15 border border-brand-gold/25 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden backdrop-blur-md">

                {/* Image panel with steam details */}
                <div className="flex-1 relative w-full aspect-square max-w-[400px] bg-black/35 rounded-2xl overflow-hidden flex items-center justify-center">

                  {/* Floating spices indicators */}
                  <div className="absolute inset-0 pointer-events-none z-10">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          y: [30, -60],
                          x: [(i - 2.5) * 15, (i - 2.5) * 20],
                          rotate: [0, 360],
                          opacity: [0, 0.7, 0]
                        }}
                        transition={{
                          duration: 2.2 + Math.random() * 0.8,
                          repeat: Infinity,
                          delay: i * 0.4
                        }}
                        className="absolute text-brand-gold/60 text-xs font-mono"
                        style={{
                          left: `${20 + i * 12}%`,
                          bottom: '10%'
                        }}
                      >
                        {['☘', '🍂', '✨', '🌶'][i % 4]}
                      </motion.div>
                    ))}
                  </div>

                  <img
                    src="/premium_biryani.png"
                    alt="Authentic Chicken Biryani served warm"
                    className="w-[85%] h-[85%] object-contain animate-[spin_50s_linear_infinite]"
                  />
                </div>

                {/* Details side */}
                <div className="flex-1 space-y-6">
                  <span className="bg-brand-orange text-white text-[9px] font-bold uppercase tracking-widest py-1 px-3.5 rounded-full inline-block">
                    The Pride of {isAdmin ? (
                      <span
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => saveSettingField('restaurantName', e.currentTarget.textContent || '')}
                        className="border-b border-dashed border-white/20 hover:border-brand-gold outline-none cursor-text px-1"
                        title="Click to edit restaurant name"
                      >
                        {settingsData.restaurantName}
                      </span>
                    ) : (
                      <span>{settingsData.restaurantName}</span>
                    )}
                  </span>
                  <h3 className="font-serif text-white text-2xl md:text-3xl font-extrabold leading-tight">
                    {isAdmin ? (
                      <span
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => saveSettingField('prideTitle', e.currentTarget.textContent || '')}
                        className="border-b border-dashed border-white/20 hover:border-brand-gold outline-none cursor-text px-1"
                        title="Click to edit pride dish name"
                      >
                        {settingsData.prideTitle}
                      </span>
                    ) : (
                      <span>{settingsData.prideTitle}</span>
                    )}
                  </h3>
                  {isAdmin ? (
                    <p
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => saveSettingField('prideDescription', e.currentTarget.textContent || '')}
                      className="text-white/70 text-xs md:text-sm leading-relaxed font-light border-b border-dashed border-white/10 hover:border-brand-gold outline-none cursor-text px-1 block"
                      title="Click to edit pride description"
                    >
                      {settingsData.prideDescription}
                    </p>
                  ) : (
                    <p className="text-white/70 text-xs md:text-sm leading-relaxed font-light">
                      {settingsData.prideDescription}
                    </p>
                  )}

                  <div className="flex gap-8 border-y border-white/5 py-4">
                    <div>
                      <span className="text-[10px] text-white/40 uppercase block">Preparation</span>
                      <span className="text-brand-gold font-semibold text-sm">25 mins</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/40 uppercase block">Spice Level</span>
                      <span className="text-brand-orange font-bold text-sm">🌶🌶🌶🌶 Extra Spicy</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/40 uppercase block">Orders</span>
                      <span className="text-green-400 font-semibold text-sm">1,200+ served</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 justify-between">
                    <div>
                      <span className="text-[10px] text-white/40 uppercase block">Serving Price</span>
                      <span className="text-white text-2xl font-serif font-bold">
                        ₹
                        {isAdmin ? (
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => saveSettingField('pridePrice', e.currentTarget.textContent || '')}
                            className="border-b border-dashed border-white/20 hover:border-brand-gold outline-none cursor-text px-1"
                            title="Click to edit price"
                          >
                            {settingsData.pridePrice}
                          </span>
                        ) : (
                          <span>{settingsData.pridePrice}</span>
                        )}
                      </span>
                    </div>
                    <Link
                      href="/menu"
                      className="bg-brand-gold hover:bg-brand-gold/90 text-brand-brown font-bold text-xs uppercase tracking-widest py-3.5 px-6 rounded-xl transition-colors cursor-pointer shadow-[0_4px_12px_rgba(212,175,55,0.2)] active:scale-95 text-center"
                    >
                      View Menu & Order
                    </Link>
                  </div>
                </div>

              </div>
            </div>
          </section>


          {/* ── LOCATION & MAPS ─────────────────────────────────────────────── */}
          <section className="py-20 px-6 bg-gradient-to-b from-[#0c0607] to-[#0a0404] border-t border-white/5">
            <div className="max-w-7xl mx-auto">
              <div className="text-center space-y-3 mb-12">
                <span className="text-brand-gold text-xs uppercase tracking-[0.3em] font-semibold flex items-center justify-center gap-2">
                  <MapPin size={13} className="text-brand-gold" /> Find Us
                </span>
                <h2 className="font-serif text-white text-3xl md:text-5xl font-bold tracking-wide">
                  Visit Vantillu
                </h2>
                <div className="w-16 h-[2px] bg-brand-gold mx-auto mt-2" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                {/* Address & Contact */}
                <div className="space-y-6">
                  <div className="bg-[#2E1A1C]/50 border border-brand-gold/20 rounded-3xl p-7 space-y-5 backdrop-blur-sm">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <MapPin size={18} className="text-brand-gold" />
                      </div>
                      <div>
                        <p className="text-brand-gold text-xs uppercase tracking-widest font-bold mb-1">Address</p>
                        <p className="text-white font-semibold text-sm leading-relaxed">
                          Plot No. 236, Opposite Anjaneya Swamy Temple,<br />
                          BN Reddy Nagar, Hyderabad,<br />
                          Telangana — 500070
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-white/5" />

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Phone size={18} className="text-brand-gold" />
                      </div>
                      <div>
                        <p className="text-brand-gold text-xs uppercase tracking-widest font-bold mb-1">Reservations & Orders</p>
                        <a href="tel:+918008508234" className="text-white hover:text-brand-gold transition-colors font-semibold text-sm">+91 80085 08234</a>
                      </div>
                    </div>

                    <div className="border-t border-white/5" />

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center flex-shrink-0">
                        <Calendar size={18} className="text-brand-gold" />
                      </div>
                      <div>
                        <p className="text-brand-gold text-xs uppercase tracking-widest font-bold mb-1">Opening Hours</p>
                        <p className="text-white text-sm font-semibold">Daily: 11:00 AM – 11:00 PM</p>
                        <p className="text-white/40 text-xs mt-0.5">Open all 7 days including holidays</p>
                      </div>
                    </div>
                  </div>

                  {/* Open in Google Maps CTA */}
                  <a
                    href="https://www.google.com/maps/search/Vantillu+Restaurant+BN+Reddy+Nagar+Hyderabad"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 w-full bg-brand-gold hover:bg-brand-gold/90 text-brand-brown font-bold text-xs uppercase tracking-widest py-3.5 px-6 rounded-xl transition-colors shadow-md"
                  >
                    <MapPin size={15} />
                    Get Directions on Google Maps
                  </a>
                </div>

                {/* Embedded Google Map */}
                <div className="rounded-3xl overflow-hidden border border-brand-gold/20 shadow-2xl" style={{ height: '420px' }}>
                  <iframe
                    title="Vantillu Restaurant Location"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3808.6!2d78.548!3d17.3616!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTfCsDIxJzQxLjgiTiA3OMKwMzInNTIuOCJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(0.85) contrast(1.1)' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* 3. REVIEWS / TESTIMONIALS */}
          <section className="py-24 px-6 md:px-12 lg:px-24 bg-[#0c0607] relative border-t border-white/5">
            <div className="max-w-7xl mx-auto space-y-12">
              <div className="text-center space-y-3">
                <span className="text-brand-gold text-xs uppercase tracking-[0.3em] font-semibold">Kind Words</span>
                <h2 className="font-serif text-white text-3xl md:text-5xl font-bold tracking-wide">
                  Served with Love
                </h2>
                <div className="w-16 h-[2px] bg-brand-gold mx-auto mt-2" />
              </div>

              {/* Review cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    name: "Srinivas Rao",
                    review: "The Natu Kodi Pulao tastes exactly like what my grandmother used to make in our village in West Godavari. The woodfire smokiness is unmistakable. Brilliant experience!",
                    rating: 5,
                    title: "Authentic Earthen Simmer"
                  },
                  {
                    name: "Harika Reddy",
                    review: "A masterpiece restaurant experience. The cinematic welcoming, the gorgeous 3D visualizers, and the food cards made me hungry instantly. The Gongura Mutton Biryani is highly recommended!",
                    rating: 5,
                    title: "Best Biryani in Hyderabad"
                  },
                  {
                    name: "Anil Kumar",
                    review: "Pure hospitality. From the traditional Namaste opening of the doors to the warm banana leaf and brass presentations, Vantillu respects its Telugu roots. 5 stars all the way.",
                    rating: 5,
                    title: "Exquisite Village Dining"
                  }
                ].map((rev, i) => (
                  <div
                    key={i}
                    className="bg-[#2E1A1C]/50 border border-brand-gold/20 hover:border-brand-gold/60 p-6 rounded-3xl relative backdrop-blur-md shadow-xl transition-all duration-300 hover:-translate-y-1.5"
                  >
                    <div className="flex gap-1 mb-4">
                      {[...Array(rev.rating)].map((_, s) => (
                        <Star key={s} size={14} className="fill-brand-gold text-brand-gold" />
                      ))}
                    </div>
                    <h4 className="font-serif text-white font-bold mb-2">"{rev.title}"</h4>
                    <p className="text-white/60 text-xs leading-relaxed mb-6 font-light">
                      {rev.review}
                    </p>
                    <div className="border-t border-white/5 pt-4 text-xs font-semibold text-brand-gold flex items-center justify-between">
                      <span>{rev.name}</span>
                      <span className="text-[10px] text-white/40 font-normal">Verified Diner</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Banner linking to bookings */}
          <section className="py-20 px-6 bg-gradient-to-r from-brand-brown via-[#190d0e] to-brand-brown border-t border-white/5 text-center space-y-6">
            <h2 className="font-serif text-brand-gold text-2xl md:text-3xl font-bold tracking-wider">
              Planning a Gathering or a Feast?
            </h2>
            <p className="text-white/70 text-xs md:text-sm max-w-lg mx-auto font-light leading-relaxed">
              Book a family table in advance or inquire about our premium, wood-fired outdoor catering services for weddings, corporate events, and celebrations.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Link
                href="/reserve"
                className="bg-brand-gold hover:bg-brand-gold/90 text-brand-brown font-bold text-xs uppercase tracking-widest py-3.5 px-6 rounded-xl transition-colors shadow-md text-center"
              >
                Book a Table
              </Link>
              <Link
                href="/party"
                className="border border-brand-gold/40 hover:border-brand-gold text-brand-gold font-bold text-xs uppercase tracking-widest py-3 px-6 rounded-xl transition-colors text-center"
              >
                Inquire Party Catering
              </Link>
            </div>
          </section>

          {/* Footer branding */}
          <footer className="bg-black py-12 px-6 border-t border-white/5 text-center text-xs text-white/40 space-y-4">
            <div className="flex justify-center items-center gap-2">
              <ChefHat className="text-brand-gold/60" size={18} />
              <span className="font-serif text-brand-gold font-bold tracking-widest text-sm uppercase">Vantillu Resto</span>
            </div>
            <p className="max-w-md mx-auto leading-relaxed">
              © 2026 Vantillu. Handcrafted with love and traditional recipes. All rights reserved.
            </p>
            <div className="flex justify-center gap-6 text-[10px] uppercase tracking-wider text-brand-gold/60">
              <Link href="/reserve" className="hover:text-brand-gold">Table Reservations</Link>
            </div>
          </footer>

        </div>
      )}
    </div>
  );
}
