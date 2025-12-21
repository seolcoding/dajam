import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IcebreakerStore } from '@/types';

export const useIcebreakerStore = create<IcebreakerStore>()(
  persist(
    (set, get) => ({
      answers: [],

      addAnswer: (answer) => {
        set((state) => ({ answers: [...state.answers, answer] }));
      },

      getAnswersByRoom: (roomId) => {
        return get().answers
          .filter(a => a.roomId === roomId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    }),
    {
      name: 'student-network-icebreaker',
      version: 1
    }
  )
);
