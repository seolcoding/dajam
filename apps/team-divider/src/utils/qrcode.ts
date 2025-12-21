import QRCode from 'qrcode';
import type { QRCodeData, Participant } from '@/types/team';

/**
 * 팀 배정 정보를 QR 코드로 생성
 */
export async function generateTeamQRCode(data: QRCodeData): Promise<string> {
  // JSON 데이터 압축 (Base64 인코딩)
  const jsonString = JSON.stringify({
    t: data.team, // team
    n: data.member, // name
    m: data.allMembers, // members
  });

  const base64Data = btoa(encodeURIComponent(jsonString));

  // QR 코드 URL (자체 앱에서 디코딩)
  const qrUrl = `${window.location.origin}/mini-apps/team-divider/?d=${base64Data}`;

  try {
    // QR 코드 이미지 생성 (Data URL)
    const qrDataUrl = await QRCode.toDataURL(qrUrl, {
      errorCorrectionLevel: 'M',
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    return qrDataUrl;
  } catch (error) {
    console.error('QR Code generation failed:', error);
    throw error;
  }
}

/**
 * 모든 팀원의 QR 코드 일괄 생성
 */
export async function generateAllQRCodes(teams: Participant[][]): Promise<Map<string, string>> {
  const qrCodes = new Map<string, string>();

  for (let teamIndex = 0; teamIndex < teams.length; teamIndex++) {
    const team = teams[teamIndex];
    const allMembers = team.map(p => p.name);

    for (const member of team) {
      const qrData: QRCodeData = {
        team: teamIndex + 1,
        teamName: `팀 ${teamIndex + 1}`,
        member: member.name,
        allMembers,
      };

      const qrDataUrl = await generateTeamQRCode(qrData);
      qrCodes.set(member.id, qrDataUrl);
    }
  }

  return qrCodes;
}

/**
 * QR 코드 데이터 디코딩 (결과 페이지에서 사용)
 */
export function decodeQRData(base64Data: string): QRCodeData | null {
  try {
    const jsonString = decodeURIComponent(atob(base64Data));
    const decoded = JSON.parse(jsonString);

    return {
      team: decoded.t,
      teamName: `팀 ${decoded.t}`,
      member: decoded.n,
      allMembers: decoded.m,
    };
  } catch (error) {
    console.error('QR Code decoding failed:', error);
    return null;
  }
}
