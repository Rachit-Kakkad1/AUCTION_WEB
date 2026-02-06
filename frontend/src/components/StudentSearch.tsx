import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useAuctionContext } from '@/context/AuctionContext';
import { Button } from '@/components/ui/button';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';

interface StudentSearchProps {
    trigger?: React.ReactNode;
}

export function StudentSearch({ trigger }: StudentSearchProps) {
    const [open, setOpen] = useState(false);
    const { availableStudents, jumpToStudent } = useAuctionContext();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const handleSelect = (studentId: string) => {
        jumpToStudent(studentId);
        setOpen(false);
    };

    return (
        <>
            {trigger ? (
                <div onClick={() => setOpen(true)} className="cursor-pointer">
                    {trigger}
                </div>
            ) : (
                <Button
                    variant="outline"
                    className="w-9 px-0 sm:w-auto sm:px-4 border-white/10 hover:bg-white/10 text-white/60 hover:text-white"
                    onClick={() => setOpen(true)}
                >
                    <Search className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline-block">Search Student...</span>
                    <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex ml-2">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                </Button>
            )}
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Type a name or GR number..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Available Students">
                        {/* Fixed */}
                        {availableStudents
                            .slice()
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map((student) => (
                                <CommandItem
                                    key={student.id}
                                    value={`${student.name} ${student.grNumber || ''}`}
                                    onSelect={() => handleSelect(student.id)}
                                >
                                    <div className="flex flex-col">
                                        <span className="font-bold">{student.name}</span>
                                        <span className="text-xs text-muted-foreground">ID: {student.grNumber}</span>
                                    </div>
                                </CommandItem>
                            ))}
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    );
}
