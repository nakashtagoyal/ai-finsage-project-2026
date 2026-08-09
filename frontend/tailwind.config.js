/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        indigo: { 950: '#1e1b4b' },
        brand: {
          indigo: '#4338ca',
          teal: '#0d9488',
          amber: '#f59e0b',
          coral: '#f43f5e'
        }
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #4338ca 0%, #0d9488 100%)'
      }
    }
  },
  plugins: []
};
