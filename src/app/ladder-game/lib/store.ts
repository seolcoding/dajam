/**
 * Ladder Game Zustand Store
 */

import { create } from 'zustand';
import type { LadderData, LadderConfig, Participant, Result } from './ladder/types';

interface LadderStore {
  // State
  participants: Participant[];
  results: Result[];
  ladder: LadderData | null;
  config: LadderConfig;
  isAnimating: boolean;
  currentAnimatingIndex: number;
  revealed: Map<string, string>;

  // Actions
  setParticipants: (participants: Participant[]) => void;
  setResults: (results: Result[]) => void;
  setLadder: (ladder: LadderData | null) => void;
  setConfig: (config: Partial<LadderConfig>) => void;
  setIsAnimating: (isAnimating: boolean) => void;
  setCurrentAnimatingIndex: (index: number) => void;
  setRevealed: (participantId: string, resultId: string) => void;
  reset: () => void;
}

const defaultConfig: LadderConfig = {
  density: 0.5,
  theme: 'light',
  revealMode: 'sequential'
};

export const useLadderStore = create<LadderStore>((set) => ({
  participants: [],
  results: [],
  ladder: null,
  config: defaultConfig,
  isAnimating: false,
  currentAnimatingIndex: -1,
  revealed: new Map(),

  setParticipants: (participants) => set({ participants }),
  setResults: (results) => set({ results }),
  setLadder: (ladder) => set({ ladder }),
  setConfig: (config) => set((state) => ({
    config: { ...state.config, ...config }
  })),
  setIsAnimating: (isAnimating) => set({ isAnimating }),
  setCurrentAnimatingIndex: (index) => set({ currentAnimatingIndex: index }),
  setRevealed: (participantId, resultId) => set((state) => {
    const revealed = new Map(state.revealed);
    revealed.set(participantId, resultId);
    return { revealed };
  }),
  reset: () => set({
    ladder: null,
    isAnimating: false,
    currentAnimatingIndex: -1,
    revealed: new Map()
  })
}));
