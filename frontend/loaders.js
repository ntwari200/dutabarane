// ============================================
// PROFESSIONAL LOADER SYSTEM - DUTABARANE
// Tornado Software Solutions
// ============================================

class DutabaraneLoaderSystem {
    constructor() {
        console.log('✅ Loader System Initialized');
    }

    // ========== BUTTON SPINNER ==========
    showButtonSpinner(button, loadingText = 'Processing...') {
        if (!button) {
            console.error('Button not found');
            return { stop: () => {} };
        }
        
        // Save original content
        const originalHTML = button.innerHTML;
        const originalDisabled = button.disabled;
        
        // Disable button and add spinner
        button.disabled = true;
        button.classList.add('btn-loading');
        button.innerHTML = `<span class="btn-spinner btn-spinner-white"></span><span class="btn-text">${loadingText}</span>`;
        
        // Return stop function
        return {
            stop: () => {
                button.disabled = originalDisabled;
                button.classList.remove('btn-loading');
                button.innerHTML = originalHTML;
            }
        };
    }

    // ========== SUCCESS TOAST ==========
    showSuccessToast(message, duration = 3000) {
        // Remove existing toast
        const existingToast = document.querySelector('.success-toast');
        if (existingToast) existingToast.remove();
        
        // Create new toast
        const toast = document.createElement('div');
        toast.className = 'success-toast';
        toast.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
            <span class="close-toast" onclick="this.parentElement.remove()">✕</span>
        `;
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Auto remove
        setTimeout(() => {
            if (toast) toast.remove();
        }, duration);
        
        return toast;
    }

    // ========== ERROR TOAST ==========
    showErrorToast(message, duration = 3000) {
        // Remove existing toast
        const existingToast = document.querySelector('.error-toast');
        if (existingToast) existingToast.remove();
        
        // Create new toast
        const toast = document.createElement('div');
        toast.className = 'error-toast';
        toast.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
            <span class="close-toast" onclick="this.parentElement.remove()">✕</span>
        `;
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Auto remove
        setTimeout(() => {
            if (toast) toast.remove();
        }, duration);
        
        return toast;
    }
}

// Create global instance
window.dutaLoader = new DutabaraneLoaderSystem();

console.log('✅ Dutabarane Loader System Ready - Spinners will appear on all actions');
