import type { Wallet } from "@coinbase/coinbase-sdk"
import { createStore } from "zustand/vanilla"
import { nanoid } from "nanoid"

export interface Task {
  id: string;
  goal: string;
  task: string;
  status: 'pending' | 'completed' | 'failed';
  result?: string;
  timestamp: number;
}

interface State {
  wallet: Wallet | null;
  setWallet: (wallet: Wallet) => void;
  tasks: Task[];
  addTask: (goal: string, task: string) => string;
  updateTaskStatus: (taskId: string, status: Task['status'], result?: string) => void;
  getProgress: () => { recent: Task[], stats: { completed: number, pending: number, failed: number } };
}

export const useStore = createStore<State>((set, get) => ({
    wallet: null,
    setWallet: (wallet: Wallet) => set({ wallet }),
    tasks: [],
    addTask: (goal: string, task: string) => {
        const id = nanoid();
        set((state) => ({
            tasks: [...state.tasks, {
                id,
                goal,
                task,
                status: 'pending',
                timestamp: Date.now()
            }]
        }));
        return id; // Return the ID so it can be used for status updates
    },
    updateTaskStatus: (taskId: string, status: Task['status'], result?: string) => set((state) => ({
        tasks: state.tasks.map((task) =>
            task.id === taskId ? { ...task, status, result } : task
        )
    })),
    getProgress: () => {
        const state = get();
        const recent = state.tasks.slice(-10).reverse(); // Last 10 tasks
        const stats = state.tasks.reduce((acc, task) => ({
            ...acc,
            [task.status]: acc[task.status] + 1
        }), { completed: 0, pending: 0, failed: 0 });
        return { recent, stats };
    }
}))
