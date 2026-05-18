import { useState, useMemo } from 'react';
import type { Task } from '@/types';
import { SearchIcon, CloseIcon, CheckboxEmpty, CheckboxChecked } from './Icons';

interface SearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  theme: { text: string; textCompleted: string; textMuted: string };
}

export function SearchDrawer({ isOpen, onClose, tasks, onToggleComplete, theme }: SearchDrawerProps) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return tasks.filter(t => t.content.toLowerCase().includes(q));
  }, [query, tasks]);

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
            搜索
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-[10px] flex items-center justify-center transition-all duration-200 hover:bg-black/10"
            style={{ color: theme.textMuted }}
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="px-6 pb-4">
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.2)' }}
          >
            <SearchIcon className="w-5 h-5 flex-shrink-0" style={{ color: theme.textMuted }} />
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="搜索任务..."
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: theme.text }}
            />
            {query && (
              <button onClick={() => setQuery('')} style={{ color: theme.textMuted }}>
                <CloseIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-2" style={{ scrollbarWidth: 'none' }}>
          {!query.trim() ? (
            <div className="text-center py-12 text-sm" style={{ color: theme.textMuted }}>
              输入关键词开始搜索
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12 text-sm" style={{ color: theme.textMuted }}>
              未找到匹配的任务
            </div>
          ) : (
            results.map(task => (
              <div
                key={task.id}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/10 transition-all duration-200"
              >
                <button
                  onClick={() => onToggleComplete(task.id)}
                  className="mt-0.5 flex-shrink-0"
                  style={{ color: task.completed ? theme.textCompleted : theme.textMuted }}
                >
                  {task.completed ? <CheckboxChecked className="w-5 h-5" /> : <CheckboxEmpty className="w-5 h-5" />}
                </button>
                <div className="flex-1 min-w-0">
                  <HighlightText text={task.content} query={query} theme={theme} completed={task.completed} />
                  <div className="text-[10px] mt-1" style={{ color: theme.textMuted }}>
                    {formatTime(task.createdAt)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

function HighlightText({ text, query, theme, completed }: { text: string; query: string; theme: { text: string; textCompleted: string }; completed: boolean }) {
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return (
    <div
      className="text-sm leading-relaxed"
      style={{
        color: completed ? theme.textCompleted : theme.text,
        textDecoration: completed ? 'line-through' : 'none',
      }}
    >
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-yellow-400/30 rounded px-0.5" style={{ color: completed ? theme.textCompleted : theme.text }}>
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </div>
  );
}
