import React, { useState } from 'react';
import { nanoid } from 'nanoid';
import type { Question, Category } from '../types';

interface CustomQuestionFormProps {
  onSubmit: (question: Question) => void;
}

const CustomQuestionForm: React.FC<CustomQuestionFormProps> = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [category, setCategory] = useState<Category>('general');
  const [imageA, setImageA] = useState<string>('');
  const [imageB, setImageB] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newQuestion: Question = {
      id: nanoid(10),
      title: title.trim(),
      optionA: optionA.trim(),
      optionB: optionB.trim(),
      category,
      imageA: imageA.trim() || undefined,
      imageB: imageB.trim() || undefined,
      createdAt: new Date().toISOString(),
      votes: { A: 0, B: 0 },
    };

    onSubmit(newQuestion);

    // Reset form
    setTitle('');
    setOptionA('');
    setOptionB('');
    setImageA('');
    setImageB('');
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">새 질문 만들기</h2>

      {/* Question title */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">질문</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 더 중요한 것은?"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          required
          maxLength={100}
        />
      </div>

      {/* Option A */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">선택지 A</label>
        <input
          type="text"
          value={optionA}
          onChange={(e) => setOptionA(e.target.value)}
          placeholder="예: 돈"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          required
          maxLength={50}
        />
        <input
          type="url"
          value={imageA}
          onChange={(e) => setImageA(e.target.value)}
          placeholder="이미지 URL (선택)"
          className="w-full px-4 py-2 border rounded-lg mt-2"
        />
      </div>

      {/* Option B */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">선택지 B</label>
        <input
          type="text"
          value={optionB}
          onChange={(e) => setOptionB(e.target.value)}
          placeholder="예: 사랑"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
          required
          maxLength={50}
        />
        <input
          type="url"
          value={imageB}
          onChange={(e) => setImageB(e.target.value)}
          placeholder="이미지 URL (선택)"
          className="w-full px-4 py-2 border rounded-lg mt-2"
        />
      </div>

      {/* Category selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">카테고리</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className="w-full px-4 py-2 border rounded-lg"
        >
          <option value="general">일반</option>
          <option value="food">음식</option>
          <option value="travel">여행</option>
          <option value="values">가치관</option>
          <option value="romance">연애</option>
          <option value="work">직장</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition"
      >
        질문 생성하기
      </button>
    </form>
  );
};

export default CustomQuestionForm;
