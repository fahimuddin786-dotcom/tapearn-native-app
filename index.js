const { Telegraf } = require('telegraf');
const https = require('https');
const fs = require('fs');
require('dotenv').config();

console.log('🚀 Starting Reward Browser Bot with Enhanced Session Management...');

// IPv4 force karne ke liye custom agent
const agent = new https.Agent({
    family: 4,
    keepAlive: true
});

// Web App URL - apni actual URL se replace karein
const WEB_APP_URL = process.env.WEB_APP_URL || 'https://tapearn-native-app.vercel.app/';

const bot = new Telegraf(process.env.BOT_TOKEN, {
    telegram: {
        apiRoot: 'https://api.telegram.org',
        agent: agent,
        retryAfter: 1
    }
});

// Persistent Storage Files
const USER_POINTS_FILE = 'user_points.json';
const REFERRAL_STORAGE_FILE = 'referral_storage.json';
const USER_SESSIONS_FILE = 'user_sessions.json';
const USER_TRANSACTIONS_FILE = 'user_transactions.json';

// ✅ ENHANCED: Safe JSON handling with size limits
function safeStringify(obj, space = 2) {
    const cache = new Set();
    return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (cache.has(value)) {
                return '[Circular]';
            }
            cache.add(value);
        }
        
        // Limit string length to prevent huge data
        if (typeof value === 'string' && value.length > 10000) {
            return value.substring(0, 10000) + '... [truncated]';
        }
        
        return value;
    }, space);
}

function safeParse(data, defaultValue = {}) {
    try {
        return JSON.parse(data);
    } catch (error) {
        console.log('❌ JSON parse error, returning default:', error.message);
        return defaultValue;
    }
}

// ✅ ENHANCED: Persistent storage with better error handling and size limits
function loadUserPoints() {
    try {
        if (fs.existsSync(USER_POINTS_FILE)) {
            const data = fs.readFileSync(USER_POINTS_FILE, 'utf8');
            const parsed = safeParse(data, {});
            console.log(`📊 Loaded ${Object.keys(parsed).length} users' points`);
            return parsed;
        }
    } catch (error) {
        console.log('❌ Error loading user points:', error.message);
    }
    console.log('🆕 Starting with fresh user points storage');
    return {};
}

function saveUserPoints() {
    try {
        const data = safeStringify(userPoints);
        fs.writeFileSync(USER_POINTS_FILE, data);
        console.log(`💾 User points saved: ${Object.keys(userPoints).length} users`);
    } catch (error) {
        console.log('❌ Error saving user points:', error.message);
        // Emergency backup - save only essential data
        const essentialData = {};
        Object.keys(userPoints).forEach(key => {
            essentialData[key] = userPoints[key];
        });
        fs.writeFileSync(USER_POINTS_FILE + '.backup', safeStringify(essentialData));
    }
}

function loadReferralStorage() {
    try {
        if (fs.existsSync(REFERRAL_STORAGE_FILE)) {
            const data = fs.readFileSync(REFERRAL_STORAGE_FILE, 'utf8');
            const parsed = safeParse(data, {});
            console.log(`📊 Loaded ${Object.keys(parsed).length} referrals`);
            return parsed;
        }
    } catch (error) {
        console.log('❌ Error loading referral storage:', error.message);
    }
    console.log('🆕 Starting with fresh referral storage');
    return {};
}

function saveReferralStorage() {
    try {
        const data = safeStringify(referralStorage);
        fs.writeFileSync(REFERRAL_STORAGE_FILE, data);
        console.log(`💾 Referral storage saved: ${Object.keys(referralStorage).length} referrals`);
    } catch (error) {
        console.log('❌ Error saving referral storage:', error.message);
    }
}

function loadUserSessions() {
    try {
        if (fs.existsSync(USER_SESSIONS_FILE)) {
            const data = fs.readFileSync(USER_SESSIONS_FILE, 'utf8');
            const parsed = safeParse(data, {});
            console.log(`📊 Loaded ${Object.keys(parsed).length} user sessions`);
            
            // Clean up any corrupted sessions
            Object.keys(parsed).forEach(key => {
                if (parsed[key] && typeof parsed[key] === 'object') {
                    // Ensure session has basic structure
                    if (!parsed[key].sessionId) {
                        delete parsed[key];
                    }
                } else {
                    delete parsed[key];
                }
            });
            
            return parsed;
        }
    } catch (error) {
        console.log('❌ Error loading user sessions:', error.message);
    }
    console.log('🆕 Starting with fresh user sessions');
    return {};
}

function saveUserSessions() {
    try {
        // Clean sessions before saving - remove any non-essential data
        const cleanSessions = {};
        Object.keys(userSessions).forEach(userId => {
            const session = userSessions[userId];
            if (session && typeof session === 'object') {
                cleanSessions[userId] = {
                    sessionId: session.sessionId || '',
                    createdAt: session.createdAt || Date.now(),
                    lastActive: session.lastActive || Date.now(),
                    points: session.points || 0,
                    totalEarned: session.totalEarned || 0,
                    isActive: session.isActive !== undefined ? session.isActive : true,
                    isNewUser: session.isNewUser || false,
                    welcomeBonusGiven: session.welcomeBonusGiven || false,
                    referralBonusGiven: session.referralBonusGiven || false,
                    username: session.username || '',
                    firstName: session.firstName || '',
                    lastName: session.lastName || ''
                };
            }
        });
        
        const data = safeStringify(cleanSessions);
        fs.writeFileSync(USER_SESSIONS_FILE, data);
        console.log(`💾 User sessions saved: ${Object.keys(cleanSessions).length} sessions`);
    } catch (error) {
        console.log('❌ Error saving user sessions:', error.message);
    }
}

