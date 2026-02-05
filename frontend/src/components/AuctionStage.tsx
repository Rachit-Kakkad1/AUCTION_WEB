import { Gavel, User, Hash, ChevronRight, AlertCircle, Play, RotateCcw, Ban } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
}: AuctionStageProps) {
  const [bidAmount, setBidAmount] = useState(BASE_PRICE);
  const [selectedVanguard, setSelectedVanguard] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showSoldOverlay, setShowSoldOverlay] = useState(false);
  const [soldPhase, setSoldPhase] = useState<'lock' | 'declare' | 'release'>('lock');
  const [soldDetails, setSoldDetails] = useState<{ name: string; vanguard: string; price: number; color: string } | null>(null);

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
            {/* Student Info */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                  <User className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl lg:text-3xl font-bold text-foreground leading-tight">
                    {currentStudent.name}
                  </h2>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Hash className="w-4 h-4" />
                    <span className="font-mono text-sm">{currentStudent.grNumber}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="glass-card rounded-lg px-4 py-3 flex-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Base Price</p>
                  <p className="text-xl font-bold text-primary number-display">{BASE_PRICE} cr</p>
                </div>
                <div className={`glass-card rounded-lg px-4 py-3 flex-1 border-2 transition-colors ${displayTime <= 3
                  ? 'border-destructive bg-destructive/20'
                  : displayTime <= 5
                    ? 'border-destructive/50 bg-destructive/10'
                    : displayTime <= 10
                      ? 'border-amber-500/50 bg-amber-500/10'
                      : 'border-transparent'
                  }`}>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Timer</p>
                  <div className="flex items-center justify-between">
                    <p className={`text-xl font-bold number-display ${displayTime <= 3
                      ? 'text-destructive'
                      : displayTime <= 5
                        ? 'text-destructive animate-pulse-slow'
                        : displayTime <= 10
                          ? 'text-amber-500'
                          : 'text-foreground'
                      }`}>
                      {displayTime}s
                    </p>
                    <div className="flex gap-1">
                      {!isTimerRunning ? (
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onStartTimer}>
                          <Play className="w-3.5 h-3.5" />
                        </Button>
                      ) : (
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onPauseTimer}>
                          <div className="w-2 h-2 bg-foreground rounded-sm" />
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onResetTimer}>
                        <RotateCcw className="w-3.5 h-3.5" />
                      </Button>
                    </div>
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
