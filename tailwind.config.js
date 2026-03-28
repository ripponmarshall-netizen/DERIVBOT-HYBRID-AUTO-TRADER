/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        mars: {
          bg: '#070b10',
          surface: '#0d1420',
          card: '#111c2b',
          border: '#1f324a',
          text: '#d2e4ff',
          muted: '#7c98ba',
          profit: '#22c55e',
          loss: '#ef4444',
          ai: '#3b82f6',
        },
      },
      boxShadow: {
        glow: '0 0 24px rgba(59,130,246,0.18)',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0', transform: 'translateY(6px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: {
        fadeIn: 'fadeIn 220ms ease-out',
      },
    },
  },
  plugins: [],
};
