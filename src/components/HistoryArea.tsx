import type { Task } from '@/types';
import { CheckboxEmpty, CheckboxChecked } from './Icons';

interface HistoryAreaProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  theme: { surface: string; text: string; textCompleted: string; textMuted: string };
  animatingTaskId: string | null;
}

export function HistoryArea({ tasks, onToggleComplete, theme, animatingTaskId }: HistoryAreaProps) {
  // Show recent 8 tasks, sorted by creation time (newest first)
  const recentTasks = [...tasks].sort((a, b) => b.createdAt - a.createdAt).slice(0, 8);

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - ts;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <div className="w-full max-w-[70vw] sm:max-w-[600px] mx-auto px-4">
      <div className="space-y-2">
        {recentTasks.map(task => (
          <div
            key={task.id}
            className="group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300"
            style={{
              background: task.completed ? `${theme.surface}60` : 'rgba(255,255,255,0.08)',
              animation: animatingTaskId === task.id ? 'taskEnter 0.4s ease-out' : undefined,
            }}
          >
            <button
              onClick={() => onToggleComplete(task.id)}
              className="flex-shrink-0 transition-all duration-200"
              style={{ color: task.completed ? theme.textCompleted : theme.textMuted }}
            >
              {task.completed ? <CheckboxChecked className="w-5 h-5" /> : <CheckboxEmpty className="w-5 h-5" />}
            </button>
            <div
              className="flex-1 min-w-0 text-base sm:text-lg leading-relaxed truncate"
              style={{
                color: task.completed ? theme.textCompleted : theme.text,
                textDecoration: task.completed ? 'line-through' : 'none',
                textDecorationColor: theme.textCompleted,
                fontFamily: "'Noto Sans SC', sans-serif",
              }}
            >
              {task.content}
            </div>
            <div
              className="text-[10px] flex-shrink-0 transition-opacity duration-200 opacity-0 group-hover:opacity-100"
              style={{ color: theme.textMuted }}
            >
              {formatTime(task.createdAt)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
