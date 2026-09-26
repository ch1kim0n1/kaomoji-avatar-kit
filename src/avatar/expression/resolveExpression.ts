import { clamp, clamp01, clampSigned } from "../core/clamp"
import { createDefaultVisual, defaultStyle, GEOMETRY, LIMITS } from "../core/constants"
import { defaultPersonality } from "../motion/personalities"
import type {
  AvatarStyleConfig,
  AvatarVisualState,
  DetailTier,
  ExpressionInput,
} from "../core/types"
import { blendVisual } from "./blendExpression"
import { expressionPresets, reactionPatches } from "./presets"
import { applyActivity } from "./resolveActivity"
import { applyEmotion } from "./resolveEmotion"

export function detailTierFor(size: number): DetailTier {
  if (size < LIMITS.tinyBelow) return "tiny"
  if (size < LIMITS.smallBelow) return "small"
  if (size < LIMITS.largeAt) return "standard"
  return "large"
}

export function parseSize(size: number | string | undefined): number {
  if (typeof size === "number" && Number.isFinite(size)) return size
  if (typeof size === "string") {
    const trimmed = size.trim()
    if (/^\d+(\.\d+)?(px)?$/.test(trimmed)) {
      const value = Number.parseFloat(trimmed)
      if (Number.isFinite(value)) return value
    }
  }
  return 96
}

function applyPersonalityMotion(
  visual: AvatarVisualState,
  personality: ExpressionInput["personality"],
  activity: ExpressionInput["activity"],
): AvatarVisualState {
  const persona = personality ?? defaultPersonality
  const next = structuredClone(visual)
  next.motion.bounce = clamp01(next.motion.bounce * (0.2 + persona.bounce))
  next.motion.sway = clamp01(next.motion.sway * (0.15 + persona.motionEnergy))
  next.motion.jitter = clamp01(next.motion.jitter * (persona.asymmetry === 0 ? 0 : 0.35 + persona.asymmetry))
  const sleepingFace = activity === "sleeping" && next.eyes.form === "line"
  next.motion.blinkRate = sleepingFace
    ? 0
    : clamp(next.motion.blinkRate * (0.35 + persona.blinkFrequency), 0, 2.2, 0)
  const breathScale = activity === "sleeping" ? 1 : 0.45 + (1 - persona.motionEnergy) * 0.35 + persona.motionEnergy * 0.25
  next.motion.breath = clamp01(next.motion.breath * breathScale)
  if (persona.motionEnergy < 0.2) {
    next.face.rotate *= 0.45
  }
  return next
}

function applyRenderLimits(
  visual: AvatarVisualState,
  size: number,
  style: AvatarStyleConfig,
): AvatarVisualState {
  const next = structuredClone(visual)
  if (size < LIMITS.browHideBelow) next.brows.visible = false
  if (size < LIMITS.pupilHideBelow) next.pupils.visible = false
  if (size < LIMITS.tinyBelow) next.cheeks.opacity = 0
  if (!style.cheeks) next.cheeks.opacity = 0
  if (!style.pupils) next.pupils.visible = false
  if (!next.pupils.visible) {
    next.pupils.x = 0
    next.pupils.y = 0
  }
  return next
}

export function clampVisual(visual: AvatarVisualState): AvatarVisualState {
  const next = structuredClone(visual)
  next.face.x = clamp(next.face.x, -4, 4, 0)
  next.face.y = clamp(next.face.y, -4, 4, 0)
  next.face.scaleX = clamp(next.face.scaleX, 0.9, 1.12, 1)
  next.face.scaleY = clamp(next.face.scaleY, 0.9, 1.12, 1)
  next.face.rotate = clamp(next.face.rotate, -LIMITS.maxFaceRotate, LIMITS.maxFaceRotate, 0)
  next.eyes.openness = clamp(next.eyes.openness, 0.04, 1, 0.72)
  next.eyes.width = clamp(next.eyes.width, 0.6, 1.35, 1)
  next.eyes.spacing = clamp(next.eyes.spacing, -2, 3, 0)
  next.eyes.leftRotation = clamp(next.eyes.leftRotation, -24, 24, 0)
  next.eyes.rightRotation = clamp(next.eyes.rightRotation, -24, 24, 0)
  next.pupils.x = clamp(next.pupils.x, -GEOMETRY.maxPupilOffsetX, GEOMETRY.maxPupilOffsetX, 0)
  next.pupils.y = clamp(next.pupils.y, -GEOMETRY.maxPupilOffsetY, GEOMETRY.maxPupilOffsetY, 0)
  next.pupils.scale = clamp(next.pupils.scale, 0.5, 1.4, 1)
  next.brows.leftY = clamp(next.brows.leftY, -6, 6, 0)
  next.brows.rightY = clamp(next.brows.rightY, -6, 6, 0)
  next.brows.leftRotation = clamp(next.brows.leftRotation, -28, 28, 0)
  next.brows.rightRotation = clamp(next.brows.rightRotation, -28, 28, 0)
  next.mouth.width = clamp(next.mouth.width, 0.45, 1.45, 1)
  next.mouth.openness = clamp01(next.mouth.openness)
  next.mouth.curvature = clampSigned(next.mouth.curvature)
  next.mouth.rotation = clamp(next.mouth.rotation, -18, 18, 0)
  next.cheeks.opacity = clamp01(next.cheeks.opacity)
  next.cheeks.scale = clamp(next.cheeks.scale, 0.6, 1.4, 1)
  next.motion.bounce = clamp01(next.motion.bounce)
  next.motion.sway = clamp01(next.motion.sway)
  next.motion.jitter = clamp01(next.motion.jitter)
  next.motion.breath = clamp01(next.motion.breath)
  next.motion.blinkRate = clamp(next.motion.blinkRate, 0, 2.2, 1)
  return next
}

export function resolveStyle(partial?: Partial<AvatarStyleConfig>): AvatarStyleConfig {
  return {
    eyeStyle: partial?.eyeStyle ?? defaultStyle.eyeStyle,
    mouthStyle: partial?.mouthStyle ?? defaultStyle.mouthStyle,
    container: partial?.container ?? defaultStyle.container,
    cheeks: partial?.cheeks ?? defaultStyle.cheeks,
    pupils: partial?.pupils ?? defaultStyle.pupils,
    sleepMarks: partial?.sleepMarks ?? defaultStyle.sleepMarks,
  }
}

export function resolveExpression(input: ExpressionInput): AvatarVisualState {
  const emotion = input.emotion ?? {}
  const personality = input.personality ?? defaultPersonality
  const size = input.size ?? 96
  const style = resolveStyle(input.style)
  let visual = createDefaultVisual()
  visual = applyActivity(visual, input.activity)
  visual = applyEmotion(visual, emotion, personality, input.activity)
  if (input.expression) {
    visual = blendVisual(visual, expressionPresets[input.expression], 1)
  }
  if (input.reaction && input.reaction !== "acknowledge") {
    visual = blendVisual(visual, reactionPatches[input.reaction], 1)
  }
  visual = applyPersonalityMotion(visual, personality, input.reaction === "sleep" ? "sleeping" : input.activity)
  visual = applyRenderLimits(visual, size, style)
  return clampVisual(visual)
}
