import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Database, Download, Upload, AlertTriangle, FileJson } from 'lucide-react';
import { loadState } from '@/lib/auctionStore';
import { toast } from 'sonner';

interface DataManagerProps {
    onImport: (data: any) => void;
}

export function DataManager({ onImport }: DataManagerProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isImporting, setIsImporting] = useState(false);

    const handleExport = () => {
        try {
            const state = loadState();
            if (!state) throw new Error('No state to export');

            const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `auction-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success('Backup exported successfully');
        } catch (err) {
            console.error(err);
            toast.error('Export failed');
        }
    };

    const handleImportClick = () => {
        // Trigger file input
        fileInputRef.current?.click();
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!confirm('WARNING: This will OVERWRITE the entire auction state. This cannot be undone. Are you sure?')) {
            if (fileInputRef.current) fileInputRef.current.value = ''; // Reset
            return;
        }

        setIsImporting(true);
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                onImport(json);
                toast.success('System state restored successfully');
            } catch (err) {
                console.error(err);
                toast.error('Invalid backup file');
            } finally {
                setIsImporting(false);
                if (fileInputRef.current) fileInputRef.current.value = ''; // Reset
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="glass-card rounded-xl p-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Data Management
            </h3>

            <div className="grid grid-cols-2 gap-3">
                <Button
                    variant="outline"
                    onClick={handleExport}
                    className="h-20 flex-col gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary hover:border-primary/50"
                >
                    <Download className="w-6 h-6" />
                    <span className="text-xs font-bold">EXPORT BACKUP</span>
                </Button>

                <Button
                    variant="outline"
                    onClick={handleImportClick}
                    disabled={isImporting}
                    className="h-20 flex-col gap-2 border-amber-500/20 hover:bg-amber-500/5 hover:text-amber-500 hover:border-amber-500/50"
                >
                    <Upload className="w-6 h-6" />
                    <span className="text-xs font-bold">{isImporting ? 'RESTORING...' : 'IMPORT BACKUP'}</span>
                </Button>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-secondary/30 border border-white/5 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                <div className="space-y-1">
                    <p className="text-xs font-bold text-foreground">Disaster Recovery</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                        Export regular backups. Importing a file will completely replace the current auction state, including queue, sales, and budgets.
                    </p>
                </div>
            </div>

            {/* Hidden Input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={onFileChange}
                accept=".json"
                className="hidden"
            />
        </div>
    );
}
