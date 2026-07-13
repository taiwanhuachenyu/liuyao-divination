import { X, Trash2 } from 'lucide-react'
import { useDivinationStore } from '../store/useDivinationStore'
import { Divination } from '../types'

interface HistoryDrawerProps {
  open: boolean
  onClose: () => void
}

export default function HistoryDrawer({ open, onClose }: HistoryDrawerProps) {
  const { history, loadFromHistory, deleteHistory, reset } = useDivinationStore()

  const handleLoad = (d: Divination) => {
    loadFromHistory(d)
    onClose()
    window.location.hash = '#/result'
  }

  const handleNew = () => {
    reset()
    onClose()
    window.location.hash = '#/'
  }

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div className={`fixed top-0 right-0 h-full w-80 bg-paper shadow-2xl z-50 transform transition-transform duration-300 border-l border-paper-dark ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 border-b border-paper-dark flex items-center justify-between">
          <h2 className="text-xl text-ink">历史记录</h2>
          <button onClick={onClose} className="p-2 hover:bg-paper-dark rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(100%-8rem)] p-4">
          {history.length === 0 ? (
            <p className="text-ink-light text-center py-12">暂无历史记录</p>
          ) : (
            <div className="space-y-3">
              {history.map((d) => (
                <div key={d.id} className="paper-card p-3 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 cursor-pointer" onClick={() => handleLoad(d)}>
                      <div className="font-medium text-cinnabar">{d.original.name}</div>
                      {d.changed && (
                        <div className="text-sm text-ink-light mt-1">
                          变卦：{d.changed.name}
                        </div>
                      )}
                      <div className="text-sm text-ink-light mt-1 truncate">{d.question || '（未填事项）'}</div>
                      <div className="text-xs text-ink-light/70 mt-1">{new Date(d.created).toLocaleString('zh-CN')}</div>
                    </div>
                    <button 
                      onClick={() => deleteHistory(d.id)}
                      className="p-1 text-ink-light hover:text-cinnabar transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-4 border-t border-paper-dark">
          <button onClick={handleNew} className="seal-button w-full">
            重新起卦
          </button>
        </div>
      </div>
    </>
  )
}
