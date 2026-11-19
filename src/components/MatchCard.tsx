import { ArrowLeftRight, CheckCircle2, Edit3 } from 'lucide-react';
import type { Match, Player } from '../types/tournament';
import { calculateMatchBalance } from '../utils/scheduler';

interface MatchCardProps {
  match: Match;
  playerMap: Map<string, Player>;
  swapMode: boolean;
  selectedSwapPlayerId: string | null;
  onOpenScore: (match: Match) => void;
  onSelectSwapPlayer: (playerId: string) => void;
}

function genderText(gender: Player['gender']): string {
  if (gender === 'M') return '男';
  if (gender === 'F') return '女';
  return '';
}

export function MatchCard({
  match,
  playerMap,
  swapMode,
  selectedSwapPlayerId,
  onOpenScore,
  onSelectSwapPlayer,
}: MatchCardProps) {
  const isCompleted = match.status === 'completed' && match.scoreA !== null && match.scoreB !== null;
  const winnerA = isCompleted && (match.scoreA ?? 0) > (match.scoreB ?? 0);
  const winnerB = isCompleted && (match.scoreB ?? 0) > (match.scoreA ?? 0);
  const balance = calculateMatchBalance(match, playerMap);

  const renderPlayerItem = (playerId: string, align: 'left' | 'right') => {
    const player = playerMap.get(playerId);
    const name = player?.name ?? '未知球友';
    const rating = player ? player.rating.toFixed(1) : '3.5';
    const g = player ? genderText(player.gender) : '';
    const isSelectedForSwap = swapMode && selectedSwapPlayerId === playerId;

    if (swapMode && !isCompleted) {
      return (
        <button
          key={playerId}
          type="button"
          onClick={() => onSelectSwapPlayer(playerId)}
          aria-label={`选择 ${name} 交换位置`}
          aria-pressed={isSelectedForSwap}
          className={`w-full min-h-[44px] px-2.5 py-1.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
            align === 'right' ? 'flex-row-reverse text-right' : ''
          } ${
            isSelectedForSwap
              ? 'bg-[#142621] text-white border-[#142621]'
              : 'bg-[#F7F8F5] text-[#111816] border-[#D8DFD3] hover:border-[#185A43]'
          }`}
        >
          <span className="font-medium text-sm truncate">{name}</span>
          <span
            className={`font-mono tabular-nums text-[11px] shrink-0 ${
              isSelectedForSwap ? 'text-[#D4F34A]' : 'text-[#5A6560]'
            }`}
          >
            {rating}
          </span>
        </button>
      );
    }

    return (
      <div
        key={playerId}
        className={`flex items-baseline gap-1.5 ${
          align === 'right' ? 'justify-end text-right' : 'justify-start text-left'
        }`}
      >
        <span className="font-semibold text-[15px] text-[#111816] truncate">{name}</span>
        <span className="text-xs text-[#5A6560] font-mono tabular-nums shrink-0">
          {g ? `${g} ` : ''}
          {rating}
        </span>
      </div>
    );
  };

  return (
    <article
      className="bg-white rounded-2xl border border-[#E4E8E0] p-4 sm:p-5 transition-colors"
      aria-label={`第${match.roundNumber}轮 ${match.courtNumber}号场`}
    >
      {/* Clean unboxed top metadata row (zero pills) */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#EFF2EC]">
        <div className="flex items-center gap-2 text-xs text-[#5A6560] min-w-0">
          <span className="font-semibold text-[#142621] text-sm whitespace-nowrap">
            {match.courtNumber}号场
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums whitespace-nowrap">
            均势 {balance.balancePct}%
          </span>
          <span aria-hidden="true" className="hidden sm:inline">·</span>
          <span className="hidden sm:inline font-mono tabular-nums whitespace-nowrap">
            DUPR {balance.avgA.toFixed(1)} vs {balance.avgB.toFixed(1)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-medium shrink-0">
          {isCompleted ? (
            <span className="inline-flex items-center gap-1 text-[#185A43]">
              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>已完赛</span>
            </span>
          ) : swapMode ? (
            <span className="inline-flex items-center gap-1 text-[#142621]">
              <ArrowLeftRight className="w-3.5 h-3.5" aria-hidden="true" />
              <span>点击换人</span>
            </span>
          ) : (
            <span className="text-[#5A6560]">待记分</span>
          )}
        </div>
      </div>

      {/* Court matchup core: Team A | Score | Team B */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-4">
        {/* Team A */}
        <div className="space-y-2 min-w-0">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[#5A6560] font-medium">A 队</span>
            {winnerA && (
              <span className="text-[#185A43] font-semibold">胜方</span>
            )}
          </div>
          {match.teamA.map((pid) => renderPlayerItem(pid, 'left'))}
        </div>

        {/* Center Score Display */}
        <div className="flex flex-col items-center justify-center px-2">
          {isCompleted ? (
            <div className="flex items-center gap-1.5 font-mono tabular-nums text-2xl sm:text-[28px] font-bold tracking-tight">
              <span className={winnerA ? 'text-[#185A43]' : 'text-[#5A6560]'}>
                {match.scoreA}
              </span>
              <span className="text-[#C5CCC0] text-lg font-normal">:</span>
              <span className={winnerB ? 'text-[#185A43]' : 'text-[#5A6560]'}>
                {match.scoreB}
              </span>
            </div>
          ) : (
            <span className="font-display font-bold text-sm tracking-wider text-[#9AA59E]">
              VS
            </span>
          )}
        </div>

        {/* Team B */}
        <div className="space-y-2 min-w-0">
          <div className="flex items-center justify-end gap-1.5 text-xs">
            {winnerB && (
              <span className="text-[#185A43] font-semibold">胜方</span>
            )}
            <span className="text-[#5A6560] font-medium">B 队</span>
          </div>
          {match.teamB.map((pid) => renderPlayerItem(pid, 'right'))}
        </div>
      </div>

      {/* Bottom Action Bar */}
      {!swapMode && (
        <div className="pt-3 border-t border-[#EFF2EC] flex items-center justify-between gap-3">
          <span className="text-xs text-[#5A6560] font-mono tabular-nums sm:hidden">
            均分 {balance.avgA.toFixed(1)} / {balance.avgB.toFixed(1)}
          </span>
          <span className="hidden sm:inline text-xs text-[#5A6560]">
            {isCompleted ? '可随时点击修改比分' : '单局结束后点击录入比分'}
          </span>

          <button
            type="button"
            onClick={() => onOpenScore(match)}
            aria-label={`${isCompleted ? '修改' : '录入'} 第${match.roundNumber}轮 ${match.courtNumber}号场 比分`}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#185A43] ${
              isCompleted
                ? 'bg-[#EFF2EC] text-[#142621] hover:bg-[#E4E8E0]'
                : 'bg-[#142621] text-white hover:bg-[#1E3830]'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{isCompleted ? '修改比分' : '录入比分'}</span>
          </button>
        </div>
      )}
    </article>
  );
}