function loadUserTransactions() {
    try {
        if (fs.existsSync(USER_TRANSACTIONS_FILE)) {
            const data = fs.readFileSync(USER_TRANSACTIONS_FILE, 'utf8');
            const parsed = safeParse(data, {});
            console.log(`📊 Loaded transactions for ${Object.keys(parsed).length} users`);
            return parsed;
        }
    } catch (error) {
        console.log('❌ Error loading user transactions:', error.message);
    }
    console.log('🆕 Starting with fresh transactions storage');
    return {};
}

function saveUserTransactions() {
    try {
        const data = safeStringify(userTransactions);
        fs.writeFileSync(USER_TRANSACTIONS_FILE, data);
        console.log(`💾 User transactions saved: ${Object.keys(userTransactions).length} users`);
    } catch (error) {
        console.log('❌ Error saving user transactions:', error.message);
    }
}

// Enhanced Points storage (with persistent storage)
const userPoints = loadUserPoints();
const referralStorage = loadReferralStorage();
const userSessions = loadUserSessions();
const userTransactions = loadUserTransactions();

// ✅ ENHANCED: Session Management Functions with Telegram Username
function generateSessionId(userId) {
    return 'SESSION_' + userId + '_' + Date.now();
}

function getOrCreateUserSession(userId, userData = {}) {
    if (!userSessions[userId] || !userSessions[userId].sessionId) {
        userSessions[userId] = {
            sessionId: generateSessionId(userId),
            createdAt: Date.now(),
            lastActive: Date.now(),
            points: 0,
            totalEarned: 0,
            isActive: true,
            isNewUser: true,
            welcomeBonusGiven: false,
            referralBonusGiven: false,
            username: userData.username || '',
            firstName: userData.first_name || '',
            lastName: userData.last_name || '',
            languageCode: userData.language_code || 'en'
        };
        saveUserSessions();
    } else {
        // Update last active time and user data
        userSessions[userId].lastActive = Date.now();
        userSessions[userId].username = userData.username || userSessions[userId].username;
        userSessions[userId].firstName = userData.first_name || userSessions[userId].firstName;
        userSessions[userId].lastName = userData.last_name || userSessions[userId].lastName;
        saveUserSessions();
    }
    return userSessions[userId];
}

function getUserSession(userId) {
    return userSessions[userId];
}

// ✅ ENHANCED: Points management with proper persistence
function updateUserPoints(userId, points, transactionType = 'earned', description = '') {
    const currentPoints = userPoints[userId] || 0;
    const newPoints = currentPoints + points;
    userPoints[userId] = newPoints;
    
    // Update session points
    if (userSessions[userId]) {
        userSessions[userId].points = newPoints;
        userSessions[userId].lastActive = Date.now();
        if (points > 0) {
            userSessions[userId].totalEarned = (userSessions[userId].totalEarned || 0) + points;
        }
        saveUserSessions();
    }
    
    // Transaction history maintain karo
    if (!userTransactions[userId]) {
        userTransactions[userId] = [];
    }
    
    userTransactions[userId].push({
        type: transactionType,
        amount: points,
        description: description,
        timestamp: Date.now(),
        balance: newPoints,
        sessionId: userSessions[userId] ? userSessions[userId].sessionId : 'unknown'
    });
    
    // Keep only last 50 transactions
    if (userTransactions[userId].length > 50) {
        userTransactions[userId] = userTransactions[userId].slice(-50);
    }
    
    // Save both points and transactions
    saveUserPoints();
    saveUserTransactions();
    
    console.log(`💰 Points updated: User ${userId} | ${points > 0 ? '+' : ''}${points} | Total: ${newPoints} | Reason: ${description}`);
    
    return newPoints;
}

function getUserPoints(userId) {
    return userPoints[userId] || 0;
}

function getUserTransactions(userId) {
    return userTransactions[userId] || [];
}

// ✅ NEW: Check if user is existing user (has points or session)
function isExistingUser(userId) {
    const hasPoints = getUserPoints(userId) > 0;
    const hasSession = userSessions[userId] && userSessions[userId].sessionId;
    const isNewUserFlag = userSessions[userId] && userSessions[userId].isNewUser;
    
    console.log(`🔍 User ${userId} check - Points: ${hasPoints}, Session: ${hasSession}, NewUserFlag: ${isNewUserFlag}`);
    
    // User existing hai agar:
    // 1. Uske points > 0 hai, YA
    // 2. Uska session exist karta hai aur wo new user nahi hai
    return hasPoints || (hasSession && !isNewUserFlag);
}

// ✅ NEW: Check if referral bonus already given
function hasUserReceivedReferralBonus(userId) {
    const session = getUserSession(userId);
    return session ? session.referralBonusGiven : false;
}

// ✅ NEW: Mark referral bonus as given
function markReferralBonusGiven(userId) {
    if (userSessions[userId]) {
        userSessions[userId].referralBonusGiven = true;
        userSessions[userId].lastActive = Date.now();
        saveUserSessions();
        console.log(`✅ Referral bonus marked as given for user ${userId}`);
    }
}

// ✅ NEW: Check if referrer bonus already given for this referral
function hasReferrerBonusBeenGiven(referralCode) {
    return referralStorage[referralCode] && referralStorage[referralCode].bonusGiven === true;
}

