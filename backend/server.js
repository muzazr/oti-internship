import app from "./app.js"
import { env } from "./src/config/env.js"

const server = app.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`)
})

server.on("error", (error) => {
    console.error("Server error:", error)
})