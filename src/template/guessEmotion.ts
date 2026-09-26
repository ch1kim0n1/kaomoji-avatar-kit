import { clamp01, clampSigned } from "../avatar/core/clamp"
import type { AvatarEmotion } from "../avatar/core/types"

export function guessEmotion(text: string): AvatarEmotion {
  const source = text.toLowerCase()
  let valence = 0.12
  let arousal = 0.38
  let confidence = 0.62
  let curiosity = 0.22
  let surprise = 0
  let frustration = 0

  if (/thanks|great|love|nice|awesome|yay|good/.test(source)) {
    valence += 0.5
    arousal += 0.18
  }
  if (/[!]|wow|whoa|amazing/.test(source)) {
    valence += 0.2
    arousal += 0.22
    surprise += 0.45
  }
  if (/\?|why|how|what|curious/.test(source)) curiosity += 0.5
  if (/fail|error|hate|broken|bug|angry|ugh/.test(source)) {
    valence -= 0.75
    frustration += 0.65
    confidence -= 0.25
    arousal += 0.2
  }
  if (/warn|careful|unsure|hmm|maybe/.test(source)) {
    confidence -= 0.22
    valence -= 0.12
  }
  if (/sleep|tired|bored/.test(source)) {
    arousal = 0.08
    valence -= 0.05
  }

  return {
    valence: clampSigned(valence),
    arousal: clamp01(arousal),
    confidence: clamp01(confidence),
    curiosity: clamp01(curiosity),
    surprise: clamp01(surprise),
    frustration: clamp01(frustration),
  }
}
