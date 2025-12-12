// --- DETERMINE ROOT PATH ---
const scriptTag = document.currentScript || document.querySelector('script[src*="chatbot.js"]');
const scriptSrc = scriptTag ? scriptTag.src : '';

const chatbotRoot = scriptSrc.includes('/src/chatbot.js')
    ? scriptSrc.replace(/\/src\/chatbot\.js(\?.*)?$/, '/')
    : 'chatbot/';

document.addEventListener('DOMContentLoaded', async () => {
    // --- INJECT CSS ---
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = chatbotRoot + 'src/chatbot.css';
    document.head.appendChild(cssLink);

    // --- LOAD CONFIGURATION ---
    let config = null;
    let WORKER_URL = null;
    let MODEL = null;

    try {
        // Load config.json
        const configResponse = await fetch(chatbotRoot + 'config.json');
        config = await configResponse.json();

        // Get worker URL and model from config
        WORKER_URL = config.workerUrl || 'http://localhost:8787'; // Default to local dev
        MODEL = config.llmConfig?.model || 'gemini-2.5-flash-lite';

        console.log('Configuration loaded:', {
            configLoaded: !!config,
            workerUrl: WORKER_URL,
            model: MODEL,
            botName: config?.botName
        });
    } catch (error) {
        console.error('Failed to load configuration:', error);
        config = {
            botName: 'Zova Assistant',
            initialMessage: 'Hello! How can I help you today?',
            systemPromptConditions: '',
            shopDataFile: 'shop-data.json'
        };
        WORKER_URL = 'http://localhost:8787';
        MODEL = 'gemini-2.5-flash-lite';
    }

    // 1. Inject HTML (Same as before)
    const chatbotContainer = document.createElement('div');
    chatbotContainer.id = 'voice-chatbot-container';

    // Get icon path from config, fallback to default SVG if not configured
    const iconPath = config?.theme?.icon ? chatbotRoot + config.theme.icon : null;

    chatbotContainer.innerHTML = `
        <div id="chatbot-window">
            <div class="chat-header">
                <div class="header-info">
                    <div class="bot-avatar" id="bot-avatar" style="${iconPath ? 'padding: 0; overflow: hidden;' : ''}">
                        ${iconPath ? `<img src="${iconPath}" alt="Bot Icon" style="width: 100%; height: 100%; object-fit: cover; display: block;">` : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"/><path d="m5 17 1.4-1.4"/><path d="m19 17-1.4-1.4"/><path d="M12 22v-5"/><path d="m8 2 4 4 4-4"/><path d="M8 17h8"/></svg>`}
                    </div>
                    <div class="header-text">
                        <h3 id="bot-name">AURA Assistant</h3>
                        <span>Online</span>
                    </div>
                </div>
                <button class="close-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
            <div class="chat-messages" id="chat-messages">
                <div class="message bot" id="initial-message">Hello! I'm AURA. How can I help you elevate your living space today?</div>
            </div>
            <div class="chat-controls">
                <div class="input-container">
                    <button id="voice-btn" class="control-btn" title="Voice Input">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                    </button>
                    <input type="text" id="chat-input" placeholder="Ask anything..." autocomplete="off">
                    <button id="send-btn" class="control-btn" title="Send Message">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </div>
                <div id="status-text" style="display:none;"></div> 
            </div>
        </div>
        <button id="chatbot-fab" id="chatbot-fab-btn" style="${iconPath ? 'padding: 0; overflow: hidden;' : ''}">
            ${iconPath ? `<img src="${iconPath}" alt="Chat Icon" style="width: 100%; height: 100%; object-fit: cover; display: block; position: relative; z-index: 2;">` : `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`}
        </button>
    `;
    document.body.appendChild(chatbotContainer);

    // 2. DOM Elements
    const fab = document.getElementById('chatbot-fab');
    const windowEl = document.getElementById('chatbot-window');
    const closeBtn = document.querySelector('.close-btn');
    const voiceBtn = document.getElementById('voice-btn');
    const sendBtn = document.getElementById('send-btn');
    const chatInput = document.getElementById('chat-input');
    const messagesContainer = document.getElementById('chat-messages');
    const statusText = document.getElementById('status-text');

    // 3. State & Logic
    let isOpen = false;
    let isListening = false;
    let chatHistory = []; // Store conversation history
    let shopData = null; // Store fetched shop data

    // Apply configuration to UI
    if (config) {
        const botNameEl = document.getElementById('bot-name');
        const initialMsgEl = document.getElementById('initial-message');

        if (botNameEl) botNameEl.textContent = config.bot?.name || config.botName;
        if (initialMsgEl) initialMsgEl.textContent = config.bot?.initialMessage || config.initialMessage;

        // Apply Theme Mode (light or dark)
        const themeMode = config.theme?.mode || 'light';
        if (themeMode === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }

        // Apply Theme Colors
        if (config.theme?.colors) {
            const root = document.documentElement;
            if (config.theme.colors.primaryColor) {
                root.style.setProperty('--cb-primary', config.theme.colors.primaryColor);
            }
            if (config.theme.colors.primaryGlow) {
                root.style.setProperty('--cb-primary-glow', config.theme.colors.primaryGlow);
            }
        }
    }

    // Fetch Shop Data from configured sources
    const dataSources = config?.dataSources || ['shop-data.json'];
    const loadedData = [];

    Promise.all(dataSources.map(file => {
        const path = chatbotRoot + file;
        return fetch(path)
            .then(res => {
                if (!res.ok) throw new Error(`Failed to load ${file}`);
                return res.text();
            })
            .then(text => {
                loadedData.push(`--- Data from ${file} ---\n${text}`);
            });
    }))
        .then(() => {
            console.log("All data sources loaded successfully");
            shopData = true; // Flag to indicate readiness
        })
        .catch(err => {
            console.error("Failed to load data sources:", err);
            addMessage("Error loading knowledge base. Please refresh.", 'bot');
        });

    // Toggle Window
    function toggleChat() {
        isOpen = !isOpen;
        if (isOpen) {
            windowEl.classList.add('open');
        } else {
            windowEl.classList.remove('open');
            stopListening();
        }
    }

    fab.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', toggleChat);

    // 4. Speech Recognition Setup
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition;

    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;

        recognition.onstart = () => {
            isListening = true;
            voiceBtn.classList.add('listening');
            statusText.textContent = "Listening...";
        };

        recognition.onend = () => {
            isListening = false;
            voiceBtn.classList.remove('listening');
            statusText.textContent = "Processing...";
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            addMessage(transcript, 'user');
            processCommand(transcript);
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            statusText.textContent = "Error: " + event.error;
            isListening = false;
            voiceBtn.classList.remove('listening');
        };
    } else {
        addMessage("Sorry, your browser doesn't support voice recognition.", 'bot');
        voiceBtn.disabled = true;
        statusText.textContent = "Not supported";
    }

    // 5. Speech Synthesis (TTS)
    let voices = [];

    function loadVoices() {
        voices = window.speechSynthesis.getVoices();
    }

    if ('speechSynthesis' in window) {
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    function speak(text) {
        // Check if TTS is enabled in config
        if (config?.features?.enableTextToSpeech === false) return;

        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';

            const preferredVoice = voices.find(voice => voice.name.includes('Google US English') || voice.name.includes('Samantha'));
            if (preferredVoice) utterance.voice = preferredVoice;

            window.speechSynthesis.speak(utterance);

            utterance.onend = () => {
                statusText.textContent = "Ready to listen";
            };
        }
    }

    // 6. Interaction Logic

    // Text Input Logic
    function handleUserInput() {
        const text = chatInput.value.trim();
        if (text) {
            addMessage(text, 'user');
            processCommand(text);
            chatInput.value = '';
        }
    }

    sendBtn.addEventListener('click', handleUserInput);

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleUserInput();
        }
    });

    // Voice Logic
    voiceBtn.addEventListener('click', () => {
        if (!recognition) return;
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    });

    function startListening() {
        try { recognition.start(); } catch (e) { console.error(e); }
    }

    function stopListening() {
        try { recognition.stop(); } catch (e) { console.error(e); }
    }

    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', sender);
        msgDiv.textContent = text;
        messagesContainer.appendChild(msgDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Thinking Indicator
    let thinkingMsgDiv = null;

    function showThinking() {
        if (thinkingMsgDiv) return;
        thinkingMsgDiv = document.createElement('div');
        thinkingMsgDiv.classList.add('message', 'thinking');
        thinkingMsgDiv.innerHTML = `
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        `;
        messagesContainer.appendChild(thinkingMsgDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function hideThinking() {
        if (thinkingMsgDiv) {
            thinkingMsgDiv.remove();
            thinkingMsgDiv = null;
        }
    }

    // 7. Gemini AI Logic
    async function processCommand(userText) {
        if (!WORKER_URL) {
            const errorMsg = "Worker configuration error!";
            addMessage(errorMsg, 'bot');
            speak(errorMsg);
            console.error('Worker URL not configured. Please update chatbot/config.json');
            return;
        }

        if (!shopData) {
            const msg = "I'm still reading the shop manual. Please try again in a second.";
            addMessage(msg, 'bot');
            speak(msg);
            return;
        }

        statusText.textContent = "Thinking...";
        showThinking();

        // Construct the prompt with history and custom conditions from config.json
        const customConditions = config?.llmConfig?.constraints?.join('\n') || config?.systemPromptConditions || '';

        // Get current date, time, and timezone
        const now = new Date();
        const currentDateTime = now.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        // Build system prompt dynamically from loaded data
        const systemPrompt = `
        ${config?.llmConfig?.systemPrompt || `You are ${config?.bot?.name || 'an AI assistant'}, a helpful and polite AI assistant.`}
        
        Current Date & Time: ${currentDateTime}
        Timezone: ${timezone}
        
        Your Goal: Answer customer questions based ONLY on the provided Context Information below.
        
        Context Information:
        ${loadedData.join('\n\n')}
        
        Instructions:
        ${customConditions}
        - Use the current date and time above to determine if the shop is currently open based on the operating hours in the context information.
        - When asked about shop hours or availability, check if the current time falls within the operating hours.
        `;

        // We send the system prompt + history + new user message
        const contents = [
            {
                role: "user",
                parts: [{ text: systemPrompt }]
            },
            {
                role: "model",
                parts: [{ text: `Understood. I am ${config?.bot?.name || 'the assistant'}. I will answer questions based on the provided context.` }]
            }
        ];

        // Add history
        chatHistory.forEach(msg => {
            contents.push({
                role: msg.role,
                parts: [{ text: msg.text }]
            });
        });

        // Add current message
        contents.push({
            role: "user",
            parts: [{ text: userText }]
        });

        try {
            const response = await fetch(WORKER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: MODEL,
                    contents: contents,
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 100, // Keep it short for voice
                    }
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || response.statusText);
            }

            const botResponse = data.candidates[0].content.parts[0].text;

            // Update History
            chatHistory.push({ role: "user", text: userText });
            chatHistory.push({ role: "model", text: botResponse });

            // Limit history to last 10 turns to save tokens
            if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);

            hideThinking();
            addMessage(botResponse, 'bot');
            speak(botResponse);

        } catch (error) {
            hideThinking();
            console.error("AI Error Details:", error);

            let userMsg = "I encountered an error. Please try again.";

            // Check for worker or API errors
            if (error.message.includes('400') || error.message.includes('403') || error.message.toLowerCase().includes('api key')) {
                console.error("CRITICAL: Worker or API Error. Please check your Cloudflare Worker configuration and environment variables.");
                userMsg = "API configuration error";
            }

            addMessage(userMsg, 'bot');
            speak(userMsg);
            statusText.textContent = "Error";
        }
    }
});
