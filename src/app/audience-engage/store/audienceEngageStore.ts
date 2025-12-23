import { create } from 'zustand';
import type {
  ActiveScene,
  AudienceEngageConfig,
  PresentationFile,
  PresentationState,
  SlideItem,
  Question,
  ChatMessage,
  SceneType,
} from '../types';

/**
 * Audience Engage Store
 * 프레젠테이션 상태 및 실시간 동기화 관리
 */

interface AudienceEngageState {
  // Session info
  sessionCode: string | null;
  sessionId: string | null;
  isHost: boolean;

  // Presentation
  config: AudienceEngageConfig | null;
  presentation: PresentationFile | null;
  slideItems: SlideItem[];

  // Active scene
  activeScene: ActiveScene;

  // Presentation state (synced)
  presentationState: PresentationState | null;

  // Q&A
  questions: Question[];

  // Chat
  chatMessages: ChatMessage[];

  // UI state
  isSidebarOpen: boolean;
  activeTab: 'qa' | 'chat' | 'participants';
}

interface AudienceEngageActions {
  // Session
  setSession: (sessionCode: string, sessionId: string, isHost: boolean) => void;
  clearSession: () => void;

  // Config
  setConfig: (config: AudienceEngageConfig) => void;
  setPresentation: (presentation: PresentationFile) => void;
  setSlideItems: (items: SlideItem[]) => void;

  // Scene navigation
  setActiveScene: (scene: ActiveScene) => void;
  goToSlide: (slideIndex: number) => void;
  goToNextItem: () => void;
  goToPrevItem: () => void;
  goToScene: (type: SceneType, linkedSessionCode?: string) => void;

  // Presentation state
  setPresentationState: (state: PresentationState) => void;
  updateSettings: (settings: Partial<PresentationState>) => void;

  // Q&A
  addQuestion: (question: Question) => void;
  removeQuestion: (questionId: string) => void;
  updateQuestion: (questionId: string, updates: Partial<Question>) => void;
  setQuestions: (questions: Question[]) => void;

  // Chat
  addChatMessage: (message: ChatMessage) => void;
  setChatMessages: (messages: ChatMessage[]) => void;

  // UI
  toggleSidebar: () => void;
  setActiveTab: (tab: 'qa' | 'chat' | 'participants') => void;
}

type AudienceEngageStore = AudienceEngageState & AudienceEngageActions;

const initialState: AudienceEngageState = {
  sessionCode: null,
  sessionId: null,
  isHost: false,
  config: null,
  presentation: null,
  slideItems: [],
  activeScene: {
    type: 'slides',
    itemIndex: 0,
    slideIndex: 0,
  },
  presentationState: null,
  questions: [],
  chatMessages: [],
  isSidebarOpen: true,
  activeTab: 'qa',
};

export const useAudienceEngageStore = create<AudienceEngageStore>((set, get) => ({
  ...initialState,

  // Session
  setSession: (sessionCode, sessionId, isHost) => {
    set({ sessionCode, sessionId, isHost });
  },

  clearSession: () => {
    set(initialState);
  },

  // Config
  setConfig: (config) => {
    set({
      config,
      slideItems: config.slideItems || [],
    });
  },

  setPresentation: (presentation) => {
    set({ presentation });
  },

  setSlideItems: (items) => {
    set({ slideItems: items });
  },

  // Scene navigation
  setActiveScene: (scene) => {
    set({ activeScene: scene });
  },

  goToSlide: (slideIndex) => {
    set({
      activeScene: {
        type: 'slides',
        itemIndex: 0,
        slideIndex,
      },
    });
  },

  goToNextItem: () => {
    const { activeScene, slideItems } = get();

    // If on slides, increment slide index
    if (activeScene.type === 'slides') {
      set({
        activeScene: {
          ...activeScene,
          slideIndex: (activeScene.slideIndex || 0) + 1,
        },
      });
      return;
    }

    // Otherwise go to next item
    if (activeScene.itemIndex < slideItems.length - 1) {
      const nextItem = slideItems[activeScene.itemIndex + 1];
      set({
        activeScene: {
          type: (nextItem.itemType as SceneType) || 'slides',
          itemIndex: activeScene.itemIndex + 1,
          slideIndex: nextItem.slideIndex,
          linkedSessionCode: nextItem.linkedSessionCode,
        },
      });
    }
  },

  goToPrevItem: () => {
    const { activeScene, slideItems } = get();

    // If on slides and not at first slide, decrement
    if (activeScene.type === 'slides' && (activeScene.slideIndex || 0) > 0) {
      set({
        activeScene: {
          ...activeScene,
          slideIndex: (activeScene.slideIndex || 0) - 1,
        },
      });
      return;
    }

    // Otherwise go to previous item
    if (activeScene.itemIndex > 0) {
      const prevItem = slideItems[activeScene.itemIndex - 1];
      set({
        activeScene: {
          type: (prevItem?.itemType as SceneType) || 'slides',
          itemIndex: activeScene.itemIndex - 1,
          slideIndex: prevItem?.slideIndex,
          linkedSessionCode: prevItem?.linkedSessionCode,
        },
      });
    }
  },

  goToScene: (type, linkedSessionCode) => {
    set({
      activeScene: {
        type,
        itemIndex: 0,
        linkedSessionCode,
      },
    });
  },

  // Presentation state
  setPresentationState: (state) => {
    set({ presentationState: state });
  },

  updateSettings: (settings) => {
    const { presentationState } = get();
    if (presentationState) {
      set({
        presentationState: {
          ...presentationState,
          ...settings,
          updatedAt: new Date().toISOString(),
        },
      });
    }
  },

  // Q&A
  addQuestion: (question) => {
    set((state) => ({
      questions: [...state.questions, question],
    }));
  },

  removeQuestion: (questionId) => {
    set((state) => ({
      questions: state.questions.filter((q) => q.id !== questionId),
    }));
  },

  updateQuestion: (questionId, updates) => {
    set((state) => ({
      questions: state.questions.map((q) =>
        q.id === questionId ? { ...q, ...updates } : q
      ),
    }));
  },

  setQuestions: (questions) => {
    set({ questions });
  },

  // Chat
  addChatMessage: (message) => {
    set((state) => ({
      chatMessages: [...state.chatMessages, message],
    }));
  },

  setChatMessages: (messages) => {
    set({ chatMessages: messages });
  },

  // UI
  toggleSidebar: () => {
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
  },

  setActiveTab: (tab) => {
    set({ activeTab: tab });
  },
}));

// Selector hooks for optimized re-renders
export const useActiveScene = () => useAudienceEngageStore((state) => state.activeScene);
export const useIsHost = () => useAudienceEngageStore((state) => state.isHost);
export const useQuestions = () => useAudienceEngageStore((state) => state.questions);
export const useChatMessages = () => useAudienceEngageStore((state) => state.chatMessages);
export const usePresentationState = () => useAudienceEngageStore((state) => state.presentationState);
