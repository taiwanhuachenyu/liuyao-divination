import { useState } from 'react'
import { X, Key } from 'lucide-react'
import { useDivinationStore } from '../store/useDivinationStore'

interface Props {
  open: boolean
  onClose: () => void
}

export default function ApiKeyModal({ open, onClose }: Props) {
  const { aiApiKey, setAiApiKey } = useDivinationStore()
  const [tempKey, setTempKey] = useState(aiApiKey)

  if (!open) return null

  const handleSave = () => {
    setAiApiKey(tempKey.trim())
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-paper rounded-2xl p-6 w-full max-w-md shadow-2xl border border-paper-dark" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl flex items-center gap-2 text-ink">
            <Key size={20} className="text-cinnabar" />
            AI 解卦设置
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-paper-dark rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-ink-light mb-4 leading-relaxed">
          输入 <span className="text-cinnabar font-bold">yike</span> 即可使用内置免费密钥进行AI解卦。
          如果你有自己的Agnes AI API密钥，也可以直接输入。
        </p>
        <input
          type="password"
          value={tempKey}
          onChange={(e) => setTempKey(e.target.value)}
          placeholder="输入yike或你自己的API密钥"
          className="w-full px-4 py-3 border border-paper-dark rounded-lg bg-paper/50 focus:outline-none focus:border-cinnabar focus:ring-2 focus:ring-cinnabar/20 transition-all text-lg"
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        />
        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-lg border border-paper-dark hover:bg-paper-dark/50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-lg bg-cinnabar text-paper hover:bg-cinnabar/90 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}
