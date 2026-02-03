import { useState, useEffect, useRef } from 'react';
import { useAuction } from '@/hooks/useAuction';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    User,
    Hash,
    ArrowRight,
    FastForward,
    ArrowLeft,
    Lock,
    Play,
    Pause,
    RotateCcw,
    Clock,
    Users,
    AlertTriangle,
    CheckCircle,
    Wifi,
    WifiOff,
    ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Vanguard } from '@/types/auction';

/**
 * CONTROLLER PAGE - Operational Cockpit (PASSWORD PROTECTED)
 * 
 * INVARIANTS:
 * - Shows current student (queue[0]) - READ ONLY
 * - Shows next 5-10 students - READ ONLY
 * - "Send to End" affects ONLY queue[1]
 * - NEVER touches queue[0] (current student)
 * - Timer controls: start/pause/reset (explicit only)
 * - Vanguard panel: READ ONLY
 * - NO handleSale, handleSkip, updateSale, undoSale imported
 */

const CONTROLLER_PASSWORD = 'rmj@2024';
const QUEUE_PREVIEW_COUNT = 8; // Show next 8 players

const Controller = () => {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
    const [isOnline, setIsOnline] = useState(true);
    const [selectedVanguard, setSelectedVanguard] = useState<Vanguard | null>(null);
    const syncCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const {
        currentStudent,
        nextStudent,
        vanguards,
        availableStudents,
        sendToEndOfQueue,
        timeRemaining,
        isTimerRunning,
        startTimer,
        pauseTimer,
        resetTimer,
    } = useAuction();

    // Track sync status
    useEffect(() => {
        const checkSync = () => {
            setLastSyncTime(new Date());
            setIsOnline(navigator.onLine);
        };

        // Initial check
        checkSync();

        // Listen for online/offline events
        window.addEventListener('online', () => setIsOnline(true));
        window.addEventListener('offline', () => setIsOnline(false));

        // Periodic sync timestamp update
        syncCheckRef.current = setInterval(checkSync, 5000);

        return () => {
            if (syncCheckRef.current) clearInterval(syncCheckRef.current);
            window.removeEventListener('online', () => setIsOnline(true));
            window.removeEventListener('offline', () => setIsOnline(false));
        };
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === CONTROLLER_PASSWORD) {
            setIsAuthenticated(true);
            toast.success('Controller access granted');
        } else {
            toast.error('Incorrect password');
            setPassword('');
        }
    };

    const handleSendToEnd = () => {
        if (nextStudent) {
            sendToEndOfQueue(nextStudent.id);
            toast.info(`${nextStudent.name} sent to end of queue`);
        }
    };

    // Calculate stats
    const soldCount = vanguards.reduce((acc, v) => acc + v.squad.length, 0);
    const totalSpent = vanguards.reduce((sum, v) => sum + v.spent, 0);

    // Queue preview (next N students after current)
    const queuePreview = availableStudents.slice(1, QUEUE_PREVIEW_COUNT + 1);

    // Soft alerts
    const alerts: { message: string; type: 'warning' | 'info' }[] = [];
    if (availableStudents.length <= 5 && availableStudents.length > 0) {
        alerts.push({ message: `Low queue: only ${availableStudents.length} players left`, type: 'warning' });
    }
    if (!isTimerRunning && timeRemaining > 0 && timeRemaining < 30) {
        alerts.push({ message: 'Timer is paused', type: 'info' });
    }
    const lowBudgetVanguards = vanguards.filter(v => (v.budget - v.spent) < 10);
    if (lowBudgetVanguards.length > 0) {
        alerts.push({ message: `${lowBudgetVanguards.length} vanguard(s) under 10 CR`, type: 'warning' });
    }

    // ━━━ PASSWORD GATE ━━━
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="glass-card-elevated p-8 rounded-2xl w-full max-w-md space-y-6 animate-scale-in">
                    <div className="text-center space-y-2">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                            <Lock className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground">Controller Access</h1>
                        <p className="text-muted-foreground text-sm">Operational cockpit for live auction</p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <Input
                            type="password"
                            placeholder="Controller Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-secondary text-lg h-12"
                        />
                        <Button type="submit" className="w-full h-12 text-lg font-semibold glow-primary">
                            Authenticate
                        </Button>
                        <Link to="/auction" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="w-4 h-4" /> Back to Auction
                        </Link>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl p-4 sticky top-0 z-50">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-foreground">Controller</h1>
                        <p className="text-xs text-muted-foreground">Operational Cockpit</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Health Status */}
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-secondary/50">
                            {isOnline ? (
                                <Wifi className="w-3.5 h-3.5 text-green-500" />
                            ) : (
                                <WifiOff className="w-3.5 h-3.5 text-destructive" />
                            )}
                            <span className="text-[10px] font-mono text-muted-foreground">
                                {isOnline ? 'SYNC' : 'OFFLINE'}
                            </span>
                        </div>
                        <Link to="/auction">
                            <Button variant="outline" size="sm">
                                Main Screen
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Soft Alerts */}
            {alerts.length > 0 && (
                <div className="px-4 pt-3 space-y-2">
                    {alerts.map((alert, idx) => (
                        <div
                            key={idx}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${alert.type === 'warning'
                                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                }`}
                        >
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            {alert.message}
                        </div>
                    ))}
                </div>
            )}

            <main className="flex-1 p-4 space-y-4 overflow-auto">
                {/* Timer Controls */}
                <div className="glass-card rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                Timer Control
                            </span>
                        </div>
                        <span className={`text-2xl font-black font-mono ${timeRemaining <= 3 ? 'text-destructive' :
                            timeRemaining <= 5 ? 'text-destructive animate-pulse' :
                                timeRemaining <= 10 ? 'text-amber-500' : 'text-foreground'
                            }`}>
                            {timeRemaining}s
                        </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {isTimerRunning ? (
                            <Button
                                onClick={pauseTimer}
                                variant="secondary"
                                className="h-12 font-bold gap-2"
                            >
                                <Pause className="w-5 h-5" />
                                Pause
                            </Button>
                        ) : (
                            <Button
                                onClick={startTimer}
                                variant="default"
                                className="h-12 font-bold gap-2 glow-primary"
                            >
                                <Play className="w-5 h-5" />
                                Start
                            </Button>
                        )}
                        <Button
                            onClick={resetTimer}
                            variant="outline"
                            className="h-12 font-bold gap-2 col-span-2"
                        >
                            <RotateCcw className="w-5 h-5" />
                            Reset Timer
                        </Button>
                    </div>
                </div>

                {/* Current Student Card */}
                <div className="glass-card-elevated rounded-2xl p-5 border-l-4 border-primary">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            CURRENT — LOCKED
                        </span>
                    </div>

                    {currentStudent ? (
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                                <User className="w-7 h-7 text-muted-foreground" />
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-xl font-bold text-foreground leading-tight">
                                    {currentStudent.name}
                                </h2>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Hash className="w-3 h-3" />
                                    <span className="font-mono text-xs">{currentStudent.grNumber}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-muted-foreground italic">Auction Complete</p>
                    )}
                </div>

                {/* Next Student + Action */}
                <div className="glass-card rounded-xl p-4 border-l-4 border-amber-500">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <ArrowRight className="w-4 h-4 text-amber-500" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                UP NEXT
                            </span>
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground">
                            #{availableStudents.length > 1 ? '2' : '-'} in queue
                        </span>
                    </div>

                    {nextStudent ? (
                        <>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                                    <User className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-bold text-foreground truncate">
                                        {nextStudent.name}
                                    </h3>
                                    <span className="font-mono text-[10px] text-muted-foreground">
                                        {nextStudent.grNumber}
                                    </span>
                                </div>
                            </div>
                            <Button
                                onClick={handleSendToEnd}
                                variant="secondary"
                                className="w-full h-12 text-sm font-bold gap-2 rounded-xl"
                            >
                                <FastForward className="w-5 h-5" />
                                Send to End of Queue
                            </Button>
                        </>
                    ) : (
                        <p className="text-muted-foreground italic text-center py-3 text-sm">
                            No more students in queue
                        </p>
                    )}
                </div>

                {/* Queue Preview (READ-ONLY) */}
                {queuePreview.length > 0 && (
                    <div className="glass-card rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                    UPCOMING QUEUE
                                </span>
                            </div>
                            <span className="text-[10px] font-mono text-muted-foreground">
                                READ-ONLY
                            </span>
                        </div>
                        <div className="space-y-1.5">
                            {queuePreview.map((student, idx) => (
                                <div
                                    key={student.id}
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg bg-secondary/30"
                                >
                                    <span className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                                        {idx + 2}
                                    </span>
                                    <span className="text-sm font-medium text-foreground truncate flex-1">
                                        {student.name}
                                    </span>
                                    <span className="font-mono text-[10px] text-muted-foreground">
                                        {student.grNumber}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Vanguard Budget Panel (READ-ONLY — TAP TO VIEW SQUAD) */}
                <div className="glass-card rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            VANGUARD BUDGETS
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                            TAP TO VIEW SQUAD
                        </span>
                    </div>
                    <div className="space-y-2">
                        {vanguards.map((v) => {
                            const remaining = v.budget - v.spent;
                            const isLow = remaining < 10;
                            return (
                                <button
                                    key={v.id}
                                    onClick={() => setSelectedVanguard(v)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all active:scale-[0.98] ${isLow
                                        ? 'bg-destructive/10 border border-destructive/20 hover:bg-destructive/15'
                                        : 'bg-secondary/30 hover:bg-secondary/50'
                                        }`}
                                >
                                    <div className={`w-3 h-3 rounded-full bg-vanguard-${v.color}`} />
                                    <span className="text-sm font-medium text-foreground flex-1 truncate text-left">
                                        {v.name}
                                    </span>
                                    <div className="text-right mr-2">
                                        <p className={`text-sm font-bold font-mono ${isLow ? 'text-destructive' : 'text-foreground'}`}>
                                            {remaining.toFixed(1)} CR
                                        </p>
                                        <p className="text-[9px] text-muted-foreground">
                                            Spent: {v.spent.toFixed(1)} • Squad: {v.squad.length}
                                        </p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="glass-card rounded-xl p-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Remaining</p>
                            <p className="text-2xl font-black text-foreground">{availableStudents.length}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Sold</p>
                            <p className="text-2xl font-black text-primary">{soldCount}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Spent</p>
                            <p className="text-2xl font-black text-vanguard-amber">{totalSpent.toFixed(1)}</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer — Health Panel */}
            <footer className="p-3 border-t border-border/50 bg-card/30">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-2">
                        {isOnline ? (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                        ) : (
                            <AlertTriangle className="w-3 h-3 text-destructive" />
                        )}
                        <span>{isOnline ? 'System Connected' : 'Connection Lost'}</span>
                    </div>
                    <span className="font-mono">
                        Last sync: {lastSyncTime.toLocaleTimeString()}
                    </span>
                </div>
            </footer>

            {/* Squad List Sheet (READ-ONLY) */}
            <Sheet open={!!selectedVanguard} onOpenChange={(open) => !open && setSelectedVanguard(null)}>
                <SheetContent side="bottom" className="max-h-[80vh] rounded-t-2xl">
                    {selectedVanguard && (
                        <>
                            <SheetHeader className="pb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full bg-vanguard-${selectedVanguard.color}`} />
                                    <SheetTitle className="text-xl">{selectedVanguard.name}</SheetTitle>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                    <span>Budget: <strong className="text-foreground">{selectedVanguard.budget} CR</strong></span>
                                    <span>Spent: <strong className="text-foreground">{selectedVanguard.spent.toFixed(1)} CR</strong></span>
                                    <span>Remaining: <strong className="text-foreground">{(selectedVanguard.budget - selectedVanguard.spent).toFixed(1)} CR</strong></span>
                                </div>
                            </SheetHeader>

                            <div className="space-y-2 overflow-auto max-h-[50vh]">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        ELECTED PLAYERS ({selectedVanguard.squad.length})
                                    </span>
                                    <span className="text-[10px] font-mono text-muted-foreground">
                                        READ-ONLY
                                    </span>
                                </div>

                                {selectedVanguard.squad.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground italic">
                                        No players elected yet
                                    </div>
                                ) : (
                                    selectedVanguard.squad.map((player, idx) => (
                                        <div
                                            key={player.id}
                                            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/30"
                                        >
                                            <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                                {idx + 1}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-foreground truncate">
                                                    {player.name}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground font-mono">
                                                    GR: {player.grNumber}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold font-mono text-primary">
                                                    {player.soldPrice?.toFixed(2)} CR
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default Controller;
