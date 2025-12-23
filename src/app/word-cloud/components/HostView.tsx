'use client';

import { useState, useEffect, useRef } from 'react';
import { useWordCloudStore } from '../store/wordCloudStore';
import { WordCloudRenderer, WordCloudStats } from './WordCloudRenderer';
import {
  Users,
  Download,
  StopCircle,
  QrCode,
  Home,
  Maximize2,
  Minimize2,
  Palette,
  Sparkles,
  Cloud,
  Monitor,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import QRCodeLib from 'qrcode';
import { useRouter } from 'next/navigation';
import type { ColorScheme } from '../types';

interface HostViewProps {
  sessionCode: string;
  onCloseSession: () => Promise<boolean>;
  participantCount?: number;
  isCloudMode?: boolean;
}

export function HostView({
  sessionCode,
  onCloseSession,
  participantCount = 0,
  isCloudMode = false,
}: HostViewProps) {
  const router = useRouter();
  const { session, wordCounts, entries, updateSettings } = useWordCloudStore();
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const cloudRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate QR code
    const voteUrl = `${window.location.origin}/word-cloud/join?code=${sessionCode}`;
    QRCodeLib.toDataURL(voteUrl, { width: 400, margin: 2 }).then(setQrDataUrl);
  }, [sessionCode]);

  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  const handleCloseSession = async () => {
    if (!confirm('입력을 마감하시겠습니까? 참가자들이 더 이상 단어를 입력할 수 없습니다.')) {
      return;
    }

    setIsClosing(true);
    const success = await onCloseSession();
    if (!success) {
      alert('세션 종료에 실패했습니다.');
    }
    setIsClosing(false);
  };

  const handleExportImage = async () => {
    if (!cloudRef.current) return;

    try {
      // Use html-to-image if available, otherwise use simple screenshot
      const { toPng } = await import('html-to-image');

      const dataUrl = await toPng(cloudRef.current, {
        quality: 1,
        backgroundColor: '#ffffff',
        pixelRatio: 2,
      });

      const link = document.createElement('a');
      link.download = `wordcloud-${sessionCode}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
      alert('이미지 내보내기에 실패했습니다.');
    }
  };

  const handleColorSchemeChange = (scheme: ColorScheme) => {
    updateSettings({ colorScheme: scheme });
  };

  const colorSchemes: { value: ColorScheme; label: string; emoji: string }[] = [
    { value: 'rainbow', label: '무지개', emoji: '🌈' },
    { value: 'ocean', label: '바다', emoji: '🌊' },
    { value: 'sunset', label: '석양', emoji: '🌅' },
    { value: 'forest', label: '숲', emoji: '🌲' },
    { value: 'mono', label: '단색', emoji: '⚫' },
  ];

  return (
    <div
      className={`min-h-screen ${
        isPresentationMode
          ? 'bg-gradient-to-br from-blue-600 to-purple-600 p-8'
          : 'bg-gray-50 p-6'
      }`}
    >
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-3">
              {isPresentationMode && (
                <Sparkles size={40} className="text-yellow-300" fill="currentColor" />
              )}
              <h1
                className={`font-bold ${
                  isPresentationMode
                    ? 'text-6xl text-white'
                    : 'text-4xl text-gray-900'
                }`}
              >
                {session.title}
              </h1>
            </div>
            <div
              className={`flex items-center gap-3 flex-wrap ${
                isPresentationMode ? 'text-2xl text-white/90' : 'text-xl text-gray-600'
              }`}
            >
              <div
                className={`flex items-center gap-2 ${
                  isPresentationMode
                    ? 'bg-white/20 backdrop-blur-sm px-6 py-3 rounded-2xl'
                    : 'bg-blue-50 px-4 py-2 rounded-xl border border-blue-200'
                }`}
              >
                <Users
                  size={isPresentationMode ? 32 : 24}
                  className={isPresentationMode ? 'text-white' : 'text-blue-600'}
                />
                <span className="font-semibold">
                  <span
                    className={`${
                      isPresentationMode ? 'text-yellow-300' : 'text-blue-600'
                    } font-bold text-3xl`}
                  >
                    {participantCount}
                  </span>
                  <span className="ml-2">명 참여</span>
                </span>
              </div>

              <div
                className={`flex items-center gap-2 ${
                  isPresentationMode
                    ? 'bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl'
                    : 'px-3 py-1 rounded-lg border ' +
                      (isCloudMode
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-gray-50 border-gray-200')
                }`}
              >
                {isCloudMode ? (
                  <>
                    <Cloud
                      size={isPresentationMode ? 24 : 16}
                      className={isPresentationMode ? 'text-white' : 'text-blue-600'}
                    />
                    <span
                      className={`text-sm font-medium ${
                        isPresentationMode ? 'text-white' : 'text-blue-600'
                      }`}
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
                      className={`text-sm font-medium ${
                        isPresentationMode ? 'text-white' : 'text-gray-600'
                      }`}
                    >
                      로컬
                    </span>
                  </>
                )}
              </div>

              <div
                className={`flex items-center gap-2 ${
                  isPresentationMode
                    ? 'bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl'
                    : 'bg-purple-50 px-3 py-1 rounded-lg border border-purple-200'
                }`}
              >
                <span
                  className={`text-sm font-medium ${
                    isPresentationMode ? 'text-white' : 'text-purple-600'
                  }`}
                >
                  {sessionCode}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            {!isPresentationMode && (
              <Button
                onClick={() => router.push('/word-cloud')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Home size={20} />
                홈으로
              </Button>
            )}
            <Button
              onClick={() => setIsPresentationMode(!isPresentationMode)}
              className={
                isPresentationMode
                  ? 'bg-white text-blue-700 hover:bg-gray-100'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }
            >
              {isPresentationMode ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              <span className="ml-2">
                {isPresentationMode ? '일반 모드' : '프레젠테이션'}
              </span>
            </Button>
          </div>
        </div>
      </div>

      <div
        className={`max-w-7xl mx-auto grid ${
          isPresentationMode ? 'grid-cols-3 gap-8' : 'grid-cols-1 lg:grid-cols-2 gap-6'
        }`}
      >
        {/* QR Code */}
        <div
          className={`bg-white rounded-2xl shadow-xl p-8 ${
            isPresentationMode
              ? 'col-span-1 border-4 border-blue-200'
              : 'border border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`${
                isPresentationMode ? 'w-14 h-14' : 'w-12 h-12'
              } bg-purple-600 rounded-xl flex items-center justify-center shadow-md`}
            >
              <QrCode
                size={isPresentationMode ? 28 : 24}
                className="text-white"
              />
            </div>
            <h3
              className={`font-bold ${
                isPresentationMode ? 'text-3xl' : 'text-2xl'
              } text-gray-900`}
            >
              참여하기
            </h3>
          </div>
          {qrDataUrl && (
            <div className="flex flex-col items-center">
              <div
                className={`relative ${
                  isPresentationMode ? 'p-6' : 'p-4'
                } bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300`}
              >
                <img
                  src={qrDataUrl}
                  alt="QR Code"
                  className={`${isPresentationMode ? 'w-full' : 'w-64'} rounded-xl`}
                />
              </div>
              <div
                className={`mt-6 text-center ${
                  isPresentationMode ? 'space-y-3' : 'space-y-2'
                }`}
              >
                <p
                  className={`text-gray-700 font-medium ${
                    isPresentationMode ? 'text-xl' : 'text-base'
                  }`}
                >
                  QR 코드를 스캔하거나
                  <br />
                  코드 입력: <strong className="text-blue-600">{sessionCode}</strong>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Word Cloud */}
        <div
          className={`bg-white rounded-2xl shadow-xl p-8 ${
            isPresentationMode
              ? 'col-span-2 border-4 border-green-200'
              : 'border border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <h3
              className={`font-bold ${
                isPresentationMode ? 'text-3xl' : 'text-2xl'
              } text-gray-900`}
            >
              실시간 워드 클라우드
            </h3>

            {!isPresentationMode && (
              <div className="flex gap-2">
                <Button
                  onClick={handleExportImage}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Download size={16} />
                  이미지 저장
                </Button>
                {session.status === 'collecting' && (
                  <Button
                    onClick={handleCloseSession}
                    disabled={isClosing}
                    variant="destructive"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <StopCircle size={16} />
                    {isClosing ? '마감 중...' : '입력 마감'}
                  </Button>
                )}
              </div>
            )}
          </div>

          {!isPresentationMode && (
            <WordCloudStats words={wordCounts} totalEntries={entries.length} />
          )}

          <div ref={cloudRef} className="bg-gray-50 rounded-xl p-4 min-h-[500px]">
            <WordCloudRenderer
              words={wordCounts}
              colorScheme={session.settings.colorScheme}
              className="min-h-[450px]"
            />
          </div>

          {!isPresentationMode && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <Palette size={20} className="text-gray-600" />
                <h4 className="font-semibold text-gray-900">색상 테마</h4>
              </div>
              <div className="flex gap-2 flex-wrap">
                {colorSchemes.map((scheme) => (
                  <button
                    key={scheme.value}
                    onClick={() => handleColorSchemeChange(scheme.value)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      session.settings.colorScheme === scheme.value
                        ? 'border-blue-500 bg-blue-50 font-bold'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <span className="mr-2">{scheme.emoji}</span>
                    {scheme.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Word List (Normal Mode Only) */}
      {!isPresentationMode && entries.length > 0 && (
        <div className="max-w-7xl mx-auto mt-6 bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <h3 className="text-2xl font-bold mb-6 text-gray-900">최근 입력된 단어</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {entries.slice(-24).reverse().map((entry, index) => (
              <div
                key={entry.id}
                className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-3 text-center animate-in fade-in"
              >
                <p className="text-lg font-bold text-gray-900">{entry.word}</p>
                {entry.participantName && (
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {entry.participantName}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
