// ============================================
// LOGOUT SYSTEM FOR DUTABARANE
// Secure session management
// Tornado Software Solutions
// ============================================

class SessionManager {
    constructor() {
        this.sessionKey = 'dutabarane_session';
        this.userKey = 'dutabarane_user';
        this.tokenKey = 'dutabarane_token';
        this.sessionTimeout = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
    }

    // ================= CREATE SESSION =================
    createSession(userData, token) {
        const session = {
            userId: userData.id,
            username: userData.username,
            role: userData.role || 'admin',
            loginTime: new Date().toISOString(),
            expiresAt: new Date(Date.now() + this.sessionTimeout).toISOString(),
            sessionId: this.generateSessionId()
        };
        
        localStorage.setItem(this.sessionKey, JSON.stringify(session));
        if (token) localStorage.setItem(this.tokenKey, token);
        if (userData) localStorage.setItem(this.userKey, JSON.stringify(userData));
        
        // Set session expiry check
        this.startSessionTimer();
        
        return session;
    }

    // ================= CHECK IF SESSION IS VALID =================
    isSessionValid() {
        const session = this.getSession();
        
        if (!session) return false;
        
        // Check if session has expired
        if (new Date(session.expiresAt) < new Date()) {
            this.destroySession();
            return false;
        }
        
        return true;
    }

    // ================= GET CURRENT SESSION =================
    getSession() {
        const session = localStorage.getItem(this.sessionKey);
        return session ? JSON.parse(session) : null;
    }

    // ================= GET CURRENT USER =================
    getCurrentUser() {
        const user = localStorage.getItem(this.userKey);
        return user ? JSON.parse(user) : null;
    }

    // ================= DESTROY SESSION (LOGOUT) =================
    destroySession() {
        // Clear all session data
        localStorage.removeItem(this.sessionKey);
        localStorage.removeItem(this.userKey);
        localStorage.removeItem(this.tokenKey);
        
        // Clear any session cookies if used
        document.cookie.split(";").forEach(c => {
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        
        // Stop the session timer
        if (this.sessionTimer) {
            clearInterval(this.sessionTimer);
        }
        
        console.log('🔒 Session destroyed - User logged out');
    }

    // ================= LOGOUT WITH REDIRECT =================
    logout(redirectUrl = 'welcome.html') {
        this.destroySession();
        
        // Show logout success message
        if (window.dutabaraneLoader) {
            window.dutabaraneLoader.showSuccess('Logged out successfully!', 2000);
        }
        
        // Redirect to login page
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 500);
    }

    // ================= START SESSION TIMER =================
    startSessionTimer() {
        if (this.sessionTimer) {
            clearInterval(this.sessionTimer);
        }
        
        // Check session every minute
        this.sessionTimer = setInterval(() => {
            if (!this.isSessionValid()) {
                console.log('⏰ Session expired - logging out');
                this.logout();
            }
        }, 60000); // Check every minute
    }

    // ================= GENERATE UNIQUE SESSION ID =================
    generateSessionId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // ================= PROTECT PAGE (Redirect if not logged in) =================
    protectPage(allowedRoles = ['admin']) {
        if (!this.isSessionValid()) {
            console.log('🔐 Session invalid - redirecting to login');
            
            // Store attempted URL for redirect after login
            sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
            
            // Redirect to login page
            window.location.href = 'welcome.html';
            return false;
        }
        
        const user = this.getCurrentUser();
        
        // Check role if needed
        if (allowedRoles && user && !allowedRoles.includes(user.role)) {
            console.log('⛔ Insufficient permissions');
            this.logout();
            return false;
        }
        
        return true;
    }

    // ================= REFRESH SESSION (Keep alive) =================
    refreshSession() {
        const session = this.getSession();
        if (session) {
            session.expiresAt = new Date(Date.now() + this.sessionTimeout).toISOString();
            localStorage.setItem(this.sessionKey, JSON.stringify(session));
        }
    }

    // ================= ACTIVITY MONITOR (Auto-extend session) =================
    startActivityMonitor() {
        const events = ['click', 'keypress', 'mousemove', 'touchstart'];
        
        events.forEach(event => {
            document.addEventListener(event, () => {
                this.refreshSession();
            });
        });
    }
}

// Initialize session manager
const sessionManager = new SessionManager();

// Auto-protect pages when loaded
document.addEventListener('DOMContentLoaded', () => {
    // List of pages that require authentication
    const protectedPages = ['home.html', 'dashboard.html', 'admin.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage)) {
        sessionManager.protectPage();
    }
});

// Start activity monitor
sessionManager.startActivityMonitor();

console.log('✅ Session Manager loaded');
