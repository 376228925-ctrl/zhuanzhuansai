import { useMemo, useState } from 'react';
import { ClipboardPaste, Sparkles, X } from 'lucide-react';
import type { Gender, ParsedPlayerInput } from '../types/tournament';
import { parseWeChatRoster } from '../utils/parser';

interface WeChatImportSheetProps {
  open: boolean;
  onClose: () => void;
  onImport: (players: ParsedPlayerInput[], mode: 'append' | 'replace') => void;
}

const SAMPLE_WECHAT_TEXT = `#接龙
周日晚奥体中心匹克球转转赛
1. 沈星河 男 4.2
2、林微凉 女 3.6
3. 唐嘉禾 男 3.9
4、宋知意 女 3.4`;

function genderLabel(g: Gender): string {
  if (g === 'M') return '男';
  if (g === 'F') return '女';
  return '未标';
}

export function WeChatImportSheet({ open, onClose, onImport }: WeChatImportSheetProps) {
  const [rawText, setRawText] = useState('');
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');

  const parsed = useMemo(() => parseWeChatRoster(rawText), [rawText]);

  if (!open) return null;

  const handleConfirm = () => {
    if (parsed.length === 0) return;
    onImport(parsed, importMode);
    setRawText('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-[#142621]/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wechat-import-title"
      onClick={onClose}
    >
      <div
        className="w-full md:max-w-xl bg-white rounded-t-3xl md:rounded-3xl p-5 sm:p-6 pb-safe shadow-xl border border-[#E4E8E0] max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="md:hidden w-10 h-1.5 bg-[#D8DFD3] rounded-full mx-auto mb-4" aria-hidden="true" />

        <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#EFF2EC]">
          <div>
            <h2 id="wechat-import-title" className="text-lg font-bold text-[#142621]">
              微信接龙一键导入
            </h2>
            <p className="text-xs text-[#5A6560] mt-0.5">
              自动识别序号、姓名、性别（男/女）与 DUPR 水平分（如 3.5）
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭接龙导入窗口"
            className="min-h-[44px] min-w-[44px] -mr-2 -mt-2 flex items-center justify-center rounded-xl text-[#5A6560] hover:bg-[#EFF2EC] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4 overflow-y-auto flex-1">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="wechat-chain-input" className="text-xs font-semibold text-[#142621]">
                粘贴微信群接龙文本
              </label>
              <button
                type="button"
                onClick={() => setRawText(SAMPLE_WECHAT_TEXT)}
                className="text-xs font-medium text-[#185A43] hover:text-[#142621] flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                <span>填入示例接龙</span>
              </button>
            </div>
            <textarea
              id="wechat-chain-input"
              rows={5}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={'例如：\n1. 林叙 男 4.0\n2、陈知夏 女 3.6\n3. 周越 3.8'}
              className="w-full rounded-2xl border border-[#D8DFD3] bg-[#F7F8F5] px-4 py-3 text-sm text-[#111816] placeholder:text-[#8A948E] focus:outline-none focus:border-[#185A43] focus:bg-white transition-colors"
            />
          </div>

          {/* Import mode segmented toggle */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#EFF2EC] rounded-xl">
            <button
              type="button"
              onClick={() => setImportMode('append')}
              className={`min-h-[40px] rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                importMode === 'append'
                  ? 'bg-white text-[#142621] shadow-xs'
                  : 'text-[#5A6560] hover:text-[#142621]'
              }`}
            >
              追加到当前名单
            </button>
            <button
              type="button"
              onClick={() => setImportMode('replace')}
              className={`min-h-[40px] rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                importMode === 'replace'
                  ? 'bg-white text-[#142621] shadow-xs'
                  : 'text-[#5A6560] hover:text-[#142621]'
              }`}
            >
              替换全部名单并重排
            </button>
          </div>

          {/* Live Parsed Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#142621]">
                智能识别预览（{parsed.length} 人）
              </span>
              {parsed.length > 0 && (
                <span className="text-[#185A43]">格式校验通过</span>
              )}
            </div>

            {parsed.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#D8DFD3] p-4 text-center text-xs text-[#5A6560]">
                粘贴群接龙文本后，此处将实时展示解析出的球员名单
              </div>
            ) : (
              <div className="divide-y divide-[#EFF2EC] rounded-2xl border border-[#E4E8E0] overflow-hidden">
                {parsed.map((p) => (
                  <div
                    key={p.name}
                    className="px-3.5 py-2.5 bg-white flex items-center justify-between text-sm"
                  >
                    <span className="font-medium text-[#111816]">{p.name}</span>
                    <span className="text-xs text-[#5A6560] font-mono tabular-nums">
                      {genderLabel(p.gender)} · DUPR {p.rating.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-[#EFF2EC]">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={parsed.length === 0}
            className="w-full min-h-[48px] rounded-xl bg-[#142621] text-white text-sm font-semibold hover:bg-[#1E3830] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            <ClipboardPaste className="w-4 h-4 text-[#D4F34A]" aria-hidden="true" />
            <span>
              确认导入 {parsed.length > 0 ? `${parsed.length} 位球员` : ''}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
