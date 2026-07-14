import { useNavigate } from 'react-router-dom'
import { ArrowLeft, RotateCcw, Share2, BookOpen, Sparkles, RefreshCw } from 'lucide-react'
import { useDivinationStore } from '../store/useDivinationStore'
import { getHexagramInterpretation } from '../utils/divination'
import { aiDivination } from '../utils/ai'

const YAO_LABELS = ['初', '二', '三', '四', '五', '上']

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

  const { original, changed, originalYao, changedYao, najia, changedNajia, fushen, originalRelation, changedRelation, yinTags, question, date, dayGanZhi, monthJian, xunKong } = result
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
            <button onClick={handleShare} className="p-2 md:p-3 hover:bg-paper-dark rounded-full transition-all hover:shadow-md" title="分享">
              <Share2 size={18} className="md:w-[22px] md:h-[22px] text-ink-light" />
            </button>
            <button onClick={handleNew} className="p-2 md:p-3 hover:bg-paper-dark rounded-full transition-all hover:shadow-md" title="重新起卦">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
          <div className="paper-card p-4 md:p-8 animate-slide-up relative overflow-hidden">
            <div className="absolute top-0 right-0 text-5xl md:text-8xl opacity-5">{original.symbol}</div>
            <h3 className="text-xl md:text-2xl text-center mb-4 md:mb-6 text-cinnabar tracking-widest">本 卦</h3>
            <div className="text-center mb-5 md:mb-8">
              <div className="text-5xl md:text-7xl mb-2 md:mb-4 text-ink">{original.symbol}</div>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className="text-2xl md:text-3xl text-ink glow-text">{original.name}</span>
                {originalRelation && (
                  <span className={`text-[10px] md:text-xs px-2 py-0.5 rounded-full border ${relationStyle(originalRelation)}`}>{originalRelation}</span>
                )}
              </div>
              <div className="text-ink-light mt-2 md:mt-3 text-sm md:text-lg">
                <span className="trigram-symbol mr-1 md:mr-2">{original.upperTrigram.symbol}</span>上{original.upperTrigram.name}
                <span className="mx-2 md:mx-3 text-ink">|</span>
                <span className="trigram-symbol mr-1 md:mr-2">{original.lowerTrigram.symbol}</span>下{original.lowerTrigram.name}
              </div>
              <div className="text-ink-light/70 mt-1 text-xs md:text-sm">
                {original.upperTrigram.nature}{original.lowerTrigram.nature} | {original.upperTrigram.element}{original.lowerTrigram.element}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center gap-1.5 md:gap-3 mb-2 md:mb-3 pb-2 border-b border-paper-dark/40 text-[10px] md:text-xs text-ink-light/70 tracking-wide">
                <div className="w-14 md:w-20 text-right">六神 · 纳甲</div>
                <div className="w-5 md:w-6 text-center">世应</div>
                <div className="w-24 md:w-36 text-center">卦 象</div>
                <div className="w-5 md:w-7 text-center">动</div>
                <div className="w-14 md:w-20 text-left">六亲 · 爻题</div>
              </div>
              {reversedYaos.map((yao, idx) => {
                const pos = 5 - idx
                const info = reversedNajia[idx]
                return (
                  <div key={pos} className="flex items-center justify-center gap-1.5 md:gap-3 my-1.5 md:my-2.5 animate-yao-reveal" style={{ animationDelay: `${idx * 80}ms` }}>
                    <div className="w-14 md:w-20 text-right leading-tight">
                      <div className="text-xs md:text-sm text-ocher">{info.sixShen}</div>
                      <div className="text-[10px] md:text-xs text-indigo">{info.naJia}</div>
                    </div>
                    <div className="w-5 md:w-6 text-center text-base md:text-lg font-bold leading-none">
                      {info.shi && <span className="text-cinnabar">世</span>}
                      {info.ying && <span className="text-indigo">应</span>}
                    </div>
                    {yao.yin ? (
                      <div className="h-3 md:h-4 w-24 md:w-36 flex justify-between shrink-0">
                        <div className="w-9 md:w-14 h-full bg-ink rounded shadow-md" />
                        <div className="w-9 md:w-14 h-full bg-ink rounded shadow-md" />
                      </div>
                    ) : (
                      <div className="h-3 md:h-4 w-24 md:w-36 bg-ink rounded shadow-md shrink-0" />
                    )}
                    <div className="w-5 md:w-7 flex justify-center">
                      {yao.changing && (
                        <div className="w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-cinnabar bg-paper text-cinnabar text-xs md:text-sm flex items-center justify-center font-bold shadow-sm animate-pulse">
                          {yao.yin ? '×' : '○'}
                        </div>
                      )}
                    </div>
                    <div className="w-14 md:w-20 text-left leading-tight">
                      <div className="text-sm md:text-base text-cinnabar">{info.sixQin}</div>
                      <div className="text-[10px] md:text-xs text-ink-light">
                        {yaoTitle(pos, yao.yin)}
                        {info.wangShuai && <span className={`ml-1 ${wsColor(info.wangShuai)}`}>{info.wangShuai}</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
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
              {najia.some(n => n.tags && n.tags.length > 0) && (
                <div className="mt-4 md:mt-5 pt-3 border-t border-paper-dark/40 w-full">
                  <div className="flex items-baseline justify-center gap-2 mb-2">
                    <span className="text-xs md:text-sm text-ocher tracking-widest font-medium">爻 情</span>
                    <span className="text-[9px] md:text-[10px] text-ink-light/50">逐爻旺衰见右，下列其动态吉凶</span>
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
              <div className="mt-4 md:mt-5 pt-3 border-t border-paper-dark/40 w-full flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] md:text-xs text-ink-light/70">
                <span><span className="text-cinnabar font-bold">世</span> 自身、求测者</span>
                <span><span className="text-indigo font-bold">应</span> 他人、所测之事</span>
                <span><span className="text-cinnabar font-bold">○</span> 老阳（动）</span>
                <span><span className="text-cinnabar font-bold">×</span> 老阴（动）</span>
                <span><span className="text-ocher font-bold">伏</span> 伏神</span>
                <span><span className="text-jade font-bold">旺相</span>·<span className="text-ink-light/50">休囚死</span> 爻之旺衰</span>
              </div>
            </div>
          </div>

          {changed ? (
            <div className="paper-card p-4 md:p-8 animate-slide-up relative overflow-hidden" style={{ animationDelay: '150ms' }}>
              <div className="absolute top-0 right-0 text-5xl md:text-8xl opacity-5">{changed.symbol}</div>
              <h3 className="text-xl md:text-2xl text-center mb-4 md:mb-6 text-ocher tracking-widest">变 卦</h3>
              <div className="text-center mb-5 md:mb-8">
                <div className="text-5xl md:text-7xl mb-2 md:mb-4 text-ink/80">{changed.symbol}</div>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <span className="text-2xl md:text-3xl text-ink">{changed.name}</span>
                  {changedRelation && (
                    <span className={`text-[10px] md:text-xs px-2 py-0.5 rounded-full border ${relationStyle(changedRelation)}`}>{changedRelation}</span>
                  )}
                  {yinTags && yinTags.map(t => (
                    <span key={t} className={`text-[10px] md:text-xs px-2 py-0.5 rounded-full border ${t.includes('反吟') ? 'text-cinnabar bg-cinnabar/10 border-cinnabar/30' : 'text-indigo bg-indigo/10 border-indigo/30'}`}>{t}</span>
                  ))}
                </div>
                <div className="text-ink-light mt-2 md:mt-3 text-sm md:text-lg">
                  <span className="trigram-symbol mr-1 md:mr-2">{changed.upperTrigram.symbol}</span>上{changed.upperTrigram.name}
                  <span className="mx-2 md:mx-3 text-ink">|</span>
                  <span className="trigram-symbol mr-1 md:mr-2">{changed.lowerTrigram.symbol}</span>下{changed.lowerTrigram.name}
                </div>
                <div className="text-ink-light/70 mt-1 text-xs md:text-sm">
                  {changed.upperTrigram.nature}{changed.lowerTrigram.nature} | {changed.upperTrigram.element}{changed.lowerTrigram.element}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center gap-2 md:gap-3 mb-2 md:mb-3 pb-2 border-b border-paper-dark/40 text-[10px] md:text-xs text-ink-light/70 tracking-wide">
                  <div className="w-14 md:w-16 text-right">变爻六亲·纳甲</div>
                  <div className="w-20 md:w-28 text-center">卦 象</div>
                  <div className="w-8 md:w-10 text-left">爻题</div>
                </div>
                {changedYao.slice().reverse().map((yao, idx) => {
                  const pos = 5 - idx
                  const isChangedYao = originalYao[pos].changing
                  const cn = changedNajia?.[pos]
                  return (
                    <div key={pos} className="flex items-center justify-center gap-2 md:gap-3 my-1.5 md:my-2.5">
                      <div className="w-14 md:w-16 text-right leading-tight">
                        {isChangedYao && cn && (
                          <>
                            <div className="text-xs md:text-sm text-ocher">{cn.sixQin}</div>
                            <div className="text-[10px] md:text-xs text-indigo">{cn.naJia}</div>
                          </>
                        )}
                      </div>
                      {yao.yin ? (
                        <div className="h-3 md:h-4 w-20 md:w-28 flex justify-between shrink-0">
                          <div className={`w-7 md:w-11 h-full rounded shadow-sm ${isChangedYao ? 'bg-ocher shadow-ocher/30' : 'bg-ink/50'}`} />
                          <div className={`w-7 md:w-11 h-full rounded shadow-sm ${isChangedYao ? 'bg-ocher shadow-ocher/30' : 'bg-ink/50'}`} />
                        </div>
                      ) : (
                        <div className={`h-3 md:h-4 w-20 md:w-28 rounded shadow-sm shrink-0 ${isChangedYao ? 'bg-ocher shadow-ocher/30' : 'bg-ink/50'}`} />
                      )}
                      <span className={`w-8 md:w-10 text-left text-xs md:text-sm ${isChangedYao ? 'text-ocher font-medium' : 'text-ink-light'}`}>{yaoTitle(pos, yao.yin)}</span>
                    </div>
                  )
                })}
              </div>
              <p className="text-center text-ink-light mt-4 md:mt-6">
                <span className="px-2 md:px-3 py-1 bg-cinnabar/10 text-cinnabar rounded-full text-xs md:text-sm">
                  {changingYaos.length} 爻动
                </span>
              </p>
              <p className="mt-3 text-center text-[10px] md:text-xs text-ink-light/60">
                橙色为变爻，左标其回头纳甲与六亲（六亲以本卦之宫论）
              </p>
            </div>
          ) : (
            <div className="paper-card p-6 md:p-8 animate-slide-up flex items-center justify-center" style={{ animationDelay: '150ms' }}>
              <div className="text-center">
                <div className="text-4xl md:text-6xl mb-3 md:mb-4 opacity-30">☯</div>
                <p className="text-ink-light text-base md:text-lg">六爻安静，无变卦</p>
                <p className="text-xs md:text-sm text-ink-light/70 mt-1 md:mt-2">以本卦卦辞断之</p>
              </div>
            </div>
          )}
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
                <p className="text-base md:text-lg leading-loose text-ink whitespace-pre-wrap indent-8">
                  {aiInterpretation}
                </p>
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
