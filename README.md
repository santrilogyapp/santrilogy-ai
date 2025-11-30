# Santrilogy AI - Frontend

Frontend untuk Santrilogy AI dengan integrasi Supabase dan Google Generative AI.

## Struktur Proyek

```
santrilogy-ai/
├── gemini-style-template.xml      # Template Blogger utama
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
└── README.md                      # Dokumentasi ini
```

## Instalasi

1. Clone repository ini
2. Install dependensi:
   ```bash
   npm install
   ```
3. Unduh library eksternal:
   ```bash
   npm run download-deps
   ```
4. Atur konfigurasi Supabase di template XML atau melalui meta tags

## Konfigurasi Supabase

Untuk menjalankan template dengan benar, Anda perlu:

1. Membuat akun di [Supabase](https://supabase.com)
2. Membuat proyek baru
3. Menyalin URL proyek dan anon key
4. Menyisipkan ke template atau meta tags:

```html
<meta name="supabase-url" content="YOUR_SUPABASE_URL">
<meta name="supabase-anon-key" content="YOUR_SUPABASE_ANON_KEY">
```

## Setup Database

Jalankan skrip SQL di `supabase-schema.sql` di database Supabase Anda untuk membuat struktur tabel yang diperlukan.

## Penggunaan

Template ini dirancang untuk digunakan di platform Blogger. Anda dapat mengunggah file `gemini-style-template.xml` sebagai template kustom di Blogger.

## Komponen Utama

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

## Kontribusi

Silakan buat pull request untuk kontribusi pada proyek ini.