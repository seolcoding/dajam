import { useState, useEffect } from 'react';
import { useProfileStore } from '@/store/profileStore';
import { ProfileForm } from '@/components/ProfileForm';
import { RoomManager } from '@/components/RoomManager';
import { RoomView } from '@/components/RoomView';
import { Button } from '@mini-apps/ui';
import { Settings, Download, Trash2 } from 'lucide-react';
import { clearAllData, exportData } from '@/lib/privacy';

type View = 'profile-form' | 'room-manager' | 'room-view';

function App() {
  const { profile } = useProfileStore();
  const [currentView, setCurrentView] = useState<View>('profile-form');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (profile) {
      setCurrentView('room-manager');
    }
  }, [profile]);

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoomId(roomId);
    setCurrentView('room-view');
  };

  const handleBackToRooms = () => {
    setCurrentView('room-manager');
    setSelectedRoomId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              수강생 네트워킹
            </h1>
            <p className="text-sm text-gray-600">학력이 아닌 관심사로 연결되는</p>
          </div>
          {profile && (
            <Button
              onClick={() => setShowSettings(!showSettings)}
              variant="outline"
              size="sm"
            >
              <Settings className="w-4 h-4" />
            </Button>
          )}
        </div>
      </header>

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
      <main className="py-8">
        {currentView === 'profile-form' && (
          <ProfileForm onComplete={() => setCurrentView('room-manager')} />
        )}
        {currentView === 'room-manager' && (
          <RoomManager onRoomSelect={handleRoomSelect} />
        )}
        {currentView === 'room-view' && selectedRoomId && (
          <RoomView roomId={selectedRoomId} onBack={handleBackToRooms} />
        )}
      </main>

      {/* 푸터 */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">개인정보 보호: 모든 데이터는 브라우저에만 저장됩니다</p>
            <p>서버로 전송되지 않으며, 브라우저 데이터 삭제 시 모든 정보가 사라집니다</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
