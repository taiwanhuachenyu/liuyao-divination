import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Divination, Yao } from '../types'

interface DivinationState {
  yaos: (Yao | null)[]
  question: string
  date: string
  hour: number
  method: 'coins' | 'manual' | 'time'
  currentStep: number
  isFlipping: boolean
  result: Divination | null
  history: Divination[]
  aiInterpretation: string
  aiLoading: boolean
  setQuestion: (q: string) => void
  setDate: (d: string) => void
  setHour: (h: number) => void
  setMethod: (m: 'coins' | 'manual' | 'time') => void
  addYao: (yin: boolean, changing: boolean) => void
  setYao: (index: number, yin: boolean, changing: boolean) => void
  setIsFlipping: (f: boolean) => void
  setResult: (r: Divination | null) => void
  reset: () => void
  resetYaos: () => void
  loadFromHistory: (d: Divination) => void
  deleteHistory: (id: string) => void
  appendAiInterpretation: (token: string) => void
  setAiInterpretation: (text: string) => void
  setAiLoading: (loading: boolean) => void
}

export const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

// 每次取用时现算，不在模块加载时定死——页面若跨夜长开，日期不至于仍停在昨天
export const todayStr = () => ymd(new Date())

// 旧版本存下的卦例可能缺纳甲等字段，直接渲染会白屏，故载入时剔除残缺者
function isRenderable(d: unknown): d is Divination {
  if (!d || typeof d !== 'object') return false
  const r = d as Record<string, unknown>
  return typeof r.id === 'string'
    && typeof r.dayGanZhi === 'string'
    && Array.isArray(r.originalYao) && r.originalYao.length === 6
    && Array.isArray(r.changedYao) && r.changedYao.length === 6
    && Array.isArray(r.najia) && r.najia.length === 6
    && !!r.original && Array.isArray((r.original as Record<string, unknown>).lines)
}

export const useDivinationStore = create<DivinationState>()(
  persist(
    (set) => ({
      yaos: Array(6).fill(null),
      question: '',
      date: todayStr(),
      hour: new Date().getHours(),
      method: 'coins',
      currentStep: 0,
      isFlipping: false,
      result: null,
      history: [],
      aiInterpretation: '',
      aiLoading: false,
      setQuestion: (q) => set({ question: q }),
      setDate: (d) => set({ date: d }),
      setHour: (h) => set({ hour: h }),
      setMethod: (m) => set({ method: m, yaos: Array(6).fill(null), currentStep: 0 }),
      addYao: (yin, changing) => set((state) => {
        const newYaos = [...state.yaos]
        newYaos[state.currentStep] = { index: state.currentStep, yin, changing }
        return { yaos: newYaos, currentStep: state.currentStep + 1 }
      }),
      setYao: (index, yin, changing) => set((state) => {
        const newYaos = [...state.yaos]
        newYaos[index] = { index, yin, changing }
        return { yaos: newYaos }
      }),
      setIsFlipping: (f) => set({ isFlipping: f }),
      setResult: (r) => set((state) => ({ 
        result: r, 
        history: r ? [r, ...state.history].slice(0, 20) : state.history,
        aiInterpretation: '',
        aiLoading: false
      })),
      // 进入起卦页时用：连占问事项与时日一并归零，日期取「此刻」而非模块加载之时
      reset: () => set({
        yaos: Array(6).fill(null),
        currentStep: 0,
        isFlipping: false,
        result: null,
        question: '',
        date: todayStr(),
        hour: new Date().getHours(),
        aiInterpretation: '',
        aiLoading: false,
      }),
      // 「重来」只重摇爻，所问何事、所占何时既已选定，不当代为抹去
      resetYaos: () => set({
        yaos: Array(6).fill(null),
        currentStep: 0,
        isFlipping: false,
        result: null,
        aiInterpretation: '',
        aiLoading: false,
      }),
      loadFromHistory: (d) => set({ result: d, aiInterpretation: '', aiLoading: false }),
      deleteHistory: (id) => set((state) => ({
        history: state.history.filter(h => h.id !== id)
      })),
      appendAiInterpretation: (token) => set((state) => ({ aiInterpretation: state.aiInterpretation + token })),
      setAiInterpretation: (text) => set({ aiInterpretation: text }),
      setAiLoading: (loading) => set({ aiLoading: loading }),
    }),
    {
      name: 'liuyao-storage',
      partialize: (state) => ({ history: state.history }),
      // 结构校验胜于版本号：不论旧版所存为何，缺字段者一概不收
      merge: (persisted, current) => {
        const raw = (persisted as { history?: unknown })?.history
        return { ...current, history: Array.isArray(raw) ? raw.filter(isRenderable) : [] }
      },
    }
  )
)
