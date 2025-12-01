# Santrilogy AI - Islamic AI Assistant

Santrilogy AI adalah ekosistem asisten kecerdasan buatan Islam Ahlussunnah wal Jamaah yang berjalan di dua platform sekaligus:

- **Web App (Next.js)**: Platform utama dengan performa maksimal
- **Blogger Skin (XML)**: Versi ringan yang "menumpang" di hosting Blogger namun memiliki antarmuka chat modern

## Struktur Proyek

```
santrilogy-ai/
├── server.js                      # API server backend
├── gemini-style-template.xml      # Template Blogger utama (premium design)
├── santrilogy-ai.js               # JavaScript untuk XML template
├── assets/                        # Library eksternal
│   ├── js/                        # JavaScript libraries
│   │   ├── marked/                # Markdown parser
│   │   ├── mermaid/               # Diagram generator
│   │   ├── highlight.js/          # Syntax highlighting
│   │   ├── supabase/              # Supabase client
│   │   └── santrilogy/            # Santrilogy scripts
│   └── css/                       # CSS libraries
│       └── highlight.js/          # Syntax highlighting themes
├── supabase-schema.sql            # Skema database Supabase
├── supabase-client.js             # Konfigurasi Supabase
├── chat-manager.js                # Manajemen percakapan
├── gemini-connector.js            # Integrasi Google Generative AI
├── chat-service.js                # Layanan chat
├── specialized-features.js        # Fitur-fitur khusus
├── error-handling.js              # Sistem error handling
├── integration-test.js            # Fungsi testing
├── package.json                   # Dependensi proyek
├── download-dependencies.js       # Script untuk mengunduh library
├── .env                           # Konfigurasi environment
└── README.md                      # Dokumentasi ini
```

## Instalasi

1. Clone repository ini
2. Install dependensi:
   ```bash
   npm install
   ```
3. Unduh library eksternal (jika diperlukan):
   ```bash
   npm run download-deps
   ```
4. Buat file `.env` dengan konfigurasi:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   NODE_ENV=development
   PORT=3000
   ```

## Setup Server

1. Jalankan server backend:
   ```bash
   npm start
   ```
   atau untuk pengembangan:
   ```bash
   npm run dev
   ```

2. Server akan berjalan di `http://localhost:3000`

## Setup Database

Jalankan skrip SQL di `supabase-schema.sql` di database Supabase Anda untuk membuat struktur tabel yang diperlukan:

```sql
-- Tabel untuk menyimpan percakapan
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  session_id TEXT,
  user_message TEXT,
  ai_response TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Tabel untuk menyimpan permintaan spesialis
CREATE TABLE specialized_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  session_id TEXT,
  feature_type TEXT, -- 'tasykil', 'irob', 'translate', 'learn'
  input_text TEXT,
  output_text TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

## Penggunaan

### Blogger Template
Template ini dirancang untuk digunakan di platform Blogger. Anda dapat mengunggah file `gemini-style-template.xml` sebagai template kustom di Blogger. Template ini sudah memiliki:

- Desain premium dengan branding Santrilogy AI (tidak menyerupai Gemini)
- Sidebar navigasi lengkap (New Chat, History, Upgrade, Settings)
- Mode gelap/terang
- Magic Tools (Mode Belajar, Terjemah Kitab, Tasykil, Analisis I'rob)
- Antarmuka chat profesional

### API Endpoints

- `GET /health` - Cek status server
- `POST /api/chat` - Fungsi chat umum
- `POST /api/specialized` - Fungsi spesialis (tasykil, irob, translate, learn)
- `GET /api/history/:sessionId` - Ambil riwayat chat

## Fitur-fitur Utama

- **Autentikasi**: Sistem login/register menggunakan Supabase Auth
- **Manajemen Chat**: Sesi percakapan disimpan di Supabase
- **Fitur Khusus Santrilogy**:
  - Tasykil (penambahan harakat Arab)
  - I'rob (analisis nahwu/sharaf)
  - Mantiq (logika Aristotelian)
  - Pembuatan RPP dari teks Arab
  - Pencarian kitab kuning
- **Integrasi AI**: Terhubung ke Google Generative AI melalui backend
- **Tampilan Responsif**: Mendukung berbagai ukuran layar
- **Premium Design**: Desain profesional dengan branding Santrilogy AI

## Konfigurasi Environment

File `.env` harus berisi:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Gemini Configuration
GEMINI_API_KEY=your_gemini_api_key
GEMINI_DEFAULT_MODEL=gemini-1.5-flash
GEMINI_PRO_MODEL=gemini-1.5-pro
GEMINI_EMBEDDING_MODEL=embedding-001

# Application
NODE_ENV=development
PORT=3000
```

## Kontribusi

Silakan buat pull request untuk kontribusi pada proyek ini. Pastikan untuk mengikuti standar sanitas dan memastikan semua fitur berfungsi sebelum melakukan pull request.

## Lisensi

Proyek ini dilisensikan di bawah lisensi MIT - lihat file LICENSE untuk detailnya.