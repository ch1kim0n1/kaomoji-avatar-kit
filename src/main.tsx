import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { AvatarPlayground } from "./avatar/debug/AvatarPlayground"

const root = document.getElementById("root")
if (!root) throw new Error("Missing #root")

createRoot(root).render(
  <StrictMode>
    <AvatarPlayground />
  </StrictMode>,
)
