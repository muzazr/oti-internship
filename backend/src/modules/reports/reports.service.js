import { supabaseAdmin } from "../../config/supabase.js"

export async function getAssignmentRecap(assignmentId, teacherId) {
    // verify teacher owns assignment
    const { data: assignment, error: aErr } = await supabaseAdmin
        .from("assignments")
        .select("id, title, teacher_id, deadline")
        .eq("id", assignmentId)
        .eq("teacher_id", teacherId)
        .single()

    if (aErr || !assignment) return null

    // get all classes for this assignment
    const { data: assignmentClasses, error: acErr } = await supabaseAdmin
        .from("assignment_classes")
        .select("class_id, classes(id, name)")
        .eq("assignment_id", assignmentId)

    if (acErr) throw acErr

    const classIds = assignmentClasses.map((ac) => ac.class_id)

    if (classIds.length === 0) {
        return { assignment, classes: [], students: [] }
    }

    // get all students in those classes
    const { data: students, error: sErr } = await supabaseAdmin
        .from("students")
        .select("id, full_name, student_code, whatsapp_number, class_id, classes(name)")
        .in("class_id", classIds)
        .order("full_name", { ascending: true })

    if (sErr) throw sErr

    // get all submissions for this assignment
    const studentIds = students.map((s) => s.id)

    let submissions = []
    if (studentIds.length > 0) {
        const { data: subs, error: subErr } = await supabaseAdmin
            .from("submissions")
            .select("*, submission_files(id), submission_links(id)")
            .eq("assignment_id", assignmentId)
            .in("student_id", studentIds)

        if (subErr) throw subErr
        submissions = subs || []
    }

    // build recap rows
    const submissionMap = new Map()
    for (const sub of submissions) {
        submissionMap.set(sub.student_id, sub)
    }

    const recapRows = students.map((student) => {
        const sub = submissionMap.get(student.id)

        return {
            student_id: student.id,
            student_name: student.full_name,
            student_code: student.student_code,
            whatsapp_number: student.whatsapp_number,
            class_name: student.classes?.name || null,
            submission_id: sub?.id || null,
            submission_status: sub?.status || "not_submitted",
            submitted_at: sub?.submitted_at || null,
            file_count: sub?.submission_files?.length || 0,
            link_count: sub?.submission_links?.length || 0,
            score: sub?.score ?? null,
            feedback: sub?.feedback || null,
        }
    })

    return {
        assignment,
        classes: assignmentClasses.map((ac) => ac.classes),
        recap: recapRows,
        summary: {
            total_students: recapRows.length,
            submitted: recapRows.filter((r) => r.submission_status !== "not_submitted").length,
            not_submitted: recapRows.filter((r) => r.submission_status === "not_submitted").length,
            graded: recapRows.filter((r) => r.submission_status === "graded").length,
            late: recapRows.filter((r) => r.submission_status === "late").length,
        },
    }
}

export function formatRecapAsCSV(recapData) {
    const headers = [
        "No",
        "Student Name",
        "Student Code",
        "WhatsApp Number",
        "Class",
        "Status",
        "Submitted At",
        "Files",
        "Links",
        "Score",
        "Feedback",
    ]

    const rows = recapData.recap.map((row, index) => [
        index + 1,
        escapeCsvField(row.student_name),
        escapeCsvField(row.student_code || ""),
        escapeCsvField(row.whatsapp_number || ""),
        escapeCsvField(row.class_name || ""),
        row.submission_status,
        row.submitted_at || "",
        row.file_count,
        row.link_count,
        row.score ?? "",
        escapeCsvField(row.feedback || ""),
    ])

    const csvLines = [
        `Assignment: ${escapeCsvField(recapData.assignment.title)}`,
        `Exported: ${new Date().toISOString()}`,
        "",
        headers.join(","),
        ...rows.map((row) => row.join(",")),
    ]

    return csvLines.join("\n")
}

function escapeCsvField(value) {
    if (value === null || value === undefined) return ""
    const str = String(value)
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`
    }
    return str
}