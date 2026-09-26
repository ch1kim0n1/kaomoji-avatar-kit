import type { AvatarTheme } from "../core/types"

export const defaultTheme: AvatarTheme = {
  foreground: "currentColor",
  background: "transparent",
  accent: "currentColor",
  blush: "currentColor",
  strokeWidth: 4,
  radius: 24,
}

export function resolveTheme(partial?: Partial<AvatarTheme>): AvatarTheme {
  return {
    foreground: partial?.foreground ?? defaultTheme.foreground,
    background: partial?.background ?? defaultTheme.background,
    accent: partial?.accent ?? defaultTheme.accent,
    blush: partial?.blush ?? defaultTheme.blush,
    strokeWidth: partial?.strokeWidth ?? defaultTheme.strokeWidth,
    radius: partial?.radius ?? defaultTheme.radius,
  }
}
