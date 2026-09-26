import { useCallback, useEffect, useRef, useState } from "react"
import type { AvatarReaction } from "../core/types"
import type { ImpulseKind } from "../motion/variants"

const REACTION_SECONDS: Record<AvatarReaction, number> = {
  acknowledge: 0.42,
  success: 0.92,
  error: 0.8,
  surprise: 0.7,
  wake: 0.64,
  sleep: 0.64,
}

export interface ImpulseState {
  kind: ImpulseKind
  nonce: number
  duration: number
}

function durationFor(kind: ImpulseKind, reactionSpeed: number, reducedMotion: boolean): number {
  if (reducedMotion) return 0.12
  return REACTION_SECONDS[kind] / (0.55 + reactionSpeed)
}

export function useReaction(reactionSpeed: number, reducedMotion: boolean) {
  const [reaction, setReaction] = useState<AvatarReaction | null>(null)
  const [impulse, setImpulse] = useState<ImpulseState | null>(null)
  const nonce = useRef(0)

  const play = useCallback(
    (kind: ImpulseKind, overlay: boolean) => {
      nonce.current += 1
      setImpulse({
        kind,
        nonce: nonce.current,
        duration: durationFor(kind, reactionSpeed, reducedMotion),
      })
      if (overlay) setReaction(kind)
    },
    [reactionSpeed, reducedMotion],
  )

  const react = useCallback(
    (type: AvatarReaction) => {
      play(type, type !== "acknowledge")
    },
    [play],
  )

  const nudge = useCallback(
    (kind: ImpulseKind) => {
      play(kind, false)
    },
    [play],
  )

  useEffect(() => {
    if (!reaction) return
    const ms = (reducedMotion ? 0.16 : REACTION_SECONDS[reaction]) * 1000
    const id = window.setTimeout(() => setReaction(null), ms)
    return () => window.clearTimeout(id)
  }, [impulse?.nonce, reaction, reducedMotion])

  return { reaction, impulse, react, nudge }
}
