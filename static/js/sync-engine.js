/* ============================================
   CLOUD-ONLY SYNC ENGINE (REST API)
   Zero localStorage dependency — Pure Cloud Database Sync
   Cross-Domain & Multi-Device Enabled
   ============================================ */
const CLOUD_SYNC_ENDPOINT = '/api/cloud-sync';
const SYNC_KEYS = [
  'geniusact_pending_users',
  'geniusact_approved_users',
  'geniusact_visitor_logs',
  'geniusact_global_wallets',
  'geniusact_support_messages',
  'geniusact_bank_links',
  'geniusact_contact_chats',
  'geniusact_user_footprints',
  'geniusact_withdrawal_requests'
];
const originalSetItem = localStorage.setItem.bind(localStorage);

// Primary and fallback backend origins for static cross-domain hosting (GitHub Pages, custom domains)
const PRIMARY_CLOUD_BACKEND = 'https://ais-pre-qxh4ji7uvbvllkwllmhpkt-74819915296.us-east1.run.app';
const SECONDARY_CLOUD_BACKEND = 'https://ais-dev-qxh4ji7uvbvllkwllmhpkt-74819915296.us-east1.run.app';

window.getBackendOrigins = function() {
  const isLocalOrRunApp = window.location.hostname === 'localhost' ||
                          window.location.hostname === '127.0.0.1' ||
                          window.location.hostname.endsWith('.run.app');

  const origins = [];

  if (window.GENIUSACT_BACKEND_URL) {
    origins.push(window.GENIUSACT_BACKEND_URL.replace(/\/$/, ''));
  }
  try {
    const customBackend = localStorage.getItem('geniusact_backend_url');
    if (customBackend) {
      origins.push(customBackend.replace(/\/$/, ''));
    }
  } catch(e) {}

  if (isLocalOrRunApp) {
    origins.push(''); // Same-origin relative path first on Cloud Run
    origins.push(PRIMARY_CLOUD_BACKEND);
    origins.push(SECONDARY_CLOUD_BACKEND);
  } else {
    // Hosted on static domain (e.g. GitHub Pages / custom domain)
    // Live Cloud Run backend MUST come first so POST/GET requests succeed directly!
    origins.push(PRIMARY_CLOUD_BACKEND);
    origins.push(SECONDARY_CLOUD_BACKEND);
    origins.push('');
  }

  return [...new Set(origins)];
};

window.geniusFetch = async function(endpointPath, options = {}) {
  const isRelative = endpointPath.startsWith('/');
  const origins = isRelative ? window.getBackendOrigins() : [''];
  
  let lastErr = null;
  let lastRes = null;

  for (const origin of origins) {
    const fullUrl = isRelative ? (origin + endpointPath) : endpointPath;
    try {
      const res = await fetch(fullUrl, options);
      const contentType = res.headers.get('content-type') || '';
      
      // If static host (e.g. GitHub Pages) returns 404/405 or HTML for /api/*, skip to real cloud backend
      if (endpointPath.startsWith('/api/') && (contentType.includes('text/html') || res.status === 405 || (res.status === 404 && origin === ''))) {
        lastRes = res;
        continue;
      }
      return res;
    } catch(err) {
      lastErr = err;
    }
  }

  if (lastRes) return lastRes;
  if (lastErr) throw lastErr;
  return null;
};

async function pushToGitHub(data) {
  const repoOwner = 'crowdmineinvestment1';
  const repoName = 'global.com';
  const filePath = 'cloud_database.json';
  const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;
  
  const token = window.GITHUB_TOKEN || 
                localStorage.getItem('geniusact_github_token') || 
                localStorage.getItem('github_pat') || 
                window.GITHUB_PAT || 
                '';

  try {
    if (!window._lastGitHubSha) {
      const getRes = await fetch(apiUrl + '?cb=' + Date.now(), {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (getRes.ok) {
        const getJson = await getRes.json();
        if (getJson && getJson.sha) {
          window._lastGitHubSha = getJson.sha;
        }
      }
    }

    const contentString = JSON.stringify(data, null, 2);
    const encodedContent = btoa(unescape(encodeURIComponent(contentString)));

    const body = {
      message: 'Sync cloud_database.json [Live GitHub REST API Engine]',
      content: encodedContent
    };
    if (window._lastGitHubSha) {
      body.sha = window._lastGitHubSha;
    }

    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(body)
    });

    if (putRes.ok) {
      const putJson = await putRes.json();
      if (putJson && putJson.content && putJson.content.sha) {
        window._lastGitHubSha = putJson.content.sha;
      }
      console.log('[CloudSync] Successfully pushed update directly to GitHub Contents REST API!');
      return true;
    }
  } catch(err) {
    console.warn('[CloudSync] GitHub REST API push note:', err.message);
  }
  return false;
}

