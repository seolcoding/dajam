import type { Config } from 'tailwindcss'
import baseConfig from '@mini-apps/ui/tailwind.config'

export default {
  ...baseConfig,
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
} satisfies Config
