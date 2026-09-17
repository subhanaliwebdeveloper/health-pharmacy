/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#0f9d58',
          600: '#087c61',
          700: '#0b5e4c',
        },
      },
      boxShadow: {
        soft: '0 12px 30px rgba(15, 157, 88, 0.12)',
      },
    },
  },
  plugins: [],
};
