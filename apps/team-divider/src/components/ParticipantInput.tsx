import { useState } from 'react';
import { useTeamStore } from '@/store/useTeamStore';
import { Button, Input, Card } from '@mini-apps/ui';
import { UserPlus, Users, Upload, X } from 'lucide-react';
import Papa from 'papaparse';

export function ParticipantInput() {
  const [name, setName] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [inputMode, setInputMode] = useState<'single' | 'bulk' | 'csv'>('single');

  const { participants, addParticipant, addBulkParticipants, removeParticipant, clearParticipants } = useTeamStore();

  const handleAddSingle = () => {
    if (name.trim()) {
      addParticipant(name);
      setName('');
    }
  };

  const handleAddBulk = () => {
    const names = bulkText.split('\n').filter(n => n.trim());
    if (names.length > 0) {
      addBulkParticipants(names);
      setBulkText('');
    }
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        const names = results.data
          .flat()
          .filter(n => n && typeof n === 'string')
          .map(n => String(n).trim());

        if (names.length > 0) {
          addBulkParticipants(names);
        }
      },
      skipEmptyLines: true,
    });

    // Reset input
    e.target.value = '';
  };

  return (
    <Card className="p-8 border-gray-200 shadow-sm bg-white">
      <h2 className="text-3xl font-bold mb-6 text-gray-900">참가자 입력</h2>

      {/* Input Mode Tabs */}
      <div className="flex gap-3 mb-6">
        <Button
          variant={inputMode === 'single' ? 'default' : 'outline'}
          onClick={() => setInputMode('single')}
          size="sm"
          className={inputMode === 'single' ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-300 hover:bg-gray-50'}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          직접 입력
        </Button>
        <Button
          variant={inputMode === 'bulk' ? 'default' : 'outline'}
          onClick={() => setInputMode('bulk')}
          size="sm"
          className={inputMode === 'bulk' ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-300 hover:bg-gray-50'}
        >
          <Users className="w-4 h-4 mr-2" />
          일괄 입력
        </Button>
        <Button
          variant={inputMode === 'csv' ? 'default' : 'outline'}
          onClick={() => setInputMode('csv')}
          size="sm"
          className={inputMode === 'csv' ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-300 hover:bg-gray-50'}
        >
          <Upload className="w-4 h-4 mr-2" />
          CSV 업로드
        </Button>
      </div>

      {/* Single Input */}
      {inputMode === 'single' && (
        <div className="flex gap-3">
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddSingle()}
            placeholder="이름을 입력하세요"
            className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
          <Button onClick={handleAddSingle} className="bg-blue-600 hover:bg-blue-700">추가</Button>
        </div>
      )}

      {/* Bulk Text Input */}
      {inputMode === 'bulk' && (
        <div className="space-y-3">
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder="이름을 한 줄에 하나씩 입력하세요&#10;홍길동&#10;김철수&#10;이영희"
            className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <Button onClick={handleAddBulk} className="w-full bg-blue-600 hover:bg-blue-700">
            일괄 추가
          </Button>
        </div>
      )}

      {/* CSV Upload */}
      {inputMode === 'csv' && (
        <div className="space-y-3">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
            <Upload className="w-14 h-14 mx-auto mb-4 text-gray-400" />
            <label className="cursor-pointer">
              <span className="text-gray-900 hover:text-blue-600 font-semibold transition-colors">CSV 파일 선택</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="hidden"
              />
            </label>
            <p className="text-sm text-gray-600 mt-3">
              CSV 파일에서 이름을 자동으로 추출합니다
            </p>
          </div>
        </div>
      )}

      {/* Participant List */}
      {participants.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg text-gray-900">
              참가자 목록 ({participants.length}명)
            </h3>
            <Button variant="outline" size="sm" onClick={clearParticipants} className="border-gray-300 hover:bg-gray-50">
              전체 삭제
            </Button>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-3 bg-gray-50">
            {participants.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between bg-white px-4 py-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <span className="font-medium text-gray-900">{p.name}</span>
                <button
                  onClick={() => removeParticipant(p.id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
