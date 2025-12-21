import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  BingoConfig,
  BingoState,
  CallRecord,
  GameMode,
} from '@/types/bingo.types';
import {
  initializeBingoState,
  toggleCell,
  checkBingo,
  markItem,
} from '@/utils/bingoAlgorithm';
import { generateBingoCard } from '@/utils/shuffleAlgorithm';
import { generateGameCode } from '@/utils/gameCodeGenerator';

interface BingoStore {
  // Game Mode
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;

  // Game Config
  config: BingoConfig | null;
  setConfig: (config: BingoConfig) => void;

  // Game Code
  gameCode: string | null;
  createGame: (config: BingoConfig) => string;
  joinGame: (code: string) => void;

  // Player State
  playerCard: string[][] | null;
  bingoState: BingoState | null;
  initializePlayer: (card: string[][]) => void;
  markCell: (row: number, col: number) => void;

  // Host State
  calledItems: Set<string>;
  callHistory: CallRecord[];
  currentCall: string | null;
  performCall: (item: string) => void;
  randomCall: () => void;
  getRemainingItems: () => string[];

  // Auto Call
  autoCallEnabled: boolean;
  autoCallInterval: number;
  setAutoCallInterval: (seconds: number) => void;
  toggleAutoCall: () => void;

  // UI State
  soundEnabled: boolean;
  toggleSound: () => void;
  showBingoModal: boolean;
  setShowBingoModal: (show: boolean) => void;

  // Reset
  reset: () => void;
  resetGame: () => void;
}

export const useBingoStore = create<BingoStore>()(
  persist(
    (set, get) => ({
      // Initial State
      gameMode: 'menu',
      config: null,
      gameCode: null,
      playerCard: null,
      bingoState: null,
      calledItems: new Set(),
      callHistory: [],
      currentCall: null,
      autoCallEnabled: false,
      autoCallInterval: 5,
      soundEnabled: true,
      showBingoModal: false,

      // Actions
      setGameMode: (mode) => set({ gameMode: mode }),

      setConfig: (config) => set({ config }),

      createGame: (config) => {
        const code = generateGameCode();
        set({ gameCode: code, config, gameMode: 'host' });
        return code;
      },

      joinGame: (code) => {
        // For demo: create a default config when joining
        const defaultConfig: BingoConfig = {
          type: 'theme',
          gridSize: 5,
          items: [], // Will be filled from theme preset
          winConditions: ['single-line'],
          centerFree: true,
        };
        set({ gameCode: code, config: defaultConfig, gameMode: 'player' });
      },

      initializePlayer: (card) => {
        const bingoState = initializeBingoState(card);
        set({ playerCard: card, bingoState });
      },

      markCell: (row, col) => {
        const { bingoState } = get();
        if (!bingoState) return;

        const success = toggleCell(bingoState, row, col);
        if (!success) return;

        const newLines = checkBingo(bingoState);

        if (newLines.length > 0) {
          set({ showBingoModal: true });
        }

        set({ bingoState: { ...bingoState } });
      },

      performCall: (item) => {
        const { calledItems, callHistory, config, bingoState } = get();

        if (calledItems.has(item)) return;

        const newCalledItems = new Set(calledItems);
        newCalledItems.add(item);

        const newRecord: CallRecord = {
          item,
          timestamp: Date.now(),
          order: newCalledItems.size,
        };

        // 플레이어 모드일 경우 자동 마킹
        if (bingoState) {
          markItem(bingoState, item);
          const newLines = checkBingo(bingoState);

          if (newLines.length > 0) {
            set({ showBingoModal: true });
          }
        }

        set({
          calledItems: newCalledItems,
          callHistory: [...callHistory, newRecord],
          currentCall: item,
          bingoState: bingoState ? { ...bingoState } : null,
        });
      },

      randomCall: () => {
        const remaining = get().getRemainingItems();
        if (remaining.length === 0) return;

        const randomIndex = Math.floor(Math.random() * remaining.length);
        const item = remaining[randomIndex];
        get().performCall(item);
      },

      getRemainingItems: () => {
        const { config, calledItems } = get();
        if (!config) return [];

        return config.items.filter(item => !calledItems.has(item));
      },

      setAutoCallInterval: (seconds) => set({ autoCallInterval: seconds }),

      toggleAutoCall: () => set((state) => ({ autoCallEnabled: !state.autoCallEnabled })),

      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

      setShowBingoModal: (show) => set({ showBingoModal: show }),

      resetGame: () => set({
        calledItems: new Set(),
        callHistory: [],
        currentCall: null,
        playerCard: null,
        bingoState: null,
        autoCallEnabled: false,
        showBingoModal: false,
      }),

      reset: () => set({
        gameMode: 'menu',
        config: null,
        gameCode: null,
        playerCard: null,
        bingoState: null,
        calledItems: new Set(),
        callHistory: [],
        currentCall: null,
        autoCallEnabled: false,
        showBingoModal: false,
      }),
    }),
    {
      name: 'bingo-storage',
      partialize: (state) => ({
        soundEnabled: state.soundEnabled,
      }),
    }
  )
);
