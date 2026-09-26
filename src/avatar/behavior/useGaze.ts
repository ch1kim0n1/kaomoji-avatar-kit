import { useEffect, type RefObject } from "react"
import { useMotionValue, useSpring, type MotionValue } from "motion/react"
import { clampSigned } from "../core/clamp"
import type { AvatarActivity } from "../core/types"
import { createRng } from "../core/random"
import { gazeSpring } from "../motion/transitions"

interface GazeProfile {
  biasX: number
  biasY: number
  range: number
  minWait: number
  maxWait: number
}

function gazeProfile(activity: AvatarActivity, curiosity: number): GazeProfile {
  if (activity === "thinking") {
    return { biasX: -0.55, biasY: -0.62, range: 0.16, minWait: 2800, maxWait: 5400 }
  }
  if (activity === "listening") {
    return { biasX: 0, biasY: 0.12, range: 0.08, minWait: 3400, maxWait: 6200 }
  }
  if (activity === "working") {
    return { biasX: 0, biasY: 0, range: 0.05, minWait: 4200, maxWait: 7200 }
  }
  return {
    biasX: 0,
    biasY: 0,
    range: 0.1 + curiosity * 0.14,
    minWait: 2600,
    maxWait: 6400,
  }
}

export function useGaze({
  explicitX,
  explicitY,
  pointerRef,
  pointer,
  activity,
  seed,
  reducedMotion,
  curiosity,
  reactionSpeed,
  locked,
}: {
  explicitX?: number
  explicitY?: number
  pointerRef: RefObject<HTMLElement | null>
  pointer: boolean
  activity: AvatarActivity
  seed?: string | number
  reducedMotion: boolean
  curiosity: number
  reactionSpeed: number
  locked: boolean
}): { x: MotionValue<number>; y: MotionValue<number> } {
  const targetX = useMotionValue(explicitX ?? 0)
  const targetY = useMotionValue(explicitY ?? 0)
  const x = useSpring(targetX, gazeSpring(reducedMotion, reactionSpeed))
  const y = useSpring(targetY, gazeSpring(reducedMotion, reactionSpeed))

  useEffect(() => {
    const setTarget = (nextX: number, nextY: number) => {
      targetX.set(clampSigned(nextX))
      targetY.set(clampSigned(nextY))
    }

    if (locked) {
      setTarget(0, 0)
      return
    }

    if (explicitX !== undefined && explicitY !== undefined) {
      setTarget(explicitX, explicitY)
      return
    }

    if (reducedMotion) {
      setTarget(0, 0)
      return
    }

    if (pointer) {
      let frame = 0
      const onMove = (event: PointerEvent) => {
        window.cancelAnimationFrame(frame)
        frame = window.requestAnimationFrame(() => {
          const rect = pointerRef.current?.getBoundingClientRect()
          if (!rect || rect.width === 0 || rect.height === 0) return
          const dx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width * 0.9)
          const dy = (event.clientY - (rect.top + rect.height / 2)) / (rect.height * 0.9)
          setTarget(dx, dy)
        })
      }
      window.addEventListener("pointermove", onMove)
      return () => {
        window.cancelAnimationFrame(frame)
        window.removeEventListener("pointermove", onMove)
      }
    }

    const rng = createRng(seed === undefined ? undefined : `${seed}:gaze:${activity}`)
    const profile = gazeProfile(activity, curiosity)
    let timer = 0
    let cancelled = false
    const loop = () => {
      timer = window.setTimeout(() => {
        if (cancelled) return
        setTarget(
          profile.biasX + rng.range(-profile.range, profile.range),
          profile.biasY + rng.range(-profile.range, profile.range),
        )
        loop()
      }, rng.range(profile.minWait, profile.maxWait))
    }
    loop()
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [
    activity,
    curiosity,
    explicitX,
    explicitY,
    locked,
    pointer,
    pointerRef,
    reducedMotion,
    seed,
    targetX,
    targetY,
  ])

  return { x, y }
}
