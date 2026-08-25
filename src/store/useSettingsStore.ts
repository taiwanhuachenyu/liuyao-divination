import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AiConfig } from '../types'

export const EMPTY_AI_CONFIG: AiConfig = {
  baseUrl: '',
  apiKey: '',
  model: '',
}

interface SettingsState {
  aiConfig: AiConfig
  setAiConfig: (config: AiConfig) => void
  clearAiConfig: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      aiConfig: EMPTY_AI_CONFIG,
      setAiConfig: (config) => set({ aiConfig: config }),
      clearAiConfig: () => set({ aiConfig: EMPTY_AI_CONFIG }),
    }),
    { name: 'liuyao-ai-config' }
  )
)
