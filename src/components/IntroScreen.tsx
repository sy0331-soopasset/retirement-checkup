'use client';

import Image from 'next/image';

interface Props {
  onStart: () => void;
}

export default function IntroScreen({ onStart }: Props) {
  return (
    <div className="screen">
      <div className="logo">
        <div className="logo-header">
          <Image
            src="/logo_transparent.png"
            alt="숲파트너스 로고"
            width={180}
            height={65}
            priority
          />
        </div>
      </div>

      <div className="intro-content">
        <h2>{'\u{1F333}'} 은퇴준비 체크리스트</h2>
        <p>
          8가지 질문으로 현재 나의 은퇴준비 상태를 확인하고,
          <br />
          맞춤형 솔루션을 제안받아보세요.
        </p>
        <button className="btn-primary" onClick={onStart}>
          진단 시작하기
        </button>
      </div>
    </div>
  );
}
