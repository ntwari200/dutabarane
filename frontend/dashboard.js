// ============================================
// DUTABARANE DASHBOARD - COMPLETE FUNCTIONALITY
// Tornado Software Solutions
// ============================================

// ============================================
// SESSION MANAGEMENT (Your existing code + enhancements)
// ============================================
const username = localStorage.getItem("username");
const isLoggedIn = localStorage.getItem("loggedIn");

if (!isLoggedIn) {
    window.location.href = "index.html";
}

// Display username
const usernameDisplay = document.getElementById("usernameDisplay");
if (usernameDisplay) {
    usernameDisplay.textContent = username || "Admin";
}

// Logout function (enhanced)
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem("loggedIn");
        localStorage.removeItem("username");
        localStorage.removeItem('dutabarane_session');
        localStorage.removeItem('dutabarane_user');
        
        if (window.dutaLoader) {
            window.dutaLoader.showSuccessToast('Logged out successfully!');
        }
        
        setTimeout(() => {
            window.location.href = "index.html";
        }, 500);
    }
}

// ============================================
// API CONFIGURATION
// ============================================
const BASE = "/api/";

// Global variables
let members = [];
let files = [];
let stats = {
    totalMembers: 0,
    totalAmount: 0,
    totalLoan: 0,
    totalInterest: 0
};

// ============================================
// FETCH ALL MEMBERS
// ============================================
async function fetchMembers() {
    try {
        const response = await fetch(BASE + "members");
        if (!response.ok) throw new Error('Failed to fetch members');
        members = await response.json();
        console.log(`📋 Loaded ${members.length} members`);
        return members;
    } catch (error) {
        console.error("Error fetching members:", error);
        return [];
    }
}

// ============================================
// FETCH ALL FILES
// ============================================
async function fetchFiles() {
    try {
        const response = await fetch(BASE + "files");
        if (!response.ok) throw new Error('Failed to fetch files');
        files = await response.json();
        console.log(`📁 Loaded ${files.length} files`);
        return files;
    } catch (error) {
        console.error("Error fetching files:", error);
        return [];
    }
}

