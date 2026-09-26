import type { AvatarPersonality, AvatarPersonalityName } from "../core/types"
import { clamp01 } from "../core/clamp"

export const defaultPersonality: AvatarPersonality = {
  motionEnergy: 0.45,
  reactionSpeed: 0.55,
  gazeCuriosity: 0.4,
  blinkFrequency: 0.85,
  asymmetry: 0.28,
  bounce: 0.32,
}

export const personalityPresets = {
  professional: {
    motionEnergy: 0.22,
    reactionSpeed: 0.42,
    gazeCuriosity: 0.16,
    blinkFrequency: 0.7,
    asymmetry: 0.08,
    bounce: 0.08,
  },
  playful: {
    motionEnergy: 0.86,
    reactionSpeed: 0.82,
    gazeCuriosity: 0.78,
    blinkFrequency: 1,
    asymmetry: 0.48,
    bounce: 0.74,
  },
  calm: {
    motionEnergy: 0.28,
    reactionSpeed: 0.34,
    gazeCuriosity: 0.3,
    blinkFrequency: 0.75,
    asymmetry: 0.16,
    bounce: 0.12,
  },
  curious: {
    motionEnergy: 0.58,
    reactionSpeed: 0.62,
    gazeCuriosity: 0.92,
    blinkFrequency: 0.9,
    asymmetry: 0.7,
    bounce: 0.36,
  },
  robotic: {
    motionEnergy: 0.12,
    reactionSpeed: 0.88,
    gazeCuriosity: 0.04,
    blinkFrequency: 0.38,
    asymmetry: 0,
    bounce: 0,
  },
} as const satisfies Record<AvatarPersonalityName, AvatarPersonality>

export function resolvePersonality(
  input?: AvatarPersonalityName | Partial<AvatarPersonality>,
): AvatarPersonality {
  if (!input) return { ...defaultPersonality }
  if (typeof input === "string") return { ...personalityPresets[input] }
  return {
    motionEnergy: clamp01(input.motionEnergy ?? defaultPersonality.motionEnergy),
    reactionSpeed: clamp01(input.reactionSpeed ?? defaultPersonality.reactionSpeed),
    gazeCuriosity: clamp01(input.gazeCuriosity ?? defaultPersonality.gazeCuriosity),
    blinkFrequency: clamp01(input.blinkFrequency ?? defaultPersonality.blinkFrequency),
    asymmetry: clamp01(input.asymmetry ?? defaultPersonality.asymmetry),
    bounce: clamp01(input.bounce ?? defaultPersonality.bounce),
  }
}
