// Admin Panel JavaScript - ENHANCED TELEGRAM PROFILE SYSTEM
let allUsers = [];
let autoRefreshInterval = null;

// Initialize Admin Panel
function initAdminPanel() {
    console.log('🚀 Admin Panel Initialized - ENHANCED TELEGRAM PROFILE SYSTEM');
    loadAllUsers();
    setupAutoRefresh();
    updateAdminStats();
}

// 🆕 ULTRA-ENHANCED USER DETECTION
function ultimateUserDetection() {
    console.log('🕵️ ULTIMATE User Detection - Finding ALL real users...');
    
    let foundUsers = 0;
    const allKeys = Object.keys(localStorage);
    console.log('🔑 Total localStorage keys:', allKeys.length);
    
    // Clear existing users array first
    allUsers = [];
    
    allKeys.forEach(key => {
        try {
            const item = localStorage.getItem(key);
            if (!item) return;
            
            // Skip obviously invalid keys
            if (key.length > 100 || key.includes('undefined')) return;
            
            const data = JSON.parse(item);
            
            // EXTREMELY BROAD user detection - ANY user-like data
            if (data && typeof data === 'object') {
                const hasPoints = data.points !== undefined || data.userPoints !== undefined;
                const hasTelegram = data.telegramUsername && data.telegramUsername !== 'Not set';
                const hasLevel = data.level !== undefined || data.miningLevel !== undefined;
                const hasReferral = data.referralData !== undefined;
                const hasMining = data.isMining !== undefined;
                
                // 🆕 FIX: More relaxed condition for user detection
                if ((hasPoints || hasTelegram || hasLevel || hasReferral || hasMining) && !key.includes('demo')) {
                    console.log('🎯 POTENTIAL USER FOUND in key:', key);
                    
                    let user = null;
                    
                    // Try different extraction methods
                    if (key.startsWith('userData_')) {
                        user = extractUserDataFromUserData(key, data);
                    } else if (key.startsWith('miningState')) {
                        user = extractUserDataFromMiningState(key, data);
                    } else if (key === 'currentUserData') {
                        user = extractUserDataFromCurrentUser(data);
                    } else if (hasTelegram || hasPoints || hasReferral || hasMining) {
                        user = extractUserData(key, data);
                    }
                    
                    // 🆕 FIX: Better user validation
                    if (user && user.telegramUsername && isValidTelegramUsername(user.telegramUsername)) {
                        const existingUserIndex = allUsers.findIndex(u => 
                            u.telegramUsername === user.telegramUsername
                        );
                        
                        if (existingUserIndex === -1) {
                            allUsers.push(user);
                            foundUsers++;
                            console.log('✅ ADDED USER:', user.telegramUsername, user.points);
                        } else {
                            // Update existing user with latest data
                            allUsers[existingUserIndex] = {...allUsers[existingUserIndex], ...user};
                        }
                    }
                }
            }
        } catch (e) {
            // Skip non-JSON or invalid data
        }
    });
    
    console.log(`🎯 ULTIMATE DETECTION: Found ${foundUsers} users`);
    return foundUsers;
}

// 🆕 EXTRACT FROM CURRENT USER DATA
function extractUserDataFromCurrentUser(data) {
    try {
        const user = {
            id: data.id || 'user_' + Date.now(),
            telegramUsername: data.telegramUsername || 'Not set',
            points: data.points || data.userPoints || 0,
            userPoints: data.points || data.userPoints || 0,
            level: data.level || data.miningLevel || 1,
            miningLevel: data.level || data.miningLevel || 1,
            isMining: data.isMining || false,
            miningStatus: data.miningStatus || (data.isMining ? 'Active' : 'Inactive'),
            tasksCompleted: data.tasksCompleted || data.totalTasksCompleted || 0,
            totalTasksCompleted: data.tasksCompleted || data.totalTasksCompleted || 0,
            joinDate: data.joinDate || new Date().toLocaleDateString('en-US'),
            lastActive: data.lastActive || new Date().toLocaleString('en-US'),
            totalEarned: data.totalEarned || data.totalPointsEarned || 0,
            totalPointsEarned: data.totalEarned || data.totalPointsEarned || 0,
            todayEarnings: data.todayEarnings || 0,
            miningSeconds: data.miningSeconds || 0,
            totalMiningHours: data.totalMiningHours || 0,
            speedLevel: data.speedLevel || 1,
            multiplierLevel: data.multiplierLevel || 1,
            loginStreak: data.loginStreak || 1,
            profileSource: 'current_user_data',
            referredUsers: data.referralData ? data.referralData.referredUsers : [],
            referralCount: data.referralData ? data.referralData.referredUsers.length : 0
        };
        
        return user;
    } catch (error) {
        console.error('Error extracting from current user data:', error);
        return null;
    }
}

// 🆕 FORCE DETECT ALL APP USERS
function forceDetectAllAppUsers() {
    console.log('🔍 FORCE DETECTING ALL APP USERS...');
    
    // Check for force detection events
    const forceEvent = getFromStorage('ADMIN_FORCE_DETECT', null);
    if (forceEvent) {
        console.log('🎯 FORCE DETECTION EVENT FOUND:', forceEvent);
        addUserFromForceEvent(forceEvent);
        localStorage.removeItem('ADMIN_FORCE_DETECT');
    }
    
    // Check all possible user storage locations
    const detectionMethods = [
        detectFromUserData(),
        detectFromMiningState(), 
        detectFromCurrentUser(),
        detectFromSimpleStorage(),
        detectFromActivities()
    ];
    
    console.log(`✅ FORCE DETECTION COMPLETE: ${allUsers.length} users found`);
    return allUsers.length;
}

// 🆕 DETECT FROM USER DATA
function detectFromUserData() {
    console.log('📊 Detecting from userData...');
    const userDataKeys = Object.keys(localStorage).filter(key => key.startsWith('userData_'));
    
    userDataKeys.forEach(key => {
        try {
            const data = JSON.parse(localStorage.getItem(key));
            const user = extractUserDataFromUserData(key, data);
            if (user && user.telegramUsername && isValidTelegramUsername(user.telegramUsername)) {
                addUserToArray(user);
            }
        } catch (error) {
            console.error('Error detecting from userData:', key, error);
        }
    });
}

// 🆕 DETECT FROM MINING STATE
function detectFromMiningState() {
    console.log('⛏️ Detecting from miningState...');
    const miningStateKeys = Object.keys(localStorage).filter(key => key.startsWith('miningState'));
    
    miningStateKeys.forEach(key => {
        try {
            const data = JSON.parse(localStorage.getItem(key));
            const user = extractUserDataFromMiningState(key, data);
            if (user && user.telegramUsername && isValidTelegramUsername(user.telegramUsername)) {
                addUserToArray(user);
            }
        } catch (error) {
            console.error('Error detecting from miningState:', key, error);
        }
    });
}

// 🆕 DETECT FROM SIMPLE STORAGE (telegramUsername, userPoints, etc.)
function detectFromSimpleStorage() {
    console.log('📱 Detecting from simple storage...');
    
    const telegramUser = localStorage.getItem('telegramUsername');
    const userPoints = parseInt(localStorage.getItem('userPoints')) || 0;
    const miningLevel = parseInt(localStorage.getItem('miningLevel')) || 1;
    const isMining = localStorage.getItem('isMining') === 'true';
    
    if (telegramUser && isValidTelegramUsername(telegramUser)) {
        const userId = localStorage.getItem('userId') || `user_${Date.now()}`;
        
        const user = {
            id: userId,
            telegramUsername: telegramUser,
            points: userPoints,
            userPoints: userPoints,
            level: miningLevel,
            miningLevel: miningLevel,
            isMining: isMining,
            miningStatus: isMining ? 'Active' : 'Inactive',
            tasksCompleted: parseInt(localStorage.getItem('totalTasksCompleted')) || 0,
            totalTasksCompleted: parseInt(localStorage.getItem('totalTasksCompleted')) || 0,
            joinDate: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            totalEarned: parseInt(localStorage.getItem('totalPointsEarned')) || 0,
            totalPointsEarned: parseInt(localStorage.getItem('totalPointsEarned')) || 0,
            todayEarnings: parseInt(localStorage.getItem('todayEarnings')) || 0,
            miningSeconds: parseInt(localStorage.getItem('miningSeconds')) || 0,
            totalMiningHours: parseInt(localStorage.getItem('totalMiningHours')) || 0,
            speedLevel: 1,
            multiplierLevel: 1,
            loginStreak: 1,
            profileSource: 'simple_storage',
            referredUsers: [],
            referralCount: 0
        };
        
        addUserToArray(user);
        console.log('✅ User from simple storage:', telegramUser);
    }
}

