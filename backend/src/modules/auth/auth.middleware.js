import { supabaseAdmin } from "../../config/supabase.js"
import { AppError } from "../../shared/utils/AppError.js"


export async function requireAuth(req, res, next) {
    try {
        if (!supabaseAdmin) {
            throw new AppError("Server configuration error: Supabase is not configured", 500)
        }

        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new AppError("Missing or invalid Authorization header", 401)
        }

        const token = authHeader.split(" ")[1]

        if (!token) {
            throw new AppError("Missing access token", 401)
        }

        const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token)

        if (authError || !authData?.user) {
            throw new AppError("Invalid or expired access token", 401)
        }

        const authUser = authData.user

        const { data: profile, error: profileError } = await supabaseAdmin
            .from("profiles")
            .select("id, full_name, role")
            .eq("id", authUser.id)
            .single()

        console.log("authUser.id", authUser.id)
        console.log("profileError", profileError)

        if (profileError || !profile) {
            throw new AppError("Teacher profile not found. Please complete registration.", 403)
        }

        req.user = {
            id: profile.id,
            email: authUser.email,
            full_name: profile.full_name,
            role: profile.role,
        }

        next()
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                ok: false,
                message: error.message,
            })
        }

        console.error("Auth middleware error:", error)

        return res.status(401).json({
            ok: false,
            message: "Authentication failed",
        })
    }
}