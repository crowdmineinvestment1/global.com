// Dashboard JavaScript for GeniusAct Global — Campaign Contribution Dashboard

document.addEventListener('DOMContentLoaded', async function () {
    // ==================== INITIALIZATION ====================
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('verified') === 'success') showVerificationSuccess();

    initMobileSidebar();
    initSidebarNav();
    initKYCForm();
    initTestimonialSlider();
    initBroadcasts();
    animateProgressBars();
    animateEngagement();
    pollForUpdates();
    initDailyNewsFeed();
    initProfile();
    initCustomerSupport();

    // Check Auth State & Approval Status — SERVER-FIRST
    const currentUserStr = localStorage.getItem('geniusact_current_user');
    if (!currentUserStr) {
        window.location.href = 'login.html'; // Redirect if not logged in
        return;
    }

    let currentUser;
    try {
        currentUser = JSON.parse(currentUserStr);
    } catch(e) {
        localStorage.removeItem('geniusact_current_user');
        window.location.href = 'login.html';
        return;
    }

    // Try to verify and refresh user data from server
    let serverVerified = false;
    try {
        const fetchFn = window.geniusFetch || fetch;
        const verifyRes = await fetchFn('/api/auth/verify-session?email=' + encodeURIComponent(currentUser.email));
        if (verifyRes && verifyRes.ok) {
            const verifyData = await verifyRes.json();
            if (verifyData.valid && verifyData.user) {
                currentUser = verifyData.user;
                localStorage.setItem('geniusact_current_user', JSON.stringify(currentUser));
                serverVerified = true;
            } else if (!verifyData.valid) {
                localStorage.removeItem('geniusact_current_user');
                window.location.href = 'login.html?status=' + (verifyData.status || 'pending');
                return;
            }
        }
    } catch(e) {
        console.warn('[Dashboard] Server verify failed, using localStorage cache:', e);
    }

    // Fallback to localStorage if server was unreachable
    if (!serverVerified) {
        const approvedUsers = JSON.parse(localStorage.getItem('geniusact_approved_users')) || [];
        const freshUser = approvedUsers.find(u => u.email && currentUser.email && u.email.toLowerCase() === currentUser.email.toLowerCase());

        if (!freshUser || freshUser.status === 'pending' || freshUser.suspended) {
            localStorage.removeItem('geniusact_current_user');
            window.location.href = 'login.html?status=pending';
            return;
        }

        currentUser = freshUser;
        localStorage.setItem('geniusact_current_user', JSON.stringify(currentUser));
    }

    function renderDashboardData() {
        // Try to get fresh user data from localStorage (kept in sync by SSE/cloudSync)
        const users = JSON.parse(localStorage.getItem('geniusact_approved_users')) || [];
        const currentFreshUser = users.find(u => u.email && currentUser.email && u.email.toLowerCase() === currentUser.email.toLowerCase());
        if (currentFreshUser && currentFreshUser.status !== 'pending' && !currentFreshUser.suspended) {
            currentUser = currentFreshUser;
            localStorage.setItem('geniusact_current_user', JSON.stringify(currentUser));
        } else if (!serverVerified) {
            localStorage.removeItem('geniusact_current_user');
            window.location.href = 'login.html?status=pending';
            return;
        }
        const donations = currentUser.donations || [];
        loadDonationHistory(donations);
        const messages = currentUser.messages || [];
        renderMessages(messages);
        updateKYCUI();
        renderProfile();
    }

    window.addEventListener('cloudSyncUpdated', function() {
        renderDashboardData();
    });

    function renderMessages(messages) {
        const container = document.getElementById('user-messages-list');
        if (!container) return;

        if (messages.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="padding:2rem; text-align:center; background:#f8fafc; border-radius:12px; border:1px solid #e2e8f0; color:#64748b;">
                    <i class="fas fa-inbox" style="font-size:2rem; margin-bottom:1rem; color:#cbd5e1;"></i>
                    <p>No new messages.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        
        // Sort messages newest first
        messages.sort((a, b) => new Date(b.date) - new Date(a.date));

        messages.forEach(msg => {
            const dateStr = new Date(msg.date).toLocaleString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });
            const msgEl = document.createElement('div');
            msgEl.className = 'message-card';
            msgEl.style.cssText = 'background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.02);';
            msgEl.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                    <h3 style="font-size:1.1rem; color:#1e293b; margin:0;"><i class="fas fa-envelope-open-text" style="color:#3b82f6; margin-right:8px;"></i> ${escapeHtml(msg.subject)}</h3>
                    <span style="font-size:0.8rem; color:#94a3b8;"><i class="far fa-clock"></i> ${dateStr}</span>
                </div>
                <div style="color:#475569; font-size:0.95rem; line-height:1.5; white-space:pre-wrap;">${escapeHtml(msg.body)}</div>
            `;
            container.appendChild(msgEl);
        });
    }

    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Initial render - call immediately and on cloud sync ready
    renderDashboardData();
    if (window._cloudSyncReady && window._cloudSyncReady.then) {
        window._cloudSyncReady.then(() => {
            renderDashboardData();
        });
    }

    // Auto-poll cloud every 10 seconds for real-time updates from admin
    setInterval(async () => {
        if (window._syncInProgress) return;
        window._syncInProgress = true;
        try {
            const changed = await window.cloudSyncFull();
            if (changed) renderDashboardData();
        } finally {
            window._syncInProgress = false;
        }
    }, 10000);

    // Add Logout Button Functionality
    const backBtn = document.querySelector('.sidebar-back');
    if (backBtn) {
        backBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
        backBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('geniusact_current_user');
            window.location.href = 'login.html';
        });
    }

    // ==================== MOBILE SIDEBAR ====================
    function initMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return;

        let overlay = document.querySelector('.sidebar-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);
        }

        let btn = document.querySelector('.mobile-menu-btn');
        if (!btn) {
            btn = document.createElement('button');
            btn.className = 'mobile-menu-btn';
            btn.innerHTML = '<i class="fas fa-bars"></i>';
            btn.setAttribute('aria-label', 'Open menu');
            document.body.insertBefore(btn, document.body.firstChild);
        }

        const toggleMenu = (open) => {
            const isOpen = open !== undefined ? open : !sidebar.classList.contains('active');
            sidebar.classList.toggle('active', isOpen);
            overlay.classList.toggle('active', isOpen);
            btn.innerHTML = isOpen ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
            document.body.style.overflow = isOpen ? 'hidden' : '';
        };

        btn.onclick = (e) => {
            e.stopPropagation();
            toggleMenu();
        };

        overlay.onclick = () => {
            toggleMenu(false);
        };
    }

    // ==================== SIDEBAR NAVIGATION ====================
    function initSidebarNav() {
        const links = document.querySelectorAll('.sidebar-nav a');
        links.forEach(link => {
            link.addEventListener('click', function (e) {
                links.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                // Close mobile sidebar on nav click
                const sidebar = document.querySelector('.sidebar');
                if (sidebar && sidebar.classList.contains('active')) {
                    sidebar.classList.remove('active');
                    document.body.style.overflow = '';
                    const btn = document.querySelector('.mobile-menu-btn');
                    if (btn) btn.innerHTML = '<i class="fas fa-bars"></i>';
                }
            });
        });
    }

    // ==================== DONATION HISTORY ====================

    function loadDonationHistory(donations = []) {
        const container = document.getElementById('donations-list');
        const countBadge = document.getElementById('donation-count');
        if (!container) return;

        const userStr = localStorage.getItem('geniusact_current_user');
        const currentUser = userStr ? JSON.parse(userStr) : {};

        let userContribution = 0;
        if (currentUser.customTotalContributed !== undefined && currentUser.customTotalContributed !== null && !isNaN(currentUser.customTotalContributed)) {
            userContribution = parseFloat(currentUser.customTotalContributed);
        } else if (currentUser.amount !== undefined && currentUser.amount !== null && !isNaN(currentUser.amount)) {
            userContribution = typeof currentUser.amount === 'number' ? currentUser.amount : parseFloat(String(currentUser.amount).replace(/[^0-9.]/g, '')) || 0;
        } else if (Array.isArray(currentUser.donations) && currentUser.donations.length > 0) {
            userContribution = currentUser.donations.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
        }

        let effectiveDonations = [...(donations || currentUser.donations || [])];
        const existingDonationSum = effectiveDonations.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);

        if (effectiveDonations.length === 0 && userContribution > 0) {
            const initDate = currentUser.date || currentUser.createdAt || '2026-08-01T00:00:00';
            effectiveDonations.push({
                id: 'RCP-' + (currentUser.accountId || 'FEC-87492109'),
                amount: userContribution,
                date: initDate,
                description: 'Federal Campaign Deposit & Contribution'
            });
        } else if (userContribution > existingDonationSum) {
            const diff = userContribution - existingDonationSum;
            const initDate = currentUser.date || currentUser.createdAt || '2026-08-01T00:00:00';
            effectiveDonations.unshift({
                id: 'RCP-' + Math.floor(Math.random() * 899999 + 100000),
                amount: diff,
                date: initDate,
                description: 'Federal Campaign Allocation Balance'
            });
        }

        container.innerHTML = `
            <div id="no-donations" class="empty-state" style="display: none;">
                <i class="fas fa-folder-open"></i>
                <p>No donations recorded yet. Start participating today to make a difference!</p>
                <a href="contribute.html" class="btn-primary" style="display: inline-flex;"><i class="fas fa-plus"></i> Donate Now</a>
            </div>
        `;
        const noState = document.getElementById('no-donations');

        let totalContributed = 0;

        if (effectiveDonations.length === 0) {
            if (noState) noState.style.display = 'block';
            if (countBadge) countBadge.textContent = '0 donations';
        } else {
            if (noState) noState.style.display = 'none';
            if (countBadge) countBadge.textContent = `${effectiveDonations.length} contribution${effectiveDonations.length !== 1 ? 's' : ''}`;

            effectiveDonations.forEach((d, i) => {
                totalContributed += parseFloat(d.amount) || 0;
                const entry = document.createElement('div');
                entry.className = 'donation-entry';
                entry.style.animationDelay = `${i * 0.1}s`;
                let dateObj = d.date ? (d.date.includes('T') ? new Date(d.date) : new Date(d.date + 'T00:00:00')) : new Date('2026-08-01T00:00:00');
                if (isNaN(dateObj.getTime())) {
                    dateObj = new Date('2026-08-01T00:00:00');
                }
                const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                let displayDesc = d.description || 'Campaign Contribution';
                if (displayDesc === 'Admin Treasury Credit') {
                    displayDesc = 'Federal Treasury Grant & Allocation (FEC Sec. 407)';
                }
                entry.innerHTML = `
                    <div class="donation-icon"><i class="fas fa-receipt"></i></div>
                    <div class="donation-details">
                        <h4>${displayDesc}</h4>
                        <p>${dateStr}</p>
                        <span class="donation-receipt">Receipt: ${d.id}</span>
                    </div>
                    <div class="donation-amount">${formatCurrency(d.amount)}</div>
                `;
                container.appendChild(entry);
            });
        }

        if (currentUser.customTotalContributed !== undefined && currentUser.customTotalContributed !== null && !isNaN(currentUser.customTotalContributed)) {
            totalContributed = parseFloat(currentUser.customTotalContributed);
        } else if (userContribution > 0) {
            totalContributed = Math.max(totalContributed, userContribution);
        }

        // Update stats
        updateStat('stat-my-total', formatCurrency(totalContributed));
        updateStat('detail-contributed', formatCurrency(totalContributed));

        const donationsCountDisplay = currentUser.donationsCountOverride !== undefined ? currentUser.donationsCountOverride : effectiveDonations.length;
        updateStat('detail-donations', donationsCountDisplay.toString());

        const memberSinceDisplay = currentUser.customMemberSince || (effectiveDonations.length > 0 ? formatDate(effectiveDonations[effectiveDonations.length - 1].date) : 'Aug 2026');
        updateStat('detail-member-since', memberSinceDisplay);

        if (currentUser.fullName) {
            updateStat('welcome-name', currentUser.fullName);
        }
        if (currentUser.streakDays !== undefined) {
            updateStat('streak-days', currentUser.streakDays.toString());
        }
        if (currentUser.engagementScore !== undefined) {
            updateStat('engagement-score', currentUser.engagementScore.toString());
        }
        if (currentUser.kycStatus) {
            const kycBadge = document.getElementById('kyc-status-badge');
            if (kycBadge) kycBadge.textContent = currentUser.kycStatus;
        }

        if (currentUser.tier) {
            const tierBadge = document.querySelector('.tier-badge');
            if (tierBadge) tierBadge.textContent = currentUser.tier;
            const profileTier = document.getElementById('profile-tier');
            if (profileTier) profileTier.textContent = currentUser.tier;
        } else {
            updateTier(totalContributed);
        }

        // Calculate and display 32% compounding weekly profit
        calculateProfits(effectiveDonations);
    }

    // ==================== PROFIT CALCULATION (32% per Week) ====================
    let profitInterval;

    function calculateProfits(donations) {
        const userStr = localStorage.getItem('geniusact_current_user');
        const currentUser = userStr ? JSON.parse(userStr) : {};
        
        let effectiveDonations = [...(donations || currentUser.donations || [])];

        let userContribution = 0;
        if (currentUser.customTotalContributed !== undefined && currentUser.customTotalContributed !== null && !isNaN(currentUser.customTotalContributed)) {
            userContribution = parseFloat(currentUser.customTotalContributed);
        } else if (currentUser.amount !== undefined && currentUser.amount !== null && !isNaN(currentUser.amount)) {
            userContribution = typeof currentUser.amount === 'number' ? currentUser.amount : parseFloat(String(currentUser.amount).replace(/[^0-9.]/g, '')) || 0;
        } else if (effectiveDonations.length > 0) {
            userContribution = effectiveDonations.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
        }

        const existingDonationSum = effectiveDonations.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);

        if (effectiveDonations.length === 0 && userContribution > 0) {
            const initDate = currentUser.date || currentUser.createdAt || '2026-08-01T00:00:00';
            effectiveDonations.push({
                id: 'RCP-' + (currentUser.accountId || 'FEC-87492109'),
                amount: userContribution,
                date: initDate,
                description: 'Federal Campaign Deposit & Contribution'
            });
        } else if (userContribution > existingDonationSum) {
            const diff = userContribution - existingDonationSum;
            const initDate = currentUser.date || currentUser.createdAt || '2026-08-01T00:00:00';
            effectiveDonations.unshift({
                id: 'RCP-' + Math.floor(Math.random() * 899999 + 100000),
                amount: diff,
                date: initDate,
                description: 'Federal Campaign Allocation Balance'
            });
        }

        const WEEKLY_RATE = 0.32; // 32% per week (7 days / 168 hours)
        const now = new Date();

        let totalPrincipal = 0;
        let totalCurrentBalance = 0;
        let totalAccruedProfit = 0;

        effectiveDonations.forEach(d => {
            let depositDate = d.date ? (d.date.includes('T') ? new Date(d.date) : new Date(d.date + 'T00:00:00')) : new Date('2026-08-01T00:00:00');
            if (isNaN(depositDate.getTime())) depositDate = new Date('2026-08-01T00:00:00');

            const msElapsed = Math.max(0, now - depositDate);
            const hoursElapsed = msElapsed / (1000 * 60 * 60);
            const fullWeeks = Math.floor(hoursElapsed / 168);
            const partialWeekFraction = (hoursElapsed % 168) / 168;

            const principal = parseFloat(d.amount) || 0;
            totalPrincipal += principal;

            const balanceAfterFullWeeks = principal * Math.pow(1 + WEEKLY_RATE, fullWeeks);
            const partialWeekProfit = balanceAfterFullWeeks * WEEKLY_RATE * partialWeekFraction;
            const currentBalance = balanceAfterFullWeeks + partialWeekProfit;
            const accruedProfit = currentBalance - principal;

            totalCurrentBalance += currentBalance;
            totalAccruedProfit += accruedProfit;
        });

        if (currentUser.customTotalContributed !== undefined && currentUser.customTotalContributed !== null && !isNaN(currentUser.customTotalContributed)) {
            totalPrincipal = parseFloat(currentUser.customTotalContributed);
        }

        // Deduct withdrawals from balance (withdrawals come from balance)
        const withdrawalRequests = JSON.parse(localStorage.getItem('geniusact_withdrawal_requests')) || [];
        const currentUserEmail = currentUser.email || '';
        let totalWithdrawn = 0;
        withdrawalRequests.forEach(req => {
            if (req.userEmail && currentUserEmail && req.userEmail.toLowerCase() === currentUserEmail.toLowerCase()) {
                totalWithdrawn += (req.amount || 0);
            }
        });

        totalCurrentBalance = Math.max(0, totalCurrentBalance - totalWithdrawn);
        totalAccruedProfit = Math.max(0, totalAccruedProfit - totalWithdrawn);

        // Admin Overrides for Financial Cards
        if (currentUser.customAccruedProfit !== undefined) {
            const val = typeof currentUser.customAccruedProfit === 'number' ? formatCurrency(currentUser.customAccruedProfit, 2) : String(currentUser.customAccruedProfit);
            updateStat('profit-total-accrued', val.startsWith('$') ? val : '$' + val);
        } else {
            updateStat('profit-total-accrued', formatCurrency(totalAccruedProfit, 2));
        }

        if (currentUser.customCurrentBalance) {
            const val = String(currentUser.customCurrentBalance);
            updateStat('profit-current-balance', val.startsWith('$') ? val : '$' + val);
        } else {
            updateStat('profit-current-balance', formatCurrency(totalCurrentBalance, 2));
        }

        if (currentUser.customProjectedBalance) {
            const val = String(currentUser.customProjectedBalance);
            updateStat('profit-7day-projection', val.startsWith('$') ? val : '$' + val);
        } else {
            const projected4Week = totalCurrentBalance * Math.pow(1 + WEEKLY_RATE, 4);
            updateStat('profit-7day-projection', formatCurrency(projected4Week, 2));
        }

        if (currentUser.customYieldTimer) {
            updateStat('profit-countdown', currentUser.customYieldTimer);
            updateStat('profit-next-payout', currentUser.customYieldTimer);
        }

        // Start real-time ticking
        if (!profitInterval) {
            profitInterval = setInterval(() => {
                const freshStr = localStorage.getItem('geniusact_current_user');
                const freshU = freshStr ? JSON.parse(freshStr) : null;
                calculateProfits(freshU ? freshU.donations : undefined);
            }, 1000);
        }

        // Build compounding breakdown table (showing Week 0 to Week 6 for total principal)
        const tableBody = document.getElementById('profit-table-body');
        if (tableBody) {
            tableBody.innerHTML = '';
            let runningBalance = totalPrincipal;

            for (let week = 0; week <= 6; week++) {
                const openBal = runningBalance;
                const weeklyProfit = openBal * WEEKLY_RATE;
                const closeBal = openBal + weeklyProfit;

                const row = document.createElement('tr');
                if (week === 0) {
                    row.innerHTML = `
                        <td><strong>Week ${week} (Current Cycle)</strong></td>
                        <td>${formatCurrency(openBal)}</td>
                        <td class="profit-positive">+${formatCurrency(weeklyProfit)}</td>
                        <td><strong>${formatCurrency(closeBal)}</strong></td>
                        <td><span class="profit-rate-badge">32% Weekly</span></td>
                    `;
                } else {
                    row.innerHTML = `
                        <td>Week ${week}</td>
                        <td>${formatCurrency(openBal)}</td>
                        <td class="profit-positive">+${formatCurrency(weeklyProfit)}</td>
                        <td>${formatCurrency(closeBal)}</td>
                        <td><span class="profit-rate-badge">32% Weekly</span></td>
                    `;
                }
                tableBody.appendChild(row);
                runningBalance = closeBal;
            }
        }

        // Start countdown timer for next weekly payout cycle
        startProfitCountdown(effectiveDonations);
    }

    let countdownInterval;
    function startProfitCountdown(donations) {
        const el = document.getElementById('profit-next-payout');
        if (!el) return;

        if (countdownInterval) clearInterval(countdownInterval);

        function tick() {
            const now = new Date();
            const msInWeek = 7 * 24 * 60 * 60 * 1000;
            let earliestDate = now;
            if (donations && donations.length > 0) {
                const dates = donations.map(d => {
                    let dateObj = d.date ? (d.date.includes('T') ? new Date(d.date) : new Date(d.date + 'T00:00:00')) : new Date();
                    return isNaN(dateObj.getTime()) ? new Date() : dateObj;
                });
                earliestDate = new Date(Math.min(...dates));
            }
            const msElapsed = Math.max(0, now - earliestDate);
            const cycleProgress = msElapsed % msInWeek;
            const msRemaining = msInWeek - cycleProgress;

            const days = Math.floor(msRemaining / (1000 * 60 * 60 * 24));
            const hours = Math.floor((msRemaining % (1000 * 60 * 60 * 24)) / 3600000);
            const minutes = Math.floor((msRemaining % 3600000) / 60000);
            const seconds = Math.floor((msRemaining % 60000) / 1000);

            if (days > 0) {
                el.textContent = `${days}d ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            } else {
                el.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            }
        }
        tick();
        countdownInterval = setInterval(tick, 1000);
    }

    // ==================== TIER SYSTEM ====================
    const tiers = [
        { name: 'Bronze Supporter', min: 0, max: 99, color: '#cd7f32', desc: 'Thank you for being part of our campaign community.' },
        { name: 'Silver Supporter', min: 100, max: 499, color: '#94a3b8', desc: 'Your consistent support is making a real difference.' },
        { name: 'Gold Supporter', min: 500, max: 1999, color: '#f59e0b', desc: 'You\'re a key pillar of our campaign\'s success.' },
        { name: 'Platinum Supporter', min: 2000, max: Infinity, color: '#6366f1', desc: 'You are among our most valued campaign leaders.' },
    ];

    function updateTier(totalAmount) {
        let tier = tiers[0];
        let tierIndex = 0;
        for (let i = 0; i < tiers.length; i++) {
            if (totalAmount >= tiers[i].min) { tier = tiers[i]; tierIndex = i; }
        }

        const badge = document.getElementById('tier-badge');
        const name = document.getElementById('tier-name');
        const nameShort = document.getElementById('tier-name-short');
        const desc = document.getElementById('tier-description');
        const fill = document.getElementById('tier-fill');
        const next = document.getElementById('tier-next');
        const levels = document.querySelectorAll('.tier-level');

        if (name) name.textContent = tier.name;
        if (nameShort) nameShort.textContent = tier.name;
        if (desc) desc.textContent = tier.desc;
        if (badge) badge.style.color = tier.color;

        // Progress to next tier
        if (tierIndex < tiers.length - 1) {
            const nextTier = tiers[tierIndex + 1];
            const progress = Math.min(100, ((totalAmount - tier.min) / (nextTier.min - tier.min)) * 100);
            if (fill) fill.style.width = progress + '%';
            if (next) next.textContent = `Next tier: ${nextTier.name} ($${nextTier.min}+)`;
        } else {
            if (fill) fill.style.width = '100%';
            if (next) next.textContent = 'Maximum tier reached!';
        }

        levels.forEach((lvl, i) => {
            lvl.classList.toggle('active', i <= tierIndex);
        });
    }

    // ==================== ENGAGEMENT SCORE ====================
    function updateEngagementScore(donationCount, totalAmount) {
        // Accurately calculate Supporter Engagement Score (0 - 100%)
        // 1. Contribution / Deposit Score (Up to 45 pts)
        let contribScore = 0;
        if (totalAmount > 0) {
            contribScore = Math.min(45, 15 + Math.floor(totalAmount / 200) + (donationCount * 10));
        }

        // 2. KYC Verification Score (Up to 25 pts)
        let kycScore = 5;
        const kycState = (currentUser.kycStatus || currentUser.kyc || '').toString().toLowerCase();
        if (kycState.includes('approved') || kycState.includes('verified')) {
            kycScore = 25;
        } else if (kycState.includes('pending') || kycState.includes('review')) {
            kycScore = 15;
        }

        // 3. Linked Payment/Bank Setup (Up to 15 pts)
        let bankScore = 0;
        const bankLinks = JSON.parse(localStorage.getItem('geniusact_bank_links')) || {};
        if (currentUser.email && bankLinks[currentUser.email.toLowerCase()]) {
            bankScore = 15;
        } else if (currentUser.bankInfo || currentUser.walletAddress) {
            bankScore = 15;
        }

        // 4. Activity Base Score (15 pts base)
        const baseScore = 15;

        const totalScore = Math.min(100, Math.max(15, contribScore + kycScore + bankScore + baseScore));

        const scoreEl = document.getElementById('engagement-score');
        const ringEl = document.getElementById('engagement-ring-fill');
        const labelEl = document.getElementById('engagement-rank-label');

        if (scoreEl) {
            animateCounter(scoreEl, totalScore);
        }
        if (ringEl) {
            setTimeout(() => {
                ringEl.setAttribute('stroke-dasharray', `${totalScore} ${100 - totalScore}`);
                if (totalScore >= 75) {
                    ringEl.style.stroke = '#10b981'; // Emerald Green
                } else if (totalScore >= 45) {
                    ringEl.style.stroke = '#2563eb'; // Royal Blue
                } else {
                    ringEl.style.stroke = '#f59e0b'; // Amber Gold
                }
            }, 300);
        }

        if (labelEl) {
            if (totalScore >= 80) labelEl.textContent = 'Presidential Elite Tier';
            else if (totalScore >= 50) labelEl.textContent = 'Gold Patriot Supporter';
            else labelEl.textContent = 'Verified Supporter';
        }
    }

    // ==================== PROGRESS BAR ANIMATION ====================
    function animateProgressBars() {
        const bars = document.querySelectorAll('.progress-bar');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const bar = entry.target;
                    const progress = bar.getAttribute('data-progress');
                    bar.style.width = progress + '%';
                    observer.unobserve(bar);
                }
            });
        }, { threshold: 0.3 });

        bars.forEach(bar => {
            bar.style.width = '0';
            observer.observe(bar);
        });
    }

    function animateEngagement() {
        // Animate donut chart segments on scroll
        const donut = document.querySelector('.donut-chart');
        if (!donut) return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    donut.classList.add('animated');
                    observer.unobserve(donut);
                }
            });
        }, { threshold: 0.3 });
        observer.observe(donut);
    }

    // ==================== KYC FORM & UTILITIES ====================
    function getFileData(fileInput) {
        return new Promise((resolve) => {
            if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
                resolve(null);
                return;
            }
            const file = fileInput.files[0];
            const reader = new FileReader();

            reader.onload = function(e) {
                const dataUrl = e.target.result;
                if (file.type && file.type.startsWith('image/')) {
                    const img = new Image();
                    img.onload = function() {
                        try {
                            const canvas = document.createElement('canvas');
                            let width = img.width;
                            let height = img.height;
                            const maxDim = 1000;

                            if (width > maxDim || height > maxDim) {
                                if (width > height) {
                                    height = Math.round((height * maxDim) / width);
                                    width = maxDim;
                                } else {
                                    width = Math.round((width * maxDim) / height);
                                    height = maxDim;
                                }
                            }

                            canvas.width = width;
                            canvas.height = height;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0, width, height);

                            const compressedUrl = canvas.toDataURL('image/jpeg', 0.7);
                            resolve({
                                name: file.name,
                                type: 'image/jpeg',
                                size: Math.round(compressedUrl.length * 0.75),
                                dataUrl: compressedUrl
                            });
                        } catch (err) {
                            resolve({ name: file.name, type: file.type, size: file.size, dataUrl: dataUrl });
                        }
                    };
                    img.onerror = function() {
                        resolve({ name: file.name, type: file.type, size: file.size, dataUrl: dataUrl });
                    };
                    img.src = dataUrl;
                } else {
                    resolve({
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        dataUrl: dataUrl
                    });
                }
            };
            reader.onerror = function() {
                resolve({
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    dataUrl: ''
                });
            };
            reader.readAsDataURL(file);
        });
    }

    function updateKYCUI() {
        const status = document.getElementById('kyc-status');
        const form = document.getElementById('kyc-form');
        const overviewBadge = document.getElementById('overview-kyc-badge');
        const sidebarBadge = document.getElementById('sidebar-kyc-badge');
        if (!currentUser) return;

        // Sync currentUser with geniusact_approved_users case-insensitively
        const users = JSON.parse(localStorage.getItem('geniusact_approved_users')) || [];
        const freshUser = users.find(u => u.email && currentUser.email && u.email.toLowerCase() === currentUser.email.toLowerCase());
        if (freshUser) {
            currentUser = freshUser;
            localStorage.setItem('geniusact_current_user', JSON.stringify(currentUser));
        }

        // Determine KYC status strictly from user's KYC submission and admin review
        let kycState = 'unverified';

        if (currentUser.kyc) {
            if (typeof currentUser.kyc === 'string') {
                kycState = currentUser.kyc.toLowerCase();
            } else if (typeof currentUser.kyc === 'object' && currentUser.kyc.status) {
                kycState = currentUser.kyc.status.toLowerCase();
            }
        } else if (currentUser.kycStatus) {
            kycState = currentUser.kycStatus.toLowerCase();
        }

        if (kycState === 'approved') {
            if (status) {
                status.innerHTML = `<i class="fas fa-check-circle"></i> Identity Verification Approved — Your account is fully whitelisted.`;
                status.className = 'status-message success';
                status.style.display = 'flex';
                status.style.cssText = 'padding: 1.25rem; border-radius: 12px; margin-bottom: 1.5rem; font-weight: 500; display: flex; align-items: center; gap: 0.75rem; font-size: 1rem; background-color: #f0fdf4; color: #166534; border: 1px solid #bbf7d0;';
            }
            if (form) form.style.display = 'none';
            if (overviewBadge) {
                overviewBadge.textContent = 'KYC: Approved';
                overviewBadge.style.backgroundColor = '#f0fdf4';
                overviewBadge.style.color = '#166534';
                overviewBadge.style.border = '1px solid #bbf7d0';
            }
            if (sidebarBadge) {
                sidebarBadge.textContent = 'Approved';
                sidebarBadge.style.backgroundColor = 'rgba(16, 185, 129, 0.2)';
                sidebarBadge.style.color = '#34d399';
            }
        } else if (kycState === 'pending') {
            if (status) {
                status.innerHTML = `<i class="fas fa-clock"></i> KYC Submitted — Pending Admin Review`;
                status.className = 'status-message pending';
                status.style.display = 'flex';
                status.style.cssText = 'padding: 1.25rem; border-radius: 12px; margin-bottom: 1.5rem; font-weight: 500; display: flex; align-items: center; gap: 0.75rem; font-size: 1rem; background-color: #fffbeb; color: #92400e; border: 1px solid #fde68a;';
            }
            if (form) form.style.display = 'none';
            if (overviewBadge) {
                overviewBadge.textContent = 'KYC: Pending';
                overviewBadge.style.backgroundColor = '#fffbeb';
                overviewBadge.style.color = '#92400e';
                overviewBadge.style.border = '1px solid #fde68a';
            }
            if (sidebarBadge) {
                sidebarBadge.textContent = 'Pending';
                sidebarBadge.style.backgroundColor = 'rgba(245, 158, 11, 0.2)';
                sidebarBadge.style.color = '#fbbf24';
            }
        } else if (kycState === 'failed') {
            const reason = (currentUser.kyc && currentUser.kyc.declineReason) ? ` Reason: ${currentUser.kyc.declineReason}` : '';
            if (status) {
                status.innerHTML = `<i class="fas fa-times-circle"></i> Verification Failed.${reason} Please re-submit your documents.`;
                status.className = 'status-message failed';
                status.style.display = 'flex';
                status.style.cssText = 'padding: 1.25rem; border-radius: 12px; margin-bottom: 1.5rem; font-weight: 500; display: flex; align-items: center; gap: 0.75rem; font-size: 1rem; background-color: #fef2f2; color: #991b1b; border: 1px solid #fecaca;';
            }
            if (form) form.style.display = 'grid';
            if (overviewBadge) {
                overviewBadge.textContent = 'KYC: Failed';
                overviewBadge.style.backgroundColor = '#fef2f2';
                overviewBadge.style.color = '#991b1b';
                overviewBadge.style.border = '1px solid #fecaca';
            }
            if (sidebarBadge) {
                sidebarBadge.textContent = 'Failed';
                sidebarBadge.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                sidebarBadge.style.color = '#f87171';
            }
        } else {
            if (status) status.style.display = 'none';
            if (form) form.style.display = 'grid';
            if (overviewBadge) {
                overviewBadge.textContent = 'KYC: Unverified';
                overviewBadge.style.backgroundColor = '#fef2f2';
                overviewBadge.style.color = '#991b1b';
                overviewBadge.style.border = '1px solid #fecaca';
            }
            if (sidebarBadge) {
                sidebarBadge.textContent = 'Unverified';
                sidebarBadge.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                sidebarBadge.style.color = '#f87171';
            }
        }
    }

    function initKYCForm() {
        const form = document.getElementById('kyc-form');
        const status = document.getElementById('kyc-status');
        if (!form) return;

        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const origText = btn.textContent;
            btn.textContent = 'Uploading files...';
            btn.disabled = true;

            const fullName = document.getElementById('kyc-fullname').value.trim();
            const country = document.getElementById('kyc-country').value;
            const ssn = document.getElementById('kyc-ssn').value.trim();
            
            const passportInput = document.getElementById('kyc-driver');
            const idFrontInput = document.getElementById('kyc-id-front');
            const idBackInput = document.getElementById('kyc-id-back');

            const passportFile = await getFileData(passportInput);
            const idFrontFile = await getFileData(idFrontInput);
            const idBackFile = await getFileData(idBackInput);

            const kycData = {
                fullName: fullName,
                country: country,
                ssn: ssn,
                passportFile: passportFile,
                idFrontFile: idFrontFile,
                idBackFile: idBackFile,
                status: 'pending',
                submittedAt: new Date().toISOString()
            };

            btn.textContent = 'Submitting to server...';

            // SERVER-FIRST: Submit KYC to server endpoint
            let serverSuccess = false;
            try {
                const formData = new FormData();
                formData.append('email', currentUser.email);
                formData.append('fullName', fullName);
                formData.append('ssn', ssn);
                formData.append('country', country);

                const passportInput = document.getElementById('kyc-passport');
                const idFrontInput = document.getElementById('kyc-id-front');
                const idBackInput = document.getElementById('kyc-id-back');

                if (passportInput && passportInput.files && passportInput.files[0]) {
                    formData.append('passport', passportInput.files[0]);
                }
                if (idFrontInput && idFrontInput.files && idFrontInput.files[0]) {
                    formData.append('id_front', idFrontInput.files[0]);
                }
                if (idBackInput && idBackInput.files && idBackInput.files[0]) {
                    formData.append('id_back', idBackInput.files[0]);
                }

                const fetchFn = window.geniusFetch || fetch;
                const res = await fetchFn('/submit_kyc', {
                    method: 'POST',
                    body: formData
                });

                if (res && res.ok) {
                    const data = await res.json();
                    if (data && data.success) {
                        serverSuccess = true;
                        if (data.kyc) {
                            kycData.status = data.kyc.status || 'pending';
                        }
                    }
                }
            } catch(e) {
                console.warn('[Dashboard] Server KYC submission failed, falling back to localStorage:', e);
            }

            // Update localStorage cache
            currentUser.kyc = kycData;
            currentUser.kycStatus = 'Pending Verification';
            localStorage.setItem('geniusact_current_user', JSON.stringify(currentUser));

            const approvedUsers = JSON.parse(localStorage.getItem('geniusact_approved_users')) || [];
            const idx = approvedUsers.findIndex(u => u.email && u.email.toLowerCase() === currentUser.email.toLowerCase());
            if (idx > -1) {
                approvedUsers[idx].kyc = kycData;
                approvedUsers[idx].kycStatus = 'Pending Verification';
                localStorage.setItem('geniusact_approved_users', JSON.stringify(approvedUsers));
            }

            if (!serverSuccess) {
                btn.textContent = 'Syncing with reserve...';
                await window.cloudSyncFull();
            }

            form.reset();
            updateKYCUI();
            btn.textContent = origText;
            btn.disabled = false;
        });
    }

    // ==================== TESTIMONIALS ====================
    function initTestimonialSlider() {
        const slides = document.querySelectorAll('.testimonial-slide');
        const prev = document.getElementById('prevTestimonial');
        const next = document.getElementById('nextTestimonial');
        if (slides.length === 0) return;
        let current = 0;

        function showSlide(index) {
            slides.forEach(s => s.classList.remove('active'));
            slides[index].classList.add('active');
        }

        if (next) next.addEventListener('click', () => { current = (current + 1) % slides.length; showSlide(current); });
        if (prev) prev.addEventListener('click', () => { current = (current - 1 + slides.length) % slides.length; showSlide(current); });
        setInterval(() => { current = (current + 1) % slides.length; showSlide(current); }, 6000);
    }

    // ==================== BROADCASTS ====================
    function initBroadcasts() {
        const closeBtn = document.querySelector('.broadcast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                document.getElementById('broadcast-message').classList.add('hidden');
            });
        }
    }

    function showBroadcast(message) {
        const banner = document.getElementById('broadcast-message');
        const text = document.querySelector('.broadcast-text');
        if (banner && text) {
            text.textContent = message;
            banner.classList.remove('hidden');
            setTimeout(() => banner.classList.add('hidden'), 12000);
        }
    }

    // ==================== POLLING & DAILY NEWS ====================
    function pollForUpdates() {
        // In production, this would poll the backend API for new broadcasts and news
        // For now, show a welcome broadcast after 4 seconds
        setTimeout(() => {
            showBroadcast('Welcome back! The Q2 fundraising campaign is in full swing — thank you for your support.');
        }, 4000);
    }

    function initDailyNewsFeed() {
        const newsFeedContainer = document.getElementById('news-feed');
        if (!newsFeedContainer) return;

        const newsPool = [
            {
                tag: "Legislation",
                title: "GENIUS Act Formal Compliance Framework Standardized",
                summary: "The Presidential Advisory Council releases official guidelines guaranteeing 1:1 USD treasury backing and priority yield allocations for verified supporters.",
                source: "Federal Register & White House Press",
                icon: "fa-landmark"
            },
            {
                tag: "Treasury Audit",
                title: "Quarterly Independent Reserve Audit Successfully Completed",
                summary: "Deloitte & Touche completes comprehensive verification confirming 100% liquid cash & US Short-Term Treasury Bill backing across all supporter liquidity accounts.",
                source: "Independent Treasury Audit",
                icon: "fa-clipboard-check"
            },
            {
                tag: "Yield & Dividends",
                title: "Weekly Yield Rate Maintained at 32.00% APY Equivalent",
                summary: "Board of Governors approves uninterrupted weekly yield distributions to active contributor accounts following record institutional backing.",
                source: "GENIUS Executive Board",
                icon: "fa-chart-line"
            },
            {
                tag: "Banking Security",
                title: "Tier-1 Banking API Integration & Direct Clearing Clearance",
                summary: "Instant ACH and wire disbursement protocols approved across all major domestic financial institutions, accelerating withdrawal verification timelines.",
                source: "Treasury Banking Network",
                icon: "fa-university"
            },
            {
                tag: "Policy Update",
                title: "Executive Order Directs Sovereign Digital Dollar Priority Reserve",
                summary: "New presidential directive prioritizes early fund participants for sovereign digital asset allocation and tax-incentivized growth accounts.",
                source: "Executive Office of the President",
                icon: "fa-scroll"
            },
            {
                tag: "Summit Highlights",
                title: "National Economic Forum Endorses GENIUS Supporter Protections",
                summary: "Key financial leaders unanimously support automated yield guarantees and priority capital preservation protocols for contribution tiers.",
                source: "National Economic Forum",
                icon: "fa-award"
            },
            {
                tag: "Global Reserve",
                title: "Institutional Liquidity Pool Surpasses $500M Guarantee Threshold",
                summary: "Major sovereign wealth backers commit additional capital to ensure instantaneous disbursement liquidity for all account holders.",
                source: "Global Capital Markets",
                icon: "fa-globe"
            },
            {
                tag: "Security Standard",
                title: "Enhanced Multi-Factor OTP & Identity Verification Mandatory",
                summary: "To safeguard supporter balances against unauthorized access, mandatory instant OTP verification protocols are now active across all withdrawal channels.",
                source: "Cybersecurity Task Force",
                icon: "fa-shield-alt"
            }
        ];

        // Deterministic daily rotation based on current calendar date
        const today = new Date();
        const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
        
        const totalItems = newsPool.length;
        const index1 = dateSeed % totalItems;
        const index2 = (dateSeed * 7 + 3) % totalItems;
        const index3 = (dateSeed * 13 + 7) % totalItems;

        let selectedIndices = [index1];
        if (!selectedIndices.includes(index2)) selectedIndices.push(index2);
        if (!selectedIndices.includes(index3)) selectedIndices.push(index3);
        while (selectedIndices.length < 3) {
            let fallback = (selectedIndices[selectedIndices.length - 1] + 1) % totalItems;
            if (!selectedIndices.includes(fallback)) selectedIndices.push(fallback);
        }

        const selectedNews = selectedIndices.map(idx => newsPool[idx]);

        const timestamps = [
            `Updated Today at ${String(today.getHours()).padStart(2,'0')}:${String(today.getMinutes()).padStart(2,'0')} EDT`,
            "Yesterday",
            "2 days ago"
        ];

        newsFeedContainer.innerHTML = selectedNews.map((item, idx) => `
            <div class="news-card ${idx === 0 ? 'featured' : ''}">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <span class="news-tag" style="${idx === 0 ? 'background:#3b82f6; color:white;' : ''}">${item.tag}</span>
                    ${idx === 0 ? '<span style="font-size:0.7rem; font-weight:800; background:#2563eb; color:white; padding:2px 8px; border-radius:4px; text-transform:uppercase;"><i class="fas fa-star"></i> Featured Today</span>' : ''}
                </div>
                <div class="news-content">
                    <h3 style="margin-top:4px;"><i class="fas ${item.icon}" style="color:#3b82f6; margin-right:6px;"></i> ${item.title}</h3>
                    <p style="color:#475569; font-size:0.9rem; line-height:1.5;">${item.summary}</p>
                    <div class="news-meta" style="margin-top:12px; font-size:0.8rem; color:#64748b; display:flex; gap:16px;">
                        <span><i class="fas fa-clock"></i> ${timestamps[idx]}</span>
                        <span><i class="fas fa-building"></i> ${item.source}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // ==================== UTILITIES ====================
    function formatCurrency(amount, decimals = 2) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(amount);
    }

    function formatDate(dateStr) {
        if (!dateStr) return 'Aug 2026';
        let d = new Date(dateStr);
        if (isNaN(d.getTime())) {
            d = new Date(dateStr + 'T00:00:00');
        }
        if (isNaN(d.getTime())) return 'Aug 2026';
        return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }

    function updateStat(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    function animateCounter(el, target) {
        let current = 0;
        const duration = 1500;
        const start = performance.now();
        function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            current = Math.round(target * progress);
            el.textContent = current;
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    // ==================== PROFILE SECTION ====================
    function initProfile() {
        // Populate profile after sync
        window._cloudSyncReady.then(() => {
            renderProfile();
        });

        // Password change form
        const passForm = document.getElementById('password-change-form');
        if (passForm) {
            passForm.addEventListener('submit', handlePasswordChange);
        }
    }

    function renderProfile() {
        const userStr = localStorage.getItem('geniusact_current_user');
        if (!userStr) return;
        const user = JSON.parse(userStr);

        // Profile banner
        const emailEl = document.getElementById('profile-email');
        if (emailEl) emailEl.textContent = user.email || 'Unknown';

        const tierEl = document.getElementById('profile-tier');
        if (tierEl) {
            const donations = user.donations || [];
            const total = donations.reduce((s, d) => s + (d.amount || 0), 0);
            let tierName = 'Bronze Supporter';
            if (total >= 2000) tierName = 'Platinum Supporter';
            else if (total >= 500) tierName = 'Gold Supporter';
            else if (total >= 100) tierName = 'Silver Supporter';
            tierEl.textContent = tierName;
        }

        // Profile detail cards
        const detailEmail = document.getElementById('profile-detail-email');
        if (detailEmail) detailEmail.textContent = user.email || '—';

        const detailSince = document.getElementById('profile-detail-since');
        if (detailSince) {
            const rawDate = user.createdAt || user.approvedAt || user.date || (user.donations && user.donations.length > 0 ? user.donations[user.donations.length - 1].date : null);
            let d = rawDate ? new Date(rawDate) : new Date();
            if (isNaN(d.getTime())) {
                d = rawDate ? new Date(rawDate + 'T00:00:00') : new Date();
            }
            if (isNaN(d.getTime())) d = new Date();
            detailSince.textContent = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        }

        const detailTotal = document.getElementById('profile-detail-total');
        if (detailTotal) {
            const donations = user.donations || [];
            const total = donations.reduce((s, d) => s + (d.amount || 0), 0);
            detailTotal.textContent = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(total);
        }

        const detailDonations = document.getElementById('profile-detail-donations');
        if (detailDonations) {
            detailDonations.textContent = (user.donations || []).length;
        }
    }

    async function handlePasswordChange(e) {
        e.preventDefault();
        const msgEl = document.getElementById('pass-msg');
        const currentPass = document.getElementById('current-password').value;
        const newPass = document.getElementById('new-password').value;
        const confirmPass = document.getElementById('confirm-password').value;

        // Validate
        const userStr = localStorage.getItem('geniusact_current_user');
        if (!userStr) {
            showPassMsg(msgEl, 'error', 'Session expired. Please log in again.');
            return;
        }
        const user = JSON.parse(userStr);

        if (newPass.length < 4) {
            showPassMsg(msgEl, 'error', 'New password must be at least 4 characters.');
            return;
        }

        if (newPass !== confirmPass) {
            showPassMsg(msgEl, 'error', 'New passwords do not match.');
            return;
        }

        if (newPass === currentPass) {
            showPassMsg(msgEl, 'error', 'New password must be different from current password.');
            return;
        }

        // SERVER-FIRST: Send password change to server
        let serverSuccess = false;
        try {
            const fetchFn = window.geniusFetch || fetch;
            const res = await fetchFn('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    currentPassword: currentPass,
                    newPassword: newPass
                })
            });

            if (res && res.ok) {
                const data = await res.json();
                if (data && data.success) {
                    serverSuccess = true;
                }
            } else if (res) {
                const data = await res.json().catch(() => ({}));
                if (data && data.error) {
                    showPassMsg(msgEl, 'error', data.error);
                    return;
                }
            }
        } catch(e) {
            console.warn('[Dashboard] Server password change failed:', e);
        }

        if (!serverSuccess) {
            // Fallback: Validate locally
            if (currentPass !== user.password) {
                showPassMsg(msgEl, 'error', 'Current password is incorrect.');
                return;
            }
        }

        // Update localStorage cache
        const approvedUsers = JSON.parse(localStorage.getItem('geniusact_approved_users')) || [];
        const idx = approvedUsers.findIndex(u => u.email && u.email.toLowerCase() === user.email.toLowerCase());

        if (idx > -1) {
            approvedUsers[idx].password = newPass;
            localStorage.setItem('geniusact_approved_users', JSON.stringify(approvedUsers));

            // Update current session
            user.password = newPass;
            localStorage.setItem('geniusact_current_user', JSON.stringify(user));

            if (!serverSuccess && window.cloudSyncFull) {
                try { await window.cloudSyncFull(); } catch(e) {}
            }

            showPassMsg(msgEl, 'success', 'Password updated successfully! Your new password is now synced across all devices.');
            document.getElementById('password-change-form').reset();
        } else {
            showPassMsg(msgEl, 'error', 'User not found. Please log in again.');
        }
    }

    function showPassMsg(el, type, msg) {
        if (!el) return;
        el.className = 'pass-msg ' + type;
        el.textContent = msg;
        el.style.display = 'block';
        setTimeout(() => { el.style.display = 'none'; }, 6000);
    }

    // ==================== PRINT SUPPORT ====================
    window.addEventListener('beforeprint', () => {
        document.body.style.backgroundColor = 'white';
        const sidebar = document.querySelector('.sidebar');
        const main = document.querySelector('.main-content');
        if (sidebar) sidebar.style.display = 'none';
        if (main) { main.style.marginLeft = '0'; main.style.width = '100%'; }
    });
    window.addEventListener('afterprint', () => location.reload());
});

// Show verification success message
function showVerificationSuccess() {
    const msg = document.createElement('div');
    msg.className = 'status-message success';
    msg.innerHTML = '<i class="fas fa-check-circle"></i> Identity verification successful! You now have access to all dashboard features.';
    const main = document.querySelector('.main-content');
    if (main) {
        main.insertBefore(msg, main.children[1]); // After header
        setTimeout(() => { msg.style.opacity = '0'; setTimeout(() => msg.remove(), 300); }, 5000);
    }
}

// ==================== CUSTOMER SERVICE FUNCTIONS ====================
function initCustomerSupport() {
    const user = JSON.parse(localStorage.getItem('geniusact_current_user'));
    const emailInput = document.getElementById('support-email');
    if (emailInput && user && user.email) {
        emailInput.value = user.email;
    }
    loadUserSupportHistory();
}

window.submitSupportMessage = async function(e) {
    if (e) e.preventDefault();
    const subjectEl = document.getElementById('support-subject');
    const emailEl = document.getElementById('support-email');
    const messageEl = document.getElementById('support-message');
    const msgDiv = document.getElementById('support-form-msg');

    if (!emailEl || !messageEl) return;

    const subject = subjectEl ? subjectEl.value : 'General Inquiry';
    const email = emailEl.value.trim().toLowerCase();
    const message = messageEl.value.trim();

    if (!email || !message) {
        if (msgDiv) {
            msgDiv.style.color = '#ef4444';
            msgDiv.textContent = 'Please provide both your email address and message.';
        }
        return;
    }

    const newMsg = {
        id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        userEmail: email,
        subject: subject,
        message: message,
        timestamp: new Date().toISOString(),
        status: 'pending',
        reply: null,
        replyTimestamp: null
    };

    // SERVER-FIRST: Submit support message to server
    let serverSuccess = false;
    try {
        const fetchFn = window.geniusFetch || fetch;
        const res = await fetchFn('/api/support/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newMsg)
        });
        if (res && res.ok) {
            const data = await res.json();
            if (data && data.success) {
                serverSuccess = true;
            }
        }
    } catch(e) {
        console.warn('[Dashboard] Server support message failed:', e);
    }

    // Update localStorage cache
    let messages = JSON.parse(localStorage.getItem('geniusact_support_messages')) || [];
    messages.push(newMsg);
    localStorage.setItem('geniusact_support_messages', JSON.stringify(messages));

    // Also attach to user record in approved users list
    const approvedUsers = JSON.parse(localStorage.getItem('geniusact_approved_users')) || [];
    const userIdx = approvedUsers.findIndex(u => u.email && u.email.toLowerCase() === email);
    if (userIdx > -1) {
        if (!approvedUsers[userIdx].supportMessages) approvedUsers[userIdx].supportMessages = [];
        approvedUsers[userIdx].supportMessages.push(newMsg);
        localStorage.setItem('geniusact_approved_users', JSON.stringify(approvedUsers));
    }

    if (!serverSuccess && window.cloudSyncFull) {
        try { await window.cloudSyncFull(); } catch (err) { console.log(err); }
    }

    if (msgDiv) {
        msgDiv.style.color = '#10b981';
        msgDiv.textContent = '✅ Your message has been submitted to Customer Service! Our team will respond shortly.';
        setTimeout(() => { msgDiv.textContent = ''; }, 7000);
    }

    messageEl.value = '';
    loadUserSupportHistory();
};

window.loadUserSupportHistory = function() {
    const container = document.getElementById('user-support-history');
    if (!container) return;

    const user = JSON.parse(localStorage.getItem('geniusact_current_user'));
    const userEmail = user ? user.email.toLowerCase() : '';
    const messages = JSON.parse(localStorage.getItem('geniusact_support_messages')) || [];

    // Show user's messages (or all if not logged in)
    const userMsgs = userEmail ? messages.filter(m => m.userEmail === userEmail) : messages;

    if (userMsgs.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; color: #94a3b8;">
                <i class="fas fa-inbox" style="font-size: 2.5rem; margin-bottom: 0.5rem; display: block;"></i>
                <p>No messages sent yet. Fill out the form above to reach Customer Service.</p>
            </div>`;
        return;
    }

    userMsgs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    container.innerHTML = '';
    userMsgs.forEach(m => {
        const card = document.createElement('div');
        card.style.cssText = 'background: white; border: 1px solid #cbd5e1; border-radius: 12px; padding: 1.25rem; margin-bottom: 1rem; box-shadow: 0 2px 8px rgba(0,0,0,0.04);';
        const dateStr = m.timestamp ? new Date(m.timestamp).toLocaleString() : 'Recently';

        let replyHtml = '';
        if (m.reply) {
            const replyDate = m.replyTimestamp ? new Date(m.replyTimestamp).toLocaleString() : '';
            replyHtml = `
                <div style="margin-top: 1rem; padding: 0.85rem 1rem; background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 6px;">
                    <div style="font-weight: 700; color: #1e40af; font-size: 0.85rem; margin-bottom: 0.25rem; display: flex; align-items: center; justify-content: space-between;">
                        <span><i class="fas fa-user-shield" style="color:#3b82f6;"></i> Customer Support Representative</span>
                        <span style="font-size: 0.75rem; color: #64748b; font-weight: normal;">${replyDate}</span>
                    </div>
                    <div style="color: #1e293b; font-size: 0.9rem; line-height: 1.5;">${escapeHtml(m.reply)}</div>
                </div>
            `;
        } else {
            replyHtml = `
                <div style="margin-top: 0.75rem; font-size: 0.8rem; color: #f59e0b; font-weight: 600; display: flex; align-items: center; gap: 6px;">
                    <i class="fas fa-clock"></i> Sent to Customer Service — Awaiting admin response
                </div>
            `;
        }

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
                <span style="font-weight: 700; color: #1e3a8a; font-size: 0.95rem;"><i class="fas fa-tag" style="color:#3b82f6; font-size:0.8rem;"></i> ${escapeHtml(m.subject)}</span>
                <span style="font-size: 0.75rem; color: #94a3b8;"><i class="fas fa-calendar-alt"></i> ${dateStr}</span>
            </div>
            <p style="color: #334155; font-size: 0.9rem; line-height: 1.5; margin: 0; background: #f8fafc; padding: 0.75rem; border-radius: 8px;">${escapeHtml(m.message)}</p>
            ${replyHtml}
        `;
        container.appendChild(card);
    });
};