// 🆕 DETECT FROM ACTIVITIES
function detectFromActivities() {
    console.log('📊 Detecting from activities...');
    const activities = getFromStorage('userActivities', []);
    
    activities.forEach(activity => {
        if (activity.telegramUsername && isValidTelegramUsername(activity.telegramUsername)) {
            const user = {
                id: activity.id || 'user_' + Date.now(),
                telegramUsername: activity.telegramUsername,
                points: activity.points || activity.userPoints || 0,
                userPoints: activity.points || activity.userPoints || 0,
                level: activity.level || activity.miningLevel || 1,
                miningLevel: activity.level || activity.miningLevel || 1,
                isMining: activity.isMining || false,
                miningStatus: activity.miningStatus || (activity.isMining ? 'Active' : 'Inactive'),
                tasksCompleted: 0,
                totalTasksCompleted: 0,
                joinDate: new Date().toLocaleDateString('en-US'),
                lastActive: activity.lastActive || new Date().toLocaleString('en-US'),
                totalEarned: 0,
                totalPointsEarned: 0,
                todayEarnings: 0,
                miningSeconds: 0,
                totalMiningHours: 0,
                speedLevel: 1,
                multiplierLevel: 1,
                loginStreak: 1,
                profileSource: 'user_activity',
                referredUsers: [],
                referralCount: 0
            };
            
            addUserToArray(user);
        }
    });
}

// 🆕 ADD USER FROM FORCE EVENT
function addUserFromForceEvent(forceEvent) {
    if (forceEvent && forceEvent.telegramUsername && isValidTelegramUsername(forceEvent.telegramUsername)) {
        const user = {
            id: forceEvent.userId || 'user_' + Date.now(),
            telegramUsername: forceEvent.telegramUsername,
            points: forceEvent.data.points || 0,
            userPoints: forceEvent.data.points || 0,
            level: forceEvent.data.level || 1,
            miningLevel: forceEvent.data.level || 1,
            isMining: forceEvent.data.miningStatus === 'Active',
            miningStatus: forceEvent.data.miningStatus || 'Inactive',
            tasksCompleted: 0,
            totalTasksCompleted: 0,
            joinDate: new Date().toLocaleDateString('en-US'),
            lastActive: new Date().toLocaleString('en-US'),
            totalEarned: 0,
            totalPointsEarned: 0,
            todayEarnings: 0,
            miningSeconds: 0,
            totalMiningHours: 0,
            speedLevel: 1,
            multiplierLevel: 1,
            loginStreak: 1,
            profileSource: 'force_detection',
            referredUsers: [],
            referralCount: 0
        };
        
        addUserToArray(user);
        console.log('✅ User from force detection:', forceEvent.telegramUsername);
    }
}

// 🆕 ADD USER TO ARRAY WITH DUPLICATE CHECK
function addUserToArray(user) {
    if (!user || !user.telegramUsername) return;
    
    const existingIndex = allUsers.findIndex(u => 
        u.telegramUsername === user.telegramUsername
    );
    
    if (existingIndex === -1) {
        allUsers.push(user);
    } else {
        // Update existing user but preserve some data
        allUsers[existingIndex] = {
            ...allUsers[existingIndex],
            ...user,
            id: allUsers[existingIndex].id // Preserve original ID
        };
    }
}

// ✅ ENHANCED: Load all users with ULTRA detection
function loadAllUsers() {
    console.log('📥 ENHANCED Loading users...');
    
    allUsers = [];
    
    // 🆕 MULTI-STEP DETECTION
    const steps = [
        () => forceDetectAllAppUsers(),
        () => ultimateUserDetection(),
        () => checkDirectTelegramUsers(),
        () => checkStandaloneTelegramIds(),
        () => checkTelegramProfileActivities()
    ];
    
    steps.forEach(step => {
        try {
            step();
        } catch (error) {
            console.error('Error in detection step:', error);
        }
    });
    
    // 🆕 POST-PROCESSING
    validateAndCleanTelegramUsernames();
    removeDuplicateUsers();
    addReferralDataToUsers();
    
    // 🆕 ENHANCED: Check for real users more carefully
    const realUsers = allUsers.filter(user => 
        user.telegramUsername && 
        isValidTelegramUsername(user.telegramUsername) &&
        !user.id.startsWith('demo_')
    );
    
    if (realUsers.length === 0) {
        console.log('⚠️ No real users found, showing demo data');
        createDemoUsers();
    } else {
        console.log(`🎉 Found ${realUsers.length} REAL users!`);
        allUsers = realUsers;
    }
    
    console.log(`✅ FINAL LOADED: ${allUsers.length} users`);
    updateUsersTable();
    updateUserSelect();
    updateAdminStats();
}

// 🆕 NEW: Add referral data to all users
function addReferralDataToUsers() {
    console.log('🔍 Adding referral data to all users...');
    
    allUsers.forEach(user => {
        try {
            // Try to get referral data from userData
            const userDataKey = `userData_${user.id}`;
            const userData = JSON.parse(localStorage.getItem(userDataKey));
            
            if (userData && userData.referralData) {
                user.referredUsers = userData.referralData.referredUsers || [];
                user.referralCount = user.referredUsers.length;
                console.log(`📊 Found ${user.referralCount} referrals for ${user.telegramUsername}`);
            }
            
            // Also check miningState
            const miningStateKey = `miningState_${user.id}`;
            const miningState = JSON.parse(localStorage.getItem(miningStateKey));
            
            if (miningState && miningState.referralData) {
                user.referredUsers = miningState.referralData.referredUsers || [];
                user.referralCount = user.referredUsers.length;
                console.log(`📊 Found ${user.referralCount} referrals for ${user.telegramUsername} from miningState`);
            }
            
            // Check standalone referral data
            const standaloneReferralData = getFromStorage('referralData', {});
            if (standaloneReferralData && standaloneReferralData.referredUsers && standaloneReferralData.telegramUsername === user.telegramUsername) {
                user.referredUsers = standaloneReferralData.referredUsers;
                user.referralCount = user.referredUsers.length;
                console.log(`📊 Found ${user.referralCount} referrals for ${user.telegramUsername} from standalone`);
            }
            
        } catch (error) {
            console.error('Error adding referral data for user:', user.telegramUsername, error);
        }
    });
}

// 🆕 NEW: Remove duplicate users by Telegram username
function removeDuplicateUsers() {
    console.log('🔍 Removing duplicate users...');
    
    const uniqueUsers = [];
    const telegramUsernames = new Set();
    
    allUsers.forEach(user => {
        if (user.telegramUsername && !telegramUsernames.has(user.telegramUsername)) {
            telegramUsernames.add(user.telegramUsername);
            uniqueUsers.push(user);
        } else {
            console.log('🗑️ Removing duplicate user:', user.telegramUsername);
        }
    });
    
    const removedCount = allUsers.length - uniqueUsers.length;
    allUsers = uniqueUsers;
    
    console.log(`✅ Removed ${removedCount} duplicate users`);
    return removedCount;
}

// 🆕 NEW: Clear all demo users
function clearAllDemoUsers() {
    Object.keys(localStorage).forEach(key => {
        if (key.includes('demo_user') || key.includes('userData_demo')) {
            localStorage.removeItem(key);
            console.log('🧹 Removed demo user:', key);
        }
    });
    console.log('✅ All demo users cleared');
}

