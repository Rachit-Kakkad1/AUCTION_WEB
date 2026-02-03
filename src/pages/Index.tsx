import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { AuctionStage } from '@/components/AuctionStage';
import { VanguardCard } from '@/components/VanguardCard';
import { useAuctionContext } from '@/context/AuctionContext';

/**
 * Main Auction Page — Index
 * 
 * ENTRY ANIMATION:
 * - Header fades in first (frame)
 * - AuctionStage materializes (focus)
 * - Stats appear (context)
 * - Vanguard cards stagger in (reference)
 */

// Easing for authority
const EASE_ENTER: [number, number, number, number] = [0.0, 0, 0.2, 1];

export default function Index() {
    const {
        students,
        vanguards,
        currentStudent,
        handleSale,
        timeRemaining,
        isTimerRunning,
        startTimer,
        pauseTimer,
        resetTimer,
    } = useAuctionContext();

    const remainingStudents = students.filter((s) => s.status !== 'sold').length;
    const soldStudents = students.filter((s) => s.status === 'sold').length;
    const totalSpent = vanguards.reduce((acc, v) => acc + v.spent, 0);

    return (
        <motion.div
            className="min-h-screen bg-background"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
        >
            {/* Header — enters first */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: EASE_ENTER }}
            >
                <Header auctionActive={true} />
            </motion.div>

            <main className="container mx-auto px-4 py-8 space-y-8">
                {/* Auction Stage — focus element */}
                <motion.div
                    initial={{ opacity: 0, filter: 'blur(12px)', scale: 0.98 }}
                    animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.3, ease: EASE_ENTER }}
                >
                    <AuctionStage
                        currentStudent={currentStudent}
                        vanguards={vanguards}
                        onSale={handleSale}
                        remainingCount={remainingStudents}
                        totalCount={students.length}
                        timeRemaining={timeRemaining}
                        isTimerRunning={isTimerRunning}
                        onStartTimer={startTimer}
                        onPauseTimer={pauseTimer}
                        onResetTimer={resetTimer}
                    />
                </motion.div>

                {/* Stats Summary */}
                <motion.div
                    className="grid grid-cols-3 gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.5, ease: EASE_ENTER }}
                >
                    <div className="glass-card rounded-xl p-4 text-center">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Sold</p>
                        <p className="text-3xl font-black text-primary number-display">{soldStudents}</p>
                    </div>
                    <div className="glass-card rounded-xl p-4 text-center">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Active</p>
                        <p className="text-3xl font-black text-foreground number-display">{remainingStudents}</p>
                    </div>
                    <div className="glass-card rounded-xl p-4 text-center">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Spent</p>
                        <p className="text-3xl font-black text-primary number-display">{totalSpent.toFixed(1)}<span className="text-lg text-muted-foreground">cr</span></p>
                    </div>
                </motion.div>

                {/* Vanguard Leaderboard */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.6, ease: EASE_ENTER }}
                >
                    <h2 className="text-xl font-black text-foreground uppercase tracking-wider mb-4 italic">
                        Vanguard Leaderboard
                    </h2>
                    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
                        {vanguards.map((vanguard, index) => (
                            <motion.div
                                key={vanguard.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.4,
                                    delay: 0.7 + index * 0.08,
                                    ease: EASE_ENTER
                                }}
                            >
                                <VanguardCard vanguard={vanguard} />
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </main>
        </motion.div>
    );
}
