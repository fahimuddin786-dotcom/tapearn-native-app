// YouTube API Configuration
const YOUTUBE_API_KEY = 'AIzaSyBATxf5D7ZDeiQ61dbEdzEd4Tq72N713Y8';

// App State Management
let isMining = false;
let miningSeconds = 0;
let miningInterval = null;
let userPoints = 0;
let watchedVideos = 0;
let referrals = 0;

// ✅ NATIVE APP PAGE MANAGEMENT
let currentPage = 'mining'; // ✅ CHANGED: Default page is now mining

// Page Management Functions
function showPage(pageName) {
    currentPage = pageName;
    
    // Update active nav button
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    
    // Load page content
    const contentArea = document.getElementById('currentPage');
    
    switch(pageName) {
        case 'home':
            contentArea.innerHTML = getHomePage();
            break;
        case 'videos':
            contentArea.innerHTML = getVideosPage();
            break;
        case 'mining':
            contentArea.innerHTML = getMiningPage();
            break;
        case 'tasks':
            contentArea.innerHTML = getTasksPage();
            break;
        case 'referral':
            contentArea.innerHTML = getReferralPage();
            break;
        case 'wallet':
            contentArea.innerHTML = getWalletPage();
            break;
        case 'leaderboard':
            contentArea.innerHTML = getLeaderboardPage();
            break;
        case 'support':
            contentArea.innerHTML = getSupportPage();
            break;
        default:
            contentArea.innerHTML = getMiningPage(); // ✅ CHANGED: Default to mining page
    }
    
    // Update Telegram Back Button
    updateTelegramBackButton();
}

// ✅ PAGE 1: Mining (Pure Mining Features Only)
function getMiningPage() {
    const userLevel = userPoints >= 10000 ? 'Diamond' : 
                     userPoints >= 5000 ? 'Platinum' : 
                     userPoints >= 2000 ? 'Gold' : 
                     userPoints >= 1000 ? 'Silver' : 'Bronze';
    
    const miningEfficiency = userPoints >= 10000 ? '150%' : 
                           userPoints >= 5000 ? '125%' : 
                           userPoints >= 2000 ? '110%' : 
                           userPoints >= 1000 ? '105%' : '100%';
    
    const pointsPerMinute = userPoints >= 10000 ? 8 : 
                           userPoints >= 5000 ? 7 : 
                           userPoints >= 2000 ? 6 : 
                           userPoints >= 1000 ? 5 : 5;
    
    return `
        <div class="page mining-page">
            <!-- Mining Stats Overview -->
            <div class="mining-stats-overview">
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-value">${formatNumber(userPoints)}</div>
                        <div class="stat-label">Total Points</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${Math.floor(miningSeconds / 3600)}h</div>
                        <div class="stat-label">Mining Time</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${miningEfficiency}</div>
                        <div class="stat-label">Efficiency</div>
                    </div>
                </div>
            </div>

            <!-- Main Mining Card -->
            <div class="mining-main-card ${isMining ? 'mining-active' : ''}" onclick="toggleMining()">
                <div class="mining-main-icon">⛏️</div>
                <div class="mining-main-title">Points Mining</div>
                <div class="mining-main-desc" id="miningStatusText">
                    ${isMining ? 'Mining Active - ' + pointsPerMinute + ' pts/min' : 'Click to start mining'}
                </div>
                <div class="mining-main-stats">
                    <div class="mining-main-stat">
                        <span class="mining-main-value" id="miningTime">${formatTime(miningSeconds)}</span>
                        <span class="mining-main-label">Session Time</span>
                    </div>
                    <div class="mining-main-stat">
                        <span class="mining-main-value" id="miningRate">${pointsPerMinute * 60}/hr</span>
                        <span class="mining-main-label">Earning Rate</span>
                    </div>
                </div>
            </div>

            <!-- Mining Controls -->
            <div class="mining-controls">
                <button class="control-btn ${isMining ? '' : 'primary'}" onclick="toggleMining()">
                    ${isMining ? '⏸️ Pause' : '⛏️ Start Mining'}
                </button>
                <button class="control-btn" onclick="claimBoost()">
                    🚀 Boost
                </button>
            </div>

            <!-- Quick Mining Actions -->
            <div class="quick-mining-actions">
                <div class="quick-mining-btn" onclick="upgradeMiningSpeed()">
                    <span class="quick-mining-icon">⚡</span>
                    <span class="quick-mining-text">Upgrade Speed</span>
                </div>
                <div class="quick-mining-btn" onclick="activateTurboMode()">
                    <span class="quick-mining-icon">🌀</span>
                    <span class="quick-mining-text">Turbo Mode</span>
                </div>
                <div class="quick-mining-btn" onclick="showMiningStats()">
                    <span class="quick-mining-icon">📊</span>
                    <span class="quick-mining-text">Statistics</span>
                </div>
                <div class="quick-mining-btn" onclick="collectDailyBonus()">
                    <span class="quick-mining-icon">🎁</span>
                    <span class="quick-mining-text">Daily Bonus</span>
                </div>
            </div>

            <!-- Mining Progress -->
            <div class="mining-progress">
                <div class="progress-header">
                    <span class="progress-title">Next Level Progress</span>
                    <span class="progress-percent">${calculateLevelProgress()}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${calculateLevelProgress()}%"></div>
                </div>
                <div class="progress-text">
                    ${calculateNextLevelPoints()} points to ${getNextLevel()}
                </div>
            </div>

            <!-- Level Badges -->
            <div class="level-badges">
                <div class="level-badge ${userLevel === 'Bronze' ? 'active' : ''}">
                    <div class="level-icon">🥉</div>
                    <div class="level-name">Bronze</div>
                </div>
                <div class="level-badge ${userLevel === 'Silver' ? 'active' : ''}">
                    <div class="level-icon">🥈</div>
                    <div class="level-name">Silver</div>
                </div>
                <div class="level-badge ${userLevel === 'Gold' ? 'active' : ''}">
                    <div class="level-icon">🥇</div>
                    <div class="level-name">Gold</div>
                </div>
                <div class="level-badge ${userLevel === 'Platinum' ? 'active' : ''}">
                    <div class="level-icon">💎</div>
                    <div class="level-name">Platinum</div>
                </div>
                <div class="level-badge ${userLevel === 'Diamond' ? 'active' : ''}">
                    <div class="level-icon">👑</div>
                    <div class="level-name">Diamond</div>
                </div>
            </div>

            <!-- Mining Details -->
            <div class="mining-details">
                <h4>📊 Mining Statistics</h4>
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-value">${Math.floor(miningSeconds / 3600)}h</div>
                        <div class="stat-label">Total Time</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${Math.floor(miningSeconds / 60) * 5}</div>
                        <div class="stat-label">Mined Points</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${Math.floor(miningSeconds / 3600) * 50}</div>
                        <div class="stat-label">Hourly Bonus</div>
                    </div>
                </div>
            </div>

            <!-- Boost Section -->
            <div class="boost-section">
                <div class="boost-header">
                    <span class="boost-title">Mining Boost</span>
                    <span class="boost-progress">${getBoostProgress()}</span>
                </div>
                <div class="boost-bar">
                    <div class="boost-fill" style="width: ${getBoostPercentage()}%"></div>
                </div>
                <button class="boost-btn" onclick="claimBoost()">
                    🚀 Claim Mining Boost
                </button>
            </div>
        </div>
    `;
}

