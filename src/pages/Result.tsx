import { useNavigate } from 'react-router-dom'
import { ArrowLeft, RotateCcw, Share2, BookOpen, Sparkles, RefreshCw } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkCjkFriendly from 'remark-cjk-friendly'
import { useDivinationStore } from '../store/useDivinationStore'
import { getHexagramInterpretation } from '../utils/divination'
import { aiDivination } from '../utils/ai'

const YAO_LABELS = ['初', '二', '三', '四', '五', '上']

// 爻线：阳爻一整条，阴爻中断为两段。宽度由 wClass 决定，颜色由 color 决定
const HexLine = ({ yin, wClass, color }: { yin: boolean; wClass: string; color: string }) =>
  yin ? (
    <div className={`h-3 md:h-4 ${wClass} flex justify-between shrink-0`}>
      <div className={`w-[42%] h-full rounded shadow-md ${color}`} />
      <div className={`w-[42%] h-full rounded shadow-md ${color}`} />
    </div>
  ) : (
    <div className={`h-3 md:h-4 ${wClass} rounded shadow-md shrink-0 ${color}`} />
  )

// 爻题：初、上爻数字在后（初九、上六），二至五爻数字在前（九二、六五）
const yaoTitle = (pos: number, yin: boolean) => {
  const num = yin ? '六' : '九'
  return pos === 0 || pos === 5 ? `${YAO_LABELS[pos]}${num}` : `${num}${YAO_LABELS[pos]}`
}

// 旺衰配色：旺相有力用青碧，休囚死无力用淡墨
const wsColor = (ws?: string) => (ws === '旺' || ws === '相' ? 'text-jade' : 'text-ink-light/50')
// 爻情标记配色
const TAG_STYLE: Record<string, string> = {
  '月破': 'text-cinnabar bg-cinnabar/10',
  '日破': 'text-cinnabar bg-cinnabar/10',
  '反吟': 'text-cinnabar bg-cinnabar/10',
  '旬空': 'text-ocher bg-ocher/10',
  '暗动': 'text-jade bg-jade/10',
  '进神': 'text-jade bg-jade/10',
  '退神': 'text-ink-light bg-ink/5',
  '伏吟': 'text-indigo bg-indigo/10',
}
const tagStyle = (t: string) => TAG_STYLE[t] || 'text-ink-light bg-ink/5'
// 卦体关系配色：六冲朱红、六合青碧、反吟朱红、伏吟靛蓝
const relationStyle = (r?: string | null) =>
  r === '六合' ? 'text-jade bg-jade/10 border-jade/30' : 'text-cinnabar bg-cinnabar/10 border-cinnabar/30'

// AI 解读 markdown 渲染：古风配色与排版
const mdComponents: Components = {
  h1: ({ children }) => (
    <h1 className="text-xl md:text-2xl text-cinnabar tracking-widest mt-5 mb-3 pb-1.5 border-b border-cinnabar/20 first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-lg md:text-xl text-cinnabar tracking-wider mt-5 mb-2.5 flex items-center gap-2 first:mt-0">
      <span className="inline-block w-1 h-4 md:h-5 bg-cinnabar rounded-full" />{children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base md:text-lg text-ocher font-medium tracking-wide mt-4 mb-2 first:mt-0">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-base md:text-lg leading-loose text-ink my-2.5">{children}</p>
  ),
  strong: ({ children }) => <strong className="text-cinnabar font-semibold">{children}</strong>,
  em: ({ children }) => <em className="text-ocher not-italic font-medium">{children}</em>,
  ul: ({ children }) => <ul className="my-2.5 space-y-1.5 pl-1">{children}</ul>,
  ol: ({ children }) => <ol className="my-2.5 space-y-1.5 pl-5 list-decimal marker:text-cinnabar">{children}</ol>,
  li: ({ children }) => (
    <li className="text-base md:text-lg leading-relaxed text-ink marker:text-cinnabar">{children}</li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-3 pl-4 py-1 border-l-4 border-ocher/40 bg-ocher/5 rounded-r text-ink-light italic">{children}</blockquote>
  ),
  hr: () => <hr className="my-4 border-none h-px bg-gradient-to-r from-transparent via-cinnabar/25 to-transparent" />,
  pre: ({ children }) => (
    <pre className="my-3 p-3 rounded-lg bg-ink/90 text-paper text-sm overflow-x-auto">{children}</pre>
  ),
  code: ({ children }) => (
    <code className="px-1.5 py-0.5 rounded bg-paper-dark/60 text-indigo text-sm">{children}</code>
  ),
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noreferrer" className="text-indigo underline decoration-indigo/40 hover:decoration-indigo">{children}</a>
  ),
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto">
      <table className="w-full border-collapse text-sm md:text-base">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-cinnabar/8">{children}</thead>,
  th: ({ children }) => (
    <th className="border border-paper-dark px-3 py-1.5 text-cinnabar font-medium text-left">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border border-paper-dark/60 px-3 py-1.5 text-ink">{children}</td>
  ),
}