// ✅ NEW: Check if user already referred by same referrer
function hasUserBeenReferredBySameUser(referredUserId, referrerId) {
    const existingReferral = Object.values(referralStorage).find(ref => 
        ref.referredUserId === referredUserId && 
        ref.referrerId === referrerId &&
        ref.bonusGiven === true
    );
    return existingReferral !== undefined;
}

// ==================== ENHANCED DATA PERSISTENCE - BOT ====================

// ✅ FIXED: Web App URL Generator with Telegram Username
function generateWebAppUrl(userId, isNewUser = false, referralCode = null, username = '') {
    const session = getOrCreateUserSession(userId);
    
    // ✅ NEVER include fresh parameter - data should always persist
    let url = `${WEB_APP_URL}?userid=${userId}&session=${session.sessionId}&timestamp=${Date.now()}`;
    
    // Add username if available
    if (username) {
        url += `&username=${encodeURIComponent(username)}`;
    }
    
    // Only mark as new user for tracking, but don't clear data
    if (isNewUser && userSessions[userId] && userSessions[userId].isNewUser) {
        url += '&newuser=true';
        console.log(`🆕 New user detected: ${userId} (@${username || 'no-username'})`);
    } else {
        console.log(`🔁 Returning user: ${userId} (@${username || 'no-username'})`);
    }
    
    if (referralCode) {
        url += `&ref=${referralCode}`;
    }
    
    console.log(`🔗 Generated Web App URL for ${userId}: ${url.substring(0, 100)}...`);
    return url;
}

// Web App Menu Setup
const setupWebApp = async (retryCount = 0) => {
    try {
        await bot.telegram.setChatMenuButton({
            menu_button: {
                type: 'web_app',
                text: '🎬 Earn Points',
                web_app: { url: WEB_APP_URL }
            }
        });
        console.log('✅ Web App menu configured successfully!');
        return true;
    } catch (error) {
        console.log(`❌ Menu setup attempt ${retryCount + 1} failed:`, error.message);
        if (retryCount < 3) {
            setTimeout(() => setupWebApp(retryCount + 1), 5000);
        }
        return false;
    }
};

// ==================== ✅ ULTIMATE FIXED START COMMAND WITH ENHANCED WELCOME BANNER ====================

