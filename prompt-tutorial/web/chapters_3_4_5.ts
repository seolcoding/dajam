// Chapters 3, 4, 5 - TypeScript format
// 원본: Anthropic 1P/ 노트북에서 추출한 콘텐츠
// 한국어 번역 및 일반화 적용

export const newChapters = [
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

이는 **프롬프트의 고정된 골격과 가변적인 사용자 입력을 분리한 후, 전체 프롬프트를 AI에게 보내기 전에 사용자 입력을 치환**하면 쉽게 할 수 있습니다.

### 변수 치환 방법

템플릿 문자열을 사용하여 변수를 치환할 수 있습니다:
- JavaScript/TypeScript: 백틱과 \`\${변수}\` 문법 사용
- Python: f-string과 \`{변수}\` 문법 사용

**참고:** 변수 이름은 구체적이고 관련성 있게 짓는 것이 좋습니다. 치환 없이도 프롬프트 템플릿을 이해하기 쉽게 만들어야 합니다.

### XML 태그의 중요성

변수를 사용할 때는 **AI가 변수가 시작하고 끝나는 위치를 명확히 알 수 있도록** 하는 것이 매우 중요합니다 (지시사항이나 작업 설명과 구분하여).

**XML 태그로 입력을 감싸세요!** XML 태그는 \`<tag></tag>\`처럼 생긴 각진 괄호 태그입니다. 여는 태그 \`<tag>\`와 닫는 태그 \`</tag>\`가 쌍으로 이루어져 있으며, 내용을 감쌉니다: \`<tag>내용</tag>\`.

**참고:** AI는 다양한 구분자를 인식할 수 있지만, **특별히 XML 태그를 구분자로 사용할 것을 권장합니다**. AI는 XML 태그를 프롬프트 구성 메커니즘으로 인식하도록 특별히 훈련되었습니다.

### 세부 사항의 중요성

**작은 세부 사항이 중요합니다!** 프롬프트에서 오타와 문법 오류를 점검할 가치가 있습니다. AI는 패턴에 민감하며, 여러분이 실수하면 AI도 실수할 가능성이 높고, 여러분이 똑똑하면 AI도 똑똑하고, 여러분이 장난스러우면 AI도 장난스러워집니다.
    `,
    examples: [
      {
        userPrompt: '동물의 이름을 알려드릴게요. 그 동물이 내는 소리를 답해주세요. Cow',
        description: '간단한 변수 치환 예제'
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
        description: '프롬프트를 수정해서 TOPIC 변수를 받아서 그 주제에 대한 하이쿠를 출력하는 템플릿으로 만들어 보세요. 이 연습문제는 템플릿 문자열 구조에 대한 이해를 테스트합니다.',
        systemPromptEditable: false,
        userPromptEditable: true,
        defaultSystemPrompt: '',
        defaultUserPrompt: '',
        hints: [
          '이 연습문제는 응답에 "haiku"와 "pig" 단어가 포함되어 있는지 확인합니다.',
          '주제를 치환하고 싶은 위치에 변수를 넣으세요. TOPIC 변수 값을 바꾸면 다른 주제에 대한 하이쿠가 생성되어야 합니다.'
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

위 연습문제와 마찬가지로 다른 것은 바꾸지 마세요. 이렇게 하면 AI가 어떤 종류의 언어를 파싱하고 이해할 수 있는지 볼 수 있습니다.`,
        systemPromptEditable: false,
        userPromptEditable: true,
        defaultSystemPrompt: '',
        defaultUserPrompt: 'Hia its me i have a q about dogs jkaerjv ar cn brown? jklmvca tx it help me muhch much atx fst fst answer short short tx',
        hints: [
          '이 연습문제는 응답에 "brown"이라는 단어가 포함되어 있는지 확인합니다.',
          '한 번에 한 단어 또는 문자 섹션을 제거해보세요. 가장 의미가 없는 부분부터 시작하세요. 이렇게 하면 AI가 얼마나 많은 것을 파싱하고 이해할 수 있는지(또는 없는지) 볼 수 있습니다.'
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
        description: 'Prefill 사용 - assistant 응답을 "<haiku>"로 시작하여 AI가 바로 시를 작성하게 함 (실제 구현 시 prefill 파라미터 필요)'
      },
      {
        userPrompt: '고양이에 대한 하이쿠를 써주세요. JSON 형식으로 작성하되, 키는 "first_line", "second_line", "third_line"으로 해주세요.',
        description: 'JSON 형식 요청 - prefill로 "{"를 사용하면 거의 확실하게 JSON 출력 (실제 구현 시 prefill 파라미터 필요)'
      },
      {
        userPrompt: `Hey AI. 여기 이메일이 있습니다: <email>Hi Zack, just pinging you for a quick update on that prompt you were supposed to write.</email> 이 이메일을 olde english 스타일로 만들어주세요. 새 버전을 <olde_english_email> XML 태그에 넣어주세요.`,
        description: '여러 입력 변수와 출력 형식 지정을 모두 XML 태그로 처리 (실제 구현 시 prefill 파라미터 필요)'
      }
    ],
    exercises: [
      {
        id: '5.1',
        title: '스테판 커리 GOAT',
        description: `AI에게 역대 최고의 농구 선수를 고르라고 하면, 보통 마이클 조던을 선택합니다. 다른 선수를 고르게 할 수 있을까요?

사용자 프롬프트를 수정해서 **AI가 역대 최고의 농구 선수는 스테판 커리라고 상세한 논거를 펼치도록** 만들어 보세요.

힌트: AI의 응답을 시작하는 부분을 프롬프트에 포함시켜 보세요. (실제 API 사용 시에는 prefill 기능을 사용하지만, 여기서는 프롬프트 내에서 유도)`,
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
          '간단하게 시작하세요. 현재 프롬프트는 AI에게 하이쿠 하나를 요청합니다. 이것을 두 개(또는 더 많이)로 바꿀 수 있습니다. 그런 다음 형식 문제가 발생하면, AI가 이미 하나 이상의 하이쿠를 작성한 후에 프롬프트를 변경하여 수정하세요.'
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
        description: '프롬프트를 수정해서 **AI가 두 마리의 다른 동물에 대한 하이쿠를 두 개 작성하도록** 만들어 보세요. 실제로는 변수를 사용하겠지만, 여기서는 직접 동물 이름을 넣어도 됩니다.',
        systemPromptEditable: false,
        userPromptEditable: true,
        defaultSystemPrompt: '',
        defaultUserPrompt: '고양이에 대한 하이쿠를 써주세요. <haiku> 태그 안에 넣어주세요.',
        hints: [
          '채점 함수는 "tail", "cat", "<haiku>"가 모두 포함되어 있는지 확인합니다.',
          '이 연습문제를 여러 단계로 나누면 도움이 됩니다:\n1. 초기 프롬프트 템플릿을 수정하여 AI가 두 개의 시를 작성하도록 합니다.\n2. AI에게 시의 주제가 무엇인지 표시를 주되, 주제를 직접 쓰지 말고(예: dog, cat 등) 변수나 동물 이름으로 대체합니다.\n3. 프롬프트를 실행하고 모든 단어가 올바르게 치환되었는지 확인합니다.'
        ],
        grading: {
          target: 'response',
          type: 'regex',
          pattern: '(?=.*tail|꼬리)(?=.*cat|고양이)(?=.*<haiku>)',
          flags: 'is'
        }
      }
    ]
  }
];
