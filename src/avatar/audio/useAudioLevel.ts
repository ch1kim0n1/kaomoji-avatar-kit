import { useEffect } from "react"
import { useMotionValue, type MotionValue } from "motion/react"
import { AUDIO } from "../core/constants"
import { gateAndNormalize, getRms, smoothLevel } from "./audioMath"

export function useAudioLevel(
  analyser: AnalyserNode | null | undefined,
  active: boolean,
): MotionValue<number> {
  const level = useMotionValue(0)

  useEffect(() => {
    if (!analyser || !active) {
      level.set(0)
      return
    }

    const samples = new Uint8Array(analyser.fftSize)
    let current = 0
    let frame = 0
    let stopped = false

    const tick = () => {
      if (stopped) return
      analyser.getByteTimeDomainData(samples)
      const next = gateAndNormalize(getRms(samples))
      current = smoothLevel(current, next, AUDIO.attack, AUDIO.release)
      level.set(current)
      frame = window.requestAnimationFrame(tick)
    }

    frame = window.requestAnimationFrame(tick)
    return () => {
      stopped = true
      window.cancelAnimationFrame(frame)
      level.set(0)
    }
  }, [analyser, active, level])

  return level
}
