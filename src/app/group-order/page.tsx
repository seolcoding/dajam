'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { HomePage } from './components/HomePage';
import { CreateSessionPage } from './components/CreateSessionPage';
import { HostDashboardPage } from './components/HostDashboardPage';
import { JoinSessionPage } from './components/JoinSessionPage';
import { SummaryPage } from './components/SummaryPage';

type View = 'home' | 'create' | 'host' | 'join' | 'summary';

function GroupOrderContent() {
  const searchParams = useSearchParams();
  const [view, setView] = useState<View>('home');
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    const viewParam = searchParams.get('view') as View | null;
    const sessionIdParam = searchParams.get('sessionId');

    if (viewParam) {
      setView(viewParam);
    }
    if (sessionIdParam) {
      setSessionId(sessionIdParam);
    }
  }, [searchParams]);

  const handleNavigate = (page: string, params?: Record<string, string>) => {
    // Parse the page to determine view and sessionId
    const id = params?.sessionId || '';

    if (page === 'home' || page === '/' || page === '') {
      setView('home');
      setSessionId('');
      window.history.pushState({}, '', '/group-order');
    } else if (page === 'create' || page === '/create') {
      setView('create');
      window.history.pushState({}, '', '/group-order?view=create');
    } else if (page === 'host' || page.startsWith('/host/')) {
      const hostId = page.startsWith('/host/') ? page.replace('/host/', '') : id;
      setView('host');
      setSessionId(hostId);
      window.history.pushState({}, '', `/group-order?view=host&sessionId=${hostId}`);
    } else if (page === 'join' || page.startsWith('/join/')) {
      const joinId = page.startsWith('/join/') ? page.replace('/join/', '') : id;
      setView('join');
      setSessionId(joinId);
      window.history.pushState({}, '', `/group-order?view=join&sessionId=${joinId}`);
    } else if (page === 'summary' || page.startsWith('/summary/')) {
      const summaryId = page.startsWith('/summary/') ? page.replace('/summary/', '') : id;
      setView('summary');
      setSessionId(summaryId);
      window.history.pushState({}, '', `/group-order?view=summary&sessionId=${summaryId}`);
    }
  };

  // Render the appropriate component based on the current view
  switch (view) {
    case 'create':
      return <CreateSessionPage onNavigate={handleNavigate} />;
    case 'host':
      return sessionId ? (
        <HostDashboardPage sessionId={sessionId} onNavigate={handleNavigate} />
      ) : (
        <HomePage onNavigate={handleNavigate} />
      );
    case 'join':
      return sessionId ? (
        <JoinSessionPage sessionId={sessionId} onNavigate={handleNavigate} />
      ) : (
        <HomePage onNavigate={handleNavigate} />
      );
    case 'summary':
      return sessionId ? (
        <SummaryPage sessionId={sessionId} onNavigate={handleNavigate} />
      ) : (
        <HomePage onNavigate={handleNavigate} />
      );
    case 'home':
    default:
      return <HomePage onNavigate={handleNavigate} />;
  }
}

export default function GroupOrderPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">로딩 중...</div>}>
      <GroupOrderContent />
    </Suspense>
  );
}
