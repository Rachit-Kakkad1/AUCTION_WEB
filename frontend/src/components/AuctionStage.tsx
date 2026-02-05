import { Gavel, User, Hash, ChevronRight, AlertCircle, Play, RotateCcw, Ban } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useMotionTemplate, useMotionValue } from 'framer-motion';
import { MouseEvent } from 'react';
import { Student, Vanguard } from '@/types/auction';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AuctionCompleteCeremony } from './AuctionCompleteCeremony';

/**
 * AuctionStage — Main auction control with Ceremonial SOLD Animation
 * 
 * CRITICAL: SOLD overlay uses React Portal to render at document.body level.
 * This ensures NO clipping from parent containers.
 * 
 * SOLD CEREMONY (3 phases):
 * 
 * PHASE 1 — LOCK (0-200ms)
 *   Screen dims, attention captured
 * 
 * PHASE 2 — DECLARATION (200-2800ms)
 *   SOLD announcement, gold accent, student + team + price
 *   The PEAK moment — commands silence
 * 
 * PHASE 3 — RELEASE (2800-3500ms)
 *   Overlay fades, control returns
 */

interface AuctionStageProps {
  currentStudent: Student | null;
  vanguards: Vanguard[];
  onSale: (studentId: string, vanguardId: string, price: number) => void;
  remainingCount: number;
  totalCount: number;
  timeRemaining: number;
  isTimerRunning: boolean;
  onStartTimer: () => void;
  onPauseTimer: () => void;
  onResetTimer: () => void;
  onUnsold: (studentId: string) => void;
  globalFreeze: boolean;
  activeAnnouncement: string | null;
  sfxTrigger: { id: string; timestamp: number } | null;
}

const BASE_PRICE = 0.25;

// ━━━ GOLD COLOR ━━━
const GOLD = 'rgb(212, 175, 55)';

// ━━━ EASING ━━━
const EASE_CEREMONY: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

