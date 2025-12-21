import { jsPDF } from 'jspdf';
import type { Participant } from '@/types/team';

/**
 * PDF로 팀 분배 결과 내보내기
 * 주의: 한글 폰트는 기본 지원되지 않으므로 영문/숫자만 정상 표시
 */
export async function exportTeamsPDF(teams: Participant[][], qrCodes: Map<string, string>) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 폰트 설정
  doc.setFont('helvetica');

  // 표지
  doc.setFontSize(24);
  doc.text('Team Division Result', pageWidth / 2, 40, { align: 'center' });

  doc.setFontSize(12);
  const totalParticipants = teams.reduce((sum, t) => sum + t.length, 0);
  doc.text(`Total: ${totalParticipants} people`, pageWidth / 2, 60, { align: 'center' });
  doc.text(`Teams: ${teams.length}`, pageWidth / 2, 70, { align: 'center' });
  doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth / 2, 80, { align: 'center' });

  // 팀별 페이지
  teams.forEach((team, teamIndex) => {
    doc.addPage();

    doc.setFontSize(20);
    doc.text(`Team ${teamIndex + 1}`, 20, 20);

    doc.setFontSize(12);
    doc.text(`${team.length} members`, 20, 30);

    // 멤버 리스트
    let yPosition = 50;
    team.forEach((member, idx) => {
      // 이름 (한글은 깨질 수 있음)
      doc.text(`${idx + 1}. ${member.name}`, 20, yPosition);

      // QR 코드 (오른쪽 정렬)
      const qrDataUrl = qrCodes.get(member.id);
      if (qrDataUrl) {
        try {
          doc.addImage(qrDataUrl, 'PNG', pageWidth - 50, yPosition - 10, 30, 30);
        } catch (error) {
          console.error('Failed to add QR code to PDF:', error);
        }
      }

      yPosition += 40;

      // 페이지 넘김
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }
    });
  });

  // 전체 명단 (알파벳 순)
  doc.addPage();
  doc.setFontSize(18);
  doc.text('All Participants', 20, 20);

  const allParticipants = teams
    .flat()
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'));

  let yPos = 40;
  doc.setFontSize(10);
  allParticipants.forEach((p, idx) => {
    const teamNum = (p.team !== undefined ? p.team : 0) + 1;
    doc.text(`${idx + 1}. ${p.name} - Team ${teamNum}`, 20, yPos);
    yPos += 8;

    if (yPos > pageHeight - 20) {
      doc.addPage();
      yPos = 20;
    }
  });

  // PDF 다운로드
  const fileName = `team-division_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
