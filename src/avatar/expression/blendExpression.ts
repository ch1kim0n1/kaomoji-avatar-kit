import { lerp } from "../core/clamp"
import type { AvatarVisualState, DeepPartial } from "../core/types"

function mix(base: number, next: number | undefined, weight: number): number {
  if (next === undefined) return base
  return lerp(base, next, weight)
}

function pick<T>(base: T, next: T | undefined, weight: number): T {
  if (next === undefined || weight < 0.5) return base
  return next
}

export function blendVisual(
  base: AvatarVisualState,
  patch: DeepPartial<AvatarVisualState>,
  weight = 1,
): AvatarVisualState {
  const face = patch.face
  const eyes = patch.eyes
  const pupils = patch.pupils
  const brows = patch.brows
  const mouth = patch.mouth
  const cheeks = patch.cheeks
  const motion = patch.motion

  return {
    face: {
      x: mix(base.face.x, face?.x, weight),
      y: mix(base.face.y, face?.y, weight),
      scaleX: mix(base.face.scaleX, face?.scaleX, weight),
      scaleY: mix(base.face.scaleY, face?.scaleY, weight),
      rotate: mix(base.face.rotate, face?.rotate, weight),
    },
    eyes: {
      openness: mix(base.eyes.openness, eyes?.openness, weight),
      width: mix(base.eyes.width, eyes?.width, weight),
      spacing: mix(base.eyes.spacing, eyes?.spacing, weight),
      leftRotation: mix(base.eyes.leftRotation, eyes?.leftRotation, weight),
      rightRotation: mix(base.eyes.rightRotation, eyes?.rightRotation, weight),
      form: pick(base.eyes.form, eyes?.form, weight),
    },
    pupils: {
      visible: pick(base.pupils.visible, pupils?.visible, weight),
      x: mix(base.pupils.x, pupils?.x, weight),
      y: mix(base.pupils.y, pupils?.y, weight),
      scale: mix(base.pupils.scale, pupils?.scale, weight),
    },
    brows: {
      visible: pick(base.brows.visible, brows?.visible, weight),
      leftY: mix(base.brows.leftY, brows?.leftY, weight),
      rightY: mix(base.brows.rightY, brows?.rightY, weight),
      leftRotation: mix(base.brows.leftRotation, brows?.leftRotation, weight),
      rightRotation: mix(base.brows.rightRotation, brows?.rightRotation, weight),
    },
    mouth: {
      type: pick(base.mouth.type, mouth?.type, weight),
      width: mix(base.mouth.width, mouth?.width, weight),
      openness: mix(base.mouth.openness, mouth?.openness, weight),
      curvature: mix(base.mouth.curvature, mouth?.curvature, weight),
      rotation: mix(base.mouth.rotation, mouth?.rotation, weight),
    },
    cheeks: {
      opacity: mix(base.cheeks.opacity, cheeks?.opacity, weight),
      scale: mix(base.cheeks.scale, cheeks?.scale, weight),
    },
    motion: {
      bounce: mix(base.motion.bounce, motion?.bounce, weight),
      sway: mix(base.motion.sway, motion?.sway, weight),
      jitter: mix(base.motion.jitter, motion?.jitter, weight),
      breath: mix(base.motion.breath, motion?.breath, weight),
      blinkRate: mix(base.motion.blinkRate, motion?.blinkRate, weight),
    },
  }
}
