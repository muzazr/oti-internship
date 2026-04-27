import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"

import { env } from "./src/config/env.js"
import routes from "./src/routes.js"
import { notFound } from "./src/shared/middlewares/notFound.js"
import { errorHandler } from "./src/shared/middlewares/errorHandler.js"

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json({ limit: "1mb" }))
app.use(morgan("dev"))

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    message: "Backend is running",
  })
})

app.use("/api", routes)

app.use(notFound)
app.use(errorHandler)

app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`)
})