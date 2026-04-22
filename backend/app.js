const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const helmet = require("helmet")
const morgan = require("morgan")

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(morgan("dev"))

app.get("/health", (req, res) => {
  res.json({ ok: true, message: "Backend is running" })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})