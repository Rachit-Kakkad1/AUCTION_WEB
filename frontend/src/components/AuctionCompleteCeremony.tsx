import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Vanguard } from '@/types/auction';
import { Users, Wallet, Shield, Crown, Trophy, Star, Sparkles, Zap, Award, Target } from 'lucide-react';

/**
 * AuctionCompleteCeremony — ULTIMATE WORLD-CLASS SPECTACULAR FINALE
 * 
 * MAXIMUM ANIMATIONS. EVERY POSSIBLE EFFECT.
 * 
 * EFFECTS INCLUDED:
 * - Aurora + nebula animated backgrounds
 * - Floating sparkles + stars
 * - Firework bursts
 * - Lens flare effects
 * - 3D orbital rings
 * - Animated letter-by-letter title reveal
 * - Champion spotlight with particle explosions
 * - Flying ribbons
 * - Holographic card effects
 * - Animated counters with bounce
 * - Multi-layer confetti
 * - Pulsing seal with rotating stars
 * - Light beam effects
 * - Screen flash
 * - Victory fanfare audio
 */

interface AuctionCompleteCeremonyProps {
  vanguards: Vanguard[];
  onComplete?: () => void;
}

// ━━━ COLORS ━━━
const GOLD = 'rgb(212, 175, 55)';
const GOLD_BRIGHT = 'rgb(255, 215, 0)';
const GOLD_GLOW = 'rgba(212, 175, 55, 0.6)';
const GOLD_INTENSE = 'rgba(255, 215, 0, 0.8)';

// ━━━ EASING ━━━
const EASE_DRAMATIC: [number, number, number, number] = [0.16, 1, 0.3, 1];
const EASE_BOUNCE: [number, number, number, number] = [0.34, 1.56, 0.64, 1];
const EASE_ELASTIC: [number, number, number, number] = [0.68, -0.55, 0.265, 1.55];

// ━━━ TEAM COLORS ━━━
const TEAM_COLORS: Record<string, { bg: string; glow: string; gradient: string; light: string }> = {
  emerald: {
    bg: 'hsl(142, 71%, 45%)',
    glow: 'hsla(142, 71%, 45%, 0.6)',
    gradient: 'linear-gradient(135deg, hsl(142, 71%, 55%), hsl(142, 71%, 35%))',
    light: 'hsl(142, 71%, 70%)',
  },
  blue: {
    bg: 'hsl(217, 91%, 60%)',
    glow: 'hsla(217, 91%, 60%, 0.6)',
    gradient: 'linear-gradient(135deg, hsl(217, 91%, 70%), hsl(217, 91%, 45%))',
    light: 'hsl(217, 91%, 75%)',
  },
  amber: {
    bg: 'hsl(38, 92%, 50%)',
    glow: 'hsla(38, 92%, 50%, 0.6)',
    gradient: 'linear-gradient(135deg, hsl(38, 92%, 60%), hsl(38, 92%, 40%))',
    light: 'hsl(38, 92%, 70%)',
  },
  rose: {
    bg: 'hsl(350, 89%, 60%)',
    glow: 'hsla(350, 89%, 60%, 0.6)',
    gradient: 'linear-gradient(135deg, hsl(350, 89%, 70%), hsl(350, 89%, 45%))',
    light: 'hsl(350, 89%, 75%)',
  },
};

type Phase = 'flash' | 'blackout' | 'aurora' | 'title' | 'champion' | 'fireworks' | 'parade' | 'stats' | 'confetti' | 'seal' | 'finale';

