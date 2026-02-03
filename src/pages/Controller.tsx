import { useState } from 'react';
import { useAuction } from '@/hooks/useAuction';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Hash, ArrowRight, FastForward, ArrowLeft, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

/**
 * CONTROLLER PAGE - Mobile View (PASSWORD PROTECTED)
 * 
 * INVARIANTS:
 * - Shows current student (queue[0]) - READ ONLY
 * - Shows next student (queue[1]) - READ ONLY
 * - "Next" button sends queue[1] to END of queue
 * - NEVER touches queue[0] (current student)
 * - NEVER affects timer
 */

const CONTROLLER_PASSWORD = 'admin@2026';

const Controller = () => {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const {
        currentStudent,
        nextStudent,
        vanguards,
        availableStudents,
        sendToEndOfQueue,
    } = useAuction();

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
        }
    };

    // Calculate stats
    const soldCount = vanguards.reduce((acc, v) => acc + v.squad.length, 0);
    const totalSpent = vanguards.reduce((sum, v) => sum + v.spent, 0);

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
                        <p className="text-muted-foreground text-sm">Enter password to manage queue</p>
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
            <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-foreground">Controller</h1>
                        <p className="text-xs text-muted-foreground">Queue Management</p>
                    </div>
                    <Link to="/auction">
                        <Button variant="outline" size="sm">
                            Main Screen
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="flex-1 p-4 space-y-6">
                {/* Current Student Card */}
                <div className="glass-card-elevated rounded-2xl p-6 space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            Currently Active
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

                {/* Next Student Card */}
                <div className="glass-card rounded-xl p-6 space-y-4 border-l-4 border-amber-500">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ArrowRight className="w-4 h-4 text-amber-500" />
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                Up Next
                            </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                            #{availableStudents.length > 1 ? '2' : '-'} in queue
                        </span>
                    </div>

                    {nextStudent ? (
                        <>
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                                    <User className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <div className="space-y-1 flex-1">
                                    <h3 className="text-lg font-bold text-foreground leading-tight">
                                        {nextStudent.name}
                                    </h3>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Hash className="w-3 h-3" />
                                        <span className="font-mono text-xs">{nextStudent.grNumber}</span>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={handleSendToEnd}
                                variant="secondary"
                                className="w-full h-14 text-lg font-bold gap-3 rounded-xl"
                            >
                                <FastForward className="w-6 h-6" />
                                Send to End of Queue
                            </Button>
                        </>
                    ) : (
                        <p className="text-muted-foreground italic text-center py-4">
                            No more students in queue
                        </p>
                    )}
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

            {/* Footer */}
            <footer className="p-4 text-center text-xs text-muted-foreground border-t border-border/50">
                Controller View • Read-only access to current student
            </footer>
        </div>
    );
};

export default Controller;
