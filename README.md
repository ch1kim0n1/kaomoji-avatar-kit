# Kaomoji Avatar Kit

Reusable 2D avatar for agent products. The face is native SVG plus Motion. Your bot sends semantic state. The kit decides how that looks.

```tsx
<KaomojiAvatar
  activity={agent.activity}
  emotion={agent.emotion}
  audioAnalyser={agent.audioAnalyser}
/>
```

## Run the playground

```bash
npm install
npm run dev
```

- App: http://127.0.0.1:5173
- Template backend: http://127.0.0.1:8787

`npm run dev:web` starts only the playground. The template bot still plays locally. Connect the backend from the playground when you want the WebSocket session.

## Use the avatar in another app

```tsx
import { KaomojiAvatar } from "kaomoji-avatar-kit"

export function Status({ thinking }: { thinking: boolean }) {
  return (
    <KaomojiAvatar
      activity={thinking ? "thinking" : "idle"}
      personality="curious"
      style={{ container: "circle", eyeStyle: "oval", mouthStyle: "soft", cheeks: true, pupils: true, sleepMarks: true }}
      theme={{ foreground: "var(--ink)", accent: "var(--brand)", blush: "#e11d48" }}
      size={96}
    />
  )
}
```

Build the library with `npm run build:lib`. Output lives in `dist/`. React 18.2+ and `motion` are peers.

Imperative reactions:

```tsx
const avatar = useRef<KaomojiAvatarHandle>(null)
avatar.current?.react("success")
```

Speaking without audio uses a procedural mouth. Pass an `AnalyserNode` when you have real audio:

```ts
import { createAudioAnalyser } from "kaomoji-avatar-kit"

const analyser = createAudioAnalyser(audioContext, sourceNode)
```

## Template backend

The avatar package does not know about your model, tools, or TTS. `src/template/` is the adapter you replace.

| File | What to edit |
| --- | --- |
| `src/template/exampleBot.ts` | `scriptForMessage()` — the demo timeline |
| `src/template/agentState.ts` | Map your runtime states to `idle`, `listening`, `thinking`, `speaking`, `working`, `success`, `warning`, `error`, `sleeping` |
| `src/template/guessEmotion.ts` | Stand-in until your model returns real emotion |
| `server/index.ts` | HTTP + WebSocket shell |

Run it:

```bash
npm run server
```

HTTP:

- `GET /api/health`
- `GET /api/catalog` — activities, expressions, personas, themes, variants
- `GET /api/avatar`
- `POST /api/avatar` — partial signal. Values are clamped.
- `POST /api/avatar/react` — `{ "reaction": "success" }`
- `POST /api/bot/event` — `{ "type": "user_message", "text": "run the tests" }`

In local development the playground connects straight to `ws://127.0.0.1:8787/ws`. On any other host it uses the page origin at `/ws`, so put a proxy in front of the backend when you deploy them together.

```json
{ "type": "bot.event", "event": { "type": "user_message", "text": "why?" } }
```

```json
{ "type": "avatar.patch", "patch": { "activity": "thinking", "emotion": { "curiosity": 0.8 } } }
```

The server broadcasts:

```json
{ "type": "avatar.state", "state": { "activity": "thinking", "emotion": {} } }
```

Drop `AvatarSession` into your own process if you do not want this server:

```ts
import { AvatarSession } from "kaomoji-avatar-kit/template"

const avatars = new AvatarSession()
avatars.subscribe((event) => socket.send(JSON.stringify(event)))
avatars.handleBotEvent({ type: "agent_state", state: "reasoning" })
avatars.react("success")
```

Do not send SVG coordinates, springs, or blink timers. Send activity, emotion, an optional expression name, and reactions.

## Customization

- `theme` — colors, stroke, corner radius. `currentColor` inherits from CSS.
- `personality` — `professional`, `playful`, `calm`, `curious`, `robotic`, or a partial `{ motionEnergy, reactionSpeed, gazeCuriosity, blinkFrequency, asymmetry, bounce }`.
- `style` — `eyeStyle` (`dot` | `oval` | `arc`), `mouthStyle` (`soft` | `geometric` | `cute`), `container` (`none` | `circle` | `rounded-square` | `blob`), cheeks, pupils, sleep marks.
- `emotion` — `valence` (-1..1), `arousal`, `confidence`, `curiosity`, `surprise`, `frustration` (0..1).
- `expression` — named face override.
- `seed` — repeatable blink, gaze, and speech rhythm.
- `reducedMotion` — static expression, no idle drift. System preference is used when this is omitted.

## Scripts

```bash
npm test
npm run typecheck
npm run build
```
