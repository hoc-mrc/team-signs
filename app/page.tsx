import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const MODES = [
  {
    href: '/setup',
    emoji: '⚙️',
    title: 'Start Here',
    description: "Set up your team's sign system — choose motions for each play and the indicator.",
    badge: null,
    badgeClass: '',
    cardClass: 'border-amber-700/40 hover:border-amber-600',
  },
  {
    href: '/learn',
    emoji: '📖',
    title: 'Learn the Signs',
    description: 'See each sign demonstrated by the coach avatar. Learn what to look for.',
    badge: 'Study',
    badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-700',
    cardClass: 'border-blue-700/40 hover:border-blue-500',
  },
  {
    href: '/quiz',
    emoji: '🎯',
    title: 'Practice!',
    description: 'Watch the coach give signs and pick the right play. Three difficulty levels.',
    badge: 'Game',
    badgeClass: 'bg-green-500/20 text-green-300 border-green-700',
    cardClass: 'border-green-700/40 hover:border-green-500',
  },
]

const COLOR_GUIDE = [
  { color: 'bg-amber-400', label: 'Yellow — Decoy motion (ignore it)' },
  { color: 'bg-blue-400', label: 'Blue — Indicator (activates the sign)' },
  { color: 'bg-green-400', label: 'Green — The actual sign!' },
  { color: 'bg-red-400', label: 'Red — Wipe off (cancel everything)' },
]

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 gap-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="text-5xl mb-1">⚾</div>
        <h1 className="text-4xl font-bold text-white tracking-tight">Read the Signs</h1>
        <p className="text-slate-400 text-sm max-w-xs mx-auto">
          Practice reading your coach&apos;s batting signs before the big game.
        </p>
      </div>

      {/* Mode cards */}
      <div className="w-full max-w-sm space-y-3">
        {MODES.map((mode) => (
          <Link key={mode.href} href={mode.href} className="block">
            <Card
              className={`bg-slate-900 border-2 transition-colors duration-150 cursor-pointer active:scale-[0.98] ${mode.cardClass}`}
            >
              <CardContent className="flex items-center gap-4 p-5">
                <span className="text-3xl flex-shrink-0">{mode.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h2 className="font-bold text-white text-base">{mode.title}</h2>
                    {mode.badge && (
                      <Badge variant="outline" className={`text-xs ${mode.badgeClass}`}>
                        {mode.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-slate-400 text-sm leading-snug">{mode.description}</p>
                </div>
                <span className="text-slate-600 flex-shrink-0 text-lg">›</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Color guide */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4 w-full max-w-sm">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Color Guide
        </p>
        <div className="space-y-2">
          {COLOR_GUIDE.map((item) => (
            <div key={item.label} className="flex items-center gap-2.5">
              <span className={`w-3 h-3 rounded-full flex-shrink-0 ${item.color}`} />
              <span className="text-xs text-slate-400">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-slate-700 text-xs">⚾ Little League Sign Trainer</p>
    </main>
  )
}
