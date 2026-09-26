export type Rng = {
  next: () => number
  range: (min: number, max: number) => number
  chance: (probability: number) => boolean
}

export function hashSeed(seed: string | number): number {
  const text = String(seed)
  let hash = 2166136261
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function mulberry32(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function createRng(seed?: string | number): Rng {
  const hashed = seed === undefined ? (Math.floor(Math.random() * 0xffffffff) >>> 0) : hashSeed(seed)
  const next = mulberry32(hashed === 0 ? 1 : hashed)
  return {
    next,
    range(min, max) {
      return min + next() * (max - min)
    },
    chance(probability) {
      return next() < clampProbability(probability)
    },
  }
}

function clampProbability(probability: number): number {
  if (!Number.isFinite(probability)) return 0
  return Math.max(0, Math.min(1, probability))
}