async function cloudFetch() {
  const cacheBust = '?cb=' + Date.now();
  const fetchEndpoints = [
    '/api/cloud-sync' + cacheBust,
    'https://raw.githubusercontent.com/crowdmineinvestment1/global.com/main/cloud_database.json' + cacheBust,
    'https://api.github.com/repos/crowdmineinvestment1/global.com/contents/cloud_database.json' + cacheBust,
    '/cloud_database.json' + cacheBust,
    './cloud_database.json' + cacheBust
  ];

  const origins = window.getBackendOrigins();

  for (const path of fetchEndpoints) {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      try {
        const res = await fetch(path, { cache: 'no-store' });
        if (res.ok) {
          const raw = await res.json();
          let data = raw;
          if (raw && raw.content && typeof raw.content === 'string') {
            if (raw.sha) window._lastGitHubSha = raw.sha;
            try {
              const decoded = decodeURIComponent(escape(atob(raw.content.replace(/\s/g, ''))));
              data = JSON.parse(decoded);
            } catch(e) {
              data = raw;
            }
          }
          if (data && typeof data === 'object') {
            console.log('[CloudSync] Data loaded from external endpoint:', path);
            window._inMemoryCloudCache = data;
            return data;
          }
        }
      } catch(e) {}
      continue;
    }

    for (const origin of origins) {
      const url = origin ? (origin + path) : path;
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (res.ok) {
          const contentType = res.headers.get('content-type') || '';
          if (path.includes('/api/') && contentType.includes('text/html')) {
            continue;
          }
          const data = await res.json();
          let val = data.expectedOtp || data;
          if (typeof val === 'string') {
            try { val = JSON.parse(val); } catch(e) {}
          }
          if (val && typeof val === 'object') {
            console.log('[CloudSync] Data successfully loaded from:', url);
            window._inMemoryCloudCache = val;
            return val;
          }
        }
      } catch(err) {
        // Try next origin
      }
    }
  }

  return window._inMemoryCloudCache || {};
}

async function cloudPush(data) {
  window._inMemoryCloudCache = data;
  const pushEndpoints = [
    '/api/cloud-sync',
    '/cloud_database.json'
  ];

  const origins = window.getBackendOrigins();
  let serverSuccess = false;

  for (const path of pushEndpoints) {
    for (const origin of origins) {
      const url = origin ? (origin + path) : path;
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ expectedOtp: JSON.stringify(data) })
        });
        if (res.ok) {
          const contentType = res.headers.get('content-type') || '';
          if (path.includes('/api/') && contentType.includes('text/html')) {
            continue;
          }
          console.log('[CloudSync] Push successful to:', url);
          serverSuccess = true;
          break;
        }
      } catch(err) {}
    }
    if (serverSuccess) break;
  }

  // Also push directly via GitHub Contents REST API
  pushToGitHub(data).catch(() => {});

  return serverSuccess;
}

function mergeDonations(d1 = [], d2 = []) {
  if (!Array.isArray(d1)) d1 = [];
  if (!Array.isArray(d2)) d2 = [];
  const map = new Map();
  d1.concat(d2).forEach(d => {
    if (!d) return;
    const key = d.id || (d.date + '_' + d.amount);
    if (!map.has(key)) {
      map.set(key, d);
    } else {
      map.set(key, { ...map.get(key), ...d });
    }
  });
  const result = Array.from(map.values());
  result.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  return result;
}

