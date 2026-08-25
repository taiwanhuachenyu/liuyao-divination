import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { StateStorage } from 'zustand/middleware'
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
    && isRenderableHexagram(r.original)
    // 六爻安静者本无变卦，故可空；既有则须完整，否则结果页取其上下卦时即崩
    && (r.changed == null || isRenderableHexagram(r.changed))
}

// 结果页与提示词都要取卦名、上下卦与六爻爻辞，缺一即渲染出 undefined 或直接抛错
function isRenderableHexagram(h: unknown): boolean {
  if (!h || typeof h !== 'object') return false
  const x = h as Record<string, unknown>
  return typeof x.name === 'string'
    && typeof x.judgment === 'string'
    && !!x.upperTrigram && !!x.lowerTrigram
    && Array.isArray(x.lines) && x.lines.length === 6
}

// persist 每次 set 都要序列化并写盘一次，纵使 history 分毫未动。
// 占问事项每敲一字即触发一次，故在此比对上次写入之串，内容未变则不动 localStorage
const dedupedStorage = (): StateStorage => {
  // 就地取用 localStorage：私隐模式等取不到时在此即抛，由 createJSONStorage 兜住而不启用持久化，
  // 与 zustand 默认行为一致
  const store = localStorage
  let lastWritten: string | null = null
  return {
    getItem: (name) => {
      lastWritten = store.getItem(name)
      return lastWritten
    },
    setItem: (name, value) => {
      if (value === lastWritten) return
      // 先写后记：配额写满而抛时不可留下「已写入」的假象，否则此后同值一概被跳过
      store.setItem(name, value)
      lastWritten = value
    },
    removeItem: (name) => {
      store.removeItem(name)
      lastWritten = null
    },
  }
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
      setQuestion: (q) => set({ question: q }),
      setDate: (d) => set({ date: d }),
      setHour: (h) => set({ hour: h }),
      // 换起卦方式即另起一卦，抛掷中的标志亦须一并归零，否则铜钱面板会卡在「抛掷中」
      setMethod: (m) => set({ method: m, yaos: Array(6).fill(null), currentStep: 0, isFlipping: false }),
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
      })),
      // 进入起卦页时用：连占问事项与时日一并归零，时日取「此刻」而非模块加载之时
      reset: () => set({
        yaos: Array(6).fill(null),
        currentStep: 0,
        isFlipping: false,
        result: null,
        question: '',
        date: todayStr(),
        hour: new Date().getHours(),
      }),
      // 「重来」只重摇爻，所问何事、所占何时既已选定，不当代为抹去
      resetYaos: () => set({
        yaos: Array(6).fill(null),
        currentStep: 0,
        isFlipping: false,
        result: null,
      }),
      loadFromHistory: (d) => set({ result: d }),
      deleteHistory: (id) => set((state) => ({
        history: state.history.filter(h => h.id !== id)
      })),
    }),
    {
      name: 'liuyao-storage',
      storage: createJSONStorage(dedupedStorage),
      partialize: (state) => ({ history: state.history }),
      // 结构校验胜于版本号：不论旧版所存为何，缺字段者一概不收
      merge: (persisted, current) => {
        const raw = (persisted as { history?: unknown })?.history
        return { ...current, history: Array.isArray(raw) ? raw.filter(isRenderable) : [] }
      },
    }
  )
)
