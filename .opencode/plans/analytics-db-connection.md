# Analytics Page - Database Connection Implementation Plan

## Overview

Connect the Analytics page (`/guru/analytics`) to real Supabase database, replacing all mock data with live queries. AI Insight card will be emptied (coming soon state).

## Database Analysis

All 8 tables exist with correct schema. **All tables currently have 0 rows** - empty state handling is critical.

### Tables Used by Analytics

| Table | Columns Used | Purpose |
|-------|-------------|---------|
| `classes` | id, name, teacher_id | Class dropdown filter |
| `students` | id, full_name, class_id | Student recap table |
| `assignments` | id, title, deadline, status, teacher_id | Assignment dropdown + participation chart |
| `assignment_classes` | assignment_id, class_id | Link assignments to classes |
| `submissions` | id, student_id, assignment_id, status, score | All analytics computations |

No database changes needed. No new tables or columns required.

---

## Files to Create/Modify

### 1. NEW: `frontend/src/lib/api/analytics.ts`

API layer with all Supabase queries for analytics.

**Types:**
```typescript
interface AnalyticsClass { id: string; name: string; }
interface AnalyticsAssignment { id: string; title: string; }
interface StudentRecap {
  id: string; name: string; avgScore: number;
  submitted: number; late: number; notSubmitted: number;
}
interface ParticipationItem {
  assignment: string; sudah: number; terlambat: number; belum: number;
}
interface AnalyticsStats {
  averageScore: number; submitted: number; late: number;
  notSubmitted: number; totalStudents: number;
}
interface AnalyticsData {
  classes: AnalyticsClass[];
  assignments: AnalyticsAssignment[];
  students: StudentRecap[];
  participation: ParticipationItem[];
  stats: AnalyticsStats;
}
```

**Functions:**

`getTeacherId()` - helper, gets session and returns teacher user ID

`fetchAnalyticsClasses()` - returns teacher's classes for dropdown
- Query: `SELECT id, name FROM classes WHERE teacher_id = ? ORDER BY name`

`fetchAnalyticsAssignments(classIds)` - returns assignments for dropdown
- Query assignment_classes for assignment_ids, then assignments with teacher_id filter

`fetchAnalyticsData(selectedClassId, selectedAssignmentId)` - main function
- Steps:
  1. Get teacher's classes
  2. Determine target classIds (all or filtered)
  3. Get students in target classes: `SELECT id, full_name, class_id FROM students WHERE class_id IN (...)`
  4. Get assignment_classes links: `SELECT assignment_id, class_id FROM assignment_classes WHERE class_id IN (...)`
  5. Get assignments: `SELECT id, title, deadline, status FROM assignments WHERE id IN (...) AND teacher_id = ? AND status = 'published'`
  6. Filter by selectedAssignmentId if not "all"
  7. Get submissions: `SELECT id, student_id, assignment_id, status, score FROM submissions WHERE assignment_id IN (...)`
  8. Compute per-student recap (avgScore from graded submissions, submitted/late/notSubmitted counts)
  9. Compute per-assignment participation (sudah/terlambat/belum per assignment, considering which classes are linked)
  10. Compute summary stats
  11. Return AnalyticsData

`emptyAnalyticsData(classes, assignments, totalStudents)` - helper for empty states

**Key computation logic:**

Per-student:
- Build Map: studentId -> Map(assignmentId -> {status, score})
- For each student, iterate target assignments:
  - No submission = notSubmitted
  - status "late" = late
  - status "submitted"/"graded" = submitted
  - avgScore = sum(scores where score != null) / count(graded)

Per-assignment participation:
- Build Map: assignmentId -> Set(classIds) from assignment_classes
- Build Map: classId -> Set(studentIds)
- For each assignment, find relevant students via linked classes
- Count sudah/terlambat/belum

---

### 2. MODIFY: `frontend/src/app/guru/(dashboard)/analytics/page.tsx`

**Remove:**
- ALL mock data constants (mockClasses, mockAssignmentFilters, mockStudents, mockParticipation, mockDataByClass)
- getStudentStatus helper (already exists in student-recap-table.tsx)

