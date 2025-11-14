// Admin Panel JavaScript
let allUsers = [];
let autoRefreshInterval = null;

// Initialize Admin Panel
function initAdminPanel() {
    console.log('🚀 Admin Panel Initialized');
    loadAllUsers();
    setupAutoRefresh();
    updateAdminStats();
}

// Load all users from localStorage with Telegram ID detection
function loadAllUsers() {
    console.log('📥 Loading users from storage...');
    
    allUsers = [];
    
    // Get all keys from localStorage
    const allKeys = Object.keys(localStorage);
    
    // Process each localStorage item to find user data
    allKeys.forEach(key => {
        try {
            const item = localStorage.getItem(key);
            if (item) {
                const data = JSON.parse(item);
                
                // Check if this is user data based on structure
                if (isUserData(data)) {
                    const user = extractUserData(key, data);
                    if (user) {
                        allUsers.push(user);
                    }
                }
            }
        } catch (error) {
            // Skip non-JSON items
        }
    });
    
    // If no users found, create demo users
    if (allUsers.length === 0) {
        console.log('⚠️ No users found, creating demo data...');
        createDemoUsers();
    }
    
    console.log(`✅ Loaded ${allUsers.length} users`);
    updateUsersTable();
    updateUserSelect();
    updateAdminStats();
}

// Check if data object contains user information
function isUserData(data) {
    return data && (
        data.userPoints !== undefined ||
        data.miningLevel !== undefined ||
        data.totalPointsEarned !== undefined ||
        data.telegramUsername !== undefined ||
        (data.referralData && data.referralData.referralCode)
    );
}

// Extract user data from localStorage item
function extractUserData(key, data) {
    try {
        // Generate user ID from key or create new one
        const userId = key.includes('_') ? key.split('_')[1] : 'user_' + Date.now() + Math.random().toString(36).substr(2, 9);
        
        // Extract Telegram username - check multiple possible locations
        let telegramUsername = 'Not set';
        
        if (data.telegramUsername && data.telegramUsername !== 'Not set') {
            telegramUsername = data.telegramUsername;
        } else if (data.referralData && data.referralData.telegramUsername) {
            telegramUsername = data.referralData.telegramUsername;
        } else if (data.userData && data.userData.telegramUsername) {
            telegramUsername = data.userData.telegramUsername;
        }
        
        // If still not set, try to extract from other data fields
        if (telegramUsername === 'Not set') {
            // Check if there's any data that might contain Telegram info
            const stringData = JSON.stringify(data).toLowerCase();
            if (stringData.includes('@')) {
                const atIndex = stringData.indexOf('@');
                const possibleUsername = stringData.substring(atIndex, Math.min(atIndex + 20, stringData.length)).split(/[^a-zA-Z0-9_@]/)[0];
                if (possibleUsername.startsWith('@')) {
                    telegramUsername = possibleUsername;
                }
            }
        }
        
        const user = {
            id: userId,
            telegramUsername: telegramUsername,
            points: data.userPoints || 0,
            level: data.miningLevel || 1,
            miningStatus: data.isMining ? 'Active' : 'Inactive',
            tasksCompleted: data.totalTasksCompleted || 0,
            joinDate: data.joinDate || new Date().toLocaleDateString('en-US'),
            lastActive: data.lastActive || new Date().toLocaleString('en-US'),
            totalEarned: data.totalPointsEarned || 0,
            todayEarnings: data.todayEarnings || 0,
            miningSeconds: data.miningSeconds || 0,
            totalMiningHours: data.totalMiningHours || 0,
            speedLevel: data.speedLevel || 1,
            multiplierLevel: data.multiplierLevel || 1,
            loginStreak: data.loginStreak || 1
        };
        
        return user;
    } catch (error) {
        console.error('Error extracting user data:', error);
        return null;
    }
}

