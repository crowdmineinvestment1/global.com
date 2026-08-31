// ==================== AUTH.JS ====================
// GeniusAct Global — Centralized Authentication & Session Management

const loginForm = document.getElementById('login_form');

// Check Auth state — validate user session against server on page load
(async function() {
  const currentUser = localStorage.getItem('geniusact_current_user');
  if (currentUser) {
    try {
      const u = JSON.parse(currentUser);
      if (u && u.email) {
        try {
          const fetchFn = window.geniusFetch || fetch;
          const res = await fetchFn('/api/auth/verify-session?email=' + encodeURIComponent(u.email));
          if (res && res.ok) {
            const data = await res.json();
            if (!data.valid || data.status === 'pending' || data.status === 'suspended') {
              console.warn('[Auth] Session invalid or pending according to server. Clearing local session.');
              localStorage.removeItem('geniusact_current_user');
              const path = window.location.pathname.toLowerCase();
              if (path.includes('dashboard.html')) {
                window.location.href = 'login.html?status=pending';
              }
              return;
            } else if (data.valid && data.user) {
              localStorage.setItem('geniusact_current_user', JSON.stringify(data.user));
            }
          }
        } catch (e) {
          console.warn('[Auth] Server verify check error — clearing local session for safety:', e);
          // Server unreachable: do NOT trust localStorage alone — force re-login
          localStorage.removeItem('geniusact_current_user');
          const path = window.location.pathname.toLowerCase();
          if (path.includes('dashboard.html')) {
            window.location.href = 'login.html';
          }
          return;
        }

        const path = window.location.pathname.toLowerCase();
        if (path.includes('login.html')) {
          window.location.href = 'dashboard.html';
        }
      } else {
        localStorage.removeItem('geniusact_current_user');
      }
    } catch(e) {
      localStorage.removeItem('geniusact_current_user');
    }
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
    submitBtn.textContent = 'Verifying credentials...';
    submitBtn.disabled = true;

    try {
      const fetchFn = window.geniusFetch || fetch;
      const res = await fetchFn('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });

      const data = res ? await res.json() : null;

      if (res && res.ok && data && data.success && data.user) {
        localStorage.setItem('geniusact_current_user', JSON.stringify(data.user));
        window.location.href = 'dashboard.html';
        return;
      }

      if (data && data.status === 'pending') {
        showPendingAuditModal(data.user || { email, date: new Date().toISOString() });
        submitBtn.textContent = origText;
        submitBtn.disabled = false;
        return;
      }

      if (data && data.error) {
        throw new Error(data.error);
      }

      throw new Error("Unable to authenticate. Please check your credentials or register a contribution first.");
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
