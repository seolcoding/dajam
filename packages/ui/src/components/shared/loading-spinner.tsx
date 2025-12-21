import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LoadingSpinnerProps {
  /** 스피너 크기 */
  size?: "sm" | "default" | "lg";
  /** 로딩 텍스트 */
  text?: string;
  /** 전체 화면 오버레이 */
  fullScreen?: boolean;
  /** 추가 클래스 */
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  default: "h-6 w-6",
  lg: "h-10 w-10",
};

/**
 * 로딩 스피너 컴포넌트
 */
export function LoadingSpinner({
  size = "default",
  text,
  fullScreen = false,
  className,
}: LoadingSpinnerProps) {
  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2",
        className
      )}
    >
      <Loader2
        className={cn("animate-spin text-primary", sizeClasses[size])}
      />
      {text && (
        <span className="text-sm text-muted-foreground">{text}</span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}
