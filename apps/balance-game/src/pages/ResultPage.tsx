import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ResultChart from '../components/ResultChart';
import ShareButton from '../components/ShareButton';
import type { Question } from '../types';
import { questionTemplates } from '../data/templates';
import { getQuestionById, getQuestionStats, getVotes } from '../utils/storage';
import { Button, LoadingSpinner } from '@mini-apps/ui';
import { ArrowLeft, RefreshCw, Home } from 'lucide-react';

const ResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<Question | null>(null);
  const [stats, setStats] = useState<{ A: number; B: number } | null>(null);
  const [myChoice, setMyChoice] = useState<'A' | 'B' | undefined>(undefined);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    if (!id) return;

    // Find question
    let found: Question | null = null;
    for (const category in questionTemplates) {
      const questions = questionTemplates[category as keyof typeof questionTemplates];
      found = questions.find((q) => q.id === id) || null;
      if (found) break;
    }

    if (!found) {
      found = getQuestionById(id);
    }

    setQuestion(found);

    // Get statistics
    if (found) {
      const voteStats = getQuestionStats(found.id);
      setStats(voteStats);

      const votes = getVotes();
      setMyChoice(votes[found.id]);
    }

    // Trigger fade in animation
    setTimeout(() => setFadeIn(true), 100);
  }, [id]);

  const handlePlayAgain = () => {
    navigate('/');
  };

  if (!question || !stats) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-6">
          <LoadingSpinner />
          <p className="text-xl font-semibold text-gray-600">결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const totalVotes = stats.A + stats.B;
  const percentageA = (stats.A / totalVotes) * 100;
  const percentageB = (stats.B / totalVotes) * 100;

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className={`flex items-center justify-between mb-12 transition-all duration-500 ${
          fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}>
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            돌아가기
          </Button>

          <div className="flex gap-3">
            <Button
              onClick={handlePlayAgain}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              다른 질문 하기
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
            >
              <Home className="w-5 h-5 mr-2" />
              홈으로
            </Button>
          </div>
        </div>

        {/* Result chart with staggered animation */}
        <div className={`transition-all duration-700 delay-150 ${
          fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <ResultChart question={question} stats={stats} myChoice={myChoice} />
        </div>

        {/* Share buttons with delayed animation */}
        {myChoice && (
          <div className={`mt-12 transition-all duration-700 delay-300 ${
            fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <ShareButton
              imageOptions={{
                question,
                myChoice,
                stats,
                percentageA,
                percentageB,
              }}
              questionId={question.id}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultPage;
