export function validate(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body)

        if (!result.success) {
            const errors = result.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            }))

            return res.status(400).json({
                ok: false,
                message: "Validation error",
                errors,
            })
        }

        req.body = result.data
        next()
    }
}

export function validateQuery(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.query)

        if (!result.success) {
            const errors = result.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            }))

            return res.status(400).json({
                ok: false,
                message: "Validation error",
                errors,
            })
        }

        req.validatedQuery = result.data
        next()
    }
}

export function validateParams(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.params)

        if (!result.success) {
            return res.status(400).json({
                ok: false,
                message: "Invalid request parameters",
            })
        }

        next()
    }
}