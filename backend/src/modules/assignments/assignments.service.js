import { supabaseAdmin } from "../../config/supabase.js"

export async function findAllByTeacher(teacherId) {
    const { data, error } = await supabaseAdmin
        .from("assignments")
        .select("*, subjects(name), assignment_classes(class_id, classes(name))")
        .eq("teacher_id", teacherId)
        .order("created_at", { ascending: false })

    if (error) throw error
    return data
}

export async function findById(id, teacherId) {
    const { data, error } = await supabaseAdmin
        .from("assignments")
        .select("*, subjects(name), assignment_classes(class_id, classes(id, name))")
        .eq("id", id)
        .eq("teacher_id", teacherId)
        .single()

    if (error) throw error
    return data
}

export async function create(assignmentData, classIds) {
    // insert assignment
    const { data: assignment, error: assignmentError } = await supabaseAdmin
        .from("assignments")
        .insert(assignmentData)
        .select()
        .single()

    if (assignmentError) throw assignmentError

    // insert assignment_classes
    if (classIds && classIds.length > 0) {
        const rows = classIds.map((classId) => ({
            assignment_id: assignment.id,
            class_id: classId,
        }))

        const { error: classesError } = await supabaseAdmin
            .from("assignment_classes")
            .insert(rows)

        if (classesError) throw classesError
    }

    // return full data
    return findById(assignment.id, assignmentData.teacher_id)
}

export async function update(id, teacherId, updateData) {
    const { data, error } = await supabaseAdmin
        .from("assignments")
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("teacher_id", teacherId)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function setAssignmentClasses(assignmentId, classIds) {
    // delete existing
    const { error: deleteError } = await supabaseAdmin
        .from("assignment_classes")
        .delete()
        .eq("assignment_id", assignmentId)

    if (deleteError) throw deleteError

    // insert new
    if (classIds && classIds.length > 0) {
        const rows = classIds.map((classId) => ({
            assignment_id: assignmentId,
            class_id: classId,
        }))

        const { error: insertError } = await supabaseAdmin
            .from("assignment_classes")
            .insert(rows)

        if (insertError) throw insertError
    }
}

export async function publish(id, teacherId) {
    const { data, error } = await supabaseAdmin
        .from("assignments")
        .update({ status: "published", updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("teacher_id", teacherId)
        .eq("status", "draft")
        .select()
        .single()

    if (error) throw error
    return data
}

export async function remove(id, teacherId) {
    // delete assignment_classes first
    const { error: classesError } = await supabaseAdmin
        .from("assignment_classes")
        .delete()
        .eq("assignment_id", id)

    if (classesError) throw classesError

    // delete assignment
    const { error } = await supabaseAdmin
        .from("assignments")
        .delete()
        .eq("id", id)
        .eq("teacher_id", teacherId)

    if (error) throw error
}

export async function verifyClassesOwnership(classIds, teacherId) {
    const { data, error } = await supabaseAdmin
        .from("classes")
        .select("id")
        .in("id", classIds)
        .eq("teacher_id", teacherId)

    if (error) throw error
    return data.length === classIds.length
}