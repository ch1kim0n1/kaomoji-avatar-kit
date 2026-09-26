# Kaomoji Avatar Motion Kit
## Agent-Native Build Specification for Reusable 2D SVG Personas

**Document type:** implementation specification  
**Primary audience:** coding agents, AI software engineers, frontend engineers  
**Primary stack:** React + TypeScript + SVG + Motion for React  
**Target:** web first, portable architecture for Electron, Tauri, desktop wrappers, and future React Native adaptations  
**Package goal:** a reusable avatar kit that can be dropped into future products and controlled through a small state API

---

# 0. Mission

Build a lightweight, reusable, production-quality **2D kaomoji-inspired avatar system** using SVG primitives and Motion.

The avatar must feel like a small living software persona rather than a static emoji or a full humanoid character.

The system must support:

- idle behavior
- listening
- thinking
- speaking
- working
- success
- warning
- error
- sleeping
- continuous emotional expression
- gaze
- blinking
- micro-movement
- optional audio-reactive mouth motion
- reduced-motion accessibility
- theme and brand customization
- deterministic behavior when needed
- reusable presets
- a small public API
- no dependency on image assets for the core face

The system must **not** require:

- Live2D
- canvas
- WebGL
- Three.js
- 3D models
- external animation files
- remote avatar services
- AI inference inside the avatar renderer

The avatar should render as native SVG and remain crisp at any size.

---

# 1. Product Philosophy

The avatar is a **presentation layer for agent state**.

Do not place business logic, LLM logic, TTS logic, or agent orchestration inside the avatar package.

Use this separation:

```text
Application / Agent
        |
        v
Avatar State Adapter
        |
        v
Behavior Engine
        |
        v
Expression Resolver
        |
        v
Motion Controller
        |
        v
SVG Renderer
```

The application says:

```ts
avatar.set({
  activity: "thinking",
  emotion: {
    valence: 0.2,
    arousal: 0.35,
    confidence: 0.4,
    curiosity: 0.8
  }
})
```

The avatar decides how that looks.

The application must not need to say:

```ts
leftEyeY = 18
mouthCurve = 3.6
blinkDuration = 0.12
```

Those values belong inside the avatar system.

---

# 2. Core Design Principle

A good kaomoji avatar is recognizable from a few primitives:

```text
eyes
mouth
brows
cheeks
optional pupils
optional body/container
```

Its personality comes from:

```text
timing
asymmetry
gaze
micro-movement
blink patterns
squash and stretch
reaction speed
motion restraint
```

Do not over-design the visual geometry.

The visual system should be simple enough that the same character can work at:

```text
24 px
32 px
48 px
64 px
96 px
128 px
256 px
```

At small sizes, fine detail must disappear gracefully.

---

# 3. Required Technology

Use:

```json
{
  "react": "project version",
  "typescript": "project version",
  "motion": "current stable version"
}
```

Install Motion:

```bash
npm install motion
```

Use the current React import:

```ts
import { motion, useReducedMotion } from "motion/react"
```

Motion supports SVG elements directly:

```tsx
<motion.svg>
  <motion.circle />
  <motion.path />
</motion.svg>
```

Prefer transforms and opacity for frequent animation because they are generally cheaper than geometry-heavy layout changes.

SVG attributes may still be animated when they are semantically useful.

---

# 4. Repository Goal

This project should ultimately be reusable as either:

```text
/packages/kaomoji-avatar
```

inside a monorepo, or published as:

```text
@yourorg/kaomoji-avatar
```

The first implementation may live directly in an application, but its internals must already follow package boundaries.

---

# 5. Recommended File Structure

Create:

```text
src/
  avatar/
    index.ts

    core/
      types.ts
      defaults.ts
      constants.ts
      clamp.ts
      random.ts

    components/
      KaomojiAvatar.tsx
      AvatarSvg.tsx

    anatomy/
      Face.tsx
      Eyes.tsx
      Eye.tsx
      Brows.tsx
      Mouth.tsx
      Cheeks.tsx
      Pupils.tsx
      Body.tsx

    behavior/
      useAvatarBehavior.ts
      useBlink.ts
      useIdleMotion.ts
      useGaze.ts
      useSpeaking.ts
      useBreathing.ts
      useReaction.ts

    expression/
      resolveExpression.ts
      resolveActivity.ts
      resolveEmotion.ts
      blendExpression.ts
      presets.ts

    audio/
      createAudioAnalyser.ts
      useAudioLevel.ts
      audioMath.ts

    motion/
      motionTokens.ts
      transitions.ts
      variants.ts

    themes/
      defaultTheme.ts
      themes.ts

    debug/
      AvatarDebugPanel.tsx
      AvatarPlayground.tsx

    tests/
      expression.test.ts
      behavior.test.ts
      audioMath.test.ts
```

If the project does not use this exact structure, preserve the same conceptual boundaries.

---

# 6. Public API

The public component should be simple.

Minimum API:

```tsx
<KaomojiAvatar
  activity="thinking"
  emotion={{
    valence: 0.2,
    arousal: 0.45,
    confidence: 0.4,
    curiosity: 0.8
  }}
  size={96}
/>
```

Optional audio:

```tsx
<KaomojiAvatar
  activity="speaking"
  audioAnalyser={analyserNode}
/>
```

Optional gaze:

```tsx
<KaomojiAvatar
  gaze={{ x: 0.4, y: -0.2 }}
/>
```

Optional explicit expression:

```tsx
<KaomojiAvatar expression="excited" />
```

Explicit expression is an override intended primarily for product events.

---

# 7. Required Type Definitions

Implement a strong type contract.

