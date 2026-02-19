import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Volume2, VolumeX } from 'lucide-react';

/**
 * Landing — Premium Institutional Ceremony Screen
 * 
 * THE BESTEST VERSION — Premium, cinematic, unforgettable.
 */

// ━━━ EASING ━━━
const EASE_REVEAL: [number, number, number, number] = [0.0, 0, 0.2, 1];
const EASE_EXIT: [number, number, number, number] = [0.4, 0, 0.2, 1];
const EASE_SMOOTH: [number, number, number, number] = [0.4, 0, 0.2, 1];

// ━━━ COLORS ━━━
const GOLD = 'rgba(212, 175, 55, 1)';
const GOLD_SUBTLE = 'rgba(212, 175, 55, 0.6)';
const GOLD_GLOW = 'rgba(212, 175, 55, 0.15)';

export default function Landing() {
    const navigate = useNavigate();
    const [isExiting, setIsExiting] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        // Trigger loaded state after mount for staggered entrance
        const timer = setTimeout(() => setIsLoaded(true), 100);

        // Audio Setup
        const audio = new Audio('/kaun_banega_crorepati.mp3');
        audio.loop = false;
        audio.volume = 0.5;
        audioRef.current = audio;

        // Try to play immediately
        const playPromise = audio.play();

        if (playPromise !== undefined) {
            playPromise.catch(() => {
                // Auto-play was prevented
                // Add one-time click listener to start audio
                const handleInteraction = () => {
                    audio.play();
                    document.removeEventListener('click', handleInteraction);
                    document.removeEventListener('keydown', handleInteraction);
                };
                document.addEventListener('click', handleInteraction);
                document.addEventListener('keydown', handleInteraction);
            });
        }

        return () => {
            clearTimeout(timer);
            audio.pause();
            audio.src = '';
        };
    }, []);

    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleStart = () => {
        setIsExiting(true);
        setTimeout(() => navigate('/select-auction'), 1200);
    };

    return (
        <motion.div
            className="min-h-screen bg-[#030308] flex flex-col items-center justify-center relative overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{
                opacity: 1,
                filter: isExiting ? 'blur(16px)' : 'blur(0px)',
            }}
            transition={{
                opacity: { duration: 0.5 },
                filter: { duration: 1, ease: EASE_EXIT }
            }}
        >
            {/* ━━━ CINEMATIC BACKGROUND LAYERS ━━━ */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Layer 1: Deep vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_0%,#030308_100%)]" />

                {/* Layer 2: Animated gold ambient glow */}
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
                    style={{ background: `radial-gradient(circle, ${GOLD_GLOW} 0%, transparent 60%)` }}
                    animate={{
                        scale: isExiting ? 2 : [1, 1.1, 1],
                        opacity: isExiting ? 0 : [0.4, 0.6, 0.4],
                    }}
                    transition={{
                        scale: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
                        opacity: { duration: 6, repeat: Infinity, ease: 'easeInOut' }
                    }}
                />

                {/* Layer 3: Secondary ambient pulse */}
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
                    style={{ background: `radial-gradient(circle, ${GOLD} 0%, transparent 70%)` }}
                    animate={{
                        scale: isExiting ? 0 : [0.8, 1, 0.8],
                        opacity: isExiting ? 0 : [0.02, 0.04, 0.02],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />

                {/* Layer 4: Horizontal scan lines (subtle) */}
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
                    }}
                />

                {/* Layer 5: Noise texture for depth */}
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    }}
                />

                {/* Layer 6: Floating particles — premium depth */}
                {[...Array(12)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full"
                        style={{
                            backgroundColor: GOLD,
                            width: i % 3 === 0 ? 3 : 2,
                            height: i % 3 === 0 ? 3 : 2,
                            left: `${8 + i * 8}%`,
                            top: `${15 + (i % 4) * 20}%`,
                        }}
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: isExiting ? 0 : [0, 0.4, 0],
                            y: isExiting ? 0 : [0, -50, 0],
                            x: isExiting ? 0 : [0, (i % 2 === 0 ? 10 : -10), 0],
                        }}
                        transition={{
                            duration: 5 + i * 0.3,
                            delay: 2 + i * 0.3,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                ))}

                {/* Layer 7: Light rays from center */}
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{
                        width: '200vw',
                        height: '200vh',
                        background: `conic-gradient(from 0deg, transparent, ${GOLD_GLOW}, transparent, transparent, ${GOLD_GLOW}, transparent)`,
                    }}
                    animate={{
                        rotate: isExiting ? 180 : [0, 360],
                        opacity: isExiting ? 0 : 0.3,
                    }}
                    transition={{
                        rotate: { duration: 60, repeat: Infinity, ease: 'linear' },
                        opacity: { duration: 0.6 }
                    }}
                />
            </div>

            {/* ━━━ MAIN CONTENT — CENTERED, VERTICAL STACK ━━━ */}
            <div className="relative z-10 flex flex-col items-center text-center px-6 sm:px-8 max-w-4xl">

                {/* CODINGGITA SEAL — Premium presentation */}
                <motion.div
                    className="mb-8 sm:mb-12"
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{
                        opacity: isExiting ? 0 : isLoaded ? 1 : 0,
                        scale: isExiting ? 0.9 : isLoaded ? 1 : 0.9,
                        y: isExiting ? -20 : isLoaded ? 0 : 20,
                    }}
                    transition={{
                        duration: 1,
                        delay: isExiting ? 0.4 : 0.3,
                        ease: EASE_SMOOTH
                    }}
                >
                    <motion.div
                        className="relative"
                        animate={{
                            filter: `drop-shadow(0 0 ${isExiting ? '0px' : '40px'} ${GOLD_SUBTLE})`,
                        }}
                        transition={{ duration: 0.6 }}
                    >
                        {/* Outer glow ring */}
                        <motion.div
                            className="absolute -inset-8 rounded-full"
                            style={{
                                background: `radial-gradient(circle, ${GOLD_GLOW} 0%, transparent 70%)`,
                            }}
                            animate={{
                                scale: isExiting ? 0 : [1, 1.1, 1],
                                opacity: isExiting ? 0 : [0.5, 0.8, 0.5],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                        />

                        {/* Logo with breathing effect */}
                        <motion.img
                            src="/codinggita-logo.png"
                            alt="CodingGita"
                            className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 object-contain relative z-10"
                            draggable={false}
                            animate={{
                                scale: isExiting ? 1 : [1, 1.03, 1],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                        />

                        {/* Inner ring pulse */}
                        <motion.div
                            className="absolute inset-2 rounded-full border"
                            style={{ borderColor: GOLD_SUBTLE }}
                            initial={{ opacity: 0, scale: 1 }}
                            animate={{
                                opacity: isExiting ? 0 : [0, 0.6, 0],
                                scale: isExiting ? 1 : [1, 1.4, 1.6],
                            }}
                            transition={{
                                duration: 3,
                                delay: 1.5,
                                repeat: Infinity,
                                ease: 'easeOut',
                            }}
                        />

                        {/* Outer ring pulse (delayed) */}
                        <motion.div
                            className="absolute -inset-2 rounded-full border"
                            style={{ borderColor: GOLD_SUBTLE }}
                            initial={{ opacity: 0, scale: 1 }}
                            animate={{
                                opacity: isExiting ? 0 : [0, 0.4, 0],
                                scale: isExiting ? 1 : [1, 1.6, 1.8],
                            }}
                            transition={{
                                duration: 3,
                                delay: 2,
                                repeat: Infinity,
                                ease: 'easeOut',
                            }}
                        />
                    </motion.div>
                </motion.div>

                {/* PRIMARY TITLE — Cinematic reveal */}
                <motion.div
                    className="space-y-3 mb-6"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{
                        opacity: isExiting ? 0 : isLoaded ? 1 : 0,
                        y: isExiting ? -30 : isLoaded ? 0 : 30,
                    }}
                    transition={{
                        duration: 0.8,
                        delay: isExiting ? 0.2 : 0.9,
                        ease: EASE_SMOOTH
                    }}
                >
                    <motion.p
                        className="text-xs sm:text-sm md:text-base font-medium tracking-[0.4em] uppercase flex items-center justify-center gap-3"
                        style={{ color: GOLD_SUBTLE }}
                    >
                        <Sparkles className="w-4 h-4" />
                        Welcome to
                        <Sparkles className="w-4 h-4" />
                    </motion.p>
                    <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[0.9]">
                        <motion.span
                            className="inline-block"
                            animate={{
                                textShadow: isExiting ? 'none' : [
                                    '0 0 20px rgba(255,255,255,0)',
                                    '0 0 30px rgba(255,255,255,0.1)',
                                    '0 0 20px rgba(255,255,255,0)',
                                ],
                            }}
                            transition={{ duration: 4, repeat: Infinity }}
                        >
                            CODINGGITA
                        </motion.span>
                        <br />
                        <motion.span
                            style={{ color: GOLD }}
                            animate={{
                                textShadow: isExiting ? 'none' : [
                                    `0 0 20px ${GOLD_GLOW}`,
                                    `0 0 40px ${GOLD_SUBTLE}`,
                                    `0 0 20px ${GOLD_GLOW}`,
                                ],
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                        >
                            AUCTION
                        </motion.span>
                    </h1>
                </motion.div>

                {/* SUBTITLE — Elegant fade */}
                <motion.p
                    className="text-xs sm:text-sm md:text-base font-medium tracking-[0.3em] uppercase text-white/40 mb-12 sm:mb-16"
                    initial={{ opacity: 0 }}
                    animate={{
                        opacity: isExiting ? 0 : isLoaded ? 1 : 0,
                    }}
                    transition={{
                        duration: 0.5,
                        delay: isExiting ? 0.1 : 1.5,
                        ease: EASE_REVEAL
                    }}
                >
                    The Official Auction Arena
                </motion.p>

                {/* CTA — Premium button with glow */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                        opacity: isExiting ? 0 : isLoaded ? 1 : 0,
                        y: isExiting ? 30 : isLoaded ? 0 : 20,
                    }}
                    transition={{
                        duration: 0.6,
                        delay: isExiting ? 0 : 1.9,
                        ease: EASE_SMOOTH
                    }}
                >
                    <motion.div
                        className="relative"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {/* Button glow effect */}
                        <motion.div
                            className="absolute -inset-1 rounded-sm opacity-0 group-hover:opacity-100"
                            style={{ background: `linear-gradient(90deg, transparent, ${GOLD_GLOW}, transparent)` }}
                            animate={{
                                opacity: [0.3, 0.6, 0.3],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                        <Button
                            onClick={handleStart}
                            disabled={isExiting}
                            className="group relative h-14 sm:h-16 px-8 sm:px-14 rounded-none bg-transparent border-2 text-white font-bold text-base sm:text-lg tracking-[0.2em] uppercase transition-all duration-500 hover:bg-gradient-to-r hover:from-amber-500 hover:to-yellow-500 hover:text-black hover:border-transparent hover:shadow-[0_0_30px_rgba(212,175,55,0.5)]"
                            style={{ borderColor: GOLD }}
                        >
                            <span className="flex items-center gap-3 sm:gap-4">
                                Enter Arena
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                            </span>
                        </Button>
                    </motion.div>
                </motion.div>

                {/* MICROTEXT — Ultra subtle */}
                <motion.p
                    className="mt-12 sm:mt-16 text-[9px] sm:text-[10px] font-medium tracking-[0.5em] uppercase text-white/15"
                    initial={{ opacity: 0 }}
                    animate={{
                        opacity: isExiting ? 0 : isLoaded ? 1 : 0,
                    }}
                    transition={{
                        duration: 0.4,
                        delay: isExiting ? 0 : 2.4,
                    }}
                >
                    Authorized Personnel Only
                </motion.p>
            </div>

            {/* Audio Control */}
            <button
                onClick={toggleMute}
                className="absolute top-6 right-6 z-50 text-white/50 hover:text-white transition-colors p-2"
                title={isMuted ? "Unmute" : "Mute"}
            >
                {isMuted ? <VolumeX className="w-8 h-8" /> : <Volume2 className="w-8 h-8" />}
            </button>

            {/* ━━━ CORNER ACCENTS — Premium framing ━━━ */}
            {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((pos, i) => (
                <motion.div
                    key={pos}
                    className="absolute w-16 sm:w-20 h-16 sm:h-20"
                    style={{
                        [pos.includes('top') ? 'top' : 'bottom']: '1.5rem',
                        [pos.includes('left') ? 'left' : 'right']: '1.5rem',
                        borderTop: pos.includes('top') ? `2px solid ${GOLD_SUBTLE}` : 'none',
                        borderBottom: pos.includes('bottom') ? `2px solid ${GOLD_SUBTLE}` : 'none',
                        borderLeft: pos.includes('left') ? `2px solid ${GOLD_SUBTLE}` : 'none',
                        borderRight: pos.includes('right') ? `2px solid ${GOLD_SUBTLE}` : 'none',
                    }}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{
                        opacity: isExiting ? 0 : isLoaded ? 0.5 : 0,
                        scale: isExiting ? 0.6 : isLoaded ? 1 : 0.6,
                    }}
                    transition={{
                        duration: 0.8,
                        delay: isExiting ? 0 : 2.6 + i * 0.1,
                        ease: EASE_SMOOTH,
                    }}
                />
            ))}

            {/* ━━━ TOP ACCENT LINE ━━━ */}
            <motion.div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${GOLD_SUBTLE}, transparent)` }}
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{
                    opacity: isExiting ? 0 : isLoaded ? 0.4 : 0,
                    scaleX: isExiting ? 0 : isLoaded ? 1 : 0,
                }}
                transition={{
                    duration: 1.5,
                    delay: isExiting ? 0 : 2.8,
                    ease: EASE_REVEAL
                }}
            />

            {/* ━━━ BOTTOM ACCENT LINE ━━━ */}
            <motion.div
                className="absolute bottom-0 left-0 right-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${GOLD_SUBTLE}, transparent)` }}
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{
                    opacity: isExiting ? 0 : isLoaded ? 0.4 : 0,
                    scaleX: isExiting ? 0 : isLoaded ? 1 : 0,
                }}
                transition={{
                    duration: 1.5,
                    delay: isExiting ? 0 : 2.8,
                    ease: EASE_REVEAL
                }}
            />
        </motion.div>
    );
}
