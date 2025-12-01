// specializedFeatures.js - Implementasi fitur-fitur khusus Santrilogy AI
// Termasuk Tasykil, I'rob, Mantiq, dan fitur-fitur lainnya

import {
  saveSpecialFeatureResult,
  getSpecialFeatureResults,
  saveBookSearchHistory,
  getBookSearchHistory
} from './chat-manager.js';

import {
  generateTasykil,
  generateIrob,
  generateMantiq,
  generateRPPFromArabicText,
  generateIslamicResponse,
  generateContent
} from './gemini-connector.js';

import config from './config.js';

// Fungsi untuk melakukan tasykil (penambahan harakat) pada teks Arab
export const tasykilText = async (userId, arabicText) => {
  try {
    if (!arabicText || typeof arabicText !== 'string') {
      throw new Error('Invalid Arabic text provided for tasykil');
    }

    // Gunakan fungsi dari gemini-connector
    const result = await generateTasykil(arabicText);
    
    if (!result.success) {
      throw new Error(`Tasykil generation failed: ${result.error}`);
    }

    // Simpan hasil ke database
    const saveResult = await saveSpecialFeatureResult(
      userId, 
      'tasykil', 
      arabicText, 
      result.data.text,
      { timestamp: new Date().toISOString() }
    );

    if (!saveResult.success) {
      console.error('Failed to save tasykil result:', saveResult.error);
    }

    return {
      success: true,
      data: {
        input: arabicText,
        output: result.data.text,
        saved: saveResult.success
      }
    };
  } catch (error) {
    console.error('Tasykil error:', error);
    return { success: false, error: error.message };
  }
};

// Fungsi untuk melakukan i'rob (analisis nahwu/sharaf) pada teks Arab
export const irobText = async (userId, arabicText) => {
  try {
    if (!arabicText || typeof arabicText !== 'string') {
      throw new Error('Invalid Arabic text provided for i\'rob');
    }

    // Gunakan fungsi dari gemini-connector
    const result = await generateIrob(arabicText);
    
    if (!result.success) {
      throw new Error(`I'rob generation failed: ${result.error}`);
    }

    // Simpan hasil ke database
    const saveResult = await saveSpecialFeatureResult(
      userId, 
      'irob', 
      arabicText, 
      result.data.text,
      { timestamp: new Date().toISOString() }
    );

    if (!saveResult.success) {
      console.error('Failed to save i\'rob result:', saveResult.error);
    }

    return {
      success: true,
      data: {
        input: arabicText,
        output: result.data.text,
        saved: saveResult.success
      }
    };
  } catch (error) {
    console.error('I\'rob error:', error);
    return { success: false, error: error.message };
  }
};

// Fungsi untuk melakukan analisis mantiq (logika Aristotelian)
export const mantiqAnalysis = async (userId, query) => {
  try {
    if (!query || typeof query !== 'string') {
      throw new Error('Invalid query provided for mantiq analysis');
    }

    // Gunakan fungsi dari gemini-connector
    const result = await generateMantiq(query);
    
    if (!result.success) {
      throw new Error(`Mantiq analysis failed: ${result.error}`);
    }

    // Simpan hasil ke database
    const saveResult = await saveSpecialFeatureResult(
      userId, 
      'mantiq', 
      query, 
      result.data.text,
      { timestamp: new Date().toISOString() }
    );

    if (!saveResult.success) {
      console.error('Failed to save mantiq result:', saveResult.error);
    }

    return {
      success: true,
      data: {
        input: query,
        output: result.data.text,
        saved: saveResult.success
      }
    };
  } catch (error) {
    console.error('Mantiq analysis error:', error);
    return { success: false, error: error.message };
  }
};

