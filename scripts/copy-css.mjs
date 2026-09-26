import { copyFileSync, mkdirSync } from "node:fs"

mkdirSync("dist/avatar/components", { recursive: true })
mkdirSync("dist/avatar/debug", { recursive: true })
copyFileSync("src/avatar/components/kaomoji-avatar.css", "dist/avatar/components/kaomoji-avatar.css")
copyFileSync("src/avatar/debug/playground.css", "dist/avatar/debug/playground.css")
