/**
 * 테스트용 공통 데이터
 */

// 이상형 월드컵용 테스트 데이터
export const idealWorldcupTestData = {
  candidates: [
    { name: '후보 1', imageUrl: 'https://picsum.photos/200/200?random=1' },
    { name: '후보 2', imageUrl: 'https://picsum.photos/200/200?random=2' },
    { name: '후보 3', imageUrl: 'https://picsum.photos/200/200?random=3' },
    { name: '후보 4', imageUrl: 'https://picsum.photos/200/200?random=4' },
    { name: '후보 5', imageUrl: 'https://picsum.photos/200/200?random=5' },
    { name: '후보 6', imageUrl: 'https://picsum.photos/200/200?random=6' },
    { name: '후보 7', imageUrl: 'https://picsum.photos/200/200?random=7' },
    { name: '후보 8', imageUrl: 'https://picsum.photos/200/200?random=8' },
  ],
  title: '테스트 월드컵',
};

// 밸런스 게임용 테스트 데이터
export const balanceGameTestData = {
  questions: [
    { optionA: '짜장면', optionB: '짬뽕' },
    { optionA: '여름 휴가', optionB: '겨울 휴가' },
    { optionA: '도시 생활', optionB: '시골 생활' },
  ],
};

// 점심 룰렛용 메뉴 데이터
export const lunchRouletteTestData = {
  menus: [
    '김치찌개',
    '된장찌개',
    '비빔밥',
    '불고기',
    '삼겹살',
    '짜장면',
    '짬뽕',
    '초밥',
    '라멘',
    '피자',
    '햄버거',
    '파스타',
  ],
};

// 팀 나누기용 참가자 데이터
export const teamDividerTestData = {
  participants: [
    '김철수', '이영희', '박민수', '정미영',
    '홍길동', '강호동', '유재석', '이광수',
    '송지효', '전소민', '양세찬', '하하',
  ],
  teamCounts: [2, 3, 4, 6],
};

// 사다리 게임용 데이터
export const ladderGameTestData = {
  players: ['A', 'B', 'C', 'D'],
  results: ['당첨', '꽝', '벌칙', '면제'],
};

// 연봉 계산기용 데이터
export const salaryCalculatorTestData = {
  testCases: [
    { annual: 30000000, expectedNet: { min: 2200000, max: 2400000 } },
    { annual: 50000000, expectedNet: { min: 3500000, max: 3800000 } },
    { annual: 80000000, expectedNet: { min: 5200000, max: 5600000 } },
    { annual: 100000000, expectedNet: { min: 6200000, max: 6800000 } },
  ],
};

// 전월세 계산기용 데이터
export const rentCalculatorTestData = {
  testCases: [
    { deposit: 100000000, monthlyRent: 500000, conversionRate: 4.5 },
    { deposit: 200000000, monthlyRent: 800000, conversionRate: 4.5 },
    { deposit: 50000000, monthlyRent: 1000000, conversionRate: 4.5 },
  ],
};

// 학점 계산기용 데이터
export const gpaCalculatorTestData = {
  courses: [
    { name: '프로그래밍 기초', credits: 3, grade: 'A+' },
    { name: '데이터구조', credits: 3, grade: 'A' },
    { name: '알고리즘', credits: 3, grade: 'B+' },
    { name: '운영체제', credits: 3, grade: 'B' },
    { name: '네트워크', credits: 3, grade: 'A-' },
  ],
  gradePoints: {
    'A+': 4.5,
    'A': 4.0,
    'A-': 3.5,
    'B+': 3.5,
    'B': 3.0,
    'B-': 2.5,
    'C+': 2.5,
    'C': 2.0,
    'C-': 1.5,
    'D+': 1.5,
    'D': 1.0,
    'D-': 0.5,
    'F': 0,
  },
};

// 주민번호 검증기용 테스트 데이터
export const idValidatorTestData = {
  validFormats: [
    '000101-3000001', // 2000년생 남성
    '990101-1000001', // 1999년생 남성
    '850101-2000001', // 1985년생 여성
  ],
  invalidFormats: [
    '000000-0000000', // 잘못된 날짜
    '991301-1000001', // 13월
    '990132-1000001', // 32일
    'abcdef-1234567', // 문자 포함
  ],
};

// 실시간 투표용 데이터
export const liveVotingTestData = {
  voteTitle: '오늘의 점심 메뉴',
  options: ['한식', '중식', '양식', '일식'],
};

// 공동 주문용 데이터
export const groupOrderTestData = {
  restaurant: '맛있는 치킨집',
  menu: [
    { name: '후라이드', price: 18000 },
    { name: '양념', price: 19000 },
    { name: '반반', price: 19000 },
    { name: '콜라 1.5L', price: 2500 },
  ],
  participants: ['철수', '영희', '민수', '미영'],
};

// 더치페이용 데이터
export const dutchPayTestData = {
  participants: ['철수', '영희', '민수', '미영'],
  expenses: [
    { payer: '철수', amount: 50000, description: '저녁 식사' },
    { payer: '영희', amount: 30000, description: '카페' },
    { payer: '민수', amount: 20000, description: '택시비' },
  ],
};

// 초성 퀴즈용 데이터
export const chosungQuizTestData = {
  words: [
    { answer: '사과', chosung: 'ㅅㄱ' },
    { answer: '바나나', chosung: 'ㅂㄴㄴ' },
    { answer: '포도', chosung: 'ㅍㄷ' },
    { answer: '딸기', chosung: 'ㄸㄱ' },
  ],
};

// 빙고 게임용 데이터
export const bingoGameTestData = {
  items: [
    '자바스크립트', '타입스크립트', '리액트', '뷰',
    '앵귤러', '노드', '익스프레스', '몽고DB',
    'PostgreSQL', 'MySQL', 'Redis', 'Docker',
    'Kubernetes', 'AWS', 'GCP', 'Azure',
    'Git', 'GitHub', 'GitLab', 'Jenkins',
    'CI/CD', 'TDD', 'Agile', 'Scrum', '코드리뷰',
  ],
  gridSize: 5,
};

// 학생 네트워크용 데이터
export const studentNetworkTestData = {
  students: [
    { name: '김철수', group: 'A' },
    { name: '이영희', group: 'A' },
    { name: '박민수', group: 'B' },
    { name: '정미영', group: 'B' },
    { name: '홍길동', group: 'C' },
  ],
  relations: [
    { from: '김철수', to: '이영희', type: 'friend' },
    { from: '박민수', to: '정미영', type: 'friend' },
    { from: '김철수', to: '박민수', type: 'classmate' },
  ],
};
