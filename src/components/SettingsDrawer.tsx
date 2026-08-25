import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, X } from 'lucide-react'
import { AiConfig } from '../types'
import { EMPTY_AI_CONFIG, useSettingsStore } from '../store/useSettingsStore'
import { useDrawer } from '../hooks/useDrawer'
import { isAiConfigured, resolveEndpoint, testAiConnection } from '../utils/ai'

interface SettingsDrawerProps {
  open: boolean
  onClose: () => void
}

// 地址、密钥、模型名皆为拉丁字符，用全站的楷书字体（font-li）会难以辨认，故单独指定等宽字体
const INPUT_CLASS =
  'w-full px-3 py-2.5 border border-paper-dark rounded-lg bg-paper/50 focus:outline-none focus:border-cinnabar focus:ring-2 focus:ring-cinnabar/20 transition-all text-sm font-mono'

interface TestResult {
  status: 'idle' | 'testing' | 'ok' | 'fail'
  message: string
}

export default function SettingsDrawer({ open, onClose }: SettingsDrawerProps) {
  const setAiConfig = useSettingsStore((state) => state.setAiConfig)
  const clearAiConfig = useSettingsStore((state) => state.clearAiConfig)
  const [draft, setDraft] = useState<AiConfig>(EMPTY_AI_CONFIG)
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)
  const [test, setTest] = useState<TestResult>({ status: 'idle', message: '' })

  // 每次打开都以已保存的配置为准，避免上次未保存的草稿残留。
  // 此处用 getState 取值而非订阅，保存后不应把面板重置回初始态
  useEffect(() => {
    if (!open) return
    setDraft(useSettingsStore.getState().aiConfig)
    setShowKey(false)
    setSaved(false)
    setTest({ status: 'idle', message: '' })
  }, [open])

  const panelRef = useDrawer(open, onClose)

  const endpoint = resolveEndpoint(draft.baseUrl)
  const complete = isAiConfigured(draft)

  const update = (patch: Partial<AiConfig>) => {
    setDraft((prev) => ({ ...prev, ...patch }))
    setSaved(false)
    setTest({ status: 'idle', message: '' })
  }

  const handleSave = () => {
    setAiConfig({
      baseUrl: draft.baseUrl.trim(),
      apiKey: draft.apiKey.trim(),
      model: draft.model.trim(),
    })
    setSaved(true)
  }

  const handleTest = async () => {
    setTest({ status: 'testing', message: '' })
    const result = await testAiConnection(draft)
    setTest({ status: result.ok ? 'ok' : 'fail', message: result.message })
  }

  const handleClear = () => {
    clearAiConfig()
    setDraft(EMPTY_AI_CONFIG)
    setShowKey(false)
    setSaved(false)
    setTest({ status: 'idle', message: '' })
  }

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      {/* visibility 一并纳入过渡：滑出动画照旧，收起后才真正隐藏，键盘 Tab 不会再落进抽屉 */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="AI 解卦设置"
        aria-hidden={!open}
        className={`fixed top-0 right-0 h-full w-[92vw] max-w-md bg-paper shadow-2xl z-50 flex flex-col transform transition-[transform,visibility] duration-300 border-l border-paper-dark ${open ? 'translate-x-0 visible' : 'translate-x-full invisible'}`}
      >
        <div className="p-3 md:p-4 border-b border-paper-dark flex items-center justify-between shrink-0">
          <h2 className="text-lg md:text-xl text-ink">AI 解卦设置</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-paper-dark rounded-full transition-colors"
            title="关闭"
            aria-label="关闭设置"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-5">
          <p className="text-xs md:text-sm text-ink-light leading-relaxed bg-paper-dark/30 rounded-lg p-3">
            本站是纯静态页面，没有后端代为保管密钥，故需自备。填写的内容只存在你当前浏览器本地，除你指定的接口地址外不会发往别处。
          </p>

          <div>
            <label htmlFor="ai-base-url" className="block text-sm text-ink mb-2">
              接口地址
            </label>
            <input
              id="ai-base-url"
              type="text"
              value={draft.baseUrl}
              onChange={(e) => update({ baseUrl: e.target.value })}
              placeholder="https://api.openai.com/v1"
              className={INPUT_CLASS}
              spellCheck={false}
              autoComplete="off"
            />
            <p className="mt-1.5 text-[11px] md:text-xs text-ink-light/80 break-all leading-relaxed">
              {endpoint ? (
                <>
                  实际请求：<span className="font-mono text-ocher">{endpoint}</span>
                </>
              ) : (
                '裸域名、带 /v1 的地址、完整的 /chat/completions 端点都可以，会自动补全'
              )}
            </p>
          </div>

          <div>
            <label htmlFor="ai-key" className="block text-sm text-ink mb-2">
              密钥
            </label>
            <div className="relative">
              <input
                id="ai-key"
                type={showKey ? 'text' : 'password'}
                value={draft.apiKey}
                onChange={(e) => update({ apiKey: e.target.value })}
                placeholder="sk-..."
                className={`${INPUT_CLASS} pr-11`}
                spellCheck={false}
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowKey((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-ink-light hover:text-ink transition-colors"
                title={showKey ? '隐藏密钥' : '显示密钥'}
                aria-label={showKey ? '隐藏密钥' : '显示密钥'}
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="ai-model" className="block text-sm text-ink mb-2">
              模型名
            </label>
            <input
              id="ai-model"
              type="text"
              value={draft.model}
              onChange={(e) => update({ model: e.target.value })}
              placeholder="gpt-4o"
              className={INPUT_CLASS}
              spellCheck={false}
              autoComplete="off"
            />
            <p className="mt-1.5 text-[11px] md:text-xs text-ink-light/80">
              须与服务方给出的名称完全一致，如 gpt-4o、deepseek-chat
            </p>
          </div>

          <div>
            <button
              onClick={handleTest}
              disabled={!complete || test.status === 'testing'}
              className="seal-button w-full flex items-center justify-center gap-2 text-sm"
            >
              {test.status === 'testing' ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  测试中…
                </>
              ) : (
                '测试连接'
              )}
            </button>
            {(test.status === 'ok' || test.status === 'fail') && (
              <div
                className={`mt-2.5 flex items-start gap-2 text-xs md:text-sm leading-relaxed break-all ${test.status === 'ok' ? 'text-jade' : 'text-cinnabar'}`}
              >
                {test.status === 'ok' ? (
                  <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                )}
                <span>{test.message}</span>
              </div>
            )}
          </div>

          <p className="text-[11px] md:text-xs text-ink-light/70 leading-relaxed border-t border-paper-dark pt-4">
            若提示无法连接，多半是该接口没对浏览器开放跨域（CORS）访问。这类地址只能由服务端调用，需换用允许跨域的接口。
          </p>
        </div>

        <div className="p-3 md:p-4 border-t border-paper-dark shrink-0 space-y-2">
          <button onClick={handleSave} disabled={!complete} className="seal-button-primary w-full">
            {saved ? '已保存' : '保存配置'}
          </button>
          <button
            onClick={handleClear}
            className="w-full py-2 text-xs md:text-sm text-ink-light hover:text-cinnabar transition-colors"
          >
            清除已保存的配置
          </button>
        </div>
      </div>
    </>
  )
}
