import type { Motion, MotionStep } from './types'

export type MotionAnimData = {
  /** For touch motions: the position the hand moves to */
  handDest?: { x: number; y: number }
  /** For wipe motions: path the hand sweeps along */
  wipe?: { from: { x: number; y: number }; to: { x: number; y: number } }
  /** SVG element ID to highlight */
  highlightId: string
  label: string
}

// SVG viewBox is 0 0 200 320
// All coordinates are in SVG units
export const MOTION_ANIM: Record<Motion, MotionAnimData> = {
  'touch-nose': {
    handDest: { x: 100, y: 86 },
    highlightId: 'nose',
    label: 'Touch Nose',
  },
  'touch-chin': {
    handDest: { x: 100, y: 108 },
    highlightId: 'chin',
    label: 'Touch Chin',
  },
  'touch-hat-brim': {
    handDest: { x: 100, y: 62 },
    highlightId: 'hat-brim',
    label: 'Touch Hat Brim',
  },
  'touch-top-of-hat': {
    handDest: { x: 100, y: 30 },
    highlightId: 'hat-top',
    label: 'Touch Top of Hat',
  },
  'wipe-hat-brim': {
    wipe: { from: { x: 72, y: 62 }, to: { x: 128, y: 62 } },
    highlightId: 'hat-brim',
    label: 'Wipe Hat Brim',
  },
  'touch-belt': {
    handDest: { x: 100, y: 204 },
    highlightId: 'belt',
    label: 'Touch Belt',
  },
  'touch-chest': {
    handDest: { x: 100, y: 160 },
    highlightId: 'chest',
    label: 'Touch Chest',
  },
  'wipe-chest': {
    wipe: { from: { x: 65, y: 160 }, to: { x: 135, y: 160 } },
    highlightId: 'chest',
    label: 'Wipe Chest',
  },
  'touch-thigh': {
    handDest: { x: 79, y: 230 },
    highlightId: 'left-thigh',
    label: 'Touch Thigh',
  },
  'wipe-down-thigh': {
    wipe: { from: { x: 79, y: 212 }, to: { x: 79, y: 248 } },
    highlightId: 'left-thigh',
    label: 'Wipe Down Thigh',
  },
  'touch-wrist': {
    handDest: { x: 178, y: 186 },
    highlightId: 'right-wrist',
    label: 'Touch Wrist',
  },
  'touch-left-wrist': {
    handDest: { x: 22, y: 188 },
    highlightId: 'left-wrist',
    label: 'Touch Left Wrist',
  },
  'wipe-down-arm': {
    wipe: { from: { x: 137, y: 128 }, to: { x: 178, y: 186 } },
    highlightId: 'right-arm',
    label: 'Wipe Down Arm',
  },
  'wipe-up-arm': {
    wipe: { from: { x: 178, y: 186 }, to: { x: 137, y: 128 } },
    highlightId: 'right-arm',
    label: 'Wipe Up Arm',
  },
  'touch-cheek': {
    handDest: { x: 83, y: 93 },
    highlightId: 'cheek',
    label: 'Touch Cheek',
  },
  'touch-left-ear': {
    handDest: { x: 72, y: 84 },
    highlightId: 'left-ear',
    label: 'Touch Left Ear',
  },
  'touch-right-ear': {
    handDest: { x: 128, y: 84 },
    highlightId: 'right-ear',
    label: 'Touch Right Ear',
  },
}

export type RoleStyle = {
  fill: string
  label: string
  ringColor: string
}

export const ROLE_STYLES: Record<MotionStep['role'], RoleStyle> = {
  decoy: { fill: '#fbbf24', label: 'Decoy', ringColor: 'ring-amber-400' },
  indicator: { fill: '#3b82f6', label: 'Indicator!', ringColor: 'ring-blue-400' },
  sign: { fill: '#22c55e', label: 'Sign!', ringColor: 'ring-green-400' },
  'wipe-off': { fill: '#ef4444', label: 'Wipe Off!', ringColor: 'ring-red-400' },
}

/** Resting position of the hand cursor (SVG coordinates) */
export const HAND_REST: { x: number; y: number } = { x: 165, y: 218 }

/** Speed multipliers per difficulty */
export const SPEED_MULT: Record<string, number> = {
  easy: 0.6,
  medium: 1.0,
  hard: 1.6,
}
