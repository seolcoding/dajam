# Technical Design Document
## 프롬프트 엔지니어링 인터랙티브 튜토리얼 웹 앱

**Version**: 1.0
**Date**: 2025-12-14
**Status**: Draft

---

## 1. System Architecture Overview

### 1.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Browser)                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                        Next.js App (React 19)                        │   │
│  ├──────────────────────────────────────────────────────────────────────┤   │
│  │                                                                       │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│  │  │   Pages     │  │ Components  │  │   Stores    │  │    Hooks    │  │   │
│  │  │  (Router)   │  │    (UI)     │  │  (Zustand)  │  │  (Custom)   │  │   │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  │   │
│  │         │                │                │                │         │   │
│  │         └────────────────┴────────────────┴────────────────┘         │   │
│  │                                   │                                   │   │
│  │  ┌────────────────────────────────┴────────────────────────────────┐ │   │
│  │  │                         Lib Layer                               │ │   │
│  │  ├─────────────┬─────────────┬─────────────┬─────────────────────┤ │   │
│  │  │ LLM Client  │  Storage    │  Grading    │    Content Loader   │ │   │
│  │  │ (Unified)   │  (Dexie.js) │  (Engine)   │    (MDX Parser)     │ │   │
│  │  └──────┬──────┴──────┬──────┴─────────────┴─────────────────────┘ │   │
│  │         │             │                                             │   │
│  └─────────┼─────────────┼─────────────────────────────────────────────┘   │
│            │             │                                                  │
│  ┌─────────▼─────────┐   │    ┌──────────────────────────────────────┐     │
│  │   IndexedDB       │◄──┘    │         localStorage                 │     │
│  │  (Dexie.js)       │        │   (Settings, API Keys encrypted)    │     │
│  │  - Profiles       │        └──────────────────────────────────────┘     │
│  │  - Progress       │                                                      │
│  │  - Interactions   │                                                      │
│  └───────────────────┘                                                      │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTPS
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SERVER (Next.js API Routes)                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         API Routes (Edge/Node)                       │    │
│  ├──────────────────┬──────────────────┬───────────────────────────────┤    │
│  │  /api/llm        │  /api/feedback   │  /api/health                  │    │
│  │  - completion    │  - analyze       │  - status                     │    │
│  │  - stream        │  - generate      │                               │    │
│  └────────┬─────────┴────────┬─────────┴───────────────────────────────┘    │
│           │                  │                                               │
│  ┌────────▼──────────────────▼──────────────────────────────────────────┐   │
│  │                    LLM Provider Abstraction                          │   │
│  ├──────────────────┬──────────────────┬───────────────────────────────┤   │
│  │   OpenAI SDK     │   OpenRouter     │   Custom (Ollama/Local)       │   │
│  │  (GPT-4.1 mini)  │   (Multi-model)  │   (Self-hosted)               │   │
│  └──────────────────┴──────────────────┴───────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTPS
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          EXTERNAL SERVICES                                   │
├──────────────────┬──────────────────┬───────────────────────────────────────┤
│   OpenAI API     │   OpenRouter     │   Other LLM Providers                 │
│   api.openai.com │   openrouter.ai  │   (Anthropic, Cohere, etc.)          │
└──────────────────┴──────────────────┴───────────────────────────────────────┘
```

### 1.2 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER INTERACTION FLOW                           │
└─────────────────────────────────────────────────────────────────────────────┘

1. Profile Selection Flow
   ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
   │  User    │────▶│  Select  │────▶│  Load    │────▶│ Tutorial │
   │  Lands   │     │  Profile │     │ Progress │     │  Index   │
   └──────────┘     └──────────┘     └──────────┘     └──────────┘
                          │                                  │
                          ▼                                  │
                    ┌──────────┐                             │
                    │  Create  │                             │
                    │  New     │─────────────────────────────┘
                    └──────────┘

2. Learning Session Flow
   ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
   │  Select  │────▶│  Load    │────▶│  Read    │────▶│  Try     │
   │  Chapter │     │  Content │     │  Lesson  │     │  Example │
   └──────────┘     └──────────┘     └──────────┘     └──────────┘
                                                            │
                          ┌─────────────────────────────────┘
                          ▼
   ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
   │ Complete │◀────│  Grade   │◀────│  Submit  │◀────│ Exercise │
   │  Chapter │     │  Answer  │     │  Answer  │     │  Start   │
   └──────────┘     └──────────┘     └──────────┘     └──────────┘
        │                                                    │
        ▼                                                    ▼
   ┌──────────┐                                        ┌──────────┐
   │  Save    │                                        │  View    │
   │ Progress │                                        │  Hints   │
   └──────────┘                                        └──────────┘

3. Prompt Testing Flow
   ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
   │  Write   │────▶│  Send to │────▶│  Stream  │────▶│ Display  │
   │  Prompt  │     │  LLM API │     │ Response │     │  Result  │
   └──────────┘     └──────────┘     └──────────┘     └──────────┘
                          │
                          ▼
                    ┌──────────┐
                    │  Log     │
                    │Interaction│
                    └──────────┘
```

---

## 2. Component Architecture

### 2.1 Component Hierarchy

