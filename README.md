# MitBridge Educator Portal🎓

Platform manajemen tugas untuk guru dan siswa dengan integrasi WhatsApp Bot dan AI untuk validasi foto tugas.

Link Deploy Guru (With ngrok) : https://agility-steep-aviator.ngrok-free.dev/guru/login
Untuk link unik siswa dapat diakses melalui bot WA , Jangan Lupa untuk Memberi Salam/Greetings Terlebih dahulu ketika pertama kali mengirim pesan kepada siswa 
Mitbridge Education Bot (Nomor Telp.) : +62 851-4178-3908

Figjam UX-Research : https://www.figma.com/board/GGUNTTKxBitwtZimQcti2E/Figjam-Internship-OmahTI-UGM--Rsearch-?node-id=0-1&t=TLkzavhDZ6wKgGFd-1
Figma UI-Design : https://www.figma.com/design/j7zuZYKvmzdB2axojslld6/Figma-Internship-OmahTI-UGM--Design-?node-id=3-3&t=8KR49r4YvPKyFNB5-1

---


## Our Team 

1. Renata (Project Manager)
2. Gauza (UX Engineer dan Frontend)
3. Yusmin (UI Designer)
4. Zaki Azhar (Backend)
5. Ruchita (Frontend)
6. Gradien (AI Engineer)


## Daftar Isi

