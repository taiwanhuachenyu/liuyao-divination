export interface Yao {
  index: number
  yin: boolean
  changing: boolean
}

export interface Trigram {
  id: number
  name: string
  symbol: string
  element: string
  nature: string
}

export interface LineText {
  position: number
  text: string
}

export interface Hexagram {
  id: number
  name: string
  symbol: string
  upperTrigram: Trigram
  lowerTrigram: Trigram
  judgment: string
  lines: LineText[]
  tuan?: string
  xiang?: string
}

export interface NajiaItem {
  position: number
  sixQin: string
  sixShen: string
  naJia: string
  shi: boolean
  ying: boolean
}

export interface Divination {
  id: string
  question: string
  date: string
  method: 'coins' | 'manual' | 'time'
  originalYao: Yao[]
  changedYao: Yao[]
  original: Hexagram
  changed: Hexagram | null
  najia: NajiaItem[]
  created: number
}
