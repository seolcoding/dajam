import type { Quiz, QuizQuestion, QuizSettings } from '../types';

/**
 * 기본 퀴즈 템플릿
 */

// 기본 설정
const defaultSettings: QuizSettings = {
  showLeaderboardAfterEach: true,
  randomizeQuestionOrder: false,
  randomizeOptionOrder: false,
  speedBonus: true,
  streakBonus: true,
};

// 대한민국 지리 퀴즈
const koreanGeographyQuestions: QuizQuestion[] = [
  {
    id: 'geo-1',
    text: '대한민국의 수도는?',
    type: 'multiple',
    options: ['서울', '부산', '인천', '대전'],
    correctIndex: 0,
    timeLimit: 10,
    points: 100,
  },
  {
    id: 'geo-2',
    text: '대한민국에서 가장 큰 섬은?',
    type: 'multiple',
    options: ['제주도', '거제도', '강화도', '울릉도'],
    correctIndex: 0,
    timeLimit: 10,
    points: 100,
  },
  {
    id: 'geo-3',
    text: '대한민국에서 가장 긴 강은?',
    type: 'multiple',
    options: ['낙동강', '한강', '금강', '섬진강'],
    correctIndex: 0,
    timeLimit: 15,
    points: 200,
  },
  {
    id: 'geo-4',
    text: '백두산의 높이는 약 몇 미터인가?',
    type: 'multiple',
    options: ['2,744m', '1,950m', '1,708m', '1,915m'],
    correctIndex: 0,
    timeLimit: 20,
    points: 500,
  },
  {
    id: 'geo-5',
    text: '대한민국은 반도 국가이다',
    type: 'truefalse',
    options: ['O', 'X'],
    correctIndex: 0,
    timeLimit: 5,
    points: 100,
  },
];

// 일반 상식 퀴즈
const generalKnowledgeQuestions: QuizQuestion[] = [
  {
    id: 'gk-1',
    text: '물의 화학식은?',
    type: 'multiple',
    options: ['H2O', 'CO2', 'NaCl', 'O2'],
    correctIndex: 0,
    timeLimit: 10,
    points: 100,
  },
  {
    id: 'gk-2',
    text: '태양계에서 가장 큰 행성은?',
    type: 'multiple',
    options: ['목성', '토성', '천왕성', '해왕성'],
    correctIndex: 0,
    timeLimit: 10,
    points: 100,
  },
  {
    id: 'gk-3',
    text: '1년은 몇 일인가?',
    type: 'multiple',
    options: ['365일', '364일', '366일', '360일'],
    correctIndex: 0,
    timeLimit: 10,
    points: 100,
  },
  {
    id: 'gk-4',
    text: '빛의 속도는 초속 약 몇 km인가?',
    type: 'multiple',
    options: ['300,000km', '150,000km', '450,000km', '200,000km'],
    correctIndex: 0,
    timeLimit: 15,
    points: 200,
  },
  {
    id: 'gk-5',
    text: '지구는 태양 주위를 돈다',
    type: 'truefalse',
    options: ['O', 'X'],
    correctIndex: 0,
    timeLimit: 5,
    points: 100,
  },
];

// 영화 퀴즈
const movieQuestions: QuizQuestion[] = [
  {
    id: 'movie-1',
    text: "'기생충' 감독은?",
    type: 'multiple',
    options: ['봉준호', '박찬욱', '김기덕', '이창동'],
    correctIndex: 0,
    timeLimit: 10,
    points: 100,
  },
  {
    id: 'movie-2',
    text: "'타이타닉'의 주연 배우는?",
    type: 'multiple',
    options: ['레오나르도 디카프리오', '브래드 피트', '톰 크루즈', '맷 데이먼'],
    correctIndex: 0,
    timeLimit: 10,
    points: 100,
  },
  {
    id: 'movie-3',
    text: "'해리 포터' 시리즈는 총 몇 편인가?",
    type: 'multiple',
    options: ['8편', '7편', '9편', '10편'],
    correctIndex: 0,
    timeLimit: 15,
    points: 200,
  },
  {
    id: 'movie-4',
    text: "'아바타'는 제임스 카메론 감독의 작품이다",
    type: 'truefalse',
    options: ['O', 'X'],
    correctIndex: 0,
    timeLimit: 10,
    points: 100,
  },
  {
    id: 'movie-5',
    text: "'인터스텔라'에서 주인공의 직업은?",
    type: 'multiple',
    options: ['우주비행사', '과학자', '교사', '의사'],
    correctIndex: 0,
    timeLimit: 15,
    points: 200,
  },
];