// ✅ PAGE 2: Videos
function getVideosPage() {
    return `
        <div class="page videos-page">
            <div class="section-header">
                <button onclick="showPage('mining')" class="back-btn">← Back</button>
                <h3>🎬 Watch & Earn</h3>
            </div>
            
            <div class="video-platform-tabs">
                <button class="platform-tab active" onclick="showYouTubeTab()">YouTube</button>
                <button class="platform-tab" onclick="showInstagramTab()">Instagram</button>
            </div>
            
            <div class="search-container">
                <input type="text" id="youtubeSearchInput" placeholder="Search YouTube Shorts..." value="trending shorts">
                <button onclick="searchYouTubeVideos()">🔍 Search</button>
            </div>
            
            <div id="videoResultsContainer">
                <div class="loading">
                    <div class="spinner"></div>
                    <p>Loading videos...</p>
                </div>
            </div>
        </div>
    `;
}

// ✅ PAGE 3: Tasks
function getTasksPage() {
    return `
        <div class="page tasks-page">
            <div class="section-header">
                <button onclick="showPage('mining')" class="back-btn">← Back</button>
                <h3>📋 Daily Tasks</h3>
            </div>
            
            <div class="tasks-list">
                <div class="task-item">
                    <div class="task-info">
                        <div class="task-title">Watch 5 videos</div>
                        <div class="task-reward">+25 pts</div>
                    </div>
                    <button onclick="completeTask('videos')" class="task-btn">Complete</button>
                </div>
                
                <div class="task-item">
                    <div class="task-info">
                        <div class="task-title">Refer 1 friend</div>
                        <div class="task-reward">+50 pts</div>
                    </div>
                    <button onclick="completeTask('referral')" class="task-btn">Complete</button>
                </div>
                
                <div class="task-item">
                    <div class="task-info">
                        <div class="task-title">Mine for 1 hour</div>
                        <div class="task-reward">+50 pts</div>
                    </div>
                    <button onclick="completeTask('mining')" class="task-btn">Complete</button>
                </div>
            </div>
        </div>
    `;
}