```ts
export type AvatarActivity =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking"
  | "working"
  | "success"
  | "warning"
  | "error"
  | "sleeping"

export type ExpressionPreset =
  | "neutral"
  | "happy"
  | "excited"
  | "curious"
  | "confused"
  | "skeptical"
  | "focused"
  | "surprised"
  | "sad"
  | "annoyed"
  | "sleepy"
  | "error"

export interface AvatarEmotion {
  valence?: number
  arousal?: number
  confidence?: number
  curiosity?: number
  surprise?: number
  frustration?: number
}

export interface AvatarGaze {
  x: number
  y: number
}

export interface AvatarTheme {
  foreground: string
  background?: string
  accent?: string
  blush?: string
  strokeWidth?: number
  radius?: number
}

export interface KaomojiAvatarProps {
  activity?: AvatarActivity
  expression?: ExpressionPreset
  emotion?: AvatarEmotion
  gaze?: AvatarGaze
  size?: number | string
  className?: string
  theme?: Partial<AvatarTheme>
  audioAnalyser?: AnalyserNode | null
  seed?: number | string
  interactive?: boolean
  reducedMotion?: boolean
  debug?: boolean
  ariaLabel?: string
}
```

---

# 8. Normalized Value Rules

All continuous emotional dimensions must use:

```text
0.0 to 1.0
```

except:

```text
valence: -1.0 to 1.0
gaze.x: -1.0 to 1.0
gaze.y: -1.0 to 1.0
```

Clamp all values at package boundaries.

Never assume application inputs are valid.

Example:

```ts
export const clamp01 = (n: number) =>
  Math.max(0, Math.min(1, n))

export const clampSigned = (n: number) =>
  Math.max(-1, Math.min(1, n))
```

---

# 9. Coordinate System

Use a fixed logical SVG coordinate system.

Recommended:

```tsx
viewBox="0 0 100 100"
```

The avatar should scale via the SVG element, never by recalculating geometry for each pixel size.

Suggested face landmarks:

```text
face center         50, 50

left eye center     35, 42
right eye center    65, 42

mouth center        50, 64

left brow center    35, 31
right brow center   65, 31

left cheek          25, 58
right cheek         75, 58
```

These are defaults, not immutable rules.

Store geometry in one configuration object.

Do not scatter magic coordinates throughout components.

---

# 10. Anatomy Model

Each visible facial component must have its own semantic component.

Recommended shape:

```tsx
<AvatarSvg>
  <Body />
  <Face>
    <Brows />
    <Eyes />
    <Pupils />
    <Cheeks />
    <Mouth />
  </Face>
</AvatarSvg>
```

The components should accept resolved visual parameters, not raw application emotion.

Bad:

```tsx
<Eye frustration={emotion.frustration} />
```

Good:

```tsx
<Eye
  openness={visual.eyeOpenness}
  scaleX={visual.eyeScaleX}
  rotation={visual.leftEyeRotation}
/>
```

The emotional mapping belongs inside the resolver.

---

# 11. Resolved Visual State

Create one internal representation that drives the renderer.

```ts
export interface AvatarVisualState {
  face: {
    x: number
    y: number
    scaleX: number
    scaleY: number
    rotate: number
  }

  eyes: {
    openness: number
    width: number
    spacing: number
    leftRotation: number
    rightRotation: number
  }

  pupils: {
    visible: boolean
    x: number
    y: number
    scale: number
  }

  brows: {
    visible: boolean
    leftY: number
    rightY: number
    leftRotation: number
    rightRotation: number
  }

  mouth: {
    type:
      | "line"
      | "smile"
      | "frown"
      | "open"
      | "o"
      | "w"
      | "cat"
      | "flat"
    width: number
    openness: number
    curvature: number
    rotation: number
  }

  cheeks: {
    opacity: number
    scale: number
  }

  motion: {
    bounce: number
    sway: number
    jitter: number
    breath: number
    blinkRate: number
  }
}
```

Only the final renderer should consume this object.

---

# 12. Expression Resolution Pipeline

Expression resolution order must be:

```text
default visual state
    +
activity contribution
    +
continuous emotional contribution
    +
event reaction
    +
explicit expression override
    +
audio speaking contribution
    +
blink
    +
gaze
    +
micro-motion
```

This allows multiple systems to coexist.

Example:

```text
activity = speaking
emotion = happy
audio = loud syllable
blink = false
```

should result in:

```text
happy eyes
happy cheeks
audio-reactive mouth
speaking head motion
```

not merely a hard-coded `speaking` face.

---

# 13. Activity Behavior

## idle

Visual behavior:

- neutral or current emotional expression
- subtle breathing
- occasional blink
- occasional micro gaze shift
- very low vertical drift
- no repetitive obvious loop

Recommended character:

```text
(•‿•)
```

Behavior target:

```text
calm
alive
not distracting
```

---

## listening

Visual behavior:

- eye openness slightly increased
- gaze biased toward user/input source
- body motion reduced
- occasional tiny nod
- mouth mostly closed
- blink rate slightly lower than idle

Concept:

```text
(•ᴗ•)
```

Listening should look attentive, not excited.

---

## thinking

Visual behavior:

- gaze slowly moves upper-left or upper-right
- slight head tilt
- asymmetrical eyes allowed
- mouth narrow or offset
- slow micro sway
- blink rate reduced
- optional three-dot UI may exist outside avatar, not inside core SVG

Concept:

```text
( •_•)
```

Do not use constant rapid bouncing while thinking.

---

## speaking

Visual behavior:

- mouth controlled primarily by audio level if available
- subtle head and face movement
- expression remains emotional
- blink still active
- gaze remains stable
- low-amplitude rhythmic vertical movement

Concept:

```text
(•◡•)
```

Never animate the entire character aggressively for every phoneme.

---

## working

Visual behavior:

- focused brows
- mostly stable gaze
- smaller eyes
- subtle periodic movement
- optional small determined bounce at task start

Concept:

```text
( •̀_•́ )
```

---

## success

This is a transient reaction.

Recommended duration:

```text
600 ms to 1200 ms
```

Sequence:

