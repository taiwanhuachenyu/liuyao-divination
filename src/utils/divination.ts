import { Yao, Hexagram, NajiaItem, Divination } from '../types'
import { getTrigramFromYaos, TRIGRAM_YAO_MAP, TRIGRAMS } from '../data/trigrams'
import { HEXAGRAMS } from '../data/hexagrams'

const SIX_SHEN = ['青龙', '朱雀', '勾陈', '螣蛇', '白虎', '玄武']
const NAJIA_GANZHI: Record<string, string[]> = {
  '乾': ['甲子', '甲寅', '甲辰', '壬午', '壬申', '壬戌'],
  '坤': ['乙未', '乙巳', '乙卯', '癸丑', '癸亥', '癸酉'],
  '震': ['庚子', '庚寅', '庚辰', '庚午', '庚申', '庚戌'],
  '巽': ['辛丑', '辛亥', '辛酉', '辛未', '辛巳', '辛卯'],
  '坎': ['戊寅', '戊辰', '戊午', '戊申', '戊戌', '戊子'],
  '离': ['己卯', '己丑', '己亥', '己酉', '己未', '己巳'],
  '艮': ['丙辰', '丙午', '丙申', '丙戌', '丙子', '丙寅'],
  '兑': ['丁巳', '丁卯', '丁丑', '丁亥', '丁酉', '丁未'],
}

const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

const XUN_KONG: [number, number][] = [
  [9, 10], [10, 11], [11, 0], [0, 1], [1, 2], [2, 3],
  [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9]
]

export function tossCoins(): { yin: boolean; changing: boolean } {
  const coins = [Math.random() > 0.5, Math.random() > 0.5, Math.random() > 0.5]
  const heads = coins.filter(c => c).length
  if (heads === 0) return { yin: false, changing: true }
  if (heads === 3) return { yin: true, changing: true }
  if (heads === 1) return { yin: false, changing: false }
  return { yin: true, changing: false }
}

function getHourZhi(hour: number): number {
  if (hour >= 23 || hour < 1) return 0
  if (hour >= 1 && hour < 3) return 1
  if (hour >= 3 && hour < 5) return 2
  if (hour >= 5 && hour < 7) return 3
  if (hour >= 7 && hour < 9) return 4
  if (hour >= 9 && hour < 11) return 5
  if (hour >= 11 && hour < 13) return 6
  if (hour >= 13 && hour < 15) return 7
  if (hour >= 15 && hour < 17) return 8
  if (hour >= 17 && hour < 19) return 9
  if (hour >= 19 && hour < 21) return 10
  return 11
}

function getSolarTerms(year: number): { name: string; index: number }[] {
  const termNames = ['小寒', '大寒', '立春', '雨水', '惊蛰', '春分', '清明', '谷雨', '立夏', '小满', '芒种', '夏至', '小暑', '大暑', '立秋', '处暑', '白露', '秋分', '寒露', '霜降', '立冬', '小雪', '大雪', '冬至']
  const baseDate = new Date(1900, 0, 6, 2, 5)
  const terms: { name: string; index: number }[] = []
  let y = 1900
  while (y <= year + 1) {
    for (let i = 0; i < 24; i++) {
      const offset = (y - 1900) * 365.2422 * 24 * 60 + i * 15.22 * 24 * 60
      const termDate = new Date(baseDate.getTime() + offset * 60 * 1000)
      if (termDate.getFullYear() === year) {
        terms.push({ name: termNames[i], index: i })
      }
    }
    y++
  }
  return terms.sort((a, b) => a.index - b.index)
}

function getGanZhi(date: Date): { yearGan: number; yearZhi: number; monthGan: number; monthZhi: number; dayGan: number; dayZhi: number } {
  const baseDate = new Date(1900, 0, 1)
  const baseDayGan = 0
  const baseDayZhi = 0
  const daysDiff = Math.floor((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24))
  let dayGan = (baseDayGan + daysDiff) % 10
  let dayZhi = (baseDayZhi + daysDiff) % 12
  if (dayGan < 0) dayGan += 10
  if (dayZhi < 0) dayZhi += 12

  const year = date.getFullYear()
  let yearGan = (year - 4) % 10
  let yearZhi = (year - 4) % 12
  if (yearGan < 0) yearGan += 10
  if (yearZhi < 0) yearZhi += 12

  const terms = getSolarTerms(year)
  let monthZhi = 1
  for (let i = 0; i < terms.length; i++) {
    if (terms[i].index >= 2 && terms[i].index <= 23) {
      const termDate = new Date(year, Math.floor(terms[i].index / 2), 4 + Math.floor(terms[i].index % 2) * 15)
      if (date < termDate) break
      monthZhi = (Math.floor((terms[i].index - 2) / 2) + 2) % 12
    }
  }

  let monthGan = ((yearGan % 5) * 2 + 2 + monthZhi - 2) % 10

  return { yearGan, yearZhi, monthGan, monthZhi, dayGan, dayZhi }
}

