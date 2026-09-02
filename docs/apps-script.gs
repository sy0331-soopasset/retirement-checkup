/**
 * 은퇴진단 체크리스트 — Google Apps Script
 *
 * 스프레드시트 열 구성 (좌 → 우)
 *  A 타임스탬프 / B 이름 / C 연락처 / D 이메일(신규) / E 점수
 *  F 개인정보동의 / G 마케팅동의 / H~O Q1~Q8
 *  P 우수 / Q 보완 / R 시급 / S 광고소스 / T 캠페인 / U 고민 / V 리포트유형(신규)
 *
 * ※ 적용 전 시트 작업 (순서대로)
 *   1) 기존 C열(연락처) 오른쪽에 열 1개 삽입 → 헤더 '이메일'
 *   2) 마지막 열(고민) 오른쪽에 열 1개 추가 → 헤더 '리포트유형'
 */

// ===== 설정 =====
var ADMIN_EMAIL = 'sy0331@soopasset.com';
var SENDER_NAME = '숲파트너스';

// 은퇴 준비 전자책 PDF의 구글 드라이브 파일 ID.
// 드라이브에서 파일 우클릭 → 링크 복사 →
// https://drive.google.com/file/d/[이 부분이 파일 ID]/view
// 파일 공유 설정은 '링크가 있는 모든 사용자'가 아니어도 됩니다(스크립트 소유자 권한으로 첨부).
// 비워두면 전자책 없이 결과 PDF만 발송됩니다.
var EBOOK_FILE_ID = '';

// 열 번호 (1부터)
var COL_NAME = 2;
var COL_PHONE = 3;
var COL_EMAIL = 4;
var COL_MARKETING = 7;
var COL_REPORT_TYPE = 22;

// ===== 진입점 =====
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    // 결과 화면에서 뒤늦게 마케팅 수신에 동의한 경우
    if (data.action === 'marketingConsent') {
      return handleMarketingConsent(data);
    }

    return handleSubmission(data);
  } catch (error) {
    return jsonOut({ result: 'error', error: error.toString() });
  }
}

// ===== 신규 진단 신청 =====
function handleSubmission(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var answers = data.answers || {};
  var excellent = (data.analysis && data.analysis.excellent) || '-';
  var normal = (data.analysis && data.analysis.normal) || '-';
  var lacking = (data.analysis && data.analysis.lacking) || '-';
  var stageLabel = getStageLabel(data.stage, Number(data.totalScoreNum));
  var isFull = data.reportType === 'full' || data.marketingAgreed === true;

  // 1. 스프레드시트 저장
  sheet.appendRow([
    new Date(),
    data.name,
    data.phone,
    data.email || '',
    data.score,
    data.privacyAgreed ? 'O' : 'X',
    data.marketingAgreed ? 'O' : 'X',
    getAnswerNum(answers['Q1']),
    getAnswerNum(answers['Q2']),
    getAnswerNum(answers['Q3']),
    getAnswerNum(answers['Q4']),
    getAnswerNum(answers['Q5']),
    getAnswerNum(answers['Q6']),
    getAnswerNum(answers['Q7']),
    getAnswerNum(answers['Q8']),
    excellent,
    normal,
    lacking,
    (data.utm && data.utm.source) || '',
    (data.utm && data.utm.campaign) || '',
    data.concern || '',
    isFull ? '전체' : '간단'
  ]);

  // 2. 관리자 알림 메일
  sendAdminMail(data, stageLabel, excellent, normal, lacking, isFull);

  // 3. 마케팅 동의자에게만 결과 리포트 + 전자책 발송
  if (isFull) {
    sendUserReport(data, stageLabel);
  }

  return jsonOut({ result: 'success' });
}

