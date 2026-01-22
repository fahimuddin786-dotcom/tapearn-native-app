const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const https = require('https');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ FIX: Render.com proxy trust setting
app.set('trust proxy', 1);

// ✅ MongoDB Connection String
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://tapearn_admin:Admin123456@cluster0.ivp6m5c.mongodb.net/tapearn_db?retryWrites=true&w=majority&appName=Cluster0';

// ✅ ENHANCED CORS CONFIGURATION
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://tapearn-native-app.onrender.com',
  'https://*.render.com',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'https://tapearn-admin.onrender.com',
  'https://admin-tapearn.onrender.com',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'https://tapearn-mobile.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      if (process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  credentials: true,
  maxAge: 86400
}));

app.options('*', cors());

// ✅ Security Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// ✅ Body parser
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// ✅ Static files
app.use(express.static(__dirname, {
  setHeaders: (res, filepath) => {
    if (filepath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
    if (filepath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// ✅ Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many requests, please try again later.'
});
app.use('/api/', limiter);

// ==========================================
// ✅ MONGODB CONNECTION
// ==========================================

console.log('🔄 Connecting to MongoDB Atlas...');

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });
    
    console.log('✅ Connected to MongoDB Atlas successfully!');
    console.log('📊 Database:', mongoose.connection.name);
    
    try {
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log(`📋 Existing collections: ${collections.length}`);
    } catch (err) {
      console.log('📋 No existing collections found (will create on first use)');
    }
    
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('⚠️ Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

connectDB();

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected. Reconnecting...');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected!');
});

// ==========================================
// ✅ MONGOOSE SCHEMAS
// ==========================================

// ✅ User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  telegram_id: String,
  phone: String,
  full_name: String,
  points: { type: Number, default: 0 },
  total_earned: { type: Number, default: 0 },
  inr_wallet: { type: Number, default: 0 },
  usdt_wallet: { type: Number, default: 0 },
  total_converted: { type: Number, default: 0 },
  referral_code: { type: String, unique: true },
  referred_by: String,
  sponsor_id: String,
  sponsor_name: String,
  level: { type: Number, default: 1 },
  tasks_completed: { type: Number, default: 0 },
  daily_streak: { type: Number, default: 0 },
  last_login_date: Date,
  last_daily_activity: Date,
  email_verified: { type: Boolean, default: false },
  mobile_verified: { type: Boolean, default: false },
  verification_status: { type: String, default: 'pending' },
  status: { type: String, default: 'active' },
  registration_date: { type: Date, default: Date.now },
  last_login: { type: Date, default: Date.now },
  free_pool_completed: { type: Boolean, default: false },
  free_pool_tasks: [{
    task_id: String,
    completed: Boolean,
    completed_at: Date
  }],
  today_earnings: { type: Number, default: 0 },
  total_mining_time: { type: Number, default: 0 },
  session_count: { type: Number, default: 0 },
  is_admin: { type: Boolean, default: false },
  admin_level: { type: Number, default: 0 },
  source: { type: String, default: 'web' },
  device_type: String,
  ip_address: String,
  user_agent: String
}, {
  timestamps: true
});

// ✅ Wallet Transaction Schema
const walletTransactionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  transaction_type: { type: String, required: true },
  amount: { type: Number, required: true },
  description: String,
  category: String,
  sub_category: String,
  balance_before: Number,
  balance_after: Number,
  currency: { type: String, default: 'points' },
  status: { type: String, default: 'completed' },
  transaction_date: { type: Date, default: Date.now },
  conversion_rate: Number,
  converted_from: String,
  converted_to: String,
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
  pool_type: { type: String, default: 'free' },
  investment_amount: { type: Number, default: 0 },
  investment_currency: { type: String, default: 'points' },
  duration_hours: Number,
  expected_points: Number,
  actual_points: Number,
  start_time: { type: Date, default: Date.now },
  end_time: Date,
  completed_at: Date,
  progress: { type: Number, default: 0 },
  status: { type: String, default: 'active' },
  base_rate: Number,
  multiplier: Number,
  min_investment: Number,
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
  task_type: String,
  task_name: String,
  completed_at: { type: Date, default: Date.now },
  points_earned: Number,
  platform: String,
  video_id: String,
  channel_id: String,
  verified: { type: Boolean, default: true },
  verification_method: String,
  ip_address: String,
  user_agent: String
}, {
  timestamps: true
});

