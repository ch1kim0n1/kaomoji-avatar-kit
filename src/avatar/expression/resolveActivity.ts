import type { AvatarActivity, AvatarVisualState } from "../core/types"

export function applyActivity(
  visual: AvatarVisualState,
  activity: AvatarActivity,
): AvatarVisualState {
  const next = structuredClone(visual)

  switch (activity) {
    case "idle":
      next.brows.visible = false
      next.motion.breath = 0.75
      next.motion.sway = 0.42
      next.motion.bounce = 0.16
      next.motion.blinkRate = 1
      break
    case "listening":
      next.brows.visible = false
      next.eyes.openness = 0.84
      next.mouth.type = "flat"
      next.mouth.openness = 0.05
      next.mouth.width = 0.92
      next.brows.leftY = -0.5
      next.brows.rightY = -0.5
      next.motion.sway = 0.14
      next.motion.bounce = 0.05
      next.motion.blinkRate = 0.72
      next.motion.breath = 0.42
      break
    case "thinking":
      next.face.rotate = -8
      next.eyes.openness = 0.64
      next.eyes.leftRotation = -6
      next.eyes.rightRotation = 2
      next.mouth.width = 0.7
      next.mouth.curvature = -0.04
      next.brows.leftY = -2.4
      next.brows.leftRotation = -10
      next.brows.rightY = 0.5
      next.motion.sway = 0.2
      next.motion.blinkRate = 0.52
      next.motion.bounce = 0.06
      next.motion.breath = 0.5
      break
    case "speaking":
      next.brows.visible = false
      next.mouth.type = "open"
      next.mouth.openness = 0.28
      next.mouth.width = 1
      next.eyes.openness = 0.74
      next.motion.bounce = 0.2
      next.motion.sway = 0.16
      next.motion.blinkRate = 0.9
      next.motion.breath = 0.35
      break
    case "working":
      next.eyes.openness = 0.52
      next.eyes.width = 0.92
      next.brows.leftRotation = 12
      next.brows.rightRotation = -12
      next.brows.leftY = 1.3
      next.brows.rightY = 1.3
      next.mouth.width = 0.68
      next.mouth.curvature = 0.08
      next.face.rotate = -2
      next.motion.sway = 0.1
      next.motion.blinkRate = 0.58
      next.motion.jitter = 0.02
      next.motion.bounce = 0.12
      break
    case "success":
      next.brows.visible = false
      next.eyes.form = "arc-up"
      next.eyes.openness = 0.88
      next.mouth.type = "smile"
      next.mouth.curvature = 0.86
      next.mouth.openness = 0.2
      next.mouth.width = 1.06
      next.cheeks.opacity = 0.84
      next.cheeks.scale = 1.08
      next.brows.leftY = -1
      next.brows.rightY = -1
      next.motion.bounce = 0.8
      next.motion.breath = 0.45
      break
    case "warning":
      next.eyes.openness = 0.66
      next.eyes.leftRotation = 4
      next.brows.leftRotation = 8
      next.brows.rightRotation = -5
      next.brows.leftY = 0.8
      next.brows.rightY = -1.4
      next.mouth.curvature = -0.36
      next.mouth.width = 0.84
      next.cheeks.opacity = 0.12
      next.motion.jitter = 0.1
      next.motion.sway = 0.08
      next.motion.bounce = 0.04
      break
    case "error":
      next.brows.visible = false
      next.eyes.form = "cross"
      next.eyes.openness = 0.8
      next.pupils.visible = false
      next.mouth.type = "flat"
      next.mouth.curvature = -0.36
      next.mouth.width = 0.78
      next.brows.leftRotation = 15
      next.brows.rightRotation = -15
      next.brows.leftY = 1.4
      next.brows.rightY = 1.4
      next.cheeks.opacity = 0
      next.motion.bounce = 0
      next.motion.sway = 0.04
      next.motion.blinkRate = 0.35
      break
    case "sleeping":
      next.brows.visible = false
      next.eyes.form = "line"
      next.eyes.openness = 0.08
      next.pupils.visible = false
      next.mouth.type = "flat"
      next.mouth.curvature = 0
      next.mouth.openness = 0.02
      next.mouth.width = 0.7
      next.brows.leftY = 2.2
      next.brows.rightY = 2.2
      next.face.rotate = -2
      next.motion.blinkRate = 0
      next.motion.sway = 0.05
      next.motion.breath = 1
      next.motion.bounce = 0
      next.motion.jitter = 0
      break
    default:
      break
  }

  return next
}
