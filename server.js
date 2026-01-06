const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ MongoDB Atlas Connection String
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://tapearn_admin:Admin@12345@cluster0.ivp6m5c.mongodb.net/tapearn_db?retryWrites=true&w=majority&appName=Cluster0';

// ✅ Security Middleware
app.use(helmet());
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static(__dirname));

// ✅ Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// ==========================================
// ✅ MONGODB CONNECTION
// ==========================================

console.log('🔄 Connecting to MongoDB Atlas...');

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
.then(() => {
    console.log('✅ Connected to MongoDB Atlas successfully!');
    console.log('📊 Database:', mongoose.connection.name);
    console.log('🌐 Host:', mongoose.connection.host);
})
.catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    console.log('⚠️ Using fallback local storage mode...');
});

// ==========================================
// ✅ MONGOOSE SCHEMAS
// ==========================================

// ✅ User Schema
const userSchema = new mongoose.Schema({
    // Basic Information
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
    // Personal Details
    telegram_id: String,
    phone: String,
    full_name: String,
    
    // Wallet & Earnings
    points: { type: Number, default: 0 },
    total_earned: { type: Number, default: 0 },
    inr_wallet: { type: Number, default: 0 },
    usdt_wallet: { type: Number, default: 0 },
    total_converted: { type: Number, default: 0 },
    
    // Referral System
    referral_code: { type: String, unique: true },
    referred_by: String,
    sponsor_id: String,
    sponsor_name: String,
    
    // Stats & Levels
    level: { type: Number, default: 1 },
    tasks_completed: { type: Number, default: 0 },
    daily_streak: { type: Number, default: 0 },
    last_login_date: Date,
    last_daily_activity: Date,
    
    // Verification
    email_verified: { type: Boolean, default: false },
    mobile_verified: { type: Boolean, default: false },
    verification_status: { type: String, default: 'pending' },
    
    // Status & Dates
    status: { type: String, default: 'active' },
    registration_date: { type: Date, default: Date.now },
    last_login: { type: Date, default: Date.now },
    
    // Additional Fields
    free_pool_completed: { type: Boolean, default: false },
    free_pool_tasks: [{
        task_id: String,
        completed: Boolean,
        completed_at: Date
    }],
    
    // Tracking
    today_earnings: { type: Number, default: 0 },
    total_mining_time: { type: Number, default: 0 },
    session_count: { type: Number, default: 0 },
    
    // Admin Fields
    is_admin: { type: Boolean, default: false },
    admin_level: { type: Number, default: 0 },
    
    // Metadata
    ip_address: String,
    user_agent: String,
    device_type: String
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

// ✅ Wallet Transaction Schema
const walletTransactionSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    transaction_type: { type: String, required: true }, // 'earning', 'spending', 'conversion'
    amount: { type: Number, required: true },
    description: String,
    category: String, // 'video', 'task', 'mining', 'referral', 'bonus', 'conversion'
    sub_category: String, // 'points_to_inr', 'inr_to_usdt', 'points_to_usdt'
    balance_before: Number,
    balance_after: Number,
    currency: { type: String, default: 'points' }, // 'points', 'INR', 'USDT'
    status: { type: String, default: 'completed' },
    transaction_date: { type: Date, default: Date.now },
    
    // Conversion Details (if applicable)
    conversion_rate: Number,
    converted_from: String,
    converted_to: String,
    
    // Reference
    reference_id: String,
    reference_type: String
}, {
    timestamps: true
});

// ✅ Mining Pool Schema
const miningPoolSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pool_id: { type: String, required: true },
    pool_name: String,
    pool_icon: String,
    pool_type: { type: String, default: 'free' }, // 'free', 'paid'
    
    // Investment
    investment_amount: { type: Number, default: 0 },
    investment_currency: { type: String, default: 'points' },
    
    // Duration & Rewards
    duration_hours: Number,
    expected_points: Number,
    actual_points: Number,
    
    // Timing
    start_time: { type: Date, default: Date.now },
    end_time: Date,
    completed_at: Date,
    
    // Progress
    progress: { type: Number, default: 0 },
    status: { type: String, default: 'active' }, // 'active', 'completed', 'cancelled', 'claimed'
    
    // Pool Details
    base_rate: Number,
    multiplier: Number,
    min_investment: Number,
    
    // Metadata
    transaction_id: String,
    claimed: { type: Boolean, default: false },
    claim_date: Date
}, {
    timestamps: true
});

// ✅ Task Completion Schema
const taskCompletionSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    task_id: { type: String, required: true },
    task_type: String, // 'video', 'social', 'survey', 'app_install', 'game', 'quiz'
    task_name: String,
    
    // Completion Details
    completed_at: { type: Date, default: Date.now },
    points_earned: Number,
    
    // Platform Details
    platform: String, // 'youtube', 'telegram', 'instagram', 'facebook', 'twitter'
    video_id: String,
    channel_id: String,
    
    // Verification
    verified: { type: Boolean, default: true },
    verification_method: String,
    
    // Metadata
    ip_address: String,
    user_agent: String
}, {
    timestamps: true
});

// ✅ Referral Schema
const referralSchema = new mongoose.Schema({
    referrer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    referred_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    // Referral Details
    referral_code: String,
    points_earned: { type: Number, default: 25 },
    
    // Status
    status: { type: String, default: 'active' },
    completed: { type: Boolean, default: false },
    
    // Dates
    referral_date: { type: Date, default: Date.now },
    completed_at: Date,
    
    // Additional Info
    commission_paid: { type: Boolean, default: false },
    commission_amount: Number
}, {
    timestamps: true
});

