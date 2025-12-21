import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomQuestionForm from '../components/CustomQuestionForm';
import type { Question } from '../types';
import { saveCustomQuestion } from '../utils/storage';
import { ArrowLeft, Sparkles } from 'lucide-react';

const CreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [questionId, setQuestionId] = useState<string | null>(null);

  const handleQuestionCreate = (question: Question) => {
    saveCustomQuestion(question);
    const url = `${window.location.origin}/mini-apps/balance-game/#/game/${question.id}`;
    setShareUrl(url);
    setQuestionId(question.id);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            돌아가기
          </button>
          <div className="flex items-center gap-2 text-purple-600">
            <Sparkles size={24} />
            <h1 className="text-2xl font-bold">나만의 질문 만들기</h1>
          </div>
        </div>

        {/* Form */}
        <CustomQuestionForm onSubmit={handleQuestionCreate} />

        {/* Share URL */}
        {shareUrl && questionId && (
          <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
            <h3 className="text-lg font-bold mb-4 text-green-600">질문이 생성되었습니다!</h3>
            <p className="text-gray-700 mb-2">아래 링크를 공유하세요:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-4 py-2 border rounded-lg bg-gray-50"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  alert('링크가 복사되었습니다!');
                }}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                복사
              </button>
            </div>
            <button
              onClick={() => navigate(`/game/${questionId}`)}
              className="w-full mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
            >
              바로 플레이하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePage;