// ✅ PAGE 4: Referral
function getReferralPage() {
    const totalEarned = referralData.referredUsers.reduce((sum, user) => sum + user.pointsEarned, 0);
    const pendingCount = referralData.pendingReferrals.length;
    
    return `
        <div class="page referral-page">
            <div class="section-header">
                <button onclick="showPage('mining')" class="back-btn">← Back</button>
                <h3>👥 Refer & Earn</h3>
            </div>
            
            <div class="referral-card">
                <div class="referral-code">${referralData.referralCode}</div>
                <p class="referral-note">Your unique referral code</p>
                
                <div class="referral-stats">
                    <div class="referral-stat">
                        <span class="stat-value">${referralData.referredUsers.length}</span>
                        <span class="stat-label">Confirmed</span>
                    </div>
                    <div class="referral-stat">
                        <span class="stat-value">${pendingCount}</span>
                        <span class="stat-label">Pending</span>
                    </div>
                    <div class="referral-stat">
                        <span class="stat-value">${totalEarned}</span>
                        <span class="stat-label">Earned</span>
                    </div>
                </div>
                
                <div class="sharing-options">
                    <button class="share-btn telegram" onclick="shareOnTelegramWithDeepLink()">
                        📱 Share
                    </button>
                    <button class="share-btn copy" onclick="copyReferralWithDeepLink()">
                        📋 Copy Link
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ✅ PAGE 5: Wallet
function getWalletPage() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayEarnings = transactionHistory
        .filter(t => new Date(t.timestamp) >= today && t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
    
    const allTimeEarnings = transactionHistory
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
        
    return `
        <div class="page wallet-page">
            <div class="section-header">
                <button onclick="showPage('mining')" class="back-btn">← Back</button>
                <h3>💰 Wallet Details</h3>
            </div>
            
            <div class="wallet-summary-card">
                <div class="wallet-total">
                    <div class="total-amount">${formatNumber(userPoints)}</div>
                    <div class="total-label">Total Points</div>
                </div>
                
                <div class="wallet-earnings-breakdown">
                    <div class="earning-item">
                        <div class="earning-icon">📅</div>
                        <div class="earning-info">
                            <div class="earning-title">Today's Earnings</div>
                            <div class="earning-amount positive">+${todayEarnings}</div>
                        </div>
                    </div>
                    
                    <div class="earning-item">
                        <div class="earning-icon">⏳</div>
                        <div class="earning-info">
                            <div class="earning-title">All Time Earnings</div>
                            <div class="earning-amount positive">+${allTimeEarnings}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="wallet-actions">
                <button class="wallet-action-btn" onclick="showWalletHistory()">
                    <span class="action-icon">📊</span>
                    <span class="action-text">Transaction History</span>
                </button>
                
                <button class="wallet-action-btn" onclick="showCashier()">
                    <span class="action-icon">💰</span>
                    <span class="action-text">Redeem Rewards</span>
                </button>
            </div>
        </div>
    `;
}

// Helper Functions for Mining
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function calculateLevelProgress() {
    if (userPoints < 1000) return Math.floor((userPoints / 1000) * 100);
    if (userPoints < 2000) return Math.floor(((userPoints - 1000) / 1000) * 100);
    if (userPoints < 5000) return Math.floor(((userPoints - 2000) / 3000) * 100);
    if (userPoints < 10000) return Math.floor(((userPoints - 5000) / 5000) * 100);
    return 100;
}

function calculateNextLevelPoints() {
    if (userPoints < 1000) return 1000 - userPoints;
    if (userPoints < 2000) return 2000 - userPoints;
    if (userPoints < 5000) return 5000 - userPoints;
    if (userPoints < 10000) return 10000 - userPoints;
    return 0;
}

function getNextLevel() {
    if (userPoints < 1000) return 'Silver';
    if (userPoints < 2000) return 'Gold';
    if (userPoints < 5000) return 'Platinum';
    if (userPoints < 10000) return 'Diamond';
    return 'Max Level';
}

function getBoostProgress() {
    const current = miningSeconds % 3600;
    return `${Math.floor(current / 60)}/60 min`;
}

function getBoostPercentage() {
    const current = miningSeconds % 3600;
    return (current / 3600) * 100;
}

// Mining Functions
function toggleMining() {
    if (isMining) {
        stopMining();
    } else {
        startMining();
    }
}

function startMining() {
    if (isMining) return;
    
    isMining = true;
    
    if (miningInterval) {
        clearInterval(miningInterval);
        miningInterval = null;
    }
    
    let lastMinuteCheck = Math.floor(miningSeconds / 60);
    let lastHourCheck = Math.floor(miningSeconds / 3600);
    
    miningInterval = setInterval(() => {
        miningSeconds++;
        
        // Update mining page UI
        updateMiningUI();
        
        const currentMinute = Math.floor(miningSeconds / 60);
        const currentHour = Math.floor(miningSeconds / 3600);
        
        // Award points every minute
        if (currentMinute > lastMinuteCheck) {
            const pointsPerMinute = userPoints >= 10000 ? 8 : 
                                  userPoints >= 5000 ? 7 : 
                                  userPoints >= 2000 ? 6 : 
                                  userPoints >= 1000 ? 5 : 5;
            
            userPoints += pointsPerMinute;
            addTransaction('mining', pointsPerMinute, 'Mining Points', '⛏️');
            updateUI();
            showNotification(`⛏️ +${pointsPerMinute} Points from Mining!`, 'success');
            lastMinuteCheck = currentMinute;
        }
        
        // Hourly bonus
        if (currentHour > lastHourCheck) {
            userPoints += 50;
            addTransaction('bonus', 50, 'Hourly Mining Bonus', '🎉');
            updateUI();
            showNotification('🎉 +50 Bonus Points! 1 Hour Complete!', 'success');
            lastHourCheck = currentHour;
        }
        
        saveAppState();
        
    }, 1000);
    
    showNotification('⛏️ Mining Started! Earning points...', 'success');
    saveAppState();
}

function stopMining() {
    if (!isMining) return;
    
    isMining = false;
    
    if (miningInterval) {
        clearInterval(miningInterval);
        miningInterval = null;
    }
    
    showNotification('⏹️ Mining Stopped. Points saved!', 'info');
    saveAppState();
}

function updateMiningUI() {
    if (currentPage === 'mining') {
        showPage('mining');
    }
}

function claimBoost() {
    userPoints += 100;
    addTransaction('boost', 100, 'Mining Boost', '🚀');
    saveAppState();
    updateUI();
    showNotification('🚀 +100 Points! Mining boost claimed!', 'success');
}

function upgradeMiningSpeed() {
    if (userPoints >= 500) {
        userPoints -= 500;
        addTransaction('upgrade', -500, 'Mining Speed Upgrade', '⚡');
        saveAppState();
        updateUI();
        showNotification('⚡ Mining speed upgraded!', 'success');
    } else {
        showNotification('❌ Not enough points! Need 500 points.', 'warning');
    }
}

function activateTurboMode() {
    if (userPoints >= 200) {
        userPoints -= 200;
        addTransaction('turbo', -200, 'Turbo Mode Activated', '🌀');
        
        // Simulate turbo mode - double points for 5 minutes
        showNotification('🌀 Turbo Mode Activated! 2x points for 5 minutes!', 'success');
        
        setTimeout(() => {
            showNotification('🌀 Turbo Mode Ended', 'info');
        }, 300000);
        
        saveAppState();
        updateUI();
    } else {
        showNotification('❌ Not enough points! Need 200 points.', 'warning');
    }
}

function showMiningStats() {
    const totalMined = Math.floor(miningSeconds / 60) * 5;
    const hourlyBonuses = Math.floor(miningSeconds / 3600) * 50;
    
    showNotification(`📊 Mining Stats:\nTotal Mined: ${totalMined} points\nHourly Bonuses: ${hourlyBonuses} points\nTotal Time: ${Math.floor(miningSeconds / 3600)}h ${Math.floor((miningSeconds % 3600) / 60)}m`, 'info');
}

function collectDailyBonus() {
    userPoints += 50;
    addTransaction('daily_bonus', 50, 'Daily Mining Bonus', '🎁');
    saveAppState();
    updateUI();
    showNotification('🎁 +50 Points! Daily bonus collected!', 'success');
}

// ✅ Telegram Back Button Integration
function updateTelegramBackButton() {
    if (window.Telegram && window.Telegram.WebApp) {
        if (currentPage !== 'mining') {
            Telegram.WebApp.BackButton.show();
        } else {
            Telegram.WebApp.BackButton.hide();
        }
    }
}

// Telegram Back Button Handler
if (window.Telegram && window.Telegram.WebApp) {
    Telegram.WebApp.BackButton.onClick(() => {
        showPage('mining');
    });
}

// ✅ ENHANCED: Safe storage with size limits
function safeStorageSet(key, value) {
    try {
        if (typeof value === 'string' && value.length > 100000) {
            console.log('⚠️ Large data detected, truncating:', key);
            value = value.substring(0, 100000);
        }
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.log('❌ Storage error for key:', key, error);
        try {
            localStorage.removeItem(key);
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.log('❌ Failed to save data:', e);
            return false;
        }
    }
}

function safeStorageGet(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.log('❌ Storage read error for key:', key, error);
        return defaultValue;
    }
}

// ==================== ENHANCED DATA PERSISTENCE ====================

function shouldStartFresh() {
    const urlParams = new URLSearchParams(window.location.search);
    const hasClearCache = urlParams.has('clear_cache');
    const hasForceRefresh = urlParams.has('force_refresh');
    
    if (hasClearCache || hasForceRefresh) {
        console.log('🧹 Explicit cache clear requested by user');
        return true;
    }
    
    console.log('💾 PRESERVING ALL USER DATA - No automatic clearing');
    return false;
}

function ensureDataPersistence() {
    const urlParams = new URLSearchParams(window.location.search);
    const currentSessionId = urlParams.get('session');
    const currentUserId = urlParams.get('userid');
    
    console.log('🛡️ Data Persistence Check:', {
        currentSessionId,
        currentUserId,
        storedUserId: userProfile.userId,
        storedSessionId: userProfile.sessionId,
        currentPoints: userPoints
    });
    
    if (userPoints > 0) {
        console.log(`💰 Preserving user points: ${userPoints}`);
    }
    
    if (userProfile && userProfile.userId && userProfile.userId !== 'default_user') {
        console.log('👤 Preserving existing user profile');
        return true;
    }
    
    return false;
}

// Generate session-based storage keys
function getSessionKey(key) {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session') || 'default';
    const userId = urlParams.get('userid') || 'default_user';
    
    return `TAPEARN_${key}_${sessionId}_${userId}`;
}

// Initialize sessions
const sessionKeys = {
    userProfileKey: getSessionKey('userProfile'),
    transactionKey: getSessionKey('transactionHistory'),
    referralKey: getSessionKey('referralData'),
    miningKey: getSessionKey('miningState')
};

// Create fresh user profile
function createFreshUserProfile() {
    const urlParams = new URLSearchParams(window.location.search);
    const tg = window.Telegram?.WebApp;
    const user = tg?.initDataUnsafe?.user;
    
    const freshProfile = {
        telegramUsername: user?.username || '',
        userId: urlParams.get('userid') || generateUserId(),
        joinDate: new Date().toISOString(),
        isPremium: false,
        level: 'Bronze',
        firstName: user?.first_name || '',
        lastName: user?.last_name || '',
        sessionId: urlParams.get('session') || 'default',
        isNewUser: true,
        createdAt: Date.now()
    };
    
    console.log('🆕 Fresh user profile created:', freshProfile);
    return freshProfile;
}

// Create fresh referral data
function createFreshReferralData() {
    const freshReferralData = {
        referralCode: generateReferralCode(),
        referredUsers: [],
        totalEarned: 0,
        pendingReferrals: [],
        sessionId: new URLSearchParams(window.location.search).get('session') || 'default'
    };
    
    console.log('🆕 Fresh referral data created');
    return freshReferralData;
}

// User Profile with Enhanced Session Management
let userProfile = safeStorageGet(sessionKeys.userProfileKey) || createFreshUserProfile();

// Transaction History with Session Management
let transactionHistory = safeStorageGet(sessionKeys.transactionKey) || [
    { type: 'welcome', amount: 25, description: 'Welcome Bonus', timestamp: Date.now(), icon: '🎁' }
];

// Referral System with Session Management
let referralData = safeStorageGet(sessionKeys.referralKey) || createFreshReferralData();

// Generate Unique User ID
function generateUserId() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session') || 'default';
    return 'USER_' + sessionId + '_' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Generate Referral Code based on Session
function generateReferralCode() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session') || 'default';
    
    if (userProfile.telegramUsername) {
        return 'TAPEARN_' + userProfile.telegramUsername.toUpperCase() + '_' + sessionId + '_' + Date.now();
    } else {
        return 'TAPEARN_' + userProfile.userId + '_' + sessionId + '_' + Date.now();
    }
}

// Enhanced Load App State from Session Storage
function loadAppState() {
    const savedState = safeStorageGet(sessionKeys.miningKey);
    console.log('🔄 Loading app state from:', sessionKeys.miningKey);
    
    if (savedState) {
        try {
            const state = savedState;
            isMining = state.isMining || false;
            miningSeconds = state.miningSeconds || 0;
            userPoints = state.userPoints || 0;
            watchedVideos = state.watchedVideos || 0;
            referrals = state.referrals || 0;
            
            console.log('✅ App state loaded successfully:', {
                userPoints: userPoints,
                watchedVideos: watchedVideos,
                referrals: referrals,
                isMining: isMining
            });
            
            if (isMining) {
                startMining();
            }
        } catch (error) {
            console.error('❌ Error loading app state:', error);
            userPoints = 0;
            watchedVideos = 0;
            referrals = 0;
        }
    } else {
        console.log('📭 No saved state found, starting fresh');
        userPoints = 0;
        watchedVideos = 0;
        referrals = 0;
    }
    
    referrals = referralData.referredUsers.length;
    
    console.log('🎯 Final loaded state:', {
        userPoints: userPoints,
        watchedVideos: watchedVideos,
        referrals: referrals
    });
}

// Enhanced Save App State to Session Storage
function saveAppState() {
    const miningState = {
        isMining: isMining,
        miningSeconds: miningSeconds,
        userPoints: userPoints,
        watchedVideos: watchedVideos,
        referrals: referrals,
        lastUpdated: Date.now(),
        sessionId: new URLSearchParams(window.location.search).get('session') || 'default'
    };
    
    safeStorageSet(sessionKeys.miningKey, miningState);
    console.log('💾 App state saved:', miningState);
}

// Enhanced Add Transaction to History
function addTransaction(type, amount, description, icon) {
    const transaction = {
        type: type,
        amount: amount,
        description: description,
        timestamp: Date.now(),
        icon: icon,
        sessionId: new URLSearchParams(window.location.search).get('session') || 'default'
    };
    
    transactionHistory.unshift(transaction);
    
    if (transactionHistory.length > 50) {
        transactionHistory = transactionHistory.slice(0, 50);
    }
    
    safeStorageSet(sessionKeys.transactionKey, transactionHistory);
}

// Update UI
function updateUI() {
    document.getElementById('walletPoints').textContent = formatNumber(userPoints);
    
    const userLevel = userPoints >= 10000 ? 'Diamond' : 
                     userPoints >= 5000 ? 'Platinum' : 
                     userPoints >= 2000 ? 'Gold' : 
                     userPoints >= 1000 ? 'Silver' : 'Bronze';
    
    document.getElementById('userLevel').textContent = userLevel;
    document.getElementById('miningStats').textContent = isMining ? 'Mining Active' : 'Ready to mine';
    
    if (currentPage === 'mining') {
        updateMiningUI();
    }
}

// Format numbers with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Complete Task
function completeTask(task) {
    let points = 0;
    let description = '';
    let icon = '';
    
    switch(task) {
        case 'videos':
            points = 25;
            description = 'Daily Task: Watch Videos';
            icon = '📋';
            break;
        case 'referral':
            points = 50;
            description = 'Daily Task: Refer Friend';
            icon = '👥';
            break;
        case 'mining':
            points = 50;
            description = 'Daily Task: Mining';
            icon = '⛏️';
            break;
    }
    
    userPoints += points;
    addTransaction('task', points, description, icon);
    saveAppState();
    updateUI();
    showNotification(`✅ +${points} Points! Task completed!`, 'success');
}

// Share with Telegram Deep Link
function shareOnTelegramWithDeepLink() {
    const referralLink = `https://t.me/tapearn_bot?start=ref${userProfile.userId}`;
    const message = `Join TapEarn and earn free points! Use my referral code: ${referralData.referralCode}\n\nGet your bonus: ${referralLink}`;
    
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(message)}`;
    window.open(shareUrl, '_blank');
    showNotification('✅ Telegram sharing opened! Share with your friends.', 'success');
}

// Copy referral link with deep link
function copyReferralWithDeepLink() {
    const referralLink = `https://t.me/tapearn_bot?start=ref${userProfile.userId}`;
    const referralText = `Join TapEarn using my referral! \nCode: ${referralData.referralCode}\nLink: ${referralLink}\n\nGet 25 bonus points when you join!`;
    
    navigator.clipboard.writeText(referralText)
        .then(() => showNotification('✅ Referral link copied! Share with friends.', 'success'))
        .catch(() => showNotification('❌ Failed to copy', 'warning'));
}

