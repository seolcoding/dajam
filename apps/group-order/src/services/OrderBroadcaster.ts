import type { BroadcastMessage } from '@/types';

export class OrderBroadcaster {
  private channel: BroadcastChannel | null = null;
  private sessionId: string;
  private listeners: Map<string, Function[]> = new Map();
  private storageHandler: ((e: StorageEvent) => void) | null = null;

  constructor(sessionId: string) {
    this.sessionId = sessionId;

    // BroadcastChannel 지원 확인
    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel(`session:${sessionId}`);
      this.channel.onmessage = this.handleMessage.bind(this);
    } else {
      // Fallback: localStorage 이벤트 사용
      this.storageHandler = this.handleStorageEvent.bind(this);
      window.addEventListener('storage', this.storageHandler);
    }
  }

  private handleMessage(event: MessageEvent<BroadcastMessage>) {
    const { type } = event.data;
    const callbacks = this.listeners.get(type) || [];
    callbacks.forEach(cb => cb(event.data));
  }

  private handleStorageEvent(event: StorageEvent) {
    if (event.key?.startsWith(`orders:${this.sessionId}`) ||
        event.key?.startsWith(`session:${this.sessionId}`)) {
      const callbacks = this.listeners.get('STORAGE_CHANGED') || [];
      callbacks.forEach(cb => cb({ type: 'STORAGE_CHANGED', key: event.key }));
    }
  }

  on(type: string, callback: Function) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(callback);
  }

  off(type: string, callback: Function) {
    const callbacks = this.listeners.get(type) || [];
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  broadcast(message: BroadcastMessage) {
    if (this.channel) {
      this.channel.postMessage(message);
    } else {
      // Fallback: localStorage 직접 업데이트
      // 다른 탭의 storage 이벤트가 트리거됨
      const key = `broadcast:${this.sessionId}:${Date.now()}`;
      localStorage.setItem(key, JSON.stringify(message));
      // 임시 키는 즉시 삭제
      setTimeout(() => localStorage.removeItem(key), 100);
    }
  }

  close() {
    if (this.channel) {
      this.channel.close();
    }
    if (this.storageHandler) {
      window.removeEventListener('storage', this.storageHandler);
    }
    this.listeners.clear();
  }
}
