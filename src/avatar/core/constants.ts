import type { AvatarStyleConfig, AvatarVisualState } from "./types"

export const GEOMETRY = {
  viewBox: 100,
  face: { x: 50, y: 50 },
  leftEye: { x: 35, y: 42 },
  rightEye: { x: 65, y: 42 },
  mouth: { x: 50, y: 64 },
  leftBrow: { x: 35, y: 31 },
  rightBrow: { x: 65, y: 31 },
  leftCheek: { x: 27, y: 58 },
  rightCheek: { x: 73, y: 58 },
  eyeRx: 8.4,
  eyeRy: 7.5,
  pupilR: 2.55,
  maxPupilOffsetX: 3.4,
  maxPupilOffsetY: 2.6,
  browHalf: 4.6,
  cheekR: 4.4,
} as const

export const AUDIO = {
  fftSize: 256,
  smoothingTimeConstant: 0.65,
  noiseGate: 0.045,
  gain: 3.1,
  attack: 0.45,
  release: 0.16,
} as const

export const BLINK = {
  minIntervalMs: 2200,
  maxIntervalMs: 6500,
  minDurationMs: 100,
  maxDurationMs: 180,
  minDoubleGapMs: 80,
  maxDoubleGapMs: 180,
  doubleProbability: 0.18,
  closed: 0.07,
} as const

export const LIMITS = {
  maxMouthCurve: 1,
  maxFaceRotate: 16,
  maxShake: 2.6,
  browHideBelow: 40,
  pupilHideBelow: 48,
  tinyBelow: 32,
  smallBelow: 64,
  largeAt: 128,
} as const

export const defaultStyle: AvatarStyleConfig = {
  eyeStyle: "oval",
  mouthStyle: "soft",
  container: "none",
  cheeks: true,
  pupils: true,
  sleepMarks: true,
}

export function createDefaultVisual(): AvatarVisualState {
  return {
    face: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotate: 0 },
    eyes: {
      openness: 0.72,
      width: 1,
      spacing: 0,
      leftRotation: 0,
      rightRotation: 0,
      form: "inherit",
    },
    pupils: { visible: true, x: 0, y: 0, scale: 1 },
    brows: {
      visible: true,
      leftY: 0,
      rightY: 0,
      leftRotation: 0,
      rightRotation: 0,
    },
    mouth: {
      type: "flat",
      width: 1,
      openness: 0.12,
      curvature: 0,
      rotation: 0,
    },
    cheeks: { opacity: 0.5, scale: 1 },
    motion: {
      bounce: 0.18,
      sway: 0.42,
      jitter: 0.06,
      breath: 0.75,
      blinkRate: 1,
    },
  }
}
