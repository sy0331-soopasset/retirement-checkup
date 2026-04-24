'use client';

import Image from 'next/image';
import type { Question } from '@/lib/types';

interface Props {
  question: Question;
  currentIndex: number;
  totalCount: number;
  onAnswer: (score: number, text: string) => void;
  onBack: () => void;
}

export default function QuestionScreen({ question, currentIndex, totalCount, onAnswer, onBack }: Props) {
  const progress = ((currentIndex + 1) / totalCount) * 100;

  return (
    <div className="screen">
      <div className="logo">
        <div className="logo-header">
          <Image
            src="/logo_transparent.png"
            alt="숲파트너스 로고"
            width={280}
            height={100}
            priority
          />
        </div>
      </div>

      <div className="progress-text">
        {currentIndex > 0 && <button className="btn-back" onClick={onBack}>← 이전</button>}
        {currentIndex + 1} / {totalCount}
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="question-container">
        <h2>{question.question}</h2>
        <div className="answer-group">
          {question.answers.map((answer, idx) => (
            <button
              key={idx}
              className="answer-button"
              onClick={() => onAnswer(answer.score, answer.text)}
            >
              {answer.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
