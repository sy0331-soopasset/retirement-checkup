export interface Answer {
  text: string;
  score: number;
}

export interface Question {
  question: string;
  answers: Answer[];
}

export interface FeedbackMessage {
  name: string;
  [score: number]: string;
}

export interface AnalysisItem {
  index: number;
  name: string;
  score: number;
  feedback: string;
}

export interface ConsultationData {
  name: string;
  phone: string;
  email: string;
  age: string;
  asset: string;
  referral: string;
  score: string;
  services: string;
  answers: Record<string, string>;
  analysis: {
    excellent: string;
    normal: string;
    lacking: string;
  };
  utm: {
    source: string;
    medium: string;
    campaign: string;
    term: string;
    content: string;
  };
}

export type Stage = 'seed' | 'tree' | 'forest';
