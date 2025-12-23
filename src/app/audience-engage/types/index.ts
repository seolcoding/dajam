/**
 * Audience Engage Types
 * 슬라이드 기반 실시간 청중 참여 플랫폼
 */

// Scene 타입 - 6개 기존 앱 + slides
export type SceneType =
  | 'slides'
  | 'quiz'
  | 'vote'
  | 'this-or-that'
  | 'word-cloud'
  | 'personality'
  | 'bingo';

// 슬라이드 소스 타입
export type SlideSourceType = 'google-slides' | 'pdf' | 'images';

// 프레젠테이션 상태
export type PresentationStatus = 'processing' | 'ready' | 'error';

// 슬라이드 아이템 타입
export type SlideItemType = 'slide' | 'poll' | 'quiz' | 'this-or-that' | 'word-cloud' | 'personality' | 'bingo' | 'embed';

/**
 * 프레젠테이션 파일 정보
 */
export interface PresentationFile {
  id: string;
  sessionId: string;
  sourceType: SlideSourceType;
  sourceUrl?: string; // Google Slides URL
  slideCount: number;
  status: PresentationStatus;
  createdAt: string;
}

/**
 * 슬라이드 이미지 (PDF/이미지 업로드용)
 */
export interface SlideImage {
  id: string;
  presentationId: string;
  position: number;
  imageUrl: string;
  thumbnailUrl?: string;
  createdAt: string;
}

/**
 * 프레젠테이션 상태 (실시간 동기화)
 */
export interface PresentationState {
  sessionId: string;
  currentSlide: number;
  isPresenting: boolean;
  chatEnabled: boolean;
  reactionsEnabled: boolean;
  anonymousAllowed: boolean;
  updatedAt: string;
}

/**
 * 슬라이드 아이템 (슬라이드 + 인터랙션 순서)
 */
export interface SlideItem {
  id: string;
  sessionId: string;
  position: number;
  itemType: SlideItemType;
  slideIndex?: number; // type: 'slide' - presentation의 슬라이드 인덱스
  pollId?: string; // type: 'poll'
  linkedSessionCode?: string; // type: 'quiz' | 'this-or-that' 등
  embedUrl?: string; // type: 'embed'
  createdAt: string;
}

/**
 * Q&A 질문
 */
export interface Question {
  id: string;
  sessionId: string;
  participantId?: string;
  authorName: string;
  body: string;
  likeCount: number;
  isHighlighted: boolean;
  isAnswered: boolean;
  createdAt: string;
}

/**
 * 채팅 메시지
 */
export interface ChatMessage {
  id: string;
  sessionId: string;
  participantId?: string;
  authorName: string;
  body: string;
  slidePosition: number;
  createdAt: string;
}

/**
 * 이모지 리액션 카운트
 */
export interface ReactionCounts {
  sessionId: string;
  thumbsUp: number;
  heart: number;
  laugh: number;
  clap: number;
  party: number;
  updatedAt: string;
}

/**
 * 이모지 타입
 */
export type EmojiType = 'thumbsUp' | 'heart' | 'laugh' | 'clap' | 'party';

export const EMOJI_MAP: Record<EmojiType, string> = {
  thumbsUp: '👍',
  heart: '❤️',
  laugh: '😂',
  clap: '👏',
  party: '🎉',
};

/**
 * Audience Engage 세션 설정
 */
export interface AudienceEngageConfig {
  title: string;
  description?: string;
  presentationId?: string;
  slideItems: SlideItem[];
  settings: {
    chatEnabled: boolean;
    reactionsEnabled: boolean;
    qaEnabled: boolean;
    anonymousAllowed: boolean;
  };
}

/**
 * Scene 설정 - 각 Scene별 설정 정보
 */
export interface SceneConfig {
  type: SceneType;
  title: string;
  linkedSessionCode?: string; // 기존 앱 세션 연동 시
  config?: Record<string, unknown>; // Scene별 추가 설정
}

/**
 * 현재 활성 Scene 상태
 */
export interface ActiveScene {
  type: SceneType;
  itemIndex: number;
  slideIndex?: number; // type: 'slides'일 때
  linkedSessionCode?: string;
}

/**
 * 호스트 뷰 Props
 */
export interface HostViewProps {
  sessionCode: string;
  presentation?: PresentationFile;
  slideItems: SlideItem[];
  currentScene: ActiveScene;
  participants: Array<{ id: string; displayName: string }>;
  onSceneChange: (scene: ActiveScene) => void;
  onSettingsChange: (settings: Partial<PresentationState>) => void;
}

/**
 * 참여자 뷰 Props
 */
export interface ParticipantViewProps {
  sessionCode: string;
  currentScene: ActiveScene;
  presentationState: PresentationState;
  participantId: string;
  participantName: string;
}

/**
 * Scene Manager Props
 */
export interface SceneManagerProps {
  activeScene: ActiveScene;
  slideItems: SlideItem[];
  presentation?: PresentationFile;
  isHost: boolean;
  participantId?: string;
  participantName?: string;
  sessionCode: string;
  sessionId?: string;
  participants?: Array<{ id: string; display_name: string }>;
}
