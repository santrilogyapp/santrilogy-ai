/**
 * Santrilogy AI - JavaScript Application Logic
 *
 * This file contains all the JavaScript functionality for the Santrilogy AI
 * Blogger template. It handles UI interactions, mobile gestures, tool functionality,
 * and user preferences.
 *
 * Features:
 * - Sidebar navigation and responsive behavior
 * - Mobile-friendly tools modal with swipe gestures
 * - Theme switching (light/dark mode)
 * - Accent color customization
 * - Font size adjustments
 * - Smart tools functionality (translation, i'rob, etc.)
 * - Voice input handling
 * - Keyboard shortcuts
 *
 * @author Santrilogy AI Team
 * @version 1.0.0
 */

// ============================================
// SECURITY CONFIGURATION
// ============================================

/**
 * API Configuration Object
 *
 * For security reasons, API keys should NOT be hardcoded here.
 * Instead:
 * 1. Store API keys in environment variables on the server side
 * 2. Pass keys to frontend via secure server endpoints when needed
 * 3. Or use a separate config file that's not committed to version control
 * 4. Consider using server-side proxy for API calls to hide keys
 *
 * Example structure for future API integration:
 */
const API_CONFIG = {
  // Supabase Configuration - DO NOT hardcode keys here
  SUPABASE: {
    // These should ideally be loaded from a secure endpoint
    // url: process.env.SUPABASE_URL || '', // Recommended: load via secure API endpoint
    // anonKey: process.env.SUPABASE_ANON_KEY || '', // Recommended: load via secure API endpoint
  },

  // Gemini Configuration - DO NOT hardcode keys here
  GEMINI: {
    // These should ideally be loaded from a secure endpoint
    // apiKey: process.env.GEMINI_API_KEY || '', // Recommended: load via secure API endpoint
    // model: 'gemini-pro', // Default model
  },

  // Backend API Configuration
  BACKEND: {
    baseUrl: '/api/', // Base URL for backend API calls
  }
};

/**
 * Important Security Notes:
 *
 * 1. Never store sensitive API keys (Supabase, Gemini, etc.) in client-side code
 * 2. All API keys should be stored server-side and accessed via secure endpoints
 * 3. Use environment variables for API keys in production environments
 * 4. Consider implementing server-side proxy for all AI and database calls
 * 5. Implement proper authentication and authorization mechanisms
 * 6. Use HTTPS for all API communications
 * 7. Validate and sanitize all inputs on the server side
 *
 * If you need to customize the API keys for deployment without git push:
 * - Create a separate config file (e.g., config.local.js) that's git-ignored
 * - Load that file separately before this one
 * - Override the API_CONFIG values with your local configurations
 */

// ============================================
// SANTRILOGY AI APPLICATION MAIN LOGIC
// ============================================

// Global variables for DOM elements
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const userPrompt = document.getElementById('userPrompt');
const sendMicBtn = document.getElementById('sendMicBtn');
const plusBtn = document.getElementById('plusBtn');
const profileChevron = document.getElementById('profileChevron');

// Desktop dropdown elements
const toolsDropdown = document.getElementById('toolsDropdown');
const settingsDropdown = document.getElementById('settingsDropdown');

// Mobile modal elements
const toolsModal = document.getElementById('toolsModal');
const toolsOverlay = document.getElementById('toolsOverlay');
const settingsModal = document.getElementById('settingsModal');
const settingsOverlay = document.getElementById('settingsOverlay');

// Theme toggle elements
const darkToggleDesktop = document.getElementById('darkToggleDesktop');
const darkToggleMobile = document.getElementById('darkToggleMobile');

// State variables
let toolsOpen = false;
let settingsOpen = false;

// ============================================
// GENERAL UTILITY FUNCTIONS
// ============================================

/**
 * Detects if the current device is mobile-sized
 * @returns {boolean} True if screen width is <= 768px
 */
function isMobile() {
  return window.innerWidth <= 768;
}

// ============================================
// SIDEBAR NAVIGATION LOGIC
// ============================================

/**
 * Toggle the sidebar visibility (desktop/mobile)
 */
function toggleSidebar() {
  sidebar.classList.toggle('collapsed');
  overlay.classList.toggle('show');
}

/**
 * Close the sidebar navigation
 */
function closeSidebar() {
  sidebar.classList.add('collapsed');
  overlay.classList.remove('show');
  closeAllDropdowns();
}

/**
 * Initialize sidebar based on current screen size
 */
function initSidebar() {
  if (isMobile()) {
    sidebar.classList.add('collapsed');
  } else {
    sidebar.classList.remove('collapsed');
  }
}

// Initialize sidebar and set up resize handler
initSidebar();
window.addEventListener('resize', function() {
  initSidebar();
  closeAllDropdowns();
  closeAllModals();
});

