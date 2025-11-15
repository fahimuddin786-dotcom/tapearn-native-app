// Advanced Mining State Management
let isMining = false;
let miningSeconds = 0;
let miningInterval = null;
let userPoints = 0;
let totalMiningHours = 0;
let totalPointsEarned = 0;

// Telegram ID System
let telegramUsername = '';
let userId = '';

// Mining Upgrades
let miningLevel = 1;
let speedLevel = 1;
let multiplierLevel = 1;
let turboActive = false;
let turboTimeLeft = 0;

// Bonuses
let dailyBonusClaimed = false;
let lastBonusClaim = 0;
let hourlyBonusAvailable = true;
let lastHourlyBonus = 0;
let loginStreak = 1;
let lastLoginDate = null;

// Mining History
let totalMiningTime = 0;
let bestSessionTime = 0;
let sessionCount = 0;
let currentSessionStart = 0;

// Earning App State
let totalTasksCompleted = 0;
let todayEarnings = 0;
let lastEarningDate = null;
let watchedVideos = [];
let completedTasks = [];

// Video Watch System
let currentVideoTimer = null;
let currentVideoTimeLeft = 0;
let currentVideoData = null;

// New Tasks Systems State
let completedFollowTasks = [];
let completedDailyTasks = [];
let completedSocialTasks = [];
let watchedTelegramVideoIds = [];
let joinedTelegramChannels = [];
let completedXTasks = [];

// Profile Systems State
let redeemedRewards = [];
let referralData = {
    referralCode: generateReferralCode(),
    referredUsers: [],
    totalEarned: 0,
    telegramUsername: ''
};

// Wallet History System
let transactionHistory = [];
let totalEarned = 0;
let totalSpent = 0;

// YouTube API Configuration
const YOUTUBE_API_KEYS = [
    'AIzaSyBATxf5D7ZDeiQ61dbEdzEd4Tq72N713Y8',
    'AIzaSyA4piVRV_2w4t6Y7-3nPo3Qp1TZ2xXq7Xw',
    'AIzaSyD7LQcA4jY4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4'
];
let currentApiKeyIndex = 0;

// Mining Rates and Costs
const LEVEL_DATA = {
    1: { name: "Bronze", bonus: 5, cost: 500, color: "#CD7F32" },
    2: { name: "Silver", bonus: 8, cost: 1000, color: "#C0C0C0" },
    3: { name: "Gold", bonus: 12, cost: 2500, color: "#FFD700" },
    4: { name: "Platinum", bonus: 18, cost: 5000, color: "#E5E4E2" },
    5: { name: "Diamond", bonus: 25, cost: 10000, color: "#B9F2FF" }
};

const SPEED_UPGRADES = [
    { cost: 100, bonus: 1 },
    { cost: 200, bonus: 1 },
    { cost: 400, bonus: 1 },
    { cost: 800, bonus: 1 },
    { cost: 1600, bonus: 1 }
];

const MULTIPLIER_UPGRADES = [
    { cost: 200, bonus: 0.2 },
    { cost: 400, bonus: 0.2 },
    { cost: 800, bonus: 0.2 },
    { cost: 1600, bonus: 0.2 },
    { cost: 3200, bonus: 0.2 }
];

// Calculate Mining Rate
function getMiningRate() {
    const baseRate = LEVEL_DATA[miningLevel].bonus;
    const speedBonus = (speedLevel - 1) * SPEED_UPGRADES[0].bonus;
    const multiplier = 1 + (multiplierLevel - 1) * MULTIPLIER_UPGRADES[0].bonus;
    const turboMultiplier = turboActive ? 2 : 1;
    
    return (baseRate + speedBonus) * multiplier * turboMultiplier;
}

// Add Transaction to History
function addTransaction(description, amount, type, category = "other") {
    const transaction = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        description: description,
        amount: amount,
        type: type, // 'earning' or 'spending'
        category: category,
        balance: userPoints
    };
    
    transactionHistory.unshift(transaction); // Add to beginning
    
    if (type === 'earning') {
        totalEarned += amount;
    } else if (type === 'spending') {
        totalSpent += amount;
    }
    
    // Limit history to 100 transactions
    if (transactionHistory.length > 100) {
        transactionHistory = transactionHistory.slice(0, 100);
    }
    
    saveMiningState();
}

// 🆕 ENHANCED TELEGRAM PROFILE SYSTEM - ADMIN PANEL SYNC
function captureTelegramId() {
    const savedTelegramId = getFromStorage('telegramUsername', '');
    const savedUserId = getFromStorage('userId', '');
    
    userId = savedUserId || generateUserId();
    
    if (!savedTelegramId || savedTelegramId === 'Not set' || savedTelegramId === '') {
        // Show modal to capture Telegram ID
        setTimeout(() => {
            showTelegramIdModal();
        }, 1500);
    } else {
        telegramUsername = savedTelegramId;
        console.log('✅ Telegram ID loaded:', telegramUsername);
        // 🆕 Create user profile immediately with ADMIN PANEL SYNC
        createUserProfileFromTelegram(savedTelegramId, userId);
        // 🆕 Sync to Admin Panel format
        syncToAdminPanel();
    }
}

// ✅ FIXED: Enhanced user profile creation for admin panel
function createUserProfileFromTelegram(telegramId, userId) {
    console.log('🆕 Creating user profile from Telegram:', telegramId);
    
    const userProfileData = {
        id: userId,
        telegramUsername: telegramId,
        points: userPoints,
        level: miningLevel,
        miningStatus: isMining ? 'Active' : 'Inactive',
        tasksCompleted: totalTasksCompleted,
        joinDate: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        totalEarned: totalPointsEarned,
        todayEarnings: todayEarnings,
        miningSeconds: miningSeconds,
        totalMiningHours: totalMiningHours,
        speedLevel: speedLevel,
        multiplierLevel: multiplierLevel,
        loginStreak: loginStreak,
        profileSource: 'telegram_direct',
        isVerified: true
    };
    
    // 🆕 IMPROVED: Save in multiple formats for better admin panel detection
    saveToStorage(`userData_${userId}`, userProfileData);
    
    // Also save in miningState format for compatibility
    const miningStateData = {
        telegramUsername: telegramId,
        userPoints: userPoints,
        miningLevel: miningLevel,
        isMining: isMining,
        totalTasksCompleted: totalTasksCompleted,
        totalPointsEarned: totalPointsEarned,
        todayEarnings: todayEarnings,
        miningSeconds: miningSeconds,
        totalMiningHours: totalMiningHours,
        speedLevel: speedLevel,
        multiplierLevel: multiplierLevel,
        loginStreak: loginStreak,
        userId: userId,
        joinDate: new Date().toISOString(),
        lastActive: new Date().toISOString()
    };
    saveToStorage(`miningState_${userId}`, miningStateData);
    
    // Also update referral data
    referralData.telegramUsername = telegramId;
    saveToStorage('referralData', referralData);
    
    console.log('✅ User profile created for admin panel:', telegramId);
    
    // 🆕 Notify admin panel
    notifyAdminPanel('user_created', userProfileData);
    
    // 🆕 SYNC TO ADMIN PANEL
    syncToAdminPanel();
}

function showTelegramIdModal() {
    // Don't show if already shown and closed
    const telegramModalShown = getFromStorage('telegramModalShown', false);
    if (telegramModalShown) return;
    
    document.getElementById('telegramIdModal').classList.add('active');
    // Focus on input field
    setTimeout(() => {
        const input = document.getElementById('telegramIdInput');
        if (input) input.focus();
    }, 300);
}

function closeTelegramIdModal() {
    document.getElementById('telegramIdModal').classList.remove('active');
}

function saveTelegramId() {
    const telegramIdInput = document.getElementById('telegramIdInput').value.trim();
    
    if (!telegramIdInput) {
        showNotification('❌ Please enter your Telegram username!', 'warning');
        return;
    }
    
    // Validate Telegram username format
    if (!isValidTelegramUsername(telegramIdInput)) {
        showNotification('❌ Please enter a valid Telegram username (e.g., @username)', 'warning');
        return;
    }
    
    // Ensure it starts with @
    const formattedTelegramId = telegramIdInput.startsWith('@') ? telegramIdInput : '@' + telegramIdInput;
    
    telegramUsername = formattedTelegramId;
    
    // Save to storage
    saveToStorage('telegramUsername', formattedTelegramId);
    saveToStorage('userId', userId);
    saveToStorage('telegramModalShown', true);
    
    // 🆕 Create complete user profile
    createUserProfileFromTelegram(formattedTelegramId, userId);
    
    // Also update referral data
    referralData.telegramUsername = formattedTelegramId;
    saveToStorage('referralData', referralData);
    
    // Update mining state with Telegram ID
    const miningState = getFromStorage('miningState', {});
    miningState.telegramUsername = formattedTelegramId;
    saveToStorage('miningState', miningState);
    
    // Create user profile data
    const userProfile = {
        telegramUsername: formattedTelegramId,
        joinDate: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        userId: userId
    };
    saveToStorage('userProfile', userProfile);
    
    console.log('✅ Telegram ID saved and profile created:', formattedTelegramId);
    showNotification('✅ Telegram ID saved successfully!', 'success');
    
    closeTelegramIdModal();
    
    // Update UI
    updateUI();
    
    // 🆕 SYNC TO ADMIN PANEL
    syncToAdminPanel();
}

// 🆕 NOTIFY ADMIN PANEL
function notifyAdminPanel(event, data) {
    console.log(`📢 Notifying admin: ${event}`, data);
    
    // Create admin notification
    const adminNotification = {
        event: event,
        data: data,
        timestamp: new Date().toISOString(),
        userId: userId,
        telegramUsername: telegramUsername
    };
    
    // Save notification for admin panel
    const existingNotifications = getFromStorage('adminNotifications', []);
    existingNotifications.unshift(adminNotification);
    
    // Keep only last 50 notifications
    if (existingNotifications.length > 50) {
        existingNotifications.splice(50);
    }
    
    saveToStorage('adminNotifications', existingNotifications);
    
    // Also update user activity
    updateUserActivity();
}

// 🆕 UPDATE USER ACTIVITY
function updateUserActivity() {
    if (!userId || !telegramUsername) return;
    
    const userActivity = {
        id: userId,
        telegramUsername: telegramUsername,
        lastActive: new Date().toISOString(),
        points: userPoints,
        level: miningLevel,
        miningStatus: isMining ? 'Active' : 'Inactive'
    };
    
    // Save activity for admin panel
    const userActivities = getFromStorage('userActivities', []);
    
    // Remove existing activity for this user
    const filteredActivities = userActivities.filter(activity => activity.id !== userId);
    filteredActivities.unshift(userActivity);
    
    // Keep only last 100 activities
    if (filteredActivities.length > 100) {
        filteredActivities.splice(100);
    }
    
    saveToStorage('userActivities', filteredActivities);
}

// 🆕 SYNC TO ADMIN PANEL - NEW FUNCTION
function syncToAdminPanel() {
    if (!telegramUsername || telegramUsername === 'Not set') {
        console.log('⏭️ Skipping admin panel sync - no Telegram ID');
        return;
    }
    
    console.log('🔄 Syncing data to Admin Panel format...');
    
    // Create admin panel compatible data
    const adminPanelData = {
        id: userId,
        telegramUsername: telegramUsername,
        points: userPoints,
        level: miningLevel,
        miningStatus: isMining ? 'Active' : 'Inactive',
        tasksCompleted: totalTasksCompleted,
        joinDate: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        totalEarned: totalPointsEarned,
        todayEarnings: todayEarnings,
        miningSeconds: miningSeconds,
        totalMiningHours: totalMiningHours,
        speedLevel: speedLevel,
        multiplierLevel: multiplierLevel,
        loginStreak: loginStreak,
        profileSource: 'app_sync',
        isVerified: true
    };
    
    // Save in formats that Admin Panel can read
    saveToStorage(`userData_${userId}`, adminPanelData);
    saveToStorage(`miningState_${userId}`, adminPanelData);
    
    // Also save in simple format for direct access
    saveToStorage('currentUserData', adminPanelData);
    
    console.log('✅ Data synced to Admin Panel:', telegramUsername);
    
    // Update user activity
    updateUserActivity();
}

function isValidTelegramUsername(username) {
    // Remove @ for validation
    const cleanUsername = username.replace('@', '');
    
    // Telegram username validation: 5-32 characters, contains only a-z, 0-9, and underscores
    const telegramRegex = /^[a-zA-Z0-9_]{5,32}$/;
    return telegramRegex.test(cleanUsername);
}

function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Storage Functions
function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        console.log('💾 Saved:', key, value);
        return true;
    } catch (error) {
        console.error('❌ Storage error:', error);
        showNotification('❌ Storage error!', 'warning');
        return false;
    }
}

function getFromStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        const value = item ? JSON.parse(item) : defaultValue;
        return value;
    } catch (error) {
        console.error('❌ Storage read error:', error);
        return defaultValue;
    }
}

