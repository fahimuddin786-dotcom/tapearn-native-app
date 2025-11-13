// Mining State Management
let isMining = false;
let miningSeconds = 0;
let miningInterval = null;
let userPoints = 0;
let totalMiningHours = 0;
let totalPointsEarned = 0;

// Telegram Bot Configuration
const BOT_TOKEN = '8211138038:AAFlB0Ik4UE03j2naDTLu-0aIBRxZCRgcTI';
const BOT_USERNAME = '@penthon_trading_alerts_bot';

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

// Load Mining State
function loadMiningState() {
    console.log('🔄 Loading mining state...');
    const savedState = getFromStorage('miningState');
    
    if (savedState) {
        isMining = savedState.isMining || false;
        miningSeconds = savedState.miningSeconds || 0;
        userPoints = savedState.userPoints || 0;
        totalMiningHours = savedState.totalMiningHours || 0;
        totalPointsEarned = savedState.totalPointsEarned || 0;
        
        console.log('✅ Mining state loaded:', {
            isMining, 
            miningSeconds, 
            userPoints, 
            totalMiningHours, 
            totalPointsEarned
        });
        
        if (isMining) {
            console.log('⛏️ Resuming mining...');
            startMining();
        }
    } else {
        console.log('📭 No saved state found, starting fresh');
    }
    
    updateUI();
}

// Save Mining State
function saveMiningState() {
    const miningState = {
        isMining: isMining,
        miningSeconds: miningSeconds,
        userPoints: userPoints,
        totalMiningHours: totalMiningHours,
        totalPointsEarned: totalPointsEarned,
        lastSaved: new Date().toISOString()
    };
    
    saveToStorage('miningState', miningState);
}

// Update UI
function updateUI() {
    // Update Points
    document.getElementById('walletPoints').textContent = formatNumber(userPoints);
    document.getElementById('totalPoints').textContent = formatNumber(userPoints);
    
    // Update Mining Stats
    document.getElementById('miningHours').textContent = totalMiningHours;
    document.getElementById('pointsEarned').textContent = formatNumber(totalPointsEarned);
    
    // Update Mining Timer
    updateMiningTimerDisplay();
    
    // Update Mining Status
    const statusElement = document.getElementById('miningStatusText');
    const miningCard = document.querySelector('.mining-feature');
    
    if (isMining) {
        statusElement.textContent = 'Mining Active - 5 pts/min';
        statusElement.style.color = '#FFD700';
        statusElement.style.fontWeight = 'bold';
        miningCard.classList.add('mining-active');
        document.getElementById('miningRate').textContent = '300/hr';
    } else {
        statusElement.textContent = 'Click to start mining';
        statusElement.style.color = '';
        statusElement.style.fontWeight = '';
        miningCard.classList.remove('mining-active');
        document.getElementById('miningRate').textContent = '300/hr';
    }
    
    // Update user stats
    document.querySelector('.user-stats').textContent = `${userPoints}/500`;
    
    // Update level based on points
    updateUserLevel();
}

// Update User Level
function updateUserLevel() {
    const levelElement = document.querySelector('.user-level');
    let level = 'Bronze';
    let color = '#CD7F32';
    
    if (userPoints >= 10000) {
        level = 'Diamond';
        color = '#B9F2FF';
    } else if (userPoints >= 5000) {
        level = 'Platinum';
        color = '#E5E4E2';
    } else if (userPoints >= 2000) {
        level = 'Gold';
        color = '#FFD700';
    } else if (userPoints >= 1000) {
        level = 'Silver';
        color = '#C0C0C0';
    }
    
    levelElement.textContent = level;
    levelElement.style.color = color;
}

// Format Numbers
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Update Mining Timer Display
function updateMiningTimerDisplay() {
    const hours = Math.floor(miningSeconds / 3600);
    const minutes = Math.floor((miningSeconds % 3600) / 60);
    const seconds = miningSeconds % 60;
    
    document.getElementById('miningTime').textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
    if (isMining) {
        console.log('⚠️ Mining already active');
        return;
    }
    
    console.log('🟢 Starting mining...');
    isMining = true;
    
    // Clear existing interval
    if (miningInterval) {
        clearInterval(miningInterval);
        miningInterval = null;
    }
    
    let lastMinuteCheck = Math.floor(miningSeconds / 60);
    let lastHourCheck = Math.floor(miningSeconds / 3600);
    
    // Start mining interval
    miningInterval = setInterval(() => {
        miningSeconds++;
        
        // Update timer display
        updateMiningTimerDisplay();
        
        const currentMinute = Math.floor(miningSeconds / 60);
        const currentHour = Math.floor(miningSeconds / 3600);
        
        // Add points every minute
        if (currentMinute > lastMinuteCheck) {
            userPoints += 5;
            totalPointsEarned += 5;
            lastMinuteCheck = currentMinute;
            
            console.log('⛏️ +5 Points from mining! Total:', userPoints);
            showNotification('⛏️ +5 Points from Mining!', 'success');
            updateUI();
        }
        
        // Add bonus every hour
        if (currentHour > lastHourCheck) {
            userPoints += 50;
            totalPointsEarned += 50;
            totalMiningHours++;
            lastHourCheck = currentHour;
            
            console.log('🎉 +50 Bonus Points! 1 Hour Complete!');
            showNotification('🎉 +50 Bonus Points! 1 Hour Complete!', 'success');
            updateUI();
        }
        
        // Save state every 30 seconds
        if (miningSeconds % 30 === 0) {
            saveMiningState();
        }
        
    }, 1000);
    
    showNotification('⛏️ Mining Started! Earning 5 points per minute...', 'success');
    saveMiningState();
    updateUI();
}

