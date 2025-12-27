'use client';

import { useEffect, useCallback, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * URL 상태 공유 유틸리티 훅
 *
 * 상태를 URL 쿼리스트링으로 인코딩하여 공유 가능하게 만듦
 */

interface UseUrlStateOptions<T> {
  /** 상태 키 이름 (URL 파라미터명) */
  key?: string;
  /** 기본값 */
  defaultValue?: T;
  /** 브라우저 히스토리 업데이트 방식 */
  historyMode?: 'push' | 'replace';
  /** 상태 직렬화 함수 */
  serialize?: (value: T) => string;
  /** 상태 역직렬화 함수 */
  deserialize?: (value: string) => T;
}

/**
 * URL 상태를 압축된 base64로 인코딩
 */
export function encodeState<T>(state: T): string {
  try {
    const json = JSON.stringify(state);
    // base64 인코딩 (URL-safe)
    const encoded = btoa(encodeURIComponent(json))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    return encoded;
  } catch {
    return '';
  }
}

/**
 * 압축된 base64에서 상태 디코딩
 */
export function decodeState<T>(encoded: string, defaultValue: T): T {
  try {
    // URL-safe base64 복원
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    // 패딩 복원
    while (base64.length % 4) base64 += '=';
    const json = decodeURIComponent(atob(base64));
    return JSON.parse(json) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * 상태를 URL로 공유하는 훅
 */
export function useUrlState<T extends object>(
  options: UseUrlStateOptions<T> = {}
) {
  const {
    key = 's', // 짧은 키로 URL 절약
    defaultValue = {} as T,
    historyMode = 'replace',
    serialize = encodeState,
    deserialize = (v) => decodeState(v, defaultValue),
  } = options;

  const router = useRouter();
  const searchParams = useSearchParams();
  const [isHydrated, setIsHydrated] = useState(false);

  // URL에서 초기 상태 읽기
  const getStateFromUrl = useCallback((): T => {
    const param = searchParams.get(key);
    if (!param) return defaultValue;
    return deserialize(param);
  }, [searchParams, key, defaultValue, deserialize]);

  // URL에 상태 저장
  const setStateToUrl = useCallback(
    (state: T) => {
      const params = new URLSearchParams(searchParams.toString());
      const encoded = serialize(state);

      if (encoded && Object.keys(state).length > 0) {
        params.set(key, encoded);
      } else {
        params.delete(key);
      }

      const newUrl = `${window.location.pathname}?${params.toString()}`;

      if (historyMode === 'push') {
        router.push(newUrl, { scroll: false });
      } else {
        router.replace(newUrl, { scroll: false });
      }
    },
    [searchParams, key, serialize, historyMode, router]
  );

  // 공유 URL 생성
  const getShareUrl = useCallback(
    (state: T): string => {
      const url = new URL(window.location.href);
      const encoded = serialize(state);

      if (encoded && Object.keys(state).length > 0) {
        url.searchParams.set(key, encoded);
      }

      // UTM 파라미터 추가
      url.searchParams.set('utm_source', 'share');
      url.searchParams.set('utm_medium', 'link');

      return url.toString();
    },
    [key, serialize]
  );

  // 클립보드에 URL 복사
  const copyShareUrl = useCallback(
    async (state: T): Promise<boolean> => {
      try {
        const url = getShareUrl(state);
        await navigator.clipboard.writeText(url);
        return true;
      } catch {
        return false;
      }
    },
    [getShareUrl]
  );

  // 하이드레이션 체크
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return {
    /** URL에서 읽은 상태 */
    stateFromUrl: isHydrated ? getStateFromUrl() : defaultValue,
    /** URL에 상태 저장 */
    setStateToUrl,
    /** 공유 URL 생성 */
    getShareUrl,
    /** 클립보드에 공유 URL 복사 */
    copyShareUrl,
    /** 하이드레이션 완료 여부 */
    isHydrated,
  };
}

/**
 * 단순 키-값 쌍을 URL에 저장하는 훅 (간단한 경우)
 */
export function useQueryParams() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isHydrated, setIsHydrated] = useState(false);

  const get = useCallback(
    (key: string): string | null => {
      return searchParams.get(key);
    },
    [searchParams]
  );

  const set = useCallback(
    (key: string, value: string | null, mode: 'push' | 'replace' = 'replace') => {
      const params = new URLSearchParams(searchParams.toString());

      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }

      const newUrl = `${window.location.pathname}?${params.toString()}`;

      if (mode === 'push') {
        router.push(newUrl, { scroll: false });
      } else {
        router.replace(newUrl, { scroll: false });
      }
    },
    [searchParams, router]
  );

  const getAll = useCallback((): Record<string, string> => {
    const result: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }, [searchParams]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return { get, set, getAll, isHydrated };
}
