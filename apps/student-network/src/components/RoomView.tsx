import { useState } from 'react';
import { useRoomStore } from '@/store/roomStore';
import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@mini-apps/ui';
import { ArrowLeft, Users, Heart, MessageCircle, User } from 'lucide-react';
import { MatchingView } from './MatchingView';
import { IcebreakerView } from './IcebreakerView';
import { ProfileCard } from './ProfileCard';
import { useProfileStore } from '@/store/profileStore';

interface RoomViewProps {
  roomId: string;
  onBack: () => void;
}

export const RoomView: React.FC<RoomViewProps> = ({ roomId, onBack }) => {
  const { getRoomById } = useRoomStore();
  const { profile, getProfileById } = useProfileStore();
  const room = getRoomById(roomId);
  const [showProfileCard, setShowProfileCard] = useState(false);

  if (!room || !profile) return null;

  const members = room.members.map(id => getProfileById(id)).filter(Boolean) as any[];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={onBack} variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-1" />
                뒤로가기
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{room.name}</h1>
                <p className="text-sm text-gray-500">참여자 {members.length}명</p>
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
