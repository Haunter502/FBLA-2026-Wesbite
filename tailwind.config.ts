import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors from palette
        brand: {
          cyan: '#00F2DE', // Bright turquoise
          teal: '#00A799', // Medium teal
          'dark-teal': '#005049', // Dark teal
          black: '#000000',
          white: '#FFFFFF',
        },
        // Semantic color mappings
        primary: {
          DEFAULT: '#00A799',
          light: '#00F2DE',
          dark: '#005049',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#005049',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#00F2DE',
          foreground: '#000000',
        },
        background: '#FFFFFF',
        foreground: '#000000',
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#000000',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#000000',
        },
        muted: {
          DEFAULT: '#F3F4F6',
          foreground: '#6B7280',
        },
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#FFFFFF',
        },
        border: '#E5E7EB',
        input: '#E5E7EB',
        ring: '#00A799',
        chart: {
          '1': '#00F2DE',
          '2': '#00A799',
          '3': '#005049',
          '4': '#6366F1',
          '5': '#F59E0B',
        },
      },
      borderRadius: {
        lg: '1rem',
        md: '0.75rem',
        sm: '0.5rem',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-in',
        'fade-up': 'fade-up 0.5s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'pulse-slow': 'pulse-slow 2s ease-in-out infinite',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-brand':
          'linear-gradient(135deg, #00F2DE 0%, #00A799 50%, #005049 100%)',
      },
      boxShadow: {
        'brand': '0 4px 14px 0 rgba(0, 167, 153, 0.15)',
        'brand-lg': '0 10px 40px 0 rgba(0, 167, 153, 0.2)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;

