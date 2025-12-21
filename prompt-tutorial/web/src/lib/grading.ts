import type { Exercise } from '@/content/chapters';

export interface GradingResult {
  passed: boolean;
  score: number;
  details: CriteriaResult[];
  feedback: string;
}

export interface CriteriaResult {
  passed: boolean;
  feedback: string;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

export function gradeExercise(
  exercise: Exercise,
  userInput: string,
  llmResponse: string
): GradingResult {
  const { grading } = exercise;
  const textToCheck = grading.target === 'response' ? llmResponse : userInput;
  const details: CriteriaResult[] = [];
  let passed = false;

  switch (grading.type) {
    case 'regex': {
      try {
        const regex = new RegExp(grading.pattern!, grading.flags || '');
        passed = regex.test(textToCheck);
        details.push({
          passed,
          feedback: passed
            ? '패턴이 일치합니다.'
            : '응답이 예상 패턴과 일치하지 않습니다.',
        });
      } catch {
        details.push({
          passed: false,
          feedback: '채점 패턴 오류입니다.',
        });
      }
      break;
    }

    case 'contains': {
      const searchText = grading.text!.toLowerCase();
      passed = textToCheck.toLowerCase().includes(searchText);
      details.push({
        passed,
        feedback: passed
          ? `"${grading.text}" 텍스트가 포함되어 있습니다.`
          : `"${grading.text}" 텍스트가 포함되어 있지 않습니다.`,
      });
      break;
    }

    case 'exact': {
      passed = textToCheck.trim() === grading.text!.trim();
      details.push({
        passed,
        feedback: passed
          ? '정확히 일치합니다.'
          : `정확히 "${grading.text}"와 일치해야 합니다.`,
      });
      break;
    }

    case 'wordCount': {
      const wordCount = countWords(textToCheck);
      const minWords = grading.minWords || 0;
      passed = wordCount >= minWords;
      details.push({
        passed,
        feedback: passed
          ? `단어 수: ${wordCount}개 (최소 ${minWords}개 충족)`
          : `단어 수: ${wordCount}개 (최소 ${minWords}개 필요)`,
      });
      break;
    }
  }

  const score = passed ? 100 : 0;

  let feedback = '';
  if (passed) {
    feedback = '정답입니다! 훌륭합니다.';
  } else {
    feedback = '다시 시도해보세요. 힌트를 참고하면 도움이 됩니다.';
  }

  return {
    passed,
    score,
    details,
    feedback,
  };
}

export function needsLLMResponse(exercise: Exercise): boolean {
  return exercise.grading.target === 'response';
}
