import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Student, Vanguard } from '@/types/auction';
import { toast } from 'sonner';
import * as store from '@/lib/auctionStore';
import { useSocketSync } from '@/hooks/useSocketSync';

interface AuctionContextType {
    isConnected: boolean;
    students: Student[];
    vanguards: Vanguard[];
    currentStudent: Student | null;
    nextStudent: Student | null;
    availableStudents: Student[];
    timeRemaining: number;
    isTimerRunning: boolean;
    handleSale: (studentId: string, vanguardId: string, price: number) => void;
    handleUnsold: (studentId: string) => void;
    handleReturnFromUnsold: (studentId: string) => void;
    handleSkip: () => void;
    undoSale: (studentId: string) => void;
    updateSale: (studentId: string, newVanguardId: string, newPrice: number) => void;
    resetAuction: () => void;
    startTimer: () => void;
    pauseTimer: () => void;
    resetTimer: () => void;
    sendToEndOfQueue: (studentId: string) => void;
    shuffleRemainingQueue: () => void;
    forceReshuffle: () => void;
    undoLastSale: () => void;
    setGlobalFreeze: (frozen: boolean) => void;
    broadcastAnnouncement: (text: string | null) => void;
    triggerSfx: (sfxId: string) => void;
    jumpToStudent: (studentId: string) => void;
    globalFreeze: boolean;
    activeAnnouncement: string | null;
    sfxTrigger: { id: string; timestamp: number } | null;
    history: {
        id: string;
        type: 'SALE' | 'UNSOLD' | 'SKIP' | 'UNDO';
        message: string;
        timestamp: string;
    }[];
    audioSettings: {
        bgmVolume: number;
        sfxVolume: number;
        voiceVolume: number;
    };
    setAudioSettings: (settings: Partial<{ bgmVolume: number; sfxVolume: number; voiceVolume: number }>) => void;
    importState: (newState: any) => void;
}

const AuctionContext = createContext<AuctionContextType | undefined>(undefined);

