import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePersistentState } from '@/hooks/usePersistentState';
import { useSound } from '@/hooks/useSound';
import { THEMES } from '@/types';
import type { Task, DrawerType } from '@/types';
import { trpc } from '@/providers/trpc';
import { SearchIcon, ListIcon, LogOutIcon } from '@/components/Icons';
import { TaskListDrawer } from '@/components/TaskListDrawer';
import { SearchDrawer } from '@/components/SearchDrawer';
import { TrashDrawer } from '@/components/TrashDrawer';
import { HistoryArea } from '@/components/HistoryArea';
import { ControlPanel } from '@/components/ControlPanel';
import { ShortcutsOverlay } from '@/components/ShortcutsOverlay';
import { LoginPage } from '@/pages/LoginPage';
import './App.css';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ==================== OFFLINE MODE (no backend) ====================
function OfflineApp() {
  const { state, updateState } = usePersistentState();
  const { playCapture, playError, playComplete, playDelete } = useSound(state.soundEnabled);
  const theme = THEMES[state.themeIndex];

  const [currentInput, setCurrentInput] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [activeDrawer, setActiveDrawer] = useState<DrawerType>('none');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [animatingTaskId, setAnimatingTaskId] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  const inputRef = useRef<HTMLDivElement>(null);
  const isComposingRef = useRef(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setActiveDrawer(prev => prev === 'search' ? 'none' : 'search');
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'l') {
        e.preventDefault();
        setActiveDrawer(prev => prev === 'list' ? 'none' : 'list');
        return;
      }
      if (e.key === 'Escape') {
        setActiveDrawer('none');
        setShowShortcuts(false);
        return;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const submitNote = useCallback(() => {
    const trimmed = currentInput.trim();
    if (!trimmed) {
      playError();
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 300);
      return;
    }
    const newTask: Task = {
      id: generateId(),
      content: trimmed,
      completed: false,
      createdAt: Date.now(),
    };
    playCapture();
    setAnimatingTaskId(newTask.id);
    updateState(prev => ({ tasks: [newTask, ...prev.tasks] }));
    setCurrentInput('');
    if (inputRef.current) inputRef.current.textContent = '';
    setTimeout(() => setAnimatingTaskId(null), 500);
  }, [currentInput, playCapture, playError, updateState]);

  const toggleComplete = useCallback((id: string) => {
    const task = state.tasks.find(t => t.id === id);
    if (task && !task.completed) playComplete();
    updateState(prev => ({
      tasks: prev.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t),
    }));
  }, [state.tasks, playComplete, updateState]);

  const deleteTask = useCallback((id: string) => {
    const task = state.tasks.find(t => t.id === id);
    if (task) {
      playDelete();
      updateState(prev => ({
        tasks: prev.tasks.filter(t => t.id !== id),
        deletedTasks: [{ ...task, deletedAt: Date.now() }, ...prev.deletedTasks],
      }));
    }
  }, [state.tasks, playDelete, updateState]);

  const editTask = useCallback((id: string, content: string) => {
    updateState(prev => ({
      tasks: prev.tasks.map(t => t.id === id ? { ...t, content } : t),
    }));
  }, [updateState]);

  const clearCompleted = useCallback(() => {
    const completed = state.tasks.filter(t => t.completed);
    updateState(prev => ({
      tasks: prev.tasks.filter(t => !t.completed),
      deletedTasks: [...completed.map(t => ({ ...t, deletedAt: Date.now() })), ...prev.deletedTasks],
    }));
  }, [state.tasks, updateState]);

  const restoreTask = useCallback((id: string) => {
    const task = state.deletedTasks.find(t => t.id === id);
    if (task) {
      const { deletedAt, ...restored } = task;
      updateState(prev => ({
        deletedTasks: prev.deletedTasks.filter(t => t.id !== id),
        tasks: [restored, ...prev.tasks],
      }));
    }
  }, [state.deletedTasks, updateState]);

  const clearTrash = useCallback(() => updateState({ deletedTasks: [] }), [updateState]);

  const handleInput = useCallback(() => {
    if (inputRef.current) setCurrentInput(inputRef.current.textContent || '');
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (isComposingRef.current) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitNote();
    }
  }, [submitNote]);

  const cycleTheme = useCallback(() => {
    updateState(prev => ({ themeIndex: (prev.themeIndex + 1) % THEMES.length }));
  }, [updateState]);

  return (
    <div className="w-screen h-screen overflow-hidden relative select-none" style={{ background: theme.bg, fontFamily: "'Noto Sans SC', -apple-system, sans-serif" }}>
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-4">
        <h1 className="text-base font-bold tracking-wide" style={{ color: theme.text, fontFamily: "'Noto Serif SC', Georgia, serif" }}>灵感速记</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setActiveDrawer('search')} className="w-9 h-9 rounded-[10px] flex items-center justify-center transition-all duration-200 hover:bg-black/10" style={{ color: theme.textMuted }} title="搜索 (⌘K)">
            <SearchIcon className="w-5 h-5" />
          </button>
          <button onClick={() => setActiveDrawer('list')} className="w-9 h-9 rounded-[10px] flex items-center justify-center transition-all duration-200 hover:bg-black/10" style={{ color: theme.textMuted }} title="任务列表 (⌘L)">
            <ListIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="w-full h-full flex flex-col items-center pt-[12vh]">
        <div className="w-full mb-6">
          <HistoryArea tasks={state.tasks} onToggleComplete={toggleComplete} theme={theme} animatingTaskId={animatingTaskId} />
        </div>
        <div className="w-full max-w-[70vw] sm:max-w-[600px] px-4 flex flex-col items-center">
          {!isInputFocused && !currentInput && (
            <div className="text-center mb-4 animate-fadeIn" style={{ color: theme.textMuted, fontSize: '14px' }}>
              <span className="typing-text">随时记录，不再遗忘...</span>
            </div>
          )}
          <div className={`w-full relative ${isShaking ? 'animate-shake' : ''}`}>
            <div ref={inputRef} contentEditable suppressContentEditableWarning onInput={handleInput} onKeyDown={handleKeyDown} onFocus={() => setIsInputFocused(true)} onBlur={() => setIsInputFocused(false)} onCompositionStart={() => { isComposingRef.current = true; }} onCompositionEnd={() => { isComposingRef.current = false; }} className="w-full min-h-[60px] max-h-[200px] overflow-y-auto outline-none text-center break-words" style={{ color: theme.text, fontSize: 'clamp(24px, 4vw, 36px)', lineHeight: 1.4, fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 400, caretColor: theme.accent }} data-placeholder="随时记录，不再遗忘..." />
          </div>
          {currentInput.trim().length > 0 && (
            <div className="mt-3 text-xs animate-fadeIn" style={{ color: theme.textMuted }}>按 Enter 提交</div>
          )}
        </div>
      </div>

      <ControlPanel soundEnabled={state.soundEnabled} onToggleSound={() => updateState({ soundEnabled: !state.soundEnabled })} onToggleTheme={cycleTheme} onOpenList={() => setActiveDrawer('list')} onOpenTrash={() => setActiveDrawer('trash')} onToggleShortcuts={() => setShowShortcuts(true)} theme={theme} />

      <TaskListDrawer isOpen={activeDrawer === 'list'} onClose={() => setActiveDrawer('none')} tasks={state.tasks} onToggleComplete={toggleComplete} onDelete={deleteTask} onEdit={editTask} onClearCompleted={clearCompleted} theme={theme} />
      <SearchDrawer isOpen={activeDrawer === 'search'} onClose={() => setActiveDrawer('none')} tasks={state.tasks} onToggleComplete={toggleComplete} theme={theme} />
      <TrashDrawer isOpen={activeDrawer === 'trash'} onClose={() => setActiveDrawer('none')} deletedTasks={state.deletedTasks} onRestore={restoreTask} onClearAll={clearTrash} theme={theme} />
      <ShortcutsOverlay isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} theme={theme} />
    </div>
  );
}

