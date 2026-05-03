# Analytics Page Implementation

## Overview

Implementasi halaman **Analytics & Laporan** (`/guru/analytics`) untuk MitBridge Educator Portal. Halaman ini menyediakan:

- **Rekap individu siswa** - rata-rata nilai, status per tugas (sudah/terlambat/belum)
- **Tren partisipasi kelas** - grafik batang (stacked bar chart) partisipasi per tugas
- **Diagram lingkaran** - persentase sudah/terlambat/belum dalam mengerjakan tugas
- **AI Insight (dummy)** - tracking progress per kelas, ringkasan dan pola pengumpulan
- **Export** - download hasil analisis ke CSV/Excel/Image (PNG)

---

## Table of Contents

1. [Dependencies](#1-dependencies)
2. [File Structure](#2-file-structure)
3. [Page Layout](#3-page-layout)
4. [Components](#4-components)
5. [Mock Data](#5-mock-data)
6. [Export Functionality](#6-export-functionality)
7. [Color Palette Reference](#7-color-palette-reference)
8. [Setup Instructions](#8-setup-instructions)

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
| `lucide-react` ^1.8.0 | Icons (GraduationCap, CheckCircle, Clock, XCircle, Sparkles, etc.) |
| `@tanstack/react-query` ^5.99.2 | Data fetching (future, when real data is connected) |
| `tailwindcss` ^4.2.4 | Styling |

---

## 2. File Structure

### New Files Created

```
frontend/src/
├── app/guru/(dashboard)/
│   └── analytics/
│       └── page.tsx                              # Main analytics page
├── components/guru/dashboard/analytics/
│   ├── analytics-stats-cards.tsx                 # 4 stat cards (rata-rata, sudah, terlambat, belum)
│   ├── participation-bar-chart.tsx               # Stacked bar chart partisipasi per tugas
│   ├── submission-pie-chart.tsx                  # Donut chart persentase status pengumpulan
│   ├── student-recap-table.tsx                   # Tabel rekap individu siswa (sortable, searchable)
│   ├── ai-insight-card.tsx                       # AI Insight card (dummy data)
│   └── export-menu.tsx                           # Dropdown menu export (CSV/Excel/Image)
└── lib/
    └── export-utils.ts                           # Utility functions for CSV/Excel/Image export
```

### No Modified Files

Halaman ini self-contained. Sidebar sudah memiliki link ke `/guru/analytics` (sudah ada di `sidebar.tsx`).

---

## 3. Page Layout

### Route: `/guru/analytics`

### File: `frontend/src/app/guru/(dashboard)/analytics/page.tsx`

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
│ │ [Select: Pilih Kelas ▼]  [Select: Semua Tugas ▼]            │ │
│ │                                        [Button: Download ▼]  │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│ STATS CARDS (grid 4 kolom)                                         │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│ │ Rata-rata│ │  Sudah   │ │Terlambat │ │  Belum   │            │
│ │  Nilai   │ │  Kumpul  │ │  Kumpul  │ │  Kumpul  │            │
│ │   78.5   │ │    24    │ │     5    │ │     8    │            │
│ │ 12 siswa │ │ 65% total│ │ 14% total│ │ 22% f-up │            │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘            │
│                                                                    │
│ CHARTS (2 kolom desktop, 1 kolom mobile)                           │
│ ┌────────────────────────────────┐ ┌──────────────────────────┐ │
│ │ Grafik Partisipasi Per Tugas   │ │ Status Pengumpulan       │ │
│ │ (Stacked Bar Chart)            │ │ (Donut/Pie Chart)        │ │
│ │                                │ │                          │ │
│ │ ████ Sudah (hijau)             │ │      ┌───────┐           │ │
│ │ ████ Terlambat (kuning)        │ │     /         \          │ │
│ │ ████ Belum (merah)             │ │    |   65%    |          │ │
│ │                                │ │     \         /          │ │
│ │ X: Tugas 1, Tugas 2, ...      │ │      └───────┘           │ │
│ │ Y: Jumlah siswa               │ │ ● Sudah ● Terlambat      │ │
│ │                                │ │ ● Belum                  │ │
│ └────────────────────────────────┘ └──────────────────────────┘ │
│                                                                    │
│ AI INSIGHT                                                         │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ ✨ AI Insight                                  [Badge: Beta] │ │
│ │ ────────────────────────────────────────────────────────────  │ │
│ │ • Kelas 9A tren pengumpulan menurun 15% dalam 2 minggu...   │ │
│ │ • 5 siswa konsisten terlambat mengumpulkan tugas...          │ │
│ │ • Rata-rata nilai Bahasa Indonesia naik 8%...                │ │
│ │ • Pola: Pengumpulan paling banyak di hari Kamis-Jumat        │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│ TABEL REKAP INDIVIDU                                               │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ "Rekap Individu Siswa"                    [🔍 Cari siswa...] │ │
│ │ ────────────────────────────────────────────────────────────  │ │
│ │ No │ Nama Siswa    │ Rata² │ Sudah │ Terlambat │ Belum │ St │ │
│ │  1 │ Ahmad Fauzi   │ 85.2  │   5   │     1     │   0   │ B  │ │
│ │  2 │ Budi Santoso  │ 72.0  │   4   │     2     │   1   │ PP │ │
│ │  3 │ Citra Dewi    │ 91.5  │   6   │     0     │   0   │ B  │ │
│ │ ...│               │       │       │           │       │    │ │
│ └──────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

### Responsive Breakpoints

| Breakpoint | Stats Cards | Charts | Table |
|------------|-------------|--------|-------|
| `xl` (1280px+) | 4 kolom | 2 kolom (flex-3 / flex-2) | Full width |
| `sm`-`xl` (640px-1279px) | 2 kolom | 1 kolom (stacked) | Full width, horizontal scroll |
| `< sm` (mobile) | 1 kolom | 1 kolom (stacked) | Full width, horizontal scroll |

---

## 4. Components

### 4.1 Analytics Page (`page.tsx`)

**File:** `frontend/src/app/guru/(dashboard)/analytics/page.tsx`

- Client component (`"use client"`)
- State: `selectedClass`, `selectedAssignment`, `searchQuery`
- Uses mock data (easily replaceable with real Supabase queries later)
- Computes stats from mock data using `useMemo`
- Handles export actions via `useCallback`
- Renders all sub-components in a vertical flex layout

### 4.2 Analytics Stats Cards (`analytics-stats-cards.tsx`)

4 kartu statistik mengikuti pattern `stats-cards.tsx` yang sudah ada di dashboard:

| Card | Label | Icon | Icon Color | Icon BG | Trend |
|------|-------|------|------------|---------|-------|
| 1 | Rata-rata Nilai | `GraduationCap` | `#2563EB` | `#EFF6FF` | "{n} siswa aktif" (hijau) |
| 2 | Sudah Kumpul | `CheckCircle` | `#059669` | `#ECFDF5` | "{n}% dari total" (hijau) |
| 3 | Terlambat | `Clock` | `#D97706` | `#FFFBEB` | "{n}% dari total" (kuning) |
| 4 | Belum Kumpul | `XCircle` | `#E11D48` | `#FFF1F2` | "{n}% perlu follow-up" (merah) |

**Props:**
```typescript
interface AnalyticsStatsCardsProps {
  averageScore: number;
  submitted: number;
  late: number;
  notSubmitted: number;
  totalStudents: number;
}
```

### 4.3 Participation Bar Chart (`participation-bar-chart.tsx`)

Stacked bar chart menunjukkan partisipasi per tugas.

- **Library:** Recharts (`BarChart`, `Bar`, `XAxis`, `YAxis`, `CartesianGrid`, `ResponsiveContainer`, `Tooltip`)
- **Type:** Stacked (`stackId="a"`)
- **X-axis:** Nama tugas (truncated, angled -15deg)
- **Y-axis:** Jumlah siswa
- **3 Bar series:**
  - Sudah: `#16A34A` (hijau)
  - Terlambat: `#D97706` (orange)
  - Belum: `#E11D48` (merah)
- **Legend:** Custom dots di header (bukan Recharts Legend)
- **Empty state:** Pesan "Belum ada data partisipasi"

### 4.4 Submission Pie Chart (`submission-pie-chart.tsx`)

Donut chart menunjukkan persentase keseluruhan status pengumpulan.

- **Library:** Recharts (`PieChart`, `Pie`, `Cell`, `ResponsiveContainer`, `Tooltip`)
- **Style:** Donut (innerRadius=60, outerRadius=90, paddingAngle=3)
- **Center label:** Total persentase terkumpul (sudah + terlambat)
- **Legend:** Di bawah chart - colored dot + label + percentage
- **Colors:** Sama dengan bar chart (hijau/kuning/merah)

### 4.5 AI Insight Card (`ai-insight-card.tsx`)

Card dengan dummy AI insights. Desain distinctive dengan border kiri biru.

- **Styling:** `border-l-4 border-l-[#2563EB]` (accent border kiri)
- **Header:** Icon `Sparkles` + "AI Insight" + Badge "Beta"
- **Content:** 4 dummy insight items, masing-masing dengan icon berwarna + teks
- **Footer:** Note bahwa AI masih dalam tahap pengembangan
- **Dummy insights:**
  1. Tren pengumpulan menurun (icon: TrendingDown, merah)
  2. Siswa konsisten terlambat (icon: AlertTriangle, kuning)
  3. Rata-rata nilai naik (icon: TrendingUp, hijau)
  4. Pola pengumpulan hari tertentu (icon: Calendar, biru)

### 4.6 Student Recap Table (`student-recap-table.tsx`)

Tabel rekap individu siswa dengan fitur search dan sort.

**Features:**
- Client-side search filter by nama siswa
- Sortable columns (click header): nama, rata-rata, sudah, terlambat, belum
- Alternating row colors (white / `#FAFBFC`)
- Status badges per siswa

**Columns:** No, Nama Siswa, Rata-rata, Sudah, Terlambat, Belum, Status

**Status badges:**
- "Baik" → `bg-[#ECFDF5] text-[#059669]` (rata-rata >= 75 & belum = 0 & late = 0)
- "Perlu Perhatian" → `bg-[#FFFBEB] text-[#D97706]` (ada terlambat atau belum)
- "Kritis" → `bg-[#FFF1F2] text-[#E11D48]` (belum > 2 atau rata-rata < 60)

### 4.7 Export Menu (`export-menu.tsx`)

Dropdown button untuk export data.

- **Trigger:** Button biru dengan icon Download + "Download" + ChevronDown
- **Dropdown:** 3 opsi (CSV, Excel, Image) dengan icon dan deskripsi
- **Close behavior:** Click outside atau setelah memilih opsi

---

## 5. Mock Data

Semua data menggunakan mock/dummy data yang hardcoded di `page.tsx`. Data berubah berdasarkan filter kelas yang dipilih.

### Mock Classes
- Semua Kelas (default)
- Kelas 9A (data lebih baik: +2 avg score, +1 submitted)
- Kelas 9B (data lebih rendah: -3 avg score, +2 terlambat)
- Kelas 8A (data terbaik: +5 avg score, -1 late)

### Mock Students (12 siswa)
Setiap siswa memiliki: `id`, `name`, `avgScore`, `submitted`, `late`, `notSubmitted`

### Mock Participation (5 tugas)
Setiap tugas memiliki: `assignment`, `sudah`, `terlambat`, `belum`

---

## 6. Export Functionality

### File: `frontend/src/lib/export-utils.ts`

### 6.1 CSV Export (`exportToCSV`)

- Generate CSV string dari student recap data
- Headers: No, Nama Siswa, Rata-rata Nilai, Sudah, Terlambat, Belum, Status
- BOM character (`\uFEFF`) untuk kompatibilitas Excel
- Filename: `analisis_{className}_{date}.csv`

### 6.2 Excel Export (`exportToExcel`)

- Uses `xlsx` (SheetJS) library
- 2 sheets:
  - "Rekap Siswa" - tabel rekap individu
  - "Partisipasi" - data partisipasi per tugas
- Auto-width columns
- Filename: `analisis_{className}_{date}.xlsx`

### 6.3 Image Export (`exportToImage`)

- Uses `html2canvas` to capture DOM element (`#analytics-charts-section`)
- Scale: 2x untuk kualitas tinggi
- Background: `#FAF8FF` (match page background)
- Output: PNG
- Filename: `analisis_{className}_{date}.png`

---

## 7. Color Palette Reference

### Colors Used in Analytics Page

| Purpose | Color | Notes |
|---------|-------|-------|
| Page Background | `#FAF8FF` | Inherited from layout |
| Card Background | `#FFFFFF` | White cards |
| Card Border | `#F9FAFB` | Very light gray |
| Card Shadow | `rgba(0,0,0,0.05)` | Subtle shadow |
| Text Primary | `#191B23` | Headings, bold values |
| Text Secondary | `#565F6B` | Labels, descriptions |
| Text Muted | `#434655` | Body text, insight text |
| Text Placeholder | `#9CA3AF` | Input placeholders |
| Primary Blue | `#2563EB` | Buttons, active states, AI accent |
| Primary Blue Hover | `#1D4ED8` | Button hover |
| Primary Blue Light | `#EFF6FF` | Icon backgrounds, badges |
| Success/Sudah | `#16A34A` | Green for positive |
| Success BG | `#ECFDF5` | Green badge background |
| Warning/Terlambat | `#D97706` | Orange for warning |
| Warning BG | `#FFFBEB` | Orange badge background |
| Error/Belum | `#E11D48` | Red for critical |
| Error BG | `#FFF1F2` | Red badge background |
| Border | `#E5E7EB` | Input borders, dividers |
| Border Light | `#F3F4F6` | Table row borders |
| Row Alternate | `#FAFBFC` | Table alternating rows |

---

## 8. Setup Instructions

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
2. Klik **"Analytics"** di sidebar → halaman analytics muncul
3. Verify:
   - [x] 4 stat cards tampil dengan data mock
   - [x] Bar chart menampilkan partisipasi per tugas (stacked)
   - [x] Pie/donut chart menampilkan persentase status
   - [x] AI Insight card tampil dengan dummy insights
   - [x] Tabel rekap siswa tampil dengan 12 data mock
   - [x] Search di tabel berfungsi (filter by nama)
   - [x] Sort kolom berfungsi (click header)
   - [x] Dropdown filter kelas berfungsi (data berubah per kelas)
   - [x] Export CSV → file .csv terdownload
   - [x] Export Excel → file .xlsx terdownload (2 sheets)
   - [x] Export Image → file .png terdownload (screenshot charts)

---

## Future Enhancements (Post-MVP)

| Feature | Description | Priority |
|---------|-------------|----------|
| Real data integration | Replace mock data with Supabase queries | High |
| AI Insight real | Integrate with LLM API for actual insights | Medium |
| Date range filter | Filter analytics by custom date range | Medium |
| Comparison mode | Compare 2 classes side by side | Low |
| Individual drill-down | Click student → detail page with per-assignment breakdown | Medium |
| PDF export | Export full report as formatted PDF | Low |
| Scheduled reports | Auto-generate weekly/monthly reports | Low |
| Backend analytics endpoint | New `/api/analytics` for aggregated data | High |
| Real-time updates | Live data refresh when new submissions come in | Low |

---

## Technical Notes

### Build Output

```
Route: /guru/analytics    Size: 153 kB    First Load JS: 455 kB
```

The page is relatively large due to Recharts + xlsx libraries. Consider lazy-loading xlsx (only import on export action) for production optimization.

### Recharts SSG Warning

During `npm run build`, Recharts may log warnings about chart width/height being -1. This is expected during static generation (no DOM) and does not affect runtime behavior.

### Data Architecture (for future real data)

When connecting to real data, the recommended approach:

1. Create `frontend/src/lib/api/analytics.ts` with functions:
   - `fetchClassAnalytics(classId)` - aggregated stats
   - `fetchParticipationData(classId, assignmentId?)` - per-assignment breakdown
   - `fetchStudentRecap(classId)` - per-student summary

2. Use TanStack React Query (`useQuery`) for caching and refetching

3. Backend can leverage existing:
   - `/api/reports/assignments/:id/recap` endpoint
   - `/api/dashboard` stats endpoint
   - Or create new `/api/analytics` endpoint for optimized aggregation
