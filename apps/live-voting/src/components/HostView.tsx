import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Maximize2, Minimize2, Users, Home, QrCode, TrendingUp, Sparkles } from 'lucide-react';
import { useLiveResults } from '@/hooks/useLiveResults';
import { ResultChart } from './ResultChart';

export function HostView() {
  const { pollId } = useParams<{ pollId: string }>();
  const navigate = useNavigate();
  const { poll, votes, results } = useLiveResults(pollId!);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [isPresentationMode, setIsPresentationMode] = useState(false);

  useEffect(() => {
    if (!pollId) {
      navigate('/');
      return;
    }

    // QR 코드 생성
    const voteUrl = `${window.location.origin}${import.meta.env.BASE_URL}vote/${pollId}`;
    QRCode.toDataURL(voteUrl, { width: 400, margin: 2 }).then(setQrDataUrl);
  }, [pollId, navigate]);

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

  return (
    <div className={`min-h-screen ${isPresentationMode ? 'bg-blue-600 p-8' : 'bg-gray-50 p-6'}`}>
      {/* 헤더 */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-3">
              {isPresentationMode && <Sparkles size={40} className="text-yellow-300" fill="currentColor" />}
              <h1 className={`font-bold ${isPresentationMode ? 'text-6xl text-white' : 'text-4xl text-gray-900'}`}>
                {poll.title}
              </h1>
            </div>
            <div className={`flex items-center gap-3 ${isPresentationMode ? 'text-3xl text-white/90' : 'text-xl text-gray-600'}`}>
              <div className={`flex items-center gap-2 ${isPresentationMode ? 'bg-white/20 backdrop-blur-sm px-6 py-3 rounded-2xl' : 'bg-blue-50 px-4 py-2 rounded-xl border border-blue-200'}`}>
                <Users size={isPresentationMode ? 32 : 24} className={isPresentationMode ? 'text-white' : 'text-blue-600'} />
                <span className="font-semibold">
                  <span className={`${isPresentationMode ? 'text-yellow-300' : 'text-blue-600'} font-bold text-4xl`}>{votes.length}</span>
                  <span className="ml-2">명 참여</span>
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            {!isPresentationMode && (
              <button
                onClick={() => navigate('/')}
                className="px-5 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all hover:scale-105 flex items-center gap-2 font-medium shadow-md"
              >
                <Home size={20} />
                홈으로
              </button>
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

      <div className={`max-w-7xl mx-auto grid ${isPresentationMode ? 'grid-cols-3 gap-8' : 'grid-cols-1 lg:grid-cols-2 gap-6'}`}>
        {/* QR 코드 */}
        <div className={`bg-white rounded-2xl shadow-xl p-8 ${isPresentationMode ? 'col-span-1 border-4 border-blue-200' : 'border border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`${isPresentationMode ? 'w-14 h-14' : 'w-12 h-12'} bg-purple-600 rounded-xl flex items-center justify-center shadow-md`}>
              <QrCode size={isPresentationMode ? 28 : 24} className="text-white" />
            </div>
            <h3 className={`font-bold ${isPresentationMode ? 'text-3xl' : 'text-2xl'} text-gray-900`}>투표 참여</h3>
          </div>
          {qrDataUrl && (
            <div className="flex flex-col items-center">
              <div className={`relative ${isPresentationMode ? 'p-6' : 'p-4'} bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300`}>
                <img src={qrDataUrl} alt="QR Code" className={`${isPresentationMode ? 'w-full' : 'w-64'} rounded-xl`} />
              </div>
              <div className={`mt-6 text-center ${isPresentationMode ? 'space-y-3' : 'space-y-2'}`}>
                <p className={`text-gray-700 font-medium ${isPresentationMode ? 'text-xl' : 'text-base'}`}>
                  QR 코드를 스캔하거나<br />아래 링크로 접속하세요
                </p>
                <div className={`${isPresentationMode ? 'px-6 py-4' : 'px-4 py-3'} bg-blue-50 rounded-xl border border-blue-200`}>
                  <p className={`font-mono text-blue-700 font-semibold break-all ${isPresentationMode ? 'text-base' : 'text-sm'}`}>
                    {window.location.origin}{import.meta.env.BASE_URL}vote/{pollId}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 차트 */}
        <div className={`bg-white rounded-2xl shadow-xl p-8 ${isPresentationMode ? 'col-span-2 border-4 border-green-200' : 'border border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`${isPresentationMode ? 'w-14 h-14' : 'w-12 h-12'} bg-green-600 rounded-xl flex items-center justify-center shadow-md`}>
              <TrendingUp size={isPresentationMode ? 28 : 24} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className={`font-bold ${isPresentationMode ? 'text-3xl' : 'text-2xl'} text-gray-900`}>
                실시간 결과
              </h3>
              {poll.type === 'ranking' && (
                <p className={`text-gray-600 ${isPresentationMode ? 'text-lg' : 'text-sm'}`}>Borda Count 점수</p>
              )}
            </div>
          </div>
          <ResultChart results={results} isRanking={poll.type === 'ranking'} isPresentationMode={isPresentationMode} />
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
                  {poll.type === 'ranking' ? (
                    <>
                      <th className="text-right py-4 px-6 font-bold text-gray-900 text-lg">순위</th>
                      <th className="text-right py-4 px-6 font-bold text-gray-900 text-lg">점수</th>
                    </>
                  ) : (
                    <>
                      <th className="text-right py-4 px-6 font-bold text-gray-900 text-lg">득표수</th>
                      <th className="text-right py-4 px-6 font-bold text-gray-900 text-lg">비율</th>
                      <th className="text-left py-4 px-6 font-bold text-gray-900 text-lg">진행률</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => {
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
                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 font-medium text-gray-900 text-base">{result.option}</td>
                      {poll.type === 'ranking' ? (
                        <>
                          <td className="text-right py-4 px-6 font-semibold text-gray-900">{result.rank}위</td>
                          <td className="text-right py-4 px-6 font-semibold text-gray-900">{result.score}점</td>
                        </>
                      ) : (
                        <>
                          <td className="text-right py-4 px-6 font-semibold text-gray-900 text-lg">{result.count}표</td>
                          <td className="text-right py-4 px-6 font-semibold text-gray-900 text-lg">{result.percentage.toFixed(1)}%</td>
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
