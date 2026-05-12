import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import path from 'path';
import fs from 'fs';
import type { AnalysisItem, Stage } from '@/lib/types';
import './fonts';

const logoFilePath = path.join(process.cwd(), 'public', 'logo_transparent.png');
const LOGO_SRC = `data:image/png;base64,${fs.readFileSync(logoFilePath).toString('base64')}`;

interface AnalysisGroups {
  excellent: AnalysisItem[];
  normal: AnalysisItem[];
  lacking: AnalysisItem[];
}

interface Props {
  totalScore: number;
  stage: Stage;
  analysisGroups: AnalysisGroups;
  generatedAt: string;
}

const COLORS = {
  teal: '#008080',
  tealDark: '#006666',
  tealLight: '#E6F2F2',
  green: '#2E7D32',
  greenLight: '#E8F5E9',
  greenMid: '#4CAF50',
  yellow: '#F9A825',
  yellowLight: '#FFFDE7',
  orange: '#E65100',
  orangeLight: '#FFF3E0',
  orangeBorder: '#FF8F00',
  red: '#B71C1C',
  redLight: '#FFEBEE',
  redBorder: '#E53935',
  gray: '#555555',
  grayLight: '#F5F5F5',
  grayMid: '#E0E0E0',
  border: '#DDDDDD',
  text: '#222222',
  white: '#FFFFFF',
};

// **...**로 감싸진 부분을 bold로 파싱
type Segment = { text: string; bold?: boolean };

