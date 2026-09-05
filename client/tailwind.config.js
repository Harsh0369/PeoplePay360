/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          deepTeal: "#063F3B",
          darkTeal: "#0B5D57",
          teal: "#159A91",
          warmCream: "#F5F0E6",
          softSand: "#EAE2D5",
          offWhite: "#FFFDF8",
          darkCharcoal: "#1F2933",
          mutedSlate: "#667085",
          sageGreen: "#6FAF8B",
          coral: "#E98272",
          goldenAmber: "#D9A441",
          mutedLavender: "#8B7BB8",
          sandBorder: "#D8D0C3",
          // Soft Badge Colors
          activeBg: "#DCEFEB",
          activeText: "#0B5D57",
          leaveBg: "#F8EFD8",
          leaveText: "#9A6700",
          warningBg: "#FBE5E0",
          warningText: "#B5473A",
          draftBg: "#EAE2D5",
          draftText: "#667085",
          hoverRow: "#E2F0EC",
        }
      }
    },
  },
  plugins: [],
}