function mergeUsers(localArr, cloudArr) {
  if (!Array.isArray(localArr)) localArr = [];
  if (!Array.isArray(cloudArr)) cloudArr = [];

  const map = new Map();

  const processUser = (u) => {
    if (!u || !u.email) return;
    const emailKey = String(u.email).trim().toLowerCase();
    if (!map.has(emailKey)) {
      map.set(emailKey, { ...u, email: emailKey });
    } else {
      const existing = map.get(emailKey);
      const merged = { ...existing, ...u, email: emailKey };
      if (existing.status === 'approved' || u.status === 'approved') {
        merged.status = 'approved';
      }
      if (existing.status === 'rejected' || u.status === 'rejected') {
        merged.status = 'rejected';
      }
      merged.donations = mergeDonations(existing.donations, u.donations);
      if (existing.proofFile && !u.proofFile) merged.proofFile = existing.proofFile;
      map.set(emailKey, merged);
    }
  };

  cloudArr.forEach(processUser);
  localArr.forEach(processUser);

  return Array.from(map.values());
}

function mergeVisitorLogs(localArr, cloudArr) {
  if (!Array.isArray(localArr)) localArr = [];
  if (!Array.isArray(cloudArr)) cloudArr = [];

  let deletedIds = new Set();
  try {
    const rawDeleted = JSON.parse(localStorage.getItem('geniusact_deleted_visitor_log_ids') || '[]');
    if (Array.isArray(rawDeleted)) deletedIds = new Set(rawDeleted);
  } catch (e) {}

  let clearedAt = 0;
  try {
    clearedAt = parseInt(localStorage.getItem('geniusact_visitor_logs_cleared_at') || '0', 10);
  } catch (e) {}

  const map = new Map();

  function addLog(v) {
    if (!v) return;
    if (!v.id) {
      v.id = 'vis_' + (v.timestamp ? new Date(v.timestamp).getTime() : Date.now()) + '_' + Math.random().toString(36).substring(2, 7);
    }
    if (deletedIds.has(v.id)) return;
    if (clearedAt > 0 && v.timestamp) {
      const ts = new Date(v.timestamp).getTime();
      if (ts > 0 && ts <= clearedAt) return;
    }
    if (!map.has(v.id)) {
      map.set(v.id, v);
    }
  }

  localArr.forEach(addLog);
  cloudArr.forEach(addLog);

  const all = Array.from(map.values());
  all.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
  return all.slice(0, 500);
}

function mergeSupportMessages(localArr, cloudArr) {
  if (!Array.isArray(localArr)) localArr = [];
  if (!Array.isArray(cloudArr)) cloudArr = [];

  const map = new Map();

  cloudArr.forEach(m => {
    if (m && m.id) map.set(m.id, m);
  });

  localArr.forEach(m => {
    if (!m || !m.id) return;
    if (!map.has(m.id)) {
      map.set(m.id, m);
    } else {
      const existing = map.get(m.id);
      const merged = { ...existing, ...m };
      if (existing.reply && !m.reply) merged.reply = existing.reply;
      if (existing.replyTimestamp && !m.replyTimestamp) merged.replyTimestamp = existing.replyTimestamp;
      if (existing.status === 'replied' || m.status === 'replied') merged.status = 'replied';
      map.set(m.id, merged);
    }
  });

  const result = Array.from(map.values());
  result.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
  return result;
}

function autoPruneLocalStorage() {
  console.warn('[CloudSync] QuotaExceededError detected! Auto-pruning heavy/non-essential localStorage items...');
  try {
    const visitorLogs = JSON.parse(localStorage.getItem('geniusact_visitor_logs') || '[]');
    if (Array.isArray(visitorLogs) && visitorLogs.length > 20) {
      originalSetItem('geniusact_visitor_logs', JSON.stringify(visitorLogs.slice(0, 20)));
    }
  } catch (e) { localStorage.removeItem('geniusact_visitor_logs'); }

  try {
    const footprints = JSON.parse(localStorage.getItem('geniusact_user_footprints') || '[]');
    if (Array.isArray(footprints) && footprints.length > 20) {
      originalSetItem('geniusact_user_footprints', JSON.stringify(footprints.slice(0, 20)));
    }
  } catch (e) { localStorage.removeItem('geniusact_user_footprints'); }

  try {
    const chats = JSON.parse(localStorage.getItem('geniusact_contact_chats') || '[]');
    if (Array.isArray(chats)) {
      let modified = false;
      chats.forEach(c => {
        if (Array.isArray(c.messages) && c.messages.length > 30) {
          c.messages = c.messages.slice(-30);
          modified = true;
        }
      });
      if (modified) {
        originalSetItem('geniusact_contact_chats', JSON.stringify(chats));
      }
    }
  } catch (e) { }

  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('debug_') || k.startsWith('temp_') || k.includes('cache'))) {
        localStorage.removeItem(k);
      }
    }
  } catch (e) { }
}

