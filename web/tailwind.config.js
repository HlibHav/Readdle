/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'documents-blue': '#007AFF',
        'documents-gray': '#8E8E93',
        'documents-light-gray': '#F2F2F7',
      }
    },
  },
  plugins: [],
}
