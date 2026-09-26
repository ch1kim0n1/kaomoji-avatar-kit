import { AVATAR_REACTIONS, type AvatarReaction } from "../avatar/core/types"
import type { AgentRuntimeState } from "./agentState"

export type BotEvent =
  | { type: "user_message"; text: string }
  | { type: "agent_state"; state: AgentRuntimeState; text?: string }
  | { type: "react"; reaction: AvatarReaction }
  | { type: "idle" }
  | { type: "sleep" }
  | { type: "wake" }

const AGENT_STATES: readonly AgentRuntimeState[] = [
  "ready",
  "recording",
  "reasoning",
  "generating",
  "executing_tool",
  "done",
  "failed",
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

export function sanitizeBotEvent(input: unknown): BotEvent | null {
  if (!isRecord(input) || typeof input.type !== "string") return null
  if (input.type === "user_message" && typeof input.text === "string") {
    return { type: "user_message", text: input.text.slice(0, 500) }
  }
  if (input.type === "agent_state" && typeof input.state === "string" && AGENT_STATES.includes(input.state as AgentRuntimeState)) {
    return {
      type: "agent_state",
      state: input.state as AgentRuntimeState,
      text: typeof input.text === "string" ? input.text.slice(0, 500) : undefined,
    }
  }
  if (input.type === "react" && typeof input.reaction === "string" && AVATAR_REACTIONS.includes(input.reaction as AvatarReaction)) {
    return { type: "react", reaction: input.reaction as AvatarReaction }
  }
  if (input.type === "idle" || input.type === "sleep" || input.type === "wake") return { type: input.type }
  return null
}
