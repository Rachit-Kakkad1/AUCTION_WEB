import { Users, Wallet, ChevronDown, Zap } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Vanguard } from '@/types/auction';
import { ScrollArea } from '@/components/ui/scroll-area';

/**
 * VanguardCard — Command Unit Display
 * 
 * INTERACTION: Single click = expand/collapse. That's it. Simple.
 * 
 * VISUAL PHILOSOPHY:
 * - Heavy, institutional feel
 * - Black + gold authority layer
 * - Team colors as secondary accent only
 * 
 * NO double-click.
 * NO hidden gestures.
 * NO learning curve.
 */

interface VanguardCardProps {
  vanguard: Vanguard;
  recentlyAddedPlayer?: string | null;
  isDeemphasized?: boolean;
}

// ━━━ EASING ━━━
const EASE_AUTHORITY: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

// ━━━ COLORS ━━━
const GOLD = 'rgb(212, 175, 55)';
const GOLD_SUBTLE = 'rgba(212, 175, 55, 0.15)';

export function VanguardCard({
  vanguard,
  recentlyAddedPlayer,
  isDeemphasized = false,
}: VanguardCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReceiptGlow, setShowReceiptGlow] = useState(false);
  const prevSquadLengthRef = useRef(vanguard.squad.length);

  const remaining = vanguard.budget - vanguard.spent;
  const spentPercentage = (vanguard.spent / vanguard.budget) * 100;

  // Detect when a new player is added → show receipt glow
  useEffect(() => {
    if (vanguard.squad.length > prevSquadLengthRef.current) {
      setShowReceiptGlow(true);
      setTimeout(() => setShowReceiptGlow(false), 2000);
    }
    prevSquadLengthRef.current = vanguard.squad.length;
  }, [vanguard.squad.length]);

  const colorConfig: Record<string, { bg: string; text: string; accent: string }> = {
    emerald: {
      bg: 'bg-emerald-500',
      text: 'text-emerald-400',
      accent: 'rgba(34, 197, 94, 0.2)',
    },
    blue: {
      bg: 'bg-blue-500',
      text: 'text-blue-400',
      accent: 'rgba(59, 130, 246, 0.2)',
    },
    amber: {
      bg: 'bg-amber-500',
      text: 'text-amber-400',
      accent: 'rgba(245, 158, 11, 0.2)',
    },
    rose: {
      bg: 'bg-rose-500',
      text: 'text-rose-400',
      accent: 'rgba(244, 63, 94, 0.2)',
    },
  };

  const colors = colorConfig[vanguard.color] || colorConfig.emerald;

  return (
    <motion.div
      className="relative cursor-pointer select-none"
      initial={false}
      animate={{
        opacity: isDeemphasized ? 0.5 : 1,
        scale: isDeemphasized ? 0.98 : 1,
      }}
      transition={{ duration: 0.3, ease: EASE_AUTHORITY }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* ━━━ CARD CONTAINER ━━━ */}
      <motion.div
        className="relative overflow-hidden rounded-xl"
        style={{
          background: 'linear-gradient(180deg, rgba(20, 20, 25, 0.95) 0%, rgba(10, 10, 15, 0.98) 100%)',
          boxShadow: showReceiptGlow
            ? `0 0 40px ${GOLD_SUBTLE}, inset 0 1px 0 rgba(255,255,255,0.05)`
            : isExpanded
              ? `0 20px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)`
              : `0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)`,
        }}
        animate={{
          scale: isExpanded ? 1.01 : 1,
        }}
        transition={{ duration: 0.4, ease: EASE_AUTHORITY }}
      >
        {/* Gold accent line (top) — visible when expanded or receiving player */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: GOLD }}
          initial={false}
          animate={{
            opacity: isExpanded || showReceiptGlow ? 1 : 0,
            scaleX: isExpanded || showReceiptGlow ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: EASE_AUTHORITY }}
        />

        {/* Receipt glow overlay */}
        <AnimatePresence>
          {showReceiptGlow && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse at center, ${GOLD_SUBTLE} 0%, transparent 70%)`,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
          )}
        </AnimatePresence>

        {/* ━━━ HEADER SECTION ━━━ */}
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            {/* Team identity */}
            {/* Team identity */}
            <div className="flex items-center gap-4 flex-1 min-w-0 mr-4">
              <div
                className={`w-11 h-11 rounded-lg ${colors.bg} flex items-center justify-center shrink-0`}
                style={{ boxShadow: `0 0 20px ${colors.accent}` }}
              >
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-white tracking-tight">{vanguard.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-white/40 uppercase tracking-widest truncate block">
                    {vanguard.leader ? `Leader: ${vanguard.leader}` : 'Command Unit'}
                  </span>
                  {showReceiptGlow && (
                    <motion.div
                      className="flex items-center gap-1 shrink-0"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <Zap className="w-3 h-3" style={{ color: GOLD }} />
                      <span className="text-[10px] font-bold uppercase" style={{ color: GOLD }}>
                        Player Acquired
                      </span>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Squad count + expand indicator */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-1.5 justify-end">
                  <Users className="w-3.5 h-3.5 text-white/40" />
                  <span className="text-lg font-black text-white number-display">{vanguard.squad.length}</span>
                </div>
                <span className="text-[9px] font-semibold text-white/30 uppercase tracking-widest">Players</span>
              </div>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3, ease: EASE_AUTHORITY }}
                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"
              >
                <ChevronDown className="w-4 h-4 text-white/50" />
              </motion.div>
            </div>
          </div>

          {/* ━━━ BUDGET DISPLAY ━━━ */}
          <div className="space-y-3">
            <div className="flex items-end justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Wallet className="w-3.5 h-3.5 text-white/40" />
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    Available Budget
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span
                    className="text-3xl font-black number-display leading-none"
                    style={{ color: GOLD }}
                  >
                    {remaining.toFixed(2)}
                  </span>
                  <span className="text-sm font-bold text-white/40 uppercase">cr</span>
                </div>
              </div>
              <div className="text-right pb-1">
                <span className="text-[10px] font-mono text-white/30">
                  {(100 - spentPercentage).toFixed(0)}% remaining
                </span>
              </div>
            </div>

            {/* Progress bar — gold fill */}
            <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="absolute left-0 top-0 h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${GOLD}, rgba(212, 175, 55, 0.7))` }}
                initial={false}
                animate={{ width: `${100 - spentPercentage}%` }}
                transition={{ duration: 0.8, ease: EASE_AUTHORITY }}
              />
            </div>

            <div className="flex justify-between text-[10px] font-semibold text-white/30 uppercase tracking-widest">
              <span>Spent: {vanguard.spent.toFixed(2)} cr</span>
              <span>Limit: {vanguard.budget} cr</span>
            </div>
          </div>
        </div>

        {/* ━━━ SQUAD ROSTER (Collapsible) ━━━ */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE_AUTHORITY }}
              className="overflow-hidden"
            >
              <div
                className="border-t"
                style={{ borderColor: 'rgba(255,255,255,0.05)' }}
              >
                {/* Roster header */}
                <div
                  className="px-5 py-3 flex items-center justify-between"
                  style={{ background: 'rgba(255,255,255,0.02)' }}
                >
                  <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    Squad Roster
                  </h4>
                  <span className="text-[10px] font-mono text-white/25">
                    {vanguard.squad.length} Active
                  </span>
                </div>

                {/* Player list */}
                <ScrollArea className="h-[240px]">
                  <div className="p-4 space-y-2">
                    {vanguard.squad.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                        <Users className="w-8 h-8 text-white/20" />
                        <p className="text-xs font-medium text-white/30 uppercase tracking-wider">
                          Awaiting Draft Picks
                        </p>
                      </div>
                    ) : (
                      vanguard.squad.map((student, index) => {
                        const isRecent = recentlyAddedPlayer === student.id;
                        return (
                          <motion.div
                            key={student.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              delay: index * 0.04,
                              duration: 0.3,
                              ease: EASE_AUTHORITY
                            }}
                            className="relative flex items-center justify-between p-3 rounded-lg transition-colors"
                            style={{
                              background: isRecent ? GOLD_SUBTLE : 'rgba(255,255,255,0.03)',
                              borderLeft: isRecent ? `3px solid ${GOLD}` : '3px solid transparent',
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-black font-mono text-white/20 w-5">
                                {(index + 1).toString().padStart(2, '0')}
                              </span>
                              <div>
                                <p className={`text-sm font-bold ${isRecent ? 'text-[#d4af37]' : 'text-white/90'}`}>
                                  {student.name}
                                </p>
                                <p className="text-[10px] font-mono text-white/30">
                                  {student.grNumber}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`text-sm font-black number-display ${colors.text}`}>
                                {student.soldPrice.toFixed(2)}
                              </span>
                              <span className="text-[10px] font-bold text-white/30 ml-1">cr</span>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
