/**
 * AUCTION STORE - Single Source of Truth
 * 
 * This module provides:
 * 1. Persisted state in localStorage
 * 2. Cross-tab synchronization via BroadcastChannel
 * 3. Deterministic seeded shuffle
 * 4. Timestamp-based timer authority
 * 
 * INVARIANTS:
 * - queue[0] is ALWAYS the current student
 * - Controller can ONLY reorder queue[1+]
 * - Timer is computed from timestamp, never stored as countdown
 * - All mutations are atomic and broadcast to other tabs
 */

import { Student, StudentIdentity, Vanguard } from '@/types/auction';
import STUDENT_ROSTER from '@/data/students_data.json';

// ============================================================
// STORAGE KEY - Version for future migrations
// ============================================================
const STORAGE_KEY = 'auction_state_v7';
const CHANNEL_NAME = 'auction_sync';

// ============================================================
// TYPES
// ============================================================

export interface TimerState {
    /** ISO timestamp when timer started, null if paused/stopped */
    startedAt: string | null;
    /** Duration in seconds */
    duration: number;
    /** Remaining seconds when paused, null if running */
    pausedRemaining: number | null;
}

export interface PersistedState {
    /** Version for migrations */
    version: 1;
    /** Seed used for initial shuffle - stored to guarantee reproducibility */
    shuffleSeed: string;
    /** Ordered queue of available student IDs - queue[0] is current */
    queue: string[];
    /** All students keyed by ID */
    students: Record<string, Student>;
    /** All vanguards keyed by ID */
    vanguards: Record<string, Vanguard>;
    /** Timer state */
    timer: TimerState;
    /** Timestamp of last modification */
    updatedAt: string;
    /** For Undo functionality */
    lastAction: { type: 'sale'; studentId: string; vanguardId: string; price: number } | null;
    /** For Freeze functionality */
    globalFreeze: boolean;
    /** For Announcement functionality */
    activeAnnouncement: string | null;
    /** For SFX functionality */
    sfxTrigger: { id: string; timestamp: number } | null;
}

// ============================================================
// SEEDED RANDOM - Deterministic shuffle
// ============================================================

