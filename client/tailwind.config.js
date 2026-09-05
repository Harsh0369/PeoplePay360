/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        // New design system: deep teal scale + neutral canvas.
        brand: {
          900: '#062622',
          850: '#093832',
          800: '#0B453D',
          700: '#115E54',
          600: '#14766A',
          500: '#1C9989',
          100: '#D1E7DD',
          50: '#F0F7F4',
          // Legacy aliases (kept so existing modules restyle to the new palette
          // without touching every file).
          deepTeal: '#062622',
          darkTeal: '#0B453D',
          teal: '#14766A',
          warmCream: '#F5F7F2',
          softSand: '#EEF2F0',
          offWhite: '#FFFFFF',
          darkCharcoal: '#0F172A',
          mutedSlate: '#64748B',
          sageGreen: '#34D399',
          coral: '#F43F5E',
          goldenAmber: '#F59E0B',
          sandBorder: '#E2E8F0',
          activeBg: '#D1FAE5',
          activeText: '#065F46',
          leaveBg: '#FEF3C7',
          leaveText: '#92400E',
          warningBg: '#FFE4E6',
          warningText: '#9F1239',
          draftBg: '#F1F5F9',
          draftText: '#475569',
          hoverRow: '#F0F7F4',
        },
        canvas: '#F5F7F2',
        surface: '#FFFFFF',
        accent: { lime: '#84CC16', mint: '#34D399', emerald: '#10B981', amber: '#F59E0B' },
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.05), 0 1px 2px -1px rgba(0,0,0,0.03)',
        'card-hover': '0 10px 25px -5px rgba(9,56,50,0.08), 0 8px 10px -6px rgba(9,56,50,0.04)',
        sidebar: '4px 0 24px 0 rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
};
