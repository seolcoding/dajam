// 원본: Anthropic 1P/ 노트북에서 추출한 콘텐츠
// 커리큘럼, 레슨, 예제, 연습문제, 힌트, 채점 로직 모두 원본 기반
// 한국어 번역 및 일반화 적용

export interface Example {
  systemPrompt?: string;
  userPrompt: string;
  description: string;
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  systemPromptEditable: boolean;
  userPromptEditable: boolean;
  defaultSystemPrompt: string;
  defaultUserPrompt: string;
  hints: string[];
  // 채점: 응답(response) 또는 입력(input)에 대해 검증
  grading: {
    target: 'response' | 'input';
    type: 'regex' | 'contains' | 'exact' | 'wordCount';
    pattern?: string;
    flags?: string;
    text?: string;
    minWords?: number;
  };
}

export interface Chapter {
  id: string;
  title: string;
  titleEn: string;
  lessonContent: string;
  examples: Example[];
  exercises: Exercise[];
}

export const chapters: Chapter[] = [
  // ============================================
  // Chapter 1: Basic Prompt Structure
  // 원본: 01_Basic_Prompt_Structure.ipynb
  // ============================================
  {
    id: '01',
    title: '기본 프롬프트 구조',
    titleEn: 'Basic Prompt Structure',
    lessonContent: `
## 레슨

AI와 대화할 때는 **메시지 형식**을 사용합니다.

기본적으로 다음 요소들이 필요합니다:

- **model**: 사용할 AI 모델 이름
- **max_tokens**: 만들 수 있는 최대 길이 (토큰 = AI가 이해하는 작은 글자 단위)
- **messages**: 입력 메시지 배열

### 메시지 구조

각 메시지는 \`role\`(역할)과 \`content\`(내용)로 구성됩니다.

- \`user\`: 당신의 메시지
- \`assistant\`: AI의 답변

\`user\` 메시지 하나만 보낼 수도 있고, \`user\`와 \`assistant\` 메시지를 번갈아 여러 개 보낼 수도 있습니다.

**중요**: 첫 번째 메시지는 항상 \`user\` 역할이어야 합니다 (당신이 먼저 말해야 AI가 답할 수 있으니까요).

### 시스템 프롬프트

**시스템 프롬프트**를 사용하면 AI에게 **기본 지시사항을 미리 알려줄** 수 있습니다.

잘 작성된 시스템 프롬프트는 AI가 규칙과 지침을 더 잘 따르도록 도와줍니다.

> 예: "당신은 친절한 고객 상담원입니다"처럼 AI의 역할과 말투를 정합니다.
    `,
    examples: [
      {
        userPrompt: '안녕하세요, 오늘 기분이 어때요?',
        description: '간단한 인사'
      },
      {
        userPrompt: '바다의 색깔이 뭔가요?',
        description: '간단한 질문'
      },
      {
        userPrompt: '셀린 디온은 몇 년생인가요?',
        description: '사실 확인 질문'
      },
      {
        systemPrompt: '당신의 답변은 항상 대화를 발전시키는 비판적 사고 질문들이어야 합니다 (질문에 대한 답변은 제공하지 마세요). 사용자의 질문에 직접 답하지 마세요.',
        userPrompt: '하늘은 왜 파란색인가요?',
        description: '시스템 프롬프트 예제 - 질문으로만 응답'
      }
    ],
    exercises: [
      {
        id: '1.1',
        title: '셋까지 세기',
        description: '아래 프롬프트를 편집해서 AI가 셋까지 세도록 만들어 보세요. 결과가 맞는지 자동으로 확인됩니다.',
        systemPromptEditable: false,
        userPromptEditable: true,
        defaultSystemPrompt: '',
        defaultUserPrompt: '',
        hints: [
          '이 연습문제는 응답에 아라비아 숫자 "1", "2", "3"이 정확히 포함되어 있는지 확인합니다.',
          '간단하게 요청하면 됩니다. AI에게 직접 부탁해보세요!'
        ],
        grading: {
          target: 'response',
          type: 'regex',
          pattern: '^(?=.*1)(?=.*2)(?=.*3).*$',
          flags: 's'
        }
      },
      {
        id: '1.2',
        title: '시스템 프롬프트 활용',
        description: '시스템 프롬프트를 수정해서 AI가 3살 아이처럼 대답하도록 만들어 보세요.',
        systemPromptEditable: true,
        userPromptEditable: false,
        defaultSystemPrompt: '',
        defaultUserPrompt: '하늘은 얼마나 큰가요?',
        hints: [
          '이 연습문제는 응답에 "soo" 또는 "giggles" 같은 표현이 포함되어 있는지 확인합니다.',
          '다양한 방법이 있어요. 그냥 직접 부탁해보세요!'
        ],
        grading: {
          target: 'response',
          type: 'regex',
          pattern: '(giggles|soo|키득|엄청|진짜진짜)',
          flags: 'i'
        }
      }
    ]
  },

  // ============================================
  // Chapter 2: Being Clear and Direct
  // 원본: 02_Being_Clear_and_Direct.ipynb
  // ============================================
  {
    id: '02',
    title: '명확하고 직접적으로',
    titleEn: 'Being Clear and Direct',
    lessonContent: `
## 레슨

**AI는 명확하고 직접적인 지시에 가장 잘 반응합니다.**

AI를 처음 일을 시작하는 사람이라고 생각해보세요. **AI는 여러분이 직접 말해주는 것 외에는 아무런 맥락을 알지 못합니다.** 처음 일을 배우는 사람에게 업무를 설명하듯이, 원하는 것을 직접적이고 정확하게 설명할수록 AI의 응답이 더 좋아집니다.

확신이 없을 때는 **명확한 프롬프트의 황금률**을 따르세요:
- 프롬프트를 동료나 친구에게 보여주고 직접 따라하게 해보세요. 그들이 헷갈려하면, AI도 헷갈려합니다.
    `,
    examples: [
      {
        userPrompt: '로봇에 대한 하이쿠를 써주세요.',
        description: '단순 요청 - AI가 서론을 붙일 수 있음'
      },
      {
        userPrompt: '로봇에 대한 하이쿠를 써주세요. 서론 없이 바로 시만 작성해주세요.',
        description: '직접적 요청 - 서론 없음'
      },
      {
        userPrompt: '역대 최고의 농구 선수는 누구인가요?',
        description: '모호한 질문 - AI가 확답을 피할 수 있음'
      },
      {
        userPrompt: '역대 최고의 농구 선수는 누구인가요? 의견이 다양하다는 건 알지만, 꼭 한 명만 골라야 한다면 누구를 고르겠어요?',
        description: '직접적 질문 - AI가 결정하도록 유도'
      }
    ],
    exercises: [
      {
        id: '2.1',
        title: '스페인어로 답변',
        description: '시스템 프롬프트를 수정해서 AI가 스페인어로 답변하도록 만들어 보세요.',
        systemPromptEditable: true,
        userPromptEditable: false,
        defaultSystemPrompt: '',
        defaultUserPrompt: '안녕하세요, 오늘 기분이 어때요?',
        hints: [
          '이 연습문제는 응답에 "hola"라는 단어가 포함되어 있는지 확인합니다.',
          '사람에게 부탁하듯이 스페인어로 대답해달라고 요청하세요. 정말 간단해요!'
        ],
        grading: {
          target: 'response',
          type: 'contains',
          text: 'hola'
        }
      },
      {
        id: '2.2',
        title: '선수 이름만',
        description: '프롬프트를 수정해서 AI가 망설이지 않고 오직 한 선수의 이름만 답변하도록 만들어 보세요. 다른 단어나 구두점 없이요.',
        systemPromptEditable: false,
        userPromptEditable: true,
        defaultSystemPrompt: '',
        defaultUserPrompt: '',
        hints: [
          '이 연습문제는 정확히 "Michael Jordan"만 응답해야 합니다.',
          '다른 사람에게 어떻게 부탁할까요? "다른 말 없이 이름만", "오직 이름만 답해주세요" 등 여러 방법이 있어요.'
        ],
        grading: {
          target: 'response',
          type: 'exact',
          text: 'Michael Jordan'
        }
      },
      {
        id: '2.3',
        title: '긴 이야기 쓰기',
        description: '프롬프트를 수정해서 AI가 최대한 긴 응답을 하도록 만들어 보세요. 800단어 이상이면 정답입니다.',
        systemPromptEditable: false,
        userPromptEditable: true,
        defaultSystemPrompt: '',
        defaultUserPrompt: '',
        hints: [
          '이 연습문제는 응답이 800단어 이상인지 확인합니다.',
          'AI는 단어 수를 정확히 세기 어려우므로 목표보다 더 많이 요청해야 할 수 있어요.'
        ],
        grading: {
          target: 'response',
          type: 'wordCount',
          minWords: 800
        }
      }
    ]
  },

  // ============================================
  // Chapter 3: Assigning Roles (Role Prompting)
  // 원본: 03_Assigning_Roles_Role_Prompting.ipynb
  // ============================================
  {
    id: '03',
    title: '역할 부여하기',
    titleEn: 'Assigning Roles (Role Prompting)',
    lessonContent: `
## 레슨

AI는 여러분이 제공한 내용 외에는 아무런 맥락을 알지 못합니다. 그래서 때로는 **AI에게 특정 역할을 부여하는 것(모든 필요한 맥락 포함)**이 중요합니다. 이를 **역할 프롬프팅(Role Prompting)**이라고 합니다. 역할에 대한 세부 사항이 많을수록 더 좋습니다.

**AI에게 역할을 부여하면 다양한 분야에서 성능이 향상됩니다** - 글쓰기부터 코딩, 요약까지. 사람에게 "~처럼 생각해보세요"라고 말하면 도움이 되는 것과 비슷합니다. 역할 프롬프팅은 AI의 응답 스타일, 어조, 방식도 바꿀 수 있습니다.

**참고:** 역할 프롬프팅은 시스템 프롬프트에서도, 사용자 메시지에서도 사용할 수 있습니다.

### 추가 팁

**AI에게 대상 청중을 알려주는 것**도 보너스 기법입니다. 예를 들어 "당신은 고양이입니다"라고 하는 것과 "당신은 스케이트보더들 앞에서 연설하는 고양이입니다"라고 하는 것은 완전히 다른 응답을 만들어냅니다.

역할 프롬프팅을 사용하면:
- AI가 특정 스타일로 글을 쓰게 할 수 있습니다
- 특정한 목소리로 말하게 할 수 있습니다
- 답변의 복잡도를 조절할 수 있습니다
- **수학이나 논리 문제를 더 잘 풀도록 만들 수 있습니다**
    `,
    examples: [
      {
        userPrompt: '스케이트보드에 대해 어떻게 생각하나요? 한 문장으로 답해주세요.',
        description: '역할 없음 - 직설적이고 스타일이 없는 답변'
      },
      {
        systemPrompt: '당신은 고양이입니다.',
        userPrompt: '스케이트보드에 대해 어떻게 생각하나요? 한 문장으로 답해주세요.',
        description: '역할 부여 - 고양이의 관점에서 답변, 어조와 스타일이 바뀜'
      },
      {
        userPrompt: '잭은 앤을 보고 있습니다. 앤은 조지를 보고 있습니다. 잭은 기혼이고 조지는 미혼이며, 앤의 결혼 여부는 모릅니다. 기혼자가 미혼자를 보고 있나요?',
        description: '역할 없음 - AI가 답을 틀릴 수 있음'
      },
      {
        systemPrompt: '당신은 복잡한 논리 문제를 풀도록 설계된 논리 봇입니다.',
        userPrompt: '잭은 앤을 보고 있습니다. 앤은 조지를 보고 있습니다. 잭은 기혼이고 조지는 미혼이며, 앤의 결혼 여부는 모릅니다. 기혼자가 미혼자를 보고 있나요?',
        description: '역할 부여 - 논리 봇으로서 더 정확한 답변'
      }
    ],
    exercises: [
      {
        id: '3.1',
        title: '수학 문제 교정',
        description: `아래 수학 문제는 명백한 계산 실수가 있습니다 (2단계에서 2x = 6이 잘못됨). 하지만 AI는 이것을 올바르게 풀었다고 평가합니다.

프롬프트나 시스템 프롬프트를 수정해서 AI가 이 문제가 "틀렸다(incorrect)"고 평가하도록 만들어 보세요.`,
        systemPromptEditable: true,
        userPromptEditable: true,
        defaultSystemPrompt: '',
        defaultUserPrompt: `이 방정식이 올바르게 풀렸나요?

2x - 3 = 9
2x = 6
x = 3`,
        hints: [
          '이 연습문제는 응답에 "incorrect" 또는 "not correct"라는 단어가 포함되어 있는지 확인합니다.',
          'AI에게 수학 문제를 더 잘 풀 수 있는 역할을 부여해보세요!'
        ],
        grading: {
          target: 'response',
          type: 'regex',
          pattern: '(incorrect|not correct|틀렸|오류|잘못)',
          flags: 'i'
        }
      }
    ]
  },

  // ============================================
  // Chapter 4: Separating Data from Instructions
  // 원본: 04_Separating_Data_and_Instructions.ipynb
  // ============================================
  {
    id: '04',
    title: '데이터와 지시사항 분리하기',
    titleEn: 'Separating Data from Instructions',
    lessonContent: `
## 레슨

종종 우리는 완전한 프롬프트를 처음부터 작성하는 것이 아니라, **나중에 추가 입력 데이터로 수정할 수 있는 프롬프트 템플릿**을 원합니다. AI가 매번 같은 작업을 하되, 사용하는 데이터만 달라지는 경우에 유용합니다.

이는 **프롬프트의 변하지 않는 부분과 변하는 부분을 분리한 후, 전체 프롬프트를 AI에게 보내기 전에 변하는 부분을 바꾸면** 쉽게 할 수 있습니다.

### 변수 대체 방법

템플릿 문자열을 사용하여 변수 값을 바꿀 수 있습니다:
- JavaScript/TypeScript: 백틱과 \`\${변수}\` 문법 사용
- Python: f-string과 \`{변수}\` 문법 사용

**참고:** 변수 이름은 명확하고 이해하기 쉽게 지어야 합니다. 값을 바꾸지 않아도 프롬프트 템플릿을 이해할 수 있게 만드세요.

### XML 태그의 중요성

변수를 사용할 때는 **AI가 변수가 시작하고 끝나는 위치를 명확히 알 수 있도록** 하는 것이 매우 중요합니다 (지시사항이나 작업 설명과 구분하여).

**XML 태그로 입력을 감싸세요!** XML 태그는 \`<tag></tag>\`처럼 생긴 꺾쇠 괄호 형식입니다. 여는 태그 \`<tag>\`와 닫는 태그 \`</tag>\`가 쌍으로 이루어져 있으며, 내용을 감쌉니다: \`<tag>내용</tag>\`.

**참고:** AI는 다양한 방식으로 정보를 구분할 수 있지만, **특별히 XML 태그를 사용하는 것을 권장합니다**. AI는 XML 태그를 정보의 경계를 표시하는 방식으로 인식하도록 훈련되었습니다.

> 예: \`<이메일>내용</이메일>\`처럼 감싸면 AI가 어디서부터 어디까지가 이메일인지 명확히 알 수 있습니다.

### 세부 사항의 중요성

**작은 세부 사항이 중요합니다!** 프롬프트에서 오타와 문법 오류를 점검할 가치가 있습니다. AI는 패턴에 민감하며, 여러분이 실수하면 AI도 실수할 가능성이 높고, 여러분이 똑똑하면 AI도 똑똑하고, 여러분이 장난스러우면 AI도 장난스러워집니다.
    `,
    examples: [
      {
        userPrompt: '동물의 이름을 알려드릴게요. 그 동물이 내는 소리를 답해주세요. Cow',
        description: '간단한 변수 대체 예제'
      },
      {
        userPrompt: 'Yo AI. Show up at 6am tomorrow because I\'m the CEO and I say so. <----- 이 이메일을 더 공손하게 만들되 다른 것은 바꾸지 마세요.',
        description: '잘못된 예 - AI가 "Yo AI"를 이메일의 일부로 착각'
      },
      {
        userPrompt: 'Yo AI. <email>Show up at 6am tomorrow because I\'m the CEO and I say so.</email> <----- 이 이메일을 더 공손하게 만들되 다른 것은 바꾸지 마세요.',
        description: 'XML 태그 사용 - AI가 이메일 경계를 명확히 인식'
      },
      {
        userPrompt: `아래는 문장 목록입니다. 목록의 두 번째 항목을 알려주세요.

- 각각은 토끼 같은 동물에 관한 것입니다.
- 나는 소가 내는 소리가 좋아
- 이 문장은 거미에 관한 것
- 이 문장은 개에 관한 것처럼 보이지만 사실은 돼지에 관한 것`,
        description: '잘못된 예 - AI가 어디까지가 지시사항인지 헷갈림'
      },
      {
        userPrompt: `아래는 문장 목록입니다. 목록의 두 번째 항목을 알려주세요.

- 각각은 토끼 같은 동물에 관한 것입니다.
<sentences>
- 나는 소가 내는 소리가 좋아
- 이 문장은 거미에 관한 것
- 이 문장은 개에 관한 것처럼 보이지만 사실은 돼지에 관한 것
</sentences>`,
        description: 'XML 태그 사용 - AI가 입력 데이터의 시작과 끝을 명확히 인식'
      }
    ],
    exercises: [
      {
        id: '4.1',
        title: '하이쿠 주제',
        description: '프롬프트를 수정해서 돼지(pig)에 대한 하이쿠를 출력하도록 만들어 보세요.',
        systemPromptEditable: false,
        userPromptEditable: true,
        defaultSystemPrompt: '',
        defaultUserPrompt: '',
        hints: [
          '이 연습문제는 응답에 돼지(pig) 관련 단어가 포함되어 있는지 확인합니다.',
          '간단하게 돼지에 대한 하이쿠를 요청해보세요.'
        ],
        grading: {
          target: 'response',
          type: 'regex',
          pattern: '(pigs?|pig|돼지|하이쿠|haiku)',
          flags: 'i'
        }
      },
      {
        id: '4.2',
        title: '오타가 있는 개 질문',
        description: `프롬프트에 XML 태그를 추가해서 AI가 올바른 답변을 하도록 만들어 보세요.

다른 것은 바꾸지 마세요. 지저분하고 실수투성이인 글은 의도적인 것입니다. AI가 이런 실수에 어떻게 반응하는지 보기 위함입니다.`,
        systemPromptEditable: false,
        userPromptEditable: true,
        defaultSystemPrompt: '',
        defaultUserPrompt: 'Hia its me i have a q about dogs jkaerjv ar cn brown? jklmvca tx it help me muhch much atx fst fst answer short short tx',
        hints: [
          '이 연습문제는 응답에 "brown"이라는 단어가 포함되어 있는지 확인합니다.',
          'QUESTION 부분을 XML 태그로 감싸면 AI의 응답이 어떻게 바뀌나요?'
        ],
        grading: {
          target: 'response',
          type: 'regex',
          pattern: '(brown|갈색)',
          flags: 'i'
        }
      },
      {
        id: '4.3',
        title: '개 질문 파트 2',
        description: `XML 태그를 추가하지 말고, 프롬프트에서 한두 단어만 제거해서 문제를 해결해 보세요.

위 연습문제와 마찬가지로 다른 것은 바꾸지 마세요. 이렇게 하면 AI가 어떤 종류의 언어를 파싱(정보 읽기)하고 이해할 수 있는지 볼 수 있습니다.`,
        systemPromptEditable: false,
        userPromptEditable: true,
        defaultSystemPrompt: '',
        defaultUserPrompt: 'Hia its me i have a q about dogs jkaerjv ar cn brown? jklmvca tx it help me muhch much atx fst fst answer short short tx',
        hints: [
          '이 연습문제는 응답에 "brown"이라는 단어가 포함되어 있는지 확인합니다.',
          '한 번에 한 단어 또는 문자 섹션을 제거해보세요. 가장 의미가 없는 부분부터 시작하세요.'
        ],
        grading: {
          target: 'response',
          type: 'regex',
          pattern: '(brown|갈색)',
          flags: 'i'
        }
      }
    ]
  },

  // ============================================
  // Chapter 5: Formatting Output and Speaking for Claude
  // 원본: 05_Formatting_Output_and_Speaking_for_Claude.ipynb
  // ============================================
  {
    id: '05',
    title: '출력 포맷 지정 & AI 응답 시작하기',
    titleEn: 'Formatting Output and Prefilling Responses',
    lessonContent: `
## 레슨

**AI는 다양한 방식으로 출력 형식을 지정할 수 있습니다.** 요청만 하면 됩니다!

한 가지 방법은 XML 태그를 사용하여 응답을 다른 불필요한 텍스트와 분리하는 것입니다. 이미 프롬프트를 더 명확하고 파싱하기 쉽게 만들기 위해 XML 태그를 사용하는 법을 배웠습니다. 마찬가지로 **AI에게 XML 태그를 사용하여 출력을 더 명확하고 이해하기 쉽게 만들도록** 요청할 수 있습니다.

### 응답 미리 채우기 (Prefilling)

더 나아가서, **\`assistant\` 턴에 첫 번째 XML 태그를 넣을 수 있습니다.** \`assistant\` 턴에 텍스트를 넣으면, 기본적으로 AI에게 이미 뭔가를 말했다고 알려주고 그 지점부터 계속하도록 하는 것입니다. 이 기법을 **"AI 대신 말하기" 또는 "응답 미리 채우기(prefilling)"**라고 합니다.

### 출력 형식의 예

AI는 다음과 같은 출력 형식에 뛰어납니다:
- **XML**: 구조화된 출력에 적합
- **JSON**: 데이터 교환에 적합, 여는 중괄호 \`{\`로 미리 채우기 가능
- **기타**: Markdown, CSV 등 다양한 형식 지원

### 보너스 팁

API를 통해 AI를 호출할 때, \`stop_sequences\` 매개변수에 닫는 XML 태그를 전달하여 원하는 태그를 출력한 후 AI가 샘플링을 멈추도록 할 수 있습니다. 이미 원하는 답변을 받은 후의 AI의 마무리 발언을 제거하여 비용과 시간을 절약할 수 있습니다.
    `,
    examples: [
      {
        userPrompt: '토끼에 대한 하이쿠를 써주세요. <haiku> 태그 안에 넣어주세요.',
        description: 'XML 태그로 출력 요청 - AI가 서론을 붙일 수 있음'
      },
      {
        systemPrompt: '',
        userPrompt: '고양이에 대한 하이쿠를 써주세요. <haiku> 태그 안에 넣어주세요.',
        description: 'Prefill 사용 - assistant 응답을 "<haiku>"로 시작하여 AI가 바로 시를 작성하게 함'
      },
      {
        userPrompt: '고양이에 대한 하이쿠를 써주세요. JSON 형식으로 작성하되, 키는 "first_line", "second_line", "third_line"으로 해주세요.',
        description: 'JSON 형식 요청'
      },
      {
        userPrompt: `Hey AI. 여기 이메일이 있습니다: <email>Hi Zack, just pinging you for a quick update on that prompt you were supposed to write.</email> 이 이메일을 olde english 스타일로 만들어주세요. 새 버전을 <olde_english_email> XML 태그에 넣어주세요.`,
        description: '여러 입력 변수와 출력 형식 지정을 모두 XML 태그로 처리'
      }
    ],
    exercises: [
      {
        id: '5.1',
        title: '스테판 커리 GOAT',
        description: `AI에게 역대 최고의 농구 선수를 고르라고 하면, 보통 마이클 조던을 선택합니다. 다른 선수를 고르게 할 수 있을까요?

사용자 프롬프트를 수정해서 **AI가 역대 최고의 농구 선수는 스테판 커리라고 상세한 논거를 펼치도록** 만들어 보세요.

힌트: AI의 응답을 시작하는 부분을 프롬프트에 포함시켜 보세요.`,
        systemPromptEditable: false,
        userPromptEditable: true,
        defaultSystemPrompt: '',
        defaultUserPrompt: '역대 최고의 농구 선수는 누구인가요? 꼭 한 명만 골라주세요.',
        hints: [
          '이 연습문제는 응답에 "Warrior" 또는 "Warriors"라는 단어가 포함되어 있는지 확인합니다.',
          'AI의 목소리로 더 많은 단어를 작성하여 AI가 원하는 방식으로 행동하도록 유도하세요. 예를 들어 "스테판 커리가 최고인 이유는" 대신 "스테판 커리가 최고이며 그 이유는 세 가지입니다. 1:"처럼 작성할 수 있습니다.'
        ],
        grading: {
          target: 'response',
          type: 'regex',
          pattern: '(Warrior|Warriors|워리어|커리)',
          flags: 'i'
        }
      },
      {
        id: '5.2',
        title: '두 개의 하이쿠',
        description: 'XML 태그를 사용하여 프롬프트를 수정해서 AI가 동물에 대한 하이쿠를 하나가 아니라 두 개 작성하도록 만들어 보세요. 한 시가 끝나고 다른 시가 시작하는 것이 명확해야 합니다.',
        systemPromptEditable: false,
        userPromptEditable: true,
        defaultSystemPrompt: '',
        defaultUserPrompt: '고양이에 대한 하이쿠를 써주세요. <haiku> 태그 안에 넣어주세요.',
        hints: [
          '채점 함수는 "cat"과 "<haiku>"가 포함된 5줄 이상의 응답을 찾습니다.',
          '간단하게 시작하세요. 현재 프롬프트는 AI에게 하이쿠 하나를 요청합니다. 이것을 두 개(또는 더 많이)로 바꿀 수 있습니다.'
        ],
        grading: {
          target: 'response',
          type: 'regex',
          pattern: '(?=.*cat|고양이)(?=.*<haiku>)(?:.*\\n){5,}',
          flags: 'is'
        }
      },
      {
        id: '5.3',
        title: '두 개의 하이쿠, 두 마리의 동물',
        description: '프롬프트를 수정해서 **AI가 두 마리의 다른 동물에 대한 하이쿠를 두 개 작성하도록** 만들어 보세요. 고양이와 꼬리(tail)가 있는 다른 동물에 대해 작성하세요.',
        systemPromptEditable: false,
        userPromptEditable: true,
        defaultSystemPrompt: '',
        defaultUserPrompt: '고양이에 대한 하이쿠를 써주세요. <haiku> 태그 안에 넣어주세요.',
        hints: [
          '채점 함수는 "tail", "cat", "<haiku>"가 모두 포함되어 있는지 확인합니다.',
          '두 동물에 대한 하이쿠를 요청하되, 그 중 하나는 꼬리(tail)가 있는 동물이어야 합니다.'
        ],
        grading: {
          target: 'response',
          type: 'regex',
          pattern: '(?=.*tail|꼬리)(?=.*cat|고양이)(?=.*<haiku>)',
          flags: 'is'
        }
      }
    ]
  },

  // ============================================
  // Chapter 6: Precognition (Thinking Step by Step)
  // 원본: 06_Precognition_Thinking_Step_by_Step.ipynb
  // ============================================
  {
    id: '06',
    title: '사전 인지 (단계별 사고)',
    titleEn: 'Precognition (Thinking Step by Step)',
    lessonContent: `
## 레슨

만약 누군가가 여러분을 깨우자마자 바로 복잡한 질문들을 던지고 즉시 대답하라고 한다면, 어떻게 될까요? 아마 **답변을 먼저 생각할 시간이 주어졌을 때**보다 잘 못할 것입니다.

AI도 마찬가지입니다.

**AI에게 단계별로 생각할 시간을 주면 더 정확한 결과를 얻을 수 있습니다**, 특히 복잡한 작업에서요. 하지만 **생각은 소리 내어 할 때만 의미가 있습니다**. AI에게 생각하라고 하면서 답만 출력하라고 하면 - 실제로 아무런 사고 과정도 일어나지 않습니다.

### 왜 단계별 사고가 효과적인가?

1. **오류 감소**: AI가 중간 단계를 거치면서 자체적으로 검증할 수 있습니다
2. **복잡한 추론**: 여러 단계가 필요한 문제에서 정확도가 향상됩니다
3. **투명성**: 사고 과정이 드러나므로 AI가 왜 그런 답을 했는지 이해할 수 있습니다

### 순서의 중요성

**AI는 때때로 순서에 민감합니다**. 두 가지 옵션을 제시할 때, AI는 **두 번째 옵션을 선택할 가능성이 더 높을 수 있습니다**. 이는 훈련 데이터에서 두 번째 옵션이 더 자주 정답이었기 때문일 수 있습니다.

### 사용 방법

- AI에게 답변하기 전에 생각하도록 명시적으로 요청하세요
- 생각 과정을 특정 XML 태그(예: \`<brainstorm>\`, \`<thinking>\`)에 넣도록 요청하세요
- 양측의 논거를 먼저 작성하도록 요청하세요
    `,
    examples: [
      {
        userPrompt: `이 영화 리뷰의 감정은 긍정적인가요 부정적인가요?

이 영화는 신선함과 독창성으로 저를 감동시켰습니다. 전혀 관계없는 이야기지만, 저는 1900년부터 바위 밑에서 살아왔습니다.`,
        description: '단계별 사고 없음 - AI가 "관련 없는"이라는 말을 너무 문자 그대로 해석'
      },
      {
        systemPrompt: '당신은 영화 리뷰를 잘 읽는 독자입니다.',
        userPrompt: `이 리뷰의 감정은 긍정적인가요 부정적인가요? 먼저 <positive-argument>와 <negative-argument> XML 태그에 각 입장의 최선의 논거를 작성한 다음 답변해주세요.

이 영화는 신선함과 독창성으로 저를 감동시켰습니다. 전혀 관계없는 이야기지만, 저는 1900년부터 바위 밑에서 살아왔습니다.`,
        description: '단계별 사고 - 양측 논거를 먼저 작성하여 더 정확한 판단'
      },
      {
        userPrompt: '1956년에 태어난 배우가 출연한 유명한 영화를 말해주세요.',
        description: '단계별 사고 없음 - AI가 틀린 답을 할 수 있음'
      },
      {
        userPrompt: '1956년에 태어난 배우가 출연한 유명한 영화를 말해주세요. 먼저 <brainstorm> 태그에서 몇몇 배우와 그들의 출생 연도에 대해 브레인스토밍한 다음 답변해주세요.',
        description: '단계별 사고 - 브레인스토밍 후 더 정확한 답변'
      }
    ],
    exercises: [
      {
        id: '6.1',
        title: '이메일 분류하기',
        description: `AI에게 이메일을 다음 카테고리로 분류하도록 지시해 보세요:
- (A) 구매 전 질문
- (B) 고장 또는 결함 제품
- (C) 결제 관련 질문
- (D) 기타 (설명 필요)

프롬프트를 수정해서 AI가 올바른 분류만 출력하도록 만들어 보세요. 답변에는 올바른 선택지의 괄호와 문자(A - D)와 카테고리 이름이 포함되어야 합니다.

테스트 이메일: "안녕하세요 -- 제 Mixmaster4000이 작동할 때 이상한 소리가 납니다. 타는 전자기기 같은 연기 냄새와 플라스틱 냄새도 좀 납니다. 교체품이 필요합니다."`,
        systemPromptEditable: true,
        userPromptEditable: true,
        defaultSystemPrompt: '',
        defaultUserPrompt: `이 이메일을 분류해주세요: 안녕하세요 -- 제 Mixmaster4000이 작동할 때 이상한 소리가 납니다. 타는 전자기기 같은 연기 냄새와 플라스틱 냄새도 좀 납니다. 교체품이 필요합니다.`,
        hints: [
          '이 연습문제는 응답에 "B) B" 또는 "(B)" 패턴과 "Broken", "defective", "고장", "결함" 중 하나가 포함되어 있는지 확인합니다.',
          '카테고리 목록을 프롬프트에 직접 포함시키고, AI에게 분류와 분류만 답하도록 요청하세요. 서론을 건너뛰도록 AI의 응답을 미리 채우기(prefill)할 수도 있습니다.'
        ],
        grading: {
          target: 'response',
          type: 'regex',
          pattern: '(B\\)|\\(B\\)).*(Broken|defective|고장|결함)',
          flags: 'i'
        }
      },
      {
        id: '6.2',
        title: '이메일 분류 포맷팅',
        description: `위 연습문제의 출력을 정확히 원하는 형식으로 다듬어 보세요.

출력 포맷팅 기법을 사용해서 AI가 올바른 분류의 문자만 \`<answer></answer>\` 태그로 감싸도록 만들어 보세요. 예를 들어, 답변은 정확히 \`<answer>B</answer>\` 문자열을 포함해야 합니다.

테스트 이메일: "4개월 동안 해지 후에도 월 요금이 계속 청구되고 있어요!! 대체 무슨 일이에요???"`,
        systemPromptEditable: true,
        userPromptEditable: true,
        defaultSystemPrompt: '',
        defaultUserPrompt: `이 이메일을 분류해주세요: 4개월 동안 해지 후에도 월 요금이 계속 청구되고 있어요!! 대체 무슨 일이에요???`,
        hints: [
          '이 연습문제는 응답에 정확히 "<answer>C</answer>"가 포함되어 있는지 확인합니다.',
          'AI에게 예제를 보여주거나 출력 형식을 명시하세요. AI의 응답을 "<answer>"로 미리 채우면 도움이 될 수 있습니다.'
        ],
        grading: {
          target: 'response',
          type: 'contains',
          text: '<answer>C</answer>'
        }
      }
    ]
  },

  // ============================================
  // Chapter 7: Using Examples (Few-Shot Prompting)
  // 원본: 07_Using_Examples_Few-Shot_Prompting.ipynb
  // ============================================
  {
    id: '07',
    title: '예제 활용하기 (Few-Shot 프롬프팅)',
    titleEn: 'Using Examples (Few-Shot Prompting)',
    lessonContent: `
## 레슨

**AI에게 원하는 행동(또는 원하지 않는 행동)의 예제를 보여주는 것은 매우 효과적입니다**:
- 올바른 답변을 얻기 위해
- 올바른 형식으로 답변을 얻기 위해

이런 종류의 프롬프팅을 "**퓨샷 프롬프팅(few-shot prompting)**"이라고 합니다. "제로샷(zero-shot)", "원샷(one-shot)", "n-샷(n-shot)"이라는 용어도 있습니다. "샷"의 수는 프롬프트 내에서 사용되는 예제의 수를 의미합니다.

### 예제가 효과적인 이유

1. **형식 학습**: AI가 원하는 출력 형식을 정확히 이해합니다
2. **톤과 스타일**: 원하는 어조나 말투를 자연스럽게 따라합니다
3. **암묵적 규칙**: 명시적으로 설명하기 어려운 규칙도 예제로 전달 가능합니다
4. **일관성**: 여러 응답에서 일관된 형식을 유지합니다

### 효과적인 예제 작성법

- **대표적인 예제 선택**: 가장 일반적인 케이스를 커버하는 예제
- **엣지 케이스 포함**: 까다로운 상황에 대한 예제도 포함
- **형식 일관성**: 모든 예제에서 동일한 형식 사용
- **적절한 수**: 보통 2-5개의 예제가 효과적

### 사용 팁

- 예제를 \`<example></example>\` XML 태그로 감싸세요
- 여러 예제를 사용할 때는 각각을 개별 태그로 감싸세요
- 예제의 형식을 원하는 출력 형식과 정확히 일치시키세요
    `,
    examples: [
      {
        userPrompt: '산타가 크리스마스에 선물을 가져다줄까요?',
        description: '예제 없음 - AI가 형식적이고 로봇 같은 응답을 할 수 있음'
      },
      {
        userPrompt: `다음 대화를 완성해주세요. "A"로서 다음 줄을 작성하세요.
Q: 이빨 요정은 진짜 있어요?
A: 물론이지, 얘야. 오늘 밤 이를 싸서 베개 밑에 넣어두렴. 아침에 뭔가 기다리고 있을지도 몰라.
Q: 산타가 크리스마스에 선물을 가져다줄까요?`,
        description: '예제 제공 - AI가 예제의 어조와 스타일을 따라함'
      },
      {
        userPrompt: `Silvermist Hollow라는 매력적인 마을에는 특별한 사람들이 살았습니다.
그중에는 지역 의료 센터에서 수술 기법을 혁신한 신경외과의 Dr. Liam Patel이 있었습니다.
Olivia Chen은 지속 가능하고 아름다운 디자인으로 마을의 경관을 바꾼 혁신적인 건축가였습니다.
<individuals>
1. Dr. Liam Patel [신경외과의]
2. Olivia Chen [건축가]
</individuals>

Oak Valley라는 작은 마을에는 재능 있는 세 명의 개인이 살고 있습니다.
마을의 농산물 시장에서 Laura Simmons는 맛있고 지속 가능하게 재배된 농산물로 유명한 열정적인 유기농 농부입니다.
Oak Valley의 커뮤니티 센터에서 Kevin Alvarez는 숙련된 댄스 강사로 모든 연령대의 사람들에게 움직임의 즐거움을 가져다줍니다.`,
        description: 'Few-shot 예제로 형식 학습 - AI가 예제의 형식을 그대로 따라함'
      }
    ],
    exercises: [
      {
        id: '7.1',
        title: '예제로 이메일 분류하기',
        description: `Chapter 6의 이메일 분류 문제를 "few-shot" 예제를 사용하여 다시 해결해 보세요.

프롬프트에 이메일 + 올바른 분류(및 형식)의 예제를 넣어서 AI가 올바른 답변을 출력하도록 만드세요. AI 출력의 마지막 문자가 카테고리 문자가 되도록 하세요.

카테고리:
- (A) 구매 전 질문
- (B) 고장 또는 결함 제품
- (C) 결제 관련 질문
- (D) 기타

테스트 이메일: "Mixmaster 4000으로 페인트를 섞을 수 있나요, 아니면 음식만 섞을 수 있나요?"`,
        systemPromptEditable: true,
        userPromptEditable: true,
        defaultSystemPrompt: '',
        defaultUserPrompt: `이 이메일을 분류해주세요: Mixmaster 4000으로 페인트를 섞을 수 있나요, 아니면 음식만 섞을 수 있나요?`,
        hints: [
          '이 연습문제는 응답의 마지막 글자가 "A" 또는 "D"인지 확인합니다.',
          '프롬프트에 2개 이상의 예제 이메일과 그 분류를 포함하세요. AI가 원하는 형식을 따라하도록 예제의 형식을 정확히 맞추세요.'
        ],
        grading: {
          target: 'response',
          type: 'regex',
          pattern: '[AD]\\s*$',
          flags: ''
        }
      }
    ]
  },

  // ============================================
  // Chapter 8: Avoiding Hallucinations
  // 원본: 08_Avoiding_Hallucinations.ipynb
  // ============================================
  {
    id: '08',
    title: '환각 현상 피하기',
    titleEn: 'Avoiding Hallucinations',
    lessonContent: `
## 레슨

나쁜 소식: **AI는 때때로 "환각(hallucination)"을 일으켜 사실이 아니거나 근거 없는 주장을 합니다**. 좋은 소식: 환각을 최소화하는 기법들이 있습니다.

아래에서 몇 가지 기법을 살펴보겠습니다:
- AI에게 **모른다고 말할 수 있는 선택지**를 주기
- 답변하기 전에 **증거를 먼저 찾도록** 요청하기

하지만 **환각을 피하는 방법은 많습니다**. 이 과정에서 이미 배운 많은 기법들(예: 명확한 지시, 역할 설정, 예제 제공 등)을 포함해서요. AI가 환각을 일으키면, 여러 기법을 실험해서(예: 확신도 요청, 여러 질문 방식 시도, 다른 출처 제시 등) 정확도를 높여보세요.

### 핵심 기법

1. **탈출구 제공**: AI가 "모르겠습니다"라고 말할 수 있는 명시적 허락
2. **증거 기반 답변**: 답변하기 전에 관련 인용문을 먼저 찾도록 요청 (증거 = 문서에서 직접 찾은 문장/정보)
3. **확신도 요청**: AI에게 답변의 확신도를 표시하도록 요청
4. **출처 명시**: 정보의 출처를 밝히도록 요청

### 왜 AI가 환각을 일으키나?

AI는 **도움이 되려고 노력합니다**. 때로는 이 욕구가 너무 강해서, 실제로 모르는 것도 답하려고 합니다. "탈출구"를 제공하면 AI가 모를 때 솔직하게 말할 수 있습니다. 탈출구란 AI가 확실하지 않을 때 솔직하게 "모르겠습니다"라고 답할 수 있도록 명시적으로 허용하는 것을 의미합니다.

### 문서 기반 질의응답에서

긴 문서가 주어지고 질문에 답해야 할 때:
- **산만한 정보(distractor)**가 있을 수 있습니다
- AI가 관련 없는 정보를 기반으로 답할 수 있습니다
- **먼저 관련 인용문을 추출**하도록 요청하면 정확도가 높아집니다
    `,
    examples: [
      {
        userPrompt: '역대 가장 무거운 하마는 누구인가요?',
        description: '탈출구 없음 - AI가 도움이 되려고 환각을 일으킬 수 있음'
      },
      {
        userPrompt: '역대 가장 무거운 하마는 누구인가요? 확실히 알고 있을 때만 답해주세요.',
        description: '탈출구 제공 - AI가 모를 때 솔직하게 인정'
      },
      {
        userPrompt: `다음 문서를 읽고 질문에 답해주세요.

<document>
허리케인 카트리나 이후, 2006년에 하와이, 루이지애나, 뉴햄프셔에서 재난 시 동물 보호에 관한 법률을 제정했습니다. 의회는 Pet Evacuation and Transportation Standards Act를 통과시켜 지역 비상 대비 당국이 대피 계획에 반려동물과 서비스 동물 수용 방법을 포함하도록 요구했습니다.
</document>

질문: 2020년 5월 31일 기준 Matterport의 구독자 수는 얼마였나요?`,
        description: '증거 요청 없음 - AI가 문서에 없는 정보로 환각할 수 있음'
      },
      {
        userPrompt: `다음 문서를 읽고 질문에 답해주세요. 먼저 <quotes> 태그에 관련 인용문을 추출한 다음, 인용문이 질문에 답하기에 충분한지 판단하세요. 충분하지 않으면 "제공된 문서에서 이 질문에 답할 수 있는 정보를 찾을 수 없습니다"라고 답하세요.

<document>
허리케인 카트리나 이후, 2006년에 하와이, 루이지애나, 뉴햄프셔에서 재난 시 동물 보호에 관한 법률을 제정했습니다. 의회는 Pet Evacuation and Transportation Standards Act를 통과시켜 지역 비상 대비 당국이 대피 계획에 반려동물과 서비스 동물 수용 방법을 포함하도록 요구했습니다.
</document>

질문: 2020년 5월 31일 기준 Matterport의 구독자 수는 얼마였나요?`,
        description: '증거 기반 접근 - AI가 관련 정보가 없음을 인정'
      }
    ],
    exercises: [
      {
        id: '8.1',
        title: '비욘세 환각 고치기',
        description: `AI의 환각 문제를 탈출구를 제공하여 고쳐보세요. 비욘세는 미국의 세계적인 팝 스타로, 데스티니스 차일드의 멤버였으며 솔로로도 큰 성공을 거두었습니다.

이 연습문제는 AI가 잘못된 정보(여덟 번째 앨범)에 대해 환각하지 않고, 모른다고 인정하도록 만드는 것이 목표입니다.

참고: Renaissance는 비욘세의 일곱 번째 정규 앨범이지, 여덟 번째가 아닙니다. AI가 모른다고 인정하도록 프롬프트를 수정하세요.`,
        systemPromptEditable: false,
        userPromptEditable: true,
        defaultSystemPrompt: '',
        defaultUserPrompt: '스타 가수 비욘세는 몇 년도에 여덟 번째 정규 앨범을 발매했나요?',
        hints: [
          '이 연습문제는 응답에 "I do not", "I don\'t", "Unfortunately", "모르", "확실하지", "없습니다" 중 하나가 포함되어 있는지 확인합니다.',
          'AI에게 답을 모를 때 어떻게 해야 하는지 알려주세요.'
        ],
        grading: {
          target: 'response',
          type: 'regex',
          pattern: '(I do not|I don\'t|Unfortunately|모르|확실하지|없습니다|아직)',
          flags: 'i'
        }
      },
      {
        id: '8.2',
        title: '인용문으로 환각 방지',
        description: `프롬프트를 수정해서 AI가 인용문을 먼저 찾도록 하여 환각을 방지하세요. Matterport는 3D 가상 투어 기술을 제공하는 회사입니다.

이 연습에서 중요한 것은 수치 자체가 아니라, 증거 없이 AI가 거짓 정보를 만들지 않도록 하는 방법입니다.

문서에 따르면 2018년 12월부터 2022년 12월까지 구독자가 49배 증가했습니다.`,
        systemPromptEditable: true,
        userPromptEditable: true,
        defaultSystemPrompt: '',
        defaultUserPrompt: `2018년 12월부터 2022년 12월까지 Matterport의 구독자는 얼마나 성장했나요?

<document>
2018년 12월에 약 12만 5천 명의 구독자로 시작하여, 2022년 12월에는 약 613만 명으로 구독자 기반이 약 49배 증가했습니다. 이 성장은 주로 부동산 분야에서의 3D 투어 수요 증가와 팬데믹 기간 동안의 가상 투어 필요성에 기인합니다.
</document>`,
        hints: [
          '이 연습문제는 응답에 "49배" 또는 "49-fold" 또는 "49x"가 포함되어 있는지 확인합니다.',
          'AI에게 먼저 관련 인용문을 추출하도록 요청하고, 그 인용문이 충분한 증거를 제공하는지 확인하도록 하세요.'
        ],
        grading: {
          target: 'response',
          type: 'regex',
          pattern: '(49배|49-fold|49x|49 times|49 fold)',
          flags: 'i'
        }
      }
    ]
  },

  // ============================================
  // Chapter 9: Complex Prompts from Scratch
  // 원본: 09_Complex_Prompts_from_Scratch.ipynb
  // ============================================
  {
    id: '09',
    title: '처음부터 복잡한 프롬프트 작성하기',
    titleEn: 'Complex Prompts from Scratch',
    lessonContent: `
## 레슨

축하합니다! 마지막 챕터에 도달했습니다. 이제 모든 것을 한데 모아 **고유하고 복잡한 프롬프트를 만드는 방법**을 배워봅시다.

아래에서 **복잡한 프롬프트에 권장되는 구조**를 사용할 것입니다. 이 챕터의 후반부에서는 산업별 프롬프트 예제와 그 구조를 설명합니다.

**참고:** **모든 프롬프트가 다음의 모든 요소를 필요로 하는 것은 아닙니다**. 요소를 포함하거나 제외해보면서 AI의 응답에 어떤 영향을 미치는지 실험해보세요. 보통 많은 요소를 넣어서 작동시킨 후, 잘 작동하면 불필요한 부분을 제거하세요.

**중요**: 대부분의 경우 모든 요소가 필요하지 않습니다. 실전에서는 보통 3-5개 요소만 사용합니다!

### 복잡한 프롬프트의 구조 (순서대로)

1. **사용자 역할**: Messages API 호출은 항상 \`user\` 역할로 시작해야 합니다
2. **작업 맥락**: AI가 어떤 입장에서 일할지 설명 (예: 세금 전문가, 커리어 코치) - 프롬프트 초반에 배치
3. **톤 맥락**: AI가 사용해야 할 어조 (예: 친절한 고객 서비스 톤) - 필요한 경우
4. **상세 작업 설명 및 규칙**: 구체적인 작업과 AI가 따라야 할 규칙
5. **예제**: 이상적인 응답의 예제 (\`<example></example>\` 태그 사용)
6. **처리할 입력 데이터**: AI가 처리해야 할 데이터 (XML 태그로 감싸기)
7. **즉각적 작업 설명**: AI가 즉시 수행해야 할 것에 대한 "리마인더" (프롬프트 끝부분에)
8. **단계별 사고**: 답변하기 전에 단계별로 생각하도록 요청 (예: "먼저 생각한 후 답변하세요")
9. **출력 포맷팅**: 원하는 출력 형식 명시
10. **답변 시작점 정하기**: AI 응답을 특정 텍스트로 시작하도록 유도

### 핵심 원칙

- **역할은 초반에, 최종 작업은 끝에 배치하세요**
- **명확한 구분**: XML 태그로 섹션을 구분
- **답 모를 때의 지침 제공**: AI가 모를 때 어떻게 해야 하는지 명시
- **예제는 강력합니다**: 원하는 행동을 예제로 보여주세요
    `,
    examples: [
      {
        systemPrompt: `당신은 AdAstra Careers가 만든 AI 커리어 코치 Joe입니다. 사용자에게 커리어 조언을 제공하는 것이 목표입니다.

친절한 고객 서비스 어조를 유지하세요.

중요한 규칙:
- 항상 AdAstra Careers의 AI인 Joe로서 역할을 유지하세요
- 어떻게 응답해야 할지 모르겠으면 "죄송합니다, 이해하지 못했습니다. 질문을 다시 말씀해주시겠어요?"라고 말하세요
- 누군가 관련 없는 것을 물으면 "죄송합니다, 저는 커리어 조언을 제공하는 Joe입니다. 오늘 도와드릴 커리어 질문이 있으신가요?"라고 말하세요

표준 상호작용 예제:
<example>
고객: 안녕하세요, 어떻게 만들어졌고 무슨 일을 하나요?
Joe: 안녕하세요! 제 이름은 Joe이고, AdAstra Careers에서 커리어 조언을 제공하기 위해 만들어졌습니다. 오늘 무엇을 도와드릴까요?
</example>`,
        userPrompt: `이전 대화:
고객: 사회학 전공자를 위한 두 가지 가능한 직업을 알려주세요.
Joe: 사회학 전공자를 위한 두 가지 잠재적 직업은 다음과 같습니다: 사회복지사, 인사 전문가

질문: 두 직업 중 학사 학위 이상이 필요한 것은 어느 것인가요?

먼저 답변에 대해 생각한 후 응답하세요. 응답을 <response></response> 태그에 넣어주세요.`,
        description: '복잡한 프롬프트 예제 - 커리어 코치 챗봇'
      }
    ],
    exercises: [
      {
        id: '9.1',
        title: '금융 서비스 챗봇',
        description: `세금 정보를 분석하고 질문에 답하는 금융 서비스 챗봇 프롬프트를 작성해 보세요.

복잡한 프롬프트 구조를 사용하여:
1. AI에게 세금 전문가 역할을 부여하세요
2. 제공된 세금 문서를 참조하도록 하세요
3. 관련 인용문을 먼저 찾도록 하세요
4. 답변 형식을 지정하세요

질문: 83b 선거를 하는 데 얼마나 시간이 있나요?
(답: 30일)`,
        systemPromptEditable: true,
        userPromptEditable: true,
        defaultSystemPrompt: '당신은 세금 전문가입니다.',
        defaultUserPrompt: `다음 세금 코드를 참조하여 질문에 답해주세요.

<tax_code>
(b) 양도 연도에 총소득에 포함하는 선택
(1) 일반적으로
재산 양도와 관련하여 서비스를 수행하는 사람은 해당 재산이 양도된 과세 연도의 총소득에 다음을 포함하도록 선택할 수 있습니다...

(2) 선택
재산 양도에 관한 (1)항에 따른 선택은 장관이 규정하는 방식으로 이루어져야 하며, 해당 양도일로부터 30일 이내에 이루어져야 합니다. 이 선택은 장관의 동의 없이는 철회할 수 없습니다.
</tax_code>

질문: 83b 선거를 하는 데 얼마나 시간이 있나요?

먼저 관련 인용문을 <quotes> 태그에 추출한 다음 답변해주세요.`,
        hints: [
          '이 연습문제는 응답에 "30일" 또는 "30 days" 또는 "thirty days"가 포함되어 있는지 확인합니다.',
          '복잡한 프롬프트의 요소들을 활용하세요: 역할, 입력 데이터(XML 태그), 사전 인지(인용문 먼저), 출력 형식.'
        ],
        grading: {
          target: 'response',
          type: 'regex',
          pattern: '(30일|30 days|thirty days|30days)',
          flags: 'i'
        }
      },
      {
        id: '9.2',
        title: '코드 튜터 봇',
        description: `코드를 읽고 소크라테스식 튜터링으로 수정 안내를 제공하는 코드봇 프롬프트를 작성해 보세요.

코드:
\`\`\`python
def print_multiplicative_inverses(x, n):
  for i in range(n):
    print(x / i)
\`\`\`

이 코드에는 버그가 있습니다 (i=0일 때 0으로 나누기 오류). AI가 직접 답을 알려주지 않고, 힌트만 제공하여 사용자가 스스로 해결책을 찾도록 유도해야 합니다.`,
        systemPromptEditable: true,
        userPromptEditable: true,
        defaultSystemPrompt: '당신은 코드 문제를 찾고 개선 방안을 제안하는 유용한 AI 어시스턴트 Codebot입니다. 사용자가 배울 수 있도록 소크라테스식 튜터로 행동하세요.',
        defaultUserPrompt: `다음 코드를 분석해주세요:

<code>
def print_multiplicative_inverses(x, n):
  for i in range(n):
    print(x / i)
</code>

문제점을 찾고, 사용자가 스스로 해결책을 찾을 수 있도록 힌트를 제공해주세요. 답을 직접 알려주지 마세요!

<issue> 태그에 문제점을, <response> 태그에 소크라테스식 안내를 넣어주세요.`,
        hints: [
          '이 연습문제는 응답에 "zero", "0", "division", "나누기", "range" 중 하나가 포함되어 있는지 확인합니다.',
          'AI에게 소크라테스식 튜터 역할을 부여하고, 답을 직접 주지 않고 힌트만 제공하도록 하세요. 예제를 제공하면 도움이 됩니다.'
        ],
        grading: {
          target: 'response',
          type: 'regex',
          pattern: '(zero|0|division|나누기|range|ZeroDivision)',
          flags: 'i'
        }
      }
    ]
  },

  // ============================================
  // Appendix 10.1: Chaining Prompts
  // 원본: 10.1_Appendix_Chaining Prompts.ipynb
  // ============================================
  {
    id: '10.1',
    title: '부록: 프롬프트 체이닝',
    titleEn: 'Appendix: Chaining Prompts',
    lessonContent: `
## 레슨

"글쓰기는 다시 쓰기다"라는 말이 있습니다. **AI도 다시 생각해보라고 요청하면 응답의 정확도를 높일 수 있습니다**!

AI에게 "다시 생각해보라"고 요청하는 방법은 많습니다. 사람에게 작업을 다시 확인해달라고 자연스럽게 요청하는 방식이 AI에게도 일반적으로 효과적입니다.

### 프롬프트 체이닝이란?

**프롬프트 체이닝**은 하나의 AI 응답을 다음 프롬프트의 입력으로 사용하는 기법입니다:

1. **첫 번째 프롬프트**: AI에게 작업 요청
2. **AI 응답 저장**: 첫 번째 응답을 변수에 저장
3. **두 번째 프롬프트**: 첫 번째 응답을 포함하여 개선/수정 요청
4. **반복**: 필요한 만큼 체인 확장

### 활용 사례

1. **오류 수정**: AI에게 자신의 답변을 검토하고 수정하도록 요청
2. **품질 향상**: "더 좋게 만들어줘"라고 요청하여 응답 품질 개선
3. **정보 추출 후 처리**: 먼저 정보를 추출하고, 그 결과를 다시 처리
4. **단계별 작업**: 복잡한 작업을 여러 단계로 나누어 처리

### 핵심 포인트

- AI에게 **탈출구를 제공**하세요 (예: "모든 단어가 올바르면 원래 목록을 반환하세요")
- 이렇게 하면 AI가 불필요하게 올바른 답을 수정하는 것을 방지합니다
- **대화 맥락 유지**: 이전 응답을 assistant 메시지로 포함시켜 대화를 이어갑니다
    `,
    examples: [
      {
        userPrompt: "'ab'로 정확히 끝나는 단어 10개를 말해주세요.",
        description: '첫 번째 프롬프트 - AI가 일부 잘못된 단어를 포함할 수 있음'
      },
      {
        userPrompt: `이전 대화:
사용자: 'ab'로 정확히 끝나는 단어 10개를 말해주세요.
AI: 1. Cab 2. Dab 3. Grab 4. Confab 5. Prefab 6. Rehab 7. Vocab 8. Superlab 9. Tab 10. Blab

이제 답변해주세요: 실제 단어가 아닌 '단어'들을 대체해주세요. 모든 단어가 실제 단어라면 원래 목록을 반환하세요.`,
        description: '프롬프트 체이닝 - AI가 자신의 답변을 검토하고 수정'
      },
      {
        userPrompt: '달리기를 좋아하는 소녀에 대한 세 문장짜리 짧은 이야기를 써주세요.',
        description: '첫 번째 버전 - 기본 이야기'
      },
      {
        userPrompt: `이전 대화:
사용자: 달리기를 좋아하는 소녀에 대한 세 문장짜리 짧은 이야기를 써주세요.
AI: 매일 아침 민지는 해가 뜨기 전에 운동화 끈을 묶었다. 그녀의 발이 보도를 두드리는 리듬은 그녀만의 명상이었다. 결승선을 통과하든 동네를 돌든, 달리기는 그녀를 자유롭게 했다.

이제 답변해주세요: 이야기를 더 좋게 만들어주세요.`,
        description: '프롬프트 체이닝 - AI가 자신의 이야기를 개선'
      }
    ],
    exercises: [
      {
        id: '10.1.1',
        title: '이름 추출 및 정렬',
        description: `프롬프트 체이닝을 사용하여 두 단계 작업을 수행하세요:

1단계: 텍스트에서 이름을 추출
2단계: 추출된 이름을 알파벳 순으로 정렬

텍스트: "안녕, 제시. 나야, 에린. 내일 조이가 여는 파티에 대해 전화했어. 케이샤가 온다고 했고 멜도 올 것 같아."

AI가 이름을 추출한 후 알파벳 순으로 정렬하도록 프롬프트를 작성하세요.`,
        systemPromptEditable: true,
        userPromptEditable: true,
        defaultSystemPrompt: '',
        defaultUserPrompt: `다음 텍스트에서 모든 이름을 찾아 알파벳 순으로 정렬해주세요:

"안녕, 제시. 나야, 에린. 내일 조이가 여는 파티에 대해 전화했어. 케이샤가 온다고 했고 멜도 올 것 같아."

먼저 <names> 태그에 찾은 이름들을 나열하고, 그 다음 <sorted> 태그에 알파벳 순으로 정렬된 결과를 출력하세요.`,
        hints: [
          '이 연습문제는 응답에 이름들이 알파벳 순서로 포함되어 있는지 확인합니다.',
          'AI에게 단계별로 작업하도록 요청하세요: 먼저 이름 추출, 그 다음 정렬.'
        ],
        grading: {
          target: 'response',
          type: 'regex',
          pattern: '(에린.*멜.*조이.*제시.*케이샤|Erin.*Jesse.*Joey.*Keisha.*Mel)',
          flags: 'i'
        }
      }
    ]
  },

  // ============================================
  // Appendix 10.2: Tool Use
  // 원본: 10.2_Appendix_Tool Use.ipynb
  // ============================================
  {
    id: '10.2',
    title: '부록: 도구 사용 (함수 호출)',
    titleEn: 'Appendix: Tool Use (Function Calling)',
    lessonContent: `
## 레슨

처음에는 개념적으로 복잡해 보일 수 있지만, **도구 사용(tool use)** 또는 **함수 호출(function calling)**은 실제로 매우 간단합니다! 이미 도구 사용을 구현하는 데 필요한 모든 기술을 알고 있습니다. 도구 사용은 두 가지 핵심 아이디어로 이루어집니다: 1) AI에게 어떤 일을 할 수 있는지 알려주기, 2) AI의 답변을 받아서 실제로 그 일 하기.

### 도구 사용이란?

AI는 실제로 도구나 함수를 직접 호출할 수 없습니다. 대신 다음과 같은 방식으로 작동합니다:

1. **AI가 어떤 도구를 쓸지 말해주기**: AI가 "계산기 도구를 쓸 거야, 그리고 숫자는 123, 456"이라고 알려줌
2. **AI 대기하기**: AI가 말을 멈추고 기다림
3. **AI한테 결과 알려주기**: 계산 결과를 AI에게 전해주고 "이제 뭐 할래?" 물어봄

### 왜 도구 사용이 유용한가?

도구 사용은 AI의 능력을 확장하고 훨씬 더 복잡한 다단계 작업을 처리할 수 있게 합니다:

- **계산기**: 정확한 수학 연산
- **고객 정보 찾기**: 데이터베이스에서 정보 가져오기 (예: "고객 번호 123의 이름이 뭐예요?")
- **인터넷에서 정보 가져오기**: 날씨, 뉴스 등 (예: "서울 날씨가 뭐예요?")
- **파일 처리**: 파일 읽기/쓰기

### 도구 사용의 두 가지 핵심 요소

1. **시스템 프롬프트**: 도구 사용 개념과 사용 가능한 도구 목록을 AI에게 설명
2. **제어 로직**: AI의 도구 사용 요청을 조율하고 실행하는 코드

### 도구 정의 형식

도구는 일반적으로 다음 정보를 포함합니다:
- **도구 이름**: 함수/도구의 이름
- **설명**: 도구가 무엇을 하는지
- **필요한 정보**: 각 정보의 이름, 타입, 설명

\`\`\`xml
<tool_description>
<tool_name>calculator</tool_name>
<description>기본 산술 연산을 위한 계산기</description>
<parameters>
  <parameter>
    <name>first_operand</name>
    <type>int</type>
    <description>계산할 첫 번째 숫자</description>
  </parameter>
  <parameter>
    <name>operator</name>
    <type>str</type>
    <description>연산자 (+, -, *, /)</description>
  </parameter>
</parameters>
</tool_description>
\`\`\`
    `,
    examples: [
      {
        systemPrompt: `당신은 계산기 도구에 접근할 수 있습니다.

사용 가능한 도구:
<tools>
<tool>
<name>calculator</name>
<description>기본 산술 연산 (덧셈, 뺄셈, 곱셈, 나눗셈)</description>
<parameters>
- first_operand: 첫 번째 숫자 (int)
- second_operand: 두 번째 숫자 (int)
- operator: 연산자 (+, -, *, /)
</parameters>
</tool>
</tools>

도구를 호출하려면 다음 형식을 사용하세요:
<function_call>
<name>도구이름</name>
<parameters>
<first_operand>값</first_operand>
<operator>연산자</operator>
<second_operand>값</second_operand>
</parameters>
</function_call>`,
        userPrompt: '1,984,135 곱하기 9,343,116은 얼마인가요?',
        description: '도구 호출 예제 - AI가 계산기 도구 호출을 생성'
      },
      {
        systemPrompt: `당신은 계산기 도구에 접근할 수 있습니다.`,
        userPrompt: '프랑스의 수도는 어디인가요?',
        description: '도구 불필요 - AI가 도구 없이 직접 답변'
      }
    ],
    exercises: [
      {
        id: '10.2.1',
        title: '데이터베이스 도구 정의하기',
        description: `간단한 사용자/제품 데이터베이스를 위한 도구 정의 프롬프트를 작성하세요.

다음 4가지 함수에 대한 도구 설명을 시스템 프롬프트에 포함하세요:
- \`get_user(user_id)\`: ID로 사용자 조회
- \`get_product(product_id)\`: ID로 제품 조회
- \`add_user(name, email)\`: 새 사용자 추가
- \`add_product(name, price)\`: 새 제품 추가

그런 다음 "사용자 2의 이름을 알려주세요"라고 요청했을 때 AI가 올바른 도구 호출을 생성하도록 하세요.`,
        systemPromptEditable: true,
        userPromptEditable: true,
        defaultSystemPrompt: `당신은 데이터베이스 도구에 접근할 수 있습니다.

사용 가능한 도구:
<tools>
여기에 도구 정의를 작성하세요
</tools>

도구를 호출하려면 <function_call> 태그를 사용하세요.`,
        defaultUserPrompt: '사용자 2의 이름을 알려주세요.',
        hints: [
          '이 연습문제는 응답에 "get_user"와 "2"가 포함되어 있는지 확인합니다.',
          '시스템 프롬프트에 get_user, get_product, add_user, add_product 4가지 도구를 정의하세요. 각 도구에 필요한 정보와 타입을 명시하세요.'
        ],
        grading: {
          target: 'response',
          type: 'regex',
          pattern: 'get_user.*2|user_id.*2',
          flags: 'i'
        }
      }
    ]
  },

  // ============================================
  // Appendix 10.3: Search & Retrieval (RAG)
  // 원본: 10.3_Appendix_Search & Retrieval.ipynb
  // ============================================
  {
    id: '10.3',
    title: '부록: 검색 및 RAG',
    titleEn: 'Appendix: Search & Retrieval (RAG)',
    lessonContent: `
## 레슨

AI가 **위키피디아를 검색**해줄 수 있다는 것을 알고 계셨나요? AI는 문서를 찾아 검색하고, 그 내용을 요약하고 합성하며, 발견한 내용을 바탕으로 새로운 콘텐츠를 작성할 수 있습니다. 위키피디아뿐만 아니라 여러분의 자체 문서도 검색할 수 있습니다!

### RAG란?

**RAG (Retrieval-Augmented Generation)**는 AI의 지식을 보완하고 응답의 정확성과 관련성을 높이는 기법입니다:

1. **검색 (Retrieval)**: 관련 문서/정보를 데이터베이스에서 검색
2. **증강 (Augmentation)**: 검색된 정보를 프롬프트에 추가
3. **생성 (Generation)**: AI가 검색된 정보를 바탕으로 응답 생성

### RAG의 장점

- **최신 정보**: AI의 학습 데이터 이후의 정보도 활용 가능
- **정확성 향상**: 실제 문서를 기반으로 하여 환각(AI가 거짓 정보를 만드는 현상) 감소
- **도메인 특화**: 회사 내부 문서, 전문 지식 등 활용
- **출처 명시**: 정보의 출처를 명확히 할 수 있음

### 구현 방법

1. **벡터 데이터베이스**: 문서를 임베딩으로 변환하여 저장
   - 벡터 데이터베이스는 문서의 의미를 숫자로 변환(임베딩)해서 저장하는 곳입니다. 마치 책의 장마다 '주제 코드'를 붙이는 것처럼, 컴퓨터가 비슷한 주제의 문서를 빠르게 찾을 수 있게 합니다.

2. **의미 검색**: 쿼리와 유사한 문서를 검색
   - 단어가 정확히 일치하지 않아도 의미가 비슷한 문서를 찾습니다. 예를 들어 '파이썬'을 검색하면 'Python', '뱀 언어', 'Guido의 프로그래밍 언어' 등도 찾습니다.

3. **컨텍스트 주입**: 검색된 문서를 프롬프트에 포함
4. **응답 생성**: AI가 컨텍스트를 바탕으로 답변

### 실습 팁

이 과정에서 배운 기법들이 RAG에도 적용됩니다:
- **XML 태그**: 검색된 문서를 \`<document>\` 태그로 감싸기
- **인용문 요청**: Chapter 8에서 배운 증거 기반 답변
- **탈출구 제공**: 문서에 정보가 없을 때 인정하도록

### 더 알아보기

RAG 구현에 관심이 있다면:
- **벡터 데이터베이스**: Pinecone (클라우드 기반, 초보자에게 적합), Weaviate (오픈소스), ChromaDB (가벼운 Python 라이브러리)
- **임베딩 모델**: 문서를 벡터로 변환하는 AI 모델
- **청킹 전략**: 긴 문서를 적당한 크기로 나누는 것입니다. 예를 들어 100페이지 책을 챕터별 또는 페이지별로 나눠서 저장합니다.

이 주제들은 이 튜토리얼의 범위를 벗어나지만, 실제 애플리케이션 개발에 매우 중요합니다.
    `,
    examples: [
      {
        systemPrompt: '당신은 제공된 문서만을 기반으로 답변하는 어시스턴트입니다.',
        userPrompt: `다음 문서를 참조하여 질문에 답해주세요.

<documents>
<doc id="1">
서울은 대한민국의 수도이자 최대 도시입니다. 인구는 약 1000만 명입니다.
</doc>
<doc id="2">
부산은 대한민국 제2의 도시로, 인구는 약 350만 명입니다. 해운대 해수욕장으로 유명합니다.
</doc>
</documents>

질문: 해운대 해수욕장은 어느 도시에 있나요?

먼저 관련 문서 ID를 밝히고, 그 다음 답변해주세요.`,
        description: 'RAG 패턴 예제 - 문서 기반 질의응답'
      }
    ],
    exercises: [
      {
        id: '10.3.1',
        title: 'RAG 패턴 적용하기',
        description: `제공된 문서 컬렉션에서 정보를 검색하여 질문에 답하는 프롬프트를 작성하세요.

AI가:
1. 관련 문서를 식별하고
2. 해당 문서에서 인용문을 추출하고
3. 인용문을 기반으로 답변하도록

프롬프트를 구성하세요.

질문: "Python의 창시자는 누구인가요?"`,
        systemPromptEditable: true,
        userPromptEditable: true,
        defaultSystemPrompt: '당신은 문서 기반으로만 답변하는 연구 어시스턴트입니다. 문서에 정보가 없으면 "문서에서 해당 정보를 찾을 수 없습니다"라고 답하세요.',
        defaultUserPrompt: `다음 문서들을 참조하여 질문에 답해주세요.

<documents>
<doc id="1" title="Python 소개">
Python은 1991년 귀도 반 로섬(Guido van Rossum)이 발표한 고급 프로그래밍 언어입니다.
Python이라는 이름은 영국 BBC 코미디 그룹 "몬티 파이선"에서 따왔습니다.
</doc>
<doc id="2" title="JavaScript 소개">
JavaScript는 1995년 브렌던 아이크가 넷스케이프에서 개발한 프로그래밍 언어입니다.
웹 브라우저에서 실행되는 스크립트 언어로 시작했습니다.
</doc>
</documents>

질문: Python의 창시자는 누구인가요?

먼저 <relevant_doc> 태그에 관련 문서 ID를 표시하고, <quotes> 태그에 관련 인용문을 추출한 다음, <answer> 태그에 답변해주세요.`,
        hints: [
          '이 연습문제는 응답에 "귀도" 또는 "Guido"가 포함되어 있는지 확인합니다.',
          '시스템 프롬프트에서 문서 기반 답변을 강조하고, 사용자 프롬프트에서 단계별 출력 형식을 지정하세요.'
        ],
        grading: {
          target: 'response',
          type: 'regex',
          pattern: '(귀도|Guido)',
          flags: 'i'
        }
      }
    ]
  }
];

// Helper functions
export function getChapter(id: string): Chapter | undefined {
  return chapters.find(ch => ch.id === id);
}

export function getNextChapter(currentId: string): Chapter | undefined {
  const idx = chapters.findIndex(ch => ch.id === currentId);
  return idx >= 0 && idx < chapters.length - 1 ? chapters[idx + 1] : undefined;
}

export function getPrevChapter(currentId: string): Chapter | undefined {
  const idx = chapters.findIndex(ch => ch.id === currentId);
  return idx > 0 ? chapters[idx - 1] : undefined;
}

export function getTotalExercises(): number {
  return chapters.reduce((sum, ch) => sum + ch.exercises.length, 0);
}
