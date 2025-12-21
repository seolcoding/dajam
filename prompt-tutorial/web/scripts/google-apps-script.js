/**
 * Google Apps Script - API Key Logger
 *
 * 설정 방법:
 * 1. Google Sheets에서 확장 프로그램 → Apps Script 클릭
 * 2. 이 코드를 복사하여 붙여넣기
 * 3. 저장 후 배포 → 새 배포 → 웹 앱 선택
 * 4. 실행할 사용자: 본인, 액세스 권한: 모든 사용자
 * 5. 배포 URL을 .env 파일의 VITE_GOOGLE_SHEETS_WEBHOOK_URL에 설정
 */

// Google Sheets ID
const SPREADSHEET_ID = '1zwU9qEb2iQBsy2ALRjd5Mr8uYlh2Fpu0435kGiCw-tU';

function doPost(e) {
  Logger.log('=== doPost 시작 ===');
  Logger.log('받은 이벤트: ' + JSON.stringify(e));

  try {
    Logger.log('스프레드시트 열기 시도...');
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
    Logger.log('시트 이름: ' + sheet.getName());

    Logger.log('POST 데이터 파싱 시도...');
    Logger.log('postData: ' + JSON.stringify(e.postData));
    Logger.log('contents: ' + e.postData.contents);

    const data = JSON.parse(e.postData.contents);
    Logger.log('파싱된 데이터: ' + JSON.stringify(data));
    Logger.log('id: ' + data.id);
    Logger.log('timestamp: ' + data.timestamp);
    Logger.log('api_key: ' + data.api_key);

    Logger.log('행 추가 시도...');
    sheet.appendRow([
      data.id,
      data.timestamp,
      data.api_key
    ]);
    Logger.log('행 추가 성공!');

    Logger.log('=== doPost 완료 ===');
    return ContentService.createTextOutput('OK');

  } catch (error) {
    Logger.log('!!! 에러 발생 !!!');
    Logger.log('에러 메시지: ' + error.message);
    Logger.log('에러 스택: ' + error.stack);
    return ContentService.createTextOutput('ERROR: ' + error.message);
  }
}

// GET 요청 처리 (테스트용)
function doGet(e) {
  Logger.log('=== doGet 호출됨 ===');
  Logger.log('파라미터: ' + JSON.stringify(e));
  return ContentService.createTextOutput('Webhook is running! Use POST to send data.');
}

// 테스트용 함수 (Apps Script 에디터에서 직접 실행 가능)
function testDoPost() {
  Logger.log('=== testDoPost 시작 ===');

  const testEvent = {
    postData: {
      contents: JSON.stringify({
        id: 'test-123',
        timestamp: new Date().toISOString(),
        api_key: 'test-api-key-12345'
      })
    }
  };

  Logger.log('테스트 이벤트 생성: ' + JSON.stringify(testEvent));

  const result = doPost(testEvent);
  Logger.log('결과: ' + result.getContent());
  Logger.log('=== testDoPost 완료 ===');
}

// 스프레드시트 연결 테스트
function testSheetConnection() {
  Logger.log('=== 시트 연결 테스트 ===');
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    Logger.log('스프레드시트 이름: ' + spreadsheet.getName());

    const sheet = spreadsheet.getActiveSheet();
    Logger.log('시트 이름: ' + sheet.getName());
    Logger.log('행 수: ' + sheet.getLastRow());
    Logger.log('열 수: ' + sheet.getLastColumn());

    Logger.log('=== 연결 성공 ===');
  } catch (error) {
    Logger.log('!!! 연결 실패 !!!');
    Logger.log('에러: ' + error.message);
  }
}
