import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Divination, Yao } from '../types'

export type FontType = 'song' | 'kai' | 'li' | 'hei'

interface DivinationState {
  yaos: (Yao | null)[]
  question: string
  date: string
  method: 'coins' | 'manual' | 'time'
  currentStep: number
  isFlipping: boolean
  result: Divination | null
  history: Divination[]
  font: FontType
  setQuestion: (q: string) => void
  setDate: (d: string) => void
  setMethod: (m: 'coins' | 'manual' | 'time') => void
  addYao: (yin: boolean, changing: boolean) => void
  setYao: (index: number, yin: boolean, changing: boolean) => void
  setIsFlipping: (f: boolean) => void
  setResult: (r: Divination | null) => void
  reset: () => void
  setCurrentStep: (s: number) => void
  loadFromHistory: (d: Divination) => void
  deleteHistory: (id: string) => void
  setFont: (f: FontType) => void
}

const today = new Date().toISOString().split('T')[0]

export const useDivinationStore = create<DivinationState>()(
  persist(
    (set) => ({
      yaos: Array(6).fill(null),
      question: '',
      date: today,
      method: 'coins',
      currentStep: 0,
      isFlipping: false,
      result: null,
      history: [],
      font: 'kai',
      setQuestion: (q) => set({ question: q }),
      setDate: (d) => set({ date: d }),
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
        history: r ? [r, ...state.history].slice(0, 20) : state.history 
      })),
      reset: () => set({ yaos: Array(6).fill(null), currentStep: 0, result: null, question: '' }),
      setCurrentStep: (s) => set({ currentStep: s }),
      loadFromHistory: (d) => set({ result: d }),
      deleteHistory: (id) => set((state) => ({
        history: state.history.filter(h => h.id !== id)
      })),
      setFont: (f) => set({ font: f }),
    }),
    {
      name: 'liuyao-storage',
      partialize: (state) => ({ history: state.history, font: state.font }),
    }
  )
)
