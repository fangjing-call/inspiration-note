export interface Task {
  id: string;
  content: string;
  completed: boolean;
  createdAt: number;
  deletedAt?: number;
}

export type DrawerType = 'none' | 'list' | 'search' | 'trash';
export type TabType = 'todo' | 'completed' | 'all';

export interface AppState {
  tasks: Task[];
  deletedTasks: Task[];
  soundEnabled: boolean;
  themeIndex: number;
}

export const THEMES = [
  { name: '莫兰迪灰紫', bg: '#AEB5BF', surface: '#B5C5B3', text: '#4A4A4A', textCompleted: '#7A8A78', textMuted: '#7A808A', accent: '#8B92A0' },
  { name: '暖沙色', bg: '#C4B8A8', surface: '#C4B8A8', text: '#4A4A4A', textCompleted: '#7A7068', textMuted: '#8A7E72', accent: '#9A9088' },
  { name: '雾蓝', bg: '#A8B4C4', surface: '#B0C0B0', text: '#3A3A3A', textCompleted: '#6A7A6A', textMuted: '#6A7888', accent: '#8898A8' },
];
