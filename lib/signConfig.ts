import type { SignConfig, Motion, PlaySign } from './types'
import { ALL_PLAY_SIGNS } from './types'
import { DEFAULT_CONFIG } from './defaultConfig'

const STORAGE_KEY = 'team-signs-config'

export function loadConfig(): SignConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return DEFAULT_CONFIG
    const parsed = JSON.parse(stored) as SignConfig
    // Migrate old configs missing new fields
    return {
      ...parsed,
      activeSignsMap: {
        ...DEFAULT_CONFIG.activeSignsMap,
        ...parsed.activeSignsMap,
      },
      signMap: {
        ...DEFAULT_CONFIG.signMap,
        ...parsed.signMap,
      },
      useWipeOff: parsed.useWipeOff ?? DEFAULT_CONFIG.useWipeOff,
    }
  } catch {
    return DEFAULT_CONFIG
  }
}

export function saveConfig(config: SignConfig): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

export function validateConfig(config: SignConfig): string[] {
  const errors: string[] = []
  const usedMotions = new Map<Motion, string>()

  if (config.useIndicator && config.indicator) {
    usedMotions.set(config.indicator, 'Indicator')
  }

  if (config.useWipeOff) {
    if (usedMotions.has(config.wipeOff)) {
      errors.push(`Wipe Off uses the same motion as the Indicator`)
    } else {
      usedMotions.set(config.wipeOff, 'Wipe Off')
    }
  }

  for (const sign of ALL_PLAY_SIGNS) {
    if (!config.activeSignsMap[sign]) continue
    const motion = config.signMap[sign as PlaySign]
    if (usedMotions.has(motion)) {
      errors.push(
        `${sign} uses the same motion as ${usedMotions.get(motion)}`
      )
    } else {
      usedMotions.set(motion, sign)
    }
  }

  return errors
}
