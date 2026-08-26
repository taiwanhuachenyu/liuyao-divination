import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { History, RotateCcw, Clock, Settings } from 'lucide-react'
import { useDivinationStore, ymd } from '../store/useDivinationStore'
import { createDivination, readCoins, timeDivination, tossCoins } from '../utils/divination'
import Coin from '../components/Coin'
import YaoLine from '../components/YaoLine'
import HistoryDrawer from '../components/HistoryDrawer'
import SettingsDrawer from '../components/SettingsDrawer'

const YAO_LABELS = ['初', '二', '三', '四', '五', '上']
// 界内不出阿拉伯数字：爻数一律汉字
const CN_NUM = ['零', '一', '二', '三', '四', '五', '六']
const COIN_RESTING_FACES = [true, false, true]
// 十二时辰（取每个时辰的代表小时，用于时间起卦与干支推算）
const SHICHEN = [
  { name: '子时', range: '23–01', hour: 0 },
  { name: '丑时', range: '01–03', hour: 2 },
  { name: '寅时', range: '03–05', hour: 4 },
  { name: '卯时', range: '05–07', hour: 6 },
  { name: '辰时', range: '07–09', hour: 8 },
  { name: '巳时', range: '09–11', hour: 10 },
  { name: '午时', range: '11–13', hour: 12 },
  { name: '未时', range: '13–15', hour: 14 },
  { name: '申时', range: '15–17', hour: 16 },
  { name: '酉时', range: '17–19', hour: 18 },
  { name: '戌时', range: '19–21', hour: 20 },
  { name: '亥时', range: '21–23', hour: 22 },
]
// 小时 → 时辰序号（与 getHourZhi 一致：子时含跨夜 23–01）
const hourToShichen = (h: number) => Math.floor(((h + 1) % 24) / 2)

// 起卦一刻方定时日：钟点若仍随时钟自走（用户未自选日期与时辰），则以当下为准，
// 不用页面挂载那一刻的旧值。天机起卦的下卦与动爻俱由时辰而定，跨一个时辰即是另一卦；
// 铜钱与手动虽不由时辰定爻，其月建（以节之精确时刻为界）与日辰（23 时换日）亦系于此
function occasionOf(date: string, hour: number, auto: boolean) {
  if (!auto) return { date, hour }
  const now = new Date()
  return { date: ymd(now), hour: now.getHours() }
}
const METHOD_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  coins: { label: '铜钱摇卦', icon: <span className="text-lg">☱</span> },
  manual: { label: '手动选卦', icon: <span className="text-lg">☷</span> },
  time: { label: '天机起卦', icon: <span className="text-lg">☰</span> },
}

