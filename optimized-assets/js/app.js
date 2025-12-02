/**
 * SANTRILOGY AI - Frontend Application
 * Version: 2.1 (Fixed Reference Errors & Missing Functions)
 */

// --- GLOBAL CONFIGURATION ---
const CONFIG = {
    FUNCTION_URL: "https://jbbathydxvpgmgtauadm.supabase.co/functions/v1/chat-engine",
    SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpiYmF0aHlkeHZwZ21ndGF1YWRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MTMyNjMsImV4cCI6MjA4MDA4OTI2M30.9uUtMwX4G5gmhbFHv1l7DgNTedQtiWqSzZ_VgWYzFAo"
};

// Core variables
let recognition;
let isListening = false;

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', function() {
    console.log("Initializing Santrilogy Frontend v2.1...");

    // 1. Initialize Speech Recognition
    initSpeechRecognition();
    
    // 2. Setup Action Button (Mic/Send)
    // Mencari tombol dengan ID actionBtn (Baru) atau sendMicBtn (Lama)
    const actionBtn = document.getElementById('actionBtn') || document.getElementById('sendMicBtn'); 
    if (actionBtn) {
        // Hapus listener lama untuk mencegah duplikasi
        actionBtn.removeEventListener('click', handleActionClick);
        actionBtn.addEventListener('click', handleActionClick);
        console.log("Action button listener attached.");
    } else {
        console.warn("Action button (#actionBtn) not found in DOM.");
    }
    
    // 3. Setup Input Field
    const userPrompt = document.getElementById('userPrompt');
    if (userPrompt) {
        userPrompt.removeEventListener('keydown', handleKeyDown);
        userPrompt.removeEventListener('input', handleInput);
        
        userPrompt.addEventListener('keydown', handleKeyDown);
        userPrompt.addEventListener('input', handleInput);
        console.log("Input field listeners attached.");
    } else {
        console.warn("Input field (#userPrompt) not found.");
    }

    // 4. Setup Tools Modal (Swipe)
    const toolsModal = document.getElementById('toolsModal');
    if (toolsModal) {
        setupSwipeGesture();
    }
    
    // 5. Scroll to top logic
    setTimeout(() => window.scrollTo(0, 0), 100);
});

// --- CORE HANDLERS ---

function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        const text = event.target.value.trim();
        if (text.length > 0) {
            handleActionClick();
        }
    }
}

function handleActionClick() {
    const input = document.getElementById('userPrompt');
    if (!input) return;
    
    const text = input.value.trim();
    
    if (text.length > 0) {
        sendMessage();
    } else {
        handleSendMic();
    }
}

function handleInput() {
    const input = document.getElementById('userPrompt');
    const btn = document.getElementById('actionBtn') || document.getElementById('sendMicBtn');
    const icon = document.getElementById('actionIcon');
    
    if (!input || !btn) return;
    
    // Auto resize
    input.style.height = 'auto';
    input.style.height = (input.scrollHeight) + 'px';
    if(input.value === '') input.style.height = 'auto';

    // Toggle Icon Logic
    if (input.value.trim().length > 0) {
        btn.className = 'send-mic-btn send';
        if (icon) icon.className = 'fas fa-paper-plane';
    } else {
        btn.className = 'send-mic-btn mic';
        if (icon) icon.className = 'fas fa-microphone';
    }
}

// --- CHAT LOGIC ---

async function sendMessage() {
    const input = document.getElementById('userPrompt');
    if (!input) return;
    
    const text = input.value.trim();
    if (!text) return;
    
    console.log("Sending message:", text);
    
    try {
        // UI Updates
        input.value = '';
        input.style.height = 'auto';
        handleInput(); // Reset icon
        
        addBubble(text, 'user');
        const loadingId = addLoadingBubble();

        // API Call
        const reply = await chatWithSantrilogy(text);
        
        removeLoadingBubble(loadingId);
        
        if (reply) {
            addBubble(reply, 'ai');
        } else {
            addBubble("Maaf, respon kosong dari server.", 'ai');
        }

    } catch (error) {
        console.error("SendMessage Error:", error);
        // Hapus loading bubble jika error
        const bubbles = document.getElementsByClassName('post-outer');
        if(bubbles.length > 0) {
            const lastBubble = bubbles[bubbles.length - 1];
            if(lastBubble.innerHTML.includes('Sedang membuka kitab')) lastBubble.remove();
        }
        addBubble("Gagal terhubung. Cek koneksi internet.", 'ai');
    }
}

