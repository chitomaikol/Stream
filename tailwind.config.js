/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0F172A', // Very dark slate (gaming/trading style)
        surface: '#1E293B',
        primary: '#0070f3', // Electric Blue
        success: '#10B981', // Green for profit
        danger: '#EF4444', // Red for expiration
        text: '#F8FAFC',
        textMuted: '#94A3B8'
      }
    },
  },
  plugins: [],
}