// ============================================
// DROPDOWN AND MODAL MANAGEMENT
// ============================================

/**
 * Close all dropdown menus in the application
 */
function closeAllDropdowns() {
  toolsOpen = false;
  settingsOpen = false;
  toolsDropdown.classList.remove('show');
  settingsDropdown.classList.remove('show');
  plusBtn.querySelector('i').className = 'fas fa-plus-circle';
  profileChevron.style.transform = 'rotate(0deg)';
}

/**
 * Close all modal windows in the application
 */
function closeAllModals() {
  toolsModal.classList.remove('show');
  toolsOverlay.classList.remove('show');
  settingsModal.classList.remove('show');
  settingsOverlay.classList.remove('show');
  document.body.style.overflow = '';
}

// ============================================
// TOOLS FUNCTIONALITY (Desktop vs Mobile)
// ============================================

/**
 * Toggle tools menu - uses dropdown on desktop, modal on mobile
 */
function toggleTools() {
  if (isMobile()) {
    openToolsModal();
  } else {
    toggleToolsDropdown();
  }
}

/**
 * Toggle the tools dropdown menu (desktop version)
 */
function toggleToolsDropdown() {
  closeSettingsDropdown();
  toolsOpen = !toolsOpen;
  toolsDropdown.classList.toggle('show', toolsOpen);
  plusBtn.querySelector('i').className = toolsOpen ? 'fas fa-times' : 'fas fa-plus-circle';
}

/**
 * Close the tools dropdown menu
 */
function closeToolsDropdown() {
  toolsOpen = false;
  toolsDropdown.classList.remove('show');
  plusBtn.querySelector('i').className = 'fas fa-plus-circle';
}

/**
 * Open the tools modal (mobile version)
 */
function openToolsModal() {
  toolsModal.classList.add('show');
  toolsOverlay.classList.add('show');
  document.body.style.overflow = 'hidden';
}

/**
 * Close the tools modal
 */
function closeToolsModal() {
  toolsModal.classList.remove('show');
  toolsOverlay.classList.remove('show');
  document.body.style.overflow = '';
}

// ============================================
// SETTINGS FUNCTIONALITY (Desktop vs Mobile)
// ============================================

/**
 * Toggle settings menu - uses dropdown on desktop, modal on mobile
 */
function toggleSettings() {
  if (isMobile()) {
    closeSidebar();
    openSettingsModal();
  } else {
    toggleSettingsDropdown();
  }
}

/**
 * Toggle the settings dropdown menu (desktop version)
 */
function toggleSettingsDropdown() {
  closeToolsDropdown();
  settingsOpen = !settingsOpen;
  settingsDropdown.classList.toggle('show', settingsOpen);
  profileChevron.style.transform = settingsOpen ? 'rotate(180deg)' : 'rotate(0deg)';
}

/**
 * Close the settings dropdown menu
 */
function closeSettingsDropdown() {
  settingsOpen = false;
  settingsDropdown.classList.remove('show');
  profileChevron.style.transform = 'rotate(0deg)';
}

/**
 * Open the settings modal (mobile version)
 */
function openSettingsModal() {
  settingsModal.classList.add('show');
  settingsOverlay.classList.add('show');
  document.body.style.overflow = 'hidden';
}

/**
 * Close the settings modal
 */
function closeSettingsModal() {
  settingsModal.classList.remove('show');
  settingsOverlay.classList.remove('show');
  document.body.style.overflow = '';
}

// ============================================
// EVENT HANDLERS
// ============================================

// Handle clicks outside dropdowns to close them
document.addEventListener('click', function(e) {
  if (!isMobile()) {
    // Close tools dropdown
    if (toolsOpen && !toolsDropdown.contains(e.target) && !plusBtn.contains(e.target)) {
      closeToolsDropdown();
    }
    // Close settings dropdown
    if (settingsOpen && !settingsDropdown.contains(e.target) && 
        !e.target.closest('.profile-card') && 
        !e.target.closest('.nav-item[onclick*="toggleSettings"]')) {
      closeSettingsDropdown();
    }
  }
});

// ============================================
// INPUT FIELD HANDLING
// ============================================

/**
 * Handle input changes in the message field
 */
function handleInput() {
  const val = userPrompt.value.trim();
  const icon = sendMicBtn.querySelector('i');

  if (val.length > 0) {
    sendMicBtn.classList.remove('mic');
    sendMicBtn.classList.add('send');
    icon.className = 'fas fa-arrow-up';
  } else {
    sendMicBtn.classList.remove('send');
    sendMicBtn.classList.add('mic');
    icon.className = 'fas fa-microphone';
  }

  // Auto resize textarea
  userPrompt.style.height = 'auto';
  userPrompt.style.height = Math.min(userPrompt.scrollHeight, 120) + 'px';
}

