export { KaomojiAvatar } from "./components/KaomojiAvatar"
export { AvatarPlayground } from "./debug/AvatarPlayground"
export { AvatarDebugPanel } from "./debug/AvatarDebugPanel"
export { createAudioAnalyser, disposeAudioAnalyser } from "./audio/createAudioAnalyser"
export { getRms, gateAndNormalize, smoothLevel, mapSpeechToMouth } from "./audio/audioMath"
export { expressionPresets } from "./expression/presets"
export { resolveExpression, parseSize, detailTierFor } from "./expression/resolveExpression"
export { personalityPresets, defaultPersonality, resolvePersonality } from "./motion/personalities"
export { motionTokens } from "./motion/motionTokens"
export { defaultTheme, resolveTheme } from "./themes/defaultTheme"
export { themes, productVariants } from "./themes/themes"
export { clamp, clamp01, clampSigned, lerp } from "./core/clamp"
export { createRng } from "./core/random"
export { GEOMETRY, AUDIO, defaultStyle } from "./core/constants"
export { planBlinks } from "./behavior/useBlink"

export type {
  AvatarActivity,
  AvatarEmotion,
  AvatarGaze,
  AvatarPersonality,
  AvatarPersonalityName,
  AvatarReaction,
  AvatarStyleConfig,
  AvatarTheme,
  AvatarVisualState,
  DetailTier,
  ExpressionPreset,
  EyeStyle,
  KaomojiAvatarHandle,
  KaomojiAvatarProps,
  MouthStyle,
  AvatarContainer,
} from "./core/types"
