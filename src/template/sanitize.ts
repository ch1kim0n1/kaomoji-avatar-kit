import { clamp, clamp01, clampSigned } from "../avatar/core/clamp"
import {
  AVATAR_ACTIVITIES,
  CONTAINERS,
  EYE_STYLES,
  EXPRESSION_PRESETS,
  MOUTH_STYLES,
  PERSONALITY_NAMES,
  type AvatarActivity,
  type AvatarContainer,
  type AvatarEmotion,
  type AvatarGaze,
  type AvatarPersonalityName,
  type AvatarStyleConfig,
  type AvatarTheme,
  type ExpressionPreset,
  type EyeStyle,
  type MouthStyle,
} from "../avatar/core/types"

export interface AvatarPatch {
  activity?: AvatarActivity
  expression?: ExpressionPreset | null
  emotion?: AvatarEmotion
  gaze?: AvatarGaze | null
  personality?: AvatarPersonalityName
  theme?: Partial<AvatarTheme>
  style?: Partial<AvatarStyleConfig>
}

export interface AvatarSignal {
  activity: AvatarActivity
  expression?: ExpressionPreset
  emotion: AvatarEmotion
  gaze?: AvatarGaze
  personality: AvatarPersonalityName
  theme: Partial<AvatarTheme>
  style: Partial<AvatarStyleConfig>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[]): T | undefined {
  return typeof value === "string" && allowed.includes(value as T) ? (value as T) : undefined
}

export function cleanColor(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined
  const trimmed = value.trim()
  if (trimmed.length === 0 || trimmed.length > 80) return undefined
  if (!/^[#(),.%\w\s-]+$/.test(trimmed)) return undefined
  return trimmed
}

export function sanitizeEmotion(input: unknown): AvatarEmotion {
  if (!isRecord(input)) return {}
  const emotion: AvatarEmotion = {}
  if (typeof input.valence === "number") emotion.valence = clampSigned(input.valence)
  if (typeof input.arousal === "number") emotion.arousal = clamp01(input.arousal)
  if (typeof input.confidence === "number") emotion.confidence = clamp01(input.confidence)
  if (typeof input.curiosity === "number") emotion.curiosity = clamp01(input.curiosity)
  if (typeof input.surprise === "number") emotion.surprise = clamp01(input.surprise)
  if (typeof input.frustration === "number") emotion.frustration = clamp01(input.frustration)
  return emotion
}

function sanitizeTheme(input: unknown): Partial<AvatarTheme> | undefined {
  if (!isRecord(input)) return undefined
  const theme: Partial<AvatarTheme> = {}
  const foreground = cleanColor(input.foreground)
  const background = cleanColor(input.background)
  const accent = cleanColor(input.accent)
  const blush = cleanColor(input.blush)
  if (foreground) theme.foreground = foreground
  if (background) theme.background = background
  if (accent) theme.accent = accent
  if (blush) theme.blush = blush
  if (typeof input.strokeWidth === "number") theme.strokeWidth = clamp(input.strokeWidth, 1, 10, 4)
  if (typeof input.radius === "number") theme.radius = clamp(input.radius, 0, 48, 24)
  return theme
}

function sanitizeStyle(input: unknown): Partial<AvatarStyleConfig> | undefined {
  if (!isRecord(input)) return undefined
  const style: Partial<AvatarStyleConfig> = {}
  const eyeStyle = oneOf<EyeStyle>(input.eyeStyle, EYE_STYLES)
  const mouthStyle = oneOf<MouthStyle>(input.mouthStyle, MOUTH_STYLES)
  const container = oneOf<AvatarContainer>(input.container, CONTAINERS)
  if (eyeStyle) style.eyeStyle = eyeStyle
  if (mouthStyle) style.mouthStyle = mouthStyle
  if (container) style.container = container
  if (typeof input.cheeks === "boolean") style.cheeks = input.cheeks
  if (typeof input.pupils === "boolean") style.pupils = input.pupils
  if (typeof input.sleepMarks === "boolean") style.sleepMarks = input.sleepMarks
  return style
}

function sanitizeGaze(input: unknown): AvatarGaze | undefined {
  if (!isRecord(input) || typeof input.x !== "number" || typeof input.y !== "number") return undefined
  return { x: clampSigned(input.x), y: clampSigned(input.y) }
}

export function sanitizePatch(input: unknown): { ok: true; patch: AvatarPatch } | { ok: false; error: string } {
  if (!isRecord(input)) return { ok: false, error: "Patch must be an object" }
  const patch: AvatarPatch = {}

  if ("activity" in input) {
    const activity = oneOf<AvatarActivity>(input.activity, AVATAR_ACTIVITIES)
    if (!activity) return { ok: false, error: "Unknown activity" }
    patch.activity = activity
  }

  if ("expression" in input) {
    if (input.expression === null) patch.expression = null
    else {
      const expression = oneOf<ExpressionPreset>(input.expression, EXPRESSION_PRESETS)
      if (!expression) return { ok: false, error: "Unknown expression" }
      patch.expression = expression
    }
  }

  if ("emotion" in input) patch.emotion = sanitizeEmotion(input.emotion)
  if ("gaze" in input) patch.gaze = input.gaze === null ? null : sanitizeGaze(input.gaze)
  if ("personality" in input) {
    const personality = oneOf<AvatarPersonalityName>(input.personality, PERSONALITY_NAMES)
    if (!personality) return { ok: false, error: "Unknown personality" }
    patch.personality = personality
  }
  if ("theme" in input) patch.theme = sanitizeTheme(input.theme)
  if ("style" in input) patch.style = sanitizeStyle(input.style)

  return { ok: true, patch }
}

export function createDefaultSignal(): AvatarSignal {
  return {
    activity: "idle",
    emotion: {
      valence: 0.42,
      arousal: 0.35,
      confidence: 0.62,
      curiosity: 0.25,
      surprise: 0,
      frustration: 0,
    },
    personality: "curious",
    theme: {
      foreground: "#3d3144",
      background: "#ffe7f1",
      accent: "#ffc2d8",
      blush: "#ff8fb3",
      strokeWidth: 3.2,
    },
    style: {
      eyeStyle: "oval",
      mouthStyle: "soft",
      container: "circle",
      cheeks: true,
      pupils: true,
      sleepMarks: true,
    },
  }
}

export function applyPatch(state: AvatarSignal, patch: AvatarPatch): AvatarSignal {
  const next: AvatarSignal = {
    ...state,
    emotion: { ...state.emotion, ...patch.emotion },
    theme: { ...state.theme, ...patch.theme },
    style: { ...state.style, ...patch.style },
  }
  if (patch.activity) next.activity = patch.activity
  if ("expression" in patch) next.expression = patch.expression ?? undefined
  if ("gaze" in patch) next.gaze = patch.gaze ?? undefined
  if (patch.personality) next.personality = patch.personality
  return next
}
