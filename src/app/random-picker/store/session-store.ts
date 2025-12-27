import { create } from 'zustand';

type SessionMode = 'single' | 'host' | 'participant';

interface SessionStore {
  mode: SessionMode;
  sessionCode: string | null;
  participantName: string | null;

  setMode: (mode: SessionMode, sessionCode?: string, participantName?: string) => void;
  generateSessionCode: () => string;
  reset: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  mode: 'single',
  sessionCode: null,
  participantName: null,

  setMode: (mode, sessionCode, participantName) => {
    set({
      mode,
      sessionCode: sessionCode || null,
      participantName: participantName || null
    });
  },

  generateSessionCode: () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  },

  reset: () => {
    set({ mode: 'single', sessionCode: null, participantName: null });
  },
}));
