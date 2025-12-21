import { create } from 'zustand';
import type { Participant, TeamSettings } from '@/types/team';
import { divideIntoTeams } from '@/utils/shuffle';
import { generateAllQRCodes } from '@/utils/qrcode';

interface TeamStore {
  // State
  participants: Participant[];
  settings: TeamSettings;
  teams: Participant[][];
  isShuffled: boolean;
  qrCodes: Map<string, string>;
  isGeneratingQR: boolean;

  // Actions - Participants
  addParticipant: (name: string) => void;
  addBulkParticipants: (names: string[]) => void;
  removeParticipant: (id: string) => void;
  clearParticipants: () => void;

  // Actions - Settings
  setSettings: (settings: TeamSettings) => void;

  // Actions - Division
  divideTeams: () => Promise<void>;
  reset: () => void;
}

export const useTeamStore = create<TeamStore>((set, get) => ({
  // Initial state
  participants: [],
  settings: { mode: 'byTeamCount', teamCount: 2 },
  teams: [],
  isShuffled: false,
  qrCodes: new Map(),
  isGeneratingQR: false,

  // Add single participant
  addParticipant: (name: string) => {
    if (!name.trim()) return;

    const newParticipant: Participant = {
      id: crypto.randomUUID(),
      name: name.trim(),
    };

    set((state) => ({
      participants: [...state.participants, newParticipant],
    }));
  },

  // Add multiple participants
  addBulkParticipants: (names: string[]) => {
    const newParticipants: Participant[] = names
      .filter(n => n.trim())
      .map(name => ({
        id: crypto.randomUUID(),
        name: name.trim(),
      }));

    set((state) => ({
      participants: [...state.participants, ...newParticipants],
    }));
  },

  // Remove participant
  removeParticipant: (id: string) => {
    set((state) => ({
      participants: state.participants.filter(p => p.id !== id),
    }));
  },

  // Clear all participants
  clearParticipants: () => {
    set({ participants: [] });
  },

  // Update settings
  setSettings: (settings: TeamSettings) => {
    set({ settings });
  },

  // Divide teams
  divideTeams: async () => {
    const { participants, settings } = get();

    if (participants.length < 2) {
      alert('최소 2명 이상의 참가자가 필요합니다.');
      return;
    }

    try {
      // 팀 분배
      const teams = divideIntoTeams(participants, settings);

      set({ teams, isShuffled: true, isGeneratingQR: true });

      // QR 코드 생성 (비동기)
      const qrCodes = await generateAllQRCodes(teams);

      set({ qrCodes, isGeneratingQR: false });
    } catch (error) {
      console.error('Failed to divide teams:', error);
      alert('팀 분배에 실패했습니다. 설정을 확인해주세요.');
      set({ isGeneratingQR: false });
    }
  },

  // Reset to initial state
  reset: () => {
    set({
      teams: [],
      isShuffled: false,
      qrCodes: new Map(),
      isGeneratingQR: false,
    });
  },
}));
