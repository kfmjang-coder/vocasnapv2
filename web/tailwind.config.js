/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0E0E14',
        surface: '#111118',
        card: '#1A1A22',
        cardHi: '#22222C',
        line: 'rgba(255,255,255,0.08)',
        lineHi: 'rgba(255,255,255,0.14)',
        txt: '#F4F4F8',
        sub: '#9A9AA8',
        faint: '#6B6B78',
        accent: '#9D8CFF',
        accentDim: 'rgba(157,140,255,0.14)',
        good: '#2EE6A6',
        goodTxt: '#3FF0B4',
        bad: '#FF5C7A',
        badTxt: '#FF7C95',
        warn: '#FFB454',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'Pretendard', 'system-ui', 'sans-serif'],
        sans: ['Pretendard', '-apple-system', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Noto Sans"', 'monospace'],
      },
      borderRadius: { xl2: '18px' },
    },
  },
  plugins: [],
};
