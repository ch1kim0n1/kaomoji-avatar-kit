import { useEffect, useRef } from "react"
import { animate, motion, useTransform, type MotionValue } from "motion/react"
import { GEOMETRY } from "../core/constants"
import type { AvatarMarker } from "../core/types"
import type { AvatarScene } from "../core/scene"
import { mapSpeechToMouth } from "../audio/audioMath"
import { Body } from "../anatomy/Body"
import { Face } from "../anatomy/Face"
import { resolvedEyeForm } from "../anatomy/Eyes"
import type { BreathMotion } from "../behavior/useBreathing"
import type { SwayMotion } from "../behavior/useIdleMotion"
import type { ImpulseState } from "../behavior/useReaction"
import { expressionTransition } from "../motion/transitions"
import { faceTargetOf, impulseKeyframes } from "../motion/variants"

export function AvatarSvg({
  scene,
  marker,
  breath,
  sway,
  impulse,
  reactionSpeed,
  debug,
  ariaLabel,
}: {
  scene: AvatarScene
  marker: AvatarMarker
  breath: BreathMotion
  sway: SwayMotion
  impulse: ImpulseState | null
  reactionSpeed: number
  debug: boolean
  ariaLabel?: string
}) {
  const scope = useRef<SVGGElement>(null)
  const played = useRef(0)
  const form = resolvedEyeForm(scene)
  const pupilsOn = scene.visual.pupils.visible && (form === "oval" || form === "dot")

  const gazeFaceX = useTransform(scene.gazeX, (value) => (pupilsOn ? 0 : value * 1.15))
  const gazeFaceY = useTransform(scene.gazeY, (value) => (pupilsOn ? 0 : value * 0.65))
  const gazeRot = useTransform(scene.gazeX, (value) => (pupilsOn ? 0 : value * 2.2))
  const bobY = useTransform(scene.speech, (level) =>
    scene.reducedMotion || !scene.speaking ? 0 : mapSpeechToMouth(level).headY,
  )
  const offsetY = useTransform(() => gazeFaceY.get() + bobY.get())

  useEffect(() => {
    const node = scope.current
    if (!node) return
    const target = faceTargetOf(scene.visual.face)
    const playImpulse = Boolean(impulse && impulse.nonce !== played.current && !scene.reducedMotion)
    if (playImpulse && impulse) played.current = impulse.nonce
    const animation =
      playImpulse && impulse
        ? animate(node, impulseKeyframes(impulse.kind, target), {
            duration: impulse.duration,
            ease: "easeInOut",
          })
        : animate(node, target, expressionTransition(scene.reducedMotion, reactionSpeed))
    return () => animation.stop()
  }, [impulse, reactionSpeed, scene.reducedMotion, scene.visual.face])

  const breathAnimate =
    breath.amplitude > 0
      ? {
          scaleY: [1, 1 + 0.012 * breath.amplitude, 1],
          y: [0, -0.7 * breath.amplitude, 0],
        }
      : { scaleY: 1, y: 0 }

  const swayAnimate =
    sway.degrees > 0.05
      ? {
          rotate: [-sway.degrees, sway.degrees, -sway.degrees],
          y: [0, -sway.y, 0],
        }
      : { rotate: 0, y: 0 }

  return (
    <motion.svg
      viewBox={`0 0 ${GEOMETRY.viewBox} ${GEOMETRY.viewBox}`}
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    >
      <motion.g
        animate={breathAnimate}
        transition={
          breath.amplitude > 0
            ? { duration: breath.duration, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.2 }
        }
        style={{ originX: "50px", originY: "50px" }}
      >
        <Body scene={scene} marker={marker} />
        <g ref={scope}>
          <motion.g
            animate={swayAnimate}
            transition={
              sway.degrees > 0.05
                ? { duration: sway.duration, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0.2 }
            }
            style={{ originX: "50px", originY: "50px" }}
          >
            <motion.g style={{ x: gazeFaceX, y: offsetY, rotate: gazeRot }}>
              <Face scene={scene} />
            </motion.g>
          </motion.g>
        </g>
        {debug ? <Landmarks gazeX={scene.gazeX} gazeY={scene.gazeY} /> : null}
      </motion.g>
    </motion.svg>
  )
}

function Landmarks({ gazeX, gazeY }: { gazeX: MotionValue<number>; gazeY: MotionValue<number> }) {
  const points = [
    GEOMETRY.leftEye,
    GEOMETRY.rightEye,
    GEOMETRY.mouth,
    GEOMETRY.leftBrow,
    GEOMETRY.rightBrow,
    GEOMETRY.leftCheek,
    GEOMETRY.rightCheek,
    GEOMETRY.face,
  ]
  const x2 = useTransform(gazeX, (value) => GEOMETRY.face.x + value * 18)
  const y2 = useTransform(gazeY, (value) => GEOMETRY.face.y + value * 18)

  return (
    <g pointerEvents="none">
      {points.map((point) => (
        <circle key={`${point.x}-${point.y}`} cx={point.x} cy={point.y} r={0.7} fill="#c2410c" opacity={0.85} />
      ))}
      <motion.line
        x1={GEOMETRY.face.x}
        y1={GEOMETRY.face.y}
        x2={x2}
        y2={y2}
        stroke="#c2410c"
        strokeWidth={0.6}
      />
    </g>
  )
}
