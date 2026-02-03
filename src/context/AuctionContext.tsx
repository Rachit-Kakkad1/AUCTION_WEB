import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Student, Vanguard } from '@/types/auction';
import * as store from '@/lib/auctionStore';

interface AuctionContextType {
    students: Student[];
    vanguards: Vanguard[];
    currentStudent: Student | null;
    nextStudent: Student | null;
    availableStudents: Student[];
    timeRemaining: number;
    isTimerRunning: boolean;
    handleSale: (studentId: string, vanguardId: string, price: number) => void;
    handleSkip: () => void;
    undoSale: (studentId: string) => void;
    updateSale: (studentId: string, newVanguardId: string, newPrice: number) => void;
    resetAuction: () => void;
    startTimer: () => void;
    pauseTimer: () => void;
    resetTimer: () => void;
    sendToEndOfQueue: (studentId: string) => void;
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

    // Actions - all delegate to store and update local state
    const handleSale = useCallback((studentId: string, vanguardId: string, price: number) => {
        try {
            const newState = store.confirmSale(studentId, vanguardId, price);
            setState(newState);
        } catch (err) {
            console.error('Sale failed:', err);
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

    const value = {
        students,
        vanguards,
        currentStudent,
        nextStudent,
        availableStudents,
        timeRemaining,
        isTimerRunning,
        handleSale,
        handleSkip,
        undoSale,
        updateSale,
        resetAuction,
        startTimer,
        pauseTimer,
        resetTimer,
        sendToEndOfQueue,
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
