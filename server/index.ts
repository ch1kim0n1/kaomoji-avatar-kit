import { createServer, type IncomingMessage, type ServerResponse } from "node:http"
import { WebSocketServer, type WebSocket } from "ws"
import { avatarCatalog } from "../src/template/catalog"
import { sanitizeBotEvent } from "../src/template/botEvent"
import { AvatarSession } from "../src/template/session"
import { AVATAR_REACTIONS, type AvatarReaction } from "../src/avatar/core/types"

const port = Number(process.env.PORT ?? 8787)
const session = new AvatarSession()
const sockets = new Set<WebSocket>()

function send(socket: WebSocket, payload: unknown) {
  if (socket.readyState === socket.OPEN) socket.send(JSON.stringify(payload))
}

function broadcast(payload: unknown) {
  for (const socket of sockets) send(socket, payload)
}

session.subscribe((event) => {
  broadcast({
    type: "avatar.state",
    state: event.state,
    reaction: event.reaction,
  })
})

function json(response: ServerResponse, status: number, body: unknown) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type",
  })
  response.end(JSON.stringify(body))
}

async function readJson(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    size += buffer.length
    if (size > 1_000_000) throw new Error("Body too large")
    chunks.push(buffer)
  }
  if (chunks.length === 0) return {}
  return JSON.parse(Buffer.concat(chunks).toString("utf8"))
}

const server = createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    json(response, 204, {})
    return
  }

  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`)

  try {
    if (request.method === "GET" && url.pathname === "/api/health") {
      json(response, 200, { ok: true })
      return
    }
    if (request.method === "GET" && url.pathname === "/api/catalog") {
      json(response, 200, avatarCatalog())
      return
    }
    if (request.method === "GET" && url.pathname === "/api/avatar") {
      json(response, 200, session.getState())
      return
    }
    if (request.method === "POST" && url.pathname === "/api/avatar") {
      const result = session.applyUnknownPatch(await readJson(request))
      json(response, result.ok ? 200 : 400, result)
      return
    }
    if (request.method === "POST" && url.pathname === "/api/avatar/react") {
      const body = await readJson(request)
      const reaction = isRecord(body) ? body.reaction : undefined
      if (typeof reaction !== "string" || !AVATAR_REACTIONS.includes(reaction as AvatarReaction)) {
        json(response, 400, { ok: false, error: "Unknown reaction" })
        return
      }
      session.react(reaction as AvatarReaction)
      json(response, 200, { ok: true })
      return
    }
    if (request.method === "POST" && url.pathname === "/api/bot/event") {
      const event = sanitizeBotEvent(await readJson(request))
      if (!event) {
        json(response, 400, { ok: false, error: "Unknown bot event" })
        return
      }
      session.handleBotEvent(event)
      json(response, 200, { ok: true, state: session.getState() })
      return
    }
    json(response, 404, { ok: false, error: "Not found" })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request"
    json(response, 400, { ok: false, error: message })
  }
})

const socketsServer = new WebSocketServer({ server, path: "/ws" })

socketsServer.on("connection", (socket) => {
  sockets.add(socket)
  send(socket, { type: "catalog", catalog: avatarCatalog() })
  send(socket, { type: "avatar.state", state: session.getState() })

  socket.on("message", (data) => {
    try {
      const message = JSON.parse(data.toString()) as Record<string, unknown>
      if (message.type === "avatar.patch") {
        const result = session.applyUnknownPatch(message.patch)
        if (!result.ok) send(socket, { type: "error", message: result.error })
        return
      }
      if (message.type === "avatar.react") {
        if (typeof message.reaction !== "string" || !AVATAR_REACTIONS.includes(message.reaction as AvatarReaction)) {
          send(socket, { type: "error", message: "Unknown reaction" })
          return
        }
        session.react(message.reaction as AvatarReaction)
        return
      }
      if (message.type === "bot.event") {
        const event = sanitizeBotEvent(message.event)
        if (!event) {
          send(socket, { type: "error", message: "Unknown bot event" })
          return
        }
        session.handleBotEvent(event)
      }
    } catch {
      send(socket, { type: "error", message: "Invalid message" })
    }
  })

  socket.on("close", () => sockets.delete(socket))
})

server.listen(port, () => {
  console.log(`Kaomoji template backend on http://127.0.0.1:${port}`)
})

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}
