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
        <ellipse cx={78} cy={290} rx={24} ry={11} fill="#0f172a" stroke="#111827" strokeWidth={2} />
        <ellipse cx={122} cy={290} rx={24} ry={11} fill="#0f172a" stroke="#111827" strokeWidth={2} />
        <ellipse cx={69} cy={285} rx={12} ry={5} fill="#1e293b" opacity={0.55} />
        <ellipse cx={113} cy={285} rx={12} ry={5} fill="#1e293b" opacity={0.55} />

        {/* ── SOCKS ── */}
        <rect x={64} y={272} width={25} height={17} rx={3} fill="white" opacity={0.95} />
        <rect x={111} y={272} width={25} height={17} rx={3} fill="white" opacity={0.95} />

        {/* ── BARE LEGS ── */}
        <rect x={66} y={244} width={22} height={30} rx={7} fill="#e8a87c" stroke="#111827" strokeWidth={1.5} />
        <rect x={112} y={244} width={22} height={30} rx={7} fill="#e8a87c" stroke="#111827" strokeWidth={1.5} />

        {/* ── SHORTS ── */}
        <rect x={58} y={208} width={41} height={40} rx={6} fill="#1e293b" stroke="#111827" strokeWidth={2} />
        <rect x={101} y={208} width={41} height={40} rx={6} fill="#1e293b" stroke="#111827" strokeWidth={2} />

        {/* ── ARMS (behind jersey) ── */}
        <line x1={65} y1={130} x2={22} y2={188} stroke="#c0392b" strokeWidth={20} strokeLinecap="round" />
        <line x1={135} y1={130} x2={178} y2={188} stroke="#c0392b" strokeWidth={20} strokeLinecap="round" />

        {/* ── JERSEY / CHEST ── */}
        <rect x={55} y={122} width={90} height={82} rx={10} fill="#c0392b" stroke="#111827" strokeWidth={2} />
        {/* Jersey shadow */}
        <rect x={55} y={166} width={90} height={38} rx={10} fill="#a93226" opacity={0.4} />
        {/* V-neck collar */}
        <path d="M 84 122 L 100 148 L 116 122" stroke="#111827" strokeWidth={2} fill="none" strokeLinejoin="round" />
        <path d="M 87 122 L 100 143 L 113 122 Z" fill="#e8a87c" opacity={0.45} />

        {/* ── FOREARMS (skin, drawn over jersey) ── */}
        <line x1={38} y1={164} x2={22} y2={188} stroke="#e8a87c" strokeWidth={18} strokeLinecap="round" />
        <line x1={162} y1={164} x2={178} y2={188} stroke="#e8a87c" strokeWidth={18} strokeLinecap="round" />

        {/* ── BELT ── */}
        <rect x={53} y={199} width={94} height={12} rx={3} fill="#111827" stroke="#0f172a" strokeWidth={1.5} />
        <rect x={93} y={202} width={14} height={7} rx={1} fill="#d4af37" stroke="#b8942e" strokeWidth={1} />
        <line x1={100} y1={202} x2={100} y2={209} stroke="#b8942e" strokeWidth={1} />

        {/* ── NECK ── */}
        <rect x={90} y={110} width={20} height={14} rx={3} fill="#e8a87c" stroke="#111827" strokeWidth={1.5} />

        {/* ── HEAD ── */}
        {/* Ears */}
        <circle cx={72} cy={84} r={8} fill="#e8a87c" stroke="#111827" strokeWidth={2} />
        <circle cx={128} cy={84} r={8} fill="#e8a87c" stroke="#111827" strokeWidth={2} />
        <circle cx={72} cy={84} r={4} fill="#d4926a" />
        <circle cx={128} cy={84} r={4} fill="#d4926a" />
        {/* Main head */}
        <circle cx={100} cy={82} r={28} fill="#e8a87c" stroke="#111827" strokeWidth={2} />

        {/* Eyebrows - furrowed/stern */}
        <path d="M 83 71 Q 89 68 95 71" stroke="#3d2b1f" strokeWidth={3} fill="none" strokeLinecap="round" />
        <path d="M 105 71 Q 111 68 117 71" stroke="#3d2b1f" strokeWidth={3} fill="none" strokeLinecap="round" />

        {/* Eyes */}
        <ellipse cx={89} cy={78} rx={6} ry={5} fill="white" />
        <ellipse cx={111} cy={78} rx={6} ry={5} fill="white" />
        <circle cx={91} cy={79} r={3.5} fill="#1c1c1c" />
        <circle cx={109} cy={79} r={3.5} fill="#1c1c1c" />
        <circle cx={92} cy={78} r={1.2} fill="white" />
        <circle cx={110} cy={78} r={1.2} fill="white" />

        {/* Nose */}
        <ellipse cx={100} cy={86} rx={5} ry={4} fill="#d4926a" />
        <circle cx={97} cy={88} r={1.5} fill="#b87c5a" opacity={0.8} />
        <circle cx={103} cy={88} r={1.5} fill="#b87c5a" opacity={0.8} />

        {/* Mouth - stern/neutral */}
        <path d="M 93 95 Q 100 94 107 95" stroke="#b87c5a" strokeWidth={2} fill="none" strokeLinecap="round" />

        {/* ── HAT ── */}
        {/* Crown — straight sides + domed top, shifted down 5px */}
        <path d="M 72 59 L 72 43 C 72 25, 128 25, 128 43 L 128 59 Z" fill="#1e3564" stroke="#111827" strokeWidth={2} />
        {/* Crown dome highlight */}
        <path d="M 74 43 C 74 27, 126 27, 126 43 L 126 39 C 126 25, 74 25, 74 39 Z" fill="white" opacity={0.06} />
        {/* Sweatband */}
        <rect x={72} y={54} width={56} height={5} rx={1} fill="#0f1e3d" />
        {/* Brim — shifted down 5px */}
        <path d="M 72 57 L 128 57 L 128 68 Q 100 61 72 68 Z" fill="#162850" stroke="#111827" strokeWidth={1.5} />
        {/* Brim underside shadow */}
        <path d="M 74 64 Q 100 58 126 64" stroke="#0a1628" strokeWidth={5} fill="none" opacity={0.5} />

        {/* ── WRISTS / HANDS ── */}
        <circle cx={22} cy={188} r={11} fill="#e8a87c" stroke="#111827" strokeWidth={1.5} />
        <circle cx={178} cy={188} r={11} fill="#e8a87c" stroke="#111827" strokeWidth={1.5} />
        {/* Knuckle lines */}
        <line x1={18} y1={185} x2={18} y2={191} stroke="#d4926a" strokeWidth={1} opacity={0.7} />
        <line x1={22} y1={185} x2={22} y2={191} stroke="#d4926a" strokeWidth={1} opacity={0.7} />
        <line x1={174} y1={185} x2={174} y2={191} stroke="#d4926a" strokeWidth={1} opacity={0.7} />
        <line x1={178} y1={185} x2={178} y2={191} stroke="#d4926a" strokeWidth={1} opacity={0.7} />

        {/* ══ HIGHLIGHT OVERLAYS ══ */}
        {/* hat-brim */}
        <motion.rect
          x={72} y={57} width={56} height={11} rx={3}
          initial={{ opacity: 0 }} animate={hl('hat-brim')} transition={hlTrans}
          style={{ pointerEvents: 'none' }}
        />
        {/* hat-top */}
        <motion.circle
          cx={100} cy={30} r={18}
          initial={{ opacity: 0 }} animate={hl('hat-top')} transition={hlTrans}
          style={{ pointerEvents: 'none' }}
        />
        {/* nose */}
        <motion.circle
          cx={100} cy={86} r={13}
          initial={{ opacity: 0 }} animate={hl('nose')} transition={hlTrans}
          style={{ pointerEvents: 'none' }}
        />
        {/* cheek */}
        <motion.ellipse
          cx={83} cy={93} rx={14} ry={10}
          initial={{ opacity: 0 }} animate={hl('cheek')} transition={hlTrans}
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
        {/* left-wrist */}
        <motion.circle
          cx={22} cy={188} r={14}
          initial={{ opacity: 0 }} animate={hl('left-wrist')} transition={hlTrans}
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