// ============================================
// FETCH FILE DATA BY ID
// ============================================
async function fetchFileData(fileId) {
    try {
        const response = await fetch(BASE + "files/" + fileId);
        if (!response.ok) throw new Error(`Failed to fetch file ${fileId}`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching file ${fileId}:`, error);
        return {};
    }
}

// ============================================
// CALCULATE TOTALS FROM ALL FILES
// ============================================
async function calculateTotals() {
    let totalAmount = 0;
    let totalLoan = 0;
    let totalInterest = 0;
    
    for (const file of files) {
        const fileData = await fetchFileData(file.id);
        
        for (const memberId in fileData) {
            const data = fileData[memberId];
            totalAmount += parseFloat(data.amount) || 0;
            totalLoan += parseFloat(data.loan) || 0;
            totalInterest += parseFloat(data.interest) || 0;
        }
    }
    
    stats.totalAmount = totalAmount;
    stats.totalLoan = totalLoan;
    stats.totalInterest = totalInterest;
    stats.totalMembers = members.length;
    
    console.log(`💰 Totals: Amount=${totalAmount.toLocaleString()}, Loan=${totalLoan.toLocaleString()}, Interest=${totalInterest.toLocaleString()}`);
    return stats;
}

// ============================================
// UPDATE DASHBOARD DISPLAY
// ============================================
function updateDashboardDisplay() {
    const totalMembersEl = document.getElementById('totalMembers');
    const totalAmountEl = document.getElementById('totalAmount');
    const totalLoanEl = document.getElementById('totalLoan');
    const totalInterestEl = document.getElementById('totalInterest');
    
    if (totalMembersEl) {
        totalMembersEl.innerHTML = stats.totalMembers.toLocaleString();
    }
    
    if (totalAmountEl) {
        totalAmountEl.innerHTML = stats.totalAmount.toLocaleString();
    }
    
    if (totalLoanEl) {
        totalLoanEl.innerHTML = stats.totalLoan.toLocaleString();
    }
    
    if (totalInterestEl) {
        totalInterestEl.innerHTML = stats.totalInterest.toLocaleString();
    }
    
    updateLastUpdated();
}

// ============================================
// UPDATE LAST UPDATED TIME
// ============================================
function updateLastUpdated() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const dateString = now.toLocaleDateString();
    const lastUpdatedEl = document.getElementById('lastUpdated');
    if (lastUpdatedEl) {
        lastUpdatedEl.innerHTML = `Last updated: ${dateString} ${timeString}`;
    }
}

// ============================================
// SHOW LOADING SPINNERS
// ============================================
function showLoadingSpinners() {
    const elements = ['totalMembers', 'totalAmount', 'totalLoan', 'totalInterest'];
    elements.forEach(id => {
        const el = document.getElementById(id);
        if (el && !el.innerHTML.includes('Error')) {
            el.innerHTML = '<span class="stat-loading"></span>';
        }
    });
}

// ============================================
// SHOW ERROR STATE
// ============================================
function showErrorStats() {
    const totalMembersEl = document.getElementById('totalMembers');
    const totalAmountEl = document.getElementById('totalAmount');
    const totalLoanEl = document.getElementById('totalLoan');
    const totalInterestEl = document.getElementById('totalInterest');
    
    if (totalMembersEl && totalMembersEl.innerHTML.includes('stat-loading')) {
        totalMembersEl.innerHTML = '⚠️ Error';
    }
    if (totalAmountEl && totalAmountEl.innerHTML.includes('stat-loading')) {
        totalAmountEl.innerHTML = '⚠️ Error';
    }
    if (totalLoanEl && totalLoanEl.innerHTML.includes('stat-loading')) {
        totalLoanEl.innerHTML = '⚠️ Error';
    }
    if (totalInterestEl && totalInterestEl.innerHTML.includes('stat-loading')) {
        totalInterestEl.innerHTML = '⚠️ Error';
    }
}

// ============================================
// LOAD ALL DASHBOARD DATA
// ============================================
async function loadDashboardData() {
    console.log('📊 Loading dashboard data...');
    
    // Show loading spinners
    showLoadingSpinners();
    
    try {
        // Fetch all data
        await fetchMembers();
        await fetchFiles();
        await calculateTotals();
        
        // Update display
        updateDashboardDisplay();
        
        console.log('✅ Dashboard data loaded successfully');
        return true;
        
    } catch (error) {
        console.error('❌ Failed to load dashboard data:', error);
        showErrorStats();
        
        if (window.dutaLoader) {
            window.dutaLoader.showErrorToast('Failed to load dashboard data');
        }
        return false;
    }
}

// ============================================
// REFRESH DASHBOARD
// ============================================
async function refreshDashboard() {
    console.log('🔄 Refreshing dashboard...');
    
    if (window.dutaLoader) {
        window.dutaLoader.showSuccessToast('Refreshing dashboard...');
    }
    
    await loadDashboardData();
    
    if (window.dutaLoader) {
        window.dutaLoader.showSuccessToast('Dashboard refreshed!');
    }
}

// ============================================
// SETUP EVENT LISTENERS
// ============================================
function setupEventListeners() {
    // Logout button - connect to your logout function
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    // Quick action buttons
    const quickAddMember = document.getElementById('quickAddMember');
    if (quickAddMember) {
        quickAddMember.addEventListener('click', function() {
            if (window.dutaLoader) {
                window.dutaLoader.showSuccessToast('Redirecting to Control Panel...');
            }
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 500);
        });
    }
    
    const quickCreateFile = document.getElementById('quickCreateFile');
    if (quickCreateFile) {
        quickCreateFile.addEventListener('click', function() {
            if (window.dutaLoader) {
                window.dutaLoader.showSuccessToast('Redirecting to Control Panel...');
            }
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 500);
        });
    }
    
    const quickRefresh = document.getElementById('quickRefresh');
    if (quickRefresh) {
        quickRefresh.addEventListener('click', function() {
            refreshDashboard();
        });
    }
    
    const floatingRefresh = document.getElementById('floatingRefresh');
    if (floatingRefresh) {
        floatingRefresh.addEventListener('click', function() {
            refreshDashboard();
        });
    }
}

// ============================================
// AUTO-REFRESH EVERY 30 SECONDS
// ============================================
let autoRefreshInterval;

function startAutoRefresh() {
    if (autoRefreshInterval) clearInterval(autoRefreshInterval);
    autoRefreshInterval = setInterval(() => {
        console.log('🔄 Auto-refreshing dashboard...');
        loadDashboardData();
    }, 30000);
}

// ============================================
// HIDE PAGE LOADER
// ============================================
function hidePageLoader() {
    const pageLoader = document.getElementById('pageLoader');
    if (pageLoader) {
        setTimeout(() => {
            pageLoader.classList.add('hidden');
        }, 500);
    }
}

// ============================================
// INITIALIZE DASHBOARD
// ============================================
async function initDashboard() {
    console.log('🚀 Initializing Dutabarane Dashboard...');
    
    // Setup event listeners
    setupEventListeners();
    
    // Load data
    await loadDashboardData();
    
    // Start auto-refresh
    startAutoRefresh();
    
    // Hide page loader
    hidePageLoader();
    
    console.log('✅ Dashboard ready!');
    console.log('📊 Auto-refresh every 30 seconds');
}

// Start the dashboard when page loads
document.addEventListener('DOMContentLoaded', initDashboard);
