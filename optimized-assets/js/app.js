/**
 * SANTRILOGY AI - Frontend Application
 * Refactored with defensive programming and verbose logging
 */

// Core application functionality
let recognition;
let isListening = false;

document.addEventListener('DOMContentLoaded', function() {
    console.log("Initializing Santrilogy Frontend with defensive programming...");

    // Initialize core functionality
    initSpeechRecognition();
    
    // Safe initialization of action button
    const actionBtn = document.getElementById('sendMicBtn');
    if (actionBtn) {
        console.log("Action button found, attaching click listener...");
        actionBtn.addEventListener('click', handleActionClick);
    } else {
        console.warn("Action button (#sendMicBtn) not found. User may not be able to send messages.");
    }
    
    // Safe initialization of input field
    const userPrompt = document.getElementById('userPrompt');
    if (userPrompt) {
        // Use the inline handler for input since it's already defined in the XML
        userPrompt.addEventListener('keydown', handleKeyDown);
        console.log("Input field found, attaching keydown listener...");
    } else {
        console.warn("User prompt (#userPrompt) not found. Text input functionality disabled.");
    }

    // Safe initialization of tools modal for swipe gesture
    const toolsModal = document.getElementById('toolsModal');
    if (toolsModal) {
        setupSwipeGesture();
        console.log("Tools modal found, swipe gesture enabled...");
    } else {
        console.warn("Tools modal (#toolsModal) not found. Swipe gesture disabled.");
    }
    
    // Safe initialization of other UI elements
    const plusBtn = document.getElementById('plusBtn');
    if (plusBtn) {
        console.log("Plus button found, attaching click listener...");
    } else {
        console.warn("Plus button (#plusBtn) not found.");
    }
    
    const toolsOverlay = document.getElementById('toolsOverlay');
    const toolsDropdown = document.getElementById('toolsDropdown');
    const settingsDropdown = document.getElementById('settingsDropdown');
    
    if (toolsOverlay) {
        console.log("Tools overlay found...");
    }
    if (toolsDropdown) {
        console.log("Tools dropdown found...");
    }
    if (settingsDropdown) {
        console.log("Settings dropdown found...");
    }

    // Initialize scroll to top for welcome screen
    const welcomeElement = document.querySelector('.welcome');
    if (welcomeElement) {
        console.log("Welcome screen found, setting timeout for scroll to top...");
        setTimeout(() => {
            window.scrollTo(0, 0);
        }, 100);
    } else {
        console.log("No welcome screen found, skipping scroll to top.");
    }

    console.log("Santrilogy Frontend initialized with defensive programming successfully");
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
        console.error('User prompt element not found in handleActionClick');
        return;
    }
    
    console.log("Handle action click: Input value length =", input.value.trim().length);
    
    if (input.value.trim().length > 0) {
        sendMessage();
    } else {
        handleSendMic();
    }
}

// Santrilogy-specific functions with defensive programming
async function sendMessage() {
    console.log("1. Starting sendMessage function...");
    
    const input = document.getElementById('userPrompt');
    
    if (!input) {
        console.error('User prompt element not found in sendMessage');
        addBubble("Error: Input field not found", 'ai');
        return;
    }
    
    const text = input.value.trim();
    console.log("2. Input value:", text);
    
    if (!text) {
        console.warn('No text to send');
        return; // Guard clause
    }
    
    console.log("3. Sending message:", text); // Debugging
    
    try {
        // 1. Reset UI
        input.value = '';
        handleInput(); // Reset icon
        
        // 2. Tampilkan User Bubble
        console.log("4. Menampilkan bubble user:", text);
        addBubble(text, 'user');

        // 3. Tampilkan Loading
        console.log("5. Menampilkan loading...");
        const loadingId = addLoadingBubble();

        // 4. Panggil API
        console.log("6. Memanggil API Supabase...");
        const reply = await chatWithSantrilogy(text);
        
        console.log("7. API Merespon:", reply); // Cek apakah reply kosong?
        
        // 5. Update UI
        removeLoadingBubble(loadingId);
        
        if (reply) {
            console.log("8. Adding AI bubble with response:", reply);
            addBubble(reply, 'ai');
        } else {
            console.warn("9. Reply is empty or undefined");
            addBubble("Maaf, AI tidak memberikan jawaban (Empty Response).", 'ai');
        }

    } catch (error) {
        console.error("CRITICAL ERROR di sendMessage:", error);
        removeLoadingBubble(loadingId);
        addBubble("Error: Gagal menghubungi server. Cek Console.", 'ai');
    }
}