export default function Home() {
  const navigate = useNavigate()
  const [historyOpen, setHistoryOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [coinResults, setCoinResults] = useState<boolean[] | null>(null)
  const tossTimers = useRef<ReturnType<typeof setTimeout>[]>([])
  // 时日是否仍随时钟自走。用户一经自选日期或时辰，即以其所选为准，不再代为改动
  const autoTime = useRef(true)
  const {
    yaos, question, date, hour, method, currentStep, isFlipping,
    setQuestion, setDate, setHour, setMethod, addYao, setYao, setIsFlipping,
    setResult, reset, resetYaos
  } = useDivinationStore()

  useEffect(() => {
    reset()
    // 仅在进入起卦页时重置一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 抛掷动画的定时器若随页面卸载而留存，回来时会凭空补上一爻
  useEffect(() => () => {
    tossTimers.current.forEach(clearTimeout)
    tossTimers.current = []
  }, [])

  // 时与日皆随时钟自省：页面若久开不动，跨过时辰界或午夜之后，仍按挂载那一刻排盘便是错的
  useEffect(() => {
    const timer = setInterval(() => {
      if (!autoTime.current) return
      const now = new Date()
      const state = useDivinationStore.getState()
      if (ymd(now) !== state.date) setDate(ymd(now))
      if (now.getHours() !== state.hour) setHour(now.getHours())
    }, 20_000)
    return () => clearInterval(timer)
  }, [setDate, setHour])

  useEffect(() => {
    if (method !== 'coins' || isFlipping || currentStep < 6) return
    const timer = setTimeout(() => {
      const state = useDivinationStore.getState()
      const completeYaos = state.yaos.filter((y): y is NonNullable<typeof y> => y !== null)
      if (completeYaos.length === 6) {
        const { date: d, hour: h } = occasionOf(state.date, state.hour, autoTime.current)
        const result = createDivination(completeYaos, state.question, d, state.method, h)
        state.setResult(result)
        navigate('/result')
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [currentStep, isFlipping, method, navigate])

  // 在途的抛掷回调会把新的一爻补进已清空的卦里，故凡重起一卦，必先掐断
  const clearTossTimers = () => {
    tossTimers.current.forEach(clearTimeout)
    tossTimers.current = []
  }

  const handleMethodChange = (m: 'coins' | 'manual' | 'time') => {
    // setMethod 已重置 yaos、currentStep 与 isFlipping；此处不调用 reset()，以保留用户已填写的占问事项
    clearTossTimers()
    setMethod(m)
    setCoinResults(null)
  }

  const handleToss = () => {
    if (isFlipping || currentStep >= 6) return
    setIsFlipping(true)
    setCoinResults(null)

    tossTimers.current.push(setTimeout(() => {
      const { coins, yin, changing } = tossCoins()
      setCoinResults(coins)
      addYao(yin, changing)
      tossTimers.current.push(setTimeout(() => setIsFlipping(false), 500))
    }, 900))
  }

  const handleManualYao = (index: number, yin: boolean, changing: boolean) => {
    setYao(index, yin, changing)
  }

  const handleTimeDivination = () => {
    const { date: d, hour: h } = occasionOf(date, hour, autoTime.current)
    const timeYaos = timeDivination(d, h)
    if (!timeYaos) return
    const result = createDivination(timeYaos, question, d, 'time', h)
    setResult(result)
    navigate('/result')
  }

  const generateResult = () => {
    const state = useDivinationStore.getState()
    const completeYaos = state.yaos.filter((y): y is NonNullable<typeof y> => y !== null)
    if (completeYaos.length !== 6) return
    const { date: d, hour: h } = occasionOf(state.date, state.hour, autoTime.current)
    const result = createDivination(completeYaos, state.question, d, state.method, h)
    setResult(result)
    navigate('/result')
  }

  const handleReset = () => {
    clearTossTimers()
    resetYaos()
    setCoinResults(null)
  }

  const previewYaos = yaos.slice().reverse()
  const manualSelectedCount = yaos.filter(Boolean).length
  const manualComplete = manualSelectedCount === 6
  // 月建、日辰、旬空俱由所选之日推算，日期缺失便无从排盘，故先行拦下
  const dateValid = /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(new Date(`${date}T12:00:00`).getTime())
  // 干支日以子时（23 时）换日而非零点，排盘已照此推算；此处只据实相告，免得用户见日辰与公历日不合而生疑
  const ziShiCrossDay = hour === 23

  return (
    <div className="min-h-screen py-4 md:py-8 px-3 md:px-4 relative">
            <header className="max-w-4xl mx-auto mb-6 md:mb-8 relative z-50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-5xl text-ink tracking-[0.2em] md:tracking-[0.3em] ti-zi">
              六爻排盘
            </h1>
            <p className="text-ink-light mt-1 md:mt-3 text-sm md:text-lg tracking-wider">
              铜钱起卦&#12288;天机妙算&#12288;自动排盘
            </p>
          </div>
          <div className="flex items-center gap-1">
            {/* 触靶不小于 44px：手机上图标按钮只有 38 见方，指腹压不准 */}
            <button
              onClick={() => setHistoryOpen(true)}
              className="flex min-h-11 min-w-11 items-center justify-center p-2 md:p-3 hover:bg-paper-dark transition-all hover:shadow-md"
              title="历史记录"
              aria-label="查看历史记录"
            >
              <History size={22} className="md:w-[26px] md:h-[26px] text-ink-light" />
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className="flex min-h-11 min-w-11 items-center justify-center p-2 md:p-3 hover:bg-paper-dark transition-all hover:shadow-md"
              title="AI 解卦设置"
              aria-label="AI 解卦设置"
            >
              <Settings size={22} className="md:w-[26px] md:h-[26px] text-ink-light" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto relative z-10">
        <div className="ce-page p-4 md:p-8 mb-4 md:mb-6 animate-fade-in">
          <div role="tablist" aria-label="起卦方式" className="flex flex-wrap gap-1 md:gap-2 mb-4 md:mb-8 border-b border-paper-dark pb-4 md:pb-6 justify-center">
            {(['coins', 'manual', 'time'] as const).map((m) => (
              <button
                key={m}
                role="tab"
                aria-selected={method === m}
                onClick={() => handleMethodChange(m)}
                className={`min-h-11 pb-2 md:pb-3 px-3 md:px-6 text-sm md:text-lg transition-all flex items-center justify-center gap-1.5 md:gap-2 ${
                  method === m
                    ? 'text-cinnabar border-b-2 border-cinnabar'
                    : 'text-ink-light hover:text-ink hover:bg-paper-dark/50'
                }`}
              >
                {METHOD_LABELS[m].icon}
                {METHOD_LABELS[m].label}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-0 md:mb-6">
            <div>
              <label htmlFor="divination-question" className="block text-sm text-ink-light mb-2 tracking-wide">占问事项</label>
              <input
                id="divination-question"
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="请输入您想占问的事情..."
                className="w-full px-4 py-2.5 md:py-3 border border-paper-dark field-lan text-base md:text-lg"
              />
            </div>
            <div>
              <label htmlFor="divination-date" className="block text-sm text-ink-light mb-2 tracking-wide">占问时间</label>
              <input
                id="divination-date"
                type="date"
                value={date}
                onChange={(e) => { autoTime.current = false; setDate(e.target.value) }}
                aria-invalid={!dateValid}
                className={`w-full px-4 py-2.5 md:py-3 border border-paper-dark field-lan text-base md:text-lg ${dateValid ? '' : 'border-cinnabar'}`}
              />
              {!dateValid && (
                <p className="mt-1.5 text-xs text-cinnabar">请选择占问日期，月建、日辰、旬空皆由此推定</p>
              )}
              {dateValid && ziShiCrossDay && (
                <p className="mt-1.5 text-xs text-cinnabar">
                  已交子时，干支日以 23 时换日，此卦日辰、旬空、六神皆已按次日推算
                </p>
              )}
            </div>
          </div>
        </div>

        {method === 'coins' && (
          <div className="ce-page p-5 md:p-10 mb-4 md:mb-6 animate-slide-up relative overflow-hidden">
            <h3 className="text-lg md:text-2xl text-center mb-6 md:mb-8 text-ink">
              {currentStep < 6 
                ? <><span className="text-cinnabar text-xl md:text-3xl mr-1 ti-zi">{YAO_LABELS[currentStep]}爻</span>静心凝神，点击抛掷</>
                : '六爻已成，天机已显...'}
            </h3>
            
            <div className="flex justify-center gap-4 md:gap-8 mb-6 md:mb-10">
              {[0, 1, 2].map((i) => (
                <div key={i} className="scale-75 md:scale-100" style={{ animationDelay: `${i * 200}ms` }}>
                  <Coin
                    heads={coinResults ? coinResults[i] : COIN_RESTING_FACES[i]}
                    flipping={isFlipping}
                    delay={i * 100}
                  />
                </div>
              ))}
            </div>

            {coinResults && !isFlipping && currentStep < 6 && (
              <p className="text-center text-ink-light mb-2 animate-fade-in text-sm md:text-base">
                {readCoins(coinResults).caption}
              </p>
            )}
            <p className="text-center text-ink-light text-[11px] md:text-xs mb-4 md:mb-6">
              背为阳记三、字为阴记二：六老阴、七少阳、八少阴、九老阳
            </p>

            <div className="flex justify-center gap-3 md:gap-4 flex-wrap">
              <button
                onClick={handleToss}
                disabled={isFlipping || currentStep >= 6 || !dateValid}
                className="seal-btn seal-btn--yin px-8 md:px-12 py-3 md:py-4 text-lg md:text-xl"
              >
                {isFlipping ? '抛掷中...' : currentStep < 6 ? '抛掷铜钱' : '排盘中...'}
              </button>
              <button
                onClick={handleReset}
                className="seal-btn flex items-center gap-2 px-5 md:px-6 py-3 md:py-4"
              >
                <RotateCcw size={20} />
                重来
              </button>
            </div>

            <div className="mt-6 md:mt-10 flex justify-center gap-2 md:gap-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`h-1 w-8 md:w-12 transition-all duration-500 ${
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
          <div className="ce-page p-4 md:p-8 mb-4 md:mb-6 animate-slide-up">
            <h3 className="text-lg md:text-2xl text-center mb-6 md:mb-8 text-ink">手动选择每一爻的阴阳动变</h3>
            <div className="max-w-lg mx-auto space-y-2 md:space-y-4 mb-6 md:mb-8">
              {[5, 4, 3, 2, 1, 0].map((i) => (
                <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-2 md:p-3 border-b border-paper-dark py-2 transition-colors">
                  <span className="w-12 text-base md:text-lg">{YAO_LABELS[i]}爻</span>
                  <div className="flex gap-1.5 md:gap-2 flex-1 justify-start sm:justify-end w-full">
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
                          aria-pressed={selected}
                          aria-label={`${YAO_LABELS[i]}爻 ${opt.label}`}
                          className={`min-h-11 px-2.5 md:px-4 py-1.5 md:py-2 border transition-colors text-sm md:text-base ${
                            selected 
                              ? 'bg-cinnabar text-paper border-cinnabar' 
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
            <div className="flex flex-col items-center gap-3">
              {!manualComplete && (
                <p className="text-sm text-ink-light/80">
                  还需选择 <span className="text-cinnabar font-bold">{CN_NUM[6 - manualSelectedCount]}</span> 爻方可排盘
                </p>
              )}
              <div className="flex justify-center gap-3 md:gap-4 flex-wrap">
                <button
                  onClick={generateResult}
                  disabled={!manualComplete || !dateValid}
                  className="seal-btn seal-btn--yin px-8 md:px-12 py-3 md:py-4 text-lg md:text-xl"
                >
                  开始排盘
                </button>
                <button onClick={handleReset} className="seal-btn flex items-center gap-2 px-5 md:px-6 py-3 md:py-4">
                  <RotateCcw size={20} />
                  重置
                </button>
              </div>
            </div>
          </div>
        )}

        {method === 'time' && (
          <div className="ce-page p-6 md:p-10 mb-4 md:mb-6 animate-slide-up text-center">
            <div>
              <div className="mb-6 md:mb-8">
                <div className="yu-wei mx-auto mb-4 md:mb-6" aria-hidden="true" />
                <h3 className="text-xl md:text-2xl mb-3 md:mb-4 text-ink">梅花易数 天机起卦</h3>
                <p className="text-ink-light max-w-md mx-auto leading-relaxed text-sm md:text-base">
                  以年月日时起卦，不假人为，纯由天机。<br/>
                  年、月、日数相加除以8得上卦，加时辰数除以8得下卦，总数除以6得动爻。
                </p>
              </div>
              
              <div className="border-y border-paper-dark p-4 md:p-6 mb-5 md:mb-6 inline-block">
                <div className="flex items-center justify-center gap-3 text-ink-light text-sm md:text-base">
                  <Clock size={18} />
                  <span>选定时辰：
                    <span className="text-ink text-base md:text-lg">{date}</span>
                    <span className="text-cinnabar text-base md:text-lg mx-1">{SHICHEN[hourToShichen(hour)].name}</span>
                  </span>
                </div>
              </div>

              <div className="mb-6 md:mb-8">
                <p className="text-xs md:text-sm text-ink-light mb-3 tracking-wide">选择时辰</p>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-w-lg mx-auto">
                  {SHICHEN.map((sc, i) => {
                    const selected = hourToShichen(hour) === i
                    return (
                      <button
                        key={sc.name}
                        onClick={() => { autoTime.current = false; setHour(sc.hour) }}
                        aria-pressed={selected}
                        className={`min-h-11 px-1 py-1.5 md:py-2 border transition-colors text-xs md:text-sm ${
                          selected
                            ? 'bg-cinnabar text-paper border-cinnabar'
                            : 'border-paper-dark hover:border-cinnabar text-ink-light hover:text-ink'
                        }`}
                        title={`${sc.range} 时`}
                      >
                        <div>{sc.name}</div>
                        <div className={`text-[11px] md:text-xs ${selected ? 'text-paper/80' : 'text-ink-light/60'}`}>{sc.range}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={handleTimeDivination}
                  disabled={!dateValid}
                  className="seal-btn seal-btn--yin px-8 md:px-12 py-3 md:py-4 text-lg md:text-xl"
                >
                  天机起卦
                </button>
              </div>
            </div>
          </div>
        )}

        {method !== 'time' && (
          <div className="ce-page p-4 md:p-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <h3 className="text-lg md:text-xl text-center mb-4 md:mb-6 text-ink-light">
              {method === 'coins' && currentStep > 0 ? '卦象渐显' : '爻位待刻'}
            </h3>
            {previewYaos.every(y => y === null) ? (
              /* 刻本未刻处留空版，不列虚爻：首屏不必以六根空灰条充数 */
              <div className="kong-ban">待摇卦，此版未刻</div>
            ) : (
              <div className="flex flex-col items-center">
                {/* 预览自上而下排列，而摇卦自初爻起：延迟须依落爻先后，否则先摇出的初爻反等得最久 */}
                {previewYaos.map((yao, idx) => (
                  <YaoLine
                    key={5 - idx}
                    yao={yao}
                    label={YAO_LABELS[5 - idx]}
                    animate={yao !== null}
                    delay={(5 - idx) * 100}
                    size="sm"
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <HistoryDrawer open={historyOpen} onClose={() => setHistoryOpen(false)} />
      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
