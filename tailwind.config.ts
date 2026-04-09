import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        colombia: {
          yellow: '#FCD116',
          blue: '#003893',
          red: '#CE1126',
        },
        pitch: {
          green: '#2D5A27',
          'green-light': '#3A7D32',
          lines: '#FFFFFF',
        },
        gold: '#FFD700',
        'dark-bg': '#0A1628',
        'card-bg': '#1A2A4A',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
    },
  },
  plugins: [],
}

export default config