// ==================== ONLINE MODE (with backend) ====================
function OnlineApp({ user, logout }: { user: { id: number; username: string } | null; logout: () => void }) {
  const theme = THEMES[0];
  const utils = trpc.useUtils();

  const tasksQuery = trpc.task.list.useQuery(undefined, { staleTime: 1000 });
  const createTask = trpc.task.create.useMutation({ onSuccess: () => utils.task.list.invalidate() });
  const toggleTask = trpc.task.toggleComplete.useMutation({ onSuccess: () => utils.task.list.invalidate() });
  const updateTask = trpc.task.update.useMutation({ onSuccess: () => utils.task.list.invalidate() });
  const softDeleteTask = trpc.task.softDelete.useMutation({ onSuccess: () => utils.task.list.invalidate() });
  const restoreTaskMut = trpc.task.restore.useMutation({ onSuccess: () => utils.task.list.invalidate() });
  const clearCompletedMut = trpc.task.clearCompleted.useMutation({ onSuccess: () => utils.task.list.invalidate() });
  const clearTrashMut = trpc.task.clearTrash.useMutation({ onSuccess: () => utils.task.list.invalidate() });

  const allTasks: Task[] = useMemo(() => {
    if (!tasksQuery.data) return [];
    return tasksQuery.data.map(t => ({
      id: String(t.id),
      content: t.content,
      completed: t.completed,
      createdAt: new Date(t.createdAt).getTime(),
      deletedAt: t.deletedAt ? new Date(t.deletedAt).getTime() : undefined,
    }));
  }, [tasksQuery.data]);

  const activeTasks = useMemo(() => allTasks.filter(t => !t.deletedAt), [allTasks]);
  const deletedTasks = useMemo(() => allTasks.filter(t => !!t.deletedAt), [allTasks]);

  const { playCapture, playError, playComplete, playDelete } = useSound(true);

  const [currentInput, setCurrentInput] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [activeDrawer, setActiveDrawer] = useState<DrawerType>('none');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [animatingTaskId, setAnimatingTaskId] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  const inputRef = useRef<HTMLDivElement>(null);
  const isComposingRef = useRef(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setActiveDrawer(prev => prev === 'search' ? 'none' : 'search');
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'l') {
        e.preventDefault();
        setActiveDrawer(prev => prev === 'list' ? 'none' : 'list');
        return;
      }
      if (e.key === 'Escape') {
        setActiveDrawer('none');
        setShowShortcuts(false);
        return;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const submitNote = useCallback(() => {
    const trimmed = currentInput.trim();
    if (!trimmed) {
      playError();
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 300);
      return;
    }
    playCapture();
    const tempId = generateId();
    setAnimatingTaskId(tempId);
    createTask.mutate({ content: trimmed });
    setCurrentInput('');
    if (inputRef.current) inputRef.current.textContent = '';
    setTimeout(() => setAnimatingTaskId(null), 500);
  }, [currentInput, playCapture, playError, createTask]);

  const toggleComplete = useCallback((id: string) => {
    const task = activeTasks.find(t => t.id === id);
    if (task && !task.completed) playComplete();
    toggleTask.mutate({ id: Number(id) });
  }, [activeTasks, playComplete, toggleTask]);

  const deleteTask = useCallback((id: string) => {
    playDelete();
    softDeleteTask.mutate({ id: Number(id) });
  }, [playDelete, softDeleteTask]);

  const editTask = useCallback((id: string, content: string) => {
    updateTask.mutate({ id: Number(id), content });
  }, [updateTask]);

  const clearCompleted = useCallback(() => clearCompletedMut.mutate(), [clearCompletedMut]);
  const restoreTask = useCallback((id: string) => restoreTaskMut.mutate({ id: Number(id) }), [restoreTaskMut]);
  const clearTrash = useCallback(() => clearTrashMut.mutate(), [clearTrashMut]);

  const handleInput = useCallback(() => {
    if (inputRef.current) setCurrentInput(inputRef.current.textContent || '');
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (isComposingRef.current) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitNote();
    }
  }, [submitNote]);

  return (
    <div className="w-screen h-screen overflow-hidden relative select-none" style={{ background: theme.bg, fontFamily: "'Noto Sans SC', -apple-system, sans-serif" }}>
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-bold tracking-wide" style={{ color: theme.text, fontFamily: "'Noto Serif SC', Georgia, serif" }}>灵感速记</h1>
          {user && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.15)', color: theme.textMuted }}>{user.username}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setActiveDrawer('search')} className="w-9 h-9 rounded-[10px] flex items-center justify-center transition-all duration-200 hover:bg-black/10" style={{ color: theme.textMuted }} title="搜索 (⌘K)">
            <SearchIcon className="w-5 h-5" />
          </button>
          <button onClick={() => setActiveDrawer('list')} className="w-9 h-9 rounded-[10px] flex items-center justify-center transition-all duration-200 hover:bg-black/10" style={{ color: theme.textMuted }} title="任务列表 (⌘L)">
            <ListIcon className="w-5 h-5" />
          </button>
          <button onClick={logout} className="w-9 h-9 rounded-[10px] flex items-center justify-center transition-all duration-200 hover:bg-black/10" style={{ color: theme.textMuted }} title="退出登录">
            <LogOutIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="w-full h-full flex flex-col items-center pt-[12vh]">
        <div className="w-full mb-6">
          <HistoryArea tasks={activeTasks} onToggleComplete={toggleComplete} theme={theme} animatingTaskId={animatingTaskId} />
        </div>
        <div className="w-full max-w-[70vw] sm:max-w-[600px] px-4 flex flex-col items-center">
          {!isInputFocused && !currentInput && (
            <div className="text-center mb-4 animate-fadeIn" style={{ color: theme.textMuted, fontSize: '14px' }}>
              <span className="typing-text">随时记录，不再遗忘...</span>
            </div>
          )}
          <div className={`w-full relative ${isShaking ? 'animate-shake' : ''}`}>
            <div ref={inputRef} contentEditable suppressContentEditableWarning onInput={handleInput} onKeyDown={handleKeyDown} onFocus={() => setIsInputFocused(true)} onBlur={() => setIsInputFocused(false)} onCompositionStart={() => { isComposingRef.current = true; }} onCompositionEnd={() => { isComposingRef.current = false; }} className="w-full min-h-[60px] max-h-[200px] overflow-y-auto outline-none text-center break-words" style={{ color: theme.text, fontSize: 'clamp(24px, 4vw, 36px)', lineHeight: 1.4, fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 400, caretColor: theme.accent }} data-placeholder="随时记录，不再遗忘..." />
          </div>
          {currentInput.trim().length > 0 && (
            <div className="mt-3 text-xs animate-fadeIn" style={{ color: theme.textMuted }}>按 Enter 提交</div>
          )}
        </div>
      </div>

      <ControlPanel soundEnabled={true} onToggleSound={() => {}} onToggleTheme={() => {}} onOpenList={() => setActiveDrawer('list')} onOpenTrash={() => setActiveDrawer('trash')} onToggleShortcuts={() => setShowShortcuts(true)} theme={theme} />

      <TaskListDrawer isOpen={activeDrawer === 'list'} onClose={() => setActiveDrawer('none')} tasks={activeTasks} onToggleComplete={toggleComplete} onDelete={deleteTask} onEdit={editTask} onClearCompleted={clearCompleted} theme={theme} />
      <SearchDrawer isOpen={activeDrawer === 'search'} onClose={() => setActiveDrawer('none')} tasks={activeTasks} onToggleComplete={toggleComplete} theme={theme} />
      <TrashDrawer isOpen={activeDrawer === 'trash'} onClose={() => setActiveDrawer('none')} deletedTasks={deletedTasks} onRestore={restoreTask} onClearAll={clearTrash} theme={theme} />
      <ShortcutsOverlay isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} theme={theme} />
    </div>
  );
}

// ==================== MAIN APP ROUTER ====================
export default function App() {
  const { user, isLoading, isAuthenticated, apiUnavailable, logout } = useAuth();

  // Loading state
  if (isLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center" style={{ background: THEMES[0].bg }}>
        <div className="text-sm" style={{ color: THEMES[0].textMuted }}>加载中...</div>
      </div>
    );
  }

  // API is down → use offline mode with localStorage
  if (apiUnavailable) {
    return <OfflineApp />;
  }

  // API is up but not logged in → show login page
  if (!isAuthenticated) {
    return <LoginPage theme={THEMES[0]} />;
  }

  // API is up and logged in → use cloud mode
  return <OnlineApp user={user ?? null} logout={logout} />;
}