// ✅ Referral Schema
const referralSchema = new mongoose.Schema({
  referrer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referred_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referral_code: String,
  points_earned: { type: Number, default: 25 },
  status: { type: String, default: 'active' },
  completed: { type: Boolean, default: false },
  referral_date: { type: Date, default: Date.now },
  completed_at: Date,
  commission_paid: { type: Boolean, default: false },
  commission_amount: Number
}, {
  timestamps: true
});

// ✅ Sponsor Commission Schema
const sponsorCommissionSchema = new mongoose.Schema({
  sponsor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  commission_type: String,
  amount: { type: Number, required: true },
  percentage: Number,
  activity_type: String,
  activity_description: String,
  original_amount: Number,
  status: { type: String, default: 'pending' },
  paid: { type: Boolean, default: false },
  paid_date: Date,
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
  completed_at: { type: Date, default: Date.now },
  points_earned: Number,
  date: { type: String, required: true },
  streak_day: Number,
  platform: String,
  verified: { type: Boolean, default: true }
}, {
  timestamps: true
});

// ✅ Admin Log Schema
const adminLogSchema = new mongoose.Schema({
  admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  target_type: String,
  target_id: String,
  target_description: String,
  changes_before: mongoose.Schema.Types.Mixed,
  changes_after: mongoose.Schema.Types.Mixed,
  ip_address: String,
  user_agent: String,
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

function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'TAPEARN-';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
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
      ip_address: '127.0.0.1',
      user_agent: 'Server'
    });
    await adminLog.save();
  } catch (error) {
    console.error('Error logging admin action:', error);
  }
}

// ==========================================
// ✅ KEEP-ALIVE ENDPOINTS
// ==========================================