// Load Complete State
function loadMiningState() {
    console.log('🔄 Loading complete state...');
    
    const savedState = getFromStorage('miningState');
    const savedUpgrades = getFromStorage('miningUpgrades');
    const savedBonuses = getFromStorage('miningBonuses');
    const savedHistory = getFromStorage('miningHistory');
    
    // Load basic state
    if (savedState) {
        isMining = savedState.isMining || false;
        miningSeconds = savedState.miningSeconds || 0;
        userPoints = savedState.userPoints || 0;
        totalMiningHours = savedState.totalMiningHours || 0;
        totalPointsEarned = savedState.totalPointsEarned || 0;
        telegramUsername = savedState.telegramUsername || '';
    }
    
    // Load upgrades
    if (savedUpgrades) {
        miningLevel = savedUpgrades.miningLevel || 1;
        speedLevel = savedUpgrades.speedLevel || 1;
        multiplierLevel = savedUpgrades.multiplierLevel || 1;
        turboActive = savedUpgrades.turboActive || false;
        turboTimeLeft = savedUpgrades.turboTimeLeft || 0;
    }
    
    // Load bonuses
    if (savedBonuses) {
        dailyBonusClaimed = savedBonuses.dailyBonusClaimed || false;
        lastBonusClaim = savedBonuses.lastBonusClaim || 0;
        hourlyBonusAvailable = savedBonuses.hourlyBonusAvailable !== false;
        lastHourlyBonus = savedBonuses.lastHourlyBonus || 0;
        loginStreak = savedBonuses.loginStreak || 1;
        lastLoginDate = savedBonuses.lastLoginDate;
    }
    
    // Load history
    if (savedHistory) {
        totalMiningTime = savedHistory.totalMiningTime || 0;
        bestSessionTime = savedHistory.bestSessionTime || 0;
        sessionCount = savedHistory.sessionCount || 0;
    }
    
    // Load earning state
    const savedTasks = localStorage.getItem('totalTasksCompleted');
    const savedVideos = localStorage.getItem('watchedVideos');
    const savedCompletedTasks = localStorage.getItem('completedTasks');
    const savedTodayEarnings = localStorage.getItem('todayEarnings');
    const savedLastEarningDate = localStorage.getItem('lastEarningDate');
    
    totalTasksCompleted = savedTasks ? parseInt(savedTasks) : 0;
    watchedVideos = savedVideos ? JSON.parse(savedVideos) : [];
    completedTasks = savedCompletedTasks ? JSON.parse(savedCompletedTasks) : [];
    todayEarnings = savedTodayEarnings ? parseInt(savedTodayEarnings) : 0;
    lastEarningDate = savedLastEarningDate || null;
    
    // Load new tasks systems state
    completedFollowTasks = getFromStorage('completedFollowTasks', []);
    completedDailyTasks = getFromStorage('completedDailyTasks', []);
    completedSocialTasks = getFromStorage('completedSocialTasks', []);
    watchedTelegramVideoIds = getFromStorage('watchedTelegramVideoIds', []);
    joinedTelegramChannels = getFromStorage('joinedTelegramChannels', []);
    completedXTasks = getFromStorage('completedXTasks', []);
    
    // Load profile systems state
    redeemedRewards = getFromStorage('redeemedRewards', []);
    referralData = getFromStorage('referralData', {
        referralCode: generateReferralCode(),
        referredUsers: [],
        totalEarned: 0,
        telegramUsername: ''
    });
    
    // Load wallet history
    transactionHistory = getFromStorage('transactionHistory', []);
    totalEarned = getFromStorage('totalEarned', 0);
    totalSpent = getFromStorage('totalSpent', 0);
    
    // Load Telegram ID and User ID
    telegramUsername = getFromStorage('telegramUsername', '');
    userId = getFromStorage('userId', generateUserId());
    
    // 🆕 Create user profile if Telegram ID exists
    if (telegramUsername && telegramUsername !== 'Not set' && telegramUsername !== '') {
        createUserProfileFromTelegram(telegramUsername, userId);
    }
    
    // Check daily reset for earnings
    checkDailyEarningsReset();
    
    // Check daily login
    checkDailyLogin();
    
    console.log('✅ Complete state loaded');
    
    if (isMining) {
        console.log('⛏️ Resuming mining session...');
        startMining();
    }
    
    if (turboActive && turboTimeLeft > 0) {
        console.log('🚀 Resuming turbo mode...');
        startTurboCountdown();
    }
    
    updateUI();
    
    // 🆕 SYNC TO ADMIN PANEL ON LOAD
    setTimeout(() => {
        syncToAdminPanel();
    }, 2000);
}

// Save Complete State
function saveMiningState() {
    const miningState = {
        isMining: isMining,
        miningSeconds: miningSeconds,
        userPoints: userPoints,
        totalMiningHours: totalMiningHours,
        totalPointsEarned: totalPointsEarned,
        telegramUsername: telegramUsername,
        lastSaved: new Date().toISOString()
    };
    
    const miningUpgrades = {
        miningLevel: miningLevel,
        speedLevel: speedLevel,
        multiplierLevel: multiplierLevel,
        turboActive: turboActive,
        turboTimeLeft: turboTimeLeft
    };
    
    const miningBonuses = {
        dailyBonusClaimed: dailyBonusClaimed,
        lastBonusClaim: lastBonusClaim,
        hourlyBonusAvailable: hourlyBonusAvailable,
        lastHourlyBonus: lastHourlyBonus,
        loginStreak: loginStreak,
        lastLoginDate: lastLoginDate
    };
    
    const miningHistory = {
        totalMiningTime: totalMiningTime,
        bestSessionTime: bestSessionTime,
        sessionCount: sessionCount
    };
    
    saveToStorage('miningState', miningState);
    saveToStorage('miningUpgrades', miningUpgrades);
    saveToStorage('miningBonuses', miningBonuses);
    saveToStorage('miningHistory', miningHistory);
    
    // Save earning state
    localStorage.setItem('totalTasksCompleted', totalTasksCompleted);
    localStorage.setItem('watchedVideos', JSON.stringify(watchedVideos));
    localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
    localStorage.setItem('todayEarnings', todayEarnings);
    localStorage.setItem('lastEarningDate', lastEarningDate);
    
    // Save new tasks systems state
    saveToStorage('completedFollowTasks', completedFollowTasks);
    saveToStorage('completedDailyTasks', completedDailyTasks);
    saveToStorage('completedSocialTasks', completedSocialTasks);
    saveToStorage('watchedTelegramVideoIds', watchedTelegramVideoIds);
    saveToStorage('joinedTelegramChannels', joinedTelegramChannels);
    saveToStorage('completedXTasks', completedXTasks);
    
    // Save profile systems state
    saveToStorage('redeemedRewards', redeemedRewards);
    saveToStorage('referralData', referralData);
    
    // Save wallet history
    saveToStorage('transactionHistory', transactionHistory);
    saveToStorage('totalEarned', totalEarned);
    saveToStorage('totalSpent', totalSpent);
    
    // Save Telegram ID and User ID
    saveToStorage('telegramUsername', telegramUsername);
    saveToStorage('userId', userId);
    
    // 🆕 Update user profile for admin panel
    if (telegramUsername && telegramUsername !== 'Not set' && telegramUsername !== '') {
        createUserProfileFromTelegram(telegramUsername, userId);
    }
    
    // 🆕 Update user activity
    updateUserActivity();
    
    // 🆕 SYNC TO ADMIN PANEL ON EVERY SAVE
    syncToAdminPanel();
}

// Check Daily Reset for Earnings
function checkDailyEarningsReset() {
    const today = new Date().toDateString();
    if (lastEarningDate !== today) {
        todayEarnings = 0;
        lastEarningDate = today;
        // Reset daily tasks
        completedDailyTasks = [];
        console.log('📅 New day - earnings and daily tasks reset');
        saveMiningState();
    }
}

// Check Daily Login
function checkDailyLogin() {
    const today = new Date().toDateString();
    if (lastLoginDate !== today) {
        dailyBonusClaimed = false;
        lastLoginDate = today;
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastLoginDate === yesterday.toDateString()) {
            loginStreak++;
        } else {
            loginStreak = 1;
        }
        
        console.log('📅 New day detected. Streak:', loginStreak);
        saveMiningState();
    }
}

// Update Complete UI
function updateUI() {
    // Update Points and Level
    document.getElementById('walletPoints').textContent = formatNumber(userPoints);
    document.getElementById('totalPoints').textContent = formatNumber(userPoints);
    
    // Update Mining Stats
    document.getElementById('miningHours').textContent = totalMiningHours;
    document.getElementById('pointsEarned').textContent = formatNumber(totalPointsEarned);
    
    // Update Mining Timer and Status
    updateMiningTimerDisplay();
    
    const statusElement = document.getElementById('miningStatusText');
    const miningCard = document.querySelector('.main-mining-card');
    const miningRate = getMiningRate();
    
    if (isMining) {
        statusElement.textContent = `Mining Active - ${miningRate.toFixed(1)} pts/min`;
        statusElement.style.color = '#FFD700';
        miningCard.classList.add('mining-active');
    } else {
        statusElement.textContent = 'Click to start mining';
        statusElement.style.color = '';
        miningCard.classList.remove('mining-active');
    }
    
    // Update Mining Rate Display
    document.getElementById('miningRate').textContent = `${miningRate.toFixed(1)}/min`;
    document.getElementById('miningMultiplier').textContent = `${(1 + (multiplierLevel - 1) * 0.2).toFixed(1)}x`;
    
    // Update Level and Progress
    updateLevelUI();
    
    // Update Upgrades UI
    updateUpgradesUI();
    
    // Update Bonuses UI
    updateBonusesUI();
    
    // Update Turbo UI
    updateTurboUI();
    
    // Update Earning UI
    updateEarningUI();
    
    // Update Tasks UI
    updateTasksUI();
    
    // Update Profile UI
    updateProfileUI();
    
    // 🆕 Update user activity
    updateUserActivity();
    
    // 🆕 SYNC TO ADMIN PANEL ON UI UPDATE
    setTimeout(syncToAdminPanel, 1000);
}

// Update Level UI
function updateLevelUI() {
    const levelData = LEVEL_DATA[miningLevel];
    document.getElementById('userLevel').textContent = levelData.name;
    document.getElementById('userLevel').style.color = levelData.color;
    
    const nextLevel = miningLevel + 1;
    const progress = nextLevel <= 5 ? userPoints / LEVEL_DATA[nextLevel].cost * 100 : 100;
    document.getElementById('levelProgress').style.width = `${Math.min(progress, 100)}%`;
    document.getElementById('userStats').textContent = `${userPoints}/${LEVEL_DATA[nextLevel]?.cost || 'MAX'}`;
    
    document.getElementById('miningTitle').textContent = `${levelData.name} Mining`;
}

// Update Upgrades UI
function updateUpgradesUI() {
    // Speed Upgrade
    const speedData = SPEED_UPGRADES[speedLevel - 1] || SPEED_UPGRADES[SPEED_UPGRADES.length - 1];
    document.getElementById('speedLevel').textContent = speedLevel;
    document.getElementById('speedCost').textContent = speedData ? speedData.cost : 'MAX';
    
    const speedBtn = document.getElementById('speedUpgradeBtn');
    if (speedLevel > SPEED_UPGRADES.length) {
        speedBtn.textContent = 'MAX LEVEL';
        speedBtn.disabled = true;
    } else {
        speedBtn.disabled = userPoints < speedData.cost;
    }
    
    // Multiplier Upgrade
    const multiplierData = MULTIPLIER_UPGRADES[multiplierLevel - 1] || MULTIPLIER_UPGRADES[MULTIPLIER_UPGRADES.length - 1];
    document.getElementById('multiplierLevel').textContent = multiplierLevel;
    document.getElementById('multiplierCost').textContent = multiplierData ? multiplierData.cost : 'MAX';
    
    const multiplierBtn = document.getElementById('multiplierUpgradeBtn');
    if (multiplierLevel > MULTIPLIER_UPGRADES.length) {
        multiplierBtn.textContent = 'MAX LEVEL';
        multiplierBtn.disabled = true;
    } else {
        multiplierBtn.disabled = userPoints < multiplierData.cost;
    }
    
    // Level Upgrade
    const nextLevel = miningLevel + 1;
    const levelData = LEVEL_DATA[nextLevel];
    document.getElementById('levelName').textContent = levelData ? levelData.name : 'MAX LEVEL';
    document.getElementById('levelCost').textContent = levelData ? levelData.cost : 'MAX';
    
    const levelBtn = document.getElementById('levelUpgradeBtn');
    if (miningLevel >= 5) {
        levelBtn.textContent = 'MAX LEVEL';
        levelBtn.disabled = true;
    } else {
        levelBtn.disabled = userPoints < levelData.cost;
    }
}

// Update Bonuses UI
function updateBonusesUI() {
    const dailyStatus = document.getElementById('dailyBonusStatus');
    dailyStatus.textContent = dailyBonusClaimed ? 'Claimed' : 'Available';
    dailyStatus.style.color = dailyBonusClaimed ? '#FF6B6B' : '#4CAF50';
    
    const hourlyStatus = document.getElementById('hourlyBonusStatus');
    hourlyStatus.textContent = hourlyBonusAvailable ? 'Available' : 'Coming Soon';
    hourlyStatus.style.color = hourlyBonusAvailable ? '#4CAF50' : '#FFA726';
    
    const streakStatus = document.getElementById('streakBonusStatus');
    streakStatus.textContent = `Day ${loginStreak}`;
    streakStatus.style.color = '#FFD700';
}

