'use client';

import { useState, useEffect } from 'react';

const STEPS = [
  { icon: '\u{1F4CA}', text: '응답 데이터를 분석하고 있습니다...' },
  { icon: '\u{1F331}', text: '은퇴준비 상태를 진단하고 있습니다...' },
  { icon: '\u{1F332}', text: '영역별 상세 분석을 생성하고 있습니다...' },
  { icon: '\u{1F333}', text: '맞춤 솔루션을 준비하고 있습니다...' },
  { icon: '\u{1F4E8}', text: '결과를 정리하고 있습니다. 잠시만 기다려 주세요...' },
];

const STEP_MS = 800;
const MIN_MS = 3200;
const CAP_UNTIL_READY = 92;

interface Props {
  onComplete: () => void;
  /** 백그라운드 처리가 끝났는지. false 면 진행률을 92%에서 붙잡아 둔다. */
  ready?: boolean;
}

export default function LoadingScreen({ onComplete, ready = true }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [minElapsed, setMinElapsed] = useState(false);

  // 단계별 텍스트 전환 + 최소 노출 시간
  useEffect(() => {
    const stepTimer = setInterval(() => {
      setStepIndex((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, STEP_MS);

    const minTimer = setTimeout(() => setMinElapsed(true), MIN_MS);

    return () => {
      clearInterval(stepTimer);
      clearTimeout(minTimer);
    };
  }, []);

  // 진행률: 처리가 끝나기 전에는 92%에서 대기
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        const cap = ready ? 100 : CAP_UNTIL_READY;
        if (prev >= cap) return cap;
        return Math.min(prev + 2, cap);
      });
    }, 60);
    return () => clearInterval(timer);
  }, [ready]);

  // 최소 시간 + 처리 완료 + 진행률 100% 가 모두 충족되면 다음 화면으로
  useEffect(() => {
    if (!minElapsed || !ready || progress < 100) return;
    const timer = setTimeout(onComplete, 260);
    return () => clearTimeout(timer);
  }, [minElapsed, ready, progress, onComplete]);

  const step = STEPS[ready ? Math.min(stepIndex, STEPS.length - 2) : stepIndex];

  return (
    <div className="screen">
      <div className="loading-screen">
        <div className="loading-tree">
          <span className="loading-tree-icon">{step.icon}</span>
        </div>

        <div className="loading-bar-container">
          <div className="loading-bar">
            <div className="loading-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="loading-percent">{Math.min(progress, 100)}%</div>
        </div>

        <p className="loading-text">{step.text}</p>
      </div>
    </div>
  );
}
