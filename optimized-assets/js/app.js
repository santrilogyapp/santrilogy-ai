/**
 * SANTRILOGY AI - Frontend Application
 * Refactored with proper initialization and error handling
 */

// Core application functionality
let recognition;
let isListening = false;

document.addEventListener('DOMContentLoaded', function() {
    console.log("Initializing Santrilogy Frontend...");

    // 1. Setup Elements & Listeners safely
    const actionBtn = document.getElementById('sendMicBtn'); // Using the correct ID from the XML
    const userPrompt = document.getElementById('userPrompt');
    const toolsModal = document.getElementById('toolsModal');
    
    // Initialize core functionality
    initSpeechRecognition();
    
    if (actionBtn) {
        actionBtn.addEventListener('click', handleActionClick);
    } else {
        console.warn('Action button (#sendMicBtn) not found');
    }
    
    if (userPrompt) {
        // Use the inline handler for input since it's already defined in the XML
        userPrompt.addEventListener('keydown', handleKeyDown);
    } else {
        console.warn('User prompt (#userPrompt) not found');
    }

    // Initialize mobile swipe gestures if elements exist
    if (toolsModal) {
        setupSwipeGesture();
    } else {
        console.warn('Tools modal (#toolsModal) not found');
    }
    
    // Initialize scroll to top for welcome screen
    setTimeout(() => {
        if (document.querySelector('.welcome')) {
            window.scrollTo(0, 0);
        }
    }, 100);

    console.log("Santrilogy Frontend initialized successfully");
});

function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleActionClick();
    }
}

function handleActionClick() {
    const input = document.getElementById('userPrompt');
    
    if (!input) {
        console.error('User prompt element not found');
        return;
    }
    
    if (input.value.trim().length > 0) {
        sendMessage();
    } else {
        handleSendMic();
    }
}

// Santrilogy-specific functions
async function sendMessage() {
    const input = document.getElementById('userPrompt');
    
    if (!input) {
        console.error('User prompt element not found');
        return;
    }
    
    const text = input.value.trim();
    
    if (!text) {
        console.warn('No message to send');
        return; // Guard clause
    }
    
    console.log("Sending message:", text); // Debugging
    
    try {
        // 1. Tampilkan Chat User di UI
        addBubble(text, 'user');
        input.value = ''; // Kosongkan input

        // Update button state after clearing input
        handleInput();
        
        // 2. Tampilkan Loading Skeleton
        const loadingId = addLoadingBubble();

        // 3. Panggil AI
        const aiResponse = await chatWithSantrilogy(text);

        // 4. Hapus Loading, Tampilkan Jawaban AI
        removeLoadingBubble(loadingId);
        addBubble(aiResponse, 'ai');
        
    } catch (error) {
        console.error("Error sending message:", error);
        addBubble("Maaf kawan, sedang ada gangguan koneksi ke server pusat.", 'ai');
    }
}

// Toggle icon based on input content
function handleInput() {
    const input = document.getElementById('userPrompt');
    const btn = document.getElementById('sendMicBtn');
    const icon = document.getElementById('actionIcon');
    
    if (!input) {
        console.warn('User prompt element not found in handleInput');
        return;
    }
    
    if (!btn) {
        console.warn('Action button element not found in handleInput');
        return;
    }
    
    // Auto resize textarea
    input.style.height = 'auto';
    input.style.height = (input.scrollHeight) + 'px';
    if(input.value === '') input.style.height = 'auto';

    // Toggle Icon
    if (input.value.trim().length > 0) {
        btn.className = 'send-mic-btn send';
        if (icon) icon.className = 'fas fa-paper-plane';
    } else {
        btn.className = 'send-mic-btn mic';
        if (icon) icon.className = 'fas fa-microphone';
    }
}

