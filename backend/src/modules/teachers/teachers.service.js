import { supabaseAdmin } from "../../config/supabase.js"
import { AppError } from "../../shared/utils/AppError.js"

/**
 * Get all teacher profiles.
 * In the MVP each authenticated user is a teacher so this returns all profiles.
 */
export async function getAllTeachers() {
    const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("id, full_name, role, phone_number, created_at, updated_at")
        .order("created_at", { ascending: false })

    if (error) {
        throw new AppError("Failed to fetch teachers: " + error.message, 500)
    }

    return data
}

/**
 * Get a single teacher profile by ID.
 */
export async function getTeacherById(id) {
    const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("id, full_name, role, phone_number, created_at, updated_at")
        .eq("id", id)
        .single()

    if (error || !data) {
        throw new AppError("Teacher not found", 404)
    }

    return data
}

/**
 * Update own teacher profile.
 */
export async function updateTeacher(id, updates) {
    const { data, error } = await supabaseAdmin
        .from("profiles")
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("id, full_name, role, phone_number, updated_at")
        .single()

    if (error) {
        throw new AppError("Failed to update profile: " + error.message, 500)
    }

    return data
}

/**
 * Delete a teacher profile and the associated Supabase Auth user.
 */
export async function deleteTeacher(id) {
    // Delete from profiles (will cascade based on FK or be handled by Supabase)
    const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .delete()
        .eq("id", id)

    if (profileError) {
        throw new AppError("Failed to delete teacher profile: " + profileError.message, 500)
    }

    // Also delete from Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id)

    if (authError) {
        // Log but don't fail — profile is already deleted
        console.warn("Could not delete auth user:", authError.message)
    }
}