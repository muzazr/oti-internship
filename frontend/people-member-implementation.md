# People/Member Tab — Implementation Guide

> **Figma**: [Node 294-1394](https://www.figma.com/design/j7zuZYKvmzdB2axojslld6?node-id=294-1394) — [Preview](https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/b6fd230c-d90d-4744-b0fe-0af06a634a69)

## Components

| Component | File | Description |
|-----------|------|-------------|
| AddMemberForm | `people/add-member-form.tsx` | Form: name + WhatsApp (+62) + role dropdown + "Send Invite" |
| ClassStatistics | `people/class-statistics.tsx` | Stats card: Students count + Teachers count |
| TeachersSection | `people/teachers-section.tsx` | Teachers list with avatar + name |
| StudentsSection | `people/students-section.tsx` | Students list with search + avatar initials |
| MemberRow | `member-row.tsx` | Reusable row: avatar + name + subtitle + action button |
| ResultAlert | `result-alert.tsx` | Success (green ✓) / Error (red ✗) alert dialog |

## Design Specs

- **Add Member card**: 325px wide, white bg, radius 12px, padding 24px
- **Inputs**: bg `#F3F3FE`, border `#C3C6D7`, radius 8px, height 48px
- **Send Invite button**: bg `#0055D4`, radius 8px, white text
- **Stats card**: bg `#F2F6FB`, border `#E6ECF6`, radius 12px
- **Section headers**: bg `#EDEDF8`, badge pill bg `#E5ECF6` text `#003FA3`
- **Student avatars**: bg `#F1F5F9`, initials Bold 16px `#003FA3`
- **Success alert**: icon `#10B981` on `#D1FAE5`, button `#0055D4`
- **Error alert**: icon `#93000A` on `#FFDAD6`, button `#0055D4`

## Data Flow

1. Fetch students: `supabase.from("students").select("*").eq("class_id", classId)`
2. Fetch teacher: `supabase.from("profiles").select("*").eq("id", teacherId)`
3. Add student: `supabase.from("students").insert(...)` → send WA invite → show alert
4. Delete student: `supabase.from("students").delete().eq("id", studentId)`