// Stop Mining
function stopMining() {
    if (!isMining) {
        console.log('⚠️ Mining not active');
        return;
    }
    
    console.log('🔴 Stopping mining...');
    isMining = false;
    
    // Clear interval
    if (miningInterval) {
        clearInterval(miningInterval);
        miningInterval = null;
    }
    
    showNotification('⏹️ Mining Stopped. Points saved!', 'info');
    saveMiningState();
    updateUI();
}

// Claim Boost
function claimBoost() {
    userPoints += 100;
    totalPointsEarned += 100;
    
    console.log('🚀 Boost claimed! +100 points. Total:', userPoints);
    showNotification('🚀 +100 Points! Daily boost claimed!', 'success');
    
    saveMiningState();
    updateUI();
}

// Show Mining History
function showMiningHistory() {
    const hours = Math.floor(miningSeconds / 3600);
    const minutes = Math.floor((miningSeconds % 3600) / 60);
    
    showNotification(
        `📊 Mining Stats: ${hours}h ${minutes}m | Total: ${totalPointsEarned} points`, 
        'info'
    );
}

// Debug Storage
function debugStorage() {
    const state = getFromStorage('miningState');
    const currentTime = new Date().toISOString();
    
    console.log('🔍 Debug Storage:', {
        currentTime,
        state,
        currentPoints: userPoints,
        currentMiningSeconds: miningSeconds,
        isMiningCurrently: isMining
    });
    
    showNotification(
        `🐛 Debug: ${userPoints} pts | ${Math.floor(miningSeconds/3600)}h | Mining: ${isMining ? 'ON' : 'OFF'}`,
        'info'
    );
}

// Reset Mining
function resetMining() {
    if (confirm('⚠️ Are you sure you want to reset ALL mining data? This cannot be undone!')) {
        isMining = false;
        miningSeconds = 0;
        userPoints = 0;
        totalMiningHours = 0;
        totalPointsEarned = 0;
        
        if (miningInterval) {
            clearInterval(miningInterval);
            miningInterval = null;
        }
        
        localStorage.removeItem('miningState');
        
        console.log('🔄 Mining data reset complete');
        showNotification('🔄 All mining data reset successfully!', 'success');
        updateUI();
    }
}

// Add Test Points (Testing के लिए)
function addTestPoints() {
    userPoints += 1000;
    totalPointsEarned += 1000;
    
    console.log('💰 Added 1000 test points. Total:', userPoints);
    showNotification('💰 +1000 Test Points Added!', 'success');
    
    saveMiningState();
    updateUI();
}

// Show Wallet Details (Basic)
function showWalletDetails() {
    showNotification(
        `💰 Wallet: ${userPoints} points | Level: ${document.querySelector('.user-level').textContent}`,
        'info'
    );
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
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

// Initialize Mining App
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 TapEarn Mining App Initializing...');
    console.log('🤖 Bot Token:', BOT_TOKEN);
    console.log('📺 YouTube API: Loaded');
    
    // Load saved state
    loadMiningState();
    
    // Show welcome message
    setTimeout(() => {
        showNotification('🚀 TapEarn Mining Started! Click the mining card to begin earning points.', 'info');
    }, 1000);
    
    console.log('✅ Mining App Ready!');
    console.log('📊 Current State:', {
        isMining, 
        miningSeconds, 
        userPoints, 
        totalMiningHours, 
        totalPointsEarned
    });
    
    // Auto-save every minute
    setInterval(() => {
        if (isMining) {
            saveMiningState();
            console.log('💾 Auto-save completed');
        }
    }, 60000);
});

// Prevent accidental page close
window.addEventListener('beforeunload', function(e) {
    if (isMining) {
        saveMiningState();
        // Optional: Show confirmation dialog
        // e.preventDefault();
        // e.returnValue = 'Mining is active. Are you sure you want to leave?';
    }
});
