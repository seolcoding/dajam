'use client';

import React, { useRef } from 'react';
import type { PersonalityType, DimensionScore } from '../types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';
import { toPng } from 'html-to-image';

interface ResultCardProps {
  personalityType: PersonalityType;
  scores: DimensionScore[];
  onShare?: () => void;
}

export default function ResultCard({ personalityType, scores }: ResultCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;

    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });

      const link = document.createElement('a');
      link.download = `${personalityType.code}-personality-result.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('이미지 다운로드 실패:', error);
      alert('이미지 다운로드에 실패했습니다.');
    }
  };

  const handleShare = async () => {
    const shareText = `나는 ${personalityType.name} (${personalityType.code})!\n${personalityType.shortDescription}`;
    const shareUrl = `${window.location.origin}/personality-test`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: '성격 유형 테스트 결과',
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
      alert('링크가 복사되었습니다!');
    }
  };

  const getDimensionLabel = (dim: DimensionScore) => {
    const labels: Record<string, { left: string; right: string }> = {
      EI: { left: 'E', right: 'I' },
      SN: { left: 'S', right: 'N' },
      TF: { left: 'T', right: 'F' },
      JP: { left: 'J', right: 'P' },
    };
    return labels[dim.dimension];
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Shareable Card - 9:16 ratio for SNS */}
      <div
        ref={cardRef}
        className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        style={{ aspectRatio: '9/16' }}
      >
        <div className={`${personalityType.color} text-white p-8 flex flex-col justify-center items-center text-center h-full`}>
          {/* Emoji */}
          <div className="text-8xl mb-6">
            {personalityType.emoji}
          </div>

          {/* Type Code */}
          <h1 className="text-6xl font-black mb-4 tracking-wider">
            {personalityType.code}
          </h1>

          {/* Type Name */}
          <h2 className="text-3xl font-bold mb-8">
            {personalityType.name}
          </h2>

          {/* Dimension Bars */}
          <div className="w-full max-w-sm space-y-4 mb-8">
            {scores.map((score) => {
              const labels = getDimensionLabel(score);
              const leftPercentage = (score.left / (score.left + score.right)) * 100;
              const rightPercentage = 100 - leftPercentage;

              return (
                <div key={score.dimension} className="bg-white bg-opacity-20 rounded-full p-1">
                  <div className="flex items-center justify-between text-sm font-bold mb-1 px-2">
                    <span>{labels.left}</span>
                    <span>{labels.right}</span>
                  </div>
                  <div className="flex h-3 rounded-full overflow-hidden bg-white bg-opacity-30">
                    <div
                      className="bg-white"
                      style={{ width: `${leftPercentage}%` }}
                    />
                    <div
                      className="bg-white bg-opacity-50"
                      style={{ width: `${rightPercentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1 px-2">
                    <span>{Math.round(leftPercentage)}%</span>
                    <span>{Math.round(rightPercentage)}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Short Description */}
          <p className="text-xl font-medium mb-8 px-4 italic">
            &quot;{personalityType.shortDescription}&quot;
          </p>

          {/* Website URL */}
          <div className="text-sm font-medium opacity-90">
            dajam.seolcoding.com/personality-test
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-6">
        <Button
          onClick={handleDownloadImage}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
          size="lg"
        >
          <Download className="w-5 h-5 mr-2" />
          이미지 저장
        </Button>
        <Button
          onClick={handleShare}
          className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
          size="lg"
        >
          <Share2 className="w-5 h-5 mr-2" />
          공유하기
        </Button>
      </div>

      {/* Detailed Information */}
      <Card className="mt-8 p-8">
        <div className="space-y-8">
          {/* Description */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">설명</h3>
            <p className="text-gray-700 leading-relaxed">
              {personalityType.longDescription}
            </p>
          </div>

          {/* Strengths */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">💪 강점</h3>
            <div className="flex flex-wrap gap-2">
              {personalityType.strengths.map((strength, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                >
                  {strength}
                </span>
              ))}
            </div>
          </div>

          {/* Weaknesses */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">⚠️ 약점</h3>
            <div className="flex flex-wrap gap-2">
              {personalityType.weaknesses.map((weakness, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
                >
                  {weakness}
                </span>
              ))}
            </div>
          </div>

          {/* Compatibility */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">❤️ 잘 맞는 유형</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-600">최고:</span>
                <span className="ml-2 text-gray-900 font-bold">
                  {personalityType.compatibility.best.join(', ')}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">좋음:</span>
                <span className="ml-2 text-gray-900">
                  {personalityType.compatibility.good.join(', ')}
                </span>
              </div>
            </div>
          </div>

          {/* Famous Examples */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">🌟 유명 인물</h3>
            <p className="text-gray-700">
              {personalityType.famousExamples.join(', ')}
            </p>
          </div>

          {/* Careers */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">💼 추천 직업</h3>
            <div className="flex flex-wrap gap-2">
              {personalityType.careers.map((career, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {career}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
