'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import type { QuizAnswer } from '@/lib/types'
import { QUIZ_ANSWER_LABELS, QUIZ_ANSWER_EMOJIS, QUIZ_ANSWER_DESCRIPTIONS, QUIZ_ANSWER_COLORS } from '@/lib/types'

interface QuizPanelProps {
  choices: QuizAnswer[]
  correctSigns: QuizAnswer[]
  playerAnswers: QuizAnswer[]
  onToggle: (answer: QuizAnswer) => void
  onSubmit: () => void
  state: 'answering' | 'feedback'
}

export default function QuizPanel({
  choices,
  correctSigns,
  playerAnswers,
  onToggle,
  onSubmit,
  state,
}: QuizPanelProps) {
  const isAnswering = state === 'answering'
  const isFeedback = state === 'feedback'

  return (
    <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
      {choices.map((sign) => {
        const colors = QUIZ_ANSWER_COLORS[sign]
        const isSelected = playerAnswers.includes(sign)
        const isCorrect = correctSigns.includes(sign)

        // Feedback state: what happened with this button?
        let feedbackState: 'correct-hit' | 'wrong-hit' | 'missed' | 'neutral' = 'neutral'
        if (isFeedback) {
          if (isCorrect && isSelected) feedbackState = 'correct-hit'
          else if (!isCorrect && isSelected) feedbackState = 'wrong-hit'
          else if (isCorrect && !isSelected) feedbackState = 'missed'
        }

        return (
          <motion.button
            key={sign}
            whileTap={{ scale: isAnswering ? 0.97 : 1 }}
            onClick={() => isAnswering && onToggle(sign)}
            disabled={!isAnswering}
            className={[
              'relative flex items-center gap-4 w-full rounded-xl border-2 px-5 py-3 text-left transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
              isAnswering
                ? isSelected
                  ? `${colors.bg} ${colors.border} ring-2 ${colors.border.replace('border-', 'ring-')} cursor-pointer`
                  : `bg-slate-900 border-slate-700 hover:border-slate-500 cursor-pointer`
                : 'cursor-default',
              feedbackState === 'correct-hit'
                ? 'bg-green-500/30 border-green-400 ring-2 ring-green-400'
                : feedbackState === 'wrong-hit'
                ? 'bg-red-500/20 border-red-500'
                : feedbackState === 'missed'
                ? 'bg-amber-500/10 border-amber-600'
                : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <span className="text-xl flex-shrink-0">{QUIZ_ANSWER_EMOJIS[sign]}</span>
            <div className="flex-1 min-w-0">
              <p
                className={`font-bold text-sm leading-tight ${
                  feedbackState === 'correct-hit'
                    ? 'text-green-300'
                    : feedbackState === 'wrong-hit'
                    ? 'text-red-300'
                    : feedbackState === 'missed'
                    ? 'text-amber-400'
                    : isSelected
                    ? colors.text
                    : 'text-slate-300'
                }`}
              >
                {QUIZ_ANSWER_LABELS[sign]}
              </p>
              <p className="text-xs text-slate-500 leading-snug mt-0.5 line-clamp-1">
                {QUIZ_ANSWER_DESCRIPTIONS[sign]}
              </p>
            </div>

            {/* Result badge */}
            <AnimatePresence>
              {feedbackState === 'correct-hit' && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex-shrink-0 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xs"
                >
                  ✓
                </motion.span>
              )}
              {feedbackState === 'wrong-hit' && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex-shrink-0 w-7 h-7 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-xs"
                >
                  ✗
                </motion.span>
              )}
              {feedbackState === 'missed' && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-xs"
                >
                  !
                </motion.span>
              )}
              {isAnswering && isSelected && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs ${colors.border.replace('border-', 'bg-')}`}
                >
                  ✓
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        )
      })}

      {/* Submit button */}
      {isAnswering && (
        <Button
          onClick={onSubmit}
          disabled={playerAnswers.length === 0}
          className="w-full h-12 mt-1 font-bold bg-green-600 hover:bg-green-500 disabled:opacity-30 text-white"
        >
          Submit Answer{playerAnswers.length > 1 ? 's' : ''}
        </Button>
      )}
    </div>
  )
}
