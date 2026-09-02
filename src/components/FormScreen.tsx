'use client';

import { useState, useRef, useCallback, type FormEvent } from 'react';
import Image from 'next/image';
import { questions } from '@/data/questions';
import { feedbackMessages } from '@/data/feedback';
import { validateConsultationForm } from '@/lib/validation';
import { trackConversion, sendGAEvent } from '@/lib/analytics';
import type { Stage } from '@/lib/types';
import ResultThumbnail from './ResultThumbnail';
import LoadingScreen from './LoadingScreen';

interface Props {
  totalScore: number;
  stage: Stage;
  userAnswers: string[];
  itemScores: number[];
  utmParams: Record<string, string>;
  onSubmitSuccess: (
    userName: string,
    marketingAgreed: boolean,
    userEmail: string,
    userPhone: string
  ) => void;
}

export default function FormScreen({
  totalScore,
  stage,
  userAnswers,
  itemScores,
  utmParams,
  onSubmitSuccess,
}: Props) {
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [marketingAgreed, setMarketingAgreed] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [concern, setConcern] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitDone, setSubmitDone] = useState(false);
  const [error, setError] = useState('');
  const [showMarketingPrompt, setShowMarketingPrompt] = useState(false);
  const pendingRef = useRef<{
    name: string;
    marketing: boolean;
    email: string;
    phone: string;
  } | null>(null);

  // 로딩 애니메이션과 서버 응답이 모두 끝났을 때만 결과로 넘어간다
  const handleLoadingComplete = useCallback(() => {
    const pending = pendingRef.current;
    if (!pending) return;
    onSubmitSuccess(pending.name, pending.marketing, pending.email, pending.phone);
  }, [onSubmitSuccess]);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!privacyAgreed) {
      setError('개인정보 수집 및 이용에 동의해주세요.');
      return;
    }

    const validation = validateConsultationForm({ name, phone, email });
    if (!validation.valid) {
      setError(validation.error || '입력 값을 확인해주세요.');
      return;
    }

    // 마케팅 미동의 시 전체 리포트 안내 팝업 노출
    if (!marketingAgreed) {
      setShowMarketingPrompt(true);
      sendGAEvent('marketing_prompt_view');
      return;
    }

    void submitForm(true);
  };

  const submitForm = async (withMarketing: boolean) => {
    setShowMarketingPrompt(false);
    setError('');
    setSubmitting(true);

    const answers: Record<string, string> = {};
    const analysis = { excellent: [] as string[], normal: [] as string[], lacking: [] as string[] };
    const analysisGroups = {
      excellent: [] as { index: number; name: string; score: number; feedback: string }[],
      normal: [] as { index: number; name: string; score: number; feedback: string }[],
      lacking: [] as { index: number; name: string; score: number; feedback: string }[],
    };

    for (let i = 0; i < questions.length; i++) {
      answers[`Q${i + 1}`] = userAnswers[i];
      const score = itemScores[i];
      const categoryName = feedbackMessages[i].name;
      const item = { index: i, name: categoryName, score, feedback: feedbackMessages[i][score] };
      if (score === 2) {
        analysis.excellent.push(categoryName);
        analysisGroups.excellent.push(item);
      } else if (score === 1) {
        analysis.normal.push(categoryName);
        analysisGroups.normal.push(item);
      } else {
        analysis.lacking.push(categoryName);
        analysisGroups.lacking.push(item);
      }
    }

    const formData = {
      name,
      phone,
      email: email.trim(),
      score: `${totalScore}점 / 16점`,
      privacyAgreed: true,
      marketingAgreed: withMarketing,
      concern: concern.trim(),
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
      stage,
      totalScoreNum: totalScore,
      analysisGroups,
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
        sendGAEvent('lead_submit', { marketing_agreed: withMarketing ? 1 : 0 });
        pendingRef.current = {
          name,
          marketing: withMarketing,
          email: email.trim(),
          phone,
        };
        setSubmitDone(true);
      } else {
        setError(data.error || '오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        setSubmitting(false);
      }
    } catch {
      setError('서버 통신 중 오류가 발생했습니다.');
      setSubmitting(false);
    }
  };

  // 제출과 동시에 로딩 화면으로 전환 — 통신은 그 뒤에서 계속된다
  if (submitting) {
    return <LoadingScreen ready={submitDone} onComplete={handleLoadingComplete} />;
  }

  return (
    <div className="screen">
      <div className="result-logo">
        <Image
          src="/logo_transparent.png"
          alt="숲파트너스 — 5060의 선택, 마음 편한 투자"
          width={150}
          height={38}
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

      <ResultThumbnail stage={stage} />

      <div className="consultation-form">
        <h3 className="form-title">{'\u{1F4CB}'} 정보 입력 후 결과 확인하기</h3>

        <form onSubmit={handleSubmit}>
          <div className="privacy-notice">
            <h4>개인정보 수집 및 마케팅 이용 안내</h4>
            <div className="privacy-detail">
              <p><strong>수집 항목:</strong> 이름, 연락처, 이메일</p>
              <p><strong>수집 목적:</strong> 은퇴설계 상담 서비스 제공</p>
              <p><strong>보유 기간:</strong> 상담 완료 후 1년</p>
              <p className="privacy-marketing-note">
                ※ 마케팅 수신 동의 시 전화·문자·이메일로 안내 드립니다. (동의 철회 시까지 보유)
                <br />
                ※ 미동의 시에도 진단은 가능하지만, 간단 보고서만 제공됩니다.
              </p>
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
              <span>[선택] 상담, 맞춤 자료 및 무료 세미나 안내 받기 (마케팅 및 광고성 정보 수신동의)</span>
            </label>
            <p className="privacy-benefit-note">
              {'\u{1F381}'} 마케팅 수신에 동의하시면 <strong>전체 진단 결과</strong>와 함께
              은퇴 준비에 필요한 <strong>전자책</strong>을 보내드립니다.
            </p>
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

          <div className="form-group">
            <label>이메일 (필수)</label>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="soop@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={100}
            />
            <p className="form-field-hint">진단 결과와 전자책을 받으실 주소입니다.</p>
          </div>

          <div className="form-group">
            <label>지금 가장 큰 고민은 무엇인가요? (선택)</label>
            <textarea
              className="form-textarea"
              placeholder={'예) 개인연금을 어떻게 운영해야 할지 모르겠어요\n예) 자녀 증여·상속세를 미리 어떻게 준비해야 할지 궁금해요\n예) 부족한 노후 현금흐름을 어디서 만들어야 할지 막막해요'}
              value={concern}
              onChange={(e) => setConcern(e.target.value)}
              rows={5}
              maxLength={500}
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

      {/* 마케팅 동의 유도 팝업 */}
      {showMarketingPrompt && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="marketing-prompt-title"
        >
          <div className="modal-card">
            <div className="modal-icon">{'\u{1F512}'}</div>
            <h3 className="modal-title" id="marketing-prompt-title">
              마케팅 동의를 안 하시면
              <br />
              <strong>간단 보고서</strong>만 받을 수 있습니다
            </h3>

            <div className="modal-compare">
              <div className="modal-compare-col modal-compare-col--limited">
                <div className="modal-compare-head">간단 보고서</div>
                <ul>
                  <li>총점 &amp; 단계 결과</li>
                  <li>단계별 요약 코멘트</li>
                </ul>
              </div>
              <div className="modal-compare-col modal-compare-col--full">
                <div className="modal-compare-head">전체 리포트</div>
                <ul>
                  <li>8개 영역 상세 분석</li>
                  <li>우선 조치 사항</li>
                  <li>단계별 맞춤 추천</li>
                  <li>결과 PDF 다운로드</li>
                  <li>은퇴 준비 전자책 발송</li>
                </ul>
              </div>
            </div>

            <p className="modal-note">
              동의하시면 전체 진단 결과와 함께 은퇴 준비에 필요한 전자책을 보내드립니다.
              (수신 거부는 언제든 가능합니다.)
            </p>

            <button
              type="button"
              className="btn-primary modal-btn-main"
              onClick={() => {
                setMarketingAgreed(true);
                sendGAEvent('marketing_prompt_agree');
                void submitForm(true);
              }}
              disabled={submitting}
            >
              동의하고 전체 리포트 받기
            </button>
            <button
              type="button"
              className="modal-btn-sub"
              onClick={() => {
                sendGAEvent('marketing_prompt_decline');
                void submitForm(false);
              }}
              disabled={submitting}
            >
              괜찮아요, 간단 보고서만 받을게요
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
