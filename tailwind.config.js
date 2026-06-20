/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        forest:   '#2C4A3E',
        forestMd: '#3A5F51',
        sage:     '#5C8374',
        sageLt:   '#93B5A7',
        teal:     '#2E7D6B',
        gold:     '#C8963E',
        goldLt:   '#E8B96A',
        amber:    '#D4820A',
        cream:    '#F5F2EC',
        warm:     '#EDE8E0',
        tan:      '#E2D9CC',
        darkText: '#1E2D28',
        midGray:  '#7A8C85',
        red:      '#C0392B',
        green:    '#1E7E4A',
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'serif'],
      },
    },
  },
  plugins: [],
}
