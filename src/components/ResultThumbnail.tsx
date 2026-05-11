'use client';

import type { Stage } from '@/lib/types';

const stageConfig = {
  seed: {
    icon: '🌱',
    name: '씨앗 단계',
    preview: `지금 상태는 은퇴 준비가 부족한 씨앗 단계입니다.
하지만 아직 늦은 시점은 아닙니다.

은퇴 후 필요한 생활비를 감으로 판단하고 있을 가능성이 큽니다.
연금, 보험, 현금자산이 따로 흩어져 관리되고 있을 수 있습니다.

이 단계에서 가장 위험한 생각은
"나중에 한 번에 정리하면 되겠지"라는 판단입니다.`,
  },
  tree: {
    icon: '🌲',
    name: '나무 단계',
    preview: `현재는 은퇴 준비가 자라고 있는 나무 단계입니다.
기본적인 준비는 이미 시작하셨습니다.

큰 방향은 어느 정도 잡혀 있고
은퇴 시점과 필요한 생활비에 대한 기본 계획도 마련되어 있습니다.

다만 자산이 실제로 잘 자라고 있는지
점검해본 적은 없을 가능성이 큽니다.`,
  },
  forest: {
    icon: '🌳',
    name: '숲 단계',
    preview: `축하합니다. 현재 상태는
은퇴 준비가 잘 갖춰진 숲 단계에 가깝습니다.

이제 "준비가 되었는가"에 대한 질문은 끝났습니다.
지금부터의 질문은 하나입니다.
"이 자산을 어떻게 지킬 것인가?"

고액 자산가들은 수익보다 자산을 지키는 구조를 먼저 봅니다.`,
  },
};

export default function ResultThumbnail({ stage }: { stage: Stage }) {
  const { icon, name, preview } = stageConfig[stage];

  return (
    <div className="result-thumbnail">
      <div className="thumbnail-badge">
        <span className="thumbnail-icon">{icon}</span>
        <span className="thumbnail-stage-name">당신은 <strong>{name}</strong>입니다</span>
      </div>
      <div className="thumbnail-blur-wrap">
        <p className="thumbnail-blur-text">{preview}</p>
        <div className="thumbnail-overlay">
          <span className="thumbnail-lock">🔒</span>
          <p className="thumbnail-overlay-text">
            아래 정보를 입력하면
            <br />
            <strong>전체 분석 결과</strong>를 확인할 수 있어요
          </p>
        </div>
      </div>
    </div>
  );
}
