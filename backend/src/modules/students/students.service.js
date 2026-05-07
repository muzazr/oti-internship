import { supabaseAdmin } from "../../config/supabase.js"

export async function findAllByClass(classId) {
    const { data, error } = await supabaseAdmin
        .from("students")
        .select("*")
        .eq("class_id", classId)
        .order("full_name", { ascending: true })

    if (error) throw error
    return data
}

export async function findById(id) {
    const { data, error } = await supabaseAdmin
        .from("students")
        .select("*, classes!inner(id, name, teacher_id)")
        .eq("id", id)
        .single()

    if (error) throw error
    return data
}

export async function findByWhatsappNumber(whatsappNumber) {
    const { data, error } = await supabaseAdmin
        .from("students")
        .select("*, classes(id, name, teacher_id)")
        .eq("whatsapp_number", whatsappNumber)
        .limit(1)

    if (error || !data || data.length === 0) return null
    return data[0]
}

export async function findByStudentCode(studentCode) {
    const { data, error } = await supabaseAdmin
        .from("students")
        .select("*, classes(id, name, teacher_id)")
        .eq("student_code", studentCode)
        .limit(1)

    if (error || !data || data.length === 0) return null
    return data[0]
}

export async function create(data) {
    const { data: created, error } = await supabaseAdmin
        .from("students")
        .insert(data)
        .select()
        .single()

    if (error) throw error
    return created
}

export async function update(id, updateData) {
    const { data, error } = await supabaseAdmin
        .from("students")
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function remove(id) {
    const { error } = await supabaseAdmin
        .from("students")
        .delete()
        .eq("id", id)

    if (error) throw error
}

export async function verifyClassOwnership(classId, teacherId) {
    const { data, error } = await supabaseAdmin
        .from("classes")
        .select("id, name, teacher_id")
        .eq("id", classId)
        .eq("teacher_id", teacherId)
        .single()

    if (error) return null
    return data
}
