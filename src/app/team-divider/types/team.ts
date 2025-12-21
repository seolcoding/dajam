/**
 * 참가자 정보
 */
export interface Participant {
  id: string; // UUID
  name: string; // 이름
  team?: number; // 배정된 팀 번호 (0-indexed)
  metadata?: Record<string, any>; // 확장 가능한 메타데이터 (예: 성별, 스킬)
}

/**
 * 팀 설정
 */
export interface TeamSettings {
  mode: 'byTeamCount' | 'byMemberCount'; // 분배 모드
  teamCount?: number; // 팀 수 (mode: byTeamCount)
  memberCount?: number; // 팀당 인원 (mode: byMemberCount)
}

/**
 * 팀 색상 정보
 */
export interface TeamColor {
  bg: string; // 배경 색상 (Tailwind class or HSL)
  text: string; // 텍스트 색상
  border: string; // 테두리 색상
}

/**
 * QR 코드 데이터
 */
export interface QRCodeData {
  team: number; // 팀 번호
  teamName: string; // 팀 이름
  member: string; // 참가자 이름
  allMembers: string[]; // 팀 전체 멤버
}

/**
 * 앱 상태
 */
export interface AppState {
  participants: Participant[]; // 전체 참가자
  settings: TeamSettings; // 팀 설정
  teams: Participant[][]; // 분배된 팀 (2D 배열)
  isShuffled: boolean; // 분배 완료 여부
  qrCodes: Map<string, string>; // 참가자 ID -> QR Data URL
}