// Show Wallet History
function showWalletHistory() {
    document.getElementById('currentPage').innerHTML = `
        <div class="wallet-history">
            <div class="section-header">
                <button onclick="showPage('wallet')" class="back-btn">← Back</button>
                <h3>💰 Wallet History</h3>
            </div>
            
            <div class="wallet-summary">
                <div class="wallet-balance">${formatNumber(userPoints)}</div>
                <div class="wallet-label">Total Points</div>
            </div>
            
            <div class="transaction-list">
                ${transactionHistory.length > 0 ? 
                    transactionHistory.map(transaction => `
                        <div class="transaction-item">
                            <div class="transaction-icon">${transaction.icon}</div>
                            <div class="transaction-details">
                                <div class="transaction-title">${transaction.description}</div>
                                <div class="transaction-time">${new Date(transaction.timestamp).toLocaleString()}</div>
                            </div>
                            <div class="transaction-amount ${transaction.amount > 0 ? 'positive' : 'negative'}">
                                ${transaction.amount > 0 ? '+' : ''}${transaction.amount}
                            </div>
                        </div>
                    `).join('') 
                    : 
                    '<div class="no-transactions">No transactions yet</div>'
                }
            </div>
        </div>
    `;
}

// Show Cashier
function showCashier() {
    document.getElementById('currentPage').innerHTML = `
        <div class="cashier-section">
            <div class="section-header">
                <button onclick="showPage('wallet')" class="back-btn">← Back</button>
                <h3>💰 Rewards</h3>
            </div>
            
            <div class="rewards-list">
                <div class="reward-item">
                    <div class="reward-info">
                        <div class="reward-title">Amazon Gift Card</div>
                        <div class="reward-cost">1000 pts</div>
                    </div>
                    <button onclick="redeemReward('amazon')" class="reward-btn">Redeem</button>
                </div>
                
                <div class="reward-item">
                    <div class="reward-info">
                        <div class="reward-title">PayPal Cash</div>
                        <div class="reward-cost">5000 pts</div>
                    </div>
                    <button onclick="redeemReward('paypal')" class="reward-btn">Redeem</button>
                </div>
                
                <div class="reward-item">
                    <div class="reward-info">
                        <div class="reward-title">Google Play Card</div>
                        <div class="reward-cost">2000 pts</div>
                    </div>
                    <button onclick="redeemReward('google')" class="reward-btn">Redeem</button>
                </div>
            </div>
        </div>
    `;
}

