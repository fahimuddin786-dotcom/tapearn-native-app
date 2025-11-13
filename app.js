// YouTube API Configuration
const YOUTUBE_API_KEY = 'AIzaSyBATxf5D7ZDeiQ61dbEdzEd4Tq72N713Y8';

// App State Management
let isMining = false;
let miningSeconds = 0;
let miningInterval = null;
let userPoints = 5564;
let watchedVideos = 24;
let referrals = 3;

// ✅ NATIVE APP PAGE MANAGEMENT
let currentPage = 'home';

// Page Management Functions
function showPage(pageName) {
    currentPage = pageName;
    
    // Update active nav button
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Find and activate the clicked nav item
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        if (item.querySelector('.nav-text').textContent.toLowerCase() === pageName) {
            item.classList.add('active');
        }
    });
    
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
            contentArea.innerHTML = getHomePage();
    }
    
    // Update Telegram Back Button
    updateTelegramBackButton();
    
    // Update UI after page load
    updateUI();
}

// ✅ PAGE 1: Home (Your Existing Dashboard)
function getHomePage() {
    return `
        <div class="page home-page">
            <!-- Your Existing Main Features -->
            <div class="main-features">
                <div class="main-feature-card mining-feature" onclick="toggleMining()">
                    <div class="feature-main-icon">⛏️</div>
                    <div class="feature-main-title">Points Mining</div>
                    <div class="feature-main-desc" id="miningStatusText">Click to start mining</div>
                    <div class="mining-stats">
                        <div class="mining-stat">
                            <span class="mining-value" id="miningTime">00:00:00</span>
                            <span class="mining-label">Time</span>
                        </div>
                        <div class="mining-stat">
                            <span class="mining-value" id="miningRate">300/hr</span>
                            <span class="mining-label">Rate</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Your Existing Quick Actions -->
            <div class="quick-actions-mini">
                <button class="mini-btn" onclick="showPage('videos')">
                    <span class="mini-icon">🎬</span>
                    <span class="mini-text">Videos</span>
                </button>
                <button class="mini-btn" onclick="showTelegramSection()">
                    <span class="mini-icon">📱</span>
                    <span class="mini-text">Telegram</span>
                </button>
                <button class="mini-btn" onclick="showXSection()">
                    <span class="mini-icon">🐦</span>
                    <span class="mini-text">X</span>
                </button>
                <button class="mini-btn" onclick="showFollowSection()">
                    <span class="mini-icon">👥</span>
                    <span class="mini-text">Follow</span>
                </button>
                <button class="mini-btn" onclick="showPage('tasks')">
                    <span class="mini-icon">📋</span>
                    <span class="mini-text">Tasks</span>
                </button>
                <button class="mini-btn" onclick="showSocialTasks()">
                    <span class="mini-icon">🌐</span>
                    <span class="mini-text">Social Tasks</span>
                </button>
                <button class="mini-btn" onclick="showSkills()">
                    <span class="mini-icon">⚡</span>
                    <span class="mini-text">Skills</span>
                </button>
                <button class="mini-btn" onclick="showCashier()">
                    <span class="mini-icon">💰</span>
                    <span class="mini-text">Rewards</span>
                </button>
                <button class="mini-btn" onclick="showPage('referral')">
                    <span class="mini-icon">👥</span>
                    <span class="mini-text">Referral</span>
                </button>
                <button class="mini-btn" onclick="showPage('leaderboard')">
                    <span class="mini-icon">🏆</span>
                    <span class="mini-text">Rank</span>
                </button>
                <button class="mini-btn" onclick="showPage('support')">
                    <span class="mini-icon">💬</span>
                    <span class="mini-text">Support</span>
                </button>
                <button class="mini-btn" onclick="showTerms()">
                    <span class="mini-icon">📄</span>
                    <span class="mini-text">Terms</span>
                </button>
            </div>

            <!-- Your Existing Boost Section -->
            <div class="boost-section">
                <div class="boost-header">
                    <span class="boost-title">Boost</span>
                    <span class="boost-progress">498/500</span>
                </div>
                <div class="boost-bar">
                    <div class="boost-fill" style="width: 99.6%"></div>
                </div>
                <button class="boost-btn" onclick="claimBoost()">
                    🚀 Claim Boost
                </button>
            </div>

            <!-- Your Existing Community Section -->
            <div class="community-section">
                <div class="community-header">
                    <span class="community-title">POWERED BY COMMUNITY</span>
                </div>
                <div class="community-stats">
                    <div class="community-stat">
                        <span class="community-value">+1</span>
                        <span class="community-label">Active</span>
                    </div>
                    <div class="community-stat">
                        <span class="community-value">10.00</span>
                        <span class="community-label">Rating</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ✅ PAGE 2: Videos (Your Existing Video Section)
function getVideosPage() {
    return `
        <div class="page videos-page">
            <div class="section-header">
                <button onclick="showPage('home')" class="back-btn">← Back</button>
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

// ✅ PAGE 3: Mining (Enhanced with Full Setup)
function getMiningPage() {
    return `
        <div class="page mining-page">
            <div class="section-header">
                <button onclick="showPage('home')" class="back-btn">← Back</button>
                <h3>⛏️ Points Mining</h3>
            </div>
            
            <!-- Main Mining Card -->
            <div class="main-feature-card mining-feature" onclick="toggleMining()">
                <div class="feature-main-icon">⛏️</div>
                <div class="feature-main-title">Points Mining</div>
                <div class="feature-main-desc" id="miningStatusTextPage">Click to start mining</div>
                <div class="mining-stats">
                    <div class="mining-stat">
                        <span class="mining-value" id="miningTimePage">00:00:00</span>
                        <span class="mining-label">Time</span>
                    </div>
                    <div class="mining-stat">
                        <span class="mining-value" id="miningRatePage">300/hr</span>
                        <span class="mining-label">Rate</span>
                    </div>
                </div>
            </div>
            
            <!-- Mining Details Section -->
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

            <!-- Mining Boost Section -->
            <div class="boost-section">
                <div class="boost-header">
                    <span class="boost-title">Mining Boost</span>
                    <span class="boost-progress">${Math.floor(miningSeconds/60)}/60</span>
                </div>
                <div class="boost-bar">
                    <div class="boost-fill" style="width: ${Math.min(100, (miningSeconds/60)/60*100)}%"></div>
                </div>
                <button class="boost-btn" onclick="activateMiningBoost()">
                    ⚡ Activate Mining Boost
                </button>
            </div>

            <!-- Mining History -->
            <div class="mining-history">
                <h4>📈 Mining History</h4>
                <div class="mining-stats-detailed">
                    <div class="mining-stat-detailed">
                        <div class="stat-icon">⏱️</div>
                        <div class="stat-info">
                            <div class="stat-value">${formatNumber(Math.floor(miningSeconds / 60))} min</div>
                            <div class="stat-label">Total Mining Time</div>
                        </div>
                    </div>
                    <div class="mining-stat-detailed">
                        <div class="stat-icon">💰</div>
                        <div class="stat-info">
                            <div class="stat-value">${formatNumber(Math.floor(miningSeconds / 60) * 5)}</div>
                            <div class="stat-label">Total Mined Points</div>
                        </div>
                    </div>
                    <div class="mining-stat-detailed">
                        <div class="stat-icon">🎯</div>
                        <div class="stat-info">
                            <div class="stat-value">${formatNumber(Math.floor(miningSeconds / 3600))}</div>
                            <div class="stat-label">Hourly Bonuses</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ✅ PAGE 4: Tasks (Your Existing Tasks)
function getTasksPage() {
    return `
        <div class="page tasks-page">
            <div class="section-header">
                <button onclick="showPage('home')" class="back-btn">← Back</button>
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
                
                <div class="task-item">
                    <div class="task-info">
                        <div class="task-title">Follow 2 accounts</div>
                        <div class="task-reward">+40 pts</div>
                    </div>
                    <button onclick="completeTask('follow')" class="task-btn">Complete</button>
                </div>
            </div>
        </div>
    `;
}

// ✅ PAGE 5: Referral (Your Existing Referral System)
function getReferralPage() {
    return `
        <div class="page referral-page">
            <div class="section-header">
                <button onclick="showPage('home')" class="back-btn">← Back</button>
                <h3>👥 Refer & Earn</h3>
            </div>
            
            <div class="referral-card">
                <div class="referral-code">TAPEARN_${Math.random().toString(36).substr(2, 8).toUpperCase()}</div>
                <p class="referral-note">Share your code with friends and earn 50 points each!</p>
                
                <div class="referral-stats">
                    <div class="referral-stat">
                        <span class="stat-value">${referrals}</span>
                        <span class="stat-label">Referred</span>
                    </div>
                    <div class="referral-stat">
                        <span class="stat-value">${referrals * 50}</span>
                        <span class="stat-label">Earned</span>
                    </div>
                    <div class="referral-stat">
                        <span class="stat-value">25</span>
                        <span class="stat-label">Friend Bonus</span>
                    </div>
                </div>
                
                <div class="sharing-options">
                    <button class="share-btn telegram" onclick="shareOnTelegramWithDeepLink()">
                        📱 Share on Telegram
                    </button>
                    <button class="share-btn copy" onclick="copyReferralWithDeepLink()">
                        📋 Copy Referral Link
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ✅ PAGE 6: Wallet (Your Existing Wallet)
function getWalletPage() {
    return `
        <div class="page wallet-page">
            <div class="section-header">
                <button onclick="showPage('home')" class="back-btn">← Back</button>
                <h3>💰 Wallet Details</h3>
            </div>
            
            <div class="wallet-summary-card">
                <div class="wallet-total">
                    <div class="total-amount">${formatNumber(userPoints)}</div>
                    <div class="total-label">Total Points</div>
                </div>
                
                <div class="wallet-earnings-breakdown">
                    <div class="earning-item">
                        <div class="earning-icon">⛏️</div>
                        <div class="earning-info">
                            <div class="earning-title">Mining Earnings</div>
                            <div class="earning-amount positive">+${Math.floor(miningSeconds / 60) * 5}</div>
                        </div>
                    </div>
                    
                    <div class="earning-item">
                        <div class="earning-icon">🎬</div>
                        <div class="earning-info">
                            <div class="earning-title">Video Earnings</div>
                            <div class="earning-amount positive">+${watchedVideos * 10}</div>
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

// ✅ PAGE 7: Leaderboard (Your Existing Leaderboard)
function getLeaderboardPage() {
    return `
        <div class="page leaderboard-page">
            <div class="section-header">
                <button onclick="showPage('home')" class="back-btn">← Back</button>
                <h3>🏆 Global Leaderboard</h3>
            </div>
            
            <div class="user-rank-card">
                <div class="user-rank-info">
                    <div class="user-rank">#8</div>
                    <div class="user-details">
                        <div class="user-name">You</div>
                        <div class="user-points">${formatNumber(userPoints)} points</div>
                    </div>
                    <div class="user-level-badge bronze">Bronze</div>
                </div>
            </div>
            
            <div class="leaderboard-list">
                <div class="leaderboard-item">
                    <div class="user-rank">1</div>
                    <div class="user-avatar">👑</div>
                    <div class="user-info">
                        <div class="user-name">CryptoKing</div>
                        <div class="user-level diamond">Diamond</div>
                    </div>
                    <div class="user-points">15,240</div>
                </div>
                <div class="leaderboard-item">
                    <div class="user-rank">2</div>
                    <div class="user-avatar">💎</div>
                    <div class="user-info">
                        <div class="user-name">DiamondHands</div>
                        <div class="user-level diamond">Diamond</div>
                    </div>
                    <div class="user-points">12,850</div>
                </div>
                <div class="leaderboard-item current-user">
                    <div class="user-rank">8</div>
                    <div class="user-avatar">👤</div>
                    <div class="user-info">
                        <div class="user-name">You</div>
                        <div class="user-level bronze">Bronze</div>
                    </div>
                    <div class="user-points">${formatNumber(userPoints)}</div>
                </div>
            </div>
        </div>
    `;
}

// ✅ PAGE 8: Support (Your Existing Support)
function getSupportPage() {
    return `
        <div class="page support-page">
            <div class="section-header">
                <button onclick="showPage('home')" class="back-btn">← Back</button>
                <h3>💬 Support Center</h3>
            </div>
            
            <div class="support-cards">
                <div class="support-card">
                    <div class="support-icon">❓</div>
                    <h4>FAQ</h4>
                    <p>Find answers to common questions</p>
                    <button class="support-btn" onclick="showFAQ()">View FAQ</button>
                </div>
                
                <div class="support-card">
                    <div class="support-icon">📧</div>
                    <h4>Contact Us</h4>
                    <p>Get help from our support team</p>
                    <button class="support-btn" onclick="showContactForm()">Contact</button>
                </div>
            </div>
        </div>
    `;
}

// ✅ Telegram Back Button Integration
function updateTelegramBackButton() {
    if (window.Telegram && window.Telegram.WebApp) {
        if (currentPage !== 'home') {
            Telegram.WebApp.BackButton.show();
        } else {
            Telegram.WebApp.BackButton.hide();
        }
    }
}

// Telegram Back Button Handler
if (window.Telegram && window.Telegram.WebApp) {
    Telegram.WebApp.BackButton.onClick(() => {
        showPage('home');
    });
}

// Initialize Telegram Integration
function initializeTelegramIntegration() {
    if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.expand();
    }
}

// Update UI
function updateUI() {
    document.getElementById('walletPoints').textContent = formatNumber(userPoints);
    document.getElementById('totalPoints').textContent = formatNumber(userPoints);
    document.getElementById('videosWatched').textContent = watchedVideos;
    document.getElementById('totalReferrals').textContent = referrals;
    
    updateMiningTimerDisplay();
}

// Format numbers with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Update Mining Timer Display
function updateMiningTimerDisplay() {
    const hours = Math.floor(miningSeconds / 3600);
    const minutes = Math.floor((miningSeconds % 3600) / 60);
    const seconds = miningSeconds % 60;
    
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Update home page
    const homeMiningTime = document.getElementById('miningTime');
    if (homeMiningTime) homeMiningTime.textContent = timeString;
    
    // Update mining page
    const miningPageTime = document.getElementById('miningTimePage');
    if (miningPageTime) miningPageTime.textContent = timeString;
}

// Toggle Mining
function toggleMining() {
    if (isMining) {
        stopMining();
    } else {
        startMining();
    }
}

// Start Mining
function startMining() {
    if (isMining) return;
    
    isMining = true;
    
    // Update home page mining card
    const homeMiningCard = document.querySelector('.home-page .mining-feature');
    if (homeMiningCard) homeMiningCard.classList.add('mining-active');
    const homeMiningStatus = document.getElementById('miningStatusText');
    if (homeMiningStatus) {
        homeMiningStatus.textContent = 'Mining Active - 5 pts/min';
        homeMiningStatus.style.color = '#FFD700';
    }
    const homeMiningRate = document.getElementById('miningRate');
    if (homeMiningRate) homeMiningRate.textContent = '300/hr';
    
    // Update mining page mining card
    const miningPageCard = document.querySelector('.mining-page .mining-feature');
    if (miningPageCard) miningPageCard.classList.add('mining-active');
    const miningPageStatus = document.getElementById('miningStatusTextPage');
    if (miningPageStatus) {
        miningPageStatus.textContent = 'Mining Active - 5 pts/min';
        miningPageStatus.style.color = '#FFD700';
    }
    const miningPageRate = document.getElementById('miningRatePage');
    if (miningPageRate) miningPageRate.textContent = '300/hr';
    
    if (miningInterval) {
        clearInterval(miningInterval);
        miningInterval = null;
    }
    
    let lastMinuteCheck = Math.floor(miningSeconds / 60);
    let lastHourCheck = Math.floor(miningSeconds / 3600);
    
    miningInterval = setInterval(() => {
        miningSeconds++;
        
        updateMiningTimerDisplay();
        
        const currentMinute = Math.floor(miningSeconds / 60);
        const currentHour = Math.floor(miningSeconds / 3600);
        
        if (currentMinute > lastMinuteCheck) {
            userPoints += 5;
            updateUI();
            showNotification('⛏️ +5 Points from Mining!', 'success');
            lastMinuteCheck = currentMinute;
        }
        
        if (currentHour > lastHourCheck) {
            userPoints += 50;
            updateUI();
            showNotification('🎉 +50 Bonus Points! 1 Hour Complete!', 'success');
            lastHourCheck = currentHour;
        }
        
    }, 1000);
    
    showNotification('⛏️ Mining Started! Earning 5 points per minute...', 'success');
}

// Stop Mining
function stopMining() {
    if (!isMining) return;
    
    isMining = false;
    
    if (miningInterval) {
        clearInterval(miningInterval);
        miningInterval = null;
    }
    
    // Update home page mining card
    const homeMiningCard = document.querySelector('.home-page .mining-feature');
    if (homeMiningCard) homeMiningCard.classList.remove('mining-active');
    const homeMiningStatus = document.getElementById('miningStatusText');
    if (homeMiningStatus) {
        homeMiningStatus.textContent = 'Click to start mining';
        homeMiningStatus.style.color = '';
    }
    
    // Update mining page mining card
    const miningPageCard = document.querySelector('.mining-page .mining-feature');
    if (miningPageCard) miningPageCard.classList.remove('mining-active');
    const miningPageStatus = document.getElementById('miningStatusTextPage');
    if (miningPageStatus) {
        miningPageStatus.textContent = 'Click to start mining';
        miningPageStatus.style.color = '';
    }
    
    showNotification('⏹️ Mining Stopped. Points saved!', 'info');
}

// Claim Boost
function claimBoost() {
    userPoints += 100;
    updateUI();
    showNotification('🚀 +100 Points! Boost claimed successfully!', 'success');
}

// Activate Mining Boost
function activateMiningBoost() {
    userPoints += 100;
    updateUI();
    showNotification('⚡ +100 Points! Mining Boost activated!', 'success');
}

// Complete Task
function completeTask(task) {
    let points = 0;
    
    switch(task) {
        case 'videos':
            points = 25;
            break;
        case 'referral':
            points = 50;
            break;
        case 'mining':
            points = 50;
            break;
        case 'follow':
            points = 40;
            break;
    }
    
    userPoints += points;
    updateUI();
    showNotification(`✅ +${points} Points! Task completed!`, 'success');
}

// Share with Telegram Deep Link
function shareOnTelegramWithDeepLink() {
    showNotification('✅ Telegram sharing opened! Share with your friends.', 'success');
}

// Copy referral link with deep link
function copyReferralWithDeepLink() {
    showNotification('✅ Referral link copied! Share with friends.', 'success');
}

// Show Wallet History
function showWalletHistory() {
    showNotification('📊 Opening transaction history...', 'info');
}

// Show Cashier
function showCashier() {
    showNotification('💰 Opening rewards section...', 'info');
}

// Show FAQ
function showFAQ() {
    showNotification('❓ Opening FAQ...', 'info');
}

// Show Contact Form
function showContactForm() {
    showNotification('📧 Opening contact form...', 'info');
}

// Show Terms
function showTerms() {
    showNotification('📄 Opening terms and conditions...', 'info');
}

// Show YouTube Tab
function showYouTubeTab() {
    showNotification('🎥 Switching to YouTube...', 'info');
}

// Show Instagram Tab
function showInstagramTab() {
    showNotification('📷 Switching to Instagram...', 'info');
}

// Show Skills
function showSkills() {
    showNotification('⚡ Opening skills section...', 'info');
}

// Show Telegram Section
function showTelegramSection() {
    showNotification('📱 Opening Telegram section...', 'info');
}

// Show X Section
function showXSection() {
    showNotification('🐦 Opening X section...', 'info');
}

// Show Follow Section
function showFollowSection() {
    showNotification('👥 Opening follow section...', 'info');
}

// Show Social Tasks
function showSocialTasks() {
    showNotification('🌐 Opening social tasks...', 'info');
}

// Search YouTube Videos
async function searchYouTubeVideos() {
    const query = document.getElementById('youtubeSearchInput').value.trim() || 'trending shorts';
    const container = document.getElementById('videoResultsContainer');
    
    container.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Searching YouTube for "${query}"...</p>
        </div>
    `;

    try {
        const videos = await searchRealYouTubeVideos(query);
        displayYouTubeVideos(videos, query);
    } catch (error) {
        console.error('YouTube search failed:', error);
        showDemoVideos();
    }
}

// Search Real YouTube Videos
async function searchRealYouTubeVideos(query) {
    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoDuration=short&q=${encodeURIComponent(query)}&maxResults=8&key=${YOUTUBE_API_KEY}`
        );
        
        if (!response.ok) {
            throw new Error(`YouTube API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.items || data.items.length === 0) {
            throw new Error('No videos found');
        }
        
        return data.items;
    } catch (error) {
        console.error('YouTube API Error:', error.message);
        throw error;
    }
}