/**
 * Handle keyboard events in the input field
 * @param {KeyboardEvent} e - The keyboard event
 */
function handleKeyDown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSendMic();
  }
}

/**
 * Handle send or microphone button click
 */
function handleSendMic() {
  const val = userPrompt.value.trim();
  if (val.length > 0) {
    sendMessage(val);
  } else {
    startVoice();
  }
}

/**
 * Send a message to the AI backend
 * @param {string} text - The message text to send
 */
function sendMessage(text) {
  console.log('Sending message:', text);
  // Add your send message logic here
  userPrompt.value = '';
  handleInput();
}

/**
 * Start voice recording using browser's speech recognition
 */
function startVoice() {
  console.log('Starting voice input');
  // Add voice recognition logic here

  // Example: Web Speech API
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.continuous = false;

    recognition.onresult = function(event) {
      const transcript = event.results[0][0].transcript;
      userPrompt.value = transcript;
      handleInput();
    };

    recognition.onerror = function(event) {
      console.error('Voice error:', event.error);
    };

    recognition.start();

    // Visual feedback
    sendMicBtn.style.background = '#ef4444';
    sendMicBtn.querySelector('i').className = 'fas fa-stop';

    recognition.onend = function() {
      sendMicBtn.style.background = '';
      handleInput();
    };
  } else {
    alert('Browser tidak mendukung voice input');
  }
}

// ============================================
// THEME MANAGEMENT (DARK MODE)
// ============================================

/**
 * Toggle between light and dark themes
 */
function toggleDarkMode() {
  const isDark = document.body.getAttribute('data-theme') === 'dark';
  const newTheme = isDark ? 'light' : 'dark';

  document.body.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);

  // Update both toggles
  updateDarkToggles(!isDark);
}

/**
 * Update the visual state of dark mode toggles
 * @param {boolean} isDark - Whether dark mode is currently active
 */
function updateDarkToggles(isDark) {
  if (darkToggleDesktop) {
    darkToggleDesktop.classList.toggle('on', isDark);
  }
  if (darkToggleMobile) {
    darkToggleMobile.classList.toggle('on', isDark);
  }
}

// ============================================
// CUSTOMIZATION OPTIONS
// ============================================

/**
 * Set the accent color theme
 * @param {HTMLElement} btn - The color button element that was clicked
 */
function setAccent(btn) {
  const accent = btn.dataset.accent;

  if (accent === 'indigo') {
    document.body.removeAttribute('data-accent');
  } else {
    document.body.setAttribute('data-accent', accent);
  }

  localStorage.setItem('accent', accent);

  // Update all color buttons
  document.querySelectorAll('.color-pill, .mobile-color-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.accent === accent);
  });
}

/**
 * Set the font size preference
 * @param {HTMLElement} btn - The size button element that was clicked
 */
function setFontSize(btn) {
  const size = btn.dataset.size;

  if (size === 'normal') {
    document.body.removeAttribute('data-fontsize');
  } else {
    document.body.setAttribute('data-fontsize', size);
  }

  localStorage.setItem('fontsize', size);

  // Update all size buttons
  document.querySelectorAll('.size-btn, .mobile-fontsize-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.size === size);
  });
}

// ============================================
// TOOL AND UPLOAD FUNCTIONALITY
// ============================================

/**
 * Handle usage of specialized tools (translation, i'rob, etc.)
 * @param {string} tool - The tool identifier to use
 */
function useTool(tool) {
  const prompts = {
    terjemah: 'Terjemahkan teks Arab berikut ke bahasa Indonesia:\n\n',
    irob: "Analisis i'rob (parsing nahwu) kalimat berikut:\n\n",
    harokat: 'Beri harakat/syakal pada teks Arab berikut:\n\n',
    logika: 'Analisis logika/silogisme dari pernyataan berikut:\n\n',
    belajar: 'Jelaskan secara detail step by step tentang:\n\n',
    quiz: 'Buatkan 5 soal quiz pilihan ganda tentang:\n\n'
  };

  userPrompt.value = prompts[tool] || '';
  userPrompt.focus();
  closeToolsDropdown();
  closeToolsModal();
  handleInput();
}

/**
 * Handle file upload functionality
 * @param {string} type - The type of upload (camera, gallery, document)
 */
