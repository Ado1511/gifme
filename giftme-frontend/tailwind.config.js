/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#FBF9E7',
        foreground: '#5A281F',
        darkBackground: '#422373',
        darkForeground: '#AA90FB',
        accent: '#F98F50',
      }
    },
  },
  plugins: [],
}