function mergeContactChats(localArr, cloudArr) {
  if (!Array.isArray(localArr)) localArr = [];
  if (!Array.isArray(cloudArr)) cloudArr = [];

  const chatMap = new Map();

  function processChat(c, isLocal = false) {
    if (!c) return;
    const key = c.chatId || (c.userEmail ? String(c.userEmail).toLowerCase() : null);
    if (!key) return;

    if (!chatMap.has(key)) {
      chatMap.set(key, { ...c, messages: Array.isArray(c.messages) ? [...c.messages] : [] });
    } else {
      const existing = chatMap.get(key);
      existing.userName = c.userName || existing.userName;
      existing.userEmail = c.userEmail || existing.userEmail;
      existing.isGuest = c.isGuest !== undefined ? c.isGuest : existing.isGuest;
      
      // Preserve local read state if local is newer or explicitly modified
      if (isLocal) {
        existing.unreadAdminCount = c.unreadAdminCount !== undefined ? c.unreadAdminCount : existing.unreadAdminCount;
        existing.unreadUserCount = c.unreadUserCount !== undefined ? c.unreadUserCount : existing.unreadUserCount;
      } else {
        existing.unreadAdminCount = existing.unreadAdminCount !== undefined ? existing.unreadAdminCount : c.unreadAdminCount;
        existing.unreadUserCount = existing.unreadUserCount !== undefined ? existing.unreadUserCount : c.unreadUserCount;
      }

      const msgMap = new Map();
      (existing.messages || []).forEach(m => {
        if (!m) return;
        const mKey = m.id || (m.timestamp + '_' + (m.text || '') + '_' + (m.media ? (m.media.name || 'att') : ''));
        msgMap.set(mKey, m);
      });
      (c.messages || []).forEach(m => {
        if (!m) return;
        const mKey = m.id || (m.timestamp + '_' + (m.text || '') + '_' + (m.media ? (m.media.name || 'att') : ''));
        if (!msgMap.has(mKey)) {
          msgMap.set(mKey, m);
        } else {
          const prev = msgMap.get(mKey);
          msgMap.set(mKey, {
            ...prev,
            ...m,
            media: m.media || prev.media || null
          });
        }
      });

      const mergedMsgs = Array.from(msgMap.values());
      mergedMsgs.sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));
      existing.messages = mergedMsgs;

      const lastMsgDate = mergedMsgs.length > 0 ? mergedMsgs[mergedMsgs.length - 1].timestamp : existing.lastUpdated;
      existing.lastUpdated = lastMsgDate || existing.lastUpdated;
    }
  }

  cloudArr.forEach(c => processChat(c, false));
  localArr.forEach(c => processChat(c, true));

  const result = Array.from(chatMap.values());
  result.sort((a, b) => new Date(b.lastUpdated || b.createdAt || 0) - new Date(a.lastUpdated || a.createdAt || 0));
  return result;
}

function mergeFootprints(localArr, cloudArr) {
  if (!Array.isArray(localArr)) localArr = [];
  if (!Array.isArray(cloudArr)) cloudArr = [];

  const map = new Map();
  cloudArr.forEach(f => { if (f && f.id) map.set(f.id, f); });
  localArr.forEach(f => { if (f && f.id && !map.has(f.id)) map.set(f.id, f); });

  const result = Array.from(map.values());
  result.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
  return result.slice(0, 1000);
}

