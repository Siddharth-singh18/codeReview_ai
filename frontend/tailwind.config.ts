import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#090A0F',
        surface: {
          DEFAULT: '#11131F',
          elevated: '#1A1D2E',
          card: 'rgba(20, 24, 40, 0.6)',
        },
        accent: {
          cyan: '#06b6d4',
          blue: '#3b82f6',
          violet: '#8b5cf6',
          amber: '#f59e0b',
          emerald: '#10b981',
          rose: '#f43f5e',
        },
        severity: {
          critical: '#ef4444',
          high: '#f97316',
          medium: '#eab308',
          low: '#3b82f6',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      backgroundImage: {
        'radial-gradient-mesh':
          'radial-gradient(at 0% 0%, rgba(6, 182, 212, 0.15) 0px, transparent 55%), radial-gradient(at 100% 0%, rgba(139, 92, 246, 0.15) 0px, transparent 55%), radial-gradient(at 50% 100%, rgba(59, 130, 246, 0.1) 0px, transparent 55%)',
        'glass-gradient':
          'linear-gradient(135deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.02) 100%)',
        'glow-cyan':
          'radial-gradient(circle, rgba(6, 182, 212, 0.25) 0%, transparent 70%)',
        'glow-violet':
          'radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, transparent 70%)',
      },
    },
  },
  plugins: [],
};
export default config;
