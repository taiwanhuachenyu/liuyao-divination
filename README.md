# 六爻排盘

一个精美的在线六爻排盘工具，传统中式古风界面。

## 功能特性

- **三种起卦方式**
  - 铜钱摇卦：模拟三枚铜钱抛掷六次
  - 手动选卦：逐爻选择阴阳动变
  - 天机起卦：梅花易数时间起卦

- **完整排盘信息**
  - 统一排盘表：本卦与变卦同表并列，逐行严格对齐（桌面/移动端一致）
  - 纳甲、六亲、六神
  - 世爻、应爻定位
  - 动爻标记（老阳○、老阴×）
  - 变卦回头纳甲与六亲（以本卦之宫论）
  - 卦辞、爻辞展示
  - 卦象解析断语

- **AI 智能解卦**
  - 需自备 OpenAI 兼容接口（地址 + 密钥 + 模型名），配置仅存于浏览器本地
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
- react-markdown + remark-gfm + remark-cjk-friendly (AI 解读 Markdown 渲染，兼容中文加粗)
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

## 配置 AI 解卦

本项目部署在 GitHub Pages，是纯静态站点，没有后端可以代为保管密钥 —— 任何写进代码或 `.env` 的密钥，构建后都会明文出现在浏览器可下载的 JS 文件里。因此 AI 解卦采用用户自带密钥的方式。

点击页面右上角的齿轮图标，填写三项：

| 字段 | 说明 |
| --- | --- |
| 接口地址 | OpenAI 兼容的接口地址，如 `https://api.openai.com/v1`。裸域名、带 `/v1` 的地址、完整的 `/chat/completions` 端点都可以，会自动补全，并在下方显示实际请求地址 |
| 密钥 | 对应服务的 API Key |
| 模型名 | 须与服务方给出的名称完全一致，如 `gpt-4o`、`deepseek-chat` |

填好后可点「测试连接」验证。该操作走与正式解卦完全相同的请求路径，收到首个字符即中断，不会白白消耗整篇解读的额度。

几点说明：

- 配置保存在浏览器 `localStorage`，只存在于你本机，除你填写的接口地址外不会发往任何地方。换浏览器或清除站点数据后需重新填写。
- 只支持 OpenAI Chat Completions 协议，绝大多数第三方服务（DeepSeek、Kimi、OpenRouter 及各类中转）均兼容。
- 请求不携带 `temperature` 与 `max_tokens`，以兼容会拒绝这两个参数的推理系模型。
- **接口需允许浏览器跨域（CORS）访问。** 纯前端直连由浏览器发起跨域请求，若接口未返回相应的 CORS 响应头，请求会被浏览器拦截。遇到「无法连接」提示时，多半是此原因，需换用允许跨域的接口地址。

## 在线使用

线上地址：<https://taiwanhuachenyu.github.io/liuyao-divination/#/>

## 部署

推送到 `main` 分支后，GitHub Actions（`.github/workflows/deploy.yml`）自动构建并发布到 GitHub Pages。

- 使用 `HashRouter`，适配 GitHub Pages 无服务端路由的静态托管
- Vite `base` 设为 `/liuyao-divination/`，与仓库名一致
