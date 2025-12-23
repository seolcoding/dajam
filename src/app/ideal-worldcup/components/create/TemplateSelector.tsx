'use client';

/**
 * 프리빌트 템플릿 선택 컴포넌트
 */

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles } from 'lucide-react';
import { TEMPLATES, TEMPLATE_CATEGORIES, type Template } from '../../data/templates';

interface TemplateSelectorProps {
  onSelect: (template: Template) => void;
  onSkip: () => void;
}

export default function TemplateSelector({ onSelect, onSkip }: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredTemplates = selectedCategory
    ? TEMPLATES.filter(t => t.category === selectedCategory)
    : TEMPLATES;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">인기 템플릿</span>
        </div>
        <h2 className="text-2xl font-bold">바로 시작하기</h2>
        <p className="text-gray-600">인기 있는 주제로 빠르게 시작해보세요</p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2">
        <Button
          variant={selectedCategory === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory(null)}
        >
          전체
        </Button>
        {TEMPLATE_CATEGORIES.map(cat => (
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

      {/* Template Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map(template => (
          <Card
            key={template.id}
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
            onClick={() => onSelect(template)}
          >
            <div className="relative aspect-video overflow-hidden">
              <Image
                src={template.thumbnail}
                alt={template.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="font-bold text-lg">{template.title}</h3>
                <p className="text-sm text-white/80">{template.description}</p>
              </div>
              <Badge className="absolute top-2 right-2 bg-white/90 text-gray-800">
                {template.totalRounds}강
              </Badge>
            </div>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {template.candidates.length}개 후보
                </span>
                <Button size="sm" variant="ghost" className="text-blue-600">
                  시작하기 <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Skip to custom */}
      <div className="text-center pt-4 border-t">
        <p className="text-gray-500 mb-3">직접 만들고 싶으신가요?</p>
        <Button variant="outline" onClick={onSkip}>
          직접 토너먼트 만들기
        </Button>
      </div>
    </div>
  );
}
