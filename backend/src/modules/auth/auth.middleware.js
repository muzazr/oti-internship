import { supabaseAdmin } from "../../config/supabase.js"
import { AppError } from "../../shared/utils/AppError.js"

/**
 * Auth middleware: verifies Supabase JWT and attaches user profile to req.user.
 *
 * Flow:
 *  1. Extract Bearer token from Authorization header
 *  2. Verify JWT with Supabase Auth (server-side, not client-side)
 *  3. Fetch teacher profile from profiles table
 *  4. Attach { id, email, full_name, role } to req.user
 */
export async function requireAuth(req, res, next) {
    try {
        // 1. Check Supabase admin client is available
        if (!supabaseAdmin) {
            throw new AppError("Server configuration error: Supabase is not configured", 500)
        }

        // 2. Extract Bearer token
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new AppError("Missing or invalid Authorization header", 401)
        }

        const token = authHeader.split(" ")[1]

        if (!token) {
            throw new AppError("Missing access token", 401)
        }

        // 3. Verify JWT with Supabase Auth (server-side verification)
        const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token)

        if (authError || !authData?.user) {
            throw new AppError("Invalid or expired access token", 401)
        }

        const authUser = authData.user

        // 4. Fetch teacher profile from profiles table
        const { data: profile, error: profileError } = await supabaseAdmin
            .from("profiles")
            .select("id, full_name, role")
            .eq("id", authUser.id)
            .single()

        if (profileError || !profile) {
            throw new AppError("Teacher profile not found. Please complete registration.", 403)
        }

        // 5. Attach user info to request
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