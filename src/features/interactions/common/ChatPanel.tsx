'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, MessageCircle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 채팅 메시지 타입
 */
export interface ChatMessageType {
  id: string;
  sessionId: string;
  participantId?: string;
  authorName: string;
  body: string;
  slidePosition?: number;
  createdAt: string;
}

export interface ChatPanelProps {
  messages: ChatMessageType[];
  isHost: boolean;
  participantId?: string;
  participantName?: string;
  disabled?: boolean;
  onSendMessage?: (body: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  className?: string;
}

/**
 * 채팅 패널 컴포넌트
 * - 실시간 채팅 메시지 표시
 * - 메시지 전송
 * - 호스트 모더레이션 (삭제)
 */
export function ChatPanel({
  messages,
  isHost,
  participantId,
  participantName = '익명',
  disabled = false,
  onSendMessage,
  onDeleteMessage,
  className = '',
}: ChatPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // 새 메시지가 오면 스크롤
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, autoScroll]);

  // 스크롤 위치에 따라 자동 스크롤 토글
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const isAtBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 50;
    setAutoScroll(isAtBottom);
  }, []);

  // 메시지 전송
  const handleSend = useCallback(() => {
    if (!inputValue.trim() || disabled) return;
    onSendMessage?.(inputValue.trim());
    setInputValue('');
    setAutoScroll(true);
  }, [inputValue, disabled, onSendMessage]);

  // 시간 포맷
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium text-sm">채팅</span>
          <Badge variant="secondary" className="text-xs">
            {messages.length}
          </Badge>
        </div>
      </div>

      {/* Message List */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto py-3 space-y-2"
      >
        <AnimatePresence mode="popLayout">
          {messages.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              아직 메시지가 없습니다
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isHost={isHost}
                isOwnMessage={message.participantId === participantId}
                onDelete={() => onDeleteMessage?.(message.id)}
                formatTime={formatTime}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* New messages indicator */}
      {!autoScroll && messages.length > 0 && (
        <button
          onClick={() => {
            setAutoScroll(true);
            if (scrollRef.current) {
              scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
          }}
          className="text-xs text-blue-600 hover:text-blue-700 py-1 text-center border-t bg-blue-50"
        >
          새 메시지 보기
        </button>
      )}

      {/* Input */}
      <div className="pt-3 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="메시지를 입력하세요..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={disabled}
            className="text-sm"
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || disabled}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * 개별 채팅 메시지
 */
interface ChatMessageProps {
  message: ChatMessageType;
  isHost: boolean;
  isOwnMessage: boolean;
  onDelete: () => void;
  formatTime: (dateStr: string) => string;
}

function ChatMessage({
  message,
  isHost,
  isOwnMessage,
  onDelete,
  formatTime,
}: ChatMessageProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className={`
        group flex gap-2 text-sm
        ${isOwnMessage ? 'flex-row-reverse' : ''}
      `}
    >
      <div
        className={`
          max-w-[80%] rounded-lg px-3 py-2
          ${isOwnMessage
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-900'
          }
        `}
      >
        {!isOwnMessage && (
          <div className={`text-xs font-medium mb-1 ${isOwnMessage ? 'text-blue-100' : 'text-blue-600'}`}>
            {message.authorName}
          </div>
        )}
        <div className="break-words">{message.body}</div>
        <div className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-400'}`}>
          {formatTime(message.createdAt)}
        </div>
      </div>

      {/* Host delete button */}
      {isHost && !isOwnMessage && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-red-500 hover:text-red-600 self-center"
          title="삭제"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      )}
    </motion.div>
  );
}

export default ChatPanel;
