import { create } from 'zustand';
import type { WordCloudSession, WordEntry, WordCount, WordCloudSettings } from '../types';

interface WordCloudStore {
  // Session state
  session: WordCloudSession | null;
  sessionCode: string | null;

  // Word entries
  entries: WordEntry[];
  wordCounts: WordCount[];

  // Participant state
  participantId: string | null;
  participantName: string | null;
  submittedWords: string[]; // Words submitted by current participant

  // UI state
  isLoading: boolean;
  error: string | null;
  isCloudMode: boolean;

  // Actions
  setSession: (session: WordCloudSession, code: string) => void;
  addEntry: (entry: WordEntry) => void;
  addEntries: (entries: WordEntry[]) => void;
  setParticipant: (id: string, name: string) => void;
  addSubmittedWord: (word: string) => void;
  setWordCounts: (counts: WordCount[]) => void;
  setIsCloudMode: (isCloud: boolean) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  updateSettings: (settings: Partial<WordCloudSettings>) => void;
  closeSession: () => void;
  reset: () => void;
}

export const useWordCloudStore = create<WordCloudStore>((set) => ({
  // Initial state
  session: null,
  sessionCode: null,
  entries: [],
  wordCounts: [],
  participantId: null,
  participantName: null,
  submittedWords: [],
  isLoading: false,
  error: null,
  isCloudMode: false,

  // Actions
  setSession: (session, code) =>
    set({ session, sessionCode: code, error: null }),

  addEntry: (entry) =>
    set((state) => {
      const newEntries = [...state.entries, entry];
      return {
        entries: newEntries,
        wordCounts: calculateWordCounts(newEntries),
      };
    }),

  addEntries: (entries) =>
    set((state) => {
      const newEntries = [...state.entries, ...entries];
      return {
        entries: newEntries,
        wordCounts: calculateWordCounts(newEntries),
      };
    }),

  setParticipant: (id, name) =>
    set({ participantId: id, participantName: name }),

  addSubmittedWord: (word) =>
    set((state) => ({
      submittedWords: [...state.submittedWords, word],
    })),

  setWordCounts: (counts) => set({ wordCounts: counts }),

  setIsCloudMode: (isCloud) => set({ isCloudMode: isCloud }),

  setError: (error) => set({ error }),

  setLoading: (loading) => set({ isLoading: loading }),

  updateSettings: (settings) =>
    set((state) => ({
      session: state.session
        ? {
            ...state.session,
            settings: { ...state.session.settings, ...settings },
          }
        : null,
    })),

  closeSession: () =>
    set((state) => ({
      session: state.session
        ? { ...state.session, status: 'closed' }
        : null,
    })),

  reset: () =>
    set({
      session: null,
      sessionCode: null,
      entries: [],
      wordCounts: [],
      participantId: null,
      participantName: null,
      submittedWords: [],
      isLoading: false,
      error: null,
      isCloudMode: false,
    }),
}));

// Helper function to calculate word counts
function calculateWordCounts(entries: WordEntry[]): WordCount[] {
  const wordMap = new Map<string, number>();

  entries.forEach((entry) => {
    const word = entry.word.toLowerCase().trim();
    wordMap.set(word, (wordMap.get(word) || 0) + 1);
  });

  return Array.from(wordMap.entries())
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value);
}
