import "dotenv/config"
import app from "./app.js"
import { env } from "./src/config/env.js"

console.log("SUPABASE_URL", !!process.env.SUPABASE_URL)
console.log("SUPABASE_SERVICE_ROLE_KEY", !!process.env.SUPABASE_SERVICE_ROLE_KEY)

const port = env.PORT || 4000
const server = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
})

server.on("error", (error) => {
    console.error("Server error:", error)
})