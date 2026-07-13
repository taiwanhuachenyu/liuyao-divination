import { Divination } from '../types'

const API_ENDPOINT = 'https://apihub.agnes-ai.com/v1/chat/completions'
const MODEL = 'agnes-2.0-flash'

function decryptKey(pwd: string): string | null {
  if (pwd === 'yike') {
    const encoded = 'c2stVXNsYTQ5MHhhUFJ0d1J3elhvSFVoeE9wY0pkd09RbktEaXk5NHQxQlVlMDRIMmo2'
    return atob(encoded)
  }
  return pwd
}

function buildPrompt(divination: Divination, question: string): string {
  const { original, changed, originalYao, method, najia } = divination
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

  return `你是一位精通周易六爻纳甲筮法的命理师，请根据以下卦象进行解卦，给出详细、中肯、通俗易懂的解读，既要符合传统周易理论，又要给出实际建议，语言风格古典文雅但通顺易懂，300-500字左右：

占问事项：${question || '（未填）'}
起卦方式：${method}
本卦：${original.name}${original.symbol}，${original.upperTrigram.name}上${original.lowerTrigram.name}下，${original.judgment}
${changed ? `变卦：${changed.name}${changed.symbol}，${changed.upperTrigram.name}上${changed.lowerTrigram.name}下，${changed.judgment}` : '无变卦'}
动爻：${changingDesc}

纳甲六爻排盘：
${linesDesc}

请综合卦象、爻辞、世应、六亲、动变情况，结合占问事项，解读吉凶趋势、事态发展，并给出建议：`
}

export interface StreamCallbacks {
  onToken: (token: string) => void
  onDone: () => void
  onError: (error: string) => void
}

export async function aiDivination(
  apiKey: string,
  divination: Divination,
  question: string,
  callbacks: StreamCallbacks
): Promise<void> {
  const key = decryptKey(apiKey.trim())
  if (!key) {
    callbacks.onError('请输入密钥，输入"yike"可使用内置密钥')
    return
  }

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
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