// Update Turbo UI
function updateTurboUI() {
    const turboIndicator = document.getElementById('turboIndicator');
    const turboBtn = document.getElementById('turboBtn');
    
    if (turboActive) {
        turboIndicator.style.display = 'block';
        document.getElementById('turboTime').textContent = formatTime(turboTimeLeft);
        turboBtn.disabled = true;
        turboBtn.innerHTML = '<span class="btn-icon">🚀</span><span class="btn-text">Active</span>';
    } else {
        turboIndicator.style.display = 'none';
        turboBtn.innerHTML = '<span class="btn-icon">🚀</span><span class="btn-text">Turbo</span>';
        turboBtn.disabled = userPoints < 200;
    }
}

// Update Earning UI
function updateEarningUI() {
    document.getElementById('totalEarnings').textContent = userPoints;
    document.getElementById('totalTasks').textContent = totalTasksCompleted;
    document.getElementById('todayEarnings').textContent = todayEarnings;
}

// Update Tasks UI
function updateTasksUI() {
    document.getElementById('tasksTotalPoints').textContent = userPoints;
    document.getElementById('tasksCompleted').textContent = totalTasksCompleted;
    document.getElementById('tasksToday').textContent = completedDailyTasks.length;
}

// 🆕 UPDATED: Profile UI with Telegram ID Display
function updateProfileUI() {
    const profileTelegramId = document.getElementById('profileTelegramId');
    
    // 🆕 Display Telegram ID in profile
    if (profileTelegramId) {
        if (telegramUsername && telegramUsername !== 'Not set' && telegramUsername !== '') {
            profileTelegramId.textContent = telegramUsername;
            profileTelegramId.style.color = '#4CAF50';
        } else {
            profileTelegramId.textContent = 'Not Set - Tap to Set';
            profileTelegramId.style.color = '#FF6B6B';
        }
    }
    
    // Update other profile stats
    const profileTotalPoints = document.getElementById('profileTotalPoints');
    const profileReferrals = document.getElementById('profileReferrals');
    const profileRewards = document.getElementById('profileRewards');
    
    if (profileTotalPoints) profileTotalPoints.textContent = userPoints;
    if (profileReferrals) profileReferrals.textContent = referralData.referredUsers.length;
    if (profileRewards) profileRewards.textContent = redeemedRewards.length;
}

// Format Time
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Format Numbers
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Update Mining Timer Display
function updateMiningTimerDisplay() {
    document.getElementById('miningTime').textContent = formatTime(miningSeconds);
}

// Toggle Mining
function toggleMining() {
    if (isMining) {
        stopMining();
    } else {
        startMining();
    }
    
    // 🆕 SYNC TO ADMIN PANEL ON MINING ACTION
    syncToAdminPanel();
}

// Start Mining
function startMining() {
    if (isMining) return;
    
    console.log('🟢 Starting mining session...');
    isMining = true;
    currentSessionStart = miningSeconds;
    sessionCount++;
    
    if (miningInterval) {
        clearInterval(miningInterval);
    }
    
    let lastMinuteCheck = Math.floor(miningSeconds / 60);
    let lastHourCheck = Math.floor(miningSeconds / 3600);
    
    miningInterval = setInterval(() => {
        miningSeconds++;
        totalMiningTime++;
        
        updateMiningTimerDisplay();
        
        const currentMinute = Math.floor(miningSeconds / 60);
        const currentHour = Math.floor(miningSeconds / 3600);
        
        if (currentMinute > lastMinuteCheck) {
            const pointsToAdd = getMiningRate();
            userPoints += pointsToAdd;
            totalPointsEarned += pointsToAdd;
            todayEarnings += pointsToAdd;
            lastMinuteCheck = currentMinute;
            
            // Add to transaction history
            addTransaction('Mining Earnings', pointsToAdd, 'earning', 'mining');
            
            console.log(`⛏️ +${pointsToAdd.toFixed(1)} Points from mining!`);
            updateUI();
            
            // 🆕 SYNC TO ADMIN PANEL ON POINTS EARN
            syncToAdminPanel();
        }
        
        if (currentHour > lastHourCheck) {
            totalMiningHours++;
            lastHourCheck = currentHour;
            hourlyBonusAvailable = true;
            
            console.log('⏰ Hour completed! Hourly bonus available.');
            showNotification('⏰ Hour completed! Claim your hourly bonus!', 'info');
            updateUI();
        }
        
        const currentSessionTime = miningSeconds - currentSessionStart;
        if (currentSessionTime > bestSessionTime) {
            bestSessionTime = currentSessionTime;
        }
        
        if (miningSeconds % 30 === 0) {
            saveMiningState();
        }
        
    }, 1000);
    
    showNotification('⛏️ Mining Started! Earning points...', 'success');
    saveMiningState();
    updateUI();
}

// Stop Mining
function stopMining() {
    if (!isMining) return;
    
    console.log('🔴 Stopping mining session...');
    isMining = false;
    
    if (miningInterval) {
        clearInterval(miningInterval);
        miningInterval = null;
    }
    
    showNotification('⏹️ Mining Stopped. Points saved!', 'info');
    saveMiningState();
    updateUI();
}

// Upgrade Functions
function upgradeSpeed() {
    const upgradeCost = SPEED_UPGRADES[speedLevel - 1].cost;
    
    if (userPoints >= upgradeCost) {
        userPoints -= upgradeCost;
        speedLevel++;
        
        // Add to transaction history
        addTransaction('Speed Upgrade', -upgradeCost, 'spending', 'upgrade');
        
        console.log('⚡ Speed upgraded to level:', speedLevel);
        showNotification(`⚡ Mining Speed upgraded to Level ${speedLevel}!`, 'success');
        
        saveMiningState();
        updateUI();
        
        // 🆕 SYNC TO ADMIN PANEL ON UPGRADE
        syncToAdminPanel();
    } else {
        showNotification('❌ Not enough points for speed upgrade!', 'warning');
    }
}

function upgradeMultiplier() {
    const upgradeCost = MULTIPLIER_UPGRADES[multiplierLevel - 1].cost;
    
    if (userPoints >= upgradeCost) {
        userPoints -= upgradeCost;
        multiplierLevel++;
        
        // Add to transaction history
        addTransaction('Multiplier Upgrade', -upgradeCost, 'spending', 'upgrade');
        
        console.log('💰 Multiplier upgraded to level:', multiplierLevel);
        showNotification(`💰 Point Multiplier upgraded to Level ${multiplierLevel}!`, 'success');
        
        saveMiningState();
        updateUI();
        
        // 🆕 SYNC TO ADMIN PANEL ON UPGRADE
        syncToAdminPanel();
    } else {
        showNotification('❌ Not enough points for multiplier upgrade!', 'warning');
    }
}

function upgradeLevel() {
    const nextLevel = miningLevel + 1;
    const upgradeCost = LEVEL_DATA[nextLevel].cost;
    
    if (userPoints >= upgradeCost) {
        userPoints -= upgradeCost;
        miningLevel = nextLevel;
        
        // Add to transaction history
        addTransaction('Level Upgrade', -upgradeCost, 'spending', 'upgrade');
        
        console.log('🏆 Mining level upgraded to:', LEVEL_DATA[miningLevel].name);
        showNotification(`🏆 Congratulations! You are now a ${LEVEL_DATA[miningLevel].name} Miner!`, 'success');
        
        saveMiningState();
        updateUI();
        
        // 🆕 SYNC TO ADMIN PANEL ON UPGRADE
        syncToAdminPanel();
    } else {
        showNotification('❌ Not enough points for level upgrade!', 'warning');
    }
}

// Turbo System
function activateTurbo() {
    if (turboActive) return;
    
    const turboCost = 200;
    if (userPoints >= turboCost) {
        userPoints -= turboCost;
        turboActive = true;
        turboTimeLeft = 300;
        
        // Add to transaction history
        addTransaction('Turbo Boost', -turboCost, 'spending', 'boost');
        
        console.log('🚀 Turbo activated!');
        showNotification('🚀 TURBO MODE ACTIVATED! 2x points for 5 minutes!', 'success');
        
        startTurboCountdown();
        saveMiningState();
        updateUI();
        
        // 🆕 SYNC TO ADMIN PANEL ON TURBO
        syncToAdminPanel();
    } else {
        showNotification('❌ Not enough points for turbo boost!', 'warning');
    }
}

function startTurboCountdown() {
    const turboInterval = setInterval(() => {
        if (turboActive && turboTimeLeft > 0) {
            turboTimeLeft--;
            updateTurboUI();
        } else {
            turboActive = false;
            clearInterval(turboInterval);
            console.log('🔄 Turbo mode ended');
            showNotification('🔄 Turbo mode ended. Points back to normal rate.', 'info');
            saveMiningState();
            updateUI();
            
            // 🆕 SYNC TO ADMIN PANEL ON TURBO END
            syncToAdminPanel();
        }
    }, 1000);
}

// Bonus Functions
function claimDailyBonus() {
    if (dailyBonusClaimed) {
        showNotification('❌ Daily bonus already claimed!', 'warning');
        return;
    }
    
    const bonusAmount = 100 + (loginStreak * 10);
    
    userPoints += bonusAmount;
    totalPointsEarned += bonusAmount;
    todayEarnings += bonusAmount;
    dailyBonusClaimed = true;
    lastBonusClaim = Date.now();
    
    // Add to transaction history
    addTransaction('Daily Bonus', bonusAmount, 'earning', 'bonus');
    
    console.log('🎁 Daily bonus claimed:', bonusAmount);
    showNotification(`🎁 Daily Bonus! +${bonusAmount} Points (Streak: ${loginStreak})`, 'success');
    
    saveMiningState();
    updateUI();
    
    // 🆕 SYNC TO ADMIN PANEL ON BONUS
    syncToAdminPanel();
}

function claimHourlyBonus() {
    if (!hourlyBonusAvailable) {
        showNotification('❌ Hourly bonus not available yet!', 'warning');
        return;
    }
    
    const bonusAmount = 25;
    userPoints += bonusAmount;
    totalPointsEarned += bonusAmount;
    todayEarnings += bonusAmount;
    hourlyBonusAvailable = false;
    lastHourlyBonus = Date.now();
    
    // Add to transaction history
    addTransaction('Hourly Bonus', bonusAmount, 'earning', 'bonus');
    
    console.log('⏰ Hourly bonus claimed:', bonusAmount);
    showNotification(`⏰ Hourly Bonus! +${bonusAmount} Points`, 'success');
    
    saveMiningState();
    updateUI();
    
    // 🆕 SYNC TO ADMIN PANEL ON BONUS
    syncToAdminPanel();
}

function claimStreakBonus() {
    const bonusAmount = loginStreak * 10;
    userPoints += bonusAmount;
    totalPointsEarned += bonusAmount;
    todayEarnings += bonusAmount;
    
    // Add to transaction history
    addTransaction('Streak Bonus', bonusAmount, 'earning', 'bonus');
    
    console.log('🔥 Streak bonus claimed:', bonusAmount);
    showNotification(`🔥 Streak Bonus! +${bonusAmount} Points (Day ${loginStreak})`, 'success');
    
    saveMiningState();
    updateUI();
    
    // 🆕 SYNC TO ADMIN PANEL ON BONUS
    syncToAdminPanel();
}

function claimBoost() {
    const boostAmount = 50;
    userPoints += boostAmount;
    totalPointsEarned += boostAmount;
    todayEarnings += boostAmount;
    
    // Add to transaction history
    addTransaction('Daily Boost', boostAmount, 'earning', 'bonus');
    
    console.log('🎯 Boost claimed:', boostAmount);
    showNotification(`🎯 Boost! +${boostAmount} Points`, 'success');
    
    saveMiningState();
    updateUI();
    
    // 🆕 SYNC TO ADMIN PANEL ON BOOST
    syncToAdminPanel();
}

