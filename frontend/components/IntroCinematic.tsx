'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IntroCinematicProps {
  onComplete: () => void;
}

export const IntroCinematic: React.FC<IntroCinematicProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'closed' | 'open' | 'fadeout'>('loading');
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Simulated asset preloading progress bar
  useEffect(() => {
    if (phase === 'loading') {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setTimeout(() => {
              setPhase('closed');
            }, 800);
            return 100;
          }
          return prev + Math.floor(Math.random() * 15) + 5;
        });
      }, 150);
      return () => clearInterval(timer);
    }
  }, [phase]);

  // Audio synthesis triggers
  const initializeAudio = () => {
    if (audioCtxRef.current) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;
      setAudioEnabled(true);
      playAmbientSoundtrack(ctx);
    } catch (e) {
      console.error('Web Audio API not supported', e);
    }
  };

  const playAmbientSoundtrack = (ctx: AudioContext) => {
    const now = ctx.currentTime;

    // 1. Gentle background drone (Flute-like resonance)
    const droneOsc = ctx.createOscillator();
    const droneGain = ctx.createGain();
    droneOsc.type = 'triangle';
    droneOsc.frequency.setValueAtTime(220, now); // A3 note
    droneGain.gain.setValueAtTime(0.0, now);
    droneGain.gain.linearRampToValueAtTime(0.04, now + 2); // soft swell
    
    droneOsc.connect(droneGain);
    droneGain.connect(ctx.destination);
    droneOsc.start(now);

    // 2. Play temple bell after a small delay
    setTimeout(() => {
      playTempleBell(ctx);
    }, 500);

    // 3. Play periodic bird chirping
    const birdInterval = setInterval(() => {
      if (ctx.state === 'running') {
        playBirdChirp(ctx);
      }
    }, 3000);

    // Stop all audio on clean up
    return () => {
      clearInterval(birdInterval);
      try {
        droneOsc.stop();
        ctx.close();
      } catch (e) {}
    };
  };

  const playTempleBell = (ctx: AudioContext) => {
    if (!ctx || ctx.state === 'suspended') return;
    const now = ctx.currentTime;
    
    // Deeper fundamental frequency + higher harmonics for brass bell resonance
    const frequencies = [180, 360, 540, 720, 900];
    const gains = [0.15, 0.08, 0.04, 0.02, 0.01];

    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      
      gain.gain.setValueAtTime(gains[idx], now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 5.0); // long decay
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 6.0);
    });
  };

  const playBirdChirp = (ctx: AudioContext) => {
    if (!ctx || ctx.state === 'suspended') return;
    const now = ctx.currentTime;

    // Bird chirping is represented by short FM frequency sweeps
    const count = 3;
    for (let i = 0; i < count; i++) {
      const start = now + i * 0.25;
      const duration = 0.12;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      
      osc.frequency.setValueAtTime(1200 + Math.random() * 200, start);
      osc.frequency.exponentialRampToValueAtTime(2200 + Math.random() * 300, start + duration);

      gain.gain.setValueAtTime(0.005, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration + 0.1);
    }
  };

  // Click handler to open door and start sounds
  const handleKnockClick = () => {
    initializeAudio();
    setPhase('open');
  };

  // Automate transition from open door to fadeout, and then fadeout complete
  useEffect(() => {
    if (phase === 'open') {
      const timer = setTimeout(() => {
        setPhase('fadeout');
      }, 5500);
      return () => clearTimeout(timer);
    } else if (phase === 'fadeout') {
      const timer = setTimeout(() => {
        onComplete();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [phase, onComplete]);

  // Petals and Sparks states to avoid hydration mismatch
  const [petals, setPetals] = useState<any[]>([]);
  const [sparks, setSparks] = useState<any[]>([]);

  useEffect(() => {
    // Generate random items only on the client
    setPetals(Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 4,
      duration: Math.random() * 3 + 2,
      rotate: Math.random() * 360,
      size: Math.random() * 12 + 6,
    })));

    setSparks(Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      bottom: `${Math.random() * 20}%`,
      delay: Math.random() * 3,
      duration: Math.random() * 2 + 2,
      size: Math.random() * 4 + 2,
    })));
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070304] select-none">
      <AnimatePresence mode="wait">
        
        {/* Phase 1: Pre-loading Screen */}
        {phase === 'loading' && (
          <motion.div
            key="loading-screen"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center space-y-6"
          >
            {/* Spinning decorative clay dish representation */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border-2 border-dashed border-brand-gold/30 p-1"
              />
              <motion.div
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: [0.8, 1, 0.8], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-20 h-20 rounded-full p-1.5 bg-black/40 border border-brand-gold/20 flex items-center justify-center"
              >
                {/* Traditional motif inside plate */}
                <div className="w-full h-full rounded-full border border-brand-gold/35 flex items-center justify-center bg-gradient-to-tr from-brand-brown to-brand-brown/40">
                  <div className="w-12 h-12 rounded-full border border-brand-gold/20 flex items-center justify-center text-brand-gold text-xl font-bold font-serif">
                    V
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Preparing text */}
            <motion.h2
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-brand-gold text-lg md:text-xl font-serif tracking-widest text-center"
            >
              Preparing Fresh Happiness...
            </motion.h2>
            
            {/* Progress percentage */}
            <p className="text-white/40 text-[10px] tracking-widest uppercase">
              {progress}% Loaded
            </p>

            {/* Custom Progress Bar */}
            <div className="w-64 h-[2px] bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-brand-orange to-brand-gold"
                style={{ width: `${progress}%` }}
              />
            </div>
          </motion.div>
        )}

        {/* Combined Ceremony & Door Opening screen */}
        {(phase === 'closed' || phase === 'open' || phase === 'fadeout') && (
          <motion.div
            key="doors-ceremony"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0 }}
            className="absolute inset-0 flex items-center justify-center bg-[#070304] overflow-hidden"
          >
            {/* Ambient sunrays & floating particles background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.12)_0%,transparent_70%)] pointer-events-none" />
            
            {/* Golden light lens flare */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-gold/10 blur-[120px] rounded-full pointer-events-none" />

            {/* Falling Flower Petals (Active only after knock opens the doors) */}
            {phase !== 'closed' && (
              <div className="absolute inset-0 pointer-events-none">
                {petals.map((petal) => (
                  <motion.div
                    key={petal.id}
                    initial={{ y: -50, x: petal.left, rotate: petal.rotate, opacity: 0 }}
                    animate={{
                      y: ['0vh', '110vh'],
                      x: [`calc(${petal.left} - 30px)`, `calc(${petal.left} + 30px)`],
                      rotate: petal.rotate + 360,
                      opacity: [0, 0.8, 0.8, 0],
                    }}
                    transition={{
                      duration: petal.duration,
                      delay: petal.delay,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="absolute"
                    style={{
                      width: petal.size,
                      height: petal.size * 0.8,
                      borderRadius: '50% 0 50% 50%',
                      backgroundColor: petal.id % 2 === 0 ? '#E65F2B' : '#D4AF37',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    }}
                  />
                ))}
              </div>
            )}

            {/* Golden sparks rising */}
            {phase !== 'closed' && (
              <div className="absolute inset-0 pointer-events-none">
                {sparks.map((spark) => (
                  <motion.div
                    key={spark.id}
                    initial={{ x: spark.left, y: '100vh', opacity: 0 }}
                    animate={{
                      y: ['100vh', '-10vh'],
                      opacity: [0, 0.6, 0.6, 0],
                      scale: [1, 1.5, 0.5],
                    }}
                    transition={{
                      duration: spark.duration,
                      delay: spark.delay,
                      repeat: Infinity,
                      ease: 'easeOut',
                    }}
                    className="absolute rounded-full bg-brand-gold"
                    style={{
                      width: spark.size,
                      height: spark.size,
                      boxShadow: '0 0 10px #D4AF37, 0 0 20px #E65F2B',
                    }}
                  />
                ))}
              </div>
            )}

            {/* Incense smoke waves */}
            {phase !== 'closed' && (
              <div className="absolute bottom-0 inset-x-0 h-40 pointer-events-none flex justify-around items-end">
                {[...Array(4)].map((_, idx) => (
                  <motion.div
                    key={idx}
                    animate={{
                      y: [0, -180],
                      x: [0, (idx - 1.5) * 35],
                      scale: [0.5, 2.5],
                      opacity: [0, 0.35, 0],
                    }}
                    transition={{
                      duration: 3 + idx * 0.5,
                      repeat: Infinity,
                      delay: idx * 0.8,
                    }}
                    className="w-16 h-36 bg-white/5 rounded-full blur-[24px]"
                  />
                ))}
              </div>
            )}

            {/* The Greeting Backdrop (Welcoming Telugu Woman + Rangoli blooming) */}
            <div className="relative flex flex-col items-center justify-center text-center">
              
              {/* Symmetrical blooming Rangoli background */}
              <motion.div
                initial={{ scale: 0.1, rotate: -45, opacity: 0 }}
                animate={phase !== 'closed' ? { scale: 1.0, rotate: 0, opacity: 0.25 } : { scale: 0.1, rotate: -45, opacity: 0 }}
                transition={{ duration: 2.2, ease: 'easeOut' }}
                className="absolute w-[450px] h-[450px] md:w-[650px] md:h-[650px] pointer-events-none z-0"
              >
                <img
                  src="/traditional_rangoli.png"
                  alt="Blooming Rangoli"
                  className="w-full h-full object-contain animate-[spin_40s_linear_infinite]"
                />
              </motion.div>

              {/* Welcoming Telugu Woman portrait */}
              <motion.div
                initial={{ scale: 0.85, opacity: 0, y: 50 }}
                animate={phase !== 'closed' ? { scale: 1, opacity: 1, y: 0 } : { scale: 0.85, opacity: 0, y: 50 }}
                transition={{ duration: 1.5, delay: 0.2, ease: 'easeOut' }}
                className="relative z-10 w-[240px] md:w-[320px] aspect-[3/4] rounded-full overflow-hidden border-4 border-brand-gold/60 shadow-2xl bg-brand-brown/30"
              >
                <img
                  src="/telugu_woman_namaste.png"
                  alt="Traditional Telugu Woman Welcoming"
                  className="w-full h-full object-cover transform scale-105 hover:scale-110 transition-transform duration-700"
                />
                
                {/* Sunrays filter overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-brown/60 via-transparent to-white/10" />
              </motion.div>

              {/* Spoken Greeting Texts */}
              <div className="relative z-20 mt-6 max-w-lg px-6">
                <motion.h2
                  initial={{ opacity: 0, y: 15 }}
                  animate={phase !== 'closed' ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
                  transition={{ delay: 1.0, duration: 0.8 }}
                  className="text-brand-gold font-serif text-3xl md:text-5xl font-bold tracking-wider drop-shadow-md"
                >
                  "Namaste..."
                </motion.h2>
                <motion.h3
                  initial={{ opacity: 0, y: 15 }}
                  animate={phase !== 'closed' ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
                  transition={{ delay: 1.8, duration: 0.8 }}
                  className="text-white font-serif text-xl md:text-2xl mt-1 tracking-widest font-light"
                >
                  Welcome to Vantillu.
                </motion.h3>

                {/* Subtitle */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={phase !== 'closed' ? { opacity: 0.6 } : { opacity: 0 }}
                  transition={{ delay: 2.8, duration: 1.0 }}
                  className="mt-6 text-[10px] uppercase tracking-[0.4em] text-white/70 font-semibold"
                >
                  VANTILLU Multi Cuisine Family Restaurant
                </motion.div>
              </div>
            </div>

            {/* Split door panels opening animation */}
            <div className="absolute inset-0 pointer-events-none flex z-30">
              
              {/* Left Door Panel */}
              <motion.div
                initial={{ transform: 'perspective(1200px) rotateY(0deg)', x: '0%', opacity: 1 }}
                animate={phase !== 'closed' ? { 
                  transform: 'perspective(1200px) rotateY(-110deg)', 
                  x: '-100%', 
                  opacity: 0 
                } : { 
                  transform: 'perspective(1200px) rotateY(0deg)', 
                  x: '0%', 
                  opacity: 1 
                }}
                transition={{ duration: 1.8, ease: 'easeInOut' }}
                className="w-1/2 h-full bg-cover bg-right border-r border-brand-gold/30 origin-left"
                style={{ 
                  backgroundImage: 'url(/telugu_doors_closed.png)',
                  backgroundSize: '200% 100%',
                  backgroundPosition: 'left center'
                }}
              />

              {/* Right Door Panel */}
              <motion.div
                initial={{ transform: 'perspective(1200px) rotateY(0deg)', x: '0%', opacity: 1 }}
                animate={phase !== 'closed' ? { 
                  transform: 'perspective(1200px) rotateY(110deg)', 
                  x: '100%', 
                  opacity: 0 
                } : { 
                  transform: 'perspective(1200px) rotateY(0deg)', 
                  x: '0%', 
                  opacity: 1 
                }}
                transition={{ duration: 1.8, ease: 'easeInOut' }}
                className="w-1/2 h-full bg-cover bg-left border-l border-brand-gold/30 origin-right"
                style={{ 
                  backgroundImage: 'url(/telugu_doors_closed.png)',
                  backgroundSize: '200% 100%',
                  backgroundPosition: 'right center'
                }}
              />
            </div>

            {/* Overlay centered elements inside the closed state (VANTILLU Title and Knock button) */}
            {phase === 'closed' && (
              <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center z-40 p-6 text-center">
                <motion.div
                  initial={{ y: 25, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-4 max-w-md"
                >
                  <p className="text-brand-gold text-xs uppercase tracking-[0.35em] font-serif font-semibold">Welcome to</p>
                  <h1 className="text-white text-5xl md:text-6xl font-serif tracking-[0.25em] font-black leading-none drop-shadow-2xl">
                    VANTILLU
                  </h1>
                  <p className="text-brand-gold/90 text-xs md:text-sm uppercase tracking-[0.25em] font-serif font-medium">
                    Multi Cuisine Family Restaurant
                  </p>
                  <div className="w-16 h-[2px] bg-brand-gold mx-auto" />
                </motion.div>

                {/* Knock button centered */}
                <motion.button
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleKnockClick}
                  className="mt-12 bg-gradient-to-r from-brand-blue to-[#0c2242] border-2 border-brand-gold text-brand-gold hover:text-white py-4 px-10 rounded-full text-xs font-bold uppercase tracking-widest cursor-pointer shadow-[0_10px_25px_rgba(21,59,114,0.4)] transition-all duration-300 active:scale-95"
                >
                  Knock to Enter
                </motion.button>
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
