export interface Progress {
  chapterId: string;
  exerciseId: string;
  completed: boolean;
  bestScore: number;
  lastAttempt?: string;
  userSolution?: {
    systemPrompt?: string;
    userPrompt?: string;
  };
}

const STORAGE_KEY = 'prompt-tutorial-progress';

export function loadProgress(): Progress[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveProgress(progress: Progress[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress:', e);
  }
}

export function getExerciseProgress(chapterId: string, exerciseId: string): Progress | undefined {
  const allProgress = loadProgress();
  return allProgress.find(p => p.chapterId === chapterId && p.exerciseId === exerciseId);
}

export function updateExerciseProgress(
  chapterId: string,
  exerciseId: string,
  update: Partial<Progress>
): void {
  const allProgress = loadProgress();
  const existingIndex = allProgress.findIndex(
    p => p.chapterId === chapterId && p.exerciseId === exerciseId
  );

  const newProgress: Progress = {
    chapterId,
    exerciseId,
    completed: false,
    bestScore: 0,
    ...update,
  };

  if (existingIndex >= 0) {
    // 기존 최고 점수 유지
    const existing = allProgress[existingIndex];
    newProgress.bestScore = Math.max(existing.bestScore, update.bestScore || 0);
    newProgress.completed = existing.completed || update.completed || false;
    allProgress[existingIndex] = newProgress;
  } else {
    allProgress.push(newProgress);
  }

  saveProgress(allProgress);
}

export function getChapterProgress(chapterId: string, totalExercises: number): number {
  const allProgress = loadProgress();
  const chapterProgress = allProgress.filter(
    p => p.chapterId === chapterId && p.completed
  );
  return totalExercises > 0 ? Math.round((chapterProgress.length / totalExercises) * 100) : 0;
}

export function getOverallProgress(totalExercises: number): number {
  const allProgress = loadProgress();
  const completedCount = allProgress.filter(p => p.completed).length;
  return totalExercises > 0 ? Math.round((completedCount / totalExercises) * 100) : 0;
}

export function getLastAccessedChapter(): string | null {
  try {
    return localStorage.getItem('last-chapter');
  } catch {
    return null;
  }
}

export function setLastAccessedChapter(chapterId: string): void {
  try {
    localStorage.setItem('last-chapter', chapterId);
  } catch {
    // ignore
  }
}

export function resetAllProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('last-chapter');
    localStorage.removeItem('intro_seen');
  } catch {
    // ignore
  }
}
