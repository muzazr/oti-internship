# Settings & Notifications Implementation

## Overview

Implementasi lengkap fitur **Settings Page**, **Navbar Functionality**, **Notification System**, dan **Sidebar Logout** untuk MitBridge Educator Portal.

---

## Table of Contents

1. [Database Changes](#1-database-changes)
2. [Navbar (Header)](#2-navbar-header)
3. [Settings Page](#3-settings-page)
4. [Notification System](#4-notification-system)
5. [Sidebar & Logout](#5-sidebar--logout)
6. [File Structure](#6-file-structure)
7. [Setup Instructions](#7-setup-instructions)
8. [API Reference](#8-api-reference)

---

## 1. Database Changes

### Migration File

`backend/migrations/001_settings_notifications.sql`

Jalankan di **Supabase SQL Editor** (Dashboard > SQL Editor > New Query).

### Profiles Table - New Columns

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `first_name` | text | null | Nama depan user |
| `last_name` | text | null | Nama belakang user |
| `email` | text | null | Email display (dari Supabase Auth) |
| `avatar_url` | text | null | URL foto profil di Supabase Storage |
| `web_notifications` | boolean | true | Toggle notifikasi web app |
| `whatsapp_notifications` | boolean | false | Toggle notifikasi WhatsApp |

**Backward Compatibility:** Kolom `full_name` tetap ada dan di-update otomatis saat user save profile (`full_name = first_name + " " + last_name`). Semua kode lama yang menggunakan `full_name` tetap berfungsi.

### Notifications Table (New)

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | uuid (PK) | gen_random_uuid() | Primary key |
| `user_id` | uuid (FK -> profiles.id) | - | Penerima notifikasi |
| `title` | text | - | Judul notifikasi |
| `type` | text | 'system' | Tipe: submission, class, assignment, system |
| `is_read` | boolean | false | Status sudah dibaca |
| `metadata` | jsonb | '{}' | Data tambahan (class_id, assignment_id, dll) |
| `created_at` | timestamptz | now() | Waktu dibuat |

**Indexes:**
- `idx_notifications_user_id` - Fast lookup by user
- `idx_notifications_user_unread` - Partial index for unread notifications
- `idx_notifications_created_at` - Sort by newest

**RLS Policies:**
- Users can SELECT own notifications
- Users can UPDATE own notifications (mark as read)
- Users can DELETE own notifications
- Authenticated users can INSERT notifications

### Storage Bucket: `avatars`

- Public bucket untuk foto profil
- Max file size: 5MB
- Allowed types: JPEG, PNG, GIF, WebP
- Path format: `{user_id}/avatar-{timestamp}.{ext}`
- RLS: Users can upload/update/delete own avatar, anyone can view

---

## 2. Navbar (Header)

### File: `frontend/src/components/guru/dashboard/header.tsx`

### Features

| Icon | Action | Description |
|------|--------|-------------|
| Search | Form submit | Search bar per-page dengan placeholder dinamis |
| Bell (Notifications) | Click toggle | Buka/tutup notification dropdown panel |
| HelpCircle (Bantuan) | Click | Buka WhatsApp tim teknis: `wa.me/62895397306279` |
| Settings (Pengaturan) | Click | Navigate ke `/guru/settings` |
| User Profile | Display | Nama + role + avatar dari database (dinamis) |

### Props

```typescript
interface HeaderProps {
  userName?: string;       // Nama user dari profile
  userRole?: string;       // Role user
  avatarUrl?: string;      // URL avatar dari Supabase Storage
  searchPlaceholder?: string; // Custom placeholder
  unreadCount?: number;    // Jumlah notifikasi belum dibaca
  onMenuClick?: () => void; // Toggle sidebar mobile
  onSearch?: (query: string) => void; // Search callback
}
```

### Search Placeholders per Page

| Route | Placeholder |
|-------|-------------|
| `/guru/dashboard` | "Cari siswa atau tugas..." |
| `/guru/classes` | "Cari kelas..." |
| `/guru/submissions` | "Cari submission..." |
| `/guru/analytics` | "Cari data analytics..." |
| `/guru/settings` | "Cari pengaturan..." |

### Notification Badge

- Menampilkan jumlah unread notifications (angka)
- Jika > 9, tampilkan "9+"
- Badge merah di pojok kanan atas icon Bell
- Real-time update via Supabase Realtime subscription

---

## 3. Settings Page

### Route: `/guru/settings`

### File: `frontend/src/app/guru/(dashboard)/settings/page.tsx`

### Layout

```
┌─────────────────────────────────────────────────────────┐
│ Settings                                                 │
│ Manage your account preferences and personal information.│
├──────────────────────────────┬──────────────────────────┤
│ Profile Information          │ Notifications             │
│ ┌──────────────────────────┐ │ ┌──────────────────────┐ │
│ │ [Avatar] Change Avatar   │ │ │ Web App Notifications│ │
│ │ JPG, GIF or PNG. 2MB max │ │ │ [Toggle ON/OFF]      │ │
│ │                          │ │ │                      │ │
│ │ First Name  │ Last Name  │ │ │ WhatsApp Notif       │ │
│ │ [________]  │ [________] │ │ │ [Toggle ON/OFF]      │ │
│ │                          │ │ │                      │ │
│ │ Email Address            │ │ └──────────────────────┘ │
│ │ [________] (disabled)    │ │                          │
│ │                          │ │                          │
│ │         [Save Changes]   │ │                          │
│ └──────────────────────────┘ │                          │
│                              │                          │
│ Security                     │                          │
│ ┌──────────────────────────┐ │                          │
│ │ Current Password         │ │                          │
│ │ [________]               │ │                          │
│ │ New Password             │ │                          │
│ │ [________]               │ │                          │
│ │ Confirm New Password     │ │                          │
│ │ [________]               │ │                          │
│ │                          │ │                          │
│ │ [Update Password]        │ │                          │
│ └──────────────────────────┘ │                          │
└──────────────────────────────┴──────────────────────────┘
```

### Profile Information Section

- **Avatar**: Foto profil bulat 80px, tombol "Change Avatar", upload ke Supabase Storage bucket `avatars`
- **First Name**: Input text, required
- **Last Name**: Input text, optional
- **Email Address**: Input disabled (read-only, dari Supabase Auth)
- **Save Changes**: Button biru, simpan ke `profiles` table, update `first_name`, `last_name`, `full_name`
- **Success**: Modal "Profile Information Berhasil Disimpan" dengan tombol "Kembali Ke Dashboard"

### Security Section

- **Current Password**: Input password dengan toggle show/hide
- **New Password**: Input password, minimal 6 karakter
- **Confirm New Password**: Input password, harus sama dengan New Password
- **Update Password**: Button outlined, verifikasi current password dulu via re-authentication, lalu update via `supabase.auth.updateUser()`
- **Success**: Modal "Password Berhasil di Update" dengan tombol "Kembali Ke Dashboard"

### Notifications Section (Right Sidebar)

- **Web App Notifications**: Toggle switch, default ON
  - "Notifications within the browser dashboard"
- **WhatsApp Notifications**: Toggle switch, default OFF
  - Icon WhatsApp hijau
  - "Instant Updates"
  - Description: "Enable WhatsApp notifications to receive real-time class schedule changes and urgent grading reminders directly to your mobile device."

### Success Modals

**File:** `frontend/src/components/guru/settings/success-modal.tsx`

Sesuai Figma design (328-927 dan 328-1189):
- Overlay semi-transparent
- Card putih, rounded-xl, centered
- Green check circle icon (64px)
- Title bold 24px
- Button "Kembali Ke Dashboard" (biru, rounded-xl)

---

## 4. Notification System

### Notification Panel (Dropdown)

**File:** `frontend/src/components/guru/dashboard/notification-panel.tsx`

Sesuai Figma design (328-1365):
- Dropdown dari Bell icon di navbar
- Header: Bell icon + "Notifications" + Close (X) button
- List notifikasi dengan:
  - Icon biru (FileText) dalam circle
  - Title text
  - Clock icon + relative time
- Footer: "Mark all as read" link
- Empty state: Bell icon + "Belum ada notifikasi"

### Notification Triggers

| Event | Location | Notification Title | Type |
|-------|----------|-------------------|------|
| Buat kelas baru | `frontend/src/lib/api/classes.ts` | `Kelas baru "{name}" berhasil dibuat` | class |
| Buat tugas baru | `frontend/src/lib/api/assignments.ts` | `Tugas baru "{title}" berhasil dibuat` | assignment |
| Siswa submit tugas | `backend/src/modules/submissions/submissions.controller.js` | `New submission for {assignment_title}` | submission |

### API Functions

**File:** `frontend/src/lib/api/notifications.ts`

| Function | Description |
|----------|-------------|
| `fetchNotifications(limit)` | Ambil notifikasi user, sorted by newest |
| `getUnreadCount()` | Hitung notifikasi belum dibaca |
| `markAllAsRead()` | Tandai semua sebagai sudah dibaca |
| `createNotification(userId, title, type, metadata)` | Buat notifikasi baru |
| `formatRelativeTime(dateString)` | Format waktu relatif (e.g., "2 menit yang lalu") |

### Real-time Updates

Dashboard layout (`layout.tsx`) subscribe ke Supabase Realtime channel `notifications-count`:
- Listen `INSERT` event pada table `notifications`
- Auto-increment badge count saat notifikasi baru masuk
- Tanpa perlu refresh halaman

---

## 5. Sidebar & Logout

### File: `frontend/src/components/guru/dashboard/sidebar.tsx`

**Status: Sudah berfungsi dengan benar.**

### Logout Flow

1. User klik tombol "Logout" di sidebar
2. `supabase.auth.signOut()` dipanggil - session dihapus
3. Redirect ke `/guru/login`
4. Data profile di database **TETAP ADA** (tidak dihapus)
5. User bisa login lagi dengan email + password yang sama tanpa register ulang

### Navigation Items

| Label | Route | Icon |
|-------|-------|------|
| Dashboard | `/guru/dashboard` | LayoutDashboard |
| Classes | `/guru/classes` | School |
| Submissions | `/guru/submissions` | ClipboardList |
| Analytics | `/guru/analytics` | BarChart3 |

---

## 6. File Structure

### New Files Created

```
backend/
  migrations/
    001_settings_notifications.sql    # SQL migration

frontend/src/
  lib/api/
    settings.ts                       # Settings API functions
    notifications.ts                  # Notifications API functions
  components/guru/
    settings/
      success-modal.tsx               # Reusable success modal
    dashboard/
      notification-panel.tsx          # Notification dropdown panel
  app/guru/(dashboard)/
    settings/
      page.tsx                        # Settings page
```

### Modified Files

```
frontend/src/
  components/guru/dashboard/
    header.tsx                        # Added onClick handlers, dynamic data
  app/guru/(dashboard)/
    layout.tsx                        # Fetch user profile, pass to Header
  lib/api/
    classes.ts                        # Added notification trigger
    assignments.ts                    # Added notification trigger

backend/src/modules/
  submissions/
    submissions.controller.js         # Added notification trigger on submit
```

---

## 7. Setup Instructions

### Step 1: Run SQL Migration

1. Buka Supabase Dashboard
2. Go to **SQL Editor** > **New Query**
3. Copy-paste isi file `backend/migrations/001_settings_notifications.sql`
4. Klik **Run**
5. Verify: cek table `notifications` sudah ada, dan `profiles` punya kolom baru

### Step 2: Create Avatars Storage Bucket (if migration fails for storage)

Jika bagian storage bucket gagal di migration:
1. Go to **Storage** di Supabase Dashboard
2. Klik **New Bucket**
3. Name: `avatars`
4. Public: **Yes**
5. File size limit: 5MB
6. Allowed MIME types: `image/jpeg, image/png, image/gif, image/webp`

### Step 3: Verify

1. Start frontend: `npm run dev` (di folder `frontend/`)
2. Start backend: `npm run dev` (di folder `backend/`)
3. Login sebagai guru
4. Cek navbar: Bell, Help, Settings icons berfungsi
5. Klik Settings icon -> masuk ke halaman Settings
6. Test save profile, update password, toggle notifications
7. Buat kelas/tugas baru -> cek notifikasi muncul di Bell icon

---

## 8. API Reference

### Settings API (`frontend/src/lib/api/settings.ts`)

#### `fetchProfile(): Promise<ProfileData>`
Fetch profile data untuk settings page. Includes first_name, last_name, email, avatar_url, notification preferences.

#### `updateProfile(payload: UpdateProfilePayload): Promise<ProfileData>`
Update first_name, last_name. Auto-updates full_name for backward compatibility.

#### `updateNotificationSettings(payload: UpdateNotificationPayload): Promise<void>`
Toggle web_notifications dan/atau whatsapp_notifications.

#### `uploadAvatar(file: File): Promise<string>`
Upload avatar ke Supabase Storage. Returns public URL. Auto-deletes old avatar.

#### `updatePassword(currentPassword: string, newPassword: string): Promise<void>`
Verify current password via re-authentication, then update to new password.

### Notifications API (`frontend/src/lib/api/notifications.ts`)

#### `fetchNotifications(limit?: number): Promise<Notification[]>`
Fetch user's notifications, sorted by newest first.

#### `getUnreadCount(): Promise<number>`
Count unread notifications.

#### `markAllAsRead(): Promise<void>`
Mark all user's notifications as read.

#### `createNotification(userId, title, type, metadata?): Promise<void>`
Create a new notification. Non-blocking (won't throw on failure).

#### `formatRelativeTime(dateString: string): string`
Format timestamp to relative time string in Indonesian.

---

## Design References (Figma)

| Page | Figma Node | Description |
|------|-----------|-------------|
| Settings | 328-917 | Main settings page layout |
| Save Changes Success | 328-927 | Profile saved modal |
| Password Update Success | 328-1189 | Password updated modal |
| Notifications Panel | 328-1365 | Notification dropdown from Bell icon |
