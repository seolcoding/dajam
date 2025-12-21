import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QuestionCard from '../components/QuestionCard';
import type { Question } from '../types';
import { questionTemplates } from '../data/templates';
import { getQuestionById, saveVote, incrementVote } from '../utils/storage';
import { Button } from '@mini-apps/ui';
import { ArrowLeft, Sparkles } from 'lucide-react';

const GamePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<Question | null>(null);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    if (!id) return;

    // Find template question
    let found: Question | null = null;
    for (const category in questionTemplates) {
      const questions = questionTemplates[category as keyof typeof questionTemplates];
      found = questions.find((q) => q.id === id) || null;
      if (found) break;
    }

    // Find custom question
    if (!found) {
      found = getQuestionById(id);
    }

    setQuestion(found);

    // Trigger fade in animation
    setTimeout(() => setFadeIn(true), 50);
  }, [id]);

  const handleSelect = (choice: 'A' | 'B') => {
    if (!question) return;

    saveVote(question.id, choice);
    incrementVote(question.id, choice);
    navigate(`/result/${question.id}`);
  };

  if (!question) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center space-y-6 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <Sparkles className="w-10 h-10 text-red-600" />
          </div>
          <div>
            <p className="text-3xl font-black text-gray-900 mb-2">질문을 찾을 수 없습니다</p>
            <p className="text-gray-600">존재하지 않는 질문이거나 삭제된 질문입니다.</p>
          </div>
          <Button
            onClick={() => navigate('/')}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          돌아가기
        </Button>
      </div>

      {/* Question card with fade-in animation */}
      <div className={`transition-all duration-700 ${
        fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <QuestionCard question={question} onSelect={handleSelect} />
      </div>
    </div>
  );
};

export default GamePage;
