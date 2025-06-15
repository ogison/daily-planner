export interface ScheduleItem {
  id: string;
  title: string;
  startTime: number; // 0-1440 (minutes from 00:00)
  endTime: number;   // 0-1440 (minutes from 00:00)
  category: ScheduleCategory;
  notes?: string;
  color?: string;
}

export type ScheduleCategory = 
  | 'work'
  | 'study'
  | 'exercise'
  | 'meal'
  | 'sleep'
  | 'leisure'
  | 'commute'
  | 'personal'
  | 'other';

export interface DaySchedule {
  date: string; // YYYY-MM-DD format
  items: ScheduleItem[];
}

export const CATEGORY_COLORS: Record<ScheduleCategory, string> = {
  work: '#3b82f6',      // blue
  study: '#10b981',     // emerald
  exercise: '#f59e0b',  // amber
  meal: '#f97316',      // orange
  sleep: '#6366f1',     // indigo
  leisure: '#ec4899',   // pink
  commute: '#6b7280',   // gray
  personal: '#8b5cf6',  // violet
  other: '#64748b',     // slate
};

export const CATEGORY_LABELS: Record<ScheduleCategory, string> = {
  work: '仕事',
  study: '勉強',
  exercise: '運動',
  meal: '食事',
  sleep: '睡眠',
  leisure: '娯楽',
  commute: '通勤',
  personal: '個人用事',
  other: 'その他',
};

export const timeToMinutes = (hour: number, minute: number): number => {
  return hour * 60 + minute;
};

export const minutesToTime = (minutes: number): { hour: number; minute: number } => {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return { hour, minute };
};

export const formatTime = (minutes: number): string => {
  const { hour, minute } = minutesToTime(minutes);
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};