```
App
├── Providers
│   ├── ThemeProvider
│   ├── I18nProvider
│   └── StoreProvider
│
├── Layout
│   ├── Header
│   │   ├── Logo
│   │   ├── ProfileBadge
│   │   ├── LanguageSwitch
│   │   └── SettingsButton
│   │
│   ├── Sidebar (desktop)
│   │   ├── ChapterList
│   │   └── ProgressOverview
│   │
│   └── MobileNav (mobile)
│       ├── BottomTabBar
│       └── DrawerMenu
│
├── Pages
│   ├── HomePage
│   │   ├── ProfileSelector
│   │   │   ├── ProfileCard
│   │   │   └── CreateProfileButton
│   │   └── WelcomeMessage
│   │
│   ├── TutorialIndexPage
│   │   ├── OverallProgress
│   │   ├── ChapterCardList
│   │   │   └── ChapterCard
│   │   └── ContinueButton
│   │
│   ├── ChapterPage
│   │   ├── ChapterHeader
│   │   │   ├── ChapterTitle
│   │   │   ├── ProgressIndicator
│   │   │   └── NavigationButtons
│   │   │
│   │   ├── LessonContent
│   │   │   ├── MarkdownRenderer
│   │   │   ├── CodeBlock
│   │   │   └── KeyPointsBox
│   │   │
│   │   ├── PlaygroundSection
│   │   │   ├── PromptEditor
│   │   │   ├── RunButton
│   │   │   └── ResponseViewer
│   │   │
│   │   ├── ExerciseSection
│   │   │   ├── ExerciseCard
│   │   │   │   ├── ProblemStatement
│   │   │   │   ├── PromptInput
│   │   │   │   ├── ActionButtons
│   │   │   │   │   ├── HintButton
│   │   │   │   │   ├── TestButton
│   │   │   │   │   └── SubmitButton
│   │   │   │   └── GradingResult
│   │   │   └── ExerciseNavigation
│   │   │
│   │   └── ChapterNavigation
│   │       ├── PrevButton
│   │       └── NextButton
│   │
│   └── SettingsPage
│       ├── APISettings
│       │   ├── ProviderSelector
│       │   ├── APIKeyInput
│       │   └── ModelSelector
│       ├── LanguageSettings
│       └── ThemeSettings
│
└── Modals
    ├── HintModal
    ├── ProfileCreateModal
    ├── APIErrorModal
    └── ConfirmDialog
```

### 2.2 Key Component Specifications

#### ProfileCard Component
```typescript
// components/profile/ProfileCard.tsx

interface ProfileCardProps {
  profile: Profile;
  progress: number;          // 0-100
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

// States: default, hover, selected, deleting
// Animations:
//   - hover: translateY(-4px), shadow increase
//   - selected: border highlight, scale(1.02)
//   - deleting: fade out + scale down

// Accessibility:
//   - role="button"
//   - aria-selected
//   - keyboard: Enter/Space to select, Delete to delete
```

#### PromptEditor Component
```typescript
// components/tutorial/PromptEditor.tsx

interface PromptEditorProps {
  initialValue?: string;
  placeholder?: string;
  systemPrompt?: string;
  showSystemPrompt?: boolean;
  onChange: (value: string) => void;
  onRun: () => void;
  disabled?: boolean;
  maxLength?: number;
}

// Features:
//   - CodeMirror 6 based
//   - Syntax highlighting for prompts
//   - Line numbers
//   - Auto-resize
//   - Character count
//   - Mobile-optimized keyboard

// Layout:
// ┌────────────────────────────────────┐
// │ System:                            │
// │ ┌────────────────────────────────┐ │
// │ │ You are a helpful assistant... │ │
// │ └────────────────────────────────┘ │
// │                                    │
// │ User:                              │
// │ ┌────────────────────────────────┐ │
// │ │ |                              │ │
// │ │                                │ │
// │ └────────────────────────────────┘ │
// │              123/500 chars   [▶️]  │
// └────────────────────────────────────┘
```

#### GradingResult Component
```typescript
// components/tutorial/GradingResult.tsx

interface GradingResultProps {
  result: GradingResult;
  showDetails: boolean;
  onRetry: () => void;
}

interface GradingResult {
  passed: boolean;
  score: number;              // 0-100
  criteria: GradingCriteria[];
  feedback?: string;
  suggestions?: string[];
}

interface GradingCriteria {
  name: string;
  passed: boolean;
  weight: number;
  message?: string;
}

// Visual States:
//   - Success (score >= 90): Green check + confetti
//   - Partial (70-89): Yellow warning + improvements
//   - Fail (< 70): Red X + hint suggestion
```

---

## 3. API Specifications

### 3.1 LLM API Routes

#### POST /api/llm/completion
```typescript
// Request
interface CompletionRequest {
  provider: 'openai' | 'openrouter' | 'custom';
  model: string;
  messages: Message[];
  temperature?: number;       // default: 0.7
  maxTokens?: number;         // default: 1024
  stream?: boolean;           // default: true
  apiKey?: string;            // client-provided key (encrypted)
}

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Response (non-streaming)
interface CompletionResponse {
  success: boolean;
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason: 'stop' | 'length' | 'error';
}

// Response (streaming)
// Server-Sent Events (SSE)
// event: delta
// data: {"content": "chunk text"}
//
// event: done
// data: {"usage": {...}, "finishReason": "stop"}
//
// event: error
// data: {"error": "Error message", "code": "ERROR_CODE"}
```

