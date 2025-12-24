'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Eye, Link2, Trash2, Users } from 'lucide-react';
import type { Session } from '@/types/database';

// Extended session with computed fields
export type ExtendedSession = Session & {
  participant_count: number;
  app_display_name: string;
};

interface RecentSessionsProps {
  sessions?: ExtendedSession[];
  isLoading?: boolean;
}

// Mock data for demonstration
const mockSessions: Array<
  Session & { participant_count: number; app_display_name: string }
> = [
  {
    id: '1',
    code: 'ABC123',
    app_type: 'live-voting',
    title: '팀 회의 투표',
    host_id: 'user1',
    config: {},
    is_active: true,
    is_public: true,
    max_participants: 50,
    expires_at: null,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    participant_count: 12,
    app_display_name: '실시간 투표',
  },
  {
    id: '2',
    code: 'XYZ789',
    app_type: 'audience-engage',
    title: '월간 발표',
    host_id: 'user1',
    config: {},
    is_active: false,
    is_public: true,
    max_participants: 100,
    expires_at: null,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
    participant_count: 45,
    app_display_name: '청중 참여',
  },
  {
    id: '3',
    code: 'QWE456',
    app_type: 'group-order',
    title: '점심 주문',
    host_id: 'user1',
    config: {},
    is_active: false,
    is_public: false,
    max_participants: 20,
    expires_at: null,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    participant_count: 8,
    app_display_name: '공동 주문',
  },
];

export function RecentSessions({
  sessions = mockSessions,
  isLoading = false,
}: RecentSessionsProps) {
  const handleCopyLink = (code: string) => {
    const url = `${window.location.origin}?code=${code}`;
    navigator.clipboard.writeText(url);
    // TODO: Show toast notification
  };

  const handleDelete = (id: string) => {
    // TODO: Implement delete
    console.log('Delete session:', id);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>최근 세션</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            로딩 중...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>최근 세션</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">아직 세션이 없습니다</div>
            <Button asChild>
              <Link href="/">첫 세션 만들기</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>최근 세션</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/my-sessions">전체 보기</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sessions.slice(0, 5).map((session) => (
            <div
              key={session.id}
              className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              {/* Session Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Link
                    href={`/dashboard/my-sessions/${session.id}`}
                    className="font-medium hover:underline truncate"
                  >
                    {session.title}
                  </Link>
                  <Badge
                    variant={session.is_active ? 'default' : 'secondary'}
                    className="flex-shrink-0"
                  >
                    {session.is_active ? '활성' : '종료'}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{session.app_display_name}</span>
                  <span>•</span>
                  <span className="font-mono">{session.code}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {session.participant_count}명
                  </span>
                  <span>•</span>
                  <span>{formatRelativeTime(session.created_at)}</span>
                </div>
              </div>

              {/* Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="flex-shrink-0">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/my-sessions/${session.id}`}>
                      <Eye className="w-4 h-4 mr-2" />
                      보기
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCopyLink(session.code)}>
                    <Link2 className="w-4 h-4 mr-2" />
                    링크 복사
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDelete(session.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    삭제
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;

  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