// Core chat functionality
async function chatWithSantrilogy(userMessage) {
    const CONFIG = {
        FUNCTION_URL: "https://jbbathydxvpgmgtauadm.supabase.co/functions/v1/chat-engine",
        SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpiYmF0aHlkeHZwZ21ndGF1YWRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MTMyNjMsImV4cCI6MjA4MDA4OTI2M30.9uUtMwX4G5gmhbFHv1l7DgNTedQtiWqSzZ_VgWYzFAo"
    };

    try {
        console.log("Mengirim pesan ke Santrilogy...", userMessage);

        const response = await fetch(CONFIG.FUNCTION_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${CONFIG.SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({
                prompt: userMessage
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.answer; // Mengembalikan teks jawaban AI

    } catch (error) {
        console.error("Santrilogy Error:", error);
        return "Maaf kawan, sedang ada gangguan koneksi ke server pusat.";
    }
}

// UI helper functions
function addBubble(text, type) {
    const mainElement = document.getElementById('main');
    
    if (!mainElement) {
        console.error('Main container not found for adding bubble');
        return;
    }
    
    const div = document.createElement('div');
    div.className = type === 'user' ? 'post-outer user-bubble' : 'post-outer ai-bubble';
    // Properly formatted bubble with avatar, header, and actions
    div.innerHTML = `<div class="msg">${type === 'user' ? 
      '<div class="msg-avatar user">U</div>' : 
      '<div class="msg-avatar ai"><div class="atom-mini"><div class="atom-nucleus"/><div class="atom-orbit orbit-1"/></div></div></div>'}
      <div class="msg-body">
        <div class="msg-header">
          <span class="msg-name">${type === 'user' ? 'You' : 'Santrilogy AI'}</span>
          <span class="msg-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
        <div class="post-body">${text}</div>
        <div class="msg-actions">
          <span class="msg-action" title="Copy"><i class="fas fa-copy"/></span>
          <span class="msg-action" title="Regenerate"><i class="fas fa-rotate"/></span>
          <span class="msg-action" title="Like"><i class="fas fa-thumbs-up"/></span>
          <span class="msg-action" title="Dislike"><i class="fas fa-thumbs-down"/></span>
        </div>
      </div>
    </div>`;
    
    mainElement.appendChild(div);

    // Auto Scroll to bottom
    const chatArea = document.getElementById('chatArea');
    if (chatArea) {
        chatArea.scrollTop = chatArea.scrollHeight;
    }
}

function addLoadingBubble() {
    const mainElement = document.getElementById('main');
    
    if (!mainElement) {
        console.error('Main container not found for adding loading bubble');
        return;
    }
    
    const id = 'loading-' + Date.now();
    const div = document.createElement('div');
    div.id = id;
    div.className = 'post-outer ai-bubble';
    div.innerHTML = `<div class="msg">
      <div class="msg-avatar ai">
        <div class="atom-mini">
          <div class="atom-nucleus"/>
          <div class="atom-orbit orbit-1"/>
        </div>
      </div>
      <div class="msg-body">
        <div class="msg-header">
          <span class="msg-name">Santrilogy AI</span>
          <span class="msg-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
        <div class="post-body">Sedang membuka kitab...</div>
      </div>
    </div>`;
    
    mainElement.appendChild(div);
    return id;
}

function removeLoadingBubble(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

// Speech Recognition Functions
function initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'id-ID'; // Set to Indonesian language
        recognition.maxAlternatives = 1;

        recognition.onresult = function(event) {
            let transcript = '';
            for (let i = 0; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    transcript = event.results[i][0].transcript;
                } else {
                    transcript += event.results[i][0].transcript;
                }
            }
            
            const input = document.getElementById('userPrompt');
            if (input) {
                input.value = transcript;
                handleInput(); // Update button state
            }
        };

        recognition.onerror = function(event) {
            console.error('Speech recognition error', event.error);
            stopListening();
        };

        recognition.onend = function() {
            // Don't automatically stop listening - let the user decide
            // For mobile, we might need to restart in some cases
            if (isListening) {
                // On some mobile browsers, we need to restart recognition for continuous use
                setTimeout(() => {
                    if (isListening && recognition) {
                        try {
                            recognition.start();
                        } catch (e) {
                            console.log('Could not restart recognition:', e);
                            stopListening();
                        }
                    }
                }, 100);
            }
        };
    } else {
        console.warn('Browser Anda tidak mendukung fitur Speech Recognition. Silakan gunakan browser modern seperti Chrome.');
        stopListening();
    }
}

function handleSendMic() {
    if (!isListening) {
        startVoice();
    } else {
        stopListening();
    }
}

function startVoice() {
    if (!recognition) {
        initSpeechRecognition();
    }

    if (recognition) {
        try {
            const btn = document.getElementById('sendMicBtn');
            const icon = document.getElementById('actionIcon');
            
            if (btn) {
                btn.className = 'send-mic-btn send';
            }
            
            if (icon) {
                icon.className = 'fas fa-circle';
            }
            
            recognition.start();
            isListening = true;
        } catch (error) {
            console.error('Error starting recognition:', error);
            // Mobile Safari and some other mobile browsers may require user gesture to enable speech recognition
            if (error.message && error.message.includes('no-speech')) {
                alert('Silakan ucapkan sesuatu. Jika tidak berfungsi, pastikan izin mikrofon telah diberikan.');
            }
            stopListening();
        }
    }
}

function stopListening() {
    if (recognition && isListening) {
        try {
            recognition.stop();
        } catch (e) {
            console.log('Recognition stop error:', e);
        }
        
        const btn = document.getElementById('sendMicBtn');
        const icon = document.getElementById('actionIcon');
        
        if (btn) {
            btn.className = 'send-mic-btn mic';
        }
        
        if (icon) {
            icon.className = 'fas fa-microphone';
        }
        
        isListening = false;
    }
}

// Swipe Gesture Function for Mobile Modal
function setupSwipeGesture() {
    const modal = document.getElementById('toolsModal');
    if (!modal) {
        console.warn('Tools modal not found for swipe gesture setup');
        return;
    }
    
    let startY = 0;
    let currentY = 0;
    let isSwiping = false;
    
    modal.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        isSwiping = true;
    });
    
    modal.addEventListener('touchmove', (e) => {
        if (!isSwiping) return;
        
        currentY = e.touches[0].clientY;
        const deltaY = currentY - startY;
        
        // Only allow swiping down
        if (deltaY > 0) {
            modal.style.transform = `translateY(${deltaY}px)`;
        }
    });
    
    modal.addEventListener('touchend', (e) => {
        if (!isSwiping) return;
        
        const deltaY = currentY - startY;
        const threshold = 100; // Minimum distance to close modal
        
        if (deltaY > threshold) {
            // Swipe down enough to close the modal
            closeToolsModal();
        } else {
            // Reset position
            modal.style.transform = 'translateY(0)';
        }
        
        isSwiping = false;
    });
}

