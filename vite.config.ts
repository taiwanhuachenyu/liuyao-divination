import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/liuyao-divination/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 农历/节气库体积较大，单独拆分以便浏览器缓存
          lunar: ['lunar-typescript'],
          // Markdown 渲染链路（react-markdown + remark + micromark）体积较大，同样拆分
          markdown: ['react-markdown', 'remark-gfm', 'remark-cjk-friendly'],
        },
      },
    },
  },
})
