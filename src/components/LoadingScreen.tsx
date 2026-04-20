'use client';

import { useState, useEffect } from 'react';

const STEPS = [
  { icon: '\u{1F4CA}', text: '응답 데이터를 분석하고 있습니다...' },
  { icon: '\u{1F331}', text: '은퇴준비 상태를 진단하고 있습니다...' },
  { icon: '\u{1F332}', text: '영역별 상세 분석을 생성하고 있습니다...' },
  { icon: '\u{1F333}', text: '맞춤 솔루션을 준비하고 있습니다...' },
];

interface Props {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 단계별 텍스트 전환 (0.8초 간격)
    const stepTimer = setInterval(() => {
      setStepIndex((prev) => {
        if (prev < STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 800);

    // 프로그레스 바 (부드러운 증가)
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 2;
      });
    }, 60);

    // 전체 완료 (약 3.2초)
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3200);

    return () => {
      clearInterval(stepTimer);
      clearInterval(progressTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="screen">
      <div className="loading-screen">
        <div className="loading-tree">
          <span className="loading-tree-icon">{STEPS[stepIndex].icon}</span>
        </div>

        <div className="loading-bar-container">
          <div className="loading-bar">
            <div className="loading-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="loading-percent">{Math.min(progress, 100)}%</div>
        </div>

        <p className="loading-text">{STEPS[stepIndex].text}</p>
      </div>
    </div>
  );
}
