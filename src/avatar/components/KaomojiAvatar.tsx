import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import type { AvatarMarker, KaomojiAvatarHandle, KaomojiAvatarProps } from "../core/types"
import { useAvatarBehavior } from "../behavior/useAvatarBehavior"
import { detailTierFor, parseSize, resolveStyle } from "../expression/resolveExpression"
import { resolvePersonality } from "../motion/personalities"
import { expressionTransition } from "../motion/transitions"
import { resolveTheme } from "../themes/defaultTheme"
import { AvatarDebugPanel } from "../debug/AvatarDebugPanel"
import { AvatarSvg } from "./AvatarSvg"
import "./kaomoji-avatar.css"

export const KaomojiAvatar = forwardRef<KaomojiAvatarHandle, KaomojiAvatarProps>(function KaomojiAvatar(
  {
    activity = "idle",
    expression,
    emotion,
    gaze,
    size = 96,
    className,
    theme,
    audioAnalyser,
    seed,
    interactive = false,
    reducedMotion: reducedMotionOverride,
    debug = false,
    ariaLabel,
    personality,
    style,
  },
  ref,
) {
  const systemReducedMotion = useReducedMotion()
  const reducedMotion = reducedMotionOverride ?? systemReducedMotion ?? false
  const rootRef = useRef<HTMLDivElement>(null)
  const [measured, setMeasured] = useState<number | null>(null)
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const resolvedTheme = useMemo(() => resolveTheme(theme), [theme])
  const persona = useMemo(() => resolvePersonality(personality), [personality])
  const resolvedStyle = useMemo(() => resolveStyle(style), [style])
  const numericSize = measured ?? parseSize(size)
  const detail = detailTierFor(numericSize)
  const stableEmotion = emotion ?? EMPTY_EMOTION

  const behavior = useAvatarBehavior({
    activity,
    emotion: stableEmotion,
    expression,
    gaze,
    analyser: audioAnalyser,
    seed,
    reducedMotion,
    personality: persona,
    size: numericSize,
    style: resolvedStyle,
    pointer: interactive,
    pointerRef: rootRef,
  })

  useImperativeHandle(ref, () => ({ react: behavior.react }), [behavior.react])

  useEffect(() => {
    const element = rootRef.current
    if (!element || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width
      if (width && width > 0) setMeasured(width)
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const marker: AvatarMarker =
    activity === "sleeping" && resolvedStyle.sleepMarks && detail !== "tiny"
      ? "sleep"
      : activity === "warning" && detail !== "tiny"
        ? "warning"
        : "none"

  const scene = {
    visual: behavior.visual,
    theme: resolvedTheme,
    style: resolvedStyle,
    detail,
    reducedMotion,
    blink: behavior.blink,
    speech: behavior.speech,
    gazeX: behavior.gazeX,
    gazeY: behavior.gazeY,
    speaking: behavior.speaking,
  }

  const box = typeof size === "number" ? `${size}px` : size
  const gesture = reducedMotion
    ? { scaleX: 1, scaleY: 1 }
    : pressed
      ? { scaleX: 1.05, scaleY: 0.94 }
      : hovered
        ? { scaleX: 1.03, scaleY: 1.03 }
        : { scaleX: 1, scaleY: 1 }

  return (
    <motion.div
      ref={rootRef}
      className={["kaomoji-avatar", className].filter(Boolean).join(" ")}
      style={{ width: box, height: box, color: resolvedTheme.foreground }}
      data-activity={activity}
      data-expression={expression ?? "auto"}
      data-detail={detail}
      tabIndex={interactive ? 0 : undefined}
      animate={gesture}
      transition={expressionTransition(reducedMotion, persona.reactionSpeed)}
      onPointerEnter={interactive ? () => setHovered(true) : undefined}
      onPointerLeave={
        interactive
          ? () => {
              setHovered(false)
              setPressed(false)
            }
          : undefined
      }
      onPointerDown={interactive ? () => setPressed(true) : undefined}
      onPointerUp={interactive ? () => setPressed(false) : undefined}
    >
      <AvatarSvg
        scene={scene}
        marker={marker}
        breath={behavior.breath}
        sway={behavior.sway}
        impulse={behavior.impulse}
        reactionSpeed={persona.reactionSpeed}
        debug={debug}
        ariaLabel={ariaLabel}
      />
      {debug ? (
        <div className="kaomoji-avatar-debug">
          <AvatarDebugPanel
            visual={behavior.visual}
            activity={activity}
            expression={expression}
            speech={behavior.speech}
            gazeX={behavior.gazeX}
            gazeY={behavior.gazeY}
            blink={behavior.blink}
            reducedMotion={reducedMotion}
            detail={detail}
          />
        </div>
      ) : null}
    </motion.div>
  )
})

const EMPTY_EMOTION = {}
