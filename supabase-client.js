// supabaseClient.js - Konfigurasi dan client Supabase untuk Santrilogy AI

import { createClient } from '@supabase/supabase-js';

// Konfigurasi Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase configuration missing. Please set SUPABASE_URL and SUPABASE_ANON_KEY in environment variables.');
}

// Inisialisasi client Supabase
const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// Fungsi autentikasi
export const auth = {
  // Registrasi pengguna baru
  register: async (email, password, userData = {}) => {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized. Check configuration.');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: userData.username || email.split('@')[0],
            full_name: userData.full_name || userData.username || email.split('@')[0],
            ...userData
          }
        }
      });

      if (error) throw error;

      // Simpan data pengguna tambahan ke tabel users
      if (data.user) {
        const { error: insertError } = await supabase
          .from('users')
          .insert([{
            id: data.user.id,
            email: data.user.email,
            username: userData.username || email.split('@')[0],
            full_name: userData.full_name || userData.username || email.split('@')[0],
            avatar_url: userData.avatar_url || null
          }]);

        if (insertError) {
          console.warn('Failed to save user data to users table:', insertError.message);
        }
      }

      return { success: true, data };
    } catch (error) {
      console.error('Registration error:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Login pengguna
  login: async (email, password) => {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized. Check configuration.');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Login error:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Login dengan Google
  loginWithGoogle: async () => {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized. Check configuration.');
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin || 'http://localhost:3000'
        }
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Google login error:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Logout pengguna
  logout: async () => {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized. Check configuration.');
      }

      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Reset password
  resetPassword: async (email) => {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized. Check configuration.');
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin || 'http://localhost:3000'}/update-password`
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Dapatkan informasi pengguna saat ini
  getCurrentUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  // Dapatkan session saat ini
  getSession: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      return session;
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  },

  // Update profil pengguna
  updateProfile: async (profileData) => {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized. Check configuration.');
      }

      const user = await auth.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      // Update data auth
      if (profileData.email) {
        await supabase.auth.updateUser({ email: profileData.email });
      }

      // Update data di tabel users
      const { error } = await supabase
        .from('users')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error.message);
      return { success: false, error: error.message };
    }
  }
};

// Event listener untuk perubahan auth state
supabase.auth.onAuthStateChange((event, session) => {
  // Anda bisa menambahkan logika tambahan di sini saat auth state berubah
  if (event === 'SIGNED_IN') {
    // User signed in - tambahkan logika jika diperlukan
  } else if (event === 'SIGNED_OUT') {
    // User signed out - tambahkan logika jika diperlukan
  }
});

export default supabase;