function mulberry32(seed: number): () => number {
    return function () {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return Math.abs(hash);
}

export function seededShuffle<T>(array: T[], seed: string): T[] {
    const shuffled = [...array];
    const random = mulberry32(hashString(seed));

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
}

// ============================================================
// RAW DATA - Unshuffled student list
// ============================================================

// ============================================================
// RAW DATA - Imported from clean JSON source
// ============================================================

// Map raw JSON to StudentIdentity schema
const RAW_STUDENTS: StudentIdentity[] = (STUDENT_ROSTER as any[]).map((s) => ({
    id: s.UniversityUID,
    name: s.studentName,
    grNumber: s.UniversityUID, // Using UID as GR Number as well for display
    image_url: s.imageUrl || `https://placehold.co/400x400?text=${encodeURIComponent(s.studentName)}`, // Fallback image
}));

const INITIAL_VANGUARDS: Vanguard[] = [
    { id: 'v1', name: 'Terra', color: 'emerald', budget: 100, spent: 0, squad: [], leader: 'Pal Pathak' },
    { id: 'v2', name: 'Aqua', color: 'blue', budget: 100, spent: 0, squad: [], leader: 'Jonty Patel' },
    { id: 'v3', name: 'Aero', color: 'amber', budget: 100, spent: 0, squad: [], leader: 'Devanshi Vadiya' },
    { id: 'v4', name: 'Ignis', color: 'rose', budget: 100, spent: 0, squad: [], leader: 'Ankit Kumar' },
];

// ============================================================
// TIMER COMPUTATION - Timestamp-based, never stored countdown
// ============================================================

const TIMER_DURATION = 15;

export function getTimeRemaining(timer: TimerState): number {
    // If paused, return the paused value
    if (timer.pausedRemaining !== null) {
        return timer.pausedRemaining;
    }

    // If not started, return full duration
    if (timer.startedAt === null) {
        return timer.duration;
    }

    // Compute remaining from timestamp
    const elapsed = (Date.now() - new Date(timer.startedAt).getTime()) / 1000;
    return Math.max(0, Math.ceil(timer.duration - elapsed));
}

export function isTimerExpired(timer: TimerState): boolean {
    return getTimeRemaining(timer) === 0 && timer.startedAt !== null && timer.pausedRemaining === null;
}

// ============================================================
// INITIALIZATION
// ============================================================

function generateSeed(): string {
    return `auction-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createInitialState(seed: string): PersistedState {
    const rawIds = RAW_STUDENTS.map(s => s.id);
    // Initial Shuffle: Randomize the entire list using the seed
    const shuffledIds = seededShuffle(rawIds, seed);

    const students: Record<string, Student> = {};
    for (const raw of RAW_STUDENTS) {
        students[raw.id] = { ...raw, status: 'available' };
    }

    const vanguards: Record<string, Vanguard> = {};
    for (const v of INITIAL_VANGUARDS) {
        vanguards[v.id] = { ...v, squad: [] };
    }

    return {
        version: 1,
        shuffleSeed: seed,
        queue: shuffledIds,
        students,
        vanguards,
        timer: {
            startedAt: null,
            duration: TIMER_DURATION,
            pausedRemaining: null,
        },
        updatedAt: new Date().toISOString(),
        lastAction: null,
        globalFreeze: false,
        activeAnnouncement: null,
        sfxTrigger: null,
    };
}

// ============================================================
// STORAGE OPERATIONS
// ============================================================

export function loadState(): PersistedState | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as PersistedState;
        if (parsed.version !== 1) return null;
        return parsed;
    } catch {
        return null;
    }
}

export function saveState(state: PersistedState): void {
    state.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    broadcastUpdate();
}

export function initializeOrLoad(): PersistedState {
    const existing = loadState();
    if (existing) return existing;

    const seed = generateSeed();
    const initial = createInitialState(seed);
    saveState(initial);
    return initial;
}

// ============================================================
// BROADCAST CHANNEL - Cross-tab sync
// ============================================================

let channel: BroadcastChannel | null = null;
let listeners: Array<() => void> = [];

function getChannel(): BroadcastChannel {
    if (!channel) {
        channel = new BroadcastChannel(CHANNEL_NAME);
        channel.onmessage = () => {
            // Notify all listeners that state changed
            listeners.forEach(fn => fn());
        };
    }
    return channel;
}

function broadcastUpdate(): void {
    getChannel().postMessage({ type: 'STATE_UPDATED' });
}

export function subscribe(callback: () => void): () => void {
    getChannel(); // Ensure channel is initialized
    listeners.push(callback);
    return () => {
        listeners = listeners.filter(fn => fn !== callback);
    };
}

// ============================================================
// MUTATIONS - All atomic and broadcast
// ============================================================

/**
 * Confirm a sale. Removes student from queue, marks as sold, updates vanguard.
 * Resets timer for next student.
 */
export function confirmSale(studentId: string, vanguardId: string, price: number): PersistedState {
    const state = loadState();
    if (!state) throw new Error('No auction state');

    // Validate: student must be queue[0]
    if (state.queue[0] !== studentId) {
        throw new Error('Can only sell current student (queue[0])');
    }

    const student = state.students[studentId];
    if (!student || student.status !== 'available') {
        throw new Error('Student not available');
    }

    const vanguard = state.vanguards[vanguardId];
    if (!vanguard) {
        throw new Error('Vanguard not found');
    }

    const remaining = vanguard.budget - vanguard.spent;
    if (price > remaining) {
        throw new Error('Insufficient budget');
    }

    // Apply mutation
    state.students[studentId] = {
        ...student,
        status: 'sold',
        soldTo: vanguardId,
        soldPrice: price,
    };

    state.vanguards[vanguardId] = {
        ...vanguard,
        spent: vanguard.spent + price,
        squad: [...vanguard.squad, state.students[studentId]],
    };

    // Record for UNDO
    state.lastAction = { type: 'sale', studentId, vanguardId, price };

    // Remove from queue
    state.queue = state.queue.slice(1);

    // Reset timer (paused, ready for next)
    state.timer = {
        startedAt: null,
        duration: TIMER_DURATION,
        pausedRemaining: null,
    };

    saveState(state);
    return state;
}

/**
 * Mark current student as UNSOLD.
 * Removes from queue, marks as unsold.
 * Resets timer.
 * NO money exchanged.
 */
export function markAsUnsold(studentId: string): PersistedState {
    const state = loadState();
    if (!state) throw new Error('No auction state');

    // Validate: student must be queue[0]
    if (state.queue[0] !== studentId) {
        throw new Error('Can only mark current student (queue[0]) as unsold');
    }

    const student = state.students[studentId];
    if (!student || student.status !== 'available') {
        throw new Error('Student not available');
    }

    // Apply mutation
    state.students[studentId] = {
        ...student,
        status: 'unsold',
        soldTo: undefined,
        soldPrice: undefined,
    };

    // Remove from queue
    state.queue = state.queue.slice(1);

    // Reset timer
    state.timer = {
        startedAt: null,
        duration: TIMER_DURATION,
        pausedRemaining: null,
    };

    saveState(state);
    return state;
}

/**
 * Return an UNSOLD student to the queue (available).
 * Adds to END of queue.
 */
export function returnFromUnsold(studentId: string): PersistedState {
    const state = loadState();
    if (!state) throw new Error('No auction state');

    const student = state.students[studentId];
    if (!student || student.status !== 'unsold') {
        throw new Error('Student must be unsold to return');
    }

    state.students[studentId] = {
        ...student,
        status: 'available',
    };

    // Add to FRONT of queue (Make active immediately)
    state.queue = [studentId, ...state.queue];

    // Reset timer
    state.timer = {
        startedAt: null,
        duration: TIMER_DURATION,
        pausedRemaining: null,
    };

    saveState(state);
    return state;
}

/**
 * Skip current student - moves queue[0] to end of queue.
 * Only callable from main screen.
 */
export function skipCurrentStudent(): PersistedState {
    const state = loadState();
    if (!state) throw new Error('No auction state');
    if (state.queue.length === 0) throw new Error('Queue is empty');

    const [current, ...rest] = state.queue;
    state.queue = [...rest, current];

    // Reset timer
    state.timer = {
        startedAt: null,
        duration: TIMER_DURATION,
        pausedRemaining: null,
    };

    saveState(state);
    return state;
}

/**
 * Controller action: Move queue[targetIndex] to end of queue.
 * INVARIANT: targetIndex must be >= 1 (never queue[0])
 */
export function sendToEndOfQueue(studentId: string): PersistedState {
    const state = loadState();
    if (!state) throw new Error('No auction state');

    const index = state.queue.indexOf(studentId);
    if (index === -1) throw new Error('Student not in queue');
    if (index === 0) throw new Error('Cannot move current student from controller');

    // Remove from current position, add to end
    state.queue = [
        ...state.queue.slice(0, index),
        ...state.queue.slice(index + 1),
        studentId,
    ];

    saveState(state);
    return state;
}

/**
 * Undo a sale - returns student to available, refunds vanguard.
 * Student goes to END of queue (not disrupting current).
 */
export function undoSale(studentId: string): PersistedState {
    const state = loadState();
    if (!state) throw new Error('No auction state');

    const student = state.students[studentId];
    if (!student || student.status !== 'sold') {
        throw new Error('Student is not sold');
    }

    const vanguardId = student.soldTo!;
    const price = student.soldPrice!;
    const vanguard = state.vanguards[vanguardId];

    // Revert student
    state.students[studentId] = {
        ...student,
        status: 'available',
        soldTo: undefined,
        soldPrice: undefined,
    };

    // Refund vanguard
    state.vanguards[vanguardId] = {
        ...vanguard,
        spent: vanguard.spent - price,
        squad: vanguard.squad.filter(s => s.id !== studentId),
    };

    // Add to end of queue
    state.queue = [...state.queue, studentId];

    saveState(state);
    return state;
}

/**
 * Update an existing sale - change team and/or price.
 */
export function updateSale(studentId: string, newVanguardId: string, newPrice: number): PersistedState {
    const state = loadState();
    if (!state) throw new Error('No auction state');

    const student = state.students[studentId];
    if (!student || student.status !== 'sold') {
        throw new Error('Student is not sold');
    }

    const oldVanguardId = student.soldTo!;
    const oldPrice = student.soldPrice!;

    // If same vanguard and price, no-op
    if (oldVanguardId === newVanguardId && oldPrice === newPrice) {
        return state;
    }

    const oldVanguard = state.vanguards[oldVanguardId];
    const newVanguard = state.vanguards[newVanguardId];

    // Remove from old vanguard
    state.vanguards[oldVanguardId] = {
        ...oldVanguard,
        spent: oldVanguard.spent - oldPrice,
        squad: oldVanguard.squad.filter(s => s.id !== studentId),
    };

    // Update student
    state.students[studentId] = {
        ...student,
        soldTo: newVanguardId,
        soldPrice: newPrice,
    };

    // Add to new vanguard
    state.vanguards[newVanguardId] = {
        ...newVanguard,
        spent: newVanguard.spent + newPrice,
        squad: [...newVanguard.squad.filter(s => s.id !== studentId), state.students[studentId]],
    };

    saveState(state);
    return state;
}

/**
 * Reset auction with new seed.
 */
export function resetAuction(): PersistedState {
    const seed = generateSeed();
    const fresh = createInitialState(seed);
    saveState(fresh);
    return fresh;
}

// ============================================================
// TIMER CONTROLS
// ============================================================

export function startTimer(): PersistedState {
    const state = loadState();
    if (!state) throw new Error('No auction state');

    // If already running, no-op
    if (state.timer.startedAt !== null && state.timer.pausedRemaining === null) {
        return state;
    }

    // If resuming from pause
    if (state.timer.pausedRemaining !== null) {
        const now = new Date();
        // Calculate what the start time would have been to have this remaining time
        const effectiveStart = new Date(now.getTime() - (state.timer.duration - state.timer.pausedRemaining) * 1000);
        state.timer = {
            startedAt: effectiveStart.toISOString(),
            duration: state.timer.duration,
            pausedRemaining: null,
        };
    } else {
        // Fresh start
        state.timer = {
            startedAt: new Date().toISOString(),
            duration: TIMER_DURATION,
            pausedRemaining: null,
        };
    }

    saveState(state);
    return state;
}

export function pauseTimer(): PersistedState {
    const state = loadState();
    if (!state) throw new Error('No auction state');

    // If not running, no-op
    if (state.timer.startedAt === null || state.timer.pausedRemaining !== null) {
        return state;
    }

    const remaining = getTimeRemaining(state.timer);
    state.timer = {
        startedAt: null,
        duration: state.timer.duration,
        pausedRemaining: remaining,
    };

    saveState(state);
    return state;
}

export function resetTimer(): PersistedState {
    const state = loadState();
    if (!state) throw new Error('No auction state');

    state.timer = {
        startedAt: new Date().toISOString(),
        duration: TIMER_DURATION,
        pausedRemaining: null,
    };

    saveState(state);
    return state;
}

// ============================================================
// DERIVED STATE HELPERS
// ============================================================

export function getCurrentStudent(state: PersistedState): Student | null {
    if (state.queue.length === 0) return null;
    return state.students[state.queue[0]] || null;
}

export function getNextStudent(state: PersistedState): Student | null {
    if (state.queue.length < 2) return null;
    return state.students[state.queue[1]] || null;
}

export function getAvailableStudents(state: PersistedState): Student[] {
    return state.queue.map(id => state.students[id]).filter(Boolean);
}

export function getVanguardsArray(state: PersistedState): Vanguard[] {
    return Object.values(state.vanguards);
}


export function getAllStudentsArray(state: PersistedState): Student[] {
    return Object.values(state.students);
}

/**
 * Shuffle the remaining students in the queue (skipping queue[0]).
 * Used by Controller to randomize upcoming auctions.
 */
export function shuffleRemainingQueue(): PersistedState {
    const state = loadState();
    if (!state) throw new Error('No auction state');

    if (state.queue.length <= 2) {
        // Nothing to shuffle effectively
        return state;
    }

    const current = state.queue[0];
    const remaining = state.queue.slice(1);

    // Generate a new seed component for this shuffle to ensure randomness relative to previous
    const shuffleSeed = `${state.shuffleSeed}-reshuffle-${Date.now()}`;
    const shuffledRemaining = seededShuffle(remaining, shuffleSeed);

    state.queue = [current, ...shuffledRemaining];

    saveState(state);
    return state;
}

// ============================================================
// GOD-TIER FEATURES
// ============================================================

export function undoLastSale(): PersistedState {
    const state = loadState();
    if (!state) throw new Error('No state');
    if (!state.lastAction) throw new Error('No action to undo');

    const { studentId, vanguardId, price } = state.lastAction;

    // 1. Revert Vanguard
    const vanguard = state.vanguards[vanguardId];
    state.vanguards[vanguardId] = {
        ...vanguard,
        spent: vanguard.spent - price,
        squad: vanguard.squad.filter(s => s.id !== studentId),
    };

    // 2. Revert Student
    const student = state.students[studentId];
    state.students[studentId] = {
        ...student,
        status: 'available',
        soldTo: undefined,
        soldPrice: undefined,
    };

    // 3. Put back at START of queue
    state.queue = [studentId, ...state.queue];

    // 4. Clear undo history
    state.lastAction = null;

    saveState(state);
    return state;
}

export function setGlobalFreeze(frozen: boolean): PersistedState {
    const state = loadState();
    if (!state) throw new Error('No state');
    state.globalFreeze = frozen;
    // Also pause timer if freezing
    if (frozen) {
        if (state.timer.startedAt !== null) {
            const remaining = getTimeRemaining(state.timer);
            state.timer.startedAt = null;
            state.timer.pausedRemaining = remaining;
        }
    }
    saveState(state);
    return state;
}

export function broadcastAnnouncement(text: string | null): PersistedState {
    const state = loadState();
    if (!state) throw new Error('No state');
    state.activeAnnouncement = text;
    saveState(state);
    return state;
}

export function triggerSfx(sfxId: string): PersistedState {
    const state = loadState();
    if (!state) throw new Error('No state');
    state.sfxTrigger = { id: sfxId, timestamp: Date.now() };
    saveState(state);
    return state;
}
