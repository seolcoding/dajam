import { useParams } from 'react-router-dom';
import { chapters, getChapter } from '@/content/chapters';
import { getChapterProgress } from '@/lib/storage';

export function Footer() {
  const { chapterId } = useParams<{ chapterId: string }>();

  const currentChapter = chapterId ? getChapter(chapterId) : null;
  const currentChapterIndex = chapterId
    ? chapters.findIndex(ch => ch.id === chapterId) + 1
    : 0;

  const totalExercises = chapters.reduce((sum, ch) => sum + ch.exercises.length, 0);
  const completedExercises = chapters.reduce((sum, ch) => {
    const progress = getChapterProgress(ch.id, ch.exercises.length);
    return sum + Math.round((progress / 100) * ch.exercises.length);
  }, 0);
  const overallProgress = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;

  const chapterProgress = currentChapter
    ? getChapterProgress(currentChapter.id, currentChapter.exercises.length)
    : 0;

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 z-40 transition-colors">
      <div className="max-w-4xl mx-auto px-4 py-2">
        <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2 sm:gap-4 text-xs">
          {/* Progress Info */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <span className="text-neutral-500 dark:text-neutral-400">전체:</span>
              <div className="w-16 sm:w-20 h-1.5 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <span className="text-neutral-700 dark:text-neutral-200 font-medium">{overallProgress}%</span>
            </div>

            {currentChapter && (
              <div className="flex items-center gap-2">
                <span className="text-neutral-500 dark:text-neutral-400">
                  Ch.{currentChapterIndex}/{chapters.length}
                </span>
                <div className="w-12 sm:w-16 h-1.5 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${chapterProgress}%` }}
                  />
                </div>
                <span className="text-neutral-700 dark:text-neutral-200 font-medium">{chapterProgress}%</span>
              </div>
            )}
          </div>

          {/* Credits */}
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-neutral-400 dark:text-neutral-500">
            <span>
              Based on{' '}
              <a
                href="https://github.com/anthropics/prompt-eng-interactive-tutorial"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-neutral-600 dark:hover:text-neutral-300 underline"
              >
                Anthropic's Tutorial
              </a>
            </span>
            <span className="hidden sm:inline">|</span>
            <span>
              Built by{' '}
              <a
                href="https://seolcoding.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-neutral-600 dark:hover:text-neutral-300 underline"
              >
                seolcoding
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