// Fungsi untuk membuat RPP berdasarkan teks Arab
export const createRPPFromArabic = async (userId, arabicText, lessonTitle, level = 'menengah') => {
  try {
    if (!arabicText || typeof arabicText !== 'string') {
      throw new Error('Invalid Arabic text provided for RPP creation');
    }

    if (!lessonTitle || typeof lessonTitle !== 'string') {
      // Buat judul otomatis jika tidak disediakan
      lessonTitle = 'RPP dari Teks Arab';
    }

    // Gunakan fungsi dari gemini-connector
    const result = await generateRPPFromArabicText(arabicText, lessonTitle, level);
    
    if (!result.success) {
      throw new Error(`RPP creation failed: ${result.error}`);
    }

    // Simpan hasil ke database
    const saveResult = await saveSpecialFeatureResult(
      userId, 
      'rpp', 
      arabicText, 
      result.data.text,
      { 
        lessonTitle,
        level,
        timestamp: new Date().toISOString() 
      }
    );

    if (!saveResult.success) {
      console.error('Failed to save RPP result:', saveResult.error);
    }

    return {
      success: true,
      data: {
        input: arabicText,
        output: result.data.text,
        lessonTitle,
        level,
        saved: saveResult.success
      }
    };
  } catch (error) {
    console.error('RPP creation error:', error);
    return { success: false, error: error.message };
  }
};

// Fungsi untuk pencarian dalam database kitab kuning
// Ini adalah fungsi sederhana, dalam implementasi nyata akan terhubung ke database kitab kuning
export const searchKitabKuning = async (userId, query) => {
  try {
    if (!query || typeof query !== 'string') {
      throw new Error('Invalid query provided for kitab kuning search');
    }

    // Dalam implementasi nyata, ini akan mencari di database vektor atau database kitab kuning
    // Untuk saat ini, kita gunakan Gemini untuk memberikan informasi berdasarkan pengetahuan yang ada
    const searchPrompt = `Cari informasi tentang: ${query}. 
    Jika memungkinkan, berikan referensi dari kitab kuning yang relevan 
    dan penjelasan sesuai dengan Mazhab Syafi'i dan Akidah Asy'ariyah-Maturidiyah.`;

    const result = await generateIslamicResponse(searchPrompt);
    
    if (!result.success) {
      throw new Error(`Kitab kuning search failed: ${result.error}`);
    }

    // Simpan histori pencarian ke database
    const saveHistory = await saveBookSearchHistory(
      userId,
      query,
      'Informasi umum', // Nama kitab jika ditemukan
      'Referensi umum', // Referensi spesifik jika ada
      result.data.text.substring(0, 200) + '...' // Cuplikan hasil
    );

    if (!saveHistory.success) {
      console.error('Failed to save book search history:', saveHistory.error);
    }

    return {
      success: true,
      data: {
        query,
        result: result.data.text,
        savedHistory: saveHistory.success
      }
    };
  } catch (error) {
    console.error('Kitab kuning search error:', error);
    return { success: false, error: error.message };
  }
};

// Fungsi untuk mendapatkan hasil pencarian kitab kuning sebelumnya
export const getPreviousKitabSearches = async (userId, limit = 20) => {
  try {
    const result = await getBookSearchHistory(userId, limit);
    
    if (!result.success) {
      throw new Error(`Failed to get previous searches: ${result.error}`);
    }

    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    console.error('Get previous kitab searches error:', error);
    return { success: false, error: error.message };
  }
};

// Fungsi untuk mendapatkan hasil dari fitur khusus sebelumnya
export const getPreviousSpecialResults = async (userId, featureType = null, limit = 20) => {
  try {
    const result = await getSpecialFeatureResults(userId, featureType, limit);
    
    if (!result.success) {
      throw new Error(`Failed to get previous special results: ${result.error}`);
    }

    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    console.error('Get previous special results error:', error);
    return { success: false, error: error.message };
  }
};

