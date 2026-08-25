import { Yao } from '../types'

const LABEL_CLASS = 'ml-10 w-8 text-sm text-ink-light'

interface YaoLineProps {
  yao: Yao | null
  label?: string
  showChanging?: boolean
  size?: 'sm' | 'md' | 'lg'
  animate?: boolean
  delay?: number
}

export default function YaoLine({ yao, label, showChanging = true, size = 'md', animate = false, delay = 0 }: YaoLineProps) {
  const sizeClasses = {
    sm: { line: 'yao-tiao', yang: 'w-20 md:w-24', yinGap: 'w-20 md:w-24 [&>*]:w-8 md:[&>*]:w-10', space: 'my-1 md:my-2' },
    md: { line: 'yao-tiao', yang: 'w-24 md:w-32', yinGap: 'w-24 md:w-32 [&>*]:w-9 md:[&>*]:w-12', space: 'my-1.5 md:my-2' },
    lg: { line: 'yao-tiao', yang: 'w-28 md:w-40', yinGap: 'w-28 md:w-40 [&>*]:w-10 md:[&>*]:w-14', space: 'my-2 md:my-3' },
  }[size]

  if (!yao) {
    return (
      <div className={`flex items-center justify-center ${sizeClasses.space}`}>
        <div className={`${sizeClasses.line} yao-jing ${sizeClasses.yang}`} />
        {label && <span className={LABEL_CLASS}>{label}</span>}
      </div>
    )
  }

  const lineClass = yao.changing ? 'yao-bian' : 'yao-ink'
  return (
    <div
      className={`relative flex items-center justify-center ${sizeClasses.space} ${animate ? 'animate-yao-reveal' : ''}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="relative">
        {yao.yin ? (
          <div className={`${sizeClasses.line} ${sizeClasses.yinGap} flex justify-between`}>
            <div className={`${lineClass} yao-tiao`} />
            <div className={`${lineClass} yao-tiao`} />
          </div>
        ) : (
          <div className={`${sizeClasses.line} ${lineClass} ${sizeClasses.yang}`} />
        )}
        {showChanging && yao.changing && (
          <div className="zhu-quan absolute -right-8 top-1/2 -translate-y-1/2" aria-label="动爻">
            {yao.yin ? '×' : '○'}
          </div>
        )}
      </div>
      {label && <span className={LABEL_CLASS}>{label}</span>}
    </div>
  )
}