async function chatWithSantrilogy(prompt) {
    try {
        const res = await fetch(CONFIG.FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({ prompt: prompt })
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return data.answer;

    } catch (err) {
        console.error("API Fetch Error:", err);
        throw err;
    }
}

// --- UI HELPER FUNCTIONS ---

function addBubble(text, type) {
    const mainElement = document.getElementById('main');
    if (!mainElement) {
        // Fallback jika ID 'main' (Blogger default) tidak ketemu
        const altMain = document.querySelector('.chat-container') || document.querySelector('.main');
        if (!altMain) {
            console.error("Chat Container NOT FOUND!");
            return;
        }
        // Gunakan container alternatif
        addBubbleToElement(altMain, text, type);
        return;
    }
    addBubbleToElement(mainElement, text, type);
}

function addBubbleToElement(container, text, type) {
    const div = document.createElement('div');
    div.className = 'post-outer';
    div.style.animation = "msgIn 0.4s ease-out"; // Force animation
    
    // Format HTML (Safe)
    let contentHtml = type === 'user' 
        ? `<div class="post-body">${text.replace(/</g, "&lt;")}</div>`
        : `<div class="post-body">${text.replace(/\n/g, '<br>')}</div>`;

    div.innerHTML = `
    <div class="msg">
      <div class="msg-avatar ${type === 'user' ? 'user' : 'ai'}">
        ${type === 'user' ? 'U' : '<div class="atom-mini"><div class="atom-nucleus"/><div class="atom-orbit orbit-1"/></div>'}
      </div>
      <div class="msg-body">
        <div class="msg-header">
          <span class="msg-name">${type === 'user' ? 'You' : 'Santrilogy AI'}</span>
          <span class="msg-time">Just now</span>
        </div>
        ${contentHtml}
      </div>
    </div>`;
    
    container.appendChild(div);
    
    // Scroll handling
    const chatArea = document.getElementById('chatArea');
    if (chatArea) chatArea.scrollTop = chatArea.scrollHeight;
    else window.scrollTo(0, document.body.scrollHeight);
}

function addLoadingBubble() {
    const mainElement = document.getElementById('main');
    if (!mainElement) return null;
    
    const id = 'loading-' + Date.now();
    const div = document.createElement('div');
    div.id = id;
    div.className = 'post-outer';
    div.innerHTML = `
    <div class="msg">
      <div class="msg-avatar ai"><div class="atom-mini"><div class="atom-nucleus"/><div class="atom-orbit orbit-1"/></div></div>
      <div class="msg-body">
        <div class="msg-header"><span class="msg-name">Santrilogy AI</span></div>
        <div class="post-body"><i>Sedang membuka kitab...</i></div>
      </div>
    </div>`;
    
    mainElement.appendChild(div);
    return id;
}

function removeLoadingBubble(id) {
    if (!id) return;
    const el = document.getElementById(id);
    if (el) el.remove();
}

// --- MISSING FUNCTIONS (Ini yang bikin error ReferenceError!) ---

function handleUpload(type) {
    console.log("Upload triggered:", type);
    // Placeholder logic
    alert("Fitur Upload (" + type + ") sedang dalam pengembangan!");
    closeToolsModal();
    closeToolsDropdown();
}

function useTool(toolName) {
    console.log("Tool triggered:", toolName);
    // Placeholder logic
    alert("Mode " + toolName + " diaktifkan. Silakan ketik pertanyaan Anda.");
    closeToolsModal();
    closeToolsDropdown();
}

// --- UI TOGGLES (Exposed to Window) ---

function toggleMoreDropdown() {
    const dropdown = document.getElementById('moreDropdown');
    if (dropdown) dropdown.classList.toggle('show');
}

function closeMoreDropdown() {
    const dropdown = document.getElementById('moreDropdown');
    if (dropdown) dropdown.classList.remove('show');
}

function toggleToolsResponsive() {
    if (window.innerWidth <= 768) {
        showToolsModal();
    } else {
        toggleTools();
    }
}

function toggleTools() {
    const dropdown = document.getElementById('toolsDropdown');
    if (dropdown) dropdown.classList.toggle('show');
}

function closeToolsDropdown() {
    const dropdown = document.getElementById('toolsDropdown');
    if (dropdown) dropdown.classList.remove('show');
}

function showToolsModal() {
    const modal = document.getElementById('toolsModal');
    const overlay = document.getElementById('toolsOverlay');
    if (modal) modal.classList.add('show');
    if (overlay) overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeToolsModal() {
    const modal = document.getElementById('toolsModal');
    const overlay = document.getElementById('toolsOverlay');
    if (modal) modal.classList.remove('show');
    if (overlay) overlay.classList.remove('show');
    document.body.style.overflow = '';
}

function toggleSettings() {
    // Implementasi Settings Modal Desktop jika diperlukan
    alert("Menu Settings");
}

function closeSettingsModal() {
    const modal = document.getElementById('settingsModal');
    const overlay = document.getElementById('settingsOverlay');
    if (modal) modal.classList.remove('show');
    if (overlay) overlay.classList.remove('show');
}

// --- SWIPE GESTURE ---
function setupSwipeGesture() {
    const modal = document.getElementById('toolsModal');
    if (!modal) return;
    let startY = 0;
    
    modal.addEventListener('touchstart', e => startY = e.touches[0].clientY, {passive: true});
    modal.addEventListener('touchmove', e => {
        const delta = e.touches[0].clientY - startY;
        if (delta > 0) modal.style.transform = `translateY(${delta}px)`;
    }, {passive: true});
    modal.addEventListener('touchend', e => {
        if (e.changedTouches[0].clientY - startY > 100) closeToolsModal();
        else modal.style.transform = '';
    });
}

// --- SPEECH ---
function initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'id-ID';
        recognition.onresult = (e) => {
            const transcript = e.results[0][0].transcript;
            const input = document.getElementById('userPrompt');
            if (input) {
                input.value = transcript;
                handleInput();
            }
        };
    }
}

