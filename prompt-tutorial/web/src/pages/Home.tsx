import { Link } from 'react-router-dom';
import { chapters } from '@/content/chapters';
import { getChapterProgress, getLastAccessedChapter } from '@/lib/storage';

export function Home() {
  const lastChapter = getLastAccessedChapter();

  const getTotalExercises = () => {
    return chapters.reduce((sum, ch) => sum + ch.exercises.length, 0);
  };

  const getCompletedExercises = () => {
    return chapters.reduce((sum, ch) => {
      const progress = getChapterProgress(ch.id, ch.exercises.length);
      return sum + Math.round((progress / 100) * ch.exercises.length);
    }, 0);
  };

  const totalExercises = getTotalExercises();
  const completedExercises = getCompletedExercises();
  const overallProgress = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-4">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-neutral-900">프롬프트 엔지니어링 마스터</h2>
          <p className="text-neutral-600">AI와 효과적으로 대화하는 방법을 배워보세요</p>

          {/* Additional Info */}
          <div className="pt-2 space-y-2 text-sm text-neutral-500">
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Anthropic 공식 튜토리얼을 한국어로 번역</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Jupyter 노트북을 인터랙티브 웹앱으로 변환</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <span>실제 OpenAI API와 연결되어 진짜 AI와 대화 가능</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>개발: <a href="https://seolcoding.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">seolcoding</a></span>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="p-4 rounded-xl bg-white border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-neutral-700">전체 진행률</span>
            <span className="text-sm font-bold text-blue-600">{overallProgress}%</span>
          </div>
          <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-neutral-500">
            {completedExercises} / {totalExercises} 연습문제 완료
          </p>
        </div>

        {/* Continue Button */}
        {lastChapter && (
          <Link
            to={`/chapter/${lastChapter}`}
            className="block w-full p-4 rounded-xl bg-blue-600 text-white text-center font-medium hover:bg-blue-700 transition-colors"
          >
            이어서 학습하기
          </Link>
        )}

        {/* Chapter List */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-neutral-900">챕터</h3>
          {chapters.map((chapter, idx) => {
            const progress = getChapterProgress(chapter.id, chapter.exercises.length);
            const isCompleted = progress === 100;
            const isStarted = progress > 0;

            return (
              <Link
                key={chapter.id}
                to={`/chapter/${chapter.id}`}
                className="block p-4 rounded-xl bg-white border border-neutral-200 hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isCompleted
                      ? 'bg-green-100 text-green-700'
                      : isStarted
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-neutral-100 text-neutral-500 group-hover:bg-blue-50 group-hover:text-blue-600'
                  }`}>
                    {isCompleted ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="font-bold">{idx + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-neutral-900 group-hover:text-blue-600 transition-colors">
                      {chapter.title}
                    </h4>
                    <p className="text-sm text-neutral-500 mt-0.5">{chapter.titleEn}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-neutral-500">{progress}%</span>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-neutral-400 group-hover:text-blue-600 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
}
