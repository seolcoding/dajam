'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyableLinkProps {
  url: string;
  className?: string;
}

/**
 * 클릭하면 클립보드에 복사되는 링크
 * - 카카오톡, 슬랙 등에 쉽게 공유 가능
 */
export function CopyableLink({ url, className = '' }: CopyableLinkProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`group relative flex items-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100
        rounded-xl border border-blue-200 transition-all cursor-pointer
        active:scale-[0.98] ${className}`}
      title="클릭하여 복사"
    >
      <span className="font-mono text-blue-700 text-sm break-all text-left">
        {url}
      </span>
      <span className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${
        copied ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600 group-hover:bg-blue-200'
      }`}>
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </span>

      {/* 복사 완료 토스트 */}
      {copied && (
        <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
          복사되었습니다!
        </span>
      )}
    </button>
  );
}
