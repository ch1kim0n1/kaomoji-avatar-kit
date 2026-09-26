import { useEffect, useRef, useState } from "react"
import type { AvatarReaction } from "../avatar/core/types"
import type { BotEvent } from "./botEvent"
import type { ClientMessage, ServerMessage } from "./protocol"
import type { AvatarSignal } from "./sanitize"

function socketUrl(): string {
  const host = window.location.hostname
  if (host === "localhost" || host === "127.0.0.1") return `ws://${host}:8787/ws`
  const protocol = window.location.protocol === "https:" ? "wss" : "ws"
  return `${protocol}//${window.location.host}/ws`
}

export function useBotAvatar(enabled: boolean) {
  const socketRef = useRef<WebSocket | null>(null)
  const seenRef = useRef(new Set<string>())
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [remote, setRemote] = useState<AvatarSignal | null>(null)
  const [reaction, setReaction] = useState<{ type: AvatarReaction; id: string } | null>(null)

  useEffect(() => {
    if (!enabled) {
      setConnected(false)
      return
    }

    const socket = new WebSocket(socketUrl())
    socketRef.current = socket

    socket.addEventListener("open", () => {
      setConnected(true)
      setError(null)
    })
    socket.addEventListener("close", () => setConnected(false))
    socket.addEventListener("error", () => setError("Template backend is not reachable"))
    socket.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data)) as ServerMessage
      if (message.type === "error") {
        setError(message.message)
        return
      }
      if (message.type !== "avatar.state") return
      setRemote(message.state)
      if (message.reaction && !seenRef.current.has(message.reaction.id)) {
        seenRef.current.add(message.reaction.id)
        setReaction(message.reaction)
      }
    })

    return () => {
      socket.close()
      socketRef.current = null
    }
  }, [enabled])

  function send(message: ClientMessage) {
    const socket = socketRef.current
    if (!socket || socket.readyState !== WebSocket.OPEN) return false
    socket.send(JSON.stringify(message))
    return true
  }

  return {
    connected,
    error,
    remote,
    reaction,
    sendPatch(patch: unknown) {
      return send({ type: "avatar.patch", patch })
    },
    sendEvent(event: BotEvent) {
      return send({ type: "bot.event", event })
    },
    sendReaction(reactionName: AvatarReaction) {
      return send({ type: "avatar.react", reaction: reactionName })
    },
  }
}
