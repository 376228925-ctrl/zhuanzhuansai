import { useState } from 'react';
import { Download, RefreshCw, RotateCcw, Shuffle, Sparkles } from 'lucide-react';
import type {
  ScheduleFairnessReport,
  ScoringTarget,
  TournamentConfig,
  TournamentFormat,
  TournamentState,
} from '../types/tournament';
import { getRecommendedRounds } from '../utils/scheduler';

interface SetupViewProps {
  state: TournamentState;
  fairness: ScheduleFairnessReport;
  onApplyConfigAndGenerate: (config: TournamentConfig) => void;
  onShuffleSchedule: () => void;
  onResetDemo: () => void;
}

const HERO_IMAGE_URL = '/src/assets/images/pickleball_court_hero_1795077383246.jpg';

const FORMAT_OPTIONS: Array<{
  id: TournamentFormat;
  title: string;
  desc: string;
}> = [
  {
    id: 'classic',
    title: '经典全员转',
    desc: '优先最大化不重复搭档（8人2场7轮可达100%全搭档）并均分轮空次数。',
  },
  {
    id: 'balanced',
    title: '水平均衡转',
    desc: '按 DUPR 评分动态平衡每场双方均分，减少悬殊局，同时避免搭档重复。',
  },
  {
    id: 'mixed',
    title: '混双优选转',
    desc: '自动识别男女球员，优先匹配混双搭档并平衡对手实力。',
  },
  {
    id: 'mexicano',
    title: '胜者升场制',
    desc: '每轮结束后根据实时积分榜动态生成下轮对阵，前四自动会师1号王座场。',
  },
];