```text
anticipation squash
quick upward pop
smile / bright eyes
settle
```

Concept:

```text
(ᵔ◡ᵔ)
```

After completion, return to the underlying activity state.

---

## warning

Use restrained concern.

Concept:

```text
(・_・;)
```

Avoid flashing unless required for a separate accessibility-safe alert system.

---

## error

Transient reaction followed by stable error expression.

Concept:

```text
(×_×)
```

Potential motion:

```text
small horizontal shake
```

Keep shake under roughly:

```text
3 logical SVG units
```

Avoid violent continuous jitter.

---

## sleeping

Visual behavior:

- eyes closed
- slow breathing
- near-zero gaze logic
- very slow vertical drift
- mouth neutral

Concept:

```text
(-_-) zZ
```

If adding `zZ`, render it as optional decorative UI outside the semantic face core.

---

# 14. Emotion Model

The avatar must support both named presets and continuous dimensions.

## Valence

Range:

```text
-1 = negative
 0 = neutral
+1 = positive
```

Map mainly to:

```text
mouth curvature
cheek visibility
eye softness
```

Recommended mapping:

```ts
mouthCurvature = valence * MAX_MOUTH_CURVE
```

Do not map positive valence only to larger motion.

Happy can be calm.

---

## Arousal

Range:

```text
0 to 1
```

Map to:

```text
eye openness
motion speed
blink sharpness
body bounce
reaction speed
```

High arousal increases energy.

It should not automatically mean positive emotion.

---

## Confidence

Range:

```text
0 to 1
```

Map to:

```text
symmetry
gaze stability
brow stability
head orientation
```

Low confidence may create:

```text
slight asymmetry
smaller mouth
more gaze uncertainty
```

Do not turn low confidence into a caricature.

---

## Curiosity

Range:

```text
0 to 1
```

Map to:

```text
head tilt
one brow lift
gaze exploration
slight eye widening
```

Curiosity should be one of the avatar's strongest personality tools.

---

## Surprise

Map to:

```text
eye openness
O-shaped mouth
temporary motion freeze then reaction
```

High surprise should be transient whenever possible.

---

## Frustration

Map to:

```text
brow angle
mouth flattening
slight eye narrowing
small controlled motion tension
```

Do not use constant shaking.

---

# 15. Preset Expressions

Implement at minimum:

```ts
export const expressionPresets = {
  neutral: {},
  happy: {},
  excited: {},
  curious: {},
  confused: {},
  skeptical: {},
  focused: {},
  surprised: {},
  sad: {},
  annoyed: {},
  sleepy: {},
  error: {},
} satisfies Record<ExpressionPreset, Partial<AvatarVisualState>>
```

Presets should contain visual intent, not animation implementation.

Example conceptual definitions:

```text
neutral
(•_•)

happy
(ᵔᴗᵔ)

excited
(✧ᴗ✧)

curious
(•ᴗ•?)

confused
(・_・?)

skeptical
(¬_¬)

focused
( •̀_•́ )

surprised
(⊙_⊙)

sad
(｡•́︿•̀｡)

annoyed
(¬︿¬)

sleepy
(-_-)

error
(×_×)
```

The exact Unicode glyphs are references only.

Do not render the face as text unless a future alternate renderer intentionally does so.

---

# 16. Eye System

Eyes carry most of the avatar's personality.

Support at least three internal eye rendering modes:

```text
dot
oval
arc
```

Recommended default:

```text
oval
```

Each eye should support:

```ts
interface EyeVisual {
  cx: number
  cy: number
  rx: number
  ry: number
  rotation: number
  opacity: number
}
```

Eye openness can be modeled primarily through `ry` or `scaleY`.

Prefer:

```tsx
<motion.g style={{ scaleY }} />
```

or another stable transform strategy if it avoids geometry churn.

---

# 17. Blink System

Blinking must feel stochastic, not like a CSS loading animation.

Do not use:

```text
blink exactly every 3 seconds
```

Use randomized intervals.

Recommended idle interval:

```text
2.2 to 6.5 seconds
```

Occasionally support a double blink.

Example:

```text
normal blink probability: high
double blink probability: low
```

Blink phases:

```text
open
close quickly
open quickly
```

Typical total blink:

```text
100 to 180 ms
```

Double blink gap:

```text
80 to 180 ms
```

Activity can modify blink timing:

```text
listening -> slightly fewer blinks
thinking  -> fewer blinks
sleeping  -> disabled
excited   -> slightly faster blink response
```

Use a seeded random generator when a seed is provided.

This allows deterministic tests and repeatable demos.

---

# 18. Gaze System

Support normalized gaze input:

```ts
{
  x: -1..1,
  y: -1..1
}
```

When pupils are visible:

```text
x controls horizontal pupil offset
y controls vertical pupil offset
```

When pupils are not visible, simulate gaze subtly with:

```text
eye-group translation
face rotation
head tilt
```

Clamp gaze aggressively.

The avatar should never look anatomically broken.

Recommended maximum pupil displacement:

```text
2 to 4 SVG units
```

Recommended autonomous idle gaze shifts:

```text
small
infrequent
slow
```

Do not produce constant random eye movement.

---

# 19. Pointer-Aware Gaze

If `interactive=true`, optionally allow the avatar to track pointer position.

Algorithm:

```text
1. get avatar bounding rect
2. compute avatar center
3. compute pointer delta
4. normalize delta
5. clamp to -1..1
6. smooth with spring
7. feed into gaze system
```

Do not track pointer while:

```text
sleeping
error reaction is active
explicit gaze lock is supplied
```

Pointer tracking must be subtle.

It should feel aware, not creepy.

---

# 20. Brow System

Brows are optional at small sizes.

Rules:

```text
size < 40px -> may hide brows
size >= 40px -> enable
```

Brows should be simple paths or rounded lines.

Use them for:

```text
focus
curiosity
skepticism
sadness
frustration
surprise
```

