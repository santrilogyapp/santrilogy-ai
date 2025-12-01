# 1. Project Overview

Santrilogy AI adalah ekosistem asisten cerdas Islam Ahlussunnah wal Jamaah. Proyek ini unik karena berjalan di dua platform sekaligus dengan satu otak pusat:

Web App (Next.js): Platform utama dengan performa maksimal.

Blogger Skin (XML): Versi ringan yang "menumpang" di hosting Blogger namun memiliki antarmuka chat modern.

## Core Philosophy
Design: Gemini-like (Clean, Glassmorphism, Rounded).

Engine: RAG (Supabase) + Hybrid AI (Gemini/DeepSeek).

Adab: Menjaga sanad, validasi data kitab kuning.

# 2. Technical Stack (The Hybrid Architecture)

## A. Backend (The Brain - Shared)
Backend ini melayani kedua frontend (Next.js & Blogger).

Core: Supabase (Auth, Database, Edge Functions).

API Gateway: Supabase Edge Functions / Cloudflare Workers (Wajib support CORS agar bisa diakses dari domain blogspot.com).

Database: PostgreSQL + pgvector (RAG Knowledge Base).

AI Models:

General: Google Gemini API.

Analytic (I'rob/Mantiq): DeepSeek API.

## B. Frontend 1: Modern Web App (Primary)
Framework: Next.js (App Router).

Styling: Tailwind CSS + Framer Motion.

State Management: React Hooks / Zustand.

## C. Frontend 2: Blogger XML Theme (Secondary)
Language: XML (Blogger Syntax), HTML5, CSS3, Vanilla JavaScript (ES6+).

Architecture: Single Page Application (SPA) feel inside Blogger.

Logic: Client-side JavaScript yang melakukan fetch() ke API Backend (Supabase/Worker).

Hack: Memanipulasi Loop Postingan Blog menjadi "Chat Bubbles".

# 3. UI/UX Specifications (Universal Design)

Desain ini berlaku untuk Next.js maupun Blogger XML.

## A. Global Layout

Sidebar Navigasi:

Berisi: New Chat, History (Recent), Upgrade, Settings.

Implementation: Di Next.js pakai Component, di Blogger pakai HTML/CSS sidebar fixed.

Main Chat Area:

Welcoming Text dengan gradasi.

Streaming text effect (efek mengetik).

Floating Input Bar (Bottom):

Pill-shape (lonjong).

Tombol: Upload (+), Mic, Send, Magic Tools (✨).

## B. Color & Theming

Theme Engine: System/Light/Dark/Custom.

Glassmorphism: Header & Sidebar transparan (backdrop-filter: blur).

# 4. Complete Feature Set (As Implemented)

## Core UI Features
- ✅ Responsive Sidebar Navigation - Collapsible on mobile, persistent on desktop
- ✅ Animated Atom Logo - With orbital animations representing AI
- ✅ Modern Glassmorphism Design - Clean, professional interface
- ✅ Welcome Screen - With suggestions for quick start

## Sidebar Features
- ✅ New Chat Button - Start fresh conversations
- ✅ Navigation Menu
  - Chat (active/default)
  - Explore
  - Kitab Library
- ✅ History Management
  - History tracking
  - Saved items
- ✅ User Profile
  - Settings access
  - Upgrade options
  - Account management

## Settings & Customization
- ✅ Dark/Light Mode - With toggle switch
- ✅ Color Themes - 6 different accent color options (indigo, blue, green, purple, pink, orange)
- ✅ Font Size - 3 size options (S, M, L)
- ✅ Clear Chat History - One-click cleanup
- ✅ Profile Management - User information display

## Smart Tools Features
- ✅ Upload Options
  - Camera (photo capture)
  - Gallery (image selection)
  - Document (file upload)
- ✅ AI Specialized Tools
  - 📖 Terjemah Kitab - Arabic text translation
  - 🔍 Analisis I'rob - Arabic grammatical analysis
  - ✍️ Tasykil - Arabic diacritics (harakat) addition
  - 🧠 Tes Logika - Logic/Aristotelian reasoning
  - 🎓 Mode Belajar - Educational learning mode
  - ❓ Quiz - Interactive quizzes

## Chat Interface Features
- ✅ Message Bubbles - With sender identification
- ✅ Message Actions
  - Copy text
  - Regenerate response
  - Like/Dislike feedback
- ✅ Timestamps - For message context
- ✅ Auto-scrolling - To latest messages
- ✅ Typing Indicators - Visual feedback

## Input Area Features
- ✅ Multi-line Textarea - Expands with content
- ✅ Voice Input - Microphone button for speech
- ✅ Tools Modal - Access to all smart tools
- ✅ Plus Menu - Quick access to tools
- ✅ Responsive Design - Adapts to screen size

## Mobile Optimizations
- ✅ Swipe-up Modal - For tools on mobile devices
- ✅ Touch-friendly Buttons - Proper sizing for mobile
- ✅ Gesture Support - Touch interactions
- ✅ Mobile-optimized Layout - Collapsed sidebar by default
- ✅ Viewport Optimization - For proper mobile display

## Content Suggestions
- ✅ Quick Start Cards - Predefined questions to begin
  - Fiqh (prayer, purification)
  - Thaharah (wudhu, tayamum)
  - Kitab (translations)
  - Akidah (fundamentals of faith)

## Interactive Elements
- ✅ Hover Effects - Visual feedback on interactions
- ✅ Smooth Animations - Transitions between states
- ✅ Keyboard Support - Enter to send, Shift+Enter for new line
- ✅ Auto-resize Textarea - Adjusts to content

## Accessibility Features
- ✅ Proper Color Contrast - For readability
- ✅ Large Touch Targets - For mobile users
- ✅ Clear Navigation - Intuitive user flow
- ✅ Visual Feedback - For all interactions

## Islamic Context
- ✅ Islamic-themed Prompts - Relevant content suggestions
- ✅ Religious Content Focus - Fiqh, akidah, kitab kuning
- ✅ Verification Reminder - Ethics warning about AI accuracy
- ✅ Cultural Sensitivity - Appropriate for Islamic context

# 5. Blogger Specific Implementation (XML Guide)

Khusus untuk pengembangan versi Blogger, ikuti aturan ini:

## A. Struktur XML
Reset: Hapus semua widget default (Header, Footer, Sidebar bawaan Blogger).

Main Widget: Gunakan <b:widget type='Blog'> hanya sebagai container untuk me-render jawaban AI (sebagai postingan).

CSS Isolation: Gunakan <b:skin> untuk menulis CSS modern yang menimpa style bawaan Blogger.

## B. JavaScript Interactivity (Client-Side)
Karena Blogger tidak punya backend server-side untuk logic AI:

Auth: Gunakan Supabase Auth (via JavaScript SDK) di sisi klien.

Chat Logic:

Input user -> JS fetch ke Endpoint Supabase Edge Function.

Response AI -> JS memanipulasi DOM untuk menambahkan bubble chat baru secara dinamis (tanpa reload halaman).

History: Ambil data dari Supabase Database (tabel chats), bukan dari RSS Feed Blogger.

# 6. Prompt Engineering Guide for AI Coding Agent

Gunakan prompt ini saat meminta AI (Cursor/Windsurf) menulis kode:

**Untuk Versi Next.js:**

"Buат komponen Sidebar dan ChatLayout menggunakan Next.js App Router dan Tailwind CSS. Ikuti spesifikasi desain Glassmorphism dan layout Gemini yang ada di PROJECT_BLUEPRINT_V2.md. Pastikan terintegrasi dengan Supabase Auth."

**Untuk Versi Blogger XML:**

"Buат kode lengkap file template.xml untuk Blogger. Saya ingin CSS-nya meniru tampilan Gemini (clean, rounded, floating input). Tulis Vanilla JavaScript di dalam tag <script> untuk menangani logika kirim pesan via fetch ke API eksternal (Supabase), abaikan sistem komentar/posting bawaan Blogger."

**Untuk Backend (Supabase):**

"Buат Edge Function di Supabase yang berfungsi sebagai 'Orchestrator'. Function ini menerima teks dari frontend (Next.js atau Blogger), melakukan Vector Search di database, lalu memilih apakah mengirim prompt ke Gemini API atau DeepSeek API berdasarkan kompleksitas pertanyaan (misal: I'rob pakai DeepSeek). Lihat PROJECT_BLUEPRINT_V2.md bagian Dual Model."