**Add:**
- `import { useEffect } from "react"`
- `import { useRouter } from "next/navigation"`
- `import { fetchAnalyticsData, type AnalyticsData } from "@/lib/api/analytics"`
- `isLoading` state (boolean, default true)
- `analyticsData` state (AnalyticsData | null)
- `useEffect` with auth guard pattern (same as dashboard/page.tsx):
  ```
  1. Check supabase.auth.getSession()
  2. If no session -> router.push("/guru/login")
  3. Call fetchAnalyticsData(selectedClass, selectedAssignment)
  4. Set analyticsData state
  5. Set isLoading = false
  ```
- Re-fetch when selectedClass or selectedAssignment changes (useEffect dependency)
- Loading state UI: centered "Memuat analisis..." with animate-pulse
- Empty state: if no classes, show message "Belum ada kelas. Buat kelas terlebih dahulu di halaman Classes."

**Class dropdown:** Populated from `analyticsData.classes` with "Semua Kelas" as first option
**Assignment dropdown:** Populated from `analyticsData.assignments` with "Semua Tugas" as first option

**Data flow to components:**
- `AnalyticsStatsCards` <- `analyticsData.stats`
- `ParticipationBarChart` <- `analyticsData.participation`
- `SubmissionPieChart` <- `analyticsData.stats.{submitted, late, notSubmitted}`
- `AIInsightCard` <- selectedClassName (empty content)
- `StudentRecapTable` <- `analyticsData.students`

**Export handlers:** Use `analyticsData.students` and `analyticsData.participation` instead of mock data

---

### 3. MODIFY: `frontend/src/components/guru/dashboard/analytics/ai-insight-card.tsx`

**Remove:**
- `defaultInsights` array
- All dummy insight items
- Imports: TrendingDown, AlertTriangle, TrendingUp, Calendar

**Replace insights section with empty/coming-soon state:**
```tsx
<div className="flex flex-col items-center justify-center py-8 text-center">
  <Sparkles className="h-10 w-10 text-[#B4C5FF] mb-3" />
  <p className="text-sm font-medium text-[#565F6B]">
    AI Insight akan segera hadir
  </p>
  <p className="mt-1 text-xs text-[#8C8D91] max-w-sm">
    Fitur ini sedang dalam pengembangan. AI akan menganalisis pola pengumpulan tugas
    dan memberikan rekomendasi berdasarkan data kelas Anda.
  </p>
</div>
```

**Keep:** Card shell, header with Sparkles icon + "AI Insight" title + Beta badge, border-l-4 accent

---

## Query Flow Diagram

```
Page Load
  ├── Auth check (supabase.auth.getSession)
  │   └── No session? → redirect /guru/login
  │
  └── fetchAnalyticsData("all", "all")
        ├── SELECT id, name FROM classes WHERE teacher_id = ?
        ├── SELECT id, full_name, class_id FROM students WHERE class_id IN (...)
        ├── SELECT assignment_id, class_id FROM assignment_classes WHERE class_id IN (...)
        ├── SELECT id, title, deadline, status FROM assignments WHERE id IN (...) AND teacher_id = ?
        ├── SELECT id, student_id, assignment_id, status, score FROM submissions WHERE assignment_id IN (...)
        └── Compute in-memory → return AnalyticsData

Filter Change (class or assignment dropdown)
  └── Re-run fetchAnalyticsData(newClassId, newAssignmentId)
        └── Same query flow, different filters
```

## Empty State Handling

| Condition | Behavior |
|-----------|----------|
| 0 classes | Show "Belum ada kelas" message, all sections empty |
| 0 students | Stats all 0, table shows "Belum ada data siswa" |
| 0 assignments | Charts empty, assignment dropdown only has "Semua Tugas" |
| 0 submissions | All students show notSubmitted = total assignments, avgScore = 0 |
| Loading | Centered spinner "Memuat analisis..." |

## No Breaking Changes

- All child components already accept data via props and handle empty arrays
- Export functions already work with any data shape
- Sidebar link already points to /guru/analytics
- No database migration needed