// Additional UI functions
function closeToolsModal() {
    const modal = document.getElementById('toolsModal');
    const overlay = document.getElementById('toolsOverlay');
    
    if (modal) {
        modal.classList.remove('show');
    }
    
    if (overlay) {
        overlay.classList.remove('show');
    }
    
    if (document.body) {
        document.body.style.overflow = '';
    }
}

// Other UI functions that might be called from XML
function askQuestion(question) {
    const input = document.getElementById('userPrompt');
    if (input) {
        input.value = question;
        handleInput(); // Update button state
    }
}

// More dropdown functions
function toggleMoreDropdown() {
    const dropdown = document.getElementById('moreDropdown');
    const isVisible = dropdown && dropdown.classList.contains('show');
    
    if (isVisible) {
        closeMoreDropdown();
    } else if (dropdown) {
        dropdown.classList.add('show');
        // Close dropdown when clicking outside
        setTimeout(() => {
            document.addEventListener('click', closeMoreDropdownOnClickOutside);
        }, 10);
    }
}

function closeMoreDropdown() {
    const dropdown = document.getElementById('moreDropdown');
    if (dropdown) {
        dropdown.classList.remove('show');
        document.removeEventListener('click', closeMoreDropdownOnClickOutside);
    }
}

function closeMoreDropdownOnClickOutside(event) {
    const dropdown = document.getElementById('moreDropdown');
    const moreBtn = document.querySelector('[onclick*="toggleMoreDropdown"]');
    
    if (dropdown && !dropdown.contains(event.target) && moreBtn && !moreBtn.contains(event.target)) {
        closeMoreDropdown();
    }
}

// More menu functions
function shareCurrentPage() {
    if (navigator.share) {
        navigator.share({
            title: 'Santrilogy AI',
            text: 'Check out Santrilogy AI - Your virtual Islamic study companion',
            url: window.location.href
        }).catch(console.error);
    } else {
        // Fallback: Copy to clipboard
        navigator.clipboard.writeText(window.location.href).then(() => {
            alert('Link copied to clipboard!');
        });
    }
    closeMoreDropdown();
}

