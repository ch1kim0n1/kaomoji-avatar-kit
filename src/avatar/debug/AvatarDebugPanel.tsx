import { useEffect, useState } from "react"
import type { MotionValue } from "motion/react"
import type { AvatarActivity, AvatarVisualState, DetailTier, ExpressionPreset } from "../core/types"

export function AvatarDebugPanel({
  visual,
  activity,
  expression,
  speech,
  gazeX,
  gazeY,
  blink,
  reducedMotion,
  detail,
}: {
  visual: AvatarVisualState
  activity: AvatarActivity
  expression?: ExpressionPreset
  speech: MotionValue<number>
  gazeX: MotionValue<number>
  gazeY: MotionValue<number>
  blink: MotionValue<number>
  reducedMotion: boolean
  detail: DetailTier
}) {
  const [live, setLive] = useState({ speech: 0, gazeX: 0, gazeY: 0, blink: 1 })

  useEffect(() => {
    const id = window.setInterval(() => {
      setLive({
        speech: speech.get(),
        gazeX: gazeX.get(),
        gazeY: gazeY.get(),
        blink: blink.get(),
      })
    }, 140)
    return () => window.clearInterval(id)
  }, [blink, gazeX, gazeY, speech])

  return (
    <pre className="avatar-debug-panel">
      {JSON.stringify(
        {
          activity,
          expression: expression ?? null,
          detail,
          reducedMotion,
          live: {
            speech: round(live.speech),
            gazeX: round(live.gazeX),
            gazeY: round(live.gazeY),
            blink: round(live.blink),
          },
          eyes: visual.eyes,
          mouth: visual.mouth,
          brows: visual.brows,
          cheeks: visual.cheeks,
          motion: visual.motion,
          face: visual.face,
        },
        null,
        2,
      )}
    </pre>
  )
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}
