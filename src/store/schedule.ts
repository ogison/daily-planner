import { create } from "zustand";
import {
  ScheduleItem,
  DaySchedule,
  ScheduleCategory,
  CATEGORY_COLORS,
} from "@/types/schedule";

interface ScheduleStore {
  schedules: Record<string, DaySchedule>;

  // Actions
  getCurrentSchedule: (date: string) => DaySchedule;
  addScheduleItem: (item: Omit<ScheduleItem, "id">, date: string) => void;
  updateScheduleItem: (id: string, updates: Partial<ScheduleItem>, date: string) => void;
  deleteScheduleItem: (id: string, date: string) => void;
  reorderScheduleItems: (items: ScheduleItem[], date: string) => void;
}

const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// const getTodayString = (): string => {
//   return new Date().toISOString().split("T")[0];
// };

const createDefaultScheduleItem = (
  title: string,
  startTime: number,
  endTime: number,
  category: ScheduleCategory
): Omit<ScheduleItem, "id"> => ({
  title,
  startTime,
  endTime,
  category,
  color: CATEGORY_COLORS[category],
  notes: "",
});

const createSampleSchedule = (date: string): DaySchedule => ({
  date,
  items: [
    {
      id: generateId(),
      ...createDefaultScheduleItem("睡眠", 0, 420, "sleep"), // 00:00-07:00
    },
    {
      id: generateId(),
      ...createDefaultScheduleItem("朝食", 420, 480, "meal"), // 07:00-08:00
    },
    {
      id: generateId(),
      ...createDefaultScheduleItem("通勤", 480, 540, "commute"), // 08:00-09:00
    },
    {
      id: generateId(),
      ...createDefaultScheduleItem("仕事", 540, 720, "work"), // 09:00-12:00
    },
    {
      id: generateId(),
      ...createDefaultScheduleItem("昼食", 720, 780, "meal"), // 12:00-13:00
    },
    {
      id: generateId(),
      ...createDefaultScheduleItem("仕事", 780, 1080, "work"), // 13:00-18:00
    },
    {
      id: generateId(),
      ...createDefaultScheduleItem("通勤", 1080, 1140, "commute"), // 18:00-19:00
    },
    {
      id: generateId(),
      ...createDefaultScheduleItem("夕食", 1140, 1200, "meal"), // 19:00-20:00
    },
    {
      id: generateId(),
      ...createDefaultScheduleItem("自由時間", 1200, 1380, "leisure"), // 20:00-23:00
    },
    {
      id: generateId(),
      ...createDefaultScheduleItem("睡眠", 1380, 1440, "sleep"), // 23:00-24:00
    },
  ],
});

export const useScheduleStore = create<ScheduleStore>((set, get) => ({
  schedules: {},

  getCurrentSchedule: (date: string): DaySchedule => {
    const { schedules } = get();
    const currentDate = date;
    if (!schedules[currentDate]) {
      const newSchedule = createSampleSchedule(currentDate);
      set({
        schedules: {
          ...schedules,
          [currentDate]: newSchedule,
        },
      });
      return newSchedule;
    }
    return schedules[currentDate];
  },

  addScheduleItem: (item: Omit<ScheduleItem, "id">, date: string) => {
    const { schedules } = get();
    const currentSchedule = get().getCurrentSchedule(date);

    const newItem: ScheduleItem = {
      ...item,
      id: generateId(),
      color: item.color || CATEGORY_COLORS[item.category],
    };

    const updatedItems = [...currentSchedule.items, newItem].sort(
      (a, b) => a.startTime - b.startTime
    );

    set({
      schedules: {
        ...schedules,
        [date]: {
          ...currentSchedule,
          items: updatedItems,
        },
      },
    });
  },

  updateScheduleItem: (id: string, updates: Partial<ScheduleItem>, date: string) => {
    const { schedules } = get();
    const currentSchedule = get().getCurrentSchedule(date);

    const updatedItems = currentSchedule.items
      .map((item) =>
        item.id === id
          ? {
              ...item,
              ...updates,
              color: updates.category
                ? CATEGORY_COLORS[updates.category]
                : item.color,
            }
          : item
      )
      .sort((a, b) => a.startTime - b.startTime);

    set({
      schedules: {
        ...schedules,
        [date]: {
          ...currentSchedule,
          items: updatedItems,
        },
      },
    });
  },

  deleteScheduleItem: (id: string, date: string) => {
    const { schedules } = get();
    const currentSchedule = get().getCurrentSchedule(date);

    const updatedItems = currentSchedule.items.filter((item) => item.id !== id);

    set({
      schedules: {
        ...schedules,
        [date]: {
          ...currentSchedule,
          items: updatedItems,
        },
      },
    });
  },

  reorderScheduleItems: (items: ScheduleItem[], date: string) => {
    const { schedules } = get();
    const currentSchedule = get().getCurrentSchedule(date);

    set({
      schedules: {
        ...schedules,
        [date]: {
          ...currentSchedule,
          items: items.sort((a, b) => a.startTime - b.startTime),
        },
      },
    });
  },
}));
