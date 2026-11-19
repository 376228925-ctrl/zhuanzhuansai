import { useEffect, useState } from 'react';
import { Minus, Plus, RotateCcw, X } from 'lucide-react';
import type { Match, Player, ScoringTarget } from '../types/tournament';
import { validateMatchScore } from '../utils/scheduler';

interface ScoreSheetProps {
  match: Match | null;
  playerMap: Map<string, Player>;
  targetScore: ScoringTarget;
  winByTwo: boolean;
  onClose: () => void;
  onSaveScore: (matchId: string, scoreA: number, scoreB: number) => void;
  onClearScore: (matchId: string) => void;
}

export function ScoreSheet({
  match,
  playerMap,
  targetScore,
  winByTwo,
  onClose,
  onSaveScore,
  onClearScore,
}: ScoreSheetProps) {
  const [scoreA, setScoreA] = useState<number>(0);
  const [scoreB, setScoreB] = useState<number>(0);

  useEffect(() => {
    if (!match) return;
    setScoreA(match.scoreA ?? 0);
    setScoreB(match.scoreB ?? 0);
  }, [match]);

  useEffect(() => {
    if (!match) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [match, onClose]);

  if (!match) return null;

  const teamANames = match.teamA.map((id) => playerMap.get(id)?.name ?? '球友').join(' / ');
  const teamBNames = match.teamB.map((id) => playerMap.get(id)?.name ?? '球友').join(' / ');
  const validation = validateMatchScore(scoreA, scoreB, targetScore, winByTwo);

  const presets: Array<[number, number]> = [
    [targetScore, Math.max(0, targetScore - 2)],
    [targetScore, Math.max(0, targetScore - 4)],
    [Math.max(0, targetScore - 2), targetScore],
    [Math.max(0, targetScore - 4), targetScore],
  ];

  const handleConfirm = () => {
    if (!validation.valid) return;
    onSaveScore(match.id, scoreA, scoreB);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-[#142621]/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="score-sheet-title"
      onClick={onClose}
    >
      <div
        className="w-full md:max-w-lg bg-white rounded-t-3xl md:rounded-3xl p-5 sm:p-6 pb-safe shadow-xl border border-[#E4E8E0] max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile grab handle */}
        <div className="md:hidden w-10 h-1.5 bg-[#D8DFD3] rounded-full mx-auto mb-4" aria-hidden="true" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#EFF2EC]">
          <div>
            <h2 id="score-sheet-title" className="text-lg font-bold text-[#142621]">
              第 {match.roundNumber} 轮 · {match.courtNumber}号场记分
            </h2>
            <p className="text-xs text-[#5A6560] mt-1">
              {targetScore}分制 · {winByTwo ? '净胜2分规则' : '先到即胜'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭记分面板"
            className="min-h-[44px] min-w-[44px] -mr-2 -mt-2 flex items-center justify-center rounded-xl text-[#5A6560] hover:bg-[#EFF2EC] hover:text-[#142621] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big Daylight Stepper Scoreboard */}
        <div className="grid grid-cols-2 gap-4 py-5">
          {/* Team A Counter */}
          <div className="bg-[#F7F8F5] rounded-2xl p-4 flex flex-col items-center text-center">
            <span className="text-xs font-medium text-[#5A6560]">A 队</span>
            <p className="text-sm font-semibold text-[#111816] mt-1 line-clamp-1">{teamANames}</p>

            <div
              className={`font-mono tabular-nums text-5xl font-bold my-4 ${
                validation.winner === 'A' ? 'text-[#185A43]' : 'text-[#142621]'
              }`}
              data-testid="score-a-value"
            >
              {scoreA}
            </div>

            <div className="flex items-center gap-3 w-full">
              <button
                type="button"
                onClick={() => setScoreA((v) => Math.max(0, v - 1))}
                aria-label="A队减1分"
                className="flex-1 min-h-[48px] rounded-xl bg-white border border-[#E4E8E0] text-[#142621] flex items-center justify-center hover:bg-[#EFF2EC] active:scale-95 transition-all cursor-pointer"
              >
                <Minus className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setScoreA((v) => Math.min(35, v + 1))}
                aria-label="A队加1分"
                className="flex-1 min-h-[48px] rounded-xl bg-[#142621] text-[#D4F34A] flex items-center justify-center hover:bg-[#1E3830] active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Team B Counter */}
          <div className="bg-[#F7F8F5] rounded-2xl p-4 flex flex-col items-center text-center">
            <span className="text-xs font-medium text-[#5A6560]">B 队</span>
            <p className="text-sm font-semibold text-[#111816] mt-1 line-clamp-1">{teamBNames}</p>

            <div
              className={`font-mono tabular-nums text-5xl font-bold my-4 ${
                validation.winner === 'B' ? 'text-[#185A43]' : 'text-[#142621]'
              }`}
              data-testid="score-b-value"
            >
              {scoreB}
            </div>

            <div className="flex items-center gap-3 w-full">
              <button
                type="button"
                onClick={() => setScoreB((v) => Math.max(0, v - 1))}
                aria-label="B队减1分"
                className="flex-1 min-h-[48px] rounded-xl bg-white border border-[#E4E8E0] text-[#142621] flex items-center justify-center hover:bg-[#EFF2EC] active:scale-95 transition-all cursor-pointer"
              >
                <Minus className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setScoreB((v) => Math.min(35, v + 1))}
                aria-label="B队加1分"
                className="flex-1 min-h-[48px] rounded-xl bg-[#142621] text-[#D4F34A] flex items-center justify-center hover:bg-[#1E3830] active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Fast Court Presets */}
        <div className="pb-4">
          <p className="text-xs text-[#5A6560] mb-2">快捷比分（一键填入）</p>
          <div className="grid grid-cols-4 gap-2">
            {presets.map(([a, b]) => (
              <button
                key={`${a}-${b}`}
                type="button"
                onClick={() => {
                  setScoreA(a);
                  setScoreB(b);
                }}
                className="min-h-[44px] rounded-xl border border-[#E4E8E0] bg-white text-sm font-mono tabular-nums font-semibold text-[#142621] hover:border-[#185A43] hover:bg-[#F7F8F5] active:scale-95 transition-all cursor-pointer"
              >
                {a}:{b}
              </button>
            ))}
          </div>
        </div>

        {/* Validation Feedback */}
        {validation.error && (
          <p role="alert" className="text-xs text-[#B84A39] bg-[#B84A39]/8 rounded-xl px-3.5 py-2.5 mb-4">
            {validation.error}
          </p>
        )}
        {validation.warning && (
          <p className="text-xs text-[#7A5411] bg-[#FEF7E6] rounded-xl px-3.5 py-2.5 mb-4">
            {validation.warning}
          </p>
        )}

        {/* Footer Actions */}
        <div className="flex items-center gap-3 pt-2">
          {match.status === 'completed' && (
            <button
              type="button"
              onClick={() => {
                onClearScore(match.id);
                onClose();
              }}
              aria-label="清除此场比分"
              className="min-h-[48px] px-4 rounded-xl border border-[#E4E8E0] text-sm font-medium text-[#5A6560] hover:text-[#B84A39] hover:border-[#B84A39]/40 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>清除</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!validation.valid}
            className={`flex-1 min-h-[48px] rounded-xl text-sm font-semibold active:scale-[0.98] transition-colors duration-100 ${
              validation.valid
                ? 'bg-[#142621] text-white hover:bg-[#1E3830] cursor-pointer'
                : 'bg-[#E4E8E0] text-[#7A8680] cursor-not-allowed'
            }`}
          >
            确认比分
          </button>
        </div>
      </div>
    </div>
  );
}
