// config.js - Santrilogy AI Configuration

// Environment configuration with fallback values
const config = {
  // Supabase Configuration
  SUPABASE: {
    URL: process.env.SUPABASE_URL || '',
    ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  },
  
  // Gemini Configuration
  GEMINI: {
    API_KEY: process.env.GEMINI_API_KEY || '',
    DEFAULT_MODEL: process.env.GEMINI_DEFAULT_MODEL || 'gemini-1.5-flash',
    PRO_MODEL: process.env.GEMINI_PRO_MODEL || 'gemini-1.5-pro',
    EMBEDDING_MODEL: process.env.GEMINI_EMBEDDING_MODEL || 'embedding-001',
  },
  
  // Application Settings
  APP: {
    NAME: 'Santrilogy AI',
    VERSION: '1.0.0',
    ENVIRONMENT: process.env.NODE_ENV || 'development',
    DEBUG: process.env.NODE_ENV !== 'production',
  },
  
  // Feature Flags
  FEATURES: {
    ENABLE_SUPABASE: !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
    ENABLE_GEMINI: !!process.env.GEMINI_API_KEY,
    ENABLE_FILE_UPLOAD: true,
    ENABLE_HISTORY: true,
    ENABLE_SPECIALIZED_FEATURES: true,
  }
};

// Validation function to check if all required configurations are present
config.validate = () => {
  const errors = [];
  
  if (!config.SUPABASE.URL) {
    errors.push('SUPABASE_URL is required');
  }
  
  if (!config.SUPABASE.ANON_KEY) {
    errors.push('SUPABASE_ANON_KEY is required');
  }
  
  if (!config.GEMINI.API_KEY) {
    errors.push('GEMINI_API_KEY is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Export configuration
export default config;