export function SetupView({
  state,
  fairness,
  onApplyConfigAndGenerate,
  onShuffleSchedule,
  onResetDemo,
}: SetupViewProps) {
  const [title, setTitle] = useState(state.config.title);
  const [venue, setVenue] = useState(state.config.venue);
  const [format, setFormat] = useState<TournamentFormat>(state.config.format);
  const [courtCount, setCourtCount] = useState<number>(state.config.courtCount);
  const [totalRounds, setTotalRounds] = useState<number>(state.config.totalRounds);
  const [targetScore, setTargetScore] = useState<ScoringTarget>(state.config.targetScore);
  const [winByTwo, setWinByTwo] = useState<boolean>(state.config.winByTwo);
  const [roundMinutes, setRoundMinutes] = useState<number>(state.config.roundMinutes);
  const [imgFailed, setImgFailed] = useState(false);

  const activePlayers = state.players.filter((p) => p.active).length;
  const maxCourts = Math.max(1, Math.min(6, Math.floor(activePlayers / 4) || 1));
  const recommendedRounds = getRecommendedRounds(activePlayers, courtCount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyConfigAndGenerate({
      title: title.trim() || '匹克球智能转转赛',
      venue: venue.trim(),
      format,
      courtCount: Math.min(courtCount, maxCourts),
      totalRounds: Math.max(1, Math.min(15, totalRounds)),
      targetScore,
      winByTwo,
      roundMinutes,
    });
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.config.title.replace(/\s+/g, '_')}_存档.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Editorial Court Hero Banner with Scrim & Zero-Broken-Image Fallback */}
      <section className="relative rounded-3xl overflow-hidden bg-[#142621] min-h-[180px] sm:min-h-[210px] flex items-end">
        {!imgFailed ? (
          <img
            src={HERO_IMAGE_URL}
            alt="阳光下的匹克球场与碳纤维球拍"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-br from-[#185A43] via-[#142621] to-[#0D1A16]"
          />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#142621]/92 via-[#142621]/55 to-[#142621]/20"
        />

        <div className="relative z-10 w-full p-5 sm:p-7 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-[#D4F34A]">智能赛制与排阵中心</p>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              自定义转转赛规则
            </h1>
            <p className="text-xs sm:text-sm text-white/80">
              当前 {activePlayers} 位活跃球员 · 最多可同时开 {maxCourts} 片场地
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onShuffleSchedule}
              className="min-h-[44px] px-4 rounded-xl bg-white/15 backdrop-blur-sm text-white text-xs sm:text-sm font-medium hover:bg-white/25 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Shuffle className="w-4 h-4 text-[#D4F34A]" aria-hidden="true" />
              <span>换一套排阵</span>
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8-col Config Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-8 bg-white rounded-2xl border border-[#E4E8E0] p-5 sm:p-6 space-y-6"
        >
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="setup-title" className="block text-xs font-semibold text-[#5A6560] mb-1.5">
                赛事名称
              </label>
              <input
                id="setup-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-[#D8DFD3] bg-[#F7F8F5] px-3.5 text-sm text-[#111816] focus:outline-none focus:border-[#185A43] focus:bg-white"
              />
            </div>
            <div>
              <label htmlFor="setup-venue" className="block text-xs font-semibold text-[#5A6560] mb-1.5">
                球馆与场地说明
              </label>
              <input
                id="setup-venue"
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="例如：滨江匹克球公园 1-2号场"
                className="w-full min-h-[44px] rounded-xl border border-[#D8DFD3] bg-[#F7F8F5] px-3.5 text-sm text-[#111816] focus:outline-none focus:border-[#185A43] focus:bg-white"
              />
            </div>
          </div>

          {/* Smart Format Selector */}
          <div className="space-y-2.5">
            <span className="block text-xs font-semibold text-[#5A6560]">智能排阵赛制</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FORMAT_OPTIONS.map((opt) => {
                const selected = format === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFormat(opt.id)}
                    aria-pressed={selected}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      selected
                        ? 'bg-[#142621] border-[#142621] text-white'
                        : 'bg-[#F7F8F5] border-[#E4E8E0] text-[#111816] hover:border-[#185A43]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">{opt.title}</span>
                      {selected && (
                        <span className="text-[11px] font-semibold text-[#D4F34A]">已选择</span>
                      )}
                    </div>
                    <p
                      className={`text-xs mt-1.5 leading-relaxed ${
                        selected ? 'text-white/75' : 'text-[#5A6560]'
                      }`}
                    >
                      {opt.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Courts, Rounds, Scoring */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#EFF2EC]">
            <div>
              <span className="block text-xs font-semibold text-[#5A6560] mb-1.5">
                开场数量（最多 {maxCourts} 片）
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {(maxCourts <= 3 ? [1, 2, 3] : [1, 2, 3, 4, 5, 6].slice(0, maxCourts)).map((n) => {
                  const disabled = n > maxCourts;
                  return (
                    <button
                      key={n}
                      type="button"
                      disabled={disabled}
                      onClick={() => setCourtCount(n)}
                      className={`min-h-[44px] rounded-xl font-mono tabular-nums text-sm font-semibold border transition-colors cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed ${
                        courtCount === n
                          ? 'bg-[#142621] text-white border-[#142621]'
                          : 'bg-[#F7F8F5] text-[#142621] border-[#E4E8E0]'
                      }`}
                    >
                      {n}片
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="setup-rounds" className="text-xs font-semibold text-[#5A6560]">
                  总轮次数
                </label>
                <button
                  type="button"
                  onClick={() => setTotalRounds(recommendedRounds)}
                  className="text-[11px] font-medium text-[#185A43] hover:underline cursor-pointer"
                >
                  推荐 {recommendedRounds} 轮
                </button>
              </div>
              <input
                id="setup-rounds"
                type="number"
                min={1}
                max={15}
                value={totalRounds}
                onChange={(e) => setTotalRounds(Math.max(1, Math.min(15, Number(e.target.value) || 1)))}
                className="w-full min-h-[44px] rounded-xl border border-[#D8DFD3] bg-[#F7F8F5] px-3.5 text-sm font-mono tabular-nums text-[#111816] focus:outline-none focus:border-[#185A43] focus:bg-white"
              />
            </div>

            <div>
              <span className="block text-xs font-semibold text-[#5A6560] mb-1.5">单局分制</span>
              <div className="grid grid-cols-3 gap-1.5">
                {([11, 15, 21] as ScoringTarget[]).map((pts) => (
                  <button
                    key={pts}
                    type="button"
                    onClick={() => setTargetScore(pts)}
                    className={`min-h-[44px] rounded-xl font-mono tabular-nums text-sm font-semibold border transition-colors cursor-pointer ${
                      targetScore === pts
                        ? 'bg-[#142621] text-white border-[#142621]'
                        : 'bg-[#F7F8F5] text-[#142621] border-[#E4E8E0]'
                    }`}
                  >
                    {pts}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Win by 2 + Timer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#EFF2EC]">
            <label className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[#F7F8F5] cursor-pointer">
              <div>
                <div className="text-sm font-semibold text-[#142621]">净胜 2 分校验</div>
                <div className="text-xs text-[#5A6560]">达到目标分时提醒需净胜 2 分</div>
              </div>
              <input
                type="checkbox"
                checked={winByTwo}
                onChange={(e) => setWinByTwo(e.target.checked)}
                className="w-5 h-5 accent-[#185A43] cursor-pointer"
              />
            </label>

            <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[#F7F8F5]">
              <div>
                <label htmlFor="setup-minutes" className="text-sm font-semibold text-[#142621]">
                  单轮计时提醒
                </label>
                <div className="text-xs text-[#5A6560]">场上倒计时默认时长（分钟）</div>
              </div>
              <select
                id="setup-minutes"
                value={roundMinutes}
                onChange={(e) => setRoundMinutes(Number(e.target.value))}
                className="min-h-[40px] rounded-lg border border-[#D8DFD3] bg-white px-2.5 text-sm font-mono tabular-nums text-[#142621]"
              >
                {[8, 10, 12, 15, 20].map((m) => (
                  <option key={m} value={m}>
                    {m} 分钟
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full min-h-[48px] rounded-xl bg-[#142621] text-white text-sm font-semibold hover:bg-[#1E3830] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-[#D4F34A]" aria-hidden="true" />
            <span>生成智能赛程</span>
          </button>
        </form>

        {/* Right 4-col Fairness Diagnostics & Backup */}
        <aside className="lg:col-span-4 space-y-4">
          <section className="bg-white rounded-2xl border border-[#E4E8E0] p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#185A43]" aria-hidden="true" />
                <h2 className="text-sm font-bold text-[#142621]">当前排阵公平报告</h2>
              </div>
              <span className="font-mono tabular-nums text-base font-bold text-[#185A43]">
                {fairness.compositeScore} / 100
              </span>
            </div>

            <div className="divide-y divide-[#EFF2EC] text-sm">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#5A6560]">搭档不重复率</span>
                <span className="font-mono tabular-nums font-semibold text-[#142621]">
                  {fairness.partnerUniquenessPct}%（重复 {fairness.repeatPartnerCount} 次）
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#5A6560]">出场次数范围</span>
                <span className="font-mono tabular-nums font-semibold text-[#142621]">
                  {fairness.playCountMin}–{fairness.playCountMax} 场
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#5A6560]">平均对局 DUPR 差</span>
                <span className="font-mono tabular-nums font-semibold text-[#142621]">
                  {fairness.avgSkillGap.toFixed(2)}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#5A6560]">混双组合占比</span>
                <span className="font-mono tabular-nums font-semibold text-[#142621]">
                  {fairness.mixedTeamPct}%
                </span>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-[#E4E8E0] p-5 space-y-2.5">
            <h2 className="text-sm font-bold text-[#142621]">数据与存档</h2>
            <p className="text-xs text-[#5A6560]">
              所有比分与排阵均自动保存在本机，断网也能在球场流畅使用。
            </p>
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleExportJson}
                className="min-h-[44px] px-3 rounded-xl border border-[#E4E8E0] bg-[#F7F8F5] text-xs font-semibold text-[#142621] hover:border-[#185A43] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                <span>导出存档</span>
              </button>
              <button
                type="button"
                onClick={onResetDemo}
                className="min-h-[44px] px-3 rounded-xl border border-[#E4E8E0] bg-[#F7F8F5] text-xs font-semibold text-[#5A6560] hover:text-[#B84A39] hover:border-[#B84A39]/40 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>重置示例</span>
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
