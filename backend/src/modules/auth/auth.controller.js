import { supabaseAdmin } from "../../config/supabase.js"
import { AppError } from "../../shared/utils/AppError.js"
import { successResponse } from "../../shared/utils/response.js"

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