import * as React from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ResultCardProps {
  /** 결과 제목 */
  title: string;
  /** 결과 내용 */
  children: React.ReactNode;
  /** 캔버스 참조 (이미지 다운로드용) */
  canvasRef?: React.RefObject<HTMLCanvasElement>;
  /** 다운로드 파일명 */
  downloadFileName?: string;
  /** 추가 클래스 */
  className?: string;
  /** 배경 그라디언트 (Tailwind 클래스) */
  gradient?: string;
  /** 다운로드 버튼 표시 여부 */
  showDownload?: boolean;
  /** 다운로드 콜백 */
  onDownload?: () => void;
}

/**
 * 결과 표시 및 이미지 다운로드용 카드 컴포넌트
 */
export function ResultCard({
  title,
  children,
  canvasRef,
  downloadFileName = "result.png",
  className,
  gradient = "from-primary/10 to-primary/5",
  showDownload = true,
  onDownload,
}: ResultCardProps) {

  // 카드를 이미지로 다운로드
  const handleDownload = () => {
    if (onDownload) {
      onDownload();
      return;
    }

    // 캔버스가 제공된 경우
    if (canvasRef?.current) {
      const link = document.createElement("a");
      link.download = downloadFileName;
      link.href = canvasRef.current.toDataURL("image/png");
      link.click();
      return;
    }

    // 캔버스가 없으면 경고
    console.warn("ResultCard: canvasRef 또는 onDownload가 필요합니다.");
  };

  return (
    <Card
      className={cn(
        "overflow-hidden bg-gradient-to-br",
        gradient,
        className
      )}
    >
      <CardContent className="p-6">
        {/* 제목 */}
        <h2 className="text-xl font-bold text-center mb-4">{title}</h2>

        {/* 결과 내용 */}
        <div className="space-y-4">{children}</div>

        {/* 다운로드 버튼 */}
        {showDownload && (
          <div className="mt-6 flex justify-center">
            <Button onClick={handleDownload} variant="default">
              <Download className="h-4 w-4 mr-2" />
              이미지 저장
            </Button>
          </div>
        )}

        {/* 워터마크 */}
        <div className="mt-4 text-center text-xs text-muted-foreground">
          seolcoding.com
        </div>
      </CardContent>
    </Card>
  );
}
