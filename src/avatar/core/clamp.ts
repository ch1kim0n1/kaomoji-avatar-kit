export function clamp(n: number, min: number, max: number, fallback = min): number {
  if (!Number.isFinite(n)) return fallback
  return Math.max(min, Math.min(max, n))
}

export const clamp01 = (n: number): number => clamp(n, 0, 1, 0)

export const clampSigned = (n: number): number => clamp(n, -1, 1, 0)

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp01(t)
}
