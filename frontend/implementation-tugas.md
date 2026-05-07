# Implementation: Tugas (Assignments) + People (Members) — Class Detail Page

> **Figma Designs:**
> - Tugas Tab: [Node 294-1767](https://www.figma.com/design/j7zuZYKvmzdB2axojslld6?node-id=294-1767) — [Preview](https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/b0e2698a-c7cd-4a8f-bbab-fe3970a49902)
> - Buat Tugas Baru Modal: [Node 300-1028](https://www.figma.com/design/j7zuZYKvmzdB2axojslld6?node-id=300-1028) — [Preview](https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/6b490f47-eea5-462e-91b9-42a4e918c70f)
> - People Tab: [Node 294-1394](https://www.figma.com/design/j7zuZYKvmzdB2axojslld6?node-id=294-1394) — [Preview](https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/b6fd230c-d90d-4744-b0fe-0af06a634a69)
> - Success Alert: [Node 294-1393](https://www.figma.com/design/j7zuZYKvmzdB2axojslld6?node-id=294-1393) — [Preview](https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/90001db8-d5de-4b08-930c-c26119acd5cb)
> - Error Alert: [Node 294-1395](https://www.figma.com/design/j7zuZYKvmzdB2axojslld6?node-id=294-1395) — [Preview](https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/ab12abe6-cf88-44a3-bccd-6af6b80db685)

---

## 1. Database Migration

```sql
ALTER TABLE public.assignments
ADD COLUMN attachment_url TEXT,
ADD COLUMN start_date TIMESTAMPTZ;
```

---

## 2. File Structure

```
src/
├── app/guru/(dashboard)/classes/
│   ├── page.tsx                          ← Classes overview (MODIFIED: navigation)
│   └── [id]/page.tsx                     ← Class detail page (NEW)
├── components/guru/dashboard/classes/detail/
│   ├── result-alert.tsx                  ← Reusable Success/Error alert
│   ├── member-row.tsx                    ← Reusable member row
│   ├── tabs/
│   │   ├── tugas-tab.tsx                 ← Tugas tab assembly
│   │   └── people-tab.tsx                ← People tab assembly
│   ├── tugas/
│   │   ├── assignment-card.tsx           ← Assignment summary card
│   │   ├── assignments-table.tsx         ← Manage assignments table
│   │   ├── create-assignment-modal.tsx   ← Buat Tugas Baru modal
│   │   └── fab-button.tsx                ← FAB (+) button
│   └── people/
│       ├── add-member-form.tsx           ← Add New Member form
│       ├── class-statistics.tsx          ← Class Statistics card
│       ├── teachers-section.tsx          ← Teachers list
│       └── students-section.tsx          ← Students list with search
└── lib/api/
    ├── class-detail.ts                   ← Class, students, teacher queries
    ├── assignments.ts                    ← Assignments CRUD
    └── whatsapp.ts                       ← WA Bot placeholder
```

---

## 3. Features

### Tugas Tab
- Assignment summary cards with progress bars
- "Manage Class Assignments" table with status badges
- FAB (+) button → opens "Buat Tugas Baru" modal
- Create assignment with WA notification to all students
- Delete assignments

### People Tab
- "Add New Member" form (name + WhatsApp + role)
- Class Statistics (student/teacher count)
- Teachers section (from profiles table)
- Students section with search filter
- Success/Error alerts after adding member

### WhatsApp Bot
- API key pre-configured in `.env` (NEXT_PUBLIC_WA_BOT_API_KEY)
- Auto-sends when student added or assignment created (with checkbox)
- Placeholder function — wire up actual Meta WA Business API later

---

## 4. Navigation Flow

```
/guru/classes → Click "Detail Kelas" → /guru/classes/[id]
                                         ├── Tab: Tugas (default)
                                         │   └── FAB (+) → Create Assignment Modal
                                         └── Tab: People
                                             └── Add Member → Success/Error Alert
```

---

## 5. How to Test

1. Run SQL migration in Supabase
2. Start frontend: `cd frontend && npm run dev`
3. Login → /guru/classes → click "Detail Kelas"
4. Tugas tab: click (+) → fill form → "Kirim"
5. People tab: fill "Add New Member" → "Send Invite" → see alert