// ===== 결과 화면에서 뒤늦게 마케팅 동의 =====
function handleMarketingConsent(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var stageLabel = getStageLabel(data.stage, Number(data.totalScoreNum));

  // 이름 + 연락처로 가장 최근 행을 찾아 동의 값 갱신
  var rowIndex = findRow(sheet, data.name, data.phone);
  if (rowIndex > 0) {
    sheet.getRange(rowIndex, COL_MARKETING).setValue('O');
    sheet.getRange(rowIndex, COL_REPORT_TYPE).setValue('전체(사후동의)');
    if (data.email) {
      sheet.getRange(rowIndex, COL_EMAIL).setValue(data.email);
    }
  }

  // 결과 리포트 + 전자책 발송
  sendUserReport(data, stageLabel);

  // 관리자에게 사후 동의 사실 알림
  if (isValidEmail(ADMIN_EMAIL)) {
    MailApp.sendEmail({
      to: ADMIN_EMAIL,
      subject: '[사후 마케팅 동의] ' + data.name + '님 / ' + stageLabel,
      htmlBody:
        '<div style="font-family:Malgun Gothic,dotum,sans-serif;line-height:1.7;">' +
        '<p><strong>' + data.name + '</strong>님이 결과 화면에서 마케팅 수신에 동의했습니다.</p>' +
        '<p>연락처: ' + data.phone + '<br>이메일: ' + (data.email || '-') + '</p>' +
        '<p>' + (rowIndex > 0
          ? '시트 ' + rowIndex + '행의 마케팅 동의를 O로 갱신했습니다.'
          : '⚠️ 시트에서 해당 행을 찾지 못했습니다. 수동 확인이 필요합니다.') + '</p>' +
        '</div>'
    });
  }

  return jsonOut({ result: 'success' });
}

// ===== 단계별 정보 =====
var STAGE_INFO = {
  seed: {
    emoji: '🌱',
    name: '씨앗 단계',
    line: '아직 늦지 않았습니다. 지금 정리하면 충분히 방향을 되돌릴 수 있는 시점입니다.'
  },
  tree: {
    emoji: '🌳',
    name: '나무 단계',
    line: '기본은 이미 다져졌습니다. 이제 가지를 다듬어 숲을 준비할 차례입니다.'
  },
  forest: {
    emoji: '🌲',
    name: '숲 단계',
    line: '잘 준비된 자산일수록, 지키는 전략에 따라 격차가 벌어집니다.'
  }
};

function getStageInfo(stage, score) {
  if (STAGE_INFO[stage]) return STAGE_INFO[stage];
  if (score <= 5) return STAGE_INFO.seed;
  if (score <= 11) return STAGE_INFO.tree;
  return STAGE_INFO.forest;
}

