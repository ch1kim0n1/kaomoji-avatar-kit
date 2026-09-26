import { AUDIO } from "../core/constants"
import { clamp01 } from "../core/clamp"

export function getRms(samples: ArrayLike<number>): number {
  if (samples.length === 0) return 0
  let sum = 0
  for (let index = 0; index < samples.length; index += 1) {
    const centered = ((samples[index] ?? 128) - 128) / 128
    sum += centered * centered
  }
  return Math.sqrt(sum / samples.length)
}

export function gateAndNormalize(
  rms: number,
  noiseGate = AUDIO.noiseGate,
  gain = AUDIO.gain,
): number {
  if (!Number.isFinite(rms) || rms < noiseGate) return 0
  return clamp01((rms - noiseGate) * gain)
}

export function smoothLevel(
  current: number,
  next: number,
  attack = AUDIO.attack,
  release = AUDIO.release,
): number {
  const target = clamp01(next)
  const from = clamp01(current)
  const factor = target > from ? attack : release
  return from + (target - from) * factor
}

export function mapSpeechToMouth(level: number): { openness: number; width: number; headY: number } {
  const speech = clamp01(level)
  return {
    openness: 0.1 + speech * 0.9,
    width: 0.9 + speech * 0.18,
    headY: speech * -0.4,
  }
}
