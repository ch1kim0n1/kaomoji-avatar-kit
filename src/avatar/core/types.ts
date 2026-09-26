export const AVATAR_ACTIVITIES = [
  "idle",
  "listening",
  "thinking",
  "speaking",
  "working",
  "success",
  "warning",
  "error",
  "sleeping",
] as const

export type AvatarActivity = (typeof AVATAR_ACTIVITIES)[number]

export const EXPRESSION_PRESETS = [
  "neutral",
  "happy",
  "excited",
  "curious",
  "confused",
  "skeptical",
  "focused",
  "surprised",
  "sad",
  "annoyed",
  "sleepy",
  "error",
] as const

export type ExpressionPreset = (typeof EXPRESSION_PRESETS)[number]

export const AVATAR_REACTIONS = [
  "acknowledge",
  "success",
  "error",
  "surprise",
  "wake",
  "sleep",
] as const

export type AvatarReaction = (typeof AVATAR_REACTIONS)[number]

export const PERSONALITY_NAMES = [
  "professional",
  "playful",
  "calm",
  "curious",
  "robotic",
] as const

export type AvatarPersonalityName = (typeof PERSONALITY_NAMES)[number]

export const EYE_STYLES = ["dot", "oval", "arc"] as const
export type EyeStyle = (typeof EYE_STYLES)[number]

export const MOUTH_STYLES = ["soft", "geometric", "cute"] as const
export type MouthStyle = (typeof MOUTH_STYLES)[number]

export const CONTAINERS = ["none", "circle", "rounded-square", "blob"] as const
export type AvatarContainer = (typeof CONTAINERS)[number]

export const MOUTH_TYPES = ["line", "smile", "frown", "open", "o", "w", "cat", "flat"] as const
export type MouthType = (typeof MOUTH_TYPES)[number]

export const EYE_FORMS = ["inherit", "dot", "oval", "arc", "arc-up", "arc-down", "line", "cross"] as const
export type EyeForm = (typeof EYE_FORMS)[number]

export const DETAIL_TIERS = ["tiny", "small", "standard", "large"] as const
export type DetailTier = (typeof DETAIL_TIERS)[number]

export interface AvatarEmotion {
  valence?: number
  arousal?: number
  confidence?: number
  curiosity?: number
  surprise?: number
  frustration?: number
}

export interface AvatarGaze {
  x: number
  y: number
}

export interface AvatarTheme {
  foreground: string
  background?: string
  accent?: string
  blush?: string
  strokeWidth?: number
  radius?: number
}

export interface AvatarPersonality {
  motionEnergy: number
  reactionSpeed: number
  gazeCuriosity: number
  blinkFrequency: number
  asymmetry: number
  bounce: number
}

export interface AvatarStyleConfig {
  eyeStyle: EyeStyle
  mouthStyle: MouthStyle
  container: AvatarContainer
  cheeks: boolean
  pupils: boolean
  sleepMarks: boolean
}

export interface AvatarVisualState {
  face: {
    x: number
    y: number
    scaleX: number
    scaleY: number
    rotate: number
  }
  eyes: {
    openness: number
    width: number
    spacing: number
    leftRotation: number
    rightRotation: number
    form: EyeForm
  }
  pupils: {
    visible: boolean
    x: number
    y: number
    scale: number
  }
  brows: {
    visible: boolean
    leftY: number
    rightY: number
    leftRotation: number
    rightRotation: number
  }
  mouth: {
    type: MouthType
    width: number
    openness: number
    curvature: number
    rotation: number
  }
  cheeks: {
    opacity: number
    scale: number
  }
  motion: {
    bounce: number
    sway: number
    jitter: number
    breath: number
    blinkRate: number
  }
}

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
}

export interface ExpressionInput {
  activity: AvatarActivity
  emotion?: AvatarEmotion
  expression?: ExpressionPreset
  reaction?: AvatarReaction | null
  personality?: AvatarPersonality
  size?: number
  style?: Partial<AvatarStyleConfig>
}

export interface KaomojiAvatarProps {
  activity?: AvatarActivity
  expression?: ExpressionPreset
  emotion?: AvatarEmotion
  gaze?: AvatarGaze
  size?: number | string
  className?: string
  theme?: Partial<AvatarTheme>
  audioAnalyser?: AnalyserNode | null
  seed?: number | string
  interactive?: boolean
  reducedMotion?: boolean
  debug?: boolean
  ariaLabel?: string
  personality?: AvatarPersonalityName | Partial<AvatarPersonality>
  style?: Partial<AvatarStyleConfig>
}

export interface KaomojiAvatarHandle {
  react: (type: AvatarReaction) => void
}

export type AvatarMarker = "none" | "sleep" | "warning"
