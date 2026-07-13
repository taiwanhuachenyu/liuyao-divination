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

export function tossCoins(): { yin: boolean; changing: boolean } {
  const coins = [Math.random() > 0.5, Math.random() > 0.5, Math.random() > 0.5]
  const heads = coins.filter(c => c).length
  if (heads === 0) return { yin: false, changing: true }
  if (heads === 3) return { yin: true, changing: true }
  if (heads === 2) return { yin: false, changing: false }
  return { yin: true, changing: false }
}

function getHourZhi(hour: number): number {
  if (hour >= 23 || hour < 1) return 1
  if (hour >= 1 && hour < 3) return 2
  if (hour >= 3 && hour < 5) return 3
  if (hour >= 5 && hour < 7) return 4
  if (hour >= 7 && hour < 9) return 5
  if (hour >= 9 && hour < 11) return 6
  if (hour >= 11 && hour < 13) return 7
  if (hour >= 13 && hour < 15) return 8
  if (hour >= 15 && hour < 17) return 9
  if (hour >= 17 && hour < 19) return 10
  if (hour >= 19 && hour < 21) return 11
  return 12
}

function trigramIdToYaos(id: number): boolean[] {
  return TRIGRAM_YAO_MAP[id] || [false, false, false]
}

export function timeDivination(dateStr: string, hour?: number): Yao[] {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const h = hour ?? date.getHours()
  const hourZhi = getHourZhi(h)

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
    
    c = [...base]; c[0] = !c[0]; c[1] = !c[1]; c[2] = !c[2]; c[3] = !c[3]; c[4] = !c[4]; c[3] = !c[3]
    if (yaos.every((y, i) => y === c[i])) return { gongId: gong, shi: 3, ying: 0 }
    
    c = [...base]; c[0] = !c[0]; c[1] = !c[1]; c[2] = !c[2]
    if (yaos.every((y, i) => y === c[i])) return { gongId: gong, shi: 2, ying: 5 }
  }

  return { gongId: upperId, shi: 2, ying: 5 }
}

function calculateNajia(hexagram: Hexagram, _yaos: Yao[], dateGanIndex: number = 0): NajiaItem[] {
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
  
  for (let i = 0; i < 6; i++) {
    const isUpper = i >= 3
    const naJia = isUpper ? upperNajia[i] : lowerNajia[i]
    
    const gan = naJia?.[0] || ''
    const ganWuxing: Record<string, string> = {
      '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
      '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
    }
    const yaoElement = ganWuxing[gan] || '木'
    
    let sixQin = '兄弟'
    if (yaoElement === gongElement) sixQin = '兄弟'
    else if (wuxingSheng[gongElement] === yaoElement) sixQin = '子孙'
    else if (wuxingKe[gongElement] === yaoElement) sixQin = '妻财'
    else if (wuxingSheng[yaoElement] === gongElement) sixQin = '父母'
    else if (wuxingKe[yaoElement] === gongElement) sixQin = '官鬼'
    
    const sixShenIndex = (dateGanIndex + i) % 6
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
  
  const hexagramJudgments: Record<number, string> = {
    1: '乾卦象征天，刚健中正，自强不息。诸事亨通顺利，宜守正道，积极进取。',
    2: '坤卦象征地，厚德载物，柔顺包容。诸事顺利，宜守静待时，不宜急进。',
    3: '屯卦象征初生，艰难困苦，万物始生。创业维艰，宜坚守正道，循序渐进。',
    4: '蒙卦象征启蒙，蒙昧待启，教育开化。宜虚心求教，积累知识，不可妄动。',
    5: '需卦象征等待，需待时机，诚信光明。宜耐心等待，不可急躁冒进。',
    6: '讼卦象征争讼，争端诉讼，惕惧中正。宜和为贵，避免争执，慎言慎行。',
    7: '师卦象征兵众，兴师动众，正道容民。宜德服人，用兵谨慎，领导有方。',
    8: '比卦象征亲比，亲密比辅，吉祥无间。宜团结协作，择善而从，相亲相辅。',
    9: '小畜卦象征小有积蓄，蓄养待时，密云不雨。宜积蓄力量，不宜大举行动。',
    10: '履卦象征履行，小心行走，循礼而行。宜谨慎行事，不可莽撞，守礼则吉。',
    11: '泰卦象征通泰，天地交泰，吉祥亨通。诸事顺利，上下沟通，好运将至。',
    12: '否卦象征闭塞，天地不交，闭塞不通。诸事不顺，宜谨慎隐忍，待时而动。',
    13: '同人卦象征和同于人，会同团结，利涉大川。宜与人和睦，合作共事。',
    14: '大有卦象征大有所有，大有所得，盛大丰有。诸事顺遂，富而好礼，吉祥如意。',
    15: '谦卦象征谦虚，谦逊有德，君子有终。诸事吉利，虚怀若谷，无往不利。',
    16: '豫卦象征欢乐，欢愉喜乐，顺时而动。宜顺时而动，但不可逸乐过度。',
  }

  const baseInterpretation = hexagramJudgments[hexagram.id] || `${hexagram.name}：此卦象征${hexagram.upperTrigram.nature}${hexagram.lowerTrigram.nature}之象，宜审时度势，谨慎决断。`
  interpretations.push(`【本卦断曰】${baseInterpretation}`)

  if (changed) {
    const changedInterp = hexagramJudgments[changed.id] || `${changed.name}：变卦显示事物发展趋势，${changed.upperTrigram.nature}${changed.lowerTrigram.nature}，终局之象。`
    interpretations.push(`【变卦趋势】${changedInterp}`)
  }

  if (changingYaos.length === 1) {
    const yaoIdx = changingYaos[0]
    interpretations.push(`【动爻提示】${hexagram.lines[yaoIdx].text} 此为关键一爻，当仔细体察其中深意。`)
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
  const najia = calculateNajia(original, originalYao)
  
  return {
    id: Date.now().toString(),
    question,
    date,
    method,
    originalYao,
    changedYao: changed ? changedYaos : originalYao.map(y => ({ ...y, changing: false })),
    original,
    changed,
    najia,
    created: Date.now(),
  }
}