function getXunKong(dayGan: number, dayZhi: number): [number, number] {
  const diff = (dayZhi - dayGan + 12) % 12
  const xun = Math.floor(diff / 2)
  return XUN_KONG[xun]
}

function trigramIdToYaos(id: number): boolean[] {
  return TRIGRAM_YAO_MAP[id] || [false, false, false]
}

export function timeDivination(dateStr: string, hour?: number): Yao[] {
  const now = new Date()
  const date = new Date(dateStr + 'T' + String(hour ?? now.getHours()).padStart(2, '0') + ':00:00')
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const h = hour ?? date.getHours()
  const hourZhi = getHourZhi(h) + 1

  const yearNum = ((year - 4) % 12) + 1
  const sum = yearNum + month + day
  const upperNum = sum % 8
  const lowerNum = (sum + hourZhi) % 8
  const changingYao = (sum + hourZhi) % 6
  
  const upperTrigramId = upperNum === 0 ? 8 : upperNum
  const lowerTrigramId = lowerNum === 0 ? 8 : lowerNum
  const changingIdx = changingYao === 0 ? 5 : changingYao - 1

  const upperYaos = trigramIdToYaos(upperTrigramId)
  const lowerYaos = trigramIdToYaos(lowerTrigramId)
  
  const yaos: Yao[] = []
  for (let i = 0; i < 3; i++) {
    yaos.push({ index: i, yin: lowerYaos[i], changing: i === changingIdx })
  }
  for (let i = 0; i < 3; i++) {
    yaos.push({ index: i + 3, yin: upperYaos[i], changing: i + 3 === changingIdx })
  }

  return yaos
}

export function getHexagramFromYaos(yaos: boolean[]): Hexagram {
  const lowerYaos = [yaos[0], yaos[1], yaos[2]]
  const upperYaos = [yaos[3], yaos[4], yaos[5]]
  const lowerTrigram = getTrigramFromYaos(lowerYaos)
  const upperTrigram = getTrigramFromYaos(upperYaos)
  
  const hexagram = HEXAGRAMS.find(h => 
    h.upperTrigram.id === upperTrigram.id && 
    h.lowerTrigram.id === lowerTrigram.id
  )
  
  if (hexagram) return hexagram
  
  return HEXAGRAMS[0]
}

export function getChangedHexagram(originalYaos: Yao[]): { hexagram: Hexagram | null; changedYaos: Yao[] } {
  const changedYaos = originalYaos.map(yao => ({
    ...yao,
    yin: yao.changing ? !yao.yin : yao.yin,
    changing: false,
  }))
  
  const hasChanging = originalYaos.some(y => y.changing)
  if (!hasChanging) return { hexagram: null, changedYaos }
  
  const yaoBools = changedYaos.map(y => y.yin)
  return { hexagram: getHexagramFromYaos(yaoBools), changedYaos }
}

function getGongAndShiYing(upperId: number, lowerId: number): { gongId: number; shi: number; ying: number } {
  const yaos = [
    ...trigramIdToYaos(lowerId),
    ...trigramIdToYaos(upperId)
  ]
  
  for (let gong = 1; gong <= 8; gong++) {
    const base = [...trigramIdToYaos(gong), ...trigramIdToYaos(gong)]
    
    if (yaos.every((y, i) => y === base[i])) return { gongId: gong, shi: 5, ying: 2 }
    
    let c = [...base]; c[0] = !c[0]
    if (yaos.every((y, i) => y === c[i])) return { gongId: gong, shi: 0, ying: 3 }
    
    c = [...base]; c[0] = !c[0]; c[1] = !c[1]
    if (yaos.every((y, i) => y === c[i])) return { gongId: gong, shi: 1, ying: 4 }
    
    c = [...base]; c[0] = !c[0]; c[1] = !c[1]; c[2] = !c[2]
    if (yaos.every((y, i) => y === c[i])) return { gongId: gong, shi: 2, ying: 5 }
    
    c = [...base]; c[0] = !c[0]; c[1] = !c[1]; c[2] = !c[2]; c[3] = !c[3]
    if (yaos.every((y, i) => y === c[i])) return { gongId: gong, shi: 3, ying: 0 }
    
    c = [...base]; c[0] = !c[0]; c[1] = !c[1]; c[2] = !c[2]; c[3] = !c[3]; c[4] = !c[4]
    if (yaos.every((y, i) => y === c[i])) return { gongId: gong, shi: 4, ying: 1 }
    
    // 游魂卦：初、二、三、五爻变（相对本宫），世四应初
    c = [...base]; c[0] = !c[0]; c[1] = !c[1]; c[2] = !c[2]; c[4] = !c[4]
    if (yaos.every((y, i) => y === c[i])) return { gongId: gong, shi: 3, ying: 0 }

    // 归魂卦：仅五爻变（相对本宫），世三应六
    c = [...base]; c[4] = !c[4]
    if (yaos.every((y, i) => y === c[i])) return { gongId: gong, shi: 2, ying: 5 }
  }

  return { gongId: upperId, shi: 2, ying: 5 }
}

