'use client';

import { MessageSquarePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { analyticsEvents } from '@/components/analytics/GoogleAnalytics';

interface FeedbackButtonProps {
  appName: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const FEEDBACK_FORM_URL =
  process.env.NEXT_PUBLIC_FEEDBACK_FORM_URL ||
  'https://forms.gle/YOUR_GOOGLE_FORM_ID';

export function FeedbackButton({
  appName,
  className = '',
  variant = 'outline',
  size = 'sm',
}: FeedbackButtonProps) {
  const handleClick = () => {
    analyticsEvents.feedbackClicked(appName);

    // Build form URL with pre-filled app name
    const url = new URL(FEEDBACK_FORM_URL);
    url.searchParams.set('entry.XXXXX', appName); // Replace with actual form field ID

    window.open(url.toString(), '_blank');
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={`gap-1.5 ${className}`}
      title="피드백 보내기"
    >
      <MessageSquarePlus className="h-4 w-4" />
      <span className="hidden sm:inline">피드백</span>
    </Button>
  );
}

// Floating feedback button for consistent placement
export function FloatingFeedbackButton({ appName }: { appName: string }) {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <FeedbackButton
        appName={appName}
        variant="default"
        size="default"
        className="shadow-lg"
      />
    </div>
  );
}
