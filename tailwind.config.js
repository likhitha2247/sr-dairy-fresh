/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        milk: '#FFFCF7',
        cream: '#F6ECD9',
        sage: {
          DEFAULT: '#3F6B4F',
          light: '#EAF1EC',
          dark: '#2C4E38',
        },
        sky: {
          DEFAULT: '#3A7CA5',
          light: '#E7F1F6',
        },
        gold: {
          DEFAULT: '#E2A63B',
          light: '#FBF0DA',
        },
        ink: '#2A2620',
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        body: ['"Manrope"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        blob: '2rem',
      },
    },
  },
  plugins: [],
}