#### Error Codes
```typescript
enum LLMErrorCode {
  INVALID_API_KEY = 'INVALID_API_KEY',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  MODEL_NOT_FOUND = 'MODEL_NOT_FOUND',
  CONTEXT_LENGTH_EXCEEDED = 'CONTEXT_LENGTH_EXCEEDED',
  PROVIDER_ERROR = 'PROVIDER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
}
```

### 3.2 Feedback API Routes

#### POST /api/feedback/analyze
```typescript
// Request
interface AnalyzeRequest {
  profileId: string;
  interactions: Interaction[];  // last N interactions
  currentChapter: string;
  currentExercise?: string;
}

// Response
interface AnalyzeResponse {
  insights: Insight[];
  suggestions: Suggestion[];
  strengths: string[];
  areasToImprove: string[];
}

interface Insight {
  type: 'pattern' | 'mistake' | 'improvement';
  title: string;
  description: string;
  relatedExercises?: string[];
}

interface Suggestion {
  type: 'tip' | 'resource' | 'practice';
  content: string;
  priority: 'high' | 'medium' | 'low';
}
```

---

## 4. Database Schema (IndexedDB)

### 4.1 Dexie.js Schema Definition

```typescript
// lib/storage/db.ts

import Dexie, { Table } from 'dexie';

export interface Profile {
  id: string;                  // UUID v4
  name: string;
  avatar: string;              // emoji or image URL
  createdAt: Date;
  lastActiveAt: Date;
  settings: ProfileSettings;
}

export interface ProfileSettings {
  apiProvider: 'openai' | 'openrouter' | 'custom';
  apiKey?: string;             // AES-256 encrypted
  preferredModel: string;
  customEndpoint?: string;
  language: 'en' | 'ko';
  theme: 'light' | 'dark' | 'system';
}

export interface ChapterProgress {
  id: string;                  // `${profileId}_${chapterId}`
  profileId: string;
  chapterId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  startedAt?: Date;
  completedAt?: Date;
  lastAccessedAt: Date;
  currentSection: number;      // for resume functionality
  exercises: ExerciseProgress[];
}

export interface ExerciseProgress {
  exerciseId: string;
  status: 'not_started' | 'attempted' | 'completed';
  attempts: number;
  bestScore: number;
  lastAttemptAt?: Date;
  userSolution?: string;
  hintsViewed: number[];       // hint indices viewed
}

export interface Interaction {
  id: string;                  // UUID v4
  profileId: string;
  sessionId: string;
  timestamp: Date;
  type: 'prompt_test' | 'exercise_submit' | 'hint_view' | 'feedback_request';
  chapterId: string;
  exerciseId?: string;
  input: string;
  output?: string;
  score?: number;
  metadata?: Record<string, unknown>;
}

class TutorialDatabase extends Dexie {
  profiles!: Table<Profile>;
  progress!: Table<ChapterProgress>;
  interactions!: Table<Interaction>;

  constructor() {
    super('PromptEngTutorial');

    this.version(1).stores({
      profiles: 'id, createdAt, lastActiveAt',
      progress: 'id, profileId, chapterId, status, lastAccessedAt',
      interactions: 'id, profileId, sessionId, timestamp, type, chapterId'
    });
  }
}

export const db = new TutorialDatabase();
```

### 4.2 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        DATABASE SCHEMA (IndexedDB)                       │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐
│      PROFILE        │
├─────────────────────┤
│ PK │ id: string     │
│    │ name: string   │
│    │ avatar: string │
│    │ createdAt: Date│
│    │ lastActiveAt   │
│    │ settings: {}   │
└─────────┬───────────┘
          │
          │ 1:N
          │
          ▼
┌─────────────────────┐          ┌─────────────────────┐
│  CHAPTER_PROGRESS   │          │    INTERACTION      │
├─────────────────────┤          ├─────────────────────┤
│ PK │ id: string     │          │ PK │ id: string     │
│ FK │ profileId      │◀─────────│ FK │ profileId      │
│    │ chapterId      │          │    │ sessionId      │
│    │ status         │          │    │ timestamp      │
│    │ startedAt      │          │    │ type           │
│    │ completedAt    │          │    │ chapterId      │
│    │ lastAccessedAt │          │    │ exerciseId?    │
│    │ currentSection │          │    │ input          │
│    │ exercises: []  │          │    │ output?        │
└─────────────────────┘          │    │ score?         │
                                 │    │ metadata?      │
┌─────────────────────┐          └─────────────────────┘
│  EXERCISE_PROGRESS  │
│    (embedded in     │
│  ChapterProgress)   │
├─────────────────────┤
│    │ exerciseId     │
│    │ status         │
│    │ attempts       │
│    │ bestScore      │
│    │ lastAttemptAt  │
│    │ userSolution   │
│    │ hintsViewed[]  │
└─────────────────────┘


Indexes:
  profiles:    id (primary), createdAt, lastActiveAt
  progress:    id (primary), [profileId, chapterId], status, lastAccessedAt
  interactions: id (primary), [profileId, timestamp], type, chapterId
```

---

## 5. State Management

### 5.1 Zustand Store Architecture

```typescript
// stores/index.ts

// Store Organization
// ├── profileStore     - Current profile & settings
// ├── progressStore    - Learning progress data
// ├── tutorialStore    - Current tutorial state
// └── uiStore          - UI state (modals, toasts, etc.)
```

#### Profile Store
```typescript
// stores/profileStore.ts