// Create demo users for testing with realistic Telegram usernames
function createDemoUsers() {
    const demoUsers = [
        {
            id: 'user_' + Date.now() + '_1',
            telegramUsername: '@john_doe',
            points: 1500,
            level: 2,
            miningStatus: 'Active',
            tasksCompleted: 15,
            joinDate: '2024-01-15',
            lastActive: new Date().toLocaleString('en-US'),
            totalEarned: 2000,
            todayEarnings: 150,
            miningSeconds: 3600,
            totalMiningHours: 10,
            speedLevel: 2,
            multiplierLevel: 1,
            loginStreak: 5
        },
        {
            id: 'user_' + Date.now() + '_2',
            telegramUsername: '@jane_smith',
            points: 800,
            level: 1,
            miningStatus: 'Inactive',
            tasksCompleted: 8,
            joinDate: '2024-01-20',
            lastActive: new Date().toLocaleString('en-US'),
            totalEarned: 1000,
            todayEarnings: 80,
            miningSeconds: 1800,
            totalMiningHours: 5,
            speedLevel: 1,
            multiplierLevel: 1,
            loginStreak: 3
        },
        {
            id: 'user_' + Date.now() + '_3',
            telegramUsername: '@tech_guru',
            points: 3500,
            level: 3,
            miningStatus: 'Active',
            tasksCompleted: 25,
            joinDate: '2024-01-10',
            lastActive: new Date().toLocaleString('en-US'),
            totalEarned: 4500,
            todayEarnings: 300,
            miningSeconds: 7200,
            totalMiningHours: 20,
            speedLevel: 3,
            multiplierLevel: 2,
            loginStreak: 12
        },
        {
            id: 'user_' + Date.now() + '_4',
            telegramUsername: '@crypto_enthusiast',
            points: 5000,
            level: 4,
            miningStatus: 'Active',
            tasksCompleted: 35,
            joinDate: '2024-01-05',
            lastActive: new Date().toLocaleString('en-US'),
            totalEarned: 6000,
            todayEarnings: 450,
            miningSeconds: 10800,
            totalMiningHours: 30,
            speedLevel: 4,
            multiplierLevel: 3,
            loginStreak: 18
        }
    ];
    
    allUsers = demoUsers;
    
    // Save demo users to localStorage with proper structure
    demoUsers.forEach(user => {
        const userData = {
            userPoints: user.points,
            miningLevel: user.level,
            isMining: user.miningStatus === 'Active',
            totalTasksCompleted: user.tasksCompleted,
            totalPointsEarned: user.totalEarned,
            todayEarnings: user.todayEarnings,
            telegramUsername: user.telegramUsername,
            miningSeconds: user.miningSeconds,
            totalMiningHours: user.totalMiningHours,
            speedLevel: user.speedLevel,
            multiplierLevel: user.multiplierLevel,
            loginStreak: user.loginStreak,
            joinDate: user.joinDate,
            lastActive: user.lastActive,
            referralData: {
                referralCode: 'TAPEARN-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
                referredUsers: [],
                totalEarned: 0
            }
        };
        
        localStorage.setItem(`userData_${user.id}`, JSON.stringify(userData));
    });
    
    console.log('✅ Created demo users with Telegram IDs');
}

// Update admin statistics
function updateAdminStats() {
    const totalUsers = allUsers.length;
    const totalPoints = allUsers.reduce((sum, user) => sum + user.points, 0);
    const activeUsers = allUsers.filter(user => user.miningStatus === 'Active').length;
    const todayEarnings = allUsers.reduce((sum, user) => sum + user.todayEarnings, 0);
    
    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('totalPoints').textContent = totalPoints.toLocaleString('en-US');
    document.getElementById('activeUsers').textContent = activeUsers;
    document.getElementById('todayEarnings').textContent = todayEarnings.toLocaleString('en-US');
    
    // Update analytics stats
    const totalMining = allUsers.reduce((sum, user) => sum + user.totalMiningHours, 0);
    const totalTasks = allUsers.reduce((sum, user) => sum + user.tasksCompleted, 0);
    const totalVideos = allUsers.reduce((sum, user) => sum + Math.floor(user.tasksCompleted / 2), 0);
    const totalReferrals = allUsers.reduce((sum, user) => sum + Math.floor(user.tasksCompleted / 5), 0);
    
    document.getElementById('totalMining').textContent = totalMining;
    document.getElementById('totalTasks').textContent = totalTasks;
    document.getElementById('totalVideos').textContent = totalVideos;
    document.getElementById('totalReferrals').textContent = totalReferrals;
    
    // Update last update time
    document.getElementById('lastUpdate').textContent = `Last: ${new Date().toLocaleTimeString('en-US')}`;
}

