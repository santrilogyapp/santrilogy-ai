/**
 * SANTRILOGY AI - Frontend Application
 * Refactored with defensive programming and verbose logging
 * Version: 2.0 (Stable)
 */

// --- GLOBAL CONFIGURATION ---
const CONFIG = {
    // Pastikan URL ini sesuai dengan Project Supabase Anda
    FUNCTION_URL: "https://jbbathydxvpgmgtauadm.supabase.co/functions/v1/chat-engine",
    SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpiYmF0aHlkeHZwZ21ndGF1YWRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MTMyNjMsImV4cCI6MjA4MDA4OTI2M30.9uUtMwX4G5gmhbFHv1l7DgNTedQtiWqSzZ_VgWYzFAo"
};

// Core variables
let recognition;
let isListening = false;

document.addEventListener('DOMContentLoaded', function() {
    console.log("Initializing Santrilogy Frontend...");

    // 1. Initialize Speech Recognition
    initSpeechRecognition();
    
    // 2. Setup Action Button (Mic/Send)
    // NOTE: ID di XML harus 'actionBtn'
    const actionBtn = document.getElementById('actionBtn') || document.getElementById('sendMicBtn'); 
    if (actionBtn) {
        console.log("Action button found, attaching listener...");
        // Hapus listener lama jika ada (good practice)
        actionBtn.removeEventListener('click', handleActionClick);
        actionBtn.addEventListener('click', handleActionClick);
    } else {
        console.error("CRITICAL: Action button (#actionBtn) not found!");
    }
    
    // 3. Setup Input Field
    const userPrompt = document.getElementById('userPrompt');
    if (userPrompt) {
        console.log("Input field found...");
        // Handle Enter Key
        userPrompt.addEventListener('keydown', handleKeyDown);
        // Handle Typing (Untuk ubah icon Mic <-> Send) -> INI YANG TADINYA HILANG
        userPrompt.addEventListener('input', handleInput);
    } else {
        console.error("CRITICAL: Input field (#userPrompt) not found!");
    }

    // 4. Setup Tools Modal (Swipe)
    const toolsModal = document.getElementById('toolsModal');
    if (toolsModal) {
        setupSwipeGesture();
    }
    
    // 5. Scroll to top logic
    setTimeout(() => window.scrollTo(0, 0), 100);

    console.log("Santrilogy Frontend initialized successfully.");
});

// --- EVENT HANDLERS ---

function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        // Cek apakah ada teks sebelum trigger action
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
    console.log("Action Click. Input length:", text.length);
    
    if (text.length > 0) {
        // Jika ada teks -> Mode KIRIM
        sendMessage();
    } else {
        // Jika kosong -> Mode MIC
        handleSendMic();
    }
}

// Toggle icon based on input content
function handleInput() {
    const input = document.getElementById('userPrompt');
    // Cari tombol dengan ID actionBtn atau fallback ke sendMicBtn
    const btn = document.getElementById('actionBtn') || document.getElementById('sendMicBtn');
    const icon = document.getElementById('actionIcon');
    
    if (!input || !btn) return;
    
    // Auto resize textarea
    input.style.height = 'auto';
    input.style.height = (input.scrollHeight) + 'px';
    if(input.value === '') input.style.height = 'auto';

    // Toggle Icon Logic
    if (input.value.trim().length > 0) {
        // Mode: SEND
        btn.className = 'send-mic-btn send';
        if (icon) icon.className = 'fas fa-paper-plane';
    } else {
        // Mode: MIC
        btn.className = 'send-mic-btn mic';
        if (icon) icon.className = 'fas fa-microphone';
    }
}

// --- CORE CHAT LOGIC ---

async function sendMessage() {
    const input = document.getElementById('userPrompt');
    if (!input) return;
    
    const text = input.value.trim();
    if (!text) {
        console.warn('Empty message, ignoring.');
        return;
    }
    
    console.log("Sending message:", text);
    
    try {
        // 1. Reset UI Immediately (UX Responsif)
        input.value = '';
        handleInput(); // Reset icon ke Mic
        input.style.height = 'auto'; // Reset tinggi
        
        // 2. Tampilkan User Bubble
        addBubble(text, 'user');

        // 3. Tampilkan Loading
        const loadingId = addLoadingBubble();

        // 4. Panggil API
        const reply = await chatWithSantrilogy(text);
        
        // 5. Hapus Loading & Tampilkan Jawaban
        removeLoadingBubble(loadingId);
        
        if (reply) {
            addBubble(reply, 'ai');
        } else {
            addBubble("Maaf, terjadi kesalahan (Empty Response).", 'ai');
        }

    } catch (error) {
        console.error("SendMessage Error:", error);
        // Hapus loading jika masih ada
        const loadingEl = document.querySelector('.post-outer.ai-bubble:last-child');
        if(loadingEl && loadingEl.innerHTML.includes('sedang membuka kitab')) loadingEl.remove();
        
        addBubble("Gagal terhubung ke server. Cek koneksi internet.", 'ai');
    }
}