Do not over-animate brows during normal idle behavior.

---

# 21. Mouth System

Use a small set of reusable mouth shapes.

Required:

```text
flat
smile
frown
open
o
w
cat
```

Prefer SVG paths.

Example concept:

```tsx
<motion.path
  d={resolvedPath}
  fill="none"
  stroke="currentColor"
  strokeLinecap="round"
/>
```

Path morphing is optional.

A simpler production-safe implementation may switch between compatible path shapes while animating scale and openness.

The mouth should support:

```text
width
height/openness
curve
rotation
```

---

# 22. Audio-Reactive Speaking

The avatar must work with and without audio input.

Without audio:

```text
speaking activity
-> procedural mouth movement
```

With audio:

```text
AnalyserNode
-> volume envelope
-> normalized speech level
-> smoothed motion value
-> mouth openness
```

Do not tie raw frequency bins directly to facial geometry.

---

# 23. Web Audio Integration

The package may accept an existing:

```ts
AnalyserNode
```

This is preferred because the application controls the audio graph.

Optionally provide a helper:

```ts
createAudioAnalyser(audioContext, sourceNode)
```

Recommended analyser values:

```ts
analyser.fftSize = 256
analyser.smoothingTimeConstant = 0.65
```

These are starting points and should be tunable.

Use either:

```ts
getByteTimeDomainData()
```

for amplitude-style speech envelope analysis, or:

```ts
getByteFrequencyData()
```

for frequency-domain energy.

For simple mouth motion, amplitude is usually sufficient.

---

# 24. Audio Level Algorithm

Example approach:

```text
read samples
center around zero
calculate RMS
normalize
apply noise gate
compress
smooth
```

Pseudocode:

```ts
function getRms(samples: Uint8Array) {
  let sum = 0

  for (const sample of samples) {
    const centered = (sample - 128) / 128
    sum += centered * centered
  }

  return Math.sqrt(sum / samples.length)
}
```

Then:

```ts
const gated = rms < NOISE_GATE ? 0 : rms
const normalized = clamp01(gated * GAIN)
```

Do not use the raw RMS value directly.

Use attack and release smoothing.

Example:

```text
attack:  fast
release: slower
```

Concept:

```ts
if next > current:
  current += (next - current) * attack
else:
  current += (next - current) * release
```

Recommended starting values:

```text
attack  = 0.45
release = 0.16
```

Tune visually.

---

# 25. Speech Mouth Motion

Map smoothed audio level to:

```text
mouth openness
slight mouth width
very small head/body response
```

Example:

```ts
mouthOpen = lerp(0.1, 1.0, speechLevel)
mouthWidth = lerp(0.9, 1.08, speechLevel)
headY = lerp(0, -0.4, speechLevel)
```

Do not use:

```text
speechLevel -> giant scale bounce
```

The mouth should perform most of the speaking animation.

---

# 26. Procedural Speaking Without Audio

When no analyser exists:

Generate subtle pseudo-speech.

Example rhythm:

```text
open
half
closed
small
open
```

with randomized durations approximately:

```text
70 to 220 ms
```

Avoid perfectly alternating open/closed mouth animation.

The animation should stop immediately when activity is no longer `speaking`.

---

# 27. Idle Motion

Idle motion must be almost invisible.

Recommended components:

```text
breathing
very small y drift
tiny rotation
rare gaze movement
blink
```

Suggested bounds:

```text
vertical movement: 0.5 to 1.5 SVG units
rotation:          0.5 to 1.5 degrees
scale change:      <= 1.5%
```

Different projects can use stronger motion, but the default should be restrained.

---

# 28. Breathing

Breathing should modify the whole avatar container, not facial anatomy.

Example:

```text
scaleY 1.000 -> 1.012 -> 1.000
y      0     -> -0.4  -> 0
```

Duration:

```text
2.8 to 5 seconds
```

Use soft easing.

Do not synchronize blink timing with breathing.

---

# 29. Squash and Stretch

Use squash/stretch for event reactions, not continuous idle animation.

Good uses:

```text
success
wake-up
task start
button interaction
surprise
error impact
```

Rule:

When stretching vertically, compress horizontally slightly.

Example:

```text
scaleY = 1.06
scaleX = 0.96
```

The visual area should feel roughly conserved.

---

# 30. Motion Tokens

Do not scatter transition values through the codebase.

Create motion tokens.

Example:

```ts
export const motionTokens = {
  duration: {
    instant: 0.08,
    fast: 0.14,
    normal: 0.24,
    slow: 0.45,
    idle: 3.2,
  },

  spring: {
    snappy: {
      type: "spring",
      stiffness: 520,
      damping: 28,
      mass: 0.55,
    },
    soft: {
      type: "spring",
      stiffness: 220,
      damping: 24,
      mass: 0.8,
    },
  },
} as const
```

Tune as needed.

The important requirement is centralized control.

---

# 31. Motion Grammar

Create a consistent character personality.

Default motion grammar:

```text
micro motion: soft
reactions: quick but small
expression changes: smooth
blinks: fast
gaze: smooth
speech: responsive
errors: sharp then settle
success: springy but restrained
```

Every future product can change motion grammar through a persona configuration.

Example:

```ts
interface AvatarPersonality {
  motionEnergy: number
  reactionSpeed: number
  gazeCuriosity: number
  blinkFrequency: number
  asymmetry: number
  bounce: number
}
```

Normalized:

```text
0 to 1
```

---

# 32. Persona Presets

Provide optional behavior presets.

Example:

```text
professional
playful
calm
curious
robotic
```

These must alter motion, not just color.

## professional

```text
low bounce
low jitter
stable gaze
moderate blink
small expression range
```

## playful

```text
higher squash/stretch
more gaze exploration
faster reactions
larger smile range
```

## calm

```text
slow breathing
low arousal movement
soft transitions
```

## curious

