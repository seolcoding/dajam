'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, Filter, MoreVertical, Eye, Link2, Trash2, Users, Plus } from 'lucide-react';
import { useSessionHistory } from '@/hooks/useSessionHistory';
import type { AppType } from '@/types/database';

export default function MySessionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAppType, setFilterAppType] = useState<AppType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'ended'>('all');

  const { sessions, isLoading } = useSessionHistory({
    appType: filterAppType !== 'all' ? filterAppType : undefined,
    isActive: filterStatus === 'active' ? true : filterStatus === 'ended' ? false : undefined,
  });

  const handleCopyLink = (code: string) => {
    const url = `${window.location.origin}?code=${code}`;
    navigator.clipboard.writeText(url);
    // TODO: Show toast notification
  };

  const handleDelete = (id: string) => {
    // TODO: Implement delete with confirmation dialog
    console.log('Delete session:', id);
  };

  const filteredSessions = sessions.filter((session) =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">내 세션</h2>
          <p className="text-muted-foreground">생성한 세션을 관리하세요</p>
        </div>
        <Button asChild>
          <Link href="/">
            <Plus className="w-4 h-4 mr-2" />
            새 세션 만들기
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="세션명 또는 코드로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* App Type Filter */}
            <Select
              value={filterAppType}
              onValueChange={(value) => setFilterAppType(value as AppType | 'all')}
            >
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="앱 종류" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 앱</SelectItem>
                <SelectItem value="live-voting">실시간 투표</SelectItem>
                <SelectItem value="audience-engage">청중 참여</SelectItem>
                <SelectItem value="group-order">공동 주문</SelectItem>
                <SelectItem value="this-or-that">This or That</SelectItem>
                <SelectItem value="realtime-quiz">실시간 퀴즈</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={filterStatus}
              onValueChange={(value) => setFilterStatus(value as 'all' | 'active' | 'ended')}
            >
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 상태</SelectItem>
                <SelectItem value="active">활성</SelectItem>
                <SelectItem value="ended">종료</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            총 {filteredSessions.length}개의 세션
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              로딩 중...
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                {searchQuery || filterAppType !== 'all' || filterStatus !== 'all'
                  ? '검색 결과가 없습니다'
                  : '아직 세션이 없습니다'}
              </div>
              {!searchQuery && filterAppType === 'all' && filterStatus === 'all' && (
                <Button asChild>
                  <Link href="/">첫 세션 만들기</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {/* Table Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 bg-muted/50 rounded-lg text-sm font-medium text-muted-foreground">
                <div className="col-span-4">세션명</div>
                <div className="col-span-2">앱 종류</div>
                <div className="col-span-2">코드</div>
                <div className="col-span-1">참여자</div>
                <div className="col-span-2">생성일</div>
                <div className="col-span-1 text-right">액션</div>
              </div>

              {/* Table Body */}
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 px-4 py-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  {/* Session Name */}
                  <div className="md:col-span-4 flex items-center gap-2">
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

                  {/* App Type */}
                  <div className="md:col-span-2 flex items-center text-sm text-muted-foreground">
                    <span className="md:hidden font-medium mr-2">앱:</span>
                    {session.app_display_name}
                  </div>

                  {/* Code */}
                  <div className="md:col-span-2 flex items-center">
                    <span className="md:hidden font-medium text-sm text-muted-foreground mr-2">
                      코드:
                    </span>
                    <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
                      {session.code}
                    </code>
                  </div>

                  {/* Participants */}
                  <div className="md:col-span-1 flex items-center gap-1 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground md:hidden" />
                    <span className="md:hidden font-medium text-muted-foreground mr-1">
                      참여자:
                    </span>
                    {session.participant_count}명
                  </div>

                  {/* Created Date */}
                  <div className="md:col-span-2 flex items-center text-sm text-muted-foreground">
                    <span className="md:hidden font-medium mr-2">생성일:</span>
                    {new Date(session.created_at).toLocaleDateString('ko-KR')}
                  </div>

                  {/* Actions */}
                  <div className="md:col-span-1 flex items-center justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/my-sessions/${session.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            상세보기
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
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
