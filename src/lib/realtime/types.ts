import type { AppType, Session, SessionParticipant, Json } from '@/types/database';

/**
 * 실시간 세션 공통 타입
 * 모든 실시간 앱에서 재사용
 */

// 연결 상태
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

// 세션 기본 상태
export interface RealtimeSessionState<TConfig = Json, TData = unknown> {
  session: Session | null;
  sessionId: string | null;
  config: TConfig | null;
  participants: SessionParticipant[];
  data: TData[];
  isLoading: boolean;
  error: string | null;
  isCloudMode: boolean;
  connectionStatus: ConnectionStatus;
}

// 세션 생성 옵션
export interface CreateSessionOptions<TConfig = Json> {
  appType: AppType;
  title: string;
  config: TConfig;
  expiresAt?: Date;
  maxParticipants?: number;
  isPublic?: boolean;
}

// 세션 참여 옵션
export interface JoinSessionOptions {
  displayName: string;
  metadata?: Json;
}

// Realtime 구독 설정
export interface RealtimeSubscriptionConfig {
  tableName: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
}

// 제네릭 세션 훅 옵션
export interface UseRealtimeSessionOptions<TConfig = Json, TData = unknown> {
  appType: AppType;
  sessionCode: string;
  enabled?: boolean;

  // 데이터 테이블 설정
  dataTable?: string; // 'votes', 'orders', 'session_participants', etc.
  dataEvent?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';

  // 데이터 변환 함수
  transformConfig?: (config: Json) => TConfig;
  transformData?: (rows: unknown[]) => TData[];

  // 콜백
  onSessionLoaded?: (session: Session) => void;
  onDataReceived?: (data: TData[]) => void;
  onConnectionChange?: (status: ConnectionStatus) => void;
}

// 호스트 레이아웃 Props
export interface SessionHostLayoutProps {
  sessionCode: string;
  title: string;
  subtitle?: string;
  participantCount: number;
  connectionStatus: ConnectionStatus;
  isCloudMode: boolean;
  shareUrl: string;
  children: React.ReactNode;

  // 옵션
  showQRCode?: boolean;
  showParticipants?: boolean;
  onRefresh?: () => void;
  onClose?: () => void;
}

// 참여 플로우 Props
export interface SessionJoinFlowProps {
  appType: AppType;
  // persistentParticipantId: 세션 퍼시스턴스를 위한 로컬 ID (브라우저 닫아도 재참여 가능)
  onJoin: (code: string, displayName: string, persistentParticipantId?: string) => Promise<boolean>;
  // 이전 참여 기록이 있을 때 재참여 처리
  onRejoin?: (sessionCode: string, participantRecordId: string) => Promise<boolean>;
  onCreateNew?: () => void;
  // URL에서 전달된 초기 세션 코드
  initialCode?: string;

  // 커스터마이징
  title?: string;
  description?: string;
  placeholder?: string;
  joinButtonText?: string;
  createButtonText?: string;
}

// 참여자 목록 Props
export interface ParticipantListProps {
  participants: SessionParticipant[];
  showStatus?: boolean;
  showRole?: boolean;
  maxDisplay?: number;
  emptyMessage?: string;
}

// 유틸리티 타입
export type SessionCodeLength = 6 | 8;

export interface GenerateCodeOptions {
  length?: SessionCodeLength;
  prefix?: string;
}
