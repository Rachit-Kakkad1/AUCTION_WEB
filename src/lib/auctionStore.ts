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

import { Student, Vanguard } from '@/types/auction';

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

const RAW_STUDENTS: Omit<Student, 'status' | 'soldTo' | 'soldPrice'>[] = [
    { id: '1', grNumber: 'SUK250054CE001', name: 'PATEL RANI RAKESHKUMAR' },
    { id: '2', grNumber: 'SUK250054CE002', name: 'SHAH ARJUN MEHULBHAI' },
    { id: '3', grNumber: 'SUK250054CE003', name: 'DESAI KRISH SANJAYKUMAR' },
    { id: '4', grNumber: 'SUK250054CE004', name: 'MODI DHRUV PRAKASHBHAI' },
    { id: '5', grNumber: 'SUK250054CE005', name: 'PATEL RIYA BHARATBHAI' },
    { id: '6', grNumber: 'SUK250054CE006', name: 'JOSHI VEDANT ASHOKBHAI' },
    { id: '7', grNumber: 'SUK250054CE007', name: 'SHARMA PRIYA RAMESHBHAI' },
    { id: '8', grNumber: 'SUK250054CE008', name: 'TRIVEDI HARSH DIPAKKUMAR' },
    { id: '9', grNumber: 'SUK250054CE009', name: 'PATEL ANANYA VINODBHAI' },
    { id: '10', grNumber: 'SUK250054CE010', name: 'MEHTA ROHAN SUNILKUMAR' },
    { id: '11', grNumber: 'SUK250054CE011', name: 'GANDHI NISHA PRAVINBHAI' },
    { id: '12', grNumber: 'SUK250054CE012', name: 'SHAH MEET KIRANKUMAR' },
    { id: '13', grNumber: 'SUK250054CE013', name: 'PATEL KAVYA NILESHBHAI' },
    { id: '14', grNumber: 'SUK250054CE014', name: 'THAKKAR ADITYA BHAVESHKUMAR' },
    { id: '15', grNumber: 'SUK250054CE015', name: 'DESAI POOJA JITENDRABHAI' },
    { id: '16', grNumber: 'SUK250054CE016', name: 'PATEL YASH MANOJBHAI' },
    { id: '17', grNumber: 'SUK250054CE017', name: 'SHAH DIYA AMITBHAI' },
    { id: '18', grNumber: 'SUK250054CE018', name: 'JANI RAHUL KANTILAL' },
    { id: '19', grNumber: 'SUK250054CE019', name: 'PATEL SHREYA MUKESHBHAI' },
    { id: '20', grNumber: 'SUK250054CE020', name: 'MODI VIVEK HASMUKHBHAI' },
    { id: '21', grNumber: 'SUK250054CE021', name: 'DAVE MIRA JAYESHBHAI' },
    { id: '22', grNumber: 'SUK250054CE022', name: 'PATEL KARAN DINESHBHAI' },
    { id: '23', grNumber: 'SUK250054CE023', name: 'SHARMA NEHA RAJESHBHAI' },
    { id: '24', grNumber: 'SUK250054CE024', name: 'THAKKAR ISHAAN PRAFULBHAI' },
    { id: '25', grNumber: 'SUK250054CE025', name: 'PATEL TANVI SURESHBHAI' },
    { id: '26', grNumber: 'SUK250054CE026', name: 'DESAI ARNAV BIPINKUMAR' },
    { id: '27', grNumber: 'SUK250054CE027', name: 'SHAH AISHA PANKAJBHAI' },
    { id: '28', grNumber: 'SUK250054CE028', name: 'PATEL DARSHAN VIJAYKUMAR' },
    { id: '29', grNumber: 'SUK250054CE029', name: 'JOSHI RUCHI ANILBHAI' },
    { id: '30', grNumber: 'SUK250054CE030', name: 'PATEL PURNANSH KETANKUMAR' },
    { id: '31', grNumber: 'SUK250054CE031', name: 'HETAVI MAHENDRA PANCHOTIA' },
    { id: '32', grNumber: 'SUK250054CE032', name: 'PRAJAPATI RAVI SUNILBHAI' },
    { id: '33', grNumber: 'SUK250054CE033', name: 'THAKOR JANVI RAKESHKUMAR' },
    { id: '34', grNumber: 'SUK250054CE034', name: 'PATEL DHAIRYA HITESHBHAI' },
    { id: '35', grNumber: 'SUK250054CE035', name: 'SOLANKI KHUSHI PRAVINBHAI' },
    { id: '36', grNumber: 'SUK250054CE036', name: 'SHAH PARTH BHARATBHAI' },
    { id: '37', grNumber: 'SUK250054CE037', name: 'PATEL NIDHI ASHOKBHAI' },
    { id: '38', grNumber: 'SUK250054CE038', name: 'CHAUDHARI MAHIR SANJAYKUMAR' },
    { id: '39', grNumber: 'SUK250054CE039', name: 'PATEL KOMAL DIPAKBHAI' },
    { id: '40', grNumber: 'SUK250054CE040', name: 'DESAI TEJAS BHAVESHBHAI' },
    { id: '41', grNumber: 'SUK250054CE041', name: 'PATEL BHUMI KIRANBHAI' },
    { id: '42', grNumber: 'SUK250054CE042', name: 'THAKKAR MANN SUNILKUMAR' },
    { id: '43', grNumber: 'SUK250054CE043', name: 'JANI PRACHI JITENDRABHAI' },
    { id: '44', grNumber: 'SUK250054CE044', name: 'PATEL VATSAL MANOJBHAI' },
    { id: '45', grNumber: 'SUK250054CE045', name: 'SHAH URVI NILESHBHAI' },
    { id: '46', grNumber: 'SUK250054CE046', name: 'PATEL CHIRAG MUKESHBHAI' },
    { id: '47', grNumber: 'SUK250054CE047', name: 'MODI RIDHI VINODBHAI' },
    { id: '48', grNumber: 'SUK250054CE048', name: 'DAVE HARDIK PRAKASHBHAI' },
    { id: '49', grNumber: 'SUK250054CE049', name: 'PATEL SWARA JAYESHBHAI' },
    { id: '50', grNumber: 'SUK250054CE050', name: 'SHARMA LAKSH RAMESHBHAI' },
    { id: '51', grNumber: 'SUK250054CE051', name: 'PATEL TWISHA AMITBHAI' },
    { id: '52', grNumber: 'SUK250054CE052', name: 'DESAI KRUPA DINESHBHAI' },
    { id: '53', grNumber: 'SUK250054CE053', name: 'GANDHI RONAK HASMUKHBHAI' },
    { id: '54', grNumber: 'SUK250054CE054', name: 'PATEL DRASHTI RAJESHBHAI' },
    { id: '55', grNumber: 'SUK250054CE055', name: 'JOSHI MIHIR PRAFULBHAI' },
    { id: '56', grNumber: 'SUK250054CE056', name: 'PATEL KRISHNA SURESHBHAI' },
    { id: '57', grNumber: 'SUK250054CE057', name: 'THAKKAR NIYATI BIPINKUMAR' },
    { id: '58', grNumber: 'SUK250054CE058', name: 'SHAH YUVRAJ VIJAYKUMAR' },
    { id: '59', grNumber: 'SUK250054CE059', name: 'PATEL SIYA ANILBHAI' },
    { id: '60', grNumber: 'SUK250054CE060', name: 'CHAUDHARI MEET KETANBHAI' },
    { id: '61', grNumber: 'SUK250054CE061', name: 'PATEL JAL HITESHKUMAR' },
    { id: '62', grNumber: 'SUK250054CE062', name: 'JANI MANAN BHAVESHBHAI' },
    { id: '63', grNumber: 'SUK250054CE063', name: 'PATEL RICHA RAKESHKUMAR' },
    { id: '64', grNumber: 'SUK250054CE064', name: 'SOLANKI ARYAN SANJAYKUMAR' },
    { id: '65', grNumber: 'SUK250054CE065', name: 'DESAI TANYA BHARATBHAI' },
    { id: '66', grNumber: 'SUK250054CE066', name: 'PATEL VIVAN ASHOKBHAI' },
    { id: '67', grNumber: 'SUK250054CE067', name: 'SHAH FORAM DIPAKBHAI' },
    { id: '68', grNumber: 'SUK250054CE068', name: 'PRAJAPATI HARSH PRAVINBHAI' },
    { id: '69', grNumber: 'SUK250054CE069', name: 'PATEL JANKI KIRANBHAI' },
    { id: '70', grNumber: 'SUK250054CE070', name: 'THAKKAR DEEP SUNILKUMAR' },
    { id: '71', grNumber: 'SUK250054CE071', name: 'PATEL AAROHI JITENDRABHAI' },
    { id: '72', grNumber: 'SUK250054CE072', name: 'MODI VEER MANOJBHAI' },
    { id: '73', grNumber: 'SUK250054CE073', name: 'JOSHI SNEHA NILESHBHAI' },
    { id: '74', grNumber: 'SUK250054CE074', name: 'PATEL DHRUVI MUKESHBHAI' },
    { id: '75', grNumber: 'SUK250054CE075', name: 'DAVE KUSHAL VINODBHAI' },
    { id: '76', grNumber: 'SUK250054CE076', name: 'PATEL MAHEK PRAKASHBHAI' },
    { id: '77', grNumber: 'SUK250054CE077', name: 'SHARMA ANSH JAYESHBHAI' },
    { id: '78', grNumber: 'SUK250054CE078', name: 'PATEL RIDDHI RAMESHBHAI' },
    { id: '79', grNumber: 'SUK250054CE079', name: 'GANDHI KETAN AMITBHAI' },
    { id: '80', grNumber: 'SUK250054CE080', name: 'PATEL PALAK DINESHBHAI' },
    { id: '81', grNumber: 'SUK250054CE081', name: 'DESAI RAJ HASMUKHBHAI' },
    { id: '82', grNumber: 'SUK250054CE082', name: 'PATEL CHARMI RAJESHBHAI' },
    { id: '83', grNumber: 'SUK250054CE083', name: 'THAKKAR NEEL PRAFULBHAI' },
    { id: '84', grNumber: 'SUK250054CE084', name: 'PATEL VIDHI SURESHBHAI' },
    { id: '85', grNumber: 'SUK250054CE085', name: 'SHAH KRISH BIPINKUMAR' },
    { id: '86', grNumber: 'SUK250054CE086', name: 'PATEL HEER VIJAYKUMAR' },
    { id: '87', grNumber: 'SUK250054CE087', name: 'CHAUDHARI MANN ANILBHAI' },
    { id: '88', grNumber: 'SUK250054CE088', name: 'PATEL TVISHA KETANBHAI' },
    { id: '89', grNumber: 'SUK250054CE089', name: 'JANI PARTH HITESHBHAI' },
    { id: '90', grNumber: 'SUK250054CE090', name: 'PATEL DHARA BHAVESHBHAI' },
    { id: '91', grNumber: 'SUK250054CE091', name: 'CHAUDHARI SAHIL VINUBHAI' },
    { id: '92', grNumber: 'SUK250054CE092', name: 'SWARAJ PRAJAPATI' },
    { id: '93', grNumber: 'SUK250054CE093', name: 'PATEL YASHVI SANJAYKUMAR' },
    { id: '94', grNumber: 'SUK250054CE094', name: 'DESAI VIRAJ BHARATBHAI' },
    { id: '95', grNumber: 'SUK250054CE095', name: 'PATEL SHRUTI ASHOKBHAI' },
    { id: '96', grNumber: 'SUK250054CE096', name: 'SHAH DARSH DIPAKBHAI' },
    { id: '97', grNumber: 'SUK250054CE097', name: 'THAKKAR RIYA PRAVINBHAI' },
    { id: '98', grNumber: 'SUK250054CE100', name: 'PATEL AARUSH KIRANBHAI' },
    { id: '99', grNumber: 'SUK250054CE099', name: 'JOSHI KAVYA SUNILKUMAR' },
    { id: '100', grNumber: 'SUK250054CE100', name: 'PATEL HARSH JITENDRABHAI' },
    { id: '101', grNumber: 'SUK250054CE101', name: 'MODI SWARA MANOJBHAI' },
    { id: '102', grNumber: 'SUK250054CE102', name: 'PATEL ANANYA NILESHBHAI' },
    { id: '103', grNumber: 'SUK250054CE103', name: 'DAVE KRISHNA MUKESHBHAI' },
    { id: '104', grNumber: 'SUK250054CE104', name: 'PATEL MITALI VINODBHAI' },
    { id: '105', grNumber: 'SUK250054CE105', name: 'SHARMA VEDANT PRAKASHBHAI' },
    { id: '106', grNumber: 'SUK250054CE106', name: 'PATEL ISHITA JAYESHBHAI' },
    { id: '107', grNumber: 'SUK250054CE107', name: 'GANDHI ARJUN RAMESHBHAI' },
    { id: '108', grNumber: 'SUK250054CE108', name: 'PATEL KHUSHI AMITBHAI' },
    { id: '109', grNumber: 'SUK250054CE109', name: 'DESAI VATSAL DINESHBHAI' },
    { id: '110', grNumber: 'SUK250054CE110', name: 'PATEL PRIYANSHI HASMUKHBHAI' },
    { id: '111', grNumber: 'SUK250054CE111', name: 'THAKKAR DARSH RAJESHBHAI' },
    { id: '112', grNumber: 'SUK250054CE112', name: 'PATEL MANSI PRAFULBHAI' },
    { id: '113', grNumber: 'SUK250054CE113', name: 'SHAH KRISHA SURESHBHAI' },
    { id: '114', grNumber: 'SUK250054CE114', name: 'PATEL AARAV BIPINKUMAR' },
    { id: '115', grNumber: 'SUK250054CE115', name: 'CHAUDHARI ROSHNI VIJAYKUMAR' },
    { id: '116', grNumber: 'SUK250054CE116', name: 'PATEL VIHA ANILBHAI' },
    { id: '117', grNumber: 'SUK250054CE117', name: 'JANI RUDRA KETANBHAI' },
    { id: '118', grNumber: 'SUK250054CE118', name: 'PATEL URJA HITESHBHAI' },
    { id: '119', grNumber: 'SUK250054CE119', name: 'PRAJAPATI SMIT BHAVESHBHAI' },
    { id: '120', grNumber: 'SUK250054CE120', name: 'PATEL VANI RAKESHKUMAR' },
    { id: '121', grNumber: 'SUK250054CE121', name: 'SOLANKI KARAN MEHULBHAI' },
    { id: '122', grNumber: 'SUK250054CE122', name: 'PATEL DHRUV SANJAYBHAI' },
    { id: '123', grNumber: 'SUK250054CE123', name: 'KHATRI SMIT MANOJ' },
];

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
    const shuffledIds = seededShuffle(RAW_STUDENTS.map(s => s.id), seed);

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
