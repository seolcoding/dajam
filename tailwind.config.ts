import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ===== Typography =====
      fontFamily: {
        sans: ['var(--font-sans)', 'Pretendard', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Space Grotesk', 'Noto Sans KR', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display-xl': ['4rem', { lineHeight: '1.1', letterSpacing: '-0.04em', fontWeight: '800' }],
        'display-lg': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.03em', fontWeight: '700' }],
        'display-md': ['2rem', { lineHeight: '1.3', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-sm': ['1.5rem', { lineHeight: '1.4', letterSpacing: '-0.01em', fontWeight: '600' }],
      },

      // ===== Colors =====
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },

        // ===== DaJaem Brand Colors =====
        dajaem: {
          // Green Scale (Primary)
          green: {
            50: '#E8FAF0',
            100: '#C6F2D8',
            200: '#8BE4B3',
            300: '#50D78E',
            400: '#1AC96B',
            500: '#03C75A',
            600: '#029547',
            700: '#017A3A',
            800: '#015F2D',
            900: '#004420',
            DEFAULT: '#03C75A',
          },
          // Teal Scale (Primary Dark)
          teal: {
            50: '#E6F2F1',
            100: '#CCE6E4',
            200: '#99CCC8',
            300: '#66B3AD',
            400: '#339991',
            500: '#007A6D',
            600: '#005F55',
            700: '#004D46',
            800: '#003A34',
            900: '#002823',
            DEFAULT: '#005F55',
          },
          // Yellow Scale (Secondary)
          yellow: {
            50: '#FFFDE7',
            100: '#FFF9C4',
            200: '#FFF176',
            300: '#FFEE58',
            400: '#FFE91B',
            500: '#FFD600',
            600: '#CCB100',
            700: '#998500',
            800: '#665900',
            900: '#332C00',
            DEFAULT: '#FFD600',
          },
          // Accent Colors
          red: '#DE354C',
          purple: '#7000FF',
          blue: '#0066FF',
          grey: '#F5F7F8',
        },
      },

      // ===== Border Radius =====
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
        '3xl': 'calc(var(--radius) + 16px)',
      },

      // ===== Box Shadows =====
      boxShadow: {
        'glow-green': '0 0 20px rgba(3, 199, 90, 0.25)',
        'glow-green-lg': '0 0 40px rgba(3, 199, 90, 0.35)',
        'glow-yellow': '0 0 20px rgba(255, 214, 0, 0.25)',
        'glow-yellow-lg': '0 0 40px rgba(255, 214, 0, 0.35)',
        'glow-red': '0 0 20px rgba(222, 53, 76, 0.25)',
        'glow-purple': '0 0 20px rgba(112, 0, 255, 0.25)',
        'glow-blue': '0 0 20px rgba(0, 102, 255, 0.25)',
        'neumorphism': '8px 8px 16px rgba(0,0,0,0.1), -8px -8px 16px rgba(255,255,255,0.8)',
        'neumorphism-sm': '4px 4px 8px rgba(0,0,0,0.08), -4px -4px 8px rgba(255,255,255,0.6)',
        'neumorphism-dark': '8px 8px 16px rgba(0,0,0,0.4), -8px -8px 16px rgba(255,255,255,0.03)',
        'card-hover': '0 10px 40px -10px rgba(0,0,0,0.15)',
      },

      // ===== Animations =====
      animation: {
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up-delayed': 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both',
        'scale-in': 'scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'float': 'float 3s ease-in-out infinite',
        // DaJaem Feedback Animations
        'correct-answer': 'correct-answer 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'wrong-answer': 'wrong-answer 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'rank-up': 'rank-up 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'rank-down': 'rank-down 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'confetti-fall': 'confetti-fall 3s linear forwards',
        // Interactive
        'press': 'press 0.15s ease-out',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'correct-answer': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
        'wrong-answer': {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-8px)' },
          '40%, 80%': { transform: 'translateX(8px)' },
        },
        'rank-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'rank-down': {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(3, 199, 90, 0.25)' },
          '50%': { boxShadow: '0 0 40px rgba(3, 199, 90, 0.35)' },
        },
        'confetti-fall': {
          '0%': { transform: 'translateY(-100vh) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
        press: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.97)' },
          '100%': { transform: 'scale(1)' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },

      // ===== Transition Duration =====
      transitionDuration: {
        'fast': '150ms',
        'normal': '300ms',
        'slow': '500ms',
      },

      // ===== Transition Timing Function =====
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
