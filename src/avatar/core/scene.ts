import type { MotionValue } from "motion/react"
import type {
  AvatarStyleConfig,
  AvatarTheme,
  AvatarVisualState,
  DetailTier,
} from "./types"

export interface AvatarScene {
  visual: AvatarVisualState
  theme: AvatarTheme
  style: AvatarStyleConfig
  detail: DetailTier
  reducedMotion: boolean
  blink: MotionValue<number>
  speech: MotionValue<number>
  gazeX: MotionValue<number>
  gazeY: MotionValue<number>
  speaking: boolean
}
