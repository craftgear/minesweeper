/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';

export default {
  content: ['./index.html', './src/**/*.{jsx,tsx,js,html}'],
  theme: {
    extend: {},
  },
  plugins: [typography],
};