function calculateNajia(hexagram: Hexagram, _yaos: Yao[], dayGan: number): NajiaItem[] {
  const najia: NajiaItem[] = []
  const { gongId, shi, ying } = getGongAndShiYing(hexagram.upperTrigram.id, hexagram.lowerTrigram.id)
  const gongTrigram = TRIGRAMS[gongId - 1]
  
  const upperNajia = NAJIA_GANZHI[hexagram.upperTrigram.name] || []
  const lowerNajia = NAJIA_GANZHI[hexagram.lowerTrigram.name] || []
  
  const gongElement = gongTrigram.element
  const wuxingSheng: Record<string, string> = {
    '金': '水', '水': '木', '木': '火', '火': '土', '土': '金'
  }
  const wuxingKe: Record<string, string> = {
    '金': '木', '木': '土', '土': '水', '水': '火', '火': '金'
  }
  
  const sixShenStartMap = [0, 0, 1, 1, 2, 3, 4, 4, 5, 5]
  const sixShenStart = sixShenStartMap[dayGan]

  for (let i = 0; i < 6; i++) {
    const isUpper = i >= 3
    const naJia = isUpper ? upperNajia[i] : lowerNajia[i]
    
    const zhi = naJia?.slice(1) || ''
    const zhiWuxing: Record<string, string> = {
      '子': '水', '丑': '土', '寅': '木', '卯': '木',
      '辰': '土', '巳': '火', '午': '火', '未': '土',
      '申': '金', '酉': '金', '戌': '土', '亥': '水',
    }
    const yaoElement = zhiWuxing[zhi] || '木'
    
    let sixQin = '兄弟'
    if (yaoElement === gongElement) sixQin = '兄弟'
    else if (wuxingSheng[gongElement] === yaoElement) sixQin = '子孙'
    else if (wuxingKe[gongElement] === yaoElement) sixQin = '妻财'
    else if (wuxingSheng[yaoElement] === gongElement) sixQin = '父母'
    else if (wuxingKe[yaoElement] === gongElement) sixQin = '官鬼'
    
    const sixShenIndex = (sixShenStart + i) % 6
    najia.push({
      position: i,
      sixQin,
      sixShen: SIX_SHEN[sixShenIndex],
      naJia,
      shi: i === shi,
      ying: i === ying,
    })
  }
  
  return najia
}

export function getHexagramInterpretation(hexagram: Hexagram, changed: Hexagram | null, changingYaos: number[]): string[] {
  const interpretations: string[] = []

  const baseInterpretation = hexagram.judgment
  interpretations.push(`【本卦断曰】${baseInterpretation}`)

  if (changed) {
    interpretations.push(`【变卦趋势】${changed.judgment}`)
  }

  if (changingYaos.length === 1) {
    const yaoIdx = changingYaos[0]
    interpretations.push(`【动爻提示】${hexagram.lines[yaoIdx].text}`)
  } else if (changingYaos.length > 1) {
    interpretations.push(`【多爻发动】共有${changingYaos.length}爻动，事情复杂多变，宜以本卦卦辞为主，变卦为辅，综合判断。`)
  } else {
    interpretations.push(`【静卦提示】六爻安静，事情相对稳定，宜以本卦卦辞为主要参考。`)
  }

  interpretations.push('【总断】心诚则灵，卦不妄成。以上仅供参考，谋事在人，成事在天，积德行善，自然逢凶化吉。')

  return interpretations
}

export function createDivination(
  originalYao: Yao[],
  question: string,
  date: string,
  method: 'coins' | 'manual' | 'time'
): Divination {
  const yaoBools = originalYao.map(y => y.yin)
  const original = getHexagramFromYaos(yaoBools)
  const { hexagram: changed, changedYaos } = getChangedHexagram(originalYao)
  
  const now = new Date()
  const ganZhi = getGanZhi(now)
  const najia = calculateNajia(original, originalYao, ganZhi.dayGan)
  
  const dayGanZhi = TIAN_GAN[ganZhi.dayGan] + DI_ZHI[ganZhi.dayZhi]
  const monthJian = DI_ZHI[ganZhi.monthZhi] + '月'
  const xunKong = getXunKong(ganZhi.dayGan, ganZhi.dayZhi)
  const xunKongStr = DI_ZHI[xunKong[0]] + DI_ZHI[xunKong[1]] + '空'

  return {
    id: crypto.randomUUID(),
    question,
    date: `${date} ${dayGanZhi}日 ${monthJian} ${xunKongStr}`,
    method,
    originalYao,
    changedYao: changed ? changedYaos : originalYao.map(y => ({ ...y, changing: false })),
    original,
    changed,
    najia,
    dayGanZhi,
    monthJian,
    xunKong: xunKongStr,
    created: Date.now(),
  }
}
