// ==================== AUTH.JS ====================
// GeniusAct Global — Authentication (Login Only)
// Account creation happens on contribute.html → goes to pending → admin approves

const loginForm = document.getElementById('login_form'); 

// Check Auth state — redirect logged-in users only when visiting login page
(function() {
  const currentUser = localStorage.getItem('geniusact_current_user');
  if (currentUser) {
    try {
      const u = JSON.parse(currentUser);
      if (u && (u.email || u.uid)) {
        const path = window.location.pathname.toLowerCase();
        // Redirect only if user tries to open login page while already logged in
        if (path.includes('login.html')) {
          window.location.href = 'dashboard.html';
        }
      }
    } catch(e) {}
  }
})();

// ==================== LOGIN HANDLER ====================
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login_email').value.toLowerCase().trim();
    const pass = document.getElementById('login_password').value;
    const submitBtn = loginForm.querySelector('button[type="submit"]');

    if (!email || !pass) {
      alert('Please enter both email and password.');
      return;
    }

    const origText = submitBtn.textContent;
    submitBtn.textContent = 'Syncing data...';
    submitBtn.disabled = true;

    try {
      // CRITICAL: Wait for initial cloud sync to pull all user data from Supabase
      await window._cloudSyncReady;

      // Do a FRESH sync to guarantee we have the absolute latest data from cloud
      await window.cloudSyncFull();

      submitBtn.textContent = 'Verifying...';

      const approvedUsers = JSON.parse(localStorage.getItem('geniusact_approved_users')) || [];
      const pendingUsers = JSON.parse(localStorage.getItem('geniusact_pending_users')) || [];
      
      // Check approved users first
      const approvedUser = approvedUsers.find(u => u.email && u.email.toLowerCase() === email && u.password === pass);
      
      // Check pending users
      const pendingUser = pendingUsers.find(u => u.email && u.email.toLowerCase() === email && u.password === pass);

      // Check if email exists but wrong password
      const emailExistsApproved = approvedUsers.find(u => u.email && u.email.toLowerCase() === email);
      const emailExistsPending = pendingUsers.find(u => u.email && u.email.toLowerCase() === email);

      if (approvedUser) {
        if (approvedUser.suspended) {
          throw new Error("Account suspended by Federal Compliance Division. Please contact official support.");
        }
        // ✅ Approved — allow login
        const userToSave = { ...approvedUser };
        delete userToSave.proofFile; // Remove heavy proof file base64
        try {
          localStorage.setItem('geniusact_current_user', JSON.stringify(userToSave));
        } catch (storageErr) {
          console.warn("Storage quota error on login, clearing logs and retrying...", storageErr);
          try {
            localStorage.removeItem('geniusact_visitor_logs');
            localStorage.removeItem('geniusact_user_footprints');
            localStorage.setItem('geniusact_current_user', JSON.stringify({
              uid: userToSave.uid,
              email: userToSave.email,
              fullName: userToSave.fullName || userToSave.email.split('@')[0],
              amount: userToSave.amount || 0,
              status: userToSave.status || 'approved',
              donations: userToSave.donations || []
            }));
          } catch (e2) {
            console.error("Critical storage error:", e2);
          }
        }
        window.location.href = 'dashboard.html';
      } else if (pendingUser) {
        // ⏳ Pending — show professional GENIUS Act compliance modal with loading spinner
        showPendingAuditModal(pendingUser);
        submitBtn.textContent = origText;
        submitBtn.disabled = false;
        return;
      } else if (emailExistsApproved || emailExistsPending) {
        // ❌ Email found but wrong password
        throw new Error("Incorrect authentication credentials. Please verify your password.");
      } else {
        // ❌ No account found
        throw new Error("No supporter account found with this email. Please submit your campaign contribution first to initiate registration.");
      }

    } catch (error) {
      console.error("Login error:", error);
      alert(error.message);
      submitBtn.textContent = origText;
      submitBtn.disabled = false;
    }
  });
}

