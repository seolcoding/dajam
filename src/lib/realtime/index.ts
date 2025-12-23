/**
 * 실시간 세션 공통 라이브러리
 *
 * @example
 * // 훅 사용
 * import { useRealtimeSession } from '@/lib/realtime';
 *
 * const { session, participants, connectionStatus } = useRealtimeSession({
 *   appType: 'bingo-game',
 *   sessionCode: gameCode,
 * });
 *
 * @example
 * // 컴포넌트 사용
 * import { SessionHostLayout, ParticipantList } from '@/lib/realtime';
 *
 * <SessionHostLayout
 *   sessionCode={code}
 *   title="빙고 게임"
 *   participantCount={participants.length}
 *   connectionStatus={connectionStatus}
 *   isCloudMode={true}
 *   shareUrl={shareUrl}
 * >
 *   <ParticipantList participants={participants} />
 * </SessionHostLayout>
 */

// Hooks
export { useRealtimeSession } from './hooks/useRealtimeSession';
export { useRealtimeSubscription } from './hooks/useRealtimeSubscription';

// Components
export { SessionHostLayout } from './components/SessionHostLayout';
export { ParticipantList } from './components/ParticipantList';
export { SessionJoinFlow } from './components/SessionJoinFlow';

// Utils
export {
  generateSessionCode,
  validateSessionCode,
  formatSessionCode,
  createShareUrl,
  calculateRetryDelay,
  formatTimestamp,
  formatRelativeTime,
  getInitials,
  getParticipantColor,
} from './utils';

// Types
export type {
  ConnectionStatus,
  RealtimeSessionState,
  CreateSessionOptions,
  JoinSessionOptions,
  RealtimeSubscriptionConfig,
  UseRealtimeSessionOptions,
  SessionHostLayoutProps,
  SessionJoinFlowProps,
  ParticipantListProps,
  SessionCodeLength,
  GenerateCodeOptions,
} from './types';
