import { X } from 'lucide-react';
import type { PlayerStanding } from '../types/tournament';

interface PlayerDetailContentProps {
  standing: PlayerStanding;
}

export function PlayerDetailContent({ standing }: PlayerDetailContentProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-[#142621]">{standing.player.name}</h3>
          <p className="text-xs text-[#5A6560] mt-0.5 font-mono tabular-nums">
            第 {standing.rank} 名 · DUPR {standing.player.rating.toFixed(1)}
            {!standing.player.active ? ' · 已暂离' : ''}
          </p>
        </div>
        <div className="text-right">
          <span className="font-mono tabular-nums text-2xl font-bold text-[#185A43]">
            {standing.played > 0 ? `${Math.round(standing.winRate * 100)}%` : '--'}
          </span>
          <div className="text-[11px] text-[#5A6560]">胜率</div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-[#F7F8F5] rounded-xl p-3 text-center">
          <div className="text-[11px] text-[#5A6560]">胜 / 负</div>
          <div className="font-mono tabular-nums text-base font-bold text-[#142621] mt-0.5">
            {standing.wins}-{standing.losses}
          </div>
        </div>
        <div className="bg-[#F7F8F5] rounded-xl p-3 text-center">
          <div className="text-[11px] text-[#5A6560]">净胜分</div>
          <div
            className={`font-mono tabular-nums text-base font-bold mt-0.5 ${
              standing.pointDiff > 0
                ? 'text-[#185A43]'
                : standing.pointDiff < 0
                ? 'text-[#B84A39]'
                : 'text-[#142621]'
            }`}
          >
            {standing.pointDiff > 0 ? `+${standing.pointDiff}` : standing.pointDiff}
          </div>
        </div>
        <div className="bg-[#F7F8F5] rounded-xl p-3 text-center">
          <div className="text-[11px] text-[#5A6560]">场均得分</div>
          <div className="font-mono tabular-nums text-base font-bold text-[#142621] mt-0.5">
            {standing.played > 0 ? standing.avgPointsFor.toFixed(1) : '0.0'}
          </div>
        </div>
      </div>

      {/* Recent Form */}
      <div>
        <h4 className="text-xs font-semibold text-[#5A6560] mb-2">近期走势</h4>
        {standing.form.length === 0 ? (
          <p className="text-xs text-[#5A6560]">暂无完赛记录</p>
        ) : (
          <div className="flex items-center gap-2">
            {standing.form.map((res, idx) => (
              <span
                key={idx}
                className={`w-8 h-8 rounded-lg font-semibold text-xs flex items-center justify-center ${
                  res === 'W'
                    ? 'bg-[#185A43] text-white'
                    : 'bg-[#B84A39]/12 text-[#B84A39]'
                }`}
              >
                {res === 'W' ? '胜' : '负'}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Partner Chemistry */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold text-[#5A6560]">搭档默契记录</h4>
          {standing.bestPartner && (
            <span className="text-xs font-medium text-[#185A43]">
              最佳拍档：{standing.bestPartner.partnerName}
            </span>
          )}
        </div>

        {standing.partnerRecords.length === 0 ? (
          <p className="text-xs text-[#5A6560]">完赛后自动统计每位搭档的胜率与净胜分</p>
        ) : (
          <div className="divide-y divide-[#EFF2EC] border-t border-b border-[#EFF2EC]">
            {standing.partnerRecords.map((rec) => (
              <div
                key={rec.partnerId}
                className="py-2.5 flex items-center justify-between text-sm"
              >
                <span className="font-medium text-[#111816]">{rec.partnerName}</span>
                <div className="flex items-center gap-3 font-mono tabular-nums text-xs">
                  <span className="text-[#5A6560]">
                    {rec.wins}胜 / {rec.games}场
                  </span>
                  <span
                    className={`font-semibold w-10 text-right ${
                      rec.pointDiff >= 0 ? 'text-[#185A43]' : 'text-[#B84A39]'
                    }`}
                  >
                    {rec.pointDiff > 0 ? `+${rec.pointDiff}` : rec.pointDiff}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface PlayerDetailSheetProps {
  standing: PlayerStanding | null;
  onClose: () => void;
}

export function PlayerDetailSheet({ standing, onClose }: PlayerDetailSheetProps) {
  if (!standing) return null;

  return (
    <div
      className="lg:hidden fixed inset-0 z-50 flex items-end justify-center bg-[#142621]/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label={`${standing.player.name} 战绩详情`}
      onClick={onClose}
    >
      <div
        className="w-full bg-white rounded-t-3xl p-5 pb-safe shadow-xl border-t border-[#E4E8E0] max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1.5 bg-[#D8DFD3] rounded-full mx-auto mb-3" aria-hidden="true" />
        <div className="flex justify-end -mb-2">
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭球员战绩"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#5A6560] hover:bg-[#EFF2EC] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <PlayerDetailContent standing={standing} />
      </div>
    </div>
  );
}
