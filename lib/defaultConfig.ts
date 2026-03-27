import type { SignConfig } from './types'

export const DEFAULT_CONFIG: SignConfig = {
  useIndicator: true,
  indicator: 'touch-belt',
  useWipeOff: false,
  wipeOff: 'wipe-chest',
  activeSignsMap: {
    bunt: true,
    steal: true,
    take: true,
    'delayed-steal': false,
    'green-light': false,
    'sacrifice-bunt': false,
    'hit-and-run': false,
  },
  signMap: {
    bunt: 'touch-nose',
    steal: 'touch-chin',
    take: 'touch-thigh',
    'delayed-steal': 'touch-hat-brim',
    'green-light': 'wipe-hat-brim',
    'sacrifice-bunt': 'wipe-up-arm',
    'hit-and-run': 'touch-wrist',
  },
}
