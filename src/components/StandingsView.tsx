import { useState } from 'react';
import { Award, ChevronRight, Share2 } from 'lucide-react';
import type { PlayerStanding } from '../types/tournament';
import { PlayerDetailContent, PlayerDetailSheet } from './PlayerDetailSheet';

interface StandingsViewProps {
  standings: PlayerStanding[];
  completedMatches: number;
  totalMatches: number;
  onOpenReport: () => void;
}

export function StandingsView({
  standings,
  completedMatches,
  totalMatches,
  onOpenReport,
}: StandingsViewProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(
    standings[0]?.player.id ?? null
  );
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  const selectedStanding =
    standings.find((s) => s.player.id === selectedPlayerId) ?? standings[0] ?? null;

  const topThree = standings.slice(0, 3);

  return (
    <div className="space-y-5">
      {/* Header Row */}
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#142621]">实时积分榜</h1>
          <p className="text-xs sm:text-sm text-[#5A6560] mt-1">
            胜场 · 胜率 · 净胜分 · 总得分 · 已完赛{' '}
            <span className="font-mono tabular-nums">
              {completedMatches}/{totalMatches}
            </span>{' '}
            场
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenReport}
          className="hidden sm:inline-flex min-h-[44px] px-4 rounded-xl bg-[#142621] text-white text-sm font-medium hover:bg-[#1E3830] active:scale-[0.98] transition-all items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Share2 className="w-4 h-4 text-[#D4F34A]" aria-hidden="true" />
          <span>生成微信战报</span>
        </button>
      </div>

      {/* Top 3 Editorial Podium Strip */}
      {topThree.length > 0 && (
        <section aria-label="前三名领奖台" className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {topThree.map((item, idx) => {
            const isFirst = idx === 0;
            const rankLabels = ['第 1 名 · 领跑', '第 2 名', '第 3 名'];
            return (
              <button
                key={item.player.id}
                type="button"
                onClick={() => {
                  setSelectedPlayerId(item.player.id);
                  setMobileSheetOpen(true);
                }}
                className={`rounded-2xl p-5 text-left transition-all cursor-pointer active:scale-[0.99] ${
                  isFirst
                    ? 'bg-[#142621] text-white'
                    : 'bg-white border border-[#E4E8E0] text-[#111816] hover:border-[#C5D0BF]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-xs font-semibold ${
                      isFirst ? 'text-[#D4F34A]' : 'text-[#5A6560]'
                    }`}
                  >
                    {rankLabels[idx]}
                  </span>
                  {isFirst && <Award className="w-4 h-4 text-[#D4F34A]" aria-hidden="true" />}
                </div>
                <div className="mt-2.5 flex items-baseline justify-between gap-2">
                  <span className="text-lg font-bold truncate">{item.player.name}</span>
                  <span
                    className={`font-mono tabular-nums text-lg font-bold ${
                      isFirst
                        ? 'text-[#D4F34A]'
                        : item.pointDiff >= 0
                        ? 'text-[#185A43]'
                        : 'text-[#B84A39]'
                    }`}
                  >
                    {item.pointDiff > 0 ? `+${item.pointDiff}` : item.pointDiff}
                  </span>
                </div>
                <div
                  className={`mt-1.5 text-xs font-mono tabular-nums flex items-center gap-2 ${
                    isFirst ? 'text-white/75' : 'text-[#5A6560]'
                  }`}
                >
                  <span>
                    {item.wins}胜 {item.losses}负
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    胜率 {item.played > 0 ? `${Math.round(item.winRate * 100)}%` : '--'}
                  </span>
                </div>
              </button>
            );
          })}
        </section>
      )}

      {/* Main Split: Left Standings Table + Right Desktop Player Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section className="lg:col-span-8 bg-white rounded-2xl border border-[#E4E8E0] overflow-hidden">
          <div className="grid grid-cols-[30px_minmax(96px,1fr)_50px_52px_48px_18px] sm:grid-cols-[56px_1fr_92px_88px_88px_32px] items-center gap-1 sm:gap-2 px-3 sm:px-4 py-3 bg-[#F7F8F5] border-b border-[#E4E8E0] text-xs font-semibold text-[#5A6560]">
            <span className="text-center">#</span>
            <span>球员</span>
            <span className="text-right">胜负</span>
            <span className="text-right">净胜</span>
            <span className="text-right">胜率</span>
            <span aria-hidden="true" />
          </div>

          <div className="divide-y divide-[#EFF2EC]">
            {standings.map((row) => {
              const isSelected = selectedStanding?.player.id === row.player.id;
              return (
                <button
                  key={row.player.id}
                  type="button"
                  onClick={() => {
                    setSelectedPlayerId(row.player.id);
                    setMobileSheetOpen(true);
                  }}
                  aria-label={`查看 ${row.player.name} 详细战绩，第${row.rank}名`}
                  className={`w-full min-h-[60px] grid grid-cols-[30px_minmax(96px,1fr)_50px_52px_48px_18px] sm:grid-cols-[56px_1fr_92px_88px_88px_32px] items-center gap-1 sm:gap-2 px-3 sm:px-4 py-3 text-left transition-colors cursor-pointer ${
                    isSelected ? 'bg-[#EEF6F1]/70' : 'hover:bg-[#F7F8F5]'
                  }`}
                >
                  <span
                    className={`font-mono tabular-nums text-sm font-bold text-center ${
                      row.rank <= 3 ? 'text-[#185A43]' : 'text-[#5A6560]'
                    }`}
                  >
                    {row.rank}
                  </span>

                  <div className="min-w-0 pr-1">
                    <div className="font-semibold text-sm text-[#111816] truncate">
                      {row.player.name}
                      {!row.player.active && (
                        <span className="ml-1 text-xs font-normal text-[#5A6560]">(暂离)</span>
                      )}
                    </div>
                    <div className="text-[11px] sm:text-xs text-[#5A6560] font-mono tabular-nums whitespace-nowrap">
                      DUPR {row.player.rating.toFixed(1)}
                      <span className="hidden sm:inline"> · 得{row.pointsFor}分</span>
                    </div>
                  </div>

                  <span className="font-mono tabular-nums text-sm font-semibold text-[#142621] text-right whitespace-nowrap">
                    {row.wins}-{row.losses}
                  </span>

                  <span
                    className={`font-mono tabular-nums text-sm font-bold text-right whitespace-nowrap ${
                      row.pointDiff > 0
                        ? 'text-[#185A43]'
                        : row.pointDiff < 0
                        ? 'text-[#B84A39]'
                        : 'text-[#5A6560]'
                    }`}
                  >
                    {row.pointDiff > 0 ? `+${row.pointDiff}` : row.pointDiff}
                  </span>

                  <span className="font-mono tabular-nums text-xs sm:text-sm text-[#5A6560] text-right whitespace-nowrap">
                    {row.played > 0 ? `${Math.round(row.winRate * 100)}%` : '--'}
                  </span>

                  <ChevronRight className="w-4 h-4 text-[#9AA59E] justify-self-end" aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </section>

        {/* Desktop Side Panel for Selected Player */}
        <aside className="hidden lg:block lg:col-span-4 bg-white rounded-2xl border border-[#E4E8E0] p-5 sticky top-24">
          {selectedStanding ? (
            <PlayerDetailContent standing={selectedStanding} />
          ) : (
            <p className="text-sm text-[#5A6560]">选择左侧任意球员查看详细战绩</p>
          )}
        </aside>
      </div>

      {/* Mobile Player Detail Bottom Sheet */}
      {mobileSheetOpen && (
        <PlayerDetailSheet
          standing={selectedStanding}
          onClose={() => setMobileSheetOpen(false)}
        />
      )}
    </div>
  );
}
