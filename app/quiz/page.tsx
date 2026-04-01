'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import CoachAvatar from '@/components/coach/CoachAvatar'
import QuizPanel from '@/components/quiz/QuizPanel'
import ScoreTracker from '@/components/quiz/ScoreTracker'
import type { PlaySign, SignConfig, MotionStep, Difficulty, QuizAnswer } from '@/lib/types'
import { ALL_PLAY_SIGNS, QUIZ_ANSWER_LABELS, QUIZ_ANSWER_EMOJIS } from '@/lib/types'
import { loadConfig } from '@/lib/signConfig'
import {
  buildQuizRound,
  buildSwingAwayRound,
  shouldPlaySwingAway,
  getCorrectSigns,
} from '@/lib/quizLogic'
import { SPEED_MULT } from '@/lib/animationSequences'

type GameState = 'idle' | 'animating' | 'answering' | 'feedback' | 'complete'

const TOTAL_ROUNDS = 10
const FEEDBACK_DELAY = 1800

const DIFFICULTY_META: Record<
  Difficulty,
  { label: string; color: string; badge: string; description: string }
> = {
  easy: {
    label: 'Easy',
    color: 'bg-green-600 hover:bg-green-500',
    badge: 'bg-green-500/20 text-green-300 border-green-700',
    description: '1 sign · 1 decoy · slow',
  },
  medium: {
    label: 'Medium',
    color: 'bg-amber-600 hover:bg-amber-500',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-700',
    description: 'up to 2 signs · 3 decoys · normal speed',
  },
  hard: {
    label: 'Hard',
    color: 'bg-red-700 hover:bg-red-600',
    badge: 'bg-red-500/20 text-red-300 border-red-700',
    description: 'up to 3 signs · 5 decoys · fast · wipe-offs',
  },
}

