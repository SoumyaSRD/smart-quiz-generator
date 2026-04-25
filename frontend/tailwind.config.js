/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        main: 'var(--text-main)',
        muted: 'var(--text-muted)',
        accent: 'var(--accent)',
      },
      backgroundColor: {
        main: 'var(--bg-main)',
        card: 'var(--bg-card)',
        input: 'var(--input-bg)',
      },
      borderColor: {
        theme: 'var(--border)',
      }
    },
  },
  plugins: [],
}
