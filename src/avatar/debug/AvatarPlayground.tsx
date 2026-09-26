import { useEffect, useRef, useState } from "react"
import {
  AVATAR_ACTIVITIES,
  AVATAR_REACTIONS,
  CONTAINERS,
  EYE_STYLES,
  EXPRESSION_PRESETS,
  MOUTH_STYLES,
  PERSONALITY_NAMES,
  type AvatarActivity,
  type AvatarReaction,
  type ExpressionPreset,
  type KaomojiAvatarHandle,
} from "../core/types"
import { KaomojiAvatar } from "../components/KaomojiAvatar"
import { themes } from "../themes/themes"
import { createAudioAnalyser, disposeAudioAnalyser } from "../audio/createAudioAnalyser"
import { expressionCaptions } from "../../template/catalog"
import { scriptForMessage } from "../../template/exampleBot"
import { useBotAvatar } from "../../template/useBotAvatar"
import { applyPatch, createDefaultSignal, type AvatarPatch, type AvatarSignal } from "../../template/sanitize"
import "./playground.css"

const EMOTION_FIELDS = ["valence", "arousal", "confidence", "curiosity", "surprise", "frustration"] as const
const SIZES = [32, 64, 96, 256]

function isActivity(value: string): value is AvatarActivity {
  return AVATAR_ACTIVITIES.includes(value as AvatarActivity)
}

function isExpression(value: string): value is ExpressionPreset {
  return EXPRESSION_PRESETS.includes(value as ExpressionPreset)
}

