import type { DeepPartial, ExpressionPreset, AvatarVisualState } from "../core/types"

const eyes = (patch: DeepPartial<AvatarVisualState["eyes"]>) => patch
const mouth = (patch: DeepPartial<AvatarVisualState["mouth"]>) => patch

export const expressionPresets = {
  neutral: {},
  happy: {
    eyes: eyes({ form: "arc-up", openness: 0.86, width: 1.02 }),
    brows: { visible: false, leftY: -0.8, rightY: -0.8 },
    mouth: mouth({ type: "smile", width: 1.06, openness: 0.16, curvature: 0.82 }),
    cheeks: { opacity: 0.72, scale: 1.05 },
  },
  excited: {
    eyes: eyes({ form: "arc-up", openness: 1, width: 1.08 }),
    brows: { visible: false, leftY: -2.4, rightY: -2.4 },
    mouth: mouth({ type: "cat", width: 1.14, openness: 0.42, curvature: 0.95 }),
    cheeks: { opacity: 0.95, scale: 1.16 },
    face: { scaleX: 0.98, scaleY: 1.03 },
    motion: { bounce: 0.9, sway: 0.55 },
  },
  curious: {
    face: { rotate: -7 },
    eyes: eyes({ openness: 0.9, width: 1.02, leftRotation: -2 }),
    brows: { leftY: -3.3, rightY: -0.2, leftRotation: -12, rightRotation: 3 },
    mouth: mouth({ type: "smile", width: 0.82, openness: 0.12, curvature: 0.38, rotation: -4 }),
  },
  confused: {
    face: { rotate: 5 },
    eyes: eyes({ openness: 0.7, leftRotation: -7, rightRotation: 6 }),
    brows: { leftY: -2.6, rightY: 1.3, leftRotation: -14, rightRotation: 11 },
    mouth: mouth({ type: "w", width: 0.78, openness: 0.2, curvature: 0.1, rotation: 6 }),
    motion: { jitter: 0.2 },
  },
  skeptical: {
    face: { rotate: 3 },
    eyes: eyes({ openness: 0.46, width: 1.04 }),
    brows: { leftY: -2.6, rightY: 1.2, leftRotation: -4, rightRotation: 9 },
    mouth: mouth({ type: "flat", width: 0.74, curvature: -0.18, rotation: -3 }),
  },
  focused: {
    eyes: eyes({ openness: 0.5, width: 0.9 }),
    brows: { leftY: 1.5, rightY: 1.5, leftRotation: 13, rightRotation: -13 },
    mouth: mouth({ type: "flat", width: 0.62, curvature: 0.06 }),
    motion: { sway: 0.1, jitter: 0.02, bounce: 0.08 },
  },
  surprised: {
    eyes: eyes({ form: "oval", openness: 1, width: 1.14 }),
    brows: { visible: false, leftY: -3.6, rightY: -3.6 },
    mouth: mouth({ type: "o", width: 0.82, openness: 0.92, curvature: 0 }),
    cheeks: { opacity: 0.18, scale: 0.9 },
    pupils: { scale: 0.72 },
  },
  sad: {
    eyes: eyes({ form: "arc-down", openness: 0.58 }),
    brows: { leftY: 2.2, rightY: 2.2, leftRotation: -16, rightRotation: 16 },
    mouth: mouth({ type: "frown", width: 0.9, openness: 0.08, curvature: -0.86 }),
    cheeks: { opacity: 0.12, scale: 0.85 },
  },
  annoyed: {
    eyes: eyes({ openness: 0.4, width: 1.02 }),
    brows: { leftY: 0.8, rightY: 0.8, leftRotation: 16, rightRotation: -16 },
    mouth: mouth({ type: "frown", width: 0.78, curvature: -0.5 }),
  },
  sleepy: {
    eyes: eyes({ form: "line", openness: 0.1 }),
    brows: { visible: false, leftY: 2.4, rightY: 2.4, leftRotation: -4, rightRotation: 4 },
    mouth: mouth({ type: "flat", width: 0.7, openness: 0.04, curvature: 0.05 }),
    pupils: { visible: false },
    motion: { blinkRate: 0.15, sway: 0.08, breath: 0.95, bounce: 0.04 },
  },
  error: {
    eyes: eyes({ form: "cross", openness: 0.82 }),
    brows: { visible: false, leftY: 1.6, rightY: 1.6, leftRotation: 16, rightRotation: -16 },
    mouth: mouth({ type: "flat", width: 0.7, curvature: -0.42, openness: 0.05 }),
    pupils: { visible: false },
    cheeks: { opacity: 0 },
    motion: { bounce: 0, sway: 0.04, jitter: 0.02 },
  },
} as const satisfies Record<ExpressionPreset, DeepPartial<AvatarVisualState>>

export const reactionPatches = {
  acknowledge: {},
  success: {
    eyes: eyes({ form: "arc-up", openness: 0.92 }),
    mouth: mouth({ type: "smile", width: 1.08, curvature: 0.9, openness: 0.28 }),
    cheeks: { opacity: 0.9, scale: 1.12 },
    brows: { leftY: -1.4, rightY: -1.4 },
  },
  error: {
    eyes: eyes({ form: "cross", openness: 0.8 }),
    mouth: mouth({ type: "flat", width: 0.7, curvature: -0.4, openness: 0.04 }),
    pupils: { visible: false },
    cheeks: { opacity: 0 },
    brows: { visible: false, leftRotation: 14, rightRotation: -14, leftY: 1.2, rightY: 1.2 },
  },
  surprise: {
    eyes: eyes({ form: "oval", openness: 1, width: 1.12 }),
    mouth: mouth({ type: "o", openness: 0.88, width: 0.8 }),
    brows: { leftY: -3.4, rightY: -3.4 },
  },
  wake: {
    eyes: eyes({ form: "oval", openness: 0.9 }),
    pupils: { visible: true },
    mouth: mouth({ type: "flat", openness: 0.1, curvature: 0.1 }),
  },
  sleep: {
    eyes: eyes({ form: "line", openness: 0.08 }),
    pupils: { visible: false },
    mouth: mouth({ type: "flat", width: 0.7, openness: 0.02, curvature: 0 }),
  },
} as const satisfies Record<string, DeepPartial<AvatarVisualState>>
