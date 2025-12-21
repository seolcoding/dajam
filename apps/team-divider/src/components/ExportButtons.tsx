import { useState } from 'react';
import { useTeamStore } from '@/store/useTeamStore';
import { Button } from '@mini-apps/ui';
import { FileText, Download, Share2 } from 'lucide-react';
import { exportTeamsPDF } from '@/utils/pdf';

export function ExportButtons() {
  const { teams, qrCodes } = useTeamStore();
  const [isExporting, setIsExporting] = useState(false);

  const handlePDFExport = async () => {
    setIsExporting(true);
    try {
      await exportTeamsPDF(teams, qrCodes);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('PDF 내보내기에 실패했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleJSONExport = () => {
    const data = {
      teams: teams.map((team, index) => ({
        teamNumber: index + 1,
        members: team.map(m => m.name),
      })),
      exportDate: new Date().toISOString(),
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `team-division_${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const text = teams
      .map((team, index) => {
        const members = team.map((m, i) => `${i + 1}. ${m.name}`).join('\n');
        return `팀 ${index + 1} (${team.length}명)\n${members}`;
      })
      .join('\n\n');

    if (navigator.share) {
      try {
        await navigator.share({
          title: '팀 분배 결과',
          text: text,
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(text);
      alert('클립보드에 복사되었습니다!');
    }
  };

  return (
    <div className="flex flex-wrap gap-4 justify-center">
      <Button
        onClick={handlePDFExport}
        disabled={isExporting}
        size="lg"
        variant="default"
        className="bg-blue-600 hover:bg-blue-700 px-8"
      >
        <FileText className="w-5 h-5 mr-2" />
        {isExporting ? 'PDF 생성 중...' : 'PDF로 저장'}
      </Button>

      <Button onClick={handleJSONExport} size="lg" variant="outline" className="border-gray-300 hover:bg-gray-50 px-8">
        <Download className="w-5 h-5 mr-2" />
        JSON 다운로드
      </Button>

      <Button onClick={handleShare} size="lg" variant="outline" className="border-gray-300 hover:bg-gray-50 px-8">
        <Share2 className="w-5 h-5 mr-2" />
        공유하기
      </Button>
    </div>
  );
}