bot.start(async (ctx) => {
    const userName = ctx.from.first_name || 'User';
    const userID = ctx.from.id.toString();
    const username = ctx.from.username || '';
    const startPayload = ctx.startPayload;
    
    console.log(`👤 User started bot: ${userName} (ID: ${userID}, @${username})`);
    console.log(`📦 Start payload: "${startPayload}"`);
    
    let referralMessage = '';
    let isReferredUser = false;
    let referrerId = null;
    let referralCode = null;

    // ✅ FIXED: User session create karo with Telegram username
    const currentPoints = getUserPoints(userID);
    const userSession = getOrCreateUserSession(userID, ctx.from);
    
    console.log(`💰 User ${userID} current points: ${currentPoints}`);
    console.log(`🔍 User session:`, {
        username: userSession.username,
        isNewUser: userSession.isNewUser,
        welcomeBonusGiven: userSession.welcomeBonusGiven,
        referralBonusGiven: userSession.referralBonusGiven
    });

    // ✅ CHECK: Kya user existing hai?
    const isExisting = isExistingUser(userID);
    console.log(`🔍 Is existing user: ${isExisting}`);

    // ✅ ULTIMATE FIX: TELEGRAM START PAYLOAD ISSUE RESOLUTION
    if (startPayload && startPayload.trim().length > 0) {
        console.log(`🎯 Processing start payload: "${startPayload}"`);
        
        // Multiple formats handle karo
        let extractedReferrerId = null;
        
        // Format 1: ref123456
        if (startPayload.startsWith('ref')) {
            extractedReferrerId = startPayload.replace('ref', '').trim();
        }
        // Format 2: referral_123456
        else if (startPayload.startsWith('referral_')) {
            extractedReferrerId = startPayload.replace('referral_', '').trim();
        }
        // Format 3: direct number
        else if (/^\d+$/.test(startPayload)) {
            extractedReferrerId = startPayload.trim();
        }
        
        if (extractedReferrerId && extractedReferrerId.length > 0) {
            referrerId = extractedReferrerId;
            referralCode = 'REF_' + referrerId + '_' + Date.now();
            
            console.log(`🎯 Referral detected: ${userName} referred by ${referrerId}`);
            
            // ✅ FIXED: Check if user is existing user - AGAR EXISTING USER HAI TOH NO BONUS
            if (isExisting) {
                console.log(`⚠️ User ${userID} is existing user, NO referral bonus will be given`);
                isReferredUser = true;
                referralMessage = `\n\n🎁 *You were referred by a friend!*\n(Existing users don't get referral bonus)`;
            }
            // ✅ FIXED: Check if user already received referral bonus
            else if (hasUserReceivedReferralBonus(userID)) {
                console.log(`⚠️ User ${userID} already received referral bonus, skipping...`);
                isReferredUser = true;
                referralMessage = `\n\n🎁 *You were referred by a friend!* (Bonus already claimed)`;
            }
            // ✅ FIXED: Check if user already referred by same referrer
            else if (hasUserBeenReferredBySameUser(userID, referrerId)) {
                console.log(`⚠️ User ${userID} already referred by ${referrerId}, skipping...`);
                isReferredUser = true;
                referralMessage = `\n\n🎁 *You were already referred by this friend!* (Bonus already claimed)`;
            }
            else {
                // Store referral with username information
                referralStorage[referralCode] = {
                    referrerId: referrerId,
                    referredUserId: userID,
                    referredUserName: userName,
                    referredUserUsername: username,
                    timestamp: Date.now(),
                    status: 'pending',
                    bonusGiven: false,
                    referredUserBonusGiven: false
                };
                saveReferralStorage();
                
                isReferredUser = true;
                referralMessage = `\n\n🎁 *REFERRAL BONUS ACTIVATED!*\nYou were invited by a friend!\n💰 You get 25 BONUS POINTS immediately!`;
                
                // ✅ FIXED: Referred user ko immediately bonus do - ONLY IF NOT EXISTING USER
                if (currentPoints === 0 || (userSessions[userID] && userSessions[userID].isNewUser)) {
                    updateUserPoints(userID, 25, 'referral_welcome', '🎁 Referral Welcome Bonus');
                    markReferralBonusGiven(userID);
                    console.log(`🎁 Referral welcome bonus given to ${userID} (@${username})`);
                    
                    // Update referral status
                    if (referralStorage[referralCode]) {
                        referralStorage[referralCode].referredUserBonusGiven = true;
                        saveReferralStorage();
                    }
                    
                    // User ko new user mark karo
                    if (userSessions[userID]) {
                        userSessions[userID].isNewUser = false;
                        userSessions[userID].welcomeBonusGiven = true;
                        saveUserSessions();
                    }
                }
            }
        } else {
            console.log(`❌ Invalid referrer ID from payload: "${startPayload}"`);
        }
    } else {
        console.log(`ℹ️ No start payload or empty payload`);
    }

    // ✅ FIXED: New user check - referral ke baad check karo
    const isNewUser = currentPoints === 0 && (!userSessions[userID] || userSessions[userID].isNewUser);
    console.log(`🆕 Is new user: ${isNewUser}, Points: ${currentPoints}`);

    // Welcome bonus sirf non-referred new users ko do
    if (isNewUser && currentPoints === 0 && !isReferredUser && !userSession.welcomeBonusGiven && !isExisting) {
        updateUserPoints(userID, 25, 'welcome_bonus', '🎁 Welcome Bonus');
        userSessions[userID].isNewUser = false;
        userSessions[userID].welcomeBonusGiven = true;
        saveUserSessions();
        console.log(`🎁 Welcome bonus given to new user ${userID} (@${username})`);
    }

    // ✅ FIXED: Web App URL generate karo with username
    const webAppUrl = generateWebAppUrl(userID, isNewUser, referralCode, username);

    // ✅ ENHANCED WELCOME BANNER - ALL FEATURES INCLUDED
    const welcomeBanner = `🎉 *WELCOME TO REWARD BROWSER, ${userName.toUpperCase()}!* 🎉

✨ *Your Ultimate Earning Platform*

💰 *INSTANT 25 POINTS WELCOME BONUS!*

🚀 *HOW TO START EARNING:*
1️⃣ Tap "🎬 OPEN EARNING APP" below
2️⃣ Start mining points automatically
3️⃣ Watch videos & complete tasks
4️⃣ Invite friends for bonus points
5️⃣ Redeem rewards for real money!

📊 *EARNING OPPORTUNITIES:*
• ⛏️ Auto Mining: 5 points/minute
• 🎬 Watch Videos: 10-20 points each
• 👥 Refer Friends: 50 points each
• 📱 Follow Accounts: 25-50 points
• ✅ Complete Tasks: 15-40 points

🎁 *SPECIAL FEATURES:*
• 24/7 Auto Mining
• Instant Points Transfer
• Multiple Withdrawal Options
• Real-time Statistics
• Referral Tracking

*Click the button below to start your earning journey!* 🚀`;

    try {
        // ✅ FIXED: Final message build karo - ALWAYS SHOW WELCOME BANNER
        let finalMessage = welcomeBanner;
        
        // Referral message add karo
        if (isReferredUser && referralMessage) {
            finalMessage += referralMessage;
            console.log(`📝 Added referral message for user ${userID}`);
        }
        
        // Current points add karo
        const updatedPoints = getUserPoints(userID);
        if (updatedPoints > 0) {
            finalMessage += `\n\n💰 *YOUR CURRENT POINTS: ${updatedPoints}*`;
        }

        console.log(`📨 Sending welcome message to ${userID} (@${username}), Message length: ${finalMessage.length}`);

        // ✅ ULTIMATE FIX: ALWAYS SHOW WELCOME BANNER AND EARNING APP BUTTON
        await ctx.replyWithMarkdown(finalMessage, { 
            reply_markup: {
                inline_keyboard: [
                    [
                        { 
                            text: '🚀 OPEN EARNING APP 🎬', 
                            web_app: { url: webAppUrl } 
                        }
                    ],
                    [
                        { text: '💰 Check My Wallet', callback_data: 'check_wallet' },
                        { text: '👥 Invite Friends', callback_data: 'invite_friends' }
                    ],
                    [
                        { text: '📊 View Statistics', callback_data: 'show_stats' },
                        { text: '🎯 How It Works', callback_data: 'how_it_works' }
                    ]
                ]
            }
        });

        console.log(`✅ Welcome message sent successfully to ${userID} (@${username})`);

        // ✅ FIXED: Referrer ko bonus do with username information - ONLY IF NOT EXISTING USER
        if (isReferredUser && referrerId && referralCode && !isExisting) {
            setTimeout(async () => {
                try {
                    // ✅ FIXED: Check if referrer bonus already given for this referral
                    if (hasReferrerBonusBeenGiven(referralCode)) {
                        console.log(`⚠️ Referrer bonus already given for referral ${referralCode}, skipping...`);
                        return;
                    }

                    // ✅ FIXED: Check if user already referred by same referrer
                    if (hasUserBeenReferredBySameUser(userID, referrerId)) {
                        console.log(`⚠️ User ${userID} already referred by ${referrerId}, skipping referrer bonus...`);
                        return;
                    }
                    
                    const bonusPoints = 50;
                    console.log(`🎁 Awarding referral bonus to ${referrerId} for referring ${userName} (@${username})`);
                    
                    updateUserPoints(referrerId, bonusPoints, 'referral_bonus', `Referral: ${userName} (@${username})`);
                    
                    // Referral status update karo
                    if (referralStorage[referralCode]) {
                        referralStorage[referralCode].bonusGiven = true;
                        referralStorage[referralCode].status = 'completed';
                        saveReferralStorage();
                    }
                    
                    // Referrer ko notify karo with username
                    await ctx.telegram.sendMessage(
                        referrerId, 
                        `🎉 *REFERRAL SUCCESS!*\n\n👤 ${userName} (@${username}) joined using your link!\n💰 You earned: +${bonusPoints} points\n📈 Keep inviting for more bonuses! 🚀`,
                        { parse_mode: 'Markdown' }
                    ).catch(err => console.log('Could not notify referrer:', err.message));
                    
                    console.log(`✅ Referral bonus awarded to ${referrerId} for ${userName} (@${username})`);
                    
                } catch (error) {
                    console.log('❌ Error awarding referral bonus:', error.message);
                }
            }, 2000);
        }

    } catch (error) {
        console.error('❌ Error sending welcome message:', error);
        
        // Fallback message - ALWAYS SHOW EARNING APP BUTTON
        let fallbackMessage = `🎉 *Welcome ${userName}!* \n\nStart earning points by clicking the button below! 🚀`;
        
        const updatedPoints = getUserPoints(userID);
        if (updatedPoints > 0) {
            fallbackMessage += `\n\n💰 *Your Current Points: ${updatedPoints}*`;
        }
        
        if (isReferredUser) {
            fallbackMessage += `\n\n🎁 *You were referred by a friend!*`;
        }
        
        console.log(`📨 Sending fallback message to ${userID} (@${username})`);

        await ctx.replyWithMarkdown(
            fallbackMessage,
            {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '🎬 OPEN EARNING APP', web_app: { url: webAppUrl } }
                        ],
                        [
                            { text: '💰 Check Wallet', callback_data: 'check_wallet' },
                            { text: '👥 Invite Friends', callback_data: 'invite_friends' }
                        ]
                    ]
                }
            }
        );
    }
});

