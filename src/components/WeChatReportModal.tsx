import { useState } from 'react';
import { Check, Copy, X } from 'lucide-react';
import type { PlayerStanding, TournamentState } from '../types/tournament';
import { formatWeChatReport } from '../utils/scheduler';

interface WeChatReportModalProps {
  open: boolean;
  state: TournamentState;
  standings: PlayerStanding[];
  onClose: () => void;
}

export function WeChatReportModal({ open, state, standings, onClose }: WeChatReportModalProps) {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const reportText = formatWeChatReport(state, standings);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback selection copy
      const el = document.createElement('textarea');
      el.value = reportText;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-[#142621]/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full md:max-w-lg bg-white rounded-t-3xl md:rounded-3xl p-5 sm:p-6 pb-safe shadow-xl border border-[#E4E8E0] max-h-[88vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="md:hidden w-10 h-1.5 bg-[#D8DFD3] rounded-full mx-auto mb-4" aria-hidden="true" />

        <div className="flex items-center justify-between pb-4 border-b border-[#EFF2EC]">
          <div>
            <h2 id="report-modal-title" className="text-lg font-bold text-[#142621]">
              微信群实时战报
            </h2>
            <p className="text-xs text-[#5A6560] mt-0.5">
              复制后可直接粘贴到俱乐部微信群
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭战报窗口"
            className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center rounded-xl text-[#5A6560] hover:bg-[#EFF2EC] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <pre className="my-4 p-4 rounded-2xl bg-[#F7F8F5] text-xs sm:text-sm font-mono leading-relaxed text-[#142621] whitespace-pre-wrap overflow-y-auto flex-1 select-all">
          {reportText}
        </pre>

        <button
          type="button"
          onClick={handleCopy}
          className="w-full min-h-[48px] rounded-xl bg-[#142621] text-white text-sm font-semibold hover:bg-[#1E3830] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-[#D4F34A]" aria-hidden="true" />
              <span>已复制到剪贴板</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-[#D4F34A]" aria-hidden="true" />
              <span>一键复制战报</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
