import express from "express"

const router = express.Router()

router.get("/", (req, res) => {
    res.json({
        ok: true,
        message: "auth module is ready",
    })
})

export default router