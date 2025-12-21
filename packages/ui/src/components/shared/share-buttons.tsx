import * as React from "react";
import { Share2, Link2, Check, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export interface ShareButtonsProps {
  /** 공유할 URL (기본: 현재 페이지) */
  url?: string;
  /** 공유 텍스트/제목 */
  title: string;
  /** 공유 설명 (선택) */
  description?: string;
  /** 공유할 이미지 Blob (선택) */
  imageBlob?: Blob;
  /** 버튼 크기 */
  size?: "default" | "sm" | "lg";
  /** 추가 클래스 */
  className?: string;
}

/**
 * SNS 공유 버튼 컴포넌트
 * - 네이티브 공유 (Web Share API)
 * - 카카오톡 공유
 * - 링크 복사
 */
export function ShareButtons({
  url,
  title,
  description,
  imageBlob,
  size = "default",
  className,
}: ShareButtonsProps) {
  const [copied, setCopied] = React.useState(false);
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  // 네이티브 공유 (모바일)
  const handleNativeShare = async () => {
    if (!navigator.share) {
      toast({
        title: "공유 불가",
        description: "이 브라우저에서는 공유 기능을 지원하지 않습니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      const shareData: ShareData = {
        title,
        text: description || title,
        url: shareUrl,
      };

      // 이미지가 있으면 파일로 공유
      if (imageBlob && navigator.canShare) {
        const file = new File([imageBlob], "result.png", { type: "image/png" });
        if (navigator.canShare({ files: [file] })) {
          shareData.files = [file];
        }
      }

      await navigator.share(shareData);
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Share failed:", error);
      }
    }
  };

  // 카카오톡 공유
  const handleKakaoShare = () => {
    if (typeof window === "undefined") return;

    // Kakao SDK가 로드되어 있는지 확인
    const Kakao = (window as unknown as { Kakao?: KakaoSDK }).Kakao;
    if (!Kakao?.Share) {
      toast({
        title: "카카오 SDK 필요",
        description: "카카오톡 공유를 위해 SDK를 로드해주세요.",
        variant: "destructive",
      });
      return;
    }

    Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title,
        description: description || "",
        imageUrl: "", // 실제 사용 시 이미지 URL 설정 필요
        link: {
          mobileWebUrl: shareUrl,
          webUrl: shareUrl,
        },
      },
      buttons: [
        {
          title: "결과 보기",
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl,
          },
        },
      ],
    });
  };

  // 링크 복사
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "복사 완료",
        description: "링크가 클립보드에 복사되었습니다.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
      toast({
        title: "복사 실패",
        description: "링크 복사에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* 네이티브 공유 (Web Share API 지원 시) */}
      {typeof navigator !== "undefined" && "share" in navigator && (
        <Button
          variant="outline"
          size={size}
          onClick={handleNativeShare}
          aria-label="공유하기"
        >
          <Share2 className="h-4 w-4" />
          <span className="ml-2 hidden sm:inline">공유</span>
        </Button>
      )}

      {/* 카카오톡 공유 */}
      <Button
        variant="outline"
        size={size}
        onClick={handleKakaoShare}
        className="bg-[#FEE500] hover:bg-[#FDD835] text-[#191919] border-[#FEE500]"
        aria-label="카카오톡으로 공유"
      >
        <MessageCircle className="h-4 w-4" />
        <span className="ml-2 hidden sm:inline">카카오톡</span>
      </Button>

      {/* 링크 복사 */}
      <Button
        variant="outline"
        size={size}
        onClick={handleCopyLink}
        aria-label="링크 복사"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Link2 className="h-4 w-4" />
        )}
        <span className="ml-2 hidden sm:inline">
          {copied ? "복사됨" : "링크 복사"}
        </span>
      </Button>
    </div>
  );
}

// Kakao SDK 타입 정의
interface KakaoSDK {
  Share?: {
    sendDefault: (options: {
      objectType: string;
      content: {
        title: string;
        description: string;
        imageUrl: string;
        link: { mobileWebUrl: string; webUrl: string };
      };
      buttons: Array<{
        title: string;
        link: { mobileWebUrl: string; webUrl: string };
      }>;
    }) => void;
  };
}
