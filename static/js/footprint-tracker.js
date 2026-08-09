// Global User Footprint Tracker for GeniusAct Global
(function() {
    function logFootprint(actionType, details, metadata = {}) {
        let footprints = JSON.parse(localStorage.getItem('geniusact_user_footprints')) || [];
        
        let currentUser = null;
        try {
            const uStr = localStorage.getItem('geniusact_current_user');
            if (uStr) currentUser = JSON.parse(uStr);
        } catch(e) {}

        const entry = {
            id: 'fp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            timestamp: new Date().toISOString(),
            userEmail: metadata.email || (currentUser ? currentUser.email : 'Guest Visitor'),
            userName: metadata.name || (currentUser ? currentUser.fullName || currentUser.email.split('@')[0] : 'Visitor'),
            actionType: actionType,
            details: details,
            pageUrl: window.location.pathname.split('/').pop() || 'index.html',
            deviceInfo: navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop Browser'
        };

        footprints.unshift(entry);
        if (footprints.length > 500) footprints = footprints.slice(0, 500); // keep recent 500
        
        localStorage.setItem('geniusact_user_footprints', JSON.stringify(footprints));

        if (window.cloudSyncFull) {
            try { window.cloudSyncFull(); } catch(e) {}
        }
    }

    window.recordUserFootprint = logFootprint;

    // Auto-listen to form submissions across pages
    document.addEventListener('DOMContentLoaded', () => {
        // Track inputs on inputs with data-footprint attribute or input/textarea interactions
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => {
                const inputs = form.querySelectorAll('input, select, textarea');
                let summary = [];
                let capturedName = '';
                let capturedEmail = '';

                inputs.forEach(input => {
                    if (input.type === 'password' || !input.value.trim()) return;
                    const fieldName = input.name || input.id || input.placeholder || 'Field';
                    const val = input.value.trim();

                    if (fieldName.toLowerCase().includes('email')) capturedEmail = val;
                    if (fieldName.toLowerCase().includes('name')) capturedName = val;

                    summary.push(`${fieldName}: "${val}"`);
                });

                if (summary.length > 0) {
                    const formName = form.id || form.getAttribute('name') || 'Website Form';
                    logFootprint(`Form Submitted (${formName})`, summary.join(' | '), { email: capturedEmail, name: capturedName });
                }
            });
        });
    });
})();
