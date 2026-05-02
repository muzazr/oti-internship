import { supabaseAdmin } from "../../config/supabase.js"

export async function createSubmission(data) {
    const { data: submission, error } = await supabaseAdmin
        .from("submissions")
        .upsert(data, { onConflict: "assignment_id,student_id" })
        .select()
        .single()

    if (error) {
        console.error("SUPABASE ERROR:", error)
        throw error
    }
    return submission
}

export async function uploadFileToStorage(fileBuffer, storagePath, mimeType) {
    const { data, error } = await supabaseAdmin.storage
        .from("submissions")
        .upload(storagePath, fileBuffer, {
            contentType: mimeType,
            upsert: false,
        })

    if (error) {
        console.error("SUPABASE ERROR:", error)
        throw error
    }
    return data
}

export async function insertFileMetadata(metadata) {
    const { data, error } = await supabaseAdmin
        .from("submission_files")
        .insert(metadata)
        .select()
        .single()

    if (error) {
        console.error("SUPABASE ERROR:", error)
        throw error
    }
    return data
}

export async function insertSubmittedLinks(links) {
    if (!links || links.length === 0) return []

    const { data, error } = await supabaseAdmin
        .from("submission_links")
        .insert(links)
        .select()

    if (error) {
        console.error("SUPABASE ERROR:", error)
        throw error
    }
    return data
}

export async function findById(id) {
    const { data, error } = await supabaseAdmin
        .from("submissions")
        .select(`
            *,
            students(id, full_name, student_code, whatsapp_number),
            assignments(id, title, teacher_id),
            submission_files(*),
            submission_links(*)
        `)
        .eq("id", id)
        .single()

    if (error) {
        console.error("SUPABASE ERROR:", error)
        throw error
    }
    return data
}

export async function grade(id, teacherId, score, feedback) {
    const { data, error } = await supabaseAdmin
        .from("submissions")
        .update({
            score,
            feedback: feedback || null,
            graded_by: teacherId,
            graded_at: new Date().toISOString(),
            status: "graded",
            updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()

    if (error) {
        console.error("SUPABASE ERROR:", error)
        throw error
    }
    return data
}

export async function getSignedUrl(bucket, filePath) {
    const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .createSignedUrl(filePath, 3600) // 1 hour

    if (error) {
        console.error("SUPABASE ERROR:", error)
        throw error
    }
    return data.signedUrl
}

export async function deleteExistingFiles(submissionId) {
    // get existing files
    const { data: files } = await supabaseAdmin
        .from("submission_files")
        .select("bucket, file_path")
        .eq("submission_id", submissionId)

    if (files && files.length > 0) {
        // delete from storage
        const paths = files.map((f) => f.file_path)
        await supabaseAdmin.storage.from("submissions").remove(paths)

        // delete metadata
        await supabaseAdmin
            .from("submission_files")
            .delete()
            .eq("submission_id", submissionId)
    }

    // delete existing links
    await supabaseAdmin
        .from("submission_links")
        .delete()
        .eq("submission_id", submissionId)
}