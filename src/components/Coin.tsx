interface CoinProps {
  /** true 为「字」面向上（阴面记二），false 为「背」面向上（阳面记三） */
  heads: boolean
  flipping: boolean
  delay?: number
}

// 铜钱圆而方孔。二面之别不可只靠深浅：
// 背作实赭一枚，字作白文描边并留四点铭文之痕，隔着一臂也分得清
export default function Coin({ heads, flipping, delay = 0 }: CoinProps) {
  return (
    <div
      className={`relative flex h-16 w-16 select-none items-center justify-center rounded-full border border-ocher-deep ${
        heads ? 'bg-paper' : 'bg-ocher'
      } ${flipping ? 'animate-coin-flip' : ''}`}
      style={{ animationDelay: `${delay}ms` }}
      aria-label={heads ? '铜钱字面' : '铜钱背面'}
    >
      {/* 内郭一道，钱肉与方孔之间的界 */}
      <span
        className={`absolute inset-[9px] rounded-full border ${heads ? 'border-ocher-deep/35' : 'border-paper/60'}`}
        aria-hidden="true"
      />
      {heads && (
        <>
          <span className="absolute left-1/2 top-[13px] h-[3px] w-[3px] -translate-x-1/2 bg-ocher-deep" aria-hidden="true" />
          <span className="absolute bottom-[13px] left-1/2 h-[3px] w-[3px] -translate-x-1/2 bg-ocher-deep" aria-hidden="true" />
          <span className="absolute left-[13px] top-1/2 h-[3px] w-[3px] -translate-y-1/2 bg-ocher-deep" aria-hidden="true" />
          <span className="absolute right-[13px] top-1/2 h-[3px] w-[3px] -translate-y-1/2 bg-ocher-deep" aria-hidden="true" />
        </>
      )}
      {/* 方孔：字面见墨赭，背面见纸 */}
      <span
        className={`h-[7px] w-[7px] ${heads ? 'bg-ocher-deep' : 'bg-paper'}`}
        aria-hidden="true"
      />
      <span className="sr-only">{heads ? '字' : '背'}</span>
    </div>
  )
}
