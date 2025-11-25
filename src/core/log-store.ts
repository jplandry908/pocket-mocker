// src/core/logStore.ts
import { writable } from 'svelte/store';

export interface LogEntry {
  id: string;
  method: string;
  url: string;
  status: number;
  timestamp: number;
  duration: number; // 耗时(ms)
  isMock: boolean;  // 标记是否被我们拦截了
}

function createLogStore() {
  const { subscribe, update } = writable<LogEntry[]>([]);

  return {
    subscribe,
    add: (log: Omit<LogEntry, 'id'>) => {
      const entry = { ...log, id: Date.now().toString() + Math.random() };
      update(logs => {
        // 新日志在最前，只保留最近 50 条
        const newLogs = [entry, ...logs];
        return newLogs.slice(0, 50);
      });
    },
    clear: () => update(() => [])
  };
}

export const requestLogs = createLogStore();