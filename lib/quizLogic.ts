import type { Motion, PlaySign, SignConfig, MotionStep, Difficulty, QuizAnswer } from './types'
import { ALL_MOTIONS, ALL_PLAY_SIGNS } from './types'

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function generateSequence(
  sign: PlaySign,
  config: SignConfig,
  difficulty: Difficulty,
  activeSigns: PlaySign[] = []
): MotionStep[] {
  const numDecoys = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 3 : 5

  // Motions reserved for functional roles — exclude ALL active sign motions as decoys
  // so players never see another real sign and confuse it for the answer
  const reserved = new Set<Motion>([
    ...(config.useWipeOff ? [config.wipeOff] : []),
    config.signMap[sign],
    ...(config.useIndicator && config.indicator ? [config.indicator] : []),
    ...activeSigns.map((s) => config.signMap[s]),
  ])

  const decoyPool = ALL_MOTIONS.filter((m) => !reserved.has(m))
  const decoys = shuffle(decoyPool).slice(0, Math.min(numDecoys, decoyPool.length))

  const steps: MotionStep[] = []

  for (const d of decoys) {
    steps.push({ motion: d, role: 'decoy' })
  }

  if (config.useIndicator && config.indicator) {
    steps.push({ motion: config.indicator, role: 'indicator' })
  }

  steps.push({ motion: config.signMap[sign], role: 'sign' })

  return steps
}

export function generateHardSequence(
  realSign: PlaySign,
  config: SignConfig,
  activeSigns: PlaySign[]
): MotionStep[] {
  const useWipeOff = config.useWipeOff && Math.random() < 0.4

  if (!useWipeOff) {
    return generateSequence(realSign, config, 'hard', activeSigns)
  }

  // Pick a different sign to fake first
  const otherSigns = activeSigns.filter((s) => s !== realSign)
  if (otherSigns.length === 0) {
    return generateSequence(realSign, config, 'hard', activeSigns)
  }
  const fakeSign = pickRandom(otherSigns)

  const fakeReserved = new Set<Motion>([
    ...(config.useWipeOff ? [config.wipeOff] : []),
    config.signMap[fakeSign],
    ...(config.useIndicator && config.indicator ? [config.indicator] : []),
    ...activeSigns.map((s) => config.signMap[s]),
  ])
  const fakeDecoyPool = ALL_MOTIONS.filter((m) => !fakeReserved.has(m))
  const fakeDecoy = shuffle(fakeDecoyPool)[0]

  const steps: MotionStep[] = []

  // --- Fake sequence ---
  if (fakeDecoy) steps.push({ motion: fakeDecoy, role: 'decoy' })
  if (config.useIndicator && config.indicator) {
    steps.push({ motion: config.indicator, role: 'indicator' })
  }
  steps.push({ motion: config.signMap[fakeSign], role: 'sign' })

  // --- Wipe off ---
  steps.push({ motion: config.wipeOff, role: 'wipe-off' })

  // --- Real sequence ---
  const realSteps = generateSequence(realSign, config, 'hard', activeSigns)
  steps.push(...realSteps)

  return steps
}

export function buildQuizRound(
  sign: PlaySign,
  config: SignConfig,
  difficulty: Difficulty,
  activeSigns: PlaySign[]
): MotionStep[] {
  if (difficulty === 'hard') {
    return generateHardSequence(sign, config, activeSigns)
  }
  return generateSequence(sign, config, difficulty)
}

// Signs that shouldn't appear together as answer choices (contradictory instructions)
const CONFLICTING: Partial<Record<QuizAnswer, QuizAnswer[]>> = {
  bunt: ['take'],
  take: ['bunt'],
}

export function generateAnswerChoices(correct: QuizAnswer, activeSigns: PlaySign[]): QuizAnswer[] {
  const conflicts = CONFLICTING[correct] ?? []
  const others = shuffle(
    activeSigns.filter((s) => s !== correct && !conflicts.includes(s))
  ) as QuizAnswer[]

  // Always include 'swing-away' as a wrong-answer option (unless it's the correct answer)
  const wrongPool: QuizAnswer[] =
    correct === 'swing-away' ? others : ['swing-away', ...others]

  return shuffle([correct, ...wrongPool.slice(0, 3)])
}

/** Generate a decoy-only sequence — no sign, batter should swing away */
export function buildSwingAwayRound(config: SignConfig, difficulty: Difficulty, activeSigns: PlaySign[]): MotionStep[] {
  const numDecoys = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 4 : 6
  const reserved = new Set<Motion>([
    ...(config.useWipeOff ? [config.wipeOff] : []),
    ...(config.useIndicator && config.indicator ? [config.indicator] : []),
    // Exclude active sign motions — showing them would look like a real sign was given
    ...activeSigns.map((s) => config.signMap[s]),
  ])
  const pool = ALL_MOTIONS.filter((m) => !reserved.has(m))
  return shuffle(pool).slice(0, Math.min(numDecoys, pool.length)).map((m) => ({ motion: m, role: 'decoy' as const }))
}

/** ~20% chance of a swing-away round (more likely on harder difficulties) */
export function shouldPlaySwingAway(difficulty: Difficulty): boolean {
  const prob = difficulty === 'easy' ? 0.15 : difficulty === 'medium' ? 0.2 : 0.25
  return Math.random() < prob
}

/** Returns the correct PlaySign from a sequence (the LAST sign-role motion) */
export function getCorrectSign(
  steps: MotionStep[],
  config: SignConfig
): PlaySign | null {
  const signSteps = steps.filter((s) => s.role === 'sign')
  const lastSignMotion = signSteps[signSteps.length - 1]?.motion
  if (!lastSignMotion) return null

  const entry = Object.entries(config.signMap).find(([, m]) => m === lastSignMotion)
  return (entry?.[0] as PlaySign) ?? null
}

export function pickRandomSign(activeSigns: PlaySign[]): PlaySign {
  return pickRandom(activeSigns)
}
