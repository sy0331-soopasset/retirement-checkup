# React PDF 생성 및 Vercel 배포 가이드

## 개요

이 문서는 `@react-pdf/renderer`를 사용하여 Next.js 프로젝트에서 PDF를 생성하고, Vercel 서버리스 환경에서 한글 깨짐 없이 안정적으로 배포하는 방법을 설명합니다.

### `@react-pdf/renderer` 선택 이유

- **Vercel 최적화**: Puppeteer와 달리 별도의 Chromium 바이너리가 필요 없어 배포 용량이 작고 실행 속도가 빠릅니다.
- **서버리스 안정성**: 시스템 라이브러리 의존성 문제(`libnss3.so` 등)가 발생하지 않습니다.
- **선언적 UI**: React 컴포넌트 방식으로 PDF 레이아웃을 구성할 수 있습니다.

## 설치 및 설정

### 1. 패키지 설치

```bash
npm install @react-pdf/renderer
```

### 2. Next.js API Route 기본 설정

```typescript
// app/api/download/[id]/route.ts
export const dynamic = "force-dynamic";
export const maxDuration = 60; // 생성 시간이 길어질 수 있으므로 넉넉히 설정
```

## 핵심 구현 전략

### 1. 한글 폰트 등록 (가장 중요)

Vercel 환경에는 한글 폰트가 없으므로 외부 CDN을 통해 TTF 폰트를 직접 등록해야 합니다.

```typescript
import { Font } from "@react-pdf/renderer";

Font.register({
  family: "NotoSansKR",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-kr@latest/korean-400-normal.ttf",
      fontWeight: 400,
    },
    {
      src: "https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-kr@latest/korean-700-normal.ttf",
      fontWeight: 700,
    },
  ],
});

// 한글 줄바꿈(하이픈) 처리 비활성화 (한글 깨짐 방지 핵심)
Font.registerHyphenationCallback((word) => [word]);
```

### 2. PDF 컴포넌트 작성 (React 방식)

```typescript
const MyDocument = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>{data.title}</Text>
      </View>
      {/* ... 나머지 레이아웃 ... */}
    </Page>
  </Document>
);

const styles = StyleSheet.create({
  page: {
    fontFamily: "NotoSansKR", // 등록한 폰트 적용
    padding: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: "#008080", // Teal 컬러 적용
  },
});
```

### 3. API 응답 처리

Buffer 대신 `Uint8Array`를 사용하여 Next.js `NextResponse`와의 호환성을 확보합니다.

```typescript
import { renderToBuffer } from "@react-pdf/renderer";

const pdfBuffer = await renderToBuffer(<MyDocument data={data} />);
const uint8Array = new Uint8Array(pdfBuffer);

return new NextResponse(uint8Array, {
  headers: {
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="document.pdf"`,
  },
});
```

## 트러블슈팅 및 팁

### 한글 깨짐(네모 박스) 현상
- **원인**: 폰트 미등록 또는 잘못된 폰트 형식(WOFF/WOFF2는 지원하지 않는 경우가 있음).
- **해결**: 반드시 **TTF 형식**의 폰트를 사용하고 `Font.register`를 통해 등록하세요.

### 레이아웃 디자인 수정 (이미지 2번 기준)
- `@react-pdf/renderer`는 CSS의 일부 속성만 지원합니다. (Flexbox 기반)
- `flexDirection: 'row'`를 사용하여 2컬럼 레이아웃을 구현합니다.
- 복잡한 그림자나 일부 CSS 효과는 지원되지 않으므로 단순한 보더와 배경색으로 디자인을 구현하는 것이 좋습니다.

### 사파리 및 모바일 환경 대응
- iOS Safari에서는 `attachment`가 제대로 작동하지 않을 수 있으므로, 클라이언트 측에서 `window.open`을 통해 새 창에서 PDF를 열도록 유도하는 것이 좋습니다.

## 참고 자료

- [React-pdf 공식 문서](https://react-pdf.org/)
- [Fontsource (TTF 폰트 CDN)](https://fontsource.org/fonts/noto-sans-kr)

