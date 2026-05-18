import { KeyboardIcon, ListIcon, SoundOnIcon, SoundOffIcon, ThemeIcon, TrashIcon } from './Icons';

interface ControlPanelProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onToggleTheme: () => void;
  onOpenList: () => void;
  onOpenTrash: () => void;
  onToggleShortcuts: () => void;
  theme: { textMuted: string };
}

export function ControlPanel({
  soundEnabled,
  onToggleSound,
  onToggleTheme,
  onOpenList,
  onOpenTrash,
  onToggleShortcuts,
  theme,
}: ControlPanelProps) {
  const buttons = [
    { icon: <KeyboardIcon className="w-5 h-5" />, action: onToggleShortcuts, title: '快捷键 (⌘?)' },
    { icon: <ListIcon className="w-5 h-5" />, action: onOpenList, title: '任务列表 (⌘L)' },
    { icon: soundEnabled ? <SoundOnIcon className="w-5 h-5" /> : <SoundOffIcon className="w-5 h-5" />, action: onToggleSound, title: soundEnabled ? '关闭音效' : '开启音效' },
    { icon: <ThemeIcon className="w-5 h-5" />, action: onToggleTheme, title: '切换主题' },
    { icon: <TrashIcon className="w-5 h-5" />, action: onOpenTrash, title: '回收站' },
  ];

  return (
    <div
      className="fixed bottom-[6vh] left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-2 rounded-2xl"
      style={{
        background: 'rgba(0,0,0,0.06)',
        backdropFilter: 'blur(4px)',
      }}
    >
      {buttons.map((btn, i) => (
        <button
          key={i}
          onClick={btn.action}
          title={btn.title}
          className="w-9 h-9 rounded-[10px] flex items-center justify-center transition-all duration-200 hover:bg-black/[0.08] active:scale-95"
          style={{ color: theme.textMuted }}
        >
          {btn.icon}
        </button>
      ))}
    </div>
  );
}
