import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: '#F5F5F5',
          panel: '#FFFFFF',
          border: '#E0E0E0',
          text: '#111111',
          muted: '#444444',
          dim: '#666666',
        },
        signal: {
          green: '#10B981',
          red: '#EF4444',
          yellow: '#F59E0B',
          blue: '#3B82F6',
          cyan: '#06B6D4',
        },
      },
      fontFamily: {
        sans: [
          'Space Grotesk',
          'Inter',
          'system-ui',
          'sans-serif',
        ],
      },
      keyframes: {
        'pulse-green': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'pulse-green': 'pulse-green 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
