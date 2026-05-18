import { CloseIcon } from './Icons';

interface ShortcutsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  theme: { text: string; textMuted: string };
}

const shortcuts = [
  { keys: ['Enter'], desc: '提交速记' },
  { keys: ['Esc'], desc: '关闭抽屉/覆盖层' },
  { keys: ['⌘', 'K'], desc: '打开搜索' },
  { keys: ['⌘', 'L'], desc: '打开任务列表' },
  { keys: ['Shift', 'Enter'], desc: '输入区换行' },
];

export function ShortcutsOverlay({ isOpen, onClose, theme }: ShortcutsOverlayProps) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.3)' }}
        onClick={onClose}
      >
        <div
          className="w-full max-w-md rounded-2xl p-8 relative"
          style={{
            background: '#fff',
            animation: 'fadeInScale 0.3s ease-out',
          }}
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-all"
            style={{ color: theme.textMuted }}
          >
            <CloseIcon className="w-5 h-5" />
          </button>

          <h2
            className="text-xl font-bold mb-6"
            style={{ color: theme.text, fontFamily: "'Noto Serif SC', Georgia, serif" }}
          >
            键盘快捷键
          </h2>

          <div className="space-y-3">
            {shortcuts.map((s, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm" style={{ color: theme.textMuted }}>
                  {s.desc}
                </span>
                <div className="flex items-center gap-1">
                  {s.keys.map((key, j) => (
                    <kbd
                      key={j}
                      className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-md text-xs font-mono"
                      style={{
                        background: '#f0f0f0',
                        color: theme.text,
                        border: '1px solid #e0e0e0',
                      }}
                    >
                      {key}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
