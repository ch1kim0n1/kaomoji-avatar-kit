import type { AvatarReaction } from "../avatar/core/types"
import type { BotEvent } from "./botEvent"
import type { AvatarCatalog } from "./catalog"
import type { AvatarSignal } from "./sanitize"

export type ClientMessage =
  | { type: "bot.event"; event: BotEvent }
  | { type: "avatar.patch"; patch: unknown }
  | { type: "avatar.react"; reaction: AvatarReaction }

export type ServerMessage =
  | {
      type: "avatar.state"
      state: AvatarSignal
      reaction?: { type: AvatarReaction; id: string }
    }
  | { type: "catalog"; catalog: AvatarCatalog }
  | { type: "error"; message: string }
