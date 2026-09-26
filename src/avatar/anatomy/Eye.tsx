import { useEffect } from "react"
import { motion, useMotionValue, useTransform } from "motion/react"
import type { EyeForm, EyeStyle } from "../core/types"
import type { AvatarScene } from "../core/scene"
import { expressionTransition } from "../motion/transitions"

interface EyeProps {
  cx: number
  cy: number
  rx: number
  ry: number
  rotation: number
  openness: number
  form: EyeForm | EyeStyle
  scene: AvatarScene
}

function EyeShape({
  form,
  rx,
  ry,
  stroke,
  strokeWidth,
}: {
  form: EyeForm | EyeStyle
  rx: number
  ry: number
  stroke: string
  strokeWidth: number
}) {
  const shared = {
    fill: "none",
    stroke,
    strokeWidth: form === "line" ? strokeWidth * 0.68 : form === "cross" ? strokeWidth * 0.95 : strokeWidth * 0.78,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  }

  if (form === "dot") {
    return <circle r={Math.max(2.4, rx * 0.4)} fill={stroke} />
  }
  if (form === "line") {
    return <path d={`M ${-rx * 0.92} 0.2 Q 0 ${ry * 0.55} ${rx * 0.92} 0.2`} {...shared} />
  }
  if (form === "cross") {
    const x = rx * 0.52
    const y = ry * 0.58
    return <path d={`M ${-x} ${-y} L ${x} ${y} M ${-x} ${y} L ${x} ${-y}`} {...shared} />
  }
  if (form === "arc" || form === "arc-up" || form === "arc-down") {
    const up = form !== "arc-down"
    const bow = up ? -ry * 1.05 : ry * 1.05
    const inner = up ? -ry * 0.22 : ry * 0.22
    const y = up ? ry * 0.18 : -ry * 0.08
    return (
      <path
        d={`M ${-rx} ${y} Q 0 ${y + bow} ${rx} ${y} Q 0 ${y + inner} ${-rx} ${y} Z`}
        fill={stroke}
        stroke="none"
      />
    )
  }

  const weight = Math.max(1.6, strokeWidth * 0.52)
  return <ellipse rx={rx} ry={ry} fill="#fffdfb" stroke={stroke} strokeWidth={weight} />
}

export function Eye({ cx, cy, rx, ry, rotation, openness, form, scene }: EyeProps) {
  const open = useMotionValue(openness)
  useEffect(() => {
    open.set(openness)
  }, [open, openness])

  const scaleY = useTransform(() => {
    if (form === "cross") return 1
    const base = Math.max(0.08, open.get() / 0.72)
    return Math.max(0.07, base * scene.blink.get())
  })

  return (
    <g transform={`translate(${cx} ${cy})`}>
      <motion.g
        animate={{ rotate: rotation }}
        style={{ scaleY }}
        transition={expressionTransition(scene.reducedMotion)}
      >
        <EyeShape
          form={form}
          rx={rx}
          ry={ry}
          stroke={scene.theme.foreground}
          strokeWidth={scene.theme.strokeWidth ?? 4}
        />
      </motion.g>
    </g>
  )
}
