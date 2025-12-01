import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Setup CORS (Agar Blogspot bisa akses)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Handle Preflight Request (Syarat wajib browser)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt } = await req.json()
    
    // Setup Client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    const geminiKey = Deno.env.get('GEMINI_API_KEY')

    // --- LOGIKA RAG DIMULAI ---
    
    // A. Embed Pertanyaan User
    const embedRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "models/text-embedding-004",
        content: { parts: [{ text: prompt }] }
      })
    })
    const embedData = await embedRes.json()
    const userVector = embedData.embedding.values

    // B. Cari di Database Supabase
    const { data: documents } = await supabaseClient.rpc('match_documents', {
      query_embedding: userVector,
      match_threshold: 0.5, 
      match_count: 3 
    })

    // C. Susun Konteks
    let systemInstruction = "Kamu adalah Santrilogy AI. Jawab dengan sopan."
    
    if (documents && documents.length > 0) {
       const contextText = documents.map((doc: any) => 
        `[Kitab: ${doc.metadata.kitab}]\n${doc.content}`
      ).join("\n---\n")
      
      systemInstruction += `\n\nGunakan referensi kitab berikut untuk menjawab:\n${contextText}\n\nSebutkan nama kitab rujukan di akhir jawaban.`
    } else {
      systemInstruction += "\n\nMaaf, belum ada data kitab spesifik di database. Jawablah secara umum dan sarankan tanya ke Guru."
    }

    // D. Tanya Gemini (Chat)
    const chatRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: systemInstruction + "\n\nUser: " + prompt }] }]
      })
    })
    const chatData = await chatRes.json()
    const finalAnswer = chatData.candidates[0].content.parts[0].text

    // --- SELESAI ---

    return new Response(JSON.stringify({ answer: finalAnswer }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})