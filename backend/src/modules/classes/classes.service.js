import { supabaseAdmin } from "../../config/supabase.js"

export async function findAllByTeacher(teacherId) {
    const { data, error } = await supabaseAdmin
        .from("classes")
        .select("*, subjects(id, name), students(count)")
        .eq("teacher_id", teacherId)
        .order("created_at", { ascending: false })

    if (error) throw error
    return data
}

export async function findById(id, teacherId) {
    const { data, error } = await supabaseAdmin
        .from("classes")
        .select("*, subjects(id, name), students(count)")
        .eq("id", id)
        .eq("teacher_id", teacherId)
        .single()

    if (error) throw error
    return data
}

export async function create(data) {
    const { data: created, error } = await supabaseAdmin
        .from("classes")
        .insert(data)
        .select()
        .single()

    if (error) throw error
    return created
}

export async function update(id, teacherId, updateData) {
    const { data, error } = await supabaseAdmin
        .from("classes")
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("teacher_id", teacherId)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function remove(id, teacherId) {
    const { error } = await supabaseAdmin
        .from("classes")
        .delete()
        .eq("id", id)
        .eq("teacher_id", teacherId)

    if (error) throw error
}