export function AuctionStage({
  currentStudent,
  vanguards,
  onSale,
  remainingCount,
  totalCount,
  timeRemaining,
  isTimerRunning,
  onStartTimer,
  onPauseTimer,
  onResetTimer,
  onUnsold,
  globalFreeze,
  activeAnnouncement,
  sfxTrigger,
}: AuctionStageProps) {
  const [bidAmount, setBidAmount] = useState(BASE_PRICE);
  const [selectedVanguard, setSelectedVanguard] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showSoldOverlay, setShowSoldOverlay] = useState(false);
  const [soldPhase, setSoldPhase] = useState<'lock' | 'declare' | 'release'>('lock');
  const [soldDetails, setSoldDetails] = useState<{ name: string; vanguard: string; price: number; color: string } | null>(null);

  // Motion values for spotlight
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // UNSOLD ANIMATION STATE
  const [isExitingUnsold, setIsExitingUnsold] = useState(false);

  const handleMarkUnsold = () => {
    if (!currentStudent) return;
    setIsExitingUnsold(true);
    // God-tier safe animation: wait for slide down then trigger data update
    setTimeout(() => {
      onUnsold(currentStudent.id);
      setIsExitingUnsold(false);
      setBidAmount(BASE_PRICE);
      setSelectedVanguard('');
    }, 600);
  };

  const prevTimeRef = useRef(timeRemaining);
  const hasPlayedHornRef = useRef(false);


  const sirenRef = useRef<HTMLAudioElement | null>(null);
  const tickRef = useRef<HTMLAudioElement | null>(null);
  // SOLD AUDIO REFS — Conditional routing (EXCLUSIVE)
  const sold7CroreRef = useRef<HTMLAudioElement | null>(null);    // EXACTLY 7 crores

  const audioCtxRef = useRef<AudioContext | null>(null);          // Web Audio for default SOLD

  // Preload ALL audio on mount
  useEffect(() => {
    // Timer horn
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2857/2857-preview.mp3');
    audio.volume = 1.0;
    sirenRef.current = audio;

    // Timer tick
    const tick = new Audio('https://assets.mixkit.co/active_storage/sfx/2590/2590-preview.mp3');
    tick.volume = 0.4;
    tickRef.current = tick;

    // 7 Crore special sound (from public folder)

    const sold7Crore = new Audio('/7_crore.mp3');
    sold7Crore.volume = 0.9;
    sold7CroreRef.current = sold7Crore;


  }, []);

  // ━━━ SFX REACTOR ━━━
  useEffect(() => {
    if (!sfxTrigger) return;

    // SFX Dictionary
    const sounds: Record<string, string> = {
      gavel: 'https://assets.mixkit.co/active_storage/sfx/2996/2996-preview.mp3',
      applause: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
      ticking: 'https://assets.mixkit.co/active_storage/sfx/2590/2590-preview.mp3',
      horn: 'https://assets.mixkit.co/active_storage/sfx/2857/2857-preview.mp3',
      sold: 'https://assets.mixkit.co/active_storage/sfx/2414/2414-preview.mp3' // Cash register/ding
    };

    const url = sounds[sfxTrigger.id];
    if (url) {
      const audio = new Audio(url);
      audio.volume = 1.0;
      audio.play().catch(e => console.error("SFX Play failed", e));
    }
  }, [sfxTrigger]);

  useEffect(() => {
    const prev = prevTimeRef.current;
    const curr = Math.ceil(timeRemaining);
    prevTimeRef.current = curr;

    if (!isTimerRunning) {
      hasPlayedHornRef.current = false;
      return;
    }

    if (curr <= 5 && curr > 0 && curr < prev && tickRef.current) {
      tickRef.current.currentTime = 0;
      tickRef.current.play().catch(e => console.log('Tick failed:', e));
    }

    if (curr === 0 && prev > 0 && !hasPlayedHornRef.current) {
      hasPlayedHornRef.current = true;
      const playHornTwice = async () => {
        if (sirenRef.current) {
          try {
            await sirenRef.current.play();
            setTimeout(() => {
              if (sirenRef.current) {
                sirenRef.current.currentTime = 0;
                sirenRef.current.play().catch(e => console.log('Second horn failed:', e));
              }
            }, 300);
          } catch (err) {
            console.log('Audio play failed:', err);
          }
        }
      };
      playHornTwice();
    }
  }, [timeRemaining, isTimerRunning]);

  useEffect(() => {
    if (timeRemaining > 5) {
      hasPlayedHornRef.current = false;
    }
  }, [timeRemaining]);

  const selectedTeam = vanguards.find((v) => v.id === selectedVanguard);

  const handleConfirmSale = () => {
    if (!currentStudent || !selectedVanguard) {
      setError('Please select a Vanguard');
      return;
    }

    const remaining = (selectedTeam?.budget || 0) - (selectedTeam?.spent || 0);
    if (bidAmount > remaining) {
      setError(`${selectedTeam?.name} has insufficient budget (${remaining.toFixed(2)} cr remaining)`);
      return;
    }

    setError('');

    const details = {
      name: currentStudent.name,
      vanguard: selectedTeam?.name || '',
      price: bidAmount,
      color: selectedTeam?.color || 'primary'
    };

    setSoldDetails(details);
    setSoldPhase('lock');
    setShowSoldOverlay(true);

    // ━━━ SOLD AUDIO ROUTING (EXCLUSIVE — ONE SOUND PER EVENT) ━━━
    const playDefaultSOLDSound = () => {
      // Programmatic gavel tone via Web Audio API
      try {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioContext();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 440; // Authoritative A4
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      } catch (e) {
        console.log('Default SOLD sound failed:', e);
      }
    };

    const playSOLDSound = (price: number) => {
      // EXCLUSIVE ROUTING: Exactly one sound per SOLD event
      if (price === 7) {
        // Special Sound: EXACTLY 7 crores
        if (sold7CroreRef.current) {
          sold7CroreRef.current.currentTime = 0;
          sold7CroreRef.current.play().catch(e => console.log('7 Crore sound failed:', e));
        }
      } else {
        // Default SOLD sound for ALL other amounts
        playDefaultSOLDSound();
      }
    };

    playSOLDSound(bidAmount);

    // Minimal, restrained confetti — single burst, gold palette
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#d4af37', '#ffffff', '#c0c0c0'],
      ticks: 120,
      gravity: 1.4,
      scalar: 0.8,
      zIndex: 9999,
    });

    // PHASE TIMELINE:
    // T+0ms:    LOCK phase (dim)
    // T+200ms:  DECLARE phase (announcement)
    // T+2800ms: RELEASE phase (fade)
    // T+3500ms: Overlay dismissed

    setTimeout(() => setSoldPhase('declare'), 200);
    setTimeout(() => setSoldPhase('release'), 2800);

    onSale(currentStudent.id, selectedVanguard, bidAmount);
    setBidAmount(BASE_PRICE);
    setSelectedVanguard('');

    setTimeout(() => {
      setShowSoldOverlay(false);
      setSoldDetails(null);
      // Removed onStartTimer() to allow for manual timer start for the next student
    }, 3500);
  };

  const getVanguardColor = (color: string) => {
    const colors: Record<string, string> = {
      emerald: 'bg-vanguard-emerald',
      blue: 'bg-vanguard-blue',
      amber: 'bg-vanguard-amber',
      rose: 'bg-vanguard-rose',
    };
    return colors[color] || 'bg-primary';
  };

  const getVanguardTextColor = (color: string) => {
    const colors: Record<string, string> = {
      emerald: 'text-vanguard-emerald',
      blue: 'text-vanguard-blue',
      amber: 'text-vanguard-amber',
      rose: 'text-vanguard-rose',
    };
    return colors[color] || 'text-primary';
  };

  const displayTime = Math.ceil(timeRemaining);

  // ━━━ SOLD OVERLAY (Rendered via Portal to document.body) ━━━
  const soldOverlay = (
    <AnimatePresence>
      {showSoldOverlay && soldDetails && (
        <motion.div
          key="sold-ceremony"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            // NO border, NO rounded corners, NO card styling
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE_CEREMONY }}
        >
          {/* PHASE 1: LOCK — Full viewport dim */}
          <motion.div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#000',
              // NO border
            }}
            initial={{ opacity: 0 }}
            animate={{
              opacity: soldPhase === 'release' ? 0 : 0.9,
            }}
            transition={{
              duration: soldPhase === 'lock' ? 0.2 : 0.4,
              ease: EASE_CEREMONY
            }}
          />

          {/* Subtle gold vignette — NO border */}
          <motion.div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `radial-gradient(ellipse 80% 60% at 50% 50%, rgba(212, 175, 55, 0.08) 0%, transparent 70%)`,
              pointerEvents: 'none',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: soldPhase === 'declare' ? 1 : 0 }}
            transition={{ duration: 0.5, ease: EASE_CEREMONY }}
          />

          {/* PHASE 2: DECLARATION — Typography dominance */}
          <motion.div
            style={{
              position: 'relative',
              zIndex: 10,
              textAlign: 'center',
              padding: '0 2rem',
              // NO border, NO background, NO card
            }}
            initial={{ opacity: 0, scale: 0.97, filter: 'blur(8px)' }}
            animate={{
              opacity: soldPhase === 'release' ? 0 : (soldPhase === 'declare' ? 1 : 0),
              scale: soldPhase === 'declare' ? 1 : 0.97,
              filter: soldPhase === 'declare' ? 'blur(0px)' : 'blur(8px)',
            }}
            transition={{
              duration: 0.5,
              ease: EASE_CEREMONY,
            }}
          >
            {/* SOLD — Pure typography, no box */}
            <motion.h2
              style={{
                fontSize: 'clamp(4rem, 12vw, 10rem)',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                color: GOLD,
                textShadow: `0 0 80px rgba(212, 175, 55, 0.5), 0 0 40px rgba(212, 175, 55, 0.3)`,
                marginBottom: '2rem',
                lineHeight: 1,
                // NO border, NO background
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: soldPhase === 'declare' ? 1 : 0,
                y: soldPhase === 'declare' ? 0 : 20,
              }}
              transition={{ duration: 0.4, delay: 0.1, ease: EASE_CEREMONY }}
            >
              SOLD
            </motion.h2>

            {/* Student Name */}
            <motion.p
              style={{
                fontSize: 'clamp(1.25rem, 3vw, 2rem)',
                fontWeight: 700,
                color: 'rgba(255, 255, 255, 0.85)',
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                marginBottom: '1.5rem',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: soldPhase === 'declare' ? 1 : 0 }}
              transition={{ duration: 0.4, delay: 0.15, ease: EASE_CEREMONY }}
            >
              {soldDetails.name}
            </motion.p>

            {/* Divider */}
            <motion.div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1.5rem',
                marginBottom: '1.5rem',
              }}
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{
                opacity: soldPhase === 'declare' ? 1 : 0,
                scaleX: soldPhase === 'declare' ? 1 : 0,
              }}
              transition={{ duration: 0.4, delay: 0.2, ease: EASE_CEREMONY }}
            >
              <span style={{ height: '1px', width: '60px', background: 'rgba(255,255,255,0.2)' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
                to
              </span>
              <span style={{ height: '1px', width: '60px', background: 'rgba(255,255,255,0.2)' }} />
            </motion.div>

            {/* Winning Team */}
            <motion.p
              className={getVanguardTextColor(soldDetails.color)}
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontWeight: 900,
                textShadow: '0 0 40px currentColor',
                marginBottom: '2rem',
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: soldPhase === 'declare' ? 1 : 0,
                y: soldPhase === 'declare' ? 0 : 10,
              }}
              transition={{ duration: 0.4, delay: 0.25, ease: EASE_CEREMONY }}
            >
              {soldDetails.vanguard}
            </motion.p>

            {/* Final Price */}
            <motion.div
              style={{
                display: 'inline-flex',
                alignItems: 'baseline',
                gap: '0.5rem',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: soldPhase === 'declare' ? 1 : 0 }}
              transition={{ duration: 0.4, delay: 0.3, ease: EASE_CEREMONY }}
            >
              <span
                style={{
                  fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                  fontWeight: 900,
                  fontFamily: 'monospace',
                  color: GOLD,
                }}
              >
                {soldDetails.price.toFixed(2)}
              </span>
              <span style={{ fontSize: '1.5rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                CRORES
              </span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!currentStudent) {
    // ━━━ AUCTION COMPLETE CHECK ━━━
    // If we are currently showing a SOLD overlay (even for the last student),
    // we MUST wait for it to finish before showing the Ceremony.
    if (showSoldOverlay) {
      return (
        <>
          {typeof document !== 'undefined' && createPortal(soldOverlay, document.body)}
        </>
      );
    }
    // Otherwise, show completion ceremony
    return <AuctionCompleteCeremony vanguards={vanguards} />;
  }

  return (
    <>
      {/* SOLD OVERLAY — Rendered to document.body via Portal */}
      {typeof document !== 'undefined' && createPortal(soldOverlay, document.body)}

      {typeof document !== 'undefined' && createPortal(soldOverlay, document.body)}

      {/* ANNOUNCEMENT OVERLAY */}
      <AnimatePresence>
        {activeAnnouncement && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[5000] max-w-4xl w-full px-6 pointer-events-none"
          >
            <div className="bg-primary/90 text-primary-foreground backdrop-blur-md shadow-2xl rounded-2xl p-6 border-4 border-white/20 flex items-center gap-6">
              <div className="bg-white/20 p-4 rounded-full animate-pulse">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-widest opacity-80 mb-1">Attention</h3>
                <p className="text-4xl font-black uppercase tracking-tight leading-none drop-shadow-lg">
                  {activeAnnouncement}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GLOBAL FREEZE OVERLAY */}
      <AnimatePresence>
        {globalFreeze && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[6000] bg-black/50 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="bg-destructive text-destructive-foreground p-12 rounded-3xl shadow-2xl text-center border-8 border-white/10 animate-pulse">
              <AlertCircle className="w-24 h-24 mx-auto mb-6" />
              <h1 className="text-8xl font-black uppercase tracking-tighter mb-4">FROZEN</h1>
              <p className="text-2xl font-bold uppercase tracking-widest opacity-80">Auction Paused by Controller</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="glass-card-elevated rounded-2xl overflow-hidden animate-slide-up transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
        style={{
          transform: isExitingUnsold ? 'translateY(40px) scale(0.96)' : 'translateY(0) scale(1)',
          opacity: isExitingUnsold ? 0.6 : 1,
          filter: isExitingUnsold ? 'grayscale(100%)' : 'none',
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/20 to-transparent px-6 py-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse-glow" />
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Live Auction
              </span>
            </div>
            <div className="text-sm font-medium text-muted-foreground">
              <span className="text-primary font-bold">{totalCount - remainingCount + 1}</span>
              <span className="mx-1">/</span>
              <span>{totalCount}</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Student Info — Premium Layout */}
            <div className="flex flex-col md:flex-row gap-8 items-stretch">
              {/* ULTRA PREMIUM IMAGE — Left Side */}
              <div
                className="shrink-0 w-full md:w-64 lg:w-72 relative group perspective-1000"
                onMouseMove={(e: MouseEvent<HTMLDivElement>) => {
                  const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
                  mouseX.set(e.clientX - left);
                  mouseY.set(e.clientY - top);
                }}
              >
                <div className="absolute -inset-1 bg-gradient-to-b from-primary/50 to-transparent rounded-2xl blur-md opacity-40 group-hover:opacity-75 transition-opacity duration-700" />
                <motion.div
                  className="relative aspect-[3/4] rounded-xl bg-black/40 flex items-center justify-center overflow-hidden border border-white/10 shadow-2xl ring-1 ring-white/5"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={currentStudent.id}
                  transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                >
                  {currentStudent.image_url ? (
                    <img
                      src={currentStudent.image_url}
                      alt={currentStudent.name}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 will-change-transform"
                    />
                  ) : (
                    <User className="w-20 h-20 text-white/20" />
                  )}
                  {/* Premium Gloss Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent" />

                  {/* Spotlight Effect */}
                  <motion.div
                    className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
                    style={{
                      background: useMotionTemplate`
                        radial-gradient(
                          650px circle at ${mouseX}px ${mouseY}px,
                          rgba(255,255,255,0.15),
                          transparent 80%
                        )
                      `,
                    }}
                  />
                </motion.div>
              </div>

              {/* Right Side: Identity + Stats + Context */}
              <div className="flex flex-col flex-1 min-w-0 py-2">
                {/* Identity Section */}
                {/* Identity Section */}
                <div className="relative space-y-2 mb-8">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/70 leading-[0.95] uppercase tracking-tighter drop-shadow-lg break-words hyphens-auto pr-4">
                    {currentStudent.name}
                  </h2>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-primary/90">
                      <Hash className="w-4 h-4" />
                      <span className="font-mono text-base font-bold tracking-widest">{currentStudent.grNumber}</span>
                    </div>
                  </div>
                </div>

                {/* Stats Dashboard */}
                <div className="grid grid-cols-2 gap-4 mt-auto">
                  {/* Price Card */}
                  <div className="relative group overflow-hidden rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 p-5 transition-colors hover:border-primary/30 hover:bg-white/10">
                    <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                      <div className="w-8 h-8 rounded-full bg-primary blur-xl" />
                    </div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mb-2">Base Price</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-primary number-display tracking-tight">{BASE_PRICE}</span>
                      <span className="text-sm font-bold text-foreground/60 uppercase">cr</span>
                    </div>
                  </div>

                  {/* Timer Card - Reactive */}
                  <div className={`relative overflow-hidden rounded-xl border transition-all duration-500 p-5 group ${displayTime <= 3
                    ? 'bg-destructive/10 border-destructive/50 shadow-[0_0_30px_rgba(239,68,68,0.15)]'
                    : displayTime <= 10
                      ? 'bg-amber-500/5 border-amber-500/30'
                      : 'bg-gradient-to-br from-white/5 to-transparent border-white/5'
                    }`}>
                    <div className="flex justify-between items-start mb-2">
                      <p className={`text-xs font-bold uppercase tracking-[0.2em] transition-colors ${displayTime <= 10 ? 'text-foreground' : 'text-muted-foreground'}`}>
                        Time Remaining
                      </p>
                      {/* Integrated Controls */}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-3 right-3 bg-black/50 rounded-lg p-1 backdrop-blur-sm">
                        {!isTimerRunning ? (
                          <Button size="icon" variant="ghost" className="h-6 w-6 hover:text-primary hover:bg-white/10" onClick={(e) => { e.stopPropagation(); onStartTimer(); }}>
                            <Play className="w-3 h-3 fill-current" />
                          </Button>
                        ) : (
                          <Button size="icon" variant="ghost" className="h-6 w-6 hover:text-primary hover:bg-white/10" onClick={(e) => { e.stopPropagation(); onPauseTimer(); }}>
                            <div className="w-2 h-2 bg-current rounded-[1px]" />
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" className="h-6 w-6 hover:text-primary hover:bg-white/10" onClick={(e) => { e.stopPropagation(); onResetTimer(); }}>
                          <RotateCcw className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="relative z-10">
                      <p className={`text-4xl font-black number-display tracking-tight leading-none ${displayTime <= 3
                        ? 'text-destructive drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                        : displayTime <= 5
                          ? 'text-destructive animate-pulse-slow'
                          : displayTime <= 10
                            ? 'text-amber-500'
                            : 'text-foreground'
                        }`}>
                        {displayTime}<span className="text-lg font-bold text-foreground/40 ml-1">s</span>
                      </p>
                    </div>

                    {/* Timer Bar Progress Background */}
                    <div
                      className={`absolute bottom-0 left-0 h-1 transition-all duration-1000 ease-linear ${displayTime <= 10 ? 'bg-current opacity-100' : 'bg-primary opacity-50'}`}
                      style={{
                        width: `${(displayTime / 15) * 100}%`,
                        color: displayTime <= 3 ? '#ef4444' : displayTime <= 10 ? '#f59e0b' : ''
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bid Controls */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  WINNING HOUSE
                </label>
                <Select value={selectedVanguard} onValueChange={setSelectedVanguard}>
                  <SelectTrigger className="h-14 bg-secondary border-border text-lg">
                    <SelectValue placeholder="DECLARE THE HOUSE" />
                  </SelectTrigger>
                  <SelectContent>
                    {vanguards.map((v) => {
                      const remaining = v.budget - v.spent;
                      const insufficientFunds = remaining < bidAmount;
                      return (
                        <SelectItem
                          key={v.id}
                          value={v.id}
                          disabled={insufficientFunds}
                          className={insufficientFunds ? 'opacity-50' : ''}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-6 rounded flex items-center justify-center text-[10px] font-black border border-white/10 shadow-sm ${getVanguardColor(v.color)} text-white tracking-widest bg-opacity-90`}>
                              {v.name.substring(0, 2).toUpperCase()}
                            </div>
                            <span>{v.name}</span>
                            {insufficientFunds ? (
                              <span className="text-destructive font-bold text-xs">
                                INSUFFICIENT FUNDS
                              </span>
                            ) : (
                              <span className="text-muted-foreground">
                                ({remaining.toFixed(2)} cr left)
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    WINNING BID
                  </label>
                </div>
                {/* BID VISUAL DOMINANCE — Largest element in controls */}
                <div className="flex items-center justify-center gap-3 py-4">
                  <Input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(Math.max(0, Number(e.target.value)))}
                    className="w-28 h-12 text-center text-2xl font-black bg-secondary border-2 border-primary/50 number-display text-primary"
                    min={0}
                    step={0.05}
                    style={{ textShadow: '0 0 20px hsl(43 74% 49% / 0.3)' }}
                  />
                  <span className="text-xl font-bold text-foreground uppercase">CRORES</span>
                </div>
                <Slider
                  value={[bidAmount]}
                  onValueChange={([value]) => setBidAmount(value)}
                  min={0}
                  max={100}
                  step={0.05}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{BASE_PRICE} cr (Base)</span>
                  <span>Max: 100 cr</span>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleConfirmSale}
                  disabled={!selectedVanguard || (selectedTeam && bidAmount > (selectedTeam.budget - selectedTeam.spent))}
                  className="flex-[2] h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg uppercase tracking-wider glow-primary disabled:opacity-50 disabled:glow-none"
                >
                  <Gavel className="w-6 h-6 mr-2" />
                  DECLARE SOLD
                </Button>

                <Button
                  variant="outline"
                  onClick={handleMarkUnsold}
                  className="flex-1 h-14 border-white/10 text-white/60 hover:text-white hover:bg-white/5 hover:border-white/20 uppercase tracking-widest font-bold transition-all leading-none flex items-center justify-center"
                >
                  <Ban className="w-5 h-5 mr-2" />
                  MARK UNSOLD
                </Button>
              </div>
              {/* Budget safety warning */}
              {selectedTeam && bidAmount > (selectedTeam.budget - selectedTeam.spent) && (
                <div className="flex items-center gap-2 text-destructive text-sm font-bold">
                  <AlertCircle className="w-4 h-4" />
                  <span>INSUFFICIENT FUNDS — {selectedTeam.name} has only {(selectedTeam.budget - selectedTeam.spent).toFixed(2)} CR remaining</span>
                </div>
              )}


            </div>
          </div>
        </div>
      </div>
    </>
  );
}
