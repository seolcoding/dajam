import { useTeamStore } from '@/store/useTeamStore';
import { Card } from '@mini-apps/ui';
import { QrCode } from 'lucide-react';

export function QRCodeDisplay() {
  const { teams, qrCodes, isGeneratingQR } = useTeamStore();

  if (isGeneratingQR) {
    return (
      <Card className="p-10 border-gray-200 shadow-sm bg-white">
        <div className="text-center">
          <QrCode className="w-16 h-16 animate-pulse mx-auto mb-5 text-blue-600" />
          <p className="text-xl font-bold text-gray-900 mb-2">QR 코드 생성 중...</p>
          <p className="text-sm text-gray-600">
            {teams.flat().length}개의 QR 코드를 생성하고 있습니다
          </p>
        </div>
      </Card>
    );
  }

  if (qrCodes.size === 0) {
    return null;
  }

  return (
    <Card className="p-8 border-gray-200 shadow-sm bg-white">
      <h2 className="text-3xl font-bold mb-3 text-gray-900">QR 코드</h2>
      <p className="text-base text-gray-600 mb-8">
        각 참가자에게 QR 코드를 스캔하여 팀 배정 결과를 확인할 수 있습니다
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {teams.map((team, teamIndex) =>
          team.map((member) => {
            const qrDataUrl = qrCodes.get(member.id);

            return (
              <div
                key={member.id}
                className="bg-white border-2 border-gray-200 rounded-xl p-4 text-center hover:border-blue-600 hover:shadow-md transition-all"
              >
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`${member.name} QR`}
                    className="w-full h-auto mb-3 rounded-lg"
                  />
                ) : (
                  <div className="w-full aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                    <QrCode className="w-10 h-10 text-gray-400" />
                  </div>
                )}
                <p className="font-bold text-sm text-blue-600 mb-1">
                  팀 {teamIndex + 1}
                </p>
                <p className="text-xs text-gray-700 font-medium truncate">{member.name}</p>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
