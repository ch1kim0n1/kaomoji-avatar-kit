import {
  AVATAR_ACTIVITIES,
  AVATAR_REACTIONS,
  CONTAINERS,
  EYE_STYLES,
  EXPRESSION_PRESETS,
  MOUTH_STYLES,
  PERSONALITY_NAMES,
  type ExpressionPreset,
} from "../avatar/core/types"
import { productVariants, themes } from "../avatar/themes/themes"

export const expressionCaptions: Record<ExpressionPreset, string> = {
  neutral: "(•_•)",
  happy: "(ᵔᴗᵔ)",
  excited: "(✧ᴗ✧)",
  curious: "(•ᴗ•?)",
  confused: "(・_・?)",
  skeptical: "(¬_¬)",
  focused: "(•̀_•́)",
  surprised: "(⊙_⊙)",
  sad: "(｡•́︿•̀｡)",
  annoyed: "(¬︿¬)",
  sleepy: "(-_-)",
  error: "(×_×)",
}

export function avatarCatalog() {
  return {
    activities: AVATAR_ACTIVITIES,
    expressions: EXPRESSION_PRESETS.map((name) => ({
      name,
      caption: expressionCaptions[name],
    })),
    personalities: PERSONALITY_NAMES,
    reactions: AVATAR_REACTIONS,
    eyeStyles: EYE_STYLES,
    mouthStyles: MOUTH_STYLES,
    containers: CONTAINERS,
    themes: Object.keys(themes),
    variants: productVariants,
  }
}

export type AvatarCatalog = ReturnType<typeof avatarCatalog>
