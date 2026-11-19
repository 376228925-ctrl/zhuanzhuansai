import { useState } from 'react';
import {
  ClipboardPaste,
  Minus,
  PauseCircle,
  PlayCircle,
  Plus,
  RefreshCw,
  Trash2,
  UserPlus,
} from 'lucide-react';
import type { Gender, ParsedPlayerInput, Player } from '../types/tournament';
import { WeChatImportSheet } from './WeChatImportSheet';

interface PlayersViewProps {
  players: Player[];
  playedCountByPlayer: Map<string, number>;
  rosterDirty: boolean;
  onAddPlayer: (input: ParsedPlayerInput) => void;
  onImportPlayers: (inputs: ParsedPlayerInput[], mode: 'append' | 'replace') => void;
  onToggleActive: (playerId: string) => void;
  onUpdateRating: (playerId: string, nextRating: number) => void;
  onUpdateGender: (playerId: string, gender: Gender) => void;
  onRemovePlayer: (playerId: string) => void;
  onRescheduleRemaining: () => void;
}

export function PlayersView({
  players,
  playedCountByPlayer,
  rosterDirty,
  onAddPlayer,
  onImportPlayers,
  onToggleActive,
  onUpdateRating,
  onUpdateGender,
  onRemovePlayer,
  onRescheduleRemaining,
}: PlayersViewProps) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('M');
  const [rating, setRating] = useState<number>(3.5);
  const [formError, setFormError] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const activeCount = players.filter((p) => p.active).length;
  const maleCount = players.filter((p) => p.active && p.gender === 'M').length;
  const femaleCount = players.filter((p) => p.active && p.gender === 'F').length;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setFormError('请输入球员姓名或昵称');
      return;
    }
    if (players.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
      setFormError(`名单中已有「${trimmed}」，请换一个昵称区分`);
      return;
    }
    onAddPlayer({ name: trimmed, gender, rating });
    setName('');
    setFormError(null);
  };

  const nextGenderCycle = (g: Gender): Gender => {
    if (g === 'M') return 'F';
    if (g === 'F') return 'U';
    return 'M';
  };

  const genderText = (g: Gender) => (g === 'M' ? '男' : g === 'F' ? '女' : '未标');

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#142621]">球员与动态阵容</h1>
          <p className="text-xs sm:text-sm text-[#5A6560] mt-1 font-mono tabular-nums">
            活跃 {activeCount} 人 · 共 {players.length} 人 · 男 {maleCount} / 女 {femaleCount}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setImportOpen(true)}
          className="min-h-[44px] px-4 rounded-xl bg-[#142621] text-white text-sm font-medium hover:bg-[#1E3830] active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <ClipboardPaste className="w-4 h-4 text-[#D4F34A]" aria-hidden="true" />
          <span>微信接龙导入</span>
        </button>
      </div>

      {/* Dirty Roster Banner */}
      {rosterDirty && (
        <div className="rounded-2xl bg-[#EEF6F1] border border-[#C6DFD2] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-[#142621]">
              名单已更新，尚未同步到后续赛程
            </p>
            <p className="text-xs text-[#456156]">
              点击重排后，已完成轮次不受影响，新球员或暂离状态将自动生效。
            </p>
          </div>
          <button
            type="button"
            onClick={onRescheduleRemaining}
            className="min-h-[44px] px-4 rounded-xl bg-[#185A43] text-white text-sm font-medium hover:bg-[#144A37] transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            <span>智能重排未赛轮次</span>
          </button>
        </div>
      )}

      {/* Main Split: Left Roster List + Right Quick Add Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Quick Add Player Form (Top on mobile, Right Sidebar on desktop) */}
        <section className="lg:col-span-4 lg:order-2 bg-white rounded-2xl border border-[#E4E8E0] p-5 space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#142621]">临时加人</h2>
            <p className="text-xs text-[#5A6560] mt-0.5">
              支持赛前报名或中途迟到补录
            </p>
          </div>

          <form onSubmit={handleAddSubmit} className="space-y-3.5" noValidate>
            <div>
              <label htmlFor="new-player-name" className="block text-xs font-medium text-[#5A6560] mb-1.5">
                球友昵称
              </label>
              <input
                id="new-player-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (formError) setFormError(null);
                }}
                placeholder="输入姓名或微信昵称"
                maxLength={18}
                className="w-full min-h-[44px] rounded-xl border border-[#D8DFD3] bg-[#F7F8F5] px-3.5 text-sm text-[#111816] placeholder:text-[#8A948E] focus:outline-none focus:border-[#185A43] focus:bg-white transition-colors"
              />
              {formError && (
                <p role="alert" className="text-xs text-[#B84A39] mt-1.5">
                  {formError}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="block text-xs font-medium text-[#5A6560] mb-1.5">性别</span>
                <div className="grid grid-cols-3 gap-1 p-1 bg-[#EFF2EC] rounded-xl">
                  {(['M', 'F', 'U'] as Gender[]).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`min-h-[36px] rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        gender === g
                          ? 'bg-white text-[#142621] font-semibold shadow-xs'
                          : 'text-[#5A6560]'
                      }`}
                    >
                      {genderText(g)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="new-player-rating" className="block text-xs font-medium text-[#5A6560] mb-1.5">
                  DUPR 水平
                </label>
                <select
                  id="new-player-rating"
                  value={rating.toFixed(1)}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full min-h-[44px] rounded-xl border border-[#D8DFD3] bg-[#F7F8F5] px-3 text-sm font-mono tabular-nums text-[#111816] focus:outline-none focus:border-[#185A43]"
                >
                  {[2.5, 2.8, 3.0, 3.2, 3.5, 3.8, 4.0, 4.2, 4.5, 4.8, 5.0].map((r) => (
                    <option key={r} value={r.toFixed(1)}>
                      {r.toFixed(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full min-h-[46px] rounded-xl bg-[#185A43] text-white text-sm font-semibold hover:bg-[#144A37] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" aria-hidden="true" />
              <span>加入名单</span>
            </button>
          </form>
        </section>

        {/* Roster List */}
        <section className="lg:col-span-8 lg:order-1 bg-white rounded-2xl border border-[#E4E8E0] overflow-hidden">
          <div className="px-5 py-3.5 bg-[#F7F8F5] border-b border-[#E4E8E0] flex items-center justify-between text-xs text-[#5A6560]">
            <span className="font-semibold text-[#142621]">参赛名单（点击 DUPR 或性别可随时微调）</span>
            <span>支持中途暂离/复出</span>
          </div>

          <div className="divide-y divide-[#EFF2EC]">
            {players.map((player) => {
              const played = playedCountByPlayer.get(player.id) ?? 0;
              return (
                <div
                  key={player.id}
                  className={`px-4 sm:px-5 py-3.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 transition-colors ${
                    player.active ? 'bg-white' : 'bg-[#F7F8F5]/75'
                  }`}
                >
                  {/* Name & status */}
                  <div className="min-w-[120px] flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-semibold text-sm ${
                          player.active ? 'text-[#111816]' : 'text-[#5A6560] line-through'
                        }`}
                      >
                        {player.name}
                      </span>
                      {!player.active && (
                        <span className="text-xs text-[#B84A39] font-medium">已暂离</span>
                      )}
                    </div>
                    <div className="text-xs text-[#5A6560] font-mono tabular-nums mt-0.5">
                      已完赛 {played} 场 · 第{player.joinedRound}轮加入
                    </div>
                  </div>

                  {/* Controls: Gender, DUPR stepper, Pause/Resume, Delete */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onUpdateGender(player.id, nextGenderCycle(player.gender))}
                      aria-label={`切换 ${player.name} 性别，当前 ${genderText(player.gender)}`}
                      className="min-h-[40px] min-w-[44px] px-2.5 rounded-xl bg-[#F7F8F5] border border-[#E4E8E0] text-xs font-medium text-[#142621] hover:border-[#185A43] cursor-pointer"
                    >
                      {genderText(player.gender)}
                    </button>

                    {/* DUPR inline adjuster */}
                    <div className="flex items-center rounded-xl border border-[#E4E8E0] bg-[#F7F8F5] overflow-hidden">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateRating(player.id, Math.max(2.0, Number((player.rating - 0.1).toFixed(1))))
                        }
                        aria-label={`降低 ${player.name} DUPR 评分`}
                        className="min-h-[40px] min-w-[34px] flex items-center justify-center text-[#5A6560] hover:bg-[#E4E8E0] cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2 font-mono tabular-nums text-xs font-semibold text-[#142621]">
                        {player.rating.toFixed(1)}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateRating(player.id, Math.min(6.0, Number((player.rating + 0.1).toFixed(1))))
                        }
                        aria-label={`提高 ${player.name} DUPR 评分`}
                        className="min-h-[40px] min-w-[34px] flex items-center justify-center text-[#5A6560] hover:bg-[#E4E8E0] cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleActive(player.id)}
                      aria-label={player.active ? `暂停 ${player.name} 后续参赛` : `恢复 ${player.name} 参赛`}
                      className={`min-h-[40px] px-3 rounded-xl text-xs font-medium flex items-center gap-1 whitespace-nowrap cursor-pointer transition-colors ${
                        player.active
                          ? 'bg-[#EFF2EC] text-[#142621] hover:bg-[#E4E8E0]'
                          : 'bg-[#185A43] text-white hover:bg-[#144A37]'
                      }`}
                    >
                      {player.active ? (
                        <>
                          <PauseCircle className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>暂离</span>
                        </>
                      ) : (
                        <>
                          <PlayCircle className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>回归</span>
                        </>
                      )}
                    </button>

                    {played === 0 && (
                      <button
                        type="button"
                        onClick={() => onRemovePlayer(player.id)}
                        aria-label={`移除 ${player.name}`}
                        className="min-h-[40px] min-w-[40px] rounded-xl text-[#5A6560] hover:text-[#B84A39] hover:bg-[#B84A39]/10 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <WeChatImportSheet
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={onImportPlayers}
      />
    </div>
  );
}