// Toggle icon based on input content
function handleInput() {
    console.log("handleInput function called");
    
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
    
    console.log("Button class updated to:", btn.className);
}

// Core chat functionality with enhanced error handling
async function chatWithSantrilogy(prompt) {
    console.log("chatWithSantrilogy called with prompt:", prompt);
    
    const CONFIG = {
        FUNCTION_URL: "https://jbbathydxvpgmgtauadm.supabase.co/functions/v1/chat-engine",
        SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpiYmF0aHlkeHZwZ21ndGF1YWRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MTMyNjMsImV4cCI6MjA4MDA4OTI2M30.9uUtMwX4G5gmhbFHv1l7DgNTedQtiWqSzZ_VgWYzFAo"
    };

    // Pastikan CONFIG.FUNCTION_URL benar
    console.log("Fetch URL:", CONFIG.FUNCTION_URL); 
    
    try {
        console.log("Making fetch request...");
        const res = await fetch(CONFIG.FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({ prompt: prompt })
        });

        console.log("Fetch response received:", res.status);
        
        if (!res.ok) {
            const errorText = await res.text();
            console.error("HTTP Error:", res.status, errorText);
            throw new Error(`HTTP Error ${res.status}: ${errorText}`);
        }

        const data = await res.json();
        console.log("Parsed response data:", data);
        
        const answer = data.answer;
        console.log("Returned answer:", answer);
        return answer;

    } catch (err) {
        console.error("Fetch Error Detail:", err);
        throw err; // Lempar error agar ditangkap sendMessage
    }
}

// UI helper functions with defensive programming
function addBubble(text, type) {
    console.log("addBubble called with type:", type, "and text:", text);
    
    const mainElement = document.getElementById('main');
    
    if (!mainElement) {
        console.error('Main container not found for adding bubble. Text:', text);
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
    console.log("Bubble added successfully to DOM");

    // Auto Scroll to bottom
    const chatArea = document.getElementById('chatArea');
    if (chatArea) {
        chatArea.scrollTop = chatArea.scrollHeight;
        console.log("Scrolled to bottom of chat area");
    } else {
        console.warn("Chat area element not found for scrolling");
    }
}

function addLoadingBubble() {
    console.log("addLoadingBubble called");
    
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
    console.log("Loading bubble added with ID:", id);
    return id;
}

function removeLoadingBubble(id) {
    console.log("removeLoadingBubble called with ID:", id);
    
    const el = document.getElementById(id);
    if (el) {
        el.remove();
        console.log("Loading bubble removed successfully");
    } else {
        console.warn("Loading bubble with ID", id, "not found to remove");
    }
}

// Speech Recognition Functions with defensive programming
function initSpeechRecognition() {
    console.log("Initializing speech recognition...");
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'id-ID'; // Set to Indonesian language
        recognition.maxAlternatives = 1;

        recognition.onresult = function(event) {
            console.log("Speech recognition result received");
            let transcript = '';
            for (let i = 0; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    transcript = event.results[i][0].transcript;
                    console.log("Final transcript:", transcript);
                } else {
                    transcript += event.results[i][0].transcript;
                    console.log("Interim transcript:", transcript);
                }
            }
            
            const input = document.getElementById('userPrompt');
            if (input) {
                input.value = transcript;
                handleInput(); // Update button state
                console.log("Transcript set to input field");
            } else {
                console.error("Input field not found when setting transcript");
            }
        };

        recognition.onerror = function(event) {
            console.error('Speech recognition error', event.error);
            stopListening();
        };

        recognition.onend = function() {
            console.log("Speech recognition ended");
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
        
        console.log("Speech recognition initialized successfully");
    } else {
        console.warn('Browser Anda tidak mendukung fitur Speech Recognition. Silakan gunakan browser modern seperti Chrome.');
        stopListening();
    }
}

function handleSendMic() {
    console.log("handleSendMic called, current isListening:", isListening);
    
    if (!isListening) {
        startVoice();
    } else {
        stopListening();
    }
}

