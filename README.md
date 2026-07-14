# 六爻排盘

一个精美的在线六爻排盘工具，传统中式古风界面。

## 功能特性

- **三种起卦方式**
  - 铜钱摇卦：模拟三枚铜钱抛掷六次
  - 手动选卦：逐爻选择阴阳动变
  - 天机起卦：梅花易数时间起卦

- **完整排盘信息**
  - 本卦、变卦展示（左右对称排盘，爻线对齐、配色一致）
  - 纳甲、六亲、六神
  - 世爻、应爻定位
  - 动爻标记（老阳○、老阴×）
  - 变卦回头纳甲与六亲（以本卦之宫论）
  - 卦辞、爻辞展示
  - 卦象解析断语

- **AI 智能解卦**
  - 一键请大师解卦，流式输出实时呈现
  - 解读结果以 Markdown 富文本渲染（标题、加粗、列表、表格等），古风排版

- **界面特色**
  - 新中式古风美学，宣纸纹理背景
  - 书法字体（马善政楷书）渲染，古意盎然
  - 流畅动画效果（铜钱翻转、爻象渐入、脉冲提示）
  - 历史记录本地保存
  - 响应式设计，支持手机平板

## 技术栈

- React 18 + TypeScript
- Vite
- TailwindCSS
- Zustand (状态管理)
- React Router (HashRouter)
- lunar-typescript (农历/干支/节气)
- react-markdown + remark-gfm (AI 解读 Markdown 渲染)
- Lucide React (图标)

## 本地运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 代码检查
npm run lint
```

开发服务器启动后，浏览器访问 `http://localhost:5173/liuyao-divination/` 即可预览（已配置 `base` 路径）。

## 在线使用

线上地址：<https://taiwanhuachenyu.github.io/liuyao-divination/#/>

## 部署

推送到 `main` 分支后，GitHub Actions（`.github/workflows/deploy.yml`）自动构建并发布到 GitHub Pages。

- 使用 `HashRouter`，适配 GitHub Pages 无服务端路由的静态托管
- Vite `base` 设为 `/liuyao-divination/`，与仓库名一致
