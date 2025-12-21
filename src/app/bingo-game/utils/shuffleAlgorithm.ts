/**
 * Seeded Random Number Generator
 * 동일한 seed로 항상 같은 순서 생성 (재현 가능)
 */
function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0; // 32bit integer로 변환
  }

  return function() {
    hash = (hash * 9301 + 49297) % 233280;
    return hash / 233280;
  };
}

/**
 * Fisher-Yates Shuffle Algorithm
 * 시간 복잡도: O(n)
 * 공간 복잡도: O(1) (in-place)
 */
export function fisherYatesShuffle<T>(array: T[], seed?: string): T[] {
  const arr = [...array]; // 원본 배열 보존
  const rng = seed ? seededRandom(seed) : Math.random;

  for (let i = arr.length - 1; i > 0; i--) {
    // 0부터 i까지 랜덤 인덱스 선택
    const j = Math.floor(rng() * (i + 1));

    // arr[i]와 arr[j] 교환
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

/**
 * 빙고판 생성 (셔플 적용)
 */
export function generateBingoCard(
  items: string[],
  gridSize: number,
  options?: {
    centerFree?: boolean; // 중앙 FREE 칸
    seed?: string; // 재현 가능한 셔플
  }
): string[][] {
  const { centerFree = false, seed } = options ?? {};

  // 1. 아이템 개수 검증
  const requiredItems = centerFree ? gridSize * gridSize - 1 : gridSize * gridSize;
  if (items.length < requiredItems) {
    throw new Error(
      `최소 ${requiredItems}개의 아이템이 필요합니다. (현재: ${items.length}개)`
    );
  }

  // 2. 셔플
  const shuffled = fisherYatesShuffle(items, seed);

  // 3. 필요한 개수만큼 선택
  const selected = shuffled.slice(0, requiredItems);

  // 4. 2D 배열로 변환
  const card: string[][] = [];
  let index = 0;

  for (let row = 0; row < gridSize; row++) {
    card[row] = [];
    for (let col = 0; col < gridSize; col++) {
      // 중앙 칸 처리
      if (centerFree && row === Math.floor(gridSize / 2) && col === Math.floor(gridSize / 2)) {
        card[row][col] = 'FREE';
      } else {
        card[row][col] = selected[index++];
      }
    }
  }

  return card;
}

/**
 * 75-Ball Bingo (미국식)
 * B: 1-15, I: 16-30, N: 31-45, G: 46-60, O: 61-75
 */
export function generate75BallBingoCard(): string[][] {
  const card: string[][] = Array.from({ length: 5 }, () => Array(5).fill(''));

  const ranges = [
    [1, 15],   // B
    [16, 30],  // I
    [31, 45],  // N
    [46, 60],  // G
    [61, 75],  // O
  ];

  for (let col = 0; col < 5; col++) {
    const [min, max] = ranges[col];
    const columnNumbers = Array.from({ length: max - min + 1 }, (_, i) => String(min + i));
    const shuffled = fisherYatesShuffle(columnNumbers);

    for (let row = 0; row < 5; row++) {
      // 중앙 칸 (N열, 3행)
      if (col === 2 && row === 2) {
        card[row][col] = 'FREE';
      } else {
        const index = row > 2 && col === 2 ? row - 1 : row;
        card[row][col] = shuffled[index];
      }
    }
  }

  return card;
}
