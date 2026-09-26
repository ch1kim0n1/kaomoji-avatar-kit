import type { ReactNode } from "react"
import type { AvatarScene } from "../core/scene"
import { Brows } from "./Brows"
import { Cheeks } from "./Cheeks"
import { Eyes } from "./Eyes"
import { Mouth } from "./Mouth"
import { Pupils } from "./Pupils"

export function Face({ scene, children }: { scene: AvatarScene; children?: ReactNode }) {
  return (
    <g>
      <Cheeks scene={scene} />
      <Brows scene={scene} />
      <Eyes scene={scene} />
      <Pupils scene={scene} />
      <Mouth scene={scene} />
      {children}
    </g>
  )
}
