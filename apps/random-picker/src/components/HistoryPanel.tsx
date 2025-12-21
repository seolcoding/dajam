import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@mini-apps/ui";
import { Button } from "@mini-apps/ui";
import { Card } from "@mini-apps/ui";
import { History, Trash2 } from "lucide-react";
import type { SpinResult } from "@/types";

interface HistoryPanelProps {
  history: SpinResult[];
  onClear: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  onClear,
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <History className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>히스토리</span>
            {history.length > 0 && (
              <Button variant="ghost" size="sm" onClick={onClear}>
                <Trash2 className="h-4 w-4 mr-2" />
                전체 삭제
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-96 overflow-y-auto space-y-2">
          {history.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              히스토리가 없습니다
            </div>
          ) : (
            history.map((result) => {
              const date = new Date(result.timestamp);
              return (
                <Card key={result.id} className="p-3 bg-gray-50 border-gray-200">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm"
                      style={{ backgroundColor: result.selectedItem.color }}
                    >
                      🎯
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">
                        {result.selectedItem.label}
                      </div>
                      <div className="text-xs text-gray-500">
                        {date.toLocaleString("ko-KR")}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