// ===== 신청자에게 결과 + 전자책 발송 =====
function sendUserReport(data, stageLabel) {
  if (!isValidEmail(data.email)) return;

  var info = getStageInfo(data.stage, Number(data.totalScoreNum));
  var name = data.name;
  var attachments = [];

  if (data.pdfBase64) {
    attachments.push(Utilities.newBlob(
      Utilities.base64Decode(data.pdfBase64),
      'application/pdf',
      name + '님_은퇴준비체크업_결과.pdf'
    ));
  }

  if (EBOOK_FILE_ID) {
    try {
      attachments.push(DriveApp.getFileById(EBOOK_FILE_ID).getBlob());
    } catch (err) {
      console.error('전자책 첨부 실패: ' + err);
    }
  }

  // 첨부 자료 목록
  function fileItem(icon, title, desc) {
    return '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:8px;">' +
      '<tr>' +
        '<td width="44" valign="top" style="padding:12px 0 12px 14px;font-size:20px;line-height:1;">' + icon + '</td>' +
        '<td valign="top" style="padding:12px 14px 12px 0;">' +
          '<div style="font-size:14px;font-weight:bold;color:#1a1a1a;line-height:1.5;">' + title + '</div>' +
          '<div style="font-size:12px;color:#7a7a7a;line-height:1.5;margin-top:2px;">' + desc + '</div>' +
        '</td>' +
      '</tr>' +
    '</table>';
  }

  var fileSection = '';
  if (attachments.length > 0) {
    var items = '';
    if (data.pdfBase64) {
      items += fileItem('📄', '은퇴준비 체크업 상세 결과 리포트',
                        '8개 영역별 분석과 우선 조치 사항이 담겨 있습니다');
    }
    if (EBOOK_FILE_ID) {
      items += fileItem('📗', '은퇴 준비 가이드 전자책',
                        '노후 현금흐름과 절세 전략을 정리했습니다');
    }
    fileSection =
      '<tr><td style="padding:26px 28px 0;">' +
        '<div style="font-size:13px;font-weight:bold;color:#053c3c;letter-spacing:0.3px;margin-bottom:10px;">' +
          '함께 보내드린 자료' +
        '</div>' +
        '<div style="background-color:#f7f7f5;border:1px solid #e6e4de;border-radius:10px;padding:4px 0;">' +
          items +
        '</div>' +
      '</td></tr>';
  }

  var scoreRow = data.score
    ? '<div style="font-size:14px;color:#4a7a6e;margin-top:6px;">' + data.score + '</div>'
    : '';

  var font = 'Apple SD Gothic Neo,Malgun Gothic,dotum,sans-serif';

  var htmlBody =
    '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f2f1ee;margin:0;padding:24px 12px;">' +
    '<tr><td align="center">' +

      '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:14px;overflow:hidden;">' +

        // 브랜드 헤더
        '<tr><td align="center" style="background-color:#053c3c;padding:28px 24px;">' +
          '<img src="https://retirement-checkup.vercel.app/logo_beige.png" alt="숲파트너스" width="180" ' +
            'style="display:block;width:180px;max-width:60%;height:auto;border:0;outline:none;">' +
        '</td></tr>' +

        // 인사
        '<tr><td style="padding:34px 28px 0;font-family:' + font + ';">' +
          '<div style="font-size:13px;color:#0a5555;font-weight:bold;letter-spacing:0.5px;margin-bottom:8px;">' +
            '은퇴준비 체크업 결과' +
          '</div>' +
          '<div style="font-size:22px;line-height:1.45;color:#1a1a1a;font-weight:bold;margin-bottom:16px;">' +
            name + '님의 진단 결과가<br>도착했습니다' +
          '</div>' +
          '<div style="font-size:15px;line-height:1.8;color:#5a5a5a;">' +
            '안녕하세요, ' + name + '님.<br>' +
            '숲파트너스 은퇴준비 체크리스트를 이용해 주셔서 감사합니다.' +
          '</div>' +
        '</td></tr>' +

        // 결과 카드
        '<tr><td style="padding:22px 28px 0;font-family:' + font + ';">' +
          '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" ' +
            'style="background-color:#eef5f2;border:1px solid #cfe0d8;border-radius:12px;">' +
            '<tr><td align="center" style="padding:26px 22px;">' +
              '<div style="font-size:40px;line-height:1;margin-bottom:12px;">' + info.emoji + '</div>' +
              '<div style="font-size:11px;color:#5b8378;font-weight:bold;letter-spacing:1.5px;margin-bottom:6px;">' +
                '진단 결과' +
              '</div>' +
              '<div style="font-size:24px;color:#053c3c;font-weight:bold;line-height:1.3;">' + info.name + '</div>' +
              scoreRow +
              '<div style="margin-top:16px;padding-top:16px;border-top:1px solid #cfe0d8;font-size:14px;color:#3d6b60;line-height:1.7;">' +
                info.line +
              '</div>' +
            '</td></tr>' +
          '</table>' +
        '</td></tr>' +

        // 첨부 자료
        fileSection +

        // 상담 안내
        '<tr><td style="padding:28px 28px 0;font-family:' + font + ';">' +
          '<div style="font-size:15px;line-height:1.8;color:#5a5a5a;">' +
            '더 자세한 상담이 필요하시면 언제든 편하게 연락 주세요.<br>' +
            '전문 상담사가 ' + name + '님의 상황에 맞는 방향을<br>함께 정리해 드리겠습니다.' +
          '</div>' +
        '</td></tr>' +

        // CTA
        '<tr><td align="center" style="padding:24px 28px 4px;">' +
          '<table role="presentation" cellpadding="0" cellspacing="0" border="0">' +
            '<tr><td align="center" style="background-color:#053c3c;border-radius:8px;">' +
              '<a href="https://www.soop-partners.com" target="_blank" ' +
                'style="display:inline-block;padding:15px 34px;font-family:' + font + ';' +
                'font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;">' +
                '상담 문의하기' +
              '</a>' +
            '</td></tr>' +
          '</table>' +
        '</td></tr>' +

        // 푸터
        '<tr><td style="padding:28px;">' +
          '<div style="border-top:1px solid #ececea;padding-top:20px;font-family:' + font + ';' +
            'font-size:12px;color:#9a9a9a;line-height:1.75;">' +
            '<a href="https://www.soop-partners.com" target="_blank" style="color:#9a9a9a;text-decoration:none;">' +
              '주식회사 숲파트너스 &nbsp;|&nbsp; 대표이사 조경석<br>' +
              '서울시 서초구 서초대로 60길 18 6층 (교대 정인빌딩)' +
            '</a>' +
            '<div style="margin-top:12px;color:#b0b0b0;">' +
              '본 메일은 마케팅 정보 수신에 동의하신 분께 발송됩니다.<br>' +
              '수신을 원하지 않으시면 회신으로 알려주시면 즉시 처리해 드립니다.' +
            '</div>' +
          '</div>' +
        '</td></tr>' +

      '</table>' +

    '</td></tr>' +
    '</table>';

  var options = {
    to: data.email,
    subject: '[숲파트너스] ' + name + '님의 은퇴준비 진단 결과입니다',
    htmlBody: htmlBody,
    name: SENDER_NAME
  };
  if (attachments.length > 0) options.attachments = attachments;

  MailApp.sendEmail(options);
}

