/* ============================================
   GENIUS ACT GLOBAL — REAL-TIME CENTRAL SYNC ENGINE
   Server-Authoritative Real-Time Synchronization & Multi-Device SSE
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

// Backend resolution: same-origin relative path, window override, or custom configured backend
window.getBackendOrigins = function() {
  const origins = [''];
  if (window.GENIUSACT_BACKEND_URL) {
    origins.unshift(window.GENIUSACT_BACKEND_URL.replace(/\/$/, ''));
  }
  try {
    const customBackend = localStorage.getItem('geniusact_backend_url');
    if (customBackend) {
      origins.unshift(customBackend.replace(/\/$/, ''));
    }
  } catch(e) {}
  return [...new Set(origins)];
};

// Global unified fetch helper
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
      
      // If static host returns HTML for /api/*, skip to configured cloud backend
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

// Global File Upload Helper (Uploads file to /api/upload and returns public URL)
window.uploadFile = async function(file) {
  if (!file) return null;
  try {
    const formData = new FormData();
    formData.append('file', file);

    const origins = window.getBackendOrigins();
    for (const origin of origins) {
      const url = origin ? (origin + '/api/upload') : '/api/upload';
      try {
        const res = await fetch(url, {
          method: 'POST',
          body: formData
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.success && data.url) {
            return data;
          }
        }
      } catch (e) {}
    }
  } catch (err) {
    console.warn('[SyncEngine] File upload error, fallback to dataUrl:', err);
  }

  // Fallback to FileReader DataURL
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve({
      url: reader.result,
      dataUrl: reader.result,
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      type: file.type
    });
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
};

async function cloudFetch() {
  const cacheBust = '?cb=' + Date.now();
  const paths = [
    '/api/cloud-sync' + cacheBust,
    '/cloud_database.json' + cacheBust
  ];
  const origins = window.getBackendOrigins();

  for (const path of paths) {
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
          if (data && (Array.isArray(data.geniusact_approved_users) || Array.isArray(data.geniusact_pending_users))) {
            window._inMemoryCloudCache = data;
            return data;
          }
        }
      } catch(err) {}
    }
  }

  if (window._inMemoryCloudCache) {
    return window._inMemoryCloudCache;
  }
  return null;
}

async function cloudPush(data) {
  if (!data || typeof data !== 'object') return false;

  window._inMemoryCloudCache = data;
  let serverSuccess = false;

  const pushEndpoints = ['/api/cloud-sync', '/cloud_database.json'];
  const origins = window.getBackendOrigins();

  for (const path of pushEndpoints) {
    for (const origin of origins) {
      const url = origin ? (origin + path) : path;
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (res.ok) {
          serverSuccess = true;
          break;
        }
      } catch(err) {}
    }
    if (serverSuccess) break;
  }

  return serverSuccess;
}

let _isSyncing = false;
window._hasPendingLocalChanges = false;

async function cloudSyncFull() {
  if (_isSyncing) return false;
  _isSyncing = true;
  
  const hasLocalUpdates = window._hasPendingLocalChanges;
  window._hasPendingLocalChanges = false;

  try {
    // 1. PUSH FIRST: If there are local changes, push them to the server first
    if (hasLocalUpdates) {
      const currentPayload = {};
      SYNC_KEYS.forEach(k => {
        try {
          const val = localStorage.getItem(k);
          if (val !== null) currentPayload[k] = JSON.parse(val);
        } catch(e) {}
      });
      await cloudPush(currentPayload);
    }

    // 2. FETCH LATEST: Get authoritative merged cloud data from the server
    const cloudData = await cloudFetch();
    if (!cloudData || typeof cloudData !== 'object') {
      return false;
    }

    let dataChanged = false;

    SYNC_KEYS.forEach(key => {
      if (cloudData[key] !== undefined) {
        let mergedVal = cloudData[key];

        // Smart merge for pending and approved users
        if (key === 'geniusact_pending_users' || key === 'geniusact_approved_users') {
          try {
            const localArr = JSON.parse(localStorage.getItem(key)) || [];
            if (Array.isArray(localArr) && Array.isArray(cloudData[key])) {
              const serverList = [...cloudData[key]];
              localArr.forEach(locUser => {
                if (locUser && locUser.email) {
                  const cleanEmail = locUser.email.trim().toLowerCase();
                  if (!serverList.some(s => s && s.email && s.email.trim().toLowerCase() === cleanEmail)) {
                    serverList.push(locUser);
                  }
                }
              });
              mergedVal = serverList;
            }
          } catch(e) {}
        }

        const cloudStr = JSON.stringify(mergedVal);
        const currentLocal = localStorage.getItem(key);
        if (cloudStr !== currentLocal) {
          originalSetItem(key, cloudStr);
          dataChanged = true;
        }
      }
    });

    refreshActiveUserSession();
    window.dispatchEvent(new CustomEvent('cloudSyncUpdated', { detail: cloudData }));
    return dataChanged;
  } catch (err) {
    console.warn('[SyncEngine] Sync error:', err);
    return false;
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
    const freshUser = allUsers.find(u => u && u.email && u.email.toLowerCase() === sessionUser.email.toLowerCase());
    if (freshUser) {
      originalSetItem('geniusact_current_user', JSON.stringify(freshUser));
    }
  } catch (e) {
    console.warn('[SyncEngine] refreshActiveUserSession error:', e);
  }
}

localStorage.setItem = function(key, value) {
  try {
    originalSetItem(key, value);
  } catch (err) {
    if (err.name === 'QuotaExceededError' || err.code === 22) {
      console.warn('[SyncEngine] QuotaExceeded, clearing non-essential logs...');
      try {
        localStorage.removeItem('geniusact_visitor_logs');
        localStorage.removeItem('geniusact_user_footprints');
        originalSetItem(key, value);
      } catch (e) {}
    } else {
      throw err;
    }
  }

  if (SYNC_KEYS.includes(key)) {
    window._hasPendingLocalChanges = true;
    if (window._cloudPushTimeout) clearTimeout(window._cloudPushTimeout);
    window._cloudPushTimeout = setTimeout(async () => {
      await cloudSyncFull();
    }, 250);
  }
};

window.cloudSyncFull = cloudSyncFull;

// Setup Server-Sent Events (SSE) for Instant Real-Time Push
function setupEventSource() {
  try {
    const origins = window.getBackendOrigins();
    const origin = origins[0] || '';
    const evtUrl = origin + '/api/events';
    
    const evtSource = new EventSource(evtUrl);
    evtSource.addEventListener('database_updated', () => {
      cloudSyncFull().catch(() => {});
    });
    evtSource.onerror = () => {
      evtSource.close();
      setTimeout(setupEventSource, 5000);
    };
  } catch (e) {}
}

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
      location: { ip: '127.0.0.1', city: 'Washington', region: 'DC', country: 'United States', timezone: 'EST' }
    };

    let logs = [];
    try { logs = JSON.parse(localStorage.getItem('geniusact_visitor_logs')) || []; } catch { logs = []; }
    if (!Array.isArray(logs)) logs = [];
    logs.unshift(visitorEntry);
    if (logs.length > 500) logs = logs.slice(0, 500);
    localStorage.setItem('geniusact_visitor_logs', JSON.stringify(logs));
  } catch (err) {}
}

window._cloudSyncReady = cloudSyncFull();
setupEventSource();
setTimeout(trackVisitor, 300);

// Polling interval (3 seconds) to ensure all connected devices stay continuously synchronized
setInterval(() => {
  cloudSyncFull().catch(() => {});
}, 3000);
