import { motion } from "motion/react"
import type { AvatarContainer, AvatarMarker } from "../core/types"
import type { AvatarScene } from "../core/scene"

export function Body({
  scene,
  marker,
}: {
  scene: AvatarScene
  marker: AvatarMarker
}) {
  return (
    <g>
      <Shell scene={scene} container={scene.style.container} />
      {marker === "sleep" ? <SleepMarks scene={scene} /> : null}
      {marker === "warning" ? <Sweat scene={scene} /> : null}
    </g>
  )
}

function Shell({ scene, container }: { scene: AvatarScene; container: AvatarContainer }) {
  if (container === "none") return null
  const stroke = scene.theme.accent ?? scene.theme.foreground
  const rawFill = scene.theme.background ?? "transparent"
  const filled = rawFill !== "transparent" && rawFill !== "none"
  const fill = filled ? rawFill : "none"
  const strokeWidth = (scene.theme.strokeWidth ?? 4) * (filled ? 0.16 : 0.42)
  const shared = { fill, stroke, strokeWidth }

  if (container === "circle") {
    return <circle cx={50} cy={50} r={46} {...shared} />
  }
  if (container === "rounded-square") {
    const radius = Math.max(10, (scene.theme.radius ?? 24) * 0.85)
    return <rect x={8} y={8} width={84} height={84} rx={radius} {...shared} />
  }
  return (
    <path
      d="M50 6C72 4 94 20 94 46C94 74 74 94 50 94C26 94 6 74 6 46C6 20 28 4 50 6Z"
      {...shared}
    />
  )
}

function SleepMarks({ scene }: { scene: AvatarScene }) {
  const marks = (
    <g
      fill="none"
      stroke={scene.theme.foreground}
      strokeWidth={1.35}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={0.72}
    >
      <path d="M66 26h6l-6 5h6" />
      <path d="M75 17h5.2l-5.2 4.4h5.2" />
    </g>
  )
  if (scene.reducedMotion) return marks
  return (
    <motion.g
      animate={{ y: [0, -1.6, 0], opacity: [0.45, 1, 0.45] }}
      transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
    >
      {marks}
    </motion.g>
  )
}

function Sweat({ scene }: { scene: AvatarScene }) {
  return (
    <path
      d="M78 28c0-3.2 5.2-3.2 5.2 0.4 0 2.6-2.6 5.4-2.6 5.4S78 31 78 28.4Z"
      fill={scene.theme.foreground}
      opacity={0.8}
    />
  )
}
