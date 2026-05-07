# Buat Kelas Baru — Implementation Guide

> **Source**: Figma Design — [Figma UI Internship OmahTI UGM (Design)](https://www.figma.com/design/j7zuZYKvmzdB2axojslld6/Figma-UI-Internship-OmahTI-UGM--Design-?node-id=298-809&m=dev)
> **Frame**: `Classes` (ID: `298:809`) — 1440 × 1020 px
> **Delete Dialog Frame**: `293:680`
> **Exported Design Preview**: https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/1695b87e-42cb-4e66-aa93-701c85c052d0
> **Delete Dialog Preview**: https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/8a6c04ff-9605-4602-b1f4-cc09988fb99c

---

## 1. Feature Overview

The "Buat Kelas Baru" (Create New Class) feature includes:

1. **Classes Overview Page** (`/guru/classes`) — displays class cards in a responsive grid
2. **"+" Create New Class Card** — clicking opens the "Buat Kelas Baru" modal
3. **"Buat Kelas Baru" Modal** — form with "Kelas" and "Nama Mata Pelajaran" fields
4. **Delete Class** — trash icon on each card triggers a confirmation dialog
5. **Auto-generated Thumbnails** — CSS gradients with subject name text overlay

### User Flows

```
Classes Page → Click "+" card → Modal opens → Fill form → "Buat Kelas" → Class created → Modal closes → List refreshes

Classes Page → Click 🗑️ icon → Delete dialog → "Hapus" → Class deleted → Dialog closes → List refreshes
```

---

## 2. Database Prerequisite

### Migration SQL (run in Supabase SQL Editor)

```sql
ALTER TABLE public.classes
ADD COLUMN subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL;
```

### `classes` Table Schema (after migration)

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK, default `gen_random_uuid()` |
| `name` | VARCHAR(100) | NOT NULL |
| `teacher_id` | UUID | FK → auth.users(id), NOT NULL |
| `academic_year` | VARCHAR(20) | NULLABLE |
| `subject_id` | UUID | FK → subjects(id), NULLABLE — **NEW** |
| `created_at` | TIMESTAMPTZ | DEFAULT now() |
| `updated_at` | TIMESTAMPTZ | NULLABLE |

---

## 3. File Structure

```
frontend/src/
├── app/guru/(dashboard)/classes/
│   └── page.tsx                          ← Classes page (client component)
├── components/guru/dashboard/classes/
│   ├── class-card.tsx                    ← Individual class card
│   ├── create-class-card.tsx             ← "+" Create New Class card
│   ├── create-class-modal.tsx            ← "Buat Kelas Baru" modal form
│   ├── delete-class-dialog.tsx           ← Delete confirmation dialog
│   ├── class-thumbnail.tsx               ← Auto-generated gradient thumbnail
│   └── avatar-group.tsx                  ← Overlapping avatar stack
├── lib/
│   ├── api/classes.ts                    ← API functions (fetch, create, delete)
│   └── schemas/create-class.ts           ← Zod validation schema

backend/src/modules/classes/
├── classes.schema.js                     ← MODIFIED: added subject_id
└── classes.service.js                    ← MODIFIED: includes subjects in queries
```

---

## 4. Color Palette

| Usage | Hex | Tailwind |
|---|---|---|
| Page Background | `#FAF8FF` | `bg-[#FAF8FF]` |
| White (cards, modal) | `#FFFFFF` | `bg-white` |
| Dark Text | `#191B23` | `text-[#191B23]` |
| Body Text | `#565F6B` | `text-[#565F6B]` |
| Primary Blue (buttons) | `#003FA3` | `bg-[#003FA3]` |
| Brand Blue (nav) | `#2563EB` | `text-[#2563EB]` |
| Placeholder | `#8C8D91` | `placeholder:text-[#8C8D91]` |
| Input BG | `#F3F3FE` | `bg-[#F3F3FE]` |
| Input Border | `#C3C6D7` | `border-[#C3C6D7]` |
| Info Banner BG | `#EFF6FF` | `bg-[#EFF6FF]` |
| Info Banner Border | `#DBEAFE` | `border-[#DBEAFE]` |
| Info Text | `#003FA3` | `text-[#003FA3]` |
| Card Border | `#E1E2ED` | `border-[#E1E2ED]` |
| Delete Red | `#FA0909` | `text-[#FA0909]` |
| Delete Button BG | `#BA1A1A` | `bg-[#BA1A1A]` |
| Warning Circle BG | `#FFDAD6` | `bg-[#FFDAD6]` |
| Cancel Border (modal) | `#000` | `border-black` |
| Cancel Border (dialog) | `#E2E8F0` | `border-[#E2E8F0]` |
| Cancel Text | `#565F6B` / `#475569` | `text-[#565F6B]` |
| Icon Gray | `#737686` | `text-[#737686]` |
| Modal Overlay | `#000` 50% | `bg-black/50` |

---

## 5. Typography

| Element | Weight | Size | Color |
|---|---|---|---|
| Modal Title | Bold 700 | 24px | `#191B23` |
| Form Label | Regular 400 | 12px | `#191B23` |
| Form Input | Regular 400 | 16px | `#191B23` |
| Placeholder | Regular 400 | 16px | `#8C8D91` |
| Info Text | Regular 400 | 12px | `#003FA3` |
| Button Text | Regular 400 | 16px | varies |
| Page Title | Bold 700 | 24px | `#191B23` |
| Card Title | Bold 700 | 20px | `#191B23` |
| Student Count | Regular 400 | 14px | `#424654` |
| Card Button | Regular 400 | 12px | `#FFFFFF` |

---

## 6. Component Specifications

### 6.1 Create Class Modal (448×467px)

- **Overlay**: Fixed, full screen, `bg-black/50`, flex center
- **Card**: 448px wide, white bg, border `#C3C6D7`, radius 12px, padding 24px, gap 32px
- **Header**: "Buat Kelas Baru" (Bold 24px) + close button (X icon, `#737686`)
- **Field 1 "Kelas"**: Label 12px + input 48px height, bg `#F3F3FE`, border `#C3C6D7`, radius 8px
- **Field 2 "Nama Mata Pelajaran"**: Same styling, with datalist suggestions
- **Info Banner**: bg `#EFF6FF`, border `#DBEAFE`, radius 8px, padding 16px, gap 16px
- **Buttons**: "Batal" (outlined, border black) + "Buat Kelas" (solid `#003FA3`)

### 6.2 Delete Confirmation Dialog (480×324px)

- **Overlay**: Same as create modal
- **Card**: 480px wide, white bg, border `#F1F5F9`, radius 12px, padding 32px, gap 32px, center aligned
- **Warning Icon**: 64×64 circle, bg `#FFDAD6`, AlertTriangle icon `#BA1A1A`
- **Title**: "Yakin Hapus Kelas Ini ?" (Bold 24px, center)
- **Description**: Warning text (Regular 14px, `#475569`, center)
- **Buttons**: Equal width — "Batal" (outlined `#E2E8F0`) + "Hapus" (solid `#BA1A1A`)

### 6.3 Class Card

- Border `#E1E2ED`, radius 12px, padding 16px
- **Thumbnail**: Auto-generated CSS gradient (128px height, 8px radius) with subject name overlay
- **Title Row**: Class name + Trash icon (red `#FA0909`) + MoreVertical icon (`#737686`)
- **Student Count**: "{n} Students"
- **Avatar Group**: Colored circles with overflow badge
- **CTA Button**: Full width, bg `#003FA3`, "Detail Kelas" + ArrowRight icon

### 6.4 Create Class Card

- bg `#F3F3FE`, border 2px dashed `#C3C6D7`, radius 12px, min-height 249px
- Center: 64×64 blue circle with Plus icon + "Create New Class" text

---

## 7. API Endpoints

| Method | Endpoint | Purpose | Body |
|--------|----------|---------|------|
| `GET` | `/api/classes` | List teacher's classes | — |
| `POST` | `/api/classes` | Create new class | `{ name, subject_id? }` |
| `DELETE` | `/api/classes/:id` | Delete a class | — |
| `GET` | `/api/subjects` | List teacher's subjects | — |
| `POST` | `/api/subjects` | Create new subject | `{ name }` |

### POST /api/classes — Request/Response

**Request:**
```json
{ "name": "X IPA 1", "subject_id": "uuid-of-subject" }
```

**Response (201):**
```json
{
  "ok": true,
  "message": "Class created successfully",
  "data": { "id": "...", "name": "X IPA 1", "subject_id": "...", ... }
}
```

---

## 8. Key Implementation Details

### Auto-generated Thumbnails
- Uses a hash of the class ID to select from 10 predefined gradient pairs
- Subject name displayed as white text overlay with drop shadow
- No database storage needed — purely frontend CSS

### Subject Handling (Create Modal)
- Fetches existing subjects via `GET /api/subjects`
- Shows suggestions via HTML `<datalist>` element
- If typed subject matches existing one (case-insensitive) → uses its ID
- If new subject → creates via `POST /api/subjects` first, then uses returned ID
- Links subject to class via `subject_id` column

### Delete Flow
- Trash icon on card → opens confirmation dialog
- Dialog shows warning icon + destructive message
- "Hapus" button calls `DELETE /api/classes/:id`
- On success → invalidates query cache → list refreshes
- Backend handles cascade (removes students first if needed, or returns 409 error)

### State Management
- TanStack React Query for server state (classes list, subjects)
- `useState` for modal/dialog visibility
- Query invalidation on mutations for automatic refresh

---

## 9. Interactions & States

| Element | Interaction | Behavior |
|---|---|---|
| "+" Card | Hover | Border darkens, scale(1.02) |
| "+" Card | Click | Opens create modal |
| Modal Overlay | Click outside | Closes modal |
| Escape key | Press | Closes modal/dialog |
| "Batal" | Click | Closes without saving |
| "Buat Kelas" | Click | Validates → creates → closes |
| "Buat Kelas" | Loading | Shows spinner, disabled |
| Form inputs | Focus | Border → `#003FA3` |
| Form inputs | Error | Red border + error text |
| Trash icon | Click | Opens delete dialog |
| "Hapus" | Click | Deletes → closes |
| Class Card | Hover | Shadow elevation |

---

## 10. Dependencies

All already installed — no new packages needed:

- `next` 15.5.15, `react` 19.1.0
- `@tanstack/react-query` 5.x
- `react-hook-form` 7.x + `@hookform/resolvers` 5.x
- `zod` 4.x
- `lucide-react`
- `tailwindcss` 4.x

---

## 11. How to Test

1. Ensure the database migration has been run
2. Start backend: `cd backend && npm run dev`
3. Start frontend: `cd frontend && npm run dev`
4. Login as a teacher at `/guru/login`
5. Navigate to `/guru/classes`
6. Click "+" card → fill form → submit
7. Verify new class appears in the grid
8. Click trash icon → confirm delete → verify class removed
