import React, { useState } from 'react';
import { Download, Share2, Copy, Check } from 'lucide-react';
import { generateResultImage, downloadImage, copyImageToClipboard } from '../utils/imageGenerator';
import type { ResultImageOptions } from '../utils/imageGenerator';

interface ShareButtonProps {
  imageOptions: ResultImageOptions;
  questionId: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ imageOptions, questionId }) => {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const blob = await generateResultImage(imageOptions);
      downloadImage(blob, `balance-game-${questionId}.png`);
    } catch (error) {
      console.error('이미지 생성 실패:', error);
      alert('이미지 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyImage = async () => {
    setLoading(true);
    try {
      const blob = await generateResultImage(imageOptions);
      await copyImageToClipboard(blob);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('클립보드 복사 실패:', error);
      alert('클립보드 복사에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/mini-apps/balance-game/#/game/${questionId}`;
    const shareText = `${imageOptions.question.title}\n나는 "${
      imageOptions.myChoice === 'A'
        ? imageOptions.question.optionA
        : imageOptions.question.optionB
    }" 선택!`;

    if (navigator.share) {
      try {
        const blob = await generateResultImage(imageOptions);
        const file = new File([blob], `balance-game-${questionId}.png`, {
          type: 'image/png',
        });

        await navigator.share({
          title: '밸런스 게임 결과',
          text: shareText,
          url: shareUrl,
          files: [file],
        });
      } catch (error) {
        console.error('공유 실패:', error);
      }
    } else {
      // Web Share API not supported
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      alert('링크가 클립보드에 복사되었습니다!');
    }
  };

  return (
    <div className="flex gap-3 justify-center mt-6">
      <button
        onClick={handleDownload}
        disabled={loading}
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
      >
        <Download size={20} />
        이미지 저장
      </button>

      <button
        onClick={handleCopyImage}
        disabled={loading}
        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
      >
        {copied ? <Check size={20} /> : <Copy size={20} />}
        {copied ? '복사됨!' : '이미지 복사'}
      </button>

      <button
        onClick={handleShare}
        disabled={loading}
        className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition"
      >
        <Share2 size={20} />
        공유하기
      </button>
    </div>
  );
};

export default ShareButton;
