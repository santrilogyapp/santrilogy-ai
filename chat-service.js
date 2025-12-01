// chatService.js - Fungsi-fungsi utama untuk manajemen chat Santrilogy AI
// Menggabungkan fungsionalitas dari Supabase dan Gemini

import {
  createChatSession,
  getUserChatSessions,
  getChatSession,
  updateChatSessionTitle,
  deleteChatSession,
  saveMessage,
  getChatMessages,
  getUserStats,
  saveSpecialFeatureResult
} from './chat-manager.js';

import {
  generateContent,
  generateChatContent,
  generateIslamicResponse,
  generateTasykil,
  generateIrob,
  generateMantiq,
  generateRPPFromArabicText
} from './gemini-connector.js';

// Fungsi untuk membuat sesi chat baru lengkap dengan pesan awal
export const startNewChat = async (userId, initialPrompt = null) => {
  try {
    // Buat sesi baru
    const sessionTitle = initialPrompt ? initialPrompt.substring(0, 50) + (initialPrompt.length > 50 ? '...' : '') : 'New Chat';
    const sessionResult = await createChatSession(userId, sessionTitle);

    if (!sessionResult.success) {
      throw new Error(`Failed to create session: ${sessionResult.error}`);
    }

    const sessionId = sessionResult.data.id;

    // Jika ada prompt awal, proses dan simpan sebagai pesan pertama
    if (initialPrompt) {
      // Simpan pesan pengguna
      const userMessageResult = await saveMessage(sessionId, userId, 'user', initialPrompt);
      if (!userMessageResult.success) {
        console.warn('Failed to save user message:', userMessageResult.error);
      }

      // Dapatkan respons dari AI
      const aiResponse = await generateIslamicResponse(initialPrompt);

      if (aiResponse.success) {
        // Simpan pesan AI
        const aiMessageResult = await saveMessage(sessionId, userId, 'assistant', aiResponse.data.text);
        if (!aiMessageResult.success) {
          console.warn('Failed to save AI message:', aiMessageResult.error);
        }

        return {
          success: true,
          data: {
            session: sessionResult.data,
            initialResponse: aiResponse.data.text
          }
        };
      } else {
        console.error('Failed to get AI response:', aiResponse.error);
        return {
          success: false,
          error: aiResponse.error,
          data: { session: sessionResult.data }
        };
      }
    }

    return {
      success: true,
      data: { session: sessionResult.data }
    };
  } catch (error) {
    console.error('Start new chat error:', error.message);
    return { success: false, error: error.message };
  }
};

// Fungsi untuk mengirim pesan dan mendapatkan respons
export const sendMessage = async (sessionId, userId, message, options = {}) => {
  try {
    // Simpan pesan pengguna
    const userMessageResult = await saveMessage(sessionId, userId, 'user', message);

    if (!userMessageResult.success) {
      throw new Error(`Failed to save user message: ${userMessageResult.error}`);
    }

    // Dapatkan riwayat percakapan sebelumnya
    const historyResult = await getChatMessages(sessionId, userId);

    if (!historyResult.success) {
      throw new Error(`Failed to get chat history: ${historyResult.error}`);
    }

    // Ambil beberapa pesan terakhir sebagai konteks (untuk menghindari melebihi batas token)
    const recentHistory = historyResult.data.slice(-10); // Ambil 10 pesan terakhir
    const formattedHistory = recentHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Generate respons dari AI
    const response = await generateChatContent(formattedHistory, message, options);

    if (!response.success) {
      throw new Error(`Failed to get AI response: ${response.error}`);
    }

    // Simpan respons AI
    const aiMessageResult = await saveMessage(sessionId, userId, 'assistant', response.data.text);

    if (!aiMessageResult.success) {
      console.warn('Failed to save AI message:', aiMessageResult.error);
    }

    return {
      success: true,
      data: {
        userMessage: userMessageResult.data,
        aiResponse: response.data.text,
        aiMessage: aiMessageResult.success ? aiMessageResult.data : null
      }
    };
  } catch (error) {
    console.error('Send message error:', error.message);
    return { success: false, error: error.message };
  }
};

