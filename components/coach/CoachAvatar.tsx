'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import type { MotionStep } from '@/lib/types'
import { MOTION_ANIM, ROLE_STYLES, HAND_REST } from '@/lib/animationSequences'

interface CoachAvatarProps {
  sequence: MotionStep[]
  playCount: number
  speed?: number
  onComplete?: () => void
  showMotionLabel?: boolean
}

interface HandPos {
  x: number
  y: number
}

const ROLE_FILL: Record<MotionStep['role'], string> = {
  decoy: '#fbbf24',
  indicator: '#3b82f6',
  sign: '#22c55e',
  'wipe-off': '#ef4444',
}

export default function CoachAvatar({
  sequence,
  playCount,
  speed = 1,
  onComplete,
  showMotionLabel = false,
}: CoachAvatarProps) {
  const [handPos, setHandPos] = useState<HandPos>(HAND_REST)
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null)
  const [highlightRole, setHighlightRole] = useState<MotionStep['role']>('decoy')
  const [handVisible, setHandVisible] = useState(false)
  const [currentMotionLabel, setCurrentMotionLabel] = useState('')
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const runSequence = useCallback(
    async (steps: MotionStep[], speedMult: number) => {
      const wait = (ms: number) =>
        new Promise<void>((r) => setTimeout(r, ms))

      const TRAVEL = Math.round(380 / speedMult)
      const HOLD = Math.round(380 / speedMult)
      const GAP = Math.round(200 / speedMult)
      const WIPE = Math.round(650 / speedMult)

      setHandPos(HAND_REST)
      setHandVisible(true)
      setActiveHighlight(null)
      await wait(300)

      for (const step of steps) {
        if (!mountedRef.current) return
        const anim = MOTION_ANIM[step.motion]

        setHighlightRole(step.role)
        if (showMotionLabel) setCurrentMotionLabel(anim.label)

        if (anim.wipe) {
          setHandPos(anim.wipe.from)
          await wait(TRAVEL)
          if (!mountedRef.current) return
          setActiveHighlight(anim.highlightId)
          setHandPos(anim.wipe.to)
          await wait(WIPE)
        } else if (anim.handDest) {
          setHandPos(anim.handDest)
          await wait(TRAVEL)
          if (!mountedRef.current) return
          setActiveHighlight(anim.highlightId)
          await wait(HOLD)
        }

        if (!mountedRef.current) return
        setActiveHighlight(null)
        if (showMotionLabel) setCurrentMotionLabel('')
        await wait(GAP)
      }

      if (!mountedRef.current) return
      setHandPos(HAND_REST)
      await wait(400)
      setHandVisible(false)
      onComplete?.()
    },
    [onComplete, showMotionLabel]
  )

  useEffect(() => {
    if (playCount === 0 || sequence.length === 0) return
    runSequence(sequence, speed)
  }, [playCount]) // eslint-disable-line react-hooks/exhaustive-deps

  const hl = (id: string) =>
    activeHighlight === id
      ? { opacity: 0.72, fill: ROLE_FILL[highlightRole] }
      : { opacity: 0, fill: ROLE_FILL[highlightRole] }

  const hlStroke = (id: string) =>
    activeHighlight === id
      ? { opacity: 0.75, stroke: ROLE_FILL[highlightRole] }
      : { opacity: 0, stroke: ROLE_FILL[highlightRole] }

  const hlTrans = { duration: 0.08 }

  const roleStyle = ROLE_STYLES[highlightRole]

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        viewBox="0 0 200 320"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[220px]"
        style={{ overflow: 'visible' }}
      >
        {/* ── SHOES ── */}
        <ellipse cx={79} cy={290} rx={21} ry={9} fill="#111827" />
        <ellipse cx={121} cy={290} rx={21} ry={9} fill="#111827" />
        <ellipse cx={72} cy={286} rx={9} ry={5} fill="#1f2937" opacity={0.5} />
        <ellipse cx={114} cy={286} rx={9} ry={5} fill="#1f2937" opacity={0.5} />

        {/* ── SHORTS ── */}
        <rect x={62} y={209} width={34} height={36} rx={4} fill="#374151" />
        <rect x={104} y={209} width={34} height={36} rx={4} fill="#374151" />
        <line x1={79} y1={212} x2={79} y2={243} stroke="#4b5563" strokeWidth={1} opacity={0.4} />
        <line x1={121} y1={212} x2={121} y2={243} stroke="#4b5563" strokeWidth={1} opacity={0.4} />
        {/* ── BARE LEGS ── */}
        <rect x={68} y={244} width={20} height={34} rx={6} fill="#f4c7a8" />
        <rect x={112} y={244} width={20} height={34} rx={6} fill="#f4c7a8" />
        {/* Socks */}
        <rect x={66} y={275} width={24} height={14} rx={3} fill="white" opacity={0.9} />
        <rect x={110} y={275} width={24} height={14} rx={3} fill="white" opacity={0.9} />

        {/* ── ARMS (behind jersey) ── */}
        <line x1={65} y1={130} x2={22} y2={188} stroke="#1e3a6e" strokeWidth={16} strokeLinecap="round" />
        <line x1={135} y1={130} x2={178} y2={188} stroke="#1e3a6e" strokeWidth={16} strokeLinecap="round" />

        {/* ── JERSEY / CHEST ── */}
        <rect x={58} y={122} width={84} height={82} rx={9} fill="#1e3a6e" />
        {/* Pinstripes */}
        <line x1={78} y1={122} x2={78} y2={204} stroke="white" strokeWidth={1} opacity={0.08} />
        <line x1={100} y1={122} x2={100} y2={204} stroke="white" strokeWidth={1} opacity={0.08} />
        <line x1={122} y1={122} x2={122} y2={204} stroke="white" strokeWidth={1} opacity={0.08} />

        {/* ── BELT ── */}
        <rect x={56} y={200} width={88} height={13} rx={3} fill="#4a2e1a" />
        <rect x={93} y={203} width={14} height={7} rx={1} fill="#d4af37" />
        <line x1={100} y1={203} x2={100} y2={210} stroke="#b8942e" strokeWidth={1} />

        {/* ── NECK ── */}
        <rect x={91} y={110} width={18} height={14} rx={2} fill="#f4c7a8" />

        {/* ── HEAD ── */}
        <circle cx={72} cy={84} r={7} fill="#f4c7a8" />
        <circle cx={128} cy={84} r={7} fill="#f4c7a8" />
        <circle cx={72} cy={84} r={4} fill="#e8b89a" />
        <circle cx={128} cy={84} r={4} fill="#e8b89a" />
        <circle cx={100} cy={82} r={28} fill="#f4c7a8" />

        {/* Eyes */}
        <ellipse cx={90} cy={78} rx={6} ry={5} fill="white" />
        <ellipse cx={110} cy={78} rx={6} ry={5} fill="white" />
        <circle cx={92} cy={79} r={3.5} fill="#2d2d2d" />
        <circle cx={108} cy={79} r={3.5} fill="#2d2d2d" />
        <circle cx={93} cy={78} r={1.2} fill="white" />
        <circle cx={109} cy={78} r={1.2} fill="white" />

        {/* Nose */}
        <ellipse cx={100} cy={86} rx={5} ry={4} fill="#e8a882" />
        <circle cx={97} cy={88} r={1.5} fill="#c4846c" opacity={0.7} />
        <circle cx={103} cy={88} r={1.5} fill="#c4846c" opacity={0.7} />

        {/* Smile */}
        <path d="M 92 94 Q 100 100 108 94" stroke="#c4846c" strokeWidth={2} fill="none" strokeLinecap="round" />

        {/* ── HAT ── */}
        {/* Crown - baseball cap dome */}
        <rect x={70} y={26} width={60} height={30} rx={22} fill="#1e3a6e" />
        {/* Brim / visor */}
        <rect x={57} y={52} width={86} height={9} rx={4} fill="#152c55" />
        {/* Hat button */}
        <circle cx={100} cy={30} r={3} fill="#152c55" />
        {/* Hat band */}
        <rect x={70} y={50} width={60} height={4} fill="#152c55" opacity={0.6} />

        {/* ── WRISTS / HANDS ── */}
        <circle cx={22} cy={188} r={10} fill="#f4c7a8" />
        <circle cx={178} cy={188} r={10} fill="#f4c7a8" />
        {/* Knuckle lines */}
        <line x1={18} y1={185} x2={18} y2={191} stroke="#e8b89a" strokeWidth={1} opacity={0.6} />
        <line x1={22} y1={185} x2={22} y2={191} stroke="#e8b89a" strokeWidth={1} opacity={0.6} />
        <line x1={174} y1={185} x2={174} y2={191} stroke="#e8b89a" strokeWidth={1} opacity={0.6} />
        <line x1={178} y1={185} x2={178} y2={191} stroke="#e8b89a" strokeWidth={1} opacity={0.6} />

        {/* ══ HIGHLIGHT OVERLAYS ══ */}
        {/* hat-brim */}
        <motion.rect
          x={57} y={52} width={86} height={9} rx={4}
          initial={{ opacity: 0 }} animate={hl('hat-brim')} transition={hlTrans}
          style={{ pointerEvents: 'none' }}
        />
        {/* nose */}
        <motion.circle
          cx={100} cy={86} r={13}
          initial={{ opacity: 0 }} animate={hl('nose')} transition={hlTrans}
          style={{ pointerEvents: 'none' }}
        />
        {/* chin */}
        <motion.ellipse
          cx={100} cy={108} rx={20} ry={9}
          initial={{ opacity: 0 }} animate={hl('chin')} transition={hlTrans}
          style={{ pointerEvents: 'none' }}
        />
        {/* chest */}
        <motion.rect
          x={58} y={122} width={84} height={82} rx={9}
          initial={{ opacity: 0 }} animate={hl('chest')} transition={hlTrans}
          style={{ pointerEvents: 'none' }}
        />
        {/* belt */}
        <motion.rect
          x={56} y={198} width={88} height={17} rx={3}
          initial={{ opacity: 0 }} animate={hl('belt')} transition={hlTrans}
          style={{ pointerEvents: 'none' }}
        />
        {/* right-arm */}
        <motion.line
          x1={135} y1={130} x2={178} y2={186}
          strokeWidth={18} strokeLinecap="round"
          initial={{ opacity: 0 }} animate={hlStroke('right-arm')} transition={hlTrans}
          style={{ pointerEvents: 'none' }}
        />
        {/* right-wrist */}
        <motion.circle
          cx={178} cy={188} r={14}
          initial={{ opacity: 0 }} animate={hl('right-wrist')} transition={hlTrans}
          style={{ pointerEvents: 'none' }}
        />
        {/* left-thigh */}
        <motion.rect
          x={62} y={209} width={34} height={42} rx={4}
          initial={{ opacity: 0 }} animate={hl('left-thigh')} transition={hlTrans}
          style={{ pointerEvents: 'none' }}
        />
        {/* left-ear */}
        <motion.circle
          cx={72} cy={84} r={10}
          initial={{ opacity: 0 }} animate={hl('left-ear')} transition={hlTrans}
          style={{ pointerEvents: 'none' }}
        />
        {/* right-ear */}
        <motion.circle
          cx={128} cy={84} r={10}
          initial={{ opacity: 0 }} animate={hl('right-ear')} transition={hlTrans}
          style={{ pointerEvents: 'none' }}
        />

        {/* ══ HAND CURSOR ══ */}
        <motion.g
          animate={{ x: handPos.x, y: handPos.y, opacity: handVisible ? 1 : 0 }}
          transition={{
            x: { duration: 0.35, ease: 'easeInOut' },
            y: { duration: 0.35, ease: 'easeInOut' },
            opacity: { duration: 0.2 },
          }}
          initial={{ x: HAND_REST.x, y: HAND_REST.y, opacity: 0 }}
        >
          {/* Outer glow ring */}
          <circle cx={0} cy={0} r={14} fill="none" stroke="white" strokeWidth={2} opacity={0.4} />
          {/* Main cursor */}
          <circle cx={0} cy={0} r={10} fill="white" opacity={0.92} />
          {/* Role color center */}
          <motion.circle
            cx={0} cy={0} r={6}
            animate={{ fill: ROLE_FILL[highlightRole] }}
            transition={{ duration: 0.1 }}
          />
        </motion.g>
      </svg>

      {/* Motion label below avatar */}
      {showMotionLabel && (
        <div className="h-8 flex items-center justify-center">
          {currentMotionLabel ? (
            <motion.span
              key={currentMotionLabel}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm font-semibold px-3 py-1 rounded-full"
              style={{
                backgroundColor: `${ROLE_FILL[highlightRole]}22`,
                color: ROLE_FILL[highlightRole],
                border: `1px solid ${ROLE_FILL[highlightRole]}55`,
              }}
            >
              {currentMotionLabel}
            </motion.span>
          ) : (
            <span className="text-slate-600 text-xs">—</span>
          )}
        </div>
      )}

      {/* Role legend during animation */}
      {handVisible && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-slate-800 border border-slate-700"
        >
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: ROLE_FILL[highlightRole] }}
          />
          <span className="text-slate-300">{roleStyle.label}</span>
        </motion.div>
      )}
    </div>
  )
}