```text
more head tilt
more asymmetric brows
more gaze movement
```

## robotic

```text
precise transitions
minimal idle drift
less random behavior
```

---

# 33. Theme System

Visual styling should be independent from behavior.

Default theme:

```ts
export const defaultTheme: AvatarTheme = {
  foreground: "currentColor",
  background: "transparent",
  accent: "currentColor",
  blush: "currentColor",
  strokeWidth: 4,
  radius: 24,
}
```

Allow projects to override:

```tsx
<KaomojiAvatar
  theme={{
    foreground: "#111111",
    accent: "#7C3AED"
  }}
/>
```

Prefer `currentColor` when practical so the avatar naturally inherits application color.

---

# 34. Avatar Container Shapes

Support optional outer shells:

```text
none
circle
rounded-square
blob
```

The face must work without a container.

Do not make the body/container responsible for core facial positioning.

---

# 35. Responsive Detail

Implement detail tiers.

## Tiny

```text
< 32px
```

Render:

```text
eyes
mouth
```

Disable:

```text
brows
cheeks
pupils if visually noisy
complex reactions
```

## Small

```text
32 to 63px
```

Render:

```text
eyes
mouth
optional brows
simple cheeks
```

## Standard

```text
64 to 127px
```

Full default behavior.

## Large

```text
>= 128px
```

Allow additional polish:

```text
pupil detail
subtle highlights
richer brow motion
```

Behavior must remain recognizable across all tiers.

---

# 36. Reduced Motion

Respect operating system motion preference.

Use:

```ts
const shouldReduceMotion = useReducedMotion()
```

Also allow explicit override:

```tsx
<KaomojiAvatar reducedMotion />
```

In reduced motion mode:

Disable or heavily reduce:

```text
breathing
idle floating
bounce
shake
continuous sway
pointer-follow head movement
```

Keep functional state communication through static expression changes.

Blinking may remain if subtle, but should be optional.

Do not remove the avatar's ability to represent:

```text
thinking
speaking
error
success
```

Use visual state instead of motion.

---

# 37. Accessibility

The avatar should usually be decorative unless it communicates state unavailable elsewhere.

Default:

```tsx
aria-hidden="true"
```

If the avatar is the only visible agent-status indicator, allow:

```tsx
role="img"
aria-label="Assistant is thinking"
```

Do not create rapidly flashing animation.

Avoid repetitive high-amplitude motion.

Do not rely only on color to distinguish important states.

---

# 38. Deterministic Randomness

Autonomous behavior uses randomness.

Tests must not.

Implement seeded randomness.

Input:

```ts
seed?: string | number
```

Uses:

```text
blink intervals
idle gaze choice
micro-motion offset
procedural speaking rhythm
```

Given the same seed and state sequence, behavior should be reproducible enough for tests and demo recording.

---

# 39. Event Reactions

Support a small reaction API.

Recommended internal events:

```ts
type AvatarReaction =
  | "acknowledge"
  | "success"
  | "error"
  | "surprise"
  | "wake"
  | "sleep"
```

Optionally expose an imperative handle:

```ts
export interface KaomojiAvatarHandle {
  react(type: AvatarReaction): void
}
```

Usage:

```ts
avatarRef.current?.react("success")
```

Use reactions for transient events.

Do not force applications to switch `activity` to success for 800 ms manually.

---

# 40. State Priority

Use explicit priority.

Recommended:

```text
1. reduced-motion constraints
2. critical reaction
3. explicit expression override
4. activity
5. continuous emotion
6. audio
7. gaze
8. idle behavior
```

Example:

If activity is `sleeping`, audio input must not randomly open the mouth unless the application explicitly changes activity.

If an `error` reaction fires during speaking:

```text
error reaction takes temporary priority
then returns to speaking
```

---

# 41. Behavior Hook

Centralize runtime behavior.

Suggested signature:

```ts
function useAvatarBehavior(input: {
  activity: AvatarActivity
  emotion: AvatarEmotion
  expression?: ExpressionPreset
  gaze?: AvatarGaze
  analyser?: AnalyserNode | null
  seed?: string | number
  reducedMotion: boolean
}): AvatarVisualState
```

This hook orchestrates lower-level hooks.

Do not place complex behavior directly inside JSX.

---

# 42. Pure Expression Resolver

`resolveExpression()` must remain pure.

Example:

```ts
function resolveExpression(input: ExpressionInput): AvatarVisualState
```

No:

```text
setTimeout
requestAnimationFrame
DOM reads
AudioContext access
random global state
```

Pure expression mapping makes the system testable.

Runtime motion hooks layer dynamic behavior on top.

---

# 43. Blending

Avoid abrupt state jumps.

Implement interpolation or let Motion interpolate visual values.

For scalar values:

```ts
lerp(a, b, t)
```

For layered emotion:

```text
base
+ activity
+ emotional adjustment
```

Do not simply replace the entire visual state for every emotional dimension.

---

# 44. Avoid Overfitting the Kaomoji Look

The system should be inspired by kaomoji, not constrained by Unicode.

Good:

```text
simple geometric eyes
expressive mouth
asymmetry
minimal line art
```

Bad:

```text
trying to exactly recreate every Unicode character
```

The value comes from animation.

---

# 45. Interaction States

If used as a clickable UI element, optionally support:

```text
hover
press
focus
```

Hover:

```text
tiny gaze toward pointer
slight scale up
```

Press:

```text
small squash
```

Focus:

```text
use normal application focus ring outside SVG
```

Do not replace accessible focus UI with avatar motion.

---

# 46. Performance Requirements

The avatar should be cheap enough to render continuously in normal product UI.

Requirements:

- avoid React state updates on every animation frame when MotionValue or direct animation primitives can handle it
- avoid rebuilding large SVG path strings every frame
- avoid unnecessary filters
- avoid blur-heavy shadows
- prefer transform and opacity animation for high-frequency motion
- stop audio loops when unmounted
- stop `requestAnimationFrame` when unused
- clean up timers
- clean up pointer listeners
- clean up AudioNode references owned by helpers

