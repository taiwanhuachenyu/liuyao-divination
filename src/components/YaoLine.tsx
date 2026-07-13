import { Yao } from '../types'

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
    sm: { line: 'h-2 md:h-3', yang: 'w-20 md:w-24', yinGap: 'w-20 md:w-24 [&>*]:w-8 md:[&>*]:w-10 [&>*]:h-2 md:[&>*]:h-3', space: 'my-1 md:my-2' },
    md: { line: 'h-3 md:h-4', yang: 'w-24 md:w-32', yinGap: 'w-24 md:w-32 [&>*]:w-9 md:[&>*]:w-12 [&>*]:h-3 md:[&>*]:h-4', space: 'my-1.5 md:my-2' },
    lg: { line: 'h-3 md:h-4', yang: 'w-28 md:w-40', yinGap: 'w-28 md:w-40 [&>*]:w-10 md:[&>*]:w-14 [&>*]:h-3 md:[&>*]:h-4', space: 'my-2 md:my-3' },
  }[size]

  if (!yao) {
    return (
      <div className={`flex items-center justify-center ${sizeClasses.space}`}>
        <div className={`${sizeClasses.line} bg-ink/10 rounded ${sizeClasses.yang}`} />
        {label && <span className="ml-4 text-sm text-ink-light w-8">{label}</span>}
      </div>
    )
  }

  return (
    <div 
      className={`flex items-center justify-center relative ${sizeClasses.space} ${animate ? 'animate-yao-reveal' : ''}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="relative">
        {yao.yin ? (
          <div className={`${sizeClasses.line} ${sizeClasses.yinGap} flex justify-between rounded`}>
            <div className="bg-ink rounded" />
            <div className="bg-ink rounded" />
          </div>
        ) : (
          <div className={`${sizeClasses.line} bg-ink rounded ${sizeClasses.yang}`} />
        )}
        {showChanging && yao.changing && (
          <div className="changing-mark">
            {yao.yin ? '×' : '○'}
          </div>
        )}
      </div>
      {label && <span className="ml-4 text-sm text-ink-light w-8">{label}</span>}
    </div>
  )
}
