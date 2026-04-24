'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface Props {
  onStart: () => void;
}

const STAGE_DURATION = 1800;

export default function IntroScreen({ onStart }: Props) {
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % 3);
    }, STAGE_DURATION);
    return () => clearInterval(interval);
  }, []);

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
          은퇴준비, 나는 지금<br />어느 단계일까요?
        </h1>
      </div>

      {/* 메인 비주얼 */}
      <div className="ip-visual">
        <div className="ip-spotlight" />
        <div className="ip-stage-wrap">
          {[
            { emoji: '🌱', label: '씨앗', cls: 'ip-tree--s' },
            { emoji: '🌳', label: '나무', cls: 'ip-tree--m' },
            { emoji: '🌲', label: '숲',   cls: 'ip-tree--l' },
          ].map((item, idx) => (
            <div key={idx} className="ip-stage">
              <span className={`ip-tree ${item.cls}${activeStage === idx ? ' ip-tree--active' : ''}`}>
                {item.emoji}
              </span>
              <span className={`ip-stage-label${activeStage === idx ? ' ip-stage-label--active' : ''}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
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
        <h2 className="ip-card-title">📊 8가지 영역을 진단합니다</h2>
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
        <div className="ip-footer-biz">
          <p>주식회사 숲파트너스 | 대표이사: 조경석</p>
          <p>사업자등록번호: 332-87-03604</p>
          <p>서울시 서초구 서초대로 60길 18 6층 (교대 정인빌딩)</p>
        </div>
        <div className="ip-footer-copy">
          <p>© 2026 주식회사 숲파트너스. All rights reserved.</p>
          <p>
            <a href="https://www.soop-partners.com" target="_blank" rel="noopener noreferrer">
              www.soop-partners.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
