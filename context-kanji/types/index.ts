// 漢字データの型定義
export interface KanjiData {
  kanji: string;
  yomi: string;
  meaning: string;
  examples: string[];
  readings: Record<string, string>;
}

// 問題データの型定義
export interface Question {
  id: string;
  targetKanji: string;
  selectedSentence: string;
  candidates: {
    context: string;
    standard: string;
    unique: string;
  };
  yomi: string;
  selectedType: 'context' | 'standard' | 'unique';
}

// AI生成レスポンスの型定義
export interface AIGenerationResponse {
  story: string;
  questions: {
    kanji: string;
    context_sentence: string;
    standard_sentence: string;
    unique_sentence: string;
    yomi: string;
  }[];
}

// 学年データの型定義
export interface GradeData {
  grade: number;
  kanji: KanjiData[];
  count: number;
}
