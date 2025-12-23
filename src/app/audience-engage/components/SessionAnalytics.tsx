'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3,
  Users,
  MessageSquare,
  HelpCircle,
  ThumbsUp,
  Heart,
  Laugh,
  Hand,
  PartyPopper,
  TrendingUp,
  Clock,
} from 'lucide-react';
import type { Question, ChatMessage, EmojiType } from '../types';

interface SessionAnalyticsProps {
  participants: Array<{ id: string; display_name: string; joined_at?: string }>;
  questions: Question[];
  chatMessages: ChatMessage[];
  reactionCounts: Record<EmojiType, number>;
  sessionStartTime?: string;
  className?: string;
}

/**
 * SessionAnalytics - 세션 분석 대시보드
 *
 * - 참여자 통계
 * - Q&A 통계
 * - 채팅 활동
 * - 리액션 분포
 * - 참여율 계산
 */
export function SessionAnalytics({
  participants,
  questions,
  chatMessages,
  reactionCounts,
  sessionStartTime,
  className = '',
}: SessionAnalyticsProps) {
  // 통계 계산
  const stats = useMemo(() => {
    const totalParticipants = participants.length;
    const activeParticipants = new Set([
      ...questions.map((q) => q.participantId).filter(Boolean),
      ...chatMessages.map((m) => m.participantId).filter(Boolean),
    ]).size;

    const participationRate = totalParticipants > 0
      ? Math.round((activeParticipants / totalParticipants) * 100)
      : 0;

    const totalReactions = Object.values(reactionCounts).reduce((a, b) => a + b, 0);
    const answeredQuestions = questions.filter((q) => q.isAnswered).length;
    const highlightedQuestions = questions.filter((q) => q.isHighlighted).length;

    // 세션 시간 계산
    let sessionDuration = '';
    if (sessionStartTime) {
      const start = new Date(sessionStartTime);
      const now = new Date();
      const diffMs = now.getTime() - start.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHrs = Math.floor(diffMins / 60);
      const remainingMins = diffMins % 60;

      if (diffHrs > 0) {
        sessionDuration = `${diffHrs}시간 ${remainingMins}분`;
      } else {
        sessionDuration = `${diffMins}분`;
      }
    }

    return {
      totalParticipants,
      activeParticipants,
      participationRate,
      totalQuestions: questions.length,
      answeredQuestions,
      highlightedQuestions,
      totalMessages: chatMessages.length,
      totalReactions,
      sessionDuration,
    };
  }, [participants, questions, chatMessages, reactionCounts, sessionStartTime]);

  // 리액션 분포
  const reactionDistribution = useMemo(() => {
    const total = stats.totalReactions || 1;
    return {
      thumbsUp: Math.round((reactionCounts.thumbsUp / total) * 100),
      heart: Math.round((reactionCounts.heart / total) * 100),
      laugh: Math.round((reactionCounts.laugh / total) * 100),
      clap: Math.round((reactionCounts.clap / total) * 100),
      party: Math.round((reactionCounts.party / total) * 100),
    };
  }, [reactionCounts, stats.totalReactions]);

  const reactionIcons: Record<EmojiType, { icon: typeof ThumbsUp; color: string }> = {
    thumbsUp: { icon: ThumbsUp, color: 'text-blue-500' },
    heart: { icon: Heart, color: 'text-red-500' },
    laugh: { icon: Laugh, color: 'text-yellow-500' },
    clap: { icon: Hand, color: 'text-orange-500' },
    party: { icon: PartyPopper, color: 'text-purple-500' },
  };

  return (
    <Card className={className}>
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          세션 분석
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 기본 통계 */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={Users}
            label="참여자"
            value={stats.totalParticipants}
            subValue={`${stats.activeParticipants}명 활동`}
          />
          <StatCard
            icon={TrendingUp}
            label="참여율"
            value={`${stats.participationRate}%`}
            progress={stats.participationRate}
          />
          <StatCard
            icon={HelpCircle}
            label="질문"
            value={stats.totalQuestions}
            subValue={`${stats.answeredQuestions}개 답변됨`}
          />
          <StatCard
            icon={MessageSquare}
            label="채팅"
            value={stats.totalMessages}
          />
        </div>

        {/* 세션 시간 */}
        {stats.sessionDuration && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
            <Clock className="w-4 h-4" />
            <span>진행 시간: {stats.sessionDuration}</span>
          </div>
        )}

        {/* 리액션 분포 */}
        {stats.totalReactions > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">리액션 분포</span>
              <span className="font-medium">{stats.totalReactions}개</span>
            </div>
            <div className="space-y-1.5">
              {(Object.entries(reactionDistribution) as [EmojiType, number][]).map(
                ([type, percent]) => {
                  const { icon: Icon, color } = reactionIcons[type];
                  return (
                    <div key={type} className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${color}`} />
                      <Progress value={percent} className="flex-1 h-2" />
                      <span className="text-xs text-muted-foreground w-8 text-right">
                        {percent}%
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        )}

        {/* 참여자 목록 요약 */}
        {participants.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">최근 참여자</div>
            <div className="flex flex-wrap gap-1">
              {participants.slice(-8).map((p) => (
                <span
                  key={p.id}
                  className="text-xs bg-muted px-2 py-0.5 rounded-full"
                >
                  {p.display_name}
                </span>
              ))}
              {participants.length > 8 && (
                <span className="text-xs text-muted-foreground px-2 py-0.5">
                  +{participants.length - 8}명
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 통계 카드 서브컴포넌트
function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  progress,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
  subValue?: string;
  progress?: number;
}) {
  return (
    <div className="bg-muted/30 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="text-lg font-semibold">{value}</div>
      {subValue && (
        <div className="text-xs text-muted-foreground">{subValue}</div>
      )}
      {progress !== undefined && (
        <Progress value={progress} className="h-1 mt-2" />
      )}
    </div>
  );
}

export default SessionAnalytics;
