'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Users,
  Link2,
  Check,
  Trash2,
  Power,
  Calendar,
  Clock,
  Eye,
} from 'lucide-react';
import { useSupabase } from '@/hooks/useSupabase';
import type { Session, SessionParticipant, Database } from '@/types/database';
import type { SupabaseClient } from '@supabase/supabase-js';

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = useSupabase();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<Session | null>(null);
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchSessionDetails = async () => {
      if (!supabase) return;

      try {
        // Fetch session
        const { data: sessionData, error: sessionError } = await supabase
          .from('sessions')
          .select('*')
          .eq('id', sessionId)
          .single();

        if (sessionError) throw sessionError;
        setSession(sessionData);

        // Fetch participants
        const { data: participantsData, error: participantsError } = await supabase
          .from('session_participants')
          .select('*')
          .eq('session_id', sessionId)
          .order('joined_at', { ascending: false });

        if (participantsError) throw participantsError;
        setParticipants(participantsData || []);
      } catch (error) {
        console.error('Error fetching session details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionDetails();
  }, [supabase, sessionId]);

  const handleCopyLink = () => {
    if (!session) return;
    const url = `${window.location.origin}?code=${session.code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEndSession = async () => {
    if (!supabase || !session) return;
    const client = supabase as SupabaseClient<Database>;

    const confirmed = window.confirm('세션을 종료하시겠습니까?');
    if (!confirmed) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (client as any)
        .from('sessions')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', sessionId);

      if (error) throw error;

      setSession({ ...session, is_active: false });
    } catch (error) {
      console.error('Error ending session:', error);
      alert('세션 종료에 실패했습니다.');
    }
  };

  const handleDeleteSession = async () => {
    if (!supabase) return;

    const confirmed = window.confirm(
      '세션을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.'
    );
    if (!confirmed) return;

    try {
      const { error } = await supabase.from('sessions').delete().eq('id', sessionId);

      if (error) throw error;

      router.push('/dashboard/my-sessions');
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('세션 삭제에 실패했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-4">세션을 찾을 수 없습니다</div>
        <Button asChild>
          <Link href="/dashboard/my-sessions">
            <ArrowLeft className="w-4 h-4 mr-2" />
            목록으로
          </Link>
        </Button>
      </div>
    );
  }

  const sessionUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}?code=${session.code}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" className="mb-4" asChild>
          <Link href="/dashboard/my-sessions">
            <ArrowLeft className="w-4 h-4 mr-2" />
            목록으로
          </Link>
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">{session.title}</h2>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Badge variant={session.is_active ? 'default' : 'secondary'}>
                {session.is_active ? '활성' : '종료'}
              </Badge>
              <span className="font-mono">{session.code}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyLink}>
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  복사됨
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4 mr-2" />
                  링크 복사
                </>
              )}
            </Button>
            {session.is_active && (
              <Button variant="outline" size="sm" onClick={handleEndSession}>
                <Power className="w-4 h-4 mr-2" />
                세션 종료
              </Button>
            )}
            <Button variant="outline" size="sm" className="text-red-600" onClick={handleDeleteSession}>
              <Trash2 className="w-4 h-4 mr-2" />
              삭제
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Session Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>세션 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">앱 종류</div>
                  <div className="font-medium">{session.app_type}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">상태</div>
                  <Badge variant={session.is_active ? 'default' : 'secondary'}>
                    {session.is_active ? '활성' : '종료'}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">생성일</div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4" />
                    {new Date(session.created_at).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">최근 수정</div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4" />
                    {new Date(session.updated_at).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <div className="text-sm text-muted-foreground mb-2">참여 링크</div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm bg-muted px-3 py-2 rounded-md truncate">
                    {sessionUrl}
                  </code>
                  <Button size="sm" variant="outline" onClick={handleCopyLink}>
                    {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {session.is_public && (
                <div>
                  <Badge variant="outline">
                    <Eye className="w-3 h-3 mr-1" />
                    공개 세션
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Participants List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  참여자 ({participants.length})
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {participants.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-8">
                  아직 참여자가 없습니다
                </div>
              ) : (
                <div className="space-y-2">
                  {participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div>
                        <div className="font-medium">{participant.display_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(participant.joined_at).toLocaleString('ko-KR')}
                        </div>
                      </div>
                      <Badge variant="outline">{participant.role}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Analytics Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>통계</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-3xl font-bold mb-1">{participants.length}</div>
                <div className="text-sm text-muted-foreground">총 참여자</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-3xl font-bold mb-1">
                  {session.max_participants || '무제한'}
                </div>
                <div className="text-sm text-muted-foreground">최대 참여자</div>
              </div>
              {/* TODO: Add more analytics */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