interface ProfileState {
  // State
  currentProfile: Profile | null;
  profiles: Profile[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadProfiles: () => Promise<void>;
  selectProfile: (id: string) => Promise<void>;
  createProfile: (data: CreateProfileData) => Promise<Profile>;
  updateProfile: (id: string, data: Partial<Profile>) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  updateSettings: (settings: Partial<ProfileSettings>) => Promise<void>;
}

// Usage
const useProfileStore = create<ProfileState>((set, get) => ({
  currentProfile: null,
  profiles: [],
  isLoading: false,
  error: null,

  loadProfiles: async () => {
    set({ isLoading: true });
    const profiles = await db.profiles.orderBy('lastActiveAt').reverse().toArray();
    set({ profiles, isLoading: false });
  },

  selectProfile: async (id) => {
    const profile = await db.profiles.get(id);
    if (profile) {
      await db.profiles.update(id, { lastActiveAt: new Date() });
      set({ currentProfile: profile });
    }
  },
  // ...
}));
```

#### Progress Store
```typescript
// stores/progressStore.ts

interface ProgressState {
  // State
  chapterProgress: Map<string, ChapterProgress>;
  overallProgress: number;        // 0-100
  currentChapter: string | null;
  currentExercise: string | null;

  // Computed
  getChapterStatus: (chapterId: string) => ChapterStatus;
  getExerciseStatus: (chapterId: string, exerciseId: string) => ExerciseStatus;
  getNextChapter: () => string | null;
  getResumePoint: () => ResumePoint | null;

  // Actions
  loadProgress: (profileId: string) => Promise<void>;
  startChapter: (chapterId: string) => Promise<void>;
  completeChapter: (chapterId: string) => Promise<void>;
  updateExercise: (chapterId: string, exerciseId: string, data: ExerciseUpdate) => Promise<void>;
  recordInteraction: (interaction: Omit<Interaction, 'id' | 'timestamp'>) => Promise<void>;
}
```

#### Tutorial Store
```typescript
// stores/tutorialStore.ts

interface TutorialState {
  // State
  currentContent: ChapterContent | null;
  isLoadingContent: boolean;
  llmResponse: string | null;
  isLLMLoading: boolean;
  llmError: string | null;

  // Exercise State
  exerciseInput: string;
  gradingResult: GradingResult | null;
  hintsRevealed: number[];