Target:

```text
smooth on a typical modern laptop
smooth on modern mobile browsers
multiple avatars should not melt the UI
```

---

# 47. Rendering Rule

The renderer must be dumb.

Example:

```tsx
function AvatarSvg({ visual, theme }: Props) {
  return (
    <motion.svg viewBox="0 0 100 100">
      <Face visual={visual} theme={theme} />
    </motion.svg>
  )
}
```

The renderer must not calculate emotional meaning.

---

# 48. Initial Implementation Strategy

Build in this exact order.

## Phase 1: static anatomy

Implement:

```text
SVG container
eyes
mouth
brows
cheeks
```

Acceptance:

```text
neutral avatar renders correctly at 32, 64, 96, 256 px
```

---

## Phase 2: expression presets

Implement:

```text
neutral
happy
curious
focused
surprised
sad
annoyed
sleepy
error
```

Acceptance:

Each face is recognizable without animation.

---

## Phase 3: Motion transitions

Add:

```text
expression interpolation
head tilt
eye openness
mouth scale
brow movement
```

Acceptance:

No visible snapping during normal expression changes.

---

## Phase 4: autonomous behavior

Add:

```text
blink
breathing
idle gaze
micro sway
```

Acceptance:

Avatar feels alive for 60 seconds without becoming distracting.

---

## Phase 5: activity system

Add:

```text
idle
listening
thinking
speaking
working
sleeping
```

Acceptance:

A user can distinguish activity from animation alone at normal avatar size.

---

## Phase 6: reactions

Add:

```text
success
error
acknowledge
surprise
```

Acceptance:

Reactions execute once and return cleanly to prior state.

---

## Phase 7: audio reactivity

Add:

```text
AnalyserNode input
RMS envelope
noise gate
attack/release smoothing
mouth openness
```

Acceptance:

Speech appears synchronized without frantic motion.

---

## Phase 8: continuous emotions

Add:

```text
valence
arousal
confidence
curiosity
surprise
frustration
```

Acceptance:

Changing each dimension independently produces a meaningful but restrained visual change.

---

## Phase 9: accessibility

Add:

```text
reduced motion
aria handling
small-size detail tiers
```

---

## Phase 10: playground

Build an internal playground for tuning.

---

# 49. Required Playground

Create:

```text
/avatar-playground
```

or Storybook equivalent.

Controls:

```text
activity selector
expression selector

valence slider
arousal slider
confidence slider
curiosity slider
surprise slider
frustration slider

gaze X
gaze Y

size
theme
persona preset

audio toggle
reduced motion toggle
debug toggle
```

Buttons:

```text
React: acknowledge
React: success
React: error
React: surprise
```

The playground is required.

Do not tune the system only by editing constants and refreshing manually.

---

# 50. Debug Mode

`debug=true` may render:

```text
landmark points
eye centers
mouth center
bounding boxes
gaze vector
current audio level
current resolved state
```

Debug visuals must never appear in production unless explicitly enabled.

---

# 51. Testing Strategy

## Unit Tests

Test:

```text
clamping
expression mapping
activity mapping
emotion mapping
seeded random behavior
audio math
state priority
```

Examples:

```text
valence > 1 clamps to 1
valence < -1 clamps to -1
sleeping forces closed eyes
explicit error reaction overrides idle
same seed produces same blink schedule sequence
```

---

# 52. Visual Tests

Take screenshots for at least:

```text
neutral
happy
curious
focused
surprised
sad
annoyed
sleepy
error
```

at:

```text
32 px
64 px
96 px
256 px
```

Check for:

```text
clipping
misaligned strokes
uneven scaling
brow collisions
mouth collisions
tiny-size visual noise
```

---

# 53. Motion QA

Observe for at least 60 seconds in:

```text
idle
thinking
listening
speaking
```

Reject implementation if:

```text
blink feels periodic
gaze looks frantic
idle movement is distracting
face repeatedly returns to exact same loop timing
speech bounce is excessive
state transitions visibly snap
```

---

# 54. Audio QA

Test:

```text
silence
quiet speech
normal speech
loud speech
music
background noise
```

Expected:

```text
silence -> mouth closed
quiet speech -> small movement
normal speech -> clear mouth response
loud speech -> capped motion
background noise -> mostly gated
```

Do not attempt phoneme-perfect lip sync in v1.

This is a stylized kaomoji persona.

Amplitude-based speaking is enough.

---

# 55. Example High-Level Component

Target shape:

```tsx
export function KaomojiAvatar({
  activity = "idle",
  expression,
  emotion = {},
  gaze,
  size = 96,
  theme,
  audioAnalyser,
  seed,
  interactive = false,
  reducedMotion: reducedMotionOverride,
  debug = false,
  ariaLabel,
}: KaomojiAvatarProps) {
  const systemReducedMotion = useReducedMotion()

  const reducedMotion =
    reducedMotionOverride ?? systemReducedMotion ?? false

  const visual = useAvatarBehavior({
    activity,
    expression,
    emotion,
    gaze,
    analyser: audioAnalyser,
    seed,
    reducedMotion,
  })

  return (
    <AvatarSvg
      visual={visual}
      size={size}
      theme={theme}
      interactive={interactive}
      debug={debug}
      ariaLabel={ariaLabel}
    />
  )
}
```

This is conceptual.

Adapt to actual implementation requirements.

---

# 56. Example Application Adapter

Applications may have richer internal state.

Example:

```ts
type AgentRuntimeState =
  | "ready"
  | "recording"
  | "reasoning"
  | "generating"
  | "executing_tool"
  | "done"
  | "failed"
```

Do not add these directly to the avatar package.

Map them:

