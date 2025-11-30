// errorHandling.js - Sistem error handling dan validasi data untuk Santrilogy AI

// Kelas kustom untuk error aplikasi
export class SantrilogyError extends Error {
  constructor(message, code, statusCode = 500) {
    super(message);
    this.name = 'SantrilogyError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

// Kelas kustom untuk error validasi
export class ValidationError extends SantrilogyError {
  constructor(message, field = null) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
    this.field = field;
    this.validationErrors = [{
      field: field,
      message: message
    }];
  }
}

// Kelas kustom untuk error autentikasi
export class AuthenticationError extends SantrilogyError {
  constructor(message = 'Authentication required', code = 'AUTH_ERROR') {
    super(message, code, 401);
    this.name = 'AuthenticationError';
  }
}

// Kelas kustom untuk error otorisasi
export class AuthorizationError extends SantrilogyError {
  constructor(message = 'Access denied', code = 'FORBIDDEN') {
    super(message, code, 403);
    this.name = 'AuthorizationError';
  }
}

// Kelas kustom untuk error not found
export class NotFoundError extends SantrilogyError {
  constructor(message = 'Resource not found', code = 'NOT_FOUND') {
    super(message, code, 404);
    this.name = 'NotFoundError';
  }
}

// Fungsi validasi email
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string') {
    throw new ValidationError('Email is required', 'email');
  }
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format', 'email');
  }
  return true;
};

// Fungsi validasi password
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    throw new ValidationError('Password is required', 'password');
  }
  if (password.length < 8) {
    throw new ValidationError('Password must be at least 8 characters', 'password');
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    throw new ValidationError('Password must contain at least one uppercase letter, one lowercase letter, and one number', 'password');
  }
  return true;
};

// Fungsi validasi username
export const validateUsername = (username) => {
  if (!username || typeof username !== 'string') {
    throw new ValidationError('Username is required', 'username');
  }
  if (username.length < 3 || username.length > 30) {
    throw new ValidationError('Username must be between 3 and 30 characters', 'username');
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    throw new ValidationError('Username can only contain letters, numbers, and underscores', 'username');
  }
  return true;
};

// Fungsi validasi teks Arab
export const validateArabicText = (text) => {
  if (!text || typeof text !== 'string') {
    throw new ValidationError('Arabic text is required', 'arabicText');
  }
  
  // Cek apakah teks mengandung karakter Arab
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F]/;
  if (!arabicRegex.test(text)) {
    throw new ValidationError('Text must contain Arabic characters', 'arabicText');
  }
  
  if (text.length > 10000) { // Batas maksimum 10.000 karakter
    throw new ValidationError('Arabic text is too long', 'arabicText');
  }
  
  return true;
};

// Fungsi validasi ID (UUID)
export const validateId = (id) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!id || typeof id !== 'string') {
    throw new ValidationError('ID is required', 'id');
  }
  if (!uuidRegex.test(id)) {
    throw new ValidationError('Invalid ID format', 'id');
  }
  return true;
};

// Fungsi validasi teks biasa
export const validateText = (text, fieldName = 'text', maxLength = 10000) => {
  if (!text || typeof text !== 'string') {
    throw new ValidationError(`${fieldName} is required`, fieldName);
  }
  if (text.trim().length === 0) {
    throw new ValidationError(`${fieldName} cannot be empty`, fieldName);
  }
  if (text.length > maxLength) {
    throw new ValidationError(`${fieldName} is too long`, fieldName);
  }
  return true;
};

// Fungsi validasi level (untuk RPP)
export const validateLevel = (level) => {
  const validLevels = ['dasar', 'menengah', 'lanjut', 'basic', 'intermediate', 'advanced'];
  if (!level || typeof level !== 'string') {
    throw new ValidationError('Level is required', 'level');
  }
  if (!validLevels.includes(level.toLowerCase())) {
    throw new ValidationError(`Invalid level. Must be one of: ${validLevels.join(', ')}`, 'level');
  }
  return true;
};

// Fungsi validasi tipe fitur
export const validateFeatureType = (featureType) => {
  const validFeatureTypes = [
    'tasykil', 'irob', 'mantiq', 'rpp', 'translation', 
    'analysis_general', 'analysis_tafsir', 'analysis_ushul', 
    'analysis_hadis', 'analysis_balaghah', 'summarization', 
    'formatting', 'grammar_validation'
  ];
  
  if (!featureType || typeof featureType !== 'string') {
    throw new ValidationError('Feature type is required', 'featureType');
  }
  
  if (!validFeatureTypes.includes(featureType.toLowerCase())) {
    throw new ValidationError(`Invalid feature type. Must be one of: ${validFeatureTypes.join(', ')}`, 'featureType');
  }
  
  return true;
};

