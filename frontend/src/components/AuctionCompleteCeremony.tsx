import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { Vanguard } from '@/types/auction';
import { Crown, Trophy, Shield, Wallet, Users } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AuctionCompleteCeremonyProps {
  vanguards: Vanguard[];
}

// ━━━ 1. ASSETS & STYLES ━━━
const GlobalStyles = () => (
  <style>{`
        @keyframes shine {
            0% { background-position: 200% center; }
            100% { background-position: -200% center; }
        }
        .text-shine-gold {
            background: linear-gradient(
                to right,
                #FFD700 20%,
                #FBF5B7 40%,
                #B8860B 60%,
                #FBF5B7 80%
            );
            background-size: 200% auto;
            color: #000;
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5));
            animation: shine 3s linear infinite;
        }
        .backface-hidden {
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
        }
    `}</style>
);

// ━━━ 2. INTRO SEQUENCE ━━━
const IntroSequence = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    // AUDIO SYNC
    const audio = new Audio('/party_popup.mp3');
    audio.volume = 1.0;
    audio.play().catch(e => console.log("Audio prevented", e));

    const timer = setTimeout(onComplete, 3500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="absolute inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden"
      exit={{ opacity: 0, scale: 1.5, filter: "blur(40px)" }}
      transition={{ duration: 0.8, ease: "anticipate" }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
        className="relative z-10 p-12"
      >
        <h1 className="text-6xl md:text-[8.5rem] font-black italic tracking-tighter text-center leading-none">
          <span className="block text-white drop-shadow-2xl px-4 py-2">AUCTION</span>
          <span className="block text-shine-gold px-4 py-2">CONCLUDED</span>
        </h1>
      </motion.div>

      {/* Background Energizer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.4, 0] }}
        transition={{ duration: 0.2, repeat: 5, repeatType: "reverse" }}
        className="absolute inset-0 bg-yellow-500/10 mix-blend-overlay"
      />
    </motion.div>
  );
};

// ━━━ 3. UNIFIED VANGUARD CARD ━━━
const VanguardCard = ({ vanguard, index }: { vanguard: Vanguard; index: number }) => {
  const [isHovered, setIsHovered] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [15, -15]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-15, 15]), { stiffness: 150, damping: 20 });

  // Parallax effects
  const iconX = useTransform(x, [-0.5, 0.5], [15, -15]);
  const iconY = useTransform(y, [-0.5, 0.5], [15, -15]);
  const textX = useTransform(x, [-0.5, 0.5], [8, -8]);
  const textY = useTransform(y, [-0.5, 0.5], [8, -8]);

  // Dynamic Sheen
  const sheenX = useTransform(x, [-0.5, 0.5], [-50, 50]);
  const sheenY = useTransform(y, [-0.5, 0.5], [-50, 50]);

  // color map
  const getTheme = (name: string) => {
    switch (name.toUpperCase()) {
      case 'TERRA': return { bg: 'from-[#0a1f0a] to-[#020502]', border: 'border-emerald-500/30', accent: 'text-emerald-400', glow: 'emerald' };
      case 'AQUA': return { bg: 'from-[#05101a] to-[#020305]', border: 'border-cyan-500/30', accent: 'text-cyan-400', glow: 'cyan' };
      case 'IGNIS': return { bg: 'from-[#1f0a0a] to-[#050202]', border: 'border-rose-500/30', accent: 'text-rose-400', glow: 'rose' };
      case 'AERO': return { bg: 'from-[#0f1218] to-[#020205]', border: 'border-sky-300/30', accent: 'text-sky-200', glow: 'sky' };
      default: return { bg: 'from-[#111] to-black', border: 'border-amber-500/30', accent: 'text-amber-400', glow: 'amber' };
    }
  };

  const theme = getTheme(vanguard.name);

  // Get Top 4 Squad Members
  const topSquad = [...vanguard.squad]
    .sort((a, b) => (b.soldPrice || 0) - (a.soldPrice || 0))
    .slice(0, 4);

  return (
    <motion.div
      initial={{ y: 150, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{
        delay: index * 0.1,
        type: "spring",
        mass: 1.2,
        stiffness: 70,
        damping: 12
      }}
      className="perspective-1000 relative z-50 w-full aspect-[4/3] max-w-[420px] mx-auto group/card"
      style={{ perspective: 1200 }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); setIsHovered(false); }}
      onMouseEnter={() => setIsHovered(true)}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        animate={{ rotateY: isHovered ? 180 : 0 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.2 }}
        className="w-full h-full relative cursor-pointer"
      >
        {/* ━━━ FRONT FACE ━━━ */}
        <div className="absolute inset-0 w-full h-full backface-hidden">
          <div className={`w-full h-full relative rounded-[2rem] bg-gradient-to-br ${theme.bg} border ${theme.border} overflow-hidden transition-all duration-500 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.9)] ring-1 ring-white/5 group-hover/card:ring-white/20 group-hover/card:shadow-[0_40px_80px_-20px_rgba(0,0,0,1)]`}>

            {/* 1. Cinematic Background Layers */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05] mix-blend-overlay" />

            {/* 2. Dynamic Spotlight Gradient */}
            <motion.div
              className="absolute inset-0 opacity-40 mix-blend-soft-light pointer-events-none"
              style={{
                background: useTransform(
                  [x, y],
                  ([latestX, latestY]: any) => `radial-gradient(circle at ${50 + latestX * 80}% ${50 + latestY * 80}%, rgba(255,255,255,0.1), transparent 60%)`
                )
              }}
            />

            <div className="relative z-10 h-full flex flex-col items-center justify-between p-6 transform-style-3d">

              {/* Top: Holographic Icon */}
              <motion.div
                style={{ x: iconX, y: iconY, z: 40 }}
                className={`transform-style-3d p-3.5 rounded-full bg-gradient-to-t from-black/50 to-white/5 border ${theme.border} shadow-[0_10px_20px_rgba(0,0,0,0.5)]`}
              >
                <Shield size={34} className={`${theme.accent} drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]`} strokeWidth={1.5} />
              </motion.div>

              {/* Middle: Floating Typography */}
              <motion.div style={{ x: textX, y: textY, z: 20 }} className="text-center space-y-2 transform-style-3d">
                <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/70 tracking-tighter uppercase leading-none drop-shadow-[0_4px_4px_rgba(0,0,0,1)]">
                  {vanguard.name}
                </h2>
                <div className={`inline-block px-4 py-1.5 bg-black/40 rounded-full border ${theme.border} backdrop-blur-md shadow-inner`}>
                  <p className={`text-[10px] font-bold ${theme.accent} uppercase tracking-[0.3em]`}>{vanguard.leader || "Leader"}</p>
                </div>
              </motion.div>

              {/* Bottom: Glass Stats */}
              <div className="w-full grid grid-cols-2 gap-3 pb-1 ">
                <div className={`bg-black/20 rounded-xl p-3 border ${theme.border} backdrop-blur-sm flex flex-col items-center group-hover/card:bg-white/5 transition-colors duration-300`}>
                  <Wallet size={16} className={`${theme.accent} opacity-70 mb-1.5`} />
                  <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest mb-0.5">War Chest</span>
                  <span className="text-xl font-black text-white/90 tracking-tighter tabular-nums text-shadow-sm">
                    {(vanguard.budget - vanguard.spent).toFixed(1)}
                  </span>
                </div>
                <div className={`bg-black/20 rounded-xl p-3 border ${theme.border} backdrop-blur-sm flex flex-col items-center group-hover/card:bg-white/5 transition-colors duration-300`}>
                  <Users size={16} className={`${theme.accent} opacity-70 mb-1.5`} />
                  <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest mb-0.5">Squad</span>
                  <span className="text-xl font-black text-white/90 tracking-tighter tabular-nums text-shadow-sm">
                    {vanguard.squad.length}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Dynamic Glass Sheen */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-20"
              style={{ x: sheenX, y: sheenY }}
            />
          </div>
        </div>

        {/* ━━━ BACK FACE (Obsidian Mirror) ━━━ */}
        <div
          className="absolute inset-0 w-full h-full backface-hidden"
          style={{
            transform: 'rotateY(180deg)',
          }}
        >
          <div className={`w-full h-full relative rounded-[2rem] bg-black shadow-[0_25px_50px_-12px_rgba(0,0,0,1)] border ${theme.border} overflow-hidden text-center ring-1 ring-inset ring-white/5`}>

            {/* Mirror Ambient */}
            <div className={`absolute inset-0 bg-gradient-to-b ${theme.bg} opacity-100`} />
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-white/5 to-transparent opacity-50 block" />

            <div className="relative z-10 h-full flex flex-col p-6">
              <div className={`mb-3 pb-3 border-b ${theme.border} w-full flex items-center justify-center gap-2`}>
                <Trophy size={14} className={theme.accent} strokeWidth={2} />
                <span className={`${theme.accent} text-[10px] font-black uppercase tracking-[0.2em] opacity-80`}>{vanguard.name} ELITE</span>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar mask-gradient-b">
                {topSquad.map((student, i) => (
                  <div key={student.id || i} className="flex items-center justify-between p-2.5 rounded-lg border border-transparent hover:border-white/10 hover:bg-white/5 transition-all group/item">
                    <div className="flex items-center gap-3 text-left overflow-hidden">
                      <div className={`w-5 h-5 rounded flex flex-shrink-0 items-center justify-center font-bold text-[9px] ${i === 0 ? `bg-${theme.glow}-500 text-black shadow-[0_0_10px_rgba(255,255,255,0.5)]` : 'bg-white/10 text-white/40'}`}>
                        {i + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white/80 font-bold text-xs leading-tight truncate group-hover/item:text-white transition-colors">{student.name}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className={`${theme.accent} font-bold text-xs tracking-tight drop-shadow-sm`}>{student.soldPrice} Cr</p>
                    </div>
                  </div>
                ))}
                {topSquad.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center text-white/20 text-xs italic gap-2">
                    <div className="w-8 h-8 rounded-full border border-dashed border-white/20 flex items-center justify-center">?</div>
                    <span>No Data</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </motion.div>
    </motion.div>
  );
};


// ━━━ 4. MAIN STAGE ━━━
export function AuctionCompleteCeremony({ vanguards }: AuctionCompleteCeremonyProps) {
  const [phase, setPhase] = useState<'intro' | 'reveal'>('intro');

  // Transition Handler
  const handleIntroComplete = () => {
    setPhase('reveal');
    // Confetti
    const end = Date.now() + 2000;
    const colors = ['#FFD700', '#FDB931', '#FFFFFF'];
    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: colors
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: colors
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    }());
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-[#020202] font-sans overflow-hidden">
      <GlobalStyles />
      <AnimatePresence>
        {phase === 'intro' && (
          <IntroSequence onComplete={handleIntroComplete} />
        )}
      </AnimatePresence>

      {phase === 'reveal' && (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-8 md:p-12">
          {/* Dynamic Background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#111_0%,black_100%)] pointer-events-none" />

          {/* Grid Layout - 2 Columns, 2 Rows */}
          <div className="relative z-10 w-full max-w-4xl mx-auto h-full max-h-[90vh] grid grid-cols-1 md:grid-cols-2 gap-4 place-content-center items-center">
            {vanguards.map((vanguard, index) => (
              <VanguardCard key={vanguard.id} vanguard={vanguard} index={index} />
            ))}
          </div>

          {/* Cinematic overlay stripes */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,11,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01),rgba(255,255,255,0.03))] z-[60] bg-[length:100%_2px,3px_100%] opacity-20" />
        </div>
      )}
    </div>,
    document.body
  );
}
