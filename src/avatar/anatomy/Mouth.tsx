import { motion, useTransform } from "motion/react"
import { GEOMETRY } from "../core/constants"
import type { AvatarScene } from "../core/scene"
import { expressionTransition } from "../motion/transitions"
import { mapSpeechToMouth } from "../audio/audioMath"
import { buildMouthPath } from "./mouthPaths"

export function Mouth({ scene }: { scene: AvatarScene }) {
  const { mouth } = scene.visual
  const path = buildMouthPath(mouth.type, mouth.width, mouth.curvature, scene.style.mouthStyle)
  const scaleX = useTransform(scene.speech, (level) => (scene.speaking ? mapSpeechToMouth(level).width : 1))
  const scaleY = useTransform(scene.speech, (level) => {
    const openShape = mouth.type === "o" || mouth.type === "open"
    const base = openShape ? 0.55 + mouth.openness * 0.8 : 1
    if (!scene.speaking) return base
    return base * (0.7 + mapSpeechToMouth(level).openness * 0.55)
  })

  return (
    <g transform={`translate(${GEOMETRY.mouth.x} ${GEOMETRY.mouth.y})`}>
      <motion.g
        animate={{ rotate: mouth.rotation }}
        style={{ scaleX, scaleY }}
        transition={expressionTransition(scene.reducedMotion)}
      >
        <path
          d={path}
          fill="none"
          stroke={scene.theme.foreground}
          strokeWidth={(scene.theme.strokeWidth ?? 4) * (scene.style.mouthStyle === "geometric" ? 0.62 : 0.78)}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>
    </g>
  )
}
