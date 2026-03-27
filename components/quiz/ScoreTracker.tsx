'use client'

import { motion } from 'framer-motion'

interface ScoreTrackerProps {
  score: number
  total: number
  streak: number
  round: number
  totalRounds: number
}

export default function ScoreTracker({
  score,
  total,
  streak,
  round,
  totalRounds,
}: ScoreTrackerProps) {
  const progress = total > 0 ? (round / totalRounds) * 100 : 0

  return (
    <div className="w-full max-w-sm space-y-3">
      {/* Progress bar */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 w-16 text-right">
          {round}/{totalRounds}
        </span>
        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-green-500 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-bold text-white">{score}</span>
          <span className="text-slate-400 text-sm">/ {total} correct</span>
        </div>

        {streak >= 3 && (
          <motion.div
            key={streak}
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40"
          >
            <span className="text-sm">🔥</span>
            <span className="text-xs font-bold text-amber-400">{streak} streak</span>
          </motion.div>
        )}
      </div>
    </div>
  )
}
