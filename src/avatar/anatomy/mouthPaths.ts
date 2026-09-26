import { clamp } from "../core/clamp"
import type { MouthStyle, MouthType } from "../core/types"

export function resolveMouthType(type: MouthType, curvature: number): MouthType {
  if (type === "line" || type === "flat") {
    if (curvature > 0.28) return "smile"
    if (curvature < -0.28) return "frown"
  }
  return type
}

export function buildMouthPath(type: MouthType, width: number, curvature: number, mouthStyle: MouthStyle): string {
  const styleWidth = mouthStyle === "cute" ? 0.92 : mouthStyle === "geometric" ? 0.84 : 0.9
  const styleCurve = mouthStyle === "cute" ? 1.28 : mouthStyle === "geometric" ? 0.28 : 1
  const hw = 6.6 * clamp(width * styleWidth, 0.45, 1.45, 1)
  const bend = clamp(curvature, -1, 1, 0) * 6.2 * styleCurve
  const shape = resolveMouthType(type, curvature)

  switch (shape) {
    case "line":
    case "flat":
      if (mouthStyle === "geometric") return `M ${-hw} 0 H ${hw}`
      if (curvature < -0.08) return `M ${-hw} -0.15 Q 0 ${-1.8 + bend} ${hw} -0.15`
      return `M ${-hw} 0.2 Q 0 1.7 ${hw} 0.2`
    case "smile":
      return `M ${-hw} -0.3 Q 0 ${6.4 + Math.max(0, bend)} ${hw} -0.3`
    case "frown":
      return `M ${-hw} 0.6 Q 0 ${-5.6 + Math.min(0, bend)} ${hw} 0.6`
    case "cat":
      return `M ${-hw} -0.2 Q ${-hw / 2} ${6.4 + bend * 0.2} 0 -0.2 Q ${hw / 2} ${6.4 + bend * 0.2} ${hw} -0.2`
    case "w":
      return `M ${-hw} 0.2 Q ${-hw * 0.66} 4.2 ${-hw * 0.32} 0 Q 0 -2.6 ${hw * 0.32} 0 Q ${hw * 0.66} 4.2 ${hw} 0.2`
    case "o": {
      const rx = Math.max(2.8, hw * 0.42)
      const ry = 3.6
      return `M ${-rx} 0 A ${rx} ${ry} 0 1 1 ${rx} 0 A ${rx} ${ry} 0 1 1 ${-rx} 0`
    }
    case "open": {
      const rx = Math.max(3.4, hw * 0.55)
      const ry = 4.2
      return `M ${-rx} ${-ry * 0.05} Q 0 ${-ry * 0.85} ${rx} ${-ry * 0.05} Q ${rx * 0.55} ${ry} 0 ${ry * 0.72} Q ${-rx * 0.55} ${ry} ${-rx} ${-ry * 0.05}`
    }
    default:
      return `M ${-hw} 0.2 Q 0 1.7 ${hw} 0.2`
  }
}
