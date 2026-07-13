/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cinnabar: '#C23A30',
        ink: '#1A1A1A',
        paper: '#F5F0E6',
        indigo: '#2A5D7C',
        ocher: '#B5693A',
        'paper-dark': '#E8DFD0',
        'ink-light': '#3D3D3D',
      },
      fontFamily: {
        li: ['"Ma Shan Zheng"', '"STLiti"', 'LiSu', '"FangSong"', 'cursive'],
      },
      animation: {
        'coin-flip': 'coinFlip 0.8s ease-out',
        'coin-land': 'coinLand 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'yao-reveal': 'yaoReveal 0.4s ease-out forwards',
      },
      keyframes: {
        coinFlip: {
          '0%': { transform: 'rotateY(0deg) translateY(0)' },
          '50%': { transform: 'rotateY(720deg) translateY(-60px)' },
          '100%': { transform: 'rotateY(1440deg) translateY(0)' },
        },
        coinLand: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        yaoReveal: {
          '0%': { opacity: '0', transform: 'scaleY(0)' },
          '100%': { opacity: '1', transform: 'scaleY(1)' },
        },
      },
    },
  },
  plugins: [],
}