// Redeem Reward
function redeemReward(reward) {
    let cost = 0;
    switch(reward) {
        case 'amazon': cost = 1000; break;
        case 'paypal': cost = 5000; break;
        case 'google': cost = 2000; break;
    }
    
    if (userPoints >= cost) {
        userPoints -= cost;
        addTransaction('redeem', -cost, 'Redeemed: ' + reward.toUpperCase(), '🎁');
        saveAppState();
        updateUI();
        showNotification(`🎉 ${reward.toUpperCase()} gift card redeemed!`, 'success');
    } else {
        showNotification(`❌ Not enough points! Need ${cost} points.`, 'warning');
    }
}

// Video Functions
function showYouTubeTab() {
    document.querySelectorAll('.platform-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    document.getElementById('videoResultsContainer').innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Loading YouTube videos...</p>
        </div>
    `;
    // Simulate video loading
    setTimeout(() => {
        document.getElementById('videoResultsContainer').innerHTML = `
            <div class="videos-grid">
                <div class="video-card youtube-card" onclick="earnVideoPoints(10, 'YouTube Short')">
                    <div class="thumbnail">
                        <img src="https://via.placeholder.com/300/FF6B6B/FFFFFF?text=Music+Short" alt="Music Short">
                        <div class="points-badge">+10 pts</div>
                        <div class="youtube-badge">YouTube</div>
                    </div>
                    <div class="video-details">
                        <h4 class="video-title">🎵 Trending Music Short 2024</h4>
                        <div class="video-meta">
                            <span class="channel">Music Channel</span>
                            <span class="watch-now">▶️ Watch</span>
                        </div>
                    </div>
                </div>
                
                <div class="video-card youtube-card" onclick="earnVideoPoints(12, 'Comedy Short')">
                    <div class="thumbnail">
                        <img src="https://via.placeholder.com/300/4ECDC4/FFFFFF?text=Comedy+Short" alt="Comedy Short">
                        <div class="points-badge">+12 pts</div>
                        <div class="youtube-badge">YouTube</div>
                    </div>
                    <div class="video-details">
                        <h4 class="video-title">😂 Funny Comedy Skit</h4>
                        <div class="video-meta">
                            <span class="channel">Comedy Central</span>
                            <span class="watch-now">▶️ Watch</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }, 1500);
}

