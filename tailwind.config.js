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
        jade: '#3E7C5A',
        'paper-dark': '#E8DFD0',
        'ink-light': '#3D3D3D',
      },
      fontFamily: {
        // 末位不用 cursive：Windows 把它解作 Comic Sans MS，中文又落回默认字体，
        // 反不如径直退到楷书，与 Ma Shan Zheng 的笔意也一路
        li: ['"Ma Shan Zheng"', '"STLiti"', 'LiSu', '"FangSong"', 'KaiTi', '"STKaiti"', 'serif'],
      },
      animation: {
        'coin-flip': 'coinFlip 0.8s ease-out',
        'coin-land': 'coinLand 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        // both 而非 forwards：只有 forwards 时，animation-delay 期间元素按自身样式显形，
        // 延迟一过才跳回 0% 的 opacity:0，于是新落之爻先整条现出、再忽地消失重长
        'yao-reveal': 'yaoReveal 0.4s ease-out both',
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
