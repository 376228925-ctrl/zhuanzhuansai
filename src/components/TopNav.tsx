import { Share2 } from 'lucide-react';
import type { AppTab } from '../types/tournament';

interface TopNavProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onOpenReport: () => void;
  rosterDirty: boolean;
}

const NAV_ITEMS: Array<{ id: AppTab; label: string }> = [
  { id: 'schedule', label: '赛程' },
  { id: 'standings', label: '榜单' },
  { id: 'players', label: '球员' },
  { id: 'setup', label: '赛制' },
];

export function TopNav({ activeTab, onSelectTab, onOpenReport, rosterDirty }: TopNavProps) {
  return (
    <header className="sticky top-0 z-30 h-[52px] md:h-16 bg-[#F7F8F5]/90 backdrop-blur-md border-b border-[#E4E8E0]">
      <div className="max-w-7xl mx-auto h-full px-4 md:px-8 flex items-center justify-between gap-8">
        {/* Zone 1: Single-element brand wordmark */}
        <button
          type="button"
          onClick={() => onSelectTab('schedule')}
          className="text-lg md:text-xl font-extrabold tracking-tight text-[#142621] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#185A43]"
        >
          轻转匹克
        </button>

        {/* Zone 2: Desktop 4 concise single-line text nav links */}
        <nav aria-label="主导航" className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative py-2 text-sm font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#185A43] ${
                  isActive
                    ? 'text-[#142621] font-semibold'
                    : 'text-[#5A6560] hover:text-[#142621]'
                }`}
              >
                {item.label}
                {item.id === 'players' && rosterDirty ? ' · 需重排' : ''}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#142621]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single primary contextual action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenReport}
            className="min-h-[40px] md:min-h-[40px] px-3.5 md:px-4 py-2 rounded-xl bg-[#142621] text-white text-xs md:text-sm font-medium hover:bg-[#1E3830] active:scale-[0.98] transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#185A43]"
          >
            <Share2 className="w-3.5 h-3.5 text-[#D4F34A]" aria-hidden="true" />
            <span>战报</span>
          </button>
        </div>
      </div>
    </header>
  );
}
