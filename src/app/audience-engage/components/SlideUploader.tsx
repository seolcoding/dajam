'use client';

import { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Upload, Link, FileImage, X, Check, Loader2, Palette } from 'lucide-react';
import { useSupabase } from '@/hooks/useSupabase';
import type { SlideSourceType } from '../types';

interface SlideUploaderProps {
  sessionId: string;
  onSlidesReady: (slides: UploadedSlide[]) => void;
  onCancel?: () => void;
}

export interface UploadedSlide {
  position: number;
  imageUrl: string;
  thumbnailUrl?: string;
}

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'complete' | 'error';

interface UploadState {
  status: UploadStatus;
  progress: number;
  error?: string;
  slides: UploadedSlide[];
}

/**
 * SlideUploader - 슬라이드 업로드 컴포넌트
 * - Google Slides URL 입력
 * - PDF 업로드 → 이미지 변환
 * - 이미지 직접 업로드
 */
export function SlideUploader({
  sessionId,
  onSlidesReady,
  onCancel,
}: SlideUploaderProps) {
  const supabase = useSupabase();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<SlideSourceType>('google-slides');
  const [googleSlidesUrl, setGoogleSlidesUrl] = useState('');
  const [canvaUrl, setCanvaUrl] = useState('');
  const [uploadState, setUploadState] = useState<UploadState>({
    status: 'idle',
    progress: 0,
    slides: [],
  });

  // Google Slides URL 검증 및 임베드 URL 생성
  const parseGoogleSlidesUrl = useCallback((url: string): string | null => {
    try {
      const urlObj = new URL(url);

      // docs.google.com/presentation/d/{id}/... 형식
      const match = url.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
      if (match) {
        const presentationId = match[1];
        return `https://docs.google.com/presentation/d/${presentationId}/embed?start=false&loop=false&delayms=3000`;
      }

      return null;
    } catch {
      return null;
    }
  }, []);

  // Canva URL 검증 및 임베드 URL 생성
  const parseCanvaUrl = useCallback((url: string): string | null => {
    try {
      const urlObj = new URL(url);

      // canva.com/design/{id}/... 형식
      const match = url.match(/canva\.com\/design\/([a-zA-Z0-9_-]+)/);
      if (match) {
        const designId = match[1];
        return `https://www.canva.com/design/${designId}/view?embed`;
      }

      return null;
    } catch {
      return null;
    }
  }, []);

  // Google Slides 연결
  const handleGoogleSlidesSubmit = useCallback(async () => {
    const embedUrl = parseGoogleSlidesUrl(googleSlidesUrl);
    if (!embedUrl) {
      setUploadState({
        status: 'error',
        progress: 0,
        error: 'Invalid Google Slides URL. Please enter a valid sharing link.',
        slides: [],
      });
      return;
    }

    setUploadState({ status: 'complete', progress: 100, slides: [] });

    // Google Slides는 iframe으로 처리하므로 슬라이드 배열 없이 URL만 전달
    onSlidesReady([{ position: 0, imageUrl: embedUrl }]);
  }, [googleSlidesUrl, parseGoogleSlidesUrl, onSlidesReady]);

  // Canva 연결
  const handleCanvaSubmit = useCallback(async () => {
    const embedUrl = parseCanvaUrl(canvaUrl);
    if (!embedUrl) {
      setUploadState({
        status: 'error',
        progress: 0,
        error: 'Canva URL이 올바르지 않아요. 공유 링크를 확인해 주세요.',
        slides: [],
      });
      return;
    }

    setUploadState({ status: 'complete', progress: 100, slides: [] });

    // Canva도 iframe으로 처리하므로 슬라이드 배열 없이 URL만 전달
    onSlidesReady([{ position: 0, imageUrl: embedUrl }]);
  }, [canvaUrl, parseCanvaUrl, onSlidesReady]);

  // PDF 파일 처리
  const handlePdfUpload = useCallback(async (file: File) => {
    if (!supabase) return;

    setUploadState({ status: 'processing', progress: 10, slides: [] });

    try {
      // pdf.js 동적 로드
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;

      setUploadState((prev) => ({ ...prev, progress: 20 }));

      const slides: UploadedSlide[] = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 }); // 고해상도

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport, canvas }).promise;

        // Canvas → Blob
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.9);
        });

        // Supabase Storage에 업로드
        const fileName = `${sessionId}/slide-${i}.jpg`;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any).storage
          .from('slides')
          .upload(fileName, blob, {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (error) throw error;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: urlData } = (supabase as any).storage
          .from('slides')
          .getPublicUrl(fileName);

        slides.push({
          position: i - 1,
          imageUrl: urlData.publicUrl,
        });

        // 진행률 업데이트
        const progress = 20 + Math.floor((i / numPages) * 70);
        setUploadState((prev) => ({ ...prev, progress, slides }));
      }

      setUploadState({ status: 'complete', progress: 100, slides });
      onSlidesReady(slides);
    } catch (err) {
      console.error('PDF processing error:', err);
      setUploadState({
        status: 'error',
        progress: 0,
        error: 'Failed to process PDF. Please try again.',
        slides: [],
      });
    }
  }, [supabase, sessionId, onSlidesReady]);

  // 이미지 파일 처리
  const handleImagesUpload = useCallback(async (files: FileList) => {
    if (!supabase) return;

    setUploadState({ status: 'uploading', progress: 10, slides: [] });

    try {
      const slides: UploadedSlide[] = [];
      const totalFiles = files.length;

      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];

        // 파일 크기 체크 (10MB)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`File ${file.name} exceeds 10MB limit`);
        }

        const fileName = `${sessionId}/slide-${i + 1}-${Date.now()}.${file.type.split('/')[1]}`;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any).storage
          .from('slides')
          .upload(fileName, file, {
            contentType: file.type,
            upsert: true,
          });

        if (error) throw error;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: urlData } = (supabase as any).storage
          .from('slides')
          .getPublicUrl(fileName);

        slides.push({
          position: i,
          imageUrl: urlData.publicUrl,
        });

        const progress = 10 + Math.floor(((i + 1) / totalFiles) * 80);
        setUploadState((prev) => ({ ...prev, progress, slides }));
      }

      setUploadState({ status: 'complete', progress: 100, slides });
      onSlidesReady(slides);
    } catch (err) {
      console.error('Image upload error:', err);
      setUploadState({
        status: 'error',
        progress: 0,
        error: err instanceof Error ? err.message : 'Failed to upload images',
        slides: [],
      });
    }
  }, [supabase, sessionId, onSlidesReady]);

  // 파일 선택 핸들러
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (activeTab === 'pdf') {
      handlePdfUpload(files[0]);
    } else if (activeTab === 'images') {
      handleImagesUpload(files);
    }
  }, [activeTab, handlePdfUpload, handleImagesUpload]);

  // 드래그 앤 드롭
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    if (activeTab === 'pdf' && files[0].type === 'application/pdf') {
      handlePdfUpload(files[0]);
    } else if (activeTab === 'images') {
      handleImagesUpload(files);
    }
  }, [activeTab, handlePdfUpload, handleImagesUpload]);

  const isUploading = uploadState.status === 'uploading' || uploadState.status === 'processing';

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          슬라이드 업로드
        </CardTitle>
        <CardDescription>
          Google Slides, PDF, 또는 이미지 파일을 업로드하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SlideSourceType)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="google-slides" disabled={isUploading}>
              <Link className="w-4 h-4 mr-2" />
              Google Slides
            </TabsTrigger>
            <TabsTrigger value="canva" disabled={isUploading}>
              <Palette className="w-4 h-4 mr-2" />
              Canva
            </TabsTrigger>
            <TabsTrigger value="pdf" disabled={isUploading}>
              <FileImage className="w-4 h-4 mr-2" />
              PDF
            </TabsTrigger>
            <TabsTrigger value="images" disabled={isUploading}>
              <Upload className="w-4 h-4 mr-2" />
              이미지
            </TabsTrigger>
          </TabsList>

          {/* Google Slides Tab */}
          <TabsContent value="google-slides" className="mt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="google-slides-url">Google Slides URL</Label>
                <Input
                  id="google-slides-url"
                  type="url"
                  placeholder="https://docs.google.com/presentation/d/..."
                  value={googleSlidesUrl}
                  onChange={(e) => setGoogleSlidesUrl(e.target.value)}
                  disabled={isUploading}
                />
                <p className="text-xs text-muted-foreground">
                  Google Slides 공유 링크를 입력하세요. 파일 → 공유 → 링크 복사
                </p>
              </div>
              <Button
                onClick={handleGoogleSlidesSubmit}
                disabled={!googleSlidesUrl || isUploading}
                className="w-full"
              >
                {uploadState.status === 'complete' ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    연결 완료
                  </>
                ) : (
                  '연결하기'
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Canva Tab */}
          <TabsContent value="canva" className="mt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="canva-url">Canva URL</Label>
                <Input
                  id="canva-url"
                  type="url"
                  placeholder="https://www.canva.com/design/..."
                  value={canvaUrl}
                  onChange={(e) => setCanvaUrl(e.target.value)}
                  disabled={isUploading}
                />
                <p className="text-xs text-muted-foreground">
                  Canva 프레젠테이션 공유 링크를 입력하세요. 공유 → 링크 복사
                </p>
              </div>
              <Button
                onClick={handleCanvaSubmit}
                disabled={!canvaUrl || isUploading}
                className="w-full"
              >
                {uploadState.status === 'complete' ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    연결 완료
                  </>
                ) : (
                  '연결하기'
                )}
              </Button>
            </div>
          </TabsContent>

          {/* PDF Tab */}
          <TabsContent value="pdf" className="mt-6">
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              {isUploading ? (
                <div className="space-y-4">
                  <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">
                    PDF 변환 중... ({uploadState.slides.length} 페이지 완료)
                  </p>
                  <Progress value={uploadState.progress} className="w-full" />
                </div>
              ) : uploadState.status === 'complete' ? (
                <div className="space-y-2">
                  <Check className="w-12 h-12 mx-auto text-green-500" />
                  <p className="font-medium">{uploadState.slides.length}개 슬라이드 업로드 완료</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <FileImage className="w-12 h-12 mx-auto text-muted-foreground" />
                  <p className="font-medium">PDF 파일을 드래그하거나 클릭하여 선택</p>
                  <p className="text-xs text-muted-foreground">최대 50페이지, 50MB</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value="images" className="mt-6">
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              {isUploading ? (
                <div className="space-y-4">
                  <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">
                    업로드 중... ({uploadState.slides.length}개 완료)
                  </p>
                  <Progress value={uploadState.progress} className="w-full" />
                </div>
              ) : uploadState.status === 'complete' ? (
                <div className="space-y-2">
                  <Check className="w-12 h-12 mx-auto text-green-500" />
                  <p className="font-medium">{uploadState.slides.length}개 이미지 업로드 완료</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                  <p className="font-medium">이미지 파일을 드래그하거나 클릭하여 선택</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG, WebP (각 최대 10MB)</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Error Message */}
        {uploadState.status === 'error' && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start gap-2">
            <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{uploadState.error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel} disabled={isUploading}>
              취소
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default SlideUploader;