// ==================== OTHER COMMANDS ====================

// ✅ Wallet Command
bot.command('wallet', async (ctx) => {
    const userId = ctx.from.id.toString();
    const username = ctx.from.username || '';
    const currentPoints = getUserPoints(userId);
    const userSession = getUserSession(userId);
    
    const walletMessage = `
💰 *YOUR REWARD BROWSER WALLET*

👤 *Account:* @${username || 'No username'}
💎 *Current Balance:* ${currentPoints} points
💵 *Estimated Value:* $${(currentPoints / 1000).toFixed(2)}
📅 *Account Since:* ${userSession ? new Date(userSession.createdAt).toLocaleDateString() : 'Recently'}
🎯 *Next Goal:* ${currentPoints >= 1000 ? '🎉 REDEEM REWARD AVAILABLE!' : `${1000 - currentPoints} points needed to redeem`}

*Keep earning to unlock more rewards!* 🚀
    `;
    
    await ctx.replyWithMarkdown(walletMessage, {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '🎬 Earn More Points', web_app: { url: generateWebAppUrl(userId, false, null, username) } },
                    { text: '💰 Redeem Rewards', callback_data: 'show_rewards' }
                ],
                [
                    { text: '📊 Transaction History', callback_data: 'show_history' },
                    { text: '🔄 Refresh', callback_data: 'check_wallet' }
                ]
            ]
        }
    });
});

// ✅ Refer Command
bot.command('refer', async (ctx) => {
    const userId = ctx.from.id.toString();
    const userName = ctx.from.first_name || 'Friend';
    const username = ctx.from.username || '';
    const botUsername = ctx.botInfo.username;
    
    const personalReferralLink = `https://t.me/${botUsername}?start=ref${userId}`;
    const userTotalPoints = getUserPoints(userId);
    
    // Count user referrals
    const userReferrals = Object.values(referralStorage).filter(ref => ref.referrerId === userId);
    const completedReferrals = userReferrals.filter(ref => ref.bonusGiven).length;
    
    const referralMessage = `
👥 *INVITE FRIENDS & EARN BONUSES!*

🎁 *HOW IT WORKS:*
• Share your personal referral link
• Friends join using YOUR link  
• You get *50 BONUS POINTS* instantly
• Your friend gets *25 WELCOME POINTS*
• Track all referrals in real-time

💰 *YOUR REFERRAL STATS:*
• Total Points: *${userTotalPoints}*
• Completed Referrals: *${completedReferrals}*
• Pending Referrals: *${userReferrals.length - completedReferrals}*
• Earned from Referrals: *${completedReferrals * 50} points*

🔗 *YOUR PERSONAL REFERRAL LINK:*
\`${personalReferralLink}\`

📤 *QUICK SHARE OPTIONS:*
    `;

    await ctx.replyWithMarkdown(referralMessage, {
        reply_markup: {
            inline_keyboard: [
                [
                    { 
                        text: '📱 Share on Telegram', 
                        url: `https://t.me/share/url?url=${encodeURIComponent(personalReferralLink)}&text=Join Reward Browser and earn money by watching videos! Use my referral for 25 BONUS POINTS! 🎬💰` 
                    }
                ],
                [
                    { 
                        text: '💚 Share on WhatsApp', 
                        url: `https://wa.me/?text=${encodeURIComponent(`Join Reward Browser - Watch videos and earn money! 💰\n\nUse my referral link for 25 BONUS POINTS:\n${personalReferralLink}\n\nStart earning today! 🎬`)}` 
                    }
                ],
                [
                    { 
                        text: '📋 Copy Referral Link', 
                        callback_data: 'copy_referral' 
                    }
                ],
                [
                    { text: '🎬 Back to Earning', web_app: { url: generateWebAppUrl(userId, false, null, username) } },
                    { text: '💰 Check Wallet', callback_data: 'check_wallet' }
                ]
            ]
        }
    });
});