// 🆕 NEW: Force find app user
function forceFindAppUser() {
    console.log('🔍 Force finding app user...');
    
    // Check multiple storage locations
    const locations = [
        'currentUserData',
        'miningState', 
        'telegramUsername',
        'userData_user_1763143172425_3kfwfip4m', // Specific user ID from logs
        'userProfile'
    ];
    
    locations.forEach(location => {
        try {
            const data = JSON.parse(localStorage.getItem(location));
            if (data && data.telegramUsername) {
                console.log('📱 Found in', location, ':', data.telegramUsername);
                addUserToAdmin(data, location);
            }
        } catch(e) {
            // Try direct string check for telegramUsername
            if (location === 'telegramUsername') {
                const telegramUser = localStorage.getItem('telegramUsername');
                if (telegramUser && telegramUser !== 'null' && telegramUser !== 'Not set') {
                    console.log('📱 Found direct Telegram username:', telegramUser);
                    const userData = {
                        telegramUsername: telegramUser,
                        id: localStorage.getItem('userId') || 'user_' + Date.now(),
                        userPoints: parseInt(localStorage.getItem('userPoints')) || 0,
                        miningLevel: parseInt(localStorage.getItem('miningLevel')) || 1
                    };
                    addUserToAdmin(userData, 'direct_telegram');
                }
            }
        }
    });
}

// 🆕 NEW: Add user to admin panel
function addUserToAdmin(userData, source) {
    if (!userData.telegramUsername || userData.telegramUsername === 'Not set') {
        return;
    }
    
    const user = {
        id: userData.id || userData.userId || 'user_' + Date.now(),
        telegramUsername: userData.telegramUsername,
        points: userData.points || userData.userPoints || 0,
        userPoints: userData.points || userData.userPoints || 0,
        level: userData.level || userData.miningLevel || 1,
        miningLevel: userData.level || userData.miningLevel || 1,
        miningStatus: userData.miningStatus || (userData.isMining ? 'Active' : 'Inactive'),
        isMining: userData.isMining || false,
        tasksCompleted: userData.tasksCompleted || userData.totalTasksCompleted || 0,
        totalTasksCompleted: userData.tasksCompleted || userData.totalTasksCompleted || 0,
        joinDate: userData.joinDate || new Date().toLocaleDateString('en-US'),
        lastActive: userData.lastActive || new Date().toLocaleString('en-US'),
        totalEarned: userData.totalEarned || userData.totalPointsEarned || 0,
        totalPointsEarned: userData.totalEarned || userData.totalPointsEarned || 0,
        todayEarnings: userData.todayEarnings || 0,
        miningSeconds: userData.miningSeconds || 0,
        totalMiningHours: userData.totalMiningHours || 0,
        speedLevel: userData.speedLevel || 1,
        multiplierLevel: userData.multiplierLevel || 1,
        loginStreak: userData.loginStreak || 1,
        profileSource: source,
        referredUsers: userData.referredUsers || [],
        referralCount: userData.referredUsers ? userData.referredUsers.length : 0
    };
    
    // 🆕 FIX: Check if already exists by Telegram username
    const existingUserIndex = allUsers.findIndex(u => u.telegramUsername === user.telegramUsername);
    
    if (existingUserIndex === -1) {
        allUsers.push(user);
        console.log('✅ Added user from', source, ':', user.telegramUsername);
    } else {
        // Update existing user
        allUsers[existingUserIndex] = user;
        console.log('🔄 Updated existing user from', source, ':', user.telegramUsername);
    }
}

// 🆕 FIX: Enhanced Telegram username validation and cleanup
function validateAndCleanTelegramUsernames() {
    console.log('🔧 Validating and cleaning Telegram usernames...');
    
    let fixedCount = 0;
    
    allUsers.forEach(user => {
        if (!user.telegramUsername || 
            user.telegramUsername === '' || 
            user.telegramUsername === 'Not set' ||
            user.telegramUsername.trim() === '') {
            
            // Try to find the real Telegram username from other sources
            const realUsername = findRealTelegramUsername(user.id);
            if (realUsername && realUsername !== '' && realUsername !== 'Not set') {
                user.telegramUsername = realUsername;
                fixedCount++;
                console.log('✅ Fixed empty Telegram username for user:', user.id, '->', realUsername);
            } else {
                // Remove users with empty Telegram usernames
                console.log('🗑️ Removing user with empty Telegram username:', user.id);
            }
        }
    });
    
    // Remove users with empty Telegram usernames
    allUsers = allUsers.filter(user => 
        user.telegramUsername && 
        user.telegramUsername !== '' && 
        user.telegramUsername !== 'Not set' &&
        user.telegramUsername.trim() !== ''
    );
    
    console.log(`✅ Fixed ${fixedCount} empty Telegram usernames`);
    return fixedCount;
}

// 🆕 Find real Telegram username from localStorage
function findRealTelegramUsername(userId) {
    try {
        // Check userData format
        const userDataKey = `userData_${userId}`;
        const userData = JSON.parse(localStorage.getItem(userDataKey));
        if (userData && userData.telegramUsername && userData.telegramUsername !== 'Not set') {
            return userData.telegramUsername;
        }
        
        // Check miningState format
        const miningStateKey = `miningState_${userId}`;
        const miningState = JSON.parse(localStorage.getItem(miningStateKey));
        if (miningState && miningState.telegramUsername && miningState.telegramUsername !== 'Not set') {
            return miningState.telegramUsername;
        }
        
        // Check direct Telegram storage
        const directTelegram = localStorage.getItem('telegramUsername');
        if (directTelegram && directTelegram !== 'Not set') {
            return directTelegram;
        }
        
        return null;
    } catch (error) {
        console.error('Error finding Telegram username:', error);
        return null;
    }
}

// 🆕 NEW FUNCTION: Check direct Telegram users from localStorage
function checkDirectTelegramUsers() {
    console.log('🔍 Checking direct Telegram users...');
    
    // Direct Telegram ID check
    const telegramUser = localStorage.getItem('telegramUsername');
    const userId = localStorage.getItem('userId');
    
    // 🆕 FIX: Validate Telegram username before adding
    if (telegramUser && isValidTelegramUsername(telegramUser)) {
        console.log('🎉 DIRECT TELEGRAM USER FOUND:', telegramUser);
        
        // Check if already exists in allUsers by Telegram username
        const existingUserIndex = allUsers.findIndex(u => u.telegramUsername === telegramUser);
        
        if (existingUserIndex === -1) {
            const directUser = {
                id: userId || 'user_' + Date.now(),
                telegramUsername: telegramUser,
                points: parseInt(localStorage.getItem('userPoints')) || 0,
                userPoints: parseInt(localStorage.getItem('userPoints')) || 0,
                level: parseInt(localStorage.getItem('miningLevel')) || 1,
                miningLevel: parseInt(localStorage.getItem('miningLevel')) || 1,
                isMining: localStorage.getItem('isMining') === 'true',
                miningStatus: localStorage.getItem('isMining') === 'true' ? 'Active' : 'Inactive',
                tasksCompleted: parseInt(localStorage.getItem('totalTasksCompleted')) || 0,
                totalTasksCompleted: parseInt(localStorage.getItem('totalTasksCompleted')) || 0,
                joinDate: new Date().toLocaleDateString('en-US'),
                lastActive: new Date().toLocaleString('en-US'),
                totalEarned: parseInt(localStorage.getItem('totalPointsEarned')) || 0,
                totalPointsEarned: parseInt(localStorage.getItem('totalPointsEarned')) || 0,
                todayEarnings: parseInt(localStorage.getItem('todayEarnings')) || 0,
                miningSeconds: parseInt(localStorage.getItem('miningSeconds')) || 0,
                totalMiningHours: parseInt(localStorage.getItem('totalMiningHours')) || 0,
                speedLevel: 1,
                multiplierLevel: 1,
                loginStreak: 1,
                profileSource: 'direct_telegram',
                referredUsers: [],
                referralCount: 0
            };
            
            allUsers.push(directUser);
            console.log('✅ Added direct Telegram user:', telegramUser);
        } else {
            // Update existing user
            allUsers[existingUserIndex].points = parseInt(localStorage.getItem('userPoints')) || 0;
            allUsers[existingUserIndex].userPoints = parseInt(localStorage.getItem('userPoints')) || 0;
            allUsers[existingUserIndex].miningStatus = localStorage.getItem('isMining') === 'true' ? 'Active' : 'Inactive';
            allUsers[existingUserIndex].isMining = localStorage.getItem('isMining') === 'true';
            console.log('🔄 Updated existing Telegram user:', telegramUser);
        }
    } else {
        console.log('⚠️ Direct Telegram user found but invalid:', telegramUser);
    }
    
    return allUsers;
}

