'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { QuizAnswer } from '@/lib/types'
import { QUIZ_ANSWER_LABELS, QUIZ_ANSWER_EMOJIS, QUIZ_ANSWER_DESCRIPTIONS, QUIZ_ANSWER_COLORS } from '@/lib/types'

interface QuizPanelProps {
  choices: QuizAnswer[]
  correctSign: QuizAnswer
  playerAnswer: QuizAnswer | null
  onAnswer: (answer: QuizAnswer) => void
  state: 'answering' | 'feedback'
}

export default function QuizPanel({
  choices,
  correctSign,
  playerAnswer,
  onAnswer,
  state,
}: QuizPanelProps) {
  const isAnswering = state === 'answering'

  return (
    <div className="grid grid-cols-1 gap-3 w-full max-w-sm">
      {choices.map((sign) => {
        const colors = QUIZ_ANSWER_COLORS[sign]
        const isCorrect = sign === correctSign
        const isSelected = sign === playerAnswer
        const showResult = state === 'feedback'

        let buttonState: 'idle' | 'correct' | 'wrong' = 'idle'
        if (showResult) {
          if (isCorrect) buttonState = 'correct'
          else if (isSelected) buttonState = 'wrong'
        }

        return (
          <motion.button
            key={sign}
            whileTap={{ scale: isAnswering ? 0.97 : 1 }}
            onClick={() => isAnswering && onAnswer(sign)}
            disabled={!isAnswering}
            className={[
              'relative flex items-center gap-4 w-full rounded-xl border-2 px-5 py-4 text-left transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
              isAnswering
                ? `${colors.bg} ${colors.border} hover:brightness-125 cursor-pointer active:scale-[0.97]`
                : 'cursor-default',
              buttonState === 'correct'
                ? 'bg-green-500/30 border-green-400 ring-2 ring-green-400'
                : buttonState === 'wrong'
                ? 'bg-red-500/20 border-red-500'
                : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <span className="text-2xl flex-shrink-0">{QUIZ_ANSWER_EMOJIS[sign]}</span>
            <div className="flex-1 min-w-0">
              <p
                className={`font-bold text-base leading-tight ${
                  buttonState === 'correct'
                    ? 'text-green-300'
                    : buttonState === 'wrong'
                    ? 'text-red-300'
                    : colors.text
                }`}
              >
                {QUIZ_ANSWER_LABELS[sign]}
              </p>
              <p className="text-xs text-slate-400 leading-snug mt-0.5 line-clamp-1">
                {QUIZ_ANSWER_DESCRIPTIONS[sign]}
              </p>
            </div>

            {/* Result badge */}
            <AnimatePresence>
              {showResult && isCorrect && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm"
                >
                  ✓
                </motion.span>
              )}
              {showResult && isSelected && !isCorrect && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm"
                >
                  ✗
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        )
      })}
    </div>
  )
}