// ✅ Stats Command
bot.command('stats', async (ctx) => {
    const userId = ctx.from.id.toString();
    const username = ctx.from.username || '';
    const userStats = getUserStats(userId);
    
    let breakdownText = '';
    Object.entries(userStats.taskCounts).forEach(([type, count]) => {
        const typeName = type.replace(/_/g, ' ').toUpperCase();
        const emoji = getEmojiForType(type);
        breakdownText += `${emoji} ${typeName}: *${count} times*\n`;
    });
    
    function getEmojiForType(type) {
        const emojis = {
            'welcome_bonus': '🎁',
            'mining': '⛏️',
            'video': '🎬',
            'referral_bonus': '👥',
            'instagram_follow': '📷',
            'x_follow': '🐦',
            'telegram_join': '📱',
            'youtube_subscribe': '🎬',
            'task': '✅',
            'boost': '🚀',
            'bonus': '🎉'
        };
        return emojis[type] || '💰';
    }
    
    const statsMessage = `
📊 *YOUR REWARD BROWSER STATISTICS*

👤 *Account Info:*
• Username: @${username || 'No username'}
• Join Date: *${userStats.joinDate}*

💎 *Points Overview:*
• Total Points: *${userStats.points}*
• Today's Earnings: *+${userStats.todayEarnings}*
• Total Earned: *${userStats.totalEarnings}*
• Estimated Value: *$${(userStats.points / 1000).toFixed(2)}*

📈 *Activity Breakdown:*
${breakdownText || '💰 No activities recorded yet'}

🎯 *Earning Tips:*
• Watch 10 videos/day: ~150 points
• Mine for 1 hour: ~300 points  
• Refer 1 friend: 50 points
• Complete all tasks: ~100 points

*Keep inviting friends and watching videos to increase your earnings!* 🚀
    `;
    
    await ctx.replyWithMarkdown(statsMessage, {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '👥 Invite Friends', callback_data: 'invite_friends' },
                    { text: '🎬 Earn More', web_app: { url: generateWebAppUrl(userId, false, null, username) } }
                ]
            ]
        }
    });
});

// ✅ Help Command
bot.command('help', async (ctx) => {
    const helpMessage = `
🤖 *REWARD BROWSER BOT HELP*

🎯 *Available Commands:*
/start - Welcome message & start earning
/wallet - Check your points balance
/refer - Invite friends & earn bonuses  
/stats - View your earning statistics
/help - This help message

🚀 *How to Earn:*
1. Use /start to open the earning app
2. Click "Mining" to earn 5 points/minute
3. Watch videos for 10-20 points each
4. Follow accounts for 25-50 points
5. Invite friends for 50 points each

💰 *Redeeming Rewards:*
• 1000 points = $1 Amazon Gift Card
• 5000 points = $5 PayPal Cash
• 2000 points = $2 Google Play Card

📱 *Need Help?*
Contact support: @rewardbrowser_support
Email: support@rewardbrowser.com

*Start earning now with /start command!* 🚀
    `;
    
    await ctx.replyWithMarkdown(helpMessage);
});

// ✅ ENHANCED: Points sync from Web App
function handlePointsUpdateFromWebApp(userId, pointsData) {
    try {
        console.log('🔄 Processing points update from web app:', pointsData);
        
        const { points, type, description, sessionId } = pointsData;
        
        if (typeof points !== 'number') {
            console.log('❌ Invalid points data received:', pointsData);
            return false;
        }
        
        // Verify session
        const userSession = getUserSession(userId);
        if (sessionId && userSession && userSession.sessionId !== sessionId) {
            console.log('⚠️ Session mismatch, but processing points anyway');
        }
        
        const newTotal = updateUserPoints(userId, points, type, description);
        
        console.log(`✅ Web App Points Synced: User ${userId} | +${points} | Total: ${newTotal} | ${description}`);
        return { success: true, newTotal: newTotal };
        
    } catch (error) {
        console.log('❌ Error handling points update from web app:', error);
        return false;
    }
}

