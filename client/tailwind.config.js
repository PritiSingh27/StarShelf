/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Manrope Variable"', 'sans-serif'],
      },
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        line: 'var(--color-line)',
        ink: 'var(--color-ink)',
        muted: 'var(--color-muted)',
        brand: {
          DEFAULT: 'var(--color-brand)',
          strong: 'var(--color-brand-strong)',
          soft: 'var(--color-brand-soft)',
          text: 'var(--color-brand-text)',
        },
        star: 'var(--color-star)',
        danger: 'var(--color-danger)',
      },
      borderRadius: {
        lg: '10px',
        xl: '16px',
      },
    },
  },
  plugins: [],
};
