// ============================================
// RESPONSIVE ENHANCEMENTS FOR DUTABARANE
// Mobile Gestures & Interactions
// Tornado Software Solutions
// ============================================

class ResponsiveEnhancements {
    constructor() {
        this.init();
    }

    init() {
        this.detectDevice();
        this.addSwipeGestures();
        this.enhanceTouchFeedback();
        this.addTableScrollIndicators();
        this.optimizeInputsForMobile();
        this.addPullToRefreshPrevention();
        this.enhancePopupGestures();
    }

    // ================= DETECT DEVICE TYPE =================
    detectDevice() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isTablet = /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        
        document.body.setAttribute('data-device', 
            isMobile ? 'mobile' : (isTablet ? 'tablet' : 'desktop')
        );
        
        if (isIOS) {
            document.body.classList.add('ios-device');
        }
        
        console.log(`📱 Device detected: ${document.body.getAttribute('data-device')}`);
        return { isMobile, isTablet, isIOS };
    }

    // ================= ADD SWIPE GESTURES =================
    addSwipeGestures() {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        });

        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            this.handleSwipe(touchStartX, touchEndX, touchStartY, touchEndY);
        });
    }

    handleSwipe(startX, endX, startY, endY) {
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        
        // Swipe right (go back)
        if (deltaX > 100 && Math.abs(deltaY) < 50) {
            this.handleSwipeRight();
        }
        
        // Swipe left
        if (deltaX < -100 && Math.abs(deltaY) < 50) {
            this.handleSwipeLeft();
        }
        
        // Swipe down (close popup)
        if (deltaY > 100 && Math.abs(deltaX) < 50) {
            this.handleSwipeDown();
        }
        
        // Swipe up
        if (deltaY < -100 && Math.abs(deltaX) < 50) {
            this.handleSwipeUp();
        }
    }

    handleSwipeRight() {
        console.log('👈 Swipe right detected');
        // Optional: go back in history
        // if (window.history.length > 1) window.history.back();
    }

    handleSwipeLeft() {
        console.log('👉 Swipe left detected');
        // Optional: go forward
    }

    handleSwipeDown() {
        console.log('👇 Swipe down detected - closing popup');
        // Close any open popup
        const popup = document.querySelector('.popup[style*="display: block"]');
        if (popup && typeof closePopup === 'function') {
            closePopup();
        }
    }

    handleSwipeUp() {
        console.log('👆 Swipe up detected');
    }

    // ================= ENHANCE TOUCH FEEDBACK =================
    enhanceTouchFeedback() {
        const interactiveElements = document.querySelectorAll('button, .action-btn, .file-name, .toggle-icon');
        
        interactiveElements.forEach(el => {
            el.addEventListener('touchstart', () => {
                el.classList.add('touch-active');
            });
            
            el.addEventListener('touchend', () => {
                setTimeout(() => {
                    el.classList.remove('touch-active');
                }, 150);
            });
            
            el.addEventListener('touchcancel', () => {
                el.classList.remove('touch-active');
            });
        });
        
        // Add CSS for touch feedback
        const style = document.createElement('style');
        style.textContent = `
            .touch-active {
                transform: scale(0.95);
                opacity: 0.8;
                transition: all 0.1s ease;
            }
            .file-name.touch-active {
                background: rgba(59, 130, 246, 0.2);
                transform: scale(0.98);
            }
        `;
        document.head.appendChild(style);
    }

    // ================= ADD TABLE SCROLL INDICATORS =================
    addTableScrollIndicators() {
        const tables = document.querySelectorAll('.table-scroll');
        
        tables.forEach(table => {
            const showScrollIndicator = () => {
                if (table.scrollWidth > table.clientWidth) {
                    table.classList.add('has-scroll');
                } else {
                    table.classList.remove('has-scroll');
                }
            };
            
            showScrollIndicator();
            window.addEventListener('resize', showScrollIndicator);
        });
    }

    // ================= OPTIMIZE INPUTS FOR MOBILE =================
    optimizeInputsForMobile() {
        // Prevent zoom on input focus (iOS)
        const inputs = document.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                    setTimeout(() => {
                        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 300);
                }
            });
        });
        
        // Add clear button for inputs (optional)
        inputs.forEach(input => {
            if (input.type === 'text' || input.type === 'password') {
                const wrapper = input.closest('.input-wrapper');
                if (wrapper && !wrapper.querySelector('.clear-input')) {
                    const clearBtn = document.createElement('span');
                    clearBtn.className = 'clear-input';
                    clearBtn.innerHTML = '✕';
                    clearBtn.style.cssText = `
                        position: absolute;
                        right: 45px;
                        top: 50%;
                        transform: translateY(-50%);
                        cursor: pointer;
                        color: #6688aa;
                        font-size: 12px;
                        display: none;
                        padding: 5px;
                    `;
                    
                    input.addEventListener('input', () => {
                        clearBtn.style.display = input.value.length > 0 ? 'block' : 'none';
                    });
                    
                    clearBtn.addEventListener('click', () => {
                        input.value = '';
                        input.focus();
                        clearBtn.style.display = 'none';
                    });
                    
                    wrapper.appendChild(clearBtn);
                }
            }
        });
    }

    // ================= PREVENT PULL-TO-REFRESH =================
    addPullToRefreshPrevention() {
        const popup = document.querySelector('.popup');
        if (popup) {
            popup.addEventListener('touchmove', (e) => {
                const scrollTop = popup.scrollTop;
                const scrollHeight = popup.scrollHeight;
                const height = popup.clientHeight;
                
                if ((scrollTop <= 0 && e.touches[0].clientY > e.touches[0].clientY) ||
                    (scrollTop + height >= scrollHeight && e.touches[0].clientY < e.touches[0].clientY)) {
                    e.preventDefault();
                }
            });
        }
    }

    // ================= ENHANCE POPUP GESTURES =================
    enhancePopupGestures() {
        const popup = document.querySelector('.popup');
        if (!popup) return;
        
        let startY = 0;
        
        popup.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
        });
        
        popup.addEventListener('touchmove', (e) => {
            const currentY = e.touches[0].clientY;
            const deltaY = currentY - startY;
            
            if (deltaY > 50 && popup.scrollTop === 0) {
                e.preventDefault();
                popup.style.transform = `translateY(${deltaY * 0.3}px)`;
            }
        });
        
        popup.addEventListener('touchend', (e) => {
            const endY = e.changedTouches[0].clientY;
            const deltaY = endY - startY;
            
            if (deltaY > 100 && popup.scrollTop === 0) {
                popup.style.transform = '';
                if (typeof closePopup === 'function') {
                    closePopup();
                }
            } else {
                popup.style.transform = '';
            }
        });
    }

    // ================= ADD LOADING INDICATOR FOR MOBILE =================
    showMobileLoader(message = 'Loading...') {
        const loader = document.createElement('div');
        loader.className = 'mobile-loader';
        loader.innerHTML = `
            <div class="mobile-loader-overlay">
                <div class="mobile-loader-spinner"></div>
                <div class="mobile-loader-text">${message}</div>
            </div>
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            .mobile-loader-overlay {
                position: fixed;
                bottom: 20px;
                left: 20px;
                right: 20px;
                background: rgba(5, 12, 24, 0.95);
                backdrop-filter: blur(10px);
                border-radius: 50px;
                padding: 12px 20px;
                display: flex;
                align-items: center;
                gap: 12px;
                z-index: 10001;
                border: 1px solid #3b82f6;
                animation: slideUp 0.3s ease;
            }
            .mobile-loader-spinner {
                width: 20px;
                height: 20px;
                border: 2px solid rgba(59, 130, 246, 0.3);
                border-top: 2px solid #3b82f6;
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
            }
            .mobile-loader-text {
                color: white;
                font-size: 0.9rem;
            }
            @keyframes slideUp {
                from { transform: translateY(100px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(loader);
        
        return {
            hide: () => loader.remove()
        };
    }

    // ================= CHECK CONNECTION STATUS =================
    checkConnection() {
        window.addEventListener('online', () => {
            if (window.dutabaraneLoader) {
                window.dutabaraneLoader.showSuccess('Back online!', 2000);
            }
        });
        
        window.addEventListener('offline', () => {
            if (window.dutabaraneLoader) {
                window.dutabaraneLoader.showError('No internet connection', 3000);
            }
        });
    }
}

// ================= INITIALIZE ON PAGE LOAD =================
const responsiveEnhancer = new ResponsiveEnhancements();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { responsiveEnhancer, ResponsiveEnhancements };
}

console.log('✅ Responsive enhancements loaded!');
console.log('📱 Mobile gestures and touch optimizations active');
