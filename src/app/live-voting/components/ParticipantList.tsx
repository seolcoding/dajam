'use client';

import { useMemo } from 'react';
import { Users, Crown, Shield, Eye, User, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SessionParticipant, SessionRole } from '@/types/database';
import type { Vote } from '../types/poll';

interface ParticipantListProps {
  participants: SessionParticipant[];
  votes?: Vote[];
  showVoteStatus?: boolean;
  showRole?: boolean;
  maxDisplay?: number;
  compact?: boolean;
  emptyMessage?: string;
  className?: string;
}

const roleConfig: Record<SessionRole, { icon: React.ElementType; label: string; color: string }> = {
  host: { icon: Crown, label: '호스트', color: 'text-amber-500' },
  moderator: { icon: Shield, label: '진행자', color: 'text-blue-500' },
  participant: { icon: User, label: '참여자', color: 'text-gray-500' },
  spectator: { icon: Eye, label: '관전자', color: 'text-gray-400' },
};

/**
 * 참여자 목록 컴포넌트
 * - 실시간 참여자 현황 표시
 * - 투표 완료 상태 표시 (선택)
 * - 역할별 아이콘 표시
 */
export function ParticipantList({
  participants,
  votes = [],
  showVoteStatus = false,
  showRole = true,
  maxDisplay = 10,
  compact = false,
  emptyMessage = '아직 참여자가 없습니다',
  className,
}: ParticipantListProps) {
  // 투표한 사용자 ID 세트 (현재는 Vote 타입에 user_id가 없으므로 빈 Set)
  // TODO: Vote 타입에 user_id 추가 시 구현
  const votedUserIds = useMemo(() => {
    return new Set<string | null>();
  }, [votes]);

  // 참여자 정렬: 호스트 > 진행자 > 참여자 > 관전자
  const sortedParticipants = useMemo(() => {
    const roleOrder: Record<SessionRole, number> = {
      host: 0,
      moderator: 1,
      participant: 2,
      spectator: 3,
    };

    return [...participants]
      .filter((p) => !p.is_banned)
      .sort((a, b) => roleOrder[a.role] - roleOrder[b.role]);
  }, [participants]);

  const displayedParticipants = sortedParticipants.slice(0, maxDisplay);
  const remainingCount = Math.max(0, sortedParticipants.length - maxDisplay);

  if (participants.length === 0) {
    return (
      <div className={cn('text-center py-4 text-muted-foreground text-sm', className)}>
        {emptyMessage}
      </div>
    );
  }

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{participants.length}명</span>
        <div className="flex -space-x-2">
          {displayedParticipants.slice(0, 5).map((p) => (
            <div
              key={p.id}
              className="w-6 h-6 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-xs font-medium"
              title={p.display_name}
            >
              {p.display_name.charAt(0)}
            </div>
          ))}
          {participants.length > 5 && (
            <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs text-muted-foreground">
              +{participants.length - 5}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Users className="h-4 w-4" />
          <span>참여자 ({participants.length}명)</span>
        </div>
        {showVoteStatus && (
          <span className="text-xs text-muted-foreground">{votes.length}명 투표 완료</span>
        )}
      </div>

      <ul className="space-y-1">
        {displayedParticipants.map((participant) => {
          const config = roleConfig[participant.role];
          const RoleIcon = config.icon;
          const hasVoted = votedUserIds.has(participant.user_id);

          return (
            <li
              key={participant.id}
              className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                {showRole && <RoleIcon className={cn('h-4 w-4', config.color)} />}
                <span className="text-sm">{participant.display_name}</span>
                {participant.role === 'host' && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                    호스트
                  </span>
                )}
              </div>

              {showVoteStatus && (
                <div className="flex items-center gap-1">
                  {hasVoted ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <span className="text-xs text-muted-foreground">대기중</span>
                  )}
                </div>
              )}
            </li>
          );
        })}

        {remainingCount > 0 && (
          <li className="text-center py-1 text-xs text-muted-foreground">
            외 {remainingCount}명
          </li>
        )}
      </ul>
    </div>
  );
}

/**
 * 참여자 수 배지 컴포넌트
 */
export function ParticipantCountBadge({
  count,
  className,
}: {
  count: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium',
        className
      )}
    >
      <Users className="h-3.5 w-3.5" />
      <span>{count}명 참여중</span>
    </div>
  );
}
