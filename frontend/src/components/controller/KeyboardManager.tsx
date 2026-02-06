import { useEffect } from 'react';
import { toast } from 'sonner';

interface KeyboardManagerProps {
    onToggleTimer: () => void;
    onResetTimer: () => void;
    onSell: () => void; // Opens sell modal
    onUnsold: () => void; // Triggers unsold flow
    disabled?: boolean;
}

export function KeyboardManager({
    onToggleTimer,
    onResetTimer,
    onSell,
    onUnsold,
    disabled = false
}: KeyboardManagerProps) {
    useEffect(() => {
        if (disabled) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            // SPACE: Toggle Timer
            if (e.code === 'Space') {
                e.preventDefault();
                onToggleTimer();
                return;
            }

            // S: Sell (if not holding modifiers)
            if (e.code === 'KeyS' && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                onSell();
                toast.info('Shortcut: Sell');
                return;
            }

            // U: Unsold
            if (e.code === 'KeyU' && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                onUnsold();
                toast.info('Shortcut: Mark Unsold');
                return;
            }

            // ESC: Pause Timer (Safety)
            if (e.code === 'Escape') {
                e.preventDefault();
                onResetTimer(); // Or pause? User requested "Pause" logic usually for Esc
                return;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onToggleTimer, onResetTimer, onSell, onUnsold, disabled]);

    return null; // Headless component
}
