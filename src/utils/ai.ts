import { Divination } from '../types'

const API_ENDPOINT = 'https://apihub.agnes-ai.com/v1/chat/completions'
const MODEL = 'agnes-2.0-flash'
const API_KEY = atob('c2stVXNsYTQ5MHh4UFJ0d1J3elhvSFVoeE9wY0pkd09RbktEaXk5NHQxQlVFMDRIMmo2')

const METHOD_NAMES: Record<Divination['method'], string> = {
  coins: '铜钱摇卦',
  manual: '手动起卦',
  time: '天机起卦（梅花易数时间起卦）',
}

function buildPrompt(divination: Divination, question: string): string {
  const { original, changed, originalYao, method, najia, dayGanZhi, monthJian, xunKong } = divination
  const changingYaos = originalYao.map((y, i: number) => y.changing ? i : -1).filter(i => i >= 0)
  const changingDesc = changingYaos.length === 0 
    ? '六爻安静，无动爻'
    : `第${changingYaos.map(i => ['初','二','三','四','五','上'][i]).join('、')}爻动`
  
  const linesDesc = original.lines.map((line, idx: number) => {
    const yao = originalYao[idx]
    const type = yao.yin ? (yao.changing ? '老阴×' : '少阴--') : (yao.changing ? '老阳○' : '少阳—')
    const item = najia[idx]
    return `${['初','二','三','四','五','上'][idx]}爻 ${type} ${item.sixShen}${item.naJia}${item.sixQin} ${item.shi ? '世' : ''}${item.ying ? '应' : ''} ${line.text}`
  }).join('\n')

  return `你是一位精通周易六爻纳甲筮法的命理师，严格遵循京房纳甲古法断卦，请根据以下完整卦象信息进行详细解卦：

【重要断卦依据】
月建：${monthJian}
日辰：${dayGanZhi}日
旬空：${xunKong}
占问事项：${question || '（未填）'}
起卦方式：${METHOD_NAMES[method] ?? method}

本卦：${original.name}${original.symbol}，${original.upperTrigram.name}上${original.lowerTrigram.name}下
${original.judgment}
${changed ? `变卦：${changed.name}${changed.symbol}，${changed.upperTrigram.name}上${changed.lowerTrigram.name}下
${changed.judgment}` : '无变卦'}
动爻：${changingDesc}

纳甲六爻排盘（从初爻到上爻）：
${linesDesc}

断卦要求：
1. 先看月建日辰对各爻的生克旺衰，判断用神旺相休囚
2. 看旬空，用神空亡则待时出空
3. 看世应关系，世为自己，应为他人/事
4. 看动爻变化，动必有因，变卦为发展趋势
5. 结合六亲类象：父母主文书/长辈，官鬼主功名/疾病，妻财主财利/妻室，子孙主福德/晚辈，兄弟主竞争/破财
6. 语言古典文雅但通俗易懂，给出明确吉凶判断和实际建议，500字左右
7. 不要空泛套话，要紧扣卦象和占问事项具体分析：`
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
            content: '你是周易六爻解卦大师，精通京房纳甲、梅花易数，解卦准确有理有据，语言文雅通顺，符合传统易学逻辑。'
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