// Fungsi untuk mengirim pesan dengan prompt khusus Santrilogy
export const sendSpecializedMessage = async (sessionId, userId, message, featureType, options = {}) => {
  try {
    // Simpan pesan pengguna
    const userMessageResult = await saveMessage(sessionId, userId, 'user', message);

    if (!userMessageResult.success) {
      throw new Error(`Failed to save user message: ${userMessageResult.error}`);
    }

    let response;

    // Berdasarkan tipe fitur, gunakan fungsi yang sesuai
    switch(featureType) {
      case 'tasykil':
        response = await generateTasykil(message);
        break;
      case 'irob':
        response = await generateIrob(message);
        break;
      case 'mantiq':
        response = await generateMantiq(message);
        break;
      case 'rpp':
        response = await generateRPPFromArabicText(message, 'RPP dari Teks Arab');
        break;
      case 'islamic':
      default:
        response = await generateIslamicResponse(message);
        break;
    }

    if (!response.success) {
      throw new Error(`Failed to get specialized response: ${response.error}`);
    }

    // Simpan respons AI
    const aiMessageResult = await saveMessage(sessionId, userId, 'assistant', response.data.text);

    if (!aiMessageResult.success) {
      console.warn('Failed to save AI message:', aiMessageResult.error);
    }

    return {
      success: true,
      data: {
        userMessage: userMessageResult.data,
        aiResponse: response.data.text,
        aiMessage: aiMessageResult.success ? aiMessageResult.data : null
      }
    };
  } catch (error) {
    console.error('Send specialized message error:', error.message);
    return { success: false, error: error.message };
  }
};

// Fungsi untuk mendapatkan percakapan lengkap dengan metadata
export const getFullConversation = async (sessionId, userId) => {
  try {
    // Dapatkan informasi sesi
    const sessionResult = await getChatSession(sessionId, userId);

    if (!sessionResult.success) {
      throw new Error(`Failed to get session: ${sessionResult.error}`);
    }

    // Dapatkan pesan-pesan
    const messagesResult = await getChatMessages(sessionId, userId);

    if (!messagesResult.success) {
      throw new Error(`Failed to get messages: ${messagesResult.error}`);
    }

    return {
      success: true,
      data: {
        session: sessionResult.data,
        messages: messagesResult.data
      }
    };
  } catch (error) {
    console.error('Get full conversation error:', error.message);
    return { success: false, error: error.message };
  }
};

// Fungsi untuk membuat RPP berdasarkan teks Arab dengan penyimpanan ke database
export const createRPPFromArabicText = async (sessionId, userId, arabicText, lessonTitle, level = 'menengah') => {
  try {
    // Simpan permintaan pengguna
    const userMessageResult = await saveMessage(sessionId, userId, 'user', `Buatkan RPP dari teks Arab berikut:\n\n${arabicText}`, null);
    
    if (!userMessageResult.success) {
      throw new Error(`Failed to save user message: ${userMessageResult.error}`);
    }
    
    // Generate RPP
    const rppResponse = await generateRPPFromArabicText(arabicText, lessonTitle, level);
    
    if (!rppResponse.success) {
      throw new Error(`Failed to generate RPP: ${rppResponse.error}`);
    }
    
    // Simpan respons AI
    const aiMessageResult = await saveMessage(sessionId, userId, 'assistant', rppResponse.data.text);
    
    if (!aiMessageResult.success) {
      console.error('Failed to save AI message:', aiMessageResult.error);
    }
    
    // Simpan juga ke tabel hasil fitur khusus
    await saveSpecialFeatureResult(userId, 'rpp', arabicText, rppResponse.data.text, {
      lessonTitle,
      level
    });
    
    return {
      success: true,
      data: {
        userMessage: userMessageResult.data,
        rppResponse: rppResponse.data.text,
        aiMessage: aiMessageResult.success ? aiMessageResult.data : null
      }
    };
  } catch (error) {
    console.error('Create RPP from Arabic text error:', error);
    return { success: false, error: error.message };
  }
};

// Fungsi untuk melakukan tasykil dan menyimpan hasilnya
export const performTasykil = async (sessionId, userId, arabicText) => {
  try {
    // Simpan permintaan pengguna
    const userMessageResult = await saveMessage(sessionId, userId, 'user', `Berikan tasykil untuk teks Arab berikut:\n\n${arabicText}`, null);
    
    if (!userMessageResult.success) {
      throw new Error(`Failed to save user message: ${userMessageResult.error}`);
    }
    
    // Generate tasykil
    const tasykilResponse = await generateTasykil(arabicText);
    
    if (!tasykilResponse.success) {
      throw new Error(`Failed to generate tasykil: ${tasykilResponse.error}`);
    }
    
    // Simpan respons AI
    const aiMessageResult = await saveMessage(sessionId, userId, 'assistant', tasykilResponse.data.text);
    
    if (!aiMessageResult.success) {
      console.error('Failed to save AI message:', aiMessageResult.error);
    }
    
    // Simpan juga ke tabel hasil fitur khusus
    await saveSpecialFeatureResult(userId, 'tasykil', arabicText, tasykilResponse.data.text);
    
    return {
      success: true,
      data: {
        userMessage: userMessageResult.data,
        tasykilResponse: tasykilResponse.data.text,
        aiMessage: aiMessageResult.success ? aiMessageResult.data : null
      }
    };
  } catch (error) {
    console.error('Perform tasykil error:', error);
    return { success: false, error: error.message };
  }
};