// Update users table
function updateUsersTable() {
    const recentUsersTable = document.getElementById('recentUsersTable');
    const allUsersTable = document.getElementById('allUsersTable');
    
    // Sort users by join date (newest first)
    const sortedUsers = [...allUsers].sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate));
    
    // Recent users (last 5)
    const recentUsers = sortedUsers.slice(0, 5);
    
    // Update recent users table
    recentUsersTable.innerHTML = recentUsers.map(user => `
        <tr>
            <td><strong>${user.id}</strong></td>
            <td>${user.telegramUsername}</td>
            <td>${user.points.toLocaleString('en-US')}</td>
            <td>Level ${user.level}</td>
            <td>${user.joinDate}</td>
            <td><span class="user-status ${user.miningStatus === 'Active' ? 'status-active' : 'status-inactive'}">${user.miningStatus}</span></td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editUser('${user.id}')">Edit</button>
                <button class="btn btn-sm btn-warning" onclick="viewUserDetails('${user.id}')">View</button>
            </td>
        </tr>
    `).join('');
    
    // Update all users table
    allUsersTable.innerHTML = sortedUsers.map(user => `
        <tr>
            <td><strong>${user.id}</strong></td>
            <td>${user.telegramUsername}</td>
            <td>${user.points.toLocaleString('en-US')}</td>
            <td>Level ${user.level}</td>
            <td><span class="user-status ${user.miningStatus === 'Active' ? 'status-active' : 'status-inactive'}">${user.miningStatus}</span></td>
            <td>${user.tasksCompleted}</td>
            <td>${user.joinDate}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editUser('${user.id}')">Edit</button>
                <button class="btn btn-sm btn-warning" onclick="viewUserDetails('${user.id}')">View</button>
                <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Update user select dropdown
function updateUserSelect() {
    const userSelect = document.getElementById('userSelect');
    userSelect.innerHTML = '<option value="">-- Select User --</option>' + 
        allUsers.map(user => `
            <option value="${user.id}">${user.telegramUsername} (${user.points} points)</option>
        `).join('');
}

// Search users
function searchUsers() {
    const searchTerm = document.getElementById('userSearch').value.toLowerCase();
    
    if (!searchTerm) {
        updateUsersTable();
        return;
    }
    
    const filteredUsers = allUsers.filter(user => 
        user.id.toLowerCase().includes(searchTerm) ||
        user.telegramUsername.toLowerCase().includes(searchTerm) ||
        user.points.toString().includes(searchTerm)
    );
    
    const allUsersTable = document.getElementById('allUsersTable');
    
    if (filteredUsers.length === 0) {
        allUsersTable.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 20px;">
                    No users found matching "${searchTerm}"
                </td>
            </tr>
        `;
        return;
    }
    
    allUsersTable.innerHTML = filteredUsers.map(user => `
        <tr>
            <td><strong>${user.id}</strong></td>
            <td>${user.telegramUsername}</td>
            <td>${user.points.toLocaleString('en-US')}</td>
            <td>Level ${user.level}</td>
            <td><span class="user-status ${user.miningStatus === 'Active' ? 'status-active' : 'status-inactive'}">${user.miningStatus}</span></td>
            <td>${user.tasksCompleted}</td>
            <td>${user.joinDate}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editUser('${user.id}')">Edit</button>
                <button class="btn btn-sm btn-warning" onclick="viewUserDetails('${user.id}')">View</button>
            </td>
        </tr>
    `).join('');
}

// Clear search
function clearSearch() {
    document.getElementById('userSearch').value = '';
    updateUsersTable();
}

// Update user points
function updateUserPoints() {
    const userId = document.getElementById('userSelect').value;
    const action = document.getElementById('pointsAction').value;
    const amount = parseInt(document.getElementById('pointsAmount').value);
    const reason = document.getElementById('pointsReason').value;
    
    if (!userId || !amount || amount <= 0) {
        alert('Please fill all fields correctly!');
        return;
    }
    
    const user = allUsers.find(u => u.id === userId);
    if (!user) {
        alert('User not found!');
        return;
    }
    
    let newPoints = user.points;
    
    switch (action) {
        case 'add':
            newPoints += amount;
            break;
        case 'subtract':
            newPoints = Math.max(0, newPoints - amount);
            break;
        case 'set':
            newPoints = amount;
            break;
    }
    
    // Update user data in localStorage
    const userDataKey = `userData_${userId}`;
    const userData = JSON.parse(localStorage.getItem(userDataKey)) || {};
    userData.userPoints = newPoints;
    userData.totalPointsEarned = (userData.totalPointsEarned || 0) + (action === 'add' ? amount : 0);
    localStorage.setItem(userDataKey, JSON.stringify(userData));
    
    // Update in-memory data
    user.points = newPoints;
    if (action === 'add') {
        user.totalEarned += amount;
    }
    
    // Update UI
    updateUsersTable();
    updateUserSelect();
    updateAdminStats();
    
    // Log the action
    console.log(`User ${userId} points updated: ${action} ${amount} points. Reason: ${reason}`);
    
    alert(`✅ ${user.telegramUsername}'s points updated! New points: ${newPoints}`);
    
    // Clear form
    document.getElementById('pointsAmount').value = '';
    document.getElementById('pointsReason').value = '';
}

