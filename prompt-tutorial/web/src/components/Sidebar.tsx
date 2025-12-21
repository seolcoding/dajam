import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { chapters } from '@/content/chapters';
import { getChapterProgress } from '@/lib/storage';

export function Sidebar() {
  const location = useLocation();
  const { chapterId } = useParams<{ chapterId: string }>();
  const [isOpen, setIsOpen] = useState(false);

  const isHome = location.pathname === '/';

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-16 z-50 lg:hidden p-2 bg-white dark:bg-neutral-800 rounded-lg shadow-md border border-neutral-200 dark:border-neutral-700"
        aria-label="Toggle sidebar"
      >
        <svg className="w-5 h-5 text-neutral-600 dark:text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-14 left-0 h-[calc(100vh-3.5rem-2.5rem)] w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-700 z-40 transform transition-transform duration-200 overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <nav className="p-4 space-y-2">
          {/* Home Link */}
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              isHome
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>홈</span>
          </Link>

          {/* Chapters */}
          <div className="pt-2">
            <h3 className="px-3 text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">
              챕터
            </h3>
            <div className="space-y-1">
              {chapters.map((chapter, idx) => {
                const progress = getChapterProgress(chapter.id, chapter.exercises.length);
                const isActive = chapterId === chapter.id;
                const isCompleted = progress === 100;

                return (
                  <Link
                    key={chapter.id}
                    to={`/chapter/${chapter.id}`}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-xs font-bold ${
                        isCompleted
                          ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400'
                          : isActive
                            ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400'
                            : progress > 0
                              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                      }`}
                    >
                      {isCompleted ? (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{chapter.title}</div>
                      {progress > 0 && progress < 100 && (
                        <div className="w-full h-1 bg-neutral-100 dark:bg-neutral-700 rounded-full mt-1">
                          <div
                            className="h-full bg-blue-400 rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}