function downloadApp() {
    alert('Download App feature coming soon!');
    closeMoreDropdown();
}

function showPrivacyPolicy() {
    alert('Privacy Policy page coming soon!');
    closeMoreDropdown();
}

function showTermsConditions() {
    alert('Terms & Conditions page coming soon!');
    closeMoreDropdown();
}

// Responsive toggle for tools
function toggleToolsResponsive() {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // On mobile, show the mobile modal with slide up animation
        showToolsModal();
    } else {
        // On desktop, toggle the desktop dropdown
        toggleTools();
    }
}

// Modified showToolsModal to add swipe gesture support
function showToolsModal() {
    const modal = document.getElementById('toolsModal');
    const overlay = document.getElementById('toolsOverlay');
    
    // Show the modal with slide up animation
    if (modal) {
        modal.classList.add('show');
    }
    
    if (overlay) {
        overlay.classList.add('show');
    }
    
    if (document.body) {
        document.body.style.overflow = 'hidden';
    }
}

// Toggle desktop tools dropdown
function toggleTools() {
    const dropdown = document.getElementById('toolsDropdown');
    const isVisible = dropdown && dropdown.classList.contains('show');
    
    if (isVisible) {
        closeToolsDropdown();
    } else if (dropdown) {
        dropdown.classList.add('show');
        // Close dropdown when clicking outside
        setTimeout(() => {
            document.addEventListener('click', closeToolsDropdownOnClickOutside);
        }, 10);
    }
}

function closeToolsDropdown() {
    const dropdown = document.getElementById('toolsDropdown');
    if (dropdown) {
        dropdown.classList.remove('show');
        document.removeEventListener('click', closeToolsDropdownOnClickOutside);
    }
}

function closeToolsDropdownOnClickOutside(event) {
    const dropdown = document.getElementById('toolsDropdown');
    const plusBtn = document.getElementById('plusBtn');
    
    if (dropdown && !dropdown.contains(event.target) && plusBtn && !plusBtn.contains(event.target)) {
        closeToolsDropdown();
    }
}

// Custom theme color functions
function openColorPicker() {
    const colorPicker = document.getElementById('customColorPicker');
    if (colorPicker) {
        colorPicker.click();
    }
}

function applyCustomColor(color) {
    // Update --accent variable
    if (document.documentElement) {
        document.documentElement.style.setProperty('--accent', color);
    }
    
    // Generate a complementary color for --accent-2
    const accent2 = calculateComplementaryColor(color);
    if (document.documentElement) {
        document.documentElement.style.setProperty('--accent-2', accent2);
    }
    
    // Update --gradient-1 based on the custom color
    const gradient = `linear-gradient(135deg, ${color} 0%, ${accent2} 50%, #06b6d4 100%)`;
    if (document.documentElement) {
        document.documentElement.style.setProperty('--gradient-1', gradient);
    }
    
    // Update data-accent attribute on body to track custom theme
    if (document.body) {
        document.body.setAttribute('data-accent', 'custom');
    }
    
    // Remove active class from all color pills and add it to custom
    const colorPills = document.querySelectorAll('.color-pill, .mobile-color-btn');
    colorPills.forEach(pill => {
        pill.classList.remove('active');
    });
    
    // Find and activate the custom color pill
    const customColorPill = document.querySelector('.c-custom, .mobile-color-btn[onclick*="openColorPicker"]');
    if (customColorPill) {
        customColorPill.classList.add('active');
    }
}

function calculateComplementaryColor(color) {
    // Convert hex to RGB
    let r = 0, g = 0, b = 0;
    if (color.length === 7) {
        r = parseInt(color.substring(1, 3), 16);
        g = parseInt(color.substring(3, 5), 16);
        b = parseInt(color.substring(5, 7), 16);
    }
    
    // Generate a complementary color by adjusting RGB values
    r = Math.min(255, r + 50);
    g = Math.min(255, g + 30);
    b = Math.min(255, b + 70);
    
    // Ensure the color is not too light
    if (r > 220 && g > 220 && b > 220) {
        r = Math.max(0, r - 100);
        g = Math.max(0, g - 100);
        b = Math.max(0, b - 100);
    }
    
    return `rgb(${r}, ${g}, ${b})`;
}