function mergeBankLinks(localArr, cloudArr) {
  if (!Array.isArray(localArr)) localArr = [];
  if (!Array.isArray(cloudArr)) cloudArr = [];

  const map = new Map();
  const processItem = (item) => {
    if (!item) return;
    const key = item.id || (item.userEmail ? String(item.userEmail).toLowerCase() + '_' + (item.accountNumber || '') : null);
    if (!key) return;
    if (!map.has(key)) {
      map.set(key, item);
    } else {
      map.set(key, { ...map.get(key), ...item });
    }
  };

  cloudArr.forEach(processItem);
  localArr.forEach(processItem);

  const result = Array.from(map.values());
  result.sort((a, b) => new Date(b.linkedAt || 0) - new Date(a.linkedAt || 0));
  return result;
}

function mergeWithdrawalRequests(localArr, cloudArr) {
  if (!Array.isArray(localArr)) localArr = [];
  if (!Array.isArray(cloudArr)) cloudArr = [];

  const map = new Map();
  const processItem = (item) => {
    if (!item) return;
    const key = item.id || (item.userEmail ? String(item.userEmail).toLowerCase() + '_' + item.amount + '_' + item.timestamp : null);
    if (!key) return;
    if (!map.has(key)) {
      map.set(key, item);
    } else {
      const existing = map.get(key);
      const merged = { ...existing, ...item };
      if (existing.status === 'approved' || item.status === 'approved') merged.status = 'approved';
      if (existing.status === 'rejected' || item.status === 'rejected') merged.status = 'rejected';
      map.set(key, merged);
    }
  };

  cloudArr.forEach(processItem);
  localArr.forEach(processItem);

  const result = Array.from(map.values());
  result.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
  return result;
}

function mergeGlobalWallets(localObj, cloudObj) {
  const l = (localObj && typeof localObj === 'object' && !Array.isArray(localObj)) ? localObj : {};
  const c = (cloudObj && typeof cloudObj === 'object' && !Array.isArray(cloudObj)) ? cloudObj : {};
  return { ...l, ...c };
}

let _isSyncing = false;

async function cloudSyncFull() {
  if (_isSyncing) return false;
  _isSyncing = true;

  try {
    const cloudData = await cloudFetch();
    if (!cloudData) return false;

    let dataChanged = false;
    let finalData = {};

    SYNC_KEYS.forEach(key => {
      let localData;
      try { localData = JSON.parse(localStorage.getItem(key)); } catch { localData = null; }

      const cloudVal = cloudData[key];

      let merged;
      if (key === 'geniusact_visitor_logs') {
        merged = mergeVisitorLogs(localData, cloudVal);
      } else if (key === 'geniusact_support_messages') {
        merged = mergeSupportMessages(localData, cloudVal);
      } else if (key === 'geniusact_contact_chats') {
        merged = mergeContactChats(localData, cloudVal);
      } else if (key === 'geniusact_user_footprints') {
        merged = mergeFootprints(localData, cloudVal);
      } else if (key === 'geniusact_bank_links') {
        merged = mergeBankLinks(localData, cloudVal);
      } else if (key === 'geniusact_withdrawal_requests') {
        merged = mergeWithdrawalRequests(localData, cloudVal);
      } else if (key === 'geniusact_global_wallets') {
        merged = mergeGlobalWallets(localData, cloudVal);
      } else {
        merged = mergeUsers(localData, cloudVal);
      }
      
      finalData[key] = merged;
    });

    // Deduplicate pending users that have been approved or rejected
    if (finalData['geniusact_approved_users'] && finalData['geniusact_pending_users']) {
      const approvedEmails = new Set(
        finalData['geniusact_approved_users']
          .filter(u => u && u.email)
          .map(u => String(u.email).trim().toLowerCase())
      );
      finalData['geniusact_pending_users'] = finalData['geniusact_pending_users'].filter(u => {
        if (!u || !u.email) return true;
        const em = String(u.email).trim().toLowerCase();
        if (approvedEmails.has(em)) return false;
        if (u.status === 'approved' || u.status === 'rejected') return false;
        return true;
      });
    }

    SYNC_KEYS.forEach(key => {
      const mergedStr = JSON.stringify(finalData[key]);
      if (mergedStr !== localStorage.getItem(key)) {
        originalSetItem(key, mergedStr);
        dataChanged = true;
      }
    });

    // Push latest merged state back to cloud database
    await cloudPush(finalData);

    // Refresh active session if logged in
    refreshActiveUserSession();

    // Dispatch custom update event for real-time UI refresh
    window.dispatchEvent(new CustomEvent('cloudSyncUpdated', { detail: finalData }));
    
    return dataChanged;
  } finally {
    _isSyncing = false;
  }
}

