import { supabaseAdmin } from "../../config/supabase.js"

export async function findAllByTeacher(teacherId) {
    const { data, error } = await supabaseAdmin
        .from("subjects")
        .select("*")
        .eq("teacher_id", teacherId)
        .order("name", { ascending: true })

    if (error) throw error
    return data
}

export async function findById(id, teacherId) {
    const { data, error } = await supabaseAdmin
        .from("subjects")
        .select("*")
        .eq("id", id)
        .eq("teacher_id", teacherId)
        .single()

    if (error) throw error
    return data
}

export async function create(data) {
    const { data: created, error } = await supabaseAdmin
        .from("subjects")
        .insert(data)
        .select()
        .single()

    if (error) {
        console.error("CREATE SUBJECT ERROR: ", error)
        throw error
    }
    return created
}

export async function update(id, teacherId, updateData) {
    const { data, error } = await supabaseAdmin
        .from("subjects")
        .update(updateData)
        .eq("id", id)
        .eq("teacher_id", teacherId)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function remove(id, teacherId) {
    const { error } = await supabaseAdmin
        .from("subjects")
        .delete()
        .eq("id", id)
        .eq("teacher_id", teacherId)

    if (error) throw error
}
