import { supabaseAdmin } from "../../config/supabase.js"

export async function getDashboardStats(teacherId) {
    // 1. Get total students across all teacher's classes
    const { data: classes, error: classErr } = await supabaseAdmin
        .from("classes")
        .select("id")
        .eq("teacher_id", teacherId)

    if (classErr) throw classErr

    const classIds = classes.map((c) => c.id)

    let totalStudents = 0
    if (classIds.length > 0) {
        const { count, error: countErr } = await supabaseAdmin
            .from("students")
            .select("*", { count: "exact", head: true })
            .in("class_id", classIds)

        if (countErr) throw countErr
        totalStudents = count || 0
    }

    // 2. Get active assignments (status = 'published' and deadline >= today)
    const today = new Date().toISOString()
    const { data: activeAssignments, error: assignErr } = await supabaseAdmin
        .from("assignments")
        .select("id, deadline")
        .eq("teacher_id", teacherId)
        .eq("status", "published")
        .gte("deadline", today)

    if (assignErr) throw assignErr

    const activeAssignmentCount = activeAssignments?.length || 0

    // Count assignments with deadline today
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const deadlinesToday = activeAssignments?.filter((a) => {
        const d = new Date(a.deadline)
        return d >= todayStart && d <= todayEnd
    }).length || 0

    // 3. Get submission stats for teacher's assignments
    const { data: allAssignments, error: allAssignErr } = await supabaseAdmin
        .from("assignments")
        .select("id")
        .eq("teacher_id", teacherId)

    if (allAssignErr) throw allAssignErr

    const assignmentIds = allAssignments?.map((a) => a.id) || []

    let submittedCount = 0
    let notSubmittedCount = 0

    if (assignmentIds.length > 0 && classIds.length > 0) {
        // Count actual submissions
        const { count: subCount, error: subErr } = await supabaseAdmin
            .from("submissions")
            .select("*", { count: "exact", head: true })
            .in("assignment_id", assignmentIds)

        if (subErr) throw subErr
        submittedCount = subCount || 0

        // Calculate expected submissions (students x assignments assigned to their class)
        const { data: assignmentClasses, error: acErr } = await supabaseAdmin
            .from("assignment_classes")
            .select("assignment_id, class_id")
            .in("assignment_id", assignmentIds)

        if (acErr) throw acErr

        // Group by class_id to avoid counting same class multiple times per assignment
        const classStudentCounts = {}
        for (const ac of assignmentClasses || []) {
            if (!classStudentCounts[ac.class_id]) {
                const { count: studentCount, error: scErr } = await supabaseAdmin
                    .from("students")
                    .select("*", { count: "exact", head: true })
                    .eq("class_id", ac.class_id)

                if (!scErr) classStudentCounts[ac.class_id] = studentCount || 0
            }
        }

        let expectedSubmissions = 0
        for (const ac of assignmentClasses || []) {
            expectedSubmissions += classStudentCounts[ac.class_id] || 0
        }

        notSubmittedCount = Math.max(0, expectedSubmissions - submittedCount)
    }

    // 4. Get weekly submission trend (last 7 days grouped by day)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    let weeklyTrend = []
    if (assignmentIds.length > 0) {
        const { data: weekSubs, error: weekErr } = await supabaseAdmin
            .from("submissions")
            .select("submitted_at")
            .in("assignment_id", assignmentIds)
            .gte("submitted_at", weekAgo.toISOString())
            .order("submitted_at", { ascending: true })

        if (!weekErr && weekSubs) {
            // Group by day of week
            const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
            const dayCounts = {}
            dayNames.forEach((d) => (dayCounts[d] = 0))

            weekSubs.forEach((sub) => {
                const day = new Date(sub.submitted_at).getDay()
                dayCounts[dayNames[day]]++
            })

            // Return in Mon-Sun order
            const orderedDays = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"]
            weeklyTrend = orderedDays.map((day) => ({
                day,
                count: dayCounts[day] || 0,
            }))
        }
    }

    // If no data, provide empty structure
    if (weeklyTrend.length === 0) {
        const orderedDays = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"]
        weeklyTrend = orderedDays.map((day) => ({ day, count: 0 }))
    }

    // 5. Get recent submissions (last 5)
    let recentSubmissions = []
    if (assignmentIds.length > 0) {
        const { data: recent, error: recentErr } = await supabaseAdmin
            .from("submissions")
            .select(`
                id,
                submitted_at,
                status,
                students(id, full_name, class_id, classes(name)),
                assignments(id, title, subjects(name))
            `)
            .in("assignment_id", assignmentIds)
            .order("submitted_at", { ascending: false })
            .limit(5)

        if (!recentErr && recent) {
            recentSubmissions = recent.map((sub) => ({
                id: sub.id,
                student_name: sub.students?.full_name || "Unknown",
                student_initials: getInitials(sub.students?.full_name || "??"),
                class_name: sub.students?.classes?.name || "",
                subject_name: sub.assignments?.subjects?.name || "",
                submitted_at: sub.submitted_at,
                status: sub.status,
            }))
        }
    }

    // 6. Calculate participation rate
    const participationRate = (submittedCount + notSubmittedCount) > 0
        ? Math.round((submittedCount / (submittedCount + notSubmittedCount)) * 100)
        : 0

    return {
        stats: {
            total_students: totalStudents,
            active_assignments: activeAssignmentCount,
            deadlines_today: deadlinesToday,
            submitted: submittedCount,
            not_submitted: notSubmittedCount,
            participation_rate: participationRate,
        },
        weekly_trend: weeklyTrend,
        recent_submissions: recentSubmissions,
    }
}

function getInitials(name) {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
}