// Tab Switching Function
function switchTab(tabName) {
    document.querySelectorAll('.content-page').forEach(page => {
        page.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(tabName + 'Content').classList.add('active');
    
    // Set active nav button based on tab name
    if (tabName === 'mining') {
        document.querySelector('.nav-btn:nth-child(1)').classList.add('active');
    } else if (tabName === 'earn') {
        document.querySelector('.nav-btn:nth-child(2)').classList.add('active');
    } else if (tabName === 'tasks') {
        document.querySelector('.nav-btn:nth-child(3)').classList.add('active');
    } else if (tabName === 'profile') {
        document.querySelector('.nav-btn:nth-child(4)').classList.add('active');
    }
    
    updateUI();
}

// Video System Improvements
function openVideoModal(videoId, points, title, thumbnail, channel) {
    if (watchedVideos.includes(videoId)) {
        showNotification('❌ You already earned points for this video!', 'warning');
        return;
    }
    
    // Store current video data
    currentVideoData = {
        videoId: videoId,
        points: points,
        title: title,
        thumbnail: thumbnail,
        channel: channel
    };
    
    // Reset timer
    currentVideoTimeLeft = 60; // 1 minute
    
    // Update modal content
    document.getElementById('modalVideoThumbnail').src = thumbnail;
    document.getElementById('modalVideoTitle').textContent = title;
    document.getElementById('modalVideoChannel').textContent = channel;
    document.getElementById('modalVideoPoints').textContent = points;
    document.getElementById('modalTimerLarge').textContent = formatTime(currentVideoTimeLeft);
    document.getElementById('modalProgressText').textContent = 'Keep watching...';
    
    // Reset progress bar
    document.getElementById('timerProgressFill').style.width = '0%';
    
    // Show modal
    document.getElementById('videoWatchModal').classList.add('active');
    
    // Start countdown
    startVideoTimer();
}

function closeVideoModal() {
    if (currentVideoTimer) {
        clearInterval(currentVideoTimer);
        currentVideoTimer = null;
    }
    
    document.getElementById('videoWatchModal').classList.remove('active');
    currentVideoData = null;
    
    showNotification('⏹️ Video watch cancelled. No points earned.', 'warning');
}

function startVideoTimer() {
    currentVideoTimer = setInterval(() => {
        currentVideoTimeLeft--;
        
        // Update timer display
        document.getElementById('modalTimerLarge').textContent = formatTime(currentVideoTimeLeft);
        
        // Update progress bar
        const progress = ((60 - currentVideoTimeLeft) / 60) * 100;
        document.getElementById('timerProgressFill').style.width = `${progress}%`;
        
        // Update progress text
        if (currentVideoTimeLeft <= 10) {
            document.getElementById('modalProgressText').textContent = 'Almost there...';
        } else if (currentVideoTimeLeft <= 30) {
            document.getElementById('modalProgressText').textContent = 'Keep watching...';
        }
        
        // Check if timer completed
        if (currentVideoTimeLeft <= 0) {
            completeVideoWatch();
        }
    }, 1000);
}

function completeVideoWatch() {
    if (currentVideoTimer) {
        clearInterval(currentVideoTimer);
        currentVideoTimer = null;
    }
    
    // Award points
    const { videoId, points, title } = currentVideoData;
    
    watchedVideos.push(videoId);
    userPoints += points;
    totalPointsEarned += points;
    todayEarnings += points;
    totalTasksCompleted++;
    
    // Add to transaction history
    addTransaction(`Video: ${title.substring(0, 20)}...`, points, 'earning', 'video');
    
    // Update UI
    updateUI();
    saveMiningState();
    
    // Close video modal
    document.getElementById('videoWatchModal').classList.remove('active');
    
    // Show points claim popup
    showPointsClaimPopup(points, title);
    
    // Refresh video list if on video section
    if (document.getElementById('videoResultsContainer')) {
        setTimeout(() => searchVideos(), 500);
    }
    
    currentVideoData = null;
    
    // 🆕 SYNC TO ADMIN PANEL ON VIDEO COMPLETION
    syncToAdminPanel();
}

// Points Claim Popup
function showPointsClaimPopup(points, title) {
    document.getElementById('claimedPoints').textContent = points;
    document.getElementById('pointsClaimTitle').textContent = 'Points Claimed!';
    document.getElementById('pointsClaimMessage').textContent = `You earned ${points} points for watching "${title.substring(0, 30)}..."`;
    
    document.getElementById('pointsClaimPopup').classList.add('active');
    document.getElementById('pointsClaimPopup').classList.add('points-claimed');
}

function closePointsClaimPopup() {
    document.getElementById('pointsClaimPopup').classList.remove('active');
    document.getElementById('pointsClaimPopup').classList.remove('points-claimed');
}

// Success Popup System
function showSuccessPopup(title, message) {
    document.getElementById('successTitle').textContent = title;
    document.getElementById('successMessage').textContent = message;
    document.getElementById('successPopup').classList.add('active');
}

function closeSuccessPopup() {
    document.getElementById('successPopup').classList.remove('active');
}

// Wallet History System
function showWalletHistory() {
    document.getElementById('walletHistoryModal').classList.add('active');
    showAllHistory();
}

function closeWalletHistory() {
    document.getElementById('walletHistoryModal').classList.remove('active');
}

function showAllHistory() {
    document.querySelectorAll('.history-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    displayTransactionHistory(transactionHistory);
    updateHistoryStats();
}

function showEarningHistory() {
    document.querySelectorAll('.history-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    const earningHistory = transactionHistory.filter(transaction => transaction.type === 'earning');
    displayTransactionHistory(earningHistory);
    updateHistoryStats();
}

function showSpendingHistory() {
    document.querySelectorAll('.history-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    const spendingHistory = transactionHistory.filter(transaction => transaction.type === 'spending');
    displayTransactionHistory(spendingHistory);
    updateHistoryStats();
}

function displayTransactionHistory(transactions) {
    const historyList = document.getElementById('historyList');
    
    if (transactions.length === 0) {
        historyList.innerHTML = '<div class="no-history">No transactions found</div>';
        return;
    }
    
    let html = '';
    
    transactions.forEach(transaction => {
        const date = new Date(transaction.timestamp);
        const timeString = date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
        
        html += `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-title">${transaction.description}</div>
                    <div class="transaction-desc">${getCategoryIcon(transaction.category)} ${formatCategory(transaction.category)} • ${timeString}</div>
                </div>
                <div class="transaction-details">
                    <div class="transaction-amount ${transaction.type}">
                        ${transaction.type === 'earning' ? '+' : '-'}${transaction.amount}
                    </div>
                    <div class="transaction-time">${date.toLocaleDateString()}</div>
                </div>
            </div>
        `;
    });
    
    historyList.innerHTML = html;
}

function updateHistoryStats() {
    document.getElementById('totalEarnedHistory').textContent = formatNumber(totalEarned);
    document.getElementById('todayEarnedHistory').textContent = formatNumber(todayEarnings);
    document.getElementById('totalSpentHistory').textContent = formatNumber(totalSpent);
}

function getCategoryIcon(category) {
    const icons = {
        'mining': '⛏️',
        'video': '🎬',
        'task': '📋',
        'bonus': '🎁',
        'upgrade': '⚡',
        'boost': '🚀',
        'referral': '👥',
        'reward': '💰',
        'other': '📊'
    };
    return icons[category] || '📊';
}

function formatCategory(category) {
    const categories = {
        'mining': 'Mining',
        'video': 'Video',
        'task': 'Task',
        'bonus': 'Bonus',
        'upgrade': 'Upgrade',
        'boost': 'Boost',
        'referral': 'Referral',
        'reward': 'Reward',
        'other': 'Other'
    };
    return categories[category] || 'Other';
}

// Earning Section Functions
function showVideoSection() {
    document.getElementById('earnAppContent').innerHTML = `
        <div class="earn-page">
            <div class="platform-header">
                <button onclick="showHomePage()" class="back-btn">← Back</button>
                <div class="platform-header-icon">🎬</div>
                <h3>YouTube Videos</h3>
            </div>
            
            <div class="section-title">
                <h3>Watch & Earn</h3>
                <p class="section-subtitle">Watch videos for 1 minute to earn points</p>
            </div>

            <div class="video-search">
                <input type="text" class="search-input" id="videoSearch" placeholder="Search for videos (music, gaming, comedy, etc.)" value="trending shorts">
                <button class="search-btn" onclick="searchVideos()">🔍 Search Videos</button>
            </div>
            
            <div id="videoResultsContainer">
                <div class="loading">
                    <div class="spinner"></div>
                    <p>Loading trending videos...</p>
                </div>
            </div>
        </div>
    `;
    
    // Auto-load videos
    setTimeout(() => {
        searchVideos();
    }, 1000);
}

function showTelegramSection() {
    document.getElementById('earnAppContent').innerHTML = `
        <div class="earn-page">
            <div class="platform-header">
                <button onclick="showHomePage()" class="back-btn">← Back</button>
                <div class="platform-header-icon">📱</div>
                <h3>Telegram Tasks</h3>
            </div>
            
            <div class="section-title">
                <h3>Telegram Channels</h3>
                <p class="section-subtitle">Join channels to earn points</p>
            </div>
            
            <div class="task-category">
                <h4>🤖 Crypto & Tech</h4>
                <div class="tasks-grid">
                    <div class="task-card ${completedTasks.includes('telegram1') ? 'task-completed' : ''}">
                        <div class="task-icon">💰</div>
                        <div class="task-content">
                            <div class="task-title">Crypto News Channel</div>
                            <div class="task-desc">Join our crypto updates channel</div>
                            <div class="task-points">+25 points</div>
                        </div>
                        <button class="task-btn" onclick="completeTask('telegram1', 25, 'Crypto Channel')" 
                                ${completedTasks.includes('telegram1') ? 'disabled' : ''}>
                            ${completedTasks.includes('telegram1') ? 'Joined ✓' : 'Join'}
                        </button>
                    </div>
                    
                    <div class="task-card ${completedTasks.includes('telegram2') ? 'task-completed' : ''}">
                        <div class="task-icon">💻</div>
                        <div class="task-content">
                            <div class="task-title">Tech Updates</div>
                            <div class="task-desc">Latest technology news</div>
                            <div class="task-points">+20 points</div>
                        </div>
                        <button class="task-btn" onclick="completeTask('telegram2', 20, 'Tech Channel')"
                                ${completedTasks.includes('telegram2') ? 'disabled' : ''}>
                            ${completedTasks.includes('telegram2') ? 'Joined ✓' : 'Join'}
                        </button>
                    </div>
                </div>
            </div>

            <div class="task-category">
                <h4>🎮 Entertainment</h4>
                <div class="tasks-grid">
                    <div class="task-card ${completedTasks.includes('telegram3') ? 'task-completed' : ''}">
                        <div class="task-icon">🎮</div>
                        <div class="task-content">
                            <div class="task-title">Gaming Community</div>
                            <div class="task-desc">Join gaming discussions</div>
                            <div class="task-points">+18 points</div>
                        </div>
                        <button class="task-btn" onclick="completeTask('telegram3', 18, 'Gaming Channel')"
                                ${completedTasks.includes('telegram3') ? 'disabled' : ''}>
                            ${completedTasks.includes('telegram3') ? 'Joined ✓' : 'Join'}
                        </button>
                    </div>
                    
                    <div class="task-card ${completedTasks.includes('telegram4') ? 'task-completed' : ''}">
                        <div class="task-icon">🎬</div>
                        <div class="task-content">
                            <div class="task-title">Movie Reviews</div>
                            <div class="task-desc">Latest movie discussions</div>
                            <div class="task-points">+15 points</div>
                        </div>
                        <button class="task-btn" onclick="completeTask('telegram4', 15, 'Movie Channel')"
                                ${completedTasks.includes('telegram4') ? 'disabled' : ''}>
                            ${completedTasks.includes('telegram4') ? 'Joined ✓' : 'Join'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showInstagramSection() {
    document.getElementById('earnAppContent').innerHTML = `
        <div class="earn-page">
            <div class="platform-header">
                <button onclick="showHomePage()" class="back-btn">← Back</button>
                <div class="platform-header-icon">📷</div>
                <h3>Instagram Reels</h3>
            </div>
            
            <div class="section-title">
                <h3>Watch Reels</h3>
                <p class="section-subtitle">Watch reels for 1 minute to earn points</p>
            </div>
            
            <div class="videos-grid">
                <div class="video-card ${watchedVideos.includes('instagram1') ? 'video-completed' : ''}" 
                     onclick="${watchedVideos.includes('instagram1') ? '' : `openVideoModal('instagram1', 15, 'Fashion Trends Reel 2024', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&h=200&fit=crop', '@fashion.world')`}">
                    <div class="video-thumbnail">
                        <img src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&h=200&fit=crop" alt="Instagram Reel">
                        <div class="points-badge">+15</div>
                        <div class="platform-badge">Instagram</div>
                        <div class="video-duration">0:30</div>
                        ${watchedVideos.includes('instagram1') ? '<div class="video-completed-badge">✓ Watched</div>' : ''}
                    </div>
                    <div class="video-info">
                        <div class="video-title">Fashion Trends Reel 2024</div>
                        <div class="video-channel">@fashion.world • 2.4M views</div>
                    </div>
                </div>
                
                <div class="video-card ${watchedVideos.includes('instagram2') ? 'video-completed' : ''}" 
                     onclick="${watchedVideos.includes('instagram2') ? '' : `openVideoModal('instagram2', 12, 'Travel Adventures Reel', 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=200&fit=crop', '@travel.diary')`}">
                    <div class="video-thumbnail">
                        <img src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=200&fit=crop" alt="Instagram Reel">
                        <div class="points-badge">+12</div>
                        <div class="platform-badge">Instagram</div>
                        <div class="video-duration">0:45</div>
                        ${watchedVideos.includes('instagram2') ? '<div class="video-completed-badge">✓ Watched</div>' : ''}
                    </div>
                    <div class="video-info">
                        <div class="video-title">Travel Adventures Reel</div>
                        <div class="video-channel">@travel.diary • 1.8M views</div>
                    </div>
                </div>

                <div class="video-card ${watchedVideos.includes('instagram3') ? 'video-completed' : ''}" 
                     onclick="${watchedVideos.includes('instagram3') ? '' : `openVideoModal('instagram3', 18, 'Quick Cooking Recipes', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop', '@cooking.master')`}">
                    <div class="video-thumbnail">
                        <img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop" alt="Instagram Reel">
                        <div class="points-badge">+18</div>
                        <div class="platform-badge">Instagram</div>
                        <div class="video-duration">1:15</div>
                        ${watchedVideos.includes('instagram3') ? '<div class="video-completed-badge">✓ Watched</div>' : ''}
                    </div>
                    <div class="video-info">
                        <div class="video-title">Quick Cooking Recipes</div>
                        <div class="video-channel">@cooking.master • 3.1M views</div>
                    </div>
                </div>

                <div class="video-card ${watchedVideos.includes('instagram4') ? 'video-completed' : ''}" 
                     onclick="${watchedVideos.includes('instagram4') ? '' : `openVideoModal('instagram4', 14, 'Daily Fitness Challenge', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop', '@fitness.coach')`}">
                    <div class="video-thumbnail">
                        <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop" alt="Instagram Reel">
                        <div class="points-badge">+14</div>
                        <div class="platform-badge">Instagram</div>
                        <div class="video-duration">0:55</div>
                        ${watchedVideos.includes('instagram4') ? '<div class="video-completed-badge">✓ Watched</div>' : ''}
                    </div>
                    <div class="video-info">
                        <div class="video-title">Daily Fitness Challenge</div>
                        <div class="video-channel">@fitness.coach • 2.7M views</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showTwitterSection() {
    document.getElementById('earnAppContent').innerHTML = `
        <div class="earn-page">
            <div class="platform-header">
                <button onclick="showHomePage()" class="back-btn">← Back</button>
                <div class="platform-header-icon">🐦</div>
                <h3>Twitter Tasks</h3>
            </div>
            
            <div class="section-title">
                <h3>Twitter Engagement</h3>
                <p class="section-subtitle">Complete tasks to earn points</p>
            </div>
            
            <div class="task-category">
                <h4>📱 Basic Tasks</h4>
                <div class="tasks-grid">
                    <div class="task-card ${completedTasks.includes('twitter1') ? 'task-completed' : ''}">
                        <div class="task-icon">❤️</div>
                        <div class="task-content">
                            <div class="task-title">Like Our Tweet</div>
                            <div class="task-desc">Like our latest tweet</div>
                            <div class="task-points">+8 points</div>
                        </div>
                        <button class="task-btn" onclick="completeTask('twitter1', 8, 'Like Tweet')"
                                ${completedTasks.includes('twitter1') ? 'disabled' : ''}>
                            ${completedTasks.includes('twitter1') ? 'Liked ✓' : 'Like'}
                        </button>
                    </div>
                    
                    <div class="task-card ${completedTasks.includes('twitter2') ? 'task-completed' : ''}">
                        <div class="task-icon">🔄</div>
                        <div class="task-content">
                            <div class="task-title">Retweet Post</div>
                            <div class="task-desc">Retweet to your followers</div>
                            <div class="task-points">+12 points</div>
                        </div>
                        <button class="task-btn" onclick="completeTask('twitter2', 12, 'Retweet')"
                                ${completedTasks.includes('twitter2') ? 'disabled' : ''}>
                            ${completedTasks.includes('twitter2') ? 'Retweeted ✓' : 'Retweet'}
                        </button>
                    </div>
                </div>
            </div>

            <div class="task-category">
                <h4>👤 Follow Tasks</h4>
                <div class="tasks-grid">
                    <div class="task-card ${completedTasks.includes('twitter3') ? 'task-completed' : ''}">
                        <div class="task-icon">👤</div>
                        <div class="task-content">
                            <div class="task-title">Follow Our Account</div>
                            <div class="task-desc">Follow our Twitter account</div>
                            <div class="task-points">+15 points</div>
                        </div>
                        <button class="task-btn" onclick="completeTask('twitter3', 15, 'Follow Twitter')"
                                ${completedTasks.includes('twitter3') ? 'disabled' : ''}>
                            ${completedTasks.includes('twitter3') ? 'Following ✓' : 'Follow'}
                        </button>
                    </div>
                    
                    <div class="task-card ${completedTasks.includes('twitter4') ? 'task-completed' : ''}">
                        <div class="task-icon">💬</div>
                        <div class="task-content">
                            <div class="task-title">Reply to Tweet</div>
                            <div class="task-desc">Comment on our tweet</div>
                            <div class="task-points">+10 points</div>
                        </div>
                        <button class="task-btn" onclick="completeTask('twitter4', 10, 'Reply Tweet')"
                                ${completedTasks.includes('twitter4') ? 'disabled' : ''}>
                            ${completedTasks.includes('twitter4') ? 'Replied ✓' : 'Reply'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showHomePage() {
    document.getElementById('earnAppContent').innerHTML = `
        <div class="welcome-section">
            <div class="welcome-icon">🚀</div>
            <h3>Welcome to TapEarn!</h3>
            <p>Click any platform to start earning points instantly</p>
            
            <div class="platforms-grid">
                <div class="platform-card" onclick="showVideoSection()">
                    <span class="platform-icon">🎬</span>
                    <span class="platform-name">YouTube Videos</span>
                    <span class="platform-points">+10-20 points</span>
                    <span class="platform-time">⏱️ 1 min watch</span>
                </div>
                <div class="platform-card" onclick="showTelegramSection()">
                    <span class="platform-icon">📱</span>
                    <span class="platform-name">Telegram Tasks</span>
                    <span class="platform-points">+15-30 points</span>
                    <span class="platform-time">⚡ Instant</span>
                </div>
                <div class="platform-card" onclick="showInstagramSection()">
                    <span class="platform-icon">📷</span>
                    <span class="platform-name">Instagram Reels</span>
                    <span class="platform-points">+12-25 points</span>
                    <span class="platform-time">⏱️ 1 min watch</span>
                </div>
                <div class="platform-card" onclick="showTwitterSection()">
                    <span class="platform-icon">🐦</span>
                    <span class="platform-name">Twitter Tasks</span>
                    <span class="platform-points">+8-20 points</span>
                    <span class="platform-time">⚡ Instant</span>
                </div>
            </div>

            <div class="earn-stats">
                <div class="earn-stat" onclick="showWalletHistory()">
                    <div class="stat-number" id="totalEarnings">${userPoints}</div>
                    <div class="stat-label">Total Points</div>
                </div>
                <div class="earn-stat">
                    <div class="stat-number" id="totalTasks">${totalTasksCompleted}</div>
                    <div class="stat-label">Tasks Done</div>
                </div>
                <div class="earn-stat">
                    <div class="stat-number" id="todayEarnings">${todayEarnings}</div>
                    <div class="stat-label">Today's Points</div>
                </div>
            </div>
        </div>
    `;
}

// Tasks Section Functions
function showTasksHomePage() {
    document.getElementById('tasksAppContent').innerHTML = `
        <div class="welcome-section">
            <div class="welcome-icon">📋</div>
            <h3>Task Center</h3>
            <p>Complete different types of tasks to maximize your earnings</p>
            
            <div class="platforms-grid">
                <div class="platform-card" onclick="showFollowSection()">
                    <span class="platform-icon">👥</span>
                    <span class="platform-name">Follow & Earn</span>
                    <span class="platform-points">+20-35 points</span>
                    <span class="platform-time">⚡ Instant</span>
                </div>
                <div class="platform-card" onclick="showDailyTasksSection()">
                    <span class="platform-icon">📅</span>
                    <span class="platform-name">Daily Tasks</span>
                    <span class="platform-points">+15-50 points</span>
                    <span class="platform-time">📅 Daily</span>
                </div>
                <div class="platform-card" onclick="showSocialTasksSection()">
                    <span class="platform-icon">🌐</span>
                    <span class="platform-name">Social Tasks</span>
                    <span class="platform-points">+20-50 points</span>
                    <span class="platform-time">⚡ Instant</span>
                </div>
            </div>

            <div class="earn-stats">
                <div class="earn-stat" onclick="showWalletHistory()">
                    <div class="stat-number" id="tasksTotalPoints">${userPoints}</div>
                    <div class="stat-label">Total Points</div>
                </div>
                <div class="earn-stat">
                    <div class="stat-number" id="tasksCompleted">${totalTasksCompleted}</div>
                    <div class="stat-label">Tasks Done</div>
                </div>
                <div class="earn-stat">
                    <div class="stat-number" id="tasksToday">${completedDailyTasks.length}</div>
                    <div class="stat-label">Today's Tasks</div>
                </div>
            </div>
        </div>
    `;
}

// 👥 FOLLOW & EARN SYSTEM
function showFollowSection() {
    document.getElementById('tasksAppContent').innerHTML = `
        <div class="earn-page">
            <div class="platform-header">
                <button onclick="showTasksHomePage()" class="back-btn">← Back</button>
                <div class="platform-header-icon">👥</div>
                <h3>Follow & Earn</h3>
            </div>
            
            <div class="follow-platform-tabs">
                <button class="platform-tab active" onclick="showAllFollowTasks()">All</button>
                <button class="platform-tab" onclick="showInstagramFollow()">Instagram</button>
                <button class="platform-tab" onclick="showYouTubeFollow()">YouTube</button>
                <button class="platform-tab" onclick="showTikTokFollow()">TikTok</button>
            </div>
            
            <div id="followResultsContainer">
                <div class="loading">
                    <div class="spinner"></div>
                    <p>Loading follow tasks...</p>
                </div>
            </div>
        </div>
    `;
    showAllFollowTasks();
}

function showAllFollowTasks() {
    document.querySelectorAll('.platform-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    const allTasks = [
        {
            id: 'follow1',
            platform: 'instagram',
            username: 'fashion.ista',
            followers: '2.5M',
            points: 25,
            description: 'Follow for fashion tips'
        },
        {
            id: 'follow2',
            platform: 'youtube',
            username: 'TechReview',
            subscribers: '1.8M',
            points: 30,
            description: 'Subscribe for tech reviews'
        },
        {
            id: 'follow3',
            platform: 'tiktok',
            username: 'dance.king',
            followers: '5.2M',
            points: 20,
            description: 'Follow for dance videos'
        }
    ];
    
    displayFollowTasks(allTasks, 'All Follow Tasks');
}

function showInstagramFollow() {
    document.querySelectorAll('.platform-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    const instagramTasks = [
        {
            id: 'ig_follow1',
            platform: 'instagram',
            username: 'travel.world',
            followers: '3.2M',
            points: 28,
            description: 'Travel photography account'
        },
        {
            id: 'ig_follow2',
            platform: 'instagram',
            username: 'food.delight',
            followers: '1.5M',
            points: 22,
            description: 'Food recipes and tips'
        }
    ];
    
    displayFollowTasks(instagramTasks, 'Instagram Follow');
}

function showYouTubeFollow() {
    document.querySelectorAll('.platform-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    const youtubeTasks = [
        {
            id: 'yt_follow1',
            platform: 'youtube',
            username: 'GamingPro',
            subscribers: '2.1M',
            points: 35,
            description: 'Gaming content and streams'
        },
        {
            id: 'yt_follow2',
            platform: 'youtube',
            username: 'CookingMaster',
            subscribers: '1.2M',
            points: 25,
            description: 'Cooking tutorials'
        }
    ];
    
    displayFollowTasks(youtubeTasks, 'YouTube Subscribe');
}

function showTikTokFollow() {
    document.querySelectorAll('.platform-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    const tiktokTasks = [
        {
            id: 'tt_follow1',
            platform: 'tiktok',
            username: 'comedy.king',
            followers: '8.5M',
            points: 18,
            description: 'Funny comedy sketches'
        },
        {
            id: 'tt_follow2',
            platform: 'tiktok',
            username: 'fitness.coach',
            followers: '3.8M',
            points: 20,
            description: 'Fitness and workout tips'
        }
    ];
    
    displayFollowTasks(tiktokTasks, 'TikTok Follow');
}

function displayFollowTasks(tasks, title) {
    const container = document.getElementById('followResultsContainer');
    
    let html = `
        <div class="section-title">
            <h3>👥 ${title}</h3>
            <p class="section-subtitle">Follow accounts and earn points</p>
        </div>
        <div class="follow-tasks-grid">
    `;
    
    tasks.forEach(task => {
        const isCompleted = completedFollowTasks.includes(task.id);
        const platformIcon = getPlatformIcon(task.platform);
        
        html += `
            <div class="follow-task-card ${task.platform}-card">
                <div class="follow-task-header">
                    <div class="platform-icon">${platformIcon}</div>
                    <div class="task-platform">${task.platform.charAt(0).toUpperCase() + task.platform.slice(1)}</div>
                    <div class="task-points">+${task.points}</div>
                </div>
                <div class="follow-task-content">
                    <div class="task-username">@${task.username}</div>
                    <div class="task-stats">${task.followers || task.subscribers} ${task.platform === 'youtube' ? 'subscribers' : 'followers'}</div>
                    <div class="task-description">${task.description}</div>
                </div>
                <div class="follow-task-actions">
                    ${isCompleted ? 
                        '<button class="btn-completed">✅ Completed</button>' : 
                        `<button class="btn-follow" onclick="completeFollowTask('${task.id}', ${task.points}, '${task.username}', '${task.platform}')">Follow +${task.points}</button>`
                    }
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function getPlatformIcon(platform) {
    switch(platform) {
        case 'instagram': return '📷';
        case 'youtube': return '🎬';
        case 'tiktok': return '🎵';
        default: return '👤';
    }
}

function completeFollowTask(taskId, points, username, platform) {
    if (completedFollowTasks.includes(taskId)) {
        showNotification('❌ You have already completed this task!', 'warning');
        return;
    }
    
    userPoints += points;
    completedFollowTasks.push(taskId);
    totalTasksCompleted++;
    todayEarnings += points;
    totalPointsEarned += points;
    
    // Add to transaction history
    addTransaction(`Follow @${username} on ${platform}`, points, 'earning', 'task');
    
    showNotification(`✅ +${points} Points! Followed @${username} on ${platform}`, 'success');
    updateUI();
    saveMiningState();
    
    // 🆕 SYNC TO ADMIN PANEL ON TASK COMPLETION
    syncToAdminPanel();
    
    // Refresh current view
    const activeTab = document.querySelector('.platform-tab.active');
    if (activeTab) {
        activeTab.click();
    }
}

// 📋 DAILY TASKS SYSTEM
function showDailyTasksSection() {
    document.getElementById('tasksAppContent').innerHTML = `
        <div class="earn-page">
            <div class="platform-header">
                <button onclick="showTasksHomePage()" class="back-btn">← Back</button>
                <div class="platform-header-icon">📅</div>
                <h3>Daily Tasks</h3>
            </div>
            
            <div class="tasks-stats">
                <div class="task-stat">
                    <div class="stat-number">${completedDailyTasks.length}</div>
                    <div class="stat-label">Completed</div>
                </div>
                <div class="task-stat">
                    <div class="stat-number">5</div>
                    <div class="stat-label">Total</div>
                </div>
                <div class="task-stat">
                    <div class="stat-number">${calculateTaskPoints()}</div>
                    <div class="stat-label">Earned</div>
                </div>
            </div>
            
            <div id="tasksContainer">
                <div class="loading">
                    <div class="spinner"></div>
                    <p>Loading daily tasks...</p>
                </div>
            </div>
        </div>
    `;
    loadDailyTasks();
}

function loadDailyTasks() {
    const dailyTasks = [
        {
            id: 'daily1',
            title: 'Watch 5 Videos',
            description: 'Watch any 5 videos to earn bonus points',
            points: 25,
            type: 'videos',
            progress: watchedVideos.length,
            target: 5
        },
        {
            id: 'daily2',
            title: 'Mine for 1 Hour',
            description: 'Keep mining active for 1 hour',
            points: 50,
            type: 'mining',
            progress: Math.floor(miningSeconds / 3600),
            target: 1
        },
        {
            id: 'daily3',
            title: 'Follow 3 Accounts',
            description: 'Follow accounts on any platform',
            points: 40,
            type: 'follow',
            progress: completedFollowTasks.length,
            target: 3
        },
        {
            id: 'daily4',
            title: 'Complete Telegram Task',
            description: 'Complete any Telegram task',
            points: 30,
            type: 'telegram',
            progress: completedTasks.filter(task => task.startsWith('telegram')).length,
            target: 1
        },
        {
            id: 'daily5',
            title: 'Like X Tweet',
            description: 'Like any tweet on X',
            points: 15,
            type: 'x',
            progress: completedXTasks.length,
            target: 1
        }
    ];
    
    displayDailyTasks(dailyTasks);
}

function displayDailyTasks(tasks) {
    const container = document.getElementById('tasksContainer');
    
    let html = `
        <div class="section-title">
            <h3>📋 Today's Tasks</h3>
            <p class="section-subtitle">Complete tasks for bonus points</p>
        </div>
        <div class="tasks-list">
    `;
    
    tasks.forEach(task => {
        const isCompleted = completedDailyTasks.includes(task.id);
        const progress = Math.min(task.progress, task.target);
        const percentage = (progress / task.target) * 100;
        
        html += `
            <div class="task-item ${isCompleted ? 'completed' : ''}">
                <div class="task-header">
                    <div class="task-title">${task.title}</div>
                    <div class="task-points">+${task.points}</div>
                </div>
                <div class="task-description">${task.description}</div>
                <div class="task-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percentage}%"></div>
                    </div>
                    <div class="progress-text">${progress}/${task.target}</div>
                </div>
                <div class="task-actions">
                    ${isCompleted ? 
                        '<button class="btn-completed">✅ Completed</button>' : 
                        (progress >= task.target ? 
                            `<button class="btn-claim" onclick="claimTaskReward('${task.id}', ${task.points}, '${task.title}')">Claim +${task.points}</button>` :
                            `<button class="btn-incomplete" onclick="showTaskHelp('${task.type}')">Complete Task</button>`
                        )
                    }
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function claimTaskReward(taskId, points, title) {
    if (completedDailyTasks.includes(taskId)) {
        showNotification('❌ You have already claimed this reward!', 'warning');
        return;
    }
    
    userPoints += points;
    completedDailyTasks.push(taskId);
    totalTasksCompleted++;
    todayEarnings += points;
    totalPointsEarned += points;
    
    // Add to transaction history
    addTransaction(`Daily Task: ${title}`, points, 'earning', 'task');
    
    showNotification(`✅ +${points} Points! "${title}" completed!`, 'success');
    updateUI();
    saveMiningState();
    
    // 🆕 SYNC TO ADMIN PANEL ON TASK REWARD
    syncToAdminPanel();
    
    showDailyTasksSection();
}

function showTaskHelp(taskType) {
    switch(taskType) {
        case 'videos':
            showNotification('💡 Watch videos from the Earn section to complete this task!', 'info');
            break;
        case 'mining':
            showNotification('💡 Start mining from the main screen to complete this task!', 'info');
            break;
        case 'follow':
            showFollowSection();
            break;
        case 'telegram':
            showNotification('💡 Complete Telegram tasks from the Earn section!', 'info');
            break;
        case 'x':
            showNotification('💡 Complete Twitter tasks from the Earn section!', 'info');
            break;
    }
}

function calculateTaskPoints() {
    return completedDailyTasks.reduce((total, taskId) => {
        const task = getTaskById(taskId);
        return total + (task ? task.points : 0);
    }, 0);
}

function getTaskById(taskId) {
    const tasks = [
        { id: 'daily1', points: 25 },
        { id: 'daily2', points: 50 },
        { id: 'daily3', points: 40 },
        { id: 'daily4', points: 30 },
        { id: 'daily5', points: 15 }
    ];
    return tasks.find(task => task.id === taskId);
}

// 🌐 SOCIAL TASKS SYSTEM
function showSocialTasksSection() {
    document.getElementById('tasksAppContent').innerHTML = `
        <div class="earn-page">
            <div class="platform-header">
                <button onclick="showTasksHomePage()" class="back-btn">← Back</button>
                <div class="platform-header-icon">🌐</div>
                <h3>Social Tasks</h3>
            </div>
            
            <div class="social-stats">
                <div class="social-stat">
                    <div class="stat-number">${completedSocialTasks.length}</div>
                    <div class="stat-label">Completed</div>
                </div>
                <div class="social-stat">
                    <div class="stat-number">8</div>
                    <div class="stat-label">Total</div>
                </div>
                <div class="social-stat">
                    <div class="stat-number">${calculateSocialPoints()}</div>
                    <div class="stat-label">Earned</div>
                </div>
            </div>
            
            <div id="socialTasksContainer">
                <div class="loading">
                    <div class="spinner"></div>
                    <p>Loading social tasks...</p>
                </div>
            </div>
        </div>
    `;
    loadSocialTasks();
}

function loadSocialTasks() {
    const socialTasks = [
        {
            id: 'social1',
            title: 'Share App Link',
            description: 'Share TapEarn with friends on social media',
            points: 50,
            platform: 'all',
            type: 'share'
        },
        {
            id: 'social2',
            title: 'Join Telegram Group',
            description: 'Join our official Telegram community',
            points: 30,
            platform: 'telegram',
            type: 'join'
        },
        {
            id: 'social3',
            title: 'Follow on Instagram',
            description: 'Follow our Instagram page for updates',
            points: 25,
            platform: 'instagram',
            type: 'follow'
        },
        {
            id: 'social4',
            title: 'Subscribe YouTube',
            description: 'Subscribe to our YouTube channel',
            points: 35,
            platform: 'youtube',
            type: 'subscribe'
        },
        {
            id: 'social5',
            title: 'Like Facebook Page',
            description: 'Like our official Facebook page',
            points: 20,
            platform: 'facebook',
            type: 'like'
        },
        {
            id: 'social6',
            title: 'Join Discord Server',
            description: 'Join our Discord community',
            points: 40,
            platform: 'discord',
            type: 'join'
        },
        {
            id: 'social7',
            title: 'Follow on X',
            description: 'Follow us on X for news',
            points: 25,
            platform: 'x',
            type: 'follow'
        },
        {
            id: 'social8',
            title: 'Join Reddit Community',
            description: 'Join our subreddit',
            points: 30,
            platform: 'reddit',
            type: 'join'
        }
    ];
    
    displaySocialTasks(socialTasks);
}

function displaySocialTasks(tasks) {
    const container = document.getElementById('socialTasksContainer');
    
    let html = `
        <div class="section-title">
            <h3>🌐 Social Media Tasks</h3>
            <p class="section-subtitle">Connect with us on social media</p>
        </div>
        <div class="social-tasks-grid">
    `;
    
    tasks.forEach(task => {
        const isCompleted = completedSocialTasks.includes(task.id);
        const platformIcon = getSocialPlatformIcon(task.platform);
        
        html += `
            <div class="social-task-card ${task.platform}-card">
                <div class="social-task-header">
                    <div class="platform-icon">${platformIcon}</div>
                    <div class="task-platform">${task.platform.charAt(0).toUpperCase() + task.platform.slice(1)}</div>
                    <div class="task-points">+${task.points}</div>
                </div>
                <div class="social-task-content">
                    <div class="task-title">${task.title}</div>
                    <div class="task-description">${task.description}</div>
                </div>
                <div class="social-task-actions">
                    ${isCompleted ? 
                        '<button class="btn-completed">✅ Completed</button>' : 
                        `<button class="btn-complete" onclick="completeSocialTask('${task.id}', ${task.points}, '${task.title}', '${task.platform}')">Complete</button>`
                    }
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function getSocialPlatformIcon(platform) {
    switch(platform) {
        case 'telegram': return '📱';
        case 'instagram': return '📷';
        case 'youtube': return '🎬';
        case 'facebook': return '👥';
        case 'discord': return '💬';
        case 'x': return '🐦';
        case 'reddit': return '📱';
        case 'all': return '🌐';
        default: return '📱';
    }
}

function completeSocialTask(taskId, points, title, platform) {
    if (completedSocialTasks.includes(taskId)) {
        showNotification('❌ You have already completed this task!', 'warning');
        return;
    }
    
    userPoints += points;
    completedSocialTasks.push(taskId);
    totalTasksCompleted++;
    todayEarnings += points;
    totalPointsEarned += points;
    
    // Add to transaction history
    addTransaction(`Social Task: ${title}`, points, 'earning', 'task');
    
    showNotification(`✅ +${points} Points! "${title}" completed!`, 'success');
    updateUI();
    saveMiningState();
    
    // 🆕 SYNC TO ADMIN PANEL ON SOCIAL TASK
    syncToAdminPanel();
    
    showSocialTasksSection();
}

function calculateSocialPoints() {
    return completedSocialTasks.reduce((total, taskId) => {
        const task = getSocialTaskById(taskId);
        return total + (task ? task.points : 0);
    }, 0);
}

function getSocialTaskById(taskId) {
    const tasks = [
        { id: 'social1', points: 50 },
        { id: 'social2', points: 30 },
        { id: 'social3', points: 25 },
        { id: 'social4', points: 35 },
        { id: 'social5', points: 20 },
        { id: 'social6', points: 40 },
        { id: 'social7', points: 25 },
        { id: 'social8', points: 30 }
    ];
    return tasks.find(task => task.id === taskId);
}

// 💰 REWARDS & CASHIER SYSTEM
function showCashier() {
    document.getElementById('profileAppContent').innerHTML = `
        <div class="earn-page">
            <div class="platform-header">
                <button onclick="showProfileHomePage()" class="back-btn">← Back</button>
                <div class="platform-header-icon">💰</div>
                <h3>Rewards Center</h3>
            </div>
            
            <div class="rewards-stats">
                <div class="reward-stat">
                    <div class="stat-number">${userPoints}</div>
                    <div class="stat-label">Available</div>
                </div>
                <div class="reward-stat">
                    <div class="stat-number">${redeemedRewards.length}</div>
                    <div class="stat-label">Redeemed</div>
                </div>
                <div class="reward-stat">
                    <div class="stat-number">${calculateRedeemedValue()}</div>
                    <div class="stat-label">Total Value</div>
                </div>
            </div>
            
            <div id="rewardsContainer">
                <div class="loading">
                    <div class="spinner"></div>
                    <p>Loading rewards...</p>
                </div>
            </div>
        </div>
    `;
    loadRewards();
}

function loadRewards() {
    const rewards = [
        {
            id: 'reward1',
            name: 'Amazon Gift Card',
            description: '$5 Amazon gift card',
            cost: 1000,
            type: 'giftcard',
            icon: '🛍️',
            category: 'popular'
        },
        {
            id: 'reward2',
            name: 'PayPal Cash',
            description: '$2 PayPal transfer',
            cost: 2000,
            type: 'cash',
            icon: '💸',
            category: 'cash'
        },
        {
            id: 'reward3',
            name: 'Google Play Card',
            description: '$10 Google Play credit',
            cost: 1500,
            type: 'giftcard',
            icon: '📱',
            category: 'entertainment'
        },
        {
            id: 'reward4',
            name: 'Starbucks Card',
            description: '$5 Starbucks gift card',
            cost: 800,
            type: 'giftcard',
            icon: '☕',
            category: 'food'
        },
        {
            id: 'reward5',
            name: 'Netflix Subscription',
            description: '1 Month Netflix basic',
            cost: 3000,
            type: 'subscription',
            icon: '🎬',
            category: 'entertainment'
        },
        {
            id: 'reward6',
            name: 'Uber Voucher',
            description: '$10 Uber ride credit',
            cost: 1200,
            type: 'voucher',
            icon: '🚗',
            category: 'travel'
        }
    ];
    
    displayRewards(rewards);
}

function displayRewards(rewards) {
    const container = document.getElementById('rewardsContainer');
    
    let html = `
        <div class="section-title">
            <h3>💰 Available Rewards</h3>
            <p class="section-subtitle">Redeem your points for amazing rewards</p>
        </div>
        
        <div class="rewards-categories">
            <button class="category-btn active" onclick="filterRewards('all')">All</button>
            <button class="category-btn" onclick="filterRewards('popular')">Popular</button>
            <button class="category-btn" onclick="filterRewards('cash')">Cash</button>
            <button class="category-btn" onclick="filterRewards('giftcard')">Gift Cards</button>
        </div>
        
        <div class="rewards-grid">
    `;
    
    rewards.forEach(reward => {
        const isRedeemed = redeemedRewards.includes(reward.id);
        const canAfford = userPoints >= reward.cost;
        
        html += `
            <div class="reward-card ${reward.category}-card">
                <div class="reward-header">
                    <div class="reward-icon">${reward.icon}</div>
                    <div class="reward-info">
                        <div class="reward-name">${reward.name}</div>
                        <div class="reward-description">${reward.description}</div>
                    </div>
                    <div class="reward-cost">${reward.cost}</div>
                </div>
                <div class="reward-actions">
                    ${isRedeemed ? 
                        '<button class="btn-redeemed">✅ Redeemed</button>' :
                        (canAfford ? 
                            `<button class="btn-redeem" onclick="redeemReward('${reward.id}', ${reward.cost}, '${reward.name}')">Redeem Now</button>` :
                            `<button class="btn-cant-afford" disabled>Need ${reward.cost - userPoints} more</button>`
                        )
                    }
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function filterRewards(category) {
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // In a real app, you would filter the rewards array here
    loadRewards(); // Reload for demo
}

function redeemReward(rewardId, cost, rewardName) {
    if (redeemedRewards.includes(rewardId)) {
        showNotification('❌ You have already redeemed this reward!', 'warning');
        return;
    }
    
    if (userPoints < cost) {
        showNotification(`❌ You need ${cost - userPoints} more points!`, 'warning');
        return;
    }
    
    userPoints -= cost;
    redeemedRewards.push(rewardId);
    
    // Add to transaction history
    addTransaction(`Reward: ${rewardName}`, -cost, 'spending', 'reward');
    
    showNotification(`🎉 Congratulations! You redeemed ${rewardName}`, 'success');
    updateUI();
    saveMiningState();
    
    // 🆕 SYNC TO ADMIN PANEL ON REWARD REDEMPTION
    syncToAdminPanel();
    
    showCashier();
}

function calculateRedeemedValue() {
    const rewards = [
        { id: 'reward1', value: 5 },
        { id: 'reward2', value: 2 },
        { id: 'reward3', value: 10 },
        { id: 'reward4', value: 5 },
        { id: 'reward5', value: 15 },
        { id: 'reward6', value: 10 }
    ];
    
    return redeemedRewards.reduce((total, rewardId) => {
        const reward = rewards.find(r => r.id === rewardId);
        return total + (reward ? reward.value : 0);
    }, 0);
}

// 👥 REFERRAL SYSTEM
function showReferralSystem() {
    document.getElementById('profileAppContent').innerHTML = `
        <div class="earn-page">
            <div class="platform-header">
                <button onclick="showProfileHomePage()" class="back-btn">← Back</button>
                <div class="platform-header-icon">👥</div>
                <h3>Refer & Earn</h3>
            </div>
            
            <div class="referral-stats">
                <div class="referral-stat">
                    <div class="stat-number">${referralData.referredUsers.length}</div>
                    <div class="stat-label">Referred</div>
                </div>
                <div class="referral-stat">
                    <div class="stat-number">${referralData.totalEarned}</div>
                    <div class="stat-label">Earned</div>
                </div>
                <div class="referral-stat">
                    <div class="stat-number">50</div>
                    <div class="stat-label">Per Referral</div>
                </div>
            </div>
            
            <div class="referral-main-card">
                <div class="referral-code">${referralData.referralCode}</div>
                <p class="referral-note">Your unique referral code</p>
                
                <div class="referral-actions">
                    <button class="btn-share" onclick="shareReferral()">📱 Share</button>
                    <button class="btn-copy" onclick="copyReferralCode()">📋 Copy Code</button>
                </div>
            </div>
            
            <div class="referral-benefits">
                <h4>🎁 How It Works</h4>
                <ul>
                    <li>✅ Share your referral code with friends</li>
                    <li>✅ Friends join using YOUR code</li>
                    <li>✅ You get <strong>50 points</strong> instantly</li>
                    <li>✅ Your friend gets <strong>25 bonus points</strong></li>
                    <li>✅ No limit on referrals - earn unlimited!</li>
                </ul>
            </div>
            
            <div class="referral-history">
                <h4>📊 Referral History</h4>
                ${referralData.referredUsers.length > 0 ? 
                    displayReferralHistory() : 
                    '<p class="no-referrals">No referrals yet. Share your code to start earning!</p>'
                }
            </div>
        </div>
    `;
}

function generateReferralCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return 'TAPEARN-' + code;
}

function shareReferral() {
    const referralText = `Join TapEarn and earn free points! Use my referral code: ${referralData.referralCode}\n\nGet 25 bonus points when you sign up! 🎉`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Join TapEarn',
            text: referralText,
            url: window.location.href
        });
    } else {
        copyReferralCode();
    }
}

function copyReferralCode() {
    navigator.clipboard.writeText(referralData.referralCode)
        .then(() => showNotification('✅ Referral code copied!', 'success'))
        .catch(() => showNotification('❌ Failed to copy', 'warning'));
}

function displayReferralHistory() {
    let html = '<div class="referral-list">';
    
    referralData.referredUsers.forEach((user, index) => {
        html += `
            <div class="referral-item">
                <div class="referral-user">
                    <span class="user-avatar">👤</span>
                    <span class="user-name">Friend ${index + 1}</span>
                </div>
                <div class="referral-details">
                    <span class="referral-points">+50 pts</span>
                    <span class="referral-date">${new Date().toLocaleDateString()}</span>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

function addReferral() {
    referralData.referredUsers.push({
        id: Date.now(),
        date: new Date().toISOString(),
        points: 50
    });
    
    referralData.totalEarned += 50;
    userPoints += 50;
    
    // Add to transaction history
    addTransaction('Referral Bonus', 50, 'earning', 'referral');
    
    showNotification('🎉 +50 Points! New referral added!', 'success');
    updateUI();
    saveMiningState();
    
    // 🆕 SYNC TO ADMIN PANEL ON REFERRAL
    syncToAdminPanel();
    
    showReferralSystem();
}

// Demo function to simulate referral
function simulateReferral() {
    addReferral();
}

// 💬 SUPPORT SYSTEM
function showSupport() {
    document.getElementById('profileAppContent').innerHTML = `
        <div class="earn-page">
            <div class="platform-header">
                <button onclick="showProfileHomePage()" class="back-btn">← Back</button>
                <div class="platform-header-icon">💬</div>
                <h3>Support Center</h3>
            </div>
            
            <div class="support-quick-actions">
                <div class="support-card" onclick="showFAQ()">
                    <div class="support-icon">❓</div>
                    <div class="support-title">FAQ</div>
                    <div class="support-desc">Common questions</div>
                </div>
                
                <div class="support-card" onclick="showContactForm()">
                    <div class="support-icon">📧</div>
                    <div class="support-title">Contact</div>
                    <div class="support-desc">Get help</div>
                </div>
                
                <div class="support-card" onclick="showReportForm()">
                    <div class="support-icon">🐛</div>
                    <div class="support-title">Report</div>
                    <div class="support-desc">Report issues</div>
                </div>
                
                <div class="support-card" onclick="showTerms()">
                    <div class="support-icon">📄</div>
                    <div class="support-title">Terms</div>
                    <div class="support-desc">Terms & conditions</div>
                </div>
            </div>
            
            <div class="support-help-section">
                <h4>🚀 Quick Help</h4>
                <div class="help-items">
                    <div class="help-item" onclick="showVideoSection()">
                        <span class="help-icon">🎬</span>
                        <span class="help-text">How to earn from videos?</span>
                    </div>
                    <div class="help-item" onclick="showReferralSystem()">
                        <span class="help-icon">👥</span>
                        <span class="help-text">How referrals work?</span>
                    </div>
                    <div class="help-item" onclick="showCashier()">
                        <span class="help-icon">💰</span>
                        <span class="help-text">How to redeem rewards?</span>
                    </div>
                    <div class="help-item" onclick="showMiningHelp()">
                        <span class="help-icon">⛏️</span>
                        <span class="help-text">Mining not working?</span>
                    </div>
                </div>
            </div>
            
            <div class="support-contact-info">
                <h4>📞 Contact Information</h4>
                <div class="contact-methods">
                    <div class="contact-method">
                        <span class="method-icon">📧</span>
                        <span class="method-text">support@tapearn.com</span>
                    </div>
                    <div class="contact-method">
                        <span class="method-icon">💬</span>
                        <span class="method-text">Live Chat (24/7)</span>
                    </div>
                    <div class="contact-method">
                        <span class="method-icon">📱</span>
                        <span class="method-text">Telegram: @tapearnsupport</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showFAQ() {
    document.getElementById('profileAppContent').innerHTML = `
        <div class="earn-page">
            <div class="platform-header">
                <button onclick="showSupport()" class="back-btn">← Back</button>
                <h3>❓ Frequently Asked Questions</h3>
            </div>
            
            <div class="faq-list">
                <div class="faq-item">
                    <div class="faq-question">How do I earn points?</div>
                    <div class="faq-answer">You can earn points by mining, watching videos, completing tasks, referring friends, and following social accounts.</div>
                </div>
                
                <div class="faq-item">
                    <div class="faq-question">When can I redeem my points?</div>
                    <div class="faq-answer">You can redeem points once you reach the minimum threshold for each reward. Most rewards require at least 1000 points.</div>
                </div>
                
                <div class="faq-item">
                    <div class="faq-question">Is there a daily limit?</div>
                    <div class="faq-answer">No, you can earn unlimited points by completing various tasks and watching videos throughout the day.</div>
                </div>
                
                <div class="faq-item">
                    <div class="faq-question">How do referrals work?</div>
                    <div class="faq-answer">You get 50 points for each friend who joins using your referral code, and they get 25 bonus points when they sign up.</div>
                </div>
                
                <div class="faq-item">
                    <div class="faq-question">Are my points safe?</div>
                    <div class="faq-answer">Yes, all points are stored securely and backed up regularly. We never reset points without notice.</div>
                </div>
                
                <div class="faq-item">
                    <div class="faq-question">Why is my mining not working?</div>
                    <div class="faq-answer">Make sure you have stable internet connection and the app is open. Mining works only when the app is active.</div>
                </div>
            </div>
        </div>
    `;
}

function showContactForm() {
    document.getElementById('profileAppContent').innerHTML = `
        <div class="earn-page">
            <div class="platform-header">
                <button onclick="showSupport()" class="back-btn">← Back</button>
                <h3>📧 Contact Support</h3>
            </div>
            
            <div class="contact-form">
                <div class="form-group">
                    <label for="contactName">Your Name</label>
                    <input type="text" id="contactName" placeholder="Enter your name">
                </div>
                
                <div class="form-group">
                    <label for="contactEmail">Email Address</label>
                    <input type="email" id="contactEmail" placeholder="Enter your email">
                </div>
                
                <div class="form-group">
                    <label for="contactSubject">Subject</label>
                    <select id="contactSubject">
                        <option value="">Select a subject</option>
                        <option value="technical">Technical Issue</option>
                        <option value="account">Account Problem</option>
                        <option value="payment">Rewards Issue</option>
                        <option value="suggestion">Suggestion</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="contactMessage">Message</label>
                    <textarea id="contactMessage" placeholder="Describe your issue or question..." rows="5"></textarea>
                </div>
                
                <button class="submit-btn" onclick="submitContactForm()">Send Message</button>
            </div>
        </div>
    `;
}

function showReportForm() {
    document.getElementById('profileAppContent').innerHTML = `
        <div class="earn-page">
            <div class="platform-header">
                <button onclick="showSupport()" class="back-btn">← Back</button>
                <h3>🐛 Report an Issue</h3>
            </div>
            
            <div class="report-form">
                <div class="form-group">
                    <label for="issueType">Issue Type</label>
                    <select id="issueType">
                        <option value="">Select issue type</option>
                        <option value="video">Video Not Playing</option>
                        <option value="points">Points Not Added</option>
                        <option value="mining">Mining Problem</option>
                        <option value="app">App Crash/Freeze</option>
                        <option value="reward">Reward Not Received</option>
                        <option value="other">Other Issue</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="issueDescription">Description</label>
                    <textarea id="issueDescription" placeholder="Please describe the issue in detail..." rows="5"></textarea>
                </div>
                
                <div class="form-group">
                    <label for="issueSteps">Steps to Reproduce</label>
                    <textarea id="issueSteps" placeholder="What were you doing when the issue occurred?" rows="3"></textarea>
                </div>
                
                <button class="submit-btn" onclick="submitReport()">Submit Report</button>
            </div>
        </div>
    `;
}

function submitContactForm() {
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const subject = document.getElementById('contactSubject').value;
    const message = document.getElementById('contactMessage').value;
    
    if (!name || !email || !subject || !message) {
        showNotification('❌ Please fill all fields!', 'warning');
        return;
    }
    
    showNotification('✅ Message sent successfully! We will respond within 24 hours.', 'success');
    setTimeout(() => showSupport(), 2000);
}

function submitReport() {
    const issueType = document.getElementById('issueType').value;
    const description = document.getElementById('issueDescription').value;
    
    if (!issueType || !description) {
        showNotification('❌ Please fill all required fields!', 'warning');
        return;
    }
    
    showNotification('✅ Issue reported successfully! Our team will investigate.', 'success');
    setTimeout(() => showSupport(), 2000);
}

function showMiningHelp() {
    showNotification('⛏️ Make sure mining is enabled and you have stable internet connection.', 'info');
}

// 📄 TERMS & CONDITIONS
function showTerms() {
    document.getElementById('profileAppContent').innerHTML = `
        <div class="earn-page">
            <div class="platform-header">
                <button onclick="showProfileHomePage()" class="back-btn">← Back</button>
                <h3>📄 Terms & Conditions</h3>
            </div>
            
            <div class="terms-content">
                <div class="terms-section">
                    <h4>1. Acceptance of Terms</h4>
                    <p>By using TapEarn, you agree to these terms and conditions. If you disagree with any part, please discontinue use immediately.</p>
                </div>
                
                <div class="terms-section">
                    <h4>2. Eligibility</h4>
                    <p>You must be at least 13 years old to use this app. Some features may have additional age requirements.</p>
                </div>
                
                <div class="terms-section">
                    <h4>3. Points System</h4>
                    <p>Points are awarded for completing tasks and have no real monetary value. We reserve the right to modify point values and rewards.</p>
                </div>
                
                <div class="terms-section">
                    <h4>4. Prohibited Activities</h4>
                    <ul>
                        <li>Using automated scripts or bots</li>
                        <li>Creating multiple accounts</li>
                        <li>Exploiting system vulnerabilities</li>
                        <li>Sharing inappropriate content</li>
                        <li>Attempting to cheat the system</li>
                    </ul>
                </div>
                
                <div class="terms-section">
                    <h4>5. Account Termination</h4>
                    <p>We may suspend or terminate accounts that violate these terms or engage in fraudulent activities.</p>
                </div>
                
                <div class="terms-section">
                    <h4>6. Privacy Policy</h4>
                    <p>We collect and use your data as described in our Privacy Policy to provide and improve our services.</p>
                </div>
                
                <div class="terms-section">
                    <h4>7. Changes to Terms</h4>
                    <p>We may update these terms periodically. Continued use constitutes acceptance of changes.</p>
                </div>
                
                <div class="terms-section">
                    <h4>8. Limitation of Liability</h4>
                    <p>We are not liable for any indirect, incidental, or consequential damages arising from app usage.</p>
                </div>
                
                <div class="terms-section">
                    <h4>9. Contact Information</h4>
                    <p>For questions about these terms, contact us at legal@tapearn.com</p>
                </div>
            </div>
            
            <div class="terms-actions">
                <button class="terms-agree-btn" onclick="acceptTerms()">
                    I Agree to Terms & Conditions
                </button>
            </div>
        </div>
    `;
}

function acceptTerms() {
    localStorage.setItem('terms_accepted', 'true');
    showNotification('✅ Terms accepted! Thank you for using TapEarn.', 'success');
}

function completeTask(taskId, points, taskName) {
    if (completedTasks.includes(taskId)) {
        showNotification('❌ You already completed this task!', 'warning');
        return;
    }
    
    completedTasks.push(taskId);
    userPoints += points;
    totalPointsEarned += points;
    todayEarnings += points;
    totalTasksCompleted++;
    
    // Add to transaction history
    addTransaction(`Task: ${taskName}`, points, 'earning', 'task');
    
    saveMiningState();
    updateUI();
    
    // 🆕 SYNC TO ADMIN PANEL ON TASK COMPLETION
    syncToAdminPanel();
    
    showNotification(`✅ +${points} Points! ${taskName}`, 'success');
    
    // Refresh the current section to update task states
    setTimeout(() => {
        if (taskId.startsWith('telegram')) showTelegramSection();
        else if (taskId.startsWith('twitter')) showTwitterSection();
        else if (taskId.startsWith('instagram')) showInstagramSection();
    }, 500);
}

// YouTube Video Search Function
async function searchVideos() {
    const searchQuery = document.getElementById('videoSearch').value || 'trending shorts';
    const container = document.getElementById('videoResultsContainer');
    
    container.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Searching for "${searchQuery}"...</p>
        </div>
    `;
    
    try {
        const videos = await searchYouTubeVideos(searchQuery);
        displayYouTubeVideos(videos, searchQuery);
    } catch (error) {
        console.error('YouTube API error:', error);
        showDemoVideos(searchQuery);
    }
}

async function searchYouTubeVideos(query) {
    const apiKey = YOUTUBE_API_KEYS[currentApiKeyIndex];
    
    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=8&key=${apiKey}`
        );
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.items || [];
    } catch (error) {
        // Try next API key
        currentApiKeyIndex = (currentApiKeyIndex + 1) % YOUTUBE_API_KEYS.length;
        if (currentApiKeyIndex === 0) {
            throw error; // All keys failed
        }
        return searchYouTubeVideos(query); // Retry with next key
    }
}

function displayYouTubeVideos(videos, searchQuery) {
    const container = document.getElementById('videoResultsContainer');
    
    if (videos.length === 0) {
        container.innerHTML = `
            <div class="loading-text">
                <p>No videos found for "${searchQuery}"</p>
                <button class="refresh-btn" onclick="searchVideos()">🔄 Try Again</button>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="search-info">
            <p>Found ${videos.length} videos for "${searchQuery}"</p>
            <button class="refresh-btn" onclick="searchVideos()">🔄 Refresh</button>
        </div>
        <div class="videos-grid">
    `;
    
    videos.forEach((video, index) => {
        const videoId = video.id.videoId;
        const thumbnail = video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default.url;
        const title = video.snippet.title;
        const channel = video.snippet.channelTitle;
        const points = 10 + Math.floor(Math.random() * 11); // 10-20 points
        const isWatched = watchedVideos.includes(videoId);
        
        html += `
            <div class="video-card ${isWatched ? 'video-completed' : ''}" 
                 onclick="${isWatched ? '' : `openVideoModal('${videoId}', ${points}, '${title.replace(/'/g, "\\'")}', '${thumbnail}', '${channel}')`}">
                <div class="video-thumbnail">
                    <img src="${thumbnail}" alt="${title}" onerror="this.src='https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&h=200&fit=crop'">
                    <div class="points-badge">+${points}</div>
                    <div class="platform-badge">YouTube</div>
                    <div class="video-duration">1:00</div>
                    ${isWatched ? '<div class="video-completed-badge">✓ Watched</div>' : ''}
                </div>
                <div class="video-info">
                    <div class="video-title">${title}</div>
                    <div class="video-channel">${channel}</div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function showDemoVideos(searchQuery) {
    const container = document.getElementById('videoResultsContainer');
    const demoVideos = [
        {
            id: { videoId: 'demo1' },
            snippet: {
                title: 'Trending Music Shorts 2024 🎵',
                thumbnails: { 
                    medium: { url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=200&fit=crop' }
                },
                channelTitle: 'Music Vibes'
            }
        },
        {
            id: { videoId: 'demo2' },
            snippet: {
                title: 'Funny Comedy Skits 😂',
                thumbnails: { 
                    medium: { url: 'https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=300&h=200&fit=crop' }
                },
                channelTitle: 'Comedy Central'
            }
        },
        {
            id: { videoId: 'demo3' },
            snippet: {
                title: 'Gaming Highlights 🎮',
                thumbnails: { 
                    medium: { url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&h=200&fit=crop' }
                },
                channelTitle: 'Gaming World'
            }
        },
        {
            id: { videoId: 'demo4' },
            snippet: {
                title: 'Cooking Recipes 👨‍🍳',
                thumbnails: { 
                    medium: { url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop' }
                },
                channelTitle: 'Food Network'
            }
        }
    ];
    
    displayYouTubeVideos(demoVideos, searchQuery);
}

// Show Notification
function showNotification(message, type = 'info') {
    document.querySelectorAll('.notification').forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

// 🆕 UPDATED: Profile Home Page with Telegram ID Display
function showProfileHomePage() {
    document.getElementById('profileAppContent').innerHTML = `
        <div class="welcome-section">
            <div class="welcome-icon">👤</div>
            <h3>Your Profile</h3>
            <p>Manage your account, rewards, and settings</p>
            
            <!-- 🆕 Telegram ID Display Card -->
            <div class="telegram-id-card" onclick="showTelegramIdModal()">
                <div class="telegram-icon">📱</div>
                <div class="telegram-info">
                    <div class="telegram-label">Telegram ID</div>
                    <div class="telegram-value" id="profileTelegramId">${telegramUsername || 'Not Set - Tap to Set'}</div>
                </div>
                <div class="telegram-edit">✏️</div>
            </div>
            
            <div class="platforms-grid">
                <div class="platform-card" onclick="showCashier()">
                    <span class="platform-icon">💰</span>
                    <span class="platform-name">Rewards Center</span>
                    <span class="platform-points">+Gift Cards</span>
                    <span class="platform-time">🎁 Redeem</span>
                </div>
                <div class="platform-card" onclick="showWalletHistory()">
                    <span class="platform-icon">📊</span>
                    <span class="platform-name">Wallet History</span>
                    <span class="platform-points">All Transactions</span>
                    <span class="platform-time">📈 View</span>
                </div>
                <div class="platform-card" onclick="showReferralSystem()">
                    <span class="platform-icon">👥</span>
                    <span class="platform-name">Refer & Earn</span>
                    <span class="platform-points">+50 points</span>
                    <span class="platform-time">⚡ Per Referral</span>
                </div>
                <div class="platform-card" onclick="showSupport()">
                    <span class="platform-icon">💬</span>
                    <span class="platform-name">Support</span>
                    <span class="platform-points">Help Center</span>
                    <span class="platform-time">📞 24/7</span>
                </div>
            </div>

            <div class="earn-stats">
                <div class="earn-stat" onclick="showWalletHistory()">
                    <div class="stat-number" id="profileTotalPoints">${userPoints}</div>
                    <div class="stat-label">Total Points</div>
                </div>
                <div class="earn-stat">
                    <div class="stat-number" id="profileReferrals">${referralData.referredUsers.length}</div>
                    <div class="stat-label">Referrals</div>
                </div>
                <div class="earn-stat">
                    <div class="stat-number" id="profileRewards">${redeemedRewards.length}</div>
                    <div class="stat-label">Rewards</div>
                </div>
            </div>
        </div>
    `;
    
    // Update Telegram ID display
    updateProfileUI();
}

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 TapEarn App Initialized');
    loadMiningState();
    captureTelegramId(); // Capture Telegram ID on app load
    
    // Auto-save every minute
    setInterval(() => {
        saveMiningState();
    }, 60000);
    
    // Check hourly bonus every minute
    setInterval(() => {
        const now = Date.now();
        if (now - lastHourlyBonus >= 3600000) {
            hourlyBonusAvailable = true;
            updateUI();
        }
    }, 60000);
    
    // Check daily reset every hour
    setInterval(() => {
        checkDailyEarningsReset();
    }, 3600000);
    
    // 🆕 Auto-sync to Admin Panel every 30 seconds
    setInterval(() => {
        if (telegramUsername && telegramUsername !== 'Not set') {
            syncToAdminPanel();
        }
    }, 30000);
});
