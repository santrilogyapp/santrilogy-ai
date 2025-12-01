-- =============================================
-- 1. SETUP EKSTENSI & FUNGSI DASAR
-- =============================================

-- Aktifkan Vector untuk RAG
CREATE EXTENSION IF NOT EXISTS vector;

-- Fungsi otomatis update timestamp (updated_at)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================
-- 2. USER MANAGEMENT (Terintegrasi Auth Supabase)
-- =============================================

CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY, -- ID User sama dengan ID Auth
    email VARCHAR(255),
    full_name VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'user', -- 'user', 'admin', 'ustadz'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger: Otomatis buat profile saat User Baru daftar/login
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =============================================
-- 3. RAG SYSTEM (Gudang Ilmu / Kitab Kuning)
-- =============================================

CREATE TABLE documents (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL, -- Isi teks Arab + Terjemah
    metadata JSONB, -- Contoh: {"kitab": "Fathul Qorib", "bab": "Thaharah", "halaman": 12}
    embedding vector(768) -- Dimensi Gemini Text-Embedding-004
);

-- Indexing agar pencarian data tidak lemot saat data ribuan
CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Fungsi Pencarian (Similarity Search) dipanggil oleh AI
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) AS similarity
  FROM documents
  WHERE 1 - (documents.embedding <=> query_embedding) > match_threshold
  ORDER BY documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- =============================================
-- 4. CHAT SYSTEM
-- =============================================

CREATE TABLE chat_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) DEFAULT 'Diskusi Baru',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- Redundan tapi perlu untuk keamanan RLS
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    sources JSONB, -- Jika jawaban RAG, simpan ID referensi kitab disini
    metadata JSONB, -- Simpan info model (misal: "model": "gemini-flash")
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 5. FITUR KHUSUS & FEEDBACK
-- =============================================

-- Menyimpan riwayat penggunaan tools (Tasykil, I'rob, Terjemah)
CREATE TABLE feature_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    feature_type VARCHAR(50) NOT NULL, -- 'irob', 'tasykil', 'mantiq'
    input_text TEXT,
    output_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_preferences (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
    theme VARCHAR(20) DEFAULT 'light',
    chat_style VARCHAR(50) DEFAULT 'santai', -- 'santai', 'akademis', 'pesantren'
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 6. SECURITY (ROW LEVEL SECURITY - RLS)
-- Wajib agar satu user tidak bisa lihat data user lain
-- =============================================

-- Aktifkan RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Policy Profiles
CREATE POLICY "View Own Profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Update Own Profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Policy Chats
CREATE POLICY "View Own Chats" ON chat_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "View Own Messages" ON messages FOR ALL USING (auth.uid() = user_id);

-- Policy Features
CREATE POLICY "View Own Logs" ON feature_logs FOR ALL USING (auth.uid() = user_id);

-- Policy Preferences
CREATE POLICY "Manage Own Prefs" ON user_preferences FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- 7. SETUP TRIGGERS (Auto Update Time)
-- =============================================

CREATE TRIGGER update_profiles_time BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chats_time BEFORE UPDATE ON chat_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prefs_time BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();