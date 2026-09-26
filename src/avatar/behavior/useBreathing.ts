import { useMemo } from "react"
import type { AvatarActivity } from "../core/types"

export interface BreathMotion {
  duration: number
  amplitude: number
}

export function breathMotion(activity: AvatarActivity, amount: number, reducedMotion: boolean): BreathMotion {
  if (reducedMotion || amount < 0.02) return { duration: 0, amplitude: 0 }
  const duration =
    activity === "sleeping" ? 4.8 : activity === "thinking" ? 4.4 : activity === "listening" ? 4.1 : 3.5
  return { duration, amplitude: Math.min(1, amount) }
}

export function useBreathing(activity: AvatarActivity, amount: number, reducedMotion: boolean): BreathMotion {
  return useMemo(() => breathMotion(activity, amount, reducedMotion), [activity, amount, reducedMotion])
}
