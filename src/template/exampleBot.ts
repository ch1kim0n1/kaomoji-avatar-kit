import type { AgentRuntimeState } from "./agentState"
import { agentStateToAvatar } from "./agentState"
import type { AvatarPatch } from "./sanitize"
import { guessEmotion } from "./guessEmotion"
import type { AvatarReaction } from "../avatar/core/types"

export interface TimelineStep {
  at: number
  patch?: AvatarPatch
  reaction?: AvatarReaction
}

/**
 * Replace this function with your bot.
 * Return semantic avatar cues on a timeline. Never return SVG coordinates.
 */
export function scriptForMessage(text: string): TimelineStep[] {
  const emotion = guessEmotion(text)
  const normalized = text.toLowerCase()
  const steps: TimelineStep[] = []

  if (normalized.includes("sleep")) {
    return [
      { at: 0, patch: { activity: "listening", emotion } },
      { at: 500, reaction: "sleep" },
      {
        at: 900,
        patch: {
          activity: "sleeping",
          expression: "sleepy",
          emotion: { valence: 0, arousal: 0.05, curiosity: 0, confidence: 0.5 },
        },
      },
    ]
  }

  if (normalized.includes("wake")) {
    return [
      { at: 0, reaction: "wake" },
      { at: 500, patch: { activity: "idle", expression: null, emotion: { valence: 0.2, arousal: 0.4, curiosity: 0.3 } } },
    ]
  }

  if (/\bfail|\berror|\bbroken|\bbug/.test(normalized)) {
    return [
      { at: 0, patch: { activity: "thinking", emotion: { ...emotion, frustration: 0.35, confidence: 0.4 } } },
      {
        at: 800,
        patch: {
          activity: "error",
          expression: "error",
          emotion: { valence: -0.7, arousal: 0.72, frustration: 0.85, confidence: 0.28 },
        },
      },
      { at: 860, reaction: "error" },
    ]
  }

  if (normalized.includes("warn") || normalized.includes("careful")) {
    return [
      { at: 0, patch: { activity: "listening", emotion } },
      {
        at: 600,
        patch: {
          activity: "warning",
          expression: "skeptical",
          emotion: { valence: -0.25, arousal: 0.42, confidence: 0.38, frustration: 0.3 },
        },
      },
    ]
  }

  steps.push({ at: 0, patch: { activity: "listening", expression: null, emotion } })
  steps.push({
    at: 700,
    patch: {
      activity: "thinking",
      emotion: { ...emotion, curiosity: Math.max(emotion.curiosity ?? 0, 0.55) },
    },
  })

  if (/\b(run|tool|search|code|build|deploy)\b/.test(normalized)) {
    steps.push({ at: 1700, patch: { activity: "working", expression: "focused", emotion } })
    steps.push({ at: 2800, patch: { activity: "speaking", expression: null, emotion } })
    steps.push({ at: 4300, reaction: "success" })
    steps.push({
      at: 4400,
      patch: { activity: "success", expression: "happy", emotion: { ...emotion, valence: Math.max(emotion.valence ?? 0, 0.45) } },
    })
    steps.push({ at: 5600, patch: { activity: "idle", expression: null, emotion } })
    return steps
  }

  const upbeat = (emotion.valence ?? 0) > 0.3
  steps.push({
    at: 1800,
    patch: { activity: "speaking", expression: upbeat ? "happy" : null, emotion },
  })
  steps.push({ at: 3400, reaction: "success" })
  steps.push({
    at: 3500,
    patch: {
      activity: "success",
      expression: upbeat ? "excited" : "happy",
      emotion: { ...emotion, valence: Math.max(emotion.valence ?? 0, 0.35), arousal: 0.55 },
    },
  })
  steps.push({ at: 4800, patch: { activity: "idle", expression: null, emotion } })
  return steps
}

export function scriptForAgentState(state: AgentRuntimeState, text = ""): AvatarPatch {
  return {
    activity: agentStateToAvatar(state),
    emotion: text ? guessEmotion(text) : undefined,
    expression: state === "failed" ? "error" : state === "done" ? "happy" : null,
  }
}
