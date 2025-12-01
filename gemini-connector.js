// geminiConnector.js - Koneksi dan fungsi-fungsi untuk Google Generative AI (Gemini)

import { GoogleGenerativeAI } from '@google/generative-ai';
import config from './config.js';

// Inisialisasi Google Generative AI
let genAI;

// Inisialisasi dengan API key (akan diambil dari lingkungan aman)
export const initializeGemini = (apiKey = null) => {
  const key = apiKey || config.GEMINI.API_KEY;

  if (!key) {
    console.warn('Gemini API key is required but not provided in config or parameter');
    return;
  }

  genAI = new GoogleGenerativeAI(key);
};

// Fungsi untuk mendapatkan model
export const getModel = (modelName = config.GEMINI.DEFAULT_MODEL) => {
  if (!genAI) {
    console.warn('Gemini not initialized. Call initializeGemini first.');
    return null;
  }
  return genAI.getGenerativeModel({ model: modelName });
};

// Fungsi untuk menghasilkan konten berdasarkan prompt
export const generateContent = async (prompt, options = {}) => {
  try {
    if (!genAI) {
      return { success: false, error: 'Gemini not initialized. Call initializeGemini first.' };
    }

    const {
      modelName = config.GEMINI.DEFAULT_MODEL,
      temperature = 0.7,
      maxOutputTokens = 2048,
      topP = 0.9,
      topK = 40
    } = options;

    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature,
        maxOutputTokens,
        topP,
        topK
      }
    });

    const result = await model.generateContent(prompt);
    const response = result.response;

    return {
      success: true,
      data: {
        text: response.text(),
        usage: result.response.candidates?.[0]?.tokenCount,
        model: modelName
      }
    };
  } catch (error) {
    console.error('Gemini generate content error:', error.message);
    return { success: false, error: error.message };
  }
};

// Fungsi untuk menghasilkan konten berbasis multi-modal (teks + gambar)
export const generateContentWithImage = async (prompt, image, options = {}) => {
  try {
    if (!genAI) {
      return { success: false, error: 'Gemini not initialized. Call initializeGemini first.' };
    }

    const {
      modelName = config.GEMINI.PRO_MODEL, // Model yang lebih cocok untuk input gambar
      temperature = 0.7,
      maxOutputTokens = 1024,
      topP = 0.9,
      topK = 40
    } = options;

    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature,
        maxOutputTokens,
        topP,
        topK
      }
    });

    // Konversi gambar ke format yang sesuai
    const imagePart = await fileToGenerativePart(image);

    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response;

    return {
      success: true,
      data: {
        text: response.text(),
        usage: result.response.candidates?.[0]?.tokenCount,
        model: modelName
      }
    };
  } catch (error) {
    console.error('Gemini generate content with image error:', error.message);
    return { success: false, error: error.message };
  }
};

// Fungsi bantu untuk mengonversi file gambar ke format yang bisa diproses Gemini
const fileToGenerativePart = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result.split(',')[1]; // Ambil bagian base64 dari data URL
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type
        },
      });
    };
    reader.readAsDataURL(file);
  });
};

// Fungsi untuk chatting berkelanjutan (menggunakan history percakapan)
export const generateChatContent = async (chatHistory, newPrompt, options = {}) => {
  try {
    if (!genAI) {
      return { success: false, error: 'Gemini not initialized. Call initializeGemini first.' };
    }

    const {
      modelName = config.GEMINI.DEFAULT_MODEL,
      temperature = 0.7,
      maxOutputTokens = 2048,
      topP = 0.9,
      topK = 40
    } = options;

    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature,
        maxOutputTokens,
        topP,
        topK
      }
    });

    // Siapkan history percakapan untuk dimasukkan ke model
    const history = chatHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model', // Gemini menggunakan 'model' bukan 'assistant'
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({
      history: history,
      generationConfig: {
        temperature,
        maxOutputTokens,
        topP,
        topK
      }
    });

    const result = await chat.sendMessage(newPrompt);
    const response = result.response;

    return {
      success: true,
      data: {
        text: response.text(),
        history: await chat.getHistory(), // Dapatkan history terbaru
        model: modelName
      }
    };
  } catch (error) {
    console.error('Gemini chat error:', error.message);
    return { success: false, error: error.message };
  }
};

// Fungsi untuk embedding teks (berguna untuk pencarian dan RAG)
export const embedContent = async (text, options = {}) => {
  try {
    if (!genAI) {
      return { success: false, error: 'Gemini not initialized. Call initializeGemini first.' };
    }

    const {
      modelName = config.GEMINI.EMBEDDING_MODEL // Model embedding
    } = options;

    const model = genAI.getGenerativeModel({ model: modelName });
    const embeddingResponse = await model.embedContent(text);

    return {
      success: true,
      data: {
        embedding: embeddingResponse.embedding.values,
        model: modelName
      }
    };
  } catch (error) {
    console.error('Gemini embed content error:', error.message);
    return { success: false, error: error.message };
  }
};

