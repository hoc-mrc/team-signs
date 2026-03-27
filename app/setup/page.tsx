'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import SignConfigurator from '@/components/setup/SignConfigurator'
import type { SignConfig } from '@/lib/types'
import { loadConfig } from '@/lib/signConfig'

export default function SetupPage() {
  const [config, setConfig] = useState<SignConfig | null>(null)

  useEffect(() => {
    setConfig(loadConfig())
  }, [])

  if (!config) return null

  return (
    <main className="min-h-screen p-6 max-w-lg mx-auto space-y-6">
      <Link href="/">
        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200 -ml-2">
          ‹ Back
        </Button>
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-white">Sign System Setup</h1>
        <p className="text-slate-400 text-sm mt-1">
          Configure which motions correspond to which signs. Saved locally for your practice
          session.
        </p>
      </div>

      <SignConfigurator initial={config} />
    </main>
  )
}
