import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@mini-apps/ui";
import { Button } from "@mini-apps/ui";
import { Download, X } from "lucide-react";
import type { SpinResult } from "@/types";

interface ResultModalProps {
  result: SpinResult | null;
  open: boolean;
  onClose: () => void;
  onDownload?: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  result,
  open,
  onClose,
  onDownload,
}) => {
  if (!result) return null;

  const date = new Date(result.timestamp);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-3xl font-extrabold text-purple-600">
            당첨!
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {date.toLocaleString("ko-KR")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-8">
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center shadow-lg"
            style={{ backgroundColor: result.selectedItem.color }}
          >
            <span className="text-5xl">🎉</span>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {result.selectedItem.label}
            </div>
            <div className="text-sm text-gray-500 font-medium">
              회전: {result.rotation.toFixed(0)}°
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 border-gray-300 hover:bg-gray-100"
            onClick={onClose}
          >
            <X className="h-4 w-4 mr-2" />
            닫기
          </Button>
          {onDownload && (
            <Button
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              onClick={onDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              이미지 저장
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