  // Actions
  loadChapter: (chapterId: string, locale: string) => Promise<void>;
  runPrompt: (messages: Message[]) => Promise<void>;
  submitExercise: (exerciseId: string, answer: string) => Promise<GradingResult>;
  revealHint: (hintIndex: number) => void;
  resetExercise: () => void;
}
```

### 5.2 State Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           STATE MANAGEMENT FLOW                          │
└─────────────────────────────────────────────────────────────────────────┘

User Action                    Store Update                    UI Update
───────────────────────────────────────────────────────────────────────────

[Select Profile]
      │
      ├──────────────────▶ profileStore.selectProfile()
      │                           │
      │                           ├──▶ Load from IndexedDB
      │                           │
      │                           ├──▶ set({ currentProfile })
      │                           │
      │                           └──▶ progressStore.loadProgress()
      │                                        │
      │                                        └──▶ set({ chapterProgress })
      │
      └──────────────────────────────────────────────────────────▶ Re-render
                                                                   UI

[Run Prompt]
      │
      ├──────────────────▶ tutorialStore.runPrompt()
      │                           │
      │                           ├──▶ set({ isLLMLoading: true })
      │                           │
      │                           ├──▶ POST /api/llm/completion
      │                           │         │
      │                           │         └──▶ Stream response
      │                           │
      │                           ├──▶ set({ llmResponse: chunk })  ─────▶ Update UI
      │                           │         (on each chunk)               progressively
      │                           │
      │                           ├──▶ progressStore.recordInteraction()
      │                           │
      │                           └──▶ set({ isLLMLoading: false })
      │
      └──────────────────────────────────────────────────────────▶ Final render

[Submit Exercise]
      │
      ├──────────────────▶ tutorialStore.submitExercise()
      │                           │
      │                           ├──▶ Grade locally (regex validators)
      │                           │
      │                           ├──▶ set({ gradingResult })
      │                           │
      │                           └──▶ progressStore.updateExercise()
      │                                        │
      │                                        ├──▶ Update IndexedDB
      │                                        │
      │                                        └──▶ Recalculate progress
      │
      └──────────────────────────────────────────────────────────▶ Show result
                                                                   + animation
```

---

## 6. Content Management System

### 6.1 Content Structure

```
content/
├── chapters/
│   ├── en/
│   │   ├── 00-how-to.mdx
│   │   ├── 01-basic-prompt.mdx
│   │   ├── 02-clear-direct.mdx
│   │   ├── 03-role-prompting.mdx
│   │   ├── 04-data-instructions.mdx
│   │   ├── 05-formatting-output.mdx
│   │   ├── 06-thinking-step.mdx
│   │   ├── 07-few-shot.mdx
│   │   ├── 08-hallucinations.mdx
│   │   ├── 09-complex-prompts.mdx
│   │   ├── 10-1-chaining.mdx
│   │   ├── 10-2-tool-use.mdx
│   │   └── 10-3-search-retrieval.mdx
│   │
│   └── ko/
│       └── (same structure, Korean translations)
│
├── exercises/
│   ├── en/
│   │   └── exercises.json
│   └── ko/
│       └── exercises.json
│
└── meta/
    ├── chapters.json          # Chapter metadata
    └── models.json            # Available models config
```

### 6.2 MDX Content Format

```mdx
// content/chapters/ko/02-clear-direct.mdx

---
id: "02-clear-direct"
title: "명확하고 직접적으로"
description: "Claude에게 명확한 지시사항을 작성하는 방법을 배웁니다"
order: 2
estimatedTime: 15
prerequisites: ["01-basic-prompt"]
objectives:
  - "모호한 표현을 피하는 방법 이해"
  - "구체적인 출력 형식 지정하기"
  - "단계별 지시사항 작성법"
---

# 명확하고 직접적으로

Claude에게 원하는 결과를 얻으려면 **명확하게** 지시해야 합니다.

<KeyPoint>
마치 새로운 직원에게 업무를 설명하듯이, 가정 없이 구체적으로 설명하세요.
</KeyPoint>

## 왜 명확함이 중요한가?

Claude는 여러분의 의도를 **추측**할 수 있지만, 명확한 지시가 있을 때 가장 좋은 결과를 냅니다.

<Example title="모호한 지시 vs 명확한 지시">
  <Bad>
    글 써줘
  </Bad>
  <Good>
    인공지능의 미래에 대해 500단어 분량의 블로그 포스트를 작성해줘.
    긍정적인 전망과 우려사항을 균형 있게 다루고, 각 섹션에 소제목을 달아줘.
  </Good>
</Example>

## 핵심 원칙

1. **구체적인 단어 사용**: "좋은" 대신 "명확하고 간결한"
2. **출력 형식 명시**: "목록으로", "JSON 형식으로"
3. **길이 지정**: "3문장으로", "200단어 이내로"

<Playground
  systemPrompt="You are a helpful assistant."
  userPrompt="인공지능에 대해 알려줘"
  editable={true}
/>

<Exercise id="02-ex-01" />
<Exercise id="02-ex-02" />
```

### 6.3 Exercise JSON Format

```json
// content/exercises/ko/exercises.json

{
  "02-ex-01": {
    "id": "02-ex-01",
    "chapterId": "02-clear-direct",
    "order": 1,
    "type": "prompt_improvement",
    "difficulty": "beginner",
    "title": "모호한 프롬프트 개선하기",
    "description": "다음 프롬프트를 더 명확하게 수정하세요.",
    "originalPrompt": "글 써줘",
    "expectedCriteria": [
      {
        "id": "topic",
        "name": "구체적인 주제 포함",
        "weight": 30,
        "validator": {
          "type": "regex",
          "pattern": "(에 대해|에 관한|주제|토픽|관련)",
          "flags": "i"
        },
        "feedback": {
          "pass": "주제가 명확하게 지정되었습니다.",
          "fail": "글의 주제를 구체적으로 명시해주세요."
        }
      },
      {
        "id": "format",
        "name": "글의 형식 명시",
        "weight": 30,
        "validator": {
          "type": "regex",
          "pattern": "(블로그|에세이|보고서|기사|리뷰|요약|목록)",
          "flags": "i"
        },
        "feedback": {
          "pass": "글의 형식이 지정되었습니다.",
          "fail": "어떤 형식의 글인지 명시해주세요 (예: 블로그, 에세이)."
        }
      },
      {
        "id": "length",
        "name": "길이 지정",
        "weight": 20,
        "validator": {
          "type": "regex",
          "pattern": "(\\d+\\s*(자|단어|문장|글자|줄|paragraph|word))",
          "flags": "i"
        },
        "feedback": {
          "pass": "글의 길이가 지정되었습니다.",
          "fail": "글의 길이를 지정하면 더 좋습니다 (예: 500자, 3문장)."
        }
      },
      {
        "id": "structure",
        "name": "구조 요청",
        "weight": 20,
        "validator": {
          "type": "regex",
          "pattern": "(소제목|섹션|목차|구성|나눠서|단락)",
          "flags": "i"
        },
        "feedback": {
          "pass": "글의 구조가 요청되었습니다.",
          "fail": "글의 구조를 요청하면 더 체계적인 결과를 얻을 수 있습니다."
        }
      }
    ],
    "hints": [
      "어떤 주제에 대한 글인지 명시해보세요.",
      "블로그, 에세이, 보고서 등 형식을 지정해보세요.",
      "원하는 길이를 단어나 문장 수로 표현해보세요.",
      "소제목이나 섹션 구분을 요청해보세요."
    ],
    "sampleSolution": "인공지능의 미래에 대해 500단어 분량의 블로그 포스트를 작성해줘. 긍정적인 전망과 우려사항을 균형 있게 다루고, 각 섹션에 소제목을 달아줘."
  }
}
```

---

## 7. Grading System

### 7.1 Grading Engine Architecture

```typescript
// lib/grading/index.ts

interface GradingEngine {
  grade(exerciseId: string, userAnswer: string): GradingResult;
}

interface GradingResult {
  passed: boolean;
  score: number;                    // 0-100
  criteria: CriteriaResult[];
  feedback: string;
  suggestions: string[];
}

interface CriteriaResult {
  id: string;
  name: string;
  passed: boolean;
  weight: number;
  feedback: string;
}

// Validator Types
type Validator =
  | RegexValidator
  | KeywordValidator
  | LengthValidator
  | LLMValidator;

interface RegexValidator {
  type: 'regex';
  pattern: string;
  flags?: string;
  negate?: boolean;              // true = should NOT match
}

interface KeywordValidator {
  type: 'keyword';
  keywords: string[];
  minMatch: number;              // minimum keywords to match
  caseSensitive?: boolean;
}

interface LengthValidator {
  type: 'length';
  min?: number;
  max?: number;
  unit: 'chars' | 'words' | 'lines';
}

interface LLMValidator {
  type: 'llm';
  prompt: string;                // LLM grading prompt
  threshold: number;             // 0-1 confidence threshold
}
```

### 7.2 Grading Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            GRADING FLOW                                  │
└─────────────────────────────────────────────────────────────────────────┘

User submits answer
       │
       ▼
┌──────────────────┐
│  Load Exercise   │
│  Configuration   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  For each        │
│  Criterion       │◀─────────────────────────────────────┐
└────────┬─────────┘                                      │
         │                                                │
         ▼                                                │
┌──────────────────┐     ┌──────────────────┐            │
│  Check Validator │────▶│  regex           │            │
│  Type            │     │  keyword         │            │
└────────┬─────────┘     │  length          │            │
         │               │  llm (async)     │            │
         │               └────────┬─────────┘            │
         │                        │                      │
         │◀───────────────────────┘                      │
         │                                               │
         ▼                                               │
┌──────────────────┐                                     │
│  Record Result   │                                     │
│  for Criterion   │─────────────────────────────────────┘
└────────┬─────────┘     (loop until all criteria checked)
         │
         ▼
┌──────────────────┐
│  Calculate       │
│  Weighted Score  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Generate        │
│  Feedback        │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Return          │
│  GradingResult   │
└──────────────────┘
```

---

## 8. LLM Integration Layer

### 8.1 Provider Abstraction

```typescript
// lib/llm/index.ts

interface LLMProvider {
  name: string;
  chat(request: ChatRequest): Promise<ChatResponse>;
  stream(request: ChatRequest): AsyncGenerator<StreamChunk>;
  listModels(): Promise<Model[]>;
}

interface ChatRequest {
  model: string;
  messages: Message[];
  temperature?: number;
  maxTokens?: number;
  stop?: string[];
}

interface ChatResponse {
  content: string;
  usage: TokenUsage;
  model: string;
  finishReason: string;
}

interface StreamChunk {
  type: 'content' | 'usage' | 'done' | 'error';
  content?: string;
  usage?: TokenUsage;
  error?: string;
}

// Provider Implementations
class OpenAIProvider implements LLMProvider { /* ... */ }
class OpenRouterProvider implements LLMProvider { /* ... */ }
class CustomProvider implements LLMProvider { /* ... */ }

// Factory
function createLLMProvider(
  provider: 'openai' | 'openrouter' | 'custom',
  config: ProviderConfig
): LLMProvider {
  switch (provider) {
    case 'openai':
      return new OpenAIProvider(config);
    case 'openrouter':
      return new OpenRouterProvider(config);
    case 'custom':
      return new CustomProvider(config);
  }
}
```

### 8.2 Available Models Configuration

```json
// content/meta/models.json

{
  "openai": {
    "name": "OpenAI",
    "models": [
      {
        "id": "gpt-4.1-mini",
        "name": "GPT-4.1 Mini",
        "description": "Fast, cost-effective model for most tasks",
        "contextLength": 128000,
        "inputPrice": 0.15,
        "outputPrice": 0.60,
        "default": true
      },
      {
        "id": "gpt-4o",
        "name": "GPT-4o",
        "description": "Most capable model",
        "contextLength": 128000,
        "inputPrice": 2.50,
        "outputPrice": 10.00
      }
    ]
  },
  "openrouter": {
    "name": "OpenRouter",
    "models": [
      {
        "id": "anthropic/claude-3.5-sonnet",
        "name": "Claude 3.5 Sonnet",
        "description": "Anthropic's balanced model",
        "contextLength": 200000,
        "inputPrice": 3.00,
        "outputPrice": 15.00
      },
      {
        "id": "meta-llama/llama-3.1-70b-instruct",
        "name": "Llama 3.1 70B",
        "description": "Open-source large model",
        "contextLength": 131072,
        "inputPrice": 0.35,
        "outputPrice": 0.40
      },
      {
        "id": "google/gemini-pro-1.5",
        "name": "Gemini Pro 1.5",
        "description": "Google's latest model",
        "contextLength": 1000000,
        "inputPrice": 1.25,
        "outputPrice": 5.00
      }
    ]
  }
}
```

---

## 9. Internationalization (i18n)

### 9.1 i18n Architecture

```typescript
// i18n/config.ts

export const locales = ['en', 'ko'] as const;
export type Locale = typeof locales[number];
export const defaultLocale: Locale = 'ko';

// next-intl configuration
export const i18nConfig = {
  locales,
  defaultLocale,
  localePrefix: 'as-needed'  // only prefix non-default locale
};
```

### 9.2 Translation Files Structure

```json
// i18n/ko.json

{
  "common": {
    "loading": "로딩 중...",
    "error": "오류가 발생했습니다",
    "retry": "다시 시도",
    "cancel": "취소",
    "save": "저장",
    "delete": "삭제",
    "confirm": "확인",
    "back": "뒤로",
    "next": "다음",
    "previous": "이전"
  },
  "home": {
    "title": "프롬프트 엔지니어링 마스터",
    "subtitle": "AI와 효과적으로 대화하는 방법을 배워보세요",
    "selectProfile": "프로필을 선택하세요",
    "createProfile": "새 프로필 만들기",
    "noProfiles": "아직 프로필이 없습니다"
  },
  "profile": {
    "create": {
      "title": "새 프로필 만들기",
      "nameLabel": "이름",
      "namePlaceholder": "표시할 이름을 입력하세요",
      "avatarLabel": "아바타",
      "submit": "만들기"
    },
    "progress": "{percent}% 완료",
    "lastActive": "마지막 활동: {date}"
  },
  "tutorial": {
    "chapters": "챕터 목록",
    "overallProgress": "전체 진행률",
    "continue": "이어하기",
    "start": "시작하기",
    "locked": "이전 챕터를 완료하세요",
    "completed": "완료됨"
  },
  "chapter": {
    "lesson": "레슨",
    "playground": "예제 플레이그라운드",
    "exercises": "연습문제",
    "exercise": "연습문제 {current}/{total}",
    "progress": "진행률 {current}/{total}"
  },
  "exercise": {
    "problem": "문제",
    "hint": "힌트",
    "hints": "힌트 {current}/{total}",
    "test": "테스트",
    "submit": "제출",
    "result": "채점 결과",
    "score": "점수: {score}/100",
    "passed": "통과!",
    "tryAgain": "다시 시도해보세요",
    "viewSolution": "정답 보기"
  },
  "playground": {
    "systemPrompt": "시스템 프롬프트",
    "userPrompt": "사용자 프롬프트",
    "run": "실행",
    "response": "응답",
    "waiting": "실행을 눌러주세요",
    "generating": "응답 생성 중..."
  },
  "settings": {
    "title": "설정",
    "api": {
      "title": "API 설정",
      "provider": "제공자",
      "apiKey": "API 키",
      "apiKeyPlaceholder": "sk-...",
      "model": "기본 모델",
      "testConnection": "연결 테스트"
    },
    "language": {
      "title": "언어",
      "select": "언어 선택"
    },
    "theme": {
      "title": "테마",
      "light": "라이트",
      "dark": "다크",
      "system": "시스템 설정"
    }
  },
  "errors": {
    "apiKey": {
      "invalid": "유효하지 않은 API 키입니다",
      "missing": "API 키를 설정해주세요"
    },
    "network": "네트워크 오류가 발생했습니다",
    "rateLimit": "요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요."
  }
}
```

---

## 10. Security Considerations

### 10.1 API Key Security

```typescript
// lib/utils/encryption.ts

// Client-side encryption using Web Crypto API
// Keys never leave the client unencrypted

const ENCRYPTION_KEY_NAME = 'pe-tutorial-key';

async function getOrCreateEncryptionKey(): Promise<CryptoKey> {
  // Use a derived key from a user-specific salt
  // stored in localStorage
  const salt = getOrCreateSalt();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(ENCRYPTION_KEY_NAME),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptApiKey(apiKey: string): Promise<string> {
  const key = await getOrCreateEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(apiKey);

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );

  // Return IV + ciphertext as base64
  const result = new Uint8Array(iv.length + ciphertext.byteLength);
  result.set(iv);
  result.set(new Uint8Array(ciphertext), iv.length);

  return btoa(String.fromCharCode(...result));
}

export async function decryptApiKey(encrypted: string): Promise<string> {
  const key = await getOrCreateEncryptionKey();
  const data = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));

  const iv = data.slice(0, 12);
  const ciphertext = data.slice(12);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
}
```

### 10.2 Security Headers

```typescript
// next.config.js

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: blob:;
      font-src 'self';
      connect-src 'self' https://api.openai.com https://openrouter.ai;
    `.replace(/\s+/g, ' ').trim()
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  }
];
```