// ===== 관리자 알림 메일 =====
function sendAdminMail(data, stageLabel, excellent, normal, lacking, isFull) {
  if (!isValidEmail(ADMIN_EMAIL)) return;

  function row(label, value, style) {
    return '<tr>' +
      '<td style="padding:10px;border-bottom:1px solid #eee;width:120px;font-weight:bold;color:#555;vertical-align:top;">' + label + '</td>' +
      '<td style="padding:10px;border-bottom:1px solid #eee;' + (style || '') + '">' + value + '</td>' +
    '</tr>';
  }

  var htmlBody =
    '<div style="font-family:Malgun Gothic,dotum,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #ddd;border-radius:10px;">' +
      '<h2 style="color:#053c3c;border-bottom:2px solid #053c3c;padding-bottom:10px;">📢 새로운 상담 신청</h2>' +
      '<table style="width:100%;border-collapse:collapse;margin-top:20px;">' +
        row('이름', data.name) +
        row('연락처', data.phone) +
        row('이메일', data.email || '-') +
        row('진단 점수', data.score + ' (' + stageLabel + ')') +
        row('개인정보 동의', data.privacyAgreed ? '✅ 동의' : '❌ 미동의') +
        row('마케팅 동의', data.marketingAgreed ? '✅ 동의' : '❌ 미동의') +
        row('리포트 유형',
            isFull ? '전체 리포트 (PDF·전자책 발송)' : '간단 보고서 (발송 없음)',
            isFull ? 'color:#2E7D32;font-weight:bold;' : 'color:#C62828;font-weight:bold;') +
        row('✅ 우수', excellent, 'color:#2E7D32;') +
        row('⚠️ 보완', normal, 'color:#F57C00;') +
        row('🚨 시급', lacking, 'color:#C62828;font-weight:bold;') +
        row('광고 소스',
            ((data.utm && data.utm.source) || '-') + ' / ' + ((data.utm && data.utm.campaign) || '-')) +
        (data.concern ? row('📝 고민', data.concern, 'white-space:pre-wrap;line-height:1.6;') : '') +
      '</table>' +
      '<div style="margin-top:20px;text-align:center;">' +
        '<a href="https://docs.google.com/spreadsheets" style="background-color:#053c3c;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;font-size:14px;">구글 시트 바로가기</a>' +
      '</div>' +
    '</div>';

  var options = {
    to: ADMIN_EMAIL,
    subject: '[상담신청] ' + data.name + '님 / ' + stageLabel + ' / ' + data.score +
             (isFull ? '' : ' / 간단'),
    htmlBody: htmlBody
  };

  if (data.pdfBase64) {
    options.attachments = [Utilities.newBlob(
      Utilities.base64Decode(data.pdfBase64),
      'application/pdf',
      data.name + '님_은퇴준비체크업_결과.pdf'
    )];
  }

  MailApp.sendEmail(options);
}

// ===== 유틸 =====
function findRow(sheet, name, phone) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;

  var values = sheet.getRange(1, 1, lastRow, COL_PHONE).getValues();
  var targetPhone = onlyDigits(phone);
  var targetName = String(name || '').trim();

  // 최근 신청 건이 우선이므로 아래에서 위로 탐색
  for (var i = values.length - 1; i >= 0; i--) {
    var rowName = String(values[i][COL_NAME - 1] || '').trim();
    var rowPhone = onlyDigits(values[i][COL_PHONE - 1]);
    if (rowPhone && rowPhone === targetPhone && rowName === targetName) {
      return i + 1;
    }
  }
  return -1;
}

function onlyDigits(v) {
  return String(v == null ? '' : v).replace(/\D/g, '');
}

function isValidEmail(v) {
  return !!v && String(v).indexOf('@') > -1;
}

function getAnswerNum(text) {
  var nums = ['①', '②', '③', '④', '⑤'];
  for (var i = 0; i < nums.length; i++) {
    if (text && String(text).indexOf(nums[i]) === 0) return i + 1;
  }
  return '-';
}

function getStageLabel(stage, score) {
  var info = getStageInfo(stage, score);
  return info.emoji + ' ' + info.name;
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
