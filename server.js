const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// ✅ MongoDB Atlas Connection String with fallback
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://tapearn_admin:Admin123456@cluster0.ivp6m5c.mongodb.net/tapearn_db?retryWrites=true&w=majority&appName=Cluster0';

// ✅ Dynamic CORS setup for both localhost and production
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:8080',
  'http://localhost:19006',
  'https://tapearn-native-app.onrender.com',
  'https://*.onrender.com',
  'https://tapearn-app.com',
  'http://localhost'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || 
        origin.includes('localhost') || 
        origin.includes('onrender.com')) {
      callback(null, true);
    } else {
      callback(null, true); // You can change this to false for stricter security
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ✅ Security Middleware with flexible CSP for development and production
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:", "http:", "blob:"],
      connectSrc: ["'self'", "ws://localhost:*", "http://localhost:*", "https://tapearn-native-app.onrender.com", "*"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'"],
      workerSrc: ["'self'", "blob:"]
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Rate Limiting with different limits for different routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: 'Too many requests from this IP, please try again later.'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many login attempts, please try again later.'
});

app.use('/api/', apiLimiter);
app.use('/api/login', authLimiter);
app.use('/api/register', authLimiter);

// ==========================================
// ✅ MONGODB CONNECTION WITH RETRY LOGIC
// ==========================================

console.log('🔄 Connecting to MongoDB Atlas...');

let isConnected = false;
let retryCount = 0;
const maxRetries = 5;

async function connectToMongoDB() {
  try {
    // Clean connection string (remove any accidental quotes or spaces)
    let cleanUri = MONGODB_URI.trim();
    if (cleanUri.startsWith('"') && cleanUri.endsWith('"')) {
      cleanUri = cleanUri.slice(1, -1);
    }
    
    // Log first 40 chars for debugging (without password)
    const uriForLog = cleanUri.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://$1:****@');
    console.log('📡 Connection URI:', uriForLog.substring(0, 80) + '...');
    
    await mongoose.connect(cleanUri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 50,
      retryWrites: true,
      w: 'majority',
      connectTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000,
      serverSelectionTimeoutMS: 30000
    });
    
    isConnected = true;
    retryCount = 0;
    
    console.log('✅ Connected to MongoDB Atlas successfully!');
    console.log('📊 Database:', mongoose.connection.name);
    console.log('🌐 Host:', mongoose.connection.host);
    
    // Set up connection event handlers
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
      isConnected = false;
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
      isConnected = false;
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('🔌 MongoDB reconnected');
      isConnected = true;
    });
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📋 Found ${collections.length} collections:`);
    collections.forEach(col => console.log(`   - ${col.name}`));
    
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    
    // Retry logic
    if (retryCount < maxRetries) {
      retryCount++;
      console.log(`🔄 Retrying connection (${retryCount}/${maxRetries})...`);
      setTimeout(connectToMongoDB, 5000);
    } else {
      console.error('❌ Max retries reached. Please check your MongoDB configuration.');
      console.log('⚠️ TROUBLESHOOTING:');
      console.log('1. Check if MongoDB Atlas cluster is running');
      console.log('2. Verify network access (IP whitelist)');
      console.log('3. Check database user credentials');
      console.log('4. Ensure connection string is correct');
    }
  }
}

// Start MongoDB connection
connectToMongoDB();

// ==========================================
// ✅ MONGOOSE SCHEMAS (OPTIMIZED)
// ==========================================

// User Schema
const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true 
  },
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  telegram_id: { 
    type: String, 
    sparse: true 
  },
  phone: { 
    type: String, 
    sparse: true 
  },
  full_name: String,
  points: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  total_earned: { 
    type: Number, 
    default: 0 
  },
  inr_wallet: { 
    type: Number, 
    default: 0 
  },
  usdt_wallet: { 
    type: Number, 
    default: 0 
  },
  total_converted: { 
    type: Number, 
    default: 0 
  },
  referral_code: { 
    type: String, 
    unique: true, 
    uppercase: true 
  },
  referred_by: String,
  sponsor_id: String,
  sponsor_name: String,
  level: { 
    type: Number, 
    default: 1,
    min: 1,
    max: 10 
  },
  tasks_completed: { 
    type: Number, 
    default: 0 
  },
  daily_streak: { 
    type: Number, 
    default: 0 
  },
  last_login_date: Date,
  last_daily_activity: Date,
  email_verified: { 
    type: Boolean, 
    default: false 
  },
  mobile_verified: { 
    type: Boolean, 
    default: false 
  },
  verification_status: { 
    type: String, 
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending' 
  },
  status: { 
    type: String, 
    enum: ['active', 'suspended', 'banned', 'deleted'],
    default: 'active' 
  },
  registration_date: { 
    type: Date, 
    default: Date.now 
  },
  last_login: { 
    type: Date, 
    default: Date.now 
  },
  free_pool_completed: { 
    type: Boolean, 
    default: false 
  },
  free_pool_tasks: [{
    task_id: String,
    completed: Boolean,
    completed_at: Date
  }],
  today_earnings: { 
    type: Number, 
    default: 0 
  },
  total_mining_time: { 
    type: Number, 
    default: 0 
  },
  session_count: { 
    type: Number, 
    default: 0 
  },
  is_admin: { 
    type: Boolean, 
    default: false 
  },
  admin_level: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 3 
  },
  ip_address: String,
  user_agent: String,
  device_type: String,
  device_id: String,
  notifications_enabled: {
    type: Boolean,
    default: true
  },
  two_factor_enabled: {
    type: Boolean,
    default: false
  },
  last_seen: Date
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total balance
userSchema.virtual('total_balance').get(function() {
  return this.points + (this.inr_wallet * 100) + (this.usdt_wallet * 85 * 100);
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ referral_code: 1 });
userSchema.index({ status: 1, last_login: -1 });
userSchema.index({ points: -1 });

// Wallet Transaction Schema
const walletTransactionSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  transaction_id: {
    type: String,
    unique: true,
    default: () => `TX${Date.now()}${Math.random().toString(36).substr(2, 9)}`
  },
  transaction_type: { 
    type: String, 
    enum: ['earning', 'spending', 'transfer', 'conversion', 'withdrawal', 'deposit', 'referral', 'bonus'],
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  description: String,
  category: {
    type: String,
    enum: ['task', 'video', 'mining', 'referral', 'bonus', 'conversion', 'withdrawal', 'deposit', 'admin', 'other']
  },
  sub_category: String,
  balance_before: Number,
  balance_after: Number,
  currency: { 
    type: String, 
    enum: ['points', 'INR', 'USDT'],
    default: 'points' 
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'completed' 
  },
  transaction_date: { 
    type: Date, 
    default: Date.now,
    index: true 
  },
  conversion_rate: Number,
  converted_from: String,
  converted_to: String,
  reference_id: String,
  reference_type: String,
  metadata: mongoose.Schema.Types.Mixed
}, { 
  timestamps: true,
  index: { user_id: 1, transaction_date: -1 }
});

// Mining Pool Schema
const miningPoolSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  pool_id: { 
    type: String, 
    required: true 
  },
  pool_name: String,
  pool_icon: String,
  pool_type: { 
    type: String, 
    enum: ['free', 'premium', 'vip'],
    default: 'free' 
  },
  investment_amount: { 
    type: Number, 
    default: 0 
  },
  investment_currency: { 
    type: String, 
    default: 'points' 
  },
  duration_hours: Number,
  expected_points: Number,
  actual_points: Number,
  start_time: { 
    type: Date, 
    default: Date.now 
  },
  end_time: Date,
  completed_at: Date,
  progress: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 100 
  },
  status: { 
    type: String, 
    enum: ['active', 'completed', 'paused', 'cancelled'],
    default: 'active' 
  },
  base_rate: Number,
  multiplier: Number,
  min_investment: Number,
  transaction_id: String,
  claimed: { 
    type: Boolean, 
    default: false 
  },
  claim_date: Date,
  auto_renew: {
    type: Boolean,
    default: false
  },
  next_pool_id: String
}, { 
  timestamps: true,
  index: { user_id: 1, status: 1, end_time: 1 }
});

// Task Completion Schema
const taskCompletionSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  task_id: { 
    type: String, 
    required: true 
  },
  task_type: {
    type: String,
    enum: ['video', 'app_install', 'survey', 'quiz', 'signup', 'other']
  },
  task_name: String,
  completed_at: { 
    type: Date, 
    default: Date.now,
    index: true 
  },
  points_earned: Number,
  platform: String,
  video_id: String,
  channel_id: String,
  verified: { 
    type: Boolean, 
    default: true 
  },
  verification_method: String,
  ip_address: String,
  user_agent: String,
  task_data: mongoose.Schema.Types.Mixed,
  expiry_date: Date
}, { 
  timestamps: true,
  index: { user_id: 1, task_id: 1 },
  expireAfterSeconds: 2592000 // Auto delete after 30 days
});

// Referral Schema
const referralSchema = new mongoose.Schema({
  referrer_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  referred_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true 
  },
  referral_code: String,
  points_earned: { 
    type: Number, 
    default: 25 
  },
  status: { 
    type: String, 
    enum: ['pending', 'active', 'completed', 'expired'],
    default: 'pending' 
  },
  completed: { 
    type: Boolean, 
    default: false 
  },
  referral_date: { 
    type: Date, 
    default: Date.now 
  },
  completed_at: Date,
  commission_paid: { 
    type: Boolean, 
    default: false 
  },
  commission_amount: Number,
  level: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  }
}, { 
  timestamps: true,
  index: { referrer_id: 1, referral_date: -1 }
});

// Sponsor Commission Schema
const sponsorCommissionSchema = new mongoose.Schema({
  sponsor_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  commission_type: {
    type: String,
    enum: ['direct', 'indirect', 'level', 'bonus']
  },
  amount: { 
    type: Number, 
    required: true 
  },
  percentage: Number,
  activity_type: String,
  activity_description: String,
  original_amount: Number,
  status: { 
    type: String, 
    enum: ['pending', 'paid', 'cancelled'],
    default: 'pending' 
  },
  paid: { 
    type: Boolean, 
    default: false 
  },
  paid_date: Date,
  transaction_id: String,
  wallet_transaction_id: String,
  level: Number
}, { 
  timestamps: true,
  index: { sponsor_id: 1, status: 1 }
});

// Daily Activity Schema
const dailyActivitySchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  activity_id: { 
    type: String, 
    required: true 
  },
  activity_type: {
    type: String,
    enum: ['login', 'task', 'video', 'mining', 'referral', 'other']
  },
  completed_at: { 
    type: Date, 
    default: Date.now 
  },
  points_earned: Number,
  date: { 
    type: String, 
    required: true,
    index: true 
  },
  streak_day: Number,
  platform: String,
  verified: { 
    type: Boolean, 
    default: true 
  },
  metadata: mongoose.Schema.Types.Mixed
}, { 
  timestamps: true,
  index: { user_id: 1, date: 1 },
  expireAfterSeconds: 7776000 // Auto delete after 90 days
});

// Admin Log Schema
const adminLogSchema = new mongoose.Schema({
  admin_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  action: { 
    type: String, 
    required: true 
  },
  target_type: String,
  target_id: String,
  target_description: String,
  changes_before: mongoose.Schema.Types.Mixed,
  changes_after: mongoose.Schema.Types.Mixed,
  ip_address: String,
  user_agent: String,
  status: { 
    type: String, 
    default: 'completed' 
  }
}, { 
  timestamps: true,
  index: { admin_id: 1, createdAt: -1 }
});

// App Settings Schema
const appSettingsSchema = new mongoose.Schema({
  key: { 
    type: String, 
    required: true, 
    unique: true 
  },
  value: mongoose.Schema.Types.Mixed,
  description: String,
  category: String,
  updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { 
  timestamps: true 
});

// Create Models
const User = mongoose.model('User', userSchema);
const WalletTransaction = mongoose.model('WalletTransaction', walletTransactionSchema);
const MiningPool = mongoose.model('MiningPool', miningPoolSchema);
const TaskCompletion = mongoose.model('TaskCompletion', taskCompletionSchema);
const Referral = mongoose.model('Referral', referralSchema);
const SponsorCommission = mongoose.model('SponsorCommission', sponsorCommissionSchema);
const DailyActivity = mongoose.model('DailyActivity', dailyActivitySchema);
const AdminLog = mongoose.model('AdminLog', adminLogSchema);
const AppSettings = mongoose.model('AppSettings', appSettingsSchema);

// ==========================================
// ✅ HELPER FUNCTIONS
// ==========================================

function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'TAPEARN';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generateTransactionId() {
  return `TX${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

function generateUserId() {
  return `USER${Date.now().toString().slice(-8)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
}

async function logAdminAction(adminId, action, targetType, targetId, changesBefore, changesAfter) {
  try {
    const adminLog = new AdminLog({
      admin_id: adminId,
      action: action,
      target_type: targetType,
      target_id: targetId,
      changes_before: changesBefore,
      changes_after: changesAfter,
      ip_address: req?.ip || '127.0.0.1',
      user_agent: req?.headers['user-agent'] || 'Server'
    });
    await adminLog.save();
  } catch (error) {
    console.error('Error logging admin action:', error);
  }
}

async function updateUserPoints(userId, points, type, description, category = 'other') {
  try {
    const user = await User.findById(userId);
    if (!user) return false;

    const balanceBefore = user.points;
    user.points += points;
    if (points > 0) {
      user.total_earned += points;
      user.today_earnings += points;
    }
    const balanceAfter = user.points;

    await user.save();

    const walletTransaction = new WalletTransaction({
      user_id: userId,
      transaction_id: generateTransactionId(),
      transaction_type: points > 0 ? 'earning' : 'spending',
      amount: Math.abs(points),
      description: description,
      category: category,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      currency: 'points',
      status: 'completed'
    });

    await walletTransaction.save();
    return true;
  } catch (error) {
    console.error('Error updating user points:', error);
    return false;
  }
}

// ==========================================
// ✅ KEEP-ALIVE MECHANISM
// ==========================================

function setupKeepAlive() {
  const http = require('http');
  const KEEP_ALIVE_INTERVAL = 8 * 60 * 1000; // 8 minutes (less than Render's 10 minute timeout)
  
  console.log(`🔧 Setting up keep-alive (interval: ${KEEP_ALIVE_INTERVAL/60000} minutes)`);
  
  const pingServer = () => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: '/ping',
      method: 'GET',
      timeout: 10000,
      headers: {
        'User-Agent': 'Keep-Alive-Agent'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`✅ Keep-alive successful at ${new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
      });
    });

    req.on('error', (err) => {
      console.log(`⚠️ Keep-alive error: ${err.message}`);
    });

    req.on('timeout', () => {
      req.destroy();
      console.log('⚠️ Keep-alive timeout');
    });

    req.end();
  };

  // Start first ping after 1 minute
  setTimeout(() => {
    pingServer();
    setInterval(pingServer, KEEP_ALIVE_INTERVAL);
    console.log(`✅ Keep-alive service started (interval: ${KEEP_ALIVE_INTERVAL/60000} minutes)`);
  }, 1 * 60 * 1000);
}