// Update global settings
function updateGlobalSettings() {
    const miningRate = document.getElementById('globalMiningRate').value;
    
    if (miningRate && miningRate > 0) {
        localStorage.setItem('globalMiningRate', miningRate);
        alert('✅ Global mining rate updated!');
    } else {
        alert('Please enter a valid mining rate!');
    }
}

// Save global settings
function saveGlobalSettings() {
    const appName = document.getElementById('appName').value;
    const welcomeMessage = document.getElementById('welcomeMessage').value;
    const minWithdrawal = document.getElementById('minWithdrawal').value;
    const referralBonus = document.getElementById('referralBonus').value;
    const dailyBonus = document.getElementById('dailyBonus').value;
    
    const settings = {
        appName,
        welcomeMessage,
        minWithdrawal: parseInt(minWithdrawal),
        referralBonus: parseInt(referralBonus),
        dailyBonus: parseInt(dailyBonus)
    };
    
    localStorage.setItem('globalSettings', JSON.stringify(settings));
    alert('✅ Global settings saved!');
}

// Load global settings
function loadGlobalSettings() {
    const settings = JSON.parse(localStorage.getItem('globalSettings')) || {};
    
    document.getElementById('appName').value = settings.appName || 'TapEarn';
    document.getElementById('welcomeMessage').value = settings.welcomeMessage || 'Welcome to TapEarn! Start earning points now.';
    document.getElementById('minWithdrawal').value = settings.minWithdrawal || 1000;
    document.getElementById('referralBonus').value = settings.referralBonus || 50;
    document.getElementById('dailyBonus').value = settings.dailyBonus || 100;
}

