interface CoinProps {
  heads: boolean
  flipping: boolean
  delay?: number
}

export default function Coin({ heads, flipping, delay = 0 }: CoinProps) {
  return (
    <div
      className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold select-none
        ${flipping ? 'animate-coin-flip' : ''}
        ${heads ? 'bg-gradient-to-br from-yellow-600 to-yellow-800 text-yellow-100' : 'bg-gradient-to-br from-amber-200 to-amber-400 text-amber-800'}
        shadow-lg border-2 ${heads ? 'border-yellow-900' : 'border-amber-500'}
      `}
      style={{ animationDelay: `${delay}ms` }}
    >
      {heads ? '字' : '背'}
    </div>
  )
}