app.get('/ping', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/api/keep-alive', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is awake',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/api/health-fast', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/api/health', async (req, res) => {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      totalUsers: await User.countDocuments(),
      totalTransactions: await WalletTransaction.countDocuments(),
      server: 'tapearn-native-app.onrender.com'
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
// ✅ MISSING ENDPOINTS FIX
// ==========================================

app.get('/api/get-all-transactions', async (req, res) => {
  try {
    const transactions = await WalletTransaction.find()
      .populate('user_id', 'username email')
      .sort({ transaction_date: -1 })
      .limit(100);
    
    res.json({
      success: true,
      transactions: transactions,
      count: transactions.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/get-all-referrals', async (req, res) => {
  try {
    const referrals = await Referral.find()
      .populate('referrer_id', 'username email')
      .populate('referred_id', 'username email')
      .sort({ referral_date: -1 })
      .limit(100);
    
    res.json({
      success: true,
      referrals: referrals,
      count: referrals.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/get-all-commissions', async (req, res) => {
  try {
    const commissions = await SponsorCommission.find()
      .populate('sponsor_id', 'username email')
      .populate('user_id', 'username email')
      .sort({ created_at: -1 })
      .limit(100);
    
    res.json({
      success: true,
      commissions: commissions,
      count: commissions.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching commissions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/server-stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
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
      stats: {
        totalUsers: totalUsers,
        activeUsers: activeUsers,
        totalPoints: totalPoints[0]?.total || 0,
        todayRegistrations: todayRegistrations,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        serverTime: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching server stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// ✅ UNIVERSAL SYNC ENDPOINTS (MOBILE FIX)
// ==========================================

app.post('/api/universal/user-registered', async (req, res) => {
    try {
        const userData = req.body;
        console.log('📱 Mobile user registered:', userData.email);
        
        const newUser = new User({
            email: userData.email,
            username: userData.username || `user_${Date.now().toString().slice(-8)}`,
            password: userData.password || 'mobile_default_123',
            phone: userData.mobile || userData.phone,
            full_name: userData.full_name || userData.username,
            referral_code: userData.referral_code || generateReferralCode(),
            referred_by: userData.sponsorId || null,
            points: userData.points || 100,
            status: 'active',
            registration_date: new Date(),
            source: 'mobile_app'
        });
        
        await newUser.save();
        
        console.log(`✅ Mobile user saved and ready for sync: ${userData.email}`);
        
        res.json({
            success: true,
            message: 'User registered successfully',
            userId: newUser._id
        });
        
    } catch (error) {
        console.error('Error in universal user registration:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/universal/get-all-users', async (req, res) => {
    try {
        const dbUsers = await User.find()
            .select('-password -__v')
            .sort({ registration_date: -1 })
            .limit(500);
        
        const localUsers = JSON.parse(req.query.localUsers || '[]');
        
        const allUsers = [...dbUsers];
        
        localUsers.forEach(localUser => {
            const exists = allUsers.some(dbUser => 
                dbUser.email === localUser.email || 
                dbUser.username === localUser.username
            );
            if (!exists) {
                allUsers.push({
                    ...localUser,
                    source: 'local_storage'
                });
            }
        });
        
        const formattedUsers = allUsers.map(user => ({
            id: user._id || user.id,
            email: user.email,
            username: user.username,
            mobile: user.phone || user.mobile,
            points: user.points || 0,
            usdtWallet: user.usdt_wallet || user.usdtWallet || 0,
            inrWallet: user.inr_wallet || user.inrWallet || 0,
            status: user.status || 'active',
            registration_date: user.registration_date || user.registeredAt,
            source: user.source || 'database',
            sponsorId: user.referred_by || user.sponsorId
        }));
        
        res.json({
            success: true,
            users: formattedUsers,
            count: formattedUsers.length,
            sources: {
                database: dbUsers.length,
                local_storage: localUsers.length,
                merged: formattedUsers.length
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error in universal get-all-users:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/universal/sync-status', async (req, res) => {
    try {
        const lastSync = req.query.lastSync || 0;
        const lastSyncDate = new Date(parseInt(lastSync));
        
        const newUsers = await User.find({
            registration_date: { $gt: lastSyncDate }
        }).select('email username registration_date').limit(50);
        
        const newTransactions = await WalletTransaction.find({
            transaction_date: { $gt: lastSyncDate }
        }).limit(50);
        
        res.json({
            success: true,
            newUsers: newUsers.length,
            newTransactions: newTransactions.length,
            lastSync: Date.now(),
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error in sync-status:', error);
        res.json({ success: false, newUsers: 0, newTransactions: 0 });
    }
});

app.post('/api/mobile/register', async (req, res) => {
    try {
        const mobileUser = req.body;
        console.log('📱 Mobile registration received:', mobileUser.email);

        let user = await User.findOne({ 
            $or: [
                { email: mobileUser.email },
                { phone: mobileUser.phone }
            ]
        });

        if (user) {
            user.points = Math.max(user.points, mobileUser.points || 0);
            user.last_login = new Date();
            await user.save();

            console.log(`✅ Updated existing mobile user: ${user.email}`);
        } else {
            user = new User({
                email: mobileUser.email,
                username: mobileUser.username || `mobile_${Date.now().toString().slice(-8)}`,
                password: mobileUser.password || `mobile_${Math.random().toString(36).slice(-8)}`,
                phone: mobileUser.phone || mobileUser.mobile,
                full_name: mobileUser.full_name || mobileUser.username,
                referral_code: mobileUser.referral_code || generateReferralCode(),
                referred_by: mobileUser.sponsorId || mobileUser.referred_by,
                points: mobileUser.points || 100,
                status: 'active',
                registration_date: new Date(),
                source: 'mobile_app',
                device_type: mobileUser.device_type || 'mobile'
            });

            await user.save();
            console.log(`✅ Created new mobile user: ${user.email} with ID: ${user._id}`);
        }

        res.json({
            success: true,
            message: 'Mobile user registered successfully',
            userId: user._id,
            username: user.username,
            points: user.points
        });
        
    } catch (error) {
        console.error('❌ Mobile registration error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/mobile/get-all-users', async (req, res) => {
    try {
        const mobileUsers = await User.find({
            source: 'mobile_app'
        }).select('-password -__v').sort({ registration_date: -1 });
        
        res.json({
            success: true,
            users: mobileUsers,
            count: mobileUsers.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching mobile users:', error);
        res.json({ success: false, users: [] });
    }
});

app.post('/api/mobile/sync-to-admin', async (req, res) => {
    try {
        const { users, source } = req.body;
        console.log(`📱 Mobile sync from ${source}: ${users.length} users`);
        
        let syncedCount = 0;
        let errors = [];
        
        for (const mobileUser of users) {
            try {
                let user = await User.findOne({ email: mobileUser.email });
                
                if (!user) {
                    user = new User({
                        email: mobileUser.email,
                        username: mobileUser.username || `mobile_${Date.now().toString().slice(-8)}`,
                        password: mobileUser.password || 'mobile_sync_password',
                        phone: mobileUser.phone || mobileUser.mobile,
                        full_name: mobileUser.full_name || mobileUser.username,
                        referral_code: mobileUser.referralCode || generateReferralCode(),
                        referred_by: mobileUser.sponsorId || null,
                        points: mobileUser.points || 0,
                        status: 'active',
                        registration_date: new Date(),
                        source: 'mobile_sync'
                    });
                    
                    await user.save();
                    syncedCount++;
                    
                    console.log(`✅ Synced mobile user: ${mobileUser.email}`);
                } else {
                    if (mobileUser.points > user.points) {
                        user.points = mobileUser.points;
                        await user.save();
                    }
                    syncedCount++;
                }
            } catch (err) {
                errors.push(`User ${mobileUser.email}: ${err.message}`);
            }
        }
        
        res.json({
            success: true,
            message: `Synced ${syncedCount} users from mobile`,
            syncedCount: syncedCount,
            errors: errors
        });
        
    } catch (error) {
        console.error('Mobile sync error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==========================================
// ✅ PROXY & SYNC ENDPOINTS
// ==========================================

app.get('/api/proxy/users', async (req, res) => {
  try {
    const targetServer = req.query.server || 'http://localhost:3000';
    
    const allowedServers = [
      'http://localhost:3000',
      'https://tapearn-native-app.onrender.com'
    ];
    
    if (!allowedServers.includes(targetServer)) {
      return res.status(400).json({ success: false, message: 'Invalid server' });
    }
    
    const protocol = targetServer.startsWith('https') ? https : http;
    
    const url = new URL(`${targetServer}/api/get-all-users`);
    
    const options = {
      hostname: url.hostname,
      port: url.port || (protocol === https ? 443 : 80),
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const request = protocol.request(options, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          res.json({
            success: true,
            data: jsonData,
            source: targetServer
          });
        } catch (error) {
          res.status(500).json({ success: false, error: 'Failed to parse response' });
        }
      });
    });
    
    request.on('error', (error) => {
      console.error('Proxy request error:', error);
      res.status(500).json({ success: false, error: error.message });
    });
    
    request.end();
    
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/universal-sync', async (req, res) => {
  try {
    const { action, data, source } = req.body;
    
    console.log(`🔄 Universal sync: ${action} from ${source}`);
    
    switch(action) {
      case 'user_registered':
        const user = new User({
          email: data.email,
          username: data.username,
          password: data.password || 'default123',
          points: data.points || 100,
          status: 'active',
          registration_date: new Date(),
          source: source || 'universal_sync'
        });
        
        await user.save();
        
        res.json({ 
          success: true, 
          message: 'User registered via universal sync',
          userId: user._id 
        });
        return;
        
      case 'sync_users':
        const users = await User.find().select('-password').limit(100);
        res.json({ success: true, users: users });
        return;
        
      default:
        res.json({ success: false, message: 'Unknown action' });
    }
    
  } catch (error) {
    console.error('Universal sync error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/get-all-servers-users', async (req, res) => {
  try {
    const servers = [
      'http://localhost:3000',
      'https://tapearn-native-app.onrender.com'
    ];
    
    const allUsers = [];
    
    const localUsers = await User.find().select('-password').limit(100);
    allUsers.push(...localUsers.map(user => ({
      ...user.toObject(),
      source: 'local_database'
    })));
    
    res.json({
      success: true,
      users: allUsers,
      count: allUsers.length,
      sources: ['local_database'],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error getting all servers users:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/cross-origin-sync', async (req, res) => {
  try {
    const { users, source } = req.body;
    
    console.log(`🔄 Cross-origin sync from ${source}, users: ${users.length}`);
    
    if (!Array.isArray(users)) {
      return res.status(400).json({ success: false, message: 'Users must be an array' });
    }
    
    let syncedCount = 0;
    let errors = [];
    
    for (const userData of users) {
      try {
        let user = await User.findOne({ email: userData.email });
        
        if (!user) {
          user = new User({
            email: userData.email,
            username: userData.username || `user_${Date.now().toString().slice(-8)}`,
            password: userData.password || `pwd_${Math.random().toString(36).slice(-8)}`,
            phone: userData.phone || userData.mobile || '',
            full_name: userData.full_name || userData.username || '',
            referral_code: userData.referralCode || generateReferralCode(),
            referred_by: userData.sponsorId || userData.referred_by || '',
            points: userData.points || 0,
            total_earned: userData.totalEarned || 0,
            tasks_completed: userData.tasksCompleted || 0,
            level: userData.level || 1,
            status: userData.status || 'active',
            registration_date: userData.registeredAt || new Date(),
            source: source || 'cross_origin_sync'
          });
          
          await user.save();
          syncedCount++;
        } else {
          user.points = Math.max(user.points, userData.points || 0);
          user.total_earned = Math.max(user.total_earned, userData.totalEarned || 0);
          user.tasks_completed = Math.max(user.tasks_completed, userData.tasksCompleted || 0);
          user.level = Math.max(user.level, userData.level || 1);
          
          await user.save();
          syncedCount++;
        }
      } catch (error) {
        errors.push(`Error syncing user ${userData.email}: ${error.message}`);
      }
    }
    
    res.json({ 
      success: true, 
      message: `Synced ${syncedCount} users from ${source}`,
      count: syncedCount,
      errors: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    console.error('Error in cross-origin sync:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// ✅ BULK SYNC ENDPOINTS
// ==========================================

app.post('/api/bulk-sync-users', async (req, res) => {
  try {
    const { users, source } = req.body;
    
    if (!Array.isArray(users)) {
      return res.status(400).json({ success: false, message: 'Users must be an array' });
    }
    
    console.log(`📦 Bulk sync from ${source}: ${users.length} users`);
    
    let synced = 0;
    const results = [];
    
    for (const userData of users) {
      try {
        let user = await User.findOne({ email: userData.email });
        
        if (!user) {
          user = new User({
            email: userData.email,
            username: userData.username || `user_${Date.now().toString().slice(-8)}`,
            password: userData.password || `sync_${Math.random().toString(36).slice(-8)}`,
            points: userData.points || 0,
            status: 'active',
            registration_date: userData.registration_date || new Date(),
            source: source || 'bulk_sync'
          });
          
          await user.save();
          synced++;
          results.push({ email: userData.email, status: 'created' });
        } else {
          const localDate = new Date(userData.registration_date || 0);
          const dbDate = new Date(user.registration_date || 0);
          
          if (localDate > dbDate) {
            user.points = Math.max(user.points, userData.points || 0);
            await user.save();
            synced++;
            results.push({ email: userData.email, status: 'updated' });
          } else {
            results.push({ email: userData.email, status: 'skipped' });
          }
        }
      } catch (error) {
        results.push({ email: userData.email, status: 'error', error: error.message });
      }
    }
    
    res.json({
      success: true,
      message: `Bulk sync completed: ${synced} users processed`,
      total: users.length,
      synced: synced,
      results: results
    });
    
  } catch (error) {
    console.error('Bulk sync error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/cross-server-sync', async (req, res) => {
  try {
    const { serverUrl, action } = req.body;
    
    if (!serverUrl) {
      return res.status(400).json({ success: false, message: 'Server URL required' });
    }
    
    console.log(`🔄 Cross-server sync with: ${serverUrl}`);
    
    const response = await fetch(`${serverUrl}/api/get-all-users`);
    const data = await response.json();
    
    if (data.success) {
      let synced = 0;
      
      for (const user of data.users) {
        try {
          const exists = await User.findOne({ email: user.email });
          
          if (!exists) {
            const newUser = new User({
              email: user.email,
              username: user.username,
              points: user.points || 0,
              status: user.status || 'active',
              registration_date: user.registration_date || new Date(),
              source: `sync_from_${new URL(serverUrl).hostname}`
            });
            
            await newUser.save();
            synced++;
          }
        } catch (error) {
          console.log(`Error syncing user ${user.email}:`, error.message);
        }
      }
      
      res.json({
        success: true,
        message: `Synced ${synced} users from ${serverUrl}`,
        synced: synced
      });
    } else {
      res.status(500).json({ success: false, message: 'Failed to fetch from source server' });
    }
    
  } catch (error) {
    console.error('Cross-server sync error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// ✅ USER MANAGEMENT ENDPOINTS
// ==========================================

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
        is_admin: user.is_admin,
        source: user.source
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

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
        is_admin: user.is_admin,
        source: user.source
      }))
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.delete('/api/delete-user/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }
    
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

app.post('/api/sync-user', async (req, res) => {
  try {
    const currentUser = req.body;
    console.log('🔄 Syncing user data:', currentUser.email || currentUser.username);

    if (!currentUser) {
      return res.json({ success: false, message: 'No user data provided' });
    }

    let user = await User.findOne({ 
      $or: [
        { email: currentUser.email },
        { username: currentUser.username }
      ]
    });

    if (user) {
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
        status: 'active',
        source: 'web_sync'
      });
      
      await user.save();
      
      console.log(`✅ New user created via sync: ${currentUser.email} with ID: ${user._id}`);
      
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

app.post('/api/save-user', async (req, res) => {
  try {
    const userData = req.body;
    console.log('📥 Received user data for save:', userData.email);

    let user = await User.findOne({ email: userData.email });

    if (user) {
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
        points: userData.points || 100,
        total_earned: userData.total_earned || userData.totalEarned || 100,
        tasks_completed: userData.tasks_completed || 0,
        level: userData.level || 1,
        status: 'active',
        source: 'web'
      });
      
      await user.save();
      
      console.log(`✅ New user created: ${userData.email} with ID: ${user._id}`);
      
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
          
          referrer.points += 50;
          referrer.total_earned += 50;
          await referrer.save();
          
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
          is_admin: user.is_admin,
          source: user.source
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

app.post('/api/convert-points-to-inr', async (req, res) => {
  try {
    const { userId, points, description } = req.body;
    
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
    
    user.points -= points;
    user.inr_wallet += inrAmount;
    user.total_converted += points;
    
    await user.save();
    
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

app.post('/api/convert-inr-to-usdt', async (req, res) => {
  try {
    const { userId, inrAmount, description } = req.body;
    
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
    
    const user = await User.findById(miningPool.user_id);
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }
    
    user.points += miningPool.expected_points;
    user.total_earned += miningPool.expected_points;
    
    miningPool.claimed = true;
    miningPool.claim_date = new Date();
    miningPool.actual_points = miningPool.expected_points;
    
    await Promise.all([
      user.save(),
      miningPool.save()
    ]);
    
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

app.post('/api/save-task', async (req, res) => {
  try {
    const taskData = req.body;
    
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

app.post('/api/save-video-watch', async (req, res) => {
  try {
    const videoData = req.body;
    
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

app.post('/api/save-daily-activity', async (req, res) => {
  try {
    const activityData = req.body;
    
    const today = new Date().toISOString().split('T')[0];
    
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

app.get('/api/admin/user-sync-check', async (req, res) => {
  try {
    const since = parseInt(req.query.since) || 0;
    const sinceDate = new Date(since);
    
    const newUsers = await User.find({
      registration_date: { $gt: sinceDate }
    }).countDocuments();
    
    res.json({
      success: true,
      newUsers: newUsers,
      totalUsers: await User.countDocuments(),
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error in user-sync-check:', error);
    res.json({ success: false, newUsers: 0 });
  }
});

app.get('/api/admin/get-all-users-enhanced', async (req, res) => {
  try {
    const users = await User.find()
      .sort({ registration_date: -1 })
      .select('-password -__v');
    
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentUsers = await User.find({
      registration_date: { $gte: fiveMinutesAgo }
    }).select('email username registration_date source');
    
    res.json({
      success: true,
      users: users,
      recentRegistrations: recentUsers,
      total: users.length,
      timestamp: new Date().toISOString(),
      server: req.hostname
    });
  } catch (error) {
    console.error('Error in enhanced users endpoint:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

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
    
    const sourceStats = await User.aggregate([
      { $group: { _id: "$source", count: { $sum: 1 } } }
    ]);
    
    const stats = {
      userCount: totalUsers,
      totalPoints: totalPoints,
      todayRegistrations: todayRegistrations,
      activeToday: activeToday,
      sourceStats: sourceStats,
      timestamp: new Date().toISOString()
    };
    
    res.json({ success: true, stats });
  } catch (error) {
    console.error('❌ Error getting user stats:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

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
            registration_date: user.registeredAt || new Date(),
            source: 'admin_sync'
          });
          
          await newUser.save();
          syncedCount++;
        } else {
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

app.get('/api/admin/database-info', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const transactionCount = await WalletTransaction.countDocuments();
    const miningPoolCount = await MiningPool.countDocuments();
    const taskCount = await TaskCompletion.countDocuments();
    const referralCount = await Referral.countDocuments();
    const commissionCount = await SponsorCommission.countDocuments();
    
    res.json({
      success: true,
      info: {
        totalRecords: userCount + transactionCount + miningPoolCount + taskCount + referralCount + commissionCount,
        counts: {
          users: userCount,
          wallet_transactions: transactionCount,
          mining_pools: miningPoolCount,
          tasks: taskCount,
          referrals: referralCount,
          commissions: commissionCount
        },
        lastBackup: new Date().toISOString(),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting database info:', error);
    res.json({ success: false, info: {} });
  }
});

app.get('/api/admin/fix-database', async (req, res) => {
  try {
    let fixedCount = 0;
    
    const result = await User.updateMany(
      { points: { $lt: 0 } },
      { $set: { points: 0 } }
    );
    
    fixedCount += result.modifiedCount;
    
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
    .select('_id email username points registration_date last_login status source')
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

app.post('/api/notify-admin', (req, res) => {
  const notification = req.body;
  console.log('📢 Admin notification:', notification);
  
  res.json({ success: true, message: 'Notification received' });
});

app.get('/api/admin/recent-activities', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const recentUsers = await User.find({
      registration_date: { $gte: today }
    })
    .select('_id username email registration_date source')
    .sort({ registration_date: -1 })
    .limit(50);
    
    const recentLogins = await User.find({
      last_login: { $gte: today }
    })
    .select('_id username email last_login source')
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

app.get('/api/admin/realtime-sync', async (req, res) => {
  try {
    const lastSync = req.query.lastSync || 0;
    const now = Date.now();
    
    const recentUsers = await User.find({
      registration_date: { 
        $gte: new Date(now - 5 * 60 * 1000)
      }
    })
    .select('_id username email registration_date source')
    .sort({ registration_date: -1 });
    
    const recentLogins = await User.find({
      last_login: { 
        $gte: new Date(now - 5 * 60 * 1000)
      }
    })
    .select('_id username email last_login source')
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

app.get('/api/get-user/:email', async (req, res) => {
  try {
    const email = req.params.email;
    
    const user = await User.findOne({ email: email });
    
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }
    
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

// ==========================================
// ✅ RENDER FIX: Auto wake-up
// ==========================================

let lastRequestTime = Date.now();

app.use((req, res, next) => {
  lastRequestTime = Date.now();
  next();
});

const selfPing = () => {
  const now = Date.now();
  const idleTime = now - lastRequestTime;
  
  if (idleTime > 5 * 60 * 1000) {
    console.log('🔄 Auto-pinging server to prevent sleep...');
    try {
      const options = {
        hostname: 'localhost',
        port: PORT,
        path: '/api/keep-alive',
        method: 'GET',
        timeout: 5000
      };
      
      const req = http.request(options, (res) => {
        console.log('Auto-ping completed');
      });
      
      req.on('error', (e) => {
        console.log('Auto-ping error:', e.message);
      });
      
      req.end();
    } catch (error) {
      console.log('Auto-ping error:', error.message);
    }
  }
};

setInterval(selfPing, 60 * 1000);

// ==========================================
// ✅ SERVER CONFIGURATION
// ==========================================

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/admin-panel.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-panel.html'));
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: err.message 
  });
});

const server = app.listen(PORT, () => {
  console.log(`
  🚀 TapEarn Server v3.0 (with Universal Mobile Sync - Simplified)
  ==========================================
  ✅ Server running on: http://localhost:${PORT}
  ✅ MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}
  
  🔗 Important URLs:
  - Main App: http://localhost:${PORT}/
  - Admin Panel: http://localhost:${PORT}/admin
  - Health Check: http://localhost:${PORT}/api/health
  - Keep-alive: http://localhost:${PORT}/api/keep-alive
  - Ping: http://localhost:${PORT}/ping
  
  🔄 Mobile Sync Endpoints:
  - Mobile Register: http://localhost:${PORT}/api/mobile/register
  - Universal Sync: http://localhost:${PORT}/api/universal/get-all-users
  - Sync Status: http://localhost:${PORT}/api/universal/sync-status
  
  📊 Server started at: ${new Date().toLocaleString()}
  `);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('HTTP Server closed');
    mongoose.connection.close();
    process.exit(0);
  });
});
