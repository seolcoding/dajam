'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Calendar, Mail, Shield, Ban, CreditCard } from 'lucide-react';
import { useSupabase } from '@/hooks/useSupabase';
import type { Profile } from '@/types/database';

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = useSupabase();
  const userId = params.userId as string;

  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!supabase) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) throw error;
        setUser(data);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [supabase, userId]);

  const handleBanUser = () => {
    // TODO: Implement ban user
    alert('사용자 정지 기능은 곧 추가될 예정입니다.');
  };

  const handleChangePlan = () => {
    // TODO: Implement plan change
    alert('플랜 변경 기능은 곧 추가될 예정입니다.');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-4">사용자를 찾을 수 없습니다</div>
        <Button asChild>
          <Link href="/admin/users">
            <ArrowLeft className="w-4 h-4 mr-2" />
            목록으로
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" className="mb-4" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="w-4 h-4 mr-2" />
            목록으로
          </Link>
        </Button>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl">
                {user.nickname[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold mb-1">{user.nickname}</h2>
              <div className="flex items-center gap-2">
                {user.is_admin && (
                  <Badge variant="destructive">
                    <Shield className="w-3 h-3 mr-1" />
                    관리자
                  </Badge>
                )}
                <Badge variant="secondary">Free</Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleChangePlan}>
              <CreditCard className="w-4 h-4 mr-2" />
              플랜 변경
            </Button>
            <Button variant="outline" size="sm" className="text-red-600" onClick={handleBanUser}>
              <Ban className="w-4 h-4 mr-2" />
              정지
            </Button>
          </div>
        </div>
      </div>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle>사용자 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">이메일</div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{user.email || '익명 사용자'}</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">로그인 방식</div>
              <div>
                {user.provider === 'google'
                  ? 'Google'
                  : user.provider === 'kakao'
                  ? 'Kakao'
                  : '익명'}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">가입일</div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{new Date(user.created_at).toLocaleDateString('ko-KR')}</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">최근 수정</div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{new Date(user.updated_at).toLocaleDateString('ko-KR')}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <div className="text-sm text-muted-foreground mb-2">사용자 ID</div>
            <code className="text-xs bg-muted px-3 py-1.5 rounded-md block w-fit">
              {user.id}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>활동 요약</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold mb-1">0</div>
              <div className="text-sm text-muted-foreground">총 세션</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold mb-1">0</div>
              <div className="text-sm text-muted-foreground">참여한 세션</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold mb-1">-</div>
              <div className="text-sm text-muted-foreground">마지막 활동</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
