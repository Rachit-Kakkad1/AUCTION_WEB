import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

/**
 * Landing — Institutional Ceremony Screen
 * 
 * PURPOSE: Command silence. Establish authority. Create anticipation.
 * 
 * This is NOT a website landing page.
 * This is a MOMENT before the auction begins.
 * 
 * COMPOSITION:
 * 1. CodingGita Seal (institutional logo)
 * 2. Primary title: WELCOME TO CODINGGITA AUCTION
 * 3. Subtitle: THE OFFICIAL AUCTION ARENA
 * 4. Single action: START AUCTION
 * 5. Microtext: Authorized personnel only
 * 
 * TIMING (Entry Sequence):
 * T+0ms:     Background settles (no content visible)
 * T+300ms:   Logo seal fades in (slow, 800ms)
 * T+1100ms:  Title fades in (600ms)
 * T+1700ms:  Subtitle fades in (400ms)
 * T+2100ms:  CTA appears (500ms)
 * T+2600ms:  Microtext appears (300ms)
 * 
 * EXIT: Preserved from previous implementation
 */

// ━━━ EASING ━━━
const EASE_REVEAL: [number, number, number, number] = [0.0, 0, 0.2, 1];
const EASE_EXIT: [number, number, number, number] = [0.4, 0, 0.2, 1];

// ━━━ COLORS ━━━
const GOLD = 'rgba(212, 175, 55, 1)';
const GOLD_SUBTLE = 'rgba(212, 175, 55, 0.6)';

export default function Landing() {
    const navigate = useNavigate();
    const [isExiting, setIsExiting] = useState(false);

    const handleStart = () => {
        setIsExiting(true);
        setTimeout(() => navigate('/auction'), 1000);
    };

    return (
        <motion.div
            className="min-h-screen bg-[#030308] flex flex-col items-center justify-center relative overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{
                opacity: 1,
                filter: isExiting ? 'blur(12px)' : 'blur(0px)',
            }}
            transition={{
                opacity: { duration: 0.3 },
                filter: { duration: 0.8, ease: EASE_EXIT }
            }}
        >
            {/* ━━━ AMBIENT BACKGROUND ━━━ */}
            {/* Slow, almost invisible movement. Not decorative — atmospheric. */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Deep vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_0%,#030308_100%)]" />

                {/* Subtle gold ambient — institutional warmth */}
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.03]"
                    style={{ background: `radial-gradient(circle, ${GOLD} 0%, transparent 70%)` }}
                    animate={{
                        scale: isExiting ? 1.5 : [1, 1.05, 1],
                        opacity: isExiting ? 0 : 0.03,
                    }}
                    transition={{
                        scale: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
                        opacity: { duration: 0.6 }
                    }}
                />

                {/* Noise texture for depth */}
                <div
                    className="absolute inset-0 opacity-[0.015]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    }}
                />
            </div>

            {/* ━━━ MAIN CONTENT — CENTERED, VERTICAL STACK ━━━ */}
            <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-4xl">

                {/* CODINGGITA SEAL */}
                <motion.div
                    className="mb-12"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{
                        opacity: isExiting ? 0 : 1,
                        scale: isExiting ? 0.96 : 1,
                        filter: isExiting ? 'blur(4px)' : 'blur(0px)',
                    }}
                    transition={{
                        opacity: { duration: 0.8, delay: isExiting ? 0.3 : 0.3 },
                        scale: { duration: 0.8, delay: isExiting ? 0.3 : 0.3, ease: EASE_REVEAL },
                        filter: { duration: 0.6 }
                    }}
                >
                    <motion.div
                        className="relative"
                        animate={{
                            filter: `drop-shadow(0 0 ${isExiting ? '0px' : '30px'} ${GOLD_SUBTLE})`,
                        }}
                        transition={{ duration: 0.6 }}
                    >
                        <img
                            src="/codinggita-logo.png"
                            alt="CodingGita"
                            className="w-32 h-32 md:w-40 md:h-40 object-contain"
                            draggable={false}
                        />
                    </motion.div>
                </motion.div>

                {/* PRIMARY TITLE */}
                <motion.div
                    className="space-y-2 mb-6"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{
                        opacity: isExiting ? 0 : 1,
                        y: isExiting ? -10 : 0,
                    }}
                    transition={{
                        duration: 0.6,
                        delay: isExiting ? 0.15 : 1.1,
                        ease: EASE_REVEAL
                    }}
                >
                    <p
                        className="text-sm md:text-base font-medium tracking-[0.4em] uppercase"
                        style={{ color: GOLD_SUBTLE }}
                    >
                        Welcome to
                    </p>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[0.9]">
                        CODINGGITA
                        <br />
                        <span style={{ color: GOLD }}>AUCTION</span>
                    </h1>
                </motion.div>

                {/* SUBTITLE */}
                <motion.p
                    className="text-sm md:text-base font-medium tracking-[0.3em] uppercase text-white/40 mb-16"
                    initial={{ opacity: 0 }}
                    animate={{
                        opacity: isExiting ? 0 : 1,
                    }}
                    transition={{
                        duration: 0.4,
                        delay: isExiting ? 0.1 : 1.7,
                        ease: EASE_REVEAL
                    }}
                >
                    The Official Auction Arena
                </motion.p>

                {/* CTA — SINGLE, DELIBERATE */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{
                        opacity: isExiting ? 0 : 1,
                        y: isExiting ? 20 : 0,
                    }}
                    transition={{
                        duration: 0.5,
                        delay: isExiting ? 0 : 2.1,
                        ease: EASE_REVEAL
                    }}
                >
                    <Button
                        onClick={handleStart}
                        disabled={isExiting}
                        className="group relative h-16 px-12 rounded-none bg-transparent border-2 text-white font-bold text-lg tracking-[0.2em] uppercase transition-all duration-300 hover:bg-white hover:text-black"
                        style={{ borderColor: GOLD }}
                    >
                        <span className="flex items-center gap-4">
                            Start Auction
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </Button>
                </motion.div>

                {/* MICROTEXT */}
                <motion.p
                    className="mt-16 text-[10px] font-medium tracking-[0.5em] uppercase text-white/20"
                    initial={{ opacity: 0 }}
                    animate={{
                        opacity: isExiting ? 0 : 1,
                    }}
                    transition={{
                        duration: 0.3,
                        delay: isExiting ? 0 : 2.6,
                    }}
                >
                    Authorized Personnel Only
                </motion.p>
            </div>

            {/* ━━━ BOTTOM ACCENT LINE ━━━ */}
            <motion.div
                className="absolute bottom-0 left-0 right-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${GOLD_SUBTLE}, transparent)` }}
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{
                    opacity: isExiting ? 0 : 0.3,
                    scaleX: isExiting ? 0 : 1,
                }}
                transition={{
                    duration: 1.2,
                    delay: isExiting ? 0 : 2.8,
                    ease: EASE_REVEAL
                }}
            />
        </motion.div>
    );
}
