// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        // Add these two 👇
        background: '#ffffff', // or any light/dark bg you want
        foreground: '#111827', // e.g., Tailwind gray-900
      }
    },
  },
  plugins: [],
}
