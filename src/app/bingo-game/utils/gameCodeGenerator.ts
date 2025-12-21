import { nanoid } from 'nanoid';

/**
 * 게임 코드 생성 (6자리 알파벳 대문자 + 숫자)
 */
export function generateGameCode(): string {
  return nanoid(6).toUpperCase().replace(/[^A-Z0-9]/g, '0');
}

/**
 * 게임 코드 검증
 */
export function validateGameCode(code: string): boolean {
  return /^[A-Z0-9]{6}$/.test(code);
}
