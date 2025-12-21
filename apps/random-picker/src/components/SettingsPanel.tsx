import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@mini-apps/ui";
import { Button } from "@mini-apps/ui";
import { Label } from "@mini-apps/ui";
import { Switch } from "@mini-apps/ui";
import { Settings } from "lucide-react";
import type { WheelSettings } from "@/types";

interface SettingsPanelProps {
  settings: WheelSettings;
  onUpdate: (settings: Partial<WheelSettings>) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onUpdate,
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>설정</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <Label htmlFor="confetti" className="font-medium text-gray-900">
              Confetti 효과
            </Label>
            <Switch
              id="confetti"
              checked={settings.confettiEnabled}
              onCheckedChange={(checked) =>
                onUpdate({ confettiEnabled: checked })
              }
            />
          </div>

          <div className="text-sm text-gray-600 bg-purple-50 p-4 rounded-lg border border-purple-200">
            <p className="font-semibold text-purple-900 mb-2">룰렛 정보</p>
            <p>• 최소 2개 이상의 항목 필요</p>
            <p>• 최대 50개 항목 제한</p>
            <p>• crypto.getRandomValues() 사용</p>
            <p>• 회전 시간: 4-6초 랜덤</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
