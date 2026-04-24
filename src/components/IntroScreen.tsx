'use client';

import Image from 'next/image';

interface Props {
  onStart: () => void;
}

export default function IntroScreen({ onStart }: Props) {
  return (
    <div className="screen">
      <div className="intro-logo">
        <Image
          src="/logo_transparent.png"
          alt="숲파트너스 로고"
          width={200}
          height={57}
          priority
          style={{ height: 'auto' }}
        />
      </div>

      <div className="intro-hero">
        <h1 className="intro-h1">
          나의 은퇴준비,<br />지금 어느 단계인가요?
        </h1>
        <p className="intro-desc">
          8가지 핵심 질문으로 확인하는<br />
          <strong>무료 은퇴준비 자가진단</strong>
        </p>
        <button className="btn-primary" onClick={onStart}>
          무료로 진단하기
        </button>
      </div>

      <div className="intro-badges">
        <div className="intro-badge">⏱ 소요시간 3분</div>
        <div className="intro-badge">📄 맞춤 리포트</div>
        <div className="intro-badge">💬 전문가 무료상담</div>
      </div>

      <div className="intro-section">
        <h2 className="intro-section-title">🌱 이런 분들께 추천드려요</h2>
        <ul className="intro-list">
          <li>은퇴 후 생활비가 얼마나 필요한지 막막하신 분</li>
          <li>연금 외 추가 수입원이 필요한 분</li>
          <li>상속·증여세를 미리 준비하고 싶은 분</li>
          <li>자산을 어떻게 관리해야 할지 모르는 분</li>
        </ul>
      </div>

      <div className="intro-section">
        <h2 className="intro-section-title">🌳 8가지 영역을 진단합니다</h2>
        <div className="intro-areas">
          {['연금 준비', '생활비 계획', '현금흐름 자산', '주거 전략',
            '의료비 준비', '세금 계획', '자녀 지원', '자산 관리'].map((area) => (
            <span key={area} className="intro-area-tag">{area}</span>
          ))}
        </div>
      </div>

      <button className="btn-primary intro-cta-bottom" onClick={onStart}>
        지금 바로 시작하기
      </button>

      <footer className="footer">
        <p>© 2026 주식회사 숲파트너스. All rights reserved.</p>
        <p>
          <a href="https://www.soop-partners.com" target="_blank" rel="noopener noreferrer">
            www.soop-partners.com
          </a>
        </p>
      </footer>
    </div>
  );
}
