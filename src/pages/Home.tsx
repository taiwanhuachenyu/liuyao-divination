import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { History, RotateCcw, Sparkles, Clock } from 'lucide-react'
import { useDivinationStore } from '../store/useDivinationStore'
import { createDivination, timeDivination } from '../utils/divination'
import Coin from '../components/Coin'
import YaoLine from '../components/YaoLine'
import HistoryDrawer from '../components/HistoryDrawer'
import FontSwitcher from '../components/FontSwitcher'

const YAO_LABELS = ['初', '二', '三', '四', '五', '上']
const METHOD_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  coins: { label: '铜钱摇卦', icon: <span className="text-lg">⚂</span> },
  manual: { label: '手动选卦', icon: <span className="text-lg">☯</span> },
  time: { label: '天机起卦', icon: <Sparkles size={18} /> },
}

export default function Home() {
  const navigate = useNavigate()
  const [historyOpen, setHistoryOpen] = useState(false)
  const [coinResults, setCoinResults] = useState<boolean[] | null>(null)
  const {
    yaos, question, date, method, currentStep, isFlipping,
    setQuestion, setDate, setMethod, addYao, setYao, setIsFlipping, 
    setResult, reset
  } = useDivinationStore()

  useEffect(() => {
    reset()
  }, [])

  useEffect(() => {
    if (method !== 'coins' || isFlipping) return
    if (currentStep >= 6) {
      setTimeout(() => {
        const state = useDivinationStore.getState()
        const completeYaos = state.yaos.filter((y): y is NonNullable<typeof y> => y !== null)
        if (completeYaos.length === 6) {
          const result = createDivination(completeYaos, state.question, state.date, state.method)
          state.setResult(result)
          navigate('/result')
        }
      }, 500)
    }
  }, [currentStep, isFlipping, method, navigate])

  const handleMethodChange = (m: 'coins' | 'manual' | 'time') => {
    reset()
    setMethod(m)
    setCoinResults(null)
  }

  const handleToss = () => {
    if (isFlipping || currentStep >= 6) return
    setIsFlipping(true)
    setCoinResults(null)
    
    setTimeout(() => {
      const coins = [Math.random() > 0.5, Math.random() > 0.5, Math.random() > 0.5]
      const heads = coins.filter(c => c).length
      let yin = false, changing = false
      if (heads === 3) { yin = false; changing = true }
      else if (heads === 0) { yin = true; changing = true }
      else if (heads === 2) { yin = true; changing = false }
      else { yin = false; changing = false }
      
      setCoinResults(coins)
      addYao(yin, changing)
      setTimeout(() => {
        setIsFlipping(false)
      }, 500)
    }, 900)
  }

  const handleManualYao = (index: number, yin: boolean, changing: boolean) => {
    setYao(index, yin, changing)
  }

  const handleTimeDivination = () => {
    const timeYaos = timeDivination(date)
    const result = createDivination(timeYaos, question || '天机起卦', date, 'time')
    setResult(result)
    navigate('/result')
  }

  const generateResult = () => {
    const state = useDivinationStore.getState()
    const completeYaos = state.yaos.filter((y): y is NonNullable<typeof y> => y !== null)
    if (completeYaos.length !== 6) {
      if (state.method === 'manual') {
        const allYaos = state.yaos.map((y, i) => y || { index: i, yin: i % 2 === 0, changing: false })
        const result = createDivination(allYaos, state.question, state.date, state.method)
        setResult(result)
        navigate('/result')
      }
      return
    }
    const result = createDivination(completeYaos, state.question, state.date, state.method)
    setResult(result)
    navigate('/result')
  }

  const handleReset = () => {
    reset()
    setCoinResults(null)
  }

  const previewYaos = yaos.slice().reverse()

  return (
    <div className="min-h-screen py-8 px-4 relative">
      <div className="bagua-decoration top-10 left-10 text-8xl yin-yang-spin opacity-30 float-animation">☯</div>
      <div className="bagua-decoration bottom-10 right-10 text-6xl opacity-20">
        <div className="grid grid-cols-2 gap-1">
          <span>☰</span><span>☱</span><span>☲</span><span>☳</span>
          <span>☴</span><span>☵</span><span>☶</span><span>☷</span>
        </div>
      </div>

      <header className="max-w-4xl mx-auto mb-8 relative z-50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl text-ink tracking-[0.3em] text-shadow-glow glow-text">
              六爻排盘
            </h1>
            <p className="text-ink-light mt-3 text-lg tracking-wider">
              --- 铜钱起卦 天机妙算 自动排盘 ---
            </p>
          </div>
          <div className="flex items-center gap-1">
            <FontSwitcher />
            <button 
              onClick={() => setHistoryOpen(true)}
              className="p-3 hover:bg-paper-dark rounded-full transition-all hover:shadow-md"
              title="历史记录"
            >
              <History size={26} className="text-ink-light" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto relative z-10">
        <div className="paper-card p-8 mb-6 animate-fade-in">
          <div className="flex flex-wrap gap-2 mb-8 border-b border-paper-dark pb-6 justify-center">
            {(['coins', 'manual', 'time'] as const).map((m) => (
              <button
                key={m}
                onClick={() => handleMethodChange(m)}
                className={`pb-3 px-6 text-lg transition-all flex items-center gap-2 rounded-t-lg ${
                  method === m 
                    ? 'tab-active text-cinnabar bg-cinnabar/5' 
                    : 'text-ink-light hover:text-ink hover:bg-paper-dark/50'
                }`}
              >
                {METHOD_LABELS[m].icon}
                {METHOD_LABELS[m].label}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm text-ink-light mb-2 tracking-wide">◆ 占问事项</label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="请输入您想占问的事情..."
                className="w-full px-4 py-3 border border-paper-dark rounded-lg bg-paper/50 focus:outline-none focus:border-cinnabar focus:ring-2 focus:ring-cinnabar/20 transition-all text-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-ink-light mb-2 tracking-wide">◆ 占问时间</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 border border-paper-dark rounded-lg bg-paper/50 focus:outline-none focus:border-cinnabar focus:ring-2 focus:ring-cinnabar/20 transition-all text-lg"
              />
            </div>
          </div>
        </div>

        {method === 'coins' && (
          <div className="paper-card p-10 mb-6 animate-slide-up relative overflow-hidden">
            <div className="absolute top-4 right-4 text-4xl opacity-10">⚂</div>
            <h3 className="text-2xl text-center mb-8 text-ink">
              {currentStep < 6 
                ? <>第 <span className="text-cinnabar text-3xl mx-1">{currentStep + 1}</span> 爻：静心凝神，点击抛掷</>
                : '六爻已成，天机已显...'}
            </h3>
            
            <div className="flex justify-center gap-8 mb-10">
              {[0, 1, 2].map((i) => (
                <div key={i} className="float-animation" style={{ animationDelay: `${i * 200}ms` }}>
                  <Coin 
                    heads={coinResults ? coinResults[i] : Math.random() > 0.5} 
                    flipping={isFlipping} 
                    delay={i * 100}
                  />
                </div>
              ))}
            </div>

            {coinResults && !isFlipping && currentStep < 6 && (
              <p className="text-center text-ink-light mb-6 animate-fade-in">
                {coinResults.filter(c => c).length === 3 && '三正为老阳 ○ 动爻'}
                {coinResults.filter(c => c).length === 0 && '三反为老阴 × 动爻'}
                {coinResults.filter(c => c).length === 2 && '两正一反为少阴 - -'}
                {coinResults.filter(c => c).length === 1 && '两反一正为少阳 —'}
              </p>
            )}

            <div className="flex justify-center gap-4">
              <button
                onClick={handleToss}
                disabled={isFlipping || currentStep >= 6}
                className="seal-button-primary px-12 py-4 text-xl"
              >
                {isFlipping ? '✨ 抛掷中...' : currentStep < 6 ? '抛掷铜钱' : '排盘中...'}
              </button>
              <button
                onClick={handleReset}
                className="seal-button flex items-center gap-2 px-6 py-4"
              >
                <RotateCcw size={20} />
                重来
              </button>
            </div>

            <div className="mt-10 flex justify-center gap-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full transition-all duration-500 ${
                    i < currentStep 
                      ? 'bg-cinnabar shadow-lg shadow-cinnabar/30 scale-110' 
                      : 'bg-paper-dark'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {method === 'manual' && (
          <div className="paper-card p-8 mb-6 animate-slide-up">
            <h3 className="text-2xl text-center mb-8 text-ink">手动选择每一爻的阴阳动变</h3>
            <div className="max-w-lg mx-auto space-y-4 mb-8">
              {[5, 4, 3, 2, 1, 0].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-paper-dark/30 transition-colors">
                  <span className="w-12 text-lg">{YAO_LABELS[i]}爻</span>
                  <div className="flex gap-2 flex-1 justify-end">
                    {[
                      { label: '少阳 —', yin: false, changing: false },
                      { label: '少阴 - -', yin: true, changing: false },
                      { label: '老阳 ○', yin: false, changing: true },
                      { label: '老阴 ×', yin: true, changing: true },
                    ].map((opt) => {
                      const current = yaos[i]
                      const selected = current?.yin === opt.yin && current?.changing === opt.changing
                      return (
                        <button
                          key={opt.label}
                          onClick={() => handleManualYao(i, opt.yin, opt.changing)}
                          className={`px-4 py-2 rounded-lg border transition-all ${
                            selected 
                              ? 'bg-cinnabar text-paper border-cinnabar shadow-md' 
                              : 'border-paper-dark hover:border-cinnabar text-ink-light hover:text-ink'
                          }`}
                        >
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-4">
              <button
                onClick={generateResult}
                className="seal-button-primary px-12 py-4 text-xl"
              >
                ✨ 开始排盘
              </button>
              <button onClick={handleReset} className="seal-button flex items-center gap-2 px-6 py-4">
                <RotateCcw size={20} />
                重置
              </button>
            </div>
          </div>
        )}

        {method === 'time' && (
          <div className="paper-card p-10 mb-6 animate-slide-up text-center relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center opacity-5">
              <span className="text-[200px]">☯</span>
            </div>
            <div className="relative z-10">
              <div className="mb-8">
                <Sparkles className="mx-auto mb-6 text-cinnabar float-animation" size={64} />
                <h3 className="text-2xl mb-4 text-ink">梅花易数 天机起卦</h3>
                <p className="text-ink-light max-w-md mx-auto leading-relaxed">
                  以年月日时起卦，不假人为，纯由天机。<br/>
                  年、月、日数相加除以8得上卦，加时辰数除以8得下卦，总数除以6得动爻。
                </p>
              </div>
              
              <div className="bg-paper-dark/30 rounded-lg p-6 mb-8 inline-block">
                <div className="flex items-center justify-center gap-3 text-ink-light">
                  <Clock size={20} />
                  <span>选定时间：<span className="text-ink text-lg">{date}</span></span>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={handleTimeDivination}
                  className="seal-button-primary px-12 py-4 text-xl"
                >
                  ✨ 天机起卦
                </button>
              </div>
            </div>
          </div>
        )}

        {method !== 'time' && (
          <div className="paper-card p-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <h3 className="text-xl text-center mb-6 text-ink-light">
              {method === 'coins' && currentStep > 0 ? '卦象渐显...' : '已确定爻位预览'}
            </h3>
            <div className="flex flex-col items-center">
              {previewYaos.map((yao, idx) => (
                <YaoLine 
                  key={5 - idx} 
                  yao={yao} 
                  label={YAO_LABELS[5 - idx]}
                  animate={yao !== null}
                  delay={idx * 100}
                  size="lg"
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <HistoryDrawer open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </div>
  )
}
