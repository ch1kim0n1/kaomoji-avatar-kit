import { useEffect, useMemo, useRef, type RefObject } from "react"
import { resolvePersonality } from "../motion/personalities"
import type { MotionValue } from "motion/react"
import type {
  AvatarActivity,
  AvatarEmotion,
  AvatarGaze,
  AvatarPersonality,
  AvatarReaction,
  AvatarStyleConfig,
  ExpressionPreset,
} from "../core/types"
import { resolveExpression } from "../expression/resolveExpression"
import type { ImpulseState } from "./useReaction"
import { useReaction } from "./useReaction"
import { useBlink } from "./useBlink"
import { useBreathing, type BreathMotion } from "./useBreathing"
import { useGaze } from "./useGaze"
import { useIdleMotion, type SwayMotion } from "./useIdleMotion"
import { useSpeaking } from "./useSpeaking"
import type { AvatarVisualState } from "../core/types"

export interface AvatarBehavior {
  visual: AvatarVisualState
  speech: MotionValue<number>
  blink: MotionValue<number>
  gazeX: MotionValue<number>
  gazeY: MotionValue<number>
  breath: BreathMotion
  sway: SwayMotion
  impulse: ImpulseState | null
  reaction: AvatarReaction | null
  react: (type: AvatarReaction) => void
  speaking: boolean
}

export function useAvatarBehavior({
  activity,
  emotion,
  expression,
  gaze,
  analyser,
  seed,
  reducedMotion,
  personality,
  size,
  style,
  pointer,
  pointerRef,
}: {
  activity: AvatarActivity
  emotion: AvatarEmotion
  expression?: ExpressionPreset
  gaze?: AvatarGaze
  analyser?: AnalyserNode | null
  seed?: string | number
  reducedMotion: boolean
  personality?: AvatarPersonality
  size: number
  style?: Partial<AvatarStyleConfig>
  pointer: boolean
  pointerRef: RefObject<HTMLElement | null>
}): AvatarBehavior {
  const persona = useMemo(() => personality ?? resolvePersonality(), [personality])
  const reactionApi = useReaction(persona.reactionSpeed, reducedMotion)
  const nudge = reactionApi.nudge
  const previousActivity = useRef(activity)

  useEffect(() => {
    if (previousActivity.current === activity) return
    previousActivity.current = activity
    if (activity === "success") nudge("success")
    if (activity === "error") nudge("error")
  }, [activity, nudge])

  const emotionKey = JSON.stringify(emotion)
  const styleKey = JSON.stringify(style ?? null)
  const visual = useMemo(
    () =>
      resolveExpression({
        activity,
        emotion,
        expression,
        reaction: reactionApi.reaction,
        personality: persona,
        size,
        style,
      }),
    // Emotion and style are serialized so inline objects do not restart motion.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activity, emotionKey, expression, persona, reactionApi.reaction, size, styleKey],
  )

  const blink = useBlink({
    enabled: visual.motion.blinkRate > 0 && visual.eyes.form !== "line" && visual.eyes.form !== "cross",
    rate: visual.motion.blinkRate,
    seed,
    reducedMotion,
  })

  const locked =
    activity === "sleeping" ||
    activity === "error" ||
    reactionApi.reaction === "error" ||
    reactionApi.reaction === "sleep"

  const gazeMotion = useGaze({
    explicitX: gaze?.x,
    explicitY: gaze?.y,
    pointerRef,
    pointer: pointer && !locked && gaze === undefined,
    activity,
    seed,
    reducedMotion,
    curiosity: persona.gazeCuriosity,
    reactionSpeed: persona.reactionSpeed,
    locked,
  })

  const speaking =
    activity === "speaking" &&
    (reactionApi.reaction === null || reactionApi.reaction === "acknowledge")

  const speech = useSpeaking({
    active: speaking,
    analyser,
    seed,
  })

  const breath = useBreathing(activity, visual.motion.breath, reducedMotion)
  const sway = useIdleMotion(activity, visual.motion.sway, reducedMotion)

  return {
    visual,
    speech,
    blink,
    gazeX: gazeMotion.x,
    gazeY: gazeMotion.y,
    breath,
    sway,
    impulse: reactionApi.impulse,
    reaction: reactionApi.reaction,
    react: reactionApi.react,
    speaking,
  }
}
