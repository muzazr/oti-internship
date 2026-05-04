# Analytics Page Implementation

## Overview

Implementasi halaman **Analytics & Laporan** (`/guru/analytics`) untuk MitBridge Educator Portal. Halaman ini **terhubung langsung ke database Supabase** dan menyediakan:

- **Rekap individu siswa** - rata-rata nilai, status per tugas (sudah/terlambat/belum)
- **Tren partisipasi kelas** - grafik batang (stacked bar chart) partisipasi per tugas
- **Diagram lingkaran** - persentase sudah/terlambat/belum dalam mengerjakan tugas
- **AI Insight** - Coming Soon (placeholder, siap untuk integrasi LLM)
- **Export** - download hasil analisis ke CSV/Excel/Image (PNG)

---

## Table of Contents

1. [Dependencies](#1-dependencies)
2. [File Structure](#2-file-structure)
3. [Database Schema](#3-database-schema)
4. [Data Flow & Queries](#4-data-flow--queries)
5. [Page Layout](#5-page-layout)
6. [Components](#6-components)
7. [Export Functionality](#7-export-functionality)
8. [Empty State Handling](#8-empty-state-handling)
9. [Color Palette Reference](#9-color-palette-reference)
10. [Setup Instructions](#10-setup-instructions)

---

## 1. Dependencies

### New Packages Installed

| Package | Version | Purpose |
|---------|---------|---------|
| `xlsx` | ^0.18.5 | Client-side Excel export (SheetJS) |
| `html2canvas` | ^1.4.1 | Export chart/section as PNG image |

### Install Command

```bash
cd frontend
npm install xlsx html2canvas
```

### Existing Dependencies Used

| Package | Purpose |
|---------|---------|
| `recharts` ^3.8.1 | BarChart (stacked), PieChart (donut) |
| `lucide-react` ^1.8.0 | Icons |
| `@supabase/supabase-js` ^2.105.1 | Database queries |
| `tailwindcss` ^4.2.4 | Styling |

---

## 2. File Structure

### Files Created/Modified

```
frontend/src/
├── lib/
│   ├── api/
│   │   └── analytics.ts              # NEW - Supabase query functions for analytics
│   └── export-utils.ts               # (existing) CSV/Excel/Image export utilities
├── app/guru/(dashboard)/
│   └── analytics/
│       └── page.tsx                   # MODIFIED - Real Supabase data, auth guard, loading states
└── components/guru/dashboard/analytics/
    ├── analytics-stats-cards.tsx      # (existing) 4 stat cards
    ├── participation-bar-chart.tsx    # (existing) Stacked bar chart
    ├── submission-pie-chart.tsx       # (existing) Donut chart
    ├── student-recap-table.tsx        # (existing) Sortable/searchable table
    ├── ai-insight-card.tsx            # MODIFIED - Coming Soon empty state
    └── export-menu.tsx               # (existing) Download dropdown
```

### No Database Changes

Tidak ada migration atau perubahan schema. Semua tabel yang dibutuhkan sudah ada.

---

## 3. Database Schema

### Tables Used by Analytics

| Table | Columns Used | Purpose |
|-------|-------------|---------|
| `classes` | `id`, `name`, `teacher_id` | Class dropdown filter, scope data per guru |
| `students` | `id`, `full_name`, `class_id` | Student recap table |
| `assignments` | `id`, `title`, `deadline`, `status`, `teacher_id` | Assignment dropdown + participation chart |
| `assignment_classes` | `assignment_id`, `class_id` | Junction table: link assignments to classes |
| `submissions` | `id`, `student_id`, `assignment_id`, `status`, `score` | All analytics computations |

### Entity Relationships

```
profiles (teacher)
  └──< classes.teacher_id
         ├──< students.class_id
         └──< assignment_classes.class_id
                └──> assignments.id (via assignment_id)
                       └──< submissions.assignment_id
                              └──> students.id (via student_id)
```

---

## 4. Data Flow & Queries

### API Layer: `frontend/src/lib/api/analytics.ts`

#### Types

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

#### Main Function: `fetchAnalyticsData(selectedClassId, selectedAssignmentId)`

**Query chain (5 sequential Supabase queries):**

```
1. SELECT id, name FROM classes WHERE teacher_id = ? ORDER BY name
2. SELECT id, full_name, class_id FROM students WHERE class_id IN (targetClassIds)
3. SELECT assignment_id, class_id FROM assignment_classes WHERE class_id IN (targetClassIds)
4. SELECT id, title, deadline, status FROM assignments
     WHERE id IN (assignmentIds) AND teacher_id = ? AND status = 'published'
5. SELECT id, student_id, assignment_id, status, score FROM submissions
     WHERE assignment_id IN (targetAssignmentIds)
```

**In-memory computation (after queries):**

```
6. Build studentSubmissionMap: Map<studentId, Map<assignmentId, {status, score}>>
7. Per-student recap:
   - For each student, iterate target assignments
   - No submission → notSubmitted++
   - status "late" → late++
   - status "submitted"/"graded" → submitted++
   - avgScore = sum(scores where score != null) / count(graded)
8. Per-assignment participation:
   - For each assignment, find relevant students via linked classes
   - Count sudah/terlambat/belum
9. Summary stats: aggregate from per-student recaps
```

#### Filter Logic

| Filter | Behavior |
|--------|----------|
| Class = "all" | Use all teacher's classes |
| Class = specific ID | Filter students + assignment_classes to that class only |
| Assignment = "all" | Use all published assignments for target classes |
| Assignment = specific ID | Filter to that single assignment |
| Class changes | Assignment filter resets to "all" |

### Page Data Flow

```
Page Load
  ├── Auth check (supabase.auth.getSession)
  │   └── No session? → redirect /guru/login
  ├── fetchAnalyticsData("all", "all")
  │   └── Set analyticsData state
  └── isLoading = false

Filter Change (class or assignment dropdown)
  ├── isRefetching = true
  ├── fetchAnalyticsData(newClassId, newAssignmentId)
  │   └── Update analyticsData state
  └── isRefetching = false
```

---

## 5. Page Layout

### Route: `/guru/analytics`

### Wireframe

```
┌──────────────────────────────────────────────────────────────────┐
│ HEADER                                                            │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ H1: "Analisis & Laporan"                                     │ │
│ │ Subtitle: "Pantau perkembangan akademik siswa secara detail" │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│ FILTER BAR                                                         │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ [Select: Kelas ▼]  [Select: Tugas ▼]  [Memuat...]           │ │
│ │                                        [Button: Download ▼]  │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│ STATS CARDS (grid 4 kolom)                                         │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│ │ Rata-rata│ │  Sudah   │ │Terlambat │ │  Belum   │            │
│ │  Nilai   │ │  Kumpul  │ │  Kumpul  │ │  Kumpul  │            │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘            │
│                                                                    │
│ CHARTS (2 kolom desktop, 1 kolom mobile)                           │
│ ┌────────────────────────────────┐ ┌──────────────────────────┐ │
│ │ Grafik Partisipasi Per Tugas   │ │ Status Pengumpulan       │ │
│ │ (Stacked Bar Chart)            │ │ (Donut Chart)            │ │
│ └────────────────────────────────┘ └──────────────────────────┘ │
│                                                                    │
│ AI INSIGHT                                                         │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ ✨ AI Insight                           [Badge: Coming Soon] │ │
│ │ "AI Insight akan segera hadir..."                             │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│ TABEL REKAP INDIVIDU                                               │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ "Rekap Individu Siswa"                    [🔍 Cari siswa...] │ │
│ │ No │ Nama │ Rata² │ Sudah │ Terlambat │ Belum │ Status       │ │
│ └──────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

### Responsive Breakpoints

| Breakpoint | Stats Cards | Charts | Table |
|------------|-------------|--------|-------|
| `xl` (1280px+) | 4 kolom | 2 kolom (flex-3 / flex-2) | Full width |
| `sm`-`xl` (640-1279px) | 2 kolom | 1 kolom (stacked) | Horizontal scroll |
| `< sm` (mobile) | 1 kolom | 1 kolom (stacked) | Horizontal scroll |

---

## 6. Components

### 6.1 Analytics Page (`page.tsx`)

- **Auth guard**: `supabase.auth.getSession()` → redirect if no session
- **States**: `isLoading`, `isRefetching`, `analyticsData`, `selectedClass`, `selectedAssignment`, `error`
- **Initial load**: `useEffect` → auth check → `fetchAnalyticsData("all", "all")`
- **Filter change**: separate `useEffect` watching `selectedClass` + `selectedAssignment`
- **Class change**: resets assignment filter to "all"
- **Dropdowns**: populated from `analyticsData.classes` and `analyticsData.assignments`
- **Disabled during refetch**: dropdowns get `disabled` + opacity-50

### 6.2 Analytics Stats Cards (`analytics-stats-cards.tsx`)

4 stat cards, same pattern as dashboard `stats-cards.tsx`:

| Card | Label | Icon | Trend |
|------|-------|------|-------|
| 1 | Rata-rata Nilai | `GraduationCap` | "{n} siswa aktif" |
| 2 | Sudah Kumpul | `CheckCircle` | "{n}% dari total" |
| 3 | Terlambat | `Clock` | "{n}% dari total" |
| 4 | Belum Kumpul | `XCircle` | "{n}% perlu follow-up" |

### 6.3 Participation Bar Chart (`participation-bar-chart.tsx`)

- Stacked bar chart (Recharts)
- Colors: Sudah `#16A34A`, Terlambat `#D97706`, Belum `#E11D48`
- Empty state: "Belum ada data partisipasi"

### 6.4 Submission Pie Chart (`submission-pie-chart.tsx`)

- Donut chart (innerRadius=60, outerRadius=90)
- Center label: total % terkumpul
- Legend below with colored dots

### 6.5 AI Insight Card (`ai-insight-card.tsx`) — MODIFIED

- **Removed**: All dummy insight data
- **Now shows**: "Coming Soon" empty state
  - Large Sparkles icon (muted blue `#B4C5FF`)
  - "AI Insight akan segera hadir"
  - Description text about upcoming feature
- **Badge**: Changed from "Beta" to "Coming Soon"
- **Kept**: Card shell, border-l-4 accent, footer note

### 6.6 Student Recap Table (`student-recap-table.tsx`)

- Searchable + sortable table
- Status badges: "Baik" / "Perlu Perhatian" / "Kritis"
- Empty state: "Belum ada data siswa"

### 6.7 Export Menu (`export-menu.tsx`)

- Dropdown: CSV, Excel, Image
- Uses real data from `analyticsData`

---

## 7. Export Functionality

### File: `frontend/src/lib/export-utils.ts`

| Function | Output | Content |
|----------|--------|---------|
| `exportToCSV()` | `.csv` | Student recap table |
| `exportToExcel()` | `.xlsx` | Sheet 1: Rekap Siswa, Sheet 2: Partisipasi |
| `exportToImage()` | `.png` | Screenshot of charts section |

Filename format: `analisis_{className}_{YYYY-MM-DD}.{ext}`

---

## 8. Empty State Handling

Karena database bisa kosong, setiap level memiliki graceful handling:

| Condition | UI Behavior |
|-----------|-------------|
| **0 classes** | Full-page empty state: icon + "Belum ada kelas" + link to Classes page |
| **0 students** | Stats all show 0, table shows "Belum ada data siswa" |
| **0 assignments** | Charts show empty state, assignment dropdown only has "Semua Tugas" |
| **0 submissions** | All students show notSubmitted = total assignments, avgScore = 0 |
| **Loading** | Centered "Memuat analisis..." with pulse animation |
| **Refetching** | "Memuat..." text next to filters, dropdowns disabled |
| **Error** | Error message + "Coba Lagi" button |

---

## 9. Color Palette Reference

| Purpose | Color |
|---------|-------|
| Page Background | `#FAF8FF` |
| Card Background | `#FFFFFF` |
| Card Border | `#F9FAFB` |
| Card Shadow | `rgba(0,0,0,0.05)` |
| Text Primary | `#191B23` |
| Text Secondary | `#565F6B` |
| Text Muted | `#434655` |
| Primary Blue | `#2563EB` |
| Primary Blue Hover | `#1D4ED8` |
| Primary Blue Light | `#EFF6FF` |
| Success/Sudah | `#16A34A` / bg `#ECFDF5` |
| Warning/Terlambat | `#D97706` / bg `#FFFBEB` |
| Error/Belum | `#E11D48` / bg `#FFF1F2` |
| Border | `#E5E7EB` |
| AI Accent (muted) | `#B4C5FF` |

---

## 10. Setup Instructions

### Step 1: Install Dependencies (already done)

```bash
cd frontend
npm install xlsx html2canvas
```

### Step 2: Verify Build

```bash
cd frontend
npm run build
```

Build harus berhasil tanpa TypeScript errors.

### Step 3: Run Development Server

```bash
cd frontend
npm run dev
```

### Step 4: Test

1. Login sebagai guru
2. Klik **"Analytics"** di sidebar
3. Verify:
   - [ ] Loading state muncul saat pertama kali load
   - [ ] Jika belum ada kelas → empty state "Belum ada kelas" muncul
   - [ ] Jika ada kelas → data real dari database tampil
   - [ ] Dropdown kelas berisi kelas-kelas milik guru
   - [ ] Dropdown tugas berisi tugas-tugas yang terhubung ke kelas
   - [ ] Ganti filter kelas → data berubah, assignment filter reset
   - [ ] Ganti filter tugas → data berubah sesuai tugas
   - [ ] "Memuat..." muncul saat refetching
   - [ ] Stats cards menampilkan angka dari database
   - [ ] Bar chart menampilkan partisipasi per tugas
   - [ ] Pie chart menampilkan persentase status
   - [ ] AI Insight menampilkan "Coming Soon"
   - [ ] Tabel rekap siswa menampilkan data real
   - [ ] Search dan sort di tabel berfungsi
   - [ ] Export CSV/Excel/Image berfungsi dengan data real

---

## API Reference

### `fetchAnalyticsData(selectedClassId: string, selectedAssignmentId: string): Promise<AnalyticsData>`

Main function. Fetches all data needed for the analytics page.

**Parameters:**
- `selectedClassId` — `"all"` for all classes, or a specific class UUID
- `selectedAssignmentId` — `"all"` for all assignments, or a specific assignment UUID

**Returns:** `AnalyticsData` object containing classes, assignments, students, participation, and stats.

**Auth:** Requires active Supabase session. Throws `"Not authenticated"` if no session.

**Queries:** 5 sequential Supabase queries + in-memory computation.

---

## Future Enhancements

| Feature | Description | Priority |
|---------|-------------|----------|
| AI Insight integration | Connect to LLM API for real insights | High |
| Date range filter | Filter analytics by custom date range | Medium |
| Comparison mode | Compare 2 classes side by side | Low |
| Individual drill-down | Click student → per-assignment breakdown | Medium |
| PDF export | Full formatted report as PDF | Low |
| Backend analytics endpoint | Optimized `/api/analytics` for aggregation | Medium |
| Real-time updates | Live refresh on new submissions | Low |
| TanStack React Query | Replace useEffect with useQuery for caching | Medium |
