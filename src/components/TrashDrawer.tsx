import type { Task } from '@/types';
import { CloseIcon, RestoreIcon, TrashIcon } from './Icons';

interface TrashDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  deletedTasks: Task[];
  onRestore: (id: string) => void;
  onClearAll: () => void;
  theme: { text: string; textCompleted: string; textMuted: string };
}

export function TrashDrawer({ isOpen, onClose, deletedTasks, onRestore, onClearAll, theme }: TrashDrawerProps) {
  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={onClose} />
      <div
        className="fixed right-0 top-0 h-full w-full sm:w-[380px] z-50 flex flex-col"
        style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(20px)',
          borderLeft: '1px solid rgba(255,255,255,0.25)',
          animation: 'slideInRight 0.4s ease-out',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-xl font-bold" style={{ color: theme.text, fontFamily: "'Noto Serif SC', Georgia, serif" }}>
            回收站
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-[10px] flex items-center justify-center transition-all duration-200 hover:bg-black/10"
            style={{ color: theme.textMuted }}
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Deleted task list */}
        <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-2" style={{ scrollbarWidth: 'none' }}>
          {deletedTasks.length === 0 ? (
            <div className="text-center py-12 text-sm" style={{ color: theme.textMuted }}>
              回收站是空的
            </div>
          ) : (
            deletedTasks.map(task => (
              <div
                key={task.id}
                className="group flex items-start gap-3 p-3 rounded-xl hover:bg-white/10 transition-all duration-200"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm leading-relaxed" style={{ color: theme.text }}>
                    {task.content}
                  </div>
                  <div className="text-[10px] mt-1" style={{ color: theme.textMuted }}>
                    创建于 {formatTime(task.createdAt)} · 删除于 {task.deletedAt ? formatTime(task.deletedAt) : ''}
                  </div>
                </div>
                <button
                  onClick={() => onRestore(task.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/20 transition-all flex-shrink-0"
                  style={{ color: theme.textMuted }}
                  title="恢复"
                >
                  <RestoreIcon className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {deletedTasks.length > 0 && (
          <div className="px-6 pb-6 pt-2">
            <button
              onClick={() => {
                if (confirm('确定要清空回收站吗？此操作不可撤销。')) {
                  onClearAll();
                }
              }}
              className="w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-red-500/20 flex items-center justify-center gap-2"
              style={{ color: '#c44', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <TrashIcon className="w-4 h-4" />
              清空回收站
            </button>
          </div>
        )}
      </div>
    </>
  );
}
