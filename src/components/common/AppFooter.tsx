'use client';

import { ShareButtons } from '@/components/share/ShareButtons';
import { FeedbackButton } from '@/components/feedback/FeedbackButton';

interface AppFooterProps {
  appName: string;
  title: string;
  description?: string;
}

export function AppFooter({ appName, title, description }: AppFooterProps) {
  return (
    <footer className="mt-8 pt-6 border-t border-border">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <ShareButtons
          appName={appName}
          title={title}
          description={description}
        />
        <FeedbackButton appName={appName} />
      </div>
      <div className="mt-4 text-center text-xs text-muted-foreground">
        <p>
          &copy; 2024 SeolCoding Apps.{' '}
          <a
            href="https://seolcoding.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            seolcoding.com
          </a>
        </p>
      </div>
    </footer>
  );
}
