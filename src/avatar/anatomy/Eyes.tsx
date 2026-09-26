import { GEOMETRY } from "../core/constants"
import type { EyeForm } from "../core/types"
import type { AvatarScene } from "../core/scene"
import { Eye } from "./Eye"

export function resolvedEyeForm(scene: AvatarScene): EyeForm | AvatarScene["style"]["eyeStyle"] {
  return scene.visual.eyes.form === "inherit" ? scene.style.eyeStyle : scene.visual.eyes.form
}

export function Eyes({ scene }: { scene: AvatarScene }) {
  const form = resolvedEyeForm(scene)
  const { eyes } = scene.visual
  const rx = GEOMETRY.eyeRx * eyes.width
  const ry = GEOMETRY.eyeRy

  return (
    <g>
      <Eye
        cx={GEOMETRY.leftEye.x - eyes.spacing}
        cy={GEOMETRY.leftEye.y}
        rx={rx}
        ry={ry}
        rotation={eyes.leftRotation}
        openness={eyes.openness}
        form={form}
        scene={scene}
      />
      <Eye
        cx={GEOMETRY.rightEye.x + eyes.spacing}
        cy={GEOMETRY.rightEye.y}
        rx={rx}
        ry={ry}
        rotation={eyes.rightRotation}
        openness={eyes.openness}
        form={form}
        scene={scene}
      />
    </g>
  )
}
