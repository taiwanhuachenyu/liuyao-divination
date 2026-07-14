import { Divination } from '../types'

const API_ENDPOINT = 'https://apihub.agnes-ai.com/v1/chat/completions'
const MODEL = 'agnes-2.0-flash'
const API_KEY = atob('c2stVXNsYTQ5MHh4UFJ0d1J3elhvSFVoeE9wY0pkd09RbktEaXk5NHQxQlVFMDRIMmo2')

const METHOD_NAMES: Record<Divination['method'], string> = {
  coins: '铜钱摇卦',
  manual: '手动起卦',
  time: '天机起卦（梅花易数时间起卦）',
}

const POS = ['初', '二', '三', '四', '五', '上']

function buildPrompt(divination: Divination, question: string): string {
  const { original, changed, originalYao, method, najia, changedNajia, fushen, originalRelation, changedRelation, yinTags, dayGanZhi, monthJian, xunKong } = divination
  const changingYaos = originalYao.map((y, i: number) => y.changing ? i : -1).filter(i => i >= 0)
  const changingDesc = changingYaos.length === 0
    ? '六爻安静，无动爻（以本卦卦爻辞及用神旺衰断之）'
    : `第${changingYaos.map(i => POS[i]).join('、')}爻发动`

  const linesDesc = original.lines.map((line, idx: number) => {
    const yao = originalYao[idx]
    const type = yao.yin ? (yao.changing ? '老阴×(动)' : '少阴--') : (yao.changing ? '老阳○(动)' : '少阳—')
    const item = najia[idx]
    const mark = `${item.shi ? '〔世〕' : ''}${item.ying ? '〔应〕' : ''}`
    const ws = item.wangShuai ? `[${item.wangShuai}]` : ''
    const tags = item.tags && item.tags.length ? `〔${item.tags.join('、')}〕` : ''
    let head = `${POS[idx]}爻 ${item.sixShen} ${item.naJia} ${item.sixQin} ${type}${ws}${mark ? ' ' + mark : ''}${tags}`
    const cn = yao.changing ? changedNajia?.[idx] : undefined
    if (cn) {
      head += ` → 变出 ${cn.sixQin}${cn.naJia}`
    }
    return `${head}  ${line.text}`
  }).join('\n')

  const fushenDesc = fushen && fushen.length > 0
    ? fushen.map(f => `${f.sixQin}${f.naJia}（伏于${POS[f.position]}爻飞神${f.feiNajia}之下）`).join('；')
    : '六亲俱全，无伏神'

  const relDesc = [
    originalRelation ? `本卦系${originalRelation}卦` : '',
    changedRelation ? `变卦系${changedRelation}卦` : '',
    ...(yinTags || []),
  ].filter(Boolean).join('；') || '卦体无六冲六合、反吟伏吟之特殊象'

  return `你是一位精通周易六爻纳甲筮法的国手，宗京房纳甲、法《卜筮正宗》《增删卜易》《黄金策》之古法，断卦严谨、引理有据。请依下列完整卦象详为剖断：

【占问事项】${question || '（未明言，请就卦象总体气数而论）'}
【起卦方式】${METHOD_NAMES[method] ?? method}

【时令纲纪】
月建：${monthJian}（司权，为提纲，主一月之旺衰）
日辰：${dayGanZhi}日（主宰，能生克冲合卦爻，最为有力）
旬空：${xunKong}（值旬空之爻为空亡，待冲空、填实之期而应）

【卦体】
本卦：${original.name}，${original.upperTrigram.name}上${original.lowerTrigram.name}下（${original.judgment}）
${changed ? `变卦：${changed.name}，${changed.upperTrigram.name}上${changed.lowerTrigram.name}下（${changed.judgment}）` : '本卦无变（六爻安静）'}
发动：${changingDesc}
卦象：${relDesc}（六冲主速动散、六合主缓聚成；伏吟主呻吟难进，反吟主反复不安）

【纳甲装卦（初爻至上爻；[旺相休囚死]为月令旺衰，〔…〕为月破/旬空/暗动/日破/进退神/伏吟反吟等爻情，动爻另标其变出）】
${linesDesc}

【伏神】${fushenDesc}

请依古法层层剖断，分条陈述：
一、定用神：按所占之事择用神（求财问利取妻财，功名官讼疾病取官鬼，文书房宅尊长取父母，子女平安医药取子孙，手足朋辈竞争取兄弟）。用神不上卦者，察其伏神能否得飞神引拔、临日月而出伏。
二、审旺衰：以月建为提纲、日辰为主宰，参年时，定用神、原神（生用神者）、忌神（克用神者）之旺相休囚死；旺相则吉，休囚受制则凶。
三、察空破动变：用神逢旬空、月破则力弱待时；旺静之爻逢日冲为暗动（暗中有力），衰静之爻逢日冲为日破（力散）；动爻生克冲合用神，变爻回头生扶为吉、回头克害为凶，动化进神则递进有力、退神则渐退，化空化破亦须留意。
四、参卦象：六冲主速、主动、主散（事多不久或难成），六合主缓、主聚、主成；卦逢伏吟则事滞难进、多呻吟忧疑，逢反吟则反复无常、去而复来。
五、看世应飞伏：世为求测者本身，应为对方或所测之事；用神伏藏者，辨飞伏生克（飞生伏为得长生可出、伏克飞为出暴、飞克伏为伤身难出），伏神临日月或值旬空冲实之期可出伏。
六、断吉凶应期：综上明断吉凶成败，并以生旺墓绝、冲合、填实出空等定其应期（何月何日）。
七、结合卦爻辞与六亲类象，紧扣所占之事，给出切实可行的趋避建议。

要求：说理有据、层次分明，先总断吉凶再分述缘由，语言文雅而通俗，切忌空泛套话与模棱两可，约600字。`
}

export interface StreamCallbacks {
  onToken: (token: string) => void
  onDone: () => void
  onError: (error: string) => void
}

export async function aiDivination(
  divination: Divination,
  question: string,
  callbacks: StreamCallbacks
): Promise<void> {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: '你是周易六爻解卦国手，宗京房纳甲之学，深谙《卜筮正宗》《增删卜易》《黄金策》诸经，以用神为纲，参月建日辰之旺衰、动变飞伏之生克、空破墓绝之应期，断卦严谨、引理有据、切中肯綮。行文文雅通达，不作空泛套话，不模棱两可。'
          },
          {
            role: 'user',
            content: buildPrompt(divination, question)
          }
        ],
        temperature: 0.8,
        max_tokens: 2048,
        stream: true,
      }),
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      throw new Error(errData.error?.message || `请求失败，状态码 ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('无法读取响应流')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data:')) continue
        const data = trimmed.slice(5).trim()
        if (data === '[DONE]') {
          callbacks.onDone()
          return
        }

        try {
          const parsed = JSON.parse(data)
          const content = parsed.choices?.[0]?.delta?.content
          if (content) {
            callbacks.onToken(content)
          }
        } catch {
          // ignore parse errors for incomplete chunks
        }
      }
    }

    callbacks.onDone()
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '请求出错，请检查密钥和网络'
    callbacks.onError(message)
  }
}
