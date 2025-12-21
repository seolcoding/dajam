import { customAlphabet } from 'nanoid';

// 숫자와 대문자만 사용 (혼동 방지: O, 0, I, 1 제외)
const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const generateRoomCode = customAlphabet(alphabet, 6);

export const createRoomCode = (): string => {
  return generateRoomCode();
};

// 코드 유효성 검증
export const isValidRoomCode = (code: string): boolean => {
  return /^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/.test(code);
};