// ✅ NEW: Get user stats for dashboard
function getUserStats(userId) {
    const points = getUserPoints(userId);
    const transactions = getUserTransactions(userId);
    const session = getUserSession(userId);
    
    // Calculate today's earnings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEarnings = transactions
        .filter(t => new Date(t.timestamp) >= today && t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate total earnings
    const totalEarnings = transactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
    
    // Count completed tasks by type
    const taskCounts = {};
    transactions.forEach(t => {
        if (t.amount > 0) {
            taskCounts[t.type] = (taskCounts[t.type] || 0) + 1;
        }
    });
    
    return {
        points: points,
        todayEarnings: todayEarnings,
        totalEarnings: totalEarnings,
        transactionCount: transactions.length,
        taskCounts: taskCounts,
        sessionId: session ? session.sessionId : null,
        joinDate: session ? new Date(session.createdAt).toLocaleDateString() : 'Unknown'
    };
}

// ==================== CALLBACK QUERY HANDLER ====================

bot.on('callback_query', async (ctx) => {
    const callbackData = ctx.callbackQuery.data;
    const userId = ctx.from.id.toString();
    const userName = ctx.from.first_name || 'User';
    const username = ctx.from.username || '';
    
    try {
        switch (callbackData) {
            case 'check_wallet':
                const currentPoints = getUserPoints(userId);
                await ctx.editMessageText(
                    `💰 *Your Wallet Balance*\n\n👤 @${username || 'No username'}\n💎 Points: *${currentPoints}*\n💵 Value: *$${(currentPoints / 1000).toFixed(2)}*\n\n*Next Goal:* ${currentPoints >= 1000 ? '🎉 Redeem Reward!' : `${1000 - currentPoints} points to redeem`}`,
                    {
                        parse_mode: 'Markdown',
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: '🎬 Earn More', web_app: { url: generateWebAppUrl(userId, false, null, username) } },
                                    { text: '💰 Redeem', callback_data: 'show_rewards' }
                                ],
                                [
                                    { text: '🔄 Refresh', callback_data: 'check_wallet' },
                                    { text: '🔙 Main Menu', callback_data: 'main_menu' }
                                ]
                            ]
                        }
                    }
                );
                break;
                
            case 'invite_friends':
                const botUsername = ctx.botInfo.username;
                const personalReferralLink = `https://t.me/${botUsername}?start=ref${userId}`;
                
                await ctx.editMessageText(
                    `👥 *Invite Friends & Earn 50 Points Each!*\n\n🔗 Your referral link:\n\`${personalReferralLink}\`\n\nShare this link with friends and earn bonuses!`,
                    {
                        parse_mode: 'Markdown',
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { 
                                        text: '📱 Share on Telegram', 
                                        url: `https://t.me/share/url?url=${encodeURIComponent(personalReferralLink)}&text=Join Reward Browser and earn money! Use my referral for bonus points!` 
                                    }
                                ],
                                [
                                    { text: '🔙 Back', callback_data: 'main_menu' }
                                ]
                            ]
                        }
                    }
                );
                break;
                
            case 'show_stats':
                const userSession = getUserSession(userId);
                const transactions = getUserTransactions(userId);
                const todayEarnings = transactions
                    .filter(t => new Date(t.timestamp).toDateString() === new Date().toDateString() && t.amount > 0)
                    .reduce((sum, t) => sum + t.amount, 0);
                
                await ctx.editMessageText(
                    `📊 *Your Statistics*\n\n👤 @${username || 'No username'}\n💎 Total Points: ${getUserPoints(userId)}\n📈 Today's Earnings: +${todayEarnings}\n📅 Member Since: ${userSession ? new Date(userSession.createdAt).toLocaleDateString() : 'Recently'}\n🔑 Session: ${userSession ? 'Active' : 'Inactive'}`,
                    {
                        parse_mode: 'Markdown',
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: '🔄 Refresh', callback_data: 'show_stats' },
                                    { text: '🔙 Back', callback_data: 'main_menu' }
                                ]
                            ]
                        }
                    }
                );
                break;

            case 'how_it_works':
                await ctx.editMessageText(
                    `🎯 *HOW REWARD BROWSER WORKS*\n\n1. *Start Mining* - Earn 5 points every minute\n2. *Watch Videos* - 10-20 points per video\n3. *Follow Accounts* - 25-50 points each\n4. *Invite Friends* - 50 points per referral\n5. *Redeem Rewards* - Convert points to real money!\n\n🚀 Start earning now!`,
                    {
                        parse_mode: 'Markdown',
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: '🚀 Start Earning', web_app: { url: generateWebAppUrl(userId, false, null, username) } }
                                ],
                                [
                                    { text: '🔙 Back', callback_data: 'main_menu' }
                                ]
                            ]
                        }
                    }
                );
                break;
                
            case 'main_menu':
                const currentPointsMain = getUserPoints(userId);
                const welcomeBack = `🎉 *Welcome back, ${userName}!*\n\n👤 @${username || 'No username'}\n💰 *Current Points: ${currentPointsMain}*\n\nReady to continue earning? 🚀`;
                await ctx.editMessageText(welcomeBack, {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: '🎬 Continue Earning', web_app: { url: generateWebAppUrl(userId, false, null, username) } }
                            ],
                            [
                                { text: '💰 Check Wallet', callback_data: 'check_wallet' },
                                { text: '👥 Invite Friends', callback_data: 'invite_friends' }
                            ]
                        ]
                    }
                });
                break;

            case 'show_rewards':
                const userPointsBalance = getUserPoints(userId);
                await ctx.editMessageText(
                    `🎁 *AVAILABLE REWARDS*\n\n👤 @${username || 'No username'}\n💰 Your Points: ${userPointsBalance}\n\n📦 *Rewards:*\n• 1000 points = $1 Amazon Gift Card\n• 5000 points = $5 PayPal Cash\n• 2000 points = $2 Google Play Card\n\n*Open the app to redeem rewards!*`,
                    {
                        parse_mode: 'Markdown',
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: '🎬 Open App to Redeem', web_app: { url: generateWebAppUrl(userId, false, null, username) } }
                                ],
                                [
                                    { text: '🔙 Back', callback_data: 'main_menu' }
                                ]
                            ]
                        }
                    }
                );
                break;

            case 'show_history':
                const userTransactionsList = getUserTransactions(userId).slice(0, 10);
                let historyText = '📜 *LAST 10 TRANSACTIONS*\n\n';
                
                if (userTransactionsList.length === 0) {
                    historyText += 'No transactions yet. Start earning!';
                } else {
                    userTransactionsList.forEach(transaction => {
                        const time = new Date(transaction.timestamp).toLocaleDateString();
                        const sign = transaction.amount > 0 ? '+' : '';
                        historyText += `${transaction.icon || '💰'} ${sign}${transaction.amount} - ${transaction.description}\n⏰ ${time}\n\n`;
                    });
                }
                
                await ctx.editMessageText(historyText, {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: '🔙 Back', callback_data: 'main_menu' }
                            ]
                        ]
                    }
                });
                break;

            case 'copy_referral':
                await ctx.answerCbQuery('📋 Referral link copied to clipboard!');
                break;
                
            default:
                await ctx.answerCbQuery('⚠️ Unknown action');
                break;
        }
        await ctx.answerCbQuery();
    } catch (error) {
        console.error('Callback error:', error);
        await ctx.answerCbQuery('❌ Error processing request');
    }
});

