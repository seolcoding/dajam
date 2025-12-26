'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import {
  Maximize2,
  Minimize2,
  Users,
  Home,
  QrCode,
  TrendingUp,
  Sparkles,
  Cloud,
  Monitor,
  Lock,
  Unlock,
  StopCircle,
  PlayCircle,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useLiveVotingElement } from '../hooks/useLiveVotingElement';
import { useLiveResults } from '../hooks/useLiveResults';
import { ResultChart } from './ResultChart';
import { ParticipantList, ParticipantCountBadge } from './ParticipantList';
import { RealtimeIndicator } from '@/components/common/RealtimeIndicator';
import { CopyableLink } from '@/components/common/CopyableLink';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HostViewProps {
  pollId: string;
}

export function HostView({ pollId }: HostViewProps) {
  const router = useRouter();
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  // useLiveVotingElement 훅 사용 (V2 element_responses 기반)
  const {
    poll,
    votes,
    results,
    participants,
    status,
    isLoading,
    error,
    connectionStatus,
    isConnected,
    mode,
    closePoll,
    lockResults,
    reopenPoll,
    endSession,
  } = useLiveVotingElement({
    sessionCode: pollId,
    enabled: true,
    isHost: true,
  });

  // 로컬 모드 폴백 (클라우드 실패 시)
  const localResults = useLiveResults(pollId);
  const activePoll = poll || localResults.poll;
  const activeVotes = votes.length > 0 ? votes : localResults.votes;
  const activeResults = results.length > 0 ? results : localResults.results;
  const isCloudMode = mode === 'cloud' && poll !== null;

  useEffect(() => {
    if (!pollId) {
      router.push('/live-voting');
      return;
    }

    // QR 코드 생성
    const voteUrl = `${window.location.origin}/live-voting/vote/${pollId}`;
    QRCode.toDataURL(voteUrl, { width: 400, margin: 2 }).then(setQrDataUrl);
  }, [pollId, router]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!activePoll) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{error || '투표를 찾을 수 없습니다.'}</p>
          <Button onClick={() => router.push('/live-voting')}>홈으로 돌아가기</Button>
        </div>
      </div>
    );
  }

  const handleClosePoll = async () => {
    if (isCloudMode) {
      await closePoll();
    }
  };

  const handleLockResults = async () => {
    if (isCloudMode) {
      await lockResults();
    }
  };

  const handleReopenPoll = async () => {
    if (isCloudMode) {
      await reopenPoll();
    }
  };

  return (
    <div className={`min-h-screen ${isPresentationMode ? 'bg-blue-600 p-8' : 'bg-gray-50 p-6'}`}>
      {/* 헤더 */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-3">
              {isPresentationMode && (
                <Sparkles size={40} className="text-yellow-300" fill="currentColor" />
              )}
              <h1
                className={`font-bold ${isPresentationMode ? 'text-6xl text-white' : 'text-4xl text-gray-900'}`}
              >
                {activePoll.title}
              </h1>
              {/* 상태 배지 */}
              {status !== 'active' && (
                <span
                  className={cn(
                    'px-3 py-1 rounded-full text-sm font-medium',
                    status === 'closed' && 'bg-yellow-100 text-yellow-800',
                    status === 'results_locked' && 'bg-red-100 text-red-800'
                  )}
                >
                  {status === 'closed' ? '투표 종료' : '결과 잠금'}
                </span>
              )}
            </div>
            <div
              className={`flex items-center gap-3 flex-wrap ${isPresentationMode ? 'text-3xl text-white/90' : 'text-xl text-gray-600'}`}
            >
              {/* 참여자 수 */}
              <div
                className={`flex items-center gap-2 ${isPresentationMode ? 'bg-white/20 backdrop-blur-sm px-6 py-3 rounded-2xl' : 'bg-blue-50 px-4 py-2 rounded-xl border border-blue-200'}`}
              >
                <Users
                  size={isPresentationMode ? 32 : 24}
                  className={isPresentationMode ? 'text-white' : 'text-blue-600'}
                />
                <span className="font-semibold">
                  <span
                    className={`${isPresentationMode ? 'text-yellow-300' : 'text-blue-600'} font-bold text-4xl`}
                  >
                    {activeVotes.length}
                  </span>
                  <span className="ml-2">명 투표</span>
                </span>
              </div>

              {/* 실시간 참여자 (클라우드 모드) */}
              {isCloudMode && participants.length > 0 && (
                <button
                  onClick={() => setShowParticipants(!showParticipants)}
                  className={cn(
                    'flex items-center gap-2 transition-colors',
                    isPresentationMode
                      ? 'bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl hover:bg-white/30'
                      : 'bg-green-50 px-3 py-1 rounded-lg border border-green-200 hover:bg-green-100'
                  )}
                >
                  <Users
                    size={isPresentationMode ? 24 : 16}
                    className={isPresentationMode ? 'text-white' : 'text-green-600'}
                  />
                  <span
                    className={`text-sm font-medium ${isPresentationMode ? 'text-white' : 'text-green-600'}`}
                  >
                    {participants.length}명 접속중
                  </span>
                </button>
              )}

              {/* 클라우드/로컬 모드 표시 */}
              <div
                className={`flex items-center gap-2 ${isPresentationMode ? 'bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl' : 'px-3 py-1 rounded-lg border ' + (isCloudMode ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200')}`}
              >
                {isCloudMode ? (
                  <>
                    <Cloud
                      size={isPresentationMode ? 24 : 16}
                      className={isPresentationMode ? 'text-white' : 'text-blue-600'}
                    />
                    <span
                      className={`text-sm font-medium ${isPresentationMode ? 'text-white' : 'text-blue-600'}`}
                    >
                      클라우드
                    </span>
                  </>
                ) : (
                  <>
                    <Monitor
                      size={isPresentationMode ? 24 : 16}
                      className={isPresentationMode ? 'text-white' : 'text-gray-600'}
                    />
                    <span
                      className={`text-sm font-medium ${isPresentationMode ? 'text-white' : 'text-gray-600'}`}
                    >
                      로컬
                    </span>
                  </>
                )}
              </div>

              {/* 연결 상태 */}
              {isCloudMode && (
                <div
                  className={cn(
                    'flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs',
                    isConnected ? 'text-green-600' : 'text-red-500'
                  )}
                >
                  {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
                  <span>{isConnected ? '실시간 연결' : '연결 끊김'}</span>
                </div>
              )}

              {/* 실시간 타임스탬프 */}
              <RealtimeIndicator isConnected={isConnected || !isCloudMode} />
            </div>
          </div>
          <div className="flex gap-3">
            {!isPresentationMode && (
              <>
                {/* 호스트 컨트롤 (클라우드 모드) */}
                {isCloudMode && (
                  <div className="flex gap-2">
                    {status === 'active' ? (
                      <Button
                        variant="outline"
                        onClick={handleClosePoll}
                        className="flex items-center gap-2"
                      >
                        <StopCircle size={18} />
                        투표 종료
                      </Button>
                    ) : status === 'closed' ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={handleReopenPoll}
                          className="flex items-center gap-2"
                        >
                          <PlayCircle size={18} />
                          재개
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleLockResults}
                          className="flex items-center gap-2 text-red-600 hover:text-red-700"
                        >
                          <Lock size={18} />
                          결과 잠금
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={handleReopenPoll}
                        className="flex items-center gap-2"
                      >
                        <Unlock size={18} />
                        잠금 해제
                      </Button>
                    )}
                  </div>
                )}
                <button
                  onClick={() => router.push('/live-voting')}
                  className="px-5 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all hover:scale-105 flex items-center gap-2 font-medium shadow-md"
                >
                  <Home size={20} />
                  홈으로
                </button>
              </>
            )}
            <button
              onClick={() => setIsPresentationMode(!isPresentationMode)}
              className={`px-5 py-3 rounded-xl transition-all hover:scale-105 shadow-lg flex items-center gap-2 font-medium ${
                isPresentationMode
                  ? 'bg-white text-blue-700 hover:bg-gray-100'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isPresentationMode ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              {isPresentationMode ? '일반 모드' : '프레젠테이션 모드'}
            </button>
          </div>
        </div>
      </div>

      {/* 참여자 목록 패널 */}
      {showParticipants && !isPresentationMode && isCloudMode && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
            <ParticipantList
              participants={participants}
              votes={activeVotes}
              showVoteStatus={true}
              showRole={true}
            />
          </div>
        </div>
      )}

      <div
        className={`max-w-7xl mx-auto grid ${isPresentationMode ? 'grid-cols-3 gap-8' : 'grid-cols-1 lg:grid-cols-2 gap-6'}`}
      >
        {/* QR 코드 */}
        <div
          className={`bg-white rounded-2xl shadow-xl p-8 ${isPresentationMode ? 'col-span-1 border-4 border-blue-200' : 'border border-gray-200'}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`${isPresentationMode ? 'w-14 h-14' : 'w-12 h-12'} bg-purple-600 rounded-xl flex items-center justify-center shadow-md`}
            >
              <QrCode size={isPresentationMode ? 28 : 24} className="text-white" />
            </div>
            <h3
              className={`font-bold ${isPresentationMode ? 'text-3xl' : 'text-2xl'} text-gray-900`}
            >
              투표 참여
            </h3>
          </div>
          {qrDataUrl && (
            <div className="flex flex-col items-center">
              <div
                className={`relative ${isPresentationMode ? 'p-6' : 'p-4'} bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300`}
              >
                <img
                  src={qrDataUrl}
                  alt="QR Code"
                  className={`${isPresentationMode ? 'w-full' : 'w-64'} rounded-xl`}
                />
              </div>
              <div className={`mt-6 text-center ${isPresentationMode ? 'space-y-3' : 'space-y-2'}`}>
                <p
                  className={`text-gray-700 font-medium ${isPresentationMode ? 'text-xl' : 'text-base'}`}
                >
                  QR 코드를 스캔하거나
                  <br />
                  아래 링크를 클릭해 복사하세요
                </p>
                <CopyableLink
                  url={`${window.location.origin}/live-voting/vote/${pollId}`}
                  className={isPresentationMode ? 'text-base' : ''}
                />
              </div>
            </div>
          )}
        </div>

        {/* 차트 */}
        <div
          className={`bg-white rounded-2xl shadow-xl p-8 ${isPresentationMode ? 'col-span-2 border-4 border-green-200' : 'border border-gray-200'}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`${isPresentationMode ? 'w-14 h-14' : 'w-12 h-12'} bg-green-600 rounded-xl flex items-center justify-center shadow-md`}
            >
              <TrendingUp size={isPresentationMode ? 28 : 24} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h3
                className={`font-bold ${isPresentationMode ? 'text-3xl' : 'text-2xl'} text-gray-900`}
              >
                실시간 결과
              </h3>
              {activePoll.type === 'ranking' && (
                <p className={`text-gray-600 ${isPresentationMode ? 'text-lg' : 'text-sm'}`}>
                  Borda Count 점수
                </p>
              )}
            </div>
          </div>
          <ResultChart
            results={activeResults}
            isRanking={activePoll.type === 'ranking'}
            isPresentationMode={isPresentationMode}
          />
        </div>
      </div>

      {/* 결과 테이블 (일반 모드만) */}
      {!isPresentationMode && (
        <div className="max-w-7xl mx-auto mt-6 bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <h3 className="text-2xl font-bold mb-6 text-gray-900">상세 결과</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-4 px-6 font-bold text-gray-900 text-lg">선택지</th>
                  {activePoll.type === 'ranking' ? (
                    <>
                      <th className="text-right py-4 px-6 font-bold text-gray-900 text-lg">순위</th>
                      <th className="text-right py-4 px-6 font-bold text-gray-900 text-lg">점수</th>
                    </>
                  ) : (
                    <>
                      <th className="text-right py-4 px-6 font-bold text-gray-900 text-lg">
                        득표수
                      </th>
                      <th className="text-right py-4 px-6 font-bold text-gray-900 text-lg">비율</th>
                      <th className="text-left py-4 px-6 font-bold text-gray-900 text-lg">
                        진행률
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {activeResults.map((result, index) => {
                  const colorClasses = [
                    'bg-blue-500',
                    'bg-purple-500',
                    'bg-green-500',
                    'bg-orange-500',
                    'bg-pink-500',
                    'bg-cyan-500',
                    'bg-indigo-500',
                    'bg-teal-500',
                  ];
                  const colorClass = colorClasses[index % colorClasses.length];

                  return (
                    <tr
                      key={index}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6 font-medium text-gray-900 text-base">
                        {result.option}
                      </td>
                      {activePoll.type === 'ranking' ? (
                        <>
                          <td className="text-right py-4 px-6 font-semibold text-gray-900">
                            {result.rank}위
                          </td>
                          <td className="text-right py-4 px-6 font-semibold text-gray-900">
                            {result.score}점
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="text-right py-4 px-6 font-semibold text-gray-900 text-lg">
                            {result.count}표
                          </td>
                          <td className="text-right py-4 px-6 font-semibold text-gray-900 text-lg">
                            {result.percentage.toFixed(1)}%
                          </td>
                          <td className="py-4 px-6">
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                              <div
                                className={`h-full ${colorClass} rounded-full transition-all duration-500 ease-out`}
                                style={{ width: `${result.percentage}%` }}
                              />
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