function startVoice() {
    console.log("startVoice called");
    
    if (!recognition) {
        initSpeechRecognition();
    }

    if (recognition) {
        try {
            const btn = document.getElementById('sendMicBtn');
            const icon = document.getElementById('actionIcon');
            
            if (btn) {
                btn.className = 'send-mic-btn send';
            } else {
                console.warn("Send button not found when starting voice");
            }
            
            if (icon) {
                icon.className = 'fas fa-circle';
            } else {
                console.warn("Action icon not found when starting voice");
            }
            
            recognition.start();
            isListening = true;
            console.log("Speech recognition started");
        } catch (error) {
            console.error('Error starting recognition:', error);
            // Mobile Safari and some other mobile browsers may require user gesture to enable speech recognition
            if (error.message && error.message.includes('no-speech')) {
                alert('Silakan ucapkan sesuatu. Jika tidak berfungsi, pastikan izin mikrofon telah diberikan.');
            }
            stopListening();
        }
    } else {
        console.error("Recognition not available for startVoice");
    }
}

function stopListening() {
    console.log("stopListening called");
    
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
        } else {
            console.warn("Send button not found when stopping voice");
        }
        
        if (icon) {
            icon.className = 'fas fa-microphone';
        } else {
            console.warn("Action icon not found when stopping voice");
        }
        
        isListening = false;
        console.log("Speech recognition stopped");
    } else {
        console.log("Recognition not active or already stopped");
    }
}

