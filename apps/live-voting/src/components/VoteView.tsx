import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { nanoid } from 'nanoid';
import Confetti from 'react-confetti';
import { Check, ArrowUp, ArrowDown, Zap } from 'lucide-react';
import type { Poll, Vote } from '@/types/poll';
import { loadPoll, saveVote } from '@/utils/storage';
import { hasVoted, markAsVoted } from '@/utils/voteValidator';
import { useBroadcastChannel } from '@/hooks/useBroadcastChannel';

export function VoteView() {
  const { pollId } = useParams<{ pollId: string }>();
  const navigate = useNavigate();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [selection, setSelection] = useState<number | number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [rankingOrder, setRankingOrder] = useState<number[]>([]);
  const { broadcast } = useBroadcastChannel(`poll:${pollId}`, () => {});

  useEffect(() => {
    if (!pollId) {
      navigate('/');
      return;
    }

    // 투표 데이터 로드
    const pollData = loadPoll(pollId);
    if (!pollData) {
      alert('투표를 찾을 수 없습니다.');
      navigate('/');
      return;
    }

    setPoll(pollData);

    // 순위 투표 초기화
    if (pollData.type === 'ranking') {
      setRankingOrder(pollData.options.map((_, i) => i));
    }

    // 이미 투표했는지 확인
    if (hasVoted(pollId)) {
      setSubmitted(true);
    }
  }, [pollId, navigate]);

  const handleSingleSelect = (index: number) => {
    setSelection(index);
  };

  const handleMultipleSelect = (index: number) => {
    const sel = selection as number[];
    if (sel.includes(index)) {
      setSelection(sel.filter(i => i !== index));
    } else {
      setSelection([...sel, index]);
    }
  };

  const moveRankingItem = (fromIndex: number, direction: 'up' | 'down') => {
    const newOrder = [...rankingOrder];
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;

    if (toIndex < 0 || toIndex >= newOrder.length) return;

    [newOrder[fromIndex], newOrder[toIndex]] = [newOrder[toIndex], newOrder[fromIndex]];
    setRankingOrder(newOrder);
  };

  const handleSubmit = () => {
    if (!poll || !pollId || hasVoted(pollId)) return;

    let finalSelection: number | number[];

    if (poll.type === 'single') {
      if (selection === undefined || selection === null) {
        alert('선택지를 선택해주세요.');
        return;
      }
      finalSelection = selection as number;
    } else if (poll.type === 'multiple') {
      const sel = selection as number[];
      if (sel.length === 0) {
        alert('최소 1개 이상 선택해주세요.');
        return;
      }
      finalSelection = sel;
    } else {
      // ranking
      finalSelection = rankingOrder;
    }

    const vote: Vote = {
      id: nanoid(),
      pollId: poll.id,
      selection: finalSelection,
      timestamp: new Date(),
    };

    // 투표 저장
    saveVote(vote);

    // 중복 투표 방지 마킹
    markAsVoted(pollId);

    // BroadcastChannel로 호스트에게 알림
    broadcast({ type: 'NEW_VOTE', vote });

    setSubmitted(true);
  };

  if (!poll) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Confetti recycle={false} numberOfPieces={300} />
        <div className="text-center bg-white rounded-2xl p-12 shadow-2xl max-w-md border border-gray-200 animate-in fade-in zoom-in duration-500">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
            <div className="relative w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
              <Check size={48} className="text-white animate-in zoom-in duration-300" strokeWidth={3} />
            </div>
          </div>
          <h2 className="text-4xl font-bold mb-4 text-gray-900">투표 완료!</h2>
          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            참여해 주셔서 감사합니다.<br />
            <span className="text-sm text-gray-500 mt-2 inline-block">실시간 결과는 호스트 화면에서 확인하세요</span>
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg transition-all hover:scale-105 shadow-lg hover:shadow-xl"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-xl border border-gray-200">
        <div className="flex items-start gap-3 mb-6">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
            <Zap size={24} className="text-white" fill="currentColor" />
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2 text-gray-900 leading-tight">{poll.title}</h1>
            <p className="text-gray-600 text-lg">
              {poll.type === 'single' && '하나를 선택해주세요'}
              {poll.type === 'multiple' && '여러 개를 선택할 수 있습니다'}
              {poll.type === 'ranking' && '순위대로 정렬해주세요 (위로 갈수록 높은 순위)'}
            </p>
          </div>
        </div>

        {/* 단일/복수 선택 */}
        {poll.type !== 'ranking' && (
          <div className="space-y-3 mb-8">
            {poll.options.map((option, index) => {
              const isSelected = poll.type === 'single'
                ? selection === index
                : (selection as number[]).includes(index);

              const colorClasses = [
                { border: 'border-blue-500', bg: 'bg-blue-50', checkbox: 'border-blue-500 bg-blue-500' },
                { border: 'border-purple-500', bg: 'bg-purple-50', checkbox: 'border-purple-500 bg-purple-500' },
                { border: 'border-green-500', bg: 'bg-green-50', checkbox: 'border-green-500 bg-green-500' },
                { border: 'border-orange-500', bg: 'bg-orange-50', checkbox: 'border-orange-500 bg-orange-500' },
                { border: 'border-pink-500', bg: 'bg-pink-50', checkbox: 'border-pink-500 bg-pink-500' },
                { border: 'border-cyan-500', bg: 'bg-cyan-50', checkbox: 'border-cyan-500 bg-cyan-500' },
                { border: 'border-indigo-500', bg: 'bg-indigo-50', checkbox: 'border-indigo-500 bg-indigo-500' },
                { border: 'border-teal-500', bg: 'bg-teal-50', checkbox: 'border-teal-500 bg-teal-500' },
              ];
              const colorClass = colorClasses[index % colorClasses.length];

              return (
                <button
                  key={index}
                  onClick={() => poll.type === 'single' ? handleSingleSelect(index) : handleMultipleSelect(index)}
                  className={`group w-full p-5 border-2 rounded-xl text-left transition-all duration-200 text-lg font-medium ${
                    isSelected
                      ? `${colorClass.border} ${colorClass.bg} shadow-lg scale-[1.02]`
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50 hover:shadow-md hover:scale-[1.01]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? `${colorClass.checkbox} shadow-md`
                        : 'border-gray-400 group-hover:border-gray-500'
                    }`}>
                      {isSelected && <Check size={18} className="text-white" strokeWidth={3} />}
                    </div>
                    <span className="text-gray-900">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* 순위 투표 */}
        {poll.type === 'ranking' && (
          <div className="space-y-3 mb-8">
            {rankingOrder.map((optionIndex, position) => {
              const rankColors = [
                'bg-yellow-500', 'bg-gray-400', 'bg-orange-600',
                'bg-blue-500', 'bg-purple-500', 'bg-green-500',
                'bg-pink-500', 'bg-cyan-500'
              ];
              const rankColor = rankColors[position] || 'bg-gray-500';

              return (
                <div key={optionIndex} className="flex items-center gap-3 animate-in fade-in duration-300">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveRankingItem(position, 'up')}
                      disabled={position === 0}
                      className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all hover:scale-110 shadow-md disabled:hover:scale-100"
                    >
                      <ArrowUp size={18} strokeWidth={3} />
                    </button>
                    <button
                      onClick={() => moveRankingItem(position, 'down')}
                      disabled={position === rankingOrder.length - 1}
                      className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all hover:scale-110 shadow-md disabled:hover:scale-100"
                    >
                      <ArrowDown size={18} strokeWidth={3} />
                    </button>
                  </div>
                  <div className="flex-1 p-5 border-2 border-gray-300 rounded-xl bg-white shadow-md hover:shadow-lg transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`flex-shrink-0 w-10 h-10 ${rankColor} text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md`}>
                        {position + 1}
                      </div>
                      <span className="text-lg font-medium text-gray-900">{poll.options[optionIndex]}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={handleSubmit}
          className="w-full px-6 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xl transition-all hover:scale-[1.02] shadow-xl hover:shadow-2xl flex items-center justify-center gap-2"
        >
          <Zap size={24} fill="currentColor" />
          투표하기
        </button>
      </div>
    </div>
  );
}
