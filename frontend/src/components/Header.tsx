import { Menu, Settings, Trophy, Users, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuctionContext } from '@/context/AuctionContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

/**
 * Header — CodingGita Auction Institutional Header
 * 
 * BRAND RULES:
 * - CodingGita is the INSTITUTION
 * - Logo must be visible and respected
 * - No pulsing/flashing status indicators
 * - Calm, grounded, authoritative
 * 
 * COLOR: Black + Gold (not green)
 */

interface HeaderProps {
  auctionActive: boolean;
}

// Gold accent
const GOLD = 'rgba(212, 175, 55, 1)';

export function Header({ auctionActive }: HeaderProps) {
  const { students, vanguards } = useAuctionContext();
  const navigate = useNavigate();

  // Create Leaderboard: Sold students sorted by price (Highest First)
  const soldStudents = students
    .filter((s) => s.status === 'sold')
    .sort((a, b) => (b.soldPrice || 0) - (a.soldPrice || 0));

  const getVanguardDetails = (vanguardId?: string) => {
    const vanguard = vanguards.find((v) => v.id === vanguardId);
    return {
      name: vanguard?.name || 'Unknown',
      color: vanguard?.color || 'gray'
    };
  };

  const getVanguardColorClass = (color: string) => {
    const map: Record<string, string> = {
      emerald: 'text-emerald-400 bg-emerald-400/10',
      blue: 'text-blue-400 bg-blue-400/10',
      amber: 'text-amber-400 bg-amber-400/10',
      rose: 'text-rose-400 bg-rose-400/10',
    };
    return map[color] || 'text-white bg-white/10';
  };

  return (
    <header className="border-b border-white/10 bg-[#0a0a0f]/90 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* ━━━ BRAND LOCKUP ━━━ */}
          <Link to="/" className="flex items-center gap-4 transition-opacity hover:opacity-80">
            {/* CodingGita Logo */}
            <div className="w-11 h-11 flex items-center justify-center">
              <img
                src="/codinggita-logo.png"
                alt="CodingGita"
                className="w-10 h-10 object-contain"
                draggable={false}
              />
            </div>
            <div>
              <h1
                className="text-base sm:text-xl font-bold tracking-tight"
                style={{ color: GOLD }}
              >
                CodingGita Auction
              </h1>
              <p
                className="hidden sm:block text-xs text-white/40 font-medium tracking-wide uppercase select-none cursor-default"
                onDoubleClick={() => navigate('/controller')}
              >
                Official Auction Arena
              </p>
            </div>
          </Link>

          {/* ━━━ RIGHT SECTION ━━━ */}
          <div className="flex items-center gap-4">
            {/* Status indicator — subtle, not attention-grabbing */}
            {auctionActive && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded border border-white/10">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: GOLD }}
                />
                <span className="text-xs font-medium text-white/60 uppercase tracking-wider">
                  Live
                </span>
              </div>
            )}

            {/* HAMBURGER MENU */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[400px] border-l border-white/10 bg-[#0a0a0f] text-white p-0 flex flex-col">
                <SheetHeader className="p-6 border-b border-white/10">
                  <SheetTitle className="text-xl font-bold flex items-center gap-3 uppercase tracking-wider" style={{ color: GOLD }}>
                    <Menu className="w-5 h-5" />
                    MENU
                  </SheetTitle>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">
                    Sold Players Ranking
                  </p>
                </SheetHeader>

                {/* SCROLLABLE LEADERBOARD */}
                <ScrollArea className="flex-1">
                  <div className="p-6 space-y-4">
                    {soldStudents.length === 0 ? (
                      <div className="text-center py-12 text-white/20 flex flex-col items-center gap-2">
                        <Users className="w-12 h-12 opacity-20" />
                        <p className="text-sm font-mono uppercase">No Sales Yet</p>
                      </div>
                    ) : (
                      soldStudents.map((student, index) => {
                        const vanguard = getVanguardDetails(student.soldTo);
                        const isTopThree = index < 3;

                        return (
                          <div
                            key={student.id}
                            className="flex items-center gap-4 p-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-colors"
                          >
                            {/* Rank */}
                            <div className={`
                              flex items-center justify-center w-8 h-8 rounded font-mono font-bold text-sm
                              ${isTopThree ? 'bg-[#D4AF37] text-black' : 'text-white/30 bg-white/5'}
                            `}>
                              {index + 1}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-sm truncate text-white/90">
                                {student.name}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider ${getVanguardColorClass(vanguard.color)}`}>
                                  {vanguard.name}
                                </span>
                              </div>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                              <p className="text-lg font-black font-mono leading-none" style={{ color: GOLD }}>
                                {student.soldPrice?.toFixed(2)}
                              </p>
                              <p className="text-[10px] text-white/40 uppercase tracking-wider">CR</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>

                {/* FOOTER - ADMIN LINK */}
                <div className="p-6 border-t border-white/10 bg-white/5">
                  <Link to="/admin">
                    <Button
                      variant="outline"
                      className="w-full border-white/10 hover:bg-white/10 text-white/60 hover:text-white uppercase tracking-widest font-bold h-12 flex items-center justify-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Admin Control
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
