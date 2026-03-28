import type { Motion, PlaySign, SignConfig, MotionStep, Difficulty, QuizAnswer } from './types'
import { ALL_MOTIONS } from './types'

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

// Signs that can't appear together in the same round
const SIGN_CONFLICTS: Partial<Record<PlaySign, PlaySign[]>> = {
  steal: ['delayed-steal'],
  'delayed-steal': ['steal'],
}

function pickSignsForRound(activeSigns: PlaySign[], count: number): PlaySign[] {
  const shuffled = shuffle(activeSigns)
  const selected: PlaySign[] = []
  for (const sign of shuffled) {
    if (selected.length >= count) break
    const conflicts = SIGN_CONFLICTS[sign] ?? []
    const hasConflict = selected.some(
      (s) => conflicts.includes(s) || (SIGN_CONFLICTS[s] ?? []).includes(sign)
    )
    if (!hasConflict) selected.push(sign)
  }
  return selected
}

function buildSignSequence(
  signs: PlaySign[],
  config: SignConfig,
  difficulty: Difficulty,
  activeSigns: PlaySign[]
): MotionStep[] {
  const numDecoys = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 3 : 5

  // Only non-sign, non-reserved motions can be decoys
  const reserved = new Set<Motion>([
    ...(config.useWipeOff ? [config.wipeOff] : []),
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

  for (const sign of signs) {
    steps.push({ motion: config.signMap[sign], role: 'sign' })
  }

  return steps
}

export function buildQuizRound(
  config: SignConfig,
  difficulty: Difficulty,
  activeSigns: PlaySign[]
): MotionStep[] {
  // Easy: always 1 sign. Medium: 1–2. Hard: 1–3.
  const maxSigns = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3
  const numSigns = difficulty === 'easy' ? 1 : Math.floor(Math.random() * maxSigns) + 1

  const signs = pickSignsForRound(activeSigns, numSigns)
  if (signs.length === 0) return buildSwingAwayRound(config, difficulty, activeSigns)

  // Hard mode: sometimes show a fake sequence, wipe it off, then show the real one
  if (difficulty === 'hard' && config.useWipeOff && Math.random() < 0.4) {
    const otherSigns = activeSigns.filter((s) => !signs.includes(s))
    if (otherSigns.length > 0) {
      const fakeSign = pickRandom(otherSigns)
      const fakeSteps = buildSignSequence([fakeSign], config, 'hard', activeSigns)
      const realSteps = buildSignSequence(signs, config, 'hard', activeSigns)
      return [
        ...fakeSteps,
        { motion: config.wipeOff, role: 'wipe-off' as const },
        ...realSteps,
      ]
    }
  }

  return buildSignSequence(signs, config, difficulty, activeSigns)
}

/**
 * Returns the correct QuizAnswer[] for a sequence.
 * Only looks at steps after the last wipe-off.
 * Returns ['swing-away'] if no sign steps are found.
 */
export function getCorrectSigns(steps: MotionStep[], config: SignConfig): QuizAnswer[] {
  const lastWipeOffIndex = steps.reduce(
    (last, step, i) => (step.role === 'wipe-off' ? i : last),
    -1
  )

  const relevantSteps = steps.slice(lastWipeOffIndex + 1)
  const signSteps = relevantSteps.filter((s) => s.role === 'sign')

  if (signSteps.length === 0) return ['swing-away']

  return signSteps
    .map((step) => {
      const entry = Object.entries(config.signMap).find(([, m]) => m === step.motion)
      return entry?.[0] as PlaySign | undefined
    })
    .filter((s): s is PlaySign => s !== undefined)
}

/**
 * Generate a single-sign demo sequence (used by the Learn screen).
 * Decoys are only non-sign motions so the sign is unambiguous.
 */
export function generateSequence(
  sign: PlaySign,
  config: SignConfig,
  difficulty: Difficulty
): MotionStep[] {
  const activeSigns = Object.entries(config.activeSignsMap)
    .filter(([, active]) => active)
    .map(([s]) => s as PlaySign)
  return buildSignSequence([sign], config, difficulty, activeSigns)
}

/** Generate a decoy-only sequence — no sign, batter should swing away */
export function buildSwingAwayRound(
  config: SignConfig,
  difficulty: Difficulty,
  activeSigns: PlaySign[]
): MotionStep[] {
  const numDecoys = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 4 : 6
  const reserved = new Set<Motion>([
    ...(config.useWipeOff ? [config.wipeOff] : []),
    ...(config.useIndicator && config.indicator ? [config.indicator] : []),
    ...activeSigns.map((s) => config.signMap[s]),
  ])
  const pool = ALL_MOTIONS.filter((m) => !reserved.has(m))
  return shuffle(pool)
    .slice(0, Math.min(numDecoys, pool.length))
    .map((m) => ({ motion: m, role: 'decoy' as const }))
}

/** ~20% chance of a swing-away round (more likely on harder difficulties) */
export function shouldPlaySwingAway(difficulty: Difficulty): boolean {
  const prob = difficulty === 'easy' ? 0.15 : difficulty === 'medium' ? 0.2 : 0.25
  return Math.random() < prob
}