// 🆕 CHECK TELEGRAM PROFILE ACTIVITIES
function checkTelegramProfileActivities() {
    console.log('🔍 Checking Telegram profile activities...');
    
    try {
        // Check for user activities
        const userActivities = getFromStorage('userActivities', []);
        const adminNotifications = getFromStorage('adminNotifications', []);
        
        console.log('📊 User activities found:', userActivities.length);
        console.log('📢 Admin notifications:', adminNotifications.length);
        
        // Process activities to find new users
        userActivities.forEach(activity => {
            if (activity.telegramUsername && isValidTelegramUsername(activity.telegramUsername)) {
                // 🆕 FIX: Check if it's NOT a demo user
                if (!activity.id.startsWith('demo_') && !activity.telegramUsername.startsWith('@demo')) {
                    const existingUserIndex = allUsers.findIndex(u => u.telegramUsername === activity.telegramUsername);
                    if (existingUserIndex === -1) {
                        // Create user from activity
                        const newUser = {
                            id: activity.id,
                            telegramUsername: activity.telegramUsername,
                            points: activity.points || activity.userPoints || 0,
                            userPoints: activity.points || activity.userPoints || 0,
                            level: activity.level || activity.miningLevel || 1,
                            miningLevel: activity.level || activity.miningLevel || 1,
                            isMining: activity.isMining || false,
                            miningStatus: activity.miningStatus || (activity.isMining ? 'Active' : 'Inactive'),
                            tasksCompleted: 0,
                            totalTasksCompleted: 0,
                            joinDate: new Date().toLocaleDateString('en-US'),
                            lastActive: activity.lastActive || new Date().toLocaleString('en-US'),
                            totalEarned: 0,
                            totalPointsEarned: 0,
                            todayEarnings: 0,
                            miningSeconds: 0,
                            totalMiningHours: 0,
                            speedLevel: 1,
                            multiplierLevel: 1,
                            loginStreak: 1,
                            profileSource: 'telegram_activity',
                            referredUsers: [],
                            referralCount: 0
                        };
                        
                        allUsers.push(newUser);
                        console.log('🆕 REAL User added from activity:', activity.telegramUsername);
                    }
                }
            }
        });
        
        // Process notifications for new user events
        adminNotifications.forEach(notification => {
            if (notification.event === 'user_created' && notification.data) {
                const userData = notification.data;
                if (userData.telegramUsername && isValidTelegramUsername(userData.telegramUsername)) {
                    // 🆕 FIX: Check if it's NOT a demo user
                    if (!userData.id.startsWith('demo_') && !userData.telegramUsername.startsWith('@demo')) {
                        const existingUserIndex = allUsers.findIndex(u => u.telegramUsername === userData.telegramUsername);
                        if (existingUserIndex === -1) {
                            const newUser = {
                                id: userData.id,
                                telegramUsername: userData.telegramUsername,
                                points: userData.points || userData.userPoints || 0,
                                userPoints: userData.points || userData.userPoints || 0,
                                level: userData.level || userData.miningLevel || 1,
                                miningLevel: userData.level || userData.miningLevel || 1,
                                isMining: userData.isMining || false,
                                miningStatus: userData.miningStatus || (userData.isMining ? 'Active' : 'Inactive'),
                                tasksCompleted: userData.tasksCompleted || userData.totalTasksCompleted || 0,
                                totalTasksCompleted: userData.tasksCompleted || userData.totalTasksCompleted || 0,
                                joinDate: userData.joinDate || new Date().toLocaleDateString('en-US'),
                                lastActive: userData.lastActive || new Date().toLocaleString('en-US'),
                                totalEarned: userData.totalEarned || userData.totalPointsEarned || 0,
                                totalPointsEarned: userData.totalEarned || userData.totalPointsEarned || 0,
                                todayEarnings: userData.todayEarnings || 0,
                                miningSeconds: userData.miningSeconds || 0,
                                totalMiningHours: userData.totalMiningHours || 0,
                                speedLevel: userData.speedLevel || 1,
                                multiplierLevel: userData.multiplierLevel || 1,
                                loginStreak: userData.loginStreak || 1,
                                profileSource: userData.profileSource || 'telegram_notification',
                                referredUsers: userData.referredUsers || [],
                                referralCount: userData.referredUsers ? userData.referredUsers.length : 0
                            };
                            
                            allUsers.push(newUser);
                            console.log('🆕 REAL User added from notification:', userData.telegramUsername);
                        }
                    }
                }
            }
        });
        
    } catch (error) {
        console.error('Error checking Telegram activities:', error);
    }
}

// Extract user data from userData_ format (NEW - from enhanced Telegram system)
function extractUserDataFromUserData(key, data) {
    try {
        const userId = key.replace('userData_', '');
        
        const user = {
            id: userId,
            telegramUsername: data.telegramUsername || 'Not set',
            points: data.userPoints || data.points || 0,
            userPoints: data.userPoints || data.points || 0,
            level: data.miningLevel || data.level || 1,
            miningLevel: data.miningLevel || data.level || 1,
            isMining: data.isMining || false,
            miningStatus: data.isMining ? 'Active' : 'Inactive',
            tasksCompleted: data.totalTasksCompleted || data.tasksCompleted || 0,
            totalTasksCompleted: data.totalTasksCompleted || data.tasksCompleted || 0,
            joinDate: data.joinDate || new Date().toLocaleDateString('en-US'),
            lastActive: data.lastActive || new Date().toLocaleString('en-US'),
            totalEarned: data.totalPointsEarned || data.totalEarned || 0,
            totalPointsEarned: data.totalPointsEarned || data.totalEarned || 0,
            todayEarnings: data.todayEarnings || 0,
            miningSeconds: data.miningSeconds || 0,
            totalMiningHours: data.totalMiningHours || 0,
            speedLevel: data.speedLevel || 1,
            multiplierLevel: data.multiplierLevel || 1,
            loginStreak: data.loginStreak || 1,
            profileSource: data.profileSource || 'userData',
            referredUsers: data.referralData ? data.referralData.referredUsers : [],
            referralCount: data.referralData ? data.referralData.referredUsers.length : 0
        };
        
        return user;
    } catch (error) {
        console.error('Error extracting from userData:', error);
        return null;
    }
}

