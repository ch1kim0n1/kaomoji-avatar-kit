import { describe, expect, it } from "vitest"
import { clamp01, clampSigned } from "../core/clamp"
import { planBlinks } from "../behavior/useBlink"
import { resolveExpression } from "../expression/resolveExpression"
import { createRng } from "../core/random"

describe("clamping", () => {
  it("clamps valence and unit intervals", () => {
    expect(clampSigned(4)).toBe(1)
    expect(clampSigned(-4)).toBe(-1)
    expect(clamp01(2)).toBe(1)
    expect(clamp01(-1)).toBe(0)
    expect(clampSigned(Number.NaN)).toBe(0)
  })
})

describe("expression resolution", () => {
  it("treats out-of-range valence as the clamped extreme", () => {
    const high = resolveExpression({ activity: "idle", emotion: { valence: 5 } })
    const max = resolveExpression({ activity: "idle", emotion: { valence: 1 } })
    expect(high.mouth.curvature).toBeCloseTo(max.mouth.curvature)
    expect(high.mouth.curvature).toBeGreaterThan(0)
  })

  it("keeps sleeping eyes closed even when surprise is high", () => {
    const visual = resolveExpression({
      activity: "sleeping",
      emotion: { surprise: 1, valence: 1, arousal: 1 },
    })
    expect(visual.eyes.form).toBe("line")
    expect(visual.eyes.openness).toBeLessThan(0.2)
    expect(visual.mouth.type).not.toBe("o")
    expect(visual.motion.blinkRate).toBe(0)
  })

  it("lets an explicit expression override activity", () => {
    const visual = resolveExpression({ activity: "sleeping", expression: "happy" })
    expect(visual.eyes.form).toBe("arc-up")
    expect(visual.mouth.type).toBe("smile")
  })

  it("lets an error reaction override speaking", () => {
    const visual = resolveExpression({
      activity: "speaking",
      emotion: { valence: 0.8 },
      reaction: "error",
    })
    expect(visual.eyes.form).toBe("cross")
    expect(visual.pupils.visible).toBe(false)
  })

  it("blends happy emotion into a speaking mouth instead of replacing the face", () => {
    const visual = resolveExpression({
      activity: "speaking",
      emotion: { valence: 0.9, arousal: 0.4 },
    })
    expect(visual.mouth.type).toBe("open")
    expect(visual.cheeks.opacity).toBeGreaterThan(0.2)
    expect(visual.mouth.curvature).toBeGreaterThan(0.2)
  })

  it("hides brows, cheeks, and pupils at tiny sizes", () => {
    const visual = resolveExpression({
      activity: "idle",
      expression: "happy",
      size: 24,
    })
    expect(visual.brows.visible).toBe(false)
    expect(visual.cheeks.opacity).toBe(0)
    expect(visual.pupils.visible).toBe(false)
  })

  it("raises one brow more than the other for curiosity", () => {
    const visual = resolveExpression({
      activity: "idle",
      emotion: { curiosity: 1, valence: 0, surprise: 0, frustration: 0 },
    })
    expect(visual.brows.leftY).toBeLessThan(visual.brows.rightY)
  })
})

describe("seeded blinks", () => {
  it("repeats the same schedule for the same seed", () => {
    expect(planBlinks("studio", 6, 1)).toEqual(planBlinks("studio", 6, 1))
  })

  it("changes when the seed changes", () => {
    expect(planBlinks("studio", 4, 1)).not.toEqual(planBlinks("other", 4, 1))
  })

  it("draws delays from the idle range after rate scaling", () => {
    const [first] = planBlinks("studio", 1, 1)
    expect(first?.delay).toBeGreaterThanOrEqual(2200)
    expect(first?.delay).toBeLessThanOrEqual(6500)
  })
})

describe("rng", () => {
  it("is deterministic", () => {
    const a = createRng("avatar")
    const b = createRng("avatar")
    expect([a.next(), a.next(), a.next()]).toEqual([b.next(), b.next(), b.next()])
  })
})