1. [Arsitektur Sistem](#arsitektur-sistem)
2. [Fitur Utama](#fitur-utama)
3. [Tech Stack](#tech-stack)
4. [Instalasi & Setup](#instalasi--setup)
5. [Menjalankan Aplikasi](#menjalankan-aplikasi)
6. [Routing Backend (API)](#routing-backend-api)
7. [Routing Frontend](#routing-frontend)
8. [Integrasi WhatsApp Bot](#integrasi-whatsapp-bot)
9. [Integrasi AI](#integrasi-ai)
10. [Ngrok & HTTPS](#ngrok--https)
11. [Database Schema](#database-schema)
12. [Environment Variables](#environment-variables)
13. [Alur Program](#alur-program)

---

## Arsitektur Sistem

```
                                    +-----------------+
                                    |   Meta WhatsApp  |
                                    |   Business API   |
                                    +--------+--------+
                                             |
                                             | Webhook (HTTPS)
                                             |
+----------+     +-------+     +-------------+-------------+     +-----------+
|  Browser |---->| Nginx |---->|        Backend (Express)   |---->| Supabase  |
| (Siswa/  |     | :80   |     |          :4000             |     | (DB +     |
|  Guru)   |     +-------+     |                            |     |  Storage) |
+----------+         |         |  /api/whatsapp/webhook     |     +-----------+
                     |         |  /api/assignments          |
                     |         |  /api/submissions          |          |
                     |         |  /api/ai/crop -------------|-----> HuggingFace
                     |         |  /api/dashboard/stats      |      (AI Inference)
                     |         +----------------------------+
                     |
                     +-------> Frontend (Next.js) :3000
                               /guru/*  (Dashboard Guru)
                               /upload/[token]  (Halaman Siswa)
```

---

## Fitur Utama

### Guru (Dashboard)

| Fitur | Deskripsi |
|-------|-----------|
| **Dashboard** | Ringkasan statistik: total siswa, tugas aktif, submission terbaru, tren pengumpulan mingguan |
| **Manajemen Kelas** | CRUD kelas, tambah/hapus siswa, assign mata pelajaran |
| **Manajemen Tugas** | Buat tugas baru, set deadline, lampiran tugas (link), assign ke kelas |
| **Notifikasi WA** | Kirim notifikasi tugas baru ke semua siswa via WhatsApp Bot saat buat tugas |
| **Submissions** | Lihat daftar submission per tugas, preview foto siswa (PDF-like stacked viewer) |
| **Grading** | Beri nilai (score 0-100), feedback, kirim nilai via WA Bot |
| **Analytics** | Grafik partisipasi per tugas, rekap individu siswa, rata-rata nilai |
| **Reports** | Export rekap tugas ke CSV |
| **Settings** | Update profil, password, nomor WA guru, toggle notifikasi |

### Siswa (via Link Unik)

| Fitur | Deskripsi |
|-------|-----------|
| **Landing Page** | Halaman personalized (nama, tugas, kelas, deadline, status) |
| **Detail Tugas** | Instruksi tugas, lampiran tugas (link clickable) |
| **Konfirmasi Data** | Verifikasi data siswa sebelum submit (nama, kelas, mapel, tugas) |
| **Upload Foto** | Ambil foto tugas via kamera HP, AI validasi otomatis |
| **AI Validation** | Foto di-scan AI untuk cek keterbacaan, auto-crop dokumen |
| **Notifikasi** | Bell icon dengan badge jumlah tugas belum dikerjakan |
| **WiFi Checker** | Cek kecepatan koneksi internet real-time |

### WhatsApp Bot

| Fitur | Deskripsi |
|-------|-----------|
| **Menu Utama** | Greeting personalized + 3 opsi menu |
| **1. Kumpulkan Tugas** | List tugas belum dikumpulkan + generate link upload unik |
| **2. Status Tugas** | Ringkasan semua tugas + status + nilai + link pengumpulan |
| **3. Profil Saya** | Tampilkan nama, kelas, nomor WA |
| **Notifikasi Tugas Baru** | Auto-kirim ke siswa saat guru buat tugas (dengan link upload) |
| **Notifikasi Guru** | Ringkasan pengiriman notif ke WA guru (jika diaktifkan di settings) |
| **Belum Terdaftar** | Pesan "hubungi guru" untuk nomor yang belum terdaftar |

---

## Tech Stack

### Backend

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| Node.js | 22.x | Runtime |
| Express | 5.x | Web framework |
| Supabase JS | 2.x | Database client (PostgreSQL + Storage + Auth) |
| Axios | 1.x | HTTP client (WhatsApp API, AI API) |
| Multer | 2.x | File upload handling |
| Zod | 4.x | Request validation |
| Helmet | 8.x | Security headers |
| Morgan | 1.x | HTTP logging |
| Swagger | 6.x | API documentation |

### Frontend

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| Next.js | 15.5 | React framework (App Router, Turbopack) |
| React | 19.x | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Styling |
| Framer Motion | 12.x | Animasi (success/fail pages) |
| Tanstack Query | 5.x | Data fetching & caching |
| Lucide React | 1.x | Icons |
| Recharts | 3.x | Charts (analytics) |
| Radix UI | - | Accessible UI primitives |
| Supabase JS | 2.x | Auth & direct DB queries |

### External Services

| Service | Fungsi |
|---------|--------|
| **Supabase** | PostgreSQL database, Auth, Storage (file upload) |
| **Meta WhatsApp Business API** | Kirim/terima pesan WhatsApp |
| **HuggingFace (Gradio)** | AI inference untuk validasi foto tugas |
| **Ngrok** | HTTPS tunnel untuk webhook WhatsApp & camera API |

---

## Instalasi & Setup

### Prerequisites

- Node.js >= 18.x
- npm >= 9.x
- Akun Supabase (https://supabase.com)
- Akun Meta Developer (https://developers.facebook.com) - untuk WhatsApp Bot
- Akun Ngrok (https://ngrok.com) - untuk HTTPS tunnel

### 1. Clone Repository

```bash
git clone <repository-url>
cd oti-internship
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Buat file `.env`:

```env
PORT=4000

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# WhatsApp Meta API
WHATSAPP_VERIFY_TOKEN=tugasbot_verify_123
WHATSAPP_ACCESS_TOKEN=your-meta-access-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_BUSINESS_ACCOUNT_ID=your-waba-id
META_GRAPH_API_VERSION=v25.0

# Frontend URL (untuk generate upload links)
FRONTEND_URL=http://localhost:3000
```

### 3. Setup Frontend

```bash
cd frontend
Pnpm install
```

Buat file `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### 4. Setup Database (Supabase)

Jalankan migration di Supabase SQL Editor:

```bash
# File migration:
backend/migrations/001_settings_notifications.sql
```

### 5. Setup Ngrok (untuk WhatsApp Webhook & HTTPS)

```bash
# Install ngrok
curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok-v3-stable-linux-amd64.tgz | tar xz -C /usr/local/bin

# Setup auth token
ngrok config add-authtoken YOUR_NGROK_AUTH_TOKEN
```

---

## Menjalankan Aplikasi

### Development (Local)

**Terminal 1 - Backend:**
```bash
cd backend
node server.js
# atau dengan nodemon:
npx nodemon server.js
```

**Terminal 2 - Frontend:**
```bash
cd frontend
pnpm run dev
```

**Terminal 3 - Ngrok (untuk WhatsApp webhook):**
```bash
ngrok http 4000
# Catat HTTPS URL, lalu update webhook di Meta Dashboard
```

### Production (Server)

```bash
# Backend sebagai systemd service
sudo systemctl start mitbridge-backend
sudo systemctl enable mitbridge-backend

# Frontend sebagai systemd service
sudo systemctl start mitbridge-frontend
sudo systemctl enable mitbridge-frontend

# Nginx reverse proxy
sudo systemctl start nginx

# Ngrok tunnel (untuk HTTPS)
nohup ngrok http 80 > /tmp/ngrok.log 2>&1 &
```

### Atau pakai script:

```bash
chmod +x start.sh
./start.sh
```

### Cek Status:

```bash
# Backend
curl http://localhost:4000/health

# Frontend
curl http://localhost:3000

# Ngrok
curl http://localhost:4040/api/tunnels
```

---

## Routing Backend (API)

Semua endpoint di-prefix dengan `/api`. Swagger docs tersedia di `/docs`.

### Auth (`/api/auth`)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|:----:|-----------|
| POST | `/auth/login` | - | Login guru |
| POST | `/auth/register` | - | Register guru baru |
| POST | `/auth/register-profile` | - | Buat profil guru |
| GET | `/auth/me` | Ya | Get current user |

### Classes (`/api/classes`)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|:----:|-----------|
| GET | `/classes` | Ya | List semua kelas guru |
| POST | `/classes` | Ya | Buat kelas baru |
| GET | `/classes/:id` | Ya | Detail kelas |
| PATCH | `/classes/:id` | Ya | Update kelas |
| DELETE | `/classes/:id` | Ya | Hapus kelas |

### Students (`/api/students`)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|:----:|-----------|
| GET | `/students?class_id=xxx` | Ya | List siswa di kelas |
| POST | `/students` | Ya | Tambah siswa |
| GET | `/students/:id` | Ya | Detail siswa |
| PATCH | `/students/:id` | Ya | Update siswa |
| DELETE | `/students/:id` | Ya | Hapus siswa |

### Subjects (`/api/subjects`)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|:----:|-----------|
| GET | `/subjects` | Ya | List mata pelajaran |
| POST | `/subjects` | Ya | Buat mapel baru |
| PATCH | `/subjects/:id` | Ya | Update mapel |
| DELETE | `/subjects/:id` | Ya | Hapus mapel |

### Assignments (`/api/assignments`)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|:----:|-----------|
| GET | `/assignments` | Ya | List semua tugas |
| POST | `/assignments` | Ya | Buat tugas baru |
| GET | `/assignments/:id` | Ya | Detail tugas |
| PATCH | `/assignments/:id` | Ya | Update tugas |
| DELETE | `/assignments/:id` | Ya | Hapus tugas |
| POST | `/assignments/:id/publish` | Ya | Publish tugas (draft -> published) |

### Upload Links (`/api/upload-links`)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|:----:|-----------|
| POST | `/upload-links` | Ya | Generate upload links (guru) |
| GET | `/upload-links/:token` | - | Validate token + get data (siswa) |
| POST | `/upload-links/:token/access` | - | Record page access |
| GET | `/upload-links/:token/pending` | - | Get tugas belum dikerjakan (untuk notif bell) |

### Submissions (`/api/submissions`)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|:----:|-----------|
| GET | `/submissions?assignment_id=xxx` | Ya | List submissions per tugas |
| POST | `/submissions/:token` | - | Submit tugas (multipart, max 20 files) |
| GET | `/submissions/:id` | Ya | Detail submission + signed URLs |
| PATCH | `/submissions/:id/grade` | Ya | Beri nilai + feedback |

### WhatsApp (`/api/whatsapp`)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|:----:|-----------|
| GET | `/whatsapp/webhook` | - | Meta webhook verification |
| POST | `/whatsapp/webhook` | - | Terima pesan masuk dari WhatsApp |
| POST | `/whatsapp/notify-assignment/:id` | Ya | Kirim notifikasi tugas ke siswa |

### Dashboard (`/api/dashboard`)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|:----:|-----------|
| GET | `/dashboard/stats` | Ya | Statistik dashboard (students, assignments, submissions, trend) |

### Reports (`/api/reports`)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|:----:|-----------|
| GET | `/reports/assignments/:id/recap` | Ya | Rekap tugas |
| GET | `/reports/assignments/:id/export.csv` | Ya | Export CSV |

### AI (`/api/ai`)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|:----:|-----------|
| POST | `/ai/crop` | - | Validasi + crop foto tugas via AI |

---

## Routing Frontend

### Guru (`/guru/*`)

| Route | Deskripsi |
|-------|-----------|
| `/guru/login` | Halaman login guru |
| `/guru/register` | Halaman registrasi guru |
| `/guru/dashboard` | Dashboard utama (statistik, chart, recent submissions) |
| `/guru/classes` | Daftar kelas |
| `/guru/classes/[id]` | Detail kelas (tab: Tugas, People) |
| `/guru/submissions` | Daftar submissions per kelas/tugas |
| `/guru/submissions/[id]/preview` | Preview foto submission siswa (PDF-like viewer) |
| `/guru/analytics` | Analytics & reports (grafik, rekap siswa) |
| `/guru/settings` | Pengaturan profil, password, nomor WA, notifikasi |

### Siswa (`/upload/[token]/*`)

| Route | Deskripsi |
|-------|-----------|
| `/upload/[token]` | Landing page siswa (personalized) |
| `/upload/[token]/detail` | Detail tugas (instruksi, lampiran) |
| `/upload/[token]/confirm` | Konfirmasi data siswa (Langkah 1/3) |
| `/upload/[token]/submit` | Upload foto tugas + camera + AI (Langkah 2/3 & 3/3) |

### Lainnya

| Route | Deskripsi |
|-------|-----------|
| `/privacy` | Kebijakan privasi |
| `/terms` | Syarat & ketentuan |
| `/student` | Landing page siswa (legacy) |

---

## Integrasi WhatsApp Bot

### Arsitektur

```
Siswa chat ke +62 851-4178-3908
        |
        v
Meta WhatsApp Cloud API
        |
        | POST /api/whatsapp/webhook
        v
Backend (whatsapp.service.js)
        |
        +-- Cek nomor WA di database
        |   |
        |   +-- Belum terdaftar: "Hubungi guru untuk didaftarkan"
        |   +-- Sudah terdaftar: Tampilkan menu
        |
        +-- Menu:
            1. Kumpulkan Tugas -> List tugas -> Pilih -> Generate link upload
            2. Status Tugas -> Semua tugas + status + nilai + link
            3. Profil Saya -> Nama, kelas, nomor WA
```

### Notifikasi Tugas Baru (Guru -> Siswa)

```
Guru buat tugas + centang "Kirim notifikasi WA"
        |
        v
Frontend: POST /api/whatsapp/notify-assignment/:assignmentId
        |
        v
Backend:
  1. Fetch assignment details
  2. Fetch semua siswa di kelas yang punya nomor WA
  3. Generate upload link unik per siswa
  4. Kirim pesan WA ke setiap siswa (dengan emoji + link)
  5. Kirim ringkasan ke guru (jika whatsapp_notifications aktif)
```

### Format Pesan ke Siswa

```
📚 Tugas Baru!

📝 Judul: [Nama Tugas]
📖 Mapel: [Mata Pelajaran]
📋 Deskripsi: [Deskripsi singkat]
📎 Lampiran Tugas: [Link lampiran]
⏰ Deadline: [Tanggal]

🔗 Upload tugas: [Link unik per siswa]

Link berlaku 30 menit. Jika link tidak dapat diakses, ketik 1 untuk mendapatkan link baru.
```

### Setup WhatsApp Bot

1. Buat app di [Meta Developer Dashboard](https://developers.facebook.com)
2. Tambahkan WhatsApp product
3. Setup webhook URL: `https://your-ngrok-url/api/whatsapp/webhook`
4. Verify token: `tugasbot_verify_123`
5. Subscribe ke `messages` event
6. Dapatkan `WHATSAPP_ACCESS_TOKEN` dan `WHATSAPP_PHONE_NUMBER_ID`
7. Isi di `backend/.env`

### Register Webhook (via API)

```bash
curl -X POST "https://graph.facebook.com/v25.0/YOUR_WABA_ID/subscribed_apps" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d "override_callback_uri=https://your-ngrok-url/api/whatsapp/webhook" \
  -d "verify_token=tugasbot_verify_123"
```

---

## Integrasi AI

### Arsitektur

```
Siswa ambil foto tugas (kamera HP)
        |
        v
Frontend: POST /api/ai/crop (multipart: field "image")
        |
        v
Backend (ai.service.js):
  - Forward ke HuggingFace: POST https://gradienr-mitbridge.hf.space/scan
  - Field name: "file" (bukan "image")
        |
        v
AI Inference Service (HuggingFace Gradio):
  1. Deteksi dokumen dalam foto
  2. Cek keterbacaan (readability)
  3. Auto-crop & enhance (CLAHE)
        |
        v
Response:
  - VALID: HTTP 200, Content-Type: image/jpeg (foto cropped)
    Headers: X-Detected: true, X-Readable: true
  - INVALID: HTTP 200, Content-Type: application/json
    Body: { detected, readable, stage_failed, inference_ms }
```

### Flow di Frontend

```
1. Siswa klik "Ketuk untuk foto tugas"
2. Kamera HP terbuka (getUserMedia API, kamera belakang)
3. Siswa klik "Ambil Foto Tugas"
4. Foto dikirim ke AI: POST /api/ai/crop
5. Tampilkan animasi scanning (orange lines bergerak)
6. Hasil:
   - VALID: Badge hijau "Foto Berhasil Tervalidasi"
     -> Batal / Simpan Foto
   - INVALID: Badge merah "Foto Gagal Tervalidasi"
     -> Foto Ulang / Tetap Simpan
7. Foto masuk ke preview list
8. Submit semua foto ke: POST /api/submissions/:token
```

### AI Endpoint

| URL | Method | Field | Max Size | Formats |
|-----|--------|-------|----------|---------|
| `https://gradienr-mitbridge.hf.space/scan` | POST | `file` | 8MB | JPG, PNG, WEBP |

### Response Headers (jika valid)

| Header | Deskripsi |
|--------|-----------|
| `X-Detected` | `true` jika dokumen terdeteksi |
| `X-Readable` | `true` jika dokumen terbaca |
| `X-Detection-Confidence` | Confidence score (0-1) |
| `X-Readability-Score` | P(unreadable), makin rendah makin bagus |
| `X-Inference-Ms` | Waktu inference (ms) |

---

## Ngrok & HTTPS

### Kenapa Perlu Ngrok?

1. **WhatsApp Webhook** - Meta memerlukan HTTPS URL untuk webhook. Server tanpa domain/SSL tidak bisa terima webhook.
2. **Camera API** - Browser memblokir `navigator.mediaDevices.getUserMedia` di HTTP. Perlu HTTPS supaya kamera bisa diakses.

### Setup Ngrok

```bash
# Install
curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok-v3-stable-linux-amd64.tgz | tar xz -C /usr/local/bin

# Auth
ngrok config add-authtoken YOUR_TOKEN

# Start tunnel ke Nginx (port 80)
ngrok http 80

# URL: https://xxx.ngrok-free.dev
```

### Setelah Ngrok Start

1. Update `FRONTEND_URL` di `backend/.env` ke ngrok URL
2. Update `NEXT_PUBLIC_API_URL` di `frontend/.env.local` ke ngrok URL + `/api`
3. Register webhook di Meta: `POST /v25.0/WABA_ID/subscribed_apps` dengan `override_callback_uri`
4. Restart backend & frontend

### Catatan

- URL ngrok **berubah setiap restart** (free tier)
- Setelah ngrok restart, harus **re-register webhook** di Meta
- Untuk production, gunakan **domain + Let's Encrypt SSL** (permanent)

---

## Database Schema

### Tabel Utama

| Tabel | Deskripsi |
|-------|-----------|
| `profiles` | Profil guru (nama, email, avatar, phone_number, notification settings) |
| `classes` | Kelas (nama, tahun akademik, subject_id, teacher_id) |
| `students` | Siswa (nama, student_code, whatsapp_number, class_id) |
| `subjects` | Mata pelajaran (nama) |
| `assignments` | Tugas (judul, deskripsi, deadline, status, attachment_url) |
| `assignment_classes` | Junction: assignment <-> class (many-to-many) |
| `submissions` | Submission siswa (assignment_id, student_id, status, score, feedback) |
| `submission_files` | File submission (file_path, mime_type, file_size) |
| `upload_links` | Token upload unik (token, student_id, assignment_id, expires_at) |
| `notifications` | Notifikasi in-app (user_id, title, type, is_read) |

### Storage Buckets (Supabase Storage)

| Bucket | Deskripsi |
|--------|-----------|
| `submissions` | File foto tugas siswa |
| `avatars` | Foto profil guru |

### Upload Link Expiry

- Token berlaku **30 menit** setelah di-generate
- Setelah expired, siswa bisa minta link baru via WA Bot (ketik 1)

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Deskripsi |
|----------|:--------:|-----------|
| `PORT` | Ya | Port server (default: 4000) |
| `SUPABASE_URL` | Ya | Supabase project URL |
| `SUPABASE_ANON_KEY` | Ya | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Ya | Supabase service role key (bypass RLS) |
| `WHATSAPP_VERIFY_TOKEN` | Ya | Token verifikasi webhook Meta |
| `WHATSAPP_ACCESS_TOKEN` | Ya | Access token Meta WhatsApp API |
| `WHATSAPP_PHONE_NUMBER_ID` | Ya | Phone number ID dari Meta |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | - | WABA ID |
| `META_GRAPH_API_VERSION` | - | Versi Graph API (default: v25.0) |
| `FRONTEND_URL` | Ya | URL frontend (untuk generate upload links) |

### Frontend (`frontend/.env.local`)

| Variable | Required | Deskripsi |
|----------|:--------:|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Ya | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Ya | Supabase anon key |
| `NEXT_PUBLIC_API_URL` | Ya | Backend API URL (misal: http://localhost:4000/api) |

---

## Alur Program

### Alur Guru

```
1. Guru login (/guru/login)
2. Dashboard: lihat statistik, tren, recent submissions
3. Buat kelas baru (/guru/classes)
4. Tambah siswa ke kelas (input nama + nomor WA)
5. Buat tugas baru (judul, deskripsi, lampiran, deadline)
   - Centang "Kirim notifikasi WA" -> siswa terima pesan WA
6. Lihat submissions (/guru/submissions)
   - Klik assignment -> lihat daftar siswa + status
   - Klik Review -> preview foto siswa (PDF-like viewer)
7. Beri nilai + feedback
   - Opsional: kirim nilai via WA Bot
8. Lihat analytics (/guru/analytics)
   - Grafik partisipasi, rekap individu, rata-rata nilai
```

### Alur Siswa

```
1. Siswa terima link unik via WA Bot
2. Klik link -> Landing page (personalized)
3. Klik "Kerjakan Sekarang" -> Detail tugas (instruksi + lampiran)
4. Klik "Lanjut" -> Konfirmasi data (Langkah 1/3)
5. Klik "Lanjut" -> Upload foto (Langkah 2/3)
6. Klik area foto -> Kamera terbuka (Langkah 3/3)
7. Ambil foto -> AI analysis (scanning animation)
   - Valid: simpan foto
   - Invalid: foto ulang atau tetap simpan
8. Tambah foto lagi (opsional)
9. Klik "Submit Tugas"
   - Berhasil: animasi success + "Kembali ke WhatsApp"
   - Gagal: "Coba Lagi" + "Bantuan"
10. Landing page berubah: "Sudah Dikumpulkan"
```

### Alur WhatsApp Bot

```
1. Siswa chat ke nomor bot (+62 851-4178-3908)
2. Bot cek apakah nomor terdaftar di database
   - Belum: "Hubungi guru untuk didaftarkan"
   - Sudah: Tampilkan menu personalized
3. Menu:
   1 -> List tugas belum dikumpulkan -> pilih nomor -> link upload
   2 -> Status semua tugas + nilai + link pengumpulan
   3 -> Profil (nama, kelas, nomor WA)
4. Guru buat tugas baru + centang notif WA
   -> Bot kirim pesan ke semua siswa di kelas
   -> Pesan berisi: judul, mapel, deskripsi, lampiran, deadline, link upload
```

---

## Struktur Direktori

```
oti-internship/
├── backend/
│   ├── app.js                    # Express app setup
│   ├── server.js                 # Server entry point
│   ├── package.json
│   ├── .env                      # Environment variables
│   ├── docs/
│   │   └── openapi.yaml          # OpenAPI 3.0 spec
│   ├── migrations/
│   │   └── 001_settings_notifications.sql
│   └── src/
│       ├── routes.js             # Central router
│       ├── config/
│       │   ├── env.js            # Env vars loader
│       │   ├── supabase.js       # Supabase client
│       │   ├── multer.js         # File upload config
│       │   └── swagger.js        # Swagger config
│       ├── shared/
│       │   ├── middlewares/      # errorHandler, notFound, validate
│       │   └── utils/            # AppError, asyncHandler, response
│       └── modules/
│           ├── ai/               # AI crop/enhance proxy
│           ├── assignments/      # Assignment CRUD + publish
│           ├── auth/             # Login, register, session
│           ├── classes/          # Class CRUD
│           ├── dashboard/        # Dashboard statistics
│           ├── reports/          # Recap + CSV export
│           ├── students/         # Student CRUD
│           ├── subjects/         # Subject CRUD
│           ├── submissions/      # File submission + grading
│           ├── upload-links/     # Token-based upload links
│           └── whatsapp/         # WhatsApp Bot + notifications
│
├── frontend/
│   ├── package.json
│   ├── .env.local                # Environment variables
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   └── src/
│       ├── app/
│       │   ├── guru/             # Dashboard guru pages
│       │   │   ├── login/
│       │   │   ├── register/
│       │   │   └── (dashboard)/
│       │   │       ├── dashboard/
│       │   │       ├── classes/
│       │   │       ├── submissions/
│       │   │       ├── analytics/
│       │   │       └── settings/
│       │   ├── upload/[token]/   # Halaman siswa (via link unik)
│       │   │   ├── page.tsx      # Landing page
│       │   │   ├── detail/       # Detail tugas
│       │   │   ├── confirm/      # Konfirmasi data
│       │   │   └── submit/       # Upload foto + camera + AI
│       │   ├── student/          # Legacy student pages
│       │   ├── privacy/
│       │   └── terms/
│       ├── components/
│       │   ├── guru/             # Guru dashboard components
│       │   ├── student/          # Student components (bell, wifi, header)
│       │   └── providers/        # React Query provider
│       ├── lib/
│       │   ├── api/              # API functions (assignments, submissions, etc)
│       │   ├── supabase.ts       # Supabase client
│       │   └── student.ts        # Student utilities
│       └── modules/
│           └── student/          # Student step components
│
├── start.sh                      # Script untuk start backend + frontend
├── wa-notification-implementation.md
└── README.md                     # File ini
```

---

## License

MITBRIDGE EDUCATION PLATFORM
