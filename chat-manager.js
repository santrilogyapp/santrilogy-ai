// chatManager.js - Fungsi-fungsi untuk manajmen percakapan dan pesan Santrilogy AI

import supabase from './supabase-client.js';

// Fungsi untuk membuat sesi percakapan baru
export const createChatSession = async (userId, title = 'New Chat') => {
  try {
    if (!supabase) {
      return { success: false, error: 'Supabase client not initialized. Check configuration.' };
    }

    const { data, error } = await supabase
      .from('chat_sessions')
      .insert([{
        user_id: userId,
        title: title,
        metadata: { created_with: 'santrilogy-ai' }
      }])
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Create chat session error:', error.message);
    return { success: false, error: error.message };
  }
};

// Fungsi untuk mendapatkan daftar sesi percakapan pengguna
export const getUserChatSessions = async (userId, limit = 50, offset = 0) => {
  try {
    if (!supabase) {
      return { success: false, error: 'Supabase client not initialized. Check configuration.' };
    }

    const { data, error } = await supabase
      .from('chat_sessions')
      .select(`
        id,
        title,
        created_at,
        updated_at,
        metadata,
        messages(count)
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Tambahkan jumlah pesan ke setiap sesi
    const sessionsWithMessageCount = data && Array.isArray(data) ? data.map(session => ({
      ...session,
      messageCount: session.messages?.[0]?.count || 0
    })) : [];

    return { success: true, data: sessionsWithMessageCount };
  } catch (error) {
    console.error('Get user chat sessions error:', error.message);
    return { success: false, error: error.message };
  }
};

// Fungsi untuk mendapatkan detail sesi percakapan
export const getChatSession = async (sessionId, userId) => {
  try {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Get chat session error:', error);
    return { success: false, error: error.message };
  }
};

// Fungsi untuk memperbarui judul sesi percakapan
export const updateChatSessionTitle = async (sessionId, userId, newTitle) => {
  try {
    const { data, error } = await supabase
      .from('chat_sessions')
      .update({ 
        title: newTitle,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Update chat session title error:', error);
    return { success: false, error: error.message };
  }
};

// Fungsi untuk menghapus sesi percakapan
export const deleteChatSession = async (sessionId, userId) => {
  try {
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', userId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Delete chat session error:', error);
    return { success: false, error: error.message };
  }
};

// Fungsi untuk menyimpan pesan baru
export const saveMessage = async (sessionId, userId, role, content, parentMessageId = null) => {
  try {
    if (!supabase) {
      return { success: false, error: 'Supabase client not initialized. Check configuration.' };
    }

    // Perbarui waktu terakhir sesi diakses
    const { error: sessionUpdateError } = await supabase
      .from('chat_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', sessionId)
      .eq('user_id', userId);

    if (sessionUpdateError) {
      console.warn('Warning: Failed to update session timestamp:', sessionUpdateError.message);
    }

    const { data, error } = await supabase
      .from('messages')
      .insert([{
        session_id: sessionId,
        user_id: userId,
        role: role, // 'user' atau 'assistant'
        content: content,
        parent_message_id: parentMessageId
      }])
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Save message error:', error.message);
    return { success: false, error: error.message };
  }
};

// Fungsi untuk mendapatkan pesan dalam sesi percakapan
export const getChatMessages = async (sessionId, userId, limit = 1000, offset = 0) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Get chat messages error:', error);
    return { success: false, error: error.message };
  }
};

// Fungsi untuk menghapus pesan
export const deleteMessage = async (messageId, userId) => {
  try {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
      .eq('user_id', userId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Delete message error:', error);
    return { success: false, error: error.message };
  }
};

// Fungsi untuk menyimpan riwayat pencarian kitab kuning
export const saveBookSearchHistory = async (userId, query, bookTitle, bookReference, resultSnippet) => {
  try {
    const { data, error } = await supabase
      .from('book_search_history')
      .insert([{ 
        user_id: userId,
        query,
        book_title: bookTitle,
        book_reference: bookReference,
        result_snippet: resultSnippet
      }])
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Save book search history error:', error);
    return { success: false, error: error.message };
  }
};

// Fungsi untuk mendapatkan riwayat pencarian kitab kuning
export const getBookSearchHistory = async (userId, limit = 50, offset = 0) => {
  try {
    const { data, error } = await supabase
      .from('book_search_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Get book search history error:', error);
    return { success: false, error: error.message };
  }
};

// Fungsi untuk menyimpan hasil dari fitur khusus Santrilogy (Tasykil, I'rob, dll.)
export const saveSpecialFeatureResult = async (userId, featureType, inputText, outputText, metadata = {}) => {
  try {
    const { data, error } = await supabase
      .from('special_features_results')
      .insert([{ 
        user_id: userId,
        feature_type: featureType,
        input_text: inputText,
        output_text: outputText,
        metadata: metadata
      }])
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Save special feature result error:', error);
    return { success: false, error: error.message };
  }
};

// Fungsi untuk mendapatkan hasil dari fitur khusus Santrilogy
export const getSpecialFeatureResults = async (userId, featureType = null, limit = 50, offset = 0) => {
  try {
    let query = supabase
      .from('special_features_results')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (featureType) {
      query = query.eq('feature_type', featureType);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Get special feature results error:', error);
    return { success: false, error: error.message };
  }
};

// Fungsi untuk mendapatkan statistik penggunaan
export const getUserStats = async (userId) => {
  try {
    // Dapatkan jumlah total sesi
    const { count: sessionCount, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (sessionError) throw sessionError;

    // Dapatkan jumlah total pesan
    const { count: messageCount, error: messageError } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (messageError) throw messageError;

    // Dapatkan jumlah hasil fitur khusus
    const { count: featureResultCount, error: featureError } = await supabase
      .from('special_features_results')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (featureError) throw featureError;

    return {
      success: true,
      data: {
        totalSessions: sessionCount || 0,
        totalMessages: messageCount || 0,
        totalFeatureResults: featureResultCount || 0
      }
    };
  } catch (error) {
    console.error('Get user stats error:', error);
    return { success: false, error: error.message };
  }
};