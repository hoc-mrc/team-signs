'use client'

import { useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import CoachAvatar from '@/components/coach/CoachAvatar'
import type { PlaySign, SignConfig, MotionStep } from '@/lib/types'
import { SIGN_LABELS, SIGN_DESCRIPTIONS, SIGN_EMOJIS, SIGN_COLORS, MOTION_LABELS } from '@/lib/types'
import { generateSequence } from '@/lib/quizLogic'
import { MOTION_ANIM, ROLE_STYLES } from '@/lib/animationSequences'

interface SignCardProps {
  sign: PlaySign
  config: SignConfig
}

export default function SignCard({ sign, config }: SignCardProps) {
  const [sequence, setSequence] = useState<MotionStep[]>([])
  const [playCount, setPlayCount] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const colors = SIGN_COLORS[sign]

  function handleDemo() {
    const seq = generateSequence(sign, config, 'easy')
    setSequence(seq)
    setIsPlaying(true)
    setPlayCount((c) => c + 1)
  }

  function handleComplete() {
    setIsPlaying(false)
  }

  // The motion that IS this sign (after indicator)
  const signMotion = config.signMap[sign]
  const signAnim = MOTION_ANIM[signMotion]

  return (
    <Card className={`bg-slate-900 border-slate-700 overflow-hidden`}>
      {/* Color accent strip */}
      <div className={`h-1 w-full ${colors.border.replace('border-', 'bg-')}`} />

      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <span className="text-3xl">{SIGN_EMOJIS[sign]}</span>
          <div className="flex-1">
            <h3 className={`text-lg font-bold ${colors.text}`}>{SIGN_LABELS[sign]}</h3>
            <p className="text-sm text-slate-400 leading-snug">{SIGN_DESCRIPTIONS[sign]}</p>
          </div>
        </div>

        {/* Sign motion info */}
        <div className="rounded-lg bg-slate-800 border border-slate-700 p-3 space-y-2">
          {config.useIndicator && config.indicator && (
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: ROLE_STYLES.indicator.fill }}
              />
              <span className="text-xs text-slate-400">Indicator:</span>
              <Badge
                variant="outline"
                className="text-blue-300 border-blue-800 bg-blue-950/40 text-xs"
              >
                {MOTION_LABELS[config.indicator]}
              </Badge>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: ROLE_STYLES.sign.fill }}
            />
            <span className="text-xs text-slate-400">Sign motion:</span>
            <Badge
              variant="outline"
              className="text-green-300 border-green-800 bg-green-950/40 text-xs"
            >
              {signAnim.label}
            </Badge>
          </div>
          {config.useWipeOff && (
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: ROLE_STYLES['wipe-off'].fill }}
              />
              <span className="text-xs text-slate-400">Wipe off:</span>
              <Badge
                variant="outline"
                className="text-red-300 border-red-800 bg-red-950/40 text-xs"
              >
                {MOTION_LABELS[config.wipeOff]}
              </Badge>
            </div>
          )}
        </div>

        {/* Avatar or Demo button */}
        <div className="flex flex-col items-center gap-3">
          {isPlaying ? (
            <CoachAvatar
              sequence={sequence}
              playCount={playCount}
              speed={0.8}
              onComplete={handleComplete}
              showMotionLabel
            />
          ) : (
            <div className="w-full">
              <Button
                onClick={handleDemo}
                className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200"
              >
                ▶ Watch Demo
              </Button>
            </div>
          )}

          {!isPlaying && playCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDemo}
              className="text-slate-500 hover:text-slate-300 text-xs"
            >
              ↺ Replay
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
