// index.js - Main entry point for Santrilogy AI
// This file orchestrates the entire application following Gemini AI patterns

import config from './config.js';
import { initializeGemini } from './gemini-connector.js';
import './supabase-client.js'; // Import to initialize Supabase
import { startNewChat, sendMessage, sendSpecializedMessage, getFullConversation } from './chat-service.js';
import {
  tasykilText,
  irobText,
  mantiqAnalysis,
  createRPPFromArabic,
  searchKitabKuning,
  translateArabicText,
  analyzeArabicText,
  summarizeText,
  formatArabicText,
  validateArabicGrammar
} from './specialized-features.js';

// Validate configuration on startup
const validationResult = config.validate();
if (!validationResult.isValid) {
  console.error('Configuration validation failed:', validationResult.errors);
  console.warn('Some features may be disabled due to missing configuration.');
}

// Initialize the AI system
const initializeSantrilogy = () => {
  // Initialize Gemini if API key is available
  if (config.FEATURES.ENABLE_GEMINI) {
    initializeGemini();
    console.log('✓ Santrilogy AI initialized with Gemini integration');
  } else {
    console.warn('⚠ Gemini integration disabled - missing API key');
  }
  
  // Log feature status
  console.log(`✓ Supabase integration: ${config.FEATURES.ENABLE_SUPABASE ? 'enabled' : 'disabled'}`);
  console.log(`✓ File upload: ${config.FEATURES.ENABLE_FILE_UPLOAD ? 'enabled' : 'disabled'}`);
  console.log(`✓ History: ${config.FEATURES.ENABLE_HISTORY ? 'enabled' : 'disabled'}`);
  console.log(`✓ Specialized features: ${config.FEATURES.ENABLE_SPECIALIZED_FEATURES ? 'enabled' : 'disabled'}`);
};

// Main Santrilogy AI class - matches Gemini AI patterns
class SantrilogyAI {
  constructor() {
    this.config = config;
    this.initialized = false;
    initializeSantrilogy();
    this.initialized = true;
  }

  // Chat functionality matching Gemini patterns
  async startNewChat(userId, initialPrompt = null) {
    if (!this.initialized) throw new Error('Santrilogy AI not initialized');
    return await startNewChat(userId, initialPrompt);
  }

  async sendMessage(sessionId, userId, message, options = {}) {
    if (!this.initialized) throw new Error('Santrilogy AI not initialized');
    return await sendMessage(sessionId, userId, message, options);
  }

  async sendSpecializedMessage(sessionId, userId, message, featureType, options = {}) {
    if (!this.initialized) throw new Error('Santrilogy AI not initialized');
    return await sendSpecializedMessage(sessionId, userId, message, featureType, options);
  }

  async getConversation(sessionId, userId) {
    if (!this.initialized) throw new Error('Santrilogy AI not initialized');
    return await getFullConversation(sessionId, userId);
  }

  // Specialized Islamic features
  async performTasykil(userId, arabicText) {
    if (!this.initialized) throw new Error('Santrilogy AI not initialized');
    return await tasykilText(userId, arabicText);
  }

  async performIrob(userId, arabicText) {
    if (!this.initialized) throw new Error('Santrilogy AI not initialized');
    return await irobText(userId, arabicText);
  }

  async performMantiq(userId, query) {
    if (!this.initialized) throw new Error('Santrilogy AI not initialized');
    return await mantiqAnalysis(userId, query);
  }

  async createRPP(userId, arabicText, lessonTitle, level = 'menengah') {
    if (!this.initialized) throw new Error('Santrilogy AI not initialized');
    return await createRPPFromArabic(userId, arabicText, lessonTitle, level);
  }

  async searchKitab(userId, query) {
    if (!this.initialized) throw new Error('Santrilogy AI not initialized');
    return await searchKitabKuning(userId, query);
  }

  async translateArabic(userId, arabicText, targetLanguage = 'id') {
    if (!this.initialized) throw new Error('Santrilogy AI not initialized');
    return await translateArabicText(userId, arabicText, targetLanguage);
  }

  async analyzeArabic(userId, arabicText, analysisType = 'general') {
    if (!this.initialized) throw new Error('Santrilogy AI not initialized');
    return await analyzeArabicText(userId, arabicText, analysisType);
  }

  async summarize(userId, text, maxSentences = 5) {
    if (!this.initialized) throw new Error('Santrilogy AI not initialized');
    return await summarizeText(userId, text, maxSentences);
  }

  async formatArabic(userId, arabicText) {
    if (!this.initialized) throw new Error('Santrilogy AI not initialized');
    return await formatArabicText(userId, arabicText);
  }

  async validateGrammar(userId, arabicText) {
    if (!this.initialized) throw new Error('Santrilogy AI not initialized');
    return await validateArabicGrammar(userId, arabicText);
  }

  // Get system status
  getStatus() {
    return {
      initialized: this.initialized,
      version: this.config.APP.VERSION,
      environment: this.config.APP.ENVIRONMENT,
      features: {
        supabase: this.config.FEATURES.ENABLE_SUPABASE,
        gemini: this.config.FEATURES.ENABLE_GEMINI,
        fileUpload: this.config.FEATURES.ENABLE_FILE_UPLOAD,
        history: this.config.FEATURES.ENABLE_HISTORY,
        specializedFeatures: this.config.FEATURES.ENABLE_SPECIALIZED_FEATURES
      },
      timestamp: new Date().toISOString()
    };
  }
}

// Create global instance to match Gemini AI patterns
const santrilogyAI = new SantrilogyAI();

// Export for use in other modules
export default santrilogyAI;
export { SantrilogyAI, config };