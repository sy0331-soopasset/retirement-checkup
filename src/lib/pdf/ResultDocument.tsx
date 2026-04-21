import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import path from 'path';
import fs from 'fs';
import type { AnalysisItem, Stage } from '@/lib/types';
import { actionPlans } from '@/data/feedback';
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
  orange: '#EF6C00',
  orangeLight: '#FFF3E0',
  red: '#C62828',
  redLight: '#FFEBEE',
  gray: '#555555',
  grayLight: '#F5F5F5',
  border: '#DDDDDD',
  text: '#222222',
};

const styles = StyleSheet.create({
  page: {
    fontFamily: 'NotoSansKR',
    fontSize: 10,
    color: COLORS.text,
    padding: 36,
    lineHeight: 1.5,
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.teal,
    paddingBottom: 12,
    marginBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  logo: {
    width: 120,
    height: 43,
    marginBottom: 6,
    objectFit: 'contain',
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: COLORS.tealDark,
  },
  meta: {
    fontSize: 9,
    color: COLORS.gray,
    marginTop: 4,
  },
  metaLabel: {
    fontSize: 8,
    color: COLORS.gray,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 10,
    color: COLORS.tealDark,
    fontWeight: 700,
  },
  scoreCard: {
    backgroundColor: COLORS.tealLight,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.teal,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 9,
    color: COLORS.gray,
    marginBottom: 6,
  },
  scoreStageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreStage: {
    fontSize: 18,
    fontWeight: 700,
    color: COLORS.tealDark,
  },
  scoreDesc: {
    fontSize: 18,
    fontWeight: 700,
  },
  scoreRight: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 700,
    color: COLORS.teal,
  },
  scoreTotal: {
    fontSize: 18,
    color: COLORS.gray,
    fontWeight: 400,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: COLORS.tealDark,
    marginTop: 10,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  messageBox: {
    backgroundColor: COLORS.grayLight,
    padding: 12,
    marginBottom: 14,
  },
  messageText: {
    fontSize: 10,
    lineHeight: 1.6,
    color: COLORS.text,
  },
  categoryBlock: {
    marginBottom: 10,
    padding: 10,
    borderLeftWidth: 3,
  },
  categoryExcellent: {
    backgroundColor: COLORS.greenLight,
    borderLeftColor: COLORS.green,
  },
  categoryNormal: {
    backgroundColor: COLORS.orangeLight,
    borderLeftColor: COLORS.orange,
  },
  categoryLacking: {
    backgroundColor: COLORS.redLight,
    borderLeftColor: COLORS.red,
  },
  categoryTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 6,
  },
  categoryTitleExcellent: { color: COLORS.green },
  categoryTitleNormal: { color: COLORS.orange },
  categoryTitleLacking: { color: COLORS.red },
  analysisItem: {
    marginBottom: 6,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  analysisItemLast: {
    marginBottom: 0,
    paddingBottom: 0,
    borderBottomWidth: 0,
  },
  itemName: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 2,
    color: COLORS.text,
  },
  itemFeedback: {
    fontSize: 9,
    color: COLORS.gray,
    lineHeight: 1.5,
  },
  actionPlan: {
    marginTop: 6,
    padding: 12,
    backgroundColor: COLORS.tealLight,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.teal,
  },
  actionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: COLORS.tealDark,
    marginBottom: 6,
  },
  actionRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  actionRank: {
    fontSize: 9,
    fontWeight: 700,
    color: COLORS.teal,
    width: 46,
  },
  actionText: {
    fontSize: 9,
    color: COLORS.text,
    flex: 1,
    lineHeight: 1.5,
  },
  notice: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  noticeTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: COLORS.gray,
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 8,
    color: COLORS.gray,
    lineHeight: 1.5,
    marginBottom: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 36,
    right: 36,
    textAlign: 'center',
    fontSize: 8,
    color: COLORS.gray,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 6,
  },
});

function getStageLabel(stage: Stage): { name: string; desc: string; color: string } {
  if (stage === 'seed') {
    return { name: '씨앗 단계', desc: '은퇴준비 시급', color: COLORS.red };
  }
  if (stage === 'tree') {
    return { name: '나무 단계', desc: '은퇴준비 보완 필요', color: COLORS.orange };
  }
  return { name: '숲 단계', desc: '은퇴준비 양호', color: COLORS.green };
}