export default function Result() {
  const navigate = useNavigate()
  const { result, reset, aiInterpretation, aiLoading, appendAiInterpretation, setAiInterpretation, setAiLoading } = useDivinationStore()

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="bagua-decoration text-[200px] opacity-5 yin-yang-spin">☯</div>
        <div className="text-center relative z-10">
          <p className="text-ink-light mb-6 text-xl">暂无排盘结果</p>
          <button onClick={() => navigate('/')} className="seal-button-primary px-8 py-3 text-lg">
            返回起卦
          </button>
        </div>
      </div>
    )
  }

  const { original, changed, originalYao, changedYao, najia, changedNajia, fushen, originalRelation, changedRelation, yinTags, gongName, world, heju, guaShen, chongHe, question, date, dayGanZhi, monthJian, xunKong } = result
  const reversedYaos = originalYao.slice().reverse()
  const reversedNajia = najia.slice().reverse()
  const changingYaos = originalYao.map((y, i) => y.changing ? i : -1).filter(i => i >= 0)
  const interpretations = getHexagramInterpretation(original, changed, changingYaos)

  const yaoTypeName = (yin: boolean, changing: boolean) => {
    if (changing) return yin ? '老阴' : '老阳'
    return yin ? '少阴' : '少阳'
  }

  const methodName = result.method === 'coins' ? '铜钱摇卦' : result.method === 'manual' ? '手动起卦' : '天机起卦'

  const handleShare = () => {
    const summary = [
      '六爻排盘',
      `占问：${question || '（未填写）'}`,
      `${date}`,
      `得【${original.name}】${changed ? ` 之 【${changed.name}】` : '（六爻安静）'}`,
      `${original.judgment}`,
    ].join('\n')

    if (navigator.share) {
      navigator.share({
        title: `六爻排盘 - ${original.name}`,
        text: summary,
      }).catch(() => {})
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(summary)
        .then(() => alert('卦象已复制到剪贴板'))
        .catch(() => alert('复制失败，请手动截图保存'))
    } else {
      alert('当前环境不支持分享')
    }
  }

  const handleNew = () => {
    reset()
    navigate('/')
  }

  const handleAiDivination = async () => {
    setAiInterpretation('')
    setAiLoading(true)
    await aiDivination(result, question, {
      onToken: (token) => appendAiInterpretation(token),
      onDone: () => setAiLoading(false),
      onError: (err) => {
        setAiInterpretation(`解卦出错：${err}，请稍后重试`)
        setAiLoading(false)
      }
    })
  }

  return (
    <div className="min-h-screen py-4 md:py-8 px-3 md:px-4 relative">
      <div className="bagua-decoration top-20 left-2 md:left-5 text-5xl md:text-7xl opacity-10 yin-yang-spin">☯</div>
      <div className="bagua-decoration bottom-20 right-2 md:right-5 text-3xl md:text-5xl opacity-10">
        <div className="trigram-symbol">{original.symbol}</div>
      </div>

      <header className="max-w-5xl mx-auto mb-5 md:mb-8 relative z-50">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-1 md:gap-2 text-ink-light hover:text-ink transition-all hover:gap-2 md:hover:gap-3 text-sm md:text-lg"
          >
            <ArrowLeft size={18} className="md:w-[22px] md:h-[22px]" />
            返回起卦
          </button>
          <h1 className="text-2xl md:text-4xl text-ink tracking-[0.2em] md:tracking-[0.3em] text-shadow-glow glow-text">
            卦象详情
          </h1>
          <div className="flex gap-1">
            <button onClick={handleShare} className="p-2 md:p-3 hover:bg-paper-dark rounded-full transition-all hover:shadow-md" title="分享" aria-label="分享卦象">
              <Share2 size={18} className="md:w-[22px] md:h-[22px] text-ink-light" />
            </button>
            <button onClick={handleNew} className="p-2 md:p-3 hover:bg-paper-dark rounded-full transition-all hover:shadow-md" title="重新起卦" aria-label="重新起卦">
              <RotateCcw size={18} className="md:w-[22px] md:h-[22px] text-ink-light" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto relative z-10">
        <div className="paper-card p-4 md:p-8 mb-4 md:mb-6 animate-fade-in">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 text-center">
            <div className="p-3 md:p-4 rounded-lg bg-paper-dark/20">
              <div className="text-xs md:text-sm text-ink-light tracking-wide mb-1">◆ 占问事项</div>
              <div className="text-sm md:text-lg mt-1 text-ink">{question || '（未填写）'}</div>
            </div>
            <div className="p-3 md:p-4 rounded-lg bg-paper-dark/20">
              <div className="text-xs md:text-sm text-ink-light tracking-wide mb-1">◆ 月建</div>
              <div className="text-base md:text-xl mt-1 text-cinnabar font-bold">{monthJian}</div>
            </div>
            <div className="p-3 md:p-4 rounded-lg bg-paper-dark/20">
              <div className="text-xs md:text-sm text-ink-light tracking-wide mb-1">◆ 日辰</div>
              <div className="text-base md:text-xl mt-1 text-cinnabar font-bold">{dayGanZhi}日</div>
            </div>
            <div className="p-3 md:p-4 rounded-lg bg-paper-dark/20">
              <div className="text-xs md:text-sm text-ink-light tracking-wide mb-1">◆ 旬空</div>
              <div className="text-base md:text-xl mt-1 text-ocher font-bold">{xunKong}</div>
            </div>
          </div>
          <div className="mt-2 md:mt-4 text-center text-xs md:text-sm text-ink-light/70">
            {date} | {methodName}
          </div>
        </div>

        <div className="text-center mb-5 md:mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="divider-ornament">
            <span className="px-4 md:px-6 text-ink-light text-base md:text-lg tracking-widest">
              {original.name}{changed && <span className="mx-1 md:mx-2 text-ocher">之</span>}{changed && changed.name}
            </span>
          </div>
        </div>

        {/* 排盘：单一全宽卡片，本卦与变卦共用同一批行，保证横纵向严格对齐 */}
        <div className="paper-card p-4 md:p-8 mb-4 md:mb-6 animate-slide-up relative overflow-hidden">
          {/* 卦名头部：本卦 | 变卦 两列 */}
          <div className="grid grid-cols-2 gap-3 md:gap-8 mb-5 md:mb-8">
            <div className="text-center">
              <div className="text-sm md:text-base text-cinnabar tracking-widest mb-2 md:mb-3">本 卦</div>
              <div className="text-4xl md:text-6xl mb-1 md:mb-2 text-ink">{original.symbol}</div>
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                <span className="text-xl md:text-3xl text-ink glow-text">{original.name}</span>
                {originalRelation && (
                  <span className={`text-[10px] md:text-xs px-2 py-0.5 rounded-full border ${relationStyle(originalRelation)}`}>{originalRelation}</span>
                )}
              </div>
              <div className="text-ink-light mt-1.5 md:mt-2 text-xs md:text-base">
                <span className="trigram-symbol mr-1">{original.upperTrigram.symbol}</span>上{original.upperTrigram.name}
                <span className="mx-1.5 md:mx-2 text-ink">|</span>
                <span className="trigram-symbol mr-1">{original.lowerTrigram.symbol}</span>下{original.lowerTrigram.name}
              </div>
              <div className="text-ink-light/70 mt-0.5 text-[10px] md:text-xs">
                {original.upperTrigram.nature}{original.lowerTrigram.nature} | {original.upperTrigram.element}{original.lowerTrigram.element}
              </div>
              {(gongName || guaShen) && (
                <div className="mt-1 md:mt-1.5 text-[10px] md:text-xs text-indigo leading-relaxed">
                  {gongName && <span className="font-medium">{gongName} · {world}卦</span>}
                  {guaShen && (
                    <span className="ml-1.5 text-ink-light/70">
                      卦身 <span className="text-ocher">{guaShen.zhi}</span>
                      {guaShen.positions.length > 0
                        ? `（持${guaShen.positions.map(i => YAO_LABELS[i]).join('、')}爻）`
                        : '（不上卦）'}
                    </span>
                  )}
                </div>
              )}
              {heju && heju.length > 0 && (
                <div className="mt-1.5 flex flex-wrap justify-center gap-1">
                  {heju.map(h => (
                    <span key={h} className="text-[10px] md:text-xs px-2 py-0.5 rounded-full border text-jade bg-jade/10 border-jade/30">{h}</span>
                  ))}
                </div>
              )}
            </div>

            {changed ? (
              <div className="text-center">
                <div className="text-sm md:text-base text-ocher tracking-widest mb-2 md:mb-3">变 卦</div>
                <div className="text-4xl md:text-6xl mb-1 md:mb-2 text-ink">{changed.symbol}</div>
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  <span className="text-xl md:text-3xl text-ink glow-text">{changed.name}</span>
                  {changedRelation && (
                    <span className={`text-[10px] md:text-xs px-2 py-0.5 rounded-full border ${relationStyle(changedRelation)}`}>{changedRelation}</span>
                  )}
                  {yinTags && yinTags.map(t => (
                    <span key={t} className={`text-[10px] md:text-xs px-2 py-0.5 rounded-full border ${t.includes('反吟') ? 'text-cinnabar bg-cinnabar/10 border-cinnabar/30' : 'text-indigo bg-indigo/10 border-indigo/30'}`}>{t}</span>
                  ))}
                  {chongHe && (
                    <span className="text-[10px] md:text-xs px-2 py-0.5 rounded-full border text-ocher bg-ocher/10 border-ocher/30">{chongHe}</span>
                  )}
                </div>
                <div className="text-ink-light mt-1.5 md:mt-2 text-xs md:text-base">
                  <span className="trigram-symbol mr-1">{changed.upperTrigram.symbol}</span>上{changed.upperTrigram.name}
                  <span className="mx-1.5 md:mx-2 text-ink">|</span>
                  <span className="trigram-symbol mr-1">{changed.lowerTrigram.symbol}</span>下{changed.lowerTrigram.name}
                </div>
                <div className="text-ink-light/70 mt-0.5 text-[10px] md:text-xs">
                  {changed.upperTrigram.nature}{changed.lowerTrigram.nature} | {changed.upperTrigram.element}{changed.lowerTrigram.element}
                </div>
                <div className="mt-1.5 md:mt-2">
                  <span className="px-2 md:px-3 py-0.5 bg-cinnabar/10 text-cinnabar rounded-full text-[10px] md:text-xs">{changingYaos.length} 爻动</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="text-3xl md:text-5xl mb-2 md:mb-3 opacity-30">☯</div>
                <p className="text-ink-light text-sm md:text-lg">六爻安静，无变卦</p>
                <p className="text-[10px] md:text-xs text-ink-light/70 mt-1">以本卦卦辞断之</p>
              </div>
            )}
          </div>

          {/* 统一排盘表：一表六行，本卦与变卦同行对齐 */}
          <div className="overflow-x-auto">
            <div className="min-w-max mx-auto flex flex-col items-center">
              {/* 表头 */}
              <div className="flex items-center justify-center gap-1 md:gap-2.5 mb-2 md:mb-3 pb-2 border-b border-paper-dark/40 text-[9px] md:text-xs text-ink-light/70 tracking-wide">
                <div className="w-7 md:w-10 text-center">六神</div>
                <div className="w-11 md:w-16 text-right">六亲·纳甲</div>
                <div className="w-4 md:w-6 text-center">世应</div>
                <div className="w-14 md:w-32 text-center">本 卦</div>
                <div className="w-5 md:w-7 text-center">动</div>
                {changed && <div className="w-3.5 md:w-6" />}
                {changed && <div className="w-14 md:w-32 text-center">变 卦</div>}
                {changed && <div className="w-11 md:w-16 text-left">变六亲·纳甲</div>}
                <div className="w-9 md:w-12 text-left">爻题</div>
              </div>
              {/* 数据行：idx 0..5 对应 上爻..初爻 */}
              {reversedYaos.map((yao, idx) => {
                const pos = 5 - idx
                const info = reversedNajia[idx]
                const cYao = changed ? changedYao[pos] : null
                const cn = changedNajia?.[pos]
                const isChangedYao = originalYao[pos].changing
                return (
                  <div key={pos} className="flex items-center justify-center gap-1 md:gap-2.5 my-1.5 md:my-2.5 animate-yao-reveal" style={{ animationDelay: `${idx * 80}ms` }}>
                    {/* 六神 */}
                    <div className="w-7 md:w-10 text-center text-[10px] md:text-sm text-ocher leading-tight">{info.sixShen}</div>
                    {/* 本卦六亲·纳甲(+旺衰) */}
                    <div className="w-11 md:w-16 text-right leading-tight">
                      <div className="text-xs md:text-base text-cinnabar">{info.sixQin}</div>
                      <div className="text-[10px] md:text-xs text-indigo">
                        {info.naJia}
                        {info.wangShuai && <span className={`ml-0.5 ${wsColor(info.wangShuai)}`}>{info.wangShuai}</span>}
                      </div>
                    </div>
                    {/* 世应 */}
                    <div className="w-4 md:w-6 text-center text-sm md:text-lg font-bold leading-none">
                      {info.shi && <span className="text-cinnabar">世</span>}
                      {info.ying && <span className="text-indigo">应</span>}
                    </div>
                    {/* 本卦爻线 */}
                    <HexLine yin={yao.yin} wClass="w-14 md:w-32" color="bg-ink" />
                    {/* 动爻标记 */}
                    <div className="w-5 md:w-7 flex justify-center">
                      {yao.changing && (
                        <div className="w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-cinnabar bg-paper text-cinnabar text-xs md:text-sm flex items-center justify-center font-bold shadow-sm animate-pulse">
                          {yao.yin ? '×' : '○'}
                        </div>
                      )}
                    </div>
                    {/* 变卦部分 */}
                    {changed && (
                      <div className="w-3.5 md:w-6 text-center text-ocher text-xs md:text-base leading-none">
                        {isChangedYao ? '→' : ''}
                      </div>
                    )}
                    {changed && cYao && (
                      <HexLine yin={cYao.yin} wClass="w-14 md:w-32" color={isChangedYao ? 'bg-ocher shadow-ocher/40' : 'bg-ink/30'} />
                    )}
                    {changed && (
                      <div className="w-11 md:w-16 text-left leading-tight">
                        {isChangedYao && cn && (
                          <>
                            <div className="text-xs md:text-base text-ocher">{cn.sixQin}</div>
                            <div className="text-[10px] md:text-xs text-indigo">{cn.naJia}</div>
                          </>
                        )}
                      </div>
                    )}
                    {/* 爻题 */}
                    <div className="w-9 md:w-12 text-left text-[10px] md:text-sm text-ink-light leading-tight">{yaoTitle(pos, yao.yin)}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 伏神 */}
          {fushen && fushen.length > 0 && (
            <div className="mt-4 md:mt-5 pt-3 border-t border-paper-dark/40 w-full">
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-xs md:text-sm text-ocher tracking-widest font-medium">伏 神</span>
                <span className="text-[9px] md:text-[10px] text-ink-light/50">六亲不上卦，伏于本宫首卦之下</span>
              </div>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
                {fushen.map(f => (
                  <span key={f.position} className="inline-flex items-baseline gap-1">
                    <span className="text-sm md:text-base text-cinnabar font-medium">{f.sixQin}</span>
                    <span className="text-xs md:text-sm text-indigo">{f.naJia}</span>
                    <span className="text-[10px] md:text-xs text-ink-light/60">伏于{YAO_LABELS[f.position]}爻（{f.feiNajia}）之下</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 爻情 */}
          {najia.some(n => n.tags && n.tags.length > 0) && (
            <div className="mt-4 md:mt-5 pt-3 border-t border-paper-dark/40 w-full">
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-xs md:text-sm text-ocher tracking-widest font-medium">爻 情</span>
                <span className="text-[9px] md:text-[10px] text-ink-light/50">逐爻旺衰见上，下列其动态吉凶</span>
              </div>
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5">
                {najia.filter(n => n.tags && n.tags.length > 0).map(n => (
                  <span key={n.position} className="inline-flex items-center gap-1">
                    <span className="text-[10px] md:text-xs text-ink-light">{YAO_LABELS[n.position]}爻</span>
                    {n.tags!.map(t => (
                      <span key={t} className={`text-[10px] md:text-xs px-1.5 py-0.5 rounded ${tagStyle(t)}`}>{t}</span>
                    ))}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 图例 */}
          <div className="mt-4 md:mt-5 pt-3 border-t border-paper-dark/40 w-full flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] md:text-xs text-ink-light/70">
            <span><span className="text-cinnabar font-bold">世</span> 自身、求测者</span>
            <span><span className="text-indigo font-bold">应</span> 他人、所测之事</span>
            <span><span className="text-cinnabar font-bold">○</span> 老阳（动）</span>
            <span><span className="text-cinnabar font-bold">×</span> 老阴（动）</span>
            {changed && <span><span className="text-ocher font-bold">→</span> 变爻（回头六亲以本宫论）</span>}
            <span><span className="text-ocher font-bold">伏</span> 伏神</span>
            <span><span className="text-jade font-bold">旺相</span>·<span className="text-ink-light/50">休囚死</span> 爻之旺衰</span>
          </div>
        </div>

        <div className="paper-card p-4 md:p-8 mb-4 md:mb-6 animate-fade-in scroll-paper" style={{ animationDelay: '250ms' }}>
          <h3 className="text-xl md:text-2xl mb-4 md:mb-6 text-cinnabar flex items-center gap-2 md:gap-3 tracking-widest">
            <BookOpen size={22} className="md:w-[28px] md:h-[28px]" />
            卦 辞 经 典
          </h3>
          <div className="bg-paper-dark/20 rounded-xl p-5 md:p-8 mb-4 md:mb-6 relative">
            <div className="absolute -top-3 left-4 md:left-6 bg-paper px-2 md:px-3 text-cinnabar text-xs md:text-sm">本卦卦辞</div>
            <p className="judgment-text text-base md:text-lg text-ink leading-loose">{original.judgment}</p>
          </div>
          {changed && (
            <div className="bg-paper-dark/20 rounded-xl p-5 md:p-8 relative">
              <div className="absolute -top-3 left-4 md:left-6 bg-paper px-2 md:px-3 text-ocher text-xs md:text-sm">变卦卦辞</div>
              <p className="judgment-text text-base md:text-lg text-ink leading-loose">{changed.judgment}</p>
            </div>
          )}
        </div>

        <div className="paper-card p-4 md:p-8 mb-4 md:mb-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <h3 className="text-xl md:text-2xl mb-4 md:mb-6 text-cinnabar flex items-center gap-2 md:gap-3 tracking-widest">
            <Sparkles size={22} className="md:w-[28px] md:h-[28px]" />
            卦 象 解 析
          </h3>
          <div className="space-y-3 md:space-y-4">
            {interpretations.map((text, idx) => (
              <div 
                key={idx} 
                className="p-4 md:p-5 rounded-xl bg-gradient-to-r from-paper-dark/30 to-transparent border-l-4 border-cinnabar/30 hover:border-cinnabar transition-colors"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <p className="text-base md:text-lg leading-loose text-ink">{text}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 md:mt-6 text-center text-ink-light/60 text-xs md:text-sm italic">
            —— 易者，变也。卦象仅供参考，吉凶悔吝，皆由心生 ——
          </p>
        </div>

        <div className="paper-card p-4 md:p-8 mb-4 md:mb-6 animate-fade-in" style={{ animationDelay: '320ms' }}>
          <h3 className="text-xl md:text-2xl mb-4 md:mb-6 text-cinnabar flex items-center gap-2 md:gap-3 tracking-widest">
            <span className="w-1 h-6 md:h-8 bg-cinnabar rounded-full" />
            <Sparkles size={22} className="md:w-[28px] md:h-[28px]" />
            Claude 智 能 解 卦
          </h3>
          
          {!aiInterpretation && !aiLoading ? (
            <div className="text-center py-8 md:py-10">
              <div className="text-5xl md:text-6xl mb-4 opacity-30">☯</div>
              <p className="text-ink-light mb-6 text-lg md:text-xl">天机已显，请AI大师为您详解卦象吉凶</p>
              <button 
                onClick={handleAiDivination}
                className="seal-button-primary px-10 md:px-16 py-3 md:py-4 text-lg md:text-xl tracking-widest"
              >
                ✨ 请 大 师 解 卦
              </button>
            </div>
          ) : aiLoading ? (
            <div className="text-center py-10 md:py-12">
              <div className="relative w-16 h-16 mx-auto mb-5">
                <div className="absolute inset-0 text-5xl opacity-20 animate-pulse">☯</div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-cinnabar/30 border-t-cinnabar rounded-full animate-spin"></div>
                </div>
              </div>
              <p className="text-ink-light text-lg">Claude大师凝神静气，推演卦象中...</p>
              <p className="text-ink-light/60 text-sm mt-2">请稍候片刻</p>
            </div>
          ) : (
            <div>
              <div className="relative bg-gradient-to-br from-paper-dark/40 to-paper-dark/10 rounded-xl p-5 md:p-7 border border-cinnabar/10">
                <div className="absolute -top-3 left-6 bg-paper px-2 text-cinnabar text-sm tracking-widest">卦象解读</div>
                <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-cinnabar/40"></div>
                <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-cinnabar/40"></div>
                <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-cinnabar/40"></div>
                <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-cinnabar/40"></div>
                <div className="relative">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkCjkFriendly]} components={mdComponents}>
                    {aiInterpretation}
                  </ReactMarkdown>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button 
                  onClick={handleAiDivination}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg border border-paper-dark hover:bg-paper-dark/50 transition-colors text-sm"
                >
                  <RefreshCw size={16} />
                  重新解读
                </button>
              </div>
            </div>
          )}
          <p className="mt-5 md:mt-6 text-center text-ink-light/60 text-xs md:text-sm italic">
            —— AI解读仅供参考，易理无穷，心法为要 ——
          </p>
        </div>

        <div className="paper-card p-4 md:p-8 animate-fade-in" style={{ animationDelay: '350ms' }}>
          <h3 className="text-xl md:text-2xl mb-4 md:mb-6 text-cinnabar flex items-center gap-2 md:gap-3 tracking-widest">
            <span className="w-1 h-6 md:h-8 bg-cinnabar rounded-full" />
            爻 辞 详 解
          </h3>
          <div className="space-y-3 md:space-y-4">
            {original.lines.map((line, idx) => {
              const yao = originalYao[idx]
              const isChanging = yao.changing
              return (
                <div 
                  key={idx} 
                  className={`p-4 md:p-5 rounded-xl transition-all hover:shadow-md ${
                    isChanging 
                      ? 'bg-gradient-to-r from-cinnabar/10 to-transparent border-l-4 border-cinnabar' 
                      : 'bg-paper-dark/20 hover:bg-paper-dark/30'
                  }`}
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3 flex-wrap">
                    <span className="text-cinnabar font-bold text-base md:text-lg">
                      {yaoTitle(idx, yao.yin)}
                    </span>
                    <span className="text-[10px] md:text-xs px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-paper-dark text-ink-light">
                      {yaoTypeName(yao.yin, yao.changing)}
                    </span>
                    {isChanging && (
                      <span className="text-[10px] md:text-xs px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-cinnabar text-paper animate-pulse">
                        ★ 动爻
                      </span>
                    )}
                    {najia[idx].shi && (
                      <span className="text-[10px] md:text-xs px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-cinnabar/15 text-cinnabar">世爻</span>
                    )}
                    {najia[idx].ying && (
                      <span className="text-[10px] md:text-xs px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-indigo/15 text-indigo">应爻</span>
                    )}
                    <span className="text-[10px] md:text-xs text-ocher ml-auto">{najia[idx].sixShen} {najia[idx].naJia} {najia[idx].sixQin}</span>
                  </div>
                  <p className="text-ink leading-relaxed text-base md:text-lg">{line.text}</p>
                  {isChanging && changed && (
                    <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-paper-dark/50">
                      <p className="text-ocher">
                        <span className="mr-2 text-xs md:text-sm">变爻 →</span>
                        <span className="text-sm md:text-base">{changed.lines[idx].text}</span>
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-7 md:mt-10 text-center">
          <button onClick={handleNew} className="seal-button-primary px-8 md:px-12 py-3 md:py-4 text-lg md:text-xl">
            ✨ 重新起卦
          </button>
        </div>

        <footer className="mt-8 md:mt-12 text-center text-ink-light/50 text-xs md:text-sm">
          <p>六爻排盘 - 天机妙算</p>
          <p className="mt-1">积善之家必有余庆 积不善之家必有余殃</p>
        </footer>
      </main>
    </div>
  )
}
