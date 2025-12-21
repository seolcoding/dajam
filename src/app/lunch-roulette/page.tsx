'use client';

import dynamic from 'next/dynamic';

const LunchRouletteApp = dynamic(
  () => import('./components/LunchRouletteApp'),
  { ssr: false }
);

export default function LunchRoulettePage() {
  return <LunchRouletteApp />;
}
