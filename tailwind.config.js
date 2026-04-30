/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff8ff',
          100: '#dbeffe',
          200: '#bfe3fe',
          300: '#93d1fd',
          400: '#60b6fa',
          500: '#3b95f5',
          600: '#2577ea',
          700: '#1d61d7',
          800: '#1e50ae',
          900: '#1e4589',
          950: '#172b53',
        },
        school: {
          primary: '#1a365d',
          secondary: '#2a4a7f',
          accent: '#e2a832',
          success: '#38a169',
          warning: '#dd6b20',
          danger: '#e53e3e',
          light: '#f7fafc',
          dark: '#1a202c',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      }
    },
  },
  plugins: [],
};