export default function QuizPage() {
  const [config, setConfig] = useState<SignConfig | null>(null)
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [gameState, setGameState] = useState<GameState>('idle')
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [sequence, setSequence] = useState<MotionStep[]>([])
  const [correctAnswers, setCorrectAnswers] = useState<QuizAnswer[]>([])
  const [choices, setChoices] = useState<QuizAnswer[]>([])
  const [playerAnswers, setPlayerAnswers] = useState<QuizAnswer[]>([])
  const [playCount, setPlayCount] = useState(0)

  useEffect(() => {
    setConfig(loadConfig())
  }, [])

  const startRound = useCallback((cfg: SignConfig, diff: Difficulty) => {
    const activeSigns = ALL_PLAY_SIGNS.filter((s) => cfg.activeSignsMap[s])

    let seq: MotionStep[]
    let answers: QuizAnswer[]

    if (shouldPlaySwingAway(diff)) {
      seq = buildSwingAwayRound(cfg, diff, activeSigns)
      answers = ['swing-away']
    } else {
      seq = buildQuizRound(cfg, diff, activeSigns)
      answers = getCorrectSigns(seq, cfg)
    }

    // Choices: all active signs + swing-away
    const allChoices: QuizAnswer[] = [...activeSigns, 'swing-away']

    setSequence(seq)
    setCorrectAnswers(answers)
    setChoices(allChoices)
    setPlayerAnswers([])
    setGameState('animating')
    setPlayCount((c) => c + 1)
  }, [])

  function handleStart() {
    if (!config) return
    setRound(0)
    setScore(0)
    setStreak(0)
    startRound(config, difficulty)
    setRound(1)
  }

  function handleAnimationComplete() {
    setGameState('answering')
  }

  function handleToggle(answer: QuizAnswer) {
    if (gameState !== 'answering') return
    setPlayerAnswers((prev) => {
      if (answer === 'swing-away') {
        // Swing-away is mutually exclusive with sign selections
        return prev.includes('swing-away') ? [] : ['swing-away']
      }
      // Selecting a sign clears swing-away, then toggles the sign
      const withoutSwingAway = prev.filter((a) => a !== 'swing-away')
      return withoutSwingAway.includes(answer as PlaySign)
        ? withoutSwingAway.filter((a) => a !== answer)
        : [...withoutSwingAway, answer]
    })
  }

  function handleSubmit() {
    if (gameState !== 'answering' || playerAnswers.length === 0) return
    setGameState('feedback')

    const isCorrect =
      playerAnswers.length === correctAnswers.length &&
      playerAnswers.every((a) => correctAnswers.includes(a))

    if (isCorrect) {
      setScore((s) => s + 1)
      setStreak((s) => s + 1)
    } else {
      setStreak(0)
    }

    setTimeout(() => {
      if (!config) return
      if (round >= TOTAL_ROUNDS) {
        setGameState('complete')
      } else {
        setRound((r) => r + 1)
        startRound(config, difficulty)
      }
    }, FEEDBACK_DELAY)
  }

  function handleReplay() {
    setPlayCount((c) => c + 1)
    setGameState('animating')
    setPlayerAnswers([])
  }

  function handleRestart() {
    setGameState('idle')
    setRound(0)
    setScore(0)
    setStreak(0)
    setPlayCount(0)
    setSequence([])
    setPlayerAnswers([])
  }

  if (!config) return null

  const diff = DIFFICULTY_META[difficulty]

  // ── IDLE: difficulty picker ──
  if (gameState === 'idle') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 gap-8 max-w-sm mx-auto">
        <Link href="/" className="self-start">
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200 -ml-2">
            ‹ Back
          </Button>
        </Link>

        <div className="text-center space-y-1">
          <div className="text-4xl mb-1">🎯</div>
          <h1 className="text-2xl font-bold text-white">Practice Quiz</h1>
          <p className="text-slate-400 text-sm">{TOTAL_ROUNDS} rounds per game</p>
        </div>

        <div className="w-full space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Choose Difficulty
          </p>
          {(Object.keys(DIFFICULTY_META) as Difficulty[]).map((d) => {
            const meta = DIFFICULTY_META[d]
            const isSelected = difficulty === d
            return (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={[
                  'w-full text-left rounded-xl border-2 px-4 py-3 transition-all',
                  isSelected
                    ? 'border-white bg-slate-800'
                    : 'border-slate-700 bg-slate-900 hover:border-slate-500',
                ].join(' ')}
              >
                <div className="flex items-center gap-2">
                  <p className="font-bold text-white">{meta.label}</p>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{meta.description}</p>
              </button>
            )
          })}
        </div>

        <Button
          onClick={handleStart}
          className="w-full h-14 text-lg font-bold bg-green-600 hover:bg-green-500 text-white"
        >
          Start Game
        </Button>

        <Link href="/setup" className="text-slate-500 hover:text-slate-300 text-sm underline underline-offset-2 transition-colors">
          Edit sign setup
        </Link>
      </main>
    )
  }

  // ── COMPLETE ──
  if (gameState === 'complete') {
    const pct = Math.round((score / TOTAL_ROUNDS) * 100)
    const passed = score >= 9
    const nextDifficulty: Difficulty | null =
      difficulty === 'easy' ? 'medium' : difficulty === 'medium' ? 'hard' : null
    const emoji = passed ? (nextDifficulty ? '⭐' : '🏆') : pct >= 50 ? '👍' : '💪'
    const message = passed
      ? nextDifficulty
        ? `Nice work! Ready for ${DIFFICULTY_META[nextDifficulty].label}?`
        : "You've mastered Hard — that's the whole playbook!"
      : "Keep practicing — you'll get it!"

    function handlePlayAt(d: Difficulty) {
      setDifficulty(d)
      setRound(0)
      setScore(0)
      setStreak(0)
      setPlayCount(0)
      setSequence([])
      setPlayerAnswers([])
      if (!config) return
      startRound(config, d)
      setRound(1)
    }

    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 gap-6 max-w-sm mx-auto text-center">
        <div className="text-6xl">{emoji}</div>
        <div>
          <h1 className="text-3xl font-bold text-white">{score} / {TOTAL_ROUNDS}</h1>
          <p className="text-slate-400 mt-1">{message}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={diff.badge}>
            {diff.label}
          </Badge>
          <span className="text-slate-500 text-sm">{pct}% correct</span>
        </div>
        <div className="flex flex-col gap-3 w-full">
          {passed && nextDifficulty ? (
            <Button
              onClick={() => handlePlayAt(nextDifficulty)}
              className={`w-full h-12 font-bold text-white ${DIFFICULTY_META[nextDifficulty].color}`}
            >
              Try {DIFFICULTY_META[nextDifficulty].label} →
            </Button>
          ) : (
            <Button
              onClick={() => handlePlayAt(difficulty)}
              className="w-full h-12 font-bold bg-green-600 hover:bg-green-500"
            >
              {passed ? 'Play Again' : 'Try Again'}
            </Button>
          )}
          <Link href="/setup">
            <Button variant="outline" className="w-full border-slate-700 text-slate-300">
              Edit Sign Setup
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="w-full text-slate-500 hover:text-slate-300">
              Back to Home
            </Button>
          </Link>
        </div>
      </main>
    )
  }

  // ── ACTIVE GAME ──
  const isAnswering = gameState === 'answering'
  const isFeedback = gameState === 'feedback'
  const isAnimating = gameState === 'animating'
  const isCorrect =
    playerAnswers.length === correctAnswers.length &&
    playerAnswers.every((a) => correctAnswers.includes(a))

  return (
    <main className="min-h-screen flex flex-col items-center p-6 gap-5 max-w-sm mx-auto">
      {/* Top bar */}
      <div className="w-full flex items-center justify-between">
        <button onClick={handleRestart} className="text-slate-400 hover:text-slate-200 text-sm">
          ‹ Quit
        </button>
        <Badge variant="outline" className={diff.badge}>
          {diff.label}
        </Badge>
        <Link href="/setup" className="text-slate-500 hover:text-slate-300 text-xs transition-colors">
          Setup
        </Link>
      </div>

      <ScoreTracker
        score={score}
        total={round - 1}
        streak={streak}
        round={round}
        totalRounds={TOTAL_ROUNDS}
      />

      {/* Coach avatar */}
      <div className="flex flex-col items-center gap-2 w-full">
        <div className="text-xs text-slate-600 uppercase tracking-wide">
          {isAnimating ? 'Watch carefully…' : isAnswering ? 'What sign(s) were given?' : ''}
        </div>
        <CoachAvatar
          sequence={sequence}
          playCount={playCount}
          speed={SPEED_MULT[difficulty]}
          onComplete={handleAnimationComplete}
        />
      </div>

      {/* Replay button */}
      {isAnswering && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReplay}
          className="text-slate-500 hover:text-slate-300 text-xs border border-slate-700"
        >
          ↺ Watch again
        </Button>
      )}

      {/* Feedback banner */}
      <AnimatePresence>
        {isFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            className={[
              'w-full rounded-xl border px-5 py-3 flex items-center gap-3',
              isCorrect
                ? 'bg-green-950/50 border-green-700'
                : 'bg-red-950/40 border-red-800',
            ].join(' ')}
          >
            <span className="text-2xl">{isCorrect ? '✅' : '❌'}</span>
            <div>
              <p className={`font-bold text-sm ${isCorrect ? 'text-green-300' : 'text-red-300'}`}>
                {isCorrect ? 'Correct!' : 'Not quite…'}
              </p>
              {!isCorrect && (
                <p className="text-xs text-slate-400">
                  {correctAnswers.length === 1 && correctAnswers[0] === 'swing-away'
                    ? 'No sign was given — swing away'
                    : <>
                        Answer:{' '}
                        <span className="text-white font-semibold">
                          {correctAnswers
                            .map((a) => `${QUIZ_ANSWER_EMOJIS[a]} ${QUIZ_ANSWER_LABELS[a]}`)
                            .join(' + ')}
                        </span>
                      </>
                  }
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Answer panel */}
      {(isAnswering || isFeedback) && (
        <QuizPanel
          choices={choices}
          correctSigns={correctAnswers}
          playerAnswers={playerAnswers}
          onToggle={handleToggle}
          onSubmit={handleSubmit}
          state={isFeedback ? 'feedback' : 'answering'}
        />
      )}

      {/* Waiting message during animation */}
      {isAnimating && (
        <div className="w-full max-w-sm space-y-2 opacity-30">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-slate-800 animate-pulse" />
          ))}
        </div>
      )}
    </main>
  )
}
