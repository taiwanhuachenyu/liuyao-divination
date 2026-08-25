import { create } from 'zustand'

// AI 解读独立成 store，不与卦例同处：
// zustand 的 persist 对每一次 set 都无条件落盘，不问所改之片段是否在持久化范围之内。
// 解读逐 token 调 append，若与 history 同在一个持久化 store 里，
// 每个 token 都要把整份卦例重新序列化写入 localStorage，一篇解读即是数百次同步写盘。
interface AiState {
  interpretation: string
  loading: boolean
  append: (token: string) => void
  setInterpretation: (text: string) => void
  setLoading: (loading: boolean) => void
  resetAi: () => void
}

export const useAiStore = create<AiState>()((set) => ({
  interpretation: '',
  loading: false,
  append: (token) => set((state) => ({ interpretation: state.interpretation + token })),
  setInterpretation: (text) => set({ interpretation: text }),
  setLoading: (loading) => set({ loading }),
  resetAi: () => set({ interpretation: '', loading: false }),
}))
