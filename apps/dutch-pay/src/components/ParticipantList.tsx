import { useState } from 'react';
import { Button, Input, Card, Avatar, Badge } from '@mini-apps/ui';
import { useSettlementStore } from '@/store/settlement-store';
import { UserPlus, X, Crown, Users } from 'lucide-react';

// Helper function to get initials from name
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Helper function to get avatar color based on name
const getAvatarColor = (name: string) => {
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-green-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

export function ParticipantList() {
  const { settlement, addParticipant, removeParticipant, setTreasurer } =
    useSettlementStore();
  const [newName, setNewName] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) return;
    addParticipant(newName.trim());
    setNewName('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  if (!settlement) return null;

  return (
    <Card className="border-0 shadow-lg bg-white">
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
          <h2 className="text-2xl font-black text-gray-900">참여자</h2>
          <Badge variant="secondary" className="ml-auto">
            {settlement.participants.length}명
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {settlement.participants.map((participant) => (
            <Card
              key={participant.id}
              className={`relative border-2 transition-all duration-200 hover:shadow-md ${
                participant.isTreasurer
                  ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="p-4 flex flex-col items-center gap-2">
                {participant.isTreasurer && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-md">
                    <Crown className="w-4 h-4 text-white" />
                  </div>
                )}

                {settlement.participants.length > 2 && (
                  <button
                    onClick={() => removeParticipant(participant.id)}
                    className="absolute top-2 right-2 p-1 rounded-full bg-white/80 hover:bg-red-500 hover:text-white text-gray-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}

                <button
                  onClick={() => setTreasurer(participant.id)}
                  className="group"
                  title={participant.isTreasurer ? '총무' : '총무로 설정'}
                >
                  <Avatar className={`w-16 h-16 ${getAvatarColor(participant.name)}`}>
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                      {getInitials(participant.name)}
                    </div>
                  </Avatar>
                </button>

                <div className="text-center">
                  <p className="font-bold text-gray-900 text-sm">
                    {participant.name}
                  </p>
                  {participant.isTreasurer && (
                    <Badge variant="secondary" className="mt-1 text-xs">
                      총무
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex gap-3">
          <Input
            type="text"
            placeholder="참여자 이름 입력"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 h-12 text-base"
          />
          <Button
            onClick={handleAdd}
            disabled={!newName.trim()}
            size="lg"
            className="px-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            추가
          </Button>
        </div>

        {settlement.participants.length < 2 && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
            <p className="text-sm font-semibold text-red-700">최소 2명 이상 필요합니다</p>
          </div>
        )}
      </div>
    </Card>
  );
}