```ts
function agentStateToAvatar(
  state: AgentRuntimeState
): AvatarActivity {
  switch (state) {
    case "ready":
      return "idle"

    case "recording":
      return "listening"

    case "reasoning":
      return "thinking"

    case "generating":
      return "speaking"

    case "executing_tool":
      return "working"

    case "done":
      return "idle"

    case "failed":
      return "error"
  }
}
```

This keeps the package general.

---

# 57. Agent Emotion Adapter

If an AI system produces emotional metadata, normalize it before passing to the renderer.

Example agent output:

```json
{
  "valence": 0.34,
  "arousal": 0.58,
  "confidence": 0.76,
  "curiosity": 0.21
}
```

Then:

```tsx
<KaomojiAvatar emotion={agentEmotion} />
```

Do not let the LLM generate SVG coordinates.

Do not let the LLM generate Motion parameters.

The LLM describes semantic state.

The deterministic renderer converts semantic state into visuals.

---

# 58. Safe Structured Agent Output

If an LLM directly controls avatar semantics, use a schema.

Example:

```ts
const AvatarSignalSchema = z.object({
  valence: z.number().min(-1).max(1),
  arousal: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1),
  curiosity: z.number().min(0).max(1),
})
```

The avatar should still clamp values internally.

Never trust upstream state blindly.

---

# 59. Brand Customization Strategy

Future products should usually customize only:

```text
theme
eye style
mouth style
container shape
motion personality
idle personality
```

Avoid forking core behavior unless necessary.

Suggested configuration:

```ts
export interface AvatarStyleConfig {
  eyeStyle: "dot" | "oval" | "arc"
  mouthStyle: "soft" | "geometric" | "cute"
  container: "none" | "circle" | "rounded-square" | "blob"
  personality:
    | "professional"
    | "playful"
    | "calm"
    | "curious"
    | "robotic"
}
```

---

# 60. Example Product Variants

## Minimal professional

```text
black line art
no cheeks
oval eyes
tiny mouth
low bounce
stable gaze
```

## Cute assistant

```text
larger eyes
visible cheeks
small body blob
more head tilt
slightly higher bounce
```

## Terminal companion

```text
monochrome
pixel-like eye geometry
robotic motion preset
minimal curves
```

## Emotional companion

```text
larger expression range
more gaze
more asymmetry
visible cheeks
continuous emotion enabled
```

---

# 61. Anti-Patterns

Do not build:

```text
30 separate SVG files for 30 expressions
```

Do not build:

```text
PNG frame animation
```

Do not animate:

```text
everything all the time
```

Do not make every state:

```text
bounce
shake
spin
pulse
```

Do not expose low-level SVG controls to application code.

Do not tie the component directly to:

```text
OpenAI
Anthropic
ElevenLabs
WebSocket provider
specific TTS vendor
specific agent SDK
```

Do not make LLM output directly control geometry.

Do not use random behavior without cleanup and deterministic testing support.

Do not ignore reduced-motion preferences.

---

# 62. Character Quality Checklist

The avatar is good when:

- it is recognizable in silhouette or minimal facial geometry
- neutral still looks intentional
- the face reads at 32 px
- idle feels alive but is easy to ignore
- listening looks attentive
- thinking is distinct from idle
- speaking does not look like a bouncing notification icon
- success feels rewarding
- errors do not become annoying
- expressions transition smoothly
- emotions blend instead of replacing the face
- gaze feels intentional
- motion personality feels consistent
- the avatar still works with animation disabled

---

# 63. Definition of Done

The project is complete when all items below pass.

## Rendering

- [ ] native SVG
- [ ] scales cleanly from 32 to 256 px
- [ ] no external image assets required
- [ ] works on transparent background
- [ ] themeable through props

## Expression

- [ ] neutral
- [ ] happy
- [ ] excited
- [ ] curious
- [ ] confused
- [ ] skeptical
- [ ] focused
- [ ] surprised
- [ ] sad
- [ ] annoyed
- [ ] sleepy
- [ ] error

## Activity

- [ ] idle
- [ ] listening
- [ ] thinking
- [ ] speaking
- [ ] working
- [ ] success
- [ ] warning
- [ ] error
- [ ] sleeping

## Motion

- [ ] stochastic blink
- [ ] idle breathing
- [ ] subtle gaze
- [ ] state transitions
- [ ] squash/stretch reactions
- [ ] reduced-motion mode

## Emotion

- [ ] valence
- [ ] arousal
- [ ] confidence
- [ ] curiosity
- [ ] surprise
- [ ] frustration

## Speech

- [ ] procedural speaking fallback
- [ ] optional AnalyserNode support
- [ ] audio smoothing
- [ ] silence gate
- [ ] capped mouth amplitude

## Engineering

- [ ] strict TypeScript
- [ ] pure expression resolver
- [ ] isolated behavior hooks
- [ ] seeded randomness
- [ ] timer cleanup
- [ ] animation cleanup
- [ ] audio cleanup
- [ ] unit tests
- [ ] visual playground
- [ ] no vendor coupling

---

# 64. Coding Agent Execution Rules

When an AI coding agent is given this file, it must follow these rules.

## Rule 1

Inspect the existing project before changing files.

Determine:

```text
framework
React version
TypeScript configuration
package manager
existing design system
existing test framework
existing animation libraries
```

Do not introduce duplicate infrastructure unnecessarily.

---

## Rule 2

If Motion is already present, use the installed compatible version.

If not, install:

```bash
npm install motion
```

or equivalent package manager command.

Use:

```ts
import { motion } from "motion/react"
```

for current Motion React APIs.

---

## Rule 3

Implement the smallest coherent vertical slice first:

```text
KaomojiAvatar
-> neutral SVG
-> happy expression
-> thinking state
-> blink
```

Run it.

Verify it visually.

Then continue.

Do not generate twenty files before confirming the base renderer works.

---

## Rule 4

Keep geometry centralized.

If the implementation has repeated raw values like:

