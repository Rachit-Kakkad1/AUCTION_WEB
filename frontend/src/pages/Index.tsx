import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { AuctionStage } from '@/components/AuctionStage';
import { VanguardCard } from '@/components/VanguardCard';
import { useAuctionContext } from '@/context/AuctionContext';
import { Ban, RotateCcw } from 'lucide-react';

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
        handleUnsold,
        handleReturnFromUnsold,
        timeRemaining,
        isTimerRunning,
        startTimer,
        pauseTimer,
        resetTimer,
        globalFreeze,
        activeAnnouncement,
        sfxTrigger,
    } = useAuctionContext();

    const remainingStudents = students.filter((s) => s.status !== 'sold' && s.status !== 'unsold').length;
    const soldStudents = students.filter((s) => s.status === 'sold').length;
    const unsoldStudents = students.filter((s) => s.status === 'unsold');
    const totalSpent = vanguards.reduce((acc, v) => acc + v.spent, 0);

    return (
        <motion.div
            className="min-h-screen bg-background"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
        >
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_var(--primary)_0%,_transparent_25%)] opacity-[0.03]"
                    animate={{
                        transform: ['translate(0,0)', 'translate(10%, 10%)', 'translate(-5%, 15%)', 'translate(0,0)'],
                    }}
                    transition={{
                        duration: 20,
                        ease: "linear",
                        repeat: Infinity,
                        repeatType: "mirror"
                    }}
                />
            </div>
            {/* Header — enters first */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: EASE_ENTER }}
            >
                <Header auctionActive={true} />
            </motion.div>

            <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-8">
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
                        onUnsold={handleUnsold}
                        remainingCount={remainingStudents}
                        totalCount={students.length}
                        timeRemaining={timeRemaining}
                        isTimerRunning={isTimerRunning}
                        onStartTimer={startTimer}
                        onPauseTimer={pauseTimer}
                        onResetTimer={resetTimer}
                        globalFreeze={globalFreeze}
                        activeAnnouncement={activeAnnouncement}
                        sfxTrigger={sfxTrigger}
                    />
                </motion.div>

                {/* Stats Summary */}
                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.5, ease: EASE_ENTER }}
                >
                    <div className="glass-card rounded-xl p-4 text-center">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Sold</p>
                        <p className="text-3xl font-black text-primary number-display">{soldStudents}</p>
                    </div>
                    <div className="glass-card rounded-xl p-4 text-center">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Unsold</p>
                        <p className="text-3xl font-black text-white/40 number-display">{unsoldStudents.length}</p>
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

                {/* Unsold Players Section — Always visible */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                >
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-black text-white/40 uppercase tracking-wider italic">
                            Unsold Registry
                        </h2>
                        <div className="h-px bg-white/10 flex-1" />
                    </div>

                    {unsoldStudents.length === 0 ? (
                        <div className="p-8 text-center text-white/20 border border-white/5 rounded-lg border-dashed flex flex-col items-center gap-2">
                            <Ban className="w-8 h-8 opacity-50" />
                            <p className="text-sm font-mono uppercase tracking-wide">No unsold players yet</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {unsoldStudents.map((student) => (
                                <div
                                    key={student.id}
                                    onClick={() => handleReturnFromUnsold(student.id)}
                                    className="group p-4 rounded-lg bg-white/5 border border-white/5 flex items-center gap-4 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer relative overflow-hidden"
                                    title="Click to restore to queue"
                                >
                                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center relative z-10 group-hover:bg-primary group-hover:text-black transition-colors">
                                        <Ban className="w-5 h-5 text-white/40 group-hover:text-black transition-colors group-hover:rotate-90 group-hover:scale-0 hidden group-hover:block absolute" />
                                        <RotateCcw className="w-5 h-5 text-black scale-0 group-hover:scale-100 transition-transform absolute" />
                                        <Ban className="w-5 h-5 text-white/40 group-hover:hidden" />
                                    </div>
                                    <div className="relative z-10">
                                        <h3 className="font-bold text-sm text-white/80 group-hover:text-white transition-colors">{student.name}</h3>
                                        <p className="text-xs text-white/40 font-mono group-hover:text-white/60 transition-colors">
                                            {student.grNumber} • <span className="text-primary font-bold group-hover:inline hidden">RESTORE</span>
                                            <span className="group-hover:hidden">UNSOLD</span>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
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
