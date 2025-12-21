/**
 * 프롬프트 엔지니어링 튜토리얼 용어집
 * IT 비전공자를 위한 쉬운 설명
 */

export interface GlossaryTerm {
  term: string;
  definition: string;
  example?: string;
}

export const glossary: Record<string, GlossaryTerm> = {
  // Chapter 01: 기본 프롬프트 구조
  'messages-api': {
    term: 'Messages API',
    definition: 'AI와 대화하는 표준 방식입니다. API는 프로그램끼리 대화하는 규칙을 뜻합니다.',
    example: '마치 전화기의 통화 규칙처럼, AI와 소통하는 약속된 방법입니다.'
  },

  'token': {
    term: '토큰 (Token)',
    definition: 'AI가 이해하는 최소 글자 단위입니다.',
    example: '한글 1글자는 보통 1-2토큰입니다. "안녕하세요"는 약 5-7토큰 정도입니다.'
  },

  'role': {
    term: '역할 (Role)',
    definition: '메시지를 보내는 사람의 역할입니다.',
    example: 'user = 당신의 메시지, assistant = AI의 답변, system = AI의 기본 설정'
  },

  'content': {
    term: '내용 (Content)',
    definition: '실제 메시지의 텍스트 내용입니다.',
    example: '"안녕하세요"가 content이고, "user"가 role입니다.'
  },

  'system-prompt': {
    term: '시스템 프롬프트 (System Prompt)',
    definition: 'AI의 전체 동작 방식을 정의하는 기본 지시사항입니다. 모든 대화 전에 먼저 실행됩니다.',
    example: '"당신은 친절한 고객 상담원입니다"처럼 AI의 성격과 역할을 정합니다.'
  },

  // Chapter 02: 명확하고 직접적으로
  'equivocation': {
    term: '망설임 (Equivocation)',
    definition: 'AI가 하나의 명확한 답 대신 여러 가능성을 나열하는 것입니다.',
    example: '"최고의 선수는 마이클 조던, 르브론 제임스..." vs "Michael Jordan" (명확)'
  },

  // Chapter 03: 역할 부여하기
  'context': {
    term: '맥락 (Context)',
    definition: 'AI가 알아야 하는 배경정보입니다.',
    example: '당신이 누구인지, 무엇을 원하는지, 어떤 상황인지 등'
  },

  'variable': {
    term: '변수 (Variable)',
    definition: '나중에 다른 내용으로 바꿀 수 있는 자리표시입니다.',
    example: '${동물} → "고양이", "강아지" 등으로 교체 가능'
  },

  'xml-tag': {
    term: 'XML 태그',
    definition: '<이름>내용</이름> 형식으로 정보를 구분하는 방법입니다.',
    example: '<시>봄날의 햇살...</시>처럼 시작과 끝을 명확히 표시'
  },

  // Chapter 04: 데이터와 지시사항 분리하기
  'substitution': {
    term: '치환',
    definition: '한 부분을 다른 것으로 바꾸는 것입니다.',
    example: '템플릿의 ${이름}을 "홍길동"으로 대체하기'
  },

  'template': {
    term: '템플릿 (Template)',
    definition: '미리 만들어둔 틀입니다. 필요한 부분만 바꿔서 반복 사용할 수 있습니다.',
    example: '편지 템플릿에서 수신자 이름만 바꿔가며 여러 명에게 보내기'
  },

  'delimiter': {
    term: '구분자 (Delimiter)',
    definition: '정보의 경계를 표시하는 것입니다.',
    example: '편지에서 "---"을 그어서 본문과 서명을 구분하는 것처럼'
  },

  // Chapter 05: 출력 포맷 지정
  'json': {
    term: 'JSON',
    definition: '정보를 체계적으로 정렬하는 방식입니다.',
    example: '{"이름": "고양이", "나이": 3}처럼 항목별로 정리'
  },

  'prefilling': {
    term: '응답 미리 채우기 (Prefilling)',
    definition: 'AI가 답변을 시작하는 첫 부분을 미리 정해두는 것입니다.',
    example: '<시>부터 바로 시작하도록 지정하면 서론 없이 시만 작성'
  },

  'format': {
    term: '형식 (Format)',
    definition: '정보를 어떤 방식으로 표현할지 정하는 것입니다.',
    example: '시 형식, 목록 형식, 표 형식 등'
  },

  'parameter': {
    term: '매개변수 (Parameter)',
    definition: 'AI를 제어하는 설정값입니다.',
    example: '마치 라디오의 볼륨, 채널 조절 버튼처럼 AI의 동작을 조절'
  },

  // Chapter 06: 사전 인지
  'step-by-step': {
    term: '단계별 사고',
    definition: 'AI가 답변하기 전에 먼저 단계별로 생각하도록 요청하는 것입니다.',
    example: '"먼저 차근차근 생각한 후 답변해주세요"라고 지시하기'
  },

  'thinking-aloud': {
    term: '생각 소리 내기',
    definition: 'AI가 생각 과정을 텍스트로 드러내는 것입니다.',
    example: '답만 주는 게 아니라 "먼저 A를 확인하고, 그 다음 B를..." 과정 보여주기'
  },

  // Chapter 07: Few-Shot 프롬프팅
  'few-shot': {
    term: 'Few-Shot (퓨샷)',
    definition: '2-5개 정도의 적은 예제를 보여주는 방식입니다.',
    example: '"사진을 여러 번 찍듯이(shot)" 예제를 여러 개 보여주기'
  },

  'zero-shot': {
    term: 'Zero-Shot (제로샷)',
    definition: '예제 없이 지시만으로 작업을 수행하는 방식입니다.',
    example: '0개의 예시(0 shot)만으로 바로 작업하기'
  },

  'one-shot': {
    term: 'One-Shot (원샷)',
    definition: '1개의 예제만 보여주는 방식입니다.',
    example: '1번만 예시를 보여주고 따라 하도록 하기'
  },

  'edge-case': {
    term: '엣지 케이스 (Edge Case)',
    definition: '까다롭거나 특이한 예외 상황입니다.',
    example: '"Mixmaster 4000"처럼 분류하기 애매한 특이한 상품명'
  },

  // Chapter 08: 환각 현상
  'hallucination': {
    term: '환각 (Hallucination)',
    definition: 'AI가 존재하지 않는 정보를 마치 사실인 것처럼 만들어내는 현상입니다.',
    example: '"비욘세의 9번째 앨범은..."처럼 실제로는 없는 앨범을 지어내기'
  },

  'evidence': {
    term: '증거 (Evidence)',
    definition: '문서에서 직접 찾은 문장이나 정보입니다.',
    example: '답변하기 전에 "문서 3번째 단락에서 이렇게 말하고 있습니다..." 인용'
  },

  'distractor': {
    term: '산만한 정보 (Distractor)',
    definition: '질문과 관련 없는 정보입니다.',
    example: '동물 법률 문서에서 "Matterport 구독자 수"를 물으면 혼동 유발'
  },

  'escape-hatch': {
    term: '탈출구 (Escape Hatch)',
    definition: 'AI가 "모르겠습니다"라고 답할 수 있는 명시적 허락입니다.',
    example: '"확실히 알고 있을 때만 답해주세요. 모르면 모른다고 말하세요."'
  },

  // Chapter 09: 복잡한 프롬프트
  'task-context': {
    term: '작업 맥락',
    definition: 'AI가 어떤 입장에서 일할지 설명하는 것입니다.',
    example: '"당신은 세금 전문가입니다"처럼 역할과 상황 설정'
  },

  'tone-context': {
    term: '톤 맥락 (어조)',
    definition: 'AI가 어떤 말투로 답변할지 정하는 것입니다.',
    example: '"친근하게", "전문적으로", "간결하게" 등'
  },

  // Chapter 10.1: 프롬프트 체이닝
  'prompt-chaining': {
    term: '프롬프트 체이닝',
    definition: 'AI의 이전 답변을 다음 질문에 포함시켜 연속으로 대화를 이어가는 방법입니다.',
    example: '1. 글 쓰기 → 2. 그 글을 개선해주세요 → 3. 개선된 글을 더 짧게...'
  },

  // Chapter 10.2: 도구 사용
  'function-calling': {
    term: '함수 호출 (Function Calling)',
    definition: 'AI에게 특정 작업을 수행하도록 지시하는 방법입니다.',
    example: '계산기, 데이터베이스 검색, 날씨 조회 등의 도구를 AI가 사용하도록 하기'
  },

  'tool-use': {
    term: '도구 사용 (Tool Use)',
    definition: 'AI가 외부 프로그램이나 서비스를 사용하는 것입니다.',
    example: 'AI가 계산기를 써서 "1,234 × 5,678 = 7,006,652"를 정확히 계산'
  },

  'api-call': {
    term: 'API 호출',
    definition: '인터넷에서 정보를 요청하는 것입니다.',
    example: '날씨 서비스에 "서울 날씨 알려줘"라고 요청하기'
  },

  'operand': {
    term: '피연산자',
    definition: '계산에 사용되는 숫자나 값입니다.',
    example: '2 + 3에서 2와 3이 피연산자 (더하기 대상)'
  },

  'type': {
    term: '타입 (Type)',
    definition: '정보의 종류입니다.',
    example: 'int = 숫자(123), str = 글자("안녕"), bool = 참/거짓(true/false)'
  },

  // Chapter 10.3: RAG
  'rag': {
    term: 'RAG (Retrieval-Augmented Generation)',
    definition: '검색으로 찾은 정보를 활용해 AI가 더 정확하게 답변하도록 하는 기법입니다.',
    example: '질문 → 관련 문서 검색 → 문서 내용을 AI에게 제공 → 정확한 답변 생성'
  },

  'vector-database': {
    term: '벡터 데이터베이스',
    definition: '문서를 숫자로 변환해서 의미가 비슷한 것끼리 찾을 수 있게 저장하는 창고입니다.',
    example: '"서울"과 "수도", "한국 중심"을 같은 의미로 인식해서 찾아줌'
  },

  'embedding': {
    term: '임베딩 (Embedding)',
    definition: '텍스트를 숫자 리스트로 변환하는 과정입니다.',
    example: '"고양이" → [0.2, 0.8, 0.1, ...]처럼 의미를 숫자로 표현'
  },

  'semantic-search': {
    term: '의미 검색 (Semantic Search)',
    definition: '단어가 정확히 일치하지 않아도 의미가 비슷한 문서를 찾는 검색입니다.',
    example: '"파이썬"을 검색하면 "Python", "뱀 언어", "프로그래밍 언어"도 찾음'
  },

  'chunking': {
    term: '청킹 (Chunking)',
    definition: '긴 문서를 적당한 크기로 나누는 것입니다.',
    example: '100페이지 책을 챕터별, 또는 페이지별로 나눠서 저장하기'
  }
};

/**
 * 용어 정의 가져오기
 */
export function getDefinition(key: string): string {
  return glossary[key]?.definition || '';
}

/**
 * 용어와 예시 함께 가져오기
 */
export function getTermWithExample(key: string): { definition: string; example?: string } {
  const term = glossary[key];
  return {
    definition: term?.definition || '',
    example: term?.example
  };
}
