import type { AvatarReaction } from "../avatar/core/types"
import type { BotEvent } from "./botEvent"
import { scriptForAgentState, scriptForMessage } from "./exampleBot"
import type { AvatarPatch, AvatarSignal } from "./sanitize"
import { applyPatch, createDefaultSignal, sanitizePatch } from "./sanitize"

export interface SessionReaction {
  type: AvatarReaction
  id: string
}

export interface SessionEvent {
  state: AvatarSignal
  reaction?: SessionReaction
}

function nextId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export class AvatarSession {
  private state: AvatarSignal
  private listeners = new Set<(event: SessionEvent) => void>()
  private timers: Array<ReturnType<typeof setTimeout>> = []
  private generation = 0

  constructor(initial?: AvatarSignal) {
    this.state = initial ?? createDefaultSignal()
  }

  getState(): AvatarSignal {
    return structuredClone(this.state)
  }

  subscribe(listener: (event: SessionEvent) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  patch(patch: AvatarPatch): AvatarSignal {
    this.state = applyPatch(this.state, patch)
    const state = this.getState()
    this.emit({ state })
    return state
  }

  react(type: AvatarReaction, id = nextId()): void {
    this.emit({ state: this.getState(), reaction: { type, id } })
  }

  play(steps: Array<{ at: number; patch?: AvatarPatch; reaction?: AvatarReaction }>): void {
    this.cancel()
    const generation = this.generation
    for (const step of steps) {
      const timer = setTimeout(() => {
        if (generation !== this.generation) return
        if (step.patch) this.patch(step.patch)
        if (step.reaction) this.react(step.reaction)
      }, step.at)
      this.timers.push(timer)
    }
  }

  handleBotEvent(event: BotEvent): void {
    if (event.type === "user_message") {
      this.play(scriptForMessage(event.text))
      return
    }
    if (event.type === "agent_state") {
      this.cancel()
      this.patch(scriptForAgentState(event.state, event.text ?? ""))
      return
    }
    if (event.type === "react") {
      this.react(event.reaction)
      return
    }
    if (event.type === "sleep") {
      this.play(scriptForMessage("sleep"))
      return
    }
    if (event.type === "wake") {
      this.play(scriptForMessage("wake"))
      return
    }
    this.cancel()
    this.patch({ activity: "idle", expression: null })
  }

  applyUnknownPatch(input: unknown): { ok: true; state: AvatarSignal } | { ok: false; error: string } {
    const parsed = sanitizePatch(input)
    if (!parsed.ok) return parsed
    return { ok: true, state: this.patch(parsed.patch) }
  }

  cancel(): void {
    this.generation += 1
    for (const timer of this.timers) clearTimeout(timer)
    this.timers = []
  }

  private emit(event: SessionEvent): void {
    for (const listener of this.listeners) listener(event)
  }
}
