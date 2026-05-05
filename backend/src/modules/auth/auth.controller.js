import { supabaseAdmin } from "../../config/supabase.js"
<<<<<<< HEAD
import { successResponse, errorResponse } from "../../shared/utils/response.js"
=======
import { AppError } from "../../shared/utils/AppError.js"
import { successResponse } from "../../shared/utils/response.js"
>>>>>>> origin/main

export async function login(req, res, next) {
    try {
        const { email, password } = req.body

        if (!supabaseAdmin) {
            throw new AppError("Server configuration error: Supabase is not configured", 500)
        }

        const { data, error } = await supabaseAdmin.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            throw new AppError(error.message, 401)
        }

        return successResponse(res, "Login successful", {
            session: data.session,
            user: data.user,
        })
    } catch (error) {
        next(error)
    }
}

export async function register(req, res, next) {
    try {
        const { email, password, full_name } = req.body

        if (!supabaseAdmin) {
            throw new AppError("Server configuration error: Supabase is not configured", 500)
        }

        // Use admin.createUser to bypass email confirmation if needed for MVP
        // or just to have backend-driven creation
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
        })

        if (authError) {
            throw new AppError(authError.message, 400)
        }

        const userId = authData.user.id

        // Create profile
        const { error: profileError } = await supabaseAdmin
            .from("profiles")
            .insert({
                id: userId,
                full_name,
                role: "teacher",
            })

        if (profileError) {
            // If profile creation fails, the user is still in auth.users
            // In a production app we might want to clean up or use a trigger instead
            throw new AppError("User created but failed to create profile: " + profileError.message, 500)
        }

        return successResponse(res, "Registration successful", {
            user: {
                id: userId,
                email,
                full_name,
            },
        }, 201)
    } catch (error) {
        next(error)
    }
}

export function getMe(req, res) {
    return successResponse(res, "Authenticated user profile", req.user)
}

/**
 * POST /api/auth/register
 *
 * Creates a profile row for a newly signed-up user.
 * Expects a valid Supabase Auth JWT in the Authorization header.
 * The JWT is validated directly (bypassing requireAuth middleware,
 * which would 403 because the profile doesn't exist yet).
 *
 * Body: { full_name: string }
 */
export async function registerProfile(req, res) {
    try {
        if (!supabaseAdmin) {
            return errorResponse(res, "Server configuration error: Supabase is not configured", 500)
        }

        // 1. Extract and validate the JWT token
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return errorResponse(res, "Missing or invalid Authorization header", 401)
        }

        const token = authHeader.split(" ")[1]

        if (!token) {
            return errorResponse(res, "Missing access token", 401)
        }

        const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token)

        if (authError || !authData?.user) {
            return errorResponse(res, "Invalid or expired access token", 401)
        }

        const authUser = authData.user

        // 2. Check if profile already exists
        const { data: existingProfile } = await supabaseAdmin
            .from("profiles")
            .select("id, full_name, role")
            .eq("id", authUser.id)
            .single()

        if (existingProfile) {
            // Profile already exists — return it
            return successResponse(res, "Profile already exists", {
                id: existingProfile.id,
                email: authUser.email,
                full_name: existingProfile.full_name,
                role: existingProfile.role,
            })
        }

        // 3. Determine full_name: from request body, or from auth user metadata
        const fullName =
            req.body?.full_name ||
            authUser.user_metadata?.full_name ||
            authUser.email?.split("@")[0] ||
            "Teacher"

        // 4. Create the profile (using supabaseAdmin which bypasses RLS)
        const { data: newProfile, error: insertError } = await supabaseAdmin
            .from("profiles")
            .insert({
                id: authUser.id,
                full_name: fullName,
                role: "guru",
            })
            .select("id, full_name, role")
            .single()

        if (insertError) {
            console.error("Profile creation error:", insertError)
            return errorResponse(res, "Failed to create teacher profile", 500)
        }

        return successResponse(res, "Teacher profile created successfully", {
            id: newProfile.id,
            email: authUser.email,
            full_name: newProfile.full_name,
            role: newProfile.role,
        }, 201)
    } catch (error) {
        console.error("Register profile error:", error)
        return errorResponse(res, "An unexpected error occurred", 500)
    }
}