// K-POP 퀴즈
const kpopQuestions: QuizQuestion[] = [
  {
    id: 'kpop-1',
    text: 'BTS의 데뷔곡은?',
    type: 'multiple',
    options: ['No More Dream', 'Boy In Luv', 'Danger', 'I Need U'],
    correctIndex: 0,
    timeLimit: 15,
    points: 200,
  },
  {
    id: 'kpop-2',
    text: 'BLACKPINK의 멤버 수는?',
    type: 'multiple',
    options: ['4명', '3명', '5명', '6명'],
    correctIndex: 0,
    timeLimit: 10,
    points: 100,
  },
  {
    id: 'kpop-3',
    text: "'강남스타일'을 부른 가수는?",
    type: 'multiple',
    options: ['싸이', '빅뱅', '엑소', '샤이니'],
    correctIndex: 0,
    timeLimit: 10,
    points: 100,
  },
  {
    id: 'kpop-4',
    text: 'TWICE는 JYP 소속이다',
    type: 'truefalse',
    options: ['O', 'X'],
    correctIndex: 0,
    timeLimit: 10,
    points: 100,
  },
  {
    id: 'kpop-5',
    text: "'Dynamite'를 부른 그룹은?",
    type: 'multiple',
    options: ['BTS', 'EXO', 'SEVENTEEN', 'NCT'],
    correctIndex: 0,
    timeLimit: 10,
    points: 100,
  },
];

// 과학 퀴즈
const scienceQuestions: QuizQuestion[] = [
  {
    id: 'sci-1',
    text: '인체에서 가장 큰 장기는?',
    type: 'multiple',
    options: ['피부', '간', '폐', '심장'],
    correctIndex: 0,
    timeLimit: 15,
    points: 200,
  },
  {
    id: 'sci-2',
    text: '전기를 통하지 않는 물질은?',
    type: 'multiple',
    options: ['고무', '구리', '알루미늄', '철'],
    correctIndex: 0,
    timeLimit: 15,
    points: 200,
  },
  {
    id: 'sci-3',
    text: 'DNA의 이중나선 구조를 발견한 사람은?',
    type: 'multiple',
    options: ['왓슨과 크릭', '아인슈타인', '뉴턴', '다윈'],
    correctIndex: 0,
    timeLimit: 20,
    points: 500,
  },
  {
    id: 'sci-4',
    text: '물은 100도에서 끓는다',
    type: 'truefalse',
    options: ['O', 'X'],
    correctIndex: 0,
    timeLimit: 5,
    points: 100,
  },
  {
    id: 'sci-5',
    text: '광합성을 하는 세포 소기관은?',
    type: 'multiple',
    options: ['엽록체', '미토콘드리아', '리보솜', '골지체'],
    correctIndex: 0,
    timeLimit: 15,
    points: 200,
  },
];

// 퀴즈 템플릿 목록
export const defaultQuizzes: Quiz[] = [
  {
    id: 'korean-geography',
    title: '대한민국 지리 퀴즈',
    description: '대한민국의 지리에 대한 기본 상식을 테스트합니다',
    questions: koreanGeographyQuestions,
    settings: defaultSettings,
    createdAt: new Date().toISOString(),
    createdBy: 'system',
  },
  {
    id: 'general-knowledge',
    title: '일반 상식 퀴즈',
    description: '기본적인 과학 및 상식을 테스트합니다',
    questions: generalKnowledgeQuestions,
    settings: defaultSettings,
    createdAt: new Date().toISOString(),
    createdBy: 'system',
  },
  {
    id: 'movie-trivia',
    title: '영화 퀴즈',
    description: '유명한 영화들에 대한 지식을 테스트합니다',
    questions: movieQuestions,
    settings: defaultSettings,
    createdAt: new Date().toISOString(),
    createdBy: 'system',
  },
  {
    id: 'kpop-quiz',
    title: 'K-POP 퀴즈',
    description: 'K-POP 아티스트와 노래에 대한 퀴즈입니다',
    questions: kpopQuestions,
    settings: defaultSettings,
    createdAt: new Date().toISOString(),
    createdBy: 'system',
  },
  {
    id: 'science-quiz',
    title: '과학 퀴즈',
    description: '과학의 다양한 분야에 대한 문제입니다',
    questions: scienceQuestions,
    settings: defaultSettings,
    createdAt: new Date().toISOString(),
    createdBy: 'system',
  },
];

// 퀴즈 ID로 퀴즈 찾기
export function getQuizById(id: string): Quiz | undefined {
  return defaultQuizzes.find((quiz) => quiz.id === id);
}

// 점수 계산 함수
export function calculateScore(
  isCorrect: boolean,
  timeLeft: number,
  timeLimit: number,
  basePoints: number,
  currentStreak: number,
  settings: QuizSettings
): {
  basePoints: number;
  speedBonus: number;
  streakBonus: number;
  totalPoints: number;
} {
  if (!isCorrect) {
    return { basePoints: 0, speedBonus: 0, streakBonus: 0, totalPoints: 0 };
  }

  // 속도 보너스: 남은 시간 비율 × 50%
  const speedMultiplier = settings.speedBonus ? 1 + (timeLeft / timeLimit) * 0.5 : 1;

  // 연속 정답 보너스: 연속 횟수 × 10% (최대 50%)
  const streakMultiplier = settings.streakBonus ? 1 + Math.min(currentStreak * 0.1, 0.5) : 1;

  const speedBonus = Math.round(basePoints * (speedMultiplier - 1));
  const streakBonus = Math.round(basePoints * (streakMultiplier - 1));
  const totalPoints = Math.round(basePoints * speedMultiplier * streakMultiplier);

  return { basePoints, speedBonus, streakBonus, totalPoints };
}
