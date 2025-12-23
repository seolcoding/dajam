import type { GenerateCodeOptions, SessionCodeLength } from './types';

/**
 * 세션 코드 생성
 * 혼동되기 쉬운 문자 제외 (0, O, I, L, 1)
 */
export function generateSessionCode(options: GenerateCodeOptions = {}): string {
  const { length = 6, prefix = '' } = options;
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let code = prefix;

  for (let i = 0; i < length - prefix.length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code.toUpperCase();
}

/**
 * 세션 코드 유효성 검사
 */
export function validateSessionCode(code: string, length: SessionCodeLength = 6): boolean {
  if (!code || code.length !== length) return false;
  return /^[A-Z0-9]+$/.test(code.toUpperCase());
}

/**
 * 세션 코드 포맷팅 (대문자 변환)
 */
export function formatSessionCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/**
 * 공유 URL 생성
 */
export function createShareUrl(appPath: string, sessionCode: string): string {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}${appPath}/${sessionCode}`;
}

/**
 * Realtime 재연결 지연 시간 계산 (지수 백오프)
 */
export function calculateRetryDelay(retryCount: number, baseDelay = 2000, maxDelay = 30000): number {
  const delay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);
  // 약간의 지터 추가
  return delay + Math.random() * 1000;
}

/**
 * 타임스탬프 포맷팅 (한국어)
 */
export function formatTimestamp(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

/**
 * 상대 시간 표시 (방금 전, 1분 전, etc.)
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);

  if (diffSec < 10) return '방금 전';
  if (diffSec < 60) return `${diffSec}초 전`;
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  return formatTimestamp(d);
}

/**
 * 참여자 이름 첫 글자 추출 (아바타용)
 */
export function getInitials(name: string): string {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
}

/**
 * 참여자 색상 생성 (이름 기반 일관된 색상)
 */
export function getParticipantColor(name: string): string {
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-green-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-cyan-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-red-500',
    'bg-yellow-500',
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}
