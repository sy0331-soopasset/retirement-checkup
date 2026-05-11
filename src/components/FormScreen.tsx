'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import { questions } from '@/data/questions';
import { feedbackMessages } from '@/data/feedback';
import { validateConsultationForm } from '@/lib/validation';
import { trackConversion } from '@/lib/analytics';

interface Props {
  totalScore: number;
  userAnswers: string[];
  itemScores: number[];
  utmParams: Record<string, string>;
  onSubmitSuccess: (userName: string) => void;
}

export default function FormScreen({
  totalScore,
  userAnswers,
  itemScores,
  utmParams,
  onSubmitSuccess,
}: Props) {
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [marketingAgreed, setMarketingAgreed] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!privacyAgreed) {
      setError('개인정보 수집 및 이용에 동의해주세요.');
      return;
    }

    const validation = validateConsultationForm({ name, phone });
    if (!validation.valid) {
      setError(validation.error || '입력 값을 확인해주세요.');
      return;
    }

    setSubmitting(true);

    const answers: Record<string, string> = {};
    const analysis = { excellent: [] as string[], normal: [] as string[], lacking: [] as string[] };

    for (let i = 0; i < questions.length; i++) {
      answers[`Q${i + 1}`] = userAnswers[i];
      const categoryName = feedbackMessages[i].name;
      const score = itemScores[i];
      if (score === 2) analysis.excellent.push(categoryName);
      else if (score === 1) analysis.normal.push(categoryName);
      else analysis.lacking.push(categoryName);
    }

    const formData = {
      name,
      phone,
      score: `${totalScore}점 / 16점`,
      privacyAgreed: true,
      marketingAgreed,
      answers,
      analysis: {
        excellent: analysis.excellent.join(', '),
        normal: analysis.normal.join(', '),
        lacking: analysis.lacking.join(', '),
      },
      utm: {
        source: utmParams.utm_source || '',
        medium: utmParams.utm_medium || '',
        campaign: utmParams.utm_campaign || '',
        term: utmParams.utm_term || '',
        content: utmParams.utm_content || '',
      },
    };

    try {
      const res = await fetch('/api/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.result === 'success') {
        trackConversion();
        onSubmitSuccess(name);
      } else {
        setError(data.error || '오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
    } catch {
      setError('서버 통신 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="screen">
      <div className="result-logo">
        <Image
          src="/logo_transparent.png"
          alt="숲파트너스 로고"
          width={150}
          height={54}
        />
      </div>

      {/* 진단 완료 안내 */}
      <div className="form-gate">
        <div className="form-gate-icon">{'\u{2705}'}</div>
        <h2 className="form-gate-title">진단이 완료되었습니다!</h2>
        <p className="form-gate-desc">
          맞춤 리포트 + 무료 상담, 준비됐어요!
          <br />
          이름과 연락처를 입력하면
          <br />
          바로 PDF 다운이 가능합니다.
        </p>
      </div>

      <div className="consultation-form">
        <h3 className="form-title">{'\u{1F4CB}'} 정보 입력 후 결과 확인하기</h3>

        <form onSubmit={handleSubmit}>
          <div className="privacy-notice">
            <h4>개인정보 수집 및 마케팅 이용 안내</h4>
            <div className="privacy-detail">
              <p><strong>수집 항목:</strong> 이름, 연락처</p>
              <p><strong>수집 목적:</strong> 은퇴설계 상담 서비스 제공</p>
              <p><strong>보유 기간:</strong> 상담 완료 후 1년</p>
            </div>
            <label className="privacy-label">
              <input
                type="checkbox"
                checked={privacyAgreed}
                onChange={(e) => setPrivacyAgreed(e.target.checked)}
              />
              <span>[필수] 개인정보 수집·이용 동의 (상담 서비스 제공 목적)</span>
            </label>
            <label className="privacy-label">
              <input
                type="checkbox"
                checked={marketingAgreed}
                onChange={(e) => setMarketingAgreed(e.target.checked)}
              />
              <span>[선택] 마케팅 정보 수신 및 광고성 정보 전송 동의 (전화 및 문자)</span>
            </label>
          </div>

          <div className="form-group">
            <label>이름 (필수)</label>
            <input
              type="text"
              placeholder="홍길동"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={50}
            />
          </div>

          <div className="form-group">
            <label>연락처 (필수)</label>
            <input
              type="tel"
              placeholder="010-0000-0000"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              required
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%' }}
            disabled={submitting}
          >
            {submitting ? '처리 중...' : '\u{1F4CA} 진단 결과 확인하기'}
          </button>
        </form>
      </div>

      <footer className="footer">
        <p>&copy; 2026 주식회사 숲파트너스. All rights reserved.</p>
        <p>
          <a
            href="https://www.soop-partners.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            www.soop-partners.com
          </a>
        </p>
      </footer>
    </div>
  );
}
