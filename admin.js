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

// Load all users from localStorage (simulated database)
function loadAllUsers() {
    // In a real app, this would be an API call to your backend
    // For demo, we'll simulate with localStorage
    
    // Get all keys from localStorage that contain user data
    const userKeys = Object.keys(localStorage).filter(key => 
        key.includes('miningState') || 
        key.includes('userData')
    );
    
    allUsers = [];
    
    userKeys.forEach(key => {
        try {
            const userData = JSON.parse(localStorage.getItem(key));
            if (userData && userData.userPoints !== undefined) {
                // Extract user ID from key or generate one
                const userId = key.replace('miningState_', '').replace('userData_', '') || 'user_' + Date.now();
                
                const user = {
                    id: userId,
                    telegramUsername: userData.telegramUsername || 'Not set',
                    points: userData.userPoints || 0,
                    level: userData.miningLevel || 1,
                    miningStatus: userData.isMining ? 'Active' : 'Inactive',
                    tasksCompleted: userData.totalTasksCompleted || 0,
                    joinDate: new Date().toLocaleDateString('hi-IN'),
                    lastActive: new Date().toLocaleString('hi-IN'),
                    totalEarned: userData.totalPointsEarned || 0,
                    todayEarnings: userData.todayEarnings || 0
                };
                
                allUsers.push(user);
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
        }
    });
    
    // If no users found in localStorage, create demo users
    if (allUsers.length === 0) {
        createDemoUsers();
    }
    
    updateUsersTable();
    updateUserSelect();
}

// Create demo users for testing
function createDemoUsers() {
    const demoUsers = [
        {
            id: 'user_001',
            telegramUsername: '@john_doe',
            points: 1500,
            level: 2,
            miningStatus: 'Active',
            tasksCompleted: 15,
            joinDate: '2024-01-15',
            lastActive: new Date().toLocaleString('hi-IN'),
            totalEarned: 2000,
            todayEarnings: 150
        },
        {
            id: 'user_002',
            telegramUsername: '@jane_smith',
            points: 800,
            level: 1,
            miningStatus: 'Inactive',
            tasksCompleted: 8,
            joinDate: '2024-01-20',
            lastActive: new Date().toLocaleString('hi-IN'),
            totalEarned: 1000,
            todayEarnings: 80
        },
        {
            id: 'user_003',
            telegramUsername: '@tech_guru',
            points: 3500,
            level: 3,
            miningStatus: 'Active',
            tasksCompleted: 25,
            joinDate: '2024-01-10',
            lastActive: new Date().toLocaleString('hi-IN'),
            totalEarned: 4500,
            todayEarnings: 300
        }
    ];
    
    allUsers = demoUsers;
    
    // Save demo users to localStorage
    demoUsers.forEach(user => {
        const userData = {
            userPoints: user.points,
            miningLevel: user.level,
            isMining: user.miningStatus === 'Active',
            totalTasksCompleted: user.tasksCompleted,
            totalPointsEarned: user.totalEarned,
            todayEarnings: user.todayEarnings,
            telegramUsername: user.telegramUsername
        };
        
        localStorage.setItem(`userData_${user.id}`, JSON.stringify(userData));
    });
}

// Update admin statistics
function updateAdminStats() {
    const totalUsers = allUsers.length;
    const totalPoints = allUsers.reduce((sum, user) => sum + user.points, 0);
    const activeUsers = allUsers.filter(user => user.miningStatus === 'Active').length;
    const todayEarnings = allUsers.reduce((sum, user) => sum + user.todayEarnings, 0);
    
    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('totalPoints').textContent = totalPoints.toLocaleString('hi-IN');
    document.getElementById('activeUsers').textContent = activeUsers;
    document.getElementById('todayEarnings').textContent = todayEarnings.toLocaleString('hi-IN');
    
    // Update analytics stats
    const totalMining = allUsers.reduce((sum, user) => sum + (user.tasksCompleted * 10), 0); // Simulated
    const totalTasks = allUsers.reduce((sum, user) => sum + user.tasksCompleted, 0);
    const totalVideos = allUsers.reduce((sum, user) => sum + Math.floor(user.tasksCompleted / 2), 0); // Simulated
    const totalReferrals = allUsers.reduce((sum, user) => sum + Math.floor(user.tasksCompleted / 5), 0); // Simulated
    
    document.getElementById('totalMining').textContent = totalMining;
    document.getElementById('totalTasks').textContent = totalTasks;
    document.getElementById('totalVideos').textContent = totalVideos;
    document.getElementById('totalReferrals').textContent = totalReferrals;
    
    // Update last update time
    document.getElementById('lastUpdate').textContent = `Last: ${new Date().toLocaleTimeString('hi-IN')}`;
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
            <td>${user.id}</td>
            <td>${user.telegramUsername}</td>
            <td>${user.points.toLocaleString('hi-IN')}</td>
            <td>Level ${user.level}</td>
            <td>${user.joinDate}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editUser('${user.id}')">Edit</button>
                <button class="btn btn-sm btn-warning" onclick="viewUser('${user.id}')">View</button>
            </td>
        </tr>
    `).join('');
    
    // Update all users table
    allUsersTable.innerHTML = allUsers.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.telegramUsername}</td>
            <td>${user.points.toLocaleString('hi-IN')}</td>
            <td>Level ${user.level}</td>
            <td>${user.miningStatus}</td>
            <td>${user.tasksCompleted}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editUser('${user.id}')">Edit</button>
                <button class="btn btn-sm btn-warning" onclick="viewUser('${user.id}')">View</button>
                <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Update user select dropdown
function updateUserSelect() {
    const userSelect = document.getElementById('userSelect');
    userSelect.innerHTML = '<option value="">-- यूजर चुनें --</option>' + 
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
        user.telegramUsername.toLowerCase().includes(searchTerm)
    );
    
    const allUsersTable = document.getElementById('allUsersTable');
    allUsersTable.innerHTML = filteredUsers.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.telegramUsername}</td>
            <td>${user.points.toLocaleString('hi-IN')}</td>
            <td>Level ${user.level}</td>
            <td>${user.miningStatus}</td>
            <td>${user.tasksCompleted}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editUser('${user.id}')">Edit</button>
                <button class="btn btn-sm btn-warning" onclick="viewUser('${user.id}')">View</button>
            </td>
        </tr>
    `).join('');
}