// Check for standalone Telegram IDs in localStorage
function checkStandaloneTelegramIds() {
    console.log('🔍 Checking for standalone Telegram IDs...');
    
    try {
        // Check for telegramUsername key
        const telegramUsername = localStorage.getItem('telegramUsername');
        if (telegramUsername && isValidTelegramUsername(telegramUsername)) {
            const userId = localStorage.getItem('userId') || 'user_' + Date.now();
            
            // 🆕 FIX: Check if it's NOT a demo user
            if (!userId.startsWith('demo_') && !telegramUsername.startsWith('@demo')) {
                // Check if this user already exists by Telegram username
                const existingUserIndex = allUsers.findIndex(u => u.telegramUsername === telegramUsername);
                
                if (existingUserIndex === -1) {
                    const userData = {
                        id: userId,
                        telegramUsername: telegramUsername,
                        points: parseInt(localStorage.getItem('userPoints')) || 0,
                        userPoints: parseInt(localStorage.getItem('userPoints')) || 0,
                        level: parseInt(localStorage.getItem('miningLevel')) || 1,
                        miningLevel: parseInt(localStorage.getItem('miningLevel')) || 1,
                        isMining: localStorage.getItem('isMining') === 'true',
                        miningStatus: localStorage.getItem('isMining') === 'true' ? 'Active' : 'Inactive',
                        tasksCompleted: parseInt(localStorage.getItem('totalTasksCompleted')) || 0,
                        totalTasksCompleted: parseInt(localStorage.getItem('totalTasksCompleted')) || 0,
                        joinDate: new Date().toLocaleDateString('en-US'),
                        lastActive: new Date().toLocaleString('en-US'),
                        totalEarned: parseInt(localStorage.getItem('totalPointsEarned')) || 0,
                        totalPointsEarned: parseInt(localStorage.getItem('totalPointsEarned')) || 0,
                        todayEarnings: parseInt(localStorage.getItem('todayEarnings')) || 0,
                        miningSeconds: parseInt(localStorage.getItem('miningSeconds')) || 0,
                        totalMiningHours: parseInt(localStorage.getItem('totalMiningHours')) || 0,
                        speedLevel: 1,
                        multiplierLevel: 1,
                        loginStreak: 1,
                        profileSource: 'standalone_telegram',
                        referredUsers: [],
                        referralCount: 0
                    };
                    
                    allUsers.push(userData);
                    console.log('✅ Added REAL user from standalone Telegram ID:', telegramUsername);
                }
            }
        }
    } catch (error) {
        console.error('Error checking standalone Telegram IDs:', error);
    }
}

// Extract user data from miningState
function extractUserDataFromMiningState(key, data) {
    try {
        const userId = key.replace('miningState_', '') || key.replace('miningState', '') || 'user_' + Date.now();
        
        let telegramUsername = 'Not set';
        if (data.telegramUsername && data.telegramUsername !== 'Not set' && data.telegramUsername !== '') {
            telegramUsername = data.telegramUsername;
        }
        
        const user = {
            id: userId,
            telegramUsername: telegramUsername,
            points: data.userPoints || data.points || 0,
            userPoints: data.userPoints || data.points || 0,
            level: data.miningLevel || data.level || 1,
            miningLevel: data.miningLevel || data.level || 1,
            isMining: data.isMining || false,
            miningStatus: data.isMining ? 'Active' : 'Inactive',
            tasksCompleted: data.totalTasksCompleted || data.tasksCompleted || 0,
            totalTasksCompleted: data.totalTasksCompleted || data.tasksCompleted || 0,
            joinDate: data.joinDate || new Date().toLocaleDateString('en-US'),
            lastActive: data.lastActive || new Date().toLocaleString('en-US'),
            totalEarned: data.totalPointsEarned || data.totalEarned || 0,
            totalPointsEarned: data.totalPointsEarned || data.totalEarned || 0,
            todayEarnings: data.todayEarnings || 0,
            miningSeconds: data.miningSeconds || 0,
            totalMiningHours: data.totalMiningHours || 0,
            speedLevel: data.speedLevel || 1,
            multiplierLevel: data.multiplierLevel || 1,
            loginStreak: data.loginStreak || 1,
            profileSource: 'miningState',
            referredUsers: data.referralData ? data.referralData.referredUsers : [],
            referralCount: data.referralData ? data.referralData.referredUsers.length : 0
        };
        
        return user;
    } catch (error) {
        console.error('Error extracting from miningState:', error);
        return null;
    }
}

// Check if data object contains user information
function isUserData(data) {
    return data && (
        data.userPoints !== undefined ||
        data.miningLevel !== undefined ||
        data.totalPointsEarned !== undefined ||
        data.telegramUsername !== undefined ||
        (data.referralData && data.referralData.referralCode) ||
        data.isMining !== undefined
    );
}

// Extract user data from localStorage item (generic)
function extractUserData(key, data) {
    try {
        // Generate user ID from key or create new one
        let userId = '';
        if (key.includes('userData_')) {
            userId = key.replace('userData_', '');
        } else if (key.includes('miningState_')) {
            userId = key.replace('miningState_', '');
        } else if (key.includes('userProfile_')) {
            userId = key.replace('userProfile_', '');
        } else {
            userId = 'user_' + Date.now() + Math.random().toString(36).substr(2, 9);
        }
        
        // Extract Telegram username - check multiple possible locations
        let telegramUsername = 'Not set';
        
        if (data.telegramUsername && data.telegramUsername !== 'Not set' && data.telegramUsername !== '') {
            telegramUsername = data.telegramUsername;
        } else if (data.referralData && data.referralData.telegramUsername) {
            telegramUsername = data.referralData.telegramUsername;
        } else if (data.userData && data.userData.telegramUsername) {
            telegramUsername = data.userData.telegramUsername;
        }
        
        const user = {
            id: userId,
            telegramUsername: telegramUsername,
            points: data.userPoints || data.points || 0,
            userPoints: data.userPoints || data.points || 0,
            level: data.miningLevel || data.level || 1,
            miningLevel: data.miningLevel || data.level || 1,
            isMining: data.isMining || false,
            miningStatus: data.isMining ? 'Active' : 'Inactive',
            tasksCompleted: data.totalTasksCompleted || data.tasksCompleted || 0,
            totalTasksCompleted: data.totalTasksCompleted || data.tasksCompleted || 0,
            joinDate: data.joinDate || new Date().toLocaleDateString('en-US'),
            lastActive: data.lastActive || new Date().toLocaleString('en-US'),
            totalEarned: data.totalPointsEarned || data.totalEarned || 0,
            totalPointsEarned: data.totalPointsEarned || data.totalEarned || 0,
            todayEarnings: data.todayEarnings || 0,
            miningSeconds: data.miningSeconds || 0,
            totalMiningHours: data.totalMiningHours || 0,
            speedLevel: data.speedLevel || 1,
            multiplierLevel: data.multiplierLevel || 1,
            loginStreak: data.loginStreak || 1,
            profileSource: 'generic',
            referredUsers: data.referralData ? data.referralData.referredUsers : [],
            referralCount: data.referralData ? data.referralData.referredUsers.length : 0
        };
        
        return user;
    } catch (error) {
        console.error('Error extracting user data:', error);
        return null;
    }
}

// 🆕 UPDATED: More relaxed Telegram username validation
function isValidTelegramUsername(username) {
    if (!username || username === '' || username === 'Not set' || username === 'null') {
        return false;
    }
    
    // Remove @ for validation
    const cleanUsername = username.replace('@', '').trim();
    
    if (cleanUsername === '') {
        return false;
    }
    
    // More relaxed validation for testing
    if (cleanUsername.length < 3 || cleanUsername.length > 50) {
        return false;
    }
    
    // Allow most common characters in usernames
    const relaxedRegex = /^[a-zA-Z0-9_\.\-]{3,50}$/;
    
    // Also allow demo users for testing
    if (username.startsWith('@demo') || username.startsWith('demo_')) {
        return true;
    }
    
    return relaxedRegex.test(cleanUsername);
}

