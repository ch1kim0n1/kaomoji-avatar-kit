import { useMemo } from "react"
import type { AvatarActivity } from "../core/types"

export interface SwayMotion {
  duration: number
  degrees: number
  y: number
}

export function swayMotion(activity: AvatarActivity, sway: number, reducedMotion: boolean): SwayMotion {
  if (reducedMotion || activity === "sleeping" || sway < 0.04) {
    return { duration: 0, degrees: 0, y: 0 }
  }
  return {
    duration: activity === "thinking" ? 5.4 : 4.6,
    degrees: Math.min(1.5, sway * 1.55),
    y: Math.min(1.1, sway * 0.85),
  }
}

export function useIdleMotion(activity: AvatarActivity, sway: number, reducedMotion: boolean): SwayMotion {
  return useMemo(() => swayMotion(activity, sway, reducedMotion), [activity, reducedMotion, sway])
}
