import { CalendarDays, SlidersHorizontal, Trophy, Users } from 'lucide-react';
import type { AppTab } from '../types/tournament';

interface BottomNavProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  rosterDirty: boolean;
}

const TABS: Array<{
  id: AppTab;
  label: string;
  icon: typeof CalendarDays;
}> = [
  { id: 'schedule', label: '赛程', icon: CalendarDays },
  { id: 'standings', label: '榜单', icon: Trophy },
  { id: 'players', label: '球员', icon: Users },
  { id: 'setup', label: '赛制', icon: SlidersHorizontal },
];

export function BottomNav({ activeTab, onSelectTab, rosterDirty }: BottomNavProps) {
  return (
    <nav
      aria-label="底部导航"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E4E8E0] pb-safe"
    >
      <div className="grid grid-cols-4 h-[60px] items-center">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`min-h-[48px] flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#185A43] ${
                isActive ? 'text-[#142621]' : 'text-[#5A6560]'
              }`}
            >
              <span className="relative flex items-center justify-center">
                <Icon
                  className={`w-[21px] h-[21px] ${isActive ? 'stroke-[2.3] text-[#185A43]' : 'stroke-[1.8]'}`}
                  aria-hidden="true"
                />
                {tab.id === 'players' && rosterDirty && (
                  <span
                    aria-label="阵容已变动需重排"
                    className="absolute -top-0.5 -right-1.5 text-[10px] font-bold text-[#B84A39]"
                  >
                    !
                  </span>
                )}
              </span>
              <span
                className={`text-[11px] leading-none tracking-tight ${
                  isActive ? 'font-semibold text-[#142621]' : 'font-medium text-[#5A6560]'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
