'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Upload, Save, Loader2 } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { profile, isLoading, updateProfile } = useProfile();

  const [nickname, setNickname] = useState(profile?.nickname || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!profile) return;

    try {
      setIsSaving(true);
      await updateProfile({ nickname });
      alert('프로필이 업데이트되었습니다.');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('프로필 업데이트에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = () => {
    // TODO: Implement avatar upload
    alert('아바타 업로드 기능은 곧 추가될 예정입니다.');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-4">프로필을 불러올 수 없습니다</div>
        <Button asChild>
          <Link href="/dashboard/settings">
            <ArrowLeft className="w-4 h-4 mr-2" />
            설정으로
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" className="mb-4" asChild>
          <Link href="/dashboard/settings">
            <ArrowLeft className="w-4 h-4 mr-2" />
            설정으로
          </Link>
        </Button>
        <h2 className="text-2xl font-bold mb-2">프로필</h2>
        <p className="text-muted-foreground">프로필 정보를 관리하세요</p>
      </div>

      {/* Avatar */}
      <Card>
        <CardHeader>
          <CardTitle>프로필 사진</CardTitle>
          <CardDescription>아바타 이미지를 업로드하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">
                {profile.nickname?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Button variant="outline" size="sm" onClick={handleAvatarUpload}>
                <Upload className="w-4 h-4 mr-2" />
                사진 업로드
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                JPG, PNG 형식. 최대 2MB.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
          <CardDescription>이름과 이메일을 관리하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Nickname */}
          <div className="space-y-2">
            <Label htmlFor="nickname">닉네임</Label>
            <Input
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임을 입력하세요"
            />
          </div>

          {/* Email (Read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              value={profile.email || '익명 사용자'}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              이메일은 변경할 수 없습니다.
            </p>
          </div>

          {/* Provider (Read-only) */}
          {profile.provider && (
            <div className="space-y-2">
              <Label htmlFor="provider">로그인 방식</Label>
              <Input
                id="provider"
                value={
                  profile.provider === 'google'
                    ? 'Google'
                    : profile.provider === 'kakao'
                    ? 'Kakao'
                    : '익명'
                }
                disabled
                className="bg-muted"
              />
            </div>
          )}

          {/* Save Button */}
          <div className="pt-4">
            <Button onClick={handleSave} disabled={isSaving || nickname === profile.nickname}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  변경사항 저장
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>계정 정보</CardTitle>
          <CardDescription>계정 생성 및 수정 정보</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">생성일:</span>
            <span>{new Date(profile.created_at).toLocaleDateString('ko-KR')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">최근 수정:</span>
            <span>{new Date(profile.updated_at).toLocaleDateString('ko-KR')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">계정 ID:</span>
            <code className="text-xs bg-muted px-2 py-0.5 rounded">{profile.id}</code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
