import { useState } from 'react'
import { Type } from 'lucide-react'
import { useDivinationStore, FontType } from '../store/useDivinationStore'

const FONTS: { value: FontType; label: string; previewClass: string }[] = [
  { value: 'kai', label: '楷体', previewClass: 'font-kai' },
  { value: 'li', label: '隶书', previewClass: 'font-li' },
  { value: 'song', label: '宋体', previewClass: 'font-song' },
  { value: 'hei', label: '黑体', previewClass: 'font-hei' },
]

export default function FontSwitcher() {
  const { font, setFont } = useDivinationStore()
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-3 hover:bg-paper-dark rounded-full transition-all hover:shadow-md flex items-center gap-1"
        title="切换字体"
      >
        <Type size={22} className="text-ink-light" />
        <span className="text-sm text-ink-light hidden sm:inline">
          {FONTS.find(f => f.value === font)?.label}
        </span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 bg-paper border border-paper-dark rounded-xl shadow-xl p-2 z-50 min-w-[160px]">
            {FONTS.map((f) => (
              <button
                key={f.value}
                onClick={() => {
                  setFont(f.value)
                  setOpen(false)
                }}
                className={`w-full px-4 py-2 rounded-lg text-left flex items-center gap-3 transition-colors ${
                  font === f.value 
                    ? 'bg-cinnabar/10 text-cinnabar' 
                    : 'hover:bg-paper-dark text-ink'
                }`}
              >
                <span className={`${f.previewClass} text-xl w-8 text-center`}>{f.label.charAt(0)}</span>
                <span className="font-kai">{f.label}</span>
                {font === f.value && <span className="ml-auto text-cinnabar">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
