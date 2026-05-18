import { useState } from 'react';
import type { Task, TabType } from '@/types';
import { CloseIcon, EditIcon, TrashIcon, CheckboxEmpty, CheckboxChecked } from './Icons';

interface TaskListDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, content: string) => void;
  onClearCompleted: () => void;
  theme: { surface: string; text: string; textCompleted: string; textMuted: string };
}

export function TaskListDrawer({ isOpen, onClose, tasks, onToggleComplete, onDelete, onEdit, onClearCompleted, theme }: TaskListDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('todo');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const filteredTasks = tasks.filter(t => {
    if (activeTab === 'todo') return !t.completed;
    if (activeTab === 'completed') return t.completed;
    return true;
  });

  const todoCount = tasks.filter(t => !t.completed).length;
  const completedCount = tasks.filter(t => t.completed).length;

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditValue(task.content);
  };

  const saveEdit = () => {
    if (editingId && editValue.trim()) {
      onEdit(editingId, editValue.trim());
    }
    setEditingId(null);
    setEditValue('');
  };

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
            任务清单
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-[10px] flex items-center justify-center transition-all duration-200 hover:bg-black/10"
            style={{ color: theme.textMuted }}
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 gap-1 mb-2">
          {(['todo', 'completed', 'all'] as TabType[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                color: activeTab === tab ? theme.text : theme.textMuted,
                background: activeTab === tab ? 'rgba(255,255,255,0.2)' : 'transparent',
              }}
            >
              {tab === 'todo' ? '待办' : tab === 'completed' ? '已完成' : '全部'}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="px-6 pb-3 text-xs" style={{ color: theme.textMuted }}>
          {activeTab === 'todo' ? `${todoCount} 个待办任务` : activeTab === 'completed' ? `${completedCount} 个已完成` : `共 ${tasks.length} 个任务`}
        </div>

        {/* Task list */}
        <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-2" style={{ scrollbarWidth: 'none' }}>
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 text-sm" style={{ color: theme.textMuted }}>
              暂无任务
            </div>
          ) : (
            filteredTasks.map(task => (
              <div
                key={task.id}
                className="group flex items-start gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-white/10"
              >
                <button
                  onClick={() => onToggleComplete(task.id)}
                  className="mt-0.5 flex-shrink-0 transition-all duration-200"
                  style={{ color: task.completed ? theme.textCompleted : theme.textMuted }}
                >
                  {task.completed ? <CheckboxChecked className="w-5 h-5" /> : <CheckboxEmpty className="w-5 h-5" />}
                </button>

                <div className="flex-1 min-w-0">
                  {editingId === task.id ? (
                    <input
                      autoFocus
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onBlur={saveEdit}
                      onKeyDown={e => {
                        if (e.key === 'Enter') saveEdit();
                        if (e.key === 'Escape') { setEditingId(null); setEditValue(''); }
                      }}
                      className="w-full bg-white/20 rounded px-2 py-1 text-sm outline-none"
                      style={{ color: theme.text }}
                    />
                  ) : (
                    <div
                      className="text-sm leading-relaxed cursor-pointer"
                      style={{
                        color: task.completed ? theme.textCompleted : theme.text,
                        textDecoration: task.completed ? 'line-through' : 'none',
                        textDecorationColor: theme.textCompleted,
                      }}
                      onClick={() => startEdit(task)}
                    >
                      {task.content}
                    </div>
                  )}
                  <div className="text-[10px] mt-1" style={{ color: theme.textMuted }}>
                    {formatTime(task.createdAt)}
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => startEdit(task)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/20 transition-all"
                    style={{ color: theme.textMuted }}
                  >
                    <EditIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(task.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-500/20 transition-all"
                    style={{ color: theme.textMuted }}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {completedCount > 0 && (
          <div className="px-6 pb-6 pt-2">
            <button
              onClick={onClearCompleted}
              className="w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-white/20"
              style={{ color: theme.textMuted, border: '1px solid rgba(255,255,255,0.2)' }}
            >
              清空已完成
            </button>
          </div>
        )}
      </div>
    </>
  );
}
