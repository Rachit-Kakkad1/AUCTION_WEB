import { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    ShoppingCart,
    XCircle,
    FastForward,
    RotateCcw,
    Clock
} from 'lucide-react';

interface HistoryEntry {
    id: string;
    type: 'SALE' | 'UNSOLD' | 'SKIP' | 'UNDO';
    message: string;
    timestamp: string;
    details?: any;
}

interface ActionLogProps {
    history: HistoryEntry[];
}

export function ActionLog({ history }: ActionLogProps) {
    const scrollEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new entry
    useEffect(() => {
        if (scrollEndRef.current) {
            scrollEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [history]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'SALE': return <ShoppingCart className="w-3.5 h-3.5 text-green-400" />;
            case 'UNSOLD': return <XCircle className="w-3.5 h-3.5 text-red-400" />;
            case 'SKIP': return <FastForward className="w-3.5 h-3.5 text-amber-400" />;
            case 'UNDO': return <RotateCcw className="w-3.5 h-3.5 text-blue-400" />;
            default: return <Clock className="w-3.5 h-3.5 text-muted-foreground" />;
        }
    };

    const getTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div className="glass-card rounded-xl overflow-hidden flex flex-col h-[300px]">
            <div className="p-3 border-b border-white/10 flex items-center gap-2 bg-white/5">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Live Action Log
                </span>
                <span className="ml-auto text-[10px] text-white/30 font-mono">
                    {(history || []).length} EVENTS
                </span>
            </div>

            <ScrollArea className="flex-1 p-0">
                <div className="flex flex-col">
                    {(history || []).length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-xs italic">
                            No actions recorded yet...
                        </div>
                    ) : (
                        (history || []).map((entry) => (
                            <div
                                key={entry.id}
                                className="flex items-start gap-3 p-3 border-b border-white/5 hover:bg-white/5 transition-colors text-sm"
                            >
                                <div className="mt-0.5 opacity-80">
                                    {getIcon(entry.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-0.5">
                                        <span className={`font-bold text-[10px] px-1.5 py-0.5 rounded ${entry.type === 'SALE' ? 'bg-green-500/20 text-green-400' :
                                            entry.type === 'UNSOLD' ? 'bg-red-500/20 text-red-400' :
                                                entry.type === 'SKIP' ? 'bg-amber-500/20 text-amber-400' :
                                                    'bg-blue-500/20 text-blue-400'
                                            }`}>
                                            {entry.type}
                                        </span>
                                        <span className="text-[10px] font-mono text-muted-foreground">
                                            {getTime(entry.timestamp)}
                                        </span>
                                    </div>
                                    <p className="text-white/80 text-xs leading-normal">
                                        {entry.message}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={scrollEndRef} />
                </div>
            </ScrollArea>
        </div>
    );
}