// Create demo users for testing with realistic Telegram usernames
function createDemoUsers() {
    const demoUsers = [
        {
            id: 'demo_user_1',
            telegramUsername: '@john_doe',
            points: 1500,
            userPoints: 1500,
            level: 2,
            miningLevel: 2,
            isMining: true,
            miningStatus: 'Active',
            tasksCompleted: 15,
            totalTasksCompleted: 15,
            joinDate: '2024-01-15',
            lastActive: new Date().toLocaleString('en-US'),
            totalEarned: 2000,
            totalPointsEarned: 2000,
            todayEarnings: 150,
            miningSeconds: 3600,
            totalMiningHours: 10,
            speedLevel: 2,
            multiplierLevel: 1,
            loginStreak: 5,
            profileSource: 'demo',
            referredUsers: ['@jane_smith'],
            referralCount: 1
        },
        {
            id: 'demo_user_2',
            telegramUsername: '@jane_smith',
            points: 800,
            userPoints: 800,
            level: 1,
            miningLevel: 1,
            isMining: false,
            miningStatus: 'Inactive',
            tasksCompleted: 8,
            totalTasksCompleted: 8,
            joinDate: '2024-01-20',
            lastActive: new Date().toLocaleString('en-US'),
            totalEarned: 1000,
            totalPointsEarned: 1000,
            todayEarnings: 80,
            miningSeconds: 1800,
            totalMiningHours: 5,
            speedLevel: 1,
            multiplierLevel: 1,
            loginStreak: 3,
            profileSource: 'demo',
            referredUsers: [],
            referralCount: 0
        },
        {
            id: 'demo_user_3',
            telegramUsername: '@tech_guru',
            points: 3500,
            userPoints: 3500,
            level: 3,
            miningLevel: 3,
            isMining: true,
            miningStatus: 'Active',
            tasksCompleted: 25,
            totalTasksCompleted: 25,
            joinDate: '2024-01-10',
            lastActive: new Date().toLocaleString('en-US'),
            totalEarned: 4500,
            totalPointsEarned: 4500,
            todayEarnings: 300,
            miningSeconds: 7200,
            totalMiningHours: 20,
            speedLevel: 3,
            multiplierLevel: 2,
            loginStreak: 12,
            profileSource: 'demo',
            referredUsers: ['@john_doe', '@jane_smith'],
            referralCount: 2
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
                referredUsers: user.referredUsers,
                totalEarned: 0
            },
            profileSource: 'demo'
        };
        
        localStorage.setItem(`userData_${user.id}`, JSON.stringify(userData));
    });
    
    console.log('✅ Created demo users with Telegram profiles');
}

