/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Warm, vivid, child-friendly base palette.
        cream: '#fff7ed',
        ink: '#3b2a55',
        grape: '#7c5cff',
        bubble: '#ff7eb6',
        sun: '#ffc83d',
        leaf: '#36d39a',
        sky: '#43c6f0',
        coral: '#ff8a5c',
      },
      fontFamily: {
        // Rounded, friendly typography.
        display: ['"Baloo 2"', 'system-ui', 'sans-serif'],
        body: ['"Nunito"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        blob: '2rem',
        pill: '999px',
      },
      boxShadow: {
        soft: '0 10px 30px -8px rgba(60, 30, 90, 0.25)',
        pop: '0 18px 40px -10px rgba(124, 92, 255, 0.45)',
        inner3d: 'inset 0 -6px 0 rgba(0,0,0,0.12)',
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(124,92,255,0.5)' },
          '50%': { boxShadow: '0 0 0 18px rgba(124,92,255,0)' },
        },
      },
      animation: {
        floaty: 'floaty 3s ease-in-out infinite',
        wiggle: 'wiggle 0.4s ease-in-out',
        pulseGlow: 'pulseGlow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
