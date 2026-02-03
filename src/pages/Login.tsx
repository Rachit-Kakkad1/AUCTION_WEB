import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Login — Secure Access with Authorization Ceremony
 * 
 * Upon successful authentication:
 * 1. Form elements fade out (staged, bottom-up)
 * 2. 600ms silence
 * 3. CodingGita seal appears with gold halo (authorization)
 * 4. Seal exits LAST
 * 5. Navigate to auction
 */

// ━━━ EASING ━━━
const EASE_EXIT: [number, number, number, number] = [0.4, 0, 0.2, 1];
const EASE_AUTHORIZE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

export default function Login() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [authPhase, setAuthPhase] = useState<'idle' | 'exiting' | 'authorizing' | 'complete'>('idle');
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'admin@2026') {
            // Begin authorization ceremony
            setAuthPhase('exiting');
            toast.success('Access Granted. Welcome Admin.');

            // Phase timeline:
            // T+0ms: Form begins exit
            // T+600ms: Form fully exited, silence begins
            // T+1200ms: Seal appears (authorization moment)
            // T+2400ms: Seal exits
            // T+2900ms: Navigate to auction

            setTimeout(() => setAuthPhase('authorizing'), 600);
            setTimeout(() => setAuthPhase('complete'), 2400);
            setTimeout(() => navigate('/auction'), 2900);
        } else {
            setError(true);
            toast.error('Incorrect Password');
            setPassword('');
        }
    };

    const handleForgot = () => {
        const subject = encodeURIComponent('Auction Portal Password Recovery');
        const body = encodeURIComponent('Hello,\n\nI need to recover the admin password for the CodingGita Auction.\n\nPlease verify my identity and resend the credentials.');
        window.open(`mailto:chitthirpara@gmail.com?subject=${subject}&body=${body}`);
    };

    const isExiting = authPhase !== 'idle';
    const showSeal = authPhase === 'authorizing' || authPhase === 'complete';

    return (
        <div className="min-h-screen bg-[#050510] flex flex-col items-center justify-center p-6 text-white overflow-hidden relative">
            {/* Visual background noise */}
            <motion.div
                className="absolute inset-0 opacity-20 pointer-events-none"
                animate={{
                    opacity: isExiting ? 0 : 0.2,
                    filter: isExiting ? 'blur(20px)' : 'blur(0px)'
                }}
                transition={{ duration: 0.8, ease: EASE_EXIT }}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-vanguard-blue/10 rounded-full blur-[150px]" />
            </motion.div>

            <AnimatePresence mode="wait">
                {!showSeal ? (
                    // ━━━ LOGIN FORM ━━━
                    <motion.div
                        key="login-form"
                        className="w-full max-w-md relative z-10 space-y-8"
                        initial={{ opacity: 1, filter: 'blur(0px)' }}
                        animate={{
                            opacity: isExiting ? 0 : 1,
                            filter: isExiting ? 'blur(8px)' : 'blur(0px)',
                            scale: isExiting ? 0.98 : 1,
                        }}
                        exit={{
                            opacity: 0,
                            filter: 'blur(8px)',
                            transition: { duration: 0.3 }
                        }}
                        transition={{
                            duration: 0.5,
                            ease: EASE_EXIT,
                            // Stagger children exit
                        }}
                    >
                        {/* Header */}
                        <motion.div
                            className="text-center space-y-2"
                            animate={{
                                opacity: isExiting ? 0 : 1,
                                y: isExiting ? -10 : 0,
                            }}
                            transition={{ duration: 0.4, delay: isExiting ? 0.1 : 0, ease: EASE_EXIT }}
                        >
                            <motion.div
                                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4"
                                animate={{
                                    opacity: isExiting ? 0 : 1,
                                    scale: isExiting ? 0.9 : 1,
                                }}
                                transition={{ duration: 0.4, delay: isExiting ? 0.15 : 0, ease: EASE_EXIT }}
                            >
                                <Lock className="w-8 h-8 text-primary" />
                            </motion.div>
                            <h1 className="text-4xl font-black italic tracking-tighter">SECURE ACCESS</h1>
                            <p className="text-muted-foreground font-medium uppercase tracking-widest text-sm">Verify Admin Credentials</p>
                        </motion.div>

                        {/* Form */}
                        <motion.form
                            onSubmit={handleLogin}
                            className="glass-card-elevated p-8 rounded-3xl space-y-6 border border-white/5 shadow-2xl"
                            animate={{
                                opacity: isExiting ? 0 : 1,
                                y: isExiting ? 20 : 0,
                            }}
                            transition={{ duration: 0.4, delay: isExiting ? 0 : 0, ease: EASE_EXIT }}
                        >
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Password</label>
                                <div className="relative group">
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setError(false);
                                        }}
                                        disabled={isExiting}
                                        className={`h-14 bg-white/5 border-white/10 text-white text-lg rounded-xl pl-12 focus:ring-primary focus:border-primary transition-all ${error ? 'border-destructive/50 ring-1 ring-destructive/50 animate-shake' : ''}`}
                                    />
                                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isExiting}
                                className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg rounded-xl glow-primary shadow-xl group transition-all"
                            >
                                ENTER SYSTEM
                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>

                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleForgot}
                                disabled={isExiting}
                                className="w-full text-muted-foreground hover:text-white transition-colors text-xs font-bold tracking-widest uppercase py-2"
                            >
                                <Mail className="w-3.5 h-3.5 mr-2" />
                                Forgot Password?
                            </Button>
                        </motion.form>

                        {/* Footer */}
                        <motion.div
                            className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] opacity-50"
                            animate={{ opacity: isExiting ? 0 : 0.5 }}
                            transition={{ duration: 0.3, ease: EASE_EXIT }}
                        >
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            End-to-End Encrypted Session
                        </motion.div>
                    </motion.div>
                ) : (
                    // ━━━ AUTHORIZATION SEAL ━━━
                    <motion.div
                        key="auth-seal"
                        className="flex flex-col items-center justify-center gap-6 z-10"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{
                            opacity: authPhase === 'complete' ? 0 : 1,
                            scale: authPhase === 'complete' ? 1.0 : 1.02,
                            filter: authPhase === 'complete'
                                ? 'drop-shadow(0 0 20px rgba(212, 175, 55, 0.1))'
                                : 'drop-shadow(0 0 60px rgba(212, 175, 55, 0.4))',
                        }}
                        exit={{ opacity: 0 }}
                        transition={{
                            duration: authPhase === 'complete' ? 0.5 : 0.8,
                            ease: authPhase === 'complete' ? EASE_EXIT : EASE_AUTHORIZE
                        }}
                        style={{ willChange: 'transform, opacity, filter' }}
                    >
                        <motion.img
                            src="/codinggita-logo.png"
                            alt="CodingGita"
                            className="w-36 h-36 object-contain"
                            draggable={false}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, ease: EASE_AUTHORIZE }}
                        />
                        <motion.div
                            className="text-center space-y-2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2, ease: EASE_AUTHORIZE }}
                        >
                            <p className="text-xs font-bold uppercase tracking-[0.5em] text-amber-400/90">
                                Access Authorized
                            </p>
                            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                                Initializing Auction System
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
