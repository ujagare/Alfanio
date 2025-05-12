/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        fadeInUp: {
          'from': { 
            opacity: '0',
            transform: 'translateY(30px)'
          },
          'to': { 
            opacity: '1',
            transform: 'translateY(0)'
          },
        }
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s forwards'
      }
    },
  },
  plugins: [],
  variants: {
    extend: {
      backdropBlur: ['responsive'],
    }
  }
}