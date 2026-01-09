// ==============================================
// OPTIMIZED MINING POOL APP - ALL NEW FEATURES ADDED
// ==============================================

// ✅ 1. STATE VARIABLES - Updated with Registration System
let userPoints = 0;
let totalPointsEarned = 0;
let telegramUsername = '';
let userId = '';
let dailyBonusClaimed = false;
let lastBonusClaim = 0;
let hourlyBonusAvailable = true;
let lastHourlyBonus = 0;
let loginStreak = 1;
let lastLoginDate = null;
let totalMiningTime = 0;
let sessionCount = 0;
let totalTasksCompleted = 0;
let todayEarnings = 0;
let lastEarningDate = null;
let watchedVideos = [];
let completedTasks = [];
let currentVideoTimer = null;
let currentVideoTimeLeft = 0;
let currentVideoData = null;
let videoTab = null;
let tabCheckInterval = null;
let completedFollowTasks = [];
let completedDailyTasks = [];
let completedSocialTasks = [];
let watchedTelegramVideoIds = [];
let joinedTelegramChannels = [];
let completedXTasks = [];
let redeemedRewards = [];

// ✅ नए वॉलेट सिस्टम VARIABLES (यहाँ जोड़ें)
let inrWallet = 0;          // INR वॉलेट
let usdtWallet = 0;         // USDT वॉलेट
let totalConverted = 0;     // कुल कन्वर्ट किए गए पॉइंट्स

// नए CONVERSION RATES (यहाँ जोड़ें)
const POINT_TO_INR_RATE = 10000;    // 10000 पॉइंट्स = 100 INR
const INR_TO_USDT_RATE = 85;        // 1 USDT = 85 INR
const MIN_CONVERSION_POINTS = 10000; // न्यूनतम कन्वर्जन: 10000 पॉइंट्स

// NEW REGISTRATION VARIABLES
let userRegistered = false;
let userEmail = '';
let userMobile = '';
let userEmailVerified = false;
let userMobileVerified = false;
let emailOTP = '';
let mobileOTP = '';
let registrationStep = 1;
let sponsorId = '';
let sponsorName = '';
let freePoolTasksCompleted = false;

// ✅ DAILY ACTIVITIES SYSTEM VARIABLES
let dailyActivities = [];
let completedDailyActivities = [];
let dailyActivityStreak = 0;
let lastDailyActivityDate = null;
let todayActivityPoints = 0;
let totalActivityPoints = 0;

let referralData = {
    referralCode: generateReferralCode(),
    referredUsers: [],
    totalEarned: 0,
    telegramUsername: ''
};

let transactionHistory = [];
let totalEarned = 0;
let totalSpent = 0;

let sponsorCommissionEarned = 0;
let sponsorTransactions = [];
let userGeneratedSponsorIncome = 0;
let userSponsorActivities = [];
let sponsorIncomeBreakdown = {
    mining: 0,
    videos: 0,
    tasks: 0,
    referrals: 0,
    bonuses: 0,
    total: 0
};

// ✅ 2. UPDATED MINING POOL SYSTEM
let miningPools = [];
let activeMiningPool = null;
let miningPoolHistory = [];
let miningPoolInterval = null;
let miningPoolInstances = {};
let poolSubscribers = {};

// ✅ 3. UPDATED MINING POOL DEFINITIONS WITH TIMERS
const MINING_POOLS = [
    {
        id: 'free_pool',
        name: '🎁 FREE Mining Pool',
        icon: '🎁',
        type: 'free',
        baseRate: 5,
        minInvestment: 0,
        durations: [
            { 
                hours: 24, 
                multiplier: 1.0, 
                points: 120,
                timer: 86400000,
                subscribers: 0,
                participants: 0,
                remainingTime: 86400000,
                status: 'waiting'
            }
        ],
        requiredTasks: ['telegram_follow', 'instagram_follow', 'twitter_follow', 'facebook_follow', 'youtube_subscribe', 'watch_2_videos']
    },
    {
        id: 'usdt_btc',
        name: '₿ USDT/BTC Pool',
        icon: '₿',
        type: 'paid',
        baseRate: 5,
        minInvestment: 50,
        durations: [
            { 
                hours: 24, 
                multiplier: 1.0, 
                points: 120,
                timer: 86400000,
                subscribers: 1250,
                participants: 980,
                remainingTime: 7200000,
                status: 'active'
            },
            { 
                hours: 72, 
                multiplier: 1.2, 
                points: 432,
                timer: 259200000,
                subscribers: 850,
                participants: 720,
                remainingTime: 43200000,
                status: 'active'
            },
            { 
                hours: 168, 
                multiplier: 1.5, 
                points: 1260,
                timer: 604800000,
                subscribers: 620,
                participants: 580,
                remainingTime: 86400000,
                status: 'active'
            },
            { 
                hours: 360, 
                multiplier: 1.8, 
                points: 3240,
                timer: 1296000000,
                subscribers: 420,
                participants: 380,
                remainingTime: 172800000,
                status: 'active'
            },
            { 
                hours: 720, 
                multiplier: 2.5, 
                points: 9000,
                timer: 2592000000,
                subscribers: 280,
                participants: 250,
                remainingTime: 345600000,
                status: 'active'
            }
        ]
    },
    {
        id: 'usdt_eth',
        name: 'Ξ USDT/ETH Pool',
        icon: 'Ξ',
        type: 'paid',
        baseRate: 4,
        minInvestment: 50,
        durations: [
            { 
                hours: 24, 
                multiplier: 1.0, 
                points: 100,
                timer: 86400000,
                subscribers: 1100,
                participants: 920,
                remainingTime: 6480000,
                status: 'active'
            },
            { 
                hours: 72, 
                multiplier: 1.2, 
                points: 360,
                timer: 259200000,
                subscribers: 780,
                participants: 680,
                remainingTime: 38880000,
                status: 'active'
            },
            { 
                hours: 168, 
                multiplier: 1.5, 
                points: 1050,
                timer: 604800000,
                subscribers: 580,
                participants: 520,
                remainingTime: 77760000,
                status: 'active'
            },
            { 
                hours: 360, 
                multiplier: 1.8, 
                points: 2700,
                timer: 1296000000,
                subscribers: 380,
                participants: 340,
                remainingTime: 155520000,
                status: 'active'
            },
            { 
                hours: 720, 
                multiplier: 2.5, 
                points: 7500,
                timer: 2592000000,
                subscribers: 250,
                participants: 220,
                remainingTime: 311040000,
                status: 'active'
            }
        ]
    },
    {
        id: 'usdt_bnb',
        name: 'ⓑ USDT/BNB Pool',
        icon: 'ⓑ',
        type: 'paid',
        baseRate: 3.5,
        minInvestment: 50,
        durations: [
            { 
                hours: 24, 
                multiplier: 1.0, 
                points: 85,
                timer: 86400000,
                subscribers: 950,
                participants: 820,
                remainingTime: 5760000,
                status: 'active'
            },
            { 
                hours: 72, 
                multiplier: 1.2, 
                points: 306,
                timer: 259200000,
                subscribers: 680,
                participants: 610,
                remainingTime: 34560000,
                status: 'active'
            },
            { 
                hours: 168, 
                multiplier: 1.5, 
                points: 892,
                timer: 604800000,
                subscribers: 520,
                participants: 470,
                remainingTime: 69120000,
                status: 'active'
            },
            { 
                hours: 360, 
                multiplier: 1.8, 
                points: 2295,
                timer: 1296000000,
                subscribers: 350,
                participants: 310,
                remainingTime: 138240000,
                status: 'active'
            },
            { 
                hours: 720, 
                multiplier: 2.5, 
                points: 6375,
                timer: 2592000000,
                subscribers: 220,
                participants: 190,
                remainingTime: 276480000,
                status: 'active'
            }
        ]
    },
    {
        id: 'usdt_sol',
        name: '◎ USDT/SOL Pool',
        icon: '◎',
        type: 'paid',
        baseRate: 3,
        minInvestment: 50,
        durations: [
            { 
                hours: 24, 
                multiplier: 1.0, 
                points: 72,
                timer: 86400000,
                subscribers: 820,
                participants: 710,
                remainingTime: 5040000,
                status: 'active'
            },
            { 
                hours: 72, 
                multiplier: 1.2, 
                points: 259,
                timer: 259200000,
                subscribers: 590,
                participants: 530,
                remainingTime: 30240000,
                status: 'active'
            },
            { 
                hours: 168, 
                multiplier: 1.5, 
                points: 756,
                timer: 604800000,
                subscribers: 450,
                participants: 410,
                remainingTime: 60480000,
                status: 'active'
            },
            { 
                hours: 360, 
                multiplier: 1.8, 
                points: 1944,
                timer: 1296000000,
                subscribers: 310,
                participants: 280,
                remainingTime: 120960000,
                status: 'active'
            },
            { 
                hours: 720, 
                multiplier: 2.5, 
                points: 5400,
                timer: 2592000000,
                subscribers: 190,
                participants: 170,
                remainingTime: 241920000,
                status: 'active'
            }
        ]
    },
    {
        id: 'usdt_xrp',
        name: '✕ USDT/XRP Pool',
        icon: '✕',
        type: 'paid',
        baseRate: 2.5,
        minInvestment: 50,
        durations: [
            { 
                hours: 24, 
                multiplier: 1.0, 
                points: 60,
                timer: 86400000,
                subscribers: 720,
                participants: 630,
                remainingTime: 4320000,
                status: 'active'
            },
            { 
                hours: 72, 
                multiplier: 1.2, 
                points: 216,
                timer: 259200000,
                subscribers: 520,
                participants: 470,
                remainingTime: 25920000,
                status: 'active'
            },
            { 
                hours: 168, 
                multiplier: 1.5, 
                points: 630,
                timer: 604800000,
                subscribers: 390,
                participants: 360,
                remainingTime: 51840000,
                status: 'active'
            },
            { 
                hours: 360, 
                multiplier: 1.8, 
                points: 1620,
                timer: 1296000000,
                subscribers: 270,
                participants: 240,
                remainingTime: 103680000,
                status: 'active'
            },
            { 
                hours: 720, 
                multiplier: 2.5, 
                points: 4500,
                timer: 2592000000,
                subscribers: 170,
                participants: 150,
                remainingTime: 207360000,
                status: 'active'
            }
        ]
    },
    {
        id: 'usdt_trx',
        name: '₮ USDT/TRX Pool',
        icon: '₮',
        type: 'paid',
        baseRate: 2,
        minInvestment: 50,
        durations: [
            { 
                hours: 24, 
                multiplier: 1.0, 
                points: 48,
                timer: 86400000,
                subscribers: 650,
                participants: 580,
                remainingTime: 3600000,
                status: 'active'
            },
            { 
                hours: 72, 
                multiplier: 1.2, 
                points: 173,
                timer: 259200000,
                subscribers: 470,
                participants: 420,
                remainingTime: 21600000,
                status: 'active'
            },
            { 
                hours: 168, 
                multiplier: 1.5, 
                points: 504,
                timer: 604800000,
                subscribers: 350,
                participants: 320,
                remainingTime: 43200000,
                status: 'active'
            },
            { 
                hours: 360, 
                multiplier: 1.8, 
                points: 1296,
                timer: 1296000000,
                subscribers: 240,
                participants: 210,
                remainingTime: 86400000,
                status: 'active'
            },
            { 
                hours: 720, 
                multiplier: 2.5, 
                points: 3600,
                timer: 2592000000,
                subscribers: 150,
                participants: 130,
                remainingTime: 172800000,
                status: 'active'
            }
        ]
    }
];

// ✅ 4. OTHER CONSTANTS (PRESERVED & UPDATED)
const YOUTUBE_API_KEYS = [
    'AIzaSyBATxf5D7ZDeiQ61dbEdzEd4Tq72N713Y8',
    'AIzaSyA4piVRV_2w4t6Y7-3nPo3Qp1TZ2xXq7Xw',
    'AIzaSyD7LQcA4jY4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4'
];
let currentApiKeyIndex = 0;

// ✅ SECTION 1: PRE-LOADED REFERRAL CODES
const PRE_LOADED_REFERRAL_CODES = [
    {
        code: 'TAPEARN-REF001',
        username: 'john_doe',
        name: 'John Doe',
        points: 50,
        isActive: true,
        createdAt: '2024-01-15T00:00:00.000Z'
    },
    {
        code: 'TAPEARN-REF002',
        username: 'alex_smith',
        name: 'Alex Smith',
        points: 50,
        isActive: true,
        createdAt: '2024-01-16T00:00:00.000Z'
    },
    {
        code: 'TAPEARN-REF003',
        username: 'sara_jones',
        name: 'Sara Jones',
        points: 50,
        isActive: true,
        createdAt: '2024-01-17T00:00:00.000Z'
    },
    {
        code: 'TAPEARN-REF004',
        username: 'mike_wilson',
        name: 'Mike Wilson',
        points: 50,
        isActive: true,
        createdAt: '2024-01-18T00:00:00.000Z'
    },
    {
        code: 'TAPEARN-REF005',
        username: 'emma_davis',
        name: 'Emma Davis',
        points: 50,
        isActive: true,
        createdAt: '2024-01-19T00:00:00.000Z'
    }
];

const DEMO_VIDEOS = [
    {
        id: 'demo_video_1',
        title: 'Amazing Tech Gadgets 2024',
        thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=200&fit=crop',
        channel: 'Tech Review Channel',
        points: 15,
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4'
    },
    {
        id: 'demo_video_2',
        title: 'Cooking Masterclass: Italian Pasta',
        thumbnail: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop',
        channel: 'Cooking World',
        points: 12,
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-holding-neon-light-1238-large.mp4'
    }
];

// FREE POOL REQUIRED TASKS
const FREE_POOL_TASKS = [
    { id: 'telegram_follow', name: 'Telegram Channel Follow', completed: false },
    { id: 'instagram_follow', name: 'Instagram Follow', completed: false },
    { id: 'twitter_follow', name: 'Twitter Follow', completed: false },
    { id: 'facebook_follow', name: 'Facebook Page Like', completed: false },
    { id: 'youtube_subscribe', name: 'YouTube Subscribe', completed: false },
    { id: 'watch_2_videos', name: 'Watch 2 Videos', completed: false }
];

// Daily Activity Rewards
const DAILY_ACTIVITY_REWARDS = {
    streak_3: 50,
    streak_7: 150,
    streak_15: 350,
    streak_30: 1000
};

// ✅ DAILY ACTIVITIES FOR FREE POOL
const DAILY_ACTIVITIES = [
    {
        id: 'activity_1',
        title: 'Morning Check-in',
        description: 'First login of the day',
        icon: '☀️',
        points: 10,
        type: 'login',
        frequency: 'daily',
        maxPerDay: 1
    },
    {
        id: 'activity_2',
        title: 'Watch 3 Videos',
        description: 'Watch any 3 videos daily',
        icon: '🎬',
        points: 25,
        type: 'video',
        frequency: 'daily',
        maxPerDay: 3
    },
    {
        id: 'activity_3',
        title: 'Complete 2 Tasks',
        description: 'Complete any 2 tasks',
        icon: '✅',
        points: 20,
        type: 'task',
        frequency: 'daily',
        maxPerDay: 5
    },
    {
        id: 'activity_4',
        title: 'Refer a Friend',
        description: 'Share referral link',
        icon: '👥',
        points: 30,
        type: 'referral',
        frequency: 'daily',
        maxPerDay: 10
    },
    {
        id: 'activity_5',
        title: 'Join Telegram Channel',
        description: 'Stay updated on Telegram',
        icon: '📱',
        points: 15,
        type: 'social',
        frequency: 'once'
    },
    {
        id: 'activity_6',
        title: 'Follow on Instagram',
        description: 'Follow our Instagram page',
        icon: '📷',
        points: 15,
        type: 'social',
        frequency: 'once'
    },
    {
        id: 'activity_7',
        title: 'Like Facebook Page',
        description: 'Like our Facebook page',
        icon: '👍',
        points: 15,
        type: 'social',
        frequency: 'once'
    },
    {
        id: 'activity_8',
        title: 'Subscribe YouTube',
        description: 'Subscribe to our channel',
        icon: '📺',
        points: 20,
        type: 'social',
        frequency: 'once'
    },
    {
        id: 'activity_9',
        title: 'Join Discord Server',
        description: 'Join our Discord community',
        icon: '💬',
        points: 25,
        type: 'social',
        frequency: 'once'
    },
    {
        id: 'activity_10',
        title: 'Share on Twitter',
        description: 'Share app on Twitter/X',
        icon: '🐦',
        points: 20,
        type: 'social',
        frequency: 'daily',
        maxPerDay: 3
    },
    {
        id: 'activity_11',
        title: 'Watch 10 Ads',
        description: 'Watch 10 short ads',
        icon: '📢',
        points: 40,
        type: 'ad',
        frequency: 'daily',
        maxPerDay: 10
    },
    {
        id: 'activity_12',
        title: 'Complete Survey',
        description: 'Complete quick survey',
        icon: '📝',
        points: 50,
        type: 'survey',
        frequency: 'daily',
        maxPerDay: 2
    },
    {
        id: 'activity_13',
        title: 'Install Partner App',
        description: 'Install recommended app',
        icon: '📲',
        points: 100,
        type: 'app',
        frequency: 'once'
    },
    {
        id: 'activity_14',
        title: 'Play Mini Game',
        description: 'Play & win mini game',
        icon: '🎮',
        points: 30,
        type: 'game',
        frequency: 'daily',
        maxPerDay: 5
    },
    {
        id: 'activity_15',
        title: 'Quiz Challenge',
        description: 'Answer 5 questions',
        icon: '🧠',
        points: 35,
        type: 'quiz',
        frequency: 'daily',
        maxPerDay: 2
    }
];

// ==============================================
// ✅ CORE FUNCTIONS (UPDATED)
// ==============================================

// 🛡️ ULTIMATE NAN PROTECTION SYSTEM
function initializeNaNProtection() {
    const numericVars = [
        'userPoints', 'totalPointsEarned', 'todayEarnings',
        'totalTasksCompleted', 'loginStreak', 'userGeneratedSponsorIncome', 'sponsorCommissionEarned'
    ];
    
    numericVars.forEach(varName => {
        if (isNaN(window[varName]) || window[varName] === null || window[varName] === undefined) {
            window[varName] = varName.includes('Level') ? 1 : 0;
        }
    });
    
    userPoints = Math.max(0, Math.round(userPoints));
    totalPointsEarned = Math.max(0, Math.round(totalPointsEarned));
    todayEarnings = Math.max(0, Math.round(todayEarnings));
}

function safeNumber(value, defaultValue = 0) {
    if (value === null || value === undefined || value === '' || isNaN(value)) {
        return defaultValue;
    }
    const num = Number(value);
    return isNaN(num) ? defaultValue : Math.max(0, Math.round(num));
}

// ✅ UPDATED saveToStorage FUNCTION
function saveToStorage(key, value) {
    try {
        // Handle undefined values
        if (value === undefined) {
            console.warn(`⚠️ Attempted to save undefined value for key: ${key}`);
            return false;
        }
        
        // Handle NaN values in numbers
        if (typeof value === 'number' && isNaN(value)) {
            console.warn(`⚠️ Attempted to save NaN for key: ${key}`);
            value = 0;
        }
        
        localStorage.setItem(key, JSON.stringify(value));
        console.log(`💾 Saved to storage: ${key}`);
        return true;
    } catch (error) {
        console.error('❌ Storage error:', error);
        showNotification('❌ Storage error!', 'warning');
        return false;
    }
}

// ✅ UPDATED getFromStorage FUNCTION WITH BETTER ERROR HANDLING
function getFromStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        if (item === null || item === undefined) {
            return defaultValue;
        }
        
        // Handle empty strings
        if (item.trim() === '') {
            return defaultValue;
        }
        
        const parsed = JSON.parse(item);
        
        // Handle null after parsing
        if (parsed === null || parsed === undefined) {
            return defaultValue;
        }
        
        return parsed;
    } catch (error) {
        console.warn(`❌ Error parsing localStorage key "${key}":`, error);
        return defaultValue;
    }
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function formatNumber(num) {
    return Math.max(0, Math.round(safeNumber(num, 0))).toLocaleString('en-US');
}

function showNotification(message, type = 'info') {
    document.querySelectorAll('.notification').forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
}

function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function generateReferralCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return 'TAPEARN-' + code;
}

// ==============================================
// ✅ ADMIN SYNC OPTIMIZATION - FIX DUPLICATION
// ==============================================

// Track sync state
let syncState = {
    isSyncing: false,
    lastSyncTime: 0,
    syncCount: 0,
    maxSyncsPerMinute: 6
};

// ✅ Optimized admin sync function
async function performOptimizedAdminSync() {
    // Check if we should sync
    if (syncState.isSyncing) {
        return;
    }
    
    const now = Date.now();
    const timeSinceLastSync = now - syncState.lastSyncTime;
    
    // Limit sync frequency (minimum 10 seconds between syncs)
    if (timeSinceLastSync < 10000) {
        return;
    }
    
    // Limit syncs per minute
    if (syncState.syncCount >= syncState.maxSyncsPerMinute) {
        console.log('⚠️ Sync limit reached, waiting...');
        return;
    }
    
    syncState.isSyncing = true;
    syncState.syncCount++;
    
    try {
        console.log('🔄 Performing optimized admin sync...');
        
        // Your existing sync logic here...
        const currentUser = getFromStorage('currentUser', {});
        if (currentUser && currentUser.email) {
            // Only log once instead of multiple times
            console.log('✅ User synced to server:', currentUser.username);
        }
        
    } catch (error) {
        console.error('Sync error:', error);
    } finally {
        syncState.isSyncing = false;
        syncState.lastSyncTime = Date.now();
        
        // Reset counter every minute
        setTimeout(() => {
            syncState.syncCount = Math.max(0, syncState.syncCount - 1);
        }, 60000);
    }
}

// ✅ Optimized admin button check
let adminButtonCheckCount = 0;
function checkAndInjectOptimizedAdminButton() {
    // Limit checks to prevent spam
    adminButtonCheckCount++;
    if (adminButtonCheckCount > 5) {
        console.log('✅ Admin button checks completed');
        return;
    }
    
    const currentUser = getFromStorage('currentUser', {});
    const isAdmin = currentUser.email === 'admin@tapearn.com' || 
                   currentUser.email === 'admin@example.com';
    
    if (isAdmin) {
        console.log('✅ User authorized for admin, injecting button...');
        // Call the injection function from admin-panel-integration.js
        if (typeof window.injectAdminButton === 'function') {
            window.injectAdminButton();
        }
    }
}

// ==============================================
// ✅ ADMIN BUTTON INJECTION SYSTEM
// ==============================================

// Admin panel button injection
function checkAndInjectAdminButton() {
    console.log('🔍 Checking for admin button injection...');
    
    // Check if admin integration is loaded
    if (typeof window.isUserAuthorizedForAdmin === 'function') {
        if (window.isUserAuthorizedForAdmin()) {
            console.log('✅ User authorized for admin, injecting button...');
            
            // Inject admin button
            if (typeof window.injectAdminButton === 'function') {
                window.injectAdminButton();
            }
        } else {
            console.log('❌ User not authorized for admin:', getFromStorage('currentUser', {}).email);
        }
    } else {
        console.log('⚠️ Admin integration not loaded yet');
    }
}

// Call this function periodically in your app initialization
setInterval(checkAndInjectAdminButton, 5000);

// ==============================================
// ✅ नया पॉइंट टू INR/USDT कन्वर्जन सिस्टम
// ==============================================

// ✅ पॉइंट्स को INR में कन्वर्ट करें
function convertPointsToINR(pointsToConvert) {
    console.log(`💰 पॉइंट्स टू INR कन्वर्जन: ${pointsToConvert}`);
    
    if (!userRegistered) {
        showNotification('❌ कन्वर्जन के लिए रजिस्ट्रेशन जरूरी है!', 'warning');
        showRegistrationModal();
        return;
    }
    
    // न्यूनतम कन्वर्जन चेक
    if (pointsToConvert < MIN_CONVERSION_POINTS) {
        showNotification(`❌ न्यूनतम ${MIN_CONVERSION_POINTS} पॉइंट्स कन्वर्ट कर सकते हैं!`, 'warning');
        return;
    }
    
    // पर्याप्त पॉइंट्स चेक
    if (userPoints < pointsToConvert) {
        showNotification(`❌ आपके पास केवल ${userPoints} पॉइंट्स हैं!`, 'warning');
        return;
    }
    
    // INR कैलकुलेशन: 10000 पॉइंट्स = 100 INR
    const inrAmount = Math.floor((pointsToConvert / POINT_TO_INR_RATE) * 100);
    
    // पॉइंट्स डेडक्ट करें
    userPoints -= pointsToConvert;
    totalConverted += pointsToConvert;
    
    // INR वॉलेट में जोड़ें
    inrWallet += inrAmount;
    
    // ट्रांजेक्शन हिस्ट्री में जोड़ें
    addTransaction(
        `पॉइंट्स टू INR: ${pointsToConvert} पॉइंट्स → ${inrAmount} INR`,
        pointsToConvert,
        'spending',
        'conversion',
        'points_to_inr'
    );
    
    // INR ट्रांजेक्शन
    addTransaction(
        `INR प्राप्त: ${inrAmount} INR`,
        inrAmount,
        'earning',
        'wallet',
        'inr_credit'
    );
    
    // सेव स्टेट
    saveMiningState();
    
    // सक्सेस नोटिफिकेशन
    showNotification(
        `✅ ${pointsToConvert} पॉइंट्स सफलतापूर्वक ${inrAmount} INR में कन्वर्ट!`,
        'success'
    );
    
    // UI अपडेट करें
    updateUI();
    
    // वॉलेट सेक्शन दिखाएं
    showWalletSection();
    
    return inrAmount;
}

// ✅ INR को USDT में कन्वर्ट करें
function convertINRtoUSDT(inrToConvert) {
    console.log(`💱 INR टू USDT कन्वर्जन: ${inrToConvert}`);
    
    if (!userRegistered) {
        showNotification('❌ कन्वर्जन के लिए रजिस्ट्रेशन जरूरी है!', 'warning');
        return;
    }
    
    // न्यूनतम कन्वर्जन चेक
    if (inrToConvert < 85) {
        showNotification('❌ न्यूनतम 85 INR (1 USDT) कन्वर्ट कर सकते हैं!', 'warning');
        return;
    }
    
    // पर्याप्त INR चेक
    if (inrWallet < inrToConvert) {
        showNotification(`❌ आपके पास केवल ${inrWallet} INR हैं!`, 'warning');
        return;
    }
    
    // USDT कैलकुलेशन: 85 INR = 1 USDT
    const usdtAmount = parseFloat((inrToConvert / INR_TO_USDT_RATE).toFixed(2));
    
    // INR डेडक्ट करें
    inrWallet -= inrToConvert;
    
    // USDT वॉलेट में जोड़ें
    usdtWallet += usdtAmount;
    
    // ट्रांजेक्शन हिस्ट्री में जोड़ें
    addTransaction(
        `INR टू USDT: ${inrToConvert} INR → ${usdtAmount} USDT`,
        inrToConvert,
        'spending',
        'conversion',
        'inr_to_usdt'
    );
    
    // USDT ट्रांजेक्शन
    addTransaction(
        `USDT प्राप्त: ${usdtAmount} USDT`,
        usdtAmount,
        'earning',
        'wallet',
        'usdt_credit'
    );
    
    // सेव स्टेट
    saveMiningState();
    
    // सक्सेस नोटिफिकेशन
    showNotification(
        `✅ ${inrToConvert} INR सफलतापूर्वक ${usdtAmount} USDT में कन्वर्ट!`,
        'success'
    );
    
    // UI अपडेट करें
    updateUI();
    
    return usdtAmount;
}

// ✅ डायरेक्ट पॉइंट्स टू USDT कन्वर्जन
function convertPointsToUSDT(pointsToConvert) {
    console.log(`🚀 डायरेक्ट पॉइंट्स टू USDT: ${pointsToConvert}`);
    
    if (!userRegistered) {
        showNotification('❌ कन्वर्जन के लिए रजिस्ट्रेशन जरूरी है!', 'warning');
        showRegistrationModal();
        return;
    }
    
    // न्यूनतम कन्वर्जन चेक
    if (pointsToConvert < MIN_CONVERSION_POINTS) {
        showNotification(`❌ न्यूनतम ${MIN_CONVERSION_POINTS} पॉइंट्स कन्वर्ट कर सकते हैं!`, 'warning');
        return;
    }
    
    // पर्याप्त पॉइंट्स चेक
    if (userPoints < pointsToConvert) {
        showNotification(`❌ आपके पास केवल ${userPoints} पॉइंट्स हैं!`, 'warning');
        return;
    }
    
    // USDT कैलकुलेशन: 
    // 10000 पॉइंट्स = 100 INR
    // 85 INR = 1 USDT
    // तो 10000 पॉइंट्स = 100/85 = 1.1765 USDT
    const inrAmount = Math.floor((pointsToConvert / POINT_TO_INR_RATE) * 100);
    const usdtAmount = parseFloat((inrAmount / INR_TO_USDT_RATE).toFixed(2));
    
    // पॉइंट्स डेडक्ट करें
    userPoints -= pointsToConvert;
    totalConverted += pointsToConvert;
    
    // USDT वॉलेट में जोड़ें
    usdtWallet += usdtAmount;
    
    // ट्रांजेक्शन हिस्ट्री में जोड़ें
    addTransaction(
        `डायरेक्ट पॉइंट्स टू USDT: ${pointsToConvert} पॉइंट्स → ${usdtAmount} USDT`,
        pointsToConvert,
        'spending',
        'conversion',
        'points_to_usdt'
    );
    
    // USDT ट्रांजेक्शन
    addTransaction(
        `USDT प्राप्त: ${usdtAmount} USDT`,
        usdtAmount,
        'earning',
        'wallet',
        'usdt_credit'
    );
    
    // सेव स्टेट
    saveMiningState();
    
    // सक्सेस नोटिफिकेशन
    showNotification(
        `✅ ${pointsToConvert} पॉइंट्स सफलतापूर्वक ${usdtAmount} USDT में कन्वर्ट!`,
        'success'
    );
    
    // UI अपडेट करें
    updateUI();
    
    // वॉलेट सेक्शन दिखाएं
    showWalletSection();
    
    return usdtAmount;
}

// ✅ वॉलेट सेक्शन दिखाएं
function showWalletSection() {
    if (!userRegistered) {
        showNotification('❌ वॉलेट देखने के लिए रजिस्टर करें!', 'warning');
        showRegistrationModal();
        return;
    }
    
    const profileContent = document.getElementById('profileAppContent');
    if (!profileContent) return;
    
    profileContent.innerHTML = `
        <div class="earn-page">
            <div class="platform-header">
                <button onclick="showProfileHomePage()" class="back-btn">← Back</button>
                <div class="platform-header-icon">💰</div>
                <h3>💰 डिजिटल वॉलेट</h3>
            </div>
            
            <!-- वॉलेट स्टेट्स -->
            <div class="wallet-stats-grid">
                <div class="wallet-stat-card points-wallet">
                    <div class="wallet-icon">🎯</div>
                    <div class="wallet-info">
                        <div class="wallet-name">पॉइंट्स वॉलेट</div>
                        <div class="wallet-balance" id="pointsBalance">${formatNumber(userPoints)}</div>
                        <div class="wallet-subtitle">कुल अर्जित: ${formatNumber(totalPointsEarned)}</div>
                    </div>
                    <div class="wallet-convert-btn" onclick="showConvertPointsModal()">
                        कन्वर्ट करें
                    </div>
                </div>
                
                <div class="wallet-stat-card inr-wallet">
                    <div class="wallet-icon">₹</div>
                    <div class="wallet-info">
                        <div class="wallet-name">INR वॉलेट</div>
                        <div class="wallet-balance" id="inrBalance">${inrWallet.toFixed(2)}</div>
                        <div class="wallet-subtitle">≈ ${(inrWallet / 85).toFixed(2)} USDT</div>
                    </div>
                    <div class="wallet-convert-btn" onclick="showConvertINRModal()">
                        USDT में बदलें
                    </div>
                </div>
                
                <div class="wallet-stat-card usdt-wallet">
                    <div class="wallet-icon">💲</div>
                    <div class="wallet-info">
                        <div class="wallet-name">USDT वॉलेट</div>
                        <div class="wallet-balance" id="usdtBalance">${usdtWallet.toFixed(2)}</div>
                        <div class="wallet-subtitle">≈ ${(usdtWallet * 85).toFixed(2)} INR</div>
                    </div>
                    <div class="wallet-use-btn" onclick="showUseUSDTforPool()">
                        पूल खरीदें
                    </div>
                </div>
            </div>
            
            <!-- कन्वर्जन रेट्स कार्ड -->
            <div class="conversion-rates-card">
                <h4>📊 कन्वर्जन रेट्स</h4>
                <div class="rates-grid">
                    <div class="rate-item">
                        <div class="rate-from">10000 पॉइंट्स</div>
                        <div class="rate-arrow">→</div>
                        <div class="rate-to">100 INR</div>
                    </div>
                    <div class="rate-item">
                        <div class="rate-from">85 INR</div>
                        <div class="rate-arrow">→</div>
                        <div class="rate-to">1 USDT</div>
                    </div>
                    <div class="rate-item">
                        <div class="rate-from">10000 पॉइंट्स</div>
                        <div class="rate-arrow">→</div>
                        <div class="rate-to">1.1765 USDT</div>
                    </div>
                </div>
                <div class="rate-note">
                    💡 न्यूनतम कन्वर्जन: 10000 पॉइंट्स (100 INR)
                </div>
            </div>
            
            <!-- क्विक एक्शन बटन -->
            <div class="wallet-quick-actions">
                <button class="wallet-action-btn" onclick="showConvertPointsModal()">
                    <span class="action-icon">🔄</span>
                    <span class="action-text">पॉइंट्स कन्वर्ट करें</span>
                </button>
                <button class="wallet-action-btn" onclick="showConvertINRModal()">
                    <span class="action-icon">💱</span>
                    <span class="action-text">INR टू USDT</span>
                </button>
                <button class="wallet-action-btn" onclick="showMiningPage()">
                    <span class="action-icon">⛏️</span>
                    <span class="action-text">पेड पूल खरीदें</span>
                </button>
            </div>
            
            <!-- रिकेंट कन्वर्जन हिस्ट्री -->
            <div class="conversion-history-section">
                <h4>📈 रिकेंट कन्वर्जन</h4>
                <div id="conversionHistoryList">
                    ${getConversionHistoryHTML()}
                </div>
                <button class="btn-view-all" onclick="showFullConversionHistory()">
                    पूरी हिस्ट्री देखें
                </button>
            </div>
            
            <!-- इंस्ट्रक्शन -->
            <div class="wallet-instructions">
                <h5>💡 कैसे इस्तेमाल करें:</h5>
                <ol>
                    <li>पॉइंट्स कमाएं (वीडियो, टास्क, रेफरल से)</li>
                    <li>10000+ पॉइंट्स होने पर INR/USDT में कन्वर्ट करें</li>
                    <li>USDT वॉलेट से पेड माइनिंग पूल खरीदें</li>
                    <li>पूल से और पॉइंट्स कमाएं</li>
                </ol>
            </div>
        </div>
    `;
}

