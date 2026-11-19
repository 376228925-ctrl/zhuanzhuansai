import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeftRight,
  ChevronRight,
  Pause,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Timer,
} from 'lucide-react';
import type {
  Match,
  Player,
  PlayerStanding,
  ScheduleFairnessReport,
  TournamentFormat,
  TournamentState,
} from '../types/tournament';
import { MatchCard } from './MatchCard';

interface ScheduleViewProps {
  state: TournamentState;
  standings: PlayerStanding[];
  fairness: ScheduleFairnessReport;
  activeRoundNumber: number;
  onSelectRound: (roundNumber: number) => void;
  onOpenScore: (match: Match) => void;
  onSwapPlayers: (roundNumber: number, playerIdA: string, playerIdB: string) => void;
  onGenerateNextMexicano: () => void;
  onRescheduleRemaining: () => void;
  onGoToStandings: () => void;
  onGoToPlayers: () => void;
}

const FORMAT_LABELS: Record<TournamentFormat, string> = {
  classic: '经典全员转',
  balanced: '水平均衡转',
  mixed: '混双优选转',
  mexicano: '胜者升场制',
};

function formatClock(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function ScheduleView({
  state,
  standings,
  fairness,
  activeRoundNumber,
  onSelectRound,
  onOpenScore,
  onSwapPlayers,
  onGenerateNextMexicano,
  onRescheduleRemaining,
  onGoToStandings,
  onGoToPlayers,
}: ScheduleViewProps) {
  const [swapMode, setSwapMode] = useState(false);
  const [selectedSwapId, setSelectedSwapId] = useState<string | null>(null);

  // Built-in court round countdown timer
  const initialSeconds = state.config.roundMinutes * 60;
  const [secondsLeft, setSecondsLeft] = useState<number>(initialSeconds);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    setSecondsLeft(state.config.roundMinutes * 60);
    setTimerRunning(false);
  }, [state.config.roundMinutes]);

  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);

  // Reset swap selection when changing rounds
  useEffect(() => {
    setSwapMode(false);
    setSelectedSwapId(null);
  }, [activeRoundNumber]);

  const playerMap = useMemo(() => {
    const map = new Map<string, Player>();
    state.players.forEach((p) => map.set(p.id, p));
    return map;
  }, [state.players]);

  const currentRound =
    state.rounds.find((r) => r.roundNumber === activeRoundNumber) ?? state.rounds[0] ?? null;

  const totalMatches = state.rounds.reduce((sum, r) => sum + r.matches.length, 0);
  const completedMatches = state.rounds.reduce(
    (sum, r) => sum + r.matches.filter((m) => m.status === 'completed').length,
    0
  );
  const activePlayerCount = state.players.filter((p) => p.active).length;

  const isLatestRoundCompleted =
    state.rounds.length > 0 &&
    state.rounds[state.rounds.length - 1].matches.every((m) => m.status === 'completed');

  const canSwapCurrentRound =
    currentRound !== null && currentRound.matches.some((m) => m.status !== 'completed');

  const handleSelectSwapPlayer = (playerId: string) => {
    if (!currentRound) return;
    if (!selectedSwapId) {
      setSelectedSwapId(playerId);
      return;
    }
    if (selectedSwapId === playerId) {
      setSelectedSwapId(null);
      return;
    }
    onSwapPlayers(currentRound.roundNumber, selectedSwapId, playerId);
    setSelectedSwapId(null);
    setSwapMode(false);
  };

  return (
    <div className="space-y-5">
      {/* Dark Racquet-Club Tournament Summary Banner */}
      <section className="rounded-3xl bg-[#142621] text-white p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {state.config.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-white/75">
              <span>{state.config.venue || '未设球馆'}</span>
              <span aria-hidden="true">·</span>
              <span>{FORMAT_LABELS[state.config.format]}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{state.config.targetScore}分制</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {activePlayerCount}人 / {state.config.courtCount}片场
              </span>
            </div>
          </div>

          {/* Right: Live Progress + Court Countdown Timer */}
          <div className="flex items-center justify-between md:justify-end gap-4 pt-3 md:pt-0 border-t border-white/10 md:border-t-0">
            <div className="text-left md:text-right">
              <div className="text-[11px] text-white/65">完赛进度</div>
              <div className="font-mono tabular-nums text-lg font-bold text-[#D4F34A]">
                {completedMatches}
                <span className="text-white/50 font-normal">/{totalMatches}场</span>
              </div>
            </div>

            <div className="h-8 w-px bg-white/15" aria-hidden="true" />

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 pr-1">
                <Timer className="w-4 h-4 text-[#D4F34A]" aria-hidden="true" />
                <span
                  className={`font-mono tabular-nums text-lg font-bold ${
                    secondsLeft === 0 ? 'text-[#FF9E8A]' : 'text-white'
                  }`}
                  aria-label="本轮倒计时"
                >
                  {formatClock(secondsLeft)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setTimerRunning((v) => !v)}
                aria-label={timerRunning ? '暂停本轮计时' : '开始本轮计时'}
                className="min-h-[40px] min-w-[40px] rounded-xl bg-white/12 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTimerRunning(false);
                  setSecondsLeft(state.config.roundMinutes * 60);
                }}
                aria-label="重置本轮计时"
                className="min-h-[40px] min-w-[40px] rounded-xl bg-white/8 hover:bg-white/16 text-white/80 flex items-center justify-center transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Mid-tournament Smart Reschedule Alert */}
      {state.rosterDirty && (
        <div className="rounded-2xl bg-[#EEF6F1] border border-[#C6DFD2] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-[#142621]">
              检测到球员阵容有变动（新增或暂离）
            </p>
            <p className="text-xs text-[#456156]">
              已完赛轮次与积分将完整保留，智能引擎可即时重新优化后续未赛轮次。
            </p>
          </div>
          <button
            type="button"
            onClick={onRescheduleRemaining}
            className="min-h-[44px] px-4 rounded-xl bg-[#185A43] text-white text-sm font-medium hover:bg-[#144A37] transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            <span>智能重排未赛轮次</span>
          </button>
        </div>
      )}

      {/* Main Responsive Grid: Left 8-col Courts + Right 4-col Desktop Live Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-4">
          {/* Horizontal Round Selector Strip */}
          <div className="flex items-center justify-between gap-3">
            <div
              role="tablist"
              aria-label="选择比赛轮次"
              className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 flex-1"
            >
              {state.rounds.map((round) => {
                const isActive = currentRound?.roundNumber === round.roundNumber;
                const doneCount = round.matches.filter((m) => m.status === 'completed').length;
                const allDone = round.matches.length > 0 && doneCount === round.matches.length;
                return (
                  <button
                    key={round.roundNumber}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => onSelectRound(round.roundNumber)}
                    className={`min-h-[44px] px-4 rounded-xl text-sm font-medium whitespace-nowrap shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[#142621] text-white font-semibold'
                        : 'bg-white border border-[#E4E8E0] text-[#5A6560] hover:text-[#142621] hover:border-[#C7D0C1]'
                    }`}
                  >
                    <span>第{round.roundNumber}轮</span>
                    <span
                      className={`font-mono tabular-nums text-[11px] ${
                        isActive
                          ? allDone
                            ? 'text-[#D4F34A]'
                            : 'text-white/75'
                          : allDone
                          ? 'text-[#185A43]'
                          : 'text-[#8A948E]'
                      }`}
                    >
                      {doneCount}/{round.matches.length}
                    </span>
                  </button>
                );
              })}

              {state.config.format === 'mexicano' && (
                <button
                  type="button"
                  onClick={onGenerateNextMexicano}
                  disabled={!isLatestRoundCompleted || activePlayerCount < 4}
                  className="min-h-[44px] px-3.5 rounded-xl bg-[#185A43] text-white text-sm font-medium whitespace-nowrap shrink-0 hover:bg-[#144A37] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  <span>生成下轮升场</span>
                </button>
              )}
            </div>
          </div>

          {/* Round Toolbar: Status + Inline Player Swap */}
          {currentRound && (
            <div className="flex items-center justify-between gap-3 px-1">
              <div className="text-xs sm:text-sm text-[#5A6560]">
                <span className="font-semibold text-[#142621]">
                  第 {currentRound.roundNumber} 轮对阵
                </span>
                <span aria-hidden="true" className="mx-1.5">·</span>
                <span>{currentRound.matches.length} 场同时开打</span>
                {currentRound.restingPlayerIds.length > 0 && (
                  <>
                    <span aria-hidden="true" className="mx-1.5">·</span>
                    <span>{currentRound.restingPlayerIds.length} 人轮空</span>
                  </>
                )}
              </div>

              {canSwapCurrentRound && (
                <button
                  type="button"
                  onClick={() => {
                    setSwapMode((v) => !v);
                    setSelectedSwapId(null);
                  }}
                  className={`min-h-[40px] px-3 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                    swapMode
                      ? 'bg-[#142621] text-[#D4F34A]'
                      : 'bg-white border border-[#E4E8E0] text-[#142621] hover:bg-[#EFF2EC]'
                  }`}
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{swapMode ? '完成换人' : '微调换人'}</span>
                </button>
              )}
            </div>
          )}

          {swapMode && (
            <p className="text-xs text-[#142621] bg-[#EEF6F1] border border-[#C6DFD2] rounded-xl px-3.5 py-2.5">
              {selectedSwapId
                ? `已选中「${playerMap.get(selectedSwapId)?.name ?? ''}」，请点击另一位球员完成位置互换。`
                : '请依次点击任意两位未完赛球员（含轮空球员）即可即时互换位置。'}
            </p>
          )}

          {/* Match Cards Grid */}
          {!currentRound || currentRound.matches.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E4E8E0] p-8 text-center space-y-3">
              <p className="text-base font-semibold text-[#142621]">
                当前活跃球员不足 4 人，暂无法排阵
              </p>
              <p className="text-sm text-[#5A6560]">
                请前往「球员」页面添加球友或使用微信接龙一键导入。
              </p>
              <button
                type="button"
                onClick={onGoToPlayers}
                className="min-h-[44px] px-5 rounded-xl bg-[#142621] text-white text-sm font-medium hover:bg-[#1E3830] cursor-pointer"
              >
                去添加球员
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentRound.matches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  playerMap={playerMap}
                  swapMode={swapMode}
                  selectedSwapPlayerId={selectedSwapId}
                  onOpenScore={onOpenScore}
                  onSelectSwapPlayer={handleSelectSwapPlayer}
                />
              ))}
            </div>
          )}

          {/* Resting / Bye Players Row */}
          {currentRound && currentRound.restingPlayerIds.length > 0 && (
            <section className="bg-white rounded-2xl border border-[#E4E8E0] p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2 mb-3">
                <h2 className="text-sm font-semibold text-[#142621]">
                  本轮轮空候场（{currentRound.restingPlayerIds.length}人）
                </h2>
                <span className="text-xs text-[#5A6560]">系统已按最小轮空差自动轮换</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentRound.restingPlayerIds.map((pid) => {
                  const p = playerMap.get(pid);
                  if (!p) return null;
                  const isSelected = swapMode && selectedSwapId === pid;
                  return swapMode ? (
                    <button
                      key={pid}
                      type="button"
                      onClick={() => handleSelectSwapPlayer(pid)}
                      className={`min-h-[44px] px-3.5 rounded-xl text-sm font-medium border transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#142621] text-[#D4F34A] border-[#142621]'
                          : 'bg-[#F7F8F5] text-[#142621] border-[#D8DFD3] hover:border-[#185A43]'
                      }`}
                    >
                      {p.name} · {p.rating.toFixed(1)}
                    </button>
                  ) : (
                    <div
                      key={pid}
                      className="px-3 py-2 rounded-xl bg-[#F7F8F5] text-sm text-[#111816] flex items-center gap-1.5"
                    >
                      <span className="font-medium">{p.name}</span>
                      <span className="text-xs font-mono tabular-nums text-[#5A6560]">
                        {p.rating.toFixed(1)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* Desktop Right Sidebar (Live Standings Preview + Smart Fairness Diagnostics) */}
        <aside className="lg:col-span-4 space-y-4">
          {/* Live Top 4 Standings Preview */}
          <section className="bg-white rounded-2xl border border-[#E4E8E0] p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFF2EC]">
              <h2 className="text-sm font-bold text-[#142621]">实时积分前四</h2>
              <button
                type="button"
                onClick={onGoToStandings}
                className="text-xs font-medium text-[#185A43] hover:text-[#142621] flex items-center gap-0.5 cursor-pointer"
              >
                <span>完整榜单</span>
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>

            <div className="divide-y divide-[#EFF2EC] mt-1">
              {standings.slice(0, 4).map((row) => (
                <div key={row.player.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`font-mono tabular-nums text-xs font-bold w-5 text-center ${
                        row.rank === 1 ? 'text-[#185A43]' : 'text-[#5A6560]'
                      }`}
                    >
                      {row.rank}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#111816] truncate">
                        {row.player.name}
                      </p>
                      <p className="text-xs text-[#5A6560] font-mono tabular-nums">
                        {row.wins}胜{row.losses}负 · DUPR {row.player.rating.toFixed(1)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div
                      className={`font-mono tabular-nums text-sm font-bold ${
                        row.pointDiff > 0
                          ? 'text-[#185A43]'
                          : row.pointDiff < 0
                          ? 'text-[#B84A39]'
                          : 'text-[#5A6560]'
                      }`}
                    >
                      {row.pointDiff > 0 ? `+${row.pointDiff}` : row.pointDiff}
                    </div>
                    <div className="text-[11px] text-[#5A6560]">净胜分</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Algorithmic Fairness Overview */}
          <section className="bg-white rounded-2xl border border-[#E4E8E0] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#185A43]" aria-hidden="true" />
                <h2 className="text-sm font-bold text-[#142621]">智能排阵评估</h2>
              </div>
              <span className="font-mono tabular-nums text-sm font-bold text-[#185A43]">
                {fairness.compositeScore}分
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-[#F7F8F5] rounded-xl p-3">
                <div className="text-[11px] text-[#5A6560]">搭档不重复率</div>
                <div className="font-mono tabular-nums text-lg font-bold text-[#142621] mt-0.5">
                  {fairness.partnerUniquenessPct}%
                </div>
              </div>
              <div className="bg-[#F7F8F5] rounded-xl p-3">
                <div className="text-[11px] text-[#5A6560]">平均对局分差</div>
                <div className="font-mono tabular-nums text-lg font-bold text-[#142621] mt-0.5">
                  {fairness.avgSkillGap.toFixed(2)}
                </div>
              </div>
              <div className="bg-[#F7F8F5] rounded-xl p-3">
                <div className="text-[11px] text-[#5A6560]">上场次数极差</div>
                <div className="font-mono tabular-nums text-lg font-bold text-[#142621] mt-0.5">
                  ≤ {fairness.playCountSpread} 场
                </div>
              </div>
              <div className="bg-[#F7F8F5] rounded-xl p-3">
                <div className="text-[11px] text-[#5A6560]">混双组合占比</div>
                <div className="font-mono tabular-nums text-lg font-bold text-[#142621] mt-0.5">
                  {fairness.mixedTeamPct}%
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
