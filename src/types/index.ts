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
  interpretation?: string
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

// 变卦纳甲与六亲（六亲以本卦之宫为准，用于回头生克）
export interface ChangedNajiaItem {
  position: number
  naJia: string
  sixQin: string
}

// 伏神：本卦六亲不全时，自本宫首卦补入，伏于同爻位飞神之下
export interface FushenItem {
  position: number
  sixQin: string
  naJia: string
  feiNajia: string // 所伏之飞神（本卦该爻纳甲）
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
  changedNajia?: ChangedNajiaItem[] | null
  fushen?: FushenItem[]
  dayGanZhi: string
  monthJian: string
  xunKong: string
  created: number
}
