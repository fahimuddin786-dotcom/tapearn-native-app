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
        return true;
    } catch (error) {
        console.error('Storage error:', error);
        return false;
    }
}

function getFromStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Storage read error:', error);
        return defaultValue;
    }
}

// Load Mining State
function loadMiningState() {
    const savedState = getFromStorage('miningState');
    console.log('Loading mining state:', savedState);
    
    if (savedState) {
        isMining = savedState.isMining || false;
        miningSeconds = savedState.miningSeconds || 0;
        userPoints = savedState.userPoints || 0;
        totalMiningHours = savedState.totalMiningHours || 0;
        totalPointsEarned = savedState.totalPointsEarned || 0;
        
        console.log('Mining state loaded:', {
            isMining, miningSeconds, userPoints, totalMiningHours, totalPointsEarned
        });
        
        if (isMining) {
            startMining();
        }
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
        lastSaved: Date.now()
    };
    
    saveToStorage('miningState', miningState);
    console.log('Mining state saved:', miningState);
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
    if (isMining) {
        statusElement.textContent = 'Mining Active - 5 pts/min';
        statusElement.style.color = '#FFD700';
        document.querySelector('.mining-feature').classList.add('mining-active');
    } else {
        statusElement.textContent = 'Click to start mining';
        statusElement.style.color = '';
        document.querySelector('.mining-feature').classList.remove('mining-active');
    }
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
    if (isMining) return;
    
    console.log('🟢 Starting mining...');
    isMining = true;
    
    // Update UI
    const miningCard = document.querySelector('.mining-feature');
    miningCard.classList.add('mining-active');
    
    // Clear existing interval
    if (miningInterval) {
        clearInterval(miningInterval);
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
    if (!isMining) return;
    
    console.log('🔴 Stopping mining...');
    isMining = false;
    
    // Clear interval
    if (miningInterval) {
        clearInterval(miningInterval);
        miningInterval = null;
    }
    
    // Update UI
    const miningCard = document.querySelector('.mining-feature');
    miningCard.classList.remove('mining-active');
    
    showNotification('⏹️ Mining Stopped. Points saved!', 'info');
    saveMiningState();
    updateUI();
}

// Claim Boost
function claimBoost() {
    userPoints += 100;
    totalPointsEarned += 100;
    
    console.log('🚀 Boost claimed! +100 points');
    showNotification('🚀 +100 Points! Daily boost claimed!', 'success');
    
    saveMiningState();
    updateUI();
}

// Show Mining History
function showMiningHistory() {
    alert(`📊 Mining Statistics:\n\n` +
          `Total Points: ${userPoints}\n` +
          `Mining Time: ${Math.floor(miningSeconds / 3600)}h ${Math.floor((miningSeconds % 3600) / 60)}m\n` +
          `Total Hours: ${totalMiningHours}\n` +
          `Points Earned: ${totalPointsEarned}`);
}

// Debug Storage
function debugStorage() {
    const state = getFromStorage('miningState');
    console.log('🔍 Debug Storage:', state);
    
    alert(`🐛 Storage Debug:\n\n` +
          `isMining: ${state?.isMining}\n` +
          `miningSeconds: ${state?.miningSeconds}\n` +
          `userPoints: ${state?.userPoints}\n` +
          `totalMiningHours: ${state?.totalMiningHours}\n` +
          `totalPointsEarned: ${state?.totalPointsEarned}`);
}

// Reset Mining
function resetMining() {
    if (confirm('⚠️ Are you sure you want to reset all mining data?')) {
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
        
        console.log('🔄 Mining data reset');
        showNotification('🔄 Mining data reset successfully!', 'success');
        updateUI();
    }
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

// Initialize Mining App
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 Mining App Initializing...');
    
    // Load saved state
    loadMiningState();
    
    // Show welcome message
    showNotification('🚀 TapEarn Mining Started! Click the mining card to begin.', 'info');
    
    console.log('✅ Mining App Ready!');
    console.log('Current State:', {
        isMining, miningSeconds, userPoints, totalMiningHours, totalPointsEarned
    });
});
