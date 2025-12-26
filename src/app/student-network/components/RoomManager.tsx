'use client';

import { useState } from 'react';
import { useRoomStore } from '../store/roomStore';
import { useProfileStore } from '../store/profileStore';
import { createRoomCode } from '../lib/roomCode';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, LogOut, Eye, EyeOff, Cloud, HardDrive } from 'lucide-react';
import type { Room } from '../types';

interface RoomManagerProps {
  onRoomSelect: (roomId: string, isCloudMode?: boolean) => void;
  onCreateCloudRoom?: (roomName: string) => Promise<string | null>;
}

export const RoomManager: React.FC<RoomManagerProps> = ({
  onRoomSelect,
  onCreateCloudRoom
}) => {
  const { rooms, createRoom, joinRoom, leaveRoom } = useRoomStore();
  const { profile, getProfileById } = useProfileStore();
  const [joinCode, setJoinCode] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [isCreatingCloud, setIsCreatingCloud] = useState(false);

  // 로컬 교실 생성
  const handleCreateLocalRoom = () => {
    if (!newRoomName.trim() || !profile) return;

    const room: Room = {
      id: createRoomCode(),
      name: newRoomName,
      createdBy: profile.id,
      members: [profile.id],
      createdAt: new Date().toISOString()
    };

    createRoom(room);
    setNewRoomName('');
  };

  // 클라우드 교실 생성
  const handleCreateCloudRoom = async () => {
    if (!newRoomName.trim() || !profile || !onCreateCloudRoom) return;

    setIsCreatingCloud(true);
    try {
      const code = await onCreateCloudRoom(newRoomName);
      if (code) {
        setNewRoomName('');
        // 클라우드 교실로 바로 이동
        onRoomSelect(code, true);
      }
    } finally {
      setIsCreatingCloud(false);
    }
  };

  const handleJoinRoom = () => {
    if (!joinCode.trim() || !profile) return;
    // 클라우드 교실인지 확인 (6자리 이상이면 클라우드)
    const isCloud = joinCode.length >= 6;
    if (isCloud) {
      // 클라우드 교실 참여
      onRoomSelect(joinCode.toUpperCase(), true);
    } else {
      // 로컬 교실 참여
      joinRoom(joinCode.toUpperCase(), profile.id);
    }
    setJoinCode('');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-6">
      {/* Room 생성 */}
      <Card className="p-6 border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">새 교실 만들기</h2>
        <div className="space-y-3">
          <input
            type="text"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            placeholder="교실 이름 (예: React 부트캠프 2기)"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
            aria-label="교실 이름"
          />
          <div className="flex gap-3">
            <Button
              onClick={handleCreateLocalRoom}
              disabled={!newRoomName.trim() || !profile}
              variant="outline"
              className="flex-1"
            >
              <HardDrive className="w-4 h-4 mr-2" />
              로컬 교실
            </Button>
            <Button
              onClick={handleCreateCloudRoom}
              disabled={!newRoomName.trim() || !profile || !onCreateCloudRoom || isCreatingCloud}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Cloud className="w-4 h-4 mr-2" />
              {isCreatingCloud ? '생성 중...' : '클라우드 교실'}
            </Button>
          </div>
          {!profile && (
            <p className="text-sm text-red-600">
              먼저 프로필을 생성해주세요
            </p>
          )}
          <p className="text-xs text-gray-500">
            💡 클라우드 교실: 실시간 동기화, QR 코드 공유 가능
          </p>
        </div>
      </Card>

      {/* Room 참여 */}
      <Card className="p-6 border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">교실 참여하기</h2>
        <div className="space-y-3">
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="코드 입력 (로컬 6자리 / 클라우드 6자리 이상)"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all
                       font-mono text-xl tracking-widest uppercase"
            aria-label="참여 코드"
          />
          <Button
            onClick={handleJoinRoom}
            disabled={joinCode.length < 6 || !profile}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            참여하기
          </Button>
          <p className="text-xs text-gray-500">
            💡 클라우드 교실 코드는 6자리 이상입니다
          </p>
        </div>
      </Card>

      {/* 내 교실 목록 */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">내 교실</h2>
        {rooms.length === 0 ? (
          <Card className="p-8 text-center text-gray-500 border-gray-200 shadow-sm">
            참여 중인 교실이 없습니다
          </Card>
        ) : (
          rooms.map(room => (
            <RoomCard
              key={room.id}
              room={room}
              onLeave={() => leaveRoom(room.id, profile!.id)}
              onSelect={() => onRoomSelect(room.id)}
              getProfileById={getProfileById}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Room 카드 컴포넌트
interface RoomCardProps {
  room: Room;
  onLeave: () => void;
  onSelect: () => void;
  getProfileById: (id: string) => any;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, onLeave, onSelect, getProfileById }) => {
  const [showCode, setShowCode] = useState(false);
  // 6자리 = 로컬, 6자리 이상 = 클라우드
  const isCloudRoom = room.id.length > 6;

  const members = room.members.map(id => getProfileById(id)).filter(Boolean);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(room.id);
    alert('교실 코드가 복사되었습니다!');
  };

  return (
    <Card className="p-6 border-gray-200 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-gray-900">{room.name}</h3>
            <Badge
              variant={isCloudRoom ? 'default' : 'secondary'}
              className={isCloudRoom ? 'bg-blue-500' : ''}
            >
              {isCloudRoom ? (
                <>
                  <Cloud className="w-3 h-3 mr-1" /> 클라우드
                </>
              ) : (
                <>
                  <HardDrive className="w-3 h-3 mr-1" /> 로컬
                </>
              )}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">
            참여자: {room.members.length}명
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => setShowCode(!showCode)}
            variant="outline"
            size="sm"
          >
            {showCode ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
            {showCode ? '코드 숨기기' : '코드 보기'}
          </Button>
          <Button
            onClick={onLeave}
            variant="outline"
            size="sm"
          >
            <LogOut className="w-4 h-4 mr-1" />
            나가기
          </Button>
        </div>
      </div>

      {showCode && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <span className="font-mono text-2xl font-bold tracking-widest text-gray-900">
            {room.id}
          </span>
          <Button onClick={copyRoomCode} size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Copy className="w-4 h-4 mr-1" />
            복사
          </Button>
        </div>
      )}

      {/* 참여자 프로필 그리드 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
        {members.map((member: any) => (
          <div
            key={member.id}
            className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100"
          >
            {member.avatarUrl ? (
              <img
                src={member.avatarUrl}
                alt={member.name}
                className="w-14 h-14 rounded-full mx-auto mb-2 object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-blue-100
                              flex items-center justify-center text-xl mx-auto mb-2 text-blue-600">
                {member.name[0]}
              </div>
            )}
            <p className="text-sm font-medium text-center truncate text-gray-900">
              {member.name}
            </p>
            <p className="text-xs text-gray-600 text-center truncate">
              {member.field}
            </p>
          </div>
        ))}
      </div>

      <Button onClick={onSelect} className="w-full bg-blue-600 hover:bg-blue-700">
        교실 입장하기
      </Button>
    </Card>
  );
};
