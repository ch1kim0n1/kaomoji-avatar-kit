import { describe, expect, it } from "vitest"
import { applyPatch, createDefaultSignal, sanitizeEmotion, sanitizePatch } from "./sanitize"
import { scriptForMessage } from "./exampleBot"
import { agentStateToAvatar } from "./agentState"
import { AvatarSession } from "./session"

describe("template signal sanitizing", () => {
  it("clamps emotional input from a bot", () => {
    expect(sanitizeEmotion({ valence: 8, arousal: -2, confidence: 0.4 })).toEqual({
      valence: 1,
      arousal: 0,
      confidence: 0.4,
    })
  })

  it("rejects unknown activities", () => {
    const result = sanitizePatch({ activity: "dreaming" })
    expect(result.ok).toBe(false)
  })

  it("clears an expression override", () => {
    const next = applyPatch(createDefaultSignal(), { expression: "happy" })
    const cleared = applyPatch(next, { expression: null })
    expect(next.expression).toBe("happy")
    expect(cleared.expression).toBeUndefined()
  })
})

describe("template bot script", () => {
  it("maps agent runtime states without inventing avatar-only names", () => {
    expect(agentStateToAvatar("reasoning")).toBe("thinking")
    expect(agentStateToAvatar("generating")).toBe("speaking")
    expect(agentStateToAvatar("failed")).toBe("error")
  })

  it("walks a message through listening, thinking, and speaking", () => {
    const activities = scriptForMessage("hello").flatMap((step) => step.patch?.activity ?? [])
    expect(activities).toContain("listening")
    expect(activities).toContain("thinking")
    expect(activities).toContain("speaking")
  })

  it("routes failure copy to the error face", () => {
    const activities = scriptForMessage("the build failed").flatMap((step) => step.patch?.activity ?? [])
    expect(activities).toContain("error")
  })
})

describe("avatar session", () => {
  it("applies a patch and notifies listeners once", () => {
    const session = new AvatarSession()
    const seen: string[] = []
    session.subscribe((event) => seen.push(event.state.activity))
    session.patch({ activity: "thinking" })
    expect(session.getState().activity).toBe("thinking")
    expect(seen).toEqual(["thinking"])
  })
})