// Function to render official GENIUS Act Government Compliance Pending Modal
function showPendingAuditModal(user) {
  const existing = document.getElementById('pending-audit-modal');
  if (existing) existing.remove();

  const userEmail = user && user.email ? user.email : '';
  const dateStr = user && user.date ? new Date(user.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : new Date().toLocaleDateString('en-US');

  const modalHtml = `
    <div id="pending-audit-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(8px); z-index: 20000; display: flex; align-items: center; justify-content: center; padding: 1.5rem;">
      <div style="background: #ffffff; color: #0f172a; border-radius: 16px; max-width: 520px; width: 100%; padding: 2rem; box-shadow: 0 25px 60px rgba(0,0,0,0.5); border: 2px solid #3b82f6; position: relative; font-family: 'Inter', sans-serif;">
        <button onclick="document.getElementById('pending-audit-modal').remove()" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 1.5rem; color: #94a3b8; cursor: pointer;">&times;</button>
        
        <div style="display: flex; align-items: center; gap: 0.75rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 1rem; margin-bottom: 1.25rem;">
          <div style="background: #eff6ff; color: #2563eb; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
            <i class="fas fa-shield-alt"></i>
          </div>
          <div>
            <span style="font-size: 0.72rem; font-weight: 800; color: #2563eb; letter-spacing: 0.05em; text-transform: uppercase;">U.S. Federal Campaign Oversight • GENIUS Act Framework</span>
            <h3 style="font-size: 1.15rem; font-weight: 800; color: #0f172a; margin: 0.2rem 0 0 0;">STATUS: PENDING COMPLIANCE AUDIT</h3>
          </div>
        </div>

        <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 1rem; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.85rem;">
          <div style="font-size: 1.4rem; color: #d97706; display: flex; align-items: center;">
            <i class="fas fa-spinner fa-spin"></i>
          </div>
          <div>
            <div style="font-weight: 700; font-size: 0.88rem; color: #92400e; margin-bottom: 0.2rem;">Verification & Clearance In Progress</div>
            <div style="font-size: 0.8rem; color: #b45309;">Scanning Campaign Ledger • Section 407 Regulatory Check</div>
          </div>
        </div>

        <div style="color: #475569; font-size: 0.88rem; line-height: 1.55; margin-bottom: 1.25rem;">
          <p style="margin-bottom: 0.75rem;">
            <strong>Official Compliance Notice:</strong> Under Section 407 of the <strong>GENIUS Act (Guaranteed Economic National Investment & Uniform Security Act)</strong> and Federal Campaign Finance Regulatory Standards, all newly registered supporter accounts, treasury contributions, and allocation records undergo mandatory regulatory compliance audit prior to dashboard activation.
          </p>
          <p style="margin: 0;">
            ${userEmail ? `<strong style="color:#1e293b;">${userEmail}</strong> is` : 'Your supporter profile is'} securely queued in the Federal Campaign Oversight Registry and is currently being reviewed by an authorized Compliance Officer to verify treasury clearance and identity validation (Submitted ${dateStr}).
          </p>
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.85rem 1rem; margin-bottom: 1.5rem; font-size: 0.8rem; color: #64748b; display: flex; justify-content: space-between; align-items: center;">
          <span>Reference Code: <strong style="color: #1e293b; font-family: monospace;">GA-REG-407-AUDIT</strong></span>
          <span style="display: flex; align-items: center; gap: 0.4rem; color: #2563eb; font-weight: 600;">
            <i class="fas fa-sync-alt fa-spin"></i> Auto-Sync Active
          </span>
        </div>

        <button onclick="document.getElementById('pending-audit-modal').remove()" style="width: 100%; padding: 0.85rem; background: linear-gradient(135deg, #1e3a8a, #2563eb); color: white; border: none; border-radius: 10px; font-weight: 700; font-size: 0.95rem; cursor: pointer; box-shadow: 0 4px 14px rgba(37,99,235,0.35);">
          Acknowledge & Close
        </button>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// Auto-check URL parameters on login page visit for pending status
const loginUrlParams = new URLSearchParams(window.location.search);
if (loginUrlParams.get('status') === 'pending' || loginUrlParams.has('pending')) {
  window.addEventListener('DOMContentLoaded', () => {
    showPendingAuditModal({ email: '', date: new Date().toISOString() });
  });
}