// Show add reward modal
function showAddRewardModal() {
    document.getElementById('addRewardModal').classList.add('active');
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Add new reward
function addNewReward() {
    const name = document.getElementById('rewardName').value;
    const description = document.getElementById('rewardDescription').value;
    const cost = parseInt(document.getElementById('rewardCost').value);
    const value = parseInt(document.getElementById('rewardValue').value);
    const type = document.getElementById('rewardType').value;
    
    if (!name || !cost || !value) {
        alert('Please fill all required fields!');
        return;
    }
    
    const rewards = JSON.parse(localStorage.getItem('adminRewards')) || [];
    const newReward = {
        id: 'reward_' + Date.now(),
        name,
        description,
        cost,
        value,
        type,
        status: 'active',
        createdAt: new Date().toISOString()
    };
    
    rewards.push(newReward);
    localStorage.setItem('adminRewards', JSON.stringify(rewards));
    
    updateRewardsTable();
    closeModal('addRewardModal');
    alert('✅ New reward added!');
    
    // Clear form
    document.getElementById('rewardName').value = '';
    document.getElementById('rewardDescription').value = '';
    document.getElementById('rewardCost').value = '';
    document.getElementById('rewardValue').value = '';
}

// Update rewards table
function updateRewardsTable() {
    const rewards = JSON.parse(localStorage.getItem('adminRewards')) || [];
    const rewardsTable = document.getElementById('rewardsTable');
    
    if (rewards.length === 0) {
        rewardsTable.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 20px;">
                    No rewards found. Add your first reward!
                </td>
            </tr>
        `;
        return;
    }
    
    rewardsTable.innerHTML = rewards.map(reward => `
        <tr>
            <td>${reward.name}</td>
            <td>${reward.cost.toLocaleString('en-US')}</td>
            <td>$${reward.value}</td>
            <td>${reward.type}</td>
            <td>
                <span style="color: ${reward.status === 'active' ? '#4CAF50' : '#FF6B6B'}">
                    ${reward.status === 'active' ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="toggleRewardStatus('${reward.id}')">
                    ${reward.status === 'active' ? 'Disable' : 'Enable'}
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteReward('${reward.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Toggle reward status
function toggleRewardStatus(rewardId) {
    const rewards = JSON.parse(localStorage.getItem('adminRewards')) || [];
    const reward = rewards.find(r => r.id === rewardId);
    
    if (reward) {
        reward.status = reward.status === 'active' ? 'inactive' : 'active';
        localStorage.setItem('adminRewards', JSON.stringify(rewards));
        updateRewardsTable();
    }
}

// Delete reward
function deleteReward(rewardId) {
    if (confirm('Are you sure you want to delete this reward?')) {
        const rewards = JSON.parse(localStorage.getItem('adminRewards')) || [];
        const filteredRewards = rewards.filter(r => r.id !== rewardId);
        localStorage.setItem('adminRewards', JSON.stringify(filteredRewards));
        updateRewardsTable();
        alert('✅ Reward deleted!');
    }
}

// Edit user
function editUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (user) {
        // Pre-fill the points management form
        document.getElementById('userSelect').value = userId;
        document.getElementById('pointsAmount').value = user.points;
        document.getElementById('pointsReason').value = 'Admin adjustment';
        
        // Switch to points management section
        showSection('points');
        
        // Scroll to form
        document.getElementById('pointsAmount').focus();
    }
}

// View user details
function viewUserDetails(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (user) {
        const userDetailsContent = document.getElementById('userDetailsContent');
        
        userDetailsContent.innerHTML = `
            <div style="margin-bottom: 20px;">
                <h4 style="color: #FFA726; margin-bottom: 15px;">User Information</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                    <div><strong>User ID:</strong></div>
                    <div>${user.id}</div>
                    
                    <div><strong>Telegram:</strong></div>
                    <div>${user.telegramUsername}</div>
                    
                    <div><strong>Points:</strong></div>
                    <div>${user.points.toLocaleString('en-US')}</div>
                    
                    <div><strong>Level:</strong></div>
                    <div>${user.level}</div>
                    
                    <div><strong>Status:</strong></div>
                    <div><span class="user-status ${user.miningStatus === 'Active' ? 'status-active' : 'status-inactive'}">${user.miningStatus}</span></div>
                    
                    <div><strong>Tasks Completed:</strong></div>
                    <div>${user.tasksCompleted}</div>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h4 style="color: #FFA726; margin-bottom: 15px;">Earnings & Activity</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div><strong>Total Earned:</strong></div>
                    <div>${user.totalEarned.toLocaleString('en-US')}</div>
                    
                    <div><strong>Today's Earnings:</strong></div>
                    <div>${user.todayEarnings.toLocaleString('en-US')}</div>
                    
                    <div><strong>Mining Hours:</strong></div>
                    <div>${user.totalMiningHours}</div>
                    
                    <div><strong>Login Streak:</strong></div>
                    <div>${user.loginStreak} days</div>
                    
                    <div><strong>Joined Date:</strong></div>
                    <div>${user.joinDate}</div>
                    
                    <div><strong>Last Active:</strong></div>
                    <div>${user.lastActive}</div>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
                <button class="btn btn-primary" onclick="editUser('${user.id}')">Edit Points</button>
                <button class="btn btn-warning" onclick="closeModal('userDetailsModal')">Close</button>
            </div>
        `;
        
        document.getElementById('userDetailsModal').classList.add('active');
    }
}

// Delete user
function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone!')) {
        // Remove from localStorage
        localStorage.removeItem(`userData_${userId}`);
        localStorage.removeItem(`miningState_${userId}`);
        
        // Remove from in-memory array
        allUsers = allUsers.filter(u => u.id !== userId);
        
        // Update UI
        updateUsersTable();
        updateUserSelect();
        updateAdminStats();
        
        alert('✅ User deleted!');
    }
}

// Show section
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show selected section
    document.getElementById(sectionId).style.display = 'block';
    
    // Update active nav
    document.querySelectorAll('.admin-nav a').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Load section-specific data
    if (sectionId === 'rewards') {
        updateRewardsTable();
    } else if (sectionId === 'settings') {
        loadGlobalSettings();
    }
}

// Show tab
function showTab(tabName) {
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // In real app, load tab-specific content
    console.log('Showing tab:', tabName);
}

// Setup auto refresh
function setupAutoRefresh() {
    const autoRefreshCheckbox = document.getElementById('autoRefresh');
    
    autoRefreshCheckbox.addEventListener('change', function() {
        if (this.checked) {
            autoRefreshInterval = setInterval(() => {
                loadAllUsers();
                updateAdminStats();
            }, 30000); // Refresh every 30 seconds
        } else {
            clearInterval(autoRefreshInterval);
        }
    });
    
    // Start auto refresh
    autoRefreshInterval = setInterval(() => {
        loadAllUsers();
        updateAdminStats();
    }, 30000);
}

// Refresh data manually
function refreshData() {
    loadAllUsers();
    updateAdminStats();
    alert('✅ Data refreshed!');
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initAdminPanel();
    
    // Load initial data
    loadGlobalSettings();
    updateRewardsTable();
});
