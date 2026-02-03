import { Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

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
  return (
    <header className="border-b border-white/10 bg-[#0a0a0f]/90 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* ━━━ BRAND LOCKUP ━━━ */}
          <Link to="/auction" className="flex items-center gap-4 transition-opacity hover:opacity-80">
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
                className="text-xl font-bold tracking-tight"
                style={{ color: GOLD }}
              >
                CodingGita Auction
              </h1>
              <p className="text-xs text-white/40 font-medium tracking-wide uppercase">
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

            {/* Admin link */}
            <Link to="/admin">
              <div
                className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/40 hover:text-white/80"
                title="Admin Portal"
              >
                <Settings className="w-5 h-5" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
