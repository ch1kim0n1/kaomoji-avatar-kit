import { GEOMETRY } from "../core/constants"
import type { AvatarScene } from "../core/scene"

export function Cheeks({ scene }: { scene: AvatarScene }) {
  const opacity = scene.visual.cheeks.opacity
  if (opacity <= 0.01) return null
  const radius = GEOMETRY.cheekR * scene.visual.cheeks.scale
  const blush = scene.theme.blush ?? scene.theme.foreground
  const cheeks = [GEOMETRY.leftCheek, GEOMETRY.rightCheek]

  return (
    <g>
      {cheeks.map((cheek) => (
        <ellipse
          key={`${cheek.x}`}
          cx={cheek.x}
          cy={cheek.y}
          rx={radius * 1.55}
          ry={radius * 0.72}
          fill={blush}
          opacity={Math.min(0.82, 0.28 + opacity * 0.62)}
        />
      ))}
    </g>
  )
}
