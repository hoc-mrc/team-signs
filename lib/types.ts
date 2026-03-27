export type Motion =
  | 'wipe-down-arm'
  | 'wipe-up-arm'
  | 'touch-nose'
  | 'touch-chin'
  | 'touch-hat-brim'
  | 'wipe-hat-brim'
  | 'touch-belt'
  | 'touch-chest'
  | 'wipe-chest'
  | 'touch-thigh'
  | 'wipe-down-thigh'
  | 'touch-wrist'
  | 'touch-left-ear'
  | 'touch-right-ear'

export const ALL_MOTIONS: Motion[] = [
  'touch-nose',
  'touch-chin',
  'touch-left-ear',
  'touch-right-ear',
  'touch-hat-brim',
  'wipe-hat-brim',
  'touch-belt',
  'touch-chest',
  'wipe-chest',
  'touch-thigh',
  'wipe-down-thigh',
  'touch-wrist',
  'wipe-down-arm',
  'wipe-up-arm',
]

export const MOTION_LABELS: Record<Motion, string> = {
  'touch-nose': 'Touch Nose',
  'touch-chin': 'Touch Chin',
  'touch-left-ear': 'Touch Left Ear',
  'touch-right-ear': 'Touch Right Ear',
  'touch-hat-brim': 'Touch Hat Brim',
  'wipe-hat-brim': 'Wipe Hat Brim',
  'touch-belt': 'Touch Belt',
  'touch-chest': 'Touch Chest',
  'wipe-chest': 'Wipe Chest',
  'touch-thigh': 'Touch Thigh',
  'wipe-down-thigh': 'Wipe Down Thigh',
  'touch-wrist': 'Touch Wrist',
  'wipe-down-arm': 'Wipe Down Arm',
  'wipe-up-arm': 'Wipe Up Arm',
}

export type PlaySign =
  | 'bunt'
  | 'steal'
  | 'take'
  | 'delayed-steal'
  | 'green-light'
  | 'sacrifice-bunt'
  | 'hit-and-run'

export const ALL_PLAY_SIGNS: PlaySign[] = [
  'bunt',
  'steal',
  'take',
  'delayed-steal',
  'green-light',
  'sacrifice-bunt',
  'hit-and-run',
]

export const SIGN_LABELS: Record<PlaySign, string> = {
  bunt: 'Bunt',
  steal: 'Steal',
  take: 'Take',
  'delayed-steal': 'Delayed Steal',
  'green-light': 'Green Light',
  'sacrifice-bunt': 'Sacrifice Bunt',
  'hit-and-run': 'Hit & Run',
}

export const SIGN_DESCRIPTIONS: Record<PlaySign, string> = {
  bunt: 'Bunt on the next pitch',
  steal: 'Steal on the next pitch',
  take: 'Do not swing at the next pitch',
  'delayed-steal': "Break for the next base on the catcher's throw back to the pitcher",
  'green-light': 'Steal on your own, or swing away on a 3-0 count',
  'sacrifice-bunt': 'Bunt to advance the runner, even if you make an out',
  'hit-and-run': 'Swing at the pitch while the runner steals',
}

export const SIGN_EMOJIS: Record<PlaySign, string> = {
  bunt: '🏏',
  steal: '💨',
  take: '✋',
  'delayed-steal': '⏳',
  'green-light': '🟢',
  'sacrifice-bunt': '🤲',
  'hit-and-run': '⚡',
}

export const SIGN_COLORS: Record<PlaySign, { bg: string; border: string; text: string }> = {
  bunt: { bg: 'bg-amber-500/20', border: 'border-amber-500', text: 'text-amber-300' },
  steal: { bg: 'bg-blue-500/20', border: 'border-blue-500', text: 'text-blue-300' },
  take: { bg: 'bg-red-500/20', border: 'border-red-500', text: 'text-red-300' },
  'delayed-steal': { bg: 'bg-cyan-500/20', border: 'border-cyan-500', text: 'text-cyan-300' },
  'green-light': { bg: 'bg-green-500/20', border: 'border-green-500', text: 'text-green-300' },
  'sacrifice-bunt': { bg: 'bg-orange-500/20', border: 'border-orange-500', text: 'text-orange-300' },
  'hit-and-run': { bg: 'bg-purple-500/20', border: 'border-purple-500', text: 'text-purple-300' },
}

export type SignConfig = {
  useIndicator: boolean
  indicator: Motion | null
  signMap: Record<PlaySign, Motion>
  activeSignsMap: Record<PlaySign, boolean>
  useWipeOff: boolean
  wipeOff: Motion
}

export type MotionStep = {
  motion: Motion
  role: 'decoy' | 'indicator' | 'sign' | 'wipe-off'
}

export type Difficulty = 'easy' | 'medium' | 'hard'
