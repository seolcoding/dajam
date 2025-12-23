'use client';

import { useState, useEffect } from 'react';
import { useRoomStore } from '../store/roomStore';
import { useNetworkSession } from '../hooks/useNetworkSession';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Users, Heart, MessageCircle, User, Cloud, HardDrive } from 'lucide-react';
import { RealtimeIndicator } from '@/components/common/RealtimeIndicator';
import { MatchingView } from './MatchingView';
import { IcebreakerView } from './IcebreakerView';
import { ProfileCard } from './ProfileCard';
import { useProfileStore } from '../store/profileStore';

interface RoomViewProps {
  roomId: string;
  isCloudMode?: boolean;
  onBack: () => void;
}

export const RoomView: React.FC<RoomViewProps> = ({ roomId, isCloudMode = false, onBack }) => {
  const { getRoomById } = useRoomStore();
  const { profile, getProfileById } = useProfileStore();
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  // 클라우드 모드일 때만 실시간 세션 사용
  const {
    roomName: cloudRoomName,
    profiles: cloudProfiles,
    participantCount,
    isLoading,
    connectionStatus,
    isConnected,
    joinRoom,
  } = useNetworkSession(roomId, isCloudMode);

  // 로컬 교실 데이터
  const localRoom = !isCloudMode ? getRoomById(roomId) : null;
  const localMembers = localRoom ? localRoom.members.map(id => getProfileById(id)).filter(Boolean) as any[] : [];

  // 표시할 데이터 선택
  const roomName = isCloudMode ? cloudRoomName : localRoom?.name;
  const members = isCloudMode ? cloudProfiles : localMembers;

  // 클라우드 모드 자동 참여
  useEffect(() => {
    if (isCloudMode && profile && !hasJoined && !isLoading) {
      joinRoom(profile).then(() => {
        setHasJoined(true);
      });
    }
  }, [isCloudMode, profile, hasJoined, isLoading, joinRoom]);

  if (!profile) return null;
  if (isCloudMode && isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">교실 로딩 중...</p>
        </div>
      </div>
    );
  }
  if (!roomName) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Button onClick={onBack} variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-1" />
                뒤로가기
              </Button>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold">{roomName}</h1>
                  <Badge
                    variant={isCloudMode ? 'default' : 'secondary'}
                    className={isCloudMode ? 'bg-blue-500' : ''}
                  >
                    {isCloudMode ? (
                      <>
                        <Cloud className="w-3 h-3 mr-1" /> 클라우드
                      </>
                    ) : (
                      <>
                        <HardDrive className="w-3 h-3 mr-1" /> 로컬
                      </>
                    )}
                  </Badge>
                  {isCloudMode && (
                    <RealtimeIndicator
                      isConnected={isConnected}
                      showTimestamp={false}
                    />
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  참여자 {isCloudMode ? participantCount : members.length}명
                </p>
              </div>
            </div>
            <Button onClick={() => setShowProfileCard(!showProfileCard)} variant="outline">
              <User className="w-4 h-4 mr-1" />
              내 프로필 카드
            </Button>
          </div>
        </div>
      </div>

      {/* 프로필 카드 모달 */}
      {showProfileCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-3xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">내 프로필 카드</h2>
              <Button onClick={() => setShowProfileCard(false)} variant="outline" size="sm">
                닫기
              </Button>
            </div>
            <ProfileCard profile={profile} />
          </div>
        </div>
      )}

      {/* 탭 컨텐츠 */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Tabs defaultValue="members" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="members">
              <Users className="w-4 h-4 mr-2" />
              참여자
            </TabsTrigger>
            <TabsTrigger value="matching">
              <Heart className="w-4 h-4 mr-2" />
              관심사 매칭
            </TabsTrigger>
            <TabsTrigger value="icebreaker">
              <MessageCircle className="w-4 h-4 mr-2" />
              아이스브레이킹
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {members.map(member => (
                <div
                  key={member.id}
                  className="p-6 bg-white rounded-lg shadow-sm border border-gray-200
                             hover:border-blue-600 transition-colors"
                >
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.name}
                      className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-2 border-blue-600"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-blue-100
                                    flex items-center justify-center text-2xl mx-auto mb-4 text-blue-600">
                      {member.name[0]}
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-center mb-2 text-gray-900">{member.name}</h3>
                  <p className="text-gray-600 text-sm text-center mb-2">{member.tagline}</p>
                  <p className="text-center text-sm text-gray-500 mb-4">{member.field}</p>

                  {member.interests.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {member.interests.slice(0, 3).map((interest: string) => (
                        <span
                          key={interest}
                          className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-200"
                        >
                          {interest}
                        </span>
                      ))}
                      {member.interests.length > 3 && (
                        <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs border border-gray-200">
                          +{member.interests.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="matching">
            <MatchingView roomId={roomId} />
          </TabsContent>

          <TabsContent value="icebreaker">
            <IcebreakerView roomId={roomId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
