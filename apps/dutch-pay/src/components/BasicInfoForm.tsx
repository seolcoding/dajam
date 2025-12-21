import { useState } from 'react';
import { Input, Label, Card } from '@mini-apps/ui';
import { useSettlementStore } from '@/store/settlement-store';
import { Calendar, FileText } from 'lucide-react';
import { format } from 'date-fns';

export function BasicInfoForm() {
  const { settlement, updateSettlement } = useSettlementStore();
  const [name, setName] = useState(settlement?.name || '');
  const [date, setDate] = useState(
    settlement?.date ? format(settlement.date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
  );

  const handleSave = () => {
    if (!settlement) return;
    updateSettlement({
      name,
      date: new Date(date),
    });
  };

  return (
    <Card className="border-0 shadow-lg bg-white">
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-full" />
          <h2 className="text-2xl font-black text-gray-900">정산 기본 정보</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="settlement-name" className="text-base font-bold text-gray-900">
              모임 이름
            </Label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="settlement-name"
                type="text"
                placeholder="예: 2025 연말 회식"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleSave}
                className="pl-10 h-12 text-base"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="settlement-date" className="text-base font-bold text-gray-900">
              정산 날짜
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="settlement-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                onBlur={handleSave}
                className="pl-10 h-12 text-base"
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
