'use client';

import { useState, useEffect } from 'react';
import { useProfileStore } from '../store/profileStore';
import { useNetworkSession } from '../hooks/useNetworkSession';
import { ProfileForm } from './ProfileForm';
import { RoomManager } from './RoomManager';
import { RoomView } from './RoomView';
import { Button } from '@/components/ui/button';
import { Settings, Download, Trash2, Users } from 'lucide-react';
import { clearAllData, exportData } from '../lib/privacy';
import { AppHeader, AppFooter } from '@/components/layout';

type View = 'profile-form' | 'room-manager' | 'room-view';

export function StudentNetworkApp() {
  const { profile } = useProfileStore();
  const [currentView, setCurrentView] = useState<View>('profile-form');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [isCloudMode, setIsCloudMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // 클라우드 교실 생성용 세션 (빈 코드로 초기화, 생성 시에만 사용)
  const { createRoom } = useNetworkSession('', false);

  useEffect(() => {
    if (profile) {
      setCurrentView('room-manager');
    }
  }, [profile]);

  const handleRoomSelect = (roomId: string, cloudMode = false) => {
    setSelectedRoomId(roomId);
    setIsCloudMode(cloudMode);
    setCurrentView('room-view');
  };

  const handleBackToRooms = () => {
    setCurrentView('room-manager');
    setSelectedRoomId(null);
    setIsCloudMode(false);
  };

  // 클라우드 교실 생성
  const handleCreateCloudRoom = async (roomName: string): Promise<string | null> => {
    if (!profile) return null;

    return await createRoom({
      roomName,
      createdBy: profile.id,
      description: `${profile.name}님의 교실`,
      hostProfile: profile,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader
        title="수강생 네트워킹"
        description="학력이 아닌 관심사로 연결되는"
        icon={Users}
        iconGradient="from-purple-500 to-pink-500"
        variant="compact"
        actions={
          profile && (
            <Button
              onClick={() => setShowSettings(!showSettings)}
              variant="outline"
              size="sm"
            >
              <Settings className="w-4 h-4" />
            </Button>
          )
        }
      />

      {/* 설정 패널 */}
      {showSettings && (
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <h3 className="font-bold mb-3">설정</h3>
            <div className="flex gap-3">
              <Button onClick={exportData} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" />
                데이터 백업
              </Button>
              <Button onClick={clearAllData} variant="outline" size="sm">
                <Trash2 className="w-4 h-4 mr-1" />
                모든 데이터 삭제
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 메인 컨텐츠 */}
      <main className="flex-1 py-8">
        {currentView === 'profile-form' && (
          <ProfileForm onComplete={() => setCurrentView('room-manager')} />
        )}
        {currentView === 'room-manager' && (
          <RoomManager
            onRoomSelect={handleRoomSelect}
            onCreateCloudRoom={handleCreateCloudRoom}
          />
        )}
        {currentView === 'room-view' && selectedRoomId && (
          <RoomView
            roomId={selectedRoomId}
            isCloudMode={isCloudMode}
            onBack={handleBackToRooms}
          />
        )}
      </main>

      <AppFooter
        variant="compact"
        disclaimer="모든 데이터는 브라우저에만 저장됩니다. 서버로 전송되지 않으며, 브라우저 데이터 삭제 시 모든 정보가 사라집니다."
      />
    </div>
  );
}