// Update user points
function updateUserPoints() {
    const userId = document.getElementById('userSelect').value;
    const action = document.getElementById('pointsAction').value;
    const amount = parseInt(document.getElementById('pointsAmount').value);
    const reason = document.getElementById('pointsReason').value;
    
    if (!userId || !amount || amount <= 0) {
        alert('कृपया सभी फील्ड्स को सही से भरें!');
        return;
    }
    
    const user = allUsers.find(u => u.id === userId);
    if (!user) {
        alert('यूजर नहीं मिला!');
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
    
    // Update user data in localStorage (simulated)
    const userDataKey = `userData_${userId}`;
    const userData = JSON.parse(localStorage.getItem(userDataKey)) || {};
    userData.userPoints = newPoints;
    localStorage.setItem(userDataKey, JSON.stringify(userData));
    
    // Update in-memory data
    user.points = newPoints;
    
    // Update UI
    updateUsersTable();
    updateUserSelect();
    updateAdminStats();
    
    // Log the action
    console.log(`User ${userId} points updated: ${action} ${amount} points. Reason: ${reason}`);
    
    alert(`✅ ${user.telegramUsername} के पॉइंट्स अपडेट हो गए! नए पॉइंट्स: ${newPoints}`);
    
    // Clear form
    document.getElementById('pointsAmount').value = '';
    document.getElementById('pointsReason').value = '';
}

// Update global settings
function updateGlobalSettings() {
    const miningRate = document.getElementById('globalMiningRate').value;
    
    if (miningRate && miningRate > 0) {
        // Save to localStorage (in real app, save to backend)
        localStorage.setItem('globalMiningRate', miningRate);
        alert('✅ ग्लोबल माइनिंग रेट अपडेट हो गया!');
    } else {
        alert('कृपया वैलिड माइनिंग रेट डालें!');
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
    
    // Save to localStorage (in real app, save to backend)
    localStorage.setItem('globalSettings', JSON.stringify(settings));
    
    alert('✅ ग्लोबल सेटिंग्स सेव हो गई!');
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
        alert('कृपया सभी जरूरी फील्ड्स भरें!');
        return;
    }
    
    // In real app, save to backend
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
    alert('✅ नया रिवॉर्ड जोड़ दिया गया!');
    
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
    
    rewardsTable.innerHTML = rewards.map(reward => `
        <tr>
            <td>${reward.name}</td>
            <td>${reward.cost.toLocaleString('hi-IN')}</td>
            <td>$${reward.value}</td>
            <td>${reward.type}</td>
            <td>
                <span style="color: ${reward.status === 'active' ? '#4CAF50' : '#FF6B6B'}">
                    ${reward.status === 'active' ? 'सक्रिय' : 'निष्क्रिय'}
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
    if (confirm('क्या आप सचमुच इस रिवॉर्ड को डिलीट करना चाहते हैं?')) {
        const rewards = JSON.parse(localStorage.getItem('adminRewards')) || [];
        const filteredRewards = rewards.filter(r => r.id !== rewardId);
        localStorage.setItem('adminRewards', JSON.stringify(filteredRewards));
        updateRewardsTable();
        alert('✅ रिवॉर्ड डिलीट हो गया!');
    }
}

// Edit user
function editUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (user) {
        // In real app, open edit modal
        alert(`Edit User: ${user.telegramUsername}\nPoints: ${user.points}\nLevel: ${user.level}`);
    }
}

// View user
function viewUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (user) {
        // In real app, open view modal
        const userInfo = `
यूजर डिटेल्स:
📱 Telegram: ${user.telegramUsername}
💰 पॉइंट्स: ${user.points.toLocaleString('hi-IN')}
🏆 लेवल: ${user.level}
⛏️ माइनिंग: ${user.miningStatus}
📋 टास्क्स: ${user.tasksCompleted}
💰 कुल कमाई: ${user.totalEarned.toLocaleString('hi-IN')}
📅 ज्वाइन किया: ${user.joinDate}
⏰ आखिरी एक्टिव: ${user.lastActive}
        `;
        alert(userInfo);
    }
}

// Delete user
function deleteUser(userId) {
    if (confirm('क्या आप सचमुच इस यूजर को डिलीट करना चाहते हैं? यह एक्शन undo नहीं हो सकता!')) {
        // Remove from localStorage
        localStorage.removeItem(`userData_${userId}`);
        localStorage.removeItem(`miningState_${userId}`);
        
        // Remove from in-memory array
        allUsers = allUsers.filter(u => u.id !== userId);
        
        // Update UI
        updateUsersTable();
        updateUserSelect();
        updateAdminStats();
        
        alert('✅ यूजर डिलीट हो गया!');
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
    alert('✅ डेटा रिफ्रेश हो गया!');
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initAdminPanel();
    
    // Load initial data
    loadGlobalSettings();
    updateRewardsTable();
});