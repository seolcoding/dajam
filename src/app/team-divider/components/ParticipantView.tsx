'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Users, User, Clock } from 'lucide-react';
import { AppHeader, AppFooter } from '@/components/layout';
import { useSessionStore } from '../store/session-store';
import type { Participant } from '@/app/team-divider/types/team';

interface ParticipantViewProps {
  teams: Participant[][];
  onBack: () => void;
}

export function ParticipantView({ teams, onBack }: ParticipantViewProps) {
  const { sessionCode, participantName } = useSessionStore();

  const hasTeams = teams.length > 0 && teams.some(team => team.length > 0);

  // Find which team the participant is in
  let myTeamIndex = -1;
  if (hasTeams && participantName) {
    for (let i = 0; i < teams.length; i++) {
      if (teams[i].some(member => member.name === participantName)) {
        myTeamIndex = i;
        break;
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader
        title="팀 나누기"
        description={sessionCode ? `세션: ${sessionCode}` : '팀 나누기'}
        icon={Users}
        iconGradient="from-blue-500 to-cyan-500"
        actions={
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            나가기
          </Button>
        }
      />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Participant Info */}
        <Card className="mb-6 p-4 bg-white border-blue-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{participantName}</p>
              <p className="text-sm text-gray-500">
                {myTeamIndex >= 0 ? `팀 ${myTeamIndex + 1} 소속` : '참여자로 시청 중'}
              </p>
            </div>
          </div>
        </Card>

        {/* Team Results or Waiting State */}
        {hasTeams ? (
          <div className="space-y-6">
            {/* Highlight my team if found */}
            {myTeamIndex >= 0 && participantName && (
              <Card className="p-6 border-2 border-blue-500 bg-blue-50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-600 text-white">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      내 팀: 팀 {myTeamIndex + 1}
                    </h3>
                    <p className="text-sm text-blue-600 font-medium">
                      {teams[myTeamIndex].length}명
                    </p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {teams[myTeamIndex].map((member, idx) => (
                    <li
                      key={member.id}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
                        member.name === participantName
                          ? 'bg-blue-100 border-blue-300'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <span className="font-bold text-blue-600 min-w-[28px] text-lg">
                        {idx + 1}.
                      </span>
                      <span className="font-medium text-gray-900">
                        {member.name}
                        {member.name === participantName && (
                          <span className="ml-2 text-blue-600 text-sm">(나)</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* All Teams */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">전체 팀 결과</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teams.map((team, index) => (
                  <Card
                    key={index}
                    className={`p-4 border ${
                      index === myTeamIndex
                        ? 'border-blue-300 bg-blue-50/50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                      <Users className="w-5 h-5 text-blue-600" />
                      <h3 className="font-bold text-gray-900">팀 {index + 1}</h3>
                      <span className="text-sm text-gray-500">({team.length}명)</span>
                    </div>
                    <ul className="space-y-1 text-sm">
                      {team.map((member) => (
                        <li
                          key={member.id}
                          className={`px-2 py-1 rounded ${
                            member.name === participantName
                              ? 'bg-blue-100 font-medium'
                              : ''
                          }`}
                        >
                          {member.name}
                          {member.name === participantName && (
                            <span className="ml-1 text-blue-600">(나)</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <Card className="p-12 text-center bg-white">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  팀 나누기 대기 중
                </h3>
                <p className="text-gray-500">
                  호스트가 팀을 나눌 때까지 기다려 주세요...
                </p>
              </div>
            </div>
          </Card>
        )}
      </main>

      <AppFooter variant="compact" />
    </div>
  );
}
