import { describe, expect, it } from "vitest"
import { planBlinks } from "../behavior/useBlink"
import { resolveExpression } from "../expression/resolveExpression"

describe("behavior schedule", () => {
  it("repeats a blink schedule for the same seed", () => {
    expect(planBlinks("studio", 6, 1)).toEqual(planBlinks("studio", 6, 1))
  })

  it("uses a different schedule for a different seed", () => {
    expect(planBlinks("studio", 4, 1)).not.toEqual(planBlinks("stage", 4, 1))
  })
})

describe("state priority", () => {
  it("gives a critical error reaction priority over speaking", () => {
    const visual = resolveExpression({
      activity: "speaking",
      emotion: { valence: 1 },
      expression: "happy",
      reaction: "error",
    })
    expect(visual.eyes.form).toBe("cross")
  })

  it("does not let audio-facing speaking reopen a sleeping face", () => {
    const visual = resolveExpression({
      activity: "sleeping",
      emotion: { surprise: 1, arousal: 1 },
    })
    expect(visual.eyes.openness).toBeLessThan(0.2)
    expect(visual.motion.blinkRate).toBe(0)
  })
})
