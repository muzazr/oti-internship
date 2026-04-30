import express from "express"
import { requireAuth } from "../auth/auth.middleware.js"
import { validate, validateParams } from "../../shared/middlewares/validate.js"
import { createClassSchema, updateClassSchema, classIdParamSchema } from "./classes.schema.js"
import {
    listClasses,
    getClass,
    createClass,
    updateClass,
    deleteClass,
} from "./classes.controller.js"

const router = express.Router()

router.use(requireAuth)

router.get("/", listClasses)

router.post("/", validate(createClassSchema), createClass)

router.get("/:id", validateParams(classIdParamSchema), getClass)

router.patch("/:id", validateParams(classIdParamSchema), validate(updateClassSchema), updateClass)

router.delete("/:id", validateParams(classIdParamSchema), deleteClass)

export default router