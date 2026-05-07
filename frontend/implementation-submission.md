# Implementation: Submissions (Grading Siswa) + Preview (Submission Detail)

> **Figma Designs:**
> - Grading Siswa: [Node 300-2119](https://www.figma.com/design/j7zuZYKvmzdB2axojslld6?node-id=300-2119) — [Preview](https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/56c8bfdb-e3b2-4912-8ebc-f6d4097696d2)
> - Preview (Submission Detail): [Node 300-2273](https://www.figma.com/design/j7zuZYKvmzdB2axojslld6?node-id=300-2273) — [Preview](https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/b0c24e32-f318-4bb6-8b5e-f96ab0c851b4)

---

## 1. Database Changes

**No new tables or columns required.** The existing schema fully supports this feature:

- `submissions` — has `score`, `feedback`, `status` (submitted/late/graded), `graded_by`, `graded_at`
- `submission_files` — has `file_path`, `original_file_name`, `mime_type`, `file_size_bytes`
- `submission_links` — has `url`, `label`
- `assignment_classes` — links assignments to classes
- `students` — has `full_name`, `student_code`, `class_id`

**New Backend Endpoint Required:**

```
GET /api/submissions?assignment_id=<uuid>
```

Returns all submissions for a given assignment, joined with student data.

---

## 2. File Structure

```
src/
├── app/guru/(dashboard)/submissions/
│   ├── page.tsx                                    ← Submissions main page (NEW)
│   └── [submissionId]/
│       └── preview/
│           └── page.tsx                            ← Submission preview/grading page (NEW)
├── components/guru/dashboard/submissions/
│   ├── class-accordion.tsx                         ← Collapsible class section (NEW)
│   ├── assignment-sidebar-item.tsx                 ← Assignment item in left panel (NEW)
│   ├── student-grading-row.tsx                     ← Student row with score input (NEW)
│   ├── student-list-panel.tsx                      ← Right panel: student list (NEW)
│   ├── assignment-list-panel.tsx                   ← Left panel: assignment list (NEW)
│   └── preview/
│       ├── file-viewer.tsx                         ← File preview with zoom controls (NEW)
│       ├── file-accordion.tsx                      ← Collapsible file section (NEW)
│       ├── grading-panel.tsx                       ← Right aside: score + feedback (NEW)
│       ├── student-info-card.tsx                   ← Student avatar + status badge (NEW)
│       └── student-navigation-footer.tsx           ← Previous/Next student footer (NEW)
└── lib/api/
    └── submissions.ts                              ← Submissions API functions (NEW)
```

---

## 3. Features

### Submissions Page (`/guru/submissions`)
- Accordion-style class list (expand/collapse)
- Left panel: assignment list with grading progress (X/Y Gradings)
- Right panel: student list with status badges (Submitted/Not Submitted)
- Inline score input per student
- Preview button navigates to full submission view
- Due date badge per assignment

### Preview Page (`/guru/submissions/[submissionId]/preview`)
- Collapsible file viewer with zoom controls
- Renders submitted images/documents inline
- Grading panel: score (X/100) + feedback textarea
- "Kirim Nilai" (Submit Grade) button
- "Simpan Draft" (Save Draft) button
- WhatsApp notification checkbox
- Previous/Next student navigation footer

---

## 4. Navigation Flow

```
/guru/submissions
  └── Click "Preview" on a submitted student
        └── /guru/submissions/[submissionId]/preview
              ├── View submitted files (images/documents)
              ├── Enter score + feedback
              ├── "Kirim Nilai" → grades & navigates to next student
              ├── "Simpan Draft" → saves without finalizing
              └── Previous/Next Student → navigates between students
```

---

## 5. How to Test

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Login as teacher → Navigate to "Submissions" in sidebar
4. Verify accordion shows teacher's classes with assignment counts
5. Expand a class → select an assignment → verify student list loads
6. Click "Preview" on a submitted student → verify file viewer + grading panel
7. Enter score + feedback → click "Kirim Nilai" → verify grade saved
8. Use Previous/Next to navigate between students
9. Test "Simpan Draft" saves without changing status to graded