function parseRich(raw: string): Segment[] {
  const segs: Segment[] = [];
  const re = /\*\*(.*?)\*\*/g;
  let last = 0;
  let m;
  while ((m = re.exec(raw)) !== null) {
    if (m.index > last) segs.push({ text: raw.slice(last, m.index) });
    segs.push({ text: m[1], bold: true });
    last = m.index + m[0].length;
  }
  if (last < raw.length) segs.push({ text: raw.slice(last) });
  return segs;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RichText({ raw, style }: { raw: string; style: any }) {
  const segs = parseRich(raw);
  return (
    <Text style={style}>
      {segs.map((seg, i) =>
        seg.bold ? (
          <Text key={i} style={{ fontWeight: 700 }}>
            {seg.text}
          </Text>
        ) : (
          <Text key={i}>{seg.text}</Text>
        ),
      )}
    </Text>
  );
}

// cashflowConnections — **...** 볼드 마크업 포함
const cashflowTexts: Record<number, { lacking: string; normal: string }> = {
  0: {
    lacking:
      '**생활비 인식 수준**에서 아직 구체적인 목표 금액이 없는 상태입니다. 은퇴 준비는 **"얼마가 필요한가"를 아는 것에서 시작**됩니다. 목표 생활비가 없으면 어느 정도의 현금흐름을 만들어야 하는지 목표 자체가 없는 셈이고, 결국 모든 은퇴 설계가 막연해질 수밖에 없습니다. 현재 월 지출을 파악하고, 은퇴 후 변화될 항목(교통비 감소, 의료비·여가비 증가 등)을 반영해 **목표 생활비를 숫자로 만드는 것이 가장 먼저 해야 할 일**입니다.',
    normal:
      '**생활비 인식 수준**은 대략적으로 파악하고 계시지만, 항목별로 세분화되어 있지 않으면 실제 필요한 현금흐름과 오차가 생길 수 있습니다. 은퇴 후에는 지출 구조 자체가 바뀝니다. 교통비는 줄고, 의료비·여가비는 늘어납니다. 이 변화를 반영한 **정밀한 목표 생활비**가 있어야, 필요한 현금흐름의 규모도 정확하게 설계할 수 있습니다.',
  },
  1: {
    lacking:
      '**연금 자산 파악도**에서 현재 예상 연금액을 확인해본 적이 없는 상태입니다. 연금은 은퇴 후 가장 안정적인 현금흐름 수단입니다. 그런데 얼마를 받게 되는지 모른다면, 추가로 얼마의 현금흐름을 만들어야 하는지도 알 수 없습니다. **국민연금 예상 수령액 조회부터 시작해 전체 연금 수령 계획을 그려보는 것이 필요**합니다.',
    normal:
      '**연금 자산**은 어느 정도 파악되어 있지만, 생활비 전액을 충당하기에는 부족한 상황으로 보입니다. 부족한 금액을 어떤 자산에서, 어떤 주기로 인출할지에 대한 **현금흐름 지도**가 필요합니다. 세금을 최소화하면서 **인출 순서를 최적화**하는 것만으로도 실질 수령액이 달라질 수 있습니다.',
  },
  2: {
    lacking:
      '**현금흐름 자산**이 아직 마련되지 않은 상태입니다. 퇴직금이나 적금을 조금씩 꺼내 쓰는 방식은 언젠가 원금이 바닥나는 구조입니다. 은퇴 설계의 핵심은 **원금을 최대한 유지하면서, 그 원금에서 나오는 이자·배당·임대수입으로 생활비를 충당하는 구조**를 만드는 것입니다. 지금부터라도 **배당주, 리츠, 채권 등 매달 현금이 들어오는 자산을 단계적으로 늘려가야** 합니다.',
    normal:
      '**현금흐름 자산**이 일부 있지만, 아직 생활비 전체를 안정적으로 커버하기에는 부족합니다. 수익률만 좇아 고위험 자산에 집중하는 것보다, **배당·이자·임대 등 정기적인 현금흐름이 나오는 자산의 비중을 높이는 방향**으로 포트폴리오를 조정하는 것이 은퇴 전략에 맞습니다.',
  },
  3: {
    lacking:
      '**주거 전략**이 아직 결정되지 않은 상태입니다. 주거는 단순히 어디서 살까의 문제가 아닙니다. 현재 살고 있는 집의 가치를 어떻게 활용하느냐에 따라, 수억 원의 현금흐름 자산이 생기기도 합니다. 예를 들어 **주택을 다운사이징하면 그 차액을 배당 자산으로 전환**해 매달 현금을 만들 수 있습니다. **주거 전략 하나가 은퇴 자산의 구조 전체를 바꿀 수 있습니다.**',
    normal:
      '**주거**에 대한 방향은 고민 중이시지만, 아직 현금흐름과 연결된 구체적인 전략까지는 그려지지 않은 상태입니다. 각 선택지가 월 지출과 투자 가능 자산에 어떤 영향을 미치는지 숫자로 비교해보면, **어떤 주거 전략이 현금흐름에 가장 유리한지** 보이기 시작합니다.',
  },
  4: {
    lacking:
      '**유동성 관리(비상자금)**가 아직 마련되지 않았습니다. 비상자금이 없으면 예상치 못한 의료비나 긴급 지출이 생겼을 때 주식이나 펀드를 손실 상태에서 팔아야 하는 상황이 발생합니다. 안정적인 현금흐름 포트폴리오를 지키려면, **6개월 생활비는 반드시 즉시 인출 가능한 형태로 분리**해두어야 합니다. 비상자금은 수익률 자산이 아니라, **포트폴리오 전체를 지키는 방패**입니다.',
    normal:
      '**비상자금**이 일부 있지만 아직 충분하지 않습니다. 은퇴 후에는 의료비처럼 예상 밖의 지출이 더 자주, 더 크게 발생합니다. **비상자금이 6개월 생활비 수준으로 확보**되어야, 나머지 자산을 흔들림 없이 현금흐름 창출에 집중시킬 수 있습니다.',
  },
  5: {
    lacking:
      '**의료비 준비**가 아직 계획되지 않은 상태입니다. 65세 이후 연평균 의료비는 300~500만원에 달하며, 암·뇌혈관·심장질환 같은 중증질환이 발생하면 수천만 원이 한 번에 나갈 수 있습니다. 이 규모의 지출을 감당하려면 **보험 보장 범위를 확인하고, 그 위에 안정적인 현금흐름이 받쳐줘야** 합니다. **의료비 리스크는 현금흐름이 탄탄할 때 비로소 흡수**할 수 있습니다.',
    normal:
      '**의료비**는 어느 정도 계획하셨지만, 보험으로 커버되지 않는 **비급여 항목과 본인부담금을 위한 별도 예산**이 필요합니다. 월 현금흐름에서 의료비 예산 항목을 명시적으로 설정해두면, 예상치 못한 지출이 생겨도 전체 자산 계획이 흔들리지 않습니다.',
  },
  6: {
    lacking:
      '**자녀 지원 경계**가 아직 설정되어 있지 않습니다. 중요한 사실은, 자녀를 부담 없이 도울 수 있는 여력도 결국 충분한 현금흐름에서 나온다는 점입니다. 내 생활비를 충당하고도 남는 현금흐름이 있어야, **자녀를 지원하면서도 내 노후 자산을 지킬 수 있습니다.** 현금흐름이 없는 상태에서 자녀를 지원하면 **원금이 깎이는 속도가 예상보다 훨씬 빨라집니다.**',
    normal:
      '**자녀 지원**에 대한 기준은 있지만, 이를 현금흐름 계획과 구체적으로 연결하는 작업이 필요합니다. 매월 내 생활비를 충당하고 남는 여유분에서만 지원한다는 원칙을 세우면, **노후 자산을 지키면서도 자녀를 도울 수 있는 균형점**이 생깁니다.',
  },
  7: {
    lacking:
      '**세금 계획(상속·증여세)**이 아직 준비되지 않은 상태입니다. 많은 분들이 간과하는 것이 있습니다. 상속세 절세 전략을 세우는 것 못지않게 중요한 것은, **세금을 납부할 현금을 미리 확보**해두는 일입니다. **세금 납부 시점에 현금이 없으면 부동산을 급매각해야 하는 상황**이 생깁니다. 결국 상속·증여 전략도, 안정적인 현금흐름이 뒷받침될 때 비로소 원하는 방식으로 실행할 수 있습니다.',
    normal:
      '**상속·증여세**의 대략적인 규모는 파악하고 계시지만, **세금을 실제로 납부할 현금을 어떻게 마련할지**에 대한 계획이 필요합니다. 안정적인 현금흐름 포트폴리오가 있으면, 세금 납부 시점에 자산을 급히 처분하지 않고도 여유 있게 대응할 수 있습니다.',
  },
};

const styles = StyleSheet.create({
  page: {
    fontFamily: 'NotoSansKR',
    fontSize: 10,
    color: COLORS.text,
    padding: 36,
    lineHeight: 1.5,
  },
  // ── 헤더 ──
  header: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.teal,
    paddingBottom: 12,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  logo: { width: 120, height: 43, marginBottom: 6, objectFit: 'contain' },
  title: { fontSize: 20, fontWeight: 700, color: COLORS.tealDark },
  metaLabel: { fontSize: 8, color: COLORS.gray, marginBottom: 2 },
  metaValue: { fontSize: 10, color: COLORS.tealDark, fontWeight: 700 },
  // ── 점수 카드 ──
  scoreCard: {
    backgroundColor: COLORS.tealLight,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.teal,
    padding: 0,
    marginBottom: 14,
    overflow: 'hidden',
  },
  scoreCardInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  scoreLeft: {
    flex: 1,
    padding: 14,
  },
  scoreLabel: { fontSize: 9, color: COLORS.gray, marginBottom: 6 },
  scoreStageRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  scoreStage: { fontSize: 18, fontWeight: 700, color: COLORS.tealDark },
  scoreDesc: { fontSize: 12, fontWeight: 700 },
  // 단계 진행 점 (씨앗 ● ○ ○ / 나무 ● ● ○ / 숲 ● ● ●)
  stageDotsRow: { flexDirection: 'row', gap: 5, marginTop: 8 },
  dotActive: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.teal,
  },
  dotInactive: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.grayMid,
  },
  // 점수 오른쪽 패널
  scoreRight: {
    backgroundColor: COLORS.teal,
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  scoreRightLabel: { fontSize: 8, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  scoreValue: { fontSize: 24, fontWeight: 700, color: COLORS.white },
  scoreTotal: { fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 400 },
  // ── 도입부 ──
  introWrap: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.greenMid,
    marginBottom: 14,
    overflow: 'hidden',
  },
  introLabelBar: {
    backgroundColor: COLORS.greenMid,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  introLabelText: {
    fontSize: 9,
    fontWeight: 700,
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  introBody: {
    backgroundColor: COLORS.white,
    padding: 12,
    borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: COLORS.grayMid,
  },
  introText: { fontSize: 10, lineHeight: 1.65, color: COLORS.text },
  // ── 잘 준비된 영역 ──
  excellentWrap: {
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.greenMid,
  },
  excellentHeader: {
    backgroundColor: COLORS.green,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  excellentHeaderText: { fontSize: 10, fontWeight: 700, color: COLORS.white },
  excellentBody: {
    backgroundColor: COLORS.greenLight,
    padding: 10,
  },
  excellentText: { fontSize: 9, color: COLORS.text, lineHeight: 1.55 },
  // ── 현황 분석 섹션 타이틀 ──
  sectionTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 2,
    gap: 8,
  },
  sectionTitleChip: {
    backgroundColor: COLORS.tealDark,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  sectionTitleChipText: {
    fontSize: 10,
    fontWeight: 700,
    color: COLORS.white,
  },
  sectionTitleLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  // ── 시급 / 보완 분석 항목 ──
  urgentBlock: {
    backgroundColor: COLORS.redLight,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.redBorder,
    padding: 10,
    marginBottom: 8,
  },
  normalBlock: {
    backgroundColor: COLORS.orangeLight,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.orangeBorder,
    padding: 10,
    marginBottom: 8,
  },
  itemHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    gap: 5,
  },
  urgentBadge: {
    fontSize: 8, fontWeight: 700, color: COLORS.white,
    backgroundColor: COLORS.red,
    paddingHorizontal: 5, paddingVertical: 2,
  },
  normalBadge: {
    fontSize: 8, fontWeight: 700, color: COLORS.white,
    backgroundColor: COLORS.orange,
    paddingHorizontal: 5, paddingVertical: 2,
  },
  itemTitle: { fontSize: 10, fontWeight: 700, color: COLORS.text },
  itemBody: { fontSize: 9, color: '#444', lineHeight: 1.6 },
  // ── 핵심 인사이트 ──
  insightWrap: {
    marginTop: 12,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.greenMid,
  },
  insightHeader: {
    backgroundColor: COLORS.green,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  insightHeaderText: { fontSize: 10, fontWeight: 700, color: COLORS.white },
  insightBody: {
    backgroundColor: COLORS.greenLight,
    padding: 12,
  },
  insightText: { fontSize: 9, color: COLORS.text, lineHeight: 1.65, marginBottom: 6 },
  insightTextLast: { fontSize: 9, color: COLORS.text, lineHeight: 1.65 },
  // ── 다음 단계 ──
  conclusionWrap: {
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.yellow,
  },
  conclusionHeader: {
    backgroundColor: COLORS.yellow,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  conclusionHeaderText: { fontSize: 10, fontWeight: 700, color: COLORS.white },
  conclusionBody: {
    backgroundColor: COLORS.yellowLight,
    padding: 12,
  },
  conclusionText: { fontSize: 9, color: COLORS.text, lineHeight: 1.65 },
  // ── 유의사항 ──
  notice: {
    marginTop: 8,
    padding: 10,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  noticeTitle: { fontSize: 9, fontWeight: 700, color: COLORS.gray, marginBottom: 4 },
  noticeText: { fontSize: 8, color: COLORS.gray, lineHeight: 1.5, marginBottom: 2 },
  // ── 푸터 ──
  footer: {
    position: 'absolute',
    bottom: 20, left: 36, right: 36,
    textAlign: 'center',
    fontSize: 8,
    color: COLORS.gray,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 6,
  },
});

function getStageInfo(stage: Stage): { name: string; desc: string; color: string; dots: [boolean, boolean, boolean] } {
  if (stage === 'seed') return { name: '씨앗 단계', desc: '은퇴준비 시급', color: COLORS.red, dots: [true, false, false] };
  if (stage === 'tree') return { name: '나무 단계', desc: '은퇴준비 보완 필요', color: COLORS.orange, dots: [true, true, false] };
  return { name: '숲 단계', desc: '은퇴준비 양호', color: COLORS.green, dots: [true, true, true] };
}

function getStageIntroText(stage: Stage, totalScore: number): string {
  if (stage === 'seed') {
    return `이번 진단 결과, 총 **${totalScore}점(16점 만점)**으로 **씨앗 단계**에 해당합니다. 은퇴 준비의 여러 영역에서 아직 구체적인 계획이 만들어지지 않은 상태입니다. 다만, 지금 이 시점에 현황을 점검하고 있다는 것 자체가 의미 있는 첫걸음입니다. **지금부터 하나씩 방향을 잡아가면 충분히 바꿀 수 있는 시점**입니다.`;
  }
  if (stage === 'tree') {
    return `이번 진단 결과, 총 **${totalScore}점(16점 만점)**으로 **나무 단계**에 해당합니다. 기본적인 은퇴 준비는 시작되어 있고, 큰 방향은 어느 정도 잡혀 있습니다. 이제 남은 과제는 몇 가지 핵심 영역을 보완해 **은퇴 후 현금흐름을 더욱 안정적으로 구조화**하는 것입니다.`;
  }
  return `이번 진단 결과, 총 **${totalScore}점(16점 만점)**으로 **숲 단계**에 해당합니다. 전반적으로 은퇴 준비가 잘 갖춰진 상태입니다. 이 단계에서의 핵심 과제는 '더 준비하는 것'이 아니라, **이미 갖춰진 자산을 어떻게 지키고 최적화할 것인가**입니다.`;
}

export function ResultDocument({ totalScore, stage, analysisGroups, generatedAt }: Props) {
  const stageInfo = getStageInfo(stage);
  const introText = getStageIntroText(stage, totalScore);
  const needsWork = [...analysisGroups.lacking, ...analysisGroups.normal];

  return (
    <Document
      title="은퇴준비 체크리스트 결과 리포트"
      author="숲파트너스"
      subject="은퇴준비 진단 결과"
    >
      <Page size="A4" style={styles.page}>

        {/* 헤더 */}
        <View style={styles.header}>
          <View>
            <Image src={LOGO_SRC} style={styles.logo} />
            <Text style={styles.title}>은퇴준비 체크리스트 결과 리포트</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.metaLabel}>발급일</Text>
            <Text style={styles.metaValue}>{generatedAt}</Text>
          </View>
        </View>

        {/* 점수 카드 */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreCardInner}>
            <View style={styles.scoreLeft}>
              <Text style={styles.scoreLabel}>종합 진단 결과</Text>
              <View style={styles.scoreStageRow}>
                <Text style={styles.scoreStage}>{stageInfo.name}</Text>
                <Text style={[styles.scoreDesc, { color: stageInfo.color }]}>{stageInfo.desc}</Text>
              </View>
              <View style={styles.stageDotsRow}>
                <View style={stageInfo.dots[0] ? styles.dotActive : styles.dotInactive} />
                <View style={stageInfo.dots[1] ? styles.dotActive : styles.dotInactive} />
                <View style={stageInfo.dots[2] ? styles.dotActive : styles.dotInactive} />
              </View>
            </View>
            <View style={styles.scoreRight}>
              <Text style={styles.scoreRightLabel}>총점</Text>
              <Text style={styles.scoreValue}>
                {totalScore}<Text style={styles.scoreTotal}>/16</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* 도입부 */}
        <View style={styles.introWrap}>
          <View style={styles.introLabelBar}>
            <Text style={styles.introLabelText}>진단 요약</Text>
          </View>
          <View style={styles.introBody}>
            <RichText raw={introText} style={styles.introText} />
          </View>
        </View>

        {/* 잘 준비된 영역 */}
        {analysisGroups.excellent.length > 0 && (
          <View style={styles.excellentWrap} wrap={false}>
            <View style={styles.excellentHeader}>
              <Text style={styles.excellentHeaderText}>
                잘 준비된 영역
              </Text>
            </View>
            <View style={styles.excellentBody}>
              <Text style={styles.excellentText}>
                <Text style={{ fontWeight: 700 }}>
                  {analysisGroups.excellent.map((e) => e.name).join(', ')}
                </Text>
                {' '}영역은 충분히 준비되어 있습니다. 이 부분들이 은퇴 설계의 기반을 형성하고 있으며, 아래 보완 영역들이 채워지면 훨씬 더 탄탄한 구조가 완성됩니다.
              </Text>
            </View>
          </View>
        )}

        {/* 현황 분석 */}
        {needsWork.length > 0 && (
          <View>
            <View style={styles.sectionTitleWrap}>
              <View style={styles.sectionTitleChip}>
                <Text style={styles.sectionTitleChipText}>현황 분석</Text>
              </View>
              <View style={styles.sectionTitleLine} />
            </View>
            {needsWork.map((item) => {
              const isUrgent = item.score === 0;
              const raw =
                cashflowTexts[item.index]?.[isUrgent ? 'lacking' : 'normal'] ?? item.feedback;
              return (
                <View
                  key={item.index}
                  style={isUrgent ? styles.urgentBlock : styles.normalBlock}
                  wrap={false}
                >
                  <View style={styles.itemHeaderRow}>
                    <Text style={isUrgent ? styles.urgentBadge : styles.normalBadge}>
                      {isUrgent ? '시급' : '보완'}
                    </Text>
                    <Text style={styles.itemTitle}>{item.name}</Text>
                  </View>
                  <RichText raw={raw} style={styles.itemBody} />
                </View>
              );
            })}
          </View>
        )}

        {/* 핵심 인사이트 */}
        <View style={styles.insightWrap} wrap={false}>
          <View style={styles.insightHeader}>
            <Text style={styles.insightHeaderText}>핵심 인사이트 — 모든 길은 현금흐름으로</Text>
          </View>
          <View style={styles.insightBody}>
            <RichText
              raw="위에서 살펴본 생활비, 연금, 주거, 의료비, 자녀 지원, 세금 — 이 모든 항목은 각각 별개의 문제처럼 보이지만, 사실 하나의 공통 뿌리로 연결되어 있습니다. 바로 **매달 안정적으로 들어오는 현금흐름**입니다."
              style={styles.insightText}
            />
            <RichText
              raw={'생활비를 충당할 현금흐름이 있으면 의료비가 갑자기 생겨도 흔들리지 않습니다. 현금흐름이 탄탄하면 자녀를 지원하면서도 내 노후 자산은 지킬 수 있습니다. 상속세를 낼 여유 현금이 있으면, 부동산을 급매각할 필요가 없습니다. 결국 은퇴 설계의 모든 고민은 **"매달 얼마의 현금이, 어디서, 어떻게 들어오는가"**로 귀결됩니다.'}
              style={styles.insightText}
            />
            <RichText
              raw="현금흐름을 만드는 방법은 하나가 아닙니다. 배당주, 리츠, 채권, 임대수입, 연금 최적화, 주거 다운사이징까지 — 각자의 자산 구조와 상황에 맞게 조합하는 것이 핵심입니다. 지금 당장 새로운 상품을 사거나 바꾸는 것이 아니라, **먼저 내 자산 전체를 한눈에 보고 현금흐름 지도를 그리는 것부터 시작**해야 합니다."
              style={styles.insightTextLast}
            />
          </View>
        </View>

        {/* 다음 단계 */}
        <View style={styles.conclusionWrap} wrap={false}>
          <View style={styles.conclusionHeader}>
            <Text style={styles.conclusionHeaderText}>다음 단계</Text>
          </View>
          <View style={styles.conclusionBody}>
            <RichText
              raw="지금 바로 할 수 있는 한 가지를 제안한다면, **현재 자산 목록을 한 장에 정리해보는 것**입니다. 부동산, 금융자산, 연금, 보험을 한 페이지에 모아놓고 나면 — 어디서 현금흐름이 나오고, 어디가 비어 있는지가 보이기 시작합니다. 그 다음 단계는 **전문가와 함께 현금흐름 지도를 완성하는 것**입니다."
              style={styles.conclusionText}
            />
          </View>
        </View>

        {/* 유의사항 */}
        <View style={styles.notice} wrap={false}>
          <Text style={styles.noticeTitle}>유의사항</Text>
          <Text style={styles.noticeText}>
            본 진단 결과는 일반적인 은퇴 준비 현황을 점검하기 위한 참고용이며, 개인별 상황에 따라 다를 수 있습니다.
          </Text>
          <Text style={styles.noticeText}>
            보다 정확한 은퇴 설계를 위해 전문 상담사와 상담하시기 바랍니다.
          </Text>
          <Text style={styles.noticeText}>
            진단 항목은 정기적으로 점검하고 변화된 생활 환경에 맞게 업데이트하시기를 권장합니다.
          </Text>
        </View>

        <Text style={styles.footer} fixed>
          (C) 2026 주식회사 숲파트너스. All rights reserved. | www.soop-partners.com
        </Text>

      </Page>
    </Document>
  );
}
