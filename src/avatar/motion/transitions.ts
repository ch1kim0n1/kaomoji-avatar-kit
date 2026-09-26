import type { Transition } from "motion/react"
import { motionTokens } from "./motionTokens"

export function expressionTransition(reducedMotion: boolean, reactionSpeed = 0.55): Transition {
  if (reducedMotion) return { duration: motionTokens.duration.instant }
  const speed = 0.45 + reactionSpeed
  return {
    type: "spring",
    stiffness: 180 + speed * 80,
    damping: 22,
    mass: 0.85,
  }
}

export function blinkTransition(closing: boolean, reducedMotion: boolean): Transition {
  if (reducedMotion) return { duration: 0.01 }
  return {
    duration: closing ? 0.07 : 0.1,
    ease: closing ? "easeIn" : "easeOut",
  }
}

export function gazeSpring(reducedMotion: boolean, reactionSpeed = 0.55) {
  if (reducedMotion) {
    return { stiffness: 1000, damping: 80, mass: 0.2 }
  }
  return {
    stiffness: 120 + reactionSpeed * 80,
    damping: 18 + reactionSpeed * 6,
    mass: 0.7,
  }
}
