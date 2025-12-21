import { useState, useEffect } from 'react';
import type { OrderSession } from '@/types';
import { getSession } from '@/services/storage';

export function useSession(sessionId: string | undefined) {
  const [session, setSession] = useState<OrderSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      setError('세션 ID가 없습니다.');
      return;
    }

    try {
      const sessionData = getSession(sessionId);
      if (!sessionData) {
        setError('세션을 찾을 수 없습니다.');
      } else {
        setSession(sessionData);
      }
    } catch (err) {
      setError('세션을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  return { session, loading, error };
}