// ==========================================
// ✅ MIDDLEWARE FUNCTIONS
// ==========================================

// Database connection middleware
const dbConnectionMiddleware = (req, res, next) => {
  if (!isConnected) {
    return res.status(503).json({ 
      success: false, 
      message: 'Database is not connected. Please try again later.' 
    });
  }
  next();
};

// Authentication middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    // Simple token validation (you can implement JWT or other auth)
    const user = await User.findById(token);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Authentication error' });
  }
};

// Admin middleware
const adminMiddleware = async (req, res, next) => {
  try {
    if (!req.user || !req.user.is_admin) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Authorization error' });
  }
};

// ==========================================
// ✅ USER MANAGEMENT ENDPOINTS
// ==========================================

app.get('/api/get-user', dbConnectionMiddleware, async (req, res) => {
  try {
    const { email, username, id } = req.query;
    
    if (!email && !username && !id) {
      return res.json({ success: false, message: 'Please provide email, username or id' });
    }
    
    let query = {};
    if (email) query.email = email.toLowerCase();
    if (username) query.username = username;
    if (id) query._id = id;
    
    const user = await User.findOne(query).select('-password -__v -createdAt -updatedAt');
    
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }
    
    // Get sponsor info
    let sponsorName = null;
    if (user.referred_by) {
      const sponsor = await User.findOne({ referral_code: user.referred_by }).select('full_name username');
      if (sponsor) sponsorName = sponsor.full_name || sponsor.username;
    }
    
    // Get user stats
    const today = new Date().toISOString().split('T')[0];
    const todayActivities = await DailyActivity.countDocuments({ user_id: user._id, date: today });
    const totalReferrals = await Referral.countDocuments({ referrer_id: user._id });
    const activePools = await MiningPool.countDocuments({ user_id: user._id, status: 'active' });
    
    res.json({
      success: true,
      user: {
        ...user.toObject(),
        sponsorName: sponsorName,
        stats: {
          today_activities: todayActivities,
          total_referrals: totalReferrals,
          active_pools: activePools
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/get-all-users', dbConnectionMiddleware, adminMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    const users = await User.find()
      .select('-password -__v')
      .sort({ registration_date: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const totalUsers = await User.countDocuments();
    
    // Add additional stats for each user
    for (let user of users) {
      user.referralCount = await Referral.countDocuments({ referrer_id: user._id });
      user.totalTransactions = await WalletTransaction.countDocuments({ user_id: user._id });
    }
    
    res.json({
      success: true,
      count: users.length,
      total: totalUsers,
      page: page,
      pages: Math.ceil(totalUsers / limit),
      users: users
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.delete('/api/delete-user/:id', dbConnectionMiddleware, adminMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }
    
    // Soft delete (change status)
    user.status = 'deleted';
    user.email = `deleted_${Date.now()}_${user.email}`;
    user.username = `deleted_${Date.now()}_${user.username}`;
    await user.save();
    
    // Log admin action
    await logAdminAction(
      req.user._id, 
      'delete_user', 
      'User', 
      userId, 
      { status: user.status }, 
      { status: 'deleted' }
    );
    
    res.json({ 
      success: true, 
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/sync-user', dbConnectionMiddleware, async (req, res) => {
  try {
    const currentUser = req.body;
    
    if (!currentUser || (!currentUser.email && !currentUser.username)) {
      return res.json({ success: false, message: 'No user data provided' });
    }

    console.log('🔄 Syncing user data:', currentUser.email || currentUser.username);

    // Find existing user
    let user = await User.findOne({ 
      $or: [
        { email: currentUser.email?.toLowerCase() },
        { username: currentUser.username }
      ]
    });

    if (user) {
      // Update existing user
      const updates = {};
      if (currentUser.username && currentUser.username !== user.username) updates.username = currentUser.username;
      if (currentUser.telegram_id) updates.telegram_id = currentUser.telegram_id;
      if (currentUser.phone || currentUser.mobile) updates.phone = currentUser.phone || currentUser.mobile;
      if (currentUser.full_name) updates.full_name = currentUser.full_name;
      if (currentUser.points !== undefined) updates.points = Math.max(user.points, currentUser.points);
      if (currentUser.total_earned !== undefined) updates.total_earned = Math.max(user.total_earned, currentUser.total_earned || currentUser.totalEarned);
      if (currentUser.tasks_completed !== undefined) updates.tasks_completed = Math.max(user.tasks_completed, currentUser.tasks_completed || currentUser.tasksCompleted);
      if (currentUser.level !== undefined) updates.level = Math.max(user.level, currentUser.level);
      
      updates.last_login = new Date();
      updates.last_seen = new Date();
      
      if (Object.keys(updates).length > 0) {
        user = await User.findByIdAndUpdate(
          user._id,
          { $set: updates },
          { new: true }
        );
      }
      
      console.log(`✅ User synced: ${user.username || user.email}`);
      
      res.json({ 
        success: true, 
        message: 'User synced successfully',
        userId: user._id,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          points: user.points,
          referral_code: user.referral_code,
          level: user.level
        }
      });
    } else {
      // Create new user
      const username = currentUser.username || `user_${Date.now().toString().slice(-8)}`;
      const password = currentUser.password || `pwd_${Math.random().toString(36).slice(-8)}`;
      const email = currentUser.email?.toLowerCase() || `${username}@example.com`;
      const referralCode = currentUser.referral_code || currentUser.referralCode || generateReferralCode();
      
      user = new User({
        email: email,
        username: username,
        password: password,
        telegram_id: currentUser.telegram_id || null,
        phone: currentUser.phone || currentUser.mobile || null,
        full_name: currentUser.full_name || username,
        referral_code: referralCode,
        referred_by: currentUser.referred_by || currentUser.sponsorId || null,
        points: currentUser.points || 100,
        total_earned: currentUser.total_earned || currentUser.totalEarned || 100,
        tasks_completed: currentUser.tasks_completed || currentUser.tasksCompleted || 0,
        level: currentUser.level || 1,
        status: 'active',
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        device_type: currentUser.device_type || 'mobile'
      });
      
      await user.save();
      
      console.log(`✅ New user created via sync: ${email} with ID: ${user._id}`);
      
      // Handle referral if applicable
      if (user.referred_by) {
        const referrer = await User.findOne({ referral_code: user.referred_by });
        if (referrer) {
          // Create referral record
          const referral = new Referral({
            referrer_id: referrer._id,
            referred_id: user._id,
            referral_code: user.referred_by,
            points_earned: 25,
            status: 'active',
            completed: true
          });
          await referral.save();
          
          // Award referral points to referrer
          await updateUserPoints(
            referrer._id, 
            25, 
            'referral', 
            `Referral bonus for ${user.username}`
          );
        }
      }
      
      res.json({ 
        success: true, 
        message: 'User created successfully',
        userId: user._id,
        username: username,
        referralCode: referralCode,
        points: user.points
      });
    }
  } catch (error) {
    console.error('❌ Error in sync-user:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      code: error.code
    });
  }
});

app.post('/api/save-user', dbConnectionMiddleware, async (req, res) => {
  try {
    const userData = req.body;
    
    if (!userData.email && !userData.username) {
      return res.json({ success: false, message: 'Email or username required' });
    }

    console.log('📥 Saving user data:', userData.email || userData.username);

    let user = await User.findOne({ 
      $or: [
        { email: userData.email?.toLowerCase() },
        { username: userData.username }
      ]
    });

    if (user) {
      // Update existing user
      const updates = {};
      if (userData.username) updates.username = userData.username;
      if (userData.telegram_id) updates.telegram_id = userData.telegram_id;
      if (userData.phone || userData.mobile) updates.phone = userData.phone || userData.mobile;
      if (userData.full_name) updates.full_name = userData.full_name;
      if (userData.points !== undefined) updates.points = Math.max(user.points, userData.points);
      if (userData.total_earned !== undefined) updates.total_earned = Math.max(user.total_earned, userData.total_earned || userData.totalEarned);
      if (userData.tasks_completed !== undefined) updates.tasks_completed = Math.max(user.tasks_completed, userData.tasks_completed || userData.tasksCompleted);
      if (userData.level !== undefined) updates.level = Math.max(user.level, userData.level);
      
      updates.last_login = new Date();
      updates.last_seen = new Date();
      
      if (Object.keys(updates).length > 0) {
        user = await User.findByIdAndUpdate(
          user._id,
          { $set: updates },
          { new: true }
        );
      }
      
      console.log(`✅ User updated: ${user.email}`);
      
      res.json({ 
        success: true, 
        message: 'User updated successfully',
        userId: user._id,
        points: user.points
      });
    } else {
      // Create new user
      const username = userData.username || `user_${Date.now().toString().slice(-8)}`;
      const password = userData.password || `pwd_${Math.random().toString(36).slice(-8)}`;
      const email = userData.email?.toLowerCase() || `${username}@tapearn.com`;
      const referralCode = userData.referral_code || generateReferralCode();
      
      user = new User({
        email: email,
        username: username,
        password: password,
        telegram_id: userData.telegram_id || null,
        phone: userData.phone || userData.mobile || null,
        full_name: userData.full_name || username,
        referral_code: referralCode,
        referred_by: userData.referred_by || userData.sponsorId || null,
        points: userData.points || 100,
        total_earned: userData.total_earned || userData.totalEarned || 100,
        tasks_completed: userData.tasks_completed || userData.tasksCompleted || 0,
        level: userData.level || 1,
        status: 'active',
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        device_type: userData.device_type || 'mobile'
      });
      
      await user.save();
      
      console.log(`✅ New user created: ${email} with ID: ${user._id}`);
      
      // Handle referral if applicable
      if (user.referred_by) {
        const referrer = await User.findOne({ referral_code: user.referred_by });
        if (referrer) {
          // Create referral record
          const referral = new Referral({
            referrer_id: referrer._id,
            referred_id: user._id,
            referral_code: user.referred_by,
            points_earned: 50,
            status: 'active',
            completed: true
          });
          await referral.save();
          
          // Award referral points to referrer
          await updateUserPoints(
            referrer._id, 
            50, 
            'referral', 
            `Referral commission for ${user.username}`
          );
        }
      }
      
      res.json({ 
        success: true, 
        message: 'User created successfully',
        userId: user._id,
        username: username,
        referralCode: referralCode,
        points: user.points
      });
    }
  } catch (error) {
    console.error('❌ Error saving user:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      code: error.code
    });
  }
});

app.post('/api/register', dbConnectionMiddleware, async (req, res) => {
  try {
    const { email, username, password, referral_code, phone, full_name } = req.body;
    
    if (!email || !username || !password) {
      return res.json({ success: false, message: 'Email, username and password are required' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username }
      ]
    });
    
    if (existingUser) {
      return res.json({ 
        success: false, 
        message: existingUser.email === email.toLowerCase() ? 'Email already registered' : 'Username already taken'
      });
    }
    
    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      username: username,
      password: password,
      phone: phone || null,
      full_name: full_name || username,
      referral_code: generateReferralCode(),
      referred_by: referral_code || null,
      points: 100, // Starting bonus
      total_earned: 100,
      status: 'active',
      ip_address: req.ip,
      user_agent: req.headers['user-agent']
    });
    
    await user.save();
    
    // Handle referral if applicable
    if (referral_code) {
      const referrer = await User.findOne({ referral_code: referral_code });
      if (referrer) {
        const referral = new Referral({
          referrer_id: referrer._id,
          referred_id: user._id,
          referral_code: referral_code,
          points_earned: 50,
          status: 'active',
          completed: true
        });
        await referral.save();
        
        // Award referral points
        await updateUserPoints(
          referrer._id, 
          50, 
          'referral', 
          `Referral bonus for ${user.username}`
        );
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Registration successful',
      userId: user._id,
      username: user.username,
      referralCode: user.referral_code,
      points: user.points
    });
  } catch (error) {
    console.error('❌ Error during registration:', error);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

app.post('/api/login', dbConnectionMiddleware, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.json({ success: false, message: 'Email and password required' });
    }
    
    const user = await User.findOne({ 
      $or: [
        { email: email.toLowerCase() },
        { username: email }
      ],
      password: password,
      status: 'active'
    }).select('-__v -createdAt -updatedAt');
    
    if (!user) {
      return res.json({ 
        success: false, 
        message: 'Invalid credentials or account suspended'
      });
    }
    
    // Update last login
    user.last_login = new Date();
    user.last_seen = new Date();
    user.session_count += 1;
    await user.save();
    
    // Create login activity
    const today = new Date().toISOString().split('T')[0];
    const dailyActivity = new DailyActivity({
      user_id: user._id,
      activity_id: `login_${Date.now()}`,
      activity_type: 'login',
      points_earned: 5,
      date: today,
      streak_day: user.daily_streak + 1
    });
    await dailyActivity.save();
    
    // Update daily streak
    user.daily_streak += 1;
    user.last_daily_activity = new Date();
    await user.save();
    
    // Award login points
    await updateUserPoints(user._id, 5, 'login', 'Daily login bonus');
    
    res.json({ 
      success: true, 
      message: 'Login successful',
      token: user._id.toString(), // Simple token (use JWT in production)
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        points: user.points,
        level: user.level,
        referral_code: user.referral_code,
        is_admin: user.is_admin,
        daily_streak: user.daily_streak,
        total_earned: user.total_earned,
        inr_wallet: user.inr_wallet,
        usdt_wallet: user.usdt_wallet
      }
    });
  } catch (error) {
    console.error('❌ Error during login:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// ==========================================
// ✅ WALLET AND TRANSACTIONS
// ==========================================

app.post('/api/save-transaction', dbConnectionMiddleware, async (req, res) => {
  try {
    const { userId, transactionType, amount, description, category, subCategory, currency } = req.body;
    
    if (!userId || !transactionType || !amount) {
      return res.json({ success: false, message: 'Missing required fields' });
    }
    
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
      user.today_earnings += amount;
    } else if (transactionType === 'spending') {
      if (user.points < amount) {
        return res.json({ success: false, message: 'Insufficient points' });
      }
      balanceAfter -= amount;
      user.points = balanceAfter;
    }
    
    await user.save();
    
    const walletTransaction = new WalletTransaction({
      user_id: userId,
      transaction_id: generateTransactionId(),
      transaction_type: transactionType,
      amount: amount,
      description: description || 'Transaction',
      category: category || 'general',
      sub_category: subCategory || '',
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      currency: currency || 'points',
      status: 'completed'
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

app.get('/api/get-wallet-history/:userId', dbConnectionMiddleware, async (req, res) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const history = await WalletTransaction.find({ user_id: userId })
      .sort({ transaction_date: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const total = await WalletTransaction.countDocuments({ user_id: userId });
    
    // Get wallet summary
    const user = await User.findById(userId).select('points inr_wallet usdt_wallet total_earned');
    
    res.json({ 
      success: true, 
      history: history,
      summary: {
        total_transactions: total,
        current_balance: user?.points || 0,
        inr_balance: user?.inr_wallet || 0,
        usdt_balance: user?.usdt_wallet || 0,
        total_earned: user?.total_earned || 0
      },
      pagination: {
        page: page,
        limit: limit,
        total: total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching wallet history:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

app.post('/api/convert-points-to-inr', dbConnectionMiddleware, async (req, res) => {
  try {
    const { userId, points, description } = req.body;
    
    if (!userId || !points) {
      return res.json({ success: false, message: 'Missing required fields' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }
    
    if (points < 10000) {
      return res.json({ success: false, message: 'Minimum 10000 points required' });
    }
    
    if (user.points < points) {
      return res.json({ success: false, message: 'Insufficient points' });
    }
    
    const inrAmount = Math.floor((points / 10000) * 100);
    
    // Deduct points
    user.points -= points;
    user.inr_wallet += inrAmount;
    user.total_converted += points;
    
    await user.save();
    
    // Record points transaction
    const pointsTransaction = new WalletTransaction({
      user_id: userId,
      transaction_id: generateTransactionId(),
      transaction_type: 'spending',
      amount: points,
      description: description || `Converted ${points} points to INR`,
      category: 'conversion',
      sub_category: 'points_to_inr',
      balance_before: user.points + points,
      balance_after: user.points,
      currency: 'points',
      conversion_rate: 10000,
      converted_from: 'points',
      converted_to: 'INR',
      status: 'completed'
    });
    
    // Record INR transaction
    const inrTransaction = new WalletTransaction({
      user_id: userId,
      transaction_id: generateTransactionId(),
      transaction_type: 'earning',
      amount: inrAmount,
      description: `Received ${inrAmount} INR from points conversion`,
      category: 'conversion',
      sub_category: 'inr_credit',
      balance_before: user.inr_wallet - inrAmount,
      balance_after: user.inr_wallet,
      currency: 'INR',
      conversion_rate: 10000,
      converted_from: 'points',
      converted_to: 'INR',
      status: 'completed'
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

app.post('/api/convert-inr-to-usdt', dbConnectionMiddleware, async (req, res) => {
  try {
    const { userId, inrAmount, description } = req.body;
    
    if (!userId || !inrAmount) {
      return res.json({ success: false, message: 'Missing required fields' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }
    
    if (inrAmount < 85) {
      return res.json({ success: false, message: 'Minimum 85 INR required' });
    }
    
    if (user.inr_wallet < inrAmount) {
      return res.json({ success: false, message: 'Insufficient INR balance' });
    }
    
    const usdtAmount = parseFloat((inrAmount / 85).toFixed(2));
    
    user.inr_wallet -= inrAmount;
    user.usdt_wallet += usdtAmount;
    
    await user.save();
    
    // Record INR transaction
    const inrTransaction = new WalletTransaction({
      user_id: userId,
      transaction_id: generateTransactionId(),
      transaction_type: 'spending',
      amount: inrAmount,
      description: description || `Converted ${inrAmount} INR to USDT`,
      category: 'conversion',
      sub_category: 'inr_to_usdt',
      balance_before: user.inr_wallet + inrAmount,
      balance_after: user.inr_wallet,
      currency: 'INR',
      conversion_rate: 85,
      converted_from: 'INR',
      converted_to: 'USDT',
      status: 'completed'
    });
    
    // Record USDT transaction
    const usdtTransaction = new WalletTransaction({
      user_id: userId,
      transaction_id: generateTransactionId(),
      transaction_type: 'earning',
      amount: usdtAmount,
      description: `Received ${usdtAmount} USDT from INR conversion`,
      category: 'conversion',
      sub_category: 'usdt_credit',
      balance_before: user.usdt_wallet - usdtAmount,
      balance_after: user.usdt_wallet,
      currency: 'USDT',
      conversion_rate: 85,
      converted_from: 'INR',
      converted_to: 'USDT',
      status: 'completed'
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

app.post('/api/save-mining-pool', dbConnectionMiddleware, async (req, res) => {
  try {
    const poolData = req.body;
    
    if (!poolData.user_id || !poolData.pool_id) {
      return res.json({ success: false, message: 'Missing required fields' });
    }
    
    // Check if user has active pool of same type
    const existingPool = await MiningPool.findOne({
      user_id: poolData.user_id,
      pool_type: poolData.pool_type,
      status: 'active'
    });
    
    if (existingPool) {
      return res.json({ 
        success: false, 
        message: 'You already have an active pool of this type' 
      });
    }
    
    const miningPool = new MiningPool({
      user_id: poolData.user_id,
      pool_id: poolData.pool_id,
      pool_name: poolData.pool_name || `Mining Pool ${poolData.pool_id}`,
      pool_icon: poolData.pool_icon || '⛏️',
      pool_type: poolData.pool_type || 'free',
      investment_amount: poolData.investment_amount || 0,
      investment_currency: poolData.investment_currency || 'points',
      duration_hours: poolData.duration_hours || 24,
      expected_points: poolData.expected_points || 100,
      start_time: new Date(),
      end_time: new Date(Date.now() + ((poolData.duration_hours || 24) * 60 * 60 * 1000)),
      status: 'active',
      progress: 0,
      base_rate: poolData.base_rate || 10,
      multiplier: poolData.multiplier || 1
    });
    
    await miningPool.save();
    
    res.json({ 
      success: true, 
      message: 'Mining pool saved',
      poolId: miningPool._id,
      end_time: miningPool.end_time
    });
  } catch (error) {
    console.error('❌ Error saving mining pool:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/update-pool-progress', dbConnectionMiddleware, async (req, res) => {
  try {
    const { poolId, progress, status } = req.body;
    
    if (!poolId) {
      return res.json({ success: false, message: 'Pool ID required' });
    }
    
    const miningPool = await MiningPool.findById(poolId);
    if (!miningPool) {
      return res.json({ success: false, message: 'Mining pool not found' });
    }
    
    // Update progress
    miningPool.progress = Math.min(100, Math.max(0, progress || miningPool.progress));
    
    // Update status if provided
    if (status && ['active', 'completed', 'paused', 'cancelled'].includes(status)) {
      miningPool.status = status;
      
      if (status === 'completed') {
        miningPool.completed_at = new Date();
        miningPool.progress = 100;
      }
    }
    
    // Auto-complete if progress is 100%
    if (miningPool.progress >= 100 && miningPool.status !== 'completed') {
      miningPool.status = 'completed';
      miningPool.completed_at = new Date();
    }
    
    await miningPool.save();
    
    res.json({ 
      success: true, 
      message: 'Pool progress updated',
      progress: miningPool.progress,
      status: miningPool.status
    });
  } catch (error) {
    console.error('❌ Error updating pool progress:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/claim-pool-rewards', dbConnectionMiddleware, async (req, res) => {
  try {
    const { poolId } = req.body;
    
    if (!poolId) {
      return res.json({ success: false, message: 'Pool ID required' });
    }
    
    const miningPool = await MiningPool.findById(poolId);
    if (!miningPool) {
      return res.json({ success: false, message: 'Mining pool not found' });
    }
    
    if (miningPool.status !== 'completed') {
      return res.json({ success: false, message: 'Pool is not completed yet' });
    }
    
    if (miningPool.claimed) {
      return res.json({ success: false, message: 'Pool rewards already claimed' });
    }
    
    const user = await User.findById(miningPool.user_id);
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }
    
    // Calculate actual points (with bonus for early completion)
    const actualPoints = miningPool.expected_points || 100;
    
    // Award points to user
    await updateUserPoints(
      user._id, 
      actualPoints, 
      'mining', 
      `Mining pool rewards: ${miningPool.pool_name}`
    );
    
    // Update pool
    miningPool.claimed = true;
    miningPool.claim_date = new Date();
    miningPool.actual_points = actualPoints;
    await miningPool.save();
    
    res.json({ 
      success: true, 
      message: 'Pool rewards claimed successfully',
      points: actualPoints,
      newBalance: user.points + actualPoints
    });
  } catch (error) {
    console.error('❌ Error claiming pool rewards:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/get-user-pools/:userId', dbConnectionMiddleware, async (req, res) => {
  try {
    const userId = req.params.userId;
    const status = req.query.status; // Optional filter
    
    let query = { user_id: userId };
    if (status) query.status = status;
    
    const pools = await MiningPool.find(query)
      .sort({ createdAt: -1 })
      .lean();
    
    // Calculate active pools stats
    const activePools = pools.filter(p => p.status === 'active');
    const totalExpected = activePools.reduce((sum, pool) => sum + (pool.expected_points || 0), 0);
    const totalInvested = activePools.reduce((sum, pool) => sum + (pool.investment_amount || 0), 0);
    
    res.json({ 
      success: true, 
      pools: pools,
      stats: {
        total: pools.length,
        active: activePools.length,
        completed: pools.filter(p => p.status === 'completed').length,
        total_expected: totalExpected,
        total_invested: totalInvested
      }
    });
  } catch (error) {
    console.error('❌ Error fetching user pools:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// ==========================================
// ✅ TASKS AND VIDEOS
// ==========================================

app.post('/api/save-task', dbConnectionMiddleware, async (req, res) => {
  try {
    const taskData = req.body;
    
    if (!taskData.user_id || !taskData.task_id) {
      return res.json({ success: false, message: 'Missing required fields' });
    }
    
    // Check if task already completed
    const existingTask = await TaskCompletion.findOne({
      user_id: taskData.user_id,
      task_id: taskData.task_id
    });
    
    if (existingTask) {
      return res.json({ 
        success: false, 
        message: 'Task already completed',
        completed_at: existingTask.completed_at
      });
    }
    
    const taskCompletion = new TaskCompletion({
      user_id: taskData.user_id,
      task_id: taskData.task_id,
      task_type: taskData.task_type || 'other',
      task_name: taskData.task_name || `Task ${taskData.task_id}`,
      points_earned: taskData.points_earned || 10,
      platform: taskData.platform || 'app',
      video_id: taskData.video_id,
      channel_id: taskData.channel_id,
      verified: taskData.verified !== false,
      verification_method: taskData.verification_method || 'auto',
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      task_data: taskData.task_data
    });
    
    await taskCompletion.save();
    
    // Award points to user
    await updateUserPoints(
      taskData.user_id, 
      taskData.points_earned || 10, 
      'task', 
      `Task completed: ${taskData.task_name || taskData.task_id}`
    );
    
    // Update user stats
    await User.findByIdAndUpdate(taskData.user_id, {
      $inc: { tasks_completed: 1 }
    });
    
    res.json({ 
      success: true, 
      message: 'Task saved successfully',
      taskId: taskCompletion._id,
      points: taskData.points_earned || 10
    });
  } catch (error) {
    console.error('❌ Error saving task:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/save-video-watch', dbConnectionMiddleware, async (req, res) => {
  try {
    const videoData = req.body;
    
    if (!videoData.user_id || !videoData.video_id) {
      return res.json({ success: false, message: 'Missing required fields' });
    }
    
    // Check if video already watched recently (within 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existingVideo = await TaskCompletion.findOne({
      user_id: videoData.user_id,
      video_id: videoData.video_id,
      completed_at: { $gte: twentyFourHoursAgo }
    });
    
    if (existingVideo) {
      const nextWatchTime = new Date(existingVideo.completed_at.getTime() + 24 * 60 * 60 * 1000);
      return res.json({ 
        success: false, 
        message: 'Video already watched recently',
        next_watch_time: nextWatchTime,
        hours_remaining: Math.ceil((nextWatchTime - new Date()) / (60 * 60 * 1000))
      });
    }
    
    const videoWatch = new TaskCompletion({
      user_id: videoData.user_id,
      task_id: `video_${videoData.video_id}_${Date.now()}`,
      task_type: 'video',
      task_name: videoData.video_title || `Video: ${videoData.video_id.substring(0, 10)}...`,
      points_earned: videoData.points_earned || 5,
      platform: videoData.platform || 'youtube',
      video_id: videoData.video_id,
      channel_id: videoData.channel_id,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Expire in 30 days
    });
    
    await videoWatch.save();
    
    // Award points to user
    await updateUserPoints(
      videoData.user_id, 
      videoData.points_earned || 5, 
      'video', 
      `Watched video: ${videoData.video_title || videoData.video_id}`
    );
    
    // Update user stats
    await User.findByIdAndUpdate(videoData.user_id, {
      $inc: { tasks_completed: 1 }
    });
    
    res.json({ 
      success: true, 
      message: 'Video watch saved',
      videoId: videoWatch._id,
      points: videoData.points_earned || 5
    });
  } catch (error) {
    console.error('❌ Error saving video watch:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/check-video-watched/:userId/:videoId', dbConnectionMiddleware, async (req, res) => {
  try {
    const { userId, videoId } = req.params;
    
    // Check if watched in last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const video = await TaskCompletion.findOne({
      user_id: userId,
      video_id: videoId,
      completed_at: { $gte: twentyFourHoursAgo }
    });
    
    if (video) {
      const nextWatchTime = new Date(video.completed_at.getTime() + 24 * 60 * 60 * 1000);
      return res.json({ 
        watched: true, 
        last_watched: video.completed_at,
        next_watch_time: nextWatchTime,
        hours_remaining: Math.ceil((nextWatchTime - new Date()) / (60 * 60 * 1000))
      });
    }
    
    res.json({ 
      watched: false,
      can_watch: true
    });
  } catch (error) {
    console.error('❌ Error checking video:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

app.get('/api/get-user-tasks/:userId', dbConnectionMiddleware, async (req, res) => {
  try {
    const userId = req.params.userId;
    const limit = parseInt(req.query.limit) || 50;
    
    const tasks = await TaskCompletion.find({ user_id: userId })
      .sort({ completed_at: -1 })
      .limit(limit)
      .lean();
    
    // Calculate total points from tasks
    const totalPoints = tasks.reduce((sum, task) => sum + (task.points_earned || 0), 0);
    
    res.json({ 
      success: true, 
      tasks: tasks,
      stats: {
        total_tasks: tasks.length,
        total_points: totalPoints,
        today_tasks: tasks.filter(t => 
          new Date(t.completed_at).toDateString() === new Date().toDateString()
        ).length
      }
    });
  } catch (error) {
    console.error('❌ Error fetching user tasks:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// ==========================================
// ✅ REFERRALS AND COMMISSIONS
// ==========================================

app.post('/api/save-referral', dbConnectionMiddleware, async (req, res) => {
  try {
    const referralData = req.body;
    
    if (!referralData.referrer_id || !referralData.referred_id) {
      return res.json({ success: false, message: 'Missing required fields' });
    }
    
    // Check if referral already exists
    const existingReferral = await Referral.findOne({
      referred_id: referralData.referred_id
    });
    
    if (existingReferral) {
      return res.json({ 
        success: false, 
        message: 'User already referred by someone'
      });
    }
    
    const referral = new Referral({
      referrer_id: referralData.referrer_id,
      referred_id: referralData.referred_id,
      referral_code: referralData.referral_code,
      points_earned: referralData.points_earned || 25,
      status: 'active',
      completed: true,
      level: referralData.level || 1
    });
    
    await referral.save();
    
    // Award points to referrer
    await updateUserPoints(
      referralData.referrer_id, 
      referralData.points_earned || 25, 
      'referral', 
      `Referral bonus for new user`
    );
    
    res.json({ 
      success: true, 
      message: 'Referral saved',
      referralId: referral._id,
      points: referralData.points_earned || 25
    });
  } catch (error) {
    console.error('❌ Error saving referral:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/save-commission', dbConnectionMiddleware, async (req, res) => {
  try {
    const commissionData = req.body;
    
    if (!commissionData.sponsor_id || !commissionData.user_id || !commissionData.amount) {
      return res.json({ success: false, message: 'Missing required fields' });
    }
    
    const commission = new SponsorCommission({
      sponsor_id: commissionData.sponsor_id,
      user_id: commissionData.user_id,
      commission_type: commissionData.commission_type || 'direct',
      amount: commissionData.amount,
      percentage: commissionData.percentage,
      activity_type: commissionData.activity_type || 'task',
      activity_description: commissionData.activity_description || 'Commission',
      original_amount: commissionData.original_amount || commissionData.amount,
      status: 'paid',
      paid: true,
      paid_date: new Date(),
      level: commissionData.level || 1
    });
    
    await commission.save();
    
    // Award commission to sponsor
    await updateUserPoints(
      commissionData.sponsor_id, 
      commissionData.amount, 
      'referral', 
      `Commission: ${commissionData.activity_description || 'Referral commission'}`
    );
    
    res.json({ 
      success: true, 
      message: 'Commission saved',
      commissionId: commission._id,
      amount: commissionData.amount
    });
  } catch (error) {
    console.error('❌ Error saving commission:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/get-referrals/:userId', dbConnectionMiddleware, async (req, res) => {
  try {
    const userId = req.params.userId;
    const level = req.query.level; // Optional level filter
    
    let query = { referrer_id: userId };
    if (level) query.level = parseInt(level);
    
    const referrals = await Referral.find(query)
      .populate('referred_id', 'username email registration_date points')
      .sort({ referral_date: -1 })
      .lean();
    
    // Calculate referral stats
    const totalReferrals = referrals.length;
    const totalPoints = referrals.reduce((sum, ref) => sum + (ref.points_earned || 0), 0);
    const activeReferrals = referrals.filter(ref => ref.status === 'active').length;
    
    // Group by level
    const levelStats = {};
    referrals.forEach(ref => {
      const level = ref.level || 1;
      levelStats[level] = (levelStats[level] || 0) + 1;
    });
    
    res.json({ 
      success: true, 
      referrals: referrals,
      stats: {
        total: totalReferrals,
        total_points: totalPoints,
        active: activeReferrals,
        by_level: levelStats
      }
    });
  } catch (error) {
    console.error('❌ Error fetching referrals:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

app.get('/api/get-commissions/:userId', dbConnectionMiddleware, async (req, res) => {
  try {
    const userId = req.params.userId;
    const type = req.query.type; // Optional type filter
    const limit = parseInt(req.query.limit) || 20;
    
    let query = { sponsor_id: userId };
    if (type) query.commission_type = type;
    
    const commissions = await SponsorCommission.find(query)
      .populate('user_id', 'username email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    
    // Calculate commission stats
    const totalCommissions = commissions.length;
    const totalAmount = commissions.reduce((sum, comm) => sum + (comm.amount || 0), 0);
    const pendingCommissions = commissions.filter(comm => comm.status === 'pending').length;
    
    // Group by type
    const typeStats = {};
    commissions.forEach(comm => {
      const type = comm.commission_type || 'direct';
      typeStats[type] = (typeStats[type] || 0) + (comm.amount || 0);
    });
    
    res.json({ 
      success: true, 
      commissions: commissions,
      stats: {
        total: totalCommissions,
        total_amount: totalAmount,
        pending: pendingCommissions,
        by_type: typeStats
      }
    });
  } catch (error) {
    console.error('❌ Error fetching commissions:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// ==========================================
// ✅ DAILY ACTIVITIES
// ==========================================

app.post('/api/save-daily-activity', dbConnectionMiddleware, async (req, res) => {
  try {
    const activityData = req.body;
    
    if (!activityData.user_id || !activityData.activity_id) {
      return res.json({ success: false, message: 'Missing required fields' });
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    // Check if activity already completed today
    const existingActivity = await DailyActivity.findOne({
      user_id: activityData.user_id,
      activity_id: activityData.activity_id,
      date: today
    });
    
    if (existingActivity) {
      return res.json({ 
        success: false, 
        message: 'Activity already completed today',
        completed_at: existingActivity.completed_at
      });
    }
    
    const dailyActivity = new DailyActivity({
      user_id: activityData.user_id,
      activity_id: activityData.activity_id,
      activity_type: activityData.activity_type || 'other',
      points_earned: activityData.points_earned || 5,
      date: today,
      streak_day: activityData.streak_day || 1,
      platform: activityData.platform || 'app',
      metadata: activityData.metadata
    });
    
    await dailyActivity.save();
    
    // Award points to user
    await updateUserPoints(
      activityData.user_id, 
      activityData.points_earned || 5, 
      'daily', 
      `Daily activity: ${activityData.activity_id}`
    );
    
    // Update user streak
    const user = await User.findById(activityData.user_id);
    if (user) {
      user.daily_streak = activityData.streak_day || 1;
      user.last_daily_activity = new Date();
      await user.save();
    }
    
    res.json({ 
      success: true, 
      message: 'Daily activity saved',
      activityId: dailyActivity._id,
      points: activityData.points_earned || 5,
      streak_day: activityData.streak_day || 1
    });
  } catch (error) {
    console.error('❌ Error saving daily activity:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/get-today-activities/:userId', dbConnectionMiddleware, async (req, res) => {
  try {
    const userId = req.params.userId;
    const today = new Date().toISOString().split('T')[0];
    
    const activities = await DailyActivity.find({
      user_id: userId,
      date: today
    }).sort({ completed_at: -1 });
    
    // Calculate today's stats
    const todayPoints = activities.reduce((sum, act) => sum + (act.points_earned || 0), 0);
    const activityTypes = {};
    activities.forEach(act => {
      const type = act.activity_type || 'other';
      activityTypes[type] = (activityTypes[type] || 0) + 1;
    });
    
    res.json({ 
      success: true, 
      activities: activities,
      stats: {
        total_activities: activities.length,
        today_points: todayPoints,
        by_type: activityTypes
      }
    });
  } catch (error) {
    console.error('❌ Error fetching today activities:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

app.get('/api/get-daily-streak/:userId', dbConnectionMiddleware, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const user = await User.findById(userId).select('daily_streak last_daily_activity');
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }
    
    // Check if streak is broken (more than 24 hours since last activity)
    const now = new Date();
    const lastActivity = user.last_daily_activity || new Date(0);
    const hoursSinceLastActivity = (now - lastActivity) / (1000 * 60 * 60);
    
    let streakBroken = false;
    let currentStreak = user.daily_streak || 0;
    
    if (hoursSinceLastActivity > 48) { // More than 2 days
      streakBroken = true;
      currentStreak = 0;
      
      // Reset streak in database
      user.daily_streak = 0;
      await user.save();
    }
    
    // Get last 7 days activities
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const lastWeekActivities = await DailyActivity.find({
      user_id: userId,
      completed_at: { $gte: sevenDaysAgo }
    }).sort({ date: -1 });
    
    // Calculate streak bonus
    const streakBonus = Math.min(currentStreak * 2, 50); // Max 50 points bonus
    
    res.json({ 
      success: true,
      streak: {
        current: currentStreak,
        broken: streakBroken,
        last_activity: user.last_daily_activity,
        hours_since_last: hoursSinceLastActivity,
        bonus_points: streakBonus,
        next_reset_in: 24 - (hoursSinceLastActivity % 24)
      },
      last_week: lastWeekActivities.map(act => ({
        date: act.date,
        points: act.points_earned,
        type: act.activity_type
      }))
    });
  } catch (error) {
    console.error('❌ Error fetching daily streak:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// ==========================================
// ✅ ADMIN ENDPOINTS
// ==========================================

app.get('/api/admin/users-full', dbConnectionMiddleware, adminMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status;
    
    let query = {};
    
    // Search functionality
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { full_name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const users = await User.find(query)
      .select('-password -__v -updatedAt')
      .sort({ registration_date: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get additional stats for each user
    for (let user of users) {
      user.referralCount = await Referral.countDocuments({ referrer_id: user._id });
      user.totalEarned = await WalletTransaction.aggregate([
        { $match: { user_id: user._id, transaction_type: 'earning' } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);
      user.totalEarned = user.totalEarned[0]?.total || 0;
    }
    
    const totalUsers = await User.countDocuments(query);
    
    // Get overall stats
    const totalPoints = await User.aggregate([
      { $group: { _id: null, total: { $sum: "$points" } } }
    ]);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRegistrations = await User.countDocuments({
      registration_date: { $gte: today },
      ...query
    });
    
    const activeToday = await User.countDocuments({
      last_login: { $gte: today },
      ...query
    });
    
    res.json({ 
      success: true, 
      users: users,
      totals: {
        total_users: totalUsers,
        total_points: totalPoints[0]?.total || 0,
        today_registrations: todayRegistrations,
        active_today: activeToday
      },
      pagination: {
        page: page,
        limit: limit,
        total: totalUsers,
        pages: Math.ceil(totalUsers / limit)
      },
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching full users data:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

app.get('/api/admin/user-stats', dbConnectionMiddleware, adminMiddleware, async (req, res) => {
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
    
    // Weekly stats
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyRegistrations = await User.countDocuments({
      registration_date: { $gte: weekAgo }
    });
    
    // Monthly stats
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const monthlyRegistrations = await User.countDocuments({
      registration_date: { $gte: monthAgo }
    });
    
    // Active pools
    const activePools = await MiningPool.countDocuments({ status: 'active' });
    
    // Today's transactions
    const todayTransactions = await WalletTransaction.countDocuments({
      transaction_date: { $gte: today }
    });
    
    const stats = {
      userCount: totalUsers,
      totalPoints: totalPoints,
      todayRegistrations: todayRegistrations,
      activeToday: activeToday,
      weeklyRegistrations: weeklyRegistrations,
      monthlyRegistrations: monthlyRegistrations,
      activePools: activePools,
      todayTransactions: todayTransactions,
      databaseSize: (await mongoose.connection.db.stats()).dataSize,
      serverUptime: process.uptime(),
      timestamp: new Date().toISOString(),
      serverTimeIST: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    };
    
    res.json({ success: true, stats });
  } catch (error) {
    console.error('❌ Error getting user stats:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

app.post('/api/admin/sync-all', dbConnectionMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { users } = req.body;
    
    if (!Array.isArray(users)) {
      return res.status(400).json({ success: false, message: 'Users must be an array' });
    }
    
    let syncedCount = 0;
    let createdCount = 0;
    let updatedCount = 0;
    let errors = [];
    
    for (const user of users) {
      try {
        if (!user.email) {
          errors.push('User missing email');
          continue;
        }
        
        const existingUser = await User.findOne({ email: user.email.toLowerCase() });
        
        if (!existingUser) {
          const newUser = new User({
            email: user.email.toLowerCase(),
            username: user.username || `user_${Date.now().toString().slice(-8)}`,
            password: user.password || `pwd_${Math.random().toString(36).slice(-8)}`,
            phone: user.mobile || user.phone,
            full_name: user.full_name || user.username,
            referral_code: user.referralCode || user.referral_code || generateReferralCode(),
            referred_by: user.sponsorId || user.referred_by,
            points: user.points || 0,
            total_earned: user.totalEarned || 0,
            tasks_completed: user.tasksCompleted || 0,
            level: user.level || 1,
            status: user.status || 'active',
            registration_date: user.registeredAt || user.registration_date || new Date(),
            last_login: user.lastLogin || new Date()
          });
          
          await newUser.save();
          createdCount++;
          syncedCount++;
        } else {
          // Update existing user
          const updates = {};
          if (user.username && user.username !== existingUser.username) updates.username = user.username;
          if (user.mobile || user.phone) updates.phone = user.mobile || user.phone;
          if (user.full_name) updates.full_name = user.full_name;
          if (user.points !== undefined) updates.points = Math.max(existingUser.points, user.points);
          if (user.totalEarned !== undefined) updates.total_earned = Math.max(existingUser.total_earned, user.totalEarned);
          if (user.tasksCompleted !== undefined) updates.tasks_completed = Math.max(existingUser.tasks_completed, user.tasksCompleted);
          if (user.level !== undefined) updates.level = Math.max(existingUser.level, user.level);
          
          if (Object.keys(updates).length > 0) {
            await User.findByIdAndUpdate(existingUser._id, { $set: updates });
            updatedCount++;
          }
          syncedCount++;
        }
      } catch (error) {
        errors.push(`Error syncing user ${user.email}: ${error.message}`);
      }
    }
    
    // Log admin action
    await logAdminAction(
      req.user._id,
      'sync_users',
      'Batch',
      'multiple',
      {},
      { synced: syncedCount, created: createdCount, updated: updatedCount }
    );
    
    res.json({ 
      success: true, 
      message: `Synced ${syncedCount} users (${createdCount} created, ${updatedCount} updated)`,
      count: syncedCount,
      created: createdCount,
      updated: updatedCount,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error syncing users:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/admin/database-info', dbConnectionMiddleware, adminMiddleware, async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const transactionCount = await WalletTransaction.countDocuments();
    const miningPoolCount = await MiningPool.countDocuments();
    const taskCount = await TaskCompletion.countDocuments();
    const referralCount = await Referral.countDocuments();
    const commissionCount = await SponsorCommission.countDocuments();
    const activityCount = await DailyActivity.countDocuments();
    
    const dbStats = await mongoose.connection.db.stats();
    
    // Get collection sizes
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionInfo = collections.map(col => ({
      name: col.name,
      size: (col.size / 1024 / 1024).toFixed(2) + ' MB',
      count: col.count
    }));
    
    res.json({
      success: true,
      info: {
        totalRecords: userCount + transactionCount + miningPoolCount + taskCount + referralCount + commissionCount + activityCount,
        size: (dbStats.storageSize / 1024 / 1024).toFixed(2) + ' MB',
        dataSize: (dbStats.dataSize / 1024 / 1024).toFixed(2) + ' MB',
        collections: collections.length,
        counts: {
          users: userCount,
          wallet_transactions: transactionCount,
          mining_pools: miningPoolCount,
          tasks: taskCount,
          referrals: referralCount,
          commissions: commissionCount,
          daily_activities: activityCount
        },
        collectionDetails: collectionInfo,
        lastBackup: new Date().toISOString(),
        created: new Date(),
        modified: new Date(),
        mongodbVersion: dbStats.version
      }
    });
  } catch (error) {
    console.error('Error getting database info:', error);
    res.json({ success: false, info: {}, error: error.message });
  }
});

app.get('/api/admin/fix-database', dbConnectionMiddleware, adminMiddleware, async (req, res) => {
  try {
    let fixedCount = 0;
    let issues = [];
    
    // Fix negative points
    const negativePointsResult = await User.updateMany(
      { points: { $lt: 0 } },
      { $set: { points: 0 } }
    );
    if (negativePointsResult.modifiedCount > 0) {
      issues.push(`Fixed ${negativePointsResult.modifiedCount} users with negative points`);
      fixedCount += negativePointsResult.modifiedCount;
    }
    
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
      
      // Merge data from duplicates to keep
      const duplicatesData = await User.find({ _id: { $in: deleteIds } });
      const keepUser = await User.findById(keepId);
      
      let maxPoints = keepUser.points;
      let maxTotalEarned = keepUser.total_earned;
      let maxTasksCompleted = keepUser.tasks_completed;
      let maxLevel = keepUser.level;
      
      duplicatesData.forEach(dupUser => {
        maxPoints = Math.max(maxPoints, dupUser.points);
        maxTotalEarned = Math.max(maxTotalEarned, dupUser.total_earned);
        maxTasksCompleted = Math.max(maxTasksCompleted, dupUser.tasks_completed);
        maxLevel = Math.max(maxLevel, dupUser.level);
      });
      
      // Update keep user with max values
      await User.findByIdAndUpdate(keepId, {
        $set: {
          points: maxPoints,
          total_earned: maxTotalEarned,
          tasks_completed: maxTasksCompleted,
          level: maxLevel
        }
      });
      
      // Delete duplicates
      await User.deleteMany({ _id: { $in: deleteIds } });
      
      issues.push(`Fixed duplicate email: ${dup._id.email} (merged ${dup.count - 1} duplicates)`);
      fixedCount += deleteIds.length;
    }
    
    // Fix invalid status values
    const invalidStatusResult = await User.updateMany(
      { status: { $nin: ['active', 'suspended', 'banned', 'deleted'] } },
      { $set: { status: 'active' } }
    );
    if (invalidStatusResult.modifiedCount > 0) {
      issues.push(`Fixed ${invalidStatusResult.modifiedCount} users with invalid status`);
      fixedCount += invalidStatusResult.modifiedCount;
    }
    
    res.json({
      success: true,
      message: `Fixed ${fixedCount} issues`,
      fixedCount: fixedCount,
      issues: issues,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fixing database:', error);
    res.json({ success: false, error: error.message });
  }
});

app.post('/api/admin/update-user-status', dbConnectionMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId, status } = req.body;
    
    if (!userId || !status) {
      return res.json({ success: false, message: 'Missing required fields' });
    }
    
    const validStatuses = ['active', 'suspended', 'banned', 'deleted'];
    if (!validStatuses.includes(status)) {
      return res.json({ success: false, message: 'Invalid status' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }
    
    const oldStatus = user.status;
    
    user.status = status;
    user.last_login = new Date();
    await user.save();
    
    // Log admin action
    await logAdminAction(
      req.user._id,
      'update_user_status',
      'User',
      userId,
      { status: oldStatus },
      { status: status }
    );
    
    res.json({ 
      success: true, 
      message: `User ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
      oldStatus: oldStatus,
      newStatus: status
    });
  } catch (error) {
    console.error('❌ Error updating user status:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/admin/update-user-points', dbConnectionMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId, points, operation, reason } = req.body;
    
    if (!userId || points === undefined || !operation) {
      return res.json({ success: false, message: 'Missing required fields' });
    }
    
    const validOperations = ['add', 'subtract', 'set'];
    if (!validOperations.includes(operation)) {
      return res.json({ success: false, message: 'Invalid operation' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }
    
    const oldPoints = user.points;
    let newPoints = user.points;
    let description = '';
    
    if (operation === 'add') {
      newPoints += points;
      description = `Admin added ${points} points`;
    } else if (operation === 'subtract') {
      if (user.points < points) {
        return res.json({ success: false, message: 'Insufficient points' });
      }
      newPoints -= points;
      description = `Admin deducted ${points} points`;
    } else if (operation === 'set') {
      newPoints = points;
      description = `Admin set points to ${points}`;
    }
    
    if (reason) {
      description += `: ${reason}`;
    }
    
    user.points = newPoints;
    await user.save();
    
    // Create wallet transaction
    const walletTransaction = new WalletTransaction({
      user_id: userId,
      transaction_id: generateTransactionId(),
      transaction_type: 'admin_adjustment',
      amount: Math.abs(points),
      description: description,
      category: 'admin',
      balance_before: oldPoints,
      balance_after: newPoints,
      currency: 'points',
      status: 'completed',
      metadata: { operation, reason, admin_id: req.user._id }
    });
    
    await walletTransaction.save();
    
    // Log admin action
    await logAdminAction(
      req.user._id,
      'update_user_points',
      'User',
      userId,
      { points: oldPoints },
      { points: newPoints, operation, reason }
    );
    
    res.json({ 
      success: true, 
      message: 'User points updated successfully',
      oldPoints: oldPoints,
      newPoints: newPoints,
      change: operation === 'set' ? newPoints - oldPoints : (operation === 'add' ? points : -points)
    });
  } catch (error) {
    console.error('❌ Error updating user points:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/admin/search-users', dbConnectionMiddleware, adminMiddleware, async (req, res) => {
  try {
    const searchTerm = req.query.q || '';
    const limit = parseInt(req.query.limit) || 50;
    
    if (!searchTerm) {
      return res.json({ success: true, users: [] });
    }
    
    const users = await User.find({
      $or: [
        { email: { $regex: searchTerm, $options: 'i' } },
        { username: { $regex: searchTerm, $options: 'i' } },
        { phone: { $regex: searchTerm, $options: 'i' } },
        { full_name: { $regex: searchTerm, $options: 'i' } },
        { referral_code: { $regex: searchTerm, $options: 'i' } },
        { _id: searchTerm } // Also search by ID
      ]
    })
    .select('_id email username points registration_date last_login status level referral_code')
    .sort({ registration_date: -1 })
    .limit(limit)
    .lean();
    
    // Add referral count for each user
    for (let user of users) {
      user.referralCount = await Referral.countDocuments({ referrer_id: user._id });
    }
    
    res.json({ success: true, users: users || [] });
  } catch (error) {
    console.error('❌ Error searching users:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/admin/transaction-stats', dbConnectionMiddleware, adminMiddleware, async (req, res) => {
  try {
    const period = req.query.period || 'today'; // today, week, month, year
    let startDate;
    const now = new Date();
    
    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
    
    // Get transaction stats
    const transactions = await WalletTransaction.aggregate([
      {
        $match: {
          transaction_date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            type: "$transaction_type",
            category: "$category"
          },
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      },
      {
        $sort: { totalAmount: -1 }
      }
    ]);
    
    // Get top users by earnings
    const topEarners = await WalletTransaction.aggregate([
      {
        $match: {
          transaction_date: { $gte: startDate },
          transaction_type: 'earning'
        }
      },
      {
        $group: {
          _id: "$user_id",
          totalEarned: { $sum: "$amount" },
          transactionCount: { $sum: 1 }
        }
      },
      {
        $sort: { totalEarned: -1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: "$user"
      },
      {
        $project: {
          userId: "$_id",
          username: "$user.username",
          email: "$user.email",
          totalEarned: 1,
          transactionCount: 1
        }
      }
    ]);
    
    // Get transaction volume by hour
    const hourlyVolume = await WalletTransaction.aggregate([
      {
        $match: {
          transaction_date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            hour: { $hour: "$transaction_date" },
            day: { $dayOfMonth: "$transaction_date" },
            month: { $month: "$transaction_date" },
            year: { $year: "$transaction_date" }
          },
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.hour": 1 }
      }
    ]);
    
    res.json({
      success: true,
      period: period,
      startDate: startDate,
      endDate: now,
      stats: {
        totalTransactions: transactions.reduce((sum, t) => sum + t.count, 0),
        totalAmount: transactions.reduce((sum, t) => sum + t.totalAmount, 0),
        byType: transactions,
        topEarners: topEarners,
        hourlyVolume: hourlyVolume
      }
    });
  } catch (error) {
    console.error('❌ Error getting transaction stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// ✅ UTILITY ENDPOINTS
// ==========================================

app.get('/api/get-user/:email', dbConnectionMiddleware, async (req, res) => {
  try {
    const email = req.params.email;
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }
    
    // Get additional data
    const [walletHistory, miningPools, tasks, commissions, referrals] = await Promise.all([
      WalletTransaction.find({ user_id: user._id })
        .sort({ transaction_date: -1 })
        .limit(10)
        .lean(),
      MiningPool.find({ user_id: user._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      TaskCompletion.find({ user_id: user._id })
        .sort({ completed_at: -1 })
        .limit(10)
        .lean(),
      SponsorCommission.find({ sponsor_id: user._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Referral.find({ referrer_id: user._id })
        .populate('referred_id', 'username email')
        .sort({ referral_date: -1 })
        .limit(5)
        .lean()
    ]);
    
    const userData = {
      ...user.toObject(),
      walletHistory: walletHistory,
      miningPools: miningPools,
      tasks: tasks,
      commissions: commissions,
      referrals: referrals
    };
    
    res.json({ success: true, user: userData });
  } catch (error) {
    console.error('❌ Error fetching user:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/get-user-by-id/:id', dbConnectionMiddleware, async (req, res) => {
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

app.get('/api/check-email/:email', dbConnectionMiddleware, async (req, res) => {
  try {
    const email = req.params.email;
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    res.json({ 
      exists: !!user,
      user: user ? {
        id: user._id,
        username: user.username,
        email: user.email
      } : null
    });
  } catch (error) {
    console.error('❌ Error checking email:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/user-by-referral/:referralCode', dbConnectionMiddleware, async (req, res) => {
  try {
    const referralCode = req.params.referralCode.toUpperCase();
    
    const user = await User.findOne({ referral_code: referralCode });
    
    res.json({ 
      success: !!user, 
      user: user ? {
        id: user._id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        points: user.points
      } : null
    });
  } catch (error) {
    console.error('❌ Error fetching user by referral:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/leaderboard', dbConnectionMiddleware, async (req, res) => {
  try {
    const type = req.query.type || 'points'; // points, referrals, earnings
    const limit = parseInt(req.query.limit) || 100;
    
    let sortCriteria = {};
    switch (type) {
      case 'points':
        sortCriteria = { points: -1 };
        break;
      case 'referrals':
        // Need to aggregate referral counts
        const referralLeaders = await Referral.aggregate([
          {
            $group: {
              _id: "$referrer_id",
              referralCount: { $sum: 1 }
            }
          },
          {
            $sort: { referralCount: -1 }
          },
          {
            $limit: limit
          },
          {
            $lookup: {
              from: 'users',
              localField: '_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $unwind: "$user"
          },
          {
            $project: {
              _id: "$user._id",
              username: "$user.username",
              email: "$user.email",
              points: "$user.points",
              referralCount: 1,
              level: "$user.level"
            }
          }
        ]);
        
        return res.json({
          success: true,
          type: type,
          leaderboard: referralLeaders
        });
        
      case 'earnings':
        sortCriteria = { total_earned: -1 };
        break;
      default:
        sortCriteria = { points: -1 };
    }
    
    const leaderboard = await User.find({ status: 'active' })
      .select('username email points total_earned level referral_code')
      .sort(sortCriteria)
      .limit(limit)
      .lean();
    
    // Add rank
    leaderboard.forEach((user, index) => {
      user.rank = index + 1;
    });
    
    res.json({
      success: true,
      type: type,
      leaderboard: leaderboard
    });
  } catch (error) {
    console.error('❌ Error fetching leaderboard:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// ==========================================
// ✅ APP SETTINGS AND CONFIG
// ==========================================

app.get('/api/app-settings', dbConnectionMiddleware, async (req, res) => {
  try {
    const settings = await AppSettings.find().lean();
    
    // Convert array to object
    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });
    
    // Default settings if not in database
    const defaultSettings = {
      app_name: 'TapEarn',
      app_version: '2.0.0',
      maintenance_mode: false,
      min_withdrawal_points: 10000,
      point_value_inr: 0.01,
      referral_bonus: 25,
      daily_login_bonus: 5,
      max_videos_per_day: 10,
      video_reward_points: 5,
      task_reward_min: 10,
      task_reward_max: 100,
      mining_pool_duration: 24,
      mining_pool_reward: 100,
      support_email: 'support@tapearn.com',
      support_telegram: 'https://t.me/tapearn_support',
      facebook_page: 'https://facebook.com/tapearn',
      twitter_page: 'https://twitter.com/tapearn'
    };
    
    // Merge with database settings
    const mergedSettings = { ...defaultSettings, ...settingsObj };
    
    res.json({
      success: true,
      settings: mergedSettings,
      last_updated: settings.length > 0 ? 
        new Date(Math.max(...settings.map(s => new Date(s.updatedAt).getTime()))) : 
        new Date()
    });
  } catch (error) {
    console.error('❌ Error fetching app settings:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

app.post('/api/app-settings', dbConnectionMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { key, value, description, category } = req.body;
    
    if (!key || value === undefined) {
      return res.json({ success: false, message: 'Key and value required' });
    }
    
    const setting = await AppSettings.findOneAndUpdate(
      { key: key },
      {
        value: value,
        description: description,
        category: category,
        updated_by: req.user._id
      },
      { upsert: true, new: true }
    );
    
    res.json({
      success: true,
      message: 'Setting saved successfully',
      setting: setting
    });
  } catch (error) {
    console.error('❌ Error saving app setting:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// ✅ KEEP-ALIVE AND HEALTH ENDPOINTS
// ==========================================

app.get('/api/health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      serverTimeIST: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      uptime: process.uptime(),
      memory: {
        rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`
      },
      database: {
        status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        name: mongoose.connection.name
      },
      stats: {
        totalUsers: await User.countDocuments(),
        totalTransactions: await WalletTransaction.countDocuments(),
        activePools: await MiningPool.countDocuments({ status: 'active' }),
        todayActivities: await DailyActivity.countDocuments({
          date: new Date().toISOString().split('T')[0]
        })
      },
      keepAlive: 'active',
      renderSleepMode: 'prevented',
      port: PORT,
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development'
    };
    
    console.log(`🏥 Health check at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
    
    res.json(health);
  } catch (error) {
    res.json({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      error: error.message,
      serverTimeIST: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      keepAlive: 'failed',
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
  }
});

app.get('/ping', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  console.log(`🏓 Ping received from ${ip} at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
  
  res.json({ 
    success: true, 
    message: 'Server is running and awake!',
    timestamp: new Date().toISOString(),
    serverTimeIST: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    uptime: process.uptime(),
    keepAliveStatus: 'active',
    serverPort: PORT,
    mongoStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    nodeEnv: process.env.NODE_ENV || 'development',
    serverLocation: 'Render.com (India)'
  });
});

app.get('/keep-alive', (req, res) => {
  console.log(`🔋 Keep-alive triggered at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
  res.json({ 
    status: 'active', 
    message: 'Server kept alive successfully',
    serverTimeIST: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    uptime: process.uptime(),
    nextKeepAlive: new Date(Date.now() + 8 * 60 * 1000).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    note: 'Render free tier sleeps after 15 minutes of inactivity. Keep-alive runs every 8 minutes.'
  });
});

// ==========================================
// ✅ SERVER CONFIGURATION
// ==========================================

app.get('/', (req, res) => {
  res.json({
    message: '🎉 TapEarn Server is Running!',
    version: '2.0.0',
    endpoints: {
      api: '/api',
      health: '/api/health',
      ping: '/ping',
      admin: '/admin',
      docs: 'Available at /api endpoints'
    },
    serverTime: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    status: 'active',
    database: isConnected ? 'connected' : 'connecting',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/admin', (req, res) => {
  const adminHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>TapEarn Admin Panel</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }
        
        .container {
          max-width: 1200px;
          width: 100%;
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          overflow: hidden;
        }
        
        .header {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        
        .header h1 {
          font-size: 2.5rem;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
        }
        
        .status-badge {
          display: inline-block;
          background: #10b981;
          color: white;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
          margin-top: 10px;
        }
        
        .status-badge.error {
          background: #ef4444;
        }
        
        .content {
          padding: 30px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 25px;
        }
        
        .card {
          background: #f8fafc;
          border-radius: 15px;
          padding: 25px;
          border: 1px solid #e2e8f0;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .card h3 {
          color: #1e293b;
          margin-bottom: 15px;
          font-size: 1.3rem;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .card h3 i {
          color: #4f46e5;
        }
        
        .endpoint-list {
          list-style: none;
        }
        
        .endpoint-list li {
          padding: 12px 0;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .endpoint-list li:last-child {
          border-bottom: none;
        }
        
        .method {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          color: white;
        }
        
        .method.get { background: #10b981; }
        .method.post { background: #f59e0b; }
        .method.put { background: #3b82f6; }
        .method.delete { background: #ef4444; }
        
        .endpoint {
          color: #64748b;
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
        }
        
        .stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-top: 15px;
        }
        
        .stat-item {
          text-align: center;
          padding: 15px;
          background: white;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
        }
        
        .stat-value {
          font-size: 1.8rem;
          font-weight: 700;
          color: #4f46e5;
          margin: 5px 0;
        }
        
        .stat-label {
          font-size: 0.9rem;
          color: #64748b;
        }
        
        .footer {
          background: #f1f5f9;
          padding: 20px;
          text-align: center;
          color: #64748b;
          border-top: 1px solid #e2e8f0;
        }
        
        .server-info {
          background: #fef3c7;
          border: 1px solid #fbbf24;
          border-radius: 10px;
          padding: 15px;
          margin-top: 20px;
        }
        
        .server-info h4 {
          color: #d97706;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
          border-bottom: 1px solid #fde68a;
        }
        
        .info-item:last-child {
          border-bottom: none;
        }
        
        .info-label {
          color: #92400e;
          font-weight: 500;
        }
        
        .info-value {
          color: #b45309;
          font-family: 'Courier New', monospace;
        }
        
        @media (max-width: 768px) {
          .header h1 {
            font-size: 2rem;
            flex-direction: column;
            gap: 10px;
          }
          
          .content {
            grid-template-columns: 1fr;
          }
        }
      </style>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>
            <i class="fas fa-crown"></i>
            TapEarn Admin Panel
          </h1>
          <p>Server Management Dashboard</p>
          <div class="status-badge ${isConnected ? '' : 'error'}">
            ${isConnected ? '✅ Connected to MongoDB' : '❌ MongoDB Disconnected'}
          </div>
        </div>
        
        <div class="content">
          <div class="card">
            <h3><i class="fas fa-server"></i> Server Status</h3>
            <div class="server-info">
              <h4><i class="fas fa-info-circle"></i> Server Information</h4>
              <div class="info-item">
                <span class="info-label">Port:</span>
                <span class="info-value">${PORT}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Environment:</span>
                <span class="info-value">${process.env.NODE_ENV || 'development'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Uptime:</span>
                <span class="info-value">${Math.floor(process.uptime() / 60)} minutes</span>
              </div>
              <div class="info-item">
                <span class="info-label">Server Time:</span>
                <span class="info-value">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
              </div>
            </div>
          </div>
          
          <div class="card">
            <h3><i class="fas fa-plug"></i> Quick Actions</h3>
            <ul class="endpoint-list">
              <li>
                <span class="method get">GET</span>
                <span class="endpoint">/api/health</span>
              </li>
              <li>
                <span class="method get">GET</span>
                <span class="endpoint">/ping</span>
              </li>
              <li>
                <span class="method get">GET</span>
                <span class="endpoint">/api/admin/user-stats</span>
              </li>
              <li>
                <span class="method get">GET</span>
                <span class="endpoint">/api/admin/database-info</span>
              </li>
              <li>
                <span class="method get">GET</span>
                <span class="endpoint">/keep-alive</span>
              </li>
            </ul>
          </div>
          
          <div class="card">
            <h3><i class="fas fa-database"></i> Database Stats</h3>
            <div class="stats" id="db-stats">
              <div class="stat-item">
                <div class="stat-value" id="user-count">Loading...</div>
                <div class="stat-label">Total Users</div>
              </div>
              <div class="stat-item">
                <div class="stat-value" id="transaction-count">Loading...</div>
                <div class="stat-label">Transactions</div>
              </div>
              <div class="stat-item">
                <div class="stat-value" id="active-pools">Loading...</div>
                <div class="stat-label">Active Pools</div>
              </div>
              <div class="stat-item">
                <div class="stat-value" id="today-activities">Loading...</div>
                <div class="stat-label">Today Activities</div>
              </div>
            </div>
          </div>
          
          <div class="card">
            <h3><i class="fas fa-code"></i> API Endpoints</h3>
            <ul class="endpoint-list">
              <li>
                <span class="method get">GET</span>
                <span class="endpoint">/api/get-all-users</span>
              </li>
              <li>
                <span class="method post">POST</span>
                <span class="endpoint">/api/save-user</span>
              </li>
              <li>
                <span class="method post">POST</span>
                <span class="endpoint">/api/sync-user</span>
              </li>
              <li>
                <span class="method post">POST</span>
                <span class="endpoint">/api/login</span>
              </li>
              <li>
                <span class="method post">POST</span>
                <span class="endpoint">/api/save-transaction</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div class="footer">
          <p>© 2024 TapEarn. All rights reserved.</p>
          <p>Server running on port ${PORT} | External URL: https://tapearn-native-app.onrender.com</p>
        </div>
      </div>
      
      <script>
        // Fetch database stats
        async function fetchStats() {
          try {
            const response = await fetch('/api/admin/user-stats');
            const data = await response.json();
            
            if (data.success) {
              document.getElementById('user-count').textContent = data.stats.userCount.toLocaleString();
              document.getElementById('transaction-count').textContent = data.stats.todayTransactions.toLocaleString();
              document.getElementById('active-pools').textContent = data.stats.activePools.toLocaleString();
              document.getElementById('today-activities').textContent = data.stats.activeToday.toLocaleString();
            }
          } catch (error) {
            console.error('Error fetching stats:', error);
          }
        }
        
        // Fetch stats on page load and every 30 seconds
        fetchStats();
        setInterval(fetchStats, 30000);
        
        // Auto-refresh page if MongoDB disconnects
        setInterval(() => {
          fetch('/ping')
            .then(res => res.json())
            .then(data => {
              if (!data.mongoStatus || data.mongoStatus !== 'connected') {
                location.reload();
              }
            })
            .catch(() => location.reload());
        }, 60000);
      </script>
    </body>
    </html>
  `;
  
  res.send(adminHtml);
});

// ==========================================
// ✅ ERROR HANDLING MIDDLEWARE
// ==========================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ==========================================
// ✅ START SERVER
// ==========================================

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Local URL: http://localhost:${PORT}`);
  console.log(`🔗 External URL: https://tapearn-native-app.onrender.com`);
  console.log(`🔗 API endpoints available at https://tapearn-native-app.onrender.com/api/`);
  console.log(`🏥 Health check: https://tapearn-native-app.onrender.com/api/health`);
  console.log(`🏓 Ping endpoint: https://tapearn-native-app.onrender.com/ping`);
  console.log(`🔋 Keep-alive endpoint: https://tapearn-native-app.onrender.com/keep-alive`);
  console.log(`👑 Admin Panel: https://tapearn-native-app.onrender.com/admin`);
  console.log(`✅ Server started successfully at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
  
  console.log('\n⚡ Server Features:');
  console.log('✅ MongoDB with connection pooling');
  console.log('✅ Dynamic CORS for localhost and production');
  console.log('✅ Rate limiting and security headers');
  console.log('✅ Auto keep-alive every 8 minutes');
  console.log('✅ Admin panel with real-time stats');
  console.log('✅ Comprehensive API endpoints');
  console.log('✅ Error handling and logging');
  
  console.log('\n⚠️ IMPORTANT FOR RENDER.COM FREE TIER:');
  console.log('1. Keep-alive mechanism will start in 1 minute');
  console.log('2. Server will NOT sleep due to auto-ping every 8 minutes');
  console.log('3. Setup external monitoring (recommended):');
  console.log('   - UptimeRobot.com: Ping /ping every 5 minutes');
  console.log('   - cron-job.org: Schedule every 14 minutes');
  console.log('   - Render Cron: Add cron job in Render dashboard');
  console.log('4. Check logs for any connection issues');
  
  setupKeepAlive();
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error closing database:', err.message);
    process.exit(1);
  }
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});
