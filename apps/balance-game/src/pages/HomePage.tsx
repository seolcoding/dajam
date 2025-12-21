import React from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryMetadata } from '../data/categories';
import { questionTemplates } from '../data/templates';
import type { Category } from '../types';
import { Plus, Shuffle } from 'lucide-react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleRandomQuestion = () => {
    const categories = Object.keys(questionTemplates) as Category[];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const questions = questionTemplates[randomCategory];
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    navigate(`/game/${randomQuestion.id}`);
  };

  const handleCategorySelect = (category: Category) => {
    const questions = questionTemplates[category];
    if (questions.length > 0) {
      const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
      navigate(`/game/${randomQuestion.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-gray-900">
            밸런스 게임
          </h1>
          <p className="text-xl text-gray-600">
            A vs B, 당신의 선택은?
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-4 justify-center mb-12">
          <button
            onClick={handleRandomQuestion}
            className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-lg transition shadow-lg"
          >
            <Shuffle size={24} />
            랜덤 질문
          </button>
          <button
            onClick={() => navigate('/create')}
            className="flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-bold text-lg transition shadow-lg"
          >
            <Plus size={24} />
            질문 만들기
          </button>
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {(Object.keys(categoryMetadata) as Category[]).map((category) => {
            const meta = categoryMetadata[category];
            const questionCount = questionTemplates[category]?.length || 0;

            return (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                className={`
                  ${meta.color} text-white p-8 rounded-2xl shadow-lg
                  hover:scale-105 transition-transform cursor-pointer
                  flex flex-col items-center gap-4
                `}
              >
                <div className="text-6xl">{meta.emoji}</div>
                <div className="text-2xl font-bold">{meta.label}</div>
                <div className="text-sm opacity-90">{questionCount}개 질문</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
