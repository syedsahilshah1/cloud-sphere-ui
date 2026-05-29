/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        indigo: {
          600: '#5A51E6', // From the CloudSphere UI
        }
      }
    },
  },
  plugins: [],
}
