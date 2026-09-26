import { useEffect } from "react"
import { useMotionValue, useTransform, type MotionValue } from "motion/react"
import { clamp01 } from "../core/clamp"
import { createRng } from "../core/random"
import { useAudioLevel } from "../audio/useAudioLevel"

const STEPS = [0.74, 0.24, 0.05, 0.52, 0.16, 0.82, 0.34, 0.12]

export function useSpeaking({
  active,
  analyser,
  seed,
}: {
  active: boolean
  analyser?: AnalyserNode | null
  seed?: string | number
}): MotionValue<number> {
  const audio = useAudioLevel(analyser, active && Boolean(analyser))
  const procedural = useMotionValue(0)

  useEffect(() => {
    if (!active || analyser) {
      procedural.set(0)
      return
    }

    const rng = createRng(seed === undefined ? undefined : `${seed}:speech`)
    let index = 0
    let timer = 0
    let cancelled = false

    const loop = () => {
      if (cancelled) return
      const step = STEPS[index % STEPS.length] ?? 0
      procedural.set(clamp01(step + rng.range(-0.07, 0.07)))
      index += 1
      timer = window.setTimeout(loop, rng.range(70, 220))
    }

    loop()
    return () => {
      cancelled = true
      window.clearTimeout(timer)
      procedural.set(0)
    }
  }, [active, analyser, procedural, seed])

  return useTransform(() => Math.max(audio.get(), procedural.get()))
}
