import { useTransform } from "motion/react"
import { motion } from "motion/react"
import { GEOMETRY } from "../core/constants"
import { clamp } from "../core/clamp"
import type { AvatarScene } from "../core/scene"
import { expressionTransition } from "../motion/transitions"
import { resolvedEyeForm } from "./Eyes"

export function Pupils({ scene }: { scene: AvatarScene }) {
  const form = resolvedEyeForm(scene)
  const show =
    scene.visual.pupils.visible &&
    scene.visual.eyes.openness > 0.34 &&
    (form === "oval" || form === "dot")

  const shiftX = useTransform(scene.gazeX, (value) =>
    clamp(value * GEOMETRY.maxPupilOffsetX, -GEOMETRY.maxPupilOffsetX, GEOMETRY.maxPupilOffsetX, 0),
  )
  const shiftY = useTransform(scene.gazeY, (value) =>
    clamp(value * GEOMETRY.maxPupilOffsetY, -GEOMETRY.maxPupilOffsetY, GEOMETRY.maxPupilOffsetY, 0),
  )
  const opacity = useTransform(scene.blink, (lid) => (lid < 0.45 ? 0 : 1))

  if (!show) return null

  const radius = GEOMETRY.pupilR * scene.visual.pupils.scale
  const eyes = [
    GEOMETRY.leftEye.x - scene.visual.eyes.spacing,
    GEOMETRY.rightEye.x + scene.visual.eyes.spacing,
  ]

  return (
    <motion.g style={{ opacity }} transition={expressionTransition(scene.reducedMotion)}>
      {eyes.map((cx) => (
        <motion.g
          key={cx}
          style={{ x: shiftX, y: shiftY }}
        >
          <circle
            cx={cx + scene.visual.pupils.x}
            cy={GEOMETRY.leftEye.y + scene.visual.pupils.y}
            r={radius}
            fill={scene.theme.foreground}
          />
          {form === "oval" ? (
            <circle
              cx={cx + scene.visual.pupils.x - radius * 0.32}
              cy={GEOMETRY.leftEye.y + scene.visual.pupils.y - radius * 0.36}
              r={Math.max(0.55, radius * 0.26)}
              fill="#fff"
            />
          ) : null}
        </motion.g>
      ))}
    </motion.g>
  )
}