```text
35
42
65
64
```

across multiple anatomy components, refactor them into geometry tokens.

---

## Rule 5

Keep behavior and rendering separated.

A component named:

```text
Eyes.tsx
```

must not own random timers.

A hook named:

```text
useBlink.ts
```

must not render SVG.

---

## Rule 6

Prefer readable systems over clever abstractions.

The final kit should be easy for another AI coding agent to extend.

---

## Rule 7

After every phase:

```text
typecheck
lint
test
render playground
inspect browser console
```

Do not wait until the end.

---

## Rule 8

Do not claim completion unless Definition of Done has been checked.

If an item is intentionally omitted, document it explicitly.

---

# 65. Suggested Agent Task Prompt

Use the following text with a coding agent after attaching or placing this file in a repository:

```text
Implement the reusable Kaomoji Avatar Motion Kit described in
KAOMOJI_AVATAR_KIT.md.

Treat the markdown file as the source of truth.

First inspect the repository and adapt the architecture to the existing
framework, package manager, TypeScript configuration, component conventions,
test framework, and design system.

Build incrementally. Start with a neutral SVG avatar and basic expression
resolution. Verify rendering before implementing autonomous behavior.

Keep semantic avatar state separate from SVG geometry. Keep expression
resolution pure. Keep runtime animation behavior inside dedicated hooks.
The public API must stay small and project-agnostic.

Use native SVG and Motion for React. Do not introduce canvas, WebGL, Three.js,
Live2D, image sprites, or third-party avatar services.

Create a visual playground that exposes all activities, expressions, emotion
dimensions, gaze, size, theme, persona presets, reduced motion, and reactions.

Implement tests for expression mapping, clamping, priority, deterministic
randomness, and audio math.

Run the project's typechecker, linter, tests, and production build.

Before finishing, compare the implementation against the Definition of Done
section and report:
1. what was implemented
2. tests/build status
3. any intentionally omitted items
4. exact files changed
5. how to use the component in an application
```

---

# 66. Suggested Future Package API

Long-term target:

```ts
import {
  KaomojiAvatar,
  type AvatarActivity,
  type AvatarEmotion,
  type AvatarReaction,
} from "@yourorg/kaomoji-avatar"
```

Basic:

```tsx
<KaomojiAvatar />
```

Agent status:

```tsx
<KaomojiAvatar activity="thinking" />
```

Emotion:

```tsx
<KaomojiAvatar
  emotion={{
    valence: 0.6,
    arousal: 0.3,
    curiosity: 0.7,
  }}
/>
```

Speaking:

```tsx
<KaomojiAvatar
  activity="speaking"
  audioAnalyser={analyser}
/>
```

Branded:

```tsx
<KaomojiAvatar
  activity="listening"
  personality="curious"
  theme={{
    foreground: "var(--avatar-foreground)",
    accent: "var(--brand-accent)",
  }}
/>
```

---

# 67. Optional V2 Features

Do not build these until the base system is stable.

Possible V2:

```text
viseme support
voice activity detection
eye tracking from webcam
idle animation packs
SVG accessory slots
seasonal accessories
microphone-reactive ears/antennae
multiple face skins
timeline recording
avatar state replay
shared state machine package
React Native renderer
Canvas renderer
Web Component wrapper
Svelte/Vue adapters
```

Keep these outside v1.

---

# 68. Optional Accessory System

If future products need accessories, use slots.

Examples:

```text
hat
headphones
antenna
glasses
status badge
```

Architecture:

```tsx
<KaomojiAvatar
  accessories={["headphones"]}
/>
```

Accessories should receive face/head transforms so they stay attached during motion.

They must not own core emotion logic.

---

# 69. Optional State Recording

For debugging agent behavior, consider a future recorder:

```ts
interface AvatarFrame {
  timestamp: number
  activity: AvatarActivity
  emotion: AvatarEmotion
  reaction?: AvatarReaction
}
```

This allows:

```text
recording
replay
debugging
demo capture
regression testing
```

Do not include it in v1 unless needed.

---

# 70. Reference Implementation Principles

Current Motion documentation supports animation of native SVG elements with
`motion.svg`, `motion.path`, `motion.circle`, and other SVG motion components.
Motion also supports SVG attributes and transforms.

Current React usage:

```ts
import { motion } from "motion/react"
```

Web Audio `AnalyserNode` exposes real-time audio sample/frequency data and is
appropriate for deriving a lightweight speech envelope.

Use official references when API behavior is uncertain.

References:

- Motion for React:
  https://motion.dev/docs/react

- Motion SVG animation:
  https://motion.dev/docs/react-svg-animation

- Motion component:
  https://motion.dev/docs/react-motion-component

- MDN AnalyserNode:
  https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode

- MDN getByteFrequencyData:
  https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/getByteFrequencyData

- MDN SVG:
  https://developer.mozilla.org/en-US/docs/Web/SVG

---

# 71. Final Design Constraint

The kit succeeds if a future application can treat the avatar like this:

```tsx
<KaomojiAvatar
  activity={agent.activity}
  emotion={agent.emotion}
  audioAnalyser={agent.audioAnalyser}
/>
```

and get a recognizable, responsive, animated software persona without knowing
anything about:

```text
SVG path coordinates
blink timers
springs
mouth math
audio RMS
gaze interpolation
expression blending
motion choreography
```

That abstraction boundary is the product.

---

# 72. Final Agent Directive

Build the avatar as a **small deterministic visual system with controlled
stochastic behavior**, not as a collection of animated emojis.

Prioritize in this order:

```text
1. recognizable character
2. clean semantic API
3. readable expression
4. subtle motion
5. deterministic architecture
6. performance
7. extensibility
8. decorative complexity
```

When uncertain, choose the simpler visual solution and the cleaner software
architecture.

The avatar should feel alive because its behavior is coherent, not because it
moves constantly.
