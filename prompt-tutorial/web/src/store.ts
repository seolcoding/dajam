import { create } from 'zustand';

interface TutorialState {
  // LLM Response
  response: string;
  isLoading: boolean;
  error: string | null;

  // Actions
  setResponse: (response: string) => void;
  appendResponse: (chunk: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearResponse: () => void;
}

export const useTutorialStore = create<TutorialState>((set) => ({
  response: '',
  isLoading: false,
  error: null,

  setResponse: (response) => set({ response }),
  appendResponse: (chunk) => set((state) => ({ response: state.response + chunk })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearResponse: () => set({ response: '', error: null }),
}));
