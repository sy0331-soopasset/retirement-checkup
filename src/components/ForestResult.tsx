'use client';

import type { Stage } from '@/lib/types';

interface Props {
  totalScore: number;
  stage: Stage;
}

const stageConfig = {
  seed: {
    className: 'seed-stage',
    icon: '\u{1F331}',
    name: '씨앗 단계',
    tagline: '은퇴준비의 씨앗을 뿌릴 때입니다',
    description: '지금은 씨앗 단계지만,\n지금 심으면 충분히 풍요로운 숲을 만들 수 있습니다.',
    activeCheckpoints: [true, false, false],
  },
  tree: {
    className: 'grow-stage',
    icon: '\u{1F332}',
    name: '나무 단계',
    tagline: '은퇴준비 나무가 자라고 있습니다',
    description: '기본은 잘 다져졌습니다!\n이제 더욱 튼튼하게 가지를 뻗을 차례입니다.',
    activeCheckpoints: [true, true, false],
  },
  forest: {
    className: 'forest-stage',
    icon: '\u{1F333}\u{1F332}\u{1F333}',
    name: '숲 단계',
    tagline: '풍요로운 은퇴의 숲이 완성되었습니다',
    description: '훌륭합니다!\n안정적인 노후를 위한 준비가 잘 되어있습니다.',
    activeCheckpoints: [true, true, true],
  },
};

export default function ForestResult({ stage }: Props) {
  const config = stageConfig[stage];

  return (
    <div className={`forest-result ${config.className}`}>
      <div className="tree-icon">{config.icon}</div>
      <h2 className="stage-name">{config.name}</h2>
      <p className="stage-tagline">{config.tagline}</p>

      <div className="forest-progress">
        <div className="progress-track">
          {['\u{1F331}', '\u{1F332}', '\u{1F333}'].map((icon, idx) => (
            <div
              key={idx}
              className={`checkpoint ${config.activeCheckpoints[idx] ? 'active' : ''}`}
            >
              <div className="checkpoint-icon">{icon}</div>
              <div className="checkpoint-dot" />
            </div>
          ))}
        </div>
      </div>

      <div className="stage-description">
        {config.description.split('\n').map((line, i) => (
          <span key={i}>
            {line}
            {i < config.description.split('\n').length - 1 && <br />}
          </span>
        ))}
      </div>
    </div>
  );
}
