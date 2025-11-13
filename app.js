// Advanced Mining State Management
let isMining = false;
let miningSeconds = 0;
let miningInterval = null;
let userPoints = 0;
let totalMiningHours = 0;
let totalPointsEarned = 0;

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
        console.log('📂 Loaded:', key, value);
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
}

// Save Complete State
function saveMiningState() {
    const miningState = {
        isMining: isMining,
        miningSeconds: miningSeconds,
        userPoints: userPoints,
        totalMiningHours: totalMiningHours,
        totalPointsEarned: totalPointsEarned,
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
}

// Check Daily Reset for Earnings
function checkDailyEarningsReset() {
    const today = new Date().toDateString();
    if (lastEarningDate !== today) {
        todayEarnings = 0;
        lastEarningDate = today;
        console.log('📅 New day - earnings reset');
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
            
            console.log(`⛏️ +${pointsToAdd.toFixed(1)} Points from mining!`);
            updateUI();
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
        
        console.log('⚡ Speed upgraded to level:', speedLevel);
        showNotification(`⚡ Mining Speed upgraded to Level ${speedLevel}!`, 'success');
        
        saveMiningState();
        updateUI();
    } else {
        showNotification('❌ Not enough points for speed upgrade!', 'warning');
    }
}

function upgradeMultiplier() {
    const upgradeCost = MULTIPLIER_UPGRADES[multiplierLevel - 1].cost;
    
    if (userPoints >= upgradeCost) {
        userPoints -= upgradeCost;
        multiplierLevel++;
        
        console.log('💰 Multiplier upgraded to level:', multiplierLevel);
        showNotification(`💰 Point Multiplier upgraded to Level ${multiplierLevel}!`, 'success');
        
        saveMiningState();
        updateUI();
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
        
        console.log('🏆 Mining level upgraded to:', LEVEL_DATA[miningLevel].name);
        showNotification(`🏆 Congratulations! You are now a ${LEVEL_DATA[miningLevel].name} Miner!`, 'success');
        
        saveMiningState();
        updateUI();
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
        
        console.log('🚀 Turbo activated!');
        showNotification('🚀 TURBO MODE ACTIVATED! 2x points for 5 minutes!', 'success');
        
        startTurboCountdown();
        saveMiningState();
        updateUI();
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
    
    console.log('🎁 Daily bonus claimed:', bonusAmount);
    showNotification(`🎁 Daily Bonus! +${bonusAmount} Points (Streak: ${loginStreak})`, 'success');
    
    saveMiningState();
    updateUI();
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
    
    console.log('⏰ Hourly bonus claimed:', bonusAmount);
    showNotification(`⏰ Hourly Bonus! +${bonusAmount} Points`, 'success');
    
    saveMiningState();
    updateUI();
}

function claimStreakBonus() {
    const bonusAmount = loginStreak * 10;
    userPoints += bonusAmount;
    totalPointsEarned += bonusAmount;
    todayEarnings += bonusAmount;
    
    console.log('🔥 Streak bonus claimed:', bonusAmount);
    showNotification(`🔥 Streak Bonus! +${bonusAmount} Points (Day ${loginStreak})`, 'success');
    
    saveMiningState();
    updateUI();
}

function claimBoost() {
    const boostAmount = 50;
    userPoints += boostAmount;
    totalPointsEarned += boostAmount;
    todayEarnings += boostAmount;
    
    console.log('🎯 Boost claimed:', boostAmount);
    showNotification(`🎯 Boost! +${boostAmount} Points`, 'success');
    
    saveMiningState();
    updateUI();
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
    document.querySelector(`.nav-btn:nth-child(${tabName === 'mining' ? 1 : 2})`).classList.add('active');
    
    updateUI();
}

// Video Watch System
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
    document.getElementById('modalTimer').textContent = formatTime(currentVideoTimeLeft);
    document.getElementById('modalProgressText').textContent = 'Keep watching...';
    
    // Update progress circle
    updateTimerProgress(0);
    
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
        document.getElementById('modalTimer').textContent = formatTime(currentVideoTimeLeft);
        
        // Update progress circle
        const progress = ((60 - currentVideoTimeLeft) / 60) * 100;
        updateTimerProgress(progress);
        
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

function updateTimerProgress(progress) {
    const progressElement = document.querySelector('.timer-progress');
    progressElement.style.background = `conic-gradient(#4CAF50 ${progress}%, #2E7D32 ${progress}%)`;
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
    
    // Update UI
    updateUI();
    saveMiningState();
    
    // Close modal
    document.getElementById('videoWatchModal').classList.remove('active');
    
    // Show success message
    showNotification(`✅ +${points} Points! "${title.substring(0, 30)}..."`, 'success');
    
    // Refresh video list if on video section
    if (document.getElementById('videoResultsContainer')) {
        setTimeout(() => searchVideos(), 500);
    }
    
    currentVideoData = null;
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
                <div class="earn-stat">
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
    
    saveMiningState();
    updateUI();
    
    showNotification(`✅ +${points} Points! ${taskName}`, 'success');
    
    // Refresh the current section to update task states
    setTimeout(() => {
        if (taskId.startsWith('telegram')) showTelegramSection();
        else if (taskId.startsWith('twitter')) showTwitterSection();
        else if (taskId.startsWith('instagram')) showInstagramSection();
    }, 500);
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

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 TapEarn App Initialized');
    loadMiningState();
    
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
});
