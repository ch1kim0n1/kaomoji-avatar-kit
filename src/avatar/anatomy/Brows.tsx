import { motion } from "motion/react"
import { GEOMETRY } from "../core/constants"
import type { AvatarScene } from "../core/scene"
import { expressionTransition } from "../motion/transitions"

export function Brows({ scene }: { scene: AvatarScene }) {
  if (!scene.visual.brows.visible) return null
  const stroke = scene.theme.foreground
  const strokeWidth = (scene.theme.strokeWidth ?? 4) * 0.48
  const brows = [
    {
      x: GEOMETRY.leftBrow.x,
      y: GEOMETRY.leftBrow.y + scene.visual.brows.leftY,
      rotate: scene.visual.brows.leftRotation,
    },
    {
      x: GEOMETRY.rightBrow.x,
      y: GEOMETRY.rightBrow.y + scene.visual.brows.rightY,
      rotate: scene.visual.brows.rightRotation,
    },
  ]

  return (
    <g>
      {brows.map((brow) => (
        <g key={`${brow.x}`} transform={`translate(${brow.x} ${brow.y})`}>
          <motion.g animate={{ rotate: brow.rotate }} transition={expressionTransition(scene.reducedMotion)}>
            <path
              d={`M ${-GEOMETRY.browHalf} 0.6 Q 0 -1.1 ${GEOMETRY.browHalf} 0.6`}
              fill="none"
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          </motion.g>
        </g>
      ))}
    </g>
  )
}
