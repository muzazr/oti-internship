# WhatsApp Bot Notification - Assignment Creation

## Overview

Implementasi fitur **notifikasi WhatsApp otomatis ke siswa** saat guru membuat tugas baru. Siswa yang terdaftar di kelas tersebut dan memiliki nomor WhatsApp akan menerima notifikasi berisi detail tugas + link upload unik.

---

## Table of Contents

1. [Architecture & Flow](#1-architecture--flow)
2. [Database Changes](#2-database-changes)
3. [Backend Changes](#3-backend-changes)
4. [Frontend Changes](#4-frontend-changes)
5. [Message Format](#5-message-format)
6. [OpenAPI Spec Update](#6-openapi-spec-update)
7. [Environment Variables](#7-environment-variables)
8. [Setup Instructions](#8-setup-instructions)

---

## 1. Architecture & Flow

```
[Guru]
  |
  +-- 1. Buat tugas + centang checkbox "Kirim notif WA"
  |
[Frontend]
  |
  +-- 2. INSERT assignment ke Supabase (existing flow)
  +-- 3. POST /api/whatsapp/notify-assignment/:assignmentId
  |      Body: { class_ids: ["uuid1"] }
  |      Header: Authorization: Bearer <token>
  |
[Backend]
  |
  +-- 4. Verify assignment ownership (teacher_id match)
  +-- 5. Get all students in target classes with whatsapp_number
  +-- 6. For each student:
  |      +-- Generate unique upload link (upload-links module)
  |      +-- Send WA message via Meta Graph API
  |
  +-- 7. If guru.whatsapp_notifications = true:
  |      +-- Send summary to guru's phone_number
  |
  +-- 8. Return { sent: N, failed: M, total: T }
```

### Key Decisions

| Aspek | Keputusan |
|-------|-----------|
| Trigger | Saat guru buat tugas + centang checkbox WA |
| Arsitektur | Frontend tetap insert ke Supabase, lalu panggil endpoint backend `/notify-assignment/:id` |
| Pengiriman | Async dari sisi frontend (fire-and-forget), backend proses sequentially |
| Link upload | Unique per siswa (pakai `upload-links` module yang sudah ada) |
| Notif ke guru | Jika `whatsapp_notifications=true` di profiles, kirim ringkasan ke `phone_number` guru |
| Nomor WA guru | Pakai kolom `phone_number` yang sudah ada di tabel `profiles` |

---

## 2. Database Changes

Kolom `phone_number` sudah ada di tabel `profiles`. Tidak perlu migration baru.

Pastikan kolom ini bisa diupdate dari settings page (RLS policy "Users can update own profile" sudah ada).

---

## 3. Backend Changes

### 3.1 `backend/src/modules/whatsapp/whatsapp.service.js`

Tambah 3 fungsi baru:
- `notifyStudentsNewAssignment(assignmentId, classIds, teacherId)` - orchestrator
- `formatAssignmentNotification(assignment, student, uploadUrl)` - format pesan siswa
- `sendTeacherSummary(teacherId, assignmentTitle, sent, failed, total)` - notif ke guru

### 3.2 `backend/src/modules/whatsapp/whatsapp.controller.js`

Tambah handler `sendAssignmentNotification` yang:
- Validate `class_ids` dari body
- Verify teacher owns the assignment
- Call `notifyStudentsNewAssignment()`
- Return result

### 3.3 `backend/src/modules/whatsapp/whatsapp.routes.js`

Tambah route:
```
POST /notify-assignment/:assignmentId  [requireAuth]
```

---

## 4. Frontend Changes

### 4.1 `frontend/src/lib/api/whatsapp.ts`

Rewrite: ganti placeholder dengan actual API call ke backend endpoint.

### 4.2 `frontend/.../create-assignment-modal.tsx`

Ubah call dari `sendAssignmentNotification(students, title, className, deadline)` menjadi `sendAssignmentNotification(assignmentId, classIds)`.

### 4.3 `frontend/.../settings/page.tsx`

Tambah input field "Nomor WhatsApp" di section Notifications.

### 4.4 `frontend/src/lib/api/settings.ts`

Tambah `phone_number` ke `ProfileData` interface dan select query.

---

## 5. Message Format

### Pesan ke Siswa

```
📚 *Tugas Baru!*

📝 *Judul:* Analisis Vektor Bagian 1
📖 *Mapel:* Matematika
📋 *Deskripsi:* Kerjakan soal analisis vektor halaman 45-50...
⏰ *Deadline:* 15 Juni 2026, 23:59

🔗 *Upload tugas:* https://mitbridge.com/upload/abc123def456...

_Link berlaku 1 jam. Balas 1 untuk kirim tugas._
```

### Pesan ke Guru (ringkasan)

```
✅ *Notifikasi Tugas Terkirim*

📝 Tugas: "Analisis Vektor Bagian 1"
📤 Terkirim: 25/30 siswa
❌ Gagal: 2 siswa

_Siswa yang belum punya nomor WA tidak akan menerima notifikasi._
```

---

## 6. OpenAPI Spec Update

Endpoint baru ditambahkan ke `backend/docs/openapi.yaml`:

```
POST /api/whatsapp/notify-assignment/{assignmentId}
```

- Auth: Bearer token (required)
- Body: `{ class_ids: string[] }`
- Response: `{ ok: true, data: { sent, failed, total } }`

---

## 7. Environment Variables

### Backend (`backend/.env`)

```env
WHATSAPP_ACCESS_TOKEN=your_meta_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
META_GRAPH_API_VERSION=v25.0
FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## 8. File Changes Summary

| # | File | Action |
|---|------|--------|
| 1 | `backend/src/modules/whatsapp/whatsapp.service.js` | EDIT |
| 2 | `backend/src/modules/whatsapp/whatsapp.controller.js` | EDIT |
| 3 | `backend/src/modules/whatsapp/whatsapp.routes.js` | EDIT |
| 4 | `frontend/src/lib/api/whatsapp.ts` | REWRITE |
| 5 | `frontend/src/components/guru/dashboard/classes/detail/tugas/create-assignment-modal.tsx` | EDIT |
| 6 | `frontend/src/app/guru/(dashboard)/settings/page.tsx` | EDIT |
| 7 | `frontend/src/lib/api/settings.ts` | EDIT |
| 8 | `backend/docs/openapi.yaml` | EDIT |
