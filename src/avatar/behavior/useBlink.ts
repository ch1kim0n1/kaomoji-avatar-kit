import { useEffect } from "react"
import { animate, useMotionValue, type MotionValue } from "motion/react"
import { BLINK } from "../core/constants"
import type { Rng } from "../core/random"
import { createRng } from "../core/random"

export function nextBlinkDelay(rng: Rng, blinkRate: number): number {
  const rate = Math.max(0.25, blinkRate)
  return rng.range(BLINK.minIntervalMs, BLINK.maxIntervalMs) / rate
}

export function planBlinks(seed: string | number, count: number, blinkRate = 1) {
  const rng = createRng(`${seed}:blink`)
  const plans: Array<{ delay: number; duration: number; double: boolean; gap: number }> = []
  for (let index = 0; index < count; index += 1) {
    plans.push({
      delay: nextBlinkDelay(rng, blinkRate),
      duration: rng.range(BLINK.minDurationMs, BLINK.maxDurationMs),
      double: rng.chance(BLINK.doubleProbability),
      gap: rng.range(BLINK.minDoubleGapMs, BLINK.maxDoubleGapMs),
    })
  }
  return plans
}

export function useBlink({
  enabled,
  rate,
  seed,
  reducedMotion,
}: {
  enabled: boolean
  rate: number
  seed?: string | number
  reducedMotion: boolean
}): MotionValue<number> {
  const lid = useMotionValue(1)

  useEffect(() => {
    if (!enabled || reducedMotion || rate <= 0) {
      lid.set(1)
      return
    }

    const rng = createRng(seed === undefined ? undefined : `${seed}:blink`)
    const timers: number[] = []
    let stopped = false
    let running: { stop: () => void } | null = null

    const tween = (to: number, duration: number) => {
      running?.stop()
      running = animate(lid, to, { duration, ease: "easeInOut" })
    }

    const later = (ms: number, fn: () => void) => {
      const id = window.setTimeout(() => {
        if (!stopped) fn()
      }, ms)
      timers.push(id)
    }

    const schedule = () => {
      const plan = {
        delay: nextBlinkDelay(rng, rate),
        duration: rng.range(BLINK.minDurationMs, BLINK.maxDurationMs),
        double: rng.chance(BLINK.doubleProbability),
        gap: rng.range(BLINK.minDoubleGapMs, BLINK.maxDoubleGapMs),
      }
      later(plan.delay, () => {
        tween(BLINK.closed, (plan.duration / 1000) * 0.45)
        later(plan.duration * 0.45, () => {
          tween(1, (plan.duration / 1000) * 0.55)
          if (!plan.double) {
            schedule()
            return
          }
          later(plan.gap, () => {
            tween(BLINK.closed, 0.06)
            later(90, () => {
              tween(1, 0.09)
              schedule()
            })
          })
        })
      })
    }

    schedule()
    return () => {
      stopped = true
      for (const id of timers) window.clearTimeout(id)
      running?.stop()
      lid.set(1)
    }
  }, [enabled, lid, rate, reducedMotion, seed])

  return lid
}
