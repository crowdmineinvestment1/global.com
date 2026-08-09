/* ============================================
   GENIUS ACT GLOBAL — OFFICIAL CONTACT US LIVE CHAT WIDGET
   Allows visitors (logged in or guest) to contact campaign support.
   Messages sync directly to the Admin Panel in real time.
   ============================================ */

(function () {
    // Prevent duplicate initialization
    if (window._contactUsWidgetInitialized) return;
    window._contactUsWidgetInitialized = true;

    // Load FontAwesome if not loaded
    if (!document.querySelector('link[href*="fontawesome"]')) {
        const fa = document.createElement('link');
        fa.rel = 'stylesheet';
        fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(fa);
    }

    // Helper: Get or create guest user ID
    function getGuestSession() {
        let guestId = localStorage.getItem('geniusact_guest_chat_id');
        if (!guestId) {
            guestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
            localStorage.setItem('geniusact_guest_chat_id', guestId);
        }
        return guestId;
    }

    // Helper: Get user profile info
    function getUserInfo() {
        const userStr = localStorage.getItem('geniusact_current_user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                return {
                    chatId: 'user_' + (user.email ? user.email.toLowerCase().replace(/[^a-z0-9]/g, '_') : user.uid),
                    email: user.email || '',
                    name: user.fullName || (user.email ? user.email.split('@')[0] : 'Valued Supporter'),
                    isGuest: false
                };
            } catch (e) { }
        }
        const savedGuestName = localStorage.getItem('geniusact_guest_name') || 'Guest Visitor';
        const savedGuestEmail = localStorage.getItem('geniusact_guest_email') || '';
        return {
            chatId: getGuestSession(),
            email: savedGuestEmail,
            name: savedGuestName,
            isGuest: true
        };
    }

    // Inject Styles
    const style = document.createElement('style');
    style.textContent = `
        /* Floating Contact Us Button (Compact, bottom-left fixed position) */
        #contact-us-floating-btn,
        .contact-us-trigger-btn:not([style*="position:static"]) {
            position: fixed !important;
            bottom: 20px !important;
            left: 20px !important;
            right: auto !important;
            width: auto !important;
            max-width: fit-content !important;
            min-width: auto !important;
            background: #1e3a8a !important; /* Navy Blue */
            color: #ffffff !important;
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            font-weight: 800;
            font-size: 0.82rem !important;
            letter-spacing: 0.8px;
            text-transform: uppercase;
            padding: 9px 18px !important;
            border: 1.5px solid #ef4444 !important; /* Thin Red Border */
            border-radius: 30px !important; /* Compact pill shape */
            box-shadow: 0 8px 24px rgba(30, 58, 138, 0.45);
            cursor: pointer;
            z-index: 999999 !important;
            display: inline-flex !important;
            align-items: center;
            gap: 8px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            user-select: none;
            box-sizing: border-box !important;
        }
        #contact-us-floating-btn:hover,
        .contact-us-trigger-btn:not([style*="position:static"]):hover {
            transform: translateY(-2px) scale(1.02);
            background: #1d4ed8 !important;
            border-color: #dc2626 !important;
            box-shadow: 0 12px 28px rgba(29, 78, 216, 0.55);
        }
        .contact-us-trigger-btn .unread-dot {
            position: absolute;
            top: -5px;
            right: -5px;
            background: #ef4444;
            color: white;
            font-size: 0.7rem;
            font-weight: 800;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid white;
            animation: pulse-dot 2s infinite;
        }

        /* Live Chat Window Container (Bottom-left fixed position) */
        .contact-us-chat-window {
            position: fixed !important;
            bottom: 72px !important;
            left: 20px !important;
            right: auto !important;
            width: 360px;
            max-width: calc(100vw - 32px);
            height: 520px;
            max-height: calc(100vh - 100px);
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 25px 60px rgba(15, 23, 42, 0.35);
            border: 1px solid #cbd5e1;
            display: none;
            flex-direction: column;
            overflow: hidden;
            z-index: 999999 !important;
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            animation: slide-up 0.3s ease-out forwards;
        }

        /* Header */
        .chat-header {
            background: linear-gradient(135deg, #0f172a, #1e3a8a);
            color: white;
            padding: 16px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2px solid #ef4444;
        }
        .chat-header-info {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .chat-header-icon {
            width: 38px;
            height: 38px;
            background: rgba(255,255,255,0.1);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.1rem;
            color: #38bdf8;
        }
        .chat-header-title {
            font-weight: 800;
            font-size: 0.95rem;
            margin: 0;
            line-height: 1.2;
        }
        .chat-header-subtitle {
            font-size: 0.72rem;
            color: #94a3b8;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        .online-status-dot {
            width: 8px;
            height: 8px;
            background: #10b981;
            border-radius: 50%;
            display: inline-block;
        }

        /* Body & Messages */
        .chat-body {
            flex: 1;
            padding: 16px;
            overflow-y: auto;
            background: #f8fafc;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .chat-bubble {
            max-width: 82%;
            padding: 10px 14px;
            border-radius: 12px;
            font-size: 0.88rem;
            line-height: 1.45;
            word-break: break-word;
            position: relative;
        }
        .chat-bubble.user {
            align-self: flex-end;
            background: #1e3a8a;
            color: white;
            border-bottom-right-radius: 2px;
        }
        .chat-bubble.admin {
            align-self: flex-start;
            background: #ffffff;
            color: #1e293b;
            border: 1px solid #e2e8f0;
            border-bottom-left-radius: 2px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.03);
        }
        .chat-time {
            font-size: 0.65rem;
            opacity: 0.75;
            margin-top: 4px;
            text-align: right;
            display: block;
        }

        /* Guest Identification Form inside Chat */
        .chat-guest-form {
            background: #ffffff;
            border: 1px solid #cbd5e1;
            border-radius: 12px;
            padding: 16px;
            text-align: center;
            margin-bottom: 10px;
        }
        .chat-guest-form h4 {
            margin: 0 0 6px 0;
            font-size: 0.95rem;
            color: #0f172a;
            font-weight: 800;
        }
        .chat-guest-form p {
            margin: 0 0 12px 0;
            font-size: 0.78rem;
            color: #64748b;
        }
        .chat-guest-form input {
            width: 100%;
            padding: 8px 12px;
            margin-bottom: 8px;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            font-size: 0.85rem;
            box-sizing: border-box;
        }

        /* Input Footer */
        .chat-footer {
            padding: 12px 16px;
            background: #ffffff;
            border-top: 1px solid #e2e8f0;
            display: flex;
            gap: 8px;
            align-items: center;
        }
        .chat-input {
            flex: 1;
            padding: 10px 14px;
            border: 1px solid #cbd5e1;
            border-radius: 20px;
            font-size: 0.88rem;
            outline: none;
            font-family: inherit;
            transition: border-color 0.2s;
        }
        .chat-input:focus {
            border-color: #1e3a8a;
        }
        .chat-send-btn {
            background: #1e3a8a;
            color: white;
            border: none;
            width: 38px;
            height: 38px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background 0.2s;
        }
        .chat-send-btn:hover {
            background: #2563eb;
        }

        @keyframes slide-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-dot {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.15); }
        }

        @media (max-width: 640px) {
            .contact-us-chat-window {
                bottom: 0 !important;
                left: 0 !important;
                right: 0 !important;
                width: 100vw !important;
                max-width: 100vw !important;
                height: 85vh !important;
                max-height: 85vh !important;
                border-radius: 20px 20px 0 0 !important;
                border-bottom: none !important;
            }
            #contact-us-floating-btn {
                bottom: 16px !important;
                left: 16px !important;
                padding: 8px 14px !important;
                font-size: 0.78rem !important;
            }
        }
    `;
    document.head.appendChild(style);

    // Create Floating Trigger Button
    const triggerBtn = document.createElement('button');
    triggerBtn.className = 'contact-us-trigger-btn';
    triggerBtn.id = 'contact-us-floating-btn';
    triggerBtn.innerHTML = `
        <i class="fas fa-comments"></i>
        <span>CONTACT US</span>
        <span class="unread-dot" id="contact-unread-dot" style="display:none;">1</span>
    `;
    document.body.appendChild(triggerBtn);

    // Create Chat Window Modal
    const chatWindow = document.createElement('div');
    chatWindow.className = 'contact-us-chat-window';
    chatWindow.id = 'contact-us-chat-modal';
    chatWindow.innerHTML = `
        <div class="chat-header">
            <div class="chat-header-info">
                <div class="chat-header-icon"><i class="fas fa-shield-alt"></i></div>
                <div>
                    <div class="chat-header-title">GENIUS Act Support</div>
                    <div class="chat-header-subtitle"><span class="online-status-dot"></span> Official Campaign Desk • Online</div>
                </div>
            </div>
            <button id="close-chat-btn" style="background:none; border:none; color:#94a3b8; font-size:1.4rem; cursor:pointer;">&times;</button>
        </div>
        <div class="chat-body" id="chat-body-messages">
            <!-- Messages rendered dynamically -->
        </div>
        <div class="chat-footer" style="display:flex; align-items:center; gap:6px; padding:10px 14px;">
            <label id="chat-file-label" class="chat-attach-btn" title="Attach Image or File" style="background:#f1f5f9; color:#475569; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:1.05rem; border:1px solid #cbd5e1; flex-shrink:0;">
                <i class="fas fa-paperclip" style="pointer-events:none;"></i>
                <input type="file" id="chat-file-input" accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip" style="display:none;" />
            </label>
            <div style="flex:1; display:flex; flex-direction:column;">
                <div id="chat-file-preview-bar" style="display:none; padding:4px 8px; background:#e2e8f0; border-radius:6px; font-size:0.75rem; color:#1e293b; margin-bottom:4px; justify-content:space-between; align-items:center;">
                    <span id="chat-file-name-preview" style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:200px; font-weight:700;"></span>
                    <button id="chat-file-remove-btn" type="button" style="background:none; border:none; color:#ef4444; font-size:0.9rem; cursor:pointer; font-weight:800;">&times;</button>
                </div>
                <input type="text" id="chat-input-text" class="chat-input" placeholder="Type message or attach media/file..." />
            </div>
            <button id="chat-send-trigger" class="chat-send-btn" style="flex-shrink:0;"><i class="fas fa-paper-plane"></i></button>
        </div>
    `;
    document.body.appendChild(chatWindow);

    let selectedPendingMedia = null;

    // Helper: Compress Image on Canvas
    function processSelectedChatFile(file, callback) {
        if (!file) return;
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        const isAudio = file.type.startsWith('audio/');

        if (isImage) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                const img = new Image();
                img.onload = () => {
                    const maxDim = 1200;
                    let width = img.width;
                    let height = img.height;
                    if (width > maxDim || height > maxDim) {
                        if (width > height) {
                            height = Math.round((height * maxDim) / width);
                            width = maxDim;
                        } else {
                            width = Math.round((width * maxDim) / height);
                            height = maxDim;
                        }
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
                    callback({
                        type: 'image',
                        dataUrl: compressedDataUrl,
                        name: file.name
                    });
                };
                img.onerror = () => {
                    callback({
                        type: 'image',
                        dataUrl: evt.target.result,
                        name: file.name
                    });
                };
                img.src = evt.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            const reader = new FileReader();
            reader.onload = (evt) => {
                let type = 'file';
                if (isVideo) type = 'video';
                else if (isAudio) type = 'audio';
                else if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) type = 'pdf';

                callback({
                    type: type,
                    dataUrl: evt.target.result,
                    name: file.name
                });
            };
            reader.readAsDataURL(file);
        }
    }

    // Handle File Attachment Selection
    document.addEventListener('change', (e) => {
        if (e.target && e.target.id === 'chat-file-input') {
            const file = e.target.files[0];
            if (!file) return;

            if (file.size > 25 * 1024 * 1024) {
                alert('File size exceeds 25MB limit.');
                e.target.value = '';
                return;
            }

            processSelectedChatFile(file, (mediaObj) => {
                selectedPendingMedia = mediaObj;
                const previewBar = document.getElementById('chat-file-preview-bar');
                const namePreview = document.getElementById('chat-file-name-preview');
                if (previewBar && namePreview) {
                    let icon = '📁 File';
                    if (mediaObj.type === 'image') icon = '📷 Image';
                    else if (mediaObj.type === 'video') icon = '🎥 Video';
                    else if (mediaObj.type === 'audio') icon = '🎵 Audio';
                    else if (mediaObj.type === 'pdf') icon = '📄 PDF';

                    namePreview.textContent = `${icon}: ${file.name}`;
                    previewBar.style.display = 'flex';
                }
            });
        }
    });

    document.addEventListener('click', (e) => {
        if (e.target && (e.target.id === 'chat-file-remove-btn' || e.target.closest('#chat-file-remove-btn'))) {
            selectedPendingMedia = null;
            const fileInput = document.getElementById('chat-file-input');
            if (fileInput) fileInput.value = '';
            const previewBar = document.getElementById('chat-file-preview-bar');
            if (previewBar) previewBar.style.display = 'none';
        } else if (e.target && (e.target.id === 'chat-file-label' || e.target.closest('#chat-file-label'))) {
            const fileInput = document.getElementById('chat-file-input');
            if (fileInput && e.target !== fileInput) {
                fileInput.click();
            }
        }
    });

    // Attach click events to all elements with class contact-us-btn or href="#contact"
    document.addEventListener('click', (e) => {
        const target = e.target.closest('.contact-us-btn, [href="#contact"], #contact-us-floating-btn');
        if (target) {
            e.preventDefault();
            toggleChatWindow();
        }
    });

    document.getElementById('close-chat-btn').onclick = () => {
        chatWindow.style.display = 'none';
    };

    function toggleChatWindow() {
        if (chatWindow.style.display === 'flex') {
            chatWindow.style.display = 'none';
        } else {
            chatWindow.style.display = 'flex';
            renderChatMessages();
            markUserMessagesRead();
        }
    }

    function getChatData() {
        const userInfo = getUserInfo();
        const allChats = JSON.parse(localStorage.getItem('geniusact_contact_chats')) || [];
        let chat = allChats.find(c => 
            c.chatId === userInfo.chatId || 
            (userInfo.email && c.userEmail && c.userEmail.toLowerCase() === userInfo.email.toLowerCase()) ||
            (!userInfo.isGuest && c.userEmail && userInfo.email && c.userEmail.toLowerCase() === userInfo.email.toLowerCase())
        );
        return { allChats, chat, userInfo };
    }

    function renderChatMessages() {
        const body = document.getElementById('chat-body-messages');
        if (!body) return;

        const { chat, userInfo } = getChatData();

        if (!chat || !chat.messages || chat.messages.length === 0) {
            body.innerHTML = `
                <div style="text-align:center; padding:16px 10px; color:#64748b;">
                    <div style="padding:12px; background:#eff6ff; border-radius:50%; width:44px; height:44px; display:inline-flex; align-items:center; justify-content:center; margin-bottom:10px;">
                        <i class="fas fa-comments" style="color:#1e3a8a; font-size:1.3rem;"></i>
                    </div>
                    <h4 style="margin:0 0 6px 0; color:#0f172a; font-size:0.95rem;">Welcome to Campaign Support</h4>
                    <p style="font-size:0.8rem; margin:0; line-height:1.4;">Send a message below. An official campaign representative will assist you immediately.</p>
                </div>
            `;

            if (userInfo.isGuest && !userInfo.email) {
                const guestBox = document.createElement('div');
                guestBox.className = 'chat-guest-form';
                guestBox.innerHTML = `
                    <h4>Introduce Yourself</h4>
                    <p>Enter your info so we can reach you with updates.</p>
                    <input type="text" id="guest-name-input" placeholder="Your Name" />
                    <input type="email" id="guest-email-input" placeholder="Your Email Address" />
                    <button id="save-guest-info-btn" style="width:100%; padding:8px; background:#1e3a8a; color:white; border:none; border-radius:6px; font-weight:700; cursor:pointer;">Save & Start Chat</button>
                `;
                body.appendChild(guestBox);
                document.getElementById('save-guest-info-btn').onclick = () => {
                    const name = document.getElementById('guest-name-input').value.trim();
                    const email = document.getElementById('guest-email-input').value.trim();
                    if (name) localStorage.setItem('geniusact_guest_name', name);
                    if (email) localStorage.setItem('geniusact_guest_email', email);
                    renderChatMessages();
                };
            }
            return;
        }

        body.innerHTML = chat.messages.map(m => {
            const isUser = m.sender === 'user';
            const timeStr = m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
            
            let mediaContent = '';
            if (m.media && m.media.dataUrl) {
                const dUrl = m.media.dataUrl;
                const mType = m.media.type || '';
                const mName = escapeHtml(m.media.name || 'Attachment');

                if (mType === 'image' || dUrl.startsWith('data:image/')) {
                    mediaContent = `<div style="margin-top:6px;"><img src="${dUrl}" style="max-width:100%; max-height:240px; border-radius:8px; border:1px solid rgba(0,0,0,0.1); cursor:pointer; display:block;" onclick="window.open(this.src)" title="Click to view full image" /></div>`;
                } else if (mType === 'video' || dUrl.startsWith('data:video/')) {
                    mediaContent = `<div style="margin-top:6px;"><video src="${dUrl}" controls style="max-width:100%; max-height:240px; border-radius:8px; border:1px solid rgba(0,0,0,0.1); display:block;"></video></div>`;
                } else if (mType === 'audio' || dUrl.startsWith('data:audio/')) {
                    mediaContent = `<div style="margin-top:6px;"><audio src="${dUrl}" controls style="max-width:100%; display:block;"></audio></div>`;
                } else {
                    mediaContent = `<div style="margin-top:6px; padding:8px 12px; background:${isUser ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.06)'}; border-radius:8px; display:inline-flex; align-items:center; gap:8px;">
                        <i class="fas fa-file-alt" style="font-size:1.4rem; color:${isUser ? '#ffffff' : '#2563eb'};"></i>
                        <div>
                            <div style="font-weight:700; font-size:0.82rem; color:${isUser ? '#ffffff' : '#1e293b'}; max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${mName}</div>
                            <a href="${dUrl}" target="_blank" download="${mName}" style="font-size:0.75rem; color:${isUser ? '#bfdbfe' : '#2563eb'}; text-decoration:underline; font-weight:600;">Download / Open File</a>
                        </div>
                    </div>`;
                }
            }

            const accBadge = m.accountId || chat.accountId || 'FEC-87492109';

            return `
                <div class="chat-bubble ${isUser ? 'user' : 'admin'}">
                    ${isUser 
                        ? `<div style="font-size:0.65rem; font-weight:700; color:#93c5fd; margin-bottom:2px; display:flex; justify-content:space-between;"><span>Account ID: ${escapeHtml(accBadge)}</span></div>`
                        : `<div style="font-size:0.7rem; font-weight:800; color:#1e3a8a; margin-bottom:2px;"><i class="fas fa-user-shield"></i> Campaign Desk</div>`
                    }
                    ${m.text ? `<div>${escapeHtml(m.text)}</div>` : ''}
                    ${mediaContent}
                    <span class="chat-time">${timeStr}</span>
                </div>
            `;
        }).join('');

        body.scrollTop = body.scrollHeight;
    }

    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    async function sendChatMessage() {
        try {
            const input = document.getElementById('chat-input-text');
            if (!input) return;
            const text = input.value.trim();
            if (!text && !selectedPendingMedia) return;

            const { allChats, chat, userInfo } = getChatData();
            const now = new Date().toISOString();

            // Ensure User has Account ID
            const userStr = localStorage.getItem('geniusact_current_user');
            let accountId = 'FEC-87492109';
            if (userStr) {
                try {
                    const u = JSON.parse(userStr);
                    if (!u.accountId) {
                        u.accountId = 'FEC-' + Math.floor(10000000 + Math.random() * 90000000);
                        localStorage.setItem('geniusact_current_user', JSON.stringify(u));
                    }
                    accountId = u.accountId;
                } catch(e) {}
            }

            const newMsg = {
                id: 'm_' + Date.now(),
                sender: 'user',
                text: text,
                media: selectedPendingMedia ? { ...selectedPendingMedia } : null,
                timestamp: now,
                accountId: accountId
            };

            let existingChat = allChats.find(c => c.chatId === userInfo.chatId || (userInfo.email && c.userEmail && c.userEmail.toLowerCase() === userInfo.email.toLowerCase()));

            if (existingChat) {
                if (!Array.isArray(existingChat.messages)) existingChat.messages = [];
                existingChat.messages.push(newMsg);
                existingChat.lastUpdated = now;
                existingChat.unreadAdminCount = (existingChat.unreadAdminCount || 0) + 1;
                existingChat.accountId = accountId;
                if (userInfo.name && userInfo.name !== 'Guest Visitor') existingChat.userName = userInfo.name;
                if (userInfo.email) existingChat.userEmail = userInfo.email;
            } else {
                const newChat = {
                    chatId: userInfo.chatId,
                    userEmail: userInfo.email || 'supportgeniusactglobal@gmail.com',
                    userName: userInfo.name || 'Guest Visitor',
                    accountId: accountId,
                    isGuest: userInfo.isGuest,
                    createdAt: now,
                    lastUpdated: now,
                    unreadAdminCount: 1,
                    unreadUserCount: 0,
                    messages: [newMsg]
                };
                allChats.push(newChat);
            }

            localStorage.setItem('geniusact_contact_chats', JSON.stringify(allChats));

            // Direct REST call to server for instant multi-device sync
            fetch('/api/chat/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chatId: userInfo.chatId,
                    userEmail: userInfo.email || 'guest@geniusact.org',
                    userName: userInfo.name || 'Guest Visitor',
                    accountId: accountId,
                    isGuest: userInfo.isGuest,
                    message: newMsg
                })
            }).catch(err => console.warn('Direct chat API call fallback to cloudSync:', err));

            // Reset media and input
            selectedPendingMedia = null;
            const fileInput = document.getElementById('chat-file-input');
            if (fileInput) fileInput.value = '';
            const previewBar = document.getElementById('chat-file-preview-bar');
            if (previewBar) previewBar.style.display = 'none';

            input.value = '';
            renderChatMessages();

            if (window.recordUserFootprint) {
                try { window.recordUserFootprint('Live Chat Message', text || '[Media Attachment]', { email: userInfo.email, name: userInfo.name }); } catch (e) { }
            }

            if (window.cloudSyncFull) {
                window.cloudSyncFull().then(() => {
                    window.dispatchEvent(new CustomEvent('cloudSyncUpdated', { detail: {} }));
                }).catch(e => console.log(e));
            }
        } catch (err) {
            console.error('Error sending chat message:', err);
        }
    }

    const sendTriggerBtn = document.getElementById('chat-send-trigger');
    if (sendTriggerBtn) {
        sendTriggerBtn.onclick = (e) => {
            if (e) e.preventDefault();
            sendChatMessage();
        };
    }

    const chatInputField = document.getElementById('chat-input-text');
    if (chatInputField) {
        chatInputField.onkeydown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendChatMessage();
            }
        };
    }

    function markUserMessagesRead() {
        const { allChats, chat } = getChatData();
        if (chat) {
            chat.unreadUserCount = 0;
            localStorage.setItem('geniusact_contact_chats', JSON.stringify(allChats));
            const dot = document.getElementById('contact-unread-dot');
            if (dot) dot.style.display = 'none';
        }
    }

    setInterval(async () => {
        if (window.cloudSyncFull) {
            try { await window.cloudSyncFull(); } catch (e) { }
        }
        const { chat } = getChatData();
        const dot = document.getElementById('contact-unread-dot');
        if (chat && chat.unreadUserCount > 0 && dot) {
            dot.textContent = chat.unreadUserCount;
            dot.style.display = 'flex';
        }
        if (chatWindow.style.display === 'flex') {
            renderChatMessages();
        }
    }, 4000);

})();