function getStageMessage(stage: Stage): string {
  if (stage === 'seed') {
    return '지금 상태는 은퇴 준비가 부족한 씨앗 단계입니다. 하지만 아직 늦은 시점은 아닙니다. 연금, 보험, 현금자산이 각각 따로 흩어져 관리되고 있을 수 있습니다. 지금 필요한 것은 새로운 상품이 아니라 현재 자산을 한 번에 보는 정리입니다. 지금이 뿌리를 내리기 가장 좋은 타이밍입니다.';
  }
  if (stage === 'tree') {
    return '현재는 은퇴 준비가 자라고 있는 나무 단계입니다. 큰 방향은 어느 정도 잡혀 있고 기본 계획도 마련되어 있습니다. 다만 자산이 실제로 잘 자라고 있는지 점검해본 적은 없을 가능성이 큽니다. 연금 외 현금흐름 자산이 부족하거나 세금과 인출 순서를 고려하지 않았을 수 있습니다. 지금은 더 쌓을 때가 아니라 가지를 다듬어 숲을 준비할 시점입니다.';
  }
  return '축하합니다. 현재 상태는 은퇴 준비가 잘 갖춰진 숲 단계에 가깝습니다. 이제 "준비가 되었는가"에 대한 질문은 끝났습니다. 지금부터의 질문은 "이 자산을 어떻게 지킬 것인가"입니다. 세금으로 불필요하게 새는 부분은 없는지, 변동성 리스크에 노출된 자산은 없는지, 은퇴 이후에도 현금흐름이 안정적으로 이어지는지를 점검하세요. 지금이 가장 안정적으로 보호 장치를 구축할 수 있는 타이밍입니다.';
}

function CategorySection({
  items,
  title,
  variant,
}: {
  items: AnalysisItem[];
  title: string;
  variant: 'excellent' | 'normal' | 'lacking';
}) {
  if (items.length === 0) return null;

  const blockStyle =
    variant === 'excellent'
      ? styles.categoryExcellent
      : variant === 'normal'
        ? styles.categoryNormal
        : styles.categoryLacking;

  const titleStyle =
    variant === 'excellent'
      ? styles.categoryTitleExcellent
      : variant === 'normal'
        ? styles.categoryTitleNormal
        : styles.categoryTitleLacking;

  return (
    <View style={[styles.categoryBlock, blockStyle]} wrap={false}>
      <Text style={[styles.categoryTitle, titleStyle]}>{title}</Text>
      {items.map((item, idx) => (
        <View
          key={item.index}
          style={idx === items.length - 1 ? styles.analysisItemLast : styles.analysisItem}
        >
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemFeedback}>{item.feedback}</Text>
        </View>
      ))}
    </View>
  );
}

export function ResultDocument({ totalScore, stage, analysisGroups, generatedAt }: Props) {
  const stageInfo = getStageLabel(stage);
  const message = getStageMessage(stage);

  return (
    <Document
      title="은퇴준비 체크리스트 결과 리포트"
      author="숲파트너스"
      subject="은퇴준비 진단 결과"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image src={LOGO_SRC} style={styles.logo} />
            <Text style={styles.title}>은퇴준비 체크리스트 결과 리포트</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.metaLabel}>발급일</Text>
            <Text style={styles.metaValue}>{generatedAt}</Text>
          </View>
        </View>

        <View style={styles.scoreCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.scoreLabel}>종합 진단 결과</Text>
            <View style={styles.scoreStageRow}>
              <Text style={styles.scoreStage}>{stageInfo.name}</Text>
              <Text style={[styles.scoreDesc, { color: stageInfo.color }]}>{stageInfo.desc}</Text>
            </View>
          </View>
          <View style={styles.scoreRight}>
            <Text style={styles.scoreLabel}>총점</Text>
            <Text style={[styles.scoreValue]}>
              {totalScore}<Text style={styles.scoreTotal}> / 16</Text>
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>단계별 진단 메시지</Text>
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>{message}</Text>
        </View>

        <Text style={styles.sectionTitle}>영역별 상세 분석</Text>
        <CategorySection items={analysisGroups.excellent} title="우수 영역" variant="excellent" />
        <CategorySection items={analysisGroups.normal} title="보완 필요 영역" variant="normal" />
        <CategorySection items={analysisGroups.lacking} title="시급 영역" variant="lacking" />

        {analysisGroups.lacking.length > 0 && (
          <View style={styles.actionPlan}>
            <Text style={styles.actionTitle}>우선 조치 사항</Text>
            {analysisGroups.lacking.map((item, idx) => (
              <View key={item.index} style={styles.actionRow} wrap={false}>
                <Text style={styles.actionRank}>{idx + 1}순위</Text>
                <Text style={styles.actionText}>{actionPlans[item.index]}</Text>
              </View>
            ))}
          </View>
        )}

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