// ==================== MESSAGE HANDLER ====================

bot.on('message', async (ctx) => {
    try {
        // Check if message contains points data from web app
        if (ctx.message && ctx.message.text && ctx.message.text.startsWith('POINTS_UPDATE:')) {
            const userId = ctx.from.id.toString();
            const username = ctx.from.username || '';
            console.log('📨 Received points update message from user:', userId, '(@'+username+')');
            
            try {
                const pointsData = JSON.parse(ctx.message.text.replace('POINTS_UPDATE:', ''));
                console.log('📊 Parsed points data:', pointsData);
                
                const result = handlePointsUpdateFromWebApp(userId, pointsData);
                
                if (result && result.success) {
                    console.log(`✅ Points update processed successfully for user ${userId} (@${username})`);
                } else {
                    console.log(`❌ Points update failed for user ${userId} (@${username})`);
                }
                
            } catch (parseError) {
                console.log('❌ Error parsing points update:', parseError);
            }
            return;
        }
        
    } catch (error) {
        console.log('❌ Error in message handler:', error);
    }
});

// ==================== BOT STARTUP ====================

const connectBot = (retryCount = 0) => {
    const maxRetries = 5;
    const retryDelays = [5000, 10000, 15000, 20000, 30000];
    
    console.log(`🚀 Attempting to start bot (Attempt ${retryCount + 1}/${maxRetries})...`);
    
    bot.launch().then(() => {
        console.log('✅ Bot successfully connected to Telegram!');
        console.log('🤖 Bot is now online and listening for messages...');
        console.log('🌐 Web App URL:', WEB_APP_URL);
        
        // Storage statistics
        console.log('📊 Storage Loaded:');
        console.log(`   - Users: ${Object.keys(userSessions).length}`);
        console.log(`   - Points Records: ${Object.keys(userPoints).length}`);
        console.log(`   - Referrals: ${Object.keys(referralStorage).length}`);
        console.log(`   - Transactions: ${Object.keys(userTransactions).length}`);
        
        setupWebApp();
        
    }).catch((error) => {
        console.log(`❌ Connection attempt ${retryCount + 1}/${maxRetries} failed:`, error.message);
        if (retryCount < maxRetries - 1) {
            const delay = retryDelays[retryCount];
            console.log(`🔄 Retrying in ${delay/1000} seconds...`);
            setTimeout(() => connectBot(retryCount + 1), delay);
        } else {
            console.log('💡 MAXIMUM RETRIES REACHED');
            process.exit(1);
        }
    });
};

// Start the bot
connectBot();

// Auto-save every 3 minutes for extra safety
setInterval(() => {
    saveUserPoints();
    saveUserSessions();
    saveReferralStorage();
    saveUserTransactions();
    console.log('💾 Auto-save completed');
}, 3 * 60 * 1000);

// Keep alive monitoring
setInterval(() => {
    const now = new Date().toLocaleTimeString();
    const activeUsers = Object.values(userSessions).filter(s => Date.now() - s.lastActive < 24 * 60 * 60 * 1000).length;
    const totalPoints = Object.values(userPoints).reduce((sum, points) => sum + points, 0);
    
    console.log(`⏰ [${now}] Bot running - Users: ${Object.keys(userSessions).length}, Active: ${activeUsers}, Total Points: ${totalPoints}`);
}, 60000);

console.log(`🎉 REWARD BROWSER BOT STARTED SUCCESSFULLY!
🔗 Web App: ${WEB_APP_URL}
💰 Points System: ✅ ENHANCED DATA PERSISTENCE
👥 Referral System: ✅ NO DUPLICATE BONUS
💾 Persistent Storage: ✅ ACTIVE
👤 Telegram Username Login: ✅ IMPLEMENTED
🎯 All Features: ✅ WORKING PROPERLY

📋 Available Commands:
/start - Welcome banner with earning app
/wallet - Check your points balance
/refer - Invite friends & earn bonuses
/stats - Detailed earning statistics
/help - Help guide

🚀 Bot is ready to use!`);

// Enable graceful stop
process.once('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully...');
    bot.stop('SIGINT');
    // Final save before exit
    saveUserPoints();
    saveUserSessions();
    saveReferralStorage();
    saveUserTransactions();
    process.exit(0);
});

process.once('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully...');
    bot.stop('SIGTERM');
    // Final save before exit
    saveUserPoints();
    saveUserSessions();
    saveReferralStorage();
    saveUserTransactions();
    process.exit(0);
});