import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '이용약관 | 설코딩 앱스',
  description: '설코딩 앱스 서비스 이용약관',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">이용약관</h1>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <p className="text-muted-foreground mb-8">
              시행일: 2024년 1월 1일 | 최종 수정일: 2024년 12월 1일
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제1조 (목적)</h2>
            <p className="text-muted-foreground leading-relaxed">
              본 약관은 설코딩(이하 &quot;회사&quot;)이 제공하는 설코딩 앱스 서비스(이하 &quot;서비스&quot;)의 이용과 관련하여
              회사와 이용자 간의 권리, 의무 및 책임 사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제2조 (정의)</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>&quot;서비스&quot;란 회사가 제공하는 실시간 인터랙티브 앱 플랫폼을 의미합니다.</li>
              <li>&quot;이용자&quot;란 본 약관에 따라 회사가 제공하는 서비스를 이용하는 회원 및 비회원을 말합니다.</li>
              <li>&quot;회원&quot;이란 회사와 서비스 이용계약을 체결하고 회원 계정을 부여받은 이용자를 말합니다.</li>
              <li>&quot;세션&quot;이란 이용자가 생성한 실시간 참여형 활동 단위를 말합니다.</li>
              <li>&quot;콘텐츠&quot;란 서비스 내에서 이용자가 게시한 모든 형태의 정보를 말합니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제3조 (약관의 효력 및 변경)</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>본 약관은 서비스를 이용하고자 하는 모든 이용자에게 그 효력이 발생합니다.</li>
              <li>회사는 필요한 경우 관련 법령을 위반하지 않는 범위에서 본 약관을 변경할 수 있습니다.</li>
              <li>약관이 변경되는 경우 회사는 변경된 약관의 내용과 시행일을 서비스 내 공지합니다.</li>
              <li>이용자가 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단할 수 있습니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제4조 (서비스의 제공)</h2>
            <p className="text-muted-foreground mb-4">회사는 다음과 같은 서비스를 제공합니다:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>실시간 투표 및 설문 서비스</li>
              <li>실시간 밸런스 게임, 이상형 월드컵 등 인터랙티브 게임</li>
              <li>빙고 게임, 사다리 타기, 팀 나누기 등 그룹 활동 도구</li>
              <li>급여 계산기, 더치페이 등 유틸리티 앱</li>
              <li>기타 회사가 개발하여 제공하는 서비스</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제5조 (서비스 이용)</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>서비스는 회원가입 없이도 일부 기능을 이용할 수 있습니다.</li>
              <li>특정 기능(세션 생성, 호스트 기능 등)은 회원가입이 필요할 수 있습니다.</li>
              <li>서비스 이용 시 발생하는 데이터 통신 비용은 이용자가 부담합니다.</li>
              <li>회사는 서비스 개선을 위해 사전 공지 후 서비스를 수정할 수 있습니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제6조 (유료 서비스 및 결제)</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>회사는 무료 서비스 외에 유료 서비스(Pro 요금제)를 제공할 수 있습니다.</li>
              <li>유료 서비스 이용 시 결제 방법, 금액, 이용 기간 등은 해당 서비스 페이지에 명시됩니다.</li>
              <li>결제는 토스페이먼츠 등 회사가 지정한 결제 수단을 통해 이루어집니다.</li>
              <li>정기 결제 서비스는 이용자가 해지하지 않는 한 자동 갱신됩니다.</li>
              <li>환불은 관련 법령 및 회사 정책에 따라 처리됩니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제7조 (회원 계정)</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>회원 가입은 카카오, 구글 등 소셜 로그인을 통해 진행됩니다.</li>
              <li>회원은 자신의 계정 정보를 안전하게 관리할 책임이 있습니다.</li>
              <li>계정의 부정 사용으로 인한 책임은 회원에게 있습니다.</li>
              <li>회원은 언제든지 회원 탈퇴를 요청할 수 있습니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제8조 (이용자의 의무)</h2>
            <p className="text-muted-foreground mb-4">이용자는 다음 행위를 해서는 안 됩니다:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>타인의 개인정보를 수집, 저장, 공개하는 행위</li>
              <li>서비스를 이용하여 불법적인 목적으로 활동하는 행위</li>
              <li>허위 정보를 등록하거나 타인의 명의를 도용하는 행위</li>
              <li>서비스 운영을 방해하거나 시스템에 과부하를 주는 행위</li>
              <li>회사의 지적재산권을 침해하는 행위</li>
              <li>기타 법령 및 공공질서, 미풍양속에 반하는 행위</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제9조 (지적재산권)</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>서비스에 대한 저작권 및 지적재산권은 회사에 귀속됩니다.</li>
              <li>이용자가 서비스 내에서 생성한 콘텐츠의 저작권은 해당 이용자에게 있습니다.</li>
              <li>이용자는 서비스를 통해 얻은 정보를 회사의 승인 없이 상업적으로 이용할 수 없습니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제10조 (면책조항)</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>회사는 천재지변, 시스템 장애 등 불가항력적인 사유로 인한 서비스 중단에 대해 책임을 지지 않습니다.</li>
              <li>회사는 이용자 간 또는 이용자와 제3자 간의 분쟁에 개입하지 않으며, 이에 대한 책임을 지지 않습니다.</li>
              <li>회사는 이용자가 서비스를 통해 기대하는 특정 결과를 보장하지 않습니다.</li>
              <li>무료 서비스의 경우 회사의 책임이 제한될 수 있습니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제11조 (분쟁 해결)</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>본 약관에 관한 분쟁은 대한민국 법률을 준거법으로 합니다.</li>
              <li>서비스 이용과 관련하여 발생한 분쟁에 대해서는 회사 소재지 관할 법원을 전속 관할로 합니다.</li>
              <li>회사와 이용자 간의 분쟁은 우선적으로 상호 협의를 통해 해결하도록 합니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제12조 (기타)</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>본 약관에서 정하지 아니한 사항은 관련 법령 및 회사 정책에 따릅니다.</li>
              <li>본 약관의 일부 조항이 무효가 되더라도 다른 조항은 유효하게 적용됩니다.</li>
            </ol>
          </section>

          <section className="mt-12 pt-8 border-t">
            <p className="text-muted-foreground">
              본 약관에 대한 문의사항이 있으시면{' '}
              <a href="mailto:ssalssi1@gmail.com" className="text-primary hover:underline">
                ssalssi1@gmail.com
              </a>
              으로 연락주시기 바랍니다.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