// Update admin statistics
function updateAdminStats() {
    const totalUsers = allUsers.length;
    const totalPoints = allUsers.reduce((sum, user) => sum + user.points, 0);
    const activeUsers = allUsers.filter(user => user.miningStatus === 'Active').length;
    const todayEarnings = allUsers.reduce((sum, user) => sum + user.todayEarnings, 0);
    const totalReferrals = allUsers.reduce((sum, user) => sum + (user.referralCount || 0), 0);
    
    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('totalPoints').textContent = totalPoints.toLocaleString('en-US');
    document.getElementById('activeUsers').textContent = activeUsers;
    document.getElementById('todayEarnings').textContent = todayEarnings.toLocaleString('en-US');
    
    // Update analytics stats
    const totalMining = allUsers.reduce((sum, user) => sum + user.totalMiningHours, 0);
    const totalTasks = allUsers.reduce((sum, user) => sum + user.tasksCompleted, 0);
    const totalVideos = allUsers.reduce((sum, user) => sum + Math.floor(user.tasksCompleted / 2), 0);
    
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
    userData.points = newPoints;
    userData.totalPointsEarned = (userData.totalPointsEarned || 0) + (action === 'add' ? amount : 0);
    userData.totalEarned = (userData.totalEarned || 0) + (action === 'add' ? amount : 0);
    localStorage.setItem(userDataKey, JSON.stringify(userData));
    
    // Also update miningState if exists
    const miningStateKey = `miningState_${userId}`;
    const miningState = JSON.parse(localStorage.getItem(miningStateKey));
    if (miningState) {
        miningState.userPoints = newPoints;
        miningState.points = newPoints;
        miningState.totalPointsEarned = (miningState.totalPointsEarned || 0) + (action === 'add' ? amount : 0);
        miningState.totalEarned = (miningState.totalEarned || 0) + (action === 'add' ? amount : 0);
        localStorage.setItem(miningStateKey, JSON.stringify(miningState));
    }
    
    // Update in-memory data
    user.points = newPoints;
    user.userPoints = newPoints;
    if (action === 'add') {
        user.totalEarned += amount;
        user.totalPointsEarned += amount;
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
                    
                    <div><strong>Referrals:</strong></div>
                    <div>${user.referralCount || 0}</div>
                    
                    <div><strong>Profile Source:</strong></div>
                    <div>${user.profileSource || 'Unknown'}</div>
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
            
            ${user.referredUsers && user.referredUsers.length > 0 ? `
            <div style="margin-bottom: 20px;">
                <h4 style="color: #FFA726; margin-bottom: 15px;">Referrals (${user.referredUsers.length})</h4>
                <div style="max-height: 200px; overflow-y: auto; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 10px;">
                    ${user.referredUsers.map((ref, index) => `
                        <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <span>${index + 1}. ${ref.telegramUsername || ref}</span>
                            <span style="color: #4CAF50;">+50 pts</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin-top: 20px;">
                <button class="btn btn-primary" onclick="editUser('${user.id}')">Edit Points</button>
                <button class="btn btn-warning" onclick="closeModal('userDetailsModal')">Close</button>
            </div>
        `;
        
        document.getElementById('userDetailsModal').classList.add('active');
    }
}

// ✅ FIXED: Delete user function - COMPLETELY REMOVES USER (ENHANCED)
function deleteUser(userId) {
    if (confirm('Are you sure you want to PERMANENTLY DELETE this user? This action cannot be undone!')) {
        console.log('🗑️ PERMANENTLY DELETING user:', userId);
        
        // Find user data first
        const user = allUsers.find(u => u.id === userId);
        const telegramUsername = user ? user.telegramUsername : '';
        
        // Remove from localStorage - ALL POSSIBLE KEYS
        const keysToRemove = [
            `userData_${userId}`,
            `miningState_${userId}`, 
            `miningState${userId}`,
            `userProfile_${userId}`,
            'telegramUsername',
            'userId',
            'userPoints',
            'miningLevel',
            'totalTasksCompleted',
            'totalPointsEarned',
            'todayEarnings',
            'miningSeconds',
            'totalMiningHours'
        ];
        
        let removedCount = 0;
        keysToRemove.forEach(key => {
            if (localStorage.getItem(key)) {
                localStorage.removeItem(key);
                removedCount++;
                console.log('✅ Removed:', key);
            }
        });
        
        // Also remove from activities and notifications
        try {
            // Remove from user activities
            const userActivities = getFromStorage('userActivities', []);
            const filteredActivities = userActivities.filter(activity => activity.id !== userId);
            saveToStorage('userActivities', filteredActivities);
            
            // Remove from admin notifications
            const adminNotifications = getFromStorage('adminNotifications', []);
            const filteredNotifications = adminNotifications.filter(notif => notif.userId !== userId);
            saveToStorage('adminNotifications', filteredNotifications);
        } catch (error) {
            console.error('Error cleaning user activities:', error);
        }
        
        // Remove from in-memory array
        allUsers = allUsers.filter(u => u.id !== userId);
        
        // Update UI
        updateUsersTable();
        updateUserSelect();
        updateAdminStats();
        
        console.log(`✅ User COMPLETELY DELETED: ${userId} (${telegramUsername}) - ${removedCount} keys removed`);
        alert(`✅ User ${telegramUsername} PERMANENTLY DELETED!`);
        
        // Force reload to ensure clean state
        setTimeout(() => {
            loadAllUsers();
        }, 1000);
    }
}

// 🆕 ENHANCED: Delete inactive users with admin permission
function deleteInactiveUsers() {
    const inactiveUsers = allUsers.filter(user => user.miningStatus === 'Inactive');
    
    if (inactiveUsers.length === 0) {
        alert('ℹ️ No inactive users found!');
        return;
    }
    
    if (confirm(`Are you sure you want to PERMANENTLY DELETE ${inactiveUsers.length} inactive users? This action cannot be undone!`)) {
        let deletedCount = 0;
        
        inactiveUsers.forEach(user => {
            deleteUser(user.id);
            deletedCount++;
        });
        
        console.log(`🗑️ PERMANENTLY DELETED ${deletedCount} inactive users`);
        alert(`✅ ${deletedCount} inactive users PERMANENTLY DELETED!`);
    }
}

// 🆕 ENHANCED: Delete duplicate users with admin permission
function deleteDuplicateUsers() {
    const duplicates = findDuplicateUsers();
    
    if (duplicates.length === 0) {
        alert('ℹ️ No duplicate users found!');
        return;
    }
    
    if (confirm(`Are you sure you want to PERMANENTLY DELETE ${duplicates.length} duplicate users? This action cannot be undone!`)) {
        let deletedCount = 0;
        
        duplicates.forEach(user => {
            deleteUser(user.id);
            deletedCount++;
        });
        
        console.log(`🗑️ PERMANENTLY DELETED ${deletedCount} duplicate users`);
        alert(`✅ ${deletedCount} duplicate users PERMANENTLY DELETED!`);
    }
}

// 🆕 NEW: Find duplicate users
function findDuplicateUsers() {
    const seen = new Set();
    const duplicates = [];
    
    allUsers.forEach(user => {
        if (seen.has(user.telegramUsername)) {
            duplicates.push(user);
        } else {
            seen.add(user.telegramUsername);
        }
    });
    
    return duplicates;
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
    
    // Find and activate the clicked nav link
    const navLinks = document.querySelectorAll('.admin-nav a');
    for (let link of navLinks) {
        if (link.getAttribute('href') === '#' + sectionId) {
            link.classList.add('active');
            break;
        }
    }
    
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

// 🆕 ENHANCED AUTO-REFRESH
function setupAutoRefresh() {
    const autoRefreshCheckbox = document.getElementById('autoRefresh');
    
    // Auto-refresh every 10 seconds instead of 30
    autoRefreshInterval = setInterval(() => {
        loadAllUsers();
        updateAdminStats();
        console.log('🔄 Auto-refresh completed');
    }, 10000);
    
    autoRefreshCheckbox.addEventListener('change', function() {
        if (this.checked) {
            autoRefreshInterval = setInterval(() => {
                loadAllUsers();
                updateAdminStats();
            }, 10000);
        } else {
            clearInterval(autoRefreshInterval);
        }
    });
}

// Refresh data manually
function refreshData() {
    loadAllUsers();
    updateAdminStats();
    alert('✅ Data refreshed!');
}

// 🆕 ENHANCED FUNCTIONS FOR TELEGRAM PROFILE DETECTION

// Force reload all data
function forceReloadAllData() {
    console.log('🔄 Force reloading ALL data with Telegram profile detection...');
    
    // Clear cache
    localStorage.removeItem('adminUsersCache');
    allUsers = [];
    
    // Reload all users with enhanced Telegram detection
    loadAllUsers();
    updateAdminStats();
    updateUsersTable();
    updateUserSelect();
    
    console.log('✅ Force reload complete! Total users:', allUsers.length);
    alert('✅ All data forcefully reloaded! Found ' + allUsers.length + ' users.');
}

// 🆕 FIX: Debug Telegram username issues
function debugTelegramUsernames() {
    console.log('🐛 DEBUG: Checking Telegram username issues...');
    
    // Check all Telegram-related storage
    const telegramKeys = ['telegramUsername', 'userId', 'userPoints', 'miningLevel'];
    
    telegramKeys.forEach(key => {
        const value = localStorage.getItem(key);
        console.log(`📱 ${key}:`, value);
    });
    
    // Check user data structures
    const userDataKeys = Object.keys(localStorage).filter(key => key.startsWith('userData_'));
    console.log('📊 UserData keys:', userDataKeys);
    
    userDataKeys.forEach(key => {
        try {
            const data = JSON.parse(localStorage.getItem(key));
            console.log(`🔍 ${key}:`, {
                telegram: data.telegramUsername,
                points: data.userPoints,
                level: data.miningLevel,
                id: data.id,
                referrals: data.referralData ? data.referralData.referredUsers : []
            });
        } catch (e) {
            console.log(`❌ ${key}: Parse error`);
        }
    });
    
    // Show current allUsers array
    console.log('👥 Current allUsers:', allUsers);
}

// Debug user data
function debugUserData() {
    console.log('🐛 DEBUG: Checking ALL user data with Telegram profiles...');
    
    // Check all user-related keys
    const userKeys = Object.keys(localStorage).filter(key => 
        key.includes('user') || 
        key.includes('mining') || 
        key.includes('telegram') ||
        key.includes('profile') ||
        key.includes('activity') ||
        key.includes('notification')
    );
    
    console.log('📋 User-related keys:', userKeys);
    
    userKeys.forEach(key => {
        try {
            const data = JSON.parse(localStorage.getItem(key));
            console.log(`🔍 ${key}:`, {
                telegram: data.telegramUsername || 'Not found',
                points: data.userPoints || data.points || 0,
                level: data.miningLevel || data.level || 1,
                source: data.profileSource || 'Unknown',
                referrals: data.referralData ? data.referralData.referredUsers.length : 0
            });
        } catch (e) {
            console.log(`❌ ${key}:`, localStorage.getItem(key));
        }
    });
    
    // Count users in allUsers array
    console.log(`👥 allUsers array has: ${allUsers.length} users`);
    allUsers.forEach(user => {
        console.log(`   - ${user.telegramUsername} (${user.id}) - ${user.points} points - Referrals: ${user.referralCount || 0} - Source: ${user.profileSource}`);
    });
    
    // Check activities and notifications
    const activities = getFromStorage('userActivities', []);
    const notifications = getFromStorage('adminNotifications', []);
    console.log('📊 User activities:', activities.length);
    console.log('📢 Admin notifications:', notifications.length);
}

// Migrate all user data to new Telegram profile format
function migrateAllUserData() {
    console.log('🚚 Migrating ALL user data to Telegram profile format...');
    
    const allKeys = Object.keys(localStorage);
    let migratedCount = 0;
    let newUsersFound = 0;
    
    allKeys.forEach(key => {
        try {
            // Check for various user data patterns
            if (key.includes('miningState') || 
                key.includes('userProfile') || 
                key.includes('telegramUsername') ||
                key.startsWith('user_') ||
                (key === 'telegramUsername' && localStorage.getItem(key) !== 'Not set')) {
                
                const data = JSON.parse(localStorage.getItem(key));
                
                // Extract user ID
                let userId = '';
                if (key.startsWith('miningState_')) {
                    userId = key.replace('miningState_', '');
                } else if (key.startsWith('userProfile_')) {
                    userId = key.replace('userProfile_', '');
                } else if (key === 'telegramUsername') {
                    userId = localStorage.getItem('userId') || 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                } else {
                    userId = key;
                }
                
                // Skip if already exists in new format
                if (localStorage.getItem(`userData_${userId}`)) {
                    return;
                }
                
                // Create new user data structure with Telegram profile
                const userData = {
                    userPoints: data.userPoints || data.points || parseInt(localStorage.getItem('userPoints')) || 0,
                    points: data.userPoints || data.points || parseInt(localStorage.getItem('userPoints')) || 0,
                    miningLevel: data.miningLevel || data.level || parseInt(localStorage.getItem('miningLevel')) || 1,
                    level: data.miningLevel || data.level || parseInt(localStorage.getItem('miningLevel')) || 1,
                    isMining: data.isMining || false,
                    totalTasksCompleted: data.totalTasksCompleted || parseInt(localStorage.getItem('totalTasksCompleted')) || 0,
                    tasksCompleted: data.totalTasksCompleted || parseInt(localStorage.getItem('totalTasksCompleted')) || 0,
                    totalPointsEarned: data.totalPointsEarned || data.totalEarned || parseInt(localStorage.getItem('totalPointsEarned')) || 0,
                    totalEarned: data.totalPointsEarned || data.totalEarned || parseInt(localStorage.getItem('totalPointsEarned')) || 0,
                    todayEarnings: data.todayEarnings || parseInt(localStorage.getItem('todayEarnings')) || 0,
                    telegramUsername: data.telegramUsername || localStorage.getItem('telegramUsername') || 'Not set',
                    miningSeconds: data.miningSeconds || parseInt(localStorage.getItem('miningSeconds')) || 0,
                    totalMiningHours: data.totalMiningHours || parseInt(localStorage.getItem('totalMiningHours')) || 0,
                    speedLevel: data.speedLevel || 1,
                    multiplierLevel: data.multiplierLevel || 1,
                    loginStreak: data.loginStreak || 1,
                    joinDate: data.joinDate || new Date().toISOString(),
                    lastActive: data.lastActive || new Date().toISOString(),
                    referralData: data.referralData || { referredUsers: [], totalEarned: 0 },
                    profileSource: 'migrated_telegram'
                };
                
                // Save with new format
                localStorage.setItem(`userData_${userId}`, JSON.stringify(userData));
                migratedCount++;
                
                // Check if this is a new user
                if (!allUsers.find(u => u.id === userId)) {
                    newUsersFound++;
                    console.log('🆕 New user found during migration:', userId, userData.telegramUsername);
                }
            }
        } catch (error) {
            console.error('Migration error for key:', key, error);
        }
    });
    
    console.log(`✅ ${migratedCount} users migrated, ${newUsersFound} new users found!`);
    
    // Reload all data
    loadAllUsers();
    updateAdminStats();
    
    alert(`✅ ${migratedCount} users migrated!\n🆕 ${newUsersFound} new users found!`);
    return newUsersFound;
}

// Add debug buttons to admin panel header
function addDebugButtons() {
    const header = document.querySelector('.admin-header');
    if (header && !document.getElementById('debugButtons')) {
        const debugDiv = document.createElement('div');
        debugDiv.id = 'debugButtons';
        debugDiv.style.marginTop = '10px';
        debugDiv.style.display = 'flex';
        debugDiv.style.gap = '10px';
        debugDiv.style.flexWrap = 'wrap';
        debugDiv.innerHTML = `
            <button class="btn btn-sm btn-warning" onclick="forceReloadAllData()" title="Force reload all data">🔄 Force Reload</button>
            <button class="btn btn-sm btn-info" onclick="debugUserData()" title="Debug user data">🐛 Debug</button>
            <button class="btn btn-sm btn-success" onclick="migrateAllUserData()" title="Migrate all user data">🚚 Migrate Data</button>
            <button class="btn btn-sm btn-primary" onclick="checkDataConsistency()" title="Check data consistency">🔍 Check Data</button>
            <button class="btn btn-sm btn-secondary" onclick="checkTelegramActivities()" title="Check Telegram activities">📱 Telegram Data</button>
            <button class="btn btn-sm btn-danger" onclick="cleanupGarbageKeys()" title="Cleanup garbage keys">🧹 Cleanup</button>
            <button class="btn btn-sm btn-light" onclick="debugTelegramUsernames()" title="Debug Telegram usernames">📝 Debug Telegram</button>
            <button class="btn btn-sm btn-dark" onclick="validateAndCleanTelegramUsernames()" title="Fix empty Telegram usernames">🔧 Fix Telegram</button>
            <button class="btn btn-sm btn-danger" onclick="deleteInactiveUsers()" title="Delete all inactive users">🗑️ Delete Inactive</button>
            <button class="btn btn-sm btn-warning" onclick="deleteDuplicateUsers()" title="Delete duplicate users">🔄 Delete Duplicates</button>
        `;
        header.appendChild(debugDiv);
    }
}

// 🆕 CHECK TELEGRAM ACTIVITIES
function checkTelegramActivities() {
    console.log('📱 Checking Telegram profile activities...');
    
    const activities = getFromStorage('userActivities', []);
    const notifications = getFromStorage('adminNotifications', []);
    
    console.log('📊 User Activities:', activities);
    console.log('📢 Admin Notifications:', notifications);
    
    let html = `
        <div style="margin-bottom: 20px;">
            <h4>📱 Telegram Profile Activities</h4>
            <p><strong>Total Activities:</strong> ${activities.length}</p>
            <p><strong>Total Notifications:</strong> ${notifications.length}</p>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
                <h5>Recent Activities</h5>
                ${activities.slice(0, 5).map(activity => `
                    <div style="border: 1px solid #444; padding: 10px; margin: 5px 0; border-radius: 5px;">
                        <strong>${activity.telegramUsername}</strong><br>
                        Points: ${activity.points} | Level: ${activity.level}<br>
                        Last: ${new Date(activity.lastActive).toLocaleString()}
                    </div>
                `).join('')}
            </div>
            
            <div>
                <h5>Recent Notifications</h5>
                ${notifications.slice(0, 5).map(notif => `
                    <div style="border: 1px solid #444; padding: 10px; margin: 5px 0; border-radius: 5px;">
                        <strong>${notif.event}</strong><br>
                        User: ${notif.telegramUsername}<br>
                        Time: ${new Date(notif.timestamp).toLocaleString()}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // Show in modal
    const userDetailsContent = document.getElementById('userDetailsContent');
    userDetailsContent.innerHTML = html;
    document.getElementById('userDetailsModal').classList.add('active');
}

// Check data consistency
function checkDataConsistency() {
    console.log('🔍 Checking data consistency with Telegram profiles...');
    
    const userDataKeys = Object.keys(localStorage).filter(key => key.startsWith('userData_'));
    const miningStateKeys = Object.keys(localStorage).filter(key => key.startsWith('miningState_'));
    const activities = getFromStorage('userActivities', []);
    const notifications = getFromStorage('adminNotifications', []);
    
    console.log(`📊 userData keys: ${userDataKeys.length}, miningState keys: ${miningStateKeys.length}`);
    console.log(`📱 Activities: ${activities.length}, Notifications: ${notifications.length}`);
    
    let inconsistentUsers = 0;
    
    // Check each userData entry
    userDataKeys.forEach(key => {
        try {
            const userData = JSON.parse(localStorage.getItem(key));
            const userId = key.replace('userData_', '');
            
            // Check if miningState exists for this user
            const miningStateKey = `miningState_${userId}`;
            const miningState = localStorage.getItem(miningStateKey);
            
            if (!miningState) {
                console.log(`⚠️ No miningState for user: ${userId} (${userData.telegramUsername})`);
                inconsistentUsers++;
            }
        } catch (error) {
            console.error('Error checking consistency for key:', key, error);
        }
    });
    
    if (inconsistentUsers === 0) {
        console.log('✅ All user data is consistent!');
        alert('✅ All user data is consistent with Telegram profiles!');
    } else {
        console.log(`⚠️ Found ${inconsistentUsers} users with inconsistent data`);
        alert(`⚠️ Found ${inconsistentUsers} users with inconsistent data. Check console for details.`);
    }
}

// 🆕 GARBAGE KEYS CLEANUP FUNCTION
function cleanupGarbageKeys() {
    console.log('🧹 Cleaning garbage keys...');
    const allKeys = Object.keys(localStorage);
    let removedCount = 0;
    
    allKeys.forEach(key => {
        // Remove long and invalid keys
        if (key.length > 50 || 
            key.includes('userData_userData') || 
            key.includes('default_default') ||
            key.includes('TAPEARN_')) {
            localStorage.removeItem(key);
            removedCount++;
            console.log('🗑️ Removed:', key);
        }
    });
    
    console.log(`✅ ${removedCount} garbage keys removed`);
    alert(`✅ ${removedCount} garbage keys removed!`);
    
    // Reload data
    forceReloadAllData();
    return removedCount;
}

// Storage helper function
function getFromStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Storage read error:', error);
        return defaultValue;
    }
}

// Save to storage helper function
function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('Storage write error:', error);
        return false;
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initAdminPanel();
    
    // Load initial data
    loadGlobalSettings();
    updateRewardsTable();
    
    // Add debug buttons
    setTimeout(addDebugButtons, 1000);
    
    // Auto debug after 3 seconds
    setTimeout(debugUserData, 3000);
    
    // Show welcome message with user count
    setTimeout(() => {
        const realUsersCount = allUsers.filter(user => !user.id.startsWith('demo_')).length;
        if (realUsersCount > 0) {
            console.log('🎉 REAL USERS WITH TELEGRAM PROFILES LOADED SUCCESSFULLY!');
        } else {
            console.log('📊 Currently showing demo users (no real users found)');
        }
    }, 5000);
});
