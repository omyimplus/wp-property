import type { Config } from 'tailwindcss'

export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Prompt', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'hero-fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'hero-fade-up': {
          from: { opacity: '0', transform: 'translateY(18px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'hero-fade-in': 'hero-fade-in 1.1s ease-out both',
        'hero-fade-up': 'hero-fade-up 0.75s ease-out both',
      },
      colors: {
        wp: {
          header: '#0f2b52',
          navy: '#0f2b52',
          footer: '#011f49',
          'navy-light': '#1a3d6b',
          blue: '#00509D',
          gold: '#e8b923',
          'gold-light': '#f2cb5a',
          'gold-text': '#f0c757',
          hero: {
            navy: '#0F2B52',
            blue: '#004AB2',
            'cta-mid': '#034197',
          },
        },
      },
    },
  },
} satisfies Config