export function AuctionCompleteCeremony({ vanguards, onComplete }: AuctionCompleteCeremonyProps) {
  const [phase, setPhase] = useState<Phase>('flash');
  const [showFireworks, setShowFireworks] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showRibbons, setShowRibbons] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const sortedVanguards = [...vanguards].sort((a, b) => b.spent - a.spent);
  const champion = sortedVanguards[0];

  // ━━━ PHASE TIMELINE ━━━
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    playImpactSound();

    timers.push(setTimeout(() => setPhase('blackout'), 150));
    timers.push(setTimeout(() => setPhase('aurora'), 400));
    timers.push(setTimeout(() => setPhase('title'), 1000));
    timers.push(setTimeout(() => playWhooshSound(), 1000));
    timers.push(setTimeout(() => setPhase('champion'), 3000));
    timers.push(setTimeout(() => playChampionSound(), 3000));
    timers.push(setTimeout(() => {
      setPhase('fireworks');
      setShowFireworks(true);
      playFireworkSounds();
    }, 4500));
    timers.push(setTimeout(() => setPhase('parade'), 6000));
    timers.push(setTimeout(() => setShowRibbons(true), 6500));
    timers.push(setTimeout(() => setPhase('stats'), 7500));
    timers.push(setTimeout(() => {
      setPhase('confetti');
      setShowConfetti(true);
      playVictoryFanfare();
      playPartyAudio();
    }, 9000));
    timers.push(setTimeout(() => setPhase('seal'), 11000));
    timers.push(setTimeout(() => setPhase('finale'), 13000));
    timers.push(setTimeout(() => onComplete?.(), 15000));

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  // ━━━ AUDIO FUNCTIONS ━━━
  const getAudioContext = () => {
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  };

  const playImpactSound = () => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      // Deep impact
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 30;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);

      // White noise burst
      const bufferSize = ctx.sampleRate * 0.1;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      const noise = ctx.createBufferSource();
      const noiseGain = ctx.createGain();
      noise.buffer = buffer;
      noise.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noiseGain.gain.value = 0.15;
      noise.start(now);
    } catch { /* silent */ }
  };

  const playWhooshSound = () => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(2000, now + 0.3);
      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch { /* silent */ }
  };

  const playChampionSound = () => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      [440, 554.37, 659.25].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.1, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.5);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.5);
      });
    } catch { /* silent */ }
  };

  const playFireworkSounds = () => {
    try {
      const ctx = getAudioContext();
      [0, 0.3, 0.6, 1, 1.5].forEach((delay) => {
        setTimeout(() => {
          const now = ctx.currentTime;
          const bufferSize = ctx.sampleRate * 0.2;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
          }
          const source = ctx.createBufferSource();
          const gain = ctx.createGain();
          source.buffer = buffer;
          source.connect(gain);
          gain.connect(ctx.destination);
          gain.gain.value = 0.1;
          source.start(now);
        }, delay * 1000);
      });
    } catch { /* silent */ }
  };

  const playVictoryFanfare = () => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.12, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.12 + 0.6);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.6);
      });
    } catch { /* silent */ }
  };

  const playPartyAudio = () => {
    try {
      const audio = new Audio('/party_popup.mp3');
      audio.volume = 0.8;
      audio.play().catch(e => console.log('Party audio failed:', e));
    } catch { /* silent */ }
  };

  const getTeamColors = (color: string) => TEAM_COLORS[color] || TEAM_COLORS.emerald;

  // ━━━ ANIMATED COUNTER ━━━
  const AnimatedCounter = ({ value, duration = 1.5 }: { value: number; duration?: number }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
      const steps = 80;
      const increment = value / steps;
      let current = 0;
      let step = 0;
      const interval = setInterval(() => {
        step++;
        const eased = 1 - Math.pow(1 - step / steps, 3);
        current = value * eased;
        if (step >= steps) {
          setCount(value);
          clearInterval(interval);
        } else {
          setCount(current);
        }
      }, (duration * 1000) / steps);
      return () => clearInterval(interval);
    }, [value, duration]);
    return <span>{count.toFixed(2)}</span>;
  };

  // ━━━ LETTER BY LETTER ANIMATION ━━━
  const AnimatedTitle = ({ text }: { text: string }) => (
    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          style={{
            display: 'inline-block',
            fontSize: 'clamp(2rem, 8vw, 6rem)',
            fontWeight: 900,
            letterSpacing: '0.05em',
            background: `linear-gradient(135deg, ${GOLD_BRIGHT}, ${GOLD}, #fff, ${GOLD_BRIGHT})`,
            backgroundSize: '300% 300%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
          initial={{ opacity: 0, y: 80, rotateX: -90, scale: 0 }}
          animate={{
            opacity: 1,
            y: 0,
            rotateX: 0,
            scale: 1,
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            opacity: { duration: 0.3, delay: i * 0.05 },
            y: { duration: 0.5, delay: i * 0.05, ease: EASE_BOUNCE },
            rotateX: { duration: 0.5, delay: i * 0.05, ease: EASE_BOUNCE },
            scale: { duration: 0.5, delay: i * 0.05, ease: EASE_BOUNCE },
            backgroundPosition: { duration: 3, repeat: Infinity, ease: 'linear' },
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </div>
  );

  // ━━━ FIREWORKS ━━━
  const Fireworks = () => (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {Array.from({ length: 8 }).map((_, burstIndex) => (
        <div key={burstIndex} style={{ position: 'absolute', left: `${15 + burstIndex * 10}%`, top: `${20 + (burstIndex % 3) * 20}%` }}>
          {Array.from({ length: 20 }).map((_, i) => {
            const angle = (i / 20) * Math.PI * 2;
            const distance = 100 + Math.random() * 150;
            return (
              <motion.div
                key={i}
                style={{
                  position: 'absolute',
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: [GOLD_BRIGHT, GOLD, '#fff', '#ff6b6b', '#4ecdc4', '#45b7d1'][i % 6],
                  boxShadow: `0 0 10px currentColor`,
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: Math.cos(angle) * distance,
                  y: Math.sin(angle) * distance,
                  opacity: [1, 1, 0],
                  scale: [1, 1.5, 0],
                }}
                transition={{
                  duration: 1.2,
                  delay: burstIndex * 0.2,
                  ease: 'easeOut',
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );

  // ━━━ CONFETTI ━━━
  const Confetti = () => (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {Array.from({ length: 150 }).map((_, i) => {
        const colors = [GOLD, GOLD_BRIGHT, '#fff', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96e6a1', '#dda0dd'];
        const size = 8 + Math.random() * 12;
        const isRectangle = i % 3 === 0;
        return (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: isRectangle ? size * 0.4 : size,
              height: size,
              borderRadius: isRectangle ? 2 : '50%',
              backgroundColor: colors[i % colors.length],
              left: `${Math.random() * 100}%`,
              top: -20,
            }}
            animate={{
              y: [0, window.innerHeight + 100],
              x: [(Math.random() - 0.5) * 200, (Math.random() - 0.5) * 400],
              rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1) * 3],
              opacity: [1, 1, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              delay: Math.random() * 1,
              ease: 'linear',
            }}
          />
        );
      })}
    </div>
  );

  // ━━━ RIBBONS ━━━
  const Ribbons = () => (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: 30 + Math.random() * 40,
            height: 400 + Math.random() * 200,
            background: `linear-gradient(180deg, ${[GOLD, '#ff6b6b', '#4ecdc4', '#45b7d1'][i % 4]}, transparent)`,
            left: `${i * 8 + Math.random() * 5}%`,
            top: -500,
            borderRadius: 15,
            opacity: 0.7,
          }}
          animate={{
            y: [0, window.innerHeight + 600],
            rotate: [-10 + Math.random() * 20, 10 - Math.random() * 20],
            x: [0, (Math.random() - 0.5) * 100],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            delay: i * 0.15,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );

  // ━━━ FLOATING SPARKLES ━━━
  const FloatingSparkles = () => (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          style={{ position: 'absolute', left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0], rotate: [0, 180] }}
          transition={{ duration: 2 + Math.random(), delay: i * 0.1, repeat: Infinity, repeatDelay: Math.random() * 2 }}
        >
          <Sparkles style={{ width: 12 + Math.random() * 12, height: 12 + Math.random() * 12, color: GOLD_BRIGHT }} />
        </motion.div>
      ))}
    </div>
  );

  // ━━━ LENS FLARES ━━━
  const LensFlares = () => (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {[
        { x: '20%', y: '30%', size: 200, color: GOLD_GLOW },
        { x: '80%', y: '25%', size: 150, color: 'rgba(147, 51, 234, 0.3)' },
        { x: '50%', y: '10%', size: 300, color: GOLD_INTENSE },
      ].map((flare, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            left: flare.x,
            top: flare.y,
            width: flare.size,
            height: flare.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${flare.color} 0%, transparent 70%)`,
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
        />
      ))}
    </div>
  );

  // ━━━ ORBITAL RINGS ━━━
  const OrbitalRings = () => (
    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
      {[300, 400, 500].map((size, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: '50%',
            border: `2px solid ${GOLD}`,
            opacity: 0.3,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{
            rotate: { duration: 10 + i * 5, repeat: Infinity, ease: 'linear' },
            scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
          }}
        />
      ))}
    </div>
  );

  // ━━━ LIGHT BEAMS ━━━
  const LightBeams = () => (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            bottom: 0,
            left: `${i * 12.5}%`,
            width: 60,
            height: '150%',
            background: `linear-gradient(to top, ${GOLD_GLOW}, transparent 80%)`,
            transformOrigin: 'bottom center',
            opacity: 0.4,
          }}
          animate={{
            rotate: [-15, 15, -15],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );

  const phaseIndex = ['flash', 'blackout', 'aurora', 'title', 'champion', 'fireworks', 'parade', 'stats', 'confetti', 'seal', 'finale'].indexOf(phase);

  const overlay = (
    <AnimatePresence>
      <motion.div
        key="ceremony"
        role="dialog"
        aria-modal="true"
        aria-label="Auction Results"
        style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
      >
        {/* FLASH */}
        <motion.div
          style={{ position: 'absolute', inset: 0, backgroundColor: '#fff' }}
          initial={{ opacity: 1 }}
          animate={{ opacity: phaseIndex >= 1 ? 0 : 1 }}
          transition={{ duration: 0.15 }}
        />

        {/* BLACKOUT */}
        <motion.div
          style={{ position: 'absolute', inset: 0, backgroundColor: '#000' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.95 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        />

        {/* AURORA NEBULA BACKGROUND */}
        {phaseIndex >= 2 && (
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              background: `
                radial-gradient(ellipse 100% 60% at 50% 130%, ${GOLD_GLOW} 0%, transparent 50%),
                radial-gradient(ellipse 80% 50% at 20% 100%, rgba(147, 51, 234, 0.4) 0%, transparent 50%),
                radial-gradient(ellipse 80% 50% at 80% 100%, rgba(59, 130, 246, 0.4) 0%, transparent 50%),
                radial-gradient(ellipse 60% 40% at 50% 0%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)
              `,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* LENS FLARES */}
        {phaseIndex >= 2 && <LensFlares />}

        {/* LIGHT BEAMS */}
        {phaseIndex >= 3 && <LightBeams />}

        {/* ORBITAL RINGS */}
        {phaseIndex >= 3 && <OrbitalRings />}

        {/* FLOATING SPARKLES */}
        {phaseIndex >= 2 && <FloatingSparkles />}

        {/* GOLD BORDER */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            border: `4px solid ${GOLD}`,
            boxShadow: `inset 0 0 150px ${GOLD_GLOW}, 0 0 80px ${GOLD_GLOW}`,
            pointerEvents: 'none',
          }}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: phaseIndex >= 2 ? 1 : 0, scale: 1 }}
          transition={{ duration: 0.8, ease: EASE_DRAMATIC }}
        />

        {/* MAIN CONTENT */}
        <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '1300px', padding: '1.5rem', textAlign: 'center' }}>

          {/* ANIMATED TITLE */}
          {phaseIndex >= 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <AnimatedTitle text="AUCTION CONCLUDED" />
              <motion.div
                style={{ height: 4, background: `linear-gradient(90deg, transparent, ${GOLD}, ${GOLD_BRIGHT}, ${GOLD}, transparent)`, margin: '1rem auto', maxWidth: 600 }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.8, ease: EASE_DRAMATIC }}
              />
            </motion.div>
          )}

          {/* CHAMPION SPOTLIGHT */}
          {phaseIndex >= 4 && champion && (
            <motion.div
              initial={{ opacity: 0, scale: 0, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE_ELASTIC }}
              style={{ marginBottom: '1.5rem', position: 'relative' }}
            >
              {/* Glow ring */}
              <motion.div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${getTeamColors(champion.color).glow} 0%, transparent 70%)`,
                  transform: 'translate(-50%, -50%)',
                }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                <Crown style={{ width: 64, height: 64, color: GOLD_BRIGHT, filter: `drop-shadow(0 0 20px ${GOLD})` }} />
              </motion.div>
              <motion.span
                style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.4em', textTransform: 'uppercase', margin: '0.5rem 0' }}
              >
                👑 CHAMPION SPENDER 👑
              </motion.span>
              <motion.span
                style={{
                  fontSize: 'clamp(1.8rem, 5vw, 3rem)',
                  fontWeight: 900,
                  color: getTeamColors(champion.color).light,
                  textShadow: `0 0 40px ${getTeamColors(champion.color).glow}, 0 0 80px ${getTeamColors(champion.color).glow}`,
                  display: 'block',
                }}
                animate={{
                  textShadow: [
                    `0 0 40px ${getTeamColors(champion.color).glow}`,
                    `0 0 80px ${getTeamColors(champion.color).glow}`,
                    `0 0 40px ${getTeamColors(champion.color).glow}`,
                  ],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {champion.name}
              </motion.span>
              <motion.span
                style={{ fontSize: '1.5rem', fontWeight: 800, color: GOLD_BRIGHT }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, ease: EASE_BOUNCE }}
              >
                {champion.spent.toFixed(2)} CR SPENT
              </motion.span>
            </motion.div>
          )}

          {/* FIREWORKS */}
          {showFireworks && <Fireworks />}

          {/* VANGUARD PARADE */}
          {phaseIndex >= 6 && (
            <motion.div
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', width: '100%' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {sortedVanguards.map((vanguard, index) => {
                const colors = getTeamColors(vanguard.color);
                const isChampion = index === 0;
                return (
                  <motion.div
                    key={vanguard.id}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100, rotateY: 45 }}
                    animate={{ opacity: 1, x: 0, rotateY: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.12, ease: EASE_DRAMATIC }}
                    style={{
                      background: colors.gradient,
                      borderRadius: 20,
                      padding: '1.5rem',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: isChampion
                        ? `0 0 50px ${colors.glow}, 0 15px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.3)`
                        : `0 15px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)`,
                      border: isChampion ? `3px solid ${GOLD}` : `1px solid rgba(255,255,255,0.2)`,
                      transform: isChampion ? 'scale(1.08)' : 'scale(1)',
                    }}
                  >
                    {/* Animated shine */}
                    <motion.div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: '-150%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                        transform: 'skewX(-20deg)',
                      }}
                      animate={{ left: ['−150%', '150%'] }}
                      transition={{ duration: 1.5, delay: index * 0.15 + 0.3, repeat: 2 }}
                    />

                    {/* Champion badge */}
                    {isChampion && (
                      <motion.div
                        style={{ position: 'absolute', top: -15, right: -15 }}
                        animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Trophy style={{ width: 50, height: 50, color: GOLD_BRIGHT, filter: `drop-shadow(0 0 15px ${GOLD})` }} />
                      </motion.div>
                    )}

                    {/* Rank badge */}
                    <motion.div
                      style={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${GOLD}, ${GOLD_BRIGHT})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.9rem',
                        fontWeight: 900,
                        color: '#000',
                        boxShadow: `0 0 15px ${GOLD_GLOW}`,
                      }}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: index * 0.15 + 0.5, ease: EASE_BOUNCE }}
                    >
                      #{index + 1}
                    </motion.div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', marginTop: '0.5rem' }}>
                      <motion.div
                        style={{
                          width: 55,
                          height: 55,
                          borderRadius: 14,
                          backgroundColor: 'rgba(255,255,255,0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
                        }}
                        animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 3, repeat: Infinity, delay: index * 0.2 }}
                      >
                        <Users style={{ width: 30, height: 30, color: '#fff' }} />
                      </motion.div>
                      <div style={{ textAlign: 'left' }}>
                        <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                          {vanguard.name}
                        </h2>
                        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                          {vanguard.leader || 'Vanguard Elite'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 6 }}>
                          <Users style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }} /> Players
                        </div>
                        <motion.div
                          style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.15 + 0.4, ease: EASE_BOUNCE }}
                        >
                          {vanguard.squad.length}
                        </motion.div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 6 }}>
                          <Wallet style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }} /> Spent
                        </div>
                        <motion.div
                          style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
                          initial={{ scale: 0, rotate: 180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.15 + 0.5, ease: EASE_BOUNCE }}
                        >
                          {phaseIndex >= 7 ? <AnimatedCounter value={vanguard.spent} /> : '0.00'}
                          <span style={{ fontSize: '0.9rem', marginLeft: 4, opacity: 0.8 }}>CR</span>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* RIBBONS */}
          {showRibbons && <Ribbons />}

          {/* CONFETTI */}
          {showConfetti && <Confetti />}

          {/* SEAL */}
          {phaseIndex >= 9 && (
            <motion.div
              initial={{ opacity: 0, scale: 0, rotate: -360 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, ease: EASE_ELASTIC }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}
            >
              <motion.div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${GOLD}, ${GOLD_BRIGHT}, ${GOLD})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 0 60px ${GOLD_GLOW}, inset 0 -3px 10px rgba(0,0,0,0.3)`,
                }}
                animate={{
                  boxShadow: [`0 0 60px ${GOLD_GLOW}`, `0 0 100px ${GOLD_INTENSE}`, `0 0 60px ${GOLD_GLOW}`],
                  rotate: [0, 360],
                }}
                transition={{
                  boxShadow: { duration: 2, repeat: Infinity },
                  rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                }}
              >
                <Shield style={{ width: 50, height: 50, color: '#000' }} />
              </motion.div>

              <motion.p
                style={{ fontSize: '1rem', fontWeight: 700, color: GOLD, letterSpacing: '0.25em', textTransform: 'uppercase' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                ✨ Results Finalized & Recorded ✨
              </motion.p>

              <motion.div
                style={{ display: 'flex', gap: '0.75rem' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {Array.from({ length: 7 }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5], rotate: [0, 180, 360] }}
                    transition={{ duration: 1.5, delay: i * 0.1, repeat: Infinity }}
                  >
                    <Star style={{ width: 20, height: 20, color: GOLD_BRIGHT, fill: GOLD_BRIGHT }} />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* FINALE TEXT */}
          {phaseIndex >= 10 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              style={{ marginTop: '1.5rem' }}
            >
              <motion.p
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  background: `linear-gradient(90deg, ${GOLD}, #fff, ${GOLD})`,
                  backgroundSize: '200% 100%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '0.1em',
                }}
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                🎉 CONGRATULATIONS TO ALL VANGUARDS 🎉
              </motion.p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(overlay, document.body) : null;
}