// Swipe Gesture Function for Mobile Modal with defensive programming
function setupSwipeGesture() {
    console.log("Setting up swipe gesture...");
    
    const modal = document.getElementById('toolsModal');
    if (!modal) {
        console.warn('Tools modal not found for swipe gesture setup');
        return;
    }
    
    let startY = 0;
    let currentY = 0;
    let isSwiping = false;
    
    modal.addEventListener('touchstart', (e) => {
        console.log("Swipe touchstart event");
        startY = e.touches[0].clientY;
        isSwiping = true;
    });
    
    modal.addEventListener('touchmove', (e) => {
        if (!isSwiping) {
            return;
        }
        
        currentY = e.touches[0].clientY;
        const deltaY = currentY - startY;
        
        // Only allow swiping down
        if (deltaY > 0) {
            modal.style.transform = `translateY(${deltaY}px)`;
        }
    });
    
    modal.addEventListener('touchend', (e) => {
        if (!isSwiping) {
            return;
        }
        
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
    
    console.log("Swipe gesture event listeners attached");
}

// Additional UI functions with defensive programming
function closeToolsModal() {
    const modal = document.getElementById('toolsModal');
    const overlay = document.getElementById('toolsOverlay');
    
    if (modal) {
        modal.classList.remove('show');
    } else {
        console.warn("Tools modal not found when trying to close");
    }
    
    if (overlay) {
        overlay.classList.remove('show');
    } else {
        console.warn("Tools overlay not found when trying to close");
    }
    
    if (document.body) {
        document.body.style.overflow = '';
    } else {
        console.warn("Document body not found when trying to reset overflow");
    }
}

// Other UI functions that might be called from XML with defensive programming
function askQuestion(question) {
    console.log("askQuestion called with:", question);
    
    const input = document.getElementById('userPrompt');
    if (input) {
        input.value = question;
        handleInput(); // Update button state
        console.log("Question set to input field");
    } else {
        console.error("Input field not found when setting question:", question);
    }
}

// More dropdown functions
function toggleMoreDropdown() {
    console.log("toggleMoreDropdown called");
    
    const dropdown = document.getElementById('moreDropdown');
    if (!dropdown) {
        console.error("More dropdown element not found");
        return;
    }
    
    const isVisible = dropdown.classList.contains('show');
    
    if (isVisible) {
        closeMoreDropdown();
    } else {
        dropdown.classList.add('show');
        // Close dropdown when clicking outside
        setTimeout(() => {
            document.addEventListener('click', closeMoreDropdownOnClickOutside);
        }, 10);
    }
}

function closeMoreDropdown() {
    console.log("closeMoreDropdown called");
    
    const dropdown = document.getElementById('moreDropdown');
    if (dropdown) {
        dropdown.classList.remove('show');
        document.removeEventListener('click', closeMoreDropdownOnClickOutside);
    } else {
        console.warn("More dropdown element not found when closing");
    }
}

function closeMoreDropdownOnClickOutside(event) {
    console.log("closeMoreDropdownOnClickOutside called");
    
    const dropdown = document.getElementById('moreDropdown');
    const moreBtn = document.querySelector('[onclick*="toggleMoreDropdown"]');
    
    if (dropdown && !dropdown.contains(event.target) && moreBtn && !moreBtn.contains(event.target)) {
        closeMoreDropdown();
    }
}

// More menu functions
function shareCurrentPage() {
    console.log("shareCurrentPage called");
    
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
    console.log("downloadApp called");
    alert('Download App feature coming soon!');
    closeMoreDropdown();
}

function showPrivacyPolicy() {
    console.log("showPrivacyPolicy called");
    alert('Privacy Policy page coming soon!');
    closeMoreDropdown();
}

function showTermsConditions() {
    console.log("showTermsConditions called");
    alert('Terms & Conditions page coming soon!');
    closeMoreDropdown();
}

// Responsive toggle for tools
function toggleToolsResponsive() {
    console.log("toggleToolsResponsive called");
    
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
    console.log("showToolsModal called");
    
    const modal = document.getElementById('toolsModal');
    const overlay = document.getElementById('toolsOverlay');
    
    // Show the modal with slide up animation
    if (modal) {
        modal.classList.add('show');
    } else {
        console.warn("Tools modal not found when showing");
    }
    
    if (overlay) {
        overlay.classList.add('show');
    } else {
        console.warn("Tools overlay not found when showing");
    }
    
    if (document.body) {
        document.body.style.overflow = 'hidden';
    } else {
        console.warn("Document body not found when setting overflow");
    }
}

// Toggle desktop tools dropdown
function toggleTools() {
    console.log("toggleTools called");
    
    const dropdown = document.getElementById('toolsDropdown');
    if (!dropdown) {
        console.error("Tools dropdown element not found");
        return;
    }
    
    const isVisible = dropdown.classList.contains('show');
    
    if (isVisible) {
        closeToolsDropdown();
    } else {
        dropdown.classList.add('show');
        // Close dropdown when clicking outside
        setTimeout(() => {
            document.addEventListener('click', closeToolsDropdownOnClickOutside);
        }, 10);
    }
}

function closeToolsDropdown() {
    console.log("closeToolsDropdown called");
    
    const dropdown = document.getElementById('toolsDropdown');
    if (dropdown) {
        dropdown.classList.remove('show');
        document.removeEventListener('click', closeToolsDropdownOnClickOutside);
    } else {
        console.warn("Tools dropdown element not found when closing");
    }
}

function closeToolsDropdownOnClickOutside(event) {
    console.log("closeToolsDropdownOnClickOutside called");
    
    const dropdown = document.getElementById('toolsDropdown');
    const plusBtn = document.getElementById('plusBtn');
    
    if (dropdown && !dropdown.contains(event.target) && plusBtn && !plusBtn.contains(event.target)) {
        closeToolsDropdown();
    }
}

// Custom theme color functions
function openColorPicker() {
    console.log("openColorPicker called");
    
    const colorPicker = document.getElementById('customColorPicker');
    if (colorPicker) {
        colorPicker.click();
    } else {
        console.error("Custom color picker element not found");
    }
}

function applyCustomColor(color) {
    console.log("applyCustomColor called with:", color);
    
    // Update --accent variable
    if (document.documentElement) {
        document.documentElement.style.setProperty('--accent', color);
    } else {
        console.warn("Document element not found when applying custom color");
    }
    
    // Generate a complementary color for --accent-2
    const accent2 = calculateComplementaryColor(color);
    
    if (document.documentElement) {
        document.documentElement.style.setProperty('--accent-2', accent2);
    } else {
        console.warn("Document element not found when applying accent2 color");
    }
    
    // Update --gradient-1 based on the custom color
    const gradient = `linear-gradient(135deg, ${color} 0%, ${accent2} 50%, #06b6d4 100%)`;
    
    if (document.documentElement) {
        document.documentElement.style.setProperty('--gradient-1', gradient);
    } else {
        console.warn("Document element not found when applying gradient");
    }
    
    // Update data-accent attribute on body to track custom theme
    if (document.body) {
        document.body.setAttribute('data-accent', 'custom');
    } else {
        console.warn("Document body not found when setting data-accent");
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
    } else {
        console.warn("Custom color pill not found when applying color");
    }
}

function calculateComplementaryColor(color) {
    console.log("calculateComplementaryColor called with:", color);
    
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
    
    const rgbColor = `rgb(${r}, ${g}, ${b})`;
    console.log("Calculated complementary color:", rgbColor);
    
    return rgbColor;
}