// Fungsi untuk terjemahan teks Arab
export const translateArabicText = async (userId, arabicText, targetLanguage = 'id') => {
  try {
    if (!arabicText || typeof arabicText !== 'string') {
      throw new Error('Invalid Arabic text provided for translation');
    }

    const translationPrompt = `Terjemahkan teks Arab berikut ke bahasa ${targetLanguage === 'id' ? 'Indonesia' : 'Inggris'}:

    Teks Arab: ${arabicText}

    Berikan terjemahan yang akurat dan kontekstual, serta jika memungkinkan sertakan catatan kecil tentang makna penting.`;

    const result = await generateContent(translationPrompt, {
      modelName: config.GEMINI.PRO_MODEL,
      temperature: 0.3
    });

    if (!result.success) {
      throw new Error(`Translation failed: ${result.error}`);
    }

    // Simpan hasil ke database
    const saveResult = await saveSpecialFeatureResult(
      userId,
      'translation',
      arabicText,
      result.data.text,
      {
        targetLanguage,
        timestamp: new Date().toISOString()
      }
    );

    if (!saveResult.success) {
      console.warn('Failed to save translation result:', saveResult.error);
    }

    return {
      success: true,
      data: {
        input: arabicText,
        output: result.data.text,
        targetLanguage,
        saved: saveResult.success
      }
    };
  } catch (error) {
    console.error('Arabic translation error:', error.message);
    return { success: false, error: error.message };
  }
};

// Fungsi untuk analisis teks Arab (tafsir, ushul fikih, dll)
export const analyzeArabicText = async (userId, arabicText, analysisType = 'general') => {
  try {
    if (!arabicText || typeof arabicText !== 'string') {
      throw new Error('Invalid Arabic text provided for analysis');
    }

    let analysisPrompt = '';
    
    switch(analysisType) {
      case 'tafsir':
        analysisPrompt = `Berikan analisis tafsir untuk teks Arab berikut sesuai dengan pendekatan Ahlussunnah wal Jamaah:\n\n${arabicText}`;
        break;
      case 'ushul':
        analysisPrompt = `Analisis teks Arab berikut dari sisi ushul fikih (kaidah hukum), menurut Mazhab Syafi'i:\n\n${arabicText}`;
        break;
      case 'hadis':
        analysisPrompt = `Jika teks ini adalah hadis, analisis keotentikannya dan berikan penjelasan menurut klasifikasi hadis:\n\n${arabicText}`;
        break;
      case 'balaghah':
        analysisPrompt = `Lakukan analisis balaghah (kemegahan bahasa) terhadap teks Arab berikut:\n\n${arabicText}`;
        break;
      case 'general':
      default:
        analysisPrompt = `Berikan analisis komprehensif terhadap teks Arab berikut, mencakup makna, konteks, dan penjelasan sesuai dengan ajaran Islam Ahlussunnah wal Jamaah:\n\n${arabicText}`;
        break;
    }

    const result = await generateIslamicResponse(analysisPrompt);
    
    if (!result.success) {
      throw new Error(`Text analysis failed: ${result.error}`);
    }

    // Simpan hasil ke database
    const saveResult = await saveSpecialFeatureResult(
      userId, 
      `analysis_${analysisType}`, 
      arabicText, 
      result.data.text,
      { 
        analysisType,
        timestamp: new Date().toISOString() 
      }
    );

    if (!saveResult.success) {
      console.error('Failed to save analysis result:', saveResult.error);
    }

    return {
      success: true,
      data: {
        input: arabicText,
        output: result.data.text,
        analysisType,
        saved: saveResult.success
      }
    };
  } catch (error) {
    console.error('Arabic text analysis error:', error);
    return { success: false, error: error.message };
  }
};

