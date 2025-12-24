"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { FileUp, FileText, Loader2, CheckCircle, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ExtractedQuestion {
  id: string;
  question: string;
  options: string[];
  answer?: number;
  explanation?: string;
}

interface HWPMagicPassProps {
  onQuestionsExtracted?: (questions: ExtractedQuestion[]) => void;
  maxFileSize?: number; // in MB
  className?: string;
}

type UploadState = "idle" | "dragging" | "uploading" | "processing" | "success" | "error";

/**
 * HWPMagicPass - HWP 파일 업로드 및 퀴즈 추출 컴포넌트
 *
 * "드래그 한 번으로 100문제를 3초 만에."
 *
 * @example
 * ```tsx
 * <HWPMagicPass
 *   onQuestionsExtracted={(questions) => {
 *     console.log('추출된 문제:', questions);
 *   }}
 * />
 * ```
 */
export function HWPMagicPass({
  onQuestionsExtracted,
  maxFileSize = 10,
  className,
}: HWPMagicPassProps) {
  const [state, setState] = React.useState<UploadState>("idle");
  const [file, setFile] = React.useState<File | null>(null);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [extractedCount, setExtractedCount] = React.useState(0);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // 드래그 이벤트 핸들러
  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState("dragging");
  }, []);

  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState("idle");
  }, []);

  const handleDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files[0];
      handleFile(droppedFile);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [maxFileSize]
  );

  // 파일 선택 핸들러
  const handleFileSelect = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        handleFile(selectedFile);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [maxFileSize]
  );

  // 파일 처리
  const handleFile = async (selectedFile: File) => {
    setError(null);

    // 파일 타입 검증
    const validTypes = [
      "application/x-hwp",
      "application/haansofthwp",
      ".hwp",
    ];
    const isValidType =
      validTypes.some((type) => selectedFile.type.includes(type)) ||
      selectedFile.name.toLowerCase().endsWith(".hwp");

    if (!isValidType) {
      setError("HWP 파일만 업로드할 수 있어요!");
      setState("error");
      return;
    }

    // 파일 크기 검증
    if (selectedFile.size > maxFileSize * 1024 * 1024) {
      setError(`파일이 너무 커요! ${maxFileSize}MB 이하로 올려주세요.`);
      setState("error");
      return;
    }

    setFile(selectedFile);
    setState("uploading");
    setProgress(0);

    // 업로드 시뮬레이션 (실제 구현 시 API 호출로 대체)
    try {
      // 업로드 진행
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setProgress(i);
      }

      setState("processing");

      // AI 처리 시뮬레이션 (실제 구현 시 API 호출로 대체)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 성공 시뮬레이션
      const mockQuestions: ExtractedQuestion[] = [
        {
          id: "1",
          question: "다음 중 대한민국의 수도는?",
          options: ["부산", "대전", "서울", "인천"],
          answer: 2,
        },
        {
          id: "2",
          question: "2024년 파리 올림픽 개최 연도는?",
          options: ["2023", "2024", "2025", "2026"],
          answer: 1,
        },
      ];

      setExtractedCount(mockQuestions.length);
      setState("success");
      onQuestionsExtracted?.(mockQuestions);
    } catch {
      setError("문제 추출 중 오류가 발생했어요. 다시 시도해주세요!");
      setState("error");
    }
  };

  // 다시 시도
  const handleRetry = () => {
    setFile(null);
    setError(null);
    setProgress(0);
    setExtractedCount(0);
    setState("idle");
  };

  // 상태별 UI 렌더링
  const renderContent = () => {
    switch (state) {
      case "uploading":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <Loader2 className="w-16 h-16 mx-auto mb-4 text-dajaem-green animate-spin" />
            <h3 className="text-xl font-bold mb-2">업로드 중...</h3>
            <div className="w-full max-w-xs mx-auto bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-dajaem-green h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">{progress}%</p>
          </motion.div>
        );

      case "processing":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            >
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-dajaem-purple" />
            </motion.div>
            <h3 className="text-xl font-bold mb-2">AI가 문제를 추출하고 있어요!</h3>
            <p className="text-muted-foreground">잠시만 기다려주세요...</p>
          </motion.div>
        );

      case "success":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-dajaem-green" />
            <h3 className="text-xl font-bold mb-2 text-dajaem-green">
              추출 완료!
            </h3>
            <p className="text-lg mb-4">
              <span className="font-bold text-2xl text-dajaem-green">
                {extractedCount}
              </span>
              개의 문제를 찾았어요!
            </p>
            <Button onClick={handleRetry} variant="outline">
              다른 파일 업로드
            </Button>
          </motion.div>
        );

      case "error":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-dajaem-red" />
            <h3 className="text-xl font-bold mb-2 text-dajaem-red">
              앗, 문제가 생겼어요!
            </h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={handleRetry}>다시 시도하기</Button>
          </motion.div>
        );

      default:
        return (
          <>
            <FileUp className="w-16 h-16 mx-auto mb-4 text-dajaem-green" />
            <h3 className="text-2xl font-bold mb-2">HWP 매직 패스</h3>
            <p className="text-muted-foreground mb-4">
              HWP 파일을 드래그하거나 클릭해서 업로드하세요
            </p>
            <p className="text-sm text-dajaem-green font-medium">
              드래그 한 번으로 100문제를 3초 만에!
            </p>

            {file && (
              <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center gap-3">
                <FileText className="w-5 h-5 text-dajaem-green" />
                <span className="text-sm truncate">{file.name}</span>
              </div>
            )}
          </>
        );
    }
  };

  return (
    <Card
      className={cn(
        "p-8 transition-all duration-300",
        state === "dragging" && "ring-4 ring-dajaem-green ring-offset-2",
        className
      )}
    >
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => state === "idle" && fileInputRef.current?.click()}
        className={cn(
          "border-4 border-dashed rounded-3xl p-12 text-center cursor-pointer",
          "transition-all duration-300",
          state === "dragging"
            ? "border-dajaem-green bg-dajaem-green-50 scale-[1.02]"
            : state === "idle"
            ? "border-gray-300 hover:border-dajaem-green-400 dark:border-gray-600"
            : "border-transparent cursor-default"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".hwp,application/x-hwp"
          onChange={handleFileSelect}
          className="hidden"
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={state}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 지원 포맷 안내 */}
      {state === "idle" && (
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>지원 형식: .hwp (한글 2007 이상)</p>
          <p>최대 파일 크기: {maxFileSize}MB</p>
        </div>
      )}
    </Card>
  );
}

export default HWPMagicPass;