function handleUpload(type) {
  closeToolsDropdown();
  closeToolsModal();

  const input = document.createElement('input');
  input.type = 'file';

  switch(type) {
    case 'camera':
      input.accept = 'image/*';
      input.capture = 'environment';
      break;
    case 'gallery':
      input.accept = 'image/*';
      break;
    case 'document':
      input.accept = '.pdf,.doc,.docx,.txt,.xls,.xlsx';
      break;
  }

  input.onchange = function(e) {
    const file = e.target.files[0];
    if (file) {
      console.log('Selected file:', file.name, file.type, file.size);
      // Handle file upload logic here
      userPrompt.value = `[Uploaded: ${file.name}]\n\nAnalisis file ini:`;
      handleInput();
    }
  };

  input.click();
}

// ============================================
// GENERAL APPLICATION FUNCTIONS
// ============================================

/**
 * Start a new chat session (resets current conversation)
 */
function startNewChat() {
  if (confirm('Mulai chat baru? Percakapan saat ini akan dihapus.')) {
    location.reload();
  }
}

/**
 * Pre-populate the input field with a question
 * @param {string} q - The question to pre-populate
 */
function askQuestion(q) {
  userPrompt.value = q;
  userPrompt.focus();
  handleInput();
}

/**
 * Clear all chat history
 */
function clearChats() {
  if (confirm('Hapus semua riwayat chat? Tindakan ini tidak dapat dibatalkan.')) {
    console.log('All chats cleared');
    closeSettingsDropdown();
    closeSettingsModal();
    // Add clear logic here
  }
}

// ============================================
// MOBILE GESTURE SUPPORT
// ============================================

/**
 * Set up swipe gesture functionality for modal windows
 * @param {HTMLElement} modal - The modal element to add swipe support to
 * @param {Function} closeFunc - The function to call when swiping down
 */
function setupSwipeGesture(modal, closeFunc) {
  let startY = 0;
  let currentY = 0;
  let isDragging = false;

  modal.addEventListener('touchstart', function(e) {
    if (e.target.closest('.modal-body')) {
      const scrollTop = modal.querySelector('.modal-body').scrollTop;
      if (scrollTop > 0) return;
    }
    startY = e.touches[0].clientY;
    isDragging = true;
  }, { passive: true });

  modal.addEventListener('touchmove', function(e) {
    if (!isDragging) return;
    currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;

    if (deltaY > 0) {
      modal.style.transform = `translateY(${deltaY}px)`;
      modal.style.transition = 'none';
    }
  }, { passive: true });

  modal.addEventListener('touchend', function() {
    if (!isDragging) return;
    isDragging = false;

    const deltaY = currentY - startY;
    modal.style.transition = '';

    if (deltaY > 100) {
      closeFunc();
    }

    modal.style.transform = '';
    startY = 0;
    currentY = 0;
  });
}

setupSwipeGesture(toolsModal, closeToolsModal);
setupSwipeGesture(settingsModal, closeSettingsModal);

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

// Set up keyboard shortcut handlers
document.addEventListener('keydown', function(e) {
  // Escape to close everything
  if (e.key === 'Escape') {
    closeAllDropdowns();
    closeAllModals();
    closeSidebar();
  }

  // Ctrl/Cmd + K to focus input
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    userPrompt.focus();
  }

  // Ctrl/Cmd + / to toggle sidebar
  if ((e.ctrlKey || e.metaKey) && e.key === '/') {
    e.preventDefault();
    toggleSidebar();
  }

  // Ctrl/Cmd + , to open settings
  if ((e.ctrlKey || e.metaKey) && e.key === ',') {
    e.preventDefault();
    toggleSettings();
  }
});

// ============================================
// INITIALIZE SAVED SETTINGS
// ============================================

// Load saved user preferences from localStorage
(function loadSettings() {
  // Theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.setAttribute('data-theme', 'dark');
    updateDarkToggles(true);
  }

  // Accent color
  const savedAccent = localStorage.getItem('accent');
  if (savedAccent && savedAccent !== 'indigo') {
    document.body.setAttribute('data-accent', savedAccent);
    document.querySelectorAll('.color-pill, .mobile-color-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.accent === savedAccent);
    });
  }

  // Font size
  const savedFontSize = localStorage.getItem('fontsize');
  if (savedFontSize && savedFontSize !== 'normal') {
    document.body.setAttribute('data-fontsize', savedFontSize);
    document.querySelectorAll('.size-btn, .mobile-fontsize-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.size === savedFontSize);
    });
  }
})();

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Scroll chat area to the bottom
 */
function scrollToBottom() {
  const chatArea = document.getElementById('chatArea');
  if (chatArea) {
    chatArea.scrollTop = chatArea.scrollHeight;
  }
}

// ============================================
// APPLICATION INITIALIZATION
// ============================================

// Initialize application after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  scrollToBottom();

  // Focus input on desktop
  if (!isMobile()) {
    setTimeout(() => userPrompt.focus(), 100);
  }
});