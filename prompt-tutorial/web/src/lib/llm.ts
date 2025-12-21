import OpenAI from 'openai';

const DEFAULT_MODEL = 'gpt-4.1-mini';
const API_KEY_STORAGE_KEY = 'openai_api_key';
const DEFAULT_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

// localStorage에서 API 키 가져오기 (없으면 환경변수 사용)
function getApiKey(): string {
  if (typeof window !== 'undefined') {
    const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    return storedKey || DEFAULT_API_KEY;
  }
  return DEFAULT_API_KEY;
}

let openaiClient: OpenAI | null = null;
let cachedApiKey: string = '';

function getClient(): OpenAI {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('API 키가 설정되지 않았습니다. 상단 메뉴에서 API 키를 입력해주세요.');
  }
  // API 키가 변경되면 클라이언트 재생성
  if (!openaiClient || cachedApiKey !== apiKey) {
    cachedApiKey = apiKey;
    openaiClient = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
  }
  return openaiClient;
}

export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  inputTokenLimit?: number;
  outputTokenLimit?: number;
}

export function setApiKey(apiKey: string): void {
  if (typeof window !== 'undefined') {
    if (apiKey) {
      localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
    }
    openaiClient = null;
    cachedApiKey = '';
  }
}

export function clearApiKey(): void {
  setApiKey('');
}

export function getSelectedModel(): string {
  return DEFAULT_MODEL;
}

export function setSelectedModel(_modelId: string): void {
  // 고정 모델 사용
}

export async function fetchAvailableModels(): Promise<ModelInfo[]> {
  return [{
    id: DEFAULT_MODEL,
    name: 'GPT-4.1 Mini',
    description: 'OpenAI GPT-4.1 Mini model',
  }];
}

export function getCachedModels(): ModelInfo[] {
  return [{
    id: DEFAULT_MODEL,
    name: 'GPT-4.1 Mini',
    description: 'OpenAI GPT-4.1 Mini model',
  }];
}

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface CompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  onChunk?: (chunk: string) => void;
}

function isRateLimitError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('rate limit') ||
      message.includes('rate_limit') ||
      message.includes('quota') ||
      message.includes('429') ||
      message.includes('too many requests')
    );
  }
  return false;
}

function getErrorMessage(error: unknown): string {
  if (isRateLimitError(error)) {
    return '⏳ API 요청 한도에 도달했습니다.\n\n잠시 후 다시 시도해주세요.';
  }

  if (error instanceof Error) {
    if (error.message.includes('API key') || error.message.includes('api_key') || error.message.includes('401') || error.message.includes('Incorrect API key')) {
      return '🔑 API 키가 유효하지 않습니다.\n\n올바른 OpenAI API 키를 입력해주세요.';
    }
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return '🌐 네트워크 연결에 문제가 있습니다.\n\n인터넷 연결을 확인하고 다시 시도해주세요.';
    }
    return error.message;
  }

  return '오류가 발생했습니다.';
}

export async function streamCompletion(
  messages: Message[],
  options: CompletionOptions = {}
): Promise<string> {
  const client = getClient();
  const { model = DEFAULT_MODEL, temperature = 0.7, maxTokens = 8192, onChunk } = options;

  try {
    const stream = await client.chat.completions.create({
      model,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      temperature,
      max_tokens: maxTokens,
      stream: true,
    });

    let fullContent = '';

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || '';
      if (text) {
        fullContent += text;
        onChunk?.(text);
      }
    }

    return fullContent;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getCompletion(
  messages: Message[],
  options: Omit<CompletionOptions, 'onChunk'> = {}
): Promise<string> {
  const client = getClient();
  const { model = DEFAULT_MODEL, temperature = 0.7, maxTokens = 8192 } = options;

  try {
    const response = await client.chat.completions.create({
      model,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      temperature,
      max_tokens: maxTokens,
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export function isApiKeyConfigured(): boolean {
  return !!getApiKey();
}

export function getStoredApiKey(): string {
  return getApiKey();
}

export function getModelName(): string {
  return 'GPT-4.1 Mini';
}

export async function validateApiKey(apiKey: string): Promise<boolean> {
  if (!apiKey || !apiKey.startsWith('sk-')) {
    return false;
  }

  try {
    const testClient = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });

    // 간단한 API 호출로 검증
    await testClient.models.list();
    return true;
  } catch {
    return false;
  }
}
