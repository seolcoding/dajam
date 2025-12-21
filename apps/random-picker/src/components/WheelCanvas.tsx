import React, { useRef, useEffect } from "react";
import { WheelRenderer } from "@/lib/wheel-renderer";
import type { WheelItem } from "@/types";

interface WheelCanvasProps {
  items: WheelItem[];
  rotation: number;
  onSpin: () => void;
  isSpinning: boolean;
}

export const WheelCanvas: React.FC<WheelCanvasProps> = ({
  items,
  rotation,
  onSpin,
  isSpinning,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<WheelRenderer | undefined>(undefined);

  // Initialize renderer
  useEffect(() => {
    if (canvasRef.current) {
      rendererRef.current = new WheelRenderer(canvasRef.current);
    }

    return () => {
      rendererRef.current = undefined;
    };
  }, []);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (rendererRef.current) {
        rendererRef.current.resize();
        rendererRef.current.drawWheel(items, rotation);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [items, rotation]);

  // Draw wheel on rotation change
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.drawWheel(items, rotation);
    }
  }, [items, rotation]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        onClick={!isSpinning && items.length >= 2 ? onSpin : undefined}
        className={`${
          isSpinning || items.length < 2
            ? "cursor-not-allowed"
            : "cursor-pointer hover:opacity-90"
        } transition-opacity`}
        aria-label="랜덤 뽑기 룰렛"
      />
      {items.length < 2 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-600 bg-white/90 p-8 rounded-lg shadow-md border border-gray-200">
            <p className="font-bold text-lg text-gray-900">
              최소 2개 이상의 항목이 필요합니다
            </p>
            <p className="text-sm mt-2">왼쪽 패널에서 항목을 추가해주세요</p>
          </div>
        </div>
      )}
    </div>
  );
};
