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

const SERVICE_OPTIONS = ['은퇴준비', '자산관리', '법인설립', '종합상담'];

export default function FormScreen({
  totalScore,
  userAnswers,
  itemScores,
  utmParams,
  onSubmitSuccess,
}: Props) {
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [asset, setAsset] = useState('');
  const [referral, setReferral] = useState('');
  const [services, setServices] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const toggleService = (service: string) => {
    setServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
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
      email,
      age,
      asset,
      referral,
      score: `${totalScore}점 / 16점`,
      services: services.join(', '),
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
          맞춤 분석 결과와 영역별 상세 리포트가 준비되었습니다.
          <br />
          아래 정보를 입력하시면 <strong>진단 결과를 확인 및 다운받으</strong>실 수 있으며,
          <br />
          전문가의 1:1 무료 상담도 함께 제공됩니다.
        </p>
        <p className="form-gate-note">
          {'\u{1F512}'} 입력하신 정보는 상담 목적으로만 사용되며,<br />상담 후 별도의 상품 가입을 권유하지 않습니다.
        </p>
      </div>

      <div className="consultation-form">
        <h3 className="form-title">{'\u{1F4CB}'} 정보 입력 후 결과 확인하기</h3>

        <form onSubmit={handleSubmit}>
          <div className="privacy-notice">
            <h4>개인정보 수집 및 마케팅 이용 안내</h4>
            <div className="privacy-detail">
              <p><strong>수집 항목:</strong> 이름, 연락처, 이메일, 연령대, 자산규모, 진단점수, 유입경로, 희망서비스</p>
              <p><strong>수집 목적:</strong> 은퇴설계 상담 서비스 제공</p>
              <p><strong>보유 기간:</strong> 상담 완료 후 1년</p>
              <p><strong>마케팅 활용:</strong> 수집된 정보는 은퇴설계 관련 정보 및 맞춤 서비스 안내에 활용될 수 있습니다.</p>
              <p><strong>거부 권리:</strong> 동의를 거부할 권리가 있으며, 거부 시 상담 서비스 이용이 제한됩니다.</p>
            </div>
            <label className="privacy-label">
              <input
                type="checkbox"
                checked={privacyAgreed}
                onChange={(e) => setPrivacyAgreed(e.target.checked)}
              />
              <span>[필수] 위 내용을 확인하였으며 동의합니다.</span>
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
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>이메일 (필수)</label>
            <input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>연령대</label>
            <select value={age} onChange={(e) => setAge(e.target.value)}>
              <option value="">선택하세요</option>
              <option value="30대">30대</option>
              <option value="40대">40대</option>
              <option value="50대">50대</option>
              <option value="60대">60대</option>
              <option value="70대 이상">70대 이상</option>
            </select>
          </div>

          <div className="form-group">
            <label>투자 가능 자산 규모</label>
            <select value={asset} onChange={(e) => setAsset(e.target.value)}>
              <option value="">선택하세요</option>
              <option value="5천만원 미만">5천만원 미만</option>
              <option value="5천만원~1억원">5천만원~1억원</option>
              <option value="1억원~3억원">1억원~3억원</option>
              <option value="3억원~5억원">3억원~5억원</option>
              <option value="5억원 이상">5억원 이상</option>
              <option value="답변 안 함">답변 안 함</option>
            </select>
          </div>

          <div className="form-group">
            <label>어디서 알고 오셨나요?</label>
            <select value={referral} onChange={(e) => setReferral(e.target.value)}>
              <option value="">선택하세요</option>
              <option value="검색">검색</option>
              <option value="광고">광고</option>
              <option value="유튜브">유튜브</option>
              <option value="지인소개">지인소개</option>
              <option value="SNS">SNS</option>
              <option value="기타">기타</option>
            </select>
          </div>

          <div className="form-group">
            <label>상담 희망 서비스</label>
            <div className="checkbox-group">
              {SERVICE_OPTIONS.map((service) => (
                <div key={service} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={`service-${service}`}
                    checked={services.includes(service)}
                    onChange={() => toggleService(service)}
                  />
                  <label htmlFor={`service-${service}`}>{service}</label>
                </div>
              ))}
            </div>
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
