import { Gavel, User, Hash, ChevronRight, AlertCircle, Play, RotateCcw } from 'lucide-react';
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
}: AuctionStageProps) {
  const [bidAmount, setBidAmount] = useState(BASE_PRICE);
  const [selectedVanguard, setSelectedVanguard] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showSoldOverlay, setShowSoldOverlay] = useState(false);
  const [soldPhase, setSoldPhase] = useState<'lock' | 'declare' | 'release'>('lock');
  const [soldDetails, setSoldDetails] = useState<{ name: string; vanguard: string; price: number; color: string } | null>(null);

  const prevTimeRef = useRef(timeRemaining);
  const hasPlayedHornRef = useRef(false);
  const hasPlayedStartupRef = useRef(false);

  const sirenRef = useRef<HTMLAudioElement | null>(null);
  const tickRef = useRef<HTMLAudioElement | null>(null);
  // SOLD AUDIO REFS — Conditional routing
  const soldDefaultRef = useRef<HTMLAudioElement | null>(null);
  const soldHackerRef = useRef<HTMLAudioElement | null>(null);    // ≥15 crores
  const sold7CroreRef = useRef<HTMLAudioElement | null>(null);    // EXACTLY 7 crores
  const startupKBCRef = useRef<HTMLAudioElement | null>(null);    // Startup (once)

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

    // SOLD sounds (from public folder)
    const soldDefault = new Audio('/kaun_banega_crorepati.mp3');
    soldDefault.volume = 0.8;
    soldDefaultRef.current = soldDefault;

    const soldHacker = new Audio('/hacker_hai_bhai_hacker_hain.mp3');
    soldHacker.volume = 0.9;
    soldHackerRef.current = soldHacker;

    const sold7Crore = new Audio('/7_crore.mp3');
    sold7Crore.volume = 0.9;
    sold7CroreRef.current = sold7Crore;

    // Startup sound — KBC (plays once)
    const startupKBC = new Audio('/kaun_banega_crorepati.mp3');
    startupKBC.volume = 0.8;
    startupKBCRef.current = startupKBC;

    // Play startup sound ONCE when auction system initializes
    if (!hasPlayedStartupRef.current) {
      hasPlayedStartupRef.current = true;
      startupKBC.play().catch(e => console.log('Startup sound failed:', e));
    }
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

    // ━━━ SOLD AUDIO ROUTING ━━━
    // Deterministic selection: EXACTLY one sound per sale
    const playSOLDSound = (price: number) => {
      // Priority 1: EXACTLY 7 crores
      if (price === 7) {
        if (sold7CroreRef.current) {
          sold7CroreRef.current.currentTime = 0;
          sold7CroreRef.current.play().catch(e => console.log('7 Crore sound failed:', e));
        }
        return;
      }
      // Priority 2: ≥15 crores
      if (price >= 15) {
        if (soldHackerRef.current) {
          soldHackerRef.current.currentTime = 0;
          soldHackerRef.current.play().catch(e => console.log('Hacker sound failed:', e));
        }
        return;
      }
      // Default: All other sales
      if (soldDefaultRef.current) {
        soldDefaultRef.current.currentTime = 0;
        soldDefaultRef.current.play().catch(e => console.log('Default sold sound failed:', e));
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
      onStartTimer();
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
                credits
              </span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!currentStudent) {
    return (
      <div className="glass-card-elevated rounded-2xl p-8 text-center animate-scale-in">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
            <Gavel className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-gradient">Auction Complete</h2>
          <p className="text-muted-foreground text-lg">
            All students have been auctioned successfully
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* SOLD OVERLAY — Rendered to document.body via Portal */}
      {typeof document !== 'undefined' && createPortal(soldOverlay, document.body)}

      <div className="glass-card-elevated rounded-2xl overflow-hidden animate-slide-up">
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
        <div className="p-8">
          <div className="grid lg:grid-cols-2 gap-8">
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

              <div className="flex gap-3">
                <div className="glass-card rounded-lg px-4 py-3 flex-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Base Price</p>
                  <p className="text-xl font-bold text-primary number-display">{BASE_PRICE} cr</p>
                </div>
                <div className={`glass-card rounded-lg px-4 py-3 flex-1 border-2 transition-colors ${displayTime <= 5 ? 'border-destructive/50 bg-destructive/10' : 'border-transparent'}`}>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Timer</p>
                  <div className="flex items-center justify-between">
                    <p className={`text-xl font-bold number-display ${displayTime <= 5 ? 'text-destructive animate-pulse' : 'text-foreground'}`}>
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
                  Select Vanguard
                </label>
                <Select value={selectedVanguard} onValueChange={setSelectedVanguard}>
                  <SelectTrigger className="h-14 bg-secondary border-border text-lg">
                    <SelectValue placeholder="Choose winning team..." />
                  </SelectTrigger>
                  <SelectContent>
                    {vanguards.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getVanguardColor(v.color)}`} />
                          <span>{v.name}</span>
                          <span className="text-muted-foreground">
                            ({(v.budget - v.spent).toFixed(2)} cr left)
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Final Price
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(Math.max(0, Number(e.target.value)))}
                      className="w-24 h-10 text-center text-lg font-bold bg-secondary border-border number-display"
                      min={0}
                      step={0.05}
                    />
                    <span className="text-muted-foreground font-medium">cr</span>
                  </div>
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

              <div className="flex gap-3">
                <Button
                  onClick={handleConfirmSale}
                  disabled={!selectedVanguard}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold glow-primary disabled:opacity-50 disabled:glow-none"
                >
                  <Gavel className="w-5 h-5 mr-2" />
                  Confirm Sale
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
