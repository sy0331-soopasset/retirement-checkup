'use client';

import Image from 'next/image';

interface Props {
  onStart: () => void;
}

export default function IntroScreen({ onStart }: Props) {
  return (
    <div className="screen">
      {/* 로고 */}
      <div className="ip-logo">
        <Image
          src="/logo_transparent.png"
          alt="숲파트너스 로고"
          width={200}
          height={57}
          priority
          style={{ height: 'auto', filter: 'brightness(0) invert(1)' }}
        />
      </div>

      {/* 스타 데코 */}
      <div className="ip-stars">✦ &nbsp; ✦ &nbsp; ✦ &nbsp; ✦ &nbsp; ✦</div>

      {/* 헤드라인 */}
      <div className="ip-hero">
        <p className="ip-eyebrow">5060을 위한 맞춤 자가진단</p>
        <h1 className="ip-h1">
          나의 은퇴준비<br />지금 몇 점일까요?
        </h1>
      </div>

      {/* 메인 비주얼 */}
      <div className="ip-visual">
        <div className="ip-spotlight" />
        <div className="ip-stage-wrap">
          <div className="ip-stage">
            <span className="ip-tree ip-tree--s">🌱</span>
            <span className="ip-stage-label">씨앗</span>
          </div>
          <div className="ip-stage ip-stage--center">
            <span className="ip-tree ip-tree--m">🌳</span>
            <span className="ip-stage-label">나무</span>
          </div>
          <div className="ip-stage">
            <span className="ip-tree ip-tree--l">🌲</span>
            <span className="ip-stage-label">숲</span>
          </div>
        </div>
        <p className="ip-visual-caption">당신의 은퇴준비는 어느 단계인가요?</p>
      </div>

      {/* 배지 */}
      <div className="ip-badges">
        <span className="ip-badge">✦ 3분 완성</span>
        <span className="ip-badge">✦ 무료</span>
        <span className="ip-badge">✦ 맞춤 리포트</span>
      </div>

      {/* CTA 상단 */}
      <button className="ip-btn-main" onClick={onStart}>
        지금 바로 확인하기 →
      </button>

      {/* 추천 대상 */}
      <div className="ip-card">
        <h2 className="ip-card-title">이런 분들이 확인하고 있어요</h2>
        <ul className="ip-list">
          <li>노후 생활비가 얼마나 필요한지 궁금한 분</li>
          <li>연금 외 추가 수입원이 필요한 분</li>
          <li>상속·증여세를 미리 준비하고 싶은 분</li>
          <li>자산을 어떻게 관리할지 막막한 분</li>
        </ul>
      </div>

      {/* 진단 영역 */}
      <div className="ip-card">
        <h2 className="ip-card-title">🌳 8가지 영역을 진단합니다</h2>
        <div className="ip-areas">
          {['연금 준비', '생활비 계획', '현금흐름 자산', '주거 전략',
            '의료비 준비', '세금 계획', '자녀 지원', '자산 관리'].map((area) => (
            <span key={area} className="ip-area-tag">{area}</span>
          ))}
        </div>
      </div>

      {/* CTA 하단 */}
      <button className="ip-btn-main" onClick={onStart}>
        무료 진단 시작하기 →
      </button>

      {/* 푸터 */}
      <div className="ip-footer">
        <p>© 2026 주식회사 숲파트너스. All rights reserved.</p>
        <p>
          <a href="https://www.soop-partners.com" target="_blank" rel="noopener noreferrer">
            www.soop-partners.com
          </a>
        </p>
      </div>
    </div>
  );
}