// ✅ Sponsor Commission Schema
const sponsorCommissionSchema = new mongoose.Schema({
    sponsor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    // Commission Details
    commission_type: String, // 'mining', 'video', 'task', 'referral', 'bonus'
    amount: { type: Number, required: true },
    percentage: Number,
    
    // Source Activity
    activity_type: String,
    activity_description: String,
    original_amount: Number,
    
    // Status
    status: { type: String, default: 'pending' },
    paid: { type: Boolean, default: false },
    paid_date: Date,
    
    // Transaction Reference
    transaction_id: String,
    wallet_transaction_id: String
}, {
    timestamps: true
});

// ✅ Daily Activity Schema
const dailyActivitySchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    activity_id: { type: String, required: true },
    activity_type: String,
    
    // Completion Details
    completed_at: { type: Date, default: Date.now },
    points_earned: Number,
    
    // Daily Tracking
    date: { type: String, required: true }, // YYYY-MM-DD format
    streak_day: Number,
    
    // Metadata
    platform: String,
    verified: { type: Boolean, default: true }
}, {
    timestamps: true
});

// ✅ Admin Log Schema
const adminLogSchema = new mongoose.Schema({
    admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    
    // Target Details
    target_type: String, // 'user', 'transaction', 'pool', 'system'
    target_id: String,
    target_description: String,
    
    // Changes
    changes_before: mongoose.Schema.Types.Mixed,
    changes_after: mongoose.Schema.Types.Mixed,
    
    // IP & Location
    ip_address: String,
    user_agent: String,
    
    // Status
    status: { type: String, default: 'completed' }
}, {
    timestamps: true
});

// ✅ Create Models
const User = mongoose.model('User', userSchema);
const WalletTransaction = mongoose.model('WalletTransaction', walletTransactionSchema);
const MiningPool = mongoose.model('MiningPool', miningPoolSchema);
const TaskCompletion = mongoose.model('TaskCompletion', taskCompletionSchema);
const Referral = mongoose.model('Referral', referralSchema);
const SponsorCommission = mongoose.model('SponsorCommission', sponsorCommissionSchema);
const DailyActivity = mongoose.model('DailyActivity', dailyActivitySchema);
const AdminLog = mongoose.model('AdminLog', adminLogSchema);

// ==========================================
// ✅ HELPER FUNCTIONS
// ==========================================

// ✅ Generate Referral Code
function generateReferralCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'TAPEARN-';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// ✅ Log Admin Action
async function logAdminAction(adminId, action, targetType, targetId, changesBefore, changesAfter) {
    try {
        const adminLog = new AdminLog({
            admin_id: adminId,
            action: action,
            target_type: targetType,
            target_id: targetId,
            changes_before: changesBefore,
            changes_after: changesAfter,
            ip_address: '127.0.0.1',
            user_agent: 'Server'
        });
        await adminLog.save();
    } catch (error) {
        console.error('Error logging admin action:', error);
    }
}

// ==========================================
// ✅ USER MANAGEMENT ENDPOINTS
// ==========================================

