import type { AvatarVisualState } from "../core/types"

export interface FaceTarget {
  x: number
  y: number
  rotate: number
  scaleX: number
  scaleY: number
}

export type ImpulseKind = "acknowledge" | "success" | "error" | "surprise" | "wake" | "sleep"

export function impulseKeyframes(kind: ImpulseKind, target: FaceTarget): Record<string, number[]> {
  switch (kind) {
    case "success":
      return {
        scaleX: [target.scaleX, 1.05, 0.96, target.scaleX],
        scaleY: [target.scaleY, 0.92, 1.07, target.scaleY],
        y: [target.y, target.y + 1.1, target.y - 2.4, target.y],
        x: [target.x, target.x, target.x, target.x],
        rotate: [target.rotate, target.rotate, target.rotate, target.rotate],
      }
    case "error":
      return {
        x: [target.x, -2.6, 2.6, -1.5, 1.2, target.x],
        y: [target.y, target.y, target.y, target.y, target.y, target.y],
        rotate: [target.rotate, target.rotate, target.rotate, target.rotate, target.rotate, target.rotate],
        scaleX: [target.scaleX, 1.03, 0.98, 1.01, 0.99, target.scaleX],
        scaleY: [target.scaleY, 0.97, 1.02, 0.99, 1.01, target.scaleY],
      }
    case "surprise":
      return {
        scaleY: [target.scaleY, 0.94, 1.05, target.scaleY],
        scaleX: [target.scaleX, 1.04, 0.98, target.scaleX],
        y: [target.y, target.y + 0.6, target.y - 1.1, target.y],
        x: [target.x, target.x, target.x, target.x],
        rotate: [target.rotate, target.rotate, target.rotate, target.rotate],
      }
    case "acknowledge":
      return {
        rotate: [target.rotate, target.rotate + 6, target.rotate],
        y: [target.y, target.y + 0.8, target.y],
        x: [target.x, target.x, target.x],
        scaleX: [target.scaleX, target.scaleX, target.scaleX],
        scaleY: [target.scaleY, target.scaleY, target.scaleY],
      }
    case "wake":
      return {
        scaleY: [0.94, 1.06, target.scaleY],
        scaleX: [1.04, 0.97, target.scaleX],
        y: [target.y + 0.6, target.y - 0.8, target.y],
        x: [target.x, target.x, target.x],
        rotate: [target.rotate, target.rotate, target.rotate],
      }
    case "sleep":
      return {
        scaleY: [target.scaleY, 0.96, target.scaleY],
        y: [target.y, target.y + 0.9, target.y],
        x: [target.x, target.x, target.x],
        scaleX: [target.scaleX, target.scaleX, target.scaleX],
        rotate: [target.rotate, target.rotate - 1, target.rotate],
      }
    default:
      return {
        x: [target.x],
        y: [target.y],
        rotate: [target.rotate],
        scaleX: [target.scaleX],
        scaleY: [target.scaleY],
      }
  }
}

export function faceTargetOf(face: AvatarVisualState["face"]): FaceTarget {
  return {
    x: face.x,
    y: face.y,
    rotate: face.rotate,
    scaleX: face.scaleX,
    scaleY: face.scaleY,
  }
}
