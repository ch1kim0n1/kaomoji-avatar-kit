import type { Transition } from "motion/react"

export const motionTokens = {
  duration: {
    instant: 0.08,
    fast: 0.14,
    normal: 0.24,
    slow: 0.45,
    idle: 3.4,
    breath: 3.8,
  },
  spring: {
    snappy: {
      type: "spring",
      stiffness: 520,
      damping: 28,
      mass: 0.55,
    },
    soft: {
      type: "spring",
      stiffness: 220,
      damping: 24,
      mass: 0.8,
    },
    gaze: {
      type: "spring",
      stiffness: 140,
      damping: 20,
      mass: 0.7,
    },
  },
} as const satisfies {
  duration: Record<string, number>
  spring: Record<string, Transition>
}
