import { useState, useCallback, useRef, useEffect } from 'react';
import { usePersistentState } from '@/hooks/usePersistentState';
import { useSound } from '@/hooks/useSound';
import { THEMES } from '@/types';
import type { Task, DrawerType } from '@/types';
import { SearchIcon, ListIcon } from '@/components/Icons';
import { TaskListDrawer } from '@/components/TaskListDrawer';
import { SearchDrawer } from '@/components/SearchDrawer';
import { TrashDrawer } from '@/components/TrashDrawer';
import { HistoryArea } from '@/components/HistoryArea';
import { ControlPanel } from '@/components/ControlPanel';
import { ShortcutsOverlay } from '@/components/ShortcutsOverlay';
import './App.css';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export default function App() {
  const { state, updateState } = usePersistentState();
  const { playCapture, playError, playComplete, playDelete } = useSound(state.soundEnabled);
  const theme = THEMES[state.themeIndex];

  const [currentInput, setCurrentInput] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [activeDrawer, setActiveDrawer] = useState<DrawerType>('none');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [animatingTaskId, setAnimatingTaskId] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [showEnterHint, setShowEnterHint] = useState(false);

  const inputRef = useRef<HTMLDivElement>(null);
  const isComposingRef = useRef(false);

  // Show enter hint when typing
  useEffect(() => {
    if (currentInput.trim().length > 0) {
      setShowEnterHint(true);
    } else {
      setShowEnterHint(false);
    }
  }, [currentInput]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K = search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setActiveDrawer(prev => prev === 'search' ? 'none' : 'search');
        return;
      }
      // Cmd/Ctrl + L = list
      if ((e.metaKey || e.ctrlKey) && e.key === 'l') {
        e.preventDefault();
        setActiveDrawer(prev => prev === 'list' ? 'none' : 'list');
        return;
      }
      // Escape = close drawers
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
    if (inputRef.current) {
      inputRef.current.textContent = '';
    }

    setTimeout(() => setAnimatingTaskId(null), 500);
  }, [currentInput, playCapture, playError, updateState]);

  const toggleComplete = useCallback((id: string) => {
    const task = state.tasks.find(t => t.id === id);
    if (task && !task.completed) {
      playComplete();
    }
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

  const clearTrash = useCallback(() => {
    updateState({ deletedTasks: [] });
  }, [updateState]);

  const handleInput = useCallback(() => {
    if (inputRef.current) {
      setCurrentInput(inputRef.current.textContent || '');
    }
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
    <div
      className="w-screen h-screen overflow-hidden relative select-none"
      style={{
        background: theme.bg,
        transition: 'background 0.5s ease',
        fontFamily: "'Noto Sans SC', -apple-system, sans-serif",
      }}
    >
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-4">
        <h1
          className="text-base font-bold tracking-wide"
          style={{ color: theme.text, fontFamily: "'Noto Serif SC', Georgia, serif" }}
        >
          灵感速记
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveDrawer('search')}
            className="w-9 h-9 rounded-[10px] flex items-center justify-center transition-all duration-200 hover:bg-black/10"
            style={{ color: theme.textMuted }}
            title="搜索 (⌘K)"
          >
            <SearchIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setActiveDrawer('list')}
            className="w-9 h-9 rounded-[10px] flex items-center justify-center transition-all duration-200 hover:bg-black/10"
            style={{ color: theme.textMuted }}
            title="任务列表 (⌘L)"
          >
            <ListIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="w-full h-full flex flex-col items-center pt-[12vh]">
        {/* History area - shows recent tasks */}
        <div className="w-full mb-6">
          <HistoryArea
            tasks={state.tasks}
            onToggleComplete={toggleComplete}
            theme={theme}
            animatingTaskId={animatingTaskId}
          />
        </div>

        {/* Note input area */}
        <div className="w-full max-w-[70vw] sm:max-w-[600px] px-4 flex flex-col items-center">
          {/* Placeholder text */}
          {!isInputFocused && !currentInput && (
            <div
              className="text-center mb-4 animate-fadeIn"
              style={{ color: theme.textMuted, fontSize: '14px' }}
            >
              <span className="typing-text">随时记录，不再遗忘...</span>
            </div>
          )}

          {/* Editable area */}
          <div
            className={`w-full relative ${isShaking ? 'animate-shake' : ''}`}
          >
            <div
              ref={inputRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              onCompositionStart={() => { isComposingRef.current = true; }}
              onCompositionEnd={() => { isComposingRef.current = false; }}
              className="w-full min-h-[60px] max-h-[200px] overflow-y-auto outline-none text-center break-words"
              style={{
                color: theme.text,
                fontSize: 'clamp(24px, 4vw, 36px)',
                lineHeight: 1.4,
                fontFamily: "'Noto Sans SC', sans-serif",
                fontWeight: 400,
                caretColor: theme.accent,
              }}
              data-placeholder="随时记录，不再遗忘..."
            />
          </div>

          {/* Enter hint */}
          {showEnterHint && (
            <div
              className="mt-3 text-xs animate-fadeIn"
              style={{ color: theme.textMuted }}
            >
              按 Enter 提交
            </div>
          )}
        </div>
      </div>

      {/* Control panel */}
      <ControlPanel
        soundEnabled={state.soundEnabled}
        onToggleSound={() => updateState({ soundEnabled: !state.soundEnabled })}
        onToggleTheme={cycleTheme}
        onOpenList={() => setActiveDrawer('list')}
        onOpenTrash={() => setActiveDrawer('trash')}
        onToggleShortcuts={() => setShowShortcuts(true)}
        theme={theme}
      />

      {/* Drawers */}
      <TaskListDrawer
        isOpen={activeDrawer === 'list'}
        onClose={() => setActiveDrawer('none')}
        tasks={state.tasks}
        onToggleComplete={toggleComplete}
        onDelete={deleteTask}
        onEdit={editTask}
        onClearCompleted={clearCompleted}
        theme={theme}
      />

      <SearchDrawer
        isOpen={activeDrawer === 'search'}
        onClose={() => setActiveDrawer('none')}
        tasks={state.tasks}
        onToggleComplete={toggleComplete}
        theme={theme}
      />

      <TrashDrawer
        isOpen={activeDrawer === 'trash'}
        onClose={() => setActiveDrawer('none')}
        deletedTasks={state.deletedTasks}
        onRestore={restoreTask}
        onClearAll={clearTrash}
        theme={theme}
      />

      {/* Shortcuts overlay */}
      <ShortcutsOverlay
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
        theme={theme}
      />
    </div>
  );
}