// Fungsi untuk melakukan i'rob dan menyimpan hasilnya
export const performIrob = async (sessionId, userId, arabicText) => {
  try {
    // Simpan permintaan pengguna
    const userMessageResult = await saveMessage(sessionId, userId, 'user', `Lakukan analisis i'rob untuk teks Arab berikut:\n\n${arabicText}`, null);
    
    if (!userMessageResult.success) {
      throw new Error(`Failed to save user message: ${userMessageResult.error}`);
    }
    
    // Generate i'rob
    const irobResponse = await generateIrob(arabicText);
    
    if (!irobResponse.success) {
      throw new Error(`Failed to generate i'rob: ${irobResponse.error}`);
    }
    
    // Simpan respons AI
    const aiMessageResult = await saveMessage(sessionId, userId, 'assistant', irobResponse.data.text);
    
    if (!aiMessageResult.success) {
      console.error('Failed to save AI message:', aiMessageResult.error);
    }
    
    // Simpan juga ke tabel hasil fitur khusus
    await saveSpecialFeatureResult(userId, 'irob', arabicText, irobResponse.data.text);
    
    return {
      success: true,
      data: {
        userMessage: userMessageResult.data,
        irobResponse: irobResponse.data.text,
        aiMessage: aiMessageResult.success ? aiMessageResult.data : null
      }
    };
  } catch (error) {
    console.error('Perform i\'rob error:', error);
    return { success: false, error: error.message };
  }
};

// Fungsi untuk analisis mantiq dan menyimpan hasilnya
export const performMantiqAnalysis = async (sessionId, userId, query) => {
  try {
    // Simpan permintaan pengguna
    const userMessageResult = await saveMessage(sessionId, userId, 'user', `Analisis dengan prinsip mantiq: ${query}`, null);
    
    if (!userMessageResult.success) {
      throw new Error(`Failed to save user message: ${userMessageResult.error}`);
    }
    
    // Generate mantiq analysis
    const mantiqResponse = await generateMantiq(query);
    
    if (!mantiqResponse.success) {
      throw new Error(`Failed to generate mantiq analysis: ${mantiqResponse.error}`);
    }
    
    // Simpan respons AI
    const aiMessageResult = await saveMessage(sessionId, userId, 'assistant', mantiqResponse.data.text);
    
    if (!aiMessageResult.success) {
      console.error('Failed to save AI message:', aiMessageResult.error);
    }
    
    // Simpan juga ke tabel hasil fitur khusus
    await saveSpecialFeatureResult(userId, 'mantiq', query, mantiqResponse.data.text);
    
    return {
      success: true,
      data: {
        userMessage: userMessageResult.data,
        mantiqResponse: mantiqResponse.data.text,
        aiMessage: aiMessageResult.success ? aiMessageResult.data : null
      }
    };
  } catch (error) {
    console.error('Perform mantiq analysis error:', error);
    return { success: false, error: error.message };
  }
};

// Fungsi untuk mendapatkan ringkasan aktivitas pengguna
export const getUserActivitySummary = async (userId) => {
  try {
    const [sessionsResult, statsResult] = await Promise.all([
      getUserChatSessions(userId, 5), // Dapatkan 5 sesi terbaru
      getUserStats(userId)
    ]);

    if (!sessionsResult.success) {
      throw new Error(`Failed to get sessions: ${sessionsResult.error}`);
    }

    if (!statsResult.success) {
      throw new Error(`Failed to get stats: ${statsResult.error}`);
    }

    return {
      success: true,
      data: {
        recentSessions: sessionsResult.data,
        userStats: statsResult.data
      }
    };
  } catch (error) {
    console.error('Get user activity summary error:', error);
    return { success: false, error: error.message };
  }
};

// Fungsi untuk memperbarui judul sesi berdasarkan konten percakapan
export const autoUpdateSessionTitle = async (sessionId, userId) => {
  try {
    // Dapatkan pesan-pesan dalam sesi
    const messagesResult = await getChatMessages(sessionId, userId);
    
    if (!messagesResult.success) {
      throw new Error(`Failed to get messages: ${messagesResult.error}`);
    }
    
    // Ambil pesan pertama pengguna sebagai dasar penamaan
    const firstUserMessage = messagesResult.data.find(msg => msg.role === 'user');
    
    if (firstUserMessage && firstUserMessage.content.length > 0) {
      // Buat judul otomatis berdasarkan pesan pertama
      let title = firstUserMessage.content.substring(0, 50);
      if (firstUserMessage.content.length > 50) {
        title += '...';
      }
      
      // Perbarui judul sesi
      const updateResult = await updateChatSessionTitle(sessionId, userId, title);
      
      if (!updateResult.success) {
        console.error('Failed to update session title:', updateResult.error);
        return { success: false, error: updateResult.error };
      }
      
      return {
        success: true,
        data: updateResult.data
      };
    }
    
    return {
      success: true,
      data: null
    };
  } catch (error) {
    console.error('Auto update session title error:', error);
    return { success: false, error: error.message };
  }
};