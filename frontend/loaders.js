// ============================================
// PROFESSIONAL LOADER SYSTEM - DUTABARANE
// Tornado Software Solutions
// ============================================

class DutabaraneLoaderSystem {
    constructor() {
        this.activeSpinners = 0;
    }

    // ========== BUTTON SPINNER ==========
    showButtonSpinner(button, loadingText = 'Processing...') {
        if (!button) return null;
        
        const originalHTML = button.innerHTML;
        const originalWidth = button.style.width;
        
        button.disabled = true;
        button.classList.add('btn-loading');
        button.style.width = button.offsetWidth + 'px';
        button.innerHTML = `<span class="btn-spinner"></span><span class="btn-text">${loadingText}</span>`;
        
        return {
            stop: () => {
                button.disabled = false;
                button.classList.remove('btn-loading');
                button.innerHTML = originalHTML;
                button.style.width = originalWidth;
            }
        };
    }

    // ========== OVERLAY SPINNER (For modals/popups) ==========
    showOverlaySpinner(element, message = 'Processing...') {
        if (!element) return null;
        
        const overlay = document.createElement('div');
        overlay.className = 'overlay-spinner';
        overlay.id = 'dynamicOverlaySpinner';
        overlay.innerHTML = `
            <div class="overlay-spinner-content">
                <div class="spinner"></div>
                <span>${message}</span>
            </div>
        `;
        
        const position = window.getComputedStyle(element).position;
        if (position === 'static') {
            element.style.position = 'relative';
        }
        
        element.appendChild(overlay);
        
        return {
            hide: () => {
                const existingOverlay = document.getElementById('dynamicOverlaySpinner');
                if (existingOverlay) existingOverlay.remove();
            }
        };
    }

    // ========== ROW SPINNER (For table row deletion) ==========
    showRowSpinner(button, originalText) {
        if (!button) return null;
        
        const originalHTML = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '<div class="row-spinner"><div class="spinner"></div></div>';
        
        return {
            stop: () => {
                button.disabled = false;
                button.innerHTML = originalHTML;
            }
        };
    }

    // ========== INLINE SPINNER ==========
    showInlineSpinner(element, message = 'Loading...') {
        if (!element) return null;
        
        const originalHTML = element.innerHTML;
        element.innerHTML = `<div class="inline-spinner"><i class="fas fa-spinner"></i> ${message}</div>`;
        
        return {
            stop: () => {
                element.innerHTML = originalHTML;
            }
        };
    }

    // ========== TOAST PROCESSING ==========
    showProcessingToast(message = 'Processing...', duration = 3000) {
        let toast = document.querySelector('.toast-processing');
        if (toast) toast.remove();
        
        toast = document.createElement('div');
        toast.className = 'toast-processing';
        toast.innerHTML = `
            <i class="fas fa-spinner"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(toast);
        
        return {
            hide: () => {
                if (toast) toast.remove();
            }
        };
    }

    // ========== PAGE TRANSITION SPINNER ==========
    showPageSpinner(message = 'Loading...') {
        let spinner = document.querySelector('.page-transition');
        if (spinner) spinner.remove();
        
        spinner = document.createElement('div');
        spinner.className = 'page-transition';
        spinner.innerHTML = `
            <div style="text-align: center;">
                <div class="page-spinner"></div>
                <div class="page-spinner-text">${message}</div>
            </div>
        `;
        document.body.appendChild(spinner);
        
        return {
            hide: () => {
                const existing = document.querySelector('.page-transition');
                if (existing) existing.remove();
            }
        };
    }

    // ========== DOWNLOAD SPINNER ==========
    async downloadWithSpinner(button, downloadFunction, fileName) {
        const spinner = this.showButtonSpinner(button, 'Downloading...');
        
        try {
            await downloadFunction();
            this.showSuccessToast(`${fileName} downloaded successfully!`);
        } catch (error) {
            console.error('Download error:', error);
            this.showErrorToast('Download failed!');
        } finally {
            spinner.stop();
        }
    }

    // ========== SAVE SPINNER ==========
    async saveWithSpinner(button, saveFunction, successMessage = 'Saved successfully!') {
        const spinner = this.showButtonSpinner(button, 'Saving...');
        
        try {
            await saveFunction();
            this.showSuccessToast(successMessage);
        } catch (error) {
            console.error('Save error:', error);
            this.showErrorToast('Save failed!');
        } finally {
            spinner.stop();
        }
    }

    // ========== DELETE SPINNER ==========
    async deleteWithSpinner(button, deleteFunction, itemName = 'Item') {
        if (!confirm(`Are you sure you want to delete this ${itemName}?`)) return false;
        
        const spinner = this.showButtonSpinner(button, 'Deleting...');
        
        try {
            await deleteFunction();
            this.showSuccessToast(`${itemName} deleted successfully!`);
            return true;
        } catch (error) {
            console.error('Delete error:', error);
            this.showErrorToast(`Failed to delete ${itemName}!`);
            return false;
        } finally {
            spinner.stop();
        }
    }

    // ========== SUCCESS TOAST ==========
    showSuccessToast(message, duration = 3000) {
        const toast = document.createElement('div');
        toast.className = 'success-toast';
        toast.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
            <span class="close-toast" onclick="this.parentElement.remove()">✕</span>
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            if (toast) toast.remove();
        }, duration);
    }

    // ========== ERROR TOAST ==========
    showErrorToast(message, duration = 3000) {
        const toast = document.createElement('div');
        toast.className = 'error-toast';
        toast.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
            <span class="close-toast" onclick="this.parentElement.remove()">✕</span>
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            if (toast) toast.remove();
        }, duration);
    }
}

// Initialize global loader
const dutaLoader = new DutabaraneLoaderSystem();

console.log('✅ Dutabarane Loader System Ready');
console.log('📦 Available: button spinners, overlay spinners, row spinners');