function showInstagramTab() {
    document.querySelectorAll('.platform-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    document.getElementById('videoResultsContainer').innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Loading Instagram videos...</p>
        </div>
    `;
    // Simulate video loading
    setTimeout(() => {
        document.getElementById('videoResultsContainer').innerHTML = `
            <div class="videos-grid">
                <div class="video-card instagram-card" onclick="earnVideoPoints(15, 'Instagram Reel')">
                    <div class="thumbnail">
                        <img src="https://via.placeholder.com/300/FFD166/FFFFFF?text=Instagram+Reel" alt="Instagram Reel">
                        <div class="points-badge">+15 pts</div>
                        <div class="instagram-badge">Reel</div>
                    </div>
                    <div class="video-details">
                        <h4 class="video-title">💃 Trending Dance Reel</h4>
                        <div class="video-meta">
                            <span class="channel">@dance.king</span>
                            <span class="watch-now">▶️ Watch</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }, 1500);
}

function earnVideoPoints(points, platform) {
    userPoints += points;
    watchedVideos++;
    addTransaction('video', points, `${platform} Watch`, '🎬');
    saveAppState();
    updateUI();
    showNotification(`✅ +${points} Points! ${platform} watched successfully!`, 'success');
}

function searchYouTubeVideos() {
    document.getElementById('videoResultsContainer').innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Searching YouTube videos...</p>
        </div>
    `;
    
    setTimeout(() => {
        showYouTubeTab();
    }, 1000);
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 4000);
}

// Enhanced Telegram Mini App Integration
function initializeTelegramIntegration() {
    if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        
        tg.expand();
        
        const user = tg.initDataUnsafe.user;
        if (user) {
            const urlParams = new URLSearchParams(window.location.search);
            const isFresh = urlParams.has('fresh') || !userProfile.telegramUsername;
            
            if (isFresh) {
                userProfile = createFreshUserProfile();
                referralData = createFreshReferralData();
                
                console.log('✅ Fresh Telegram user detected:', userProfile);
            }
            
            safeStorageSet(sessionKeys.userProfileKey, userProfile);
            safeStorageSet(sessionKeys.referralKey, referralData);
        }
        
        document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#1a1a2e');
        document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#ffffff');
        document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#4CAF50');
        
    } else {
        console.log('🚧 Development mode - Telegram Web App not detected');
        // Simulate environment
        const urlParams = new URLSearchParams(window.location.search);
        const isFresh = urlParams.has('fresh') || !userProfile.telegramUsername;
        
        if (isFresh) {
            userProfile = createFreshUserProfile();
            referralData = createFreshReferralData();
            safeStorageSet(sessionKeys.userProfileKey, userProfile);
            safeStorageSet(sessionKeys.referralKey, referralData);
        }
    }
}

// Enhanced Check for referral on app start
function checkReferralOnStart() {
    const urlParams = new URLSearchParams(window.location.search);
    const referralCode = urlParams.get('ref');
    const sessionId = urlParams.get('session') || 'default';
    
    const referralProcessedKey = `referralProcessed_${sessionId}`;
    
    if (referralCode && !localStorage.getItem(referralProcessedKey)) {
        processReferralJoin(referralCode);
        localStorage.setItem(referralProcessedKey, 'true');
    }
}

// Enhanced Process referral when new user joins
function processReferralJoin(referralCode) {
    if (referralCode === referralData.referralCode) {
        console.log('❌ Self-referral detected');
        return;
    }
    
    const referrerUsername = referralCode.replace('TAPEARN_', '').split('_')[0].toLowerCase();
    
    referralData.pendingReferrals.push({
        code: referralCode,
        referrer: referrerUsername,
        timestamp: Date.now(),
        status: 'pending'
    });
    
    safeStorageSet(sessionKeys.referralKey, referralData);
    
    userPoints += 25;
    addTransaction('referral_bonus', 25, 'Welcome Bonus - Referred by ' + referrerUsername, '🎁');
    saveAppState();
    
    showNotification(`🎉 +25 Welcome Bonus! You were referred by ${referrerUsername}`, 'success');
    updateUI();
    
    console.log('✅ Referral processed for:', referrerUsername);
}

// Check if this is a referred new user
function checkNewUserReferral() {
    const urlParams = new URLSearchParams(window.location.search);
    const isNewUser = urlParams.get('newuser') === 'true';
    const referralCode = urlParams.get('ref');
    
    if (isNewUser && referralCode && userProfile.isNewUser) {
        userPoints += 25;
        userProfile.isNewUser = false;
        addTransaction('welcome_bonus', 25, 'Welcome Bonus - Referred User', '🎁');
        saveAppState();
        showNotification('🎉 +25 Welcome Bonus! You were referred by a friend!', 'success');
        updateUI();
        
        safeStorageSet(sessionKeys.userProfileKey, userProfile);
        
        console.log('✅ New referred user bonus awarded');
    }
}

// ✅ ENHANCED: Initialize with data persistence and native app
document.addEventListener('DOMContentLoaded', function() {
    console.log('🆕 Initializing MINING FOCUSED APP...');
    
    // ✅ Check data persistence first
    ensureDataPersistence();
    
    initializeTelegramIntegration();
    loadAppState();
    checkReferralOnStart();
    checkNewUserReferral();
    updateUI();
    
    // Set initial page to mining (main page)
    showPage('mining');
    
    console.log('🎯 Mining Focused App Initialized');
    console.log('💰 Current Points:', userPoints);
    console.log('👤 User ID:', userProfile.userId);
    console.log('🔐 Session:', userProfile.sessionId);
});
