'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Hotspot {
  id: number;
  top: string;
  left: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  link: string;
  actionText: string;
}

export const Restaurant3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);
  const [hoveredHotspot, setHoveredHotspot] = useState<number | null>(null);

  // 3D Perspective Card Tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const card = containerRef.current;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    // Cap rotation angles at 12 degrees max
    setRotateX(-y / (box.height / 24));
    setRotateY(x / (box.width / 24));
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
    setHoveredHotspot(null);
  };

  const hotspots: Hotspot[] = [
    {
      id: 1,
      top: "76%",
      left: "19%",
      title: "🍵 Vantillu Tea Point",
      subtitle: "Ginger Tea & Snacks",
      description: "BN Reddy Nagar's hot spot! Sip our freshly brewed ginger and cardamom tea, alongside warm bobbatlu and crispy hot snacks.",
      icon: "☕",
      link: "/menu?filter=Sweets",
      actionText: "Order Tea & Sweets"
    },
    {
      id: 2,
      top: "60%",
      left: "51%",
      title: "🔥 Tandoor Bhatti Oven",
      subtitle: "Clay-oven Specialties",
      description: "Savor tender Chicken Tikka, sizzling Tangdi Kebabs, and butter naan baked fresh inside our traditional hot clay ovens.",
      icon: "🍢",
      link: "/menu?filter=Tandoor",
      actionText: "Explore Tandoor Menu"
    },
    {
      id: 3,
      top: "54%",
      left: "72%",
      title: "🚪 Family Dining Hall",
      subtitle: "Dine-in Comfort",
      description: "Reserve a comfortable family table. Enjoy a premium, air-conditioned dining experience with authentic Telugu hospitality.",
      icon: "🛋️",
      link: "/reserve",
      actionText: "Reserve a Table"
    },
    {
      id: 4,
      top: "22%",
      left: "41%",
      title: "🏷️ VANTILLU Restaurant",
      subtitle: "Multi-Cuisine Heritage",
      description: "The home of aromatic dum biryanis, Chinese cuisines, traditional gravies, and delicious village recipes prepared with love.",
      icon: "✨",
      link: "/menu",
      actionText: "Browse Menu"
    }
  ];

  const activeHotspotData = hotspots.find(h => h.id === activeHotspot);

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsHovered(true)}
      onClick={() => setActiveHotspot(null)}
      className="w-full h-full relative overflow-hidden select-none"
      style={{
        perspective: '1200px',
      }}
    >
      <motion.div
        animate={{
          rotateX: isHovered ? rotateX : 0,
          rotateY: isHovered ? rotateY : 0,
          scale: isHovered ? 1.025 : 1,
        }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        className="w-full h-full relative rounded-3xl overflow-hidden shadow-2xl"
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Background Storefront Image */}
        <img 
          src="/vantillu_building.webp" 
          alt="Vantillu Building Storefront" 
          className="w-full h-full object-cover select-none pointer-events-none"
        />

        {/* Ambient Dark lighting to pop gold overlays */}
        <div className={`absolute inset-0 bg-black/30 transition-opacity duration-500 ${isHovered ? 'opacity-15' : 'opacity-35'}`} />

        {/* Radial Light Flare highlighting active counters */}
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-500"
          style={{
            opacity: isHovered ? 0.7 : 0.2,
            background: `
              radial-gradient(circle at 19% 76%, rgba(212, 175, 55, 0.22) 0%, transparent 35%),
              radial-gradient(circle at 51% 60%, rgba(255, 122, 0, 0.18) 0%, transparent 35%),
              radial-gradient(circle at 72% 54%, rgba(21, 59, 112, 0.2) 0%, transparent 35%)
            `
          }}
        />

        {/* Floating Instruction overlay */}
        <div className="absolute top-3 left-4 bg-black/60 backdrop-blur-md border border-white/10 py-1 px-2.5 rounded-full pointer-events-none text-[8px] text-white/70 uppercase tracking-widest flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />
          Move mouse to look around • Click indicators
        </div>

        {/* Interactive Hotspots */}
        {hotspots.map((hs) => {
          const isActive = activeHotspot === hs.id;
          const isHsHovered = hoveredHotspot === hs.id;
          return (
            <div
              key={hs.id}
              className="absolute z-20"
              style={{
                top: hs.top,
                left: hs.left,
                transform: 'translate(-50%, -50%) translateZ(40px)',
              }}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveHotspot(isActive ? null : hs.id);
                }}
                onMouseEnter={() => setHoveredHotspot(hs.id)}
                onMouseLeave={() => setHoveredHotspot(null)}
                className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer shadow-lg focus:outline-none transition-transform duration-300 ${
                  isActive 
                    ? 'bg-brand-orange text-white scale-110 border border-white' 
                    : 'bg-brand-gold text-brand-brown hover:scale-105 border border-white/50'
                }`}
              >
                {/* Ping rings */}
                <span className={`absolute inset-0 rounded-full animate-ping opacity-60 ${isActive ? 'bg-brand-orange' : 'bg-brand-gold'}`} />
                <span className="text-[11px] relative z-10 font-bold">{hs.icon}</span>
              </button>

              {/* Hover Tooltip */}
              <AnimatePresence>
                {isHsHovered && !isActive && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.95 }}
                    className="absolute bottom-9 left-1/2 -translate-x-1/2 w-44 bg-[#2E1A1C] border border-brand-gold/30 p-2 rounded-xl shadow-2xl backdrop-blur-md pointer-events-none text-center"
                  >
                    <p className="text-[9px] font-bold text-brand-gold leading-tight">{hs.title}</p>
                    <p className="text-[7px] text-white/55 uppercase tracking-widest mt-0.5">{hs.subtitle}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Detailed Modal Card Overlay */}
        <AnimatePresence>
          {activeHotspotData && (
            <motion.div
              initial={{ y: 90, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 90, opacity: 0 }}
              onClick={(e) => e.stopPropagation()} // Prevent click propagation
              className="absolute bottom-3 inset-x-3 bg-[#2E1A1C]/95 border border-brand-gold/30 p-3.5 rounded-2xl shadow-2xl backdrop-blur-md z-30 flex flex-col justify-between"
              style={{ transform: 'translateZ(60px)' }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-serif text-xs font-bold text-brand-gold flex items-center gap-1.5 leading-none">
                    <span>{activeHotspotData.icon}</span>
                    {activeHotspotData.title}
                  </h3>
                  <p className="text-[7px] text-white/50 uppercase tracking-widest mt-1">{activeHotspotData.subtitle}</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setActiveHotspot(null)}
                  className="text-white/40 hover:text-white text-xs cursor-pointer bg-white/5 hover:bg-white/10 rounded-full w-5 h-5 flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <p className="text-[9px] text-white/80 leading-relaxed mt-2.5">
                {activeHotspotData.description}
              </p>

              <div className="flex gap-2 mt-3.5">
                <a
                  href={activeHotspotData.link}
                  className="flex-1 bg-brand-gold hover:bg-brand-gold/90 text-brand-brown font-bold text-[9px] uppercase tracking-wider py-2 rounded-lg text-center shadow transition-colors"
                >
                  {activeHotspotData.actionText}
                </a>
                <button
                  type="button"
                  onClick={() => setActiveHotspot(null)}
                  className="border border-white/10 hover:border-white/20 text-white/60 hover:text-white text-[9px] uppercase tracking-wider py-2 px-3 rounded-lg transition-colors"
                >
                  Back
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
};
