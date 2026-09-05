/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#4F46E5',
          dark: '#4338CA',
          light: '#EEF2FF',
        },
        sidebar: {
          DEFAULT: '#1E1B2E',
          hover: '#2A2540',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        ink: '#0F172A',
        muted: '#64748B',
        line: '#E5E7EB',
        canvas: '#F6F7FB',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)',
        pop: '0 10px 30px rgba(15,23,42,0.12)',
      },
    },
  },
  plugins: [],
};