// Fungsi untuk mendapatkan embedding dari array teks
export const batchEmbedContents = async (texts, options = {}) => {
  try {
    if (!genAI) {
      return { success: false, error: 'Gemini not initialized. Call initializeGemini first.' };
    }

    const {
      modelName = config.GEMINI.EMBEDDING_MODEL
    } = options;

    const model = genAI.getGenerativeModel({ model: modelName });
    const embeddingResponse = await model.batchEmbedContents(texts);

    return {
      success: true,
      data: {
        embeddings: embeddingResponse.embeddings.map(embedding => embedding.values),
        model: modelName
      }
    };
  } catch (error) {
    console.error('Gemini batch embed contents error:', error.message);
    return { success: false, error: error.message };
  }
};

// Fungsi khusus untuk Santrilogy AI - menjawab berdasarkan kitab kuning
export const generateIslamicResponse = async (query, context = '', options = {}) => {
  try {
    // Buat prompt khusus untuk konteks keislaman
    const islamicPrompt = `Sebagai Santrilogy AI, asisten kecerdasan buatan yang berbasis pada Akidah Ahlussunnah wal Jamaah (Asy'ariyah & Maturidiyah),
    Mazhab Syafi'i, dan Tasawuf Imam Al-Ghazali, tolong jawab pertanyaan berikut:

    Konteks tambahan (jika ada): ${context}

    Pertanyaan: ${query}

    Pastikan untuk:
    1. Memberikan jawaban sesuai dengan ajaran Islam yang benar
    2. Menyertakan referensi dari kitab kuning jika memungkinkan
    3. Menjelaskan dengan cara yang mudah dipahami
    4. Jika tidak menemukan data di database, nyatakan bahwa ini adalah hasil analisis AI dan memerlukan tashih (validasi) ke Kyai/Guru berwenang`;

    return await generateContent(islamicPrompt, options);
  } catch (error) {
    console.error('Generate Islamic response error:', error.message);
    return { success: false, error: error.message };
  }
};

// Fungsi khusus untuk Santrilogy AI - Tasykil (penambahan harakat)
export const generateTasykil = async (arabicText) => {
  try {
    const tasykilPrompt = `Berikan tasykil (harakat) pada teks Arab berikut dengan tepat sesuai kaidah bahasa Arab:

    Teks Arab: ${arabicText}

    Harap berikan teks dengan harakat lengkap dan jika memungkinkan, sertakan juga terjemahan singkat.`;

    return await generateContent(tasykilPrompt, {
      modelName: config.GEMINI.PRO_MODEL,
      temperature: 0.3 // Lebih rendah untuk hasil yang lebih konsisten
    });
  } catch (error) {
    console.error('Generate tasykil error:', error.message);
    return { success: false, error: error.message };
  }
};

// Fungsi khusus untuk Santrilogy AI - I'rob (analisis nahwu/sharaf)
export const generateIrob = async (arabicText) => {
  try {
    const irobPrompt = `Lakukan analisis i'rob (nahwu/sharaf) pada teks Arab berikut:

    Teks Arab: ${arabicText}

    Harap berikan:
    1. Analisis kedudukan setiap kata (isim, fi'il, huruf, dll)
    2. Kedudukan dalam kalimat (fa'il, maf'ul, khabar, dll)
    3. Segala perubahan yang terjadi karena i'rob
    4. Aturan yang mendasari setiap analisis`;

    return await generateContent(irobPrompt, {
      modelName: config.GEMINI.PRO_MODEL,
      temperature: 0.2 // Lebih rendah untuk analisis yang akurat
    });
  } catch (error) {
    console.error('Generate i\'rob error:', error.message);
    return { success: false, error: error.message };
  }
};

// Fungsi khusus untuk Santrilogy AI - Mantiq (logika Aristotelian)
export const generateMantiq = async (query) => {
  try {
    const mantiqPrompt = `Gunakan prinsip-prinsip ilmu mantiq (logika) klasik untuk menganalisis pertanyaan berikut:

    Pertanyaan: ${query}

    Harap terapkan:
    1. Silogisme (qiyas)
    2. Prosilogisme dan Episilogisme jika relevan
    3. Identifikasi premis mayor dan minor
    4. Evaluasi validitas dan kuatnya argumen`;

    return await generateContent(mantiqPrompt, {
      modelName: config.GEMINI.PRO_MODEL,
      temperature: 0.4 // Menyeimbangkan kreativitas dan logika
    });
  } catch (error) {
    console.error('Generate mantiq error:', error.message);
    return { success: false, error: error.message };
  }
};

// Fungsi untuk membuat RPP berdasarkan teks Arab
export const generateRPPFromArabicText = async (arabicText, lessonTitle, level = 'menengah') => {
  try {
    const rppPrompt = `Buatkan RPP (Rencana Pelaksanaan Pembelajaran) yang lengkap berdasarkan teks Arab berikut:

    Teks Arab: ${arabicText}

    Judul Pelajaran: ${lessonTitle}
    Tingkat: ${level}

    RPP harus mencakup:
    1. Standar Kompetensi (SK)
    2. Kompetensi Dasar (KD)
    3. Indikator
    4. Tujuan Pembelajaran
    5. Materi Pokok
    6. Metode Pembelajaran
    7. Langkah-langkah Kegiatan Pembelajaran (Pendahuluan, Inti, Penutup)
    8. Penilaian
    9. Media/Alat dan Sumber Belajar
    10. Contoh soal latihan`;

    return await generateContent(rppPrompt, {
      modelName: config.GEMINI.PRO_MODEL,
      temperature: 0.5
    });
  } catch (error) {
    console.error('Generate RPP from Arabic text error:', error.message);
    return { success: false, error: error.message };
  }
};