async function chatWithSantrilogy(prompt) {
    console.log("Fetching from:", CONFIG.FUNCTION_URL);
    
    try {
        const res = await fetch(CONFIG.FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({ prompt: prompt })
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`HTTP ${res.status}: ${errText}`);
        }

        const data = await res.json();
        return data.answer;

    } catch (err) {
        console.error("Fetch API Error:", err);
        throw err;
    }
}

// --- UI HELPER FUNCTIONS ---

function addBubble(text, type) {
    const mainElement = document.getElementById('main');
    if (!mainElement) return;
    
    const div = document.createElement('div');
    div.className = type === 'user' ? 'post-outer user-bubble' : 'post-outer ai-bubble';
    
    // Formatting HTML untuk bubble
    // Note: Gunakan innerText untuk user input agar aman dari XSS, innerHTML untuk AI agar bisa formatting
    let contentHtml = '';
    if (type === 'user') {
        // Escape HTML sederhana untuk user
        const safeText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        contentHtml = `<div class="post-body">${safeText}</div>`;
    } else {
        // AI response diperbolehkan HTML (misal bold/italic dari markdown parser nantinya)
        // Convert \n to <br> for basic formatting
        const formattedText = text.replace(/\n/g, '<br>');
        contentHtml = `<div class="post-body">${formattedText}</div>`;
    }

    div.innerHTML = `<div class="msg">${type === 'user' ? 
      '<div class="msg-avatar user">U</div>' : 
      '<div class="msg-avatar ai"><div class="atom-mini"><div class="atom-nucleus"/><div class="atom-orbit orbit-1"/></div></div></div>'}
      <div class="msg-body">
        <div class="msg-header">
          <span class="msg-name">${type === 'user' ? 'You' : 'Santrilogy AI'}</span>
          <span class="msg-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
        ${contentHtml}
        <div class="msg-actions">
          <span class="msg-action" onclick="navigator.clipboard.writeText(this.parentElement.previousElementSibling.innerText)" title="Copy"><i class="fas fa-copy"/></span>
        </div>
      </div>
    </div>`;
    
    mainElement.appendChild(div);
    scrollToBottom();
}

function addLoadingBubble() {
    const mainElement = document.getElementById('main');
    if (!mainElement) return;
    
    const id = 'loading-' + Date.now();
    const div = document.createElement('div');
    div.id = id;
    div.className = 'post-outer ai-bubble';
    div.innerHTML = `<div class="msg">
      <div class="msg-avatar ai">
        <div class="atom-mini"><div class="atom-nucleus"/><div class="atom-orbit orbit-1"/></div>
      </div>
      <div class="msg-body">
        <div class="msg-header"><span class="msg-name">Santrilogy AI</span></div>
        <div class="post-body">Sedang membuka kitab... <i class="fas fa-spinner fa-spin"></i></div>
      </div>
    </div>`;
    
    mainElement.appendChild(div);
    scrollToBottom();
    return id;
}

function removeLoadingBubble(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

function scrollToBottom() {
    const chatArea = document.getElementById('chatArea');
    if (chatArea) {
        chatArea.scrollTop = chatArea.scrollHeight;
    }
}

// --- SPEECH RECOGNITION (Voice) ---

function initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'id-ID';

        recognition.onresult = function(event) {
            let transcript = '';
            for (let i = 0; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            
            const input = document.getElementById('userPrompt');
            if (input) {
                input.value = transcript;
                handleInput(); // Trigger update icon
            }
        };

        recognition.onerror = function(event) {
            console.error('Speech error:', event.error);
            stopListening();
        };

        recognition.onend = function() {
            if (isListening) stopListening(); // Auto stop when silence
        };
    } else {
        console.warn("Speech Recognition API not supported.");
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
    if (!recognition) initSpeechRecognition();
    if (recognition) {
        try {
            recognition.start();
            isListening = true;
            
            // Visual Feedback
            const btn = document.getElementById('actionBtn') || document.getElementById('sendMicBtn');
            const icon = document.getElementById('actionIcon');
            if(btn) btn.classList.add('send'); // Biar nyala
            if(icon) icon.className = 'fas fa-circle-stop'; // Icon stop
            
        } catch (e) { console.error(e); }
    }
}

function stopListening() {
    if (recognition) {
        try { recognition.stop(); } catch(e){}
        isListening = false;
        
        // Reset Visual
        handleInput(); // Kembalikan ke state sesuai isi text
    }
}

// --- SWIPE GESTURE & UTILS ---
// (Bagian Swipe Gesture & Modal Utils Anda sudah benar, 
//  cukup pastikan setupSwipeGesture dipanggil di DOMContentLoaded)

function setupSwipeGesture() {
    const modal = document.getElementById('toolsModal');
    if (!modal) return;
    
    let startY = 0;
    
    modal.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
    }, {passive: true});
    
    modal.addEventListener('touchmove', (e) => {
        const currentY = e.touches[0].clientY;
        const delta = currentY - startY;
        if (delta > 0) modal.style.transform = `translateY(${delta}px)`;
    }, {passive: true});
    
    modal.addEventListener('touchend', (e) => {
        const currentY = e.changedTouches[0].clientY;
        if (currentY - startY > 100) {
            closeToolsModal(); // Fungsi ini harus ada di utils Anda
        } else {
            modal.style.transform = '';
        }
    });
}