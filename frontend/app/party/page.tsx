'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Phone, Smartphone, Sparkles, CheckCircle2, Calendar, Mail, FileText, User } from 'lucide-react';

export default function PartyPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [eventType, setEventType] = useState('Birthday');
  const [guestCount, setGuestCount] = useState('25');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !email || !date || !guestCount) {
      alert('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name,
      email,
      phone,
      event_type: eventType,
      guest_count: parseInt(guestCount),
      date,
      description
    };

    try {
      const response = await fetch('/api/party-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        setSubmitted(true);
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to submit catering inquiry. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert(
        'Could not connect to the server. Please check your internet connection and try again.\n\nIf the problem persists, call us directly to discuss your catering requirements.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setName('');
    setPhone('');
    setEmail('');
    setEventType('Birthday');
    setGuestCount('25');
    setDate('');
    setDescription('');
    setSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-[#0c0607] pb-24 text-white relative flex flex-col items-center">
      {/* Background Lighting */}
      <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-[#153B72]/10 to-transparent blur-[100px] pointer-events-none" />

      {/* Header Banner */}
      <div className="pt-28 pb-6 px-6 text-center space-y-4">
        <span className="text-brand-gold text-xs uppercase tracking-[0.3em] font-semibold flex items-center justify-center gap-1.5">
          <Sparkles size={12} className="fill-brand-gold" />
          Outdoor Catering & Banquets
        </span>
        <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-wide">
          Party Catering & Orders
        </h1>
        <div className="w-16 h-[2px] bg-brand-gold mx-auto mt-2" />
        <p className="text-white/60 text-xs md:text-sm max-w-md mx-auto leading-relaxed">
          Hosting a celebration? Bring the warmth and wood-fired flavor of Vantillu to your guests.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full z-10">
        
        {/* Info Column */}
        <div className="space-y-6">
          <h2 className="font-serif text-brand-gold text-2xl font-bold leading-tight">
            Catering with Grandma's Love
          </h2>
          <div className="w-12 h-[1px] bg-brand-gold/40" />
          <p className="text-white/70 text-xs md:text-sm leading-relaxed font-light">
            Vantillu takes pride in hosting large-scale family gatherings, corporate lunches, housewarmings (Gruhapravesam), and weddings.
          </p>

          <div className="flex flex-col gap-3.5 pt-4">
            <a
              href="https://wa.me/919052448238?text=Hi%20Vantillu,%20I%20would%20like%20to%20inquire%20about%20party%20catering."
              target="_blank"
              rel="noreferrer"
              className="w-full max-w-xs bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg text-xs uppercase tracking-widest text-center"
            >
              <Smartphone size={14} />
              Inquire on WhatsApp
            </a>
            <a
              href="tel:+914099999999"
              className="w-full max-w-xs border border-brand-gold/30 hover:border-brand-gold text-brand-gold font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors text-xs uppercase tracking-widest text-center"
            >
              <Phone size={14} />
              Call Operations Desk
            </a>
          </div>
        </div>

        {/* Form Panel */}
        <div className="w-full">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-[#2E1A1C]/70 border border-brand-gold/30 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden backdrop-blur-md relative"
          >
            {/* Corner decoration */}
            <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-brand-gold/20 rounded-tl" />
            <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-brand-gold/20 rounded-tr" />
            <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-brand-gold/20 rounded-bl" />
            <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-brand-gold/20 rounded-br" />

            {submitted ? (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-8 space-y-4"
              >
                <CheckCircle2 size={48} className="text-green-500 mx-auto animate-bounce" />
                <h3 className="font-serif text-brand-gold text-lg font-bold">Catering inquiry Received!</h3>
                <p className="text-white/60 text-xs leading-relaxed max-w-[240px] mx-auto">
                  Thank you! Our operations lead will contact you within 24 hours to draft a custom menu proposal.
                </p>
                <button
                  onClick={handleReset}
                  className="bg-brand-gold hover:bg-brand-gold/90 text-brand-brown font-bold text-xs uppercase tracking-widest py-3 px-6 rounded-xl cursor-pointer"
                >
                  Submit Another Inquiry
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs text-white">
                <h3 className="font-serif text-brand-gold font-semibold uppercase tracking-wider text-sm mb-2">
                  Event Catering Details
                </h3>

                <div className="space-y-1.5">
                  <label className="text-[9px] text-white/50 uppercase tracking-wider font-semibold">Your Name</label>
                  <div className="relative">
                    <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anand Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-black/45 border border-white/10 rounded-xl px-9 py-2.5 focus:border-brand-gold outline-none text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-white/50 uppercase tracking-wider font-semibold">Phone</label>
                    <div className="relative">
                      <Smartphone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="tel"
                        required
                        placeholder="your number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-black/45 border border-white/10 rounded-xl px-9 py-2.5 focus:border-brand-gold outline-none text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-white/50 uppercase tracking-wider font-semibold">Email</label>
                    <div className="relative">
                      <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="email"
                        required
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-black/45 border border-white/10 rounded-xl px-9 py-2.5 focus:border-brand-gold outline-none text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-white/50 uppercase tracking-wider font-semibold">Event Type</label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full bg-black/45 border border-white/10 rounded-xl px-3 py-2.5 focus:border-brand-gold outline-none cursor-pointer text-white"
                    >
                      <option value="Birthday" className="bg-[#2E1A1C]">Birthday Party</option>
                      <option value="Wedding" className="bg-[#2E1A1C]">Wedding Reception</option>
                      <option value="Corporate" className="bg-[#2E1A1C]">Corporate Dinner</option>
                      <option value="Housewarming" className="bg-[#2E1A1C]">Housewarming (Gruhapravesam)</option>
                      <option value="Other" className="bg-[#2E1A1C]">Other Celebration</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-white/50 uppercase tracking-wider font-semibold">Guest Count</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 50"
                      value={guestCount}
                      onChange={(e) => setGuestCount(e.target.value)}
                      className="w-full bg-black/45 border border-white/10 rounded-xl px-3 py-2.5 focus:border-brand-gold outline-none text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] text-white/50 uppercase tracking-wider font-semibold">Event Date</label>
                  <div className="relative">
                    <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-black/45 border border-white/10 rounded-xl px-9 py-2.5 focus:border-brand-gold outline-none cursor-pointer text-white fill-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] text-white/50 uppercase tracking-wider font-semibold">Event Notes & Requests</label>
                  <div className="relative">
                    <FileText size={13} className="absolute left-3 top-3 text-white/40" />
                    <textarea
                      placeholder="special menu selections, live stations, setup instructions..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full bg-black/45 border border-white/10 rounded-xl px-9 py-2.5 focus:border-brand-gold outline-none resize-none text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-brand-gold hover:bg-brand-gold/90 text-brand-brown font-bold py-3.5 rounded-xl cursor-pointer transition-colors shadow-md uppercase tracking-wider text-[11px]"
                >
                  {isSubmitting ? 'Submitting details...' : 'Submit Catering Request'}
                </button>
              </form>
            )}
          </motion.div>
        </div>

      </div>
    </div>
  );
}