---

## 11. Performance Optimization

### 11.1 Loading Strategy

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        LOADING OPTIMIZATION                              │
└─────────────────────────────────────────────────────────────────────────┘

Page Load Priorities:

1. Critical Path (blocking)
   ├── HTML shell
   ├── Critical CSS (above-fold)
   └── i18n messages (current locale)

2. High Priority (async)
   ├── React runtime
   ├── Current page components
   └── Profile data (IndexedDB)

3. Medium Priority (defer)
   ├── CodeMirror editor
   ├── Chapter content (current)
   └── Progress data

4. Low Priority (lazy)
   ├── Other chapters (prefetch on hover)
   ├── Hint content (load on demand)
   └── Analytics

Bundle Splitting Strategy:
  - main: Core React + routing (~50KB)
  - ui: shadcn/ui components (~30KB)
  - editor: CodeMirror (~100KB, lazy)
  - content: MDX runtime (~20KB)
```

### 11.2 Caching Strategy

```typescript
// Service Worker caching (for PWA)

const CACHE_STRATEGIES = {
  // Static assets: Cache first
  static: {
    pattern: /\.(js|css|woff2|png|svg|ico)$/,
    strategy: 'cache-first',
    maxAge: 30 * 24 * 60 * 60  // 30 days
  },

  // MDX content: Stale-while-revalidate
  content: {
    pattern: /\/content\//,
    strategy: 'stale-while-revalidate',
    maxAge: 24 * 60 * 60  // 1 day
  },

  // API calls: Network first
  api: {
    pattern: /\/api\//,
    strategy: 'network-first',
    timeout: 3000  // fallback to cache after 3s
  },

  // i18n messages: Cache first with background update
  i18n: {
    pattern: /\/i18n\//,
    strategy: 'cache-first',
    backgroundSync: true
  }
};
```

---

## 12. Testing Strategy

### 12.1 Test Coverage Requirements

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          TEST PYRAMID                                    │
└─────────────────────────────────────────────────────────────────────────┘

                          ▲
                         /│\
                        / │ \
                       /  │  \     E2E Tests (10%)
                      /   │   \    - Critical user flows
                     /────┼────\   - Profile creation/selection
                    /     │     \  - Chapter completion flow
                   /──────┼──────\
                  /       │       \  Integration Tests (30%)
                 /        │        \ - API routes
                /─────────┼─────────\- Store + IndexedDB
               /          │          \- Component + hooks
              /───────────┼───────────\
             /            │            \  Unit Tests (60%)
            /             │             \ - Grading engine
           /──────────────┼──────────────\- Validators
          /               │               \- Utils
         /────────────────┴────────────────\
```

