import { motion } from 'framer-motion';
import { ReactNode } from 'react';

/**
 * AuthorizationSeal — CodingGita Logo with Ceremony Animation
 * 
 * Represents institutional authority and authorization.
 * Used as the final element before transitioning to auction.
 * 
 * RULES:
 * - No spinning, bouncing, or elastic motion
 * - Scale never exceeds 1.02
 * - Gold halo for authorization moment
 * - Always exits LAST
 */

interface AuthorizationSealProps {
    /** Whether the seal is in authorization phase */
    isAuthorizing?: boolean;
    /** Callback when exit animation completes */
    onExitComplete?: () => void;
}

// ━━━ EASING ━━━
const EASE_AUTHORIZE = [0.25, 0.1, 0.25, 1] as const;
const EASE_EXIT = [0.4, 0, 0.6, 1] as const;

const sealVariants = {
    idle: {
        scale: 1,
        opacity: 1,
        filter: 'drop-shadow(0 0 0px rgba(212, 175, 55, 0))',
    },
    authorize: {
        scale: 1.02,
        opacity: 1,
        filter: 'drop-shadow(0 0 40px rgba(212, 175, 55, 0.4))',
        transition: {
            duration: 0.6,
            ease: EASE_AUTHORIZE,
        },
    },
    exit: {
        scale: 1.0,
        opacity: 0,
        filter: 'drop-shadow(0 0 20px rgba(212, 175, 55, 0.2))',
        transition: {
            duration: 0.5,
            ease: EASE_EXIT,
        },
    },
};

export function AuthorizationSeal({
    isAuthorizing = false,
    onExitComplete,
}: AuthorizationSealProps) {
    return (
        <motion.div
            className="flex flex-col items-center justify-center gap-4"
            variants={sealVariants}
            initial="idle"
            animate={isAuthorizing ? 'authorize' : 'idle'}
            exit="exit"
            onAnimationComplete={(definition) => {
                if (definition === 'exit' && onExitComplete) {
                    onExitComplete();
                }
            }}
            style={{ willChange: 'transform, opacity, filter' }}
        >
            <img
                src="/codinggita-logo.png"
                alt="CodingGita"
                className="w-28 h-28 object-contain"
                draggable={false}
            />
            <span className="text-xs font-bold uppercase tracking-[0.4em] text-amber-400/80">
                Authorized
            </span>
        </motion.div>
    );
}
