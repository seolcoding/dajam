import type { TestQuestion, PersonalityDimension } from '../types';

// MBTI Dimensions
export const MBTI_DIMENSIONS: PersonalityDimension[] = [
  {
    id: 'EI',
    name: '에너지 방향',
    left: { code: 'E', label: '외향형', description: '사람들과 함께 할 때 에너지를 얻어요' },
    right: { code: 'I', label: '내향형', description: '혼자만의 시간에서 에너지를 충전해요' },
  },
  {
    id: 'SN',
    name: '인식 기능',
    left: { code: 'S', label: '감각형', description: '현실적이고 구체적인 것을 선호해요' },
    right: { code: 'N', label: '직관형', description: '가능성과 아이디어를 중시해요' },
  },
  {
    id: 'TF',
    name: '판단 기능',
    left: { code: 'T', label: '사고형', description: '논리와 객관적 기준으로 결정해요' },
    right: { code: 'F', label: '감정형', description: '가치관과 감정을 중시해요' },
  },
  {
    id: 'JP',
    name: '생활 양식',
    left: { code: 'J', label: '판단형', description: '계획적이고 체계적인 것을 좋아해요' },
    right: { code: 'P', label: '인식형', description: '유연하고 자율적인 것을 좋아해요' },
  },
];

// MBTI Test Questions (4 questions per dimension = 16 total)
export const MBTI_QUESTIONS: TestQuestion[] = [
  // E-I 질문들 (외향-내향)
  {
    id: 'q1',
    dimension: 'EI',
    text: '친구들과 약속이 잡히면...',
    optionLeft: '기대되고 신나요! 🎉',
    optionRight: '즐겁지만 체력 소모가 걱정돼요 😌',
  },
  {
    id: 'q2',
    dimension: 'EI',
    text: '새로운 사람을 만나면...',
    optionLeft: '먼저 다가가서 대화를 시작해요 👋',
    optionRight: '상대방이 먼저 말 걸어주길 기다려요 🤐',
  },
  {
    id: 'q3',
    dimension: 'EI',
    text: '주말을 어떻게 보내고 싶나요?',
    optionLeft: '친구들과 밖에서 활동적으로 🏃',
    optionRight: '집에서 혼자 편안하게 🏠',
  },
  {
    id: 'q4',
    dimension: 'EI',
    text: '스트레스를 받으면...',
    optionLeft: '친구를 만나서 수다를 떨어요 💬',
    optionRight: '혼자만의 시간을 가져요 🧘',
  },

  // S-N 질문들 (감각-직관)
  {
    id: 'q5',
    dimension: 'SN',
    text: '새로운 일을 배울 때...',
    optionLeft: '구체적인 예시와 단계가 있어야 해요 📝',
    optionRight: '전체적인 개념과 원리를 먼저 이해해요 💡',
  },
  {
    id: 'q6',
    dimension: 'SN',
    text: '대화할 때 더 관심 있는 것은?',
    optionLeft: '지금 여기, 현실적인 이야기 🌍',
    optionRight: '미래, 가능성, 상상의 이야기 ✨',
  },
  {
    id: 'q7',
    dimension: 'SN',
    text: '정보를 받아들일 때...',
    optionLeft: '오감으로 느끼고 경험해요 👀',
    optionRight: '직관과 영감으로 해석해요 🔮',
  },
  {
    id: 'q8',
    dimension: 'SN',
    text: '관심사는 주로...',
    optionLeft: '실용적이고 현실적인 것 🔧',
    optionRight: '추상적이고 이론적인 것 📚',
  },

  // T-F 질문들 (사고-감정)
  {
    id: 'q9',
    dimension: 'TF',
    text: '결정을 내릴 때...',
    optionLeft: '논리와 객관적 사실을 중시해요 🧠',
    optionRight: '사람들의 감정과 가치를 고려해요 ❤️',
  },
  {
    id: 'q10',
    dimension: 'TF',
    text: '친구가 고민 상담을 하면...',
    optionLeft: '해결책과 조언을 제시해요 💡',
    optionRight: '공감하고 위로해줘요 🤗',
  },
  {
    id: 'q11',
    dimension: 'TF',
    text: '비판을 받을 때...',
    optionLeft: '논리적으로 분석하고 반박해요 🎯',
    optionRight: '감정적으로 상처받아요 💔',
  },
  {
    id: 'q12',
    dimension: 'TF',
    text: '중요하게 생각하는 것은...',
    optionLeft: '정의와 공정함 ⚖️',
    optionRight: '조화와 공감 🕊️',
  },

  // J-P 질문들 (판단-인식)
  {
    id: 'q13',
    dimension: 'JP',
    text: '여행 계획을 세울 때...',
    optionLeft: '세세한 일정을 미리 짜요 📅',
    optionRight: '그때그때 즉흥적으로 정해요 🎲',
  },
  {
    id: 'q14',
    dimension: 'JP',
    text: '과제나 일을 할 때...',
    optionLeft: '미리미리 계획적으로 해요 ⏰',
    optionRight: '마감 직전에 몰아서 해요 🏃',
  },
  {
    id: 'q15',
    dimension: 'JP',
    text: '일상생활에서...',
    optionLeft: '정리정돈과 체계를 좋아해요 📦',
    optionRight: '자유롭고 융통성있게 살아요 🌈',
  },
  {
    id: 'q16',
    dimension: 'JP',
    text: '결정을 내릴 때...',
    optionLeft: '빨리 결정하고 실행해요 ✅',
    optionRight: '여러 가능성을 열어두고 싶어요 🤔',
  },
];

// Helper function to get dimension info
export function getDimensionInfo(dimensionId: string): PersonalityDimension | undefined {
  return MBTI_DIMENSIONS.find(d => d.id === dimensionId);
}

// Helper function to get questions by dimension
export function getQuestionsByDimension(dimensionId: string): TestQuestion[] {
  return MBTI_QUESTIONS.filter(q => q.dimension === dimensionId);
}
