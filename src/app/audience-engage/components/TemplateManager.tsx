'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Save,
  FolderOpen,
  Trash2,
  Copy,
  FileText,
  Clock,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { SlideItem, AudienceEngageConfig } from '../types';

interface SessionTemplate {
  id: string;
  name: string;
  description?: string;
  config: AudienceEngageConfig;
  createdAt: string;
  updatedAt: string;
}

interface TemplateManagerProps {
  currentConfig: AudienceEngageConfig;
  onLoadTemplate: (config: AudienceEngageConfig) => void;
  className?: string;
}

const STORAGE_KEY = 'audience-engage-templates';

/**
 * TemplateManager - 템플릿 저장/불러오기 관리
 *
 * - 현재 설정을 템플릿으로 저장
 * - 저장된 템플릿 목록 표시
 * - 템플릿 불러오기/삭제/복제
 * - LocalStorage에 저장 (추후 Supabase로 이동 가능)
 */
export function TemplateManager({
  currentConfig,
  onLoadTemplate,
  className = '',
}: TemplateManagerProps) {
  const [templates, setTemplates] = useState<SessionTemplate[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');

  // 템플릿 로드
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setTemplates(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  }, []);

  // 템플릿 저장
  const saveTemplates = useCallback((newTemplates: SessionTemplate[]) => {
    setTemplates(newTemplates);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newTemplates));
    } catch (err) {
      console.error('Failed to save templates:', err);
    }
  }, []);

  // 새 템플릿 저장
  const handleSaveTemplate = useCallback(() => {
    if (!templateName.trim()) return;

    const newTemplate: SessionTemplate = {
      id: `template-${Date.now()}`,
      name: templateName.trim(),
      description: templateDescription.trim() || undefined,
      config: currentConfig,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveTemplates([...templates, newTemplate]);
    setTemplateName('');
    setTemplateDescription('');
    setSaveDialogOpen(false);
  }, [templateName, templateDescription, currentConfig, templates, saveTemplates]);

  // 템플릿 불러오기
  const handleLoadTemplate = useCallback((template: SessionTemplate) => {
    onLoadTemplate(template.config);
    setLoadDialogOpen(false);
  }, [onLoadTemplate]);

  // 템플릿 삭제
  const handleDeleteTemplate = useCallback((templateId: string) => {
    const confirmed = window.confirm('이 템플릿을 삭제하시겠습니까?');
    if (confirmed) {
      saveTemplates(templates.filter((t) => t.id !== templateId));
    }
  }, [templates, saveTemplates]);

  // 템플릿 복제
  const handleDuplicateTemplate = useCallback((template: SessionTemplate) => {
    const duplicate: SessionTemplate = {
      ...template,
      id: `template-${Date.now()}`,
      name: `${template.name} (복사본)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveTemplates([...templates, duplicate]);
  }, [templates, saveTemplates]);

  // 날짜 포맷
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      {/* 저장 버튼 */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Save className="w-4 h-4 mr-2" />
            템플릿 저장
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>템플릿으로 저장</DialogTitle>
            <DialogDescription>
              현재 세션 설정을 템플릿으로 저장하여 나중에 다시 사용할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">템플릿 이름</Label>
              <Input
                id="template-name"
                placeholder="예: 마케팅 발표 템플릿"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-desc">설명 (선택)</Label>
              <Input
                id="template-desc"
                placeholder="템플릿에 대한 간단한 설명"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSaveTemplate} disabled={!templateName.trim()}>
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 불러오기 버튼 */}
      <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <FolderOpen className="w-4 h-4 mr-2" />
            템플릿 불러오기
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>템플릿 불러오기</DialogTitle>
            <DialogDescription>
              저장된 템플릿을 선택하여 현재 세션에 적용합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {templates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>저장된 템플릿이 없습니다</p>
                <p className="text-sm mt-1">먼저 템플릿을 저장해주세요</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {templates.map((template) => (
                  <Card
                    key={template.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <CardContent className="p-3 flex items-start justify-between">
                      <div
                        className="flex-1"
                        onClick={() => handleLoadTemplate(template)}
                      >
                        <div className="font-medium text-sm">{template.name}</div>
                        {template.description && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {template.description}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(template.updatedAt)}
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleLoadTemplate(template)}>
                            <FolderOpen className="w-4 h-4 mr-2" />
                            불러오기
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateTemplate(template)}>
                            <Copy className="w-4 h-4 mr-2" />
                            복제
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteTemplate(template.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TemplateManager;
