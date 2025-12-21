import { useTeamStore } from '@/store/useTeamStore';
import { Button } from '@mini-apps/ui';
import { ParticipantInput } from '@/components/ParticipantInput';
import { TeamSettings } from '@/components/TeamSettings';
import { TeamResult } from '@/components/TeamResult';
import { QRCodeDisplay } from '@/components/QRCodeDisplay';
import { ExportButtons } from '@/components/ExportButtons';
import { Shuffle, RotateCcw } from 'lucide-react';

function App() {
  const { participants, isShuffled, teams, divideTeams, reset } = useTeamStore();

  const canShuffle = participants.length >= 2;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
            팀 나누기
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            공정한 랜덤 알고리즘으로 팀을 자동 분배하고, QR 코드로 결과를 공유하세요
          </p>
        </header>

        {!isShuffled ? (
          /* Input Phase */
          <div className="space-y-8">
            <ParticipantInput />
            <TeamSettings />

            <div className="flex flex-col items-center pt-8 gap-4">
              <Button
                onClick={divideTeams}
                disabled={!canShuffle}
                size="lg"
                className="px-16 py-7 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
              >
                <Shuffle className="w-6 h-6 mr-3" />
                팀 나누기
              </Button>

              {!canShuffle && participants.length > 0 && (
                <p className="text-center text-sm text-red-600 font-medium">
                  최소 2명 이상의 참가자가 필요합니다
                </p>
              )}
            </div>
          </div>
        ) : (
          /* Result Phase */
          <div className="space-y-12">
            <div className="text-center bg-gray-50 py-8 px-6 rounded-xl border border-gray-200">
              <h2 className="text-4xl font-bold text-gray-900 mb-3">
                팀 분배 완료!
              </h2>
              <p className="text-lg text-gray-600">
                총 {teams.length}개 팀, {participants.length}명이 배정되었습니다
              </p>
            </div>

            <TeamResult teams={teams} showConfetti={true} />

            <QRCodeDisplay />

            <ExportButtons />

            <div className="flex justify-center pt-8">
              <Button onClick={reset} size="lg" variant="outline" className="border-gray-300 hover:bg-gray-50">
                <RotateCcw className="w-5 h-5 mr-2" />
                다시 하기
              </Button>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          <p className="mb-2">
            Fisher-Yates 알고리즘을 사용하여 공정한 랜덤 분배를 보장합니다
          </p>
          <p>
            Made by SeolCoding
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
