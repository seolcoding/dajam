import { useState } from 'react';

interface ResponseViewerProps {
  response: string;
  isLoading: boolean;
  error?: string | null;
}

function CopyButton({ text }: { text: string }) {
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
      className="p-1 rounded hover:bg-green-200 transition-colors"
      title="복사"
    >
      {copied ? (
        <svg className="w-4 h-4 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  );
}

export function ResponseViewer({ response, isLoading, error }: ResponseViewerProps) {
  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 border border-red-200">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-red-800">오류 발생</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!response && !isLoading) {
    return (
      <div className="p-6 rounded-lg bg-neutral-100 border border-neutral-200 text-center">
        <svg className="w-8 h-8 text-neutral-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p className="text-sm text-neutral-500">실행 버튼을 눌러 AI 응답을 확인하세요</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-neutral-700">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-green-100 text-green-700 text-xs font-bold">
            A
          </span>
          Assistant Response
          {isLoading && (
            <span className="flex items-center gap-1 text-xs text-blue-600">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
              스트리밍 중
            </span>
          )}
        </div>
        {response && !isLoading && <CopyButton text={response} />}
      </div>
      <div className="p-4 rounded-lg bg-green-50 border border-green-200 min-h-[100px] max-h-[400px] overflow-y-auto">
        <div className="text-sm text-neutral-800 whitespace-pre-wrap font-mono leading-relaxed">
          {response}
          {isLoading && <span className="inline-block w-2 h-4 bg-green-600 animate-pulse ml-0.5" />}
        </div>
      </div>
    </div>
  );
}
