import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '개인정보 처리방침 | 설코딩 앱스',
  description: '설코딩 앱스 개인정보 처리방침',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">개인정보 처리방침</h1>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <p className="text-muted-foreground mb-8">
              시행일: 2024년 1월 1일 | 최종 수정일: 2024년 12월 1일
            </p>
            <p className="text-muted-foreground leading-relaxed">
              설코딩(이하 &quot;회사&quot;)은 「개인정보 보호법」에 따라 정보주체의 개인정보를 보호하고
              이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 다음과 같이 개인정보 처리방침을 수립·공개합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제1조 (수집하는 개인정보 항목)</h2>
            <p className="text-muted-foreground mb-4">회사는 다음과 같은 개인정보를 수집합니다:</p>

            <h3 className="text-lg font-medium mt-6 mb-3">1. 필수 수집 항목</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-muted-foreground border">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-2 text-left border-b">수집 시점</th>
                    <th className="px-4 py-2 text-left border-b">수집 항목</th>
                    <th className="px-4 py-2 text-left border-b">수집 목적</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-2 border-b">회원가입</td>
                    <td className="px-4 py-2 border-b">이메일, 이름, 프로필 사진</td>
                    <td className="px-4 py-2 border-b">회원 식별, 서비스 제공</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-b">서비스 이용</td>
                    <td className="px-4 py-2 border-b">서비스 이용 기록, 접속 로그</td>
                    <td className="px-4 py-2 border-b">서비스 개선, 통계 분석</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-b">결제</td>
                    <td className="px-4 py-2 border-b">결제 정보 (결제 대행사를 통해 처리)</td>
                    <td className="px-4 py-2 border-b">유료 서비스 제공</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-medium mt-6 mb-3">2. 자동 수집 항목</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>접속 IP 주소, 브라우저 종류, 운영체제</li>
              <li>서비스 이용 기록, 접속 시간</li>
              <li>쿠키 정보 (선택적으로 수집)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제2조 (개인정보의 수집 및 이용 목적)</h2>
            <p className="text-muted-foreground mb-4">수집한 개인정보는 다음의 목적으로 이용됩니다:</p>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li><strong>서비스 제공:</strong> 회원 인증, 세션 생성 및 관리, 콘텐츠 제공</li>
              <li><strong>회원 관리:</strong> 회원제 서비스 이용, 개인식별, 불량회원 제재</li>
              <li><strong>결제 처리:</strong> 유료 서비스 결제, 환불 처리</li>
              <li><strong>서비스 개선:</strong> 이용 통계, 서비스 품질 향상</li>
              <li><strong>고객 지원:</strong> 문의 응대, 공지사항 전달</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제3조 (개인정보의 보유 및 이용 기간)</h2>
            <p className="text-muted-foreground mb-4">
              개인정보는 수집·이용 목적이 달성된 후에는 지체 없이 파기합니다.
              다만, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-muted-foreground border">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-2 text-left border-b">보존 항목</th>
                    <th className="px-4 py-2 text-left border-b">보존 기간</th>
                    <th className="px-4 py-2 text-left border-b">근거 법령</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-2 border-b">계약 또는 청약철회 기록</td>
                    <td className="px-4 py-2 border-b">5년</td>
                    <td className="px-4 py-2 border-b">전자상거래법</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-b">대금결제 및 재화 공급 기록</td>
                    <td className="px-4 py-2 border-b">5년</td>
                    <td className="px-4 py-2 border-b">전자상거래법</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-b">소비자 불만 또는 분쟁처리 기록</td>
                    <td className="px-4 py-2 border-b">3년</td>
                    <td className="px-4 py-2 border-b">전자상거래법</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-b">웹사이트 방문 기록</td>
                    <td className="px-4 py-2 border-b">3개월</td>
                    <td className="px-4 py-2 border-b">통신비밀보호법</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제4조 (개인정보의 제3자 제공)</h2>
            <p className="text-muted-foreground mb-4">
              회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다.
              다만, 다음의 경우에는 예외로 합니다:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령에 따라 제공이 요구되는 경우</li>
              <li>서비스 제공을 위해 필요한 경우 (결제 대행사 등)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제5조 (개인정보 처리 위탁)</h2>
            <p className="text-muted-foreground mb-4">
              회사는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리 업무를 위탁하고 있습니다:
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-muted-foreground border">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-2 text-left border-b">위탁 업체</th>
                    <th className="px-4 py-2 text-left border-b">위탁 업무</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-2 border-b">Supabase</td>
                    <td className="px-4 py-2 border-b">데이터베이스 호스팅 및 인증 서비스</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-b">토스페이먼츠</td>
                    <td className="px-4 py-2 border-b">결제 처리</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-b">Vercel</td>
                    <td className="px-4 py-2 border-b">웹 호스팅</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제6조 (이용자의 권리와 행사 방법)</h2>
            <p className="text-muted-foreground mb-4">
              정보주체는 다음과 같은 권리를 행사할 수 있습니다:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li><strong>열람 요구:</strong> 본인의 개인정보 열람을 요청할 수 있습니다.</li>
              <li><strong>정정 요구:</strong> 개인정보의 오류에 대해 정정을 요청할 수 있습니다.</li>
              <li><strong>삭제 요구:</strong> 개인정보의 삭제를 요청할 수 있습니다.</li>
              <li><strong>처리정지 요구:</strong> 개인정보 처리의 정지를 요청할 수 있습니다.</li>
            </ol>
            <p className="text-muted-foreground mt-4">
              위 권리 행사는 회원 설정 페이지 또는 이메일(support@seolcoding.com)을 통해 가능합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제7조 (개인정보의 파기)</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>회사는 개인정보 보유 기간이 경과하거나 처리 목적이 달성된 경우 지체 없이 해당 개인정보를 파기합니다.</li>
              <li>전자적 파일 형태의 정보는 복구할 수 없는 방법으로 영구 삭제합니다.</li>
              <li>종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각합니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제8조 (개인정보 보호를 위한 기술적·관리적 조치)</h2>
            <p className="text-muted-foreground mb-4">
              회사는 개인정보 보호를 위해 다음과 같은 조치를 취하고 있습니다:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>암호화:</strong> 비밀번호 및 민감정보는 암호화하여 저장합니다.</li>
              <li><strong>SSL 통신:</strong> HTTPS를 통한 데이터 전송 암호화를 적용합니다.</li>
              <li><strong>접근 제한:</strong> 개인정보 접근 권한을 최소한의 인원으로 제한합니다.</li>
              <li><strong>보안 업데이트:</strong> 시스템 취약점에 대한 정기적 보안 업데이트를 수행합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제9조 (쿠키의 사용)</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>회사는 이용자에게 맞춤형 서비스를 제공하기 위해 쿠키를 사용할 수 있습니다.</li>
              <li>쿠키는 웹사이트가 이용자의 브라우저로 전송하는 작은 텍스트 파일입니다.</li>
              <li>이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있습니다.</li>
              <li>쿠키 저장을 거부할 경우 일부 서비스 이용에 제한이 있을 수 있습니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제10조 (개인정보 보호책임자)</h2>
            <p className="text-muted-foreground mb-4">
              개인정보 처리에 관한 업무를 총괄하는 개인정보 보호책임자는 다음과 같습니다:
            </p>
            <div className="bg-muted/30 p-4 rounded-lg text-muted-foreground">
              <p><strong>개인정보 보호책임자</strong></p>
              <p>이름: 설코딩 대표</p>
              <p>이메일: privacy@seolcoding.com</p>
              <p>전화: 연락처 비공개</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제11조 (권익침해 구제방법)</h2>
            <p className="text-muted-foreground mb-4">
              개인정보 침해로 인한 피해 구제를 위해 아래 기관에 상담을 신청할 수 있습니다:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>개인정보침해신고센터: (국번없이) 118 / privacy.kisa.or.kr</li>
              <li>개인정보 분쟁조정위원회: 1833-6972 / kopico.go.kr</li>
              <li>대검찰청 사이버수사과: (국번없이) 1301 / spo.go.kr</li>
              <li>경찰청 사이버안전국: (국번없이) 182 / cyberbureau.police.go.kr</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제12조 (개인정보 처리방침 변경)</h2>
            <p className="text-muted-foreground">
              이 개인정보 처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경 내용의 추가,
              삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통해 고지합니다.
            </p>
          </section>

          <section className="mt-12 pt-8 border-t">
            <p className="text-muted-foreground">
              개인정보 처리에 관한 문의사항이 있으시면{' '}
              <a href="mailto:privacy@seolcoding.com" className="text-primary hover:underline">
                privacy@seolcoding.com
              </a>
              으로 연락주시기 바랍니다.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