### 12.2 Key Test Scenarios

```typescript
// Grading Engine Tests
describe('GradingEngine', () => {
  describe('RegexValidator', () => {
    it('should pass when pattern matches', () => {
      const validator: RegexValidator = {
        type: 'regex',
        pattern: '(블로그|에세이)',
        flags: 'i'
      };
      expect(validate(validator, '블로그 형식으로')).toBe(true);
    });

    it('should fail when pattern does not match', () => {
      // ...
    });
  });

  describe('score calculation', () => {
    it('should calculate weighted score correctly', () => {
      const criteria = [
        { weight: 30, passed: true },
        { weight: 30, passed: true },
        { weight: 20, passed: false },
        { weight: 20, passed: false }
      ];
      expect(calculateScore(criteria)).toBe(60);
    });
  });
});

// Progress Store Tests
describe('ProgressStore', () => {
  it('should calculate overall progress correctly', () => {
    // ...
  });

  it('should return correct resume point', () => {
    // ...
  });
});

// E2E Tests
describe('Tutorial Flow', () => {
  it('should complete a chapter successfully', async () => {
    await page.goto('/');
    await page.click('[data-testid="create-profile"]');
    await page.fill('[name="name"]', 'Test User');
    await page.click('[data-testid="submit"]');

    await page.click('[data-testid="chapter-01"]');
    // ... continue flow
  });
});
```