// Fungsi validasi input pengguna
export const validateUserInput = (input) => {
  if (!input || typeof input !== 'object') {
    throw new ValidationError('Input must be an object', 'input');
  }
  
  const errors = [];
  
  // Validasi email jika disediakan
  if (input.email !== undefined) {
    try {
      validateEmail(input.email);
    } catch (error) {
      errors.push(error.validationErrors[0]);
    }
  }
  
  // Validasi password jika disediakan
  if (input.password !== undefined) {
    try {
      validatePassword(input.password);
    } catch (error) {
      errors.push(error.validationErrors[0]);
    }
  }
  
  // Validasi username jika disediakan
  if (input.username !== undefined) {
    try {
      validateUsername(input.username);
    } catch (error) {
      errors.push(error.validationErrors[0]);
    }
  }
  
  // Validasi teks Arab jika disediakan
  if (input.arabicText !== undefined) {
    try {
      validateArabicText(input.arabicText);
    } catch (error) {
      errors.push(error.validationErrors[0]);
    }
  }
  
  // Validasi teks biasa jika disediakan
  if (input.text !== undefined) {
    try {
      validateText(input.text, 'text');
    } catch (error) {
      errors.push(error.validationErrors[0]);
    }
  }
  
  // Validasi ID jika disediakan
  if (input.id !== undefined) {
    try {
      validateId(input.id);
    } catch (error) {
      errors.push(error.validationErrors[0]);
    }
  }
  
  if (errors.length > 0) {
    const error = new ValidationError('Validation failed', 'input');
    error.validationErrors = errors;
    throw error;
  }
  
  return true;
};

// Fungsi untuk membersihkan input (sanitasi)
export const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    // Hapus karakter HTML dan script berbahaya
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .trim();
  } else if (typeof input === 'object' && input !== null) {
    const sanitized = {};
    for (const key in input) {
      if (input.hasOwnProperty(key)) {
        sanitized[key] = sanitizeInput(input[key]);
      }
    }
    return sanitized;
  }
  return input;
};

// Fungsi untuk menangani error dan mengembalikan respons yang sesuai
export const handleServiceError = (error, context = '') => {
  console.error(`Error in ${context}:`, error);

  // Jika error sudah merupakan instance dari SantrilogyError, kembalikan sebagaimana adanya
  if (error instanceof SantrilogyError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      statusCode: error.statusCode
    };
  }

  // Jika error merupakan ValidationError
  if (error instanceof ValidationError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
      validationErrors: error.validationErrors
    };
  }

  // Jika error merupakan error dari Supabase
  if (error.error && error.error.code) {
    return {
      success: false,
      error: error.error.message || 'Database error occurred',
      code: error.error.code,
      statusCode: error.status || 500
    };
  }

  // Jika error merupakan error dari Gemini
  if (error.message && (error.message.includes('Google') || error.message.includes('Gemini'))) {
    return {
      success: false,
      error: 'AI service is temporarily unavailable',
      code: 'AI_SERVICE_ERROR',
      statusCode: 503
    };
  }

  // Error umum
  return {
    success: false,
    error: 'An unexpected error occurred',
    code: 'INTERNAL_ERROR',
    statusCode: 500
  };
};

// Middleware untuk validasi request
export const validateRequest = (requiredFields = [], fieldValidators = {}) => {
  return (req, res, next) => {
    try {
      const body = req.body || {};
      
      // Validasi field wajib
      for (const field of requiredFields) {
        if (body[field] === undefined || body[field] === null || 
            (typeof body[field] === 'string' && body[field].trim() === '')) {
          throw new ValidationError(`${field} is required`, field);
        }
      }
      
      // Validasi khusus untuk field tertentu
      for (const [field, validator] of Object.entries(fieldValidators)) {
        if (body[field] !== undefined) {
          validator(body[field]);
        }
      }
      
      next();
    } catch (error) {
      const errorResponse = handleServiceError(error, 'validateRequest');
      res.status(errorResponse.statusCode).json({
        success: false,
        error: errorResponse.error,
        validationErrors: errorResponse.validationErrors
      });
    }
  };
};

// Fungsi untuk memvalidasi respons dari AI sebelum ditampilkan
export const validateAIResponse = (response) => {
  if (!response || typeof response !== 'string') {
    throw new ValidationError('AI response is invalid', 'aiResponse');
  }
  
  // Cek apakah respons mengandung konten yang tidak pantas
  const inappropriateContent = [
    'kafir', 'haram', 'makruh', // hanya contoh, dalam implementasi nyata perlu daftar lengkap
    'javascript:', 'vbscript:', '<script', 'onerror', 'onload'
  ];
  
  const lowerResponse = response.toLowerCase();
  for (const content of inappropriateContent) {
    if (lowerResponse.includes(content)) {
      throw new ValidationError('AI response contains inappropriate content', 'aiResponse');
    }
  }
  
  return true;
};

// Fungsi untuk logging error
export const logError = (error, context = '', additionalData = {}) => {
  console.error({
    timestamp: new Date().toISOString(),
    context,
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    },
    additionalData
  });
};

// Fungsi untuk memastikan pengguna terotentikasi
export const requireAuth = async (userId) => {
  if (!userId) {
    throw new AuthenticationError('User must be authenticated');
  }
  
  // Dalam implementasi nyata, di sini bisa dicek apakah user_id valid di database
  // atau session masih aktif
  
  return true;
};

// Fungsi untuk memastikan pengguna memiliki izin untuk mengakses resource
export const requireOwnership = async (userId, resourceId, resourceType = 'session') => {
  await requireAuth(userId);
  
  // Dalam implementasi nyata, di sini dicek apakah userId adalah pemilik dari resource
  // Misalnya dengan memeriksa apakah sesi/chat milik user tersebut
  
  // Contoh sederhana - dalam implementasi nyata perlu query ke database
  if (!userId || !resourceId) {
    throw new AuthorizationError('Invalid user or resource ID');
  }
  
  return true;
};