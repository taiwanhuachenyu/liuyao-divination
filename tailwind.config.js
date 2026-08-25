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
        // 墨之三级末位。对宣纸底 5.15:1，可作正文小字
        'ink-faint': '#6B6459',
        // 朱、赭、绿三色原值作大字尚可，落到 12–14px 小字皆不足 4.5:1，
        // 故各备一深色专供小字与描边，浅者只用于色块
        'cinnabar-deep': '#9E2B22',
        'ocher-deep': '#8F4A24',
        'jade-deep': '#2F6046',
        // 螣蛇之紫。六神色引里唯一新增之色，只作 2px 竖条，不作字色
        zi: '#6E4A6B',
      },
      fontFamily: {
        // TiLatin 排最前：index.css 里以 local() + unicode-range 造的拉丁补丁，
        // 把「AI」「v1」从 Ma Shan Zheng 那副潦草拉丁里夺回正体
        li: ['TiLatin', '"Ma Shan Zheng"', '"EB Garamond"', '"STLiti"', 'LiSu', 'serif'],
        // 仿宋作正文。刻本的字是方的，楷书只作题署
        song: ['"FangSong"', '"STFangsong"', '"Songti SC"', 'SimSun', 'serif'],
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
          // 抛得低、转得多：钱是掷在案上的，不是抛过屋顶的
          '0%': { transform: 'rotateY(0deg) translateY(0)' },
          '50%': { transform: 'rotateY(900deg) translateY(-28px)' },
          '100%': { transform: 'rotateY(1800deg) translateY(0)' },
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
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