export function AvatarPlayground() {
  const avatarRef = useRef<KaomojiAvatarHandle>(null)
  const timers = useRef<number[]>([])
  const [signal, setSignal] = useState<AvatarSignal>(() => createDefaultSignal())
  const [gazeLock, setGazeLock] = useState(false)
  const [gaze, setGaze] = useState({ x: 0, y: 0 })
  const [size, setSize] = useState(220)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [debug, setDebug] = useState(false)
  const [interactive, setInteractive] = useState(true)
  const [audioMode, setAudioMode] = useState<"off" | "demo" | "mic">("off")
  const [exposeStatus, setExposeStatus] = useState(false)
  const [seed, setSeed] = useState("kit")
  const [draft, setDraft] = useState("why is this so calm?")
  const [backend, setBackend] = useState(false)
  const bot = useBotAvatar(backend)
  const analyser = useSpeechAnalyser(audioMode)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const expression = params.get("expression")
    const activity = params.get("activity")
    const nextSize = Number(params.get("size"))
    if (expression && isExpression(expression)) {
      setSignal((current) => applyPatch(current, { expression }))
    }
    if (activity && isActivity(activity)) {
      setSignal((current) => applyPatch(current, { activity }))
    }
    if (Number.isFinite(nextSize) && nextSize > 0) setSize(nextSize)
    if (params.get("reduced") === "1") setReducedMotion(true)
  }, [])

  useEffect(() => {
    return () => {
      for (const id of timers.current) window.clearTimeout(id)
    }
  }, [])

  useEffect(() => {
    if (bot.remote) setSignal(bot.remote)
  }, [bot.remote])

  useEffect(() => {
    if (bot.reaction) avatarRef.current?.react(bot.reaction.type)
  }, [bot.reaction])

  function update(patch: AvatarPatch) {
    setSignal((current) => applyPatch(current, patch))
    if (bot.connected) bot.sendPatch(patch)
  }

  function react(type: AvatarReaction) {
    if (bot.connected) {
      bot.sendReaction(type)
      return
    }
    avatarRef.current?.react(type)
  }

  function sendToBot(text: string) {
    if (bot.connected) {
      bot.sendEvent({ type: "user_message", text })
      return
    }
    for (const id of timers.current) window.clearTimeout(id)
    timers.current = scriptForMessage(text).map((step) =>
      window.setTimeout(() => {
        if (step.patch) setSignal((current) => applyPatch(current, step.patch ?? {}))
        if (step.reaction) avatarRef.current?.react(step.reaction)
      }, step.at),
    )
  }

  const expression = signal.expression
  const emotion = signal.emotion

  return (
    <main className="playground">
      <header className="playground-header">
        <div>
          <p className="eyebrow">Avatar playground</p>
          <h1>Kaomoji kit</h1>
          <p>Tune activity, emotion, and brand. The face is SVG. Your bot only sends semantic state.</p>
        </div>
        <p className="status">
          {bot.connected ? "Template backend connected" : "Local preview"}
          {bot.error ? ` · ${bot.error}` : ""}
        </p>
      </header>

      <section className="gallery" aria-label="Expressions">
        {EXPRESSION_PRESETS.map((name) => (
          <button
            key={name}
            className={expression === name ? "face-card active" : "face-card"}
            onClick={() => update({ expression: name })}
            type="button"
          >
            <KaomojiAvatar
              expression={name}
              size={64}
              seed={name}
              theme={signal.theme}
              style={signal.style}
              personality={signal.personality}
              reducedMotion={reducedMotion}
            />
            <strong>{name}</strong>
            <span className="meta">{expressionCaptions[name]}</span>
          </button>
        ))}
      </section>

      <div className="layout">
        <section className="stage">
          <div className="stage-frame">
            <KaomojiAvatar
              ref={avatarRef}
              activity={signal.activity}
              expression={expression}
              emotion={emotion}
              gaze={gazeLock ? gaze : undefined}
              size={size}
              theme={signal.theme}
              style={signal.style}
              personality={signal.personality}
              seed={seed}
              interactive={interactive}
              reducedMotion={reducedMotion}
              debug={debug}
              audioAnalyser={analyser}
              ariaLabel={exposeStatus ? `Assistant is ${signal.activity}` : undefined}
            />
          </div>
          <div className="reactions">
            {AVATAR_REACTIONS.map((type) => (
              <button key={type} className="reaction" type="button" onClick={() => react(type)}>
                React: {type}
              </button>
            ))}
          </div>
        </section>

        <aside className="panel">
          <h2>State</h2>
          <label className="control">
            Activity
            <select value={signal.activity} onChange={(event) => update({ activity: event.target.value as AvatarActivity })}>
              {AVATAR_ACTIVITIES.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="control">
            Expression
            <select
              value={expression ?? ""}
              onChange={(event) => update({ expression: event.target.value ? (event.target.value as ExpressionPreset) : null })}
            >
              <option value="">From activity + emotion</option>
              {EXPRESSION_PRESETS.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          {EMOTION_FIELDS.map((field) => (
            <label key={field} className="control">
              {field} {Number(emotion[field] ?? 0).toFixed(2)}
              <input
                type="range"
                min={field === "valence" ? -1 : 0}
                max={1}
                step={0.01}
                value={emotion[field] ?? 0}
                onChange={(event) => update({ emotion: { [field]: Number(event.target.value) } })}
              />
            </label>
          ))}
          <label className="control">
            Gaze X {gaze.x.toFixed(2)}
            <input type="range" min={-1} max={1} step={0.01} value={gaze.x} onChange={(event) => { setGazeLock(true); setGaze((current) => ({ ...current, x: Number(event.target.value) })) }} />
          </label>
          <label className="control">
            Gaze Y {gaze.y.toFixed(2)}
            <input type="range" min={-1} max={1} step={0.01} value={gaze.y} onChange={(event) => { setGazeLock(true); setGaze((current) => ({ ...current, y: Number(event.target.value) })) }} />
          </label>
          <label className="control">
            Size {size}px
            <input type="range" min={24} max={320} step={1} value={size} onChange={(event) => setSize(Number(event.target.value))} />
          </label>
          <label className="control">
            Persona
            <select value={signal.personality} onChange={(event) => update({ personality: event.target.value as AvatarSignal["personality"] })}>
              {PERSONALITY_NAMES.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="control">
            Theme
            <select
              value={themeName(signal) ?? "custom"}
              onChange={(event) => {
                const name = event.target.value as keyof typeof themes
                update({ theme: { ...themes[name] } })
              }}
            >
              <option value="custom">custom</option>
              {Object.keys(themes).map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="control">
            Foreground
            <input
              type="text"
              value={signal.theme.foreground ?? ""}
              onChange={(event) => update({ theme: { foreground: event.target.value } })}
            />
          </label>
          <label className="control">
            Eyes
            <select value={signal.style.eyeStyle} onChange={(event) => update({ style: { eyeStyle: event.target.value as AvatarSignal["style"]["eyeStyle"] } })}>
              {EYE_STYLES.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="control">
            Mouth
            <select value={signal.style.mouthStyle} onChange={(event) => update({ style: { mouthStyle: event.target.value as AvatarSignal["style"]["mouthStyle"] } })}>
              {MOUTH_STYLES.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="control">
            Container
            <select value={signal.style.container} onChange={(event) => update({ style: { container: event.target.value as AvatarSignal["style"]["container"] } })}>
              {CONTAINERS.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <div className="row">
            <label><input type="checkbox" checked={signal.style.cheeks} onChange={(event) => update({ style: { cheeks: event.target.checked } })} /> Cheeks</label>
            <label><input type="checkbox" checked={signal.style.pupils} onChange={(event) => update({ style: { pupils: event.target.checked } })} /> Pupils</label>
            <label><input type="checkbox" checked={gazeLock} onChange={(event) => setGazeLock(event.target.checked)} /> Lock gaze</label>
            <label><input type="checkbox" checked={interactive} onChange={(event) => setInteractive(event.target.checked)} /> Pointer</label>
            <label><input type="checkbox" checked={reducedMotion} onChange={(event) => setReducedMotion(event.target.checked)} /> Reduced motion</label>
            <label><input type="checkbox" checked={debug} onChange={(event) => setDebug(event.target.checked)} /> Debug</label>
            <label><input type="checkbox" checked={exposeStatus} onChange={(event) => setExposeStatus(event.target.checked)} /> Status label</label>
          </div>
          <label className="control">
            Audio
            <select value={audioMode} onChange={(event) => setAudioMode(event.target.value as "off" | "demo" | "mic")}>
              <option value="off">Off</option>
              <option value="demo">Demo tone</option>
              <option value="mic">Microphone</option>
            </select>
          </label>
          <label className="control">
            Seed
            <input value={seed} onChange={(event) => setSeed(event.target.value)} />
          </label>
          <h2>Variants</h2>
          <div className="variants">
            <VariantButton label="Professional" onClick={() => update(variantPatch("minimalProfessional"))} />
            <VariantButton label="Cute" onClick={() => update(variantPatch("cuteAssistant"))} />
            <VariantButton label="Terminal" onClick={() => update(variantPatch("terminalCompanion"))} />
            <VariantButton label="Emotional" onClick={() => update(variantPatch("emotionalCompanion"))} />
          </div>
        </aside>
      </div>

      <section className="bot">
        <h2>Template bot</h2>
        <p className="status">
          Try a message. Words like why, run, fail, warn, and sleep change the script in <code>src/template/exampleBot.ts</code>.
        </p>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            sendToBot(draft)
          }}
        >
          <input value={draft} onChange={(event) => setDraft(event.target.value)} aria-label="Message to the template bot" />
          <button type="submit">Send</button>
          <button type="button" onClick={() => setBackend((value) => !value)}>
            {backend ? "Disconnect" : "Connect backend"}
          </button>
        </form>
        <div className="chips">
          {["hello there", "why though?", "run the build", "this failed", "careful", "go to sleep"].map((sample) => (
            <button key={sample} className="chip" type="button" onClick={() => { setDraft(sample); sendToBot(sample) }}>
              {sample}
            </button>
          ))}
        </div>
      </section>

      <section className="sizes" aria-label="Sizes">
        {SIZES.map((px) => (
          <div key={px} className="size-card">
            <KaomojiAvatar
              activity={signal.activity}
              expression={expression}
              emotion={emotion}
              size={px}
              theme={signal.theme}
              style={signal.style}
              personality={signal.personality}
              seed={`${seed}-${px}`}
              reducedMotion={reducedMotion}
            />
            <span>{px}px</span>
          </div>
        ))}
      </section>
    </main>
  )
}

function VariantButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <button className="variant" type="button" onClick={onClick}>{label}</button>
}

function variantPatch(name: "minimalProfessional" | "cuteAssistant" | "terminalCompanion" | "emotionalCompanion"): AvatarPatch {
  const variants = {
    minimalProfessional: { personality: "professional" as const, style: { eyeStyle: "oval" as const, mouthStyle: "geometric" as const, container: "none" as const, cheeks: false, pupils: false }, theme: { foreground: "#161616", accent: "#161616", blush: "#161616" } },
    cuteAssistant: { personality: "playful" as const, style: { eyeStyle: "oval" as const, mouthStyle: "cute" as const, container: "blob" as const, cheeks: true, pupils: true }, theme: { foreground: "#4a2c3d", background: "#ffd6ea", accent: "#ffb7d5", blush: "#ff7aa2", strokeWidth: 3.2 } },
    terminalCompanion: { personality: "robotic" as const, style: { eyeStyle: "dot" as const, mouthStyle: "geometric" as const, container: "rounded-square" as const, cheeks: false, pupils: false }, theme: { foreground: "#b7f7c4", accent: "#b7f7c4", blush: "#86efac", background: "#102117", radius: 8 } },
    emotionalCompanion: { personality: "curious" as const, style: { eyeStyle: "oval" as const, mouthStyle: "soft" as const, container: "circle" as const, cheeks: true, pupils: true }, theme: { foreground: "#3d3144", background: "#ffe7f1", accent: "#ffc2d8", blush: "#ff8fb3", strokeWidth: 3.2 } },
  }
  return variants[name]
}

function themeName(signal: AvatarSignal): string | undefined {
  const foreground = signal.theme.foreground
  const match = Object.entries(themes).find(([, theme]) => theme.foreground === foreground)
  return match?.[0]
}

function useSpeechAnalyser(mode: "off" | "demo" | "mic") {
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)

  useEffect(() => {
    if (mode === "off") {
      setAnalyser(null)
      return
    }

    let stopped = false
    let cleanup = () => {}
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext
    if (!AudioContextCtor) return

    const context = new AudioContextCtor()

    if (mode === "demo") {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.frequency.value = 160
      gain.gain.value = 0
      oscillator.connect(gain)
      const node = createAudioAnalyser(context, gain)
      oscillator.start()
      let timer = 0
      const pulse = () => {
        if (stopped) return
        gain.gain.setTargetAtTime(Math.random() * 0.7, context.currentTime, 0.02)
        timer = window.setTimeout(pulse, 80 + Math.random() * 140)
      }
      pulse()
      setAnalyser(node)
      cleanup = () => {
        window.clearTimeout(timer)
        oscillator.stop()
        disposeAudioAnalyser(node, gain)
        void context.close()
      }
    } else {
      void navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        if (stopped) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        const source = context.createMediaStreamSource(stream)
        const node = createAudioAnalyser(context, source)
        setAnalyser(node)
        cleanup = () => {
          disposeAudioAnalyser(node, source)
          stream.getTracks().forEach((track) => track.stop())
          void context.close()
        }
      }).catch(() => setAnalyser(null))
    }

    return () => {
      stopped = true
      cleanup()
      setAnalyser(null)
    }
  }, [mode])

  return analyser
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext
  }
}
