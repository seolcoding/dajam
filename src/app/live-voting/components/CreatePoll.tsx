'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';
import { Plus, X, Cloud, Monitor } from 'lucide-react';
import type { Poll, PollType } from '../types/poll';
import { savePoll } from '../utils/storage';
import { useSupabasePoll } from '../hooks/useSupabasePoll';

export function CreatePoll() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<PollType>('single');
  const [options, setOptions] = useState(['', '']);
  const [isCloudMode, setIsCloudMode] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const { createCloudPoll } = useSupabasePoll({ pollId: '', enabled: false });

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async () => {
    const validOptions = options.filter(opt => opt.trim());

    if (!title.trim() || validOptions.length < 2) {
      alert('투표 제목과 최소 2개의 선택지를 입력해주세요.');
      return;
    }

    setIsCreating(true);

    const poll: Poll = {
      id: nanoid(8),
      title: title.trim(),
      type,
      options: validOptions,
      createdAt: new Date(),
      allowAnonymous: true,
      isCloudMode,
    };

    // 로컬에 항상 저장 (폴백용)
    savePoll(poll);

    // 클라우드 모드일 때 Supabase에도 저장
    if (isCloudMode) {
      const sessionId = await createCloudPoll(poll);
      if (!sessionId) {
        alert('클라우드 모드 생성에 실패했습니다. 로컬 모드로 계속합니다.');
        poll.isCloudMode = false;
        savePoll(poll); // 로컬 모드로 다시 저장
      }
    }

    setIsCreating(false);
    router.push(`/live-voting/host/${poll.id}`);
  };

  const isValid = title.trim() && options.filter(o => o.trim()).length >= 2;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">투표 생성</h1>

      {/* 제목 */}
      <div className="mb-6">
        <label className="block font-semibold mb-2 text-sm">투표 질문</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 오늘 점심 메뉴는?"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          maxLength={100}
        />
        <p className="text-sm text-gray-500 mt-1">{title.length}/100</p>
      </div>

      {/* 투표 유형 */}
      <div className="mb-6">
        <label className="block font-semibold mb-2 text-sm">투표 유형</label>
        <div className="flex gap-3">
          <button
            onClick={() => setType('single')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
              type === 'single'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            단일 선택
          </button>
          <button
            onClick={() => setType('multiple')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
              type === 'multiple'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            복수 선택
          </button>
          <button
            onClick={() => setType('ranking')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
              type === 'ranking'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            순위 투표
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {type === 'single' && '참가자는 하나만 선택할 수 있습니다.'}
          {type === 'multiple' && '참가자는 여러 개를 선택할 수 있습니다.'}
          {type === 'ranking' && '참가자는 선택지를 순위대로 정렬합니다.'}
        </p>
      </div>

      {/* 크로스 디바이스 모드 */}
      <div className="mb-6">
        <label className="block font-semibold mb-2 text-sm">투표 방식</label>
        <div className="flex gap-3">
          <button
            onClick={() => setIsCloudMode(false)}
            className={`flex-1 px-4 py-4 rounded-lg font-medium transition flex items-center justify-center gap-3 ${
              !isCloudMode
                ? 'bg-gray-800 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Monitor size={20} />
            <div className="text-left">
              <div>로컬 모드</div>
              <div className="text-xs opacity-75">같은 기기에서만</div>
            </div>
          </button>
          <button
            onClick={() => setIsCloudMode(true)}
            className={`flex-1 px-4 py-4 rounded-lg font-medium transition flex items-center justify-center gap-3 ${
              isCloudMode
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Cloud size={20} />
            <div className="text-left">
              <div>클라우드 모드</div>
              <div className="text-xs opacity-75">다른 기기에서도 참여</div>
            </div>
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {!isCloudMode && '같은 기기/브라우저에서만 투표할 수 있습니다. (오프라인 지원)'}
          {isCloudMode && '다른 휴대폰, 태블릿, PC에서도 투표할 수 있습니다. (인터넷 필요)'}
        </p>
      </div>

      {/* 선택지 */}
      <div className="mb-6">
        <label className="block font-semibold mb-2 text-sm">선택지 (최소 2개, 최대 10개)</label>
        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={index} className="flex gap-2">
              <div className="flex-shrink-0 w-8 h-12 flex items-center justify-center font-medium text-gray-500">
                {index + 1}
              </div>
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`선택지 ${index + 1}`}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={50}
              />
              {options.length > 2 && (
                <button
                  onClick={() => removeOption(index)}
                  className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  aria-label="삭제"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          ))}
        </div>
        {options.length < 10 && (
          <button
            onClick={addOption}
            className="mt-3 w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            선택지 추가
          </button>
        )}
      </div>

        {/* 투표 시작 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={!isValid || isCreating}
          className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg flex items-center justify-center gap-2"
        >
          {isCreating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              생성 중...
            </>
          ) : (
            '투표 시작'
          )}
        </button>
      </div>
    </div>
  );
}
