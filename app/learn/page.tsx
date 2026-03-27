'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import SignCard from '@/components/learn/SignCard'
import type { SignConfig } from '@/lib/types'
import { ALL_PLAY_SIGNS, MOTION_LABELS } from '@/lib/types'
import { loadConfig } from '@/lib/signConfig'

export default function LearnPage() {
  const [config, setConfig] = useState<SignConfig | null>(null)

  useEffect(() => {
    setConfig(loadConfig())
  }, [])

  if (!config) return null

  const activeSigns = ALL_PLAY_SIGNS.filter((s) => config.activeSignsMap[s])

  return (
    <main className="min-h-screen p-6 max-w-lg mx-auto space-y-6">
      {/* Back nav */}
      <Link href="/">
        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200 -ml-2">
          ‹ Back
        </Button>
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-white">Learn the Signs</h1>
        <p className="text-slate-400 text-sm mt-1">
          Tap each sign to watch the coach demonstrate it. The label shows which motion was just
          performed.
        </p>
      </div>

      {/* Session config summary */}
      <div className="rounded-lg bg-slate-900 border border-slate-800 p-4 space-y-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Your Sign System
        </p>
        {config.useIndicator && config.indicator ? (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
            <span className="text-xs text-slate-400">
              Indicator: <span className="text-blue-300">{MOTION_LABELS[config.indicator]}</span>
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-600 flex-shrink-0" />
            <span className="text-xs text-slate-500">No indicator — all motions count directly</span>
          </div>
        )}
        {config.useWipeOff && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
            <span className="text-xs text-slate-400">
              Wipe off: <span className="text-red-300">{MOTION_LABELS[config.wipeOff]}</span>
            </span>
          </div>
        )}
        <Separator className="bg-slate-800" />
        <Link href="/setup">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-500 hover:text-slate-300 text-xs -ml-1 h-auto py-0.5"
          >
            ⚙ Change sign system
          </Button>
        </Link>
      </div>

      {/* Sign cards grid */}
      <div className="space-y-4">
        {activeSigns.map((sign) => (
          <SignCard key={sign} sign={sign} config={config} />
        ))}
        {activeSigns.length === 0 && (
          <div className="rounded-lg border border-slate-700 bg-slate-900 p-6 text-center">
            <p className="text-slate-400 text-sm">No signs are active.</p>
            <p className="text-slate-500 text-xs mt-1">Go to Setup to activate some signs.</p>
          </div>
        )}
      </div>

      {/* Wipe-off reminder */}
      {config.useWipeOff && (
        <div className="rounded-lg border border-red-900/50 bg-red-950/20 p-4">
          <p className="text-sm font-semibold text-red-300 mb-1">💡 Remember the Wipe Off</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            If the coach shows{' '}
            <Badge variant="outline" className="text-red-300 border-red-800 text-xs">
              {MOTION_LABELS[config.wipeOff]}
            </Badge>{' '}
            at any point, forget everything before it. Only the sign that comes after the wipe off
            (and after the indicator, if used) is the real call.
          </p>
        </div>
      )}
    </main>
  )
}
