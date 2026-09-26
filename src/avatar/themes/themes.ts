import type { AvatarStyleConfig, AvatarTheme } from "../core/types"
import type { AvatarPersonalityName } from "../core/types"
import { defaultTheme } from "./defaultTheme"

export const themes = {
  ink: defaultTheme,
  violet: {
    foreground: "#1c1428",
    background: "transparent",
    accent: "#6d28d9",
    blush: "#e58aab",
    strokeWidth: 4,
    radius: 24,
  },
  terminal: {
    foreground: "#b7f7c4",
    background: "#102117",
    accent: "#b7f7c4",
    blush: "#86efac",
    strokeWidth: 4,
    radius: 8,
  },
  paper: {
    foreground: "#1c1917",
    background: "transparent",
    accent: "#c2410c",
    blush: "#e11d48",
    strokeWidth: 4,
    radius: 22,
  },
  ocean: {
    foreground: "#10233a",
    background: "transparent",
    accent: "#0f766e",
    blush: "#fb7185",
    strokeWidth: 4,
    radius: 28,
  },
} as const satisfies Record<string, AvatarTheme>

export interface ProductVariant {
  label: string
  personality: AvatarPersonalityName
  style: AvatarStyleConfig
  theme: Partial<AvatarTheme>
}

export const productVariants = {
  minimalProfessional: {
    label: "Minimal professional",
    personality: "professional",
    style: {
      eyeStyle: "oval",
      mouthStyle: "geometric",
      container: "none",
      cheeks: false,
      pupils: false,
      sleepMarks: false,
    },
    theme: { foreground: "#161616", accent: "#161616", blush: "#161616" },
  },
  cuteAssistant: {
    label: "Cute assistant",
    personality: "playful",
    style: {
      eyeStyle: "oval",
      mouthStyle: "cute",
      container: "blob",
      cheeks: true,
      pupils: true,
      sleepMarks: true,
    },
    theme: {
      foreground: "#4a2c3d",
      background: "#ffd6ea",
      accent: "#ffb7d5",
      blush: "#ff7aa2",
      strokeWidth: 3.2,
    },
  },
  terminalCompanion: {
    label: "Terminal companion",
    personality: "robotic",
    style: {
      eyeStyle: "dot",
      mouthStyle: "geometric",
      container: "rounded-square",
      cheeks: false,
      pupils: false,
      sleepMarks: true,
    },
    theme: { foreground: "#b7f7c4", accent: "#b7f7c4", blush: "#86efac", background: "#102117", radius: 8 },
  },
  emotionalCompanion: {
    label: "Emotional companion",
    personality: "curious",
    style: {
      eyeStyle: "oval",
      mouthStyle: "soft",
      container: "circle",
      cheeks: true,
      pupils: true,
      sleepMarks: true,
    },
    theme: {
      foreground: "#3d3144",
      background: "#ffe7f1",
      accent: "#ffc2d8",
      blush: "#ff8fb3",
      strokeWidth: 3.2,
    },
  },
} as const satisfies Record<string, ProductVariant>
