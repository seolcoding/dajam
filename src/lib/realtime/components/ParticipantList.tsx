'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, Crown, UserCheck } from 'lucide-react';
import type { ParticipantListProps } from '../types';
import { getInitials, getParticipantColor, formatRelativeTime } from '../utils';

/**
 * 참여자 목록 공통 컴포넌트
 */
export function ParticipantList({
  participants,
  showStatus = false,
  showRole = true,
  maxDisplay = 50,
  emptyMessage = '아직 참여자가 없습니다. 링크를 공유해주세요!',
}: ParticipantListProps) {
  const displayParticipants = participants.slice(0, maxDisplay);
  const remaining = participants.length - maxDisplay;

  if (participants.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            참여자 (0)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          참여자 ({participants.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {displayParticipants.map((participant) => {
            const colorClass = getParticipantColor(participant.display_name);
            const isHost = participant.role === 'host';

            return (
              <div
                key={participant.id}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                {/* 아바타 */}
                <div
                  className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center text-white font-bold`}
                >
                  {getInitials(participant.display_name)}
                </div>

                {/* 이름 + 역할 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">
                      {participant.display_name}
                    </span>
                    {showRole && isHost && (
                      <Badge variant="secondary" className="text-xs">
                        <Crown className="w-3 h-3 mr-1" />
                        호스트
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(participant.joined_at)}
                  </span>
                </div>

                {/* 상태 표시 (옵션) */}
                {showStatus && (
                  <UserCheck className="w-4 h-4 text-green-500" />
                )}
              </div>
            );
          })}

          {/* 더 많은 참여자 표시 */}
          {remaining > 0 && (
            <div className="text-center py-2 text-sm text-muted-foreground">
              +{remaining}명 더
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