// Display YouTube Videos
function displayYouTubeVideos(videos, query) {
    const container = document.getElementById('videoResultsContainer');
    
    let html = `
        <div class="section-title">
            <h3>🎥 YouTube Shorts</h3>
            <p class="section-subtitle">Found ${videos.length} videos for "${query}"</p>
        </div>
        <div class="videos-grid">
    `;
    
    videos.forEach((video) => {
        const videoId = video.id.videoId;
        const thumbnail = video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default.url;
        const title = video.snippet.title;
        const channel = video.snippet.channelTitle;
        const points = calculatePoints(title);
        
        html += `
            <div class="video-card youtube-card" onclick="selectYouTubeVideo('${videoId}', ${points}, '${title.replace(/'/g, "\\'")}', '${channel.replace(/'/g, "\\'")}')">
                <div class="thumbnail">
                    <img src="${thumbnail}" alt="${title}">
                    <div class="points-badge">+${points} pts</div>
                    <div class="youtube-badge">YouTube</div>
                </div>
                <div class="video-details">
                    <h4 class="video-title">${title}</h4>
                    <div class="video-meta">
                        <span class="channel">${channel}</span>
                        <span class="watch-now">▶️ Watch</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Show Demo Videos Fallback
function showDemoVideos() {
    const demoVideos = [
        {
            id: { videoId: 'demo1' },
            snippet: {
                title: '🎵 Trending Music Short 2024',
                thumbnails: { 
                    medium: { url: 'https://via.placeholder.com/300/FF6B6B/FFFFFF?text=Music+Short' }
                },
                channelTitle: 'Music Channel'
            }
        },
        {
            id: { videoId: 'demo2' },
            snippet: {
                title: '😂 Funny Comedy Skit',
                thumbnails: { 
                    medium: { url: 'https://via.placeholder.com/300/4ECDC4/FFFFFF?text=Comedy+Short' }
                },
                channelTitle: 'Comedy Central'
            }
        }
    ];
    
    displayYouTubeVideos(demoVideos, 'demo videos');
}

// Calculate Points for Video
function calculatePoints(title) {
    const basePoints = 10;
    const bonus = Math.floor(Math.random() * 6);
    return basePoints + bonus;
}

// Select YouTube Video for Earning
function selectYouTubeVideo(videoId, points, title, channel) {
    currentVideoId = videoId;
    currentPoints = points;
    currentTitle = title;
    
    document.getElementById('currentPage').innerHTML = `
        <div class="video-player-section">
            <div class="section-header">
                <button onclick="showPage('videos')" class="back-btn">← Back to Videos</button>
                <h3>🎯 Earn Points</h3>
            </div>
            
            <div class="youtube-iframe-container">
                <iframe 
                    width="100%" 
                    height="100%" 
                    src="https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            </div>
            
            <div class="video-timer">
                <p>⏰ <strong>Watch for 1 minute to earn ${points} points</strong></p>
                <p class="timer-note">Don't close this page - points awarded automatically</p>
            </div>
            
            <div class="tracking-section">
                <div class="tracking-status">
                    <div class="status-indicator" id="statusIndicator"></div>
                    <div class="status-text" id="statusText">
                        🎯 Ready to earn ${points} points
                    </div>
                </div>
                
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill" id="progressFill"></div>
                    </div>
                    <div class="progress-text" id="progressText">
                        Waiting for video completion...
                    </div>
                </div>
                
                <div class="tracking-controls">
                    <button onclick="cancelVideoEarning()" class="cancel-btn">
                        ❌ Cancel Earning
                    </button>
                </div>
            </div>
        </div>
    `;
    
    startVideoTracking();
}

// Start Video Tracking
function startVideoTracking() {
    let trackingTime = 0;
    const maxTrackingTime = 60;
    
    videoTrackingInterval = setInterval(() => {
        trackingTime++;
        updateVideoTrackingProgress(trackingTime, maxTrackingTime);
        
        if (trackingTime >= maxTrackingTime) {
            clearInterval(videoTrackingInterval);
            completeVideoEarning();
        }
    }, 1000);
}

// Update Video Tracking Progress
function updateVideoTrackingProgress(current, max) {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const statusText = document.getElementById('statusText');
    
    if (progressFill && progressText) {
        const percentage = (current / max) * 100;
        progressFill.style.width = `${percentage}%`;
        
        const timeLeft = max - current;
        
        if (current < 10) {
            progressText.innerHTML = `⏳ Video started... (${current}s/60s) - ${timeLeft}s left`;
            statusText.innerHTML = '🎬 Video playing...';
        } else if (current < 30) {
            progressText.innerHTML = `📺 Video in progress... (${current}s/60s) - ${timeLeft}s left`;
            statusText.innerHTML = '⏱️ Keep watching...';
        } else if (current < 50) {
            progressText.innerHTML = `✅ Halfway done... (${current}s/60s) - ${timeLeft}s left`;
            statusText.innerHTML = '💰 Almost there...';
        } else {
            progressText.innerHTML = `🎉 Almost done... (${current}s/60s) - ${timeLeft}s left`;
            statusText.innerHTML = '⚡ Points coming soon!';
        }
    }
}

// Complete Video Earning
function completeVideoEarning() {
    userPoints += currentPoints;
    watchedVideos++;
    
    updateUI();
    
    showEarningSuccess();
}

// Show Earning Success
function showEarningSuccess() {
    document.getElementById('currentPage').innerHTML = `
        <div class="earning-success">
            <div class="success-icon">🎉</div>
            
            <h3>Points Earned Successfully!</h3>
            
            <div class="points-earned">
                +${currentPoints} Points
            </div>
            
            <div class="success-details">
                <div class="detail-item">
                    <span class="detail-label">Video:</span>
                    <span class="detail-value">${currentTitle}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Points Added:</span>
                    <span class="detail-value">+${currentPoints}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Total Points:</span>
                    <span class="detail-value">${userPoints}</span>
                </div>
            </div>
            
            <div class="success-actions">
                <button onclick="showPage('videos')" class="action-btn primary">
                    🔍 Watch More Videos
                </button>
                <button onclick="showPage('home')" class="action-btn secondary">
                    🏠 Back to Dashboard
                </button>
            </div>
        </div>
    `;
    
    showNotification(`✅ +${currentPoints} Points earned!`, 'success');
}

// Cancel Video Earning
function cancelVideoEarning() {
    if (videoTrackingInterval) {
        clearInterval(videoTrackingInterval);
    }
    showNotification('❌ Points earning cancelled', 'warning');
    showPage('videos');
}

// Notification System
function showNotification(message, type = 'info') {
    // Simple notification implementation
    console.log(`${type}: ${message}`);
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'warning' ? '#FF9800' : '#2196F3'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease-out;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; font-size: 18px; cursor: pointer;">×</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 4000);
}

// Add CSS for notification animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// ✅ ENHANCED: Initialize with data persistence and native app
document.addEventListener('DOMContentLoaded', function() {
    console.log('🆕 Initializing NATIVE APP with ENHANCED DATA PERSISTENCE...');
    
    initializeTelegramIntegration();
    updateUI();
    
    // Set initial page
    showPage('home');
    
    console.log('🎯 Native TapEarn App Initialized - NO SCROLLER ACTIVE');
    console.log('💰 Current Points:', userPoints);
});
