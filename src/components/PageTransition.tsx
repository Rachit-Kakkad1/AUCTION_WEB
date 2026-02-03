import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

/**
 * PageTransition — Cinematic Authorization Transition Wrapper
 * 
 * Provides ceremony-style exit/enter animations between pages.
 * Uses blur, opacity, and subtle scale for institutional authority.
 * 
 * RULES:
 * - No bounce, spring, or elastic motion
 * - Motion must feel HEAVY, not fast
 * - Silence (delay) is part of the ceremony
 */

interface PageTransitionProps {
    children: ReactNode;
    /** Unique key for AnimatePresence tracking */
    pageKey: string;
    /** Variant preset: 'default' | 'auction-entry' */
    variant?: 'default' | 'auction-entry';
}

// ━━━ EASING CURVES ━━━
// Authority easing: slow start, confident finish
const EASE_EXIT = [0.4, 0, 0.2, 1] as const;      // ease-out
const EASE_ENTER = [0.0, 0, 0.2, 1] as const;     // ease-in-out

// ━━━ DEFAULT TRANSITION (Login, Landing) ━━━
const defaultVariants = {
    initial: {
        opacity: 0,
        filter: 'blur(8px)',
        scale: 0.98,
    },
    animate: {
        opacity: 1,
        filter: 'blur(0px)',
        scale: 1,
        transition: {
            duration: 0.6,
            ease: EASE_ENTER,
        },
    },
    exit: {
        opacity: 0,
        filter: 'blur(4px)',
        transition: {
            duration: 0.4,
            ease: EASE_EXIT,
        },
    },
};

// ━━━ AUCTION ENTRY (Heavier, more ceremony) ━━━
const auctionEntryVariants = {
    initial: {
        opacity: 0,
        filter: 'blur(12px)',
        scale: 0.97,
    },
    animate: {
        opacity: 1,
        filter: 'blur(0px)',
        scale: 1,
        transition: {
            duration: 0.8,
            ease: EASE_ENTER,
            delay: 0.2, // Intentional silence after exit
        },
    },
    exit: {
        opacity: 0,
        filter: 'blur(6px)',
        transition: {
            duration: 0.5,
            ease: EASE_EXIT,
        },
    },
};

export function PageTransition({
    children,
    pageKey,
    variant = 'default'
}: PageTransitionProps) {
    const variants = variant === 'auction-entry'
        ? auctionEntryVariants
        : defaultVariants;

    return (
        <motion.div
            key={pageKey}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
            style={{
                position: 'absolute',
                inset: 0,
                willChange: 'transform, opacity, filter',
            }}
        >
            {children}
        </motion.div>
    );
}

/**
 * AnimatedRoutes Wrapper
 * Provides AnimatePresence context for route transitions.
 */
interface AnimatedRoutesProps {
    children: ReactNode;
    locationKey: string;
}

export function AnimatedRoutes({ children, locationKey }: AnimatedRoutesProps) {
    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key={locationKey}
                style={{
                    position: 'relative',
                    minHeight: '100vh',
                    overflow: 'hidden',
                }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
