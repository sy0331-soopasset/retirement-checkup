'use client';

import { actionPlans } from '@/data/feedback';
import type { AnalysisItem } from '@/lib/types';

interface AnalysisGroups {
  excellent: AnalysisItem[];
  normal: AnalysisItem[];
  lacking: AnalysisItem[];
}

interface Props {
  groups: AnalysisGroups;
}

function CategorySection({
  items,
  className,
  title,
}: {
  items: AnalysisItem[];
  className: string;
  title: string;
}) {
  if (items.length === 0) return null;

  return (
    <div className={`analysis-category ${className}`}>
      <div className="category-title">{title}</div>
      {items.map((item) => (
        <div key={item.index} className="analysis-item">
          <div className="item-name">{item.name}</div>
          <div className="item-feedback">{item.feedback}</div>
        </div>
      ))}
    </div>
  );
}

export default function DetailedAnalysis({ groups }: Props) {
  return (
    <div className="detailed-analysis">
      <h3>{'\u{1F4CA}'} 영역별 상세 분석</h3>

      <CategorySection items={groups.excellent} className="category-excellent" title={'\u{2705} 우수'} />
      <CategorySection items={groups.normal} className="category-normal" title={'\u{26A0}\u{FE0F} 보완 필요'} />
      <CategorySection items={groups.lacking} className="category-lacking" title={'\u{1F6A8} 시급'} />

      {groups.lacking.length > 0 && (
        <div className="action-plan">
          <h4>{'\u{1F3AF}'} 우선 조치 사항</h4>
          {groups.lacking.map((item, idx) => (
            <div key={item.index} className="action-item">
              <div className="action-rank">{idx + 1}순위:</div>
              <div>{actionPlans[item.index]}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
