import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, RotateCcw, Share2, BookOpen, Sparkles, Key, RefreshCw } from 'lucide-react'
import { useDivinationStore } from '../store/useDivinationStore'
import { getHexagramInterpretation } from '../utils/divination'
import { aiDivination } from '../utils/ai'
import ApiKeyModal from '../components/ApiKeyModal'

const YAO_LABELS = ['初', '二', '三', '四', '五', '上']

export default function Result() {
  const navigate = useNavigate()
  const { result, reset, aiApiKey, aiInterpretation, aiLoading, appendAiInterpretation, setAiInterpretation, setAiLoading } = useDivinationStore()
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false)

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

  const { original, changed, originalYao, changedYao, najia, question, date } = result
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
    if (navigator.share) {
      navigator.share({
        title: `六爻排盘 - ${original.name}`,
        text: `${question || '占问'}：得${original.name}${changed ? `之${changed.name}` : ''}`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('链接已复制到剪贴板')
    }
  }

  const handleNew = () => {
    reset()
    navigate('/')
  }

  const handleAiDivination = async () => {
    if (!aiApiKey || aiApiKey.trim() === '') {
      setApiKeyModalOpen(true)
      return
    }
    setAiInterpretation('')
    setAiLoading(true)
    await aiDivination(aiApiKey, result, question, {
      onToken: (token) => appendAiInterpretation(token),
      onDone: () => setAiLoading(false),
      onError: (err) => {
        setAiInterpretation(`AI解卦出错：${err}`)
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 text-center">
            <div className="p-3 md:p-4 rounded-lg bg-paper-dark/20">
              <div className="text-xs md:text-sm text-ink-light tracking-wide mb-1 md:mb-2">◆ 占问事项</div>
              <div className="text-base md:text-xl mt-1 text-ink">{question || '（未填写）'}</div>
            </div>
            <div className="p-3 md:p-4 rounded-lg bg-paper-dark/20">
              <div className="text-xs md:text-sm text-ink-light tracking-wide mb-1 md:mb-2">◆ 占问时间</div>
              <div className="text-base md:text-xl mt-1">{date}</div>
            </div>
            <div className="p-3 md:p-4 rounded-lg bg-paper-dark/20">
              <div className="text-xs md:text-sm text-ink-light tracking-wide mb-1 md:mb-2">◆ 起卦方式</div>
              <div className="text-base md:text-xl mt-1 text-cinnabar">{methodName}</div>
            </div>
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
              <div className="text-2xl md:text-3xl text-ink glow-text">{original.name}</div>
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
              {reversedYaos.map((yao, idx) => {
                const pos = 5 - idx
                const info = reversedNajia[idx]
                return (
                  <div key={pos} className="relative flex items-center w-full max-w-xs md:max-w-sm justify-center my-1.5 md:my-2.5 scale-90 md:scale-100" style={{ animationDelay: `${idx * 80}ms` }}>
                    <div className="absolute left-0 text-right w-16 md:w-24">
                      <div className="text-xs md:text-sm text-ocher">{info.sixShen}</div>
                      <div className="text-[10px] md:text-xs text-indigo">{info.naJia}</div>
                    </div>
                    <div className="relative">
                      {yao.yin ? (
                        <div className="h-3 md:h-4 w-24 md:w-36 flex justify-between">
                          <div className="w-9 md:w-14 h-3 md:h-4 bg-ink rounded shadow-md" />
                          <div className="w-9 md:w-14 h-3 md:h-4 bg-ink rounded shadow-md" />
                        </div>
                      ) : (
                        <div className="h-3 md:h-4 w-24 md:w-36 bg-ink rounded shadow-md" />
                      )}
                      {yao.changing && (
                        <div className="absolute -right-6 md:-right-8 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-cinnabar bg-paper text-cinnabar text-xs md:text-sm flex items-center justify-center font-bold shadow-sm animate-pulse">
                          {yao.yin ? '×' : '○'}
                        </div>
                      )}
                      {info.shi && (
                        <div className="absolute -left-10 md:-left-16 top-1/2 -translate-y-1/2 text-cinnabar text-base md:text-lg font-bold">世</div>
                      )}
                      {info.ying && (
                        <div className="absolute -left-10 md:-left-16 top-1/2 -translate-y-1/2 text-indigo text-base md:text-lg font-bold">应</div>
                      )}
                    </div>
                    <div className="absolute right-0 text-left w-16 md:w-24">
                      <div className="text-sm md:text-base text-cinnabar">{info.sixQin}</div>
                      <div className="text-[10px] md:text-xs text-ink-light">{YAO_LABELS[pos]}{yao.yin ? '六' : '九'}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {changed ? (
            <div className="paper-card p-4 md:p-8 animate-slide-up relative overflow-hidden" style={{ animationDelay: '150ms' }}>
              <div className="absolute top-0 right-0 text-5xl md:text-8xl opacity-5">{changed.symbol}</div>
              <h3 className="text-xl md:text-2xl text-center mb-4 md:mb-6 text-ocher tracking-widest">变 卦</h3>
              <div className="text-center mb-5 md:mb-8">
                <div className="text-5xl md:text-7xl mb-2 md:mb-4 text-ink/80">{changed.symbol}</div>
                <div className="text-2xl md:text-3xl text-ink">{changed.name}</div>
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
                {changedYao.slice().reverse().map((yao, idx) => {
                  const pos = 5 - idx
                  const originalYaoHere = originalYao[pos]
                  return (
                    <div key={pos} className="relative flex items-center my-1.5 md:my-2.5 scale-90 md:scale-100">
                      {yao.yin ? (
                        <div className="h-3 md:h-4 w-20 md:w-28 flex justify-between">
                          <div className={`w-7 md:w-11 h-3 md:h-4 rounded shadow-sm ${originalYaoHere.changing ? 'bg-ocher shadow-ocher/30' : 'bg-ink/50'}`} />
                          <div className={`w-7 md:w-11 h-3 md:h-4 rounded shadow-sm ${originalYaoHere.changing ? 'bg-ocher shadow-ocher/30' : 'bg-ink/50'}`} />
                        </div>
                      ) : (
                        <div className={`h-3 md:h-4 w-20 md:w-28 rounded shadow-sm ${originalYaoHere.changing ? 'bg-ocher shadow-ocher/30' : 'bg-ink/50'}`} />
                      )}
                      <span className="ml-3 md:ml-5 text-xs md:text-sm text-ink-light w-8 md:w-10">{YAO_LABELS[pos]}</span>
                    </div>
                  )
                })}
              </div>
              <p className="text-center text-ink-light mt-4 md:mt-6">
                <span className="px-2 md:px-3 py-1 bg-cinnabar/10 text-cinnabar rounded-full text-xs md:text-sm">
                  {changingYaos.length} 爻动
                </span>
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
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h3 className="text-xl md:text-2xl text-cinnabar flex items-center gap-2 md:gap-3 tracking-widest">
              <Sparkles size={22} className="md:w-[28px] md:h-[28px]" />
              AI 智 能 解 卦
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setApiKeyModalOpen(true)}
                className="p-2 hover:bg-paper-dark rounded-full transition-all" 
                title="设置API密钥"
              >
                <Key size={18} className="text-ink-light" />
              </button>
              {aiInterpretation && !aiLoading && (
                <button 
                  onClick={handleAiDivination}
                  className="p-2 hover:bg-paper-dark rounded-full transition-all" 
                  title="重新解读"
                >
                  <RefreshCw size={18} className="text-ink-light" />
                </button>
              )}
            </div>
          </div>
          
          {!aiInterpretation && !aiLoading ? (
            <div className="text-center py-8">
              <p className="text-ink-light mb-5">点击下方按钮，AI大师为您详细解读卦象</p>
              <button 
                onClick={handleAiDivination}
                className="seal-button-primary px-8 md:px-12 py-3 md:py-4 text-lg md:text-xl"
              >
                ✨ AI 大师解卦
              </button>
              <p className="text-xs text-ink-light/60 mt-4">
                默认使用内置密钥，无需配置
              </p>
            </div>
          ) : aiLoading ? (
            <div className="text-center py-8">
              <div className="inline-block mb-4">
                <div className="w-10 h-10 border-4 border-cinnabar/30 border-t-cinnabar rounded-full animate-spin mx-auto"></div>
              </div>
              <p className="text-ink-light">AI大师正在解析卦象...</p>
            </div>
          ) : (
            <div className="bg-paper-dark/20 rounded-xl p-5 md:p-6">
              <p className="text-base md:text-lg leading-loose text-ink whitespace-pre-wrap">
                {aiInterpretation}
                <span className="inline-block w-2 h-5 bg-cinnabar/70 ml-1 animate-pulse"></span>
              </p>
            </div>
          )}
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
                      {YAO_LABELS[idx]}{yao.yin ? '六' : '九'}
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
                      <span className="text-[10px] md:text-xs px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-indigo/20 text-indigo">世爻</span>
                    )}
                    {najia[idx].ying && (
                      <span className="text-[10px] md:text-xs px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-ocher/20 text-ocher">应爻</span>
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
      <ApiKeyModal open={apiKeyModalOpen} onClose={() => setApiKeyModalOpen(false)} />
    </div>
  )
}