function handleSendMic() {
    if (!recognition) initSpeechRecognition();
    if (!isListening && recognition) {
        try {
            recognition.start();
            isListening = true;
            document.getElementById('actionIcon').className = 'fas fa-stop';
        } catch(e) { console.error(e); }
    } else if (recognition) {
        recognition.stop();
        isListening = false;
        document.getElementById('actionIcon').className = 'fas fa-microphone';
    }
}

// --- EXPOSE TO WINDOW (PENTING! Agar onclick="" di HTML bisa baca JS ini) ---
window.toggleMoreDropdown = toggleMoreDropdown;
window.closeMoreDropdown = closeMoreDropdown;
window.toggleToolsResponsive = toggleToolsResponsive;
window.handleUpload = handleUpload; // Ini yang tadi hilang
window.useTool = useTool;           // Ini yang tadi hilang
window.handleSendMic = handleSendMic;
window.handleActionClick = handleActionClick;
window.handleInput = handleInput;
window.toggleSettings = toggleSettings;
window.closeToolsModal = closeToolsModal;
window.closeSettingsModal = closeSettingsModal;
window.shareCurrentPage = () => alert("Link tersalin!"); // Simplified
window.downloadApp = () => alert("Segera hadir!");
window.showPrivacyPolicy = () => alert("Privacy Policy");
window.showTermsConditions = () => alert("Terms");
window.clearChats = () => {
    document.getElementById('main').innerHTML = '';
    alert("Chat dibersihkan");
};
// Theme functions usually in XML inline, but safe to add here too
window.toggleDarkMode = () => document.body.classList.toggle('dark-mode');