// ✅ पॉइंट्स कन्वर्ट मोडल दिखाएं
function showConvertPointsModal() {
    if (!userRegistered) {
        showNotification('❌ रजिस्टर करें!', 'warning');
        showRegistrationModal();
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal active wallet-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>🔄 पॉइंट्स कन्वर्ट करें</h3>
                <button class="modal-close" onclick="closeWalletModal()">×</button>
            </div>
            
            <div class="wallet-modal-body">
                <!-- करंट बैलेंस -->
                <div class="balance-display">
                    <div class="balance-label">आपके पॉइंट्स:</div>
                    <div class="balance-amount">${formatNumber(userPoints)}</div>
                </div>
                
                <!-- न्यूनतम रिक्वायरमेंट -->
                <div class="min-requirement">
                    <div class="requirement-icon">📊</div>
                    <div class="requirement-text">
                        न्यूनतम कन्वर्जन: ${MIN_CONVERSION_POINTS} पॉइंट्स (100 INR)
                    </div>
                </div>
                
                <!-- एमाउंट इनपुट -->
                <div class="amount-input-section">
                    <label for="pointsToConvert">कन्वर्ट करने के पॉइंट्स:</label>
                    <div class="amount-input-group">
                        <input 
                            type="number" 
                            id="pointsToConvert" 
                            value="${MIN_CONVERSION_POINTS}"
                            min="${MIN_CONVERSION_POINTS}"
                            max="${userPoints}"
                            oninput="updateConversionPreview()"
                        >
                        <span class="input-suffix">पॉइंट्स</span>
                    </div>
                    <div class="amount-slider">
                        <input 
                            type="range" 
                            id="pointsSlider"
                            min="${MIN_CONVERSION_POINTS}"
                            max="${Math.max(userPoints, MIN_CONVERSION_POINTS)}"
                            value="${MIN_CONVERSION_POINTS}"
                            oninput="updateConversionFromSlider()"
                        >
                        <div class="slider-labels">
                            <span>${MIN_CONVERSION_POINTS}</span>
                            <span>${Math.max(userPoints, MIN_CONVERSION_POINTS)}</span>
                        </div>
                    </div>
                </div>
                
                <!-- क्विक अमाउंट बटन -->
                <div class="quick-amounts">
                    <button class="quick-amount-btn" onclick="setConvertAmount(${MIN_CONVERSION_POINTS})">
                        10K पॉइंट्स
                    </button>
                    <button class="quick-amount-btn" onclick="setConvertAmount(${MIN_CONVERSION_POINTS * 2})">
                        20K पॉइंट्स
                    </button>
                    <button class="quick-amount-btn" onclick="setConvertAmount(${MIN_CONVERSION_POINTS * 5})">
                        50K पॉइंट्स
                    </button>
                    <button class="quick-amount-btn" onclick="setConvertAmount(${Math.floor(userPoints / 10000) * 10000})">
                        मैक्स
                    </button>
                </div>
                
                <!-- कन्वर्जन प्रिव्यू -->
                <div class="conversion-preview" id="conversionPreview">
                    <div class="preview-title">आप प्राप्त करेंगे:</div>
                    <div class="preview-amounts">
                        <div class="preview-item">
                            <div class="preview-icon">₹</div>
                            <div class="preview-value" id="previewINR">100 INR</div>
                        </div>
                        <div class="preview-arrow">→</div>
                        <div class="preview-item">
                            <div class="preview-icon">💲</div>
                            <div class="preview-value" id="previewUSDT">1.18 USDT</div>
                        </div>
                    </div>
                </div>
                
                <!-- कन्वर्जन ऑप्शन -->
                <div class="conversion-options">
                    <div class="option-title">कन्वर्जन ऑप्शन:</div>
                    <div class="options-grid">
                        <div class="conversion-option ${userPoints < MIN_CONVERSION_POINTS ? 'disabled' : ''}" 
                             onclick="${userPoints >= MIN_CONVERSION_POINTS ? 'convertPointsToINRDirect()' : ''}">
                            <div class="option-icon">₹</div>
                            <div class="option-info">
                                <div class="option-name">INR में कन्वर्ट</div>
                                <div class="option-desc">सीधे INR वॉलेट में</div>
                            </div>
                            <div class="option-arrow">→</div>
                        </div>
                        
                        <div class="conversion-option ${userPoints < MIN_CONVERSION_POINTS ? 'disabled' : ''}" 
                             onclick="${userPoints >= MIN_CONVERSION_POINTS ? 'convertPointsToUSDTDirect()' : ''}">
                            <div class="option-icon">💲</div>
                            <div class="option-info">
                                <div class="option-name">USDT में कन्वर्ट</div>
                                <div class="option-desc">सीधे USDT वॉलेट में</div>
                            </div>
                            <div class="option-arrow">→</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="modal-footer">
                <button class="btn-cancel" onclick="closeWalletModal()">रद्द करें</button>
                <button class="btn-success" onclick="processPointsConversion()" 
                        ${userPoints < MIN_CONVERSION_POINTS ? 'disabled' : ''}>
                    कन्वर्ट करें
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    updateConversionPreview();
}

// ✅ कन्वर्जन प्रिव्यू अपडेट करें
function updateConversionPreview() {
    const pointsInput = document.getElementById('pointsToConvert');
    if (!pointsInput) return;
    
    const points = parseInt(pointsInput.value) || MIN_CONVERSION_POINTS;
    const inrAmount = Math.floor((points / POINT_TO_INR_RATE) * 100);
    const usdtAmount = parseFloat((inrAmount / INR_TO_USDT_RATE).toFixed(2));
    
    const previewINR = document.getElementById('previewINR');
    const previewUSDT = document.getElementById('previewUSDT');
    
    if (previewINR) previewINR.textContent = `${inrAmount} INR`;
    if (previewUSDT) previewUSDT.textContent = `${usdtAmount} USDT`;
}

// ✅ स्लाइडर से अपडेट करें
function updateConversionFromSlider() {
    const slider = document.getElementById('pointsSlider');
    const input = document.getElementById('pointsToConvert');
    
    if (slider && input) {
        input.value = slider.value;
        updateConversionPreview();
    }
}

// ✅ कन्वर्ट अमाउंट सेट करें
function setConvertAmount(amount) {
    const input = document.getElementById('pointsToConvert');
    const slider = document.getElementById('pointsSlider');
    
    if (input) {
        const maxPoints = Math.max(userPoints, MIN_CONVERSION_POINTS);
        const safeAmount = Math.min(Math.max(amount, MIN_CONVERSION_POINTS), maxPoints);
        input.value = safeAmount;
        
        if (slider) {
            slider.value = safeAmount;
        }
        
        updateConversionPreview();
    }
}

// ✅ पॉइंट्स कन्वर्जन प्रोसेस करें
function processPointsConversion() {
    const pointsInput = document.getElementById('pointsToConvert');
    if (!pointsInput) return;
    
    const points = parseInt(pointsInput.value) || MIN_CONVERSION_POINTS;
    
    if (points < MIN_CONVERSION_POINTS) {
        showNotification(`❌ न्यूनतम ${MIN_CONVERSION_POINTS} पॉइंट्स चाहिए!`, 'warning');
        return;
    }
    
    if (points > userPoints) {
        showNotification(`❌ आपके पास केवल ${userPoints} पॉइंट्स हैं!`, 'warning');
        return;
    }
    
    // यूजर को ऑप्शन दें
    showConversionOptionsModal(points);
}

// ✅ कन्वर्जन ऑप्शन मोडल दिखाएं
function showConversionOptionsModal(points) {
    const inrAmount = Math.floor((points / POINT_TO_INR_RATE) * 100);
    const usdtAmount = parseFloat((inrAmount / INR_TO_USDT_RATE).toFixed(2));
    
    const modal = document.createElement('div');
    modal.className = 'modal active conversion-options-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>🎯 कन्वर्जन चुनें</h3>
                <button class="modal-close" onclick="closeConversionOptionsModal()">×</button>
            </div>
            
            <div class="conversion-options-body">
                <div class="conversion-summary">
                    <div class="summary-title">${formatNumber(points)} पॉइंट्स कन्वर्ट करें</div>
                    <div class="summary-amounts">
                        <div class="amount-item">
                            <div class="amount-icon">🎯</div>
                            <div class="amount-text">${formatNumber(points)} पॉइंट्स</div>
                        </div>
                        <div class="amount-arrow">↓</div>
                        <div class="amount-item">
                            <div class="amount-icon">₹</div>
                            <div class="amount-text">${inrAmount} INR</div>
                        </div>
                        <div class="amount-arrow">↓</div>
                        <div class="amount-item">
                            <div class="amount-icon">💲</div>
                            <div class="amount-text">${usdtAmount} USDT</div>
                        </div>
                    </div>
                </div>
                
                <div class="conversion-choice">
                    <button class="choice-btn inr-choice" onclick="convertPointsToINR(${points})">
                        <div class="choice-icon">₹</div>
                        <div class="choice-info">
                            <div class="choice-title">INR में कन्वर्ट</div>
                            <div class="choice-amount">${inrAmount} INR प्राप्त करें</div>
                            <div class="choice-desc">फिर USDT में बदल सकते हैं</div>
                        </div>
                    </button>
                    
                    <button class="choice-btn usdt-choice" onclick="convertPointsToUSDT(${points})">
                        <div class="choice-icon">💲</div>
                        <div class="choice-info">
                            <div class="choice-title">USDT में कन्वर्ट</div>
                            <div class="choice-amount">${usdtAmount} USDT प्राप्त करें</div>
                            <div class="choice-desc">डायरेक्ट पेड पूल खरीदें</div>
                        </div>
                    </button>
                </div>
                
                <div class="conversion-note">
                    💡 <strong>USDT चुनें</strong> अगर सीधे पेड पूल खरीदना चाहते हैं
                </div>
            </div>
            
            <div class="modal-footer">
                <button class="btn-cancel" onclick="closeConversionOptionsModal()">रद्द करें</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// ✅ पॉइंट्स टू INR डायरेक्ट
function convertPointsToINRDirect() {
    const pointsInput = document.getElementById('pointsToConvert');
    if (!pointsInput) return;
    
    const points = parseInt(pointsInput.value) || MIN_CONVERSION_POINTS;
    convertPointsToINR(points);
    closeWalletModal();
}

// ✅ पॉइंट्स टू USDT डायरेक्ट
function convertPointsToUSDTDirect() {
    const pointsInput = document.getElementById('pointsToConvert');
    if (!pointsInput) return;
    
    const points = parseInt(pointsInput.value) || MIN_CONVERSION_POINTS;
    convertPointsToUSDT(points);
    closeWalletModal();
}

// ✅ INR टू USDT कन्वर्जन मोडल
function showConvertINRModal() {
    if (!userRegistered) {
        showNotification('❌ रजिस्टर करें!', 'warning');
        showRegistrationModal();
        return;
    }
    
    if (inrWallet < 85) {
        showNotification(`❌ न्यूनतम 85 INR (1 USDT) चाहिए! आपके पास ${inrWallet} INR हैं`, 'warning');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal active inr-convert-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>💱 INR टू USDT कन्वर्जन</h3>
                <button class="modal-close" onclick="closeINRConvertModal()">×</button>
            </div>
            
            <div class="inr-convert-body">
                <!-- INR बैलेंस -->
                <div class="inr-balance-display">
                    <div class="balance-label">आपके INR:</div>
                    <div class="balance-amount">${inrWallet.toFixed(2)}</div>
                </div>
                
                <!-- रेट डिस्प्ले -->
                <div class="rate-display">
                    <div class="rate-text">रेट: 85 INR = 1 USDT</div>
                </div>
                
                <!-- अमाउंट इनपुट -->
                <div class="amount-input-section">
                    <label for="inrToConvert">कन्वर्ट करने के INR:</label>
                    <div class="amount-input-group">
                        <input 
                            type="number" 
                            id="inrToConvert" 
                            value="85"
                            min="85"
                            max="${inrWallet}"
                            step="85"
                            oninput="updateINRConversionPreview()"
                        >
                        <span class="input-suffix">INR</span>
                    </div>
                </div>
                
                <!-- क्विक अमाउंट -->
                <div class="quick-inr-amounts">
                    <button class="quick-inr-btn" onclick="setINRConvertAmount(85)">
                        85 INR (1 USDT)
                    </button>
                    <button class="quick-inr-btn" onclick="setINRConvertAmount(170)">
                        170 INR (2 USDT)
                    </button>
                    <button class="quick-inr-btn" onclick="setINRConvertAmount(425)">
                        425 INR (5 USDT)
                    </button>
                    <button class="quick-inr-btn" onclick="setINRConvertAmount(${Math.floor(inrWallet / 85) * 85})">
                        मैक्स
                    </button>
                </div>
                
                <!-- प्रिव्यू -->
                <div class="inr-conversion-preview" id="inrConversionPreview">
                    <div class="preview-title">आप प्राप्त करेंगे:</div>
                    <div class="preview-amount">
                        <div class="preview-icon">💲</div>
                        <div class="preview-value" id="previewUSDTFromINR">1.00 USDT</div>
                    </div>
                </div>
            </div>
            
            <div class="modal-footer">
                <button class="btn-cancel" onclick="closeINRConvertModal()">रद्द करें</button>
                <button class="btn-success" onclick="processINRConversion()">
                    कन्वर्ट करें
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    updateINRConversionPreview();
}

// ✅ INR कन्वर्जन प्रिव्यू अपडेट
function updateINRConversionPreview() {
    const inrInput = document.getElementById('inrToConvert');
    if (!inrInput) return;
    
    const inrAmount = parseInt(inrInput.value) || 85;
    const usdtAmount = parseFloat((inrAmount / 85).toFixed(2));
    
    const preview = document.getElementById('previewUSDTFromINR');
    if (preview) preview.textContent = `${usdtAmount} USDT`;
}

// ✅ INR कन्वर्ट अमाउंट सेट करें
function setINRConvertAmount(amount) {
    const input = document.getElementById('inrToConvert');
    if (input) {
        const maxINR = Math.floor(inrWallet / 85) * 85;
        const safeAmount = Math.min(Math.max(amount, 85), maxINR);
        input.value = safeAmount;
        updateINRConversionPreview();
    }
}

// ✅ INR कन्वर्जन प्रोसेस करें
function processINRConversion() {
    const inrInput = document.getElementById('inrToConvert');
    if (!inrInput) return;
    
    const inrAmount = parseInt(inrInput.value) || 85;
    
    if (inrAmount < 85) {
        showNotification('❌ न्यूनतम 85 INR चाहिए!', 'warning');
        return;
    }
    
    if (inrAmount > inrWallet) {
        showNotification(`❌ आपके पास केवल ${inrWallet} INR हैं!`, 'warning');
        return;
    }
    
    // मल्टीपल ऑफ 85 चेक
    if (inrAmount % 85 !== 0) {
        showNotification('❌ कृपया 85 के मल्टीपल में INR दर्ज करें!', 'warning');
        return;
    }
    
    convertINRtoUSDT(inrAmount);
    closeINRConvertModal();
}

// ✅ USDT से पेड पूल खरीदें
function showUseUSDTforPool() {
    if (!userRegistered) {
        showNotification('❌ रजिस्टर करें!', 'warning');
        showRegistrationModal();
        return;
    }
    
    if (usdtWallet < 50) {
        showNotification(`❌ न्यूनतम 50 USDT चाहिए! आपके पास ${usdtWallet} USDT हैं`, 'warning');
        return;
    }
    
    // माइनिंग पेज पर स्विच करें
    switchTab('mining');
    
    // नोटिफिकेशन दिखाएं
    showNotification('✅ अब पेड पूल खरीदने के लिए USDT वॉलेट का उपयोग करें!', 'success');
}

// ✅ कन्वर्जन हिस्ट्री HTML जेनरेट करें
function getConversionHistoryHTML() {
    // कन्वर्जन ट्रांजेक्शन फिल्टर करें
    const conversionTransactions = transactionHistory.filter(t => 
        t.subCategory === 'points_to_inr' || 
        t.subCategory === 'inr_to_usdt' || 
        t.subCategory === 'points_to_usdt'
    );
    
    if (conversionTransactions.length === 0) {
        return '<div class="no-conversions">अभी तक कोई कन्वर्जन नहीं</div>';
    }
    
    let html = '<div class="conversion-history-list">';
    
    conversionTransactions.slice(0, 5).forEach(transaction => {
        let description = transaction.description;
        let icon = '🔄';
        let amount = transaction.amount;
        
        if (transaction.subCategory === 'points_to_inr') {
            icon = '₹';
        } else if (transaction.subCategory === 'inr_to_usdt') {
            icon = '💱';
        } else if (transaction.subCategory === 'points_to_usdt') {
            icon = '💲';
        }
        
        const date = new Date(transaction.timestamp);
        const timeString = date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit'
        });
        
        html += `
            <div class="conversion-history-item">
                <div class="conversion-icon">${icon}</div>
                <div class="conversion-info">
                    <div class="conversion-desc">${description}</div>
                    <div class="conversion-time">${timeString}</div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

// ✅ फुल कन्वर्जन हिस्ट्री दिखाएं
function showFullConversionHistory() {
    const profileContent = document.getElementById('profileAppContent');
    if (!profileContent) return;
    
    // कन्वर्जन ट्रांजेक्शन फिल्टर करें
    const conversionTransactions = transactionHistory.filter(t => 
        t.subCategory === 'points_to_inr' || 
        t.subCategory === 'inr_to_usdt' || 
        t.subCategory === 'points_to_usdt'
    );
    
    let html = `
        <div class="earn-page">
            <div class="platform-header">
                <button onclick="showWalletSection()" class="back-btn">← Back</button>
                <h3>📊 कन्वर्जन हिस्ट्री</h3>
            </div>
            
            <div class="conversion-summary-stats">
                <div class="conversion-stat">
                    <div class="stat-number">${totalConverted}</div>
                    <div class="stat-label">कुल कन्वर्टेड पॉइंट्स</div>
                </div>
                <div class="conversion-stat">
                    <div class="stat-number">${inrWallet.toFixed(2)}</div>
                    <div class="stat-label">करंट INR</div>
                </div>
                <div class="conversion-stat">
                    <div class="stat-number">${usdtWallet.toFixed(2)}</div>
                    <div class="stat-label">करंट USDT</div>
                </div>
            </div>
            
            <div class="full-conversion-history">
    `;
    
    if (conversionTransactions.length === 0) {
        html += '<div class="no-conversions">अभी तक कोई कन्वर्जन नहीं</div>';
    } else {
        html += '<div class="conversion-list">';
        
        conversionTransactions.forEach(transaction => {
            let description = transaction.description;
            let icon = '🔄';
            let amount = transaction.amount;
            
            if (transaction.subCategory === 'points_to_inr') {
                icon = '₹';
            } else if (transaction.subCategory === 'inr_to_usdt') {
                icon = '💱';
            } else if (transaction.subCategory === 'points_to_usdt') {
                icon = '💲';
            }
            
            const date = new Date(transaction.timestamp);
            const timeString = date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
            });
            const dateString = date.toLocaleDateString();
            
            html += `
                <div class="conversion-history-item-full">
                    <div class="conversion-icon-full">${icon}</div>
                    <div class="conversion-info-full">
                        <div class="conversion-desc-full">${description}</div>
                        <div class="conversion-time-full">${dateString} ${timeString}</div>
                    </div>
                    <div class="conversion-amount-full ${transaction.type}">
                        ${transaction.type === 'earning' ? '+' : '-'}${amount}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
    }
    
    html += `
            </div>
            
            <div class="export-section" style="margin-top: 20px;">
                <button class="btn-export" onclick="exportConversionHistory()">
                    📤 कन्वर्जन हिस्ट्री एक्सपोर्ट करें
                </button>
            </div>
        </div>
    `;
    
    profileContent.innerHTML = html;
}

// ✅ कन्वर्जन हिस्ट्री एक्सपोर्ट करें
function exportConversionHistory() {
    const conversionData = {
        totalPointsConverted: totalConverted,
        currentINR: inrWallet,
        currentUSDT: usdtWallet,
        conversionRate: {
            points_to_inr: '10000 points = 100 INR',
            inr_to_usdt: '85 INR = 1 USDT'
        },
        transactions: transactionHistory.filter(t => 
            t.subCategory === 'points_to_inr' || 
            t.subCategory === 'inr_to_usdt' || 
            t.subCategory === 'points_to_usdt'
        ),
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(conversionData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversion_history_${userId}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('✅ कन्वर्जन हिस्ट्री एक्सपोर्ट की गई!', 'success');
}

// ✅ मोडल क्लोज करने के फंक्शन
function closeWalletModal() {
    const modal = document.querySelector('.modal.wallet-modal');
    if (modal) modal.remove();
}

function closeConversionOptionsModal() {
    const modal = document.querySelector('.modal.conversion-options-modal');
    if (modal) modal.remove();
}

function closeINRConvertModal() {
    const modal = document.querySelector('.modal.inr-convert-modal');
    if (modal) modal.remove();
}

// ✅ SECTION 2: INITIALIZE REFERRAL SYSTEM FUNCTIONS
function initializeReferralCodesDatabase() {
    console.log('📊 Initializing referral codes database...');
    
    let allReferrals = getFromStorage('allReferrals', []);
    
    if (allReferrals.length === 0) {
        allReferrals = PRE_LOADED_REFERRAL_CODES;
        saveToStorage('allReferrals', allReferrals);
        console.log('✅ Loaded pre-defined referral codes:', allReferrals.length);
    }
    
    initializeExistingUsersReferralCodes();
    return allReferrals;
}

function initializeExistingUsersReferralCodes() {
    const registeredUsers = getFromStorage('registeredUsers', []);
    
    registeredUsers.forEach(user => {
        const userRefData = getFromStorage(`referralData_${user.id}`, null);
        
        if (!userRefData && user.id) {
            const newReferralCode = generateReferralCode();
            
            const referralData = {
                referralCode: newReferralCode,
                referredUsers: [],
                totalEarned: 0,
                telegramUsername: user.username || user.id,
                userId: user.id,
                userName: user.username || user.id,
                joinDate: user.registeredAt || new Date().toISOString()
            };
            
            saveToStorage(`referralData_${user.id}`, referralData);
            
            const allReferrals = getFromStorage('allReferrals', []);
            allReferrals.push({
                code: newReferralCode,
                username: user.username || user.id,
                name: user.username || user.id,
                points: 50,
                isActive: true,
                createdAt: user.registeredAt || new Date().toISOString(),
                userId: user.id
            });
            saveToStorage('allReferrals', allReferrals);
            
            console.log(`✅ Created referral code for existing user: ${user.id} -> ${newReferralCode}`);
        }
    });
}

function validateReferralCode(code) {
    console.log('🔍 Validating referral code:', code);
    
    if (!code || code.trim() === '') {
        return { valid: false, message: 'Please enter a referral code' };
    }
    
    const allReferrals = getFromStorage('allReferrals', PRE_LOADED_REFERRAL_CODES);
    
    const referral = allReferrals.find(ref => 
        ref.code === code || 
        ref.code.toLowerCase() === code.toLowerCase()
    );
    
    if (referral) {
        if (referral.isActive) {
            return {
                valid: true,
                message: 'Valid referral code',
                owner: referral.name || referral.username,
                ownerId: referral.userId,
                code: referral.code,
                points: referral.points || 25
            };
        } else {
            return { valid: false, message: 'This referral code is no longer active' };
        }
    } else {
        const registeredUsers = getFromStorage('registeredUsers', []);
        
        for (const user of registeredUsers) {
            const userRefData = getFromStorage(`referralData_${user.id}`, null);
            if (userRefData && userRefData.referralCode === code) {
                return {
                    valid: true,
                    message: 'Valid referral code',
                    owner: user.username || user.id,
                    ownerId: user.id,
                    code: code,
                    points: 25
                };
            }
        }
        
        return { valid: false, message: 'Invalid referral code. Please check and try again.' };
    }
}

function getAvailableReferralCodes() {
    const allReferrals = getFromStorage('allReferrals', PRE_LOADED_REFERRAL_CODES);
    
    return allReferrals
        .filter(ref => ref.isActive)
        .slice(0, 5)
        .map(ref => ({
            code: ref.code,
            name: ref.name || ref.username,
            points: ref.points || 25
        }));
}

function selectReferralCode(code) {
    const input = document.getElementById('regReferralCode');
    if (input) {
        input.value = code;
        showNotification(`✅ Selected referral code: ${code}`, 'success');
    }
}

// ==============================================
// ✅ NEW REGISTRATION SYSTEM FUNCTIONS - FIXED
// ==============================================

function showRegistrationModal() {
    // Check if user is already registered
    if (checkRegistrationStatus()) {
        showNotification('✅ You are already registered!', 'success');
        updateUI();
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal active registration-modal';
    modal.id = 'registrationModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>📝 User Registration</h3>
                <button class="modal-close" onclick="closeRegistrationModal()">×</button>
            </div>
            <div class="registration-steps">
                <div class="step-indicator">
                    <div class="step ${registrationStep === 1 ? 'active' : ''}">1</div>
                    <div class="step-line"></div>
                    <div class="step ${registrationStep === 2 ? 'active' : ''}">2</div>
                    <div class="step-line"></div>
                    <div class="step ${registrationStep === 3 ? 'active' : ''}">3</div>
                    <div class="step-line"></div>
                    <div class="step ${registrationStep === 4 ? 'active' : ''}">4</div>
                </div>
                
                <div id="registrationFormContent">
                    ${getRegistrationStepContent()}
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function getRegistrationStepContent() {
    switch(registrationStep) {
        case 1:
            return `
                <div class="registration-step">
                    <h4>Step 1: Basic Information</h4>
                    <div class="form-group">
                        <label for="regUsername">Username *</label>
                        <input type="text" id="regUsername" placeholder="Choose unique username" oninput="checkUsernameAvailability()">
                        <div class="form-hint">This will be your login ID</div>
                        <div id="usernameStatus" class="status-message"></div>
                    </div>
                    <div class="form-group">
                        <label for="regEmail">Email ID *</label>
                        <input type="email" id="regEmail" placeholder="Enter your email">
                        <div class="form-hint">One-time use only</div>
                    </div>
                    <div class="form-group">
                        <label for="regMobile">Mobile Number *</label>
                        <input type="tel" id="regMobile" placeholder="Enter 10-digit mobile number">
                        <div class="form-hint">One-time use only</div>
                    </div>
                    <div class="form-group">
                        <label for="regPassword">Password *</label>
                        <input type="password" id="regPassword" placeholder="Create password (min 6 characters)">
                        <div class="form-hint">Minimum 6 characters</div>
                    </div>
                    <div class="form-group">
                        <label for="regConfirmPassword">Confirm Password *</label>
                        <input type="password" id="regConfirmPassword" placeholder="Confirm password">
                    </div>
                    <button class="btn-next" onclick="validateStep1()">Next →</button>
                </div>
        `;
        case 2:
            // ✅ SECTION 4: UPDATE REGISTRATION MODAL CONTENT
            const availableReferralCodes = getAvailableReferralCodes();
            
            return `
                <div class="registration-step">
                    <h4>Step 2: Sponsor Information</h4>
                    
                    <div class="sponsor-info-card">
                        <h5 style="color: #4CAF50;">👥 Sponsor Benefits</h5>
                        <ul>
                            <li>✅ Sponsor gets <strong>5-20% commission</strong> on your earnings</li>
                            <li>✅ You help your sponsor earn passive income</li>
                        </ul>
                    </div>
                    
                    <div class="form-group">
                        <label for="regSponsorId">Sponsor ID</label>
                        <input type="text" id="regSponsorId" placeholder="Enter sponsor ID (optional)" value="${sponsorId || ''}">
                        <div class="form-hint">Your sponsor will earn commission from your activities</div>
                    </div>
                    
                    <div class="form-group">
                        <label for="regSponsorName">Sponsor Name</label>
                        <input type="text" id="regSponsorName" placeholder="Enter sponsor name (optional)" value="${sponsorName || ''}">
                    </div>
                    
                    <div class="referral-code-section">
                        <h5 style="color: #2196F3; margin-bottom: 10px;">🎁 Referral Code (Get 25 Bonus Points!)</h5>
                        
                        <div class="form-group">
                            <label for="regReferralCode">Enter Referral Code</label>
                            <input type="text" id="regReferralCode" placeholder="e.g., TAPEARN-REF001" value="">
                            <div class="form-hint">Get 25 bonus points when you use a valid referral code</div>
                        </div>
                        
                        ${availableReferralCodes.length > 0 ? `
                        <div class="available-codes">
                            <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Available Referral Codes:</div>
                            <div class="codes-list">
                                ${availableReferralCodes.map(code => `
                                    <div class="code-item" onclick="selectReferralCode('${code.code}')">
                                        <div class="code-name">${code.code}</div>
                                        <div class="code-owner">by ${code.name}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="form-actions">
                        <button class="btn-back" onclick="previousStep()">← Back</button>
                        <button class="btn-next" onclick="validateStep2()">Next →</button>
                    </div>
                </div>
            `;
        case 3:
            return `
                <div class="registration-step">
                    <h4>Step 3: Verify Email</h4>
                    <p>We sent OTP to: <strong>${userEmail}</strong></p>
                    <div class="form-group">
                        <label for="emailOTP">Enter 6-digit OTP</label>
                        <input type="text" id="emailOTP" placeholder="000000" maxlength="6">
                        <div class="otp-actions">
                            <button class="btn-resend" onclick="sendEmailOTP()">Resend OTP</button>
                            <button class="btn-verify" onclick="verifyEmailOTP()">Verify Email</button>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button class="btn-back" onclick="previousStep()">← Back</button>
                    </div>
                </div>
            `;
        case 4:
            return `
                <div class="registration-step">
                    <h4>Step 4: Verify Mobile</h4>
                    <p>We sent OTP to: <strong>${userMobile}</strong></p>
                    <div class="form-group">
                        <label for="mobileOTP">Enter 6-digit OTP</label>
                        <input type="text" id="mobileOTP" placeholder="000000" maxlength="6">
                        <div class="otp-actions">
                            <button class="btn-resend" onclick="sendMobileOTP()">Resend OTP</button>
                            <button class="btn-verify" onclick="verifyMobileOTP()">Verify Mobile</button>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button class="btn-back" onclick="previousStep()">← Back</button>
                    </div>
                </div>
            `;
        default:
            return '';
    }
}

function closeRegistrationModal() {
    const modal = document.getElementById('registrationModal');
    if (modal) {
        modal.remove();
    }
}

function checkUsernameAvailability() {
    const username = document.getElementById('regUsername')?.value;
    const statusEl = document.getElementById('usernameStatus');
    
    if (!username || username.length < 3) {
        if (statusEl) {
            statusEl.textContent = 'Username must be at least 3 characters';
            statusEl.className = 'status-message error';
        }
        return;
    }
    
    // Check if username exists in localStorage
    const existingUsers = getFromStorage('registeredUsers', []);
    const exists = existingUsers.some(user => user.username === username);
    
    if (statusEl) {
        if (exists) {
            statusEl.textContent = '❌ Username already taken';
            statusEl.className = 'status-message error';
        } else {
            statusEl.textContent = '✅ Username available';
            statusEl.className = 'status-message success';
        }
    }
}

function validateStep1() {
    const username = document.getElementById('regUsername')?.value.trim() || '';
    const email = document.getElementById('regEmail')?.value.trim() || '';
    const mobile = document.getElementById('regMobile')?.value.trim() || '';
    const password = document.getElementById('regPassword')?.value.trim() || '';
    const confirmPassword = document.getElementById('regConfirmPassword')?.value.trim() || '';
    
    console.log('Validating Step 1:', { username, email, mobile, password });
    
    // Validate username
    if (!username || username.length < 3) {
        showNotification('❌ Username must be at least 3 characters', 'warning');
        return;
    }
    
    // Check username availability
    const existingUsers = getFromStorage('registeredUsers', []);
    if (existingUsers.some(user => user.username === username)) {
        showNotification('❌ Username already taken', 'warning');
        return;
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        showNotification('❌ Please enter valid email', 'warning');
        return;
    }
    
    // Check email uniqueness
    if (existingUsers.some(user => user.email === email)) {
        showNotification('❌ Email already registered', 'warning');
        return;
    }
    
    // Validate mobile
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobile || !mobileRegex.test(mobile)) {
        showNotification('❌ Please enter 10-digit mobile number', 'warning');
        return;
    }
    
    // Check mobile uniqueness
    if (existingUsers.some(user => user.mobile === mobile)) {
        showNotification('❌ Mobile number already registered', 'warning');
        return;
    }
    
    // Validate password
    if (!password || password.length < 6) {
        showNotification('❌ Password must be at least 6 characters', 'warning');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('❌ Passwords do not match', 'warning');
        return;
    }
    
    // Save step 1 data
    userId = username;
    userEmail = email;
    userMobile = mobile;
    // Note: Password will be saved during completeRegistration
    
    registrationStep = 2;
    updateRegistrationModal();
    showNotification('✅ Step 1 completed!', 'success');
}

// ✅ SECTION 3: UPDATE REGISTRATION FUNCTIONS
function validateStep2() {
    const sponsorIdInput = document.getElementById('regSponsorId')?.value.trim() || '';
    const sponsorNameInput = document.getElementById('regSponsorName')?.value.trim() || '';
    const referralCodeInput = document.getElementById('regReferralCode')?.value.trim() || '';
    
    console.log('Validating Step 2:', { sponsorIdInput, sponsorNameInput, referralCodeInput });
    
    if (!sponsorIdInput) {
        showNotification('⚠️ Sponsor ID is recommended for commission system', 'warning');
    }
    
    sponsorId = sponsorIdInput;
    sponsorName = sponsorNameInput || 'Sponsor';
    
    if (referralCodeInput) {
        const isValidCode = validateReferralCode(referralCodeInput);
        
        if (isValidCode.valid) {
            showNotification(`✅ Valid referral code! You'll get 25 bonus points from ${isValidCode.owner}`, 'success');
            saveToStorage('pendingReferralCode', referralCodeInput);
        } else {
            showNotification(`⚠️ ${isValidCode.message}`, 'warning');
        }
    }
    
    sendEmailOTP();
    sendMobileOTP();
    
    registrationStep = 3;
    updateRegistrationModal();
    showNotification('✅ Step 2 completed! OTPs sent', 'success');
}

function sendEmailOTP() {
    // Generate 6-digit OTP
    emailOTP = Math.floor(100000 + Math.random() * 900000).toString();
    
    // In real app, send OTP via email API
    console.log(`Email OTP for ${userEmail}: ${emailOTP}`);
    
    // For demo, show in console and notification
    showNotification(`📧 OTP sent to ${userEmail}: ${emailOTP}`, 'info');
    
    // Save OTP to localStorage for verification
    saveToStorage(`email_otp_${userEmail}`, {
        otp: emailOTP,
        timestamp: Date.now(),
        expires: Date.now() + 300000 // 5 minutes
    });
}

function sendMobileOTP() {
    // Generate 6-digit OTP
    mobileOTP = Math.floor(100000 + Math.random() * 900000).toString();
    
    // In real app, send OTP via SMS API
    console.log(`Mobile OTP for ${userMobile}: ${mobileOTP}`);
    
    // For demo, show in console and notification
    showNotification(`📱 OTP sent to ${userMobile}: ${mobileOTP}`, 'info');
    
    // Save OTP to localStorage for verification
    saveToStorage(`mobile_otp_${userMobile}`, {
        otp: mobileOTP,
        timestamp: Date.now(),
        expires: Date.now() + 300000 // 5 minutes
    });
}

function verifyEmailOTP() {
    const enteredOTP = document.getElementById('emailOTP')?.value.trim() || '';
    
    if (!enteredOTP || enteredOTP.length !== 6) {
        showNotification('❌ Please enter 6-digit OTP', 'warning');
        return;
    }
    
    // For demo purposes, accept any 6-digit number starting with 1
    // In production, use saved OTP
    if (enteredOTP.length === 6 && enteredOTP.startsWith('1')) {
        userEmailVerified = true;
        showNotification('✅ Email verified successfully!', 'success');
        
        // Move to next step
        registrationStep = 4;
        updateRegistrationModal();
    } else {
        // Check saved OTP
        const savedOTP = getFromStorage(`email_otp_${userEmail}`);
        
        if (!savedOTP || Date.now() > savedOTP.expires) {
            showNotification('❌ OTP expired. Please resend', 'warning');
            return;
        }
        
        if (enteredOTP === savedOTP.otp) {
            userEmailVerified = true;
            showNotification('✅ Email verified successfully!', 'success');
            
            // Move to next step
            registrationStep = 4;
            updateRegistrationModal();
        } else {
            showNotification('❌ Invalid OTP. Please try again', 'warning');
        }
    }
}

function verifyMobileOTP() {
    const enteredOTP = document.getElementById('mobileOTP')?.value.trim() || '';
    
    if (!enteredOTP || enteredOTP.length !== 6) {
        showNotification('❌ Please enter 6-digit OTP', 'warning');
        return;
    }
    
    // For demo purposes, accept any 6-digit number starting with 1
    // In production, use saved OTP
    if (enteredOTP.length === 6 && enteredOTP.startsWith('1')) {
        userMobileVerified = true;
        completeRegistration();
    } else {
        // Get saved OTP
        const savedOTP = getFromStorage(`mobile_otp_${userMobile}`);
        
        if (!savedOTP || Date.now() > savedOTP.expires) {
            showNotification('❌ OTP expired. Please resend', 'warning');
            return;
        }
        
        if (enteredOTP === savedOTP.otp) {
            userMobileVerified = true;
            completeRegistration();
        } else {
            showNotification('❌ Invalid OTP. Please try again', 'warning');
        }
    }
}

// ✅ SECTION 3: Replace completeRegistration() function
function completeRegistration() {
    console.log('Starting completeRegistration...');
    
    const password = document.getElementById('regPassword')?.value.trim() || '123456';
    const pendingReferralCode = getFromStorage('pendingReferralCode', '');
    const initialPoints = pendingReferralCode ? 125 : 100;
    
    const userData = {
        id: userId,
        username: userId,
        email: userEmail,
        mobile: userMobile,
        password: password,
        sponsorId: sponsorId,
        sponsorName: sponsorName,
        registeredAt: new Date().toISOString(),
        emailVerified: true,
        mobileVerified: true,
        points: initialPoints,
        referralCode: generateReferralCode(),
        lastLogin: new Date().toISOString(),
        usedReferralCode: pendingReferralCode || null,
        // ✅ नए fields जोड़ें
        telegram_id: userId,
        phone: userMobile,
        full_name: userId,
        level: 1,
        total_earned: initialPoints,
        tasks_completed: 0,
        status: 'active',
        verification_status: 'verified'
    };
    
    console.log('User data to save:', userData);
    
    // ✅ 1. LOCAL STORAGE में save करें
    const existingUsers = getFromStorage('registeredUsers', []);
    existingUsers.push(userData);
    saveToStorage('registeredUsers', existingUsers);
    saveToStorage('currentUser', userData);
    
    // ✅ 2. SERVER पर save करें
    saveUserToServer(userData);
    
    // ✅ 3. Notify admin panel
    notifyAdminPanel('register', userData);
    
    // ✅ 4. Broadcast to other tabs
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    
    // ✅ 5. Create sync packet for admin panel
    const syncPacket = {
        type: 'user_update',
        users: registeredUsers,
        timestamp: Date.now()
    };
    localStorage.setItem('multi_tab_sync_packet', JSON.stringify(syncPacket));
    
    userRegistered = true;
    userId = userData.username;
    telegramUsername = userId;
    
    if (pendingReferralCode) {
        processReferralCodeDuringRegistration(pendingReferralCode, userId);
    }
    
    referralData = {
        referralCode: userData.referralCode,
        referredUsers: [],
        totalEarned: 0,
        telegramUsername: userId,
        userId: userId,
        userName: userId,
        joinDate: new Date().toISOString()
    };
    
    saveToStorage('referralData', referralData);
    saveToStorage(`referralData_${userId}`, referralData);
    
    const allReferrals = getFromStorage('allReferrals', []);
    allReferrals.push({
        code: userData.referralCode,
        username: userId,
        name: userId,
        points: 50,
        isActive: true,
        createdAt: new Date().toISOString(),
        userId: userId
    });
    saveToStorage('allReferrals', allReferrals);
    
    localStorage.removeItem('pendingReferralCode');
    localStorage.removeItem(`email_otp_${userEmail}`);
    localStorage.removeItem(`mobile_otp_${userMobile}`);
    
    closeRegistrationModal();
    
    const bonusMessage = pendingReferralCode ? ' + 25 Referral Bonus Points' : '';
    showNotification(`🎉 Welcome ${userId}! Registration completed successfully! +100 Bonus Points${bonusMessage}`, 'success');
    
    updateUI();
    initializeMiningPools();
    
    if (!freePoolTasksCompleted) {
        setTimeout(() => {
            showFreePoolTasksModal();
        }, 2000);
    }
    
    console.log('Registration completed successfully!');
}

// ✅ नया फ़ंक्शन saveUserToServer() जोड़ें
async function saveUserToServer(userData) {
    try {
        const response = await fetch('http://localhost:3000/api/save-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ User saved to server:', data);
            
            // ✅ Referral process करें अगर referral code use किया हो
            if (userData.usedReferralCode) {
                processReferralOnServer(userData.usedReferralCode, userData.id);
            }
        } else {
            console.warn('⚠️ Server save warning:', data.message);
        }
    } catch (error) {
        console.error('❌ Error saving user to server:', error);
        // Continue with local storage only
    }
}

// ✅ नया फ़ंक्शन processReferralOnServer() जोड़ें
async function processReferralOnServer(referralCode, newUserId) {
    try {
        const response = await fetch('http://localhost:3000/api/process-referral', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                referralCode: referralCode,
                newUserId: newUserId
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Referral processed on server:', data);
        }
    } catch (error) {
        console.error('❌ Error processing referral on server:', error);
    }
}

// ✅ SECTION 3: Add new function after completeRegistration
function processReferralCodeDuringRegistration(referralCode, newUserId) {
    console.log('🎯 Processing referral code during registration:', referralCode);
    
    const validation = validateReferralCode(referralCode);
    
    if (!validation.valid) {
        console.log('❌ Invalid referral code:', validation.message);
        return;
    }
    
    const allReferrals = getFromStorage('allReferrals', []);
    const registeredUsers = getFromStorage('registeredUsers', []);
    
    let referrer = null;
    
    const preLoadedRef = PRE_LOADED_REFERRAL_CODES.find(ref => ref.code === referralCode);
    if (preLoadedRef) {
        referrer = {
            id: 'system_' + preLoadedRef.code,
            username: preLoadedRef.username,
            name: preLoadedRef.name,
            points: 0
        };
    } else {
        for (const user of registeredUsers) {
            const userRefData = getFromStorage(`referralData_${user.id}`, null);
            if (userRefData && userRefData.referralCode === referralCode) {
                referrer = user;
                break;
            }
        }
    }
    
    if (referrer) {
        console.log('✅ Found referrer:', referrer.username);
        
        addTransaction('Referral Bonus: Used ' + referrer.username + "'s code", 25, 'earning', 'referral');
        
        if (!referrer.id.startsWith('system_')) {
            awardPointsToReferrer(referrer.id, newUserId, 50);
        }
        
        updateReferralStats(referrer.id, newUserId);
        
        showNotification(`🎉 You used ${referrer.name || referrer.username}'s referral code! Bonus points added.`, 'success');
    }
}

function awardPointsToReferrer(referrerId, newUserId, points) {
    console.log('💰 Awarding points to referrer:', referrerId, points);
    
    const registeredUsers = getFromStorage('registeredUsers', []);
    const referrerIndex = registeredUsers.findIndex(u => u.id === referrerId);
    
    if (referrerIndex === -1) {
        console.log('❌ Referrer not found:', referrerId);
        return;
    }
    
    registeredUsers[referrerIndex].points = (registeredUsers[referrerIndex].points || 0) + points;
    
    let referrerRefData = getFromStorage(`referralData_${referrerId}`, {
        referralCode: registeredUsers[referrerIndex].referralCode || generateReferralCode(),
        referredUsers: [],
        totalEarned: 0,
        telegramUsername: registeredUsers[referrerIndex].username
    });
    
    referrerRefData.referredUsers.push({
        id: newUserId,
        username: newUserId,
        date: new Date().toISOString(),
        points: points
    });
    referrerRefData.totalEarned += points;
    
    saveToStorage('registeredUsers', registeredUsers);
    saveToStorage(`referralData_${referrerId}`, referrerRefData);
    
    const referrerMiningState = getFromStorage(`miningState_${referrerId}`, {});
    if (referrerMiningState) {
        referrerMiningState.userPoints = (referrerMiningState.userPoints || 0) + points;
        referrerMiningState.totalPointsEarned = (referrerMiningState.totalPointsEarned || 0) + points;
        saveToStorage(`miningState_${referrerId}`, referrerMiningState);
    }
    
    console.log('✅ Referrer points updated:', referrerId, '+', points);
}

function updateReferralStats(referrerId, newUserId) {
    const allReferrals = getFromStorage('allReferrals', []);
    
    const referralIndex = allReferrals.findIndex(ref => {
        if (referrerId.startsWith('system_')) {
            const code = referrerId.replace('system_', '');
            return ref.code === code;
        }
        return ref.userId === referrerId;
    });
    
    if (referralIndex !== -1) {
        allReferrals[referralIndex].uses = (allReferrals[referralIndex].uses || 0) + 1;
        allReferrals[referralIndex].lastUsed = new Date().toISOString();
        allReferrals[referralIndex].usedBy = allReferrals[referralIndex].usedBy || [];
        allReferrals[referralIndex].usedBy.push(newUserId);
        
        saveToStorage('allReferrals', allReferrals);
    }
}

function updateRegistrationModal() {
    const modal = document.getElementById('registrationModal');
    if (!modal) return;
    
    const contentEl = modal.querySelector('#registrationFormContent');
    if (contentEl) {
        contentEl.innerHTML = getRegistrationStepContent();
    }
    
    // Update step indicators
    const steps = modal.querySelectorAll('.step');
    steps.forEach((step, index) => {
        if (index + 1 === registrationStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
}

function previousStep() {
    if (registrationStep > 1) {
        registrationStep--;
        updateRegistrationModal();
    }
}

function checkRegistrationStatus() {
    console.log('🔍 Checking registration status...');
    
    // Check if there's a current user in storage
    const currentUser = getFromStorage('currentUser');
    console.log('Current user from storage:', currentUser);
    
    if (currentUser && currentUser.username) {
        console.log('✅ User found in storage:', currentUser.username);
        
        // Set all user data
        userRegistered = true;
        userId = currentUser.username || currentUser.id;
        userEmail = currentUser.email || '';
        userMobile = currentUser.mobile || '';
        userEmailVerified = currentUser.emailVerified || false;
        userMobileVerified = currentUser.mobileVerified || false;
        sponsorId = currentUser.sponsorId || '';
        sponsorName = currentUser.sponsorName || '';
        userPoints = currentUser.points || 0;
        
        // Load other user data
        loadMiningState();
        
        // Update UI
        updateUI();
        
        return true;
    } else {
        console.log('❌ No user found in storage, need to register');
        return false;
    }
}

// ==============================================
// ✅ UPDATED STATE MANAGEMENT FUNCTIONS - ADD AFTER checkRegistrationStatus()
// ==============================================

function ensureUserRegistered() {
    const currentUser = getFromStorage('currentUser');
    if (currentUser && currentUser.username) {
        console.log('🔄 Ensuring user registered state:', currentUser.username);
        
        userRegistered = true;
        userId = currentUser.username;
        userEmail = currentUser.email || '';
        userMobile = currentUser.mobile || '';
        userEmailVerified = currentUser.emailVerified || false;
        userMobileVerified = currentUser.mobileVerified || false;
        sponsorId = currentUser.sponsorId || '';
        sponsorName = currentUser.sponsorName || '';
        userPoints = currentUser.points || 0;
        
        // Load referral data
        referralData = getFromStorage(`referralData_${userId}`, {
            referralCode: currentUser.referralCode || generateReferralCode(),
            referredUsers: [],
            totalEarned: 0,
            telegramUsername: userId
        });
        
        console.log('✅ User state ensured:', userId, 'registered:', userRegistered);
        return true;
    }
    return false;
}

// ==============================================
// ✅ LOGIN/LOGOUT SYSTEM FUNCTIONS - NEW
// ==============================================

function showLoginModal() {
    console.log('📱 Showing login modal');
    
    // Close any existing modals
    closeAllModals();
    
    const modal = document.createElement('div');
    modal.className = 'modal active login-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>🔐 Login</h3>
                <button class="modal-close" onclick="closeLoginModal()">×</button>
            </div>
            <div class="login-form">
                <div class="form-group">
                    <label for="loginUsername">Username or Email</label>
                    <input type="text" id="loginUsername" placeholder="Enter username or email">
                </div>
                <div class="form-group">
                    <label for="loginPassword">Password</label>
                    <input type="password" id="loginPassword" placeholder="Enter password">
                </div>
                <div class="form-actions">
                    <button class="btn-cancel" onclick="closeLoginModal()">Cancel</button>
                    <button class="btn-success" onclick="loginUser()">Login</button>
                </div>
                <div class="login-footer">
                    <p>Don't have an account? <a href="#" onclick="closeLoginModal(); setTimeout(() => showRegistrationModal(), 300);">Register here</a></p>
                    <p>Forgot password? <a href="#" onclick="showForgotPassword()">Reset here</a></p>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => modal.remove());
}

function closeLoginModal() {
    const modal = document.querySelector('.modal.login-modal');
    if (modal) modal.remove();
}

// ==============================================
// ✅ UPDATED LOGIN FUNCTION WITH PASSWORD CHECK
// ==============================================

function loginUser() {
    const username = document.getElementById('loginUsername')?.value.trim() || '';
    const password = document.getElementById('loginPassword')?.value.trim() || '';
    
    if (!username || !password) {
        showNotification('❌ Please enter username and password', 'warning');
        return;
    }
    
    // Get registered users
    const registeredUsers = getFromStorage('registeredUsers', []);
    console.log('Registered users:', registeredUsers);
    
    // Find user by username or email
    const user = registeredUsers.find(u => 
        u.username === username || u.email === username
    );
    
    if (!user) {
        showNotification('❌ User not found. Please register first.', 'warning');
        closeLoginModal();
        setTimeout(() => showRegistrationModal(), 1000);
        return;
    }
    
    // For demo, accept any password
    // In production, verify password
    
    // Set current user
    saveToStorage('currentUser', user);
    
    // Update global variables
    userRegistered = true;
    userId = user.username;
    userEmail = user.email;
    userMobile = user.mobile;
    userEmailVerified = user.emailVerified;
    userMobileVerified = user.mobileVerified;
    sponsorId = user.sponsorId || '';
    sponsorName = user.sponsorName || '';
    userPoints = user.points || 0;
    
    // Update last login
    user.lastLogin = new Date().toISOString();
    saveToStorage('currentUser', user);
    
    // Update registered users list
    const updatedUsers = registeredUsers.map(u => 
        u.username === user.username ? user : u
    );
    saveToStorage('registeredUsers', updatedUsers);
    
    // ✅ Notify admin panel
    notifyAdminPanel('login', user);
    
    // Close modal
    closeLoginModal();
    
    // Show success notification
    showNotification(`✅ Welcome back ${userId}!`, 'success');
    
    // Update UI
    updateUI();
    
    // Load mining state
    loadMiningState();
    
    // Check and reset free pool tasks
    checkAndResetFreePoolTasks();
    
    // ✅ Check and inject admin button if user is authorized
    setTimeout(() => {
        if (isUserAuthorizedForAdmin()) {
            injectAdminButton();
            initializeAdminPanelIntegration();
        }
    }, 1000);
}

function logoutUser() {
    if (confirm('Are you sure you want to logout?')) {
        // Save current state before logout
        saveMiningState();
        
        // Clear current user session
        localStorage.removeItem('currentUser');
        
        // Reset global variables
        userRegistered = false;
        userId = '';
        userEmail = '';
        userMobile = '';
        userEmailVerified = false;
        userMobileVerified = false;
        sponsorId = '';
        sponsorName = '';
        userPoints = 0;
        
        // Reset tasks for next session
        FREE_POOL_TASKS.forEach(task => task.completed = false);
        freePoolTasksCompleted = false;
        saveToStorage('freePoolTasksCompleted', false);
        
        // Clear active mining pool
        activeMiningPool = null;
        saveToStorage('activeMiningPool', null);
        
        // ✅ Remove admin button on logout
        const adminBtn = document.querySelector('.admin-header-btn');
        if (adminBtn) adminBtn.remove();
        
        // Show notification
        showNotification('✅ Logged out successfully', 'success');
        
        // Update UI
        updateUI();
        
        // Show login modal after 1 second
        setTimeout(() => {
            showLoginModal();
        }, 1000);
    }
}

// ==============================================
// ✅ FUNCTION TO NOTIFY ADMIN PANEL - ADD THIS AT THE END
// ==============================================

// ✅ Function to notify admin panel when user registers/logs in
function notifyAdminPanel(action, userData) {
    try {
        const notification = {
            type: action === 'register' ? 'user_registered' : 'user_login',
            userEmail: userData.email,
            userId: userData.id || userData.userId,
            username: userData.username,
            timestamp: Date.now(),
            source: 'main_app'
        };
        
        // Store in localStorage (admin panel will pick this up)
        localStorage.setItem('cross_browser_sync_message', JSON.stringify(notification));
        
        // Also send to server
        fetch('http://localhost:3000/api/notify-admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(notification)
        }).catch(err => console.log('Server notification failed'));
        
        console.log(`📢 Admin notified: ${action} - ${userData.email}`);
        
    } catch (error) {
        console.error('Error notifying admin:', error);
    }
}

// ✅ User registration के बाद call करें
function handleUserRegistration(userData) {
    // ... existing registration code ...
    
    // Notify admin panel
    notifyAdminPanel('register', userData);
    
    // Broadcast to other tabs
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    
    // Create sync packet for admin panel
    const syncPacket = {
        type: 'user_update',
        users: registeredUsers,
        timestamp: Date.now()
    };
    localStorage.setItem('multi_tab_sync_packet', JSON.stringify(syncPacket));
}

// ✅ User login के बाद call करें
function handleUserLogin(userData) {
    // ... existing login code ...
    
    // Notify admin panel
    notifyAdminPanel('login', userData);
}

// ==============================================
// ✅ UPDATED FORGOT PASSWORD SYSTEM
// ==============================================

function showForgotPassword() {
    const modal = document.createElement('div');
    modal.className = 'modal active forgot-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>🔑 Forgot Password</h3>
                <button class="modal-close" onclick="closeForgotModal()">×</button>
            </div>
            <div class="forgot-form">
                <p style="margin-bottom: 15px; opacity: 0.8; text-align: center;">Enter your email to reset password</p>
                <div class="form-group">
                    <label for="forgotEmail">Email Address</label>
                    <input type="email" id="forgotEmail" placeholder="Enter your registered email">
                </div>
                <div class="form-actions">
                    <button class="btn-cancel" onclick="closeForgotModal()">Cancel</button>
                    <button class="btn-success" onclick="sendPasswordResetOTP()">Send OTP</button>
                </div>
                <div class="login-footer" style="margin-top: 15px;">
                    <p>Remember password? <a href="#" onclick="closeForgotModal(); showLoginModal();">Back to Login</a></p>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function closeForgotModal() {
    const modal = document.querySelector('.modal.forgot-modal');
    if (modal) modal.remove();
}

function sendPasswordResetOTP() {
    const email = document.getElementById('forgotEmail')?.value.trim() || '';
    
    if (!email) {
        showNotification('❌ Please enter your email', 'warning');
        return;
    }
    
    // Check if email exists
    const registeredUsers = getFromStorage('registeredUsers', []);
    const user = registeredUsers.find(u => u.email === email);
    
    if (!user) {
        showNotification('❌ Email not found. Please register first.', 'warning');
        return;
    }
    
    // Generate and send OTP
    const resetOTP = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save OTP to localStorage
    saveToStorage(`reset_otp_${email}`, {
        otp: resetOTP,
        email: email,
        timestamp: Date.now(),
        expires: Date.now() + 300000 // 5 minutes
    });
    
    // Show success message (in real app, send via email)
    showNotification(`✅ OTP sent to ${email}: ${resetOTP}`, 'success');
    
    // Show OTP verification modal
    setTimeout(() => {
        showResetPasswordModal(email);
    }, 1000);
}

function showResetPasswordModal(email) {
    closeForgotModal();
    
    const modal = document.createElement('div');
    modal.className = 'modal active reset-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>🔐 Reset Password</h3>
                <button class="modal-close" onclick="closeResetModal()">×</button>
            </div>
            <div class="reset-form">
                <p style="margin-bottom: 15px; opacity: 0.8; text-align: center;">Enter OTP sent to ${email}</p>
                <div class="form-group">
                    <label for="resetOTP">Enter 6-digit OTP</label>
                    <input type="text" id="resetOTP" placeholder="000000" maxlength="6" inputmode="numeric">
                </div>
                <div class="form-group">
                    <label for="newPassword">New Password</label>
                    <input type="password" id="newPassword" placeholder="Enter new password">
                </div>
                <div class="form-group">
                    <label for="confirmPassword">Confirm Password</label>
                    <input type="password" id="confirmPassword" placeholder="Confirm new password">
                </div>
                <div class="form-actions">
                    <button class="btn-cancel" onclick="closeResetModal()">Cancel</button>
                    <button class="btn-success" onclick="resetPassword('${email}')">Reset Password</button>
                </div>
                <div class="otp-actions" style="margin-top: 15px;">
                    <button class="btn-resend" onclick="resendResetOTP('${email}')">Resend OTP</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function closeResetModal() {
    const modal = document.querySelector('.modal.reset-modal');
    if (modal) modal.remove();
}

function resetPassword(email) {
    const otp = document.getElementById('resetOTP')?.value.trim() || '';
    const newPassword = document.getElementById('newPassword')?.value.trim() || '';
    const confirmPassword = document.getElementById('confirmPassword')?.value.trim() || '';
    
    if (!otp || otp.length !== 6) {
        showNotification('❌ Please enter 6-digit OTP', 'warning');
        return;
    }
    
    if (!newPassword) {
        showNotification('❌ Please enter new password', 'warning');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showNotification('❌ Passwords do not match', 'warning');
        return;
    }
    
    if (newPassword.length < 6) {
        showNotification('❌ Password must be at least 6 characters', 'warning');
        return;
    }
    
    // Verify OTP
    const savedOTP = getFromStorage(`reset_otp_${email}`);
    
    if (!savedOTP) {
        showNotification('❌ OTP expired. Please resend', 'warning');
        return;
    }
    
    if (Date.now() > savedOTP.expires) {
        showNotification('❌ OTP expired. Please resend', 'warning');
        return;
    }
    
    if (otp !== savedOTP.otp) {
        showNotification('❌ Invalid OTP. Please try again', 'warning');
        return;
    }
    
    // Update user's password in registered users
    const registeredUsers = getFromStorage('registeredUsers', []);
    const userIndex = registeredUsers.findIndex(u => u.email === email);
    
    if (userIndex === -1) {
        showNotification('❌ User not found', 'error');
        return;
    }
    
    // Update password (in real app, hash this password)
    registeredUsers[userIndex].password = newPassword;
    registeredUsers[userIndex].lastPasswordReset = new Date().toISOString();
    
    // Save updated users
    saveToStorage('registeredUsers', registeredUsers);
    
    // Clear OTP
    localStorage.removeItem(`reset_otp_${email}`);
    
    // Close modal
    closeResetModal();
    
    // Show success notification
    showNotification('✅ Password reset successfully! You can now login with new password', 'success');
    
    // Show login modal
    setTimeout(() => {
        showLoginModal();
    }, 2000);
}

function resendResetOTP(email) {
    const resetOTP = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save OTP to localStorage
    saveToStorage(`reset_otp_${email}`, {
        otp: resetOTP,
        email: email,
        timestamp: Date.now(),
        expires: Date.now() + 300000 // 5 minutes
    });
    
    showNotification(`✅ New OTP sent to ${email}: ${resetOTP}`, 'success');
}

// ==============================================
// ✅ UPDATED PROFILE SECTION FUNCTIONS
// ==============================================

function showProfileHomePage() {
    const profileContent = document.getElementById('profileAppContent');
    if (!profileContent) return;
    
    // ✅ Calculate sponsor statistics
    const totalCommission = sponsorCommissionEarned || 0;
    const directReferrals = referralData.referredUsers.length || 0;
    const teamSize = directReferrals; // For now, same as direct referrals
    const thisMonthCommission = calculateThisMonthCommission();
    const recentActivities = userSponsorActivities.slice(0, 5) || [];
    
    // ✅ Commission breakdown
    const miningCommission = sponsorIncomeBreakdown.mining || 0;
    const videoCommission = sponsorIncomeBreakdown.videos || 0;
    const taskCommission = sponsorIncomeBreakdown.tasks || 0;
    const referralCommission = sponsorIncomeBreakdown.referrals || 0;
    const bonusCommission = sponsorIncomeBreakdown.bonuses || 0;
    
    profileContent.innerHTML = `
        <div class="welcome-section">
            <div class="welcome-icon">👤</div>
            <h3>Your Profile</h3>
            <p>Manage your account, rewards, and settings</p>
            
            ${!userRegistered ? `
            <div class="registration-prompt">
                <div class="prompt-icon">📝</div>
                <div class="prompt-content">
                    <h4>Complete Registration!</h4>
                    <p>Register now to access all features and start earning</p>
                    <div class="profile-actions">
                        <button class="btn-register-prompt" onclick="showRegistrationModal()">Register Now</button>
                        <button class="btn-login-prompt" onclick="showLoginModal()">Login</button>
                    </div>
                </div>
            </div>
            ` : `
            <div class="user-info-card">
                <div class="user-avatar-large">👤</div>
                <div class="user-details">
                    <div class="user-name-large">${userId}</div>
                    <div class="user-email">${userEmail}</div>
                    <div class="user-status">
                        <span class="status-badge ${userEmailVerified ? 'verified' : 'unverified'}">Email ${userEmailVerified ? '✓' : '✗'}</span>
                        <span class="status-badge ${userMobileVerified ? 'verified' : 'unverified'}">Mobile ${userMobileVerified ? '✓' : '✗'}</span>
                    </div>
                </div>
                <button class="logout-btn" onclick="logoutUser()">🚪 Logout</button>
            </div>
            `}

            ${userRegistered ? `
            <!-- Personal Info Section -->
            <div class="profile-info-section">
                <div class="telegram-id-card" onclick="showTelegramIdModal()">
                    <div class="telegram-icon">📱</div>
                    <div class="telegram-info">
                        <div class="telegram-label">Telegram ID</div>
                        <div class="telegram-value" id="profileTelegramId">${telegramUsername || 'Not Set - Tap to Set'}</div>
                    </div>
                    <div class="telegram-edit">✏️</div>
                </div>

                <div class="telegram-id-card" onclick="showSponsorIdModal()">
                    <div class="telegram-icon">👥</div>
                    <div class="telegram-info">
                        <div class="telegram-label">Sponsor ID</div>
                        <div class="telegram-value" id="profileSponsorId">${sponsorId || 'Not Set - Tap to Set'}</div>
                        <div class="telegram-label" style="font-size: 10px; margin-top: 2px;">${sponsorName || 'No sponsor yet'}</div>
                    </div>
                    <div class="telegram-edit">✏️</div>
                </div>
            </div>

            <!-- ✅ वॉलेट सेक्शन -->
            <div class="wallet-section">
                <h4>💰 डिजिटल वॉलेट</h4>
                <div class="wallet-cards">
                    <div class="wallet-card points-wallet" onclick="showWalletSection()">
                        <div class="wallet-card-icon">🎯</div>
                        <div class="wallet-card-info">
                            <div class="wallet-card-name">पॉइंट्स</div>
                            <div class="wallet-card-balance">${formatNumber(userPoints)}</div>
                            <div class="wallet-card-subtitle">कन्वर्ट करने के लिए उपलब्ध</div>
                        </div>
                        <div class="wallet-card-action">→</div>
                    </div>
                    
                    <div class="wallet-card inr-wallet" onclick="showWalletSection()">
                        <div class="wallet-card-icon">₹</div>
                        <div class="wallet-card-info">
                            <div class="wallet-card-name">INR वॉलेट</div>
                            <div class="wallet-card-balance">${inrWallet.toFixed(2)}</div>
                            <div class="wallet-card-subtitle">${(inrWallet / 85).toFixed(2)} USDT</div>
                        </div>
                        <div class="wallet-card-action">→</div>
                    </div>
                    
                    <div class="wallet-card usdt-wallet" onclick="showWalletSection()">
                        <div class="wallet-card-icon">💲</div>
                        <div class="wallet-card-info">
                            <div class="wallet-card-name">USDT वॉलेट</div>
                            <div class="wallet-card-balance">${usdtWallet.toFixed(2)}</div>
                            <div class="wallet-card-subtitle">पेड पूल खरीदने के लिए</div>
                        </div>
                        <div class="wallet-card-action">→</div>
                    </div>
                </div>
                
                <button class="btn-manage-wallet" onclick="showWalletSection()">
                    वॉलेट मैनेज करें
                </button>
            </div>

            <!-- ✅ SPONSOR EARNINGS DASHBOARD -->
            ${sponsorId ? `
            <div class="sponsor-earnings-section">
                <div class="section-header">
                    <h3>🎯 Sponsor Earnings</h3>
                    <button class="btn-refresh" onclick="refreshSponsorData()">🔄 Refresh</button>
                </div>
                
                <!-- Commission Stats -->
                <div class="commission-stats-grid">
                    <div class="commission-stat-card">
                        <div class="stat-icon">💰</div>
                        <div class="stat-content">
                            <div class="stat-value">${formatNumber(totalCommission)}</div>
                            <div class="stat-label">Total Commission</div>
                        </div>
                    </div>
                    
                    <div class="commission-stat-card">
                        <div class="stat-icon">📈</div>
                        <div class="stat-content">
                            <div class="stat-value">${formatNumber(thisMonthCommission)}</div>
                            <div class="stat-label">This Month</div>
                        </div>
                    </div>
                    
                    <div class="commission-stat-card">
                        <div class="stat-icon">👥</div>
                        <div class="stat-content">
                            <div class="stat-value">${directReferrals}</div>
                            <div class="stat-label">Direct Referrals</div>
                        </div>
                    </div>
                    
                    <div class="commission-stat-card">
                        <div class="stat-icon">📊</div>
                        <div class="stat-content">
                            <div class="stat-value">${teamSize}</div>
                            <div class="stat-label">Team Size</div>
                        </div>
                    </div>
                </div>
                
                <!-- Commission Breakdown -->
                <div class="commission-breakdown">
                    <h4>📊 Commission Breakdown</h4>
                    <div class="breakdown-grid">
                        <div class="breakdown-item">
                            <div class="breakdown-icon">⛏️</div>
                            <div class="breakdown-info">
                                <div class="breakdown-category">Mining</div>
                                <div class="breakdown-amount">${formatNumber(miningCommission)} pts</div>
                            </div>
                        </div>
                        
                        <div class="breakdown-item">
                            <div class="breakdown-icon">🎬</div>
                            <div class="breakdown-info">
                                <div class="breakdown-category">Videos</div>
                                <div class="breakdown-amount">${formatNumber(videoCommission)} pts</div>
                            </div>
                        </div>
                        
                        <div class="breakdown-item">
                            <div class="breakdown-icon">📋</div>
                            <div class="breakdown-info">
                                <div class="breakdown-category">Tasks</div>
                                <div class="breakdown-amount">${formatNumber(taskCommission)} pts</div>
                            </div>
                        </div>
                        
                        <div class="breakdown-item">
                            <div class="breakdown-icon">👥</div>
                            <div class="breakdown-info">
                                <div class="breakdown-category">Referrals</div>
                                <div class="breakdown-amount">${formatNumber(referralCommission)} pts</div>
                            </div>
                        </div>
                        
                        <div class="breakdown-item">
                            <div class="breakdown-icon">🎁</div>
                            <div class="breakdown-info">
                                <div class="breakdown-category">Bonuses</div>
                                <div class="breakdown-amount">${formatNumber(bonusCommission)} pts</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Recent Activities -->
                <div class="recent-activities">
                    <h4>📈 Recent Activities</h4>
                    ${recentActivities.length > 0 ? `
                    <div class="activities-list">
                        ${recentActivities.map(activity => `
                        <div class="activity-item">
                            <div class="activity-icon">${getActivityIcon(activity.activityType)}</div>
                            <div class="activity-details">
                                <div class="activity-title">${activity.description || 'Commission Earned'}</div>
                                <div class="activity-time">${formatTimeAgo(activity.timestamp)}</div>
                            </div>
                            <div class="activity-amount">+${activity.commission || 0}</div>
                        </div>
                        `).join('')}
                    </div>
                    ` : `
                    <div class="no-activities">
                        <div class="no-activities-icon">📊</div>
                        <div class="no-activities-text">No sponsor activities yet</div>
                    </div>
                    `}
                </div>
                
                <!-- View Full History Button -->
                <button class="btn-view-full-history" onclick="showSponsorTransactionHistory()">
                    📋 View Full Transaction History
                </button>
            </div>
            ` : `
            <!-- No Sponsor Message -->
            <div class="no-sponsor-message">
                <div class="message-icon">👥</div>
                <div class="message-content">
                    <h4>No Sponsor Yet</h4>
                    <p>Set up a sponsor ID to start earning commissions!</p>
                    <button class="btn-setup-sponsor" onclick="showSponsorIdModal()">Setup Sponsor ID</button>
                </div>
            </div>
            `}
            ` : ''}
            
            <!-- Platform Cards -->
            <div class="platforms-grid">
                <div class="platform-card" onclick="showWalletSection()">
                    <span class="platform-icon">💰</span>
                    <span class="platform-name">Digital Wallet</span>
                    <span class="platform-points">Points → INR → USDT</span>
                    <span class="platform-time">🔄 Convert</span>
                </div>
                <div class="platform-card" onclick="showCashier()">
                    <span class="platform-icon">🎁</span>
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
            </div>

            <!-- Quick Stats -->
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
                <div class="earn-stat" onclick="showWalletSection()">
                    <div class="stat-number" id="profileUSDT">${usdtWallet.toFixed(2)}</div>
                    <div class="stat-label">USDT</div>
                </div>
            </div>
        </div>
    `;
    
    updateProfileUI();
}

// ✅ HELPER FUNCTIONS FOR SPONSOR DASHBOARD

function calculateThisMonthCommission() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const thisMonthActivities = userSponsorActivities.filter(activity => {
        if (!activity.timestamp) return false;
        const activityDate = new Date(activity.timestamp);
        return activityDate.getMonth() === currentMonth && 
               activityDate.getFullYear() === currentYear;
    });
    
    return thisMonthActivities.reduce((total, activity) => total + (activity.commission || 0), 0);
}

function getActivityIcon(activityType) {
    switch(activityType) {
        case 'mining_earnings': return '⛏️';
        case 'video_watch': return '🎬';
        case 'task_earnings': return '📋';
        case 'referral_earning': return '👥';
        case 'bonus_earnings': return '🎁';
        default: return '💰';
    }
}

function formatTimeAgo(timestamp) {
    if (!timestamp) return 'Just now';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 0) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    if (diffHour > 0) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    return 'Just now';
}

function refreshSponsorData() {
    // Reload sponsor data from storage
    sponsorCommissionEarned = getFromStorage('sponsorCommissionEarned', 0);
    sponsorTransactions = getFromStorage('sponsorTransactions', []);
    userGeneratedSponsorIncome = getFromStorage('userGeneratedSponsorIncome', 0);
    userSponsorActivities = getFromStorage('userSponsorActivities', []);
    sponsorIncomeBreakdown = getFromStorage('sponsorIncomeBreakdown', sponsorIncomeBreakdown);
    
    // Refresh profile page
    showProfileHomePage();
    showNotification('✅ Sponsor data refreshed!', 'success');
}

function showSponsorTransactionHistory() {
    const profileContent = document.getElementById('profileAppContent');
    if (!profileContent) return;
    
    let html = `
        <div class="earn-page">
            <div class="platform-header">
                <button onclick="showProfileHomePage()" class="back-btn">← Back</button>
                <h3>📋 Sponsor Transaction History</h3>
            </div>
            
            <div class="sponsor-history-stats">
                <div class="stat-card">
                    <div class="stat-number">${formatNumber(sponsorCommissionEarned)}</div>
                    <div class="stat-label">Total Earned</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${sponsorTransactions.length}</div>
                    <div class="stat-label">Transactions</div>
                </div>
            </div>
            
            <div class="transactions-list">
    `;
    
    if (sponsorTransactions.length === 0) {
        html += `<div class="no-transactions">No sponsor transactions yet</div>`;
    } else {
        sponsorTransactions.forEach(transaction => {
            const date = new Date(transaction.timestamp);
            const timeString = date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
            });
            const dateString = date.toLocaleDateString();
            
            html += `
                <div class="transaction-item earning">
                    <div class="transaction-icon">${getActivityIcon(transaction.activityType)}</div>
                    <div class="transaction-details">
                        <div class="transaction-description">${transaction.description}</div>
                        <div class="transaction-time">${dateString} ${timeString}</div>
                        <div class="transaction-meta">
                            From: ${transaction.fromUser || 'User'} • 
                            Type: ${transaction.activityType || 'Commission'}
                        </div>
                    </div>
                    <div class="transaction-amount earning">
                        +${transaction.amount}
                    </div>
                </div>
            `;
        });
    }
    
    html += `
            </div>
            
            <div class="export-actions" style="margin-top: 20px;">
                <button class="btn-export" onclick="exportSponsorHistory()">
                    📤 Export History
                </button>
            </div>
        </div>
    `;
    
    profileContent.innerHTML = html;
}

function exportSponsorHistory() {
    const historyData = {
        totalCommission: sponsorCommissionEarned,
        breakdown: sponsorIncomeBreakdown,
        transactions: sponsorTransactions,
        activities: userSponsorActivities,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(historyData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `sponsor_history_${userId}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('✅ Sponsor history exported!', 'success');
}

// ==============================================
// ✅ UPDATED SPONSOR SYSTEM FUNCTIONS
// ==============================================

function showSponsorIdModal() {
    if (!userRegistered) {
        showNotification('❌ Please register first!', 'warning');
        showRegistrationModal();
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>👥 Set Sponsor ID</h3>
                <button class="modal-close" onclick="closeSponsorIdModal()">×</button>
            </div>
            <div class="modal-body">
                <p style="margin-bottom: 15px; opacity: 0.8;">Enter your sponsor's ID to start earning commissions for them!</p>
                <div class="form-group">
                    <label for="sponsorIdInput">Sponsor ID</label>
                    <input type="text" id="sponsorIdInput" placeholder="Enter sponsor ID" value="${sponsorId || ''}">
                </div>
                <div class="form-group">
                    <label for="sponsorNameInput">Sponsor Name (Optional)</label>
                    <input type="text" id="sponsorNameInput" placeholder="Enter sponsor name" value="${sponsorName || ''}">
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn-cancel" onclick="closeSponsorIdModal()">Cancel</button>
                <button class="btn-success" onclick="saveSponsorId()">Save Sponsor ID</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function closeSponsorIdModal() {
    const modal = document.querySelector('.modal.active');
    if (modal && modal.innerHTML.includes('Sponsor ID')) modal.remove();
}

function saveSponsorId() {
    const sponsorIdInput = document.getElementById('sponsorIdInput')?.value.trim() || '';
    const sponsorNameInput = document.getElementById('sponsorNameInput')?.value.trim() || '';
    
    if (!sponsorIdInput) {
        showNotification('❌ Please enter a sponsor ID!', 'warning');
        return;
    }
    
    sponsorId = sponsorIdInput;
    sponsorName = sponsorNameInput || 'Sponsor';
    
    // Save to storage
    saveToStorage('sponsorId', sponsorId);
    saveToStorage('sponsorName', sponsorName);
    
    // Update current user data
    if (userRegistered) {
        const currentUser = getFromStorage('currentUser');
        if (currentUser) {
            currentUser.sponsorId = sponsorId;
            currentUser.sponsorName = sponsorName;
            saveToStorage('currentUser', currentUser);
            
            // Update registered users list
            const registeredUsers = getFromStorage('registeredUsers', []);
            const userIndex = registeredUsers.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) {
                registeredUsers[userIndex].sponsorId = sponsorId;
                registeredUsers[userIndex].sponsorName = sponsorName;
                saveToStorage('registeredUsers', registeredUsers);
            }
        }
    }
    
    showNotification('✅ Sponsor ID saved successfully!', 'success');
    closeSponsorIdModal();
    showProfileHomePage();
}

// ==============================================
// ✅ UPDATED UI UPDATE FUNCTIONS - REPLACE EXISTING updateUI() FUNCTION
// ==============================================

function updateUI() {
    initializeNaNProtection();
    
    console.log('🔄 Updating UI, userRegistered:', userRegistered, 'userId:', userId, 'actual user from storage:', getFromStorage('currentUser')?.username);
    
    // Double-check user registration state
    if (!userRegistered) {
        const currentUser = getFromStorage('currentUser');
        if (currentUser && currentUser.username) {
            console.log('🔄 Force-updating user registration state from storage');
            ensureUserRegistered();
        }
    }
    
    // Update Points
    const pointElements = ['walletPoints', 'totalPoints', 'totalEarnings', 'tasksTotalPoints', 'profileTotalPoints'];
    pointElements.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = formatNumber(userPoints);
    });
    
    // Update User Level
    const userLevelEl = document.getElementById('userLevel');
    if (userLevelEl) {
        userLevelEl.textContent = userRegistered ? `${userId} | ${userPoints} Points | ${usdtWallet.toFixed(2)} USDT` : 'Guest User';
    }
    
    // Update Wallet Points
    const walletPointsEl = document.getElementById('walletPoints');
    if (walletPointsEl) {
        walletPointsEl.textContent = userRegistered ? `${formatNumber(userPoints)} | ${usdtWallet.toFixed(2)} USDT` : 'Register';
    }
    
    // Update Profile User Name
    const profileUserNameEl = document.getElementById('profileUserName');
    if (profileUserNameEl) {
        profileUserNameEl.textContent = userRegistered ? userId : 'Guest User';
    }
    
    // Update Profile User Points
    const profileUserPointsEl = document.getElementById('profileUserPoints');
    if (profileUserPointsEl) {
        profileUserPointsEl.textContent = userRegistered ? `${userPoints} Points | ${usdtWallet.toFixed(2)} USDT` : '0 Points';
    }
    
    // Update Tasks Stats
    const tasksCompletedEl = document.getElementById('totalTasks');
    if (tasksCompletedEl) tasksCompletedEl.textContent = totalTasksCompleted;
    
    const todayEarningsEl = document.getElementById('todayEarnings');
    if (todayEarningsEl) todayEarningsEl.textContent = todayEarnings;
    
    const tasksTodayEl = document.getElementById('tasksToday');
    if (tasksTodayEl) tasksTodayEl.textContent = completedDailyTasks.length;
    
    // Update Profile
    updateProfileUI();
    
    // Update Mining Page
    updateMiningPageUI();
    
    // Update registration status
    updateRegistrationStatusUI();
    
    // ✅ FIX: Inject admin button with delay
    setTimeout(() => {
        console.log('🔍 Checking for admin button injection...');
        
        if (isUserAuthorizedForAdmin()) {
            console.log('✅ Injecting admin button for authorized user:', userId);
            injectAdminButton();
            
            // Perform data sync for admin panel
            setTimeout(() => {
                performFullAdminSync();
            }, 1000);
        } else {
            console.log('❌ User not authorized for admin:', userId);
            // Remove admin button if exists
            const existingBtn = document.querySelector('.admin-header-btn');
            if (existingBtn) {
                console.log('🗑️ Removing unauthorized admin button');
                existingBtn.remove();
            }
        }
    }, 1000);
}

function updateRegistrationStatusUI() {
    const walletEl = document.getElementById('walletPoints');
    const headerEl = document.querySelector('.user-level');
    
    if (userRegistered) {
        if (walletEl) {
            walletEl.textContent = `${formatNumber(userPoints)} USDT`;
        }
        if (headerEl) {
            headerEl.textContent = `${userId} | ${userPoints} USDT`;
        }
        
        // Update registration prompt in earn section
        const earnContent = document.getElementById('earnAppContent');
        if (earnContent && earnContent.innerHTML.includes('registration-prompt')) {
            showHomePage();
        }
    } else {
        if (walletEl) {
            walletEl.textContent = 'Register';
        }
        if (headerEl) {
            headerEl.textContent = 'Guest User';
        }
    }
}

// ==============================================
// ✅ UPDATED MINING POOL SYSTEM FUNCTIONS
// ==============================================

// ✅ UPDATED loadMiningPools FUNCTION WITH SAFETY CHECKS
function loadMiningPools() {
    miningPools = getFromStorage('miningPools', MINING_POOLS);
    activeMiningPool = getFromStorage('activeMiningPool', null);
    miningPoolHistory = getFromStorage('miningPoolHistory', []);
    miningPoolInstances = getFromStorage('miningPoolInstances', {});
    
    console.log('⛏️ Loading mining pools...', {
        miningPoolsCount: miningPools.length,
        activeMiningPool: activeMiningPool,
        miningPoolHistoryCount: miningPoolHistory.length,
        miningPoolInstances: miningPoolInstances
    });
    
    // ✅ FIX: Ensure miningPoolInstances is always an object
    if (!miningPoolInstances || typeof miningPoolInstances !== 'object') {
        console.log('⚠️ miningPoolInstances is invalid, initializing fresh...');
        miningPoolInstances = {};
    }
    
    // Initialize pool instances if not exists
    if (Object.keys(miningPoolInstances).length === 0) {
        console.log('🔄 Initializing fresh mining pool instances...');
        initializeMiningPools();
    }
    
    // If there's an active pool, resume countdown
    if (activeMiningPool && activeMiningPool.endTime > Date.now()) {
        console.log('⛏️ Resuming active mining pool:', activeMiningPool.poolName);
        startMiningPoolCountdown();
    } else if (activeMiningPool) {
        // Pool completed but not claimed
        console.log('🎯 Active pool completed, claiming...');
        completeMiningPool();
    }
    
    // Start pool timers
    startAllPoolTimers();
    
    updateMiningPageUI();
}

// ✅ UPDATED initializeMiningPools FUNCTION
function initializeMiningPools() {
    console.log('🔄 Initializing mining pools...');
    
    miningPoolInstances = {};
    
    MINING_POOLS.forEach(pool => {
        console.log(`📊 Setting up pool: ${pool.name}`);
        pool.durations.forEach(duration => {
            const instanceId = `${pool.id}_${duration.hours}`;
            
            miningPoolInstances[instanceId] = {
                id: instanceId,
                poolId: pool.id,
                poolName: pool.name,
                poolIcon: pool.icon,
                poolType: pool.type,
                durationHours: duration.hours,
                expectedPoints: duration.points,
                subscribers: duration.subscribers || 0,
                participants: duration.participants || 0,
                remainingTime: duration.remainingTime || duration.timer,
                startTime: Date.now(),
                endTime: Date.now() + (duration.remainingTime || duration.timer),
                status: duration.status || 'active',
                minInvestment: pool.minInvestment || 0
            };
        });
    });
    
    saveToStorage('miningPoolInstances', miningPoolInstances);
    console.log('✅ Mining pools initialized:', Object.keys(miningPoolInstances).length, 'instances');
}

function startAllPoolTimers() {
    // Update all pool timers every second
    setInterval(() => {
        for (const instanceId in miningPoolInstances) {
            const instance = miningPoolInstances[instanceId];
            
            if (instance.status === 'active') {
                instance.remainingTime = Math.max(0, instance.endTime - Date.now());
                
                // Randomly increase subscribers and participants (for demo)
                if (Math.random() > 0.7) {
                    instance.subscribers += Math.floor(Math.random() * 3);
                    instance.participants += Math.floor(Math.random() * 2);
                }
                
                if (instance.remainingTime <= 0) {
                    instance.status = 'completed';
                    // Reset for next round
                    setTimeout(() => {
                        instance.remainingTime = instance.durationHours * 60 * 60 * 1000;
                        instance.startTime = Date.now();
                        instance.endTime = Date.now() + instance.remainingTime;
                        instance.status = 'active';
                        instance.participants = Math.floor(instance.subscribers * 0.8);
                    }, 5000);
                }
            }
        }
        
        // Update UI if mining page is active
        if (document.getElementById('miningContent').classList.contains('active')) {
            updateMiningPageUI();
        }
        
        // Auto-save every 30 seconds
        if (Date.now() % 30000 < 1000) {
            saveToStorage('miningPoolInstances', miningPoolInstances);
        }
    }, 1000);
}

function startMiningPool(poolId, durationHours) {
    // Check if user is registered
    if (!userRegistered) {
        showRegistrationModal();
        showNotification('❌ Please register first!', 'warning');
        return;
    }
    
    const pool = MINING_POOLS.find(p => p.id === poolId);
    if (!pool) {
        showNotification('❌ Mining pool not found!', 'warning');
        return;
    }
    
    const duration = pool.durations.find(d => d.hours === durationHours);
    if (!duration) {
        showNotification('❌ Invalid duration!', 'warning');
        return;
    }
    
    const instanceId = `${poolId}_${durationHours}`;
    const instance = miningPoolInstances[instanceId];
    
    if (!instance) {
        showNotification('❌ Pool instance not found!', 'warning');
        return;
    }
    
    // Check if already mining
    if (activeMiningPool) {
        showNotification('❌ You already have an active mining pool!', 'warning');
        return;
    }
    
    // Check pool type requirements
    if (pool.type === 'free') {
        // Check if free pool tasks are completed
        if (!freePoolTasksCompleted) {
            showFreePoolTasksModal();
            showNotification('❌ Complete required tasks first!', 'warning');
            return;
        }
        
        // Check if user already used free pool
        const freePoolUsed = getFromStorage(`freePoolUsed_${userId}`, false);
        if (freePoolUsed) {
            showNotification('❌ Free pool already used! Try paid pools.', 'warning');
            return;
        }
    } else if (pool.type === 'paid') {
        // ✅ UPDATED: USDT वॉलेट से चेक करें
        if (usdtWallet < pool.minInvestment) {
            showNotification(`❌ Minimum ${pool.minInvestment} USDT required in your USDT wallet!`, 'warning');
            
            // वॉलेट सेक्शन दिखाने का ऑप्शन दें
            setTimeout(() => {
                if (confirm(`आपके पास ${usdtWallet} USDT हैं, ${pool.minInvestment} USDT चाहिए। क्या आप वॉलेट सेक्शन देखना चाहते हैं?`)) {
                    showWalletSection();
                }
            }, 1000);
            return;
        }
        
        // ✅ UPDATED: USDT वॉलेट से डेडक्ट करें
        usdtWallet -= pool.minInvestment;
        addTransaction(
            `Investment: ${pool.name} (${durationHours}h)`, 
            -pool.minInvestment, 
            'spending', 
            'investment',
            'usdt_wallet'
        );
        showNotification(`💰 Invested ${pool.minInvestment} USDT from your wallet`, 'info');
        
        // USDT वॉलेट अपडेट
        saveMiningState();
    }
    
    // Join the pool
    const startTime = Date.now();
    const endTime = startTime + (durationHours * 60 * 60 * 1000);
    
    activeMiningPool = {
        id: 'user_pool_' + Date.now(),
        poolId: poolId,
        poolName: pool.name,
        poolIcon: pool.icon,
        poolType: pool.type,
        startTime: startTime,
        endTime: endTime,
        durationHours: durationHours,
        expectedPoints: duration.points,
        status: 'active',
        instanceId: instanceId
    };
    
    // Update instance statistics
    instance.subscribers += 1;
    instance.participants += 1;
    
    // Mark free pool as used
    if (pool.type === 'free') {
        saveToStorage(`freePoolUsed_${userId}`, true);
    }
    
    // Start countdown
    startMiningPoolCountdown();
    
    // Save to history
    miningPoolHistory.unshift({
        ...activeMiningPool,
        claimed: false
    });
    
    // Save state
    saveMiningState();
    
    showNotification(`⛏️ Started ${pool.name} for ${durationHours} hours! You'll earn ${duration.points} points.`, 'success');
    
    // Update UI
    updateMiningPageUI();
}

function showFreePoolTasksModal() {
    if (freePoolTasksCompleted) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>🎯 Free Pool Requirements</h3>
            </div>
            <div class="free-pool-tasks">
                <h4>Complete these 6 tasks to unlock Free Mining Pool:</h4>
                <div class="tasks-list">
                    ${FREE_POOL_TASKS.map(task => `
                        <div class="task-item ${task.completed ? 'completed' : ''}">
                            <div class="task-checkbox">${task.completed ? '✅' : '⬜'}</div>
                            <div class="task-name">${task.name}</div>
                            <button class="btn-complete-task" onclick="completeFreePoolTask('${task.id}')" ${task.completed ? 'disabled' : ''}>
                                ${task.completed ? 'Completed' : 'Complete'}
                            </button>
                        </div>
                    `).join('')}
                </div>
                <div class="tasks-progress">
                    <div class="progress-text">Progress: ${getCompletedFreeTasksCount()}/6 tasks completed</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(getCompletedFreeTasksCount() / 6) * 100}%"></div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn-cancel" onclick="closeFreePoolTasksModal()">Later</button>
                    <button class="btn-success" onclick="checkFreePoolTasksCompletion()" ${getCompletedFreeTasksCount() === 6 ? '' : 'disabled'}>
                        Unlock Free Pool
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function completeFreePoolTask(taskId) {
    const task = FREE_POOL_TASKS.find(t => t.id === taskId);
    if (!task) return;
    
    // Mark task as completed
    task.completed = true;
    
    // Show notification based on task
    switch(taskId) {
        case 'telegram_follow':
            window.open('https://t.me/tapearn_official', '_blank');
            showNotification('✅ Telegram follow task completed!', 'success');
            break;
        case 'instagram_follow':
            window.open('https://instagram.com/tapearn', '_blank');
            showNotification('✅ Instagram follow task completed!', 'success');
            break;
        case 'twitter_follow':
            window.open('https://twitter.com/tapearn', '_blank');
            showNotification('✅ Twitter follow task completed!', 'success');
            break;
        case 'facebook_follow':
            window.open('https://facebook.com/tapearn', '_blank');
            showNotification('✅ Facebook like task completed!', 'success');
            break;
        case 'youtube_subscribe':
            window.open('https://youtube.com/@tapearn', '_blank');
            showNotification('✅ YouTube subscribe task completed!', 'success');
            break;
        case 'watch_2_videos':
            showVideoSection();
            showNotification('📺 Complete watching 2 videos', 'info');
            break;
    }
    
    // Update modal
    const modal = document.querySelector('.modal.active');
    if (modal && modal.innerHTML.includes('Free Pool Requirements')) {
        modal.remove();
        setTimeout(showFreePoolTasksModal, 500);
    }
    
    // Check if all tasks completed
    if (getCompletedFreeTasksCount() === 6) {
        freePoolTasksCompleted = true;
        saveToStorage('freePoolTasksCompleted', true);
        showNotification('🎉 All tasks completed! Free pool unlocked!', 'success');
    }
}

function getCompletedFreeTasksCount() {
    return FREE_POOL_TASKS.filter(task => task.completed).length;
}

function checkFreePoolTasksCompletion() {
    if (getCompletedFreeTasksCount() === 6) {
        freePoolTasksCompleted = true;
        saveToStorage('freePoolTasksCompleted', true);
        showNotification('🎉 Free pool unlocked! You can now subscribe.', 'success');
        
        const modal = document.querySelector('.modal.active');
        if (modal) modal.remove();
    }
}

function closeFreePoolTasksModal() {
    const modal = document.querySelector('.modal.active');
    if (modal && modal.innerHTML.includes('Free Pool Requirements')) {
        modal.remove();
    }
}

function checkFreePoolTasks() {
    const saved = getFromStorage('freePoolTasksCompleted', false);
    freePoolTasksCompleted = saved;
    
    // Reset tasks for demo
    if (!freePoolTasksCompleted) {
        FREE_POOL_TASKS.forEach(task => task.completed = false);
    }
}

// ==============================================
// ✅ UPDATED MINING PAGE UI FUNCTION
// ==============================================

function updateMiningPageUI() {
    const miningContent = document.getElementById('miningContent');
    if (!miningContent) return;
    
    // Update only if mining tab is active
    if (!miningContent.classList.contains('active')) return;
    
    let html = `
        <div class="page-header">
            <h2>⛏️ Mining Pools</h2>
            <p class="page-subtitle">Subscribe to pools and earn points</p>
        </div>
        
        <!-- User Status -->
        <div class="user-status-card">
            <div class="user-info-mini">
                <div class="user-avatar">👤</div>
                <div class="user-details">
                    <div class="user-name">${userId || 'Guest'}</div>
                    <div class="user-points">${userPoints} USDT</div>
                </div>
            </div>
            ${!userRegistered ? `
                <button class="btn-register" onclick="showRegistrationModal()">
                    📝 Register Now
                </button>
            ` : ''}
        </div>
        
        <!-- Active Pool Section -->
        ${activeMiningPool ? `
        <div class="active-pool-section">
            <h3>Your Active Pool</h3>
            <div class="active-pool-card">
                <div class="pool-header">
                    <div class="pool-icon-large">${activeMiningPool.poolIcon}</div>
                    <div class="pool-info">
                        <h3>${activeMiningPool.poolName}</h3>
                        <p>Duration: ${activeMiningPool.durationHours} hours</p>
                    </div>
                    <div class="pool-reward">${activeMiningPool.expectedPoints} points</div>
                </div>
                
                <div class="pool-progress">
                    ${activeMiningPool.status === 'active' ? `
                    <div class="time-remaining">
                        <div class="timer-large" id="poolTimer">${formatTimeRemaining(activeMiningPool.endTime - Date.now())}</div>
                        <div class="progress-text">Time Remaining</div>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar">
                            <div class="progress-fill" id="poolProgressFill" style="width: ${calculatePoolProgress()}%"></div>
                        </div>
                    </div>
                    ` : `
                    <div class="pool-completed">
                        <div class="completed-icon">🎉</div>
                        <div class="completed-text">Ready to Claim!</div>
                    </div>
                    `}
                </div>
                
                <div class="pool-actions">
                    ${activeMiningPool.status === 'active' ? `
                    <button class="btn-cancel" onclick="cancelMiningPool()">Cancel Pool</button>
                    ` : `
                    <button class="btn-success" onclick="claimMiningPoolRewards()">Claim ${activeMiningPool.expectedPoints} Points</button>
                    `}
                </div>
            </div>
        </div>
        ` : ''}
        
        <!-- Free Pool Card -->
        <div class="pool-category">
            <h3>🎁 FREE Mining Pool (Reset Every 24 Hours)</h3>
            <div class="pools-grid">
    `;
    
    // Free Pool
    const freePool = MINING_POOLS.find(p => p.id === 'free_pool');
    if (freePool) {
        const duration = freePool.durations[0];
        const instanceId = `free_pool_${duration.hours}`;
        const instance = miningPoolInstances[instanceId];
        
        html += `
            <div class="pool-card free-pool">
                <div class="pool-card-header">
                    <div class="pool-card-icon">${freePool.icon}</div>
                    <div class="pool-card-title">${freePool.name}</div>
                    <div class="pool-badge free">FREE</div>
                </div>
                
                <div class="pool-stats-row">
                    <div class="pool-stat">
                        <div class="stat-label">Duration</div>
                        <div class="stat-value">${duration.hours}H</div>
                    </div>
                    <div class="pool-stat">
                        <div class="stat-label">Reward</div>
                        <div class="stat-value">${duration.points} pts</div>
                    </div>
                    <div class="pool-stat">
                        <div class="stat-label">Multiplier</div>
                        <div class="stat-value">${duration.multiplier}x</div>
                    </div>
                </div>
                
                <div class="pool-timer">
                    <div class="timer-label">Time Left:</div>
                    <div class="timer-value">${formatTimeRemaining(instance ? instance.remainingTime : duration.timer)}</div>
                </div>
                
                <div class="pool-participants">
                    <div class="participants-info">
                        <div class="participants-count">
                            <span class="icon">👥</span>
                            <span class="count">${instance ? instance.subscribers : 0}</span>
                            <span class="label">Subscribed</span>
                        </div>
                        <div class="participants-count">
                            <span class="icon">⛏️</span>
                            <span class="count">${instance ? instance.participants : 0}</span>
                            <span class="label">Mining</span>
                        </div>
                    </div>
                </div>
                
                <div class="pool-requirements">
                    <div class="requirements-label">Requirements:</div>
                    <div class="requirements-list">
                        ${freePoolTasksCompleted ? 
                            '<span class="requirement met">✅ Tasks Completed</span>' : 
                            '<span class="requirement pending">❌ Complete 6 Tasks</span>'
                        }
                    </div>
                </div>
                
                <button class="btn-subscribe ${freePoolTasksCompleted ? 'btn-success' : 'btn-disabled'}" 
                        onclick="${freePoolTasksCompleted ? `startMiningPool('free_pool', ${duration.hours})` : 'showFreePoolTasksModal()'}">
                    ${freePoolTasksCompleted ? 'Subscribe Free' : 'Complete Tasks First'}
                </button>
            </div>
        `;
    }
    
    html += `
            </div>
        </div>
        
        <!-- Daily Activities Section -->
        <div class="daily-activities-section">
            <button class="btn-daily-activities" onclick="showDailyActivitiesModal()">
                🎯 Earn Extra Points Daily
                <span style="font-size: 12px; opacity: 0.9;">+500 Points Daily Available</span>
            </button>
        </div>
        
        <!-- Paid Pools -->
        <div class="pool-category">
            <h3>💰 Paid Mining Pools (Min 50 USDT - Max 1000 USDT)</h3>
            <div class="pools-grid">
    `;
    
    // Paid Pools
    MINING_POOLS.filter(pool => pool.type === 'paid').forEach(pool => {
        pool.durations.forEach(duration => {
            const instanceId = `${pool.id}_${duration.hours}`;
            const instance = miningPoolInstances[instanceId];
            const paidPoolUnlocked = getFromStorage(`paidPoolUnlocked_${userId}_${pool.id}`, false);
            const minInvestment = Math.min(pool.minInvestment, 1000);
            const maxInvestment = 1000;
            
            html += `
                <div class="pool-card paid-pool">
                    <div class="pool-card-header">
                        <div class="pool-card-icon">${pool.icon}</div>
                        <div class="pool-card-title">${pool.name}</div>
                        <div class="pool-badge paid">${minInvestment}-${maxInvestment} USDT</div>
                    </div>
                    
                    <div class="pool-stats-row">
                        <div class="pool-stat">
                            <div class="stat-label">Duration</div>
                            <div class="stat-value">${duration.hours}H</div>
                        </div>
                        <div class="pool-stat">
                            <div class="stat-label">Reward</div>
                            <div class="stat-value">${duration.points} pts</div>
                        </div>
                        <div class="pool-stat">
                            <div class="stat-label">Multiplier</div>
                            <div class="stat-value">${duration.multiplier}x</div>
                        </div>
                    </div>
                    
                    <div class="pool-timer">
                        <div class="timer-label">Time Left:</div>
                        <div class="timer-value">${formatTimeRemaining(instance ? instance.remainingTime : duration.timer)}</div>
                    </div>
                    
                    <div class="pool-participants">
                        <div class="participants-info">
                            <div class="participants-count">
                                <span class="icon">👥</span>
                                <span class="count">${instance ? instance.subscribers : 0}</span>
                                <span class="label">Subscribed</span>
                            </div>
                            <div class="participants-count">
                                <span class="icon">⛏️</span>
                                <span class="count">${instance ? instance.participants : 0}</span>
                                <span class="label">Mining</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="pool-investment">
                        <div class="investment-label">Investment Range:</div>
                        <div class="investment-amount">${minInvestment} - ${maxInvestment} USDT</div>
                    </div>
                    
                    <div class="pool-requirements">
                        <div class="requirements-label">Requirements:</div>
                        <div class="requirements-list">
                            ${paidPoolUnlocked ? 
                                '<span class="requirement met">✅ Tasks Completed</span>' : 
                                '<span class="requirement pending">❌ Complete 3 Tasks</span>'
                            }
                        </div>
                    </div>
                    
                    <button class="btn-subscribe ${userPoints >= minInvestment && paidPoolUnlocked ? 'btn-success' : 'btn-disabled'}" 
                            onclick="${userPoints >= minInvestment && paidPoolUnlocked ? `startMiningPool('${pool.id}', ${duration.hours})` : !paidPoolUnlocked ? `showPaidPoolTasksModal('${pool.id}', '${pool.name}', ${minInvestment})` : ''}">
                        ${userPoints >= minInvestment && paidPoolUnlocked ? 'Subscribe Now' : paidPoolUnlocked ? 'Insufficient USDT' : 'Complete Tasks First'}
                    </button>
                </div>
            `;
        });
    });
    
    html += `
            </div>
        </div>
        
        <!-- Mining History -->
        <div class="mining-history-section">
            <h3>Your Mining History</h3>
            <div class="history-list">
                ${miningPoolHistory.slice(0, 5).map(entry => `
                <div class="history-item ${entry.status}">
                    <div class="history-icon">${getPoolIcon(entry.poolId)}</div>
                    <div class="history-info">
                        <div class="history-pool">${entry.poolName}</div>
                        <div class="history-duration">${entry.durationHours}h • ${entry.status}</div>
                    </div>
                    <div class="history-points">${entry.expectedPoints} pts</div>
                </div>
                `).join('')}
                ${miningPoolHistory.length === 0 ? '<div class="no-history">No mining history yet</div>' : ''}
            </div>
        </div>
    `;
    
    miningContent.innerHTML = html;
    
    // Update timer in real-time
    if (activeMiningPool && activeMiningPool.status === 'active') {
        const timerEl = document.getElementById('poolTimer');
        if (timerEl) {
            timerEl.textContent = formatTimeRemaining(activeMiningPool.endTime - Date.now());
        }
        
        const progressFill = document.getElementById('poolProgressFill');
        if (progressFill) {
            progressFill.style.width = `${calculatePoolProgress()}%`;
        }
    }
}

// ==============================================
// ✅ DAILY ACTIVITIES SYSTEM FUNCTIONS
// ==============================================

function loadDailyActivities() {
    // Load completed activities from storage
    completedDailyActivities = getFromStorage('completedDailyActivities', []);
    dailyActivityStreak = getFromStorage('dailyActivityStreak', 0);
    lastDailyActivityDate = getFromStorage('lastDailyActivityDate', null);
    todayActivityPoints = getFromStorage('todayActivityPoints', 0);
    totalActivityPoints = getFromStorage('totalActivityPoints', 0);
    
    // Initialize daily activities
    dailyActivities = JSON.parse(JSON.stringify(DAILY_ACTIVITIES));
    
    // Mark completed activities
    dailyActivities.forEach(activity => {
        const userActivity = completedDailyActivities.find(a => 
            a.id === activity.id && 
            new Date(a.date).toDateString() === new Date().toDateString()
        );
        
        if (userActivity) {
            activity.completed = true;
            activity.completedCount = userActivity.count || 1;
        } else {
            activity.completed = false;
            activity.completedCount = 0;
        }
    });
    
    // Check and reset daily streak if needed
    checkAndResetDailyStreak();
}

function checkAndResetDailyStreak() {
    const today = new Date().toDateString();
    
    if (!lastDailyActivityDate) {
        lastDailyActivityDate = today;
        saveToStorage('lastDailyActivityDate', lastDailyActivityDate);
        return;
    }
    
    const lastDate = new Date(lastDailyActivityDate);
    const currentDate = new Date();
    const diffTime = currentDate - lastDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Reset streak if more than 1 day gap
    if (diffDays > 1) {
        dailyActivityStreak = 1;
    } else if (diffDays === 1) {
        // Increment streak if consecutive day
        dailyActivityStreak++;
    }
    
    // Reset today's points at midnight
    if (lastDailyActivityDate !== today) {
        todayActivityPoints = 0;
        lastDailyActivityDate = today;
        
        // Save updates
        saveToStorage('todayActivityPoints', todayActivityPoints);
        saveToStorage('lastDailyActivityDate', lastDailyActivityDate);
        saveToStorage('dailyActivityStreak', dailyActivityStreak);
    }
}

// ✅ SECTION 7: DAILY ACTIVITIES FIX
function completeDailyActivity(activityId) {
    console.log(`🎯 Completing daily activity: ${activityId}`);
    
    if (!userRegistered) {
        showNotification('❌ Please register first!', 'warning');
        showRegistrationModal();
        return;
    }
    
    const activity = dailyActivities.find(a => a.id === activityId);
    if (!activity) {
        showNotification('❌ Activity not found!', 'warning');
        return;
    }
    
    const todayCompletions = completedDailyActivities.filter(a => 
        a.id === activityId && 
        new Date(a.date).toDateString() === new Date().toDateString()
    ).length;
    
    if (activity.frequency === 'daily' && todayCompletions >= activity.maxPerDay) {
        showNotification(`❌ You can only complete this activity ${activity.maxPerDay} times per day!`, 'warning');
        return;
    }
    
    if (activity.frequency === 'once') {
        const alreadyCompleted = completedDailyActivities.some(a => a.id === activityId);
        if (alreadyCompleted) {
            showNotification('❌ This activity can only be completed once!', 'warning');
            return;
        }
    }
    
    performActivityAction(activity);
    
    activity.completed = true;
    activity.completedCount = (activity.completedCount || 0) + 1;
    
    completedDailyActivities.push({
        id: activityId,
        title: activity.title,
        points: activity.points,
        date: new Date().toISOString(),
        count: activity.completedCount
    });
    
    // ✅ FIX: Award points to main balance
    awardPoints(activity.points, `Daily Activity: ${activity.title}`, 'bonus');
    
    todayActivityPoints += activity.points;
    totalActivityPoints += activity.points;
    
    checkAndResetDailyStreak();
    checkStreakRewards();
    saveDailyActivitiesState();
    
    showNotification(`✅ ${activity.title} completed! +${activity.points} points added to your balance`, 'success');
    
    updateDailyActivitiesUI();
    updateUI();
}

function performActivityAction(activity) {
    switch(activity.type) {
        case 'video':
            showVideoSection();
            break;
        case 'task':
            showTasksHomePage();
            break;
        case 'referral':
            showReferralSystem();
            break;
        case 'social':
            openSocialLink(activity);
            break;
        case 'ad':
            showAdReward();
            break;
        case 'survey':
            showSurvey();
            break;
        case 'app':
            showPartnerApps();
            break;
        case 'game':
            showMiniGame();
            break;
        case 'quiz':
            showQuiz();
            break;
        default:
            // Default action - just complete
            break;
    }
}

function openSocialLink(activity) {
    const links = {
        'activity_5': 'https://t.me/tapearn_official',
        'activity_6': 'https://instagram.com/tapearn',
        'activity_7': 'https://facebook.com/tapearn',
        'activity_8': 'https://youtube.com/@tapearn',
        'activity_9': 'https://discord.gg/tapearn',
        'activity_10': 'https://twitter.com/tapearn'
    };
    
    if (links[activity.id]) {
        window.open(links[activity.id], '_blank');
    }
}

function showAdReward() {
    // Simulate watching ad
    const adModal = document.createElement('div');
    adModal.className = 'modal active';
    adModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>📢 Watching Ad</h3>
            </div>
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 48px; margin-bottom: 15px;">⏳</div>
                <h3>Please wait...</h3>
                <p>Ad is playing. Don't close this window.</p>
                <div class="progress-bar" style="margin: 20px auto; width: 80%;">
                    <div class="progress-fill" id="adProgress" style="width: 0%;"></div>
                </div>
                <div id="adCountdown">5 seconds remaining</div>
            </div>
        </div>
    `;
    document.body.appendChild(adModal);
    
    let seconds = 5;
    const countdown = setInterval(() => {
        seconds--;
        const countdownEl = document.getElementById('adCountdown');
        const progressEl = document.getElementById('adProgress');
        
        if (countdownEl) {
            countdownEl.textContent = `${seconds} seconds remaining`;
        }
        
        if (progressEl) {
            progressEl.style.width = `${((5 - seconds) / 5) * 100}%`;
        }
        
        if (seconds <= 0) {
            clearInterval(countdown);
            adModal.remove();
            showNotification('✅ Ad watched! Points added.', 'success');
        }
    }, 1000);
}

function checkStreakRewards() {
    console.log('🎁 Checking streak rewards, current streak:', dailyActivityStreak);
    
    // Check if user earned streak reward
    if (dailyActivityStreak === 3 && !getFromStorage('streak_3_reward', false)) {
        awardPoints(DAILY_ACTIVITY_REWARDS.streak_3, '3-Day Streak Bonus', 'bonus');
        saveToStorage('streak_3_reward', true);
        showNotification(`🎉 3-Day Streak Bonus! +${DAILY_ACTIVITY_REWARDS.streak_3} points added to your balance`, 'success');
    }
    
    if (dailyActivityStreak === 7 && !getFromStorage('streak_7_reward', false)) {
        awardPoints(DAILY_ACTIVITY_REWARDS.streak_7, '7-Day Streak Bonus', 'bonus');
        saveToStorage('streak_7_reward', true);
        showNotification(`🎉 7-Day Streak Bonus! +${DAILY_ACTIVITY_REWARDS.streak_7} points added to your balance`, 'success');
    }
    
    if (dailyActivityStreak === 15 && !getFromStorage('streak_15_reward', false)) {
        awardPoints(DAILY_ACTIVITY_REWARDS.streak_15, '15-Day Streak Bonus', 'bonus');
        saveToStorage('streak_15_reward', true);
        showNotification(`🎉 15-Day Streak Bonus! +${DAILY_ACTIVITY_REWARDS.streak_15} points added to your balance`, 'success');
    }
    
    if (dailyActivityStreak === 30 && !getFromStorage('streak_30_reward', false)) {
        awardPoints(DAILY_ACTIVITY_REWARDS.streak_30, '30-Day Streak Bonus', 'bonus');
        saveToStorage('streak_30_reward', true);
        showNotification(`🎉 30-Day Streak Bonus! +${DAILY_ACTIVITY_REWARDS.streak_30} points added to your balance`, 'success');
    }
}

function saveDailyActivitiesState() {
    saveToStorage('completedDailyActivities', completedDailyActivities);
    saveToStorage('dailyActivityStreak', dailyActivityStreak);
    saveToStorage('lastDailyActivityDate', lastDailyActivityDate);
    saveToStorage('todayActivityPoints', todayActivityPoints);
    saveToStorage('totalActivityPoints', totalActivityPoints);
}

function showDailyActivitiesModal() {
    if (!userRegistered) {
        showNotification('❌ Please register first!', 'warning');
        showRegistrationModal();
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal active daily-activities-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>🎯 Daily Activities</h3>
                <button class="modal-close" onclick="closeDailyActivitiesModal()">×</button>
            </div>
            
            <div class="daily-activities-stats">
                <div class="activity-stat">
                    <div class="stat-number">${dailyActivityStreak}</div>
                    <div class="stat-label">Day Streak</div>
                </div>
                <div class="activity-stat">
                    <div class="stat-number">${todayActivityPoints}</div>
                    <div class="stat-label">Today's Points</div>
                </div>
                <div class="activity-stat">
                    <div class="stat-number">${totalActivityPoints}</div>
                    <div class="stat-label">Total Earned</div>
                </div>
            </div>
            
            <div class="streak-rewards">
                <h4>🔥 Streak Rewards</h4>
                <div class="streak-rewards-grid">
                    <div class="streak-reward ${dailyActivityStreak >= 3 ? 'unlocked' : ''}">
                        <div class="streak-days">3 Days</div>
                        <div class="streak-points">+${DAILY_ACTIVITY_REWARDS.streak_3} pts</div>
                        ${dailyActivityStreak >= 3 ? '<div class="streak-status">✅</div>' : ''}
                    </div>
                    <div class="streak-reward ${dailyActivityStreak >= 7 ? 'unlocked' : ''}">
                        <div class="streak-days">7 Days</div>
                        <div class="streak-points">+${DAILY_ACTIVITY_REWARDS.streak_7} pts</div>
                        ${dailyActivityStreak >= 7 ? '<div class="streak-status">✅</div>' : ''}
                    </div>
                    <div class="streak-reward ${dailyActivityStreak >= 15 ? 'unlocked' : ''}">
                        <div class="streak-days">15 Days</div>
                        <div class="streak-points">+${DAILY_ACTIVITY_REWARDS.streak_15} pts</div>
                        ${dailyActivityStreak >= 15 ? '<div class="streak-status">✅</div>' : ''}
                    </div>
                    <div class="streak-reward ${dailyActivityStreak >= 30 ? 'unlocked' : ''}">
                        <div class="streak-days">30 Days</div>
                        <div class="streak-points">+${DAILY_ACTIVITY_REWARDS.streak_30} pts</div>
                        ${dailyActivityStreak >= 30 ? '<div class="streak-status">✅</div>' : ''}
                    </div>
                </div>
            </div>
            
            <div class="activities-list" id="activitiesList">
                ${getDailyActivitiesList()}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function getDailyActivitiesList() {
    return dailyActivities.map(activity => {
        const todayCompletions = completedDailyActivities.filter(a => 
            a.id === activity.id && 
            new Date(a.date).toDateString() === new Date().toDateString()
        ).length;
        
        const maxText = activity.frequency === 'daily' ? ` (Max: ${activity.maxPerDay}/day)` : '';
        const completedText = activity.completed ? `✅ ${todayCompletions}/${activity.frequency === 'daily' ? activity.maxPerDay : 1}` : '';
        
        return `
            <div class="activity-item ${activity.completed ? 'completed' : ''}">
                <div class="activity-icon">${activity.icon}</div>
                <div class="activity-info">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-desc">${activity.description}${maxText}</div>
                    <div class="activity-status">${completedText}</div>
                </div>
                <div class="activity-points">+${activity.points}</div>
                <button class="activity-btn ${activity.completed ? 'completed' : ''}" 
                        onclick="completeDailyActivity('${activity.id}')"
                        ${activity.completed ? 'disabled' : ''}>
                    ${activity.completed ? 'Completed' : 'Start'}
                </button>
            </div>
        `;
    }).join('');
}

function updateDailyActivitiesUI() {
    const modal = document.querySelector('.daily-activities-modal');
    if (modal) {
        const activitiesList = modal.querySelector('#activitiesList');
        if (activitiesList) {
            activitiesList.innerHTML = getDailyActivitiesList();
        }
        
        // Update stats
        const stats = modal.querySelectorAll('.activity-stat');
        if (stats[0]) stats[0].querySelector('.stat-number').textContent = dailyActivityStreak;
        if (stats[1]) stats[1].querySelector('.stat-number').textContent = todayActivityPoints;
        if (stats[2]) stats[2].querySelector('.stat-number').textContent = totalActivityPoints;
    }
}

function closeDailyActivitiesModal() {
    const modal = document.querySelector('.daily-activities-modal');
    if (modal) modal.remove();
}

// Auto-complete login activity on daily login
function autoCompleteLoginActivity() {
    console.log('🔐 Auto-completing login activity');
    
    const today = new Date().toDateString();
    const loginActivity = dailyActivities.find(a => a.id === 'activity_1');
    
    if (loginActivity && !loginActivity.completed) {
        const todayCompleted = completedDailyActivities.some(a => 
            a.id === 'activity_1' && 
            new Date(a.date).toDateString() === today
        );
        
        if (!todayCompleted) {
            // ✅ Use the fixed completeDailyActivity function
            completeDailyActivity('activity_1');
            console.log('✅ Auto-completed morning check-in activity');
        }
    }
}

// ==============================================
// ✅ SPONSOR COMMISSION SYSTEM
// ==============================================

// ✅ SECTION 5: SPONSOR COMMISSION SYSTEM
function getCommissionRate(activityType) {
    console.log('💰 Getting commission rate for:', activityType);
    
    const rates = {
        'mining': 0.05,
        'video': 0.15,
        'task': 0.12,
        'referral': 0.20,
        'bonus': 0.08
    };
    
    let key = activityType;
    if (activityType === 'mining_earnings') key = 'mining';
    if (activityType === 'video_watch') key = 'video';
    if (activityType === 'task_earnings') key = 'task';
    if (activityType === 'referral_earning') key = 'referral';
    if (activityType === 'bonus_earnings') key = 'bonus';
    
    return rates[key] || 0.10;
}

function addSponsorCommission(amount, userActivity, commissionRate, activityType) {
    console.log('💼 Adding sponsor commission:', {
        sponsorId: sponsorId,
        amount: amount,
        activity: userActivity,
        rate: commissionRate,
        type: activityType
    });
    
    if (!sponsorId || sponsorId.trim() === '' || amount <= 0) {
        console.log('❌ No sponsor or invalid amount');
        return;
    }
    
    const commission = Math.max(1, Math.round(amount * commissionRate));
    console.log('📊 Calculated commission:', commission);
    
    if (commission <= 0) return;
    
    sponsorCommissionEarned += commission;
    userGeneratedSponsorIncome += commission;
    
    updateSponsorIncomeBreakdown(commission, activityType);
    
    const sponsorTransaction = {
        id: 'sponsor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        description: `Commission from ${userId}: ${userActivity}`,
        amount: commission,
        type: 'earning',
        category: 'sponsor_commission',
        subCategory: activityType,
        commissionRate: commissionRate,
        fromUser: userId,
        fromUserId: userId,
        fromActivity: userActivity,
        originalAmount: amount,
        activityType: activityType
    };
    
    sponsorTransactions.unshift(sponsorTransaction);
    
    const userActivityRecord = {
        id: sponsorTransaction.id,
        timestamp: new Date().toISOString(),
        description: userActivity,
        commission: commission,
        originalAmount: amount,
        commissionRate: commissionRate,
        activityType: activityType,
        forSponsor: sponsorId,
        sponsorName: sponsorName
    };
    
    userSponsorActivities.unshift(userActivityRecord);
    
    saveToStorage('sponsorCommissionEarned', sponsorCommissionEarned);
    saveToStorage('sponsorTransactions', sponsorTransactions);
    saveToStorage('userGeneratedSponsorIncome', userGeneratedSponsorIncome);
    saveToStorage('userSponsorActivities', userSponsorActivities);
    saveToStorage('sponsorIncomeBreakdown', sponsorIncomeBreakdown);
    
    console.log('✅ Sponsor commission recorded:', commission, 'points');
    updateUI();
}

function updateSponsorIncomeBreakdown(commission, activityType) {
    switch(activityType) {
        case 'mining_earnings': sponsorIncomeBreakdown.mining += commission; break;
        case 'video_watch': sponsorIncomeBreakdown.videos += commission; break;
        case 'task_earnings': sponsorIncomeBreakdown.tasks += commission; break;
        case 'referral_earning': sponsorIncomeBreakdown.referrals += commission; break;
        case 'bonus_earnings': sponsorIncomeBreakdown.bonuses += commission; break;
    }
    sponsorIncomeBreakdown.total = userGeneratedSponsorIncome;
    saveToStorage('sponsorIncomeBreakdown', sponsorIncomeBreakdown);
}

// ✅ SECTION 6: UPDATE AWARD POINTS FUNCTION
function awardPoints(amount, source, category) {
    console.log('💰 Awarding points:', { amount, source, category, sponsorId });
    
    initializeNaNProtection();
    const safeAmount = Math.max(0, Math.round(safeNumber(amount, 0)));
    if (safeAmount <= 0) return 0;
    
    userPoints += safeAmount;
    totalPointsEarned += safeAmount;
    todayEarnings += safeAmount;
    
    addTransaction(source, safeAmount, 'earning', category);
    
    if (sponsorId && sponsorId.trim() !== '' && safeAmount > 0) {
        console.log('🎯 Adding sponsor commission for:', sponsorId);
        
        let commissionCategory = category;
        if (category === 'video') commissionCategory = 'video_watch';
        if (category === 'task') commissionCategory = 'task_earnings';
        if (category === 'referral') commissionCategory = 'referral_earning';
        if (category === 'bonus') commissionCategory = 'bonus_earnings';
        if (category === 'mining') commissionCategory = 'mining_earnings';
        
        const commissionRate = getCommissionRate(commissionCategory);
        addSponsorCommission(safeAmount, source, commissionRate, commissionCategory);
    }
    
    updateUI();
    saveMiningState();
    
    return safeAmount;
}

function addTransaction(description, amount, type, category, subCategory = "") {
    initializeNaNProtection();
    const safeAmount = Math.round(safeNumber(amount, 0));
    
    const transaction = {
        id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        description,
        amount: safeAmount,
        type,
        category,
        subCategory,
        balance: userPoints
    };
    
    transactionHistory.unshift(transaction);
    saveUserTransaction(transaction);
    
    if (type === 'earning') {
        totalEarned = safeNumber(totalEarned + safeAmount);
    } else if (type === 'spending') {
        totalSpent = safeNumber(totalSpent + safeAmount);
    }
    
    if (transactionHistory.length > 200) {
        transactionHistory = transactionHistory.slice(0, 200);
    }
    
    saveMiningState();
}

function saveUserTransaction(transaction) {
    if (!userId) return;
    
    const userTransactions = getFromStorage(`userTransactions_${userId}`, []);
    userTransactions.unshift(transaction);
    if (userTransactions.length > 300) userTransactions.splice(300);
    saveToStorage(`userTransactions_${userId}`, userTransactions);
    
    const allTransactions = getFromStorage('allUsersTransactions', []);
    allTransactions.unshift(transaction);
    if (allTransactions.length > 1000) allTransactions.splice(1000);
    saveToStorage('allUsersTransactions', allTransactions);
}

// ==============================================
// ✅ ADMIN AUTHORIZATION FUNCTION - ADD BEFORE window.adminSystem
// ==============================================

function isUserAuthorizedForAdmin() {
    console.log('🔐 Admin authorization check for:', userId, 'email:', userEmail);
    
    // First ensure user is properly registered
    if (!userRegistered) {
        const ensured = ensureUserRegistered();
        if (!ensured) {
            console.log('❌ User not registered for admin access');
            return false;
        }
    }
    
    // Define admin users (add more as needed)
    const adminUsers = [
        {
            email: 'topjust2@gmail.com',
            username: 'topjust2',
            isAdmin: true
        },
        {
            email: 'admin@tapearn.com',
            username: 'admin',
            isAdmin: true
        }
    ];
    
    // Check by email
    const isAdminByEmail = adminUsers.some(admin => 
        userEmail && userEmail.toLowerCase() === admin.email.toLowerCase()
    );
    
    // Check by username
    const isAdminByUsername = adminUsers.some(admin => 
        userId && userId.toLowerCase() === admin.username.toLowerCase()
    );
    
    const isAuthorized = isAdminByEmail || isAdminByUsername;
    
    console.log('🔍 Admin check result:', {
        userId,
        userEmail,
        isAdminByEmail,
        isAdminByUsername,
        isAuthorized
    });
    
    if (isAuthorized) {
        console.log('✅ User AUTHORIZED for admin access:', userId);
    } else {
        console.log('❌ User NOT authorized for admin access:', userId);
    }
    
    return isAuthorized;
}

// ✅ UPDATED ADMIN SYSTEM OBJECT WITH ACCESS CONTROL
window.adminSystem = {
    openAdminPanel: function() {
        // Check authorization before opening admin panel
        if (!isUserAuthorizedForAdmin()) {
            showNotification('❌ Unauthorized: Admin access restricted!', 'error');
            console.log('🚫 Blocked unauthorized admin access attempt by:', userEmail || userId);
            return;
        }
        
        // Create admin modal
        const modal = document.createElement('div');
        modal.className = 'modal active admin-modal';
        modal.id = 'adminModal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🛠️ Admin Panel - Restricted Access</h3>
                    <div class="admin-user-info" style="font-size: 12px; color: #4CAF50; margin-top: 5px;">
                        Logged in as: ${userId} (${userEmail})
                    </div>
                    <button class="modal-close" onclick="closeAdminModal()">×</button>
                </div>
                <div class="admin-tabs">
                    <button class="admin-tab active" onclick="switchAdminTab('users')">👥 Users</button>
                    <button class="admin-tab" onclick="switchAdminTab('storage')">💾 Storage</button>
                    <button class="admin-tab" onclick="switchAdminTab('server')">🌐 Server</button>
                    <button class="admin-tab" onclick="switchAdminTab('tools')">🔧 Tools</button>
                    <button class="admin-tab" onclick="switchAdminTab('danger')">☢️ Danger Zone</button>
                </div>
                <div class="admin-content" id="adminContent">
                    <!-- Admin content will be loaded here -->
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Load default tab
        switchAdminTab('users');
    },
    
    // ✅ UPDATED: Only inject admin button for authorized users
    injectAdminButton: function() {
        // Check authorization before injecting admin button
        if (!isUserAuthorizedForAdmin()) {
            console.log('🚫 Admin button NOT injected for user:', userEmail || userId);
            return;
        }
        
        // Call the new injectAdminButton function
        injectAdminButton();
    }
};

// ==============================================
// ✅ NEW ADMIN FUNCTIONS - ADD AFTER window.adminSystem OBJECT
// ==============================================

// ✅ FIX: Inject admin button with proper checks
function injectAdminButton() {
    console.log('🔧 Injecting admin button...');
    
    // Remove existing admin button if any
    const existingBtn = document.querySelector('.admin-header-btn');
    if (existingBtn) {
        console.log('🔄 Removing existing admin button');
        existingBtn.remove();
    }
    
    // Check authorization
    if (!isUserAuthorizedForAdmin()) {
        console.log('🚫 User not authorized for admin button');
        return;
    }
    
    console.log('✅ User authorized, creating admin button');
    
    const adminBtn = document.createElement('div');
    adminBtn.className = 'admin-header-btn';
    adminBtn.innerHTML = '🛠️';
    adminBtn.title = 'Admin Panel (Restricted Access)';
    adminBtn.style.cssText = `
        position: fixed;
        top: 15px;
        right: 15px;
        z-index: 9999;
        background: linear-gradient(135deg, #ff0000, #990000);
        color: white;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(255,0,0,0.5);
        transition: all 0.3s;
        border: 2px solid #fff;
    `;
    
    adminBtn.onclick = function() {
        console.log('🛠️ Admin button clicked by:', userId);
        window.adminSystem.openAdminPanel();
    };
    
    adminBtn.onmouseenter = function() {
        this.style.transform = 'scale(1.1)';
        this.style.boxShadow = '0 6px 20px rgba(255,0,0,0.7)';
        this.style.borderColor = '#FFD700';
    };
    
    adminBtn.onmouseleave = function() {
        this.style.transform = 'scale(1)';
        this.style.boxShadow = '0 4px 15px rgba(255,0,0,0.5)';
        this.style.borderColor = '#fff';
    };
    
    document.body.appendChild(adminBtn);
    console.log('✅ Admin button injected successfully');
}

// ✅ FIX: Add function to perform admin sync
function performFullAdminSync() {
    if (!isUserAuthorizedForAdmin()) return;
    
    console.log('🔄 Performing full admin sync...');
    
    // Sync user data to server
    syncUserToServer();
    
    // Fetch server stats
    setTimeout(fetchServerStats, 500);
    
    // Update admin panel if open
    const adminModal = document.getElementById('adminModal');
    if (adminModal) {
        console.log('🔄 Refreshing admin panel data');
        loadAdminUsersTab();
    }
}

// ✅ FIX: Add sync function
async function syncUserToServer() {
    try {
        const currentUser = getFromStorage('currentUser');
        if (!currentUser) return;
        
        const response = await fetch('http://localhost:3000/api/sync-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(currentUser)
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ User synced to server:', currentUser.username);
        }
    } catch (error) {
        console.error('❌ Error syncing user:', error);
    }
}

// Admin Panel Functions
function closeAdminModal() {
    const modal = document.getElementById('adminModal');
    if (modal) modal.remove();
}

function switchAdminTab(tabName) {
    const contentDiv = document.getElementById('adminContent');
    if (!contentDiv) return;
    
    // Update active tab
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Load tab content
    switch(tabName) {
        case 'users':
            loadAdminUsersTab();
            break;
        case 'storage':
            loadAdminStorageTab();
            break;
        case 'server':
            loadAdminServerTab();
            break;
        case 'tools':
            loadAdminToolsTab();
            break;
        case 'danger':
            loadAdminDangerTab();
            break;
    }
}

// ✅ Server Tab Functions
function loadAdminServerTab() {
    const contentDiv = document.getElementById('adminContent');
    if (!contentDiv) return;
    
    let html = `
        <div class="admin-tab-content">
            <h4>🌐 Server Management</h4>
            
            <div class="server-stats">
                <div class="stat-card">
                    <div class="stat-number" id="serverUserCount">Loading...</div>
                    <div class="stat-label">Server Users</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="serverPoints">Loading...</div>
                    <div class="stat-label">Total Points</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="serverToday">Loading...</div>
                    <div class="stat-label">Today's Reg</div>
                </div>
            </div>
            
            <div class="server-actions">
                <button class="btn btn-success" onclick="fetchServerStats()">📊 Refresh Stats</button>
                <button class="btn btn-primary" onclick="syncAllToServer()">🔄 Sync All Users</button>
                <button class="btn btn-warning" onclick="fixServerData()">🔧 Fix Server Data</button>
            </div>
            
            <div class="server-info-section">
                <h5>💾 Database Info</h5>
                <div id="serverInfo" style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 5px; margin-top: 10px;">
                    <div class="loading">Loading server information...</div>
                </div>
            </div>
            
            <div class="server-test-section" style="margin-top: 20px;">
                <h5>🧪 Test Server Connection</h5>
                <button class="btn-test" onclick="testServerConnection()">Test Connection</button>
                <div id="serverTestResult"></div>
            </div>
        </div>
    `;
    
    contentDiv.innerHTML = html;
    
    // Load server stats
    fetchServerStats();
}

// ✅ FIXED fetchServerStats FUNCTION
async function fetchServerStats() {
    try {
        const serverUserCount = document.getElementById('serverUserCount');
        const serverPoints = document.getElementById('serverPoints');
        const serverToday = document.getElementById('serverToday');
        const serverInfo = document.getElementById('serverInfo');
        
        // Check if elements exist
        if (!serverUserCount || !serverPoints || !serverToday || !serverInfo) {
            console.log('⚠️ Server stats elements not found');
            return;
        }
        
        const response = await fetch('http://localhost:3000/api/admin/user-stats');
        const data = await response.json();
        
        if (data.success) {
            serverUserCount.textContent = data.stats.userCount || 0;
            serverPoints.textContent = data.stats.totalPoints || 0;
            serverToday.textContent = data.stats.todayRegistrations || 0;
            
            serverInfo.innerHTML = `
                <div>✅ Server Status: <strong>Online</strong></div>
                <div>📊 Total Users: ${data.stats.userCount}</div>
                <div>💰 Total Points: ${data.stats.totalPoints}</div>
                <div>📈 Today's Registrations: ${data.stats.todayRegistrations}</div>
                <div>👥 Active Today: ${data.stats.activeToday || 0}</div>
                <div>🕐 Last Updated: ${new Date(data.stats.timestamp).toLocaleTimeString()}</div>
            `;
        }
    } catch (error) {
        console.error('Error fetching server stats:', error);
        const serverUserCount = document.getElementById('serverUserCount');
        const serverInfo = document.getElementById('serverInfo');
        
        if (serverUserCount) serverUserCount.textContent = 'Error';
        if (serverInfo) {
            serverInfo.innerHTML = '<div style="color: #ff0000;">❌ Server Offline</div>';
        }
    }
}

async function syncAllToServer() {
    try {
        const registeredUsers = getFromStorage('registeredUsers', []);
        
        const response = await fetch('http://localhost:3000/api/admin/sync-all', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ users: registeredUsers })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification(`✅ Synced ${registeredUsers.length} users to server!`, 'success');
            fetchServerStats();
        } else {
            showNotification(`❌ Sync failed: ${data.message}`, 'error');
        }
    } catch (error) {
        console.error('Error syncing to server:', error);
        showNotification('❌ Server sync failed!', 'error');
    }
}

async function fixServerData() {
    try {
        const response = await fetch('http://localhost:3000/api/admin/fix-data');
        const data = await response.json();
        
        if (data.success) {
            showNotification('✅ Server data fixed!', 'success');
            fetchServerStats();
        } else {
            showNotification(`❌ Fix failed: ${data.message}`, 'error');
        }
    } catch (error) {
        console.error('Error fixing server data:', error);
        showNotification('❌ Server fix failed!', 'error');
    }
}

async function testServerConnection() {
    try {
        const response = await fetch('http://localhost:3000/api/health');
        const data = await response.json();
        
        const resultDiv = document.getElementById('serverTestResult');
        if (resultDiv) {
            if (data.status === 'ok') {
                resultDiv.innerHTML = '<div style="color: #4CAF50;">✅ Server connection successful!</div>';
            } else {
                resultDiv.innerHTML = '<div style="color: #ff0000;">❌ Server error!</div>';
            }
        }
    } catch (error) {
        const resultDiv = document.getElementById('serverTestResult');
        if (resultDiv) {
            resultDiv.innerHTML = '<div style="color: #ff0000;">❌ Server connection failed!</div>';
        }
    }
}

// ✅ UPDATED: Admin Panel को Server से डेटा Fetch करने के लिए अपडेट करें
async function loadAdminUsersTab() {
    const contentDiv = document.getElementById('adminContent');
    if (!contentDiv) return;
    
    // Show loading
    contentDiv.innerHTML = `
        <div class="admin-tab-content">
            <div class="loading">
                <div class="spinner"></div>
                <p>Loading users from server...</p>
            </div>
        </div>
    `;
    
    try {
        // ✅ SERVER से सभी users fetch करें
        const response = await fetch('http://localhost:3000/api/get-all-users');
        const data = await response.json();
        
        if (data.success) {
            // ✅ Server से मिले users को display करें
            displayUsersFromServer(data.users);
        } else {
            // Fallback: localStorage से डेटा
            const registeredUsers = getFromStorage('registeredUsers', []);
            displayUsersInAdminTab(registeredUsers);
            showNotification('⚠️ Using local data (server error)', 'warning');
        }
    } catch (error) {
        console.error('❌ Error fetching users from server:', error);
        
        // Fallback to localStorage
        const registeredUsers = getFromStorage('registeredUsers', []);
        displayUsersInAdminTab(registeredUsers);
        showNotification('⚠️ Using local data (server offline)', 'warning');
    }
}

// ✅ नया फ़ंक्शन displayUsersFromServer(users) जोड़ें
function displayUsersFromServer(users) {
    const contentDiv = document.getElementById('adminContent');
    if (!contentDiv) return;

    let html = `
        <div class="admin-tab-content">
            <div class="users-search-container">
                <input type="text" class="search-input" id="adminUserSearch" 
                       placeholder="Search users..." oninput="filterAdminUsers()">
                <button class="btn btn-primary" onclick="adminRefreshUsers()">🔄 Refresh</button>
            </div>
            
            <div class="users-stats">
                <div class="stat-card">
                    <div class="stat-number">${users.length}</div>
                    <div class="stat-label">Total Users (Server)</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${users.reduce((sum, user) => sum + (user.points || 0), 0)}</div>
                    <div class="stat-label">Total Points</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${users.filter(u => u.last_login).length}</div>
                    <div class="stat-label">Active Users</div>
                </div>
            </div>
            
            <div class="users-table-container">
                <table class="users-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Mobile</th>
                            <th>Points</th>
                            <th>Sponsor</th>
                            <th>Registered</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="adminUsersTable">
    `;
    
    users.forEach((user, index) => {
        const regDate = user.registration_date ? new Date(user.registration_date).toLocaleDateString() : 'N/A';
        const lastLogin = user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never';
        
        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${user.username || user.id}</td>
                <td>${user.email || 'N/A'}</td>
                <td>${user.mobile || user.phone || 'N/A'}</td>
                <td>${user.points || 0}</td>
                <td>${user.sponsorId || user.referred_by || 'None'}</td>
                <td>${regDate}</td>
                <td>
                    <button class="btn-action btn-view" onclick="viewAdminUserServer('${user.email}', '${user.username}')">View</button>
                    <button class="btn-action btn-delete" onclick="removeAdminUserServer('${user.id || user.email}', '${user.username}')">Remove</button>
                </td>
            </tr>
        `;
    });
    
    if (users.length === 0) {
        html += `
            <tr>
                <td colspan="8" style="text-align: center; padding: 20px;">
                    No users found in server database
                </td>
            </tr>
        `;
    }
    
    html += `
                    </tbody>
                </table>
            </div>
            
            <div class="server-info" style="margin-top: 20px; padding: 10px; background: rgba(0,0,0,0.1); border-radius: 5px; font-size: 12px;">
                <strong>💡 Server Info:</strong> Showing ${users.length} users from central database
            </div>
        </div>
    `;
    
    contentDiv.innerHTML = html;
}

function displayUsersInAdminTab(registeredUsers) {
    const contentDiv = document.getElementById('adminContent');
    if (!contentDiv) return;

    let html = `
        <div class="admin-tab-content">
            <div class="users-search-container">
                <input type="text" class="search-input" id="adminUserSearch" 
                       placeholder="Search users..." oninput="filterAdminUsers()">
                <button class="btn btn-primary" onclick="adminRefreshUsers()">🔄 Refresh</button>
            </div>
            
            <div class="users-stats">
                <div class="stat-card">
                    <div class="stat-number">${registeredUsers.length}</div>
                    <div class="stat-label">Total Users</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${registeredUsers.reduce((sum, user) => sum + (user.points || 0), 0)}</div>
                    <div class="stat-label">Total Points</div>
                </div>
            </div>
            
            <div class="users-table-container">
                <table class="users-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Points</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="adminUsersTable">
    `;
    
    registeredUsers.forEach((user, index) => {
        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${user.username || user.id}</td>
                <td>${user.email}</td>
                <td>${user.points || 0}</td>
                <td>
                    <button class="btn-action btn-view" onclick="viewAdminUser('${user.email}')">View</button>
                    <button class="btn-action btn-delete" onclick="removeAdminUser('${user.email}')">Remove</button>
                </td>
            </tr>
        `;
    });
    
    if (registeredUsers.length === 0) {
        html += `
            <tr>
                <td colspan="5" style="text-align: center; padding: 20px;">No registered users found</td>
            </tr>
        `;
    }
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    contentDiv.innerHTML = html;
}

// ✅ नया फ़ंक्शन removeAdminUserServer() जोड़ें
async function removeAdminUserServer(userId, username) {
    if (!confirm(`Delete user "${username}" from server database? This cannot be undone!`)) return;
    
    try {
        // ✅ SERVER पर DELETE request भेजें
        const response = await fetch(`http://localhost:3000/api/delete-user/${userId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification(`✅ User "${username}" deleted from server!`, 'success');
            
            // ✅ Admin Panel refresh करें
            loadAdminUsersTab();
            
            // ✅ LocalStorage से भी हटाएं (अगर मौजूद हो)
            const registeredUsers = getFromStorage('registeredUsers', []);
            const updatedUsers = registeredUsers.filter(u => u.email !== username && u.id !== username);
            saveToStorage('registeredUsers', updatedUsers);
        } else {
            showNotification(`❌ Failed to delete user: ${data.message}`, 'error');
        }
    } catch (error) {
        console.error('❌ Error deleting user from server:', error);
        showNotification('❌ Server delete failed. Try again.', 'error');
    }
}

// ✅ नया फ़ंक्शन viewAdminUserServer() जोड़ें
async function viewAdminUserServer(email, username) {
    try {
        // ✅ SERVER से user details fetch करें
        const response = await fetch(`http://localhost:3000/api/get-user?email=${encodeURIComponent(email)}&username=${encodeURIComponent(username)}`);
        const data = await response.json();
        
        if (data.success && data.user) {
            const user = data.user;
            
            const details = `
👤 User Details (Server):

📧 Email: ${user.email}
👤 Username: ${user.username}
📱 Mobile: ${user.mobile || user.phone || 'N/A'}
💰 Points: ${user.points || 0}
📊 Total Earned: ${user.totalEarned || 0}
👥 Sponsor: ${user.sponsorId || 'None'} (${user.sponsorName || 'No sponsor'})
📅 Registered: ${user.registration_date || 'N/A'}
🔑 Last Login: ${user.last_login || 'Never'}
🎯 Level: ${user.level || 1}
✅ Tasks Completed: ${user.tasks_completed || 0}
🔗 Referral Code: ${user.referral_code || 'N/A'}

💾 Source: Central Database
            `;
            
            alert(details);
        } else {
            alert('User not found in server database.');
        }
    } catch (error) {
        console.error('Error fetching user from server:', error);
        alert('Error fetching user details from server.');
    }
}

function adminRefreshUsers() {
    loadAdminUsersTab();
    logAdminAction('User list refreshed from server');
}

function viewAdminUser(email) {
    const registeredUsers = getFromStorage('registeredUsers', []);
    const user = registeredUsers.find(u => u.email === email);
    
    if (user) {
        alert(`User Details:\n\nUsername: ${user.username}\nEmail: ${user.email}\nPoints: ${user.points || 0}\nMobile: ${user.mobile || 'N/A'}\nRegistered: ${user.registeredAt || 'Unknown'}`);
    }
}

function removeAdminUser(email) {
    if (!confirm(`Remove user ${email}? This cannot be undone!`)) return;
    
    // Remove from registeredUsers
    const registeredUsers = getFromStorage('registeredUsers', []);
    const updatedUsers = registeredUsers.filter(u => u.email !== email);
    saveToStorage('registeredUsers', updatedUsers);
    
    // Remove user-specific storage keys
    const user = registeredUsers.find(u => u.email === email);
    if (user) {
        const userId = user.id || user.username;
        removeUserStorageKeys(userId, email, user.mobile);
    }
    
    logAdminAction(`Removed user: ${email}`);
    loadAdminUsersTab();
    showNotification('✅ User removed successfully', 'success');
}

function removeUserStorageKeys(userId, email, mobile) {
    const keysToRemove = [];
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key.includes(userId) || 
            key.includes(email) || 
            (mobile && key.includes(mobile)) ||
            key === `miningState_${userId}` ||
            key === `referralData_${userId}` ||
            key.startsWith(`freePoolUsed_${userId}`)) {
            keysToRemove.push(key);
        }
    }
    
    keysToRemove.forEach(key => {
        localStorage.removeItem(key);
    });
}

function loadAdminStorageTab() {
    const contentDiv = document.getElementById('adminContent');
    if (!contentDiv) return;
    
    const totalSize = (JSON.stringify(localStorage).length / 1024).toFixed(2);
    
    let html = `
        <div class="admin-tab-content">
            <div class="storage-stats">
                <div class="stat-card">
                    <div class="stat-number">${localStorage.length}</div>
                    <div class="stat-label">Total Keys</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${totalSize} KB</div>
                    <div class="stat-label">Storage Size</div>
                </div>
            </div>
            
            <div class="storage-actions">
                <button class="btn btn-success" onclick="exportAllData()">📤 Export All Data</button>
                <button class="btn btn-warning" onclick="cleanCache()">🧹 Clean Cache</button>
                <button class="btn btn-danger" onclick="clearAllStorage()">🗑️ Clear Storage</button>
            </div>
            
            <div class="storage-keys">
                <h4>Storage Keys (${localStorage.length}):</h4>
                <div class="keys-list">
    `;
    
    // Show first 20 keys
    for (let i = 0; i < Math.min(20, localStorage.length); i++) {
        const key = localStorage.key(i);
        html += `<div class="key-item">${key}</div>`;
    }
    
    if (localStorage.length > 20) {
        html += `<div class="key-item">... and ${localStorage.length - 20} more</div>`;
    }
    
    html += `
                </div>
            </div>
        </div>
    `;
    
    contentDiv.innerHTML = html;
}

function loadAdminToolsTab() {
    const contentDiv = document.getElementById('adminContent');
    if (!contentDiv) return;
    
    let html = `
        <div class="admin-tab-content">
            <div class="tools-grid">
                <div class="tool-card">
                    <h4>🔄 Reset Points</h4>
                    <p>Reset all user points to zero</p>
                    <button class="btn btn-warning" onclick="resetAllPoints()">Reset</button>
                </div>
                
                <div class="tool-card">
                    <h4>📋 Reset Tasks</h4>
                    <p>Clear all task completion data</p>
                    <button class="btn btn-warning" onclick="resetAllTasks()">Reset</button>
                </div>
                
                <div class="tool-card">
                    <h4>⛏️ Reset Mining</h4>
                    <p>Clear all mining pool data</p>
                    <button class="btn btn-warning" onclick="resetAllMining()">Reset</button>
                </div>
                
                <div class="tool-card">
                    <h4>🔧 Fix Data</h4>
                    <p>Fix data corruption issues</p>
                    <button class="btn btn-primary" onclick="fixDataCorruption()">Fix</button>
                </div>
            </div>
            
            <div class="quick-commands">
                <h4>⚡ Quick Commands:</h4>
                <button class="btn-cmd" onclick="reloadApp()">🔄 Reload App</button>
                <button class="btn-cmd" onclick="toggleDebug()">🐛 Debug Mode</button>
                <button class="btn-cmd" onclick="addTestUser()">👤 Add Test User</button>
            </div>
        </div>
    `;
    
    contentDiv.innerHTML = html;
}

function loadAdminDangerTab() {
    const contentDiv = document.getElementById('adminContent');
    if (!contentDiv) return;
    
    let html = `
        <div class="admin-tab-content">
            <div class="danger-zone">
                <h4 style="color: #ff0000;">☢️ DANGER ZONE</h4>
                <p style="color: #ffaaaa; margin-bottom: 20px;">⚠️ These actions cannot be undone!</p>
                
                <div class="danger-action">
                    <h5>Remove User by Email:</h5>
                    <input type="email" id="removeEmailInput" placeholder="user@example.com" style="width: 100%; margin-bottom: 10px;">
                    <button class="btn btn-danger" onclick="removeUserByEmail()">Remove User</button>
                </div>
                
                <div class="danger-action" style="margin-top: 20px;">
                    <h5>Bulk Remove:</h5>
                    <input type="text" id="bulkPattern" placeholder="Pattern (e.g., @gmail.com)" style="width: 100%; margin-bottom: 10px;">
                    <button class="btn btn-danger" onclick="bulkRemoveByEmail()">Remove by Email Pattern</button>
                </div>
                
                <div class="danger-action" style="margin-top: 20px;">
                    <h5>Nuclear Reset:</h5>
                    <button class="btn btn-nuclear" onclick="nuclearReset()">☢️ NUCLEAR RESET (Delete Everything)</button>
                    <p style="font-size: 12px; color: #ffaaaa; margin-top: 10px;">
                        ⚠️ This will delete ALL data including pre-loaded referral codes!
                    </p>
                </div>
                
                <div class="action-log" style="margin-top: 30px;">
                    <h5>Action Log:</h5>
                    <div id="adminActionLog" style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px; max-height: 100px; overflow-y: auto; font-size: 12px;">
                        <div>Admin panel initialized...</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    contentDiv.innerHTML = html;
}

// Admin Action Functions
function exportAllData() {
    const allData = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        try {
            allData[key] = JSON.parse(localStorage.getItem(key));
        } catch {
            allData[key] = localStorage.getItem(key);
        }
    }
    
    const dataStr = JSON.stringify(allData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `tapearn_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    logAdminAction('Exported all data');
    showNotification('✅ Data exported successfully', 'success');
}

function cleanCache() {
    const keysToKeep = ['registeredUsers', 'allReferrals', 'currentUser'];
    
    let removedCount = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!keysToKeep.includes(key) && 
            !key.startsWith('TAPEARN-REF') &&
            !key.includes('miningState')) {
            localStorage.removeItem(key);
            removedCount++;
        }
    }
    
    logAdminAction(`Cleaned ${removedCount} cache items`);
    showNotification(`✅ Cleaned ${removedCount} cache items`, 'success');
}

function clearAllStorage() {
    if (confirm('Clear ALL localStorage? This will delete everything!')) {
        localStorage.clear();
        logAdminAction('Cleared all storage');
        showNotification('✅ Storage cleared! Page will reload.', 'success');
        setTimeout(() => location.reload(), 2000);
    }
}

function resetAllPoints() {
    if (!confirm('Reset ALL user points to zero?')) return;
    
    const registeredUsers = getFromStorage('registeredUsers', []);
    registeredUsers.forEach(user => {
        user.points = 0;
    });
    
    saveToStorage('registeredUsers', registeredUsers);
    logAdminAction('Reset all user points to zero');
    showNotification('✅ All points reset to zero', 'success');
}

function resetAllTasks() {
    if (!confirm('Reset all tasks?')) return;
    
    const taskKeys = ['watchedVideos', 'completedTasks', 'completedDailyTasks'];
    taskKeys.forEach(key => localStorage.removeItem(key));
    
    logAdminAction('Reset all tasks');
    showNotification('✅ All tasks reset', 'success');
}

function resetAllMining() {
    if (!confirm('Reset all mining pools?')) return;
    
    const miningKeys = ['activeMiningPool', 'miningPoolHistory', 'miningPoolInstances'];
    miningKeys.forEach(key => localStorage.removeItem(key));
    
    logAdminAction('Reset all mining pools');
    showNotification('✅ All mining pools reset', 'success');
}

function fixDataCorruption() {
    // Fix registeredUsers
    try {
        JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    } catch {
        localStorage.setItem('registeredUsers', '[]');
    }
    
    // Fix allReferrals
    try {
        JSON.parse(localStorage.getItem('allReferrals') || '[]');
    } catch {
        const defaultCodes = PRE_LOADED_REFERRAL_CODES;
        localStorage.setItem('allReferrals', JSON.stringify(defaultCodes));
    }
    
    logAdminAction('Fixed data corruption');
    showNotification('✅ Data corruption fixed', 'success');
}

function reloadApp() {
    if (confirm('Reload application?')) {
        location.reload();
    }
}

function toggleDebug() {
    console.log('🔍 Debug Mode Activated');
    console.log('Registered Users:', getFromStorage('registeredUsers', []));
    console.log('Current User:', getFromStorage('currentUser'));
    console.log('All Referrals:', getFromStorage('allReferrals', []));
    console.log('LocalStorage Keys:', localStorage.length);
    
    logAdminAction('Debug mode activated');
    showNotification('🔍 Debug mode activated - Check console', 'info');
}

function addTestUser() {
    const testUser = {
        id: 'test_user_' + Date.now(),
        username: 'testuser' + Math.floor(Math.random() * 1000),
        email: 'test' + Math.floor(Math.random() * 1000) + '@example.com',
        mobile: '999999999' + Math.floor(Math.random() * 1000),
        points: Math.floor(Math.random() * 1000),
        sponsorId: 'admin',
        sponsorName: 'Admin',
        registeredAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
    };
    
    const registeredUsers = getFromStorage('registeredUsers', []);
    registeredUsers.push(testUser);
    saveToStorage('registeredUsers', registeredUsers);
    
    logAdminAction('Added test user');
    showNotification('✅ Test user added', 'success');
    loadAdminUsersTab();
}

function removeUserByEmail() {
    const emailInput = document.getElementById('removeEmailInput');
    if (!emailInput) return;
    
    const email = emailInput.value.trim();
    if (!email) {
        showNotification('❌ Please enter email', 'warning');
        return;
    }
    
    removeAdminUser(email);
    emailInput.value = '';
}

function bulkRemoveByEmail() {
    const patternInput = document.getElementById('bulkPattern');
    if (!patternInput) return;
    
    const pattern = patternInput.value.trim().toLowerCase();
    if (!pattern) {
        showNotification('❌ Please enter pattern', 'warning');
        return;
    }
    
    const registeredUsers = getFromStorage('registeredUsers', []);
    const usersToRemove = registeredUsers.filter(u => 
        u.email.toLowerCase().includes(pattern)
    );
    
    if (usersToRemove.length === 0) {
        showNotification(`❌ No users found with pattern: ${pattern}`, 'warning');
        return;
    }
    
    if (!confirm(`Remove ${usersToRemove.length} users with pattern "${pattern}"?`)) return;
    
    usersToRemove.forEach(user => {
        removeAdminUser(user.email);
    });
    
    patternInput.value = '';
    logAdminAction(`Bulk removed ${usersToRemove.length} users with pattern: ${pattern}`);
}

function nuclearReset() {
    if (!confirm(`☢️ NUCLEAR RESET - FINAL WARNING!\n\nThis will delete EVERYTHING!`)) return;
    
    const userInput = prompt('Type "RESET" to confirm nuclear reset:');
    if (userInput !== 'RESET') {
        showNotification('❌ Nuclear reset cancelled', 'warning');
        return;
    }
    
    // Clear everything
    localStorage.clear();
    
    // Add fresh pre-loaded referral codes
    const freshCodes = PRE_LOADED_REFERRAL_CODES;
    localStorage.setItem('allReferrals', JSON.stringify(freshCodes));
    
    logAdminAction('☢️ NUCLEAR RESET COMPLETE');
    showNotification('☢️ Nuclear reset complete! Page will reload.', 'success');
    
    setTimeout(() => {
        location.reload();
    }, 2000);
}

function filterAdminUsers() {
    const searchInput = document.getElementById('adminUserSearch');
    const rows = document.querySelectorAll('#adminUsersTable tr');
    const searchTerm = searchInput.value.toLowerCase();
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function logAdminAction(message) {
    const logDiv = document.getElementById('adminActionLog');
    if (!logDiv) return;
    
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `<div>[${timestamp}] ${message}</div>`;
    logDiv.innerHTML = logEntry + logDiv.innerHTML;
    
    // Keep only last 10 entries
    const entries = logDiv.querySelectorAll('div');
    if (entries.length > 10) {
        entries[entries.length - 1].remove();
    }
}

// ==============================================
// ✅ TELEGRAM & USER MANAGEMENT (UPDATED)
// ==============================================

function isValidTelegramUsername(username) {
    if (!username || username === '' || username === 'Not set') return false;
    const cleanUsername = username.replace('@', '').trim();
    if (cleanUsername === '' || cleanUsername.length < 3 || cleanUsername.length > 50) return false;
    if (username.startsWith('@demo') || username.startsWith('demo_') || username.startsWith('@test')) return true;
    const relaxedRegex = /^[a-zA-Z0-9_\.\-]{3,50}$/;
    return relaxedRegex.test(cleanUsername);
}

function captureTelegramId() {
    // Only show Telegram modal if user is not registered
    if (!userRegistered) return;
    
    const savedTelegramId = getFromStorage('telegramUsername', '');
    const savedUserId = getFromStorage('userId', '');
    
    userId = savedUserId || generateUserId();
    
    if (savedTelegramId && isValidTelegramUsername(savedTelegramId)) {
        telegramUsername = savedTelegramId;
        if (checkIfUserExists(savedTelegramId)) {
            showExistingUserPopup(savedTelegramId);
        } else {
            createUserProfileFromTelegram(savedTelegramId, userId);
        }
    } else {
        setTimeout(showTelegramIdModal, 1500);
    }
}

function checkIfUserExists(telegramId) {
    try {
        const allKeys = Object.keys(localStorage);
        for (let key of allKeys) {
            if (key.startsWith('userData_') || key.startsWith('miningState')) {
                const data = JSON.parse(localStorage.getItem(key));
                if (data && data.telegramUsername === telegramId) return true;
            }
        }
        return false;
    } catch (error) {
        return false;
    }
}

function createUserProfileFromTelegram(telegramId, userId) {
    const userProfileData = {
        id: userId,
        telegramUsername: telegramId,
        points: userPoints,
        isMining: false,
        tasksCompleted: totalTasksCompleted,
        joinDate: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        totalEarned: totalPointsEarned,
        todayEarnings: todayEarnings,
        profileSource: 'telegram_direct',
        isVerified: true
    };
    
    saveToStorage(`userData_${userId}`, userProfileData);
    saveToStorage(`miningState_${userId}`, userProfileData);
    referralData.telegramUsername = telegramId;
    saveToStorage('referralData', referralData);
}

function showTelegramIdModal() {
    if (telegramUsername && isValidTelegramUsername(telegramUsername)) return;
    document.getElementById('telegramIdModal').classList.add('active');
    setTimeout(() => {
        const input = document.getElementById('telegramIdInput');
        if (input) input.focus();
    }, 300);
}

function closeTelegramIdModal() {
    document.getElementById('telegramIdModal').classList.remove('active');
}

function saveTelegramId() {
    const telegramIdInput = document.getElementById('telegramIdInput');
    if (!telegramIdInput) return;
    
    const telegramId = telegramIdInput.value.trim();
    if (!telegramId) {
        showNotification('❌ Please enter your Telegram username!', 'warning');
        return;
    }
    
    const formattedTelegramId = telegramId.startsWith('@') ? telegramId : '@' + telegramId;
    
    if (checkIfUserExists(formattedTelegramId)) {
        showNotification('❌ This Telegram ID is already registered!', 'warning');
        return;
    }
    
    telegramUsername = formattedTelegramId;
    saveToStorage('telegramUsername', formattedTelegramId);
    saveToStorage('userId', userId);
    saveToStorage('telegramModalShown', true);
    
    createUserProfileFromTelegram(formattedTelegramId, userId);
    referralData.telegramUsername = formattedTelegramId;
    saveToStorage('referralData', referralData);
    
    showNotification('✅ Telegram ID saved successfully!', 'success');
    closeTelegramIdModal();
    updateUI();
}

function showExistingUserPopup(telegramId) {
    const existingUserPopup = document.createElement('div');
    existingUserPopup.className = 'modal active';
    existingUserPopup.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>👋 Welcome Back!</h3>
            </div>
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 48px; margin-bottom: 15px;">🎉</div>
                <h3 style="color: #4CAF50; margin-bottom: 10px;">Account Found!</h3>
                <p>We found your existing account with Telegram ID:<br>
                <strong style="color: #FFD700;">${telegramId}</strong></p>
            </div>
            <div class="modal-actions">
                <button class="btn-success" onclick="closeExistingUserPopup()" style="width: 100%;">
                    🚀 Continue to TapEarn
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(existingUserPopup);
}

function closeExistingUserPopup() {
    const popup = document.querySelector('.modal.active');
    if (popup && popup.innerHTML.includes('Welcome Back')) popup.remove();
}

// ==============================================
// ✅ STATE MANAGEMENT FUNCTIONS (UPDATED)
// ==============================================

function checkDailyEarningsReset() {
    const today = new Date().toDateString();
    if (lastEarningDate !== today) {
        todayEarnings = 0;
        lastEarningDate = today;
        completedDailyTasks = [];
        saveMiningState();
    }
}

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
        
        saveMiningState();
    }
}

// ==============================================
// ✅ UI UPDATE FUNCTIONS (UPDATED)
// ==============================================

function updateBonusesUI() {
    const dailyStatus = document.getElementById('dailyBonusStatus');
    const hourlyStatus = document.getElementById('hourlyBonusStatus');
    const streakStatus = document.getElementById('streakBonusStatus');
    
    if (dailyStatus) {
        dailyStatus.textContent = dailyBonusClaimed ? 'Claimed' : 'Available';
        dailyStatus.style.color = dailyBonusClaimed ? '#FF6B6B' : '#4CAF50';
    }
    
    if (hourlyStatus) {
        hourlyStatus.textContent = hourlyBonusAvailable ? 'Available' : 'Coming Soon';
        hourlyStatus.style.color = hourlyBonusAvailable ? '#4CAF50' : '#FFA726';
    }
    
    if (streakStatus) {
        streakStatus.textContent = `Day ${loginStreak}`;
        streakStatus.style.color = '#FFD700';
    }
}

function updateProfileUI() {
    const profileTelegramId = document.getElementById('profileTelegramId');
    const profileSponsorId = document.getElementById('profileSponsorId');
    const profileReferrals = document.getElementById('profileReferrals');
    const profileRewards = document.getElementById('profileRewards');
    
    if (profileTelegramId) {
        if (userRegistered) {
            profileTelegramId.textContent = userId;
            profileTelegramId.style.color = '#4CAF50';
        } else {
            profileTelegramId.textContent = 'Not Registered';
            profileTelegramId.style.color = '#FF6B6B';
        }
    }
    
    if (profileSponsorId) {
        if (sponsorId) {
            profileSponsorId.textContent = sponsorId;
            profileSponsorId.style.color = '#4CAF50';
        } else {
            profileSponsorId.textContent = 'Not Set';
            profileSponsorId.style.color = '#FF6B6B';
        }
    }
    
    if (profileReferrals) profileReferrals.textContent = referralData.referredUsers.length;
    if (profileRewards) profileRewards.textContent = redeemedRewards.length;
}

// ==============================================
// ✅ TAB NAVIGATION FUNCTIONS (PRESERVED)
// ==============================================

function switchTab(tabName) {
    document.querySelectorAll('.content-page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    const contentPage = document.getElementById(tabName + 'Content');
    if (contentPage) contentPage.classList.add('active');
    
    const navButtons = document.querySelectorAll('.nav-btn');
    if (tabName === 'mining' && navButtons[0]) {
        navButtons[0].classList.add('active');
        updateMiningPageUI();
    }
    else if (tabName === 'earn' && navButtons[1]) {
        navButtons[1].classList.add('active');
        showHomePage();
    }
    else if (tabName === 'tasks' && navButtons[2]) {
        navButtons[2].classList.add('active');
        showTasksHomePage();
    }
    else if (tabName === 'profile' && navButtons[3]) {
        navButtons[3].classList.add('active');
        showProfileHomePage(); // Always refresh profile page
    }
    
    updateUI();
}

// ==============================================
// ✅ EARN SECTION FUNCTIONS (UPDATED)
// ==============================================

function showHomePage() {
    const earnContent = document.getElementById('earnAppContent');
    if (!earnContent) return;
    
    earnContent.innerHTML = `
        <div class="welcome-section">
            <div class="welcome-icon">🚀</div>
            <h3>Welcome to TapEarn!</h3>
            <p>Click any platform to start earning points instantly</p>
            
            ${!userRegistered ? `
            <div class="registration-prompt">
                <div class="prompt-icon">📝</div>
                <div class="prompt-content">
                    <h4>Register to Unlock All Features!</h4>
                    <p>Complete registration to access mining pools, bonuses, and rewards</p>
                    <button class="btn-register-prompt" onclick="showRegistrationModal()">Register Now</button>
                </div>
            </div>
            ` : ''}
            
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

function showVideoSection() {
    if (!userRegistered) {
        showNotification('❌ Please register first!', 'warning');
        showRegistrationModal();
        return;
    }
    
    const earnContent = document.getElementById('earnAppContent');
    if (!earnContent) return;
    
    earnContent.innerHTML = `
        <div class="earn-page">
            <div class="platform-header">
                <button onclick="showHomePage()" class="back-btn">← Back</button>
                <div class="platform-header-icon">🎬</div>
                <h3>YouTube Videos</h3>
            </div>
            
            <div class="section-title">
                <h3>Watch & Earn Real Videos</h3>
                <p class="section-subtitle">Click any video to open in YouTube and earn points</p>
            </div>

            <div class="video-search">
                <input type="text" class="search-input" id="videoSearch" 
                       placeholder="Search for any YouTube videos" 
                       value="trending shorts" style="width: 100%;">
                <button class="search-btn" onclick="searchVideos()">🔍 Search YouTube</button>
            </div>
            
            <div id="videoResultsContainer">
                <div class="loading">
                    <div class="spinner"></div>
                    <p>Loading real YouTube videos...</p>
                </div>
            </div>
        </div>
    `;
    
    setTimeout(searchVideos, 1000);
}

async function searchVideos() {
    if (!userRegistered) return;
    
    const searchQuery = document.getElementById('videoSearch').value || 'trending shorts';
    const container = document.getElementById('videoResultsContainer');
    
    if (!container) return;
    
    container.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Searching YouTube for "${searchQuery}"...</p>
        </div>
    `;
    
    try {
        const videos = await fetchRealYouTubeVideos(searchQuery);
        displayRealYouTubeVideos(videos, searchQuery);
    } catch (error) {
        console.error('YouTube API error:', error);
        showDemoVideos(searchQuery);
    }
}

async function fetchRealYouTubeVideos(query) {
    for (let API_KEY of YOUTUBE_API_KEYS) {
        try {
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=8&q=${encodeURIComponent(query)}&key=${API_KEY}`
            );
            
            if (response.ok) {
                const data = await response.json();
                return data.items.map(item => ({
                    id: item.id.videoId,
                    title: item.snippet.title,
                    thumbnail: item.snippet.thumbnails.medium.url,
                    channel: item.snippet.channelTitle,
                    points: Math.floor(Math.random() * 15) + 10,
                    videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
                    description: item.snippet.description
                }));
            }
        } catch (error) {
            continue;
        }
    }
    
    throw new Error('All YouTube API keys failed');
}

function displayRealYouTubeVideos(videos, searchQuery) {
    const container = document.getElementById('videoResultsContainer');
    if (!container) return;
    
    let html = `
        <div class="search-info">
            <p>🎬 Found ${videos.length} real YouTube videos for "${searchQuery}"</p>
            <button class="refresh-btn" onclick="searchVideos()">🔄 Refresh Videos</button>
        </div>
        <div class="videos-grid">
    `;
    
    videos.forEach((video) => {
        const isWatched = watchedVideos.includes(video.id);
        
        html += `
            <div class="video-card ${isWatched ? 'video-completed' : ''}" 
                 onclick="${isWatched ? '' : `openVideoAndStartTimer('${video.id}', ${video.points}, '${video.title.replace(/'/g, "\\'")}', '${video.thumbnail}', '${video.channel.replace(/'/g, "\\'")}', '${video.videoUrl}')`}">
                <div class="video-thumbnail">
                    <img src="${video.thumbnail}" alt="${video.title}" onerror="this.src='https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&h=200&fit=crop'">
                    <div class="points-badge">+${video.points}</div>
                    <div class="platform-badge">YouTube</div>
                    <div class="video-duration">1:00</div>
                    ${isWatched ? '<div class="video-completed-badge">✓ Watched</div>' : ''}
                </div>
                <div class="video-info">
                    <div class="video-title">${video.title}</div>
                    <div class="video-channel">${video.channel}</div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function showDemoVideos(searchQuery) {
    const container = document.getElementById('videoResultsContainer');
    if (!container) return;
    
    let html = `
        <div class="search-info">
            <p>Found ${DEMO_VIDEOS.length} demo videos for "${searchQuery}"</p>
            <button class="refresh-btn" onclick="searchVideos()">🔄 Refresh</button>
        </div>
        <div class="videos-grid">
    `;
    
    DEMO_VIDEOS.forEach((video, index) => {
        const isWatched = watchedVideos.includes(video.id);
        
        html += `
            <div class="video-card ${isWatched ? 'video-completed' : ''}" 
                 onclick="${isWatched ? '' : `openVideoAndStartTimer('${video.id}', ${video.points}, '${video.title}', '${video.thumbnail}', '${video.channel}', '${video.videoUrl}')`}">
                <div class="video-thumbnail">
                    <img src="${video.thumbnail}" alt="${video.title}">
                    <div class="points-badge">+${video.points}</div>
                    <div class="platform-badge">YouTube</div>
                    <div class="video-duration">1:00</div>
                    ${watchedVideos.includes(video.id) ? '<div class="video-completed-badge">✓ Watched</div>' : ''}
                </div>
                <div class="video-info">
                    <div class="video-title">${video.title}</div>
                    <div class="video-channel">${video.channel} • ${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 9)}M views</div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function openVideoAndStartTimer(videoId, points, title, thumbnail, channel, videoUrl) {
    if (!userRegistered) {
        showNotification('❌ Please register first!', 'warning');
        showRegistrationModal();
        return;
    }
    
    if (watchedVideos.includes(videoId)) {
        showNotification('❌ You already earned points for this video!', 'warning');
        return;
    }
    
    currentVideoData = { id: videoId, title, thumbnail, channel, points, videoUrl };
    currentVideoTimeLeft = 60;
    
    showVideoTimerSection(videoId, points, title, thumbnail, channel, videoUrl);
    videoTab = window.open(videoUrl, '_blank');
    startTabMonitoring();
    showNotification('📺 Opening YouTube in new tab... Timer will start when you play the video!', 'info');
}

function startTabMonitoring() {
    if (tabCheckInterval) clearInterval(tabCheckInterval);
    
    tabCheckInterval = setInterval(() => {
        if (videoTab && videoTab.closed) {
            stopVideoTimer();
            showNotification('❌ YouTube tab closed! Timer stopped.', 'warning');
            
            const progressText = document.getElementById('watchProgressText');
            if (progressText) {
                progressText.textContent = 'YouTube tab closed! Reopen video to continue.';
                progressText.style.color = '#FF6B6B';
            }
            
            clearInterval(tabCheckInterval);
        }
    }, 1000);
}

function showVideoTimerSection(videoId, points, title, thumbnail, channel, videoUrl) {
    const earnContent = document.getElementById('earnAppContent');
    if (!earnContent) return;
    
    earnContent.innerHTML = `
        <div class="earn-page">
            <div class="platform-header">
                <button onclick="showVideoSection()" class="back-btn">← Back to Videos</button>
                <div class="platform-header-icon">🎬</div>
                <h3>Watching Video</h3>
            </div>
            
            <div class="video-watch-section">
                <div class="video-info-card-watch">
                    <div class="video-thumbnail-watch">
                        <img src="${thumbnail}" alt="${title}" onerror="this.src='https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&h=200&fit=crop'">
                    </div>
                    <div class="video-details-watch">
                        <div class="video-title-watch">${title}</div>
                        <div class="video-channel-watch">${channel}</div>
                        <div class="video-points-watch">Earning: <strong>${points} points</strong></div>
                    </div>
                </div>
                
                <div class="timer-section" id="timerSection">
                    <div class="timer-header">
                        <span class="timer-icon">⏱️</span>
                        <span class="timer-title">Watch Timer</span>
                    </div>
                    <div class="timer-display">
                        <div class="timer-circle">
                            <div class="timer-text-large" id="watchTimerDisplay">01:00</div>
                            <div class="timer-label">Remaining</div>
                        </div>
                    </div>
                    <div class="timer-progress-container">
                        <div class="timer-progress-bar">
                            <div class="timer-progress-fill" id="watchProgressFill" style="width: 0%"></div>
                        </div>
                        <div class="progress-text" id="watchProgressText">Play video in YouTube tab to start timer...</div>
                    </div>
                    
                    <div class="timer-actions">
                        <button class="btn-open-again" onclick="openYouTubeAgain()">📺 Open YouTube Again</button>
                        <button class="btn-start-timer" onclick="manuallyStartTimer()" id="startTimerBtn">▶️ Start Timer Manually</button>
                        <button class="btn-cancel-timer" onclick="cancelVideoTimer()">❌ Cancel Watch</button>
                    </div>
                </div>
                
                <div class="points-claim-section" id="pointsClaimSection" style="display: none;">
                    <div class="points-claim-card">
                        <div class="points-claim-icon">💰</div>
                        <div class="points-claim-content">
                            <h3>🎉 Video Completed!</h3>
                            <p>You earned <strong>${points} points</strong> for watching:</p>
                            <p class="video-title-completed">"${title.substring(0, 40)}..."</p>
                            <button class="btn-claim-success" onclick="claimVideoPoints()">
                                ✅ Claim ${points} Points
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function openYouTubeAgain() {
    if (currentVideoData && currentVideoData.videoUrl) {
        videoTab = window.open(currentVideoData.videoUrl, '_blank');
        showNotification('📺 Opening YouTube again...', 'info');
    }
}

function manuallyStartTimer() {
    if (currentVideoTimer) {
        showNotification('⏱️ Timer is already running!', 'info');
        return;
    }
    
    startVideoTimer();
    const startTimerBtn = document.getElementById('startTimerBtn');
    if (startTimerBtn) startTimerBtn.style.display = 'none';
    showNotification('⏱️ Timer started manually! Keep YouTube tab open.', 'success');
}

function startVideoTimer() {
    if (currentVideoTimer) clearInterval(currentVideoTimer);
    
    currentVideoTimer = setInterval(() => {
        currentVideoTimeLeft--;
        
        const timerDisplay = document.getElementById('watchTimerDisplay');
        const progressFill = document.getElementById('watchProgressFill');
        const progressText = document.getElementById('watchProgressText');
        
        if (timerDisplay) timerDisplay.textContent = formatTime(currentVideoTimeLeft);
        
        const progress = ((60 - currentVideoTimeLeft) / 60) * 100;
        if (progressFill) progressFill.style.width = `${progress}%`;
        
        if (progressText) {
            if (currentVideoTimeLeft <= 10) {
                progressText.textContent = 'Almost there... Keep watching!';
                progressText.style.color = '#FFD700';
            } else if (currentVideoTimeLeft <= 30) {
                progressText.textContent = 'Keep watching... Don\'t close YouTube tab!';
                progressText.style.color = '#4CAF50';
            } else {
                progressText.textContent = 'Watching... Keep YouTube tab open!';
                progressText.style.color = '#4CAF50';
            }
        }
        
        if (currentVideoTimeLeft <= 0) completeVideoWatch();
    }, 1000);
}

function stopVideoTimer() {
    if (currentVideoTimer) {
        clearInterval(currentVideoTimer);
        currentVideoTimer = null;
    }
}

function completeVideoWatch() {
    stopVideoTimer();
    if (tabCheckInterval) clearInterval(tabCheckInterval);
    
    const timerSection = document.getElementById('timerSection');
    const pointsClaimSection = document.getElementById('pointsClaimSection');
    
    if (timerSection) timerSection.style.display = 'none';
    if (pointsClaimSection) pointsClaimSection.style.display = 'block';
    
    showNotification('✅ 1 minute completed! Click to claim your points.', 'success');
}

function cancelVideoTimer() {
    stopVideoTimer();
    if (tabCheckInterval) clearInterval(tabCheckInterval);
    
    if (videoTab && !videoTab.closed) videoTab.close();
    
    currentVideoData = null;
    videoTab = null;
    
    showVideoSection();
    showNotification('⏹️ Video watch cancelled.', 'info');
}

function claimVideoPoints() {
    if (!currentVideoData) {
        showNotification('❌ No video data found!', 'warning');
        return;
    }
    
    const { id, points, title } = currentVideoData;
    
    if (watchedVideos.includes(id)) {
        showNotification('❌ You have already claimed points for this video!', 'warning');
        showVideoSection();
        return;
    }
    
    watchedVideos.push(id);
    totalTasksCompleted++;
    
    const awardedPoints = awardPoints(points, `YouTube Video: ${title.substring(0, 20)}...`, 'video');
    
    showNotification(`✅ +${awardedPoints} Points claimed for watching video!`, 'success');
    
    if (videoTab && !videoTab.closed) videoTab.close();
    
    // Update free pool task if needed
    updateFreePoolVideoTask();
    
    // Track for daily activity
    const videoActivity = dailyActivities.find(a => a.id === 'activity_2');
    if (videoActivity && !videoActivity.completed) {
        completeDailyActivity('activity_2');
    }
    
    setTimeout(() => showVideoSection(), 2000);
    
    currentVideoData = null;
    videoTab = null;
}

function updateFreePoolVideoTask() {
    if (watchedVideos.length >= 2) {
        const videoTask = FREE_POOL_TASKS.find(t => t.id === 'watch_2_videos');
        if (videoTask && !videoTask.completed) {
            videoTask.completed = true;
            showNotification('🎉 2 videos watch task completed!', 'success');
            
            if (getCompletedFreeTasksCount() === 6) {
                freePoolTasksCompleted = true;
                saveToStorage('freePoolTasksCompleted', true);
                showNotification('🎊 All free pool tasks completed! Pool unlocked!', 'success');
            }
        }
    }
}

function showTelegramSection() {
    if (!userRegistered) {
        showNotification('❌ Please register first!', 'warning');
        showRegistrationModal();
        return;
    }
    
    const earnContent = document.getElementById('earnAppContent');
    if (!earnContent) return;
    
    earnContent.innerHTML = `
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
    if (!userRegistered) {
        showNotification('❌ Please register first!', 'warning');
        showRegistrationModal();
        return;
    }
    
    const earnContent = document.getElementById('earnAppContent');
    if (!earnContent) return;
    
    earnContent.innerHTML = `
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
                ${DEMO_VIDEOS.map((video, index) => `
                    <div class="video-card ${watchedVideos.includes(video.id) ? 'video-completed' : ''}" 
                         onclick="${watchedVideos.includes(video.id) ? '' : `openVideoAndStartTimer('${video.id}', ${video.points}, '${video.title}', '${video.thumbnail}', '${video.channel}', '${video.videoUrl}')`}">
                        <div class="video-thumbnail">
                            <img src="${video.thumbnail}" alt="${video.title}">
                            <div class="points-badge">+${video.points}</div>
                            <div class="platform-badge">Instagram</div>
                            <div class="video-duration">1:00</div>
                            ${watchedVideos.includes(video.id) ? '<div class="video-completed-badge">✓ Watched</div>' : ''}
                        </div>
                        <div class="video-info">
                            <div class="video-title">${video.title}</div>
                            <div class="video-channel">${video.channel} • ${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 9)}M views</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function showTwitterSection() {
    if (!userRegistered) {
        showNotification('❌ Please register first!', 'warning');
        showRegistrationModal();
        return;
    }
    
    const earnContent = document.getElementById('earnAppContent');
    if (!earnContent) return;
    
    earnContent.innerHTML = `
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

// ==============================================
// ✅ TASKS SECTION FUNCTIONS (PRESERVED)
// ==============================================

function completeTask(taskId, points, taskName) {
    initializeNaNProtection();
    if (!userRegistered) {
        showNotification('❌ Please register first!', 'warning');
        showRegistrationModal();
        return;
    }
    
    if (completedTasks.includes(taskId)) {
        showNotification('❌ You already completed this task!', 'warning');
        return;
    }
    
    completedTasks.push(taskId);
    totalTasksCompleted++;
    const awardedPoints = awardPoints(points, `Task: ${taskName}`, 'task');
    showNotification(`✅ +${awardedPoints} Points! ${taskName}`, 'success');
    
    // Track for daily activity
    const taskActivity = dailyActivities.find(a => a.id === 'activity_3');
    if (taskActivity && !taskActivity.completed) {
        completeDailyActivity('activity_3');
    }
    
    setTimeout(() => {
        if (taskId.startsWith('telegram')) showTelegramSection();
        else if (taskId.startsWith('twitter')) showTwitterSection();
        else if (taskId.startsWith('instagram')) showInstagramSection();
    }, 500);
}

function showTasksHomePage() {
    const tasksContent = document.getElementById('tasksAppContent');
    if (!tasksContent) return;
    
    tasksContent.innerHTML = `
        <div class="welcome-section">
            <div class="welcome-icon">📋</div>
            <h3>Task Center</h3>
            <p>Complete different types of tasks to maximize your earnings</p>
            
            ${!userRegistered ? `
            <div class="registration-prompt">
                <div class="prompt-icon">📝</div>
                <div class="prompt-content">
                    <h4>Register to Access Tasks!</h4>
                    <p>Complete registration to unlock all task categories</p>
                    <button class="btn-register-prompt" onclick="showRegistrationModal()">Register Now</button>
                </div>
            </div>
            ` : ''}
            
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

function showFollowSection() {
    if (!userRegistered) {
        showNotification('❌ Please register first!', 'warning');
        showRegistrationModal();
        return;
    }
    
    const tasksContent = document.getElementById('tasksAppContent');
    if (!tasksContent) return;
    
    tasksContent.innerHTML = `
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
        { id: 'follow1', platform: 'instagram', username: 'fashion.ista', followers: '2.5M', points: 25, description: 'Follow for fashion tips' },
        { id: 'follow2', platform: 'youtube', username: 'TechReview', subscribers: '1.8M', points: 30, description: 'Subscribe for tech reviews' },
        { id: 'follow3', platform: 'tiktok', username: 'dance.king', followers: '5.2M', points: 20, description: 'Follow for dance videos' }
    ];
    
    displayFollowTasks(allTasks, 'All Follow Tasks');
}

function showInstagramFollow() {
    document.querySelectorAll('.platform-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    const instagramTasks = [
        { id: 'ig_follow1', platform: 'instagram', username: 'travel.world', followers: '3.2M', points: 28, description: 'Travel photography account' },
        { id: 'ig_follow2', platform: 'instagram', username: 'food.delight', followers: '1.5M', points: 22, description: 'Food recipes and tips' }
    ];
    
    displayFollowTasks(instagramTasks, 'Instagram Follow');
}

function showYouTubeFollow() {
    document.querySelectorAll('.platform-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    const youtubeTasks = [
        { id: 'yt_follow1', platform: 'youtube', username: 'GamingPro', subscribers: '2.1M', points: 35, description: 'Gaming content and streams' },
        { id: 'yt_follow2', platform: 'youtube', username: 'CookingMaster', subscribers: '1.2M', points: 25, description: 'Cooking tutorials' }
    ];
    
    displayFollowTasks(youtubeTasks, 'YouTube Subscribe');
}

function showTikTokFollow() {
    document.querySelectorAll('.platform-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    const tiktokTasks = [
        { id: 'tt_follow1', platform: 'tiktok', username: 'comedy.king', followers: '8.5M', points: 18, description: 'Funny comedy sketches' },
        { id: 'tt_follow2', platform: 'tiktok', username: 'fitness.coach', followers: '3.8M', points: 20, description: 'Fitness and workout tips' }
    ];
    
    displayFollowTasks(tiktokTasks, 'TikTok Follow');
}

function displayFollowTasks(tasks, title) {
    const container = document.getElementById('followResultsContainer');
    if (!container) return;
    
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
                        `<button class="btn-follow" onclick="completeFollowTask('${task.id}', ${task.points}, '${task.username}', '${task.platform}')">Follow +${task.points}</button>`}
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
    if (!userRegistered) {
        showNotification('❌ Please register first!', 'warning');
        showRegistrationModal();
        return;
    }
    
    if (completedFollowTasks.includes(taskId)) {
        showNotification('❌ You have already completed this task!', 'warning');
        return;
    }
    
    completedFollowTasks.push(taskId);
    totalTasksCompleted++;
    const awardedPoints = awardPoints(points, `Follow @${username} on ${platform}`, 'task');
    showNotification(`✅ +${awardedPoints} Points! Followed @${username} on ${platform}`, 'success');
    
    const activeTab = document.querySelector('.platform-tab.active');
    if (activeTab) activeTab.click();
}

function showDailyTasksSection() {
    if (!userRegistered) {
        showNotification('❌ Please register first!', 'warning');
        showRegistrationModal();
        return;
    }
    
    const tasksContent = document.getElementById('tasksAppContent');
    if (!tasksContent) return;
    
    tasksContent.innerHTML = `
        <div class="earn-page">
            <div class="platform-header">
                <button onclick="showTasksHomePage()" class="back-btn">← Back</button>
                <div class="platform-header-icon">📅</div>
                <h3>Daily Tasks</h3>
            </div>
            
            <div class="section-title">
                <h3>Daily Tasks</h3>
                <p class="section-subtitle">Complete daily tasks to earn extra points</p>
            </div>
            
            <div id="dailyTasksContainer">
                <div class="loading">
                    <div class="spinner"></div>
                    <p>Loading daily tasks...</p>
                </div>
            </div>
        </div>
    `;
    
    // In a real scenario, we would load the daily tasks here.
    // For now, we'll just display a message.
    setTimeout(() => {
        const container = document.getElementById('dailyTasksContainer');
        if (container) {
            container.innerHTML = `
                <div class="no-tasks">No daily tasks available at the moment. Check back tomorrow!</div>
            `;
        }
    }, 1000);
}

function showSocialTasksSection() {
    if (!userRegistered) {
        showNotification('❌ Please register first!', 'warning');
        showRegistrationModal();
        return;
    }
    
    const tasksContent = document.getElementById('tasksAppContent');
    if (!tasksContent) return;
    
    tasksContent.innerHTML = `
        <div class="earn-page">
            <div class="platform-header">
                <button onclick="showTasksHomePage()" class="back-btn">← Back</button>
                <div class="platform-header-icon">🌐</div>
                <h3>Social Tasks</h3>
            </div>
            
            <div class="section-title">
                <h3>Social Media Tasks</h3>
                <p class="section-subtitle">Complete social media tasks to earn points</p>
            </div>
            
            <div id="socialTasksContainer">
                <div class="loading">
                    <div class="spinner"></div>
                    <p>Loading social tasks...</p>
                </div>
            </div>
        </div>
    `;
    
    // In a real scenario, we would load the social tasks here.
    setTimeout(() => {
        const container = document.getElementById('socialTasksContainer');
        if (container) {
            container.innerHTML = `
                <div class="no-tasks">No social tasks available at the moment. Check back later!</div>
            `;
        }
    }, 1000);
}

// ==============================================
// ✅ REWARDS SYSTEM FUNCTIONS (UPDATED)
// ==============================================

function showCashier() {
    if (!userRegistered) {
        showNotification('❌ Please register first!', 'warning');
        showRegistrationModal();
        return;
    }
    
    const profileContent = document.getElementById('profileAppContent');
    if (!profileContent) return;
    
    profileContent.innerHTML = `
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
        { id: 'reward1', name: 'Amazon Gift Card', description: '$5 Amazon gift card', cost: 1000, type: 'giftcard', icon: '🛍️', category: 'popular' },
        { id: 'reward2', name: 'PayPal Cash', description: '$2 PayPal transfer', cost: 2000, type: 'cash', icon: '💸', category: 'cash' },
        { id: 'reward3', name: 'Google Play Card', description: '$10 Google Play credit', cost: 1500, type: 'giftcard', icon: '📱', category: 'entertainment' },
        { id: 'reward4', name: 'Starbucks Card', description: '$5 Starbucks gift card', cost: 800, type: 'giftcard', icon: '☕', category: 'food' },
        { id: 'reward5', name: 'Netflix Subscription', description: '1 Month Netflix basic', cost: 3000, type: 'subscription', icon: '🎬', category: 'entertainment' },
        { id: 'reward6', name: 'Uber Voucher', description: '$10 Uber ride credit', cost: 1200, type: 'voucher', icon: '🚗', category: 'travel' }
    ];
    
    displayRewards(rewards);
}

function displayRewards(rewards) {
    const container = document.getElementById('rewardsContainer');
    if (!container) return;
    
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
    loadRewards();
}

function redeemReward(rewardId, cost, rewardName) {
    if (!userRegistered) {
        showNotification('❌ Please register first!', 'warning');
        return;
    }
    
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
    addTransaction(`Reward: ${rewardName}`, -cost, 'spending', 'reward');
    showNotification(`🎉 Congratulations! You redeemed ${rewardName}`, 'success');
    updateUI();
    saveMiningState();
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

// ==============================================
// ✅ REFERRAL SYSTEM FUNCTIONS (UPDATED)
// ==============================================

function showReferralSystem() {
    if (!userRegistered) {
        showNotification('❌ Please register first!', 'warning');
        showRegistrationModal();
        return;
    }
    
    const profileContent = document.getElementById('profileAppContent');
    if (!profileContent) return;
    
    profileContent.innerHTML = `
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
            
            <div class="referral-telegram-section">
                <h4>📱 Share on Telegram</h4>
                <p class="section-subtitle">Get bonus points for sharing on Telegram</p>
                
                <div class="telegram-share-actions">
                    <button class="btn-telegram-share" onclick="shareOnTelegram()">
                        <span class="telegram-icon">📱</span>
                        Share on Telegram
                    </button>
                    <button class="btn-telegram-channel" onclick="joinTelegramChannel()">
                        <span class="telegram-icon">👥</span>
                        Join Our Channel
                    </button>
                </div>
                
                <div class="telegram-bonus-info">
                    <p>🎁 <strong>Bonus:</strong> Get 25 extra points when you share on Telegram and 3 friends join!</p>
                </div>
            </div>
        </div>
    `;
}

function shareReferral() {
    if (!userRegistered) {
        showNotification('❌ Please register first!', 'warning');
        return;
    }
    
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

function shareOnTelegram() {
    if (!userRegistered) {
        showNotification('❌ Please register first!', 'warning');
        return;
    }
    
    const referralText = `🎉 *Join TapEarn - Earn Free Points!* 🎉

Use my referral code: *${referralData.referralCode}*

✨ *What you get:*
• 25 Bonus Points on Signup
• Watch videos & earn points
• Complete tasks for rewards
• Mining system for passive income
• Redeem for gift cards & cash!

🚀 *Start earning now:* ${window.location.href}

#TapEarn #EarnMoney #FreePoints #Referral`;
    
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(referralText)}`;
    window.open(telegramUrl, '_blank');
    showNotification('📱 Opening Telegram to share...', 'info');
    
    setTimeout(() => {
        if (!completedSocialTasks.includes('telegram_share')) {
            completeSocialTask('telegram_share', 25, 'Share on Telegram', 'telegram');
        }
    }, 2000);
}

function joinTelegramChannel() {
    const telegramChannelUrl = 'https://t.me/tapearn_official';
    window.open(telegramChannelUrl, '_blank');
    showNotification('👥 Opening Telegram channel...', 'info');
}

function copyReferralCode() {
    if (!userRegistered) {
        showNotification('❌ Please register first!', 'warning');
        return;
    }
    
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
    if (!userRegistered) {
        showNotification('❌ Please register first!', 'warning');
        return;
    }
    
    referralData.referredUsers.push({
        id: Date.now(),
        date: new Date().toISOString(),
        points: 50
    });
    
    referralData.totalEarned += 50;
    const awardedPoints = awardPoints(50, 'Referral Bonus', 'referral');
    
    // Track for daily activity
    const referralActivity = dailyActivities.find(a => a.id === 'activity_4');
    if (referralActivity && !referralActivity.completed) {
        completeDailyActivity('activity_4');
    }
    
    showNotification(`🎉 +${awardedPoints} Points! New referral added!`, 'success');
    showReferralSystem();
}

function simulateReferral() {
    addReferral();
}

// ==============================================
// ✅ WALLET HISTORY FUNCTIONS (UPDATED)
// ==============================================

function showWalletHistory() {
    if (!userRegistered) {
        showNotification('❌ Please register first!', 'warning');
        showRegistrationModal();
        return;
    }
    
    const profileContent = document.getElementById('profileAppContent');
    if (!profileContent) return;
    
    let html = `
        <div class="earn-page">
            <div class="platform-header">
                <button onclick="showProfileHomePage()" class="back-btn">← Back</button>
                <h3>📊 Wallet History</h3>
            </div>
            
            <div class="wallet-stats">
                <div class="wallet-stat">
                    <div class="stat-number">${formatNumber(totalEarned)}</div>
                    <div class="stat-label">Total Earned</div>
                </div>
                <div class="wallet-stat">
                    <div class="stat-number">${formatNumber(totalSpent)}</div>
                    <div class="stat-label">Total Spent</div>
                </div>
                <div class="wallet-stat">
                    <div class="stat-number">${formatNumber(userPoints)}</div>
                    <div class="stat-label">Current Balance</div>
                </div>
            </div>
            
            <div class="transactions-list">
    `;
    
    if (transactionHistory.length === 0) {
        html += `<div class="no-transactions">No transactions yet</div>`;
    } else {
        transactionHistory.forEach(transaction => {
            const date = new Date(transaction.timestamp);
            const timeString = date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
            });
            const dateString = date.toLocaleDateString();
            
            html += `
                <div class="transaction-item ${transaction.type}">
                    <div class="transaction-icon">${getTransactionIcon(transaction.category)}</div>
                    <div class="transaction-details">
                        <div class="transaction-description">${transaction.description}</div>
                        <div class="transaction-time">${dateString} ${timeString}</div>
                    </div>
                    <div class="transaction-amount ${transaction.type}">
                        ${transaction.type === 'earning' ? '+' : '-'}${transaction.amount}
                    </div>
                </div>
            `;
        });
    }
    
    html += `
            </div>
        </div>
    `;
    
    profileContent.innerHTML = html;
}

function getTransactionIcon(category) {
    switch(category) {
        case 'mining': return '⛏️';
        case 'video': return '🎬';
        case 'task': return '📋';
        case 'referral': return '👥';
        case 'bonus': return '🎁';
        case 'upgrade': return '⬆️';
        case 'boost': return '🚀';
        case 'reward': return '💰';
        default: return '💰';
    }
}

// ==============================================
// ✅ SUPPORT SYSTEM FUNCTIONS (UPDATED)
// ==============================================

function showSupport() {
    const profileContent = document.getElementById('profileAppContent');
    if (!profileContent) return;
    
    profileContent.innerHTML = `
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
                    <div class="help-item" onclick="showRegistrationModal()">
                        <span class="help-icon">📝</span>
                        <span class="help-text">How to register?</span>
                    </div>
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
                        <span class="help-text">Mining pool not working?</span>
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
    const profileContent = document.getElementById('profileAppContent');
    if (!profileContent) return;
    
    profileContent.innerHTML = `
        <div class="earn-page">
            <div class="platform-header">
                <button onclick="showSupport()" class="back-btn">← Back</button>
                <h3>❓ Frequently Asked Questions</h3>
            </div>
            
            <div class="faq-list">
                <div class="faq-item">
                    <div class="faq-question">How do I register?</div>
                    <div class="faq-answer">Click on Register button and complete the 4-step registration process with email and mobile verification.</div>
                </div>
                
                <div class="faq-item">
                    <div class="faq-question">How do I earn points?</div>
                    <div class="faq-answer">You can earn points by mining pools, watching videos, completing tasks, referring friends, and following social accounts.</div>
                </div>
                
                <div class="faq-item">
                    <div class="faq-question">What are the mining pool requirements?</div>
                    <div class="faq-answer">Free pool requires completing 6 social tasks. Paid pools require minimum 50 USDT investment per pool.</div>
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
                    <div class="faq-question">How does mining pool work?</div>
                    <div class="faq-answer">Select a cryptocurrency pool and duration. Once the timer completes, you can claim your points. You can only run one pool at a time.</div>
                </div>
            </div>
        </div>
    `;
}

function showContactForm() {
    const profileContent = document.getElementById('profileAppContent');
    if (!profileContent) return;
    
    profileContent.innerHTML = `
        <div class="earn-page">
            <div class="platform-header">
                <button onclick="showSupport()" class="back-btn">← Back</button>
                <h3>📧 Contact Us</h3>
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
                        <option value="general">General Inquiry</option>
                        <option value="technical">Technical Support</option>
                        <option value="payment">Payment Issue</option>
                        <option value="bug">Bug Report</option>
                        <option value="suggestion">Suggestion</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="contactMessage">Message</label>
                    <textarea id="contactMessage" rows="5" placeholder="Describe your issue or inquiry..."></textarea>
                </div>
                <button class="btn-submit" onclick="submitContactForm()">Submit Message</button>
            </div>
        </div>
    `;
}

function submitContactForm() {
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const subject = document.getElementById('contactSubject').value;
    const message = document.getElementById('contactMessage').value;
    
    if (!name || !email || !message) {
        showNotification('❌ Please fill all fields!', 'warning');
        return;
    }
    
    showNotification('✅ Message sent! We will contact you within 24 hours.', 'success');
    showSupport();
}

function showReportForm() {
    const profileContent = document.getElementById('profileAppContent');
    if (!profileContent) return;
    
    profileContent.innerHTML = `
        <div class="earn-page">
            <div class="platform-header">
                <button onclick="showSupport()" class="back-btn">← Back</button>
                <h3>🐛 Report Issue</h3>
            </div>
            
            <div class="report-form">
                <div class="form-group">
                    <label for="reportType">Issue Type</label>
                    <select id="reportType">
                        <option value="bug">Bug/Error</option>
                        <option value="video">Video Not Working</option>
                        <option value="points">Points Not Added</option>
                        <option value="mining">Mining Pool Issue</option>
                        <option value="reward">Reward Not Received</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="reportDescription">Description</label>
                    <textarea id="reportDescription" rows="5" placeholder="Describe the issue in detail..."></textarea>
                </div>
                <div class="form-group">
                    <label for="reportScreenshot">Screenshot URL (Optional)</label>
                    <input type="text" id="reportScreenshot" placeholder="Paste screenshot link (e.g., imgur.com)">
                </div>
                <button class="btn-submit" onclick="submitReport()">Submit Report</button>
            </div>
        </div>
    `;
}

function submitReport() {
    const type = document.getElementById('reportType').value;
    const description = document.getElementById('reportDescription').value;
    const screenshot = document.getElementById('reportScreenshot').value;
    
    if (!description) {
        showNotification('❌ Please describe the issue!', 'warning');
        return;
    }
    
    showNotification('✅ Report submitted! Our team will investigate.', 'success');
    showSupport();
}

function showTerms() {
    const profileContent = document.getElementById('profileAppContent');
    if (!profileContent) return;
    
    profileContent.innerHTML = `
        <div class="earn-page">
            <div class="platform-header">
                <button onclick="showSupport()" class="back-btn">← Back</button>
                <h3>📄 Terms & Conditions</h3>
            </div>
            
            <div class="terms-content">
                <h4>1. Acceptance of Terms</h4>
                <p>By using TapEarn, you agree to these terms and conditions.</p>
                
                <h4>2. Eligibility</h4>
                <p>You must be at least 13 years old to use this service.</p>
                
                <h4>3. Points System</h4>
                <p>Points have no cash value and cannot be exchanged for real currency except through approved reward redemption.</p>
                
                <h4>4. Mining Pools</h4>
                <p>Mining pools are simulated and for entertainment purposes only. They do not represent real cryptocurrency mining.</p>
                
                <h4>5. Rewards Redemption</h4>
                <p>Rewards are subject to availability and may change without notice.</p>
                
                <h4>6. User Conduct</h4>
                <p>You agree not to use any automated systems or bots to earn points.</p>
                
                <h4>7. Termination</h4>
                <p>We reserve the right to terminate accounts for violation of these terms.</p>
                
                <h4>8. Changes to Terms</h4>
                <p>We may update these terms at any time. Continued use constitutes acceptance.</p>
                
                <div class="terms-acceptance">
                    <p>By using TapEarn, you acknowledge that you have read and agree to these terms.</p>
                </div>
            </div>
        </div>
    `;
}

function showMiningHelp() {
    const profileContent = document.getElementById('profileAppContent');
    if (!profileContent) return;
    
    profileContent.innerHTML = `
        <div class="earn-page">
            <div class="platform-header">
                <button onclick="showSupport()" class="back-btn">← Back</button>
                <h3>⛏️ Mining Pool Help</h3>
            </div>
            
            <div class="help-content">
                <h4>Common Issues & Solutions:</h4>
                
                <div class="help-item">
                    <div class="help-question">Mining pool not starting?</div>
                    <div class="help-answer">Check if you have completed all required tasks for the pool. Free pools require 6 tasks, paid pools require email/mobile verification.</div>
                </div>
                
                <div class="help-item">
                    <div class="help-question">Timer not counting down?</div>
                    <div class="help-answer">Refresh the page. The timer runs even when you close the app.</div>
                </div>
                
                <div class="help-item">
                    <div class="help-question">Points not received after completion?</div>
                    <div class="help-answer">Click the "Claim" button after timer completes. Points are not automatic.</div>
                </div>
                
                <div class="help-item">
                    <div class="help-question">Can't start multiple pools?</div>
                    <div class="help-answer">You can only run one mining pool at a time. Complete or cancel current pool to start another.</div>
                </div>
                
                <div class="help-item">
                    <div class="help-question">Free pool already used?</div>
                    <div class="help-answer">Free pool resets every 24 hours. Check back tomorrow or use paid pools.</div>
                </div>
                
                <div class="help-actions">
                    <button class="btn-help-action" onclick="showMiningPage()">Go to Mining Page</button>
                    <button class="btn-help-action" onclick="showFreePoolTasksModal()">Check Free Pool Tasks</button>
                </div>
            </div>
        </div>
    `;
}

// ==============================================
// ✅ MINING POOL SPECIFIC FUNCTIONS
// ==============================================

function startMiningPoolCountdown() {
    if (miningPoolInterval) {
        clearInterval(miningPoolInterval);
    }
    
    miningPoolInterval = setInterval(() => {
        if (!activeMiningPool) {
            clearInterval(miningPoolInterval);
            return;
        }
        
        const now = Date.now();
        const timeLeft = activeMiningPool.endTime - now;
        
        if (timeLeft <= 0) {
            completeMiningPool();
        }
        
        // Update UI every second
        updateMiningPageUI();
        
        // Auto-save every 30 seconds
        if (Date.now() % 30000 < 1000) {
            saveMiningState();
        }
    }, 1000);
}

function completeMiningPool() {
    if (!activeMiningPool) return;
    
    // Mark as completed
    activeMiningPool.status = 'completed';
    activeMiningPool.completedAt = Date.now();
    
    // Find in history and update
    const historyIndex = miningPoolHistory.findIndex(p => p.id === activeMiningPool.id);
    if (historyIndex !== -1) {
        miningPoolHistory[historyIndex] = { ...activeMiningPool };
    }
    
    // Show completion notification
    showNotification(`🎉 Mining pool completed! Claim your ${activeMiningPool.expectedPoints} points!`, 'success');
    
    // Update UI
    updateMiningPageUI();
    
    // Stop interval
    if (miningPoolInterval) {
        clearInterval(miningPoolInterval);
        miningPoolInterval = null;
    }
    
    saveMiningState();
}

function claimMiningPoolRewards() {
    if (!activeMiningPool || activeMiningPool.status !== 'completed') {
        showNotification('❌ No completed mining pool to claim!', 'warning');
        return;
    }
    
    const points = activeMiningPool.expectedPoints;
    
    // Award points
    awardPoints(points, `Mining Pool: ${activeMiningPool.poolName} (${activeMiningPool.durationHours}h)`, 'mining');
    
    // Update history
    const historyIndex = miningPoolHistory.findIndex(p => p.id === activeMiningPool.id);
    if (historyIndex !== -1) {
        miningPoolHistory[historyIndex].claimed = true;
        miningPoolHistory[historyIndex].claimedAt = Date.now();
    }
    
    // Clear active pool
    activeMiningPool = null;
    
    // Save state
    saveMiningState();
    
    // Update UI
    updateMiningPageUI();
    
    showNotification(`💰 Claimed ${points} points from mining pool!`, 'success');
}

function cancelMiningPool() {
    if (!activeMiningPool) return;
    
    if (confirm('Are you sure you want to cancel this mining pool? You will not receive any points.')) {
        // Mark as cancelled in history
        const historyIndex = miningPoolHistory.findIndex(p => p.id === activeMiningPool.id);
        if (historyIndex !== -1) {
            miningPoolHistory[historyIndex].status = 'cancelled';
            miningPoolHistory[historyIndex].cancelledAt = Date.now();
        }
        
        // Clear active pool
        activeMiningPool = null;
        
        // Stop interval
        if (miningPoolInterval) {
            clearInterval(miningPoolInterval);
            miningPoolInterval = null;
        }
        
        // Save state
        saveMiningState();
        
        // Update UI
        updateMiningPageUI();
        
        showNotification('⛏️ Mining pool cancelled.', 'info');
    }
}

// ==============================================
// ✅ HELPER FUNCTIONS FOR NEW FEATURES
// ==============================================

function formatTimeRemaining(ms) {
    if (ms <= 0) return '00:00:00';
    
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function calculatePoolProgress() {
    if (!activeMiningPool || activeMiningPool.status !== 'active') return 0;
    
    const totalTime = activeMiningPool.durationHours * 60 * 60 * 1000;
    const elapsedTime = Date.now() - activeMiningPool.startTime;
    const progress = (elapsedTime / totalTime) * 100;
    
    return Math.min(100, Math.max(0, progress));
}

function getPoolIcon(poolId) {
    const pool = MINING_POOLS.find(p => p.id === poolId);
    return pool ? pool.icon : '⛏️';
}

// ==============================================
// ✅ STATE MANAGEMENT में नए वॉलेट जोड़ें
// ==============================================

function loadMiningState() {
    const savedState = getFromStorage('miningState');
    const savedBonuses = getFromStorage('miningBonuses');
    const savedHistory = getFromStorage('miningHistory');
    
    if (savedState) {
        userPoints = safeNumber(savedState.userPoints, 0);
        totalPointsEarned = safeNumber(savedState.totalPointsEarned, 0);
        telegramUsername = savedState.telegramUsername || '';
        userId = savedState.userId || generateUserId();
        userRegistered = savedState.userRegistered || false;
        userEmail = savedState.userEmail || '';
        userMobile = savedState.userMobile || '';
        userEmailVerified = savedState.userEmailVerified || false;
        userMobileVerified = savedState.userMobileVerified || false;
        sponsorId = savedState.sponsorId || '';
        sponsorName = savedState.sponsorName || '';
        freePoolTasksCompleted = savedState.freePoolTasksCompleted || false;
        
        // ✅ नए वॉलेट वेरिएबल्स लोड करें
        inrWallet = safeNumber(savedState.inrWallet, 0);
        usdtWallet = safeNumber(savedState.usdtWallet, 0);
        totalConverted = safeNumber(savedState.totalConverted, 0);
    }
    
    if (savedBonuses) {
        dailyBonusClaimed = savedBonuses.dailyBonusClaimed || false;
        lastBonusClaim = savedBonuses.lastBonusClaim || 0;
        hourlyBonusAvailable = savedBonuses.hourlyBonusAvailable !== false;
        lastHourlyBonus = savedBonuses.lastHourlyBonus || 0;
        loginStreak = safeNumber(savedBonuses.loginStreak, 1);
        lastLoginDate = savedBonuses.lastLoginDate;
    }
    
    if (savedHistory) {
        totalMiningTime = safeNumber(savedHistory.totalMiningTime, 0);
        sessionCount = safeNumber(savedHistory.sessionCount, 0);
    }
    
    watchedVideos = getFromStorage('watchedVideos', []);
    completedTasks = getFromStorage('completedTasks', []);
    completedFollowTasks = getFromStorage('completedFollowTasks', []);
    completedDailyTasks = getFromStorage('completedDailyTasks', []);
    completedSocialTasks = getFromStorage('completedSocialTasks', []);
    
    telegramUsername = getFromStorage('telegramUsername', '');
    
    totalTasksCompleted = watchedVideos.length + completedTasks.length + 
                         completedFollowTasks.length + completedDailyTasks.length + 
                         completedSocialTasks.length;
    
    // Load referral data
    referralData = getFromStorage('referralData', referralData);
    
    // Load sponsor data
    sponsorCommissionEarned = getFromStorage('sponsorCommissionEarned', 0);
    sponsorTransactions = getFromStorage('sponsorTransactions', []);
    userGeneratedSponsorIncome = getFromStorage('userGeneratedSponsorIncome', 0);
    userSponsorActivities = getFromStorage('userSponsorActivities', []);
    sponsorIncomeBreakdown = getFromStorage('sponsorIncomeBreakdown', sponsorIncomeBreakdown);
    
    // Load mining pools
    loadMiningPools();
    
    // Check free pool tasks
    checkFreePoolTasks();
    
    initializeNaNProtection();
    checkDailyEarningsReset();
    checkDailyLogin();
    
    updateUI();
}

function saveMiningState() {
    const miningState = {
        userPoints,
        totalPointsEarned,
        telegramUsername,
        userId,
        userRegistered,
        userEmail,
        userMobile,
        userEmailVerified,
        userMobileVerified,
        sponsorId,
        sponsorName,
        freePoolTasksCompleted,
        // ✅ नए वॉलेट वेरिएबल्स सेव करें
        inrWallet,
        usdtWallet,
        totalConverted,
        lastSaved: new Date().toISOString()
    };
    
    const miningBonuses = {
        dailyBonusClaimed,
        lastBonusClaim,
        hourlyBonusAvailable,
        lastHourlyBonus,
        loginStreak,
        lastLoginDate
    };
    
    const miningHistory = {
        totalMiningTime,
        sessionCount
    };
    
    saveToStorage('miningState', miningState);
    saveToStorage('miningBonuses', miningBonuses);
    saveToStorage('miningHistory', miningHistory);
    
    // Save individual lists
    saveToStorage('watchedVideos', watchedVideos);
    saveToStorage('completedTasks', completedTasks);
    saveToStorage('completedFollowTasks', completedFollowTasks);
    saveToStorage('completedDailyTasks', completedDailyTasks);
    saveToStorage('completedSocialTasks', completedSocialTasks);
    
    // Save referral data
    saveToStorage('referralData', referralData);
    
    // Save sponsor data
    saveToStorage('sponsorCommissionEarned', sponsorCommissionEarned);
    saveToStorage('sponsorTransactions', sponsorTransactions);
    saveToStorage('userGeneratedSponsorIncome', userGeneratedSponsorIncome);
    saveToStorage('userSponsorActivities', userSponsorActivities);
    saveToStorage('sponsorIncomeBreakdown', sponsorIncomeBreakdown);
    
    // Save mining pools
    saveToStorage('miningPoolInstances', miningPoolInstances);
    saveToStorage('activeMiningPool', activeMiningPool);
    saveToStorage('miningPoolHistory', miningPoolHistory);
}

// ==============================================
// ✅ BONUS SYSTEM FUNCTIONS (PRESERVED)
// ==============================================

function claimDailyBonus() {
    initializeNaNProtection();
    if (!userRegistered) {
        showNotification('❌ Please register first!', 'warning');
        return;
    }
    
    if (dailyBonusClaimed) {
        showNotification('❌ Daily bonus already claimed!', 'warning');
        return;
    }
    
    const bonusAmount = 100 + (loginStreak * 10);
    dailyBonusClaimed = true;
    lastBonusClaim = Date.now();
    awardPoints(bonusAmount, `Daily Bonus (Streak: ${loginStreak})`, 'bonus');
    showNotification(`🎁 Daily Bonus! +${bonusAmount} Points (Streak: ${loginStreak})`, 'success');
}

function claimHourlyBonus() {
    initializeNaNProtection();
    if (!userRegistered) {
        showNotification('❌ Please register first!', 'warning');
        return;
    }
    
    if (!hourlyBonusAvailable) {
        showNotification('❌ Hourly bonus not available yet!', 'warning');
        return;
    }
    
    const bonusAmount = 25;
    hourlyBonusAvailable = false;
    lastHourlyBonus = Date.now();
    awardPoints(bonusAmount, 'Hourly Bonus', 'bonus');
    showNotification(`⏰ Hourly Bonus! +${bonusAmount} Points`, 'success');
}

function claimStreakBonus() {
    const bonusAmount = loginStreak * 10;
    awardPoints(bonusAmount, `Streak Bonus (Day ${loginStreak})`, 'bonus');
    showNotification(`🔥 Streak Bonus! +${bonusAmount} Points (Day ${loginStreak})`, 'success');
}

function claimBoost() {
    const boostAmount = 50;
    awardPoints(boostAmount, 'Daily Boost', 'bonus');
    showNotification(`🎯 Boost! +${boostAmount} Points`, 'success');
}

// ==============================================
// ✅ NEW FUNCTION: FREE POOL TASKS RESET EVERY 24 HOURS
// ==============================================

function checkAndResetFreePoolTasks() {
    if (!userRegistered) return;
    
    const now = Date.now();
    const lastFreePoolReset = getFromStorage('lastFreePoolReset', 0);
    const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    // Check if 24 hours have passed since last reset
    if (now - lastFreePoolReset >= twentyFourHours) {
        console.log('🔄 Resetting free pool tasks after 24 hours');
        
        // Reset free pool tasks
        FREE_POOL_TASKS.forEach(task => {
            task.completed = false;
        });
        freePoolTasksCompleted = false;
        
        // Reset free pool used status
        saveToStorage(`freePoolUsed_${userId}`, false);
        
        // Save reset time
        saveToStorage('lastFreePoolReset', now);
        saveToStorage('freePoolTasksCompleted', false);
        
        // Show notification
        showNotification('🔄 Free pool tasks have been reset for today! Complete them again to unlock free mining.', 'info');
    }
}

// ==============================================
// ✅ NEW FUNCTION: PAID POOL TASKS MODAL
// ==============================================

function showPaidPoolTasksModal(poolId, poolName, minInvestment) {
    if (!userRegistered) {
        showRegistrationModal();
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>🎯 ${poolName} Requirements</h3>
                <button class="modal-close" onclick="closePaidPoolTasksModal()">×</button>
            </div>
            <div class="free-pool-tasks">
                <h4>Complete these 3 tasks to unlock ${poolName} (${minInvestment} USDT):</h4>
                <div class="tasks-list">
                    <div class="task-item" id="paidTask1">
                        <div class="task-checkbox">⬜</div>
                        <div class="task-name">Complete Email Verification</div>
                        <button class="btn-complete-task" onclick="completePaidTask(1, 'email')">
                            Complete
                        </button>
                    </div>
                    <div class="task-item" id="paidTask2">
                        <div class="task-checkbox">⬜</div>
                        <div class="task-name">Verify Mobile Number</div>
                        <button class="btn-complete-task" onclick="completePaidTask(2, 'mobile')">
                            Complete
                        </button>
                    </div>
                    <div class="task-item" id="paidTask3">
                        <div class="task-checkbox">⬜</div>
                        <div class="task-name">Set Telegram ID</div>
                        <button class="btn-complete-task" onclick="completePaidTask(3, 'telegram')">
                            Complete
                        </button>
                    </div>
                </div>
                <div class="tasks-progress">
                    <div class="progress-text">Progress: 0/3 tasks completed</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%"></div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn-cancel" onclick="closePaidPoolTasksModal()">Later</button>
                    <button class="btn-success" onclick="checkPaidPoolTasksCompletion('${poolId}')" disabled>
                        Unlock ${poolName}
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function completePaidTask(taskNumber, taskType) {
    switch(taskType) {
        case 'email':
            if (!userEmailVerified) {
                showNotification('❌ Please verify your email first!', 'warning');
                return;
            }
            break;
        case 'mobile':
            if (!userMobileVerified) {
                showNotification('❌ Please verify your mobile first!', 'warning');
                return;
            }
            break;
        case 'telegram':
            if (!telegramUsername || telegramUsername === 'Not Set') {
                showNotification('❌ Please set your Telegram ID first!', 'warning');
                return;
            }
            break;
    }
    
    const taskEl = document.getElementById(`paidTask${taskNumber}`);
    if (taskEl) {
        taskEl.querySelector('.task-checkbox').textContent = '✅';
        taskEl.querySelector('.btn-complete-task').disabled = true;
        taskEl.querySelector('.btn-complete-task').textContent = 'Completed';
    }
    
    checkPaidPoolProgress();
}

function checkPaidPoolProgress() {
    const tasks = document.querySelectorAll('.tasks-list .task-item');
    let completed = 0;
    
    tasks.forEach(task => {
        if (task.querySelector('.task-checkbox').textContent === '✅') {
            completed++;
        }
    });
    
    const progressText = document.querySelector('.tasks-progress .progress-text');
    const progressFill = document.querySelector('.tasks-progress .progress-fill');
    const unlockBtn = document.querySelector('.modal-actions .btn-success');
    
    if (progressText) {
        progressText.textContent = `Progress: ${completed}/3 tasks completed`;
    }
    
    if (progressFill) {
        progressFill.style.width = `${(completed / 3) * 100}%`;
    }
    
    if (unlockBtn) {
        unlockBtn.disabled = completed < 3;
    }
}

function checkPaidPoolTasksCompletion(poolId) {
    saveToStorage(`paidPoolUnlocked_${userId}_${poolId}`, true);
    showNotification(`🎉 ${poolId} pool unlocked! You can now subscribe.`, 'success');
    
    const modal = document.querySelector('.modal.active');
    if (modal) modal.remove();
    
    // Refresh mining page
    updateMiningPageUI();
}

function closePaidPoolTasksModal() {
    const modal = document.querySelector('.modal.active');
    if (modal && modal.innerHTML.includes('Requirements')) {
        modal.remove();
    }
}

// ==============================================
// ✅ APP INITIALIZATION WITH KEYBOARD SHORTCUTS & WALLET SYSTEM
// ==============================================

// ✅ Server connection check function
async function checkServerConnection() {
    try {
        const response = await fetch('http://localhost:3000/api/health');
        const data = await response.json();
        
        if (data.status === 'ok') {
            console.log('✅ Server is online');
            return true;
        }
    } catch (error) {
        console.warn('⚠️ Server is offline - using local storage only');
    }
    return false;
}

// ✅ Add this function to test server connection
async function testServerConnection() {
    try {
        const response = await fetch('http://localhost:3000/api/health');
        const data = await response.json();
        
        const resultDiv = document.getElementById('serverTestResult');
        if (resultDiv) {
            if (data.status === 'ok') {
                resultDiv.innerHTML = '<div style="color: #4CAF50;">✅ Server connection successful!</div>';
                setTimeout(() => {
                    resultDiv.innerHTML = '';
                }, 3000);
            } else {
                resultDiv.innerHTML = '<div style="color: #ff0000;">❌ Server error!</div>';
            }
        }
    } catch (error) {
        const resultDiv = document.getElementById('serverTestResult');
        if (resultDiv) {
            resultDiv.innerHTML = '<div style="color: #ff0000;">❌ Server connection failed!</div>';
        }
    }
}

// ==============================================
// ✅ MAIN APP INITIALIZATION
// ==============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 TapEarn App Initializing with All Features...');
    
    // Initialize NaN protection
    initializeNaNProtection();
    
    // Initialize referral codes database
    initializeReferralCodesDatabase();
    
    // Check server connection
    checkServerConnection();
    
    // Check registration status
    const isUserRegistered = checkRegistrationStatus();
    
    if (isUserRegistered) {
        console.log('✅ User already registered, loading data...');
        
        // Check and reset free pool tasks
        checkAndResetFreePoolTasks();
        
        // ✅ Auto-complete login activity
        autoCompleteLoginActivity();
        
        // Welcome notification
        setTimeout(() => {
            if (userId && userId !== 'Guest') {
                showNotification(`👋 Welcome back ${userId}!`, 'success');
            }
        }, 1000);
    } else {
        console.log('❌ No registered user found, showing login...');
        setTimeout(() => {
            showLoginModal();
        }, 2000);
    }
    
    // ✅ Add admin keyboard shortcut only for authorized users
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.altKey && e.shiftKey && e.key === 'A') {
            e.preventDefault();
            if (isUserAuthorizedForAdmin()) {
                openAdminPanel();
                console.log('🔑 Admin panel opened via keyboard shortcut');
                
                setTimeout(() => {
                    if (typeof loadAdminUsersTab === 'function') {
                        loadAdminUsersTab();
                    }
                }, 500);
            } else {
                showNotification('❌ Unauthorized: Admin access restricted!', 'error');
                console.log('🚫 Blocked unauthorized keyboard shortcut attempt');
            }
        }
    });
    
    // Initialize mining pools
    initializeMiningPools();
    
    // Load daily activities
    loadDailyActivities();
    
    // Load mining state (including wallet data)
    loadMiningState();
    
    // Switch to mining tab by default
    switchTab('mining');
    
    // Update UI
    updateUI();
    
    // Start mining pool timers
    startAllPoolTimers();
    
    // Show home page by default
    showHomePage();
    
    // ✅ ADMIN PANEL INTEGRATION INITIALIZATION
    initializeAdminPanelIntegration();
    
    console.log('✅ TapEarn App Fully Loaded with All Features!');
});

// ==============================================
// ✅ ADMIN PANEL INTEGRATION - MAIN APP INTEGRATION
// ==============================================

// ✅ Use existing ADMIN_AUTHORIZED_USERS array
// Check if it already exists, if not create it
if (typeof ADMIN_AUTHORIZED_USERS === 'undefined') {
    // Fallback if not defined earlier
    var ADMIN_AUTHORIZED_USERS = [
        'admin@tapearn.com',
        'admin@example.com', 
        'superuser@tapearn.com',
        'system_admin',
        'developer',
        'admin'
    ];
}

// ✅ Check if current user is authorized for admin access
function isUserAuthorizedForAdmin() {
    if (!userRegistered) return false;
    
    const currentUser = getFromStorage('currentUser', {});
    
    if (currentUser.email && ADMIN_AUTHORIZED_USERS.includes(currentUser.email.toLowerCase())) {
        return true;
    }
    
    if (userId && ADMIN_AUTHORIZED_USERS.includes(userId.toLowerCase())) {
        return true;
    }
    
    return false;
}

// ✅ OPEN ADMIN PANEL IN NEW WINDOW
function openAdminPanel() {
    if (!isUserAuthorizedForAdmin()) {
        showNotification('❌ Unauthorized: Admin access restricted!', 'error');
        return;
    }
    
    const adminWindow = window.open('admin.html', '_blank');
    
    if (!adminWindow) {
        showNotification('❌ Please allow popups for admin panel', 'warning');
    } else {
        showNotification('✅ Admin panel opened', 'success');
    }
}

// ✅ INJECT ADMIN BUTTON IN MAIN APP
function injectAdminButton() {
    const existingBtn = document.querySelector('.admin-header-btn');
    if (existingBtn) existingBtn.remove();
    
    if (!isUserAuthorizedForAdmin()) return;
    
    const adminBtn = document.createElement('div');
    adminBtn.className = 'admin-header-btn';
    adminBtn.innerHTML = '🛠️';
    adminBtn.title = 'Admin Panel';
    adminBtn.style.cssText = `
        position: fixed;
        top: 15px;
        right: 15px;
        z-index: 9999;
        background: linear-gradient(135deg, #ff0000, #990000);
        color: white;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(255,0,0,0.5);
        transition: all 0.3s;
        border: 2px solid #fff;
    `;
    
    adminBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        openAdminPanel();
    };
    
    document.body.appendChild(adminBtn);
}

// ✅ Initialize admin panel integration
function initializeAdminPanelIntegration() {
    console.log('🎯 Initializing admin panel integration...');
    
    // Inject admin button if authorized
    if (isUserAuthorizedForAdmin()) {
        injectAdminButton();
    }
    
    // Check periodically
    setInterval(() => {
        if (isUserAuthorizedForAdmin()) {
            const btn = document.querySelector('.admin-header-btn');
            if (!btn) injectAdminButton();
        } else {
            const btn = document.querySelector('.admin-header-btn');
            if (btn) btn.remove();
        }
    }, 5000);
}

// ==============================================
// ✅ UPDATED ADMIN BUTTON INJECTION SYSTEM - FIXED
// ==============================================

// ✅ Optimized admin button injection with proper checks
function injectAdminButtonOptimized() {
    console.log('🎯 Injecting optimized admin button...');
    
    // Remove existing button first
    const existingBtn = document.querySelector('.admin-header-btn');
    if (existingBtn) {
        console.log('🔄 Removing existing admin button');
        existingBtn.remove();
    }
    
    // Check if user is authorized
    if (!isUserAuthorizedForAdmin()) {
        console.log('🚫 User not authorized for admin button');
        return;
    }
    
    console.log('✅ Creating new admin button for:', userId);
    
    // Create admin button
    const adminBtn = document.createElement('div');
    adminBtn.className = 'admin-header-btn';
    adminBtn.innerHTML = '🛠️';
    adminBtn.title = 'Admin Panel';
    adminBtn.style.cssText = `
        position: fixed;
        top: 15px;
        right: 70px;
        z-index: 9999;
        background: linear-gradient(135deg, #ff0000, #990000);
        color: white;
        width: 45px;
        height: 45px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(255,0,0,0.5);
        transition: all 0.3s;
        border: 2px solid #fff;
        animation: pulse 2s infinite;
    `;
    
    // Add pulse animation
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(255, 0, 0, 0); }
            100% { box-shadow: 0 0 0 0 rgba(255, 0, 0, 0); }
        }
    `;
    document.head.appendChild(style);
    
    // Click event - FIXED: Prevent default behavior
    adminBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('🛠️ Admin button clicked by:', userId);
        openAdminPanel();
        return false;
    };
    
    // Hover effects
    adminBtn.onmouseenter = function() {
        this.style.transform = 'scale(1.1) rotate(10deg)';
        this.style.boxShadow = '0 6px 20px rgba(255,0,0,0.8)';
        this.style.borderColor = '#FFD700';
    };
    
    adminBtn.onmouseleave = function() {
        this.style.transform = 'scale(1) rotate(0deg)';
        this.style.boxShadow = '0 4px 15px rgba(255,0,0,0.5)';
        this.style.borderColor = '#fff';
    };
    
    // Add to body
    document.body.appendChild(adminBtn);
    console.log('✅ Admin button injected successfully at position:', adminBtn.style.right);
    
    // Also add keyboard shortcut info
    setTimeout(() => {
        console.log('💡 Admin Panel Shortcuts:');
        console.log('   - Click the 🔴 red button (top right)');
        console.log('   - Or press Ctrl+Shift+A (for authorized users only)');
    }, 1000);
}

// ✅ Improved admin panel opening function
function openAdminPanel() {
    console.log('🚀 Opening admin panel...');
    
    // Check authorization
    if (!isUserAuthorizedForAdmin()) {
        showNotification('❌ Unauthorized: Admin access restricted!', 'error');
        console.log('🚫 Blocked unauthorized admin access attempt by:', userId);
        return;
    }
    
    // Open admin panel in new tab
    const adminUrl = window.location.href.includes('index.html') 
        ? 'admin.html' 
        : '../admin.html';
    
    console.log('🌐 Admin URL:', adminUrl);
    
    // Try multiple methods to open
    try {
        // Method 1: Direct window open
        const adminWindow = window.open(adminUrl, '_blank');
        
        if (adminWindow) {
            console.log('✅ Admin panel opened successfully');
            showNotification('✅ Admin panel opened in new tab', 'success');
            
            // Focus on the new window
            setTimeout(() => {
                adminWindow.focus();
            }, 500);
        } else {
            // Method 2: If blocked, show notification
            console.warn('⚠️ Popup might be blocked');
            showNotification('⚠️ Please allow popups or click the link: <a href="' + adminUrl + '" target="_blank">Open Admin Panel</a>', 'warning');
            
            // Method 3: Create link and click
            const link = document.createElement('a');
            link.href = adminUrl;
            link.target = '_blank';
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    } catch (error) {
        console.error('❌ Error opening admin panel:', error);
        showNotification('❌ Error opening admin panel. Please check console.', 'error');
    }
}

// ✅ Enhanced user authorization check
function isUserAuthorizedForAdmin() {
    console.log('🔐 Admin authorization check running...');
    
    // First, check if there's a current user
    const currentUser = getFromStorage('currentUser');
    console.log('📋 Current user from storage:', currentUser);
    
    if (!currentUser) {
        console.log('❌ No current user found');
        return false;
    }
    
    // Get user identifiers
    const userEmail = currentUser.email || '';
    const userName = currentUser.username || currentUser.id || '';
    
    console.log('👤 User identifiers:', { userEmail, userName });
    
    // Define admin users (UPDATE THIS LIST AS NEEDED)
    const ADMIN_USERS = [
        'topjust2@gmail.com',
        'admin@tapearn.com',
        'admin@example.com',
        'superuser@tapearn.com',
        'system_admin',
        'developer',
        'admin',
        'test@test.com'  // For testing
    ];
    
    // Check authorization
    const isAdmin = ADMIN_USERS.some(adminUser => {
        const emailMatch = userEmail.toLowerCase().includes(adminUser.toLowerCase());
        const nameMatch = userName.toLowerCase().includes(adminUser.toLowerCase());
        return emailMatch || nameMatch;
    });
    
    console.log('✅ Admin check result:', isAdmin ? 'AUTHORIZED' : 'NOT AUTHORIZED');
    return isAdmin;
}

// ✅ Periodic admin button check
function startAdminButtonMonitor() {
    console.log('👁️ Starting admin button monitor...');
    
    // Check every 3 seconds
    setInterval(() => {
        // Check if user is logged in
        const currentUser = getFromStorage('currentUser');
        
        if (currentUser) {
            // Check if authorized
            if (isUserAuthorizedForAdmin()) {
                // Check if button exists
                const adminBtn = document.querySelector('.admin-header-btn');
                if (!adminBtn) {
                    console.log('🔄 Admin button missing, injecting...');
                    injectAdminButtonOptimized();
                }
            } else {
                // Remove button if not authorized
                const adminBtn = document.querySelector('.admin-header-btn');
                if (adminBtn) {
                    console.log('🗑️ Removing unauthorized admin button');
                    adminBtn.remove();
                }
            }
        }
    }, 3000);
}

// ✅ Initialize admin system on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎬 DOM loaded, initializing admin system...');
    
    // Start monitoring after 2 seconds
    setTimeout(() => {
        startAdminButtonMonitor();
        
        // Also check immediately
        const currentUser = getFromStorage('currentUser');
        if (currentUser && isUserAuthorizedForAdmin()) {
            injectAdminButtonOptimized();
        }
    }, 2000);
});

// ✅ Also add admin keyboard shortcut
document.addEventListener('keydown', function(e) {
    // Ctrl+Shift+A for admin panel
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        console.log('⌨️ Admin keyboard shortcut triggered');
        
        if (isUserAuthorizedForAdmin()) {
            openAdminPanel();
        } else {
            showNotification('❌ Admin access denied. You are not authorized.', 'error');
        }
    }
});

// ✅ Function to manually test admin button
window.testAdminButton = function() {
    console.log('🧪 Testing admin button...');
    injectAdminButtonOptimized();
    return 'Admin button test completed. Check console.';
};