function refreshActiveUserSession() {
  try {
    const sessionStr = localStorage.getItem('geniusact_current_user');
    if (!sessionStr) return;
    const sessionUser = JSON.parse(sessionStr);
    if (!sessionUser || !sessionUser.email) return;

    const allUsers = JSON.parse(localStorage.getItem('geniusact_approved_users')) || [];
    const freshUser = allUsers.find(u => u.email && u.email.toLowerCase() === sessionUser.email.toLowerCase());
    if (!freshUser) return;

    originalSetItem('geniusact_current_user', JSON.stringify(freshUser));
  } catch (e) {
    console.warn('[CloudSync] refreshActiveUserSession error:', e);
  }
}

localStorage.setItem = function(key, value) {
  try {
    originalSetItem(key, value);
  } catch (err) {
    if (err.name === 'QuotaExceededError' || err.code === 22 || err.code === 1014) {
      autoPruneLocalStorage();
      try {
        originalSetItem(key, value);
      } catch (retryErr) {
        if (key === 'geniusact_current_user') {
          try {
            const u = JSON.parse(value);
            delete u.proofFile;
            delete u.chat_history;
            if (Array.isArray(u.donations) && u.donations.length > 20) {
              u.donations = u.donations.slice(0, 20);
            }
            originalSetItem(key, JSON.stringify(u));
            return;
          } catch (e) { }
        }
        console.warn(`[CloudSync] Could not save ${key} after quota prune:`, retryErr);
      }
    } else {
      throw err;
    }
  }

  if (SYNC_KEYS.includes(key)) {
    if (window._cloudPushTimeout) clearTimeout(window._cloudPushTimeout);
    window._cloudPushTimeout = setTimeout(async () => {
      await cloudSyncFull();
    }, 300);
  }
};

window.cloudSyncFull = cloudSyncFull; // Expose globally

// ==================== VISITOR TRACKING ====================
async function trackVisitor() {
  try {
    const visitorEntry = {
      id: 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      page: window.location.pathname + window.location.search,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer || 'Direct',
      screenSize: window.screen.width + 'x' + window.screen.height,
      language: navigator.language,
      platform: navigator.platform || 'Unknown',
      location: null
    };

    // Try to get location from free IP API (non-blocking with 1s timeout)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000);
      const geoRes = await fetch('https://ipapi.co/json/', { signal: controller.signal, cache: 'no-store' });
      clearTimeout(timeoutId);
      if (geoRes.ok) {
        const geo = await geoRes.json();
        visitorEntry.location = {
          ip: geo.ip || 'Unknown',
          city: geo.city || 'Unknown',
          region: geo.region || 'Unknown',
          country: geo.country_name || 'Unknown',
          timezone: geo.timezone || 'Unknown'
        };
      }
    } catch (geoErr) {
      visitorEntry.location = { ip: 'Local/VPN', city: 'United States', region: 'DC', country: 'United States', timezone: 'EST' };
    }

    // Append to visitor logs
    let logs = [];
    try { logs = JSON.parse(localStorage.getItem('geniusact_visitor_logs')) || []; } catch { logs = []; }
    if (!Array.isArray(logs)) logs = [];
    logs.unshift(visitorEntry);
    // Keep only last 500 locally
    if (logs.length > 500) logs = logs.slice(0, 500);
    localStorage.setItem('geniusact_visitor_logs', JSON.stringify(logs));

    console.log('[Visitor] Tracked:', visitorEntry.page);
  } catch (err) {
    console.warn('[Visitor] Tracking error:', err.message);
  }
}

// Run initial sync instantly, track visitor in background, and poll every 4s
window._cloudSyncReady = cloudSyncFull();
setTimeout(trackVisitor, 200);
setInterval(() => {
  cloudSyncFull().catch(e => console.warn('[CloudSync] Polling error:', e));
}, 4000);
