// supabaseClient.js - Konfigurasi dan client Supabase untuk Santrilogy AI

import { createClient } from '@supabase/supabase-js';

// Konfigurasi Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://jbbathydxvpgmgtauadm.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpiYmF0aHlkeHZwZ21ndGF1YWRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MTMyNjMsImV4cCI6MjA4MDA4OTI2M30.9uUtMwX4G5gmhbFHv1l7DgNTedQtiWqSzZ_VgWYzFAo';

// Inisialisasi client Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Fungsi autentikasi
export const auth = {
  // Registrasi pengguna baru
  register: async (email, password, userData = {}) => {
    try {
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
        await supabase
          .from('users')
          .insert([{
            id: data.user.id,
            email: data.user.email,
            username: userData.username || email.split('@')[0],
            full_name: userData.full_name || userData.username || email.split('@')[0],
            avatar_url: userData.avatar_url || null
          }]);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  },

  // Login pengguna
  login: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  },

  // Login dengan Google
  loginWithGoogle: async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Google login error:', error);
      return { success: false, error: error.message };
    }
  },

  // Logout pengguna
  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  },

  // Reset password
  resetPassword: async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
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
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  }
};

// Event listener untuk perubahan auth state
supabase.auth.onAuthStateChange((event, session) => {
  console.log(`Auth state changed: ${event}`);
  
  // Anda bisa menambahkan logika tambahan di sini saat auth state berubah
  if (event === 'SIGNED_IN') {
    console.log('User signed in:', session?.user?.email);
  } else if (event === 'SIGNED_OUT') {
    console.log('User signed out');
  }
});

export default supabase;