export const AuctionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Load state from authoritative store
    const [state, setState] = useState<store.PersistedState>(() => store.initializeOrLoad());

    // Timer display state - computed from authoritative timestamp
    const [timeRemaining, setTimeRemaining] = useState(() => store.getTimeRemaining(state.timer));
    const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Subscribe to cross-tab updates
    useEffect(() => {
        const unsubscribe = store.subscribe(() => {
            const freshState = store.loadState();
            if (freshState) {
                setState(freshState);
            }
        });
        return unsubscribe;
    }, []);

    // Update timer display at 100ms intervals for smooth countdown
    useEffect(() => {
        const updateTimer = () => {
            const remaining = store.getTimeRemaining(state.timer);
            setTimeRemaining(remaining);
        };

        // Initial update
        updateTimer();

        // Interval for live countdown
        timerIntervalRef.current = setInterval(updateTimer, 100);

        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, [state.timer]);

    // Derived values
    const currentStudent = useMemo(() => store.getCurrentStudent(state), [state]);
    const nextStudent = useMemo(() => store.getNextStudent(state), [state]);
    const availableStudents = useMemo(() => store.getAvailableStudents(state), [state]);
    const students = useMemo(() => store.getAllStudentsArray(state), [state]);
    const vanguards = useMemo(() => store.getVanguardsArray(state), [state]);
    const isTimerRunning = useMemo(() =>
        state.timer.startedAt !== null && state.timer.pausedRemaining === null,
        [state.timer]
    );
    const globalFreeze = state.globalFreeze;
    const activeAnnouncement = state.activeAnnouncement;
    const sfxTrigger = state.sfxTrigger;


    // Actions - all delegate to store and update local state
    const handleSale = useCallback((studentId: string, vanguardId: string, price: number) => {
        try {
            const newState = store.confirmSale(studentId, vanguardId, price);
            setState(newState);
            // toast.success(`Sold to ${newState.vanguards[vanguardId].name}`);

            // LIVE EVENT SYNC: Fire-and-forget backend update
            const soldStudent = newState.students[studentId];
            const soldVanguard = newState.vanguards[soldStudent.soldTo];

            fetch("https://auction-web-qtks.onrender.com/api/sale", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentId,
                    name: soldStudent.name,
                    price,
                    vanguard: soldVanguard.name,
                }),
            }).catch(() => console.warn("Background sync failed"));


        } catch (err) {
            console.error('Sale failed:', err);
            toast.error('Sale Failed: ' + (err as Error).message);
        }
    }, []);

    const handleUnsold = useCallback((studentId: string) => {
        try {
            const newState = store.markAsUnsold(studentId);
            setState(newState);
        } catch (err) {
            console.error('Mark as unsold failed:', err);
        }
    }, []);

    const handleReturnFromUnsold = useCallback((studentId: string) => {
        try {
            const newState = store.returnFromUnsold(studentId);
            setState(newState);
        } catch (err) {
            console.error('Return from unsold failed:', err);
        }
    }, []);

    const handleSkip = useCallback(() => {
        try {
            const newState = store.skipCurrentStudent();
            setState(newState);
        } catch (err) {
            console.error('Skip failed:', err);
        }
    }, []);

    const undoSale = useCallback((studentId: string) => {
        try {
            const newState = store.undoSale(studentId);
            setState(newState);
        } catch (err) {
            console.error('Undo failed:', err);
        }
    }, []);

    const updateSale = useCallback((studentId: string, newVanguardId: string, newPrice: number) => {
        try {
            const newState = store.updateSale(studentId, newVanguardId, newPrice);
            setState(newState);
        } catch (err) {
            console.error('Update sale failed:', err);
        }
    }, []);

    const resetAuction = useCallback(() => {
        try {
            const newState = store.resetAuction();
            setState(newState);
        } catch (err) {
            console.error('Reset failed:', err);
        }
    }, []);

    const startTimer = useCallback(() => {
        try {
            const newState = store.startTimer();
            setState(newState);
        } catch (err) {
            console.error('Start timer failed:', err);
        }
    }, []);

    const pauseTimer = useCallback(() => {
        try {
            const newState = store.pauseTimer();
            setState(newState);
        } catch (err) {
            console.error('Pause timer failed:', err);
        }
    }, []);

    const resetTimer = useCallback(() => {
        try {
            const newState = store.resetTimer();
            setState(newState);
        } catch (err) {
            console.error('Reset timer failed:', err);
        }
    }, []);

    const sendToEndOfQueue = useCallback((studentId: string) => {
        try {
            const newState = store.sendToEndOfQueue(studentId);
            setState(newState);
        } catch (err) {
            console.error('Send to end of queue failed:', err);
        }
    }, []);

    const shuffleRemainingQueue = useCallback(() => {
        try {
            const newState = store.shuffleRemainingQueue();
            setState(newState);
            toast.success('Queue Shesuffled (Seeded)');
        } catch (err) {
            toast.error('Shuffle failed');
        }
    }, []);

    const forceReshuffle = useCallback(() => {
        try {
            const newState = store.forceReshuffle();
            setState(newState);
            toast.success('Queue Force Shuffled (Random)');
        } catch (err) {
            toast.error('Force Shuffle failed');
        }
    }, []);

    const undoLastSale = useCallback(() => {
        try {
            const newState = store.undoLastSale();
            setState(newState);
        } catch (err) {
            console.error('Undo last sale failed:', err);
        }
    }, []);

    const setGlobalFreeze = useCallback((frozen: boolean) => {
        try {
            const newState = store.setGlobalFreeze(frozen);
            setState(newState);
        } catch (err) {
            console.error('Set global freeze failed:', err);
        }
    }, []);

    const broadcastAnnouncement = useCallback((text: string | null) => {
        try {
            const newState = store.broadcastAnnouncement(text);
            setState(newState);
        } catch (err) {
            console.error('Broadcast announcement failed:', err);
        }
    }, []);

    const triggerSfx = useCallback((sfxId: string) => {
        try {
            const newState = store.triggerSfx(sfxId);
            setState(newState);
        } catch (err) {
            console.error('Trigger SFX failed:', err);
        }
    }, []);

    const jumpToStudent = useCallback((studentId: string) => {
        try {
            const newState = store.jumpToStudent(studentId);
            setState(newState);
        } catch (err) {
            console.error('Jump to student failed:', err);
        }
    }, []);

    const setAudioSettings = useCallback((settings: Partial<{ bgmVolume: number; sfxVolume: number; voiceVolume: number }>) => {
        try {
            const newState = store.updateAudioSettings(settings);
            setState(newState);
        } catch (err) {
            console.error('Update audio settings failed:', err);
        }
    }, []);

    const importState = useCallback((newState: any) => {
        try {
            // Validate via store (basic check)
            const validated = store.restoreState(newState);
            setState(validated);
        } catch (err) {
            console.error('Import failed:', err);
            throw err;
        }
    }, []);

    // ━━━ REAL-TIME SYNC ━━━
    // Connects to the local Socket.io server (if running)
    const { isConnected } = useSocketSync(state, importState);

    const value = {
        isConnected, // Expose connection status
        students,
        vanguards,
        currentStudent,
        nextStudent,
        availableStudents,
        timeRemaining,
        isTimerRunning,
        handleSale,
        handleUnsold,
        handleReturnFromUnsold,
        handleSkip,
        undoSale,
        updateSale,
        resetAuction,
        startTimer,
        pauseTimer,
        resetTimer,
        sendToEndOfQueue,
        shuffleRemainingQueue,
        forceReshuffle,
        undoLastSale,
        setGlobalFreeze,
        broadcastAnnouncement,
        triggerSfx,
        jumpToStudent,
        globalFreeze,
        activeAnnouncement,
        sfxTrigger,
        history: state.history,
        audioSettings: state.audioSettings || { bgmVolume: 0.5, sfxVolume: 1.0, voiceVolume: 1.0 }, // Fallback for migration
        setAudioSettings,
        importState,
    };

    return <AuctionContext.Provider value={value}>{children}</AuctionContext.Provider>;
};

export const useAuctionContext = () => {
    const context = useContext(AuctionContext);
    if (context === undefined) {
        throw new Error('useAuctionContext must be used within an AuctionProvider');
    }
    return context;
};
