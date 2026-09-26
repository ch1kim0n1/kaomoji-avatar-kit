export type AgentRuntimeState =
  | "ready"
  | "recording"
  | "reasoning"
  | "generating"
  | "executing_tool"
  | "done"
  | "failed"

export function agentStateToAvatar(state: AgentRuntimeState) {
  switch (state) {
    case "ready":
      return "idle" as const
    case "recording":
      return "listening" as const
    case "reasoning":
      return "thinking" as const
    case "generating":
      return "speaking" as const
    case "executing_tool":
      return "working" as const
    case "done":
      return "idle" as const
    case "failed":
      return "error" as const
    default: {
      const unreachable: never = state
      return unreachable
    }
  }
}
