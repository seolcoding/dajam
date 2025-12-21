import { useState } from 'react';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  example?: string;
}

/**
 * 용어 설명 툴팁 컴포넌트
 * 마우스를 올리면 정의가 표시됩니다.
 */
export function Tooltip({ children, content, example }: TooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <span className="relative inline-block">
      <span
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)} // 모바일 지원
        className="border-b border-dotted border-blue-400 cursor-help text-blue-600"
      >
        {children}
      </span>
      {show && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-3 bg-gray-900 text-white text-sm rounded-lg shadow-xl w-72 z-50"
          style={{ maxWidth: '90vw' }}
        >
          <div className="font-medium mb-1">{content}</div>
          {example && (
            <div className="text-gray-300 text-xs mt-2 pt-2 border-t border-gray-700">
              💡 {example}
            </div>
          )}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </span>
  );
}

/**
 * 용어 키로 툴팁 생성하는 헬퍼 컴포넌트
 */
interface GlossaryTooltipProps {
  termKey: string;
  children: React.ReactNode;
}

export function GlossaryTooltip({ termKey, children }: GlossaryTooltipProps) {
  // glossary에서 정의 가져오기
  const term = getGlossaryTerm(termKey);

  if (!term) {
    return <>{children}</>;
  }

  return (
    <Tooltip content={term.definition} example={term.example}>
      {children}
    </Tooltip>
  );
}

// glossary.ts에서 가져오기
function getGlossaryTerm(key: string) {
  // 동적 import를 피하기 위해 직접 매핑
  // 실제 구현에서는 glossary.ts import 사용
  const glossaryMap: Record<string, { definition: string; example?: string }> = {
    'messages-api': {
      definition: 'AI와 대화하는 표준 방식입니다.',
      example: '프로그램끼리 대화하는 규칙을 뜻합니다.'
    },
    'token': {
      definition: 'AI가 이해하는 최소 글자 단위입니다.',
      example: '한글 1글자는 보통 1-2토큰입니다.'
    },
    'xml-tag': {
      definition: '<이름>내용</이름> 형식으로 정보를 구분하는 방법입니다.',
      example: '<시>봄날의 햇살...</시>처럼 시작과 끝을 명확히 표시'
    },
    'hallucination': {
      definition: 'AI가 존재하지 않는 정보를 사실처럼 만들어내는 현상입니다.',
      example: '실제로는 없는 데이터를 그럴듯하게 지어내기'
    },
    // ... 필요한 용어 추가
  };

  return glossaryMap[key];
}
