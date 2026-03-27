'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { SignConfig, Motion, PlaySign } from '@/lib/types'
import {
  ALL_MOTIONS,
  ALL_PLAY_SIGNS,
  MOTION_LABELS,
  SIGN_LABELS,
  SIGN_DESCRIPTIONS,
  SIGN_EMOJIS,
} from '@/lib/types'
import { saveConfig, validateConfig } from '@/lib/signConfig'
import { DEFAULT_CONFIG } from '@/lib/defaultConfig'

interface SignConfiguratorProps {
  initial: SignConfig
}

function MotionSelect({
  value,
  onChange,
  exclude,
  placeholder = 'Select motion…',
}: {
  value: Motion | null
  onChange: (m: Motion) => void
  exclude?: Set<Motion>
  placeholder?: string
}) {
  return (
    <Select value={value ?? ''} onValueChange={(v) => onChange(v as Motion)}>
      <SelectTrigger className="w-full bg-slate-800 border-slate-600 text-slate-100">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-slate-800 border-slate-600">
        {ALL_MOTIONS.map((m) => (
          <SelectItem
            key={m}
            value={m}
            disabled={exclude?.has(m) && m !== value}
            className="text-slate-100 focus:bg-slate-700"
          >
            {MOTION_LABELS[m]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default function SignConfigurator({ initial }: SignConfiguratorProps) {
  const router = useRouter()
  const [config, setConfig] = useState<SignConfig>(initial)
  const [saved, setSaved] = useState(false)

  const errors = validateConfig(config)

  // Build a set of all motions currently in use (to warn about conflicts)
  const usedMotions = new Set<Motion>()
  if (config.useIndicator && config.indicator) usedMotions.add(config.indicator)
  if (config.useWipeOff) usedMotions.add(config.wipeOff)
  for (const s of ALL_PLAY_SIGNS) {
    if (config.activeSignsMap[s]) usedMotions.add(config.signMap[s])
  }

  function updateSignMap(sign: PlaySign, motion: Motion) {
    setConfig((c) => ({ ...c, signMap: { ...c.signMap, [sign]: motion } }))
    setSaved(false)
  }

  function toggleSign(sign: PlaySign, active: boolean) {
    setConfig((c) => ({
      ...c,
      activeSignsMap: { ...c.activeSignsMap, [sign]: active },
    }))
    setSaved(false)
  }

  function handleSave() {
    if (errors.length > 0) return
    saveConfig(config)
    setSaved(true)
    setTimeout(() => router.push('/'), 800)
  }

  function handleReset() {
    setConfig(DEFAULT_CONFIG)
    setSaved(false)
  }

  return (
    <div className="space-y-6">
      {/* Indicator toggle */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-slate-100">Indicator</CardTitle>
          <CardDescription className="text-slate-400">
            The indicator is a special motion the coach shows first. Only motions
            shown AFTER the indicator count as a sign.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch
              id="use-indicator"
              checked={config.useIndicator}
              onCheckedChange={(v) => {
                setConfig((c) => ({ ...c, useIndicator: v }))
                setSaved(false)
              }}
            />
            <Label htmlFor="use-indicator" className="text-slate-200 cursor-pointer">
              Use an indicator in this session
            </Label>
          </div>

          {config.useIndicator && (
            <div className="space-y-1.5">
              <Label className="text-slate-400 text-xs uppercase tracking-wide">
                Indicator motion
              </Label>
              <MotionSelect
                value={config.indicator}
                onChange={(m) => {
                  setConfig((c) => ({ ...c, indicator: m }))
                  setSaved(false)
                }}
                placeholder="Choose the indicator motion…"
              />
              <p className="text-xs text-blue-400 mt-1">
                💡 The indicator will glow blue during practice
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sign mappings */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-slate-100">Signs</CardTitle>
          <CardDescription className="text-slate-400">
            Assign a unique motion to each play. No two signs can share the same motion.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {ALL_PLAY_SIGNS.map((sign) => {
            const isActive = config.activeSignsMap[sign]
            return (
              <div key={sign} className={isActive ? '' : 'opacity-40'}>
                <div className="flex items-start gap-2 mb-1.5">
                  <span className="text-lg leading-none mt-0.5">{SIGN_EMOJIS[sign]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-100 text-sm">{SIGN_LABELS[sign]}</p>
                    <p className="text-xs text-slate-500 leading-snug">{SIGN_DESCRIPTIONS[sign]}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-slate-500">{isActive ? 'Active' : 'Off'}</span>
                    <Switch
                      checked={isActive}
                      onCheckedChange={(v) => toggleSign(sign, v)}
                      className="data-checked:bg-green-600"
                    />
                  </div>
                </div>
                <MotionSelect
                  value={config.signMap[sign]}
                  onChange={(m) => updateSignMap(sign, m)}
                />
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Wipe Off */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-slate-100">Wipe Off</CardTitle>
          <CardDescription className="text-slate-400">
            When the coach shows the wipe-off motion, all previous signs are cancelled.
            This motion will glow red during practice.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch
              id="use-wipe-off"
              checked={config.useWipeOff}
              onCheckedChange={(v) => {
                setConfig((c) => ({ ...c, useWipeOff: v }))
                setSaved(false)
              }}
            />
            <Label htmlFor="use-wipe-off" className="text-slate-200 cursor-pointer">
              Use a wipe-off in this session
            </Label>
          </div>

          {config.useWipeOff && (
            <div className="space-y-1.5">
              <Label className="text-slate-400 text-xs uppercase tracking-wide">
                Wipe-off motion
              </Label>
              <MotionSelect
                value={config.wipeOff}
                onChange={(m) => {
                  setConfig((c) => ({ ...c, wipeOff: m }))
                  setSaved(false)
                }}
              />
              <p className="text-xs text-red-400 mt-1">
                🚫 The wipe-off will glow red during practice
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="rounded-lg border border-red-800 bg-red-950/40 p-4 space-y-1">
          <p className="text-sm font-semibold text-red-400">Fix these conflicts before saving:</p>
          {errors.map((e) => (
            <p key={e} className="text-xs text-red-300">• {e}</p>
          ))}
        </div>
      )}

      <Separator className="bg-slate-800" />

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={errors.length > 0}
          className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold text-base h-12"
        >
          {saved ? '✓ Saved! Going home…' : 'Save Sign System'}
        </Button>
        <Button
          variant="outline"
          onClick={handleReset}
          className="border-slate-600 text-slate-400 hover:text-slate-100 hover:bg-slate-800"
        >
          Reset to Default
        </Button>
      </div>

      <div className="text-center">
        <Badge variant="outline" className="border-slate-700 text-slate-500 text-xs">
          {ALL_PLAY_SIGNS.filter((s) => config.activeSignsMap[s]).length} of {ALL_PLAY_SIGNS.length} signs active · {ALL_MOTIONS.length} motions available
        </Badge>
      </div>
    </div>
  )
}