---

## 13. Deployment Architecture

### 13.1 Deployment Options

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      DEPLOYMENT OPTIONS                                  │
└─────────────────────────────────────────────────────────────────────────┘

Option A: Vercel (Recommended)
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│   GitHub ──push──▶ Vercel Build ──deploy──▶ Edge Network                │
│                         │                         │                      │
│                         │                    ┌────┴────┐                 │
│                         │                    │ CDN     │                 │
│                         │                    │ (Static)│                 │
│                         │                    └────┬────┘                 │
│                         │                         │                      │
│                         └────────────────────────▶│◀── API Routes       │
│                                              (Serverless)                │
└─────────────────────────────────────────────────────────────────────────┘

Option B: Self-hosted (Docker)
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐              │
│   │   Nginx     │────▶│   Next.js   │────▶│   Node.js   │              │
│   │   (Proxy)   │     │   (Static)  │     │   (API)     │              │
│   └─────────────┘     └─────────────┘     └─────────────┘              │
│         │                                                                │
│         └──────────────────▶ SSL (Let's Encrypt)                        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 13.2 Environment Variables

```bash
# .env.local (development)
# .env.production (production)

# App Configuration
NEXT_PUBLIC_APP_URL=https://prompt-tutorial.example.com
NEXT_PUBLIC_DEFAULT_LOCALE=ko

# API Configuration (server-side only, optional defaults)
OPENAI_API_KEY=sk-...          # Optional: default API key for demo
OPENROUTER_API_KEY=sk-or-...   # Optional: default API key for demo

# Feature Flags
NEXT_PUBLIC_ENABLE_FEEDBACK=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false

# Security
ENCRYPTION_SECRET=...          # For server-side encryption if needed
```

---

## 14. Appendix

### A. File Size Estimates

| Category | Estimated Size |
|----------|---------------|
| Next.js Core | ~80KB (gzipped) |
| React + ReactDOM | ~40KB (gzipped) |
| shadcn/ui components | ~30KB (gzipped) |
| CodeMirror 6 | ~100KB (lazy loaded) |
| Zustand | ~2KB (gzipped) |
| Dexie.js | ~15KB (gzipped) |
| MDX Runtime | ~20KB (gzipped) |
| **Total Initial Load** | **~190KB** |
| Content (per chapter) | ~10-30KB |

### B. Browser Support

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 88+ |
| Firefox | 78+ |
| Safari | 14+ |
| Edge | 88+ |
| Mobile Safari | 14+ |
| Chrome Mobile | 88+ |

### C. Accessibility Checklist

- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] Color contrast ratio ≥ 4.5:1
- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] Error messages announced to screen readers
- [ ] Skip navigation link present
- [ ] Heading hierarchy logical
- [ ] Touch targets ≥ 44x44px

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-14 | Claude | Initial technical design |
