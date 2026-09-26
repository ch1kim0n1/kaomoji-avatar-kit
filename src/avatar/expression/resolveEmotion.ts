import { clamp, clamp01, clampSigned } from "../core/clamp"
import type { AvatarActivity, AvatarEmotion, AvatarPersonality, AvatarVisualState } from "../core/types"

function dim(value: number | undefined, fallback: number, signed = false): number {
  if (value === undefined) return fallback
  return signed ? clampSigned(value) : clamp01(value)
}

const locksEyes = (activity: AvatarActivity) => activity === "sleeping" || activity === "error"

export function applyEmotion(
  visual: AvatarVisualState,
  emotion: AvatarEmotion,
  personality: AvatarPersonality,
  activity: AvatarActivity,
): AvatarVisualState {
  const next = structuredClone(visual)
  const valence = dim(emotion.valence, 0, true)
  const arousal = dim(emotion.arousal, 0.35)
  const confidence = dim(emotion.confidence, 0.62)
  const curiosity = dim(emotion.curiosity, 0.15)
  const surprise = dim(emotion.surprise, 0)
  const frustration = dim(emotion.frustration, 0)
  const range = 0.62 + personality.motionEnergy * 0.5
  const asymmetry = personality.asymmetry
  const locked = locksEyes(activity)

  if (!locked) {
    next.mouth.curvature = clampSigned(next.mouth.curvature + valence * 0.85 * range)
    next.cheeks.opacity = clamp01(next.cheeks.opacity + Math.max(0, valence) * 0.5 * range)
    next.eyes.openness = clamp01(next.eyes.openness + valence * 0.05)
  }

  const energy = arousal - 0.35
  next.motion.bounce = clamp01(next.motion.bounce + energy * 0.45 * (0.4 + personality.bounce))
  next.motion.sway = clamp01(next.motion.sway + energy * 0.3)
  next.motion.blinkRate = clamp(next.motion.blinkRate + energy * 0.35, 0, 2.2, next.motion.blinkRate)
  if (!locked) {
    next.eyes.openness = clamp01(next.eyes.openness + energy * 0.2)
  }

  const doubt = (1 - confidence) * (0.35 + asymmetry)
  if (!locked) {
    next.eyes.leftRotation += doubt * 5
    next.eyes.rightRotation -= doubt * 3.5
    next.mouth.width *= 1 - doubt * 0.16
    next.face.rotate += doubt * 2
    next.brows.leftY -= doubt * 0.8
  }

  if (!locked && (curiosity > 0.45 || frustration > 0.4)) {
    next.brows.visible = true
  }

  if (!locked) {
    const tilt = curiosity * (0.35 + personality.gazeCuriosity)
    next.face.rotate -= 8 * tilt
    next.brows.leftY -= 3.1 * curiosity
    next.brows.leftRotation -= 10 * curiosity * (0.35 + asymmetry)
    next.eyes.openness = clamp01(next.eyes.openness + curiosity * 0.1)
  }

  if (!locked && surprise > 0.05) {
    next.eyes.openness = clamp01(next.eyes.openness + surprise * 0.32)
    next.brows.leftY -= 2.8 * surprise
    next.brows.rightY -= 2.8 * surprise
    next.pupils.scale = clamp(next.pupils.scale - surprise * 0.2, 0.55, 1.2, next.pupils.scale)
    if (surprise > 0.62) {
      next.mouth.type = "o"
      next.mouth.openness = clamp01(0.2 + surprise * 0.7)
    }
  }

  if (activity !== "sleeping" && frustration > 0) {
    next.brows.leftRotation += 14 * frustration
    next.brows.rightRotation -= 14 * frustration
    next.brows.leftY += 1.1 * frustration
    next.brows.rightY += 1.1 * frustration
    next.mouth.curvature = clampSigned(next.mouth.curvature - frustration * 0.55)
    if (activity !== "error") {
      next.eyes.openness = clamp01(next.eyes.openness - frustration * 0.16)
    }
    next.motion.jitter = clamp01(next.motion.jitter + frustration * 0.12)
  }

  return next
}
