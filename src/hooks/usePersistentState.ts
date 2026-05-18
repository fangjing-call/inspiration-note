import { useState, useEffect, useCallback, useRef } from 'react';
import type { AppState } from '@/types';

const STORAGE_KEY = 'inspo-note-state';

const defaultState: AppState = {
  tasks: [],
  deletedTasks: [],
  soundEnabled: true,
  themeIndex: 0,
};

function loadState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaultState, ...parsed };
    }
  } catch {
    // ignore
  }
  return { ...defaultState };
}

export function usePersistentState() {
  const [state, setState] = useState<AppState>(loadState);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveState = useCallback((newState: AppState) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          tasks: newState.tasks,
          deletedTasks: newState.deletedTasks,
          soundEnabled: newState.soundEnabled,
          themeIndex: newState.themeIndex,
        }));
      } catch {
        // ignore
      }
    }, 500);
  }, []);

  useEffect(() => {
    saveState(state);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [state, saveState]);

  const updateState = useCallback((updater: Partial<AppState> | ((prev: AppState) => Partial<AppState>)) => {
    setState(prev => {
      const updates = typeof updater === 'function' ? updater(prev) : updater;
      return { ...prev, ...updates };
    });
  }, []);

  return { state, updateState };
}