// ✅ GET USER BY EMAIL OR USERNAME
app.get('/api/get-user', async (req, res) => {
    try {
        const { email, username } = req.query;
        
        if (!email && !username) {
            return res.json({ success: false, message: 'Please provide email or username' });
        }
        
        let query = {};
        if (email) query.email = email;
        if (username) query.username = username;
        
        const user = await User.findOne(query);
        
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }
        
        // Get sponsor name if exists
        let sponsorName = null;
        if (user.referred_by) {
            const sponsor = await User.findOne({ referral_code: user.referred_by });
            if (sponsor) sponsorName = sponsor.full_name;
        }
        
        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                mobile: user.phone,
                sponsorId: user.referred_by,
                sponsorName: sponsorName,
                points: user.points,
                inr_wallet: user.inr_wallet,
                usdt_wallet: user.usdt_wallet,
                total_earned: user.total_earned,
                registration_date: user.registration_date,
                last_login: user.last_login,
                status: user.status,
                level: user.level,
                tasks_completed: user.tasks_completed,
                referral_code: user.referral_code,
                email_verified: user.email_verified,
                mobile_verified: user.mobile_verified,
                free_pool_completed: user.free_pool_completed,
                is_admin: user.is_admin
            }
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ✅ GET ALL USERS (Admin)
app.get('/api/get-all-users', async (req, res) => {
    try {
        const users = await User.find()
            .sort({ registration_date: -1 })
            .limit(100)
            .select('-password -__v');
        
        res.json({
            success: true,
            count: users.length,
            users: users.map(user => ({
                id: user._id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                referred_by: user.referred_by,
                points: user.points,
                total_earned: user.total_earned,
                registration_date: user.registration_date,
                last_login: user.last_login,
                status: user.status,
                level: user.level,
                tasks_completed: user.tasks_completed,
                referral_code: user.referral_code,
                is_admin: user.is_admin
            }))
        });
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ✅ DELETE USER BY ID (Admin)
app.delete('/api/delete-user/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }
        
        // Delete user and related data
        await User.findByIdAndDelete(userId);
        await WalletTransaction.deleteMany({ user_id: userId });
        await MiningPool.deleteMany({ user_id: userId });
        await TaskCompletion.deleteMany({ user_id: userId });
        await Referral.deleteMany({ $or: [{ referrer_id: userId }, { referred_id: userId }] });
        await SponsorCommission.deleteMany({ $or: [{ sponsor_id: userId }, { user_id: userId }] });
        await DailyActivity.deleteMany({ user_id: userId });
        
        res.json({ 
            success: true, 
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ✅ SYNC USER ENDPOINT
app.post('/api/sync-user', async (req, res) => {
    try {
        const currentUser = req.body;
        console.log('🔄 Syncing user data:', currentUser.email || currentUser.username);

        if (!currentUser) {
            return res.json({ success: false, message: 'No user data provided' });
        }

        // Check if user exists
        let user = await User.findOne({ 
            $or: [
                { email: currentUser.email },
                { username: currentUser.username }
            ]
        });

        if (user) {
            // Update existing user
            user.username = currentUser.username || user.username;
            user.telegram_id = currentUser.telegram_id || user.telegram_id;
            user.phone = currentUser.phone || currentUser.mobile || user.phone;
            user.full_name = currentUser.full_name || user.full_name;
            user.points = currentUser.points || user.points;
            user.total_earned = currentUser.total_earned || currentUser.totalEarned || user.total_earned;
            user.tasks_completed = currentUser.tasks_completed || currentUser.tasksCompleted || user.tasks_completed;
            user.level = currentUser.level || user.level;
            user.last_login = new Date();
            
            await user.save();
            
            console.log(`✅ User synced: ${user.username || user.email}`);
            res.json({ 
                success: true, 
                message: 'User synced successfully',
                userId: user._id
            });
        } else {
            // Create new user
            const username = currentUser.username || `user_${Date.now().toString().slice(-8)}`;
            const password = currentUser.password || `pwd_${Math.random().toString(36).slice(-8)}`;
            const referralCode = currentUser.referral_code || currentUser.referralCode || generateReferralCode();
            
            user = new User({
                email: currentUser.email,
                username: username,
                password: password,
                telegram_id: currentUser.telegram_id || null,
                phone: currentUser.phone || currentUser.mobile || null,
                full_name: currentUser.full_name || username,
                referral_code: referralCode,
                referred_by: currentUser.referred_by || currentUser.sponsorId || null,
                points: currentUser.points || 0,
                total_earned: currentUser.total_earned || currentUser.totalEarned || 0,
                tasks_completed: currentUser.tasks_completed || currentUser.tasksCompleted || 0,
                level: currentUser.level || 1,
                status: 'active'
            });
            
            await user.save();
            
            console.log(`✅ New user created via sync: ${currentUser.email} with ID: ${user._id}`);
            
            // Create referral record if referred
            if (user.referred_by) {
                const referrer = await User.findOne({ referral_code: user.referred_by });
                if (referrer) {
                    const referral = new Referral({
                        referrer_id: referrer._id,
                        referred_id: user._id,
                        referral_code: user.referred_by,
                        points_earned: 25
                    });
                    await referral.save();
                    
                    // Update referrer points
                    referrer.points += 25;
                    referrer.total_earned += 25;
                    await referrer.save();
                }
            }
            
            res.json({ 
                success: true, 
                message: 'User created successfully',
                userId: user._id,
                username: username,
                referralCode: referralCode
            });
        }
    } catch (error) {
        console.error('❌ Error in sync-user:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==========================================
// ✅ USER REGISTRATION AND AUTHENTICATION
// ==========================================

// ✅ SAVE USER (Registration/Update)
app.post('/api/save-user', async (req, res) => {
    try {
        const userData = req.body;
        console.log('📥 Received user data for save:', userData.email);

        // Check if user exists
        let user = await User.findOne({ email: userData.email });

        if (user) {
            // Update existing user
            user.username = userData.username || user.username;
            user.telegram_id = userData.telegram_id || user.telegram_id;
            user.phone = userData.phone || userData.mobile || user.phone;
            user.full_name = userData.full_name || user.full_name;
            user.points = userData.points || user.points;
            user.total_earned = userData.total_earned || userData.totalEarned || user.total_earned;
            user.tasks_completed = userData.tasks_completed || user.tasks_completed;
            user.level = userData.level || user.level;
            user.last_login = new Date();
            
            await user.save();
            
            console.log(`✅ User updated: ${user.email}`);
            res.json({ 
                success: true, 
                message: 'User updated successfully',
                userId: user._id
            });
        } else {
            // Create new user
            const username = userData.username || `user_${Date.now().toString().slice(-8)}`;
            const password = userData.password || `pwd_${Math.random().toString(36).slice(-8)}`;
            const referralCode = userData.referral_code || generateReferralCode();
            
            user = new User({
                email: userData.email,
                username: username,
                password: password,
                telegram_id: userData.telegram_id || null,
                phone: userData.phone || userData.mobile || null,
                full_name: userData.full_name || username,
                referral_code: referralCode,
                referred_by: userData.referred_by || userData.sponsorId || null,
                points: userData.points || 100, // Initial bonus
                total_earned: userData.total_earned || userData.totalEarned || 100,
                tasks_completed: userData.tasks_completed || 0,
                level: userData.level || 1,
                status: 'active'
            });
            
            await user.save();
            
            console.log(`✅ New user created: ${userData.email} with ID: ${user._id}`);
            
            // Create referral record if referred
            if (user.referred_by) {
                const referrer = await User.findOne({ referral_code: user.referred_by });
                if (referrer) {
                    const referral = new Referral({
                        referrer_id: referrer._id,
                        referred_id: user._id,
                        referral_code: user.referred_by,
                        points_earned: 50
                    });
                    await referral.save();
                    
                    // Update referrer points
                    referrer.points += 50;
                    referrer.total_earned += 50;
                    await referrer.save();
                    
                    // Create wallet transaction for referrer
                    const walletTransaction = new WalletTransaction({
                        user_id: referrer._id,
                        transaction_type: 'earning',
                        amount: 50,
                        description: `Referral commission from ${user.username}`,
                        category: 'referral',
                        balance_after: referrer.points
                    });
                    await walletTransaction.save();
                }
            }
            
            res.json({ 
                success: true, 
                message: 'User created successfully',
                userId: user._id,
                username: username,
                referralCode: referralCode
            });
        }
    } catch (error) {
        console.error('❌ Error saving user:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ✅ LOGIN USER
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ 
            $or: [
                { email: email },
                { username: email }
            ],
            password: password
        });
        
        if (user) {
            // Update last login
            user.last_login = new Date();
            await user.save();
            
            res.json({ 
                success: true, 
                message: 'Login successful',
                user: {
                    id: user._id,
                    email: user.email,
                    username: user.username,
                    points: user.points,
                    level: user.level,
                    referral_code: user.referral_code,
                    is_admin: user.is_admin
                }
            });
        } else {
            res.json({ 
                success: false, 
                message: 'Invalid email/username or password'
            });
        }
    } catch (error) {
        console.error('❌ Error during login:', error);
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

// ==========================================
// ✅ WALLET AND TRANSACTIONS
// ==========================================

// ✅ SAVE WALLET TRANSACTION
app.post('/api/save-transaction', async (req, res) => {
    try {
        const { userId, transactionType, amount, description, category, subCategory, currency } = req.body;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }
        
        const balanceBefore = user.points;
        let balanceAfter = balanceBefore;
        
        if (transactionType === 'earning') {
            balanceAfter += amount;
            user.points = balanceAfter;
            user.total_earned += amount;
        } else if (transactionType === 'spending') {
            balanceAfter -= amount;
            user.points = balanceAfter;
        }
        
        await user.save();
        
        // Create wallet transaction record
        const walletTransaction = new WalletTransaction({
            user_id: userId,
            transaction_type: transactionType,
            amount: amount,
            description: description,
            category: category || 'general',
            sub_category: subCategory || '',
            balance_before: balanceBefore,
            balance_after: balanceAfter,
            currency: currency || 'points'
        });
        
        await walletTransaction.save();
        
        res.json({ 
            success: true, 
            message: 'Transaction saved',
            newBalance: balanceAfter,
            transactionId: walletTransaction._id
        });
    } catch (error) {
        console.error('❌ Error saving transaction:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ✅ GET USER WALLET HISTORY
app.get('/api/get-wallet-history/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        
        const history = await WalletTransaction.find({ user_id: userId })
            .sort({ transaction_date: -1 })
            .limit(50);
        
        res.json({ success: true, history: history });
    } catch (error) {
        console.error('❌ Error fetching wallet history:', error);
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

// ✅ CONVERT POINTS TO INR
app.post('/api/convert-points-to-inr', async (req, res) => {
    try {
        const { userId, points, description } = req.body;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }
        
        // Check minimum conversion (10000 points = 100 INR)
        if (points < 10000) {
            return res.json({ success: false, message: 'Minimum 10000 points required' });
        }
        
        if (user.points < points) {
            return res.json({ success: false, message: 'Insufficient points' });
        }
        
        const inrAmount = Math.floor((points / 10000) * 100);
        
        // Update user balances
        user.points -= points;
        user.inr_wallet += inrAmount;
        user.total_converted += points;
        
        await user.save();
        
        // Create transaction record for points deduction
        const pointsTransaction = new WalletTransaction({
            user_id: userId,
            transaction_type: 'spending',
            amount: points,
            description: description || `Converted ${points} points to INR`,
            category: 'conversion',
            sub_category: 'points_to_inr',
            balance_after: user.points,
            currency: 'points',
            conversion_rate: 10000,
            converted_from: 'points',
            converted_to: 'INR'
        });
        
        // Create transaction record for INR credit
        const inrTransaction = new WalletTransaction({
            user_id: userId,
            transaction_type: 'earning',
            amount: inrAmount,
            description: `Received ${inrAmount} INR from points conversion`,
            category: 'conversion',
            sub_category: 'inr_credit',
            balance_after: user.inr_wallet,
            currency: 'INR'
        });
        
        await Promise.all([
            pointsTransaction.save(),
            inrTransaction.save()
        ]);
        
        res.json({ 
            success: true, 
            message: 'Points converted to INR successfully',
            points: user.points,
            inr_wallet: user.inr_wallet,
            inr_amount: inrAmount
        });
    } catch (error) {
        console.error('❌ Error converting points to INR:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ✅ CONVERT INR TO USDT
app.post('/api/convert-inr-to-usdt', async (req, res) => {
    try {
        const { userId, inrAmount, description } = req.body;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }
        
        // Check minimum conversion (85 INR = 1 USDT)
        if (inrAmount < 85) {
            return res.json({ success: false, message: 'Minimum 85 INR required' });
        }
        
        if (user.inr_wallet < inrAmount) {
            return res.json({ success: false, message: 'Insufficient INR balance' });
        }
        
        const usdtAmount = parseFloat((inrAmount / 85).toFixed(2));
        
        // Update user balances
        user.inr_wallet -= inrAmount;
        user.usdt_wallet += usdtAmount;
        
        await user.save();
        
        // Create transaction record for INR deduction
        const inrTransaction = new WalletTransaction({
            user_id: userId,
            transaction_type: 'spending',
            amount: inrAmount,
            description: description || `Converted ${inrAmount} INR to USDT`,
            category: 'conversion',
            sub_category: 'inr_to_usdt',
            balance_after: user.inr_wallet,
            currency: 'INR',
            conversion_rate: 85,
            converted_from: 'INR',
            converted_to: 'USDT'
        });
        
        // Create transaction record for USDT credit
        const usdtTransaction = new WalletTransaction({
            user_id: userId,
            transaction_type: 'earning',
            amount: usdtAmount,
            description: `Received ${usdtAmount} USDT from INR conversion`,
            category: 'conversion',
            sub_category: 'usdt_credit',
            balance_after: user.usdt_wallet,
            currency: 'USDT'
        });
        
        await Promise.all([
            inrTransaction.save(),
            usdtTransaction.save()
        ]);
        
        res.json({ 
            success: true, 
            message: 'INR converted to USDT successfully',
            inr_wallet: user.inr_wallet,
            usdt_wallet: user.usdt_wallet,
            usdt_amount: usdtAmount
        });
    } catch (error) {
        console.error('❌ Error converting INR to USDT:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==========================================
// ✅ MINING POOLS
// ==========================================

// ✅ SAVE MINING POOL
app.post('/api/save-mining-pool', async (req, res) => {
    try {
        const poolData = req.body;
        
        const miningPool = new MiningPool({
            user_id: poolData.user_id,
            pool_id: poolData.pool_id,
            pool_name: poolData.pool_name,
            pool_icon: poolData.pool_icon,
            pool_type: poolData.pool_type,
            investment_amount: poolData.investment_amount || 0,
            investment_currency: poolData.investment_currency || 'points',
            duration_hours: poolData.duration_hours,
            expected_points: poolData.expected_points,
            start_time: new Date(),
            end_time: new Date(Date.now() + (poolData.duration_hours * 60 * 60 * 1000)),
            status: 'active',
            progress: 0
        });
        
        await miningPool.save();
        
        res.json({ 
            success: true, 
            message: 'Mining pool saved',
            poolId: miningPool._id
        });
    } catch (error) {
        console.error('❌ Error saving mining pool:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ✅ UPDATE MINING POOL PROGRESS
app.post('/api/update-pool-progress', async (req, res) => {
    try {
        const { poolId, progress, status } = req.body;
        
        const miningPool = await MiningPool.findById(poolId);
        if (!miningPool) {
            return res.json({ success: false, message: 'Mining pool not found' });
        }
        
        miningPool.progress = progress;
        if (status) miningPool.status = status;
        
        if (status === 'completed') {
            miningPool.completed_at = new Date();
        }
        
        await miningPool.save();
        
        res.json({ 
            success: true, 
            message: 'Pool progress updated'
        });
    } catch (error) {
        console.error('❌ Error updating pool progress:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ✅ CLAIM MINING POOL REWARDS
app.post('/api/claim-pool-rewards', async (req, res) => {
    try {
        const { poolId } = req.body;
        
        const miningPool = await MiningPool.findById(poolId);
        if (!miningPool) {
            return res.json({ success: false, message: 'Mining pool not found' });
        }
        
        if (miningPool.status !== 'completed' || miningPool.claimed) {
            return res.json({ success: false, message: 'Pool not ready for claiming' });
        }
        
        // Update user points
        const user = await User.findById(miningPool.user_id);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }
        
        user.points += miningPool.expected_points;
        user.total_earned += miningPool.expected_points;
        
        // Mark pool as claimed
        miningPool.claimed = true;
        miningPool.claim_date = new Date();
        miningPool.actual_points = miningPool.expected_points;
        
        await Promise.all([
            user.save(),
            miningPool.save()
        ]);
        
        // Create wallet transaction
        const walletTransaction = new WalletTransaction({
            user_id: miningPool.user_id,
            transaction_type: 'earning',
            amount: miningPool.expected_points,
            description: `Mining pool rewards: ${miningPool.pool_name}`,
            category: 'mining',
            balance_after: user.points
        });
        
        await walletTransaction.save();
        
        res.json({ 
            success: true, 
            message: 'Pool rewards claimed successfully',
            points: miningPool.expected_points,
            newBalance: user.points
        });
    } catch (error) {
        console.error('❌ Error claiming pool rewards:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==========================================
// ✅ TASKS AND VIDEOS
// ==========================================

// ✅ SAVE COMPLETED TASK
app.post('/api/save-task', async (req, res) => {
    try {
        const taskData = req.body;
        
        // Check if task already completed
        const existingTask = await TaskCompletion.findOne({
            user_id: taskData.user_id,
            task_id: taskData.task_id
        });
        
        if (existingTask) {
            return res.json({ success: false, message: 'Task already completed' });
        }
        
        const taskCompletion = new TaskCompletion({
            user_id: taskData.user_id,
            task_id: taskData.task_id,
            task_type: taskData.task_type,
            task_name: taskData.task_name,
            points_earned: taskData.points_earned,
            platform: taskData.platform,
            video_id: taskData.video_id,
            channel_id: taskData.channel_id,
            verified: true
        });
        
        await taskCompletion.save();
        
        // Update user stats
        const user = await User.findById(taskData.user_id);
        if (user) {
            user.points += taskData.points_earned;
            user.total_earned += taskData.points_earned;
            user.tasks_completed += 1;
            await user.save();
        }
        
        res.json({ 
            success: true, 
            message: 'Task saved',
            taskId: taskCompletion._id
        });
    } catch (error) {
        console.error('❌ Error saving task:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ✅ SAVE VIDEO WATCH
app.post('/api/save-video-watch', async (req, res) => {
    try {
        const videoData = req.body;
        
        // Check if video already watched
        const existingVideo = await TaskCompletion.findOne({
            user_id: videoData.user_id,
            video_id: videoData.video_id
        });
        
        if (existingVideo) {
            return res.json({ success: false, message: 'Video already watched' });
        }
        
        const videoWatch = new TaskCompletion({
            user_id: videoData.user_id,
            task_id: `video_${videoData.video_id}`,
            task_type: 'video',
            task_name: `Watched video: ${videoData.video_title || 'Unknown'}`,
            points_earned: videoData.points_earned,
            platform: videoData.platform || 'youtube',
            video_id: videoData.video_id,
            channel_id: videoData.channel_id
        });
        
        await videoWatch.save();
        
        // Update user stats
        const user = await User.findById(videoData.user_id);
        if (user) {
            user.points += videoData.points_earned;
            user.total_earned += videoData.points_earned;
            user.tasks_completed += 1;
            await user.save();
        }
        
        res.json({ 
            success: true, 
            message: 'Video watch saved',
            videoId: videoWatch._id
        });
    } catch (error) {
        console.error('❌ Error saving video watch:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ✅ CHECK IF VIDEO ALREADY WATCHED
app.get('/api/check-video-watched/:userId/:videoId', async (req, res) => {
    try {
        const { userId, videoId } = req.params;
        
        const video = await TaskCompletion.findOne({
            user_id: userId,
            video_id: videoId
        });
        
        res.json({ success: true, watched: !!video });
    } catch (error) {
        console.error('❌ Error checking video:', error);
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

// ==========================================
// ✅ REFERRALS AND COMMISSIONS
// ==========================================

// ✅ SAVE REFERRAL
app.post('/api/save-referral', async (req, res) => {
    try {
        const referralData = req.body;
        
        const referral = new Referral({
            referrer_id: referralData.referrer_id,
            referred_id: referralData.referred_id,
            referral_code: referralData.referral_code,
            points_earned: referralData.points_earned || 50,
            status: 'active'
        });
        
        await referral.save();
        
        res.json({ 
            success: true, 
            message: 'Referral saved',
            referralId: referral._id
        });
    } catch (error) {
        console.error('❌ Error saving referral:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ✅ SAVE SPONSOR COMMISSION
app.post('/api/save-commission', async (req, res) => {
    try {
        const commissionData = req.body;
        
        const commission = new SponsorCommission({
            sponsor_id: commissionData.sponsor_id,
            user_id: commissionData.user_id,
            commission_type: commissionData.commission_type,
            amount: commissionData.amount,
            percentage: commissionData.percentage,
            activity_type: commissionData.activity_type,
            activity_description: commissionData.activity_description,
            original_amount: commissionData.original_amount,
            status: 'completed'
        });
        
        await commission.save();
        
        res.json({ 
            success: true, 
            message: 'Commission saved',
            commissionId: commission._id
        });
    } catch (error) {
        console.error('❌ Error saving commission:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ✅ GET USER REFERRALS
app.get('/api/get-referrals/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        
        const referrals = await Referral.find({ referrer_id: userId })
            .populate('referred_id', 'username email registration_date')
            .sort({ referral_date: -1 });
        
        res.json({ success: true, referrals: referrals || [] });
    } catch (error) {
        console.error('❌ Error fetching referrals:', error);
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

// ✅ GET USER COMMISSIONS
app.get('/api/get-commissions/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        
        const commissions = await SponsorCommission.find({ sponsor_id: userId })
            .populate('user_id', 'username email')
            .sort({ created_at: -1 })
            .limit(20);
        
        res.json({ success: true, commissions: commissions || [] });
    } catch (error) {
        console.error('❌ Error fetching commissions:', error);
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

// ==========================================
// ✅ DAILY ACTIVITIES
// ==========================================

// ✅ SAVE DAILY ACTIVITY
app.post('/api/save-daily-activity', async (req, res) => {
    try {
        const activityData = req.body;
        
        const today = new Date().toISOString().split('T')[0];
        
        // Check if activity already completed today
        const existingActivity = await DailyActivity.findOne({
            user_id: activityData.user_id,
            activity_id: activityData.activity_id,
            date: today
        });
        
        if (existingActivity) {
            return res.json({ success: false, message: 'Activity already completed today' });
        }
        
        const dailyActivity = new DailyActivity({
            user_id: activityData.user_id,
            activity_id: activityData.activity_id,
            activity_type: activityData.activity_type,
            points_earned: activityData.points_earned,
            date: today,
            streak_day: activityData.streak_day,
            platform: activityData.platform
        });
        
        await dailyActivity.save();
        
        // Update user points
        const user = await User.findById(activityData.user_id);
        if (user) {
            user.points += activityData.points_earned;
            user.total_earned += activityData.points_earned;
            user.daily_streak = activityData.streak_day;
            user.last_daily_activity = new Date();
            await user.save();
        }
        
        res.json({ 
            success: true, 
            message: 'Daily activity saved',
            activityId: dailyActivity._id
        });
    } catch (error) {
        console.error('❌ Error saving daily activity:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ✅ GET TODAY'S ACTIVITIES
app.get('/api/get-today-activities/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const today = new Date().toISOString().split('T')[0];
        
        const activities = await DailyActivity.find({
            user_id: userId,
            date: today
        }).sort({ completed_at: -1 });
        
        res.json({ success: true, activities: activities || [] });
    } catch (error) {
        console.error('❌ Error fetching today activities:', error);
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

// ==========================================
// ✅ ADMIN ENDPOINTS
// ==========================================

// ✅ GET ALL USERS WITH FULL DETAILS (Admin)
app.get('/api/admin/users-full', async (req, res) => {
    try {
        const users = await User.find()
            .select('-password -__v')
            .sort({ registration_date: -1 });
        
        const totalUsers = await User.countDocuments();
        const totalPoints = await User.aggregate([
            { $group: { _id: null, total: { $sum: "$points" } } }
        ]);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayRegistrations = await User.countDocuments({
            registration_date: { $gte: today }
        });
        
        res.json({ 
            success: true, 
            users: users || [],
            totals: {
                total_users: totalUsers,
                total_points: totalPoints[0]?.total || 0,
                today_registrations: todayRegistrations
            },
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Error fetching full users data:', error);
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

// ✅ GET REAL-TIME USER STATS (Admin)
app.get('/api/admin/user-stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        
        const totalPointsResult = await User.aggregate([
            { $group: { _id: null, total: { $sum: "$points" } } }
        ]);
        const totalPoints = totalPointsResult[0]?.total || 0;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayRegistrations = await User.countDocuments({
            registration_date: { $gte: today }
        });
        
        const activeToday = await User.countDocuments({
            last_login: { $gte: today }
        });
        
        const stats = {
            userCount: totalUsers,
            totalPoints: totalPoints,
            todayRegistrations: todayRegistrations,
            activeToday: activeToday,
            timestamp: new Date().toISOString()
        };
        
        res.json({ success: true, stats });
    } catch (error) {
        console.error('❌ Error getting user stats:', error);
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

// ✅ SYNC ALL USERS FROM LOCAL STORAGE (Admin)
app.post('/api/admin/sync-all', async (req, res) => {
    try {
        const { users } = req.body;
        
        if (!Array.isArray(users)) {
            return res.status(400).json({ success: false, message: 'Users must be an array' });
        }
        
        let syncedCount = 0;
        let errors = [];
        
        for (const user of users) {
            try {
                const existingUser = await User.findOne({ email: user.email });
                
                if (!existingUser) {
                    const newUser = new User({
                        email: user.email,
                        username: user.username || `user_${Date.now().toString().slice(-8)}`,
                        password: user.password || `pwd_${Math.random().toString(36).slice(-8)}`,
                        phone: user.mobile || user.phone,
                        full_name: user.full_name || user.username,
                        referral_code: user.referralCode || generateReferralCode(),
                        referred_by: user.sponsorId || user.referred_by,
                        points: user.points || 0,
                        total_earned: user.totalEarned || 0,
                        tasks_completed: user.tasksCompleted || 0,
                        level: user.level || 1,
                        status: user.status || 'active',
                        registration_date: user.registeredAt || new Date()
                    });
                    
                    await newUser.save();
                    syncedCount++;
                } else {
                    // Update existing user
                    existingUser.username = user.username || existingUser.username;
                    existingUser.phone = user.mobile || user.phone || existingUser.phone;
                    existingUser.points = Math.max(existingUser.points, user.points || 0);
                    existingUser.total_earned = Math.max(existingUser.total_earned, user.totalEarned || 0);
                    existingUser.tasks_completed = Math.max(existingUser.tasks_completed, user.tasksCompleted || 0);
                    existingUser.level = Math.max(existingUser.level, user.level || 1);
                    
                    await existingUser.save();
                    syncedCount++;
                }
            } catch (error) {
                errors.push(`Error syncing user ${user.email}: ${error.message}`);
            }
        }
        
        res.json({ 
            success: true, 
            message: `Synced ${syncedCount} users`,
            count: syncedCount,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        console.error('Error syncing users:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ✅ GET DATABASE INFORMATION (Admin)
app.get('/api/admin/database-info', async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const transactionCount = await WalletTransaction.countDocuments();
        const miningPoolCount = await MiningPool.countDocuments();
        const taskCount = await TaskCompletion.countDocuments();
        const referralCount = await Referral.countDocuments();
        const commissionCount = await SponsorCommission.countDocuments();
        
        const dbStats = await mongoose.connection.db.stats();
        
        res.json({
            success: true,
            info: {
                totalRecords: userCount + transactionCount + miningPoolCount + taskCount + referralCount + commissionCount,
                size: (dbStats.storageSize / 1024 / 1024).toFixed(2) + ' MB',
                collections: 7,
                counts: {
                    users: userCount,
                    wallet_transactions: transactionCount,
                    mining_pools: miningPoolCount,
                    tasks: taskCount,
                    referrals: referralCount,
                    commissions: commissionCount
                },
                lastBackup: new Date().toISOString(),
                created: new Date(),
                modified: new Date()
            }
        });
    } catch (error) {
        console.error('Error getting database info:', error);
        res.json({ success: false, info: {} });
    }
});

// ✅ FIX DATABASE ISSUES (Admin)
app.get('/api/admin/fix-database', async (req, res) => {
    try {
        let fixedCount = 0;
        
        // Fix negative points
        const result = await User.updateMany(
            { points: { $lt: 0 } },
            { $set: { points: 0 } }
        );
        
        fixedCount += result.modifiedCount;
        
        // Fix duplicate emails
        const duplicates = await User.aggregate([
            { $group: { 
                _id: { email: "$email" }, 
                count: { $sum: 1 }, 
                ids: { $push: "$_id" } 
            }},
            { $match: { count: { $gt: 1 } } }
        ]);
        
        for (const dup of duplicates) {
            const [keepId, ...deleteIds] = dup.ids;
            
            // Delete duplicate users
            await User.deleteMany({ 
                _id: { $in: deleteIds } 
            });
            
            fixedCount += deleteIds.length;
        }
        
        res.json({
            success: true,
            message: `Fixed ${duplicates.length} duplicate emails and ${result.modifiedCount} negative points`,
            fixedCount: fixedCount
        });
    } catch (error) {
        console.error('Error fixing database:', error);
        res.json({ success: false, error: error.message });
    }
});

// ✅ UPDATE USER STATUS (Admin)
app.post('/api/admin/update-user-status', async (req, res) => {
    try {
        const { userId, status } = req.body;
        
        const user = await User.findByIdAndUpdate(
            userId,
            { status: status },
            { new: true }
        );
        
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }
        
        res.json({ 
            success: true, 
            message: `User ${status === 'active' ? 'activated' : 'deactivated'} successfully`
        });
    } catch (error) {
        console.error('❌ Error updating user status:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// ✅ UPDATE USER POINTS (Admin)
app.post('/api/admin/update-user-points', async (req, res) => {
    try {
        const { userId, points, operation } = req.body;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }
        
        let newPoints = user.points;
        let description = '';
        
        if (operation === 'add') {
            newPoints += points;
            description = 'Admin added points';
        } else if (operation === 'subtract') {
            newPoints -= points;
            description = 'Admin deducted points';
        } else if (operation === 'set') {
            newPoints = points;
            description = 'Admin set points';
        } else {
            return res.status(400).json({ success: false, message: 'Invalid operation' });
        }
        
        user.points = newPoints;
        await user.save();
        
        // Log the transaction
        const walletTransaction = new WalletTransaction({
            user_id: userId,
            transaction_type: 'admin_adjustment',
            amount: points,
            description: description,
            category: 'admin',
            balance_after: newPoints
        });
        
        await walletTransaction.save();
        
        res.json({ 
            success: true, 
            message: 'User points updated successfully',
            newPoints: newPoints
        });
    } catch (error) {
        console.error('❌ Error updating user points:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// ✅ SEARCH USERS (Admin)
app.get('/api/admin/search-users', async (req, res) => {
    try {
        const searchTerm = req.query.q || '';
        
        if (!searchTerm) {
            return res.json({ success: true, users: [] });
        }
        
        const users = await User.find({
            $or: [
                { email: { $regex: searchTerm, $options: 'i' } },
                { username: { $regex: searchTerm, $options: 'i' } },
                { phone: { $regex: searchTerm, $options: 'i' } },
                { full_name: { $regex: searchTerm, $options: 'i' } }
            ]
        })
        .select('id email username points registration_date last_login status')
        .sort({ registration_date: -1 })
        .limit(50);
        
        res.json({ success: true, users: users || [] });
    } catch (error) {
        console.error('❌ Error searching users:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// ==========================================
// ✅ NOTIFICATION AND ACTIVITY ENDPOINTS
// ==========================================

// ✅ NOTIFY ADMIN ENDPOINT
app.post('/api/notify-admin', (req, res) => {
    const notification = req.body;
    console.log('📢 Admin notification:', notification);
    
    // You can save notification to database if needed
    res.json({ success: true, message: 'Notification received' });
});

// ✅ GET RECENT ACTIVITIES (Admin)
app.get('/api/admin/recent-activities', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const recentUsers = await User.find({
            registration_date: { $gte: today }
        })
        .select('id username email registration_date')
        .sort({ registration_date: -1 })
        .limit(50);
        
        const recentLogins = await User.find({
            last_login: { $gte: today }
        })
        .select('id username email last_login')
        .sort({ last_login: -1 })
        .limit(50);
        
        res.json({
            success: true,
            recentRegistrations: recentUsers || [],
            recentLogins: recentLogins || [],
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error in recent-activities:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ✅ REAL-TIME SYNC ENDPOINT (HTTP Polling)
app.get('/api/admin/realtime-sync', async (req, res) => {
    try {
        const lastSync = req.query.lastSync || 0;
        const now = Date.now();
        
        const recentUsers = await User.find({
            registration_date: { 
                $gte: new Date(now - 5 * 60 * 1000) // Last 5 minutes
            }
        })
        .select('id username email registration_date')
        .sort({ registration_date: -1 });
        
        const recentLogins = await User.find({
            last_login: { 
                $gte: new Date(now - 5 * 60 * 1000) // Last 5 minutes
            }
        })
        .select('id username email last_login')
        .sort({ last_login: -1 });
        
        res.json({
            success: true,
            recentUsers: recentUsers || [],
            recentLogins: recentLogins || [],
            timestamp: now,
            lastSync: lastSync
        });
    } catch (error) {
        console.error('Error in realtime-sync:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==========================================
// ✅ UTILITY ENDPOINTS
// ==========================================

// ✅ GET USER BY EMAIL
app.get('/api/get-user/:email', async (req, res) => {
    try {
        const email = req.params.email;
        
        const user = await User.findOne({ email: email });
        
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }
        
        // Fetch related data
        const walletHistory = await WalletTransaction.find({ user_id: user._id })
            .sort({ transaction_date: -1 })
            .limit(10);
        
        const miningPools = await MiningPool.find({ 
            user_id: user._id,
            status: 'active'
        });
        
        const tasks = await TaskCompletion.find({ user_id: user._id });
        
        const commissions = await SponsorCommission.find({ sponsor_id: user._id })
            .sort({ transaction_date: -1 })
            .limit(10);
        
        const userData = {
            ...user.toObject(),
            walletHistory: walletHistory || [],
            miningPools: miningPools || [],
            tasks: tasks || [],
            commissions: commissions || []
        };
        
        res.json({ success: true, user: userData });
    } catch (error) {
        console.error('❌ Error fetching user:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// ✅ GET USER BY ID
app.get('/api/get-user-by-id/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        
        const user = await User.findById(userId);
        
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }
        
        res.json({ success: true, user: user });
    } catch (error) {
        console.error('❌ Error fetching user by ID:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// ✅ CHECK IF EMAIL EXISTS
app.get('/api/check-email/:email', async (req, res) => {
    try {
        const email = req.params.email;
        
        const user = await User.findOne({ email: email });
        
        res.json({ exists: !!user });
    } catch (error) {
        console.error('❌ Error checking email:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// ✅ GET USER BY REFERRAL CODE
app.get('/api/user-by-referral/:referralCode', async (req, res) => {
    try {
        const referralCode = req.params.referralCode;
        
        const user = await User.findOne({ referral_code: referralCode });
        
        res.json({ success: !!user, user: user || null });
    } catch (error) {
        console.error('❌ Error fetching user by referral:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// ✅ HEALTH CHECK ENDPOINT
app.get('/api/health', async (req, res) => {
    try {
        const health = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
            totalUsers: await User.countDocuments(),
            totalTransactions: await WalletTransaction.countDocuments()
        };
        
        res.json(health);
    } catch (error) {
        res.json({
            status: 'error',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

// ==========================================
// ✅ SERVER CONFIGURATION
// ==========================================

// ✅ Serve main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ✅ Serve admin HTML file
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// ✅ Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔗 API endpoints available at http://localhost:${PORT}/api/`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`👑 Admin Panel: http://localhost:${PORT}/admin`);
    console.log(`👥 All users API: http://localhost:${PORT}/api/get-all-users`);
    console.log(`📈 Admin user stats: http://localhost:${PORT}/api/admin/user-stats`);
    console.log(`💾 Database info: http://localhost:${PORT}/api/admin/database-info`);
    console.log(`🔄 Sync users: http://localhost:${PORT}/api/admin/sync-all`);
    console.log(`🔧 Fix database: http://localhost:${PORT}/api/admin/fix-database`);
    console.log(`🔄 Sync single user: http://localhost:${PORT}/api/sync-user`);
    console.log(`📢 Notify admin: http://localhost:${PORT}/api/notify-admin`);
    console.log(`📊 Recent activities: http://localhost:${PORT}/api/admin/recent-activities`);
    console.log(`⚡ Real-time sync: http://localhost:${PORT}/api/admin/realtime-sync`);
    console.log(`✅ Server started successfully at ${new Date().toLocaleString()}`);
});

// ✅ Handle server shutdown
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error closing database:', err.message);
        process.exit(1);
    }
});