'use client';

/**
 * 이상형 월드컵 멀티플레이어 세션 생성 페이지
 */

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Users, Sparkles, ImagePlus } from 'lucide-react';
import { TEMPLATES, TEMPLATE_CATEGORIES } from '../../data/templates';
import { useWorldcupSession } from '../../hooks/useWorldcupSession';
import { generateId } from '../../utils/tournament';
import type { Template } from '../../data/templates';

export default function CreateSessionPage() {
  const router = useRouter();
  const { createSession } = useWorldcupSession();

  const [hostName, setHostName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreating, setIsCreating] = useState(false);

  const filteredTemplates = useMemo(() => {
    if (selectedCategory === 'all') return TEMPLATES;
    return TEMPLATES.filter((t) => t.category === selectedCategory);
  }, [selectedCategory]);

  const handleCreate = async () => {
    if (!hostName.trim() || !selectedTemplate) return;

    setIsCreating(true);

    const candidates = selectedTemplate.candidates.map((c) => ({
      ...c,
      id: generateId(),
    }));

    const tournament = {
      id: generateId(),
      title: selectedTemplate.title,
      totalRounds: selectedTemplate.totalRounds,
      candidates,
      createdAt: new Date(),
    };

    const code = await createSession({
      tournament,
      hostName: hostName.trim(),
      maxParticipants: 50,
    });

    if (code) {
      router.push(`/ideal-worldcup/session/host/${code}`);
    } else {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/ideal-worldcup')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">멀티플레이어 월드컵 만들기</h1>
            <p className="text-muted-foreground">친구들과 함께 이상형 월드컵을 즐겨보세요</p>
          </div>
        </div>

        {/* Host Name */}
        <Card>
          <CardHeader>
            <CardTitle>호스트 정보</CardTitle>
            <CardDescription>세션을 만드는 사람의 이름을 입력하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="hostName">호스트 이름</Label>
              <Input
                id="hostName"
                placeholder="이름을 입력하세요"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                maxLength={20}
              />
            </div>
          </CardContent>
        </Card>

        {/* Template Selection */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>토너먼트 템플릿 선택</CardTitle>
                <CardDescription>인기 템플릿 중 하나를 선택하세요</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/ideal-worldcup')}
              >
                <ImagePlus className="w-4 h-4 mr-2" />
                직접 만들기
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                전체
              </Button>
              {TEMPLATE_CATEGORIES.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.emoji} {cat.label}
                </Button>
              ))}
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => {
                const isSelected = selectedTemplate?.id === template.id;
                const categoryMeta = TEMPLATE_CATEGORIES.find((c) => c.id === template.category);

                return (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`
                      rounded-xl border-2 transition-all text-left overflow-hidden
                      ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }
                    `}
                  >
                    {/* Thumbnail */}
                    <div className="aspect-video w-full bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                      <img
                        src={template.thumbnail}
                        alt={template.title}
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M5 13l4 4L19 7"></path>
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{categoryMeta?.emoji}</span>
                        <span className="text-xs text-muted-foreground">
                          {categoryMeta?.label}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg mb-1">{template.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{template.totalRounds}강</span>
                        <span>•</span>
                        <span>{template.candidates.length}개 항목</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Create Button */}
        <div className="sticky bottom-4 z-10">
          <Card className="shadow-lg">
            <CardContent className="pt-4 pb-4">
              <Button
                onClick={handleCreate}
                disabled={!hostName.trim() || !selectedTemplate || isCreating}
                className="w-full"
                size="lg"
              >
                {isCreating ? (
                  '생성 중...'
                ) : (
                  <>
                    <Users className="w-5 h-5 mr-2" />
                    멀티플레이어 세션 만들기
                    {selectedTemplate && ` (${selectedTemplate.title})`}
                  </>
                )}
              </Button>
              {selectedTemplate && (
                <p className="text-xs text-center text-muted-foreground mt-2">
                  최대 50명까지 참여 가능
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
