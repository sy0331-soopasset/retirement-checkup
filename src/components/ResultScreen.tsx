'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Stage, AnalysisItem } from '@/lib/types';
import ForestResult from './ForestResult';
import DetailedAnalysis from './DetailedAnalysis';

interface AnalysisGroups {
  excellent: AnalysisItem[];
  normal: AnalysisItem[];
  lacking: AnalysisItem[];
}

interface Props {
  totalScore: number;
  stage: Stage;
  analysisGroups: AnalysisGroups;
  userName: string;
  onRestart: () => void;
}

function ResultMessage({ stage }: { stage: Stage }) {
  if (stage === 'seed') {
    return (
      <div className="result-message">
        <h3>{'\u{26A0}\u{FE0F}'} 씨앗 단계 | 은퇴준비 시급</h3>
        <p>
          지금 상태는 은퇴 준비가 부족한 씨앗 단계입니다.
          <br />
          하지만 아직 늦은 시점은 아닙니다. {'\u{23F0}'}
        </p>
        <p className="result-highlight">
          은퇴 후 필요한 생활비를 정확한 숫자보다
          <br />
          감으로 판단하고 있을 가능성이 큽니다.
          <br />
          연금, 보험, 현금자산이 각각
          <br />
          따로 흩어져 관리되고 있을 수 있습니다.
        </p>
        <p className="result-emphasis">
          이 단계에서 가장 위험한 생각은
          <br />
          &quot;나중에 한 번에 정리하면 되겠지&quot;라는 판단입니다.
          <br />
          은퇴 준비는 미룰수록
          <br />
          선택할 수 있는 방법이 빠르게 줄어듭니다.
        </p>
        <p className="result-highlight">
          반대로 지금 정리하면 충분히 방향을 되돌릴 수 있습니다.
          <br />
          지금 필요한 것은 새로운 상품이 아니라
          <br />
          현재 자산을 한 번에 보는 정리입니다. {'\u{1F50E}'}
        </p>
        <p className="result-cta">
          {'\u{1F331}'} 지금이 뿌리를 내리기 가장 좋은 타이밍입니다.
        </p>
      </div>
    );
  }

  if (stage === 'tree') {
    return (
      <div className="result-message">
        <h3>{'\u{1F4CA}'} 나무 단계 | 은퇴준비 보완 필요</h3>
        <p>
          현재는 은퇴 준비가 자라고 있는 나무 단계입니다.
          <br />
          기본적인 준비는 이미 시작하셨습니다. {'\u{1F3C3}\u{200D}\u{27A1}\u{FE0F}'}
        </p>
        <p className="result-highlight">
          큰 방향은 어느 정도 잡혀 있고
          <br />
          은퇴 시점과 필요한 생활비에 대한
          <br />
          기본 계획도 마련되어 있습니다.
        </p>
        <p className="result-highlight">
          다만 자산이 실제로 잘 자라고 있는지
          <br />
          점검해본 적은 없을 가능성이 큽니다.
          <br />
          연금 외 현금흐름 자산이 부족하거나
          <br />
          세금과 인출 순서를 고려하지 않았을 수 있습니다.
        </p>
        <p className="result-emphasis">
          이 단계에서 가장 자주 드는 고민은
          <br />
          &quot;지금 방향이 맞는 걸까?&quot;입니다.
          <br />
          작은 방향 설계의 차이가
          <br />
          은퇴 이후의 안정감을 크게 좌우합니다. {'\u{1F44D}'}
        </p>
        <p className="result-cta">
          지금은 더 쌓을 때가 아니라
          <br />
          {'\u{1F332}'} 가지를 다듬어 숲을 준비할 시점입니다.
        </p>
      </div>
    );
  }

  return (
    <div className="result-message">
      <h3>{'\u{1F389}'} 숲 단계 | 은퇴준비 양호</h3>
      <p>
        축하합니다. 현재 상태는
        <br />
        은퇴 준비가 잘 갖춰진 숲 단계에 가깝습니다. {'\u{1F333}'}
      </p>
      <p className="result-highlight">
        이제 &quot;준비가 되었는가&quot;에 대한 질문은 끝났습니다.
        <br />
        지금부터의 질문은 하나입니다.
        <br />
        &quot;이 자산을 어떻게 지킬 것인가{'\u{2753}'}&quot;
      </p>
      <p className="result-highlight">
        고액 자산가들은 수익보다 자산을 지키는 구조를 먼저 봅니다.
        <br />
        세금으로 불필요하게 새는 부분은 없는지,
        <br />
        변동성 리스크에 노출된 자산은 없는지,
        <br />
        은퇴 이후에도 현금흐름이 안정적으로 이어지는지를 점검합니다.
      </p>
      <p className="result-emphasis">
        잘 준비된 자산일수록 지키는 전략에 따라 격차가 벌어집니다. {'\u{1F6E1}\u{FE0F}'}
        <br />
        이 단계의 상담은 불안해서 받는 점검이 아니라
        <br />
        자산을 단단하게 지키기 위한 선제적 대응입니다.
      </p>
      <p className="result-cta">
        {'\u{2696}\u{FE0F}'} 지금이 가장 안정적으로 보호 장치를 구축할 수 있는 타이밍입니다.
      </p>
    </div>
  );
}

export default function ResultScreen({
  totalScore,
  stage,
  analysisGroups,
  userName,
  onRestart,
}: Props) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      const res = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totalScore, stage, analysisGroups, userName }),
      });

      if (!res.ok) {
        throw new Error('PDF 생성에 실패했습니다.');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        window.open(url, '_blank');
      } else {
        const safeName = (userName || '신청자').trim().replace(/[\\/:*?"<>|]/g, '');
        const a = document.createElement('a');
        a.href = url;
        a.download = `${safeName}님의 은퇴준비체크업 결과.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }

      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (err) {
      console.error(err);
      alert('PDF 다운로드 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsGeneratingPdf(false);
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

      <ForestResult totalScore={totalScore} stage={stage} />
      <ResultMessage stage={stage} />
      <DetailedAnalysis groups={analysisGroups} />

      <div className="legal-notice">
        <p><strong>{'\u{26A0}\u{FE0F}'} 유의사항</strong></p>
        <p>본 진단 결과는 일반적인 은퇴 준비 현황을 점검하기 위한 참고용이며, 개인별 상황에 따라 다를 수 있습니다.</p>
        <p>보다 정확한 은퇴 설계를 위해 전문 상담사와 상담하시기 바랍니다.</p>
        <p>진단 항목은 정기적으로 점검하고 변화된 생활 환경에 맞게 업데이트하시기를 권장합니다.</p>
      </div>

      <button
        className="btn-restart"
        style={{ width: '100%' }}
        onClick={onRestart}
      >
        다시 진단하기
      </button>

      <button
        type="button"
        className="btn-download-pdf"
        onClick={handleDownloadPdf}
        disabled={isGeneratingPdf}
        aria-busy={isGeneratingPdf}
      >
        {isGeneratingPdf ? 'PDF 생성 중...' : '\u{1F4C4} 결과 PDF 다운로드'}
      </button>

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
