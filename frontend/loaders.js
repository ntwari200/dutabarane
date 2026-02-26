
// ==================== PROFESSIONAL LOADING SYSTEM ====================
// Add to all pages: <script src="loaders.js"></script>

class DutabaraneLoader {
  constructor() {
    this.initLoaders();
  }

  initLoaders() {
    // Create progress bar if not exists
    if (!document.querySelector('.progress-bar')) {
      const progressBar = document.createElement('div');
      progressBar.className = 'progress-bar';
      progressBar.innerHTML = '<div class="progress-bar-fill"></div>';
      document.body.appendChild(progressBar);
    }
  }

  // ========== PAGE LOADER ==========
  showPageLoader(message = 'Loading Dutabarane...') {
    let loader = document.querySelector('.page-loader');
    if (!loader) {
      loader = document.createElement('div');
      loader.className = 'page-loader';
      loader.innerHTML = `
        <div class="page-loader-content">
          <div class="page-loader-spinner"></div>
          <div class="page-loader-text">${message}</div>
        </div>
      `;
      document.body.appendChild(loader);
    } else {
      loader.querySelector('.page-loader-text').textContent = message;
      loader.classList.remove('hidden');
    }
  }

  hidePageLoader() {
    const loader = document.querySelector('.page-loader');
    if (loader) {
      loader.classList.add('hidden');
    }
  }

  // ========== PROGRESS BAR ==========
  startProgress() {
    const fill = document.querySelector('.progress-bar-fill');
    if (fill) {
      fill.style.width = '30%';
    }
  }

  updateProgress(percent) {
    const fill = document.querySelector('.progress-bar-fill');
    if (fill) {
      fill.style.width = percent + '%';
    }
  }

  completeProgress() {
    const fill = document.querySelector('.progress-bar-fill');
    if (fill) {
      fill.style.width = '100%';
      setTimeout(() => {
        fill.style.width = '0%';
      }, 500);
    }
  }

  // ========== SUCCESS TOAST ==========
  showSuccess(message, duration = 3000) {
    let toast = document.querySelector('.success-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'success-toast';
      document.body.appendChild(toast);
    }

    toast.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <span>${message}</span>
      <span class="close-toast" onclick="this.parentElement.classList.remove('show')">✕</span>
    `;

    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    if (duration > 0) {
      setTimeout(() => {
        toast.classList.remove('show');
      }, duration);
    }

    return toast;
  }

  // ========== LOGIN SUCCESS (Green Ellipse) ==========
  showLoginSuccess(callback) {
    const successDiv = document.createElement('div');
    successDiv.className = 'login-success';
    successDiv.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <span>WELCOME</span>
    `;
    document.body.appendChild(successDiv);

    setTimeout(() => {
      successDiv.remove();
      if (callback) callback();
    }, 2000);
  }

  // ========== BUTTON LOADER ==========
  addButtonLoader(button, loadingText = 'Processing...') {
    const originalText = button.innerHTML;
    button.disabled = true;
    button.classList.add('btn-loading');
    button.innerHTML = `
      <span class="btn-spinner"></span>
      <span class="btn-text">${loadingText}</span>
    `;

    return {
      stop: () => {
        button.disabled = false;
        button.classList.remove('btn-loading');
        button.innerHTML = originalText;
      }
    };
  }

  // ========== INLINE LOADER ==========
  createInlineLoader(text = 'Loading') {
    const loader = document.createElement('div');
    loader.className = 'inline-loader';
    loader.innerHTML = `
      <i class="fas fa-spinner"></i>
      <span>${text}</span>
    `;
    return loader;
  }

  // ========== SKELETON LOADER ==========
  showSkeleton(container, rows = 5) {
    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton-wrapper';
    skeleton.id = 'skeleton-loader';

    for (let i = 0; i < rows; i++) {
      const line = document.createElement('div');
      line.className = 'skeleton-line skeleton-line-md';
      line.style.width = Math.random() * 40 + 60 + '%';
      skeleton.appendChild(line);
    }

    container.innerHTML = '';
    container.appendChild(skeleton);
  }

  hideSkeleton(container) {
    const skeleton = document.getElementById('skeleton-loader');
    if (skeleton) skeleton.remove();
  }

  // ========== SAVING OVERLAY ==========
  showSavingOverlay(container, message = 'Saving data...') {
    const overlay = document.createElement('div');
    overlay.className = 'saving-overlay';
    overlay.id = 'saving-overlay';
    overlay.innerHTML = `
      <div class="saving-content">
        <i class="fas fa-spinner"></i>
        <div>${message}</div>
      </div>
    `;

    if (typeof container === 'string') {
      document.querySelector(container).style.position = 'relative';
      document.querySelector(container).appendChild(overlay);
    } else if (container) {
      container.style.position = 'relative';
      container.appendChild(overlay);
    }
  }

  hideSavingOverlay(container) {
    const overlay = document.getElementById('saving-overlay');
    if (overlay) overlay.remove();
  }

  // ========== LOADING DOTS ==========
  createLoadingDots() {
    const dots = document.createElement('div');
    dots.className = 'loading-dots';
    dots.innerHTML = '<span></span><span></span><span></span>';
    return dots;
  }

  // ========== FETCH WITH LOADING ==========
  async fetchWithLoading(url, options = {}, loadingMessage = 'Loading...') {
    this.startProgress();
    
    try {
      const response = await fetch(url, options);
      this.completeProgress();
      return response;
    } catch (error) {
      this.completeProgress();
      throw error;
    }
  }

  // ========== FORM SUBMISSION WITH LOADING ==========
  async submitFormWithLoading(form, submitFunction, successMessage = 'Saved successfully!') {
    const submitBtn = form.querySelector('button[type="submit"]');
    const loader = this.addButtonLoader(submitBtn);

    try {
      const result = await submitFunction();
      this.showSuccess(successMessage);
      return result;
    } catch (error) {
      console.error('Form submission error:', error);
      this.showSuccess('Error occurred!', 3000);
      throw error;
    } finally {
      loader.stop();
    }
  }
}

// Initialize global loader
const dutabaraneLoader = new DutabaraneLoader();

// Auto-hide page loader when page loads
window.addEventListener('load', () => {
  setTimeout(() => {
    dutabaraneLoader.hidePageLoader();
  }, 500);
});
