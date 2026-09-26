import { describe, expect, it } from "vitest"
import { gateAndNormalize, getRms, mapSpeechToMouth, smoothLevel } from "../audio/audioMath"

function fill(value: number, length = 32): Uint8Array {
  const samples = new Uint8Array(length)
  samples.fill(value)
  return samples
}

describe("audio math", () => {
  it("treats centered silence as zero", () => {
    expect(getRms(fill(128))).toBeCloseTo(0)
  })

  it("measures a loud constant sample", () => {
    expect(getRms(fill(255))).toBeGreaterThan(0.9)
  })

  it("gates noise and caps loud input", () => {
    expect(gateAndNormalize(0.02, 0.045, 3.1)).toBe(0)
    expect(gateAndNormalize(0.8, 0.045, 3.1)).toBe(1)
  })

  it("attacks faster than it releases", () => {
    const rising = smoothLevel(0, 1, 0.45, 0.16)
    const falling = smoothLevel(1, 0, 0.45, 0.16)
    expect(rising).toBeCloseTo(0.45)
    expect(falling).toBeCloseTo(0.84)
    expect(rising).toBeGreaterThan(1 - falling)
  })

  it("maps speech into a capped mouth range", () => {
    expect(mapSpeechToMouth(0).openness).toBeCloseTo(0.1)
    expect(mapSpeechToMouth(1).openness).toBeCloseTo(1)
    expect(mapSpeechToMouth(4).openness).toBeCloseTo(1)
    expect(mapSpeechToMouth(1).width).toBeLessThan(1.2)
    expect(mapSpeechToMouth(1).headY).toBeGreaterThanOrEqual(-0.4)
    expect(mapSpeechToMouth(1).headY).toBeLessThan(0)
  })
})
