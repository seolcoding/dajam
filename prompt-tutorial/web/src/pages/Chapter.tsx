import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getChapter, getNextChapter, getPrevChapter } from '@/content/chapters';
import { Exercise } from '@/components/Exercise';
import { PromptEditor } from '@/components/PromptEditor';
import { ResponseViewer } from '@/components/ResponseViewer';
import { streamCompletion, type Message } from '@/lib/llm';
import { setLastAccessedChapter } from '@/lib/storage';

function CopyButton({ text, className = '' }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Failed to copy');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`p-1 rounded hover:bg-black/10 transition-colors ${className}`}
      title="복사"
    >
      {copied ? (
        <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5 text-current opacity-50 hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  );
}

export function Chapter() {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const chapter = chapterId ? getChapter(chapterId) : undefined;
  const nextChapter = chapterId ? getNextChapter(chapterId) : undefined;
  const prevChapter = chapterId ? getPrevChapter(chapterId) : undefined;

  const [playgroundResponse, setPlaygroundResponse] = useState('');
  const [playgroundLoading, setPlaygroundLoading] = useState(false);
  const [playgroundError, setPlaygroundError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'lesson' | 'exercises'>('lesson');

  useEffect(() => {
    if (chapterId) {
      setLastAccessedChapter(chapterId);
      // Reset playground state when chapter changes
      setPlaygroundResponse('');
      setPlaygroundError(null);
      setActiveTab('lesson');
    }
  }, [chapterId]);

  if (!chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-600">챕터를 찾을 수 없습니다.</p>
          <Link to="/" className="text-blue-600 hover:underline mt-2 inline-block">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const handlePlaygroundRun = async (systemPrompt: string, userPrompt: string) => {
    setPlaygroundLoading(true);
    setPlaygroundError(null);
    setPlaygroundResponse('');

    try {
      const messages: Message[] = [];
      if (systemPrompt.trim()) {
        messages.push({ role: 'system', content: systemPrompt });
      }
      messages.push({ role: 'user', content: userPrompt });

      await streamCompletion(messages, {
        onChunk: (chunk) => {
          setPlaygroundResponse((prev) => prev + chunk);
        },
      });
    } catch (e) {
      setPlaygroundError(e instanceof Error ? e.message : '오류가 발생했습니다.');
    } finally {
      setPlaygroundLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold text-neutral-900 truncate">{chapter.title}</h1>
              <p className="text-xs text-neutral-500">{chapter.titleEn}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('lesson')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'lesson'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700'
              }`}
            >
              레슨
            </button>
            <button
              onClick={() => setActiveTab('exercises')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'exercises'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700'
              }`}
            >
              연습문제 ({chapter.exercises.length})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {activeTab === 'lesson' ? (
          <div className="space-y-8">
            {/* Lesson Content */}
            <div className="prose prose-neutral prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{ __html: renderMarkdown(chapter.lessonContent) }} />
            </div>

            {/* Examples */}
            {chapter.examples.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-900">예제</h3>
                {chapter.examples.map((example, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white border border-neutral-200 space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
                        {idx + 1}
                      </span>
                      <h4 className="font-medium text-neutral-900">{example.description}</h4>
                    </div>
                    <div className="space-y-2">
                      {example.systemPrompt && (
                        <div className="p-3 rounded-lg bg-purple-50 border border-purple-100">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-medium text-purple-700">System:</p>
                            <CopyButton text={example.systemPrompt} />
                          </div>
                          <p className="text-sm font-mono text-purple-900 whitespace-pre-wrap">{example.systemPrompt}</p>
                        </div>
                      )}
                      <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-medium text-blue-700">User:</p>
                          <CopyButton text={example.userPrompt} />
                        </div>
                        <p className="text-sm font-mono text-blue-900 whitespace-pre-wrap">{example.userPrompt}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Playground */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900">플레이그라운드</h3>
              <div className="p-4 rounded-xl bg-white border border-neutral-200 space-y-4">
                <p className="text-sm text-neutral-600">자유롭게 프롬프트를 실험해보세요.</p>
                <PromptEditor
                  key={`playground-${chapterId}`}
                  systemPromptEditable={true}
                  userPromptEditable={true}
                  onRun={handlePlaygroundRun}
                  isLoading={playgroundLoading}
                />
                <ResponseViewer
                  response={playgroundResponse}
                  isLoading={playgroundLoading}
                  error={playgroundError}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {chapter.exercises.map((exercise, idx) => (
              <Exercise
                key={exercise.id}
                exercise={exercise}
                chapterId={chapter.id}
                exerciseNumber={idx + 1}
                totalExercises={chapter.exercises.length}
              />
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-200">
          {prevChapter ? (
            <Link
              to={`/chapter/${prevChapter.id}`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-200 hover:bg-neutral-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">{prevChapter.title}</span>
            </Link>
          ) : (
            <div />
          )}
          {nextChapter ? (
            <Link
              to={`/chapter/${nextChapter.id}`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <span className="text-sm font-medium">{nextChapter.title}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              <span className="text-sm font-medium">완료!</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// Simple markdown renderer (basic support)
function renderMarkdown(content: string): string {
  return content
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-6 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-8 mb-3">$1</h2>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-neutral-100 text-sm font-mono">$1</code>')
    // Code blocks
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="p-4 rounded-lg bg-neutral-900 text-neutral-100 text-sm font-mono overflow-x-auto my-4"><code>$2</code></pre>')
    // Lists
    .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>')
    .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p class="my-3">')
    // Line breaks
    .replace(/\n/g, '<br>');
}
