// Category types
export type Category = 'general' | 'food' | 'travel' | 'values' | 'romance' | 'work';

// Question type
export interface Question {
  id: string;
  title: string;
  optionA: string;
  optionB: string;
  category: Category;
  imageA?: string;
  imageB?: string;
  createdAt: string;
  votes: {
    A: number;
    B: number;
  };
}

// Vote record type
export interface VoteRecord {
  questionId: string;
  choice: 'A' | 'B';
  votedAt: string;
}

// Vote statistics type
export interface VoteStats {
  A: number;
  B: number;
  total: number;
  percentageA: number;
  percentageB: number;
}

// Category metadata
export interface CategoryMeta {
  id: Category;
  label: string;
  emoji: string;
  color: string;
}

// Share parameters
export interface ShareParams {
  questionId: string;
  myChoice?: 'A' | 'B';
}
