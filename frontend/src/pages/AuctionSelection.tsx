import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Trophy, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

// ━━━ CONSTANTS ━━━
const GOLD = 'rgba(212, 175, 55, 1)';
const GOLD_GLOW = 'rgba(212, 175, 55, 0.5)';
const CRICKET_BLUE = 'rgba(56, 189, 248, 1)';

const SelectionCard = ({ 
    title, 
    subtitle, 
    icon: Icon, 
    isLocked, 
    onClick, 
    color,
    delay 
}: { 
    title: string; 
    subtitle: string; 
    icon: any; 
    isLocked?: boolean; 
    onClick?: () => void; 
    color: string;
    delay: number;
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay, ease: [0.2, 0.65, 0.3, 0.9] }}
            whileHover={!isLocked ? { scale: 1.05, y: -10 } : { scale: 0.98 }}
            className={`relative group cursor-${isLocked ? 'not-allowed' : 'pointer'} w-full md:w-[400px] h-[500px]`}
            onClick={!isLocked ? onClick : undefined}
        >
            {/* Glowing Backdrop */}
            <div 
                className={`absolute inset-0 bg-gradient-to-b ${isLocked ? 'from-gray-800 to-gray-900' : `from-${color}/20 to-black`} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}
                style={{ background: !isLocked ? `radial-gradient(circle at center, ${color} 0%, transparent 70%)` : '' }}
            />

            {/* Main Card Content */}
            <div className={`relative h-full bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center overflow-hidden transition-all duration-500 ${!isLocked ? 'group-hover:border-white/30 group-hover:bg-black/60' : 'opacity-60 grayscale'}`}>
                
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

                {/* Icon Circle */}
                <motion.div 
                    className="relative w-32 h-32 rounded-full border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500"
                    style={{ borderColor: isLocked ? 'rgba(255,255,255,0.1)' : color }}
                >
                    <div className="absolute inset-0 rounded-full opacity-20 blur-md" style={{ backgroundColor: color }} />
                    <Icon className="w-12 h-12 text-white relative z-10" />
                    
                    {/* Orbiting particles */}
                    {!isLocked && (
                        <motion.div 
                            className="absolute inset-0 rounded-full border border-dashed border-white/20"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        />
                    )}
                </motion.div>

                {/* Text Content */}
                <h3 className="text-3xl font-bold text-white mb-2 tracking-wider uppercase text-center">{title}</h3>
                <p className="text-white/50 text-sm tracking-widest uppercase text-center mb-8">{subtitle}</p>

                {/* Action Indicator */}
                {isLocked ? (
                    <div className="flex items-center gap-2 text-white/30 text-xs tracking-[0.2em] uppercase border border-white/10 px-4 py-2 rounded-full">
                        <Lock className="w-3 h-3" /> Coming Soon
                    </div>
                ) : (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-3 bg-white/5 border border-white/20 text-white text-sm tracking-[0.2em] uppercase rounded-none hover:bg-white/10 transition-colors"
                        style={{ borderColor: color, boxShadow: `0 0 20px ${color}20` }}
                    >
                        Enter Arena
                    </motion.button>
                )}
            </div>
        </motion.div>
    );
};

export default function AuctionSelection() {
    const navigate = useNavigate();
    const [isExiting, setIsExiting] = useState(false);

    const handleNavigation = (path: string) => {
        setIsExiting(true);
        setTimeout(() => navigate(path), 1000); // Wait for exit animation
    };

    return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden p-4">
            
            {/* ━━━ BACKGROUND ELEMENTS ━━━ */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,20,30,1)_0%,#000_100%)]" />
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-[0.03]" />
                
                {/* Animated Light Beams */}
                <motion.div 
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vw] h-[200vh] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(255,255,255,0.03)_20deg,transparent_40deg)]"
                />
            </div>

            {/* ━━━ CONTENT LAYER ━━━ */}
            <AnimatePresence>
                {!isExiting && (
                    <motion.div 
                        className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center"
                        exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                        transition={{ duration: 0.8 }}
                    >
                        {/* Header */}
                        <motion.div 
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="text-center mb-16"
                        >
                            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4">
                                CHOOSE YOUR <span style={{ color: GOLD }}>ARENA</span>
                            </h1>
                            <div className="h-1 w-24 bg-white/20 mx-auto rounded-full overflow-hidden">
                                <motion.div 
                                    className="h-full bg-white"
                                    initial={{ x: "-100%" }}
                                    animate={{ x: "100%" }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                />
                            </div>
                        </motion.div>

                        {/* Cards Container */}
                        <div className="flex flex-col md:flex-row gap-8 items-center justify-center w-full perspective-1000">
                            
                            {/* Vanguard Auction (Active) */}
                            <SelectionCard 
                                title="Vanguard"
                                subtitle="Institutional Ceremony"
                                icon={Trophy}
                                color={GOLD}
                                delay={0.2}
                                onClick={() => handleNavigation('/auction')}
                            />

                            {/* Cricket Auction (Locked) */}
                            <SelectionCard 
                                title="Cricket"
                                subtitle="Premier League"
                                icon={Sparkles}
                                color={CRICKET_BLUE}
                                delay={0.4}
                                isLocked={true}
                            />

                        </div>

                        {/* Footer / Back Button */}
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            whileHover={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            onClick={() => handleNavigation('/')}
                            className="mt-16 text-white/40 text-xs tracking-[0.3em] uppercase hover:text-white transition-colors"
                        >
                            Return to Gate
                        </motion.button>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