// Fungsi untuk membuat ringkasan dari teks panjang
export const summarizeText = async (userId, text, maxSentences = 5) => {
  try {
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid text provided for summarization');
    }

    const summaryPrompt = `Buatkan ringkasan yang padat dan akurat dari teks berikut, maksimal ${maxSentences} kalimat:

    Teks: ${text}

    Pastikan ringkasan mencakup poin-poin penting dan informasi utama dari teks.`;

    const result = await generateContent(summaryPrompt, {
      modelName: config.GEMINI.DEFAULT_MODEL,
      temperature: 0.4
    });

    if (!result.success) {
      throw new Error(`Summarization failed: ${result.error}`);
    }

    // Simpan hasil ke database
    const saveResult = await saveSpecialFeatureResult(
      userId,
      'summarization',
      text,
      result.data.text,
      {
        maxSentences,
        timestamp: new Date().toISOString()
      }
    );

    if (!saveResult.success) {
      console.warn('Failed to save summarization result:', saveResult.error);
    }

    return {
      success: true,
      data: {
        input: text,
        output: result.data.text,
        maxSentences,
        saved: saveResult.success
      }
    };
  } catch (error) {
    console.error('Text summarization error:', error.message);
    return { success: false, error: error.message };
  }
};

// Fungsi untuk memformat teks Arab agar lebih mudah dibaca
export const formatArabicText = async (userId, arabicText) => {
  try {
    if (!arabicText || typeof arabicText !== 'string') {
      throw new Error('Invalid Arabic text provided for formatting');
    }

    const formatPrompt = `Format ulang teks Arab berikut agar lebih mudah dibaca dan dipahami,
    dengan menambahkan spasi yang tepat, membagi menjadi paragraf jika perlu,
    dan mempertahankan makna aslinya:

    Teks: ${arabicText}`;

    const result = await generateContent(formatPrompt, {
      modelName: config.GEMINI.PRO_MODEL,
      temperature: 0.1 // Sangat rendah untuk hasil yang lebih terstruktur
    });

    if (!result.success) {
      throw new Error(`Text formatting failed: ${result.error}`);
    }

    // Simpan hasil ke database
    const saveResult = await saveSpecialFeatureResult(
      userId,
      'formatting',
      arabicText,
      result.data.text,
      {
        timestamp: new Date().toISOString()
      }
    );

    if (!saveResult.success) {
      console.warn('Failed to save formatting result:', saveResult.error);
    }

    return {
      success: true,
      data: {
        input: arabicText,
        output: result.data.text,
        saved: saveResult.success
      }
    };
  } catch (error) {
    console.error('Arabic text formatting error:', error.message);
    return { success: false, error: error.message };
  }
};

// Fungsi untuk memvalidasi apakah teks Arab mengikuti kaidah bahasa Arab yang benar
export const validateArabicGrammar = async (userId, arabicText) => {
  try {
    if (!arabicText || typeof arabicText !== 'string') {
      throw new Error('Invalid Arabic text provided for grammar validation');
    }

    const validationPrompt = `Lakukan validasi tata bahasa Arab terhadap teks berikut:

    Teks: ${arabicText}

    Identifikasi:
    1. Kesalahan tata bahasa jika ada
    2. Ketepatan kaidah nahwu dan sharaf
    3. Saran perbaikan jika diperlukan
    4. Penjelasan singkat tentang aturan yang terlibat`;

    const result = await generateContent(validationPrompt, {
      modelName: config.GEMINI.PRO_MODEL,
      temperature: 0.2 // Rendah untuk hasil yang lebih akurat
    });

    if (!result.success) {
      throw new Error(`Grammar validation failed: ${result.error}`);
    }

    // Simpan hasil ke database
    const saveResult = await saveSpecialFeatureResult(
      userId,
      'grammar_validation',
      arabicText,
      result.data.text,
      {
        timestamp: new Date().toISOString()
      }
    );

    if (!saveResult.success) {
      console.warn('Failed to save grammar validation result:', saveResult.error);
    }

    return {
      success: true,
      data: {
        input: arabicText,
        output: result.data.text,
        saved: saveResult.success
      }
    };
  } catch (error) {
    console.error('Arabic grammar validation error:', error.message);
    return { success: false, error: error.message };
  }
};