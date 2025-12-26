/**
 * LocalStorage 유틸리티
 */

const STORAGE_KEYS = {
  TOURNAMENTS: 'ideal-worldcup-tournaments',
  RESULTS: 'ideal-worldcup-results',
  CURRENT_GAME: 'ideal-worldcup-current-game',
} as const

/**
 * 브라우저 환경인지 확인
 */
const isBrowser = typeof window !== 'undefined';

/**
 * localStorage에 데이터 저장
 */
export function saveToStorage<T>(key: string, data: T): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save to storage:', error)
  }
}

/**
 * localStorage에서 데이터 불러오기
 */
export function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (!isBrowser) return defaultValue;
  try {
    const item = localStorage.getItem(key)
    if (!item) return defaultValue

    return JSON.parse(item, (key, value) => {
      // Date 객체 복원
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
        return new Date(value)
      }
      return value
    }) as T
  } catch (error) {
    console.error('Failed to load from storage:', error)
    return defaultValue
  }
}

/**
 * localStorage에서 데이터 삭제
 */
export function removeFromStorage(key: string): void {
  if (!isBrowser) return;
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Failed to remove from storage:', error)
  }
}

/**
 * 모든 앱 데이터 삭제
 */
export function clearAllStorage(): void {
  Object.values(STORAGE_KEYS).forEach((key) => {
    removeFromStorage(key)
  })
}

export { STORAGE_KEYS }
