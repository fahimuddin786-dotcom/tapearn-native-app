const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const WebSocket = require('ws');
require('dotenv').config();

const app = express();
const server = http.createServer(app); // ✅ HTTP server for WebSocket

const PORT = process.env.PORT || 3000;

// Server type detection
const isReplit = process.env.REPLIT_DB_URL || process.env.REPL_ID;
const isRender = process.env.RENDER;
const isLocal = !isReplit && !isRender;

console.log(`🖥️ Server Type: ${isReplit ? 'Replit' : isRender ? 'Render' : 'Local'}`);

// ==========================================
// ✅ SERVER-TO-SERVER WEBSOCKET CONNECTIONS
// ==========================================

const serverConnections = {
  replit: null,
  render: null,
  localhost: null
};

// Connect to other servers via WebSocket
function connectToOtherServers() {
  const servers = [
    { name: 'replit', url: 'wss://tapearn-native-app--fahimuddin786.replit.app/ws' },
    { name: 'render', url: 'wss://tapearn-native-app.onrender.com/ws' },
    { name: 'localhost', url: 'ws://localhost:3000/ws' }
  ];

  console.log('🔄 Attempting to connect to other servers...');

  servers.forEach(server => {
    // Skip connecting to self
    if ((isReplit && server.name === 'replit') || 
        (isRender && server.name === 'render') || 
        (isLocal && server.name === 'localhost')) {
      console.log(`⏭️ Skipping self-connection to ${server.name}`);
      return;
    }

    // If already connected, skip
    if (serverConnections[server.name] && serverConnections[server.name].readyState === WebSocket.OPEN) {
      console.log(`✅ Already connected to ${server.name}`);
      return;
    }

    try {
      console.log(`🔗 Connecting to ${server.name} at ${server.url}...`);
      const ws = new WebSocket(server.url);
      
      ws.onopen = () => {
        console.log(`🟢 Connected to ${server.name} server`);
        serverConnections[server.name] = ws;
        
        // Send server info
        ws.send(JSON.stringify({
          type: 'server_handshake',
          server: isReplit ? 'replit' : isRender ? 'render' : 'localhost',
          serverId: `${isReplit ? 'replit' : isRender ? 'render' : 'localhost'}_${Date.now()}`,
          timestamp: Date.now(),
          message: 'Server connected for data synchronization'
        }));
        
        // Request initial sync
        ws.send(JSON.stringify({
          type: 'sync_request',
          server: isReplit ? 'replit' : isRender ? 'render' : 'localhost',
          timestamp: Date.now()
        }));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log(`📨 Received from ${server.name}: ${message.type}`);
          handleServerMessage(message, server.name);
        } catch (error) {
          console.error(`❌ Error parsing message from ${server.name}:`, error);
        }
      };

      ws.onclose = () => {
        console.log(`🔴 Disconnected from ${server.name}`);
        serverConnections[server.name] = null;
        // Reconnect after 10 seconds
        setTimeout(() => {
          console.log(`🔄 Reconnecting to ${server.name}...`);
          connectToOtherServers();
        }, 10000);
      };

      ws.onerror = (error) => {
        console.error(`❌ WebSocket error with ${server.name}:`, error.message);
      };

    } catch (error) {
      console.log(`⚠️ Failed to connect to ${server.name}:`, error.message);
    }
  });
}

// Handle messages from other servers
async function handleServerMessage(message, sourceServer) {
  console.log(`📨 Processing message from ${sourceServer}:`, message.type);
  
  switch(message.type) {
    case 'server_handshake':
      console.log(`🤝 Handshake received from ${sourceServer} server`);
      break;
      
    case 'user_registered':
      await syncUserFromServer(message.data.user, sourceServer);
      break;
      
    case 'transaction_added':
      await syncTransactionFromServer(message.data, sourceServer);
      break;
      
    case 'sync_request':
      await sendLocalDataToServer(sourceServer);
      break;
      
    case 'sync_users':
      await syncUsersFromServer(message.data.users, sourceServer);
      break;
      
    case 'sync_transactions':
      await syncTransactionsFromServer(message.data.transactions, sourceServer);
      break;
      
    case 'ping':
      // Send pong back
      if (serverConnections[sourceServer] && serverConnections[sourceServer].readyState === WebSocket.OPEN) {
        serverConnections[sourceServer].send(JSON.stringify({
          type: 'pong',
          server: isReplit ? 'replit' : isRender ? 'render' : 'localhost',
          timestamp: Date.now()
        }));
      }
      break;
  }
}

// Sync user from other server
async function syncUserFromServer(userData, sourceServer) {
  try {
    if (!userData || !userData.email) {
      console.log('⚠️ Invalid user data received from server');
      return;
    }

    console.log(`🔄 Syncing user from ${sourceServer}: ${userData.email}`);
    
    const existingUser = await User.findOne({ email: userData.email });
    
    if (existingUser) {
      // Update existing user with latest data
      const updated = await User.findByIdAndUpdate(existingUser._id, {
        points: Math.max(existingUser.points, userData.points || 0),
        total_earned: Math.max(existingUser.total_earned, userData.total_earned || 0),
        last_login: new Date(),
        source: `synced_from_${sourceServer}`
      }, { new: true });
      
      console.log(`✅ Updated user from ${sourceServer}: ${updated.email}`);
    } else {
      // Create new user
      const newUser = new User({
        email: userData.email,
        username: userData.username || `user_${Date.now().toString().slice(-8)}`,
        password: `synced_${Math.random().toString(36).slice(-8)}`,
        phone: userData.phone || userData.mobile,
        full_name: userData.full_name || userData.username,
        referral_code: userData.referral_code || generateReferralCode(),
        referred_by: userData.referred_by || userData.sponsorId,
        points: userData.points || 0,
        total_earned: userData.total_earned || 0,
        status: 'active',
        registration_date: userData.registration_date || new Date(),
        source: `synced_from_${sourceServer}`,
        sync_source: sourceServer,
        sync_timestamp: Date.now()
      });
      
      await newUser.save();
      console.log(`✅ Created user from ${sourceServer}: ${newUser.email}`);
      
      // Broadcast to admin clients
      broadcastNewUser({
        user: {
          id: newUser._id,
          email: newUser.email,
          username: newUser.username,
          points: newUser.points,
          source: `synced_from_${sourceServer}`,
          registration_date: newUser.registration_date
        },
        source: `server_sync_${sourceServer}`
      });
    }
  } catch (error) {
    console.error(`❌ Error syncing user from ${sourceServer}:`, error);
  }
}

// Sync transaction from other server
async function syncTransactionFromServer(transactionData, sourceServer) {
  try {
    if (!transactionData || !transactionData.userId) {
      console.log('⚠️ Invalid transaction data received from server');
      return;
    }

    console.log(`🔄 Syncing transaction from ${sourceServer}`);
    
    const user = await User.findById(transactionData.userId);
    if (!user) {
      console.log(`⚠️ User not found for transaction: ${transactionData.userId}`);
      return;
    }

    // Check if transaction already exists
    const existingTransaction = await WalletTransaction.findOne({
      user_id: transactionData.userId,
      transaction_type: transactionData.type,
      amount: transactionData.amount,
      description: transactionData.description,
      'transaction_date': {
        $gte: new Date(Date.now() - 60000) // Within last minute
      }
    });

    if (existingTransaction) {
      console.log(`✅ Transaction already exists, skipping`);
      return;
    }

    const walletTransaction = new WalletTransaction({
      user_id: transactionData.userId,
      transaction_type: transactionData.type || 'earning',
      amount: transactionData.amount || 0,
      description: transactionData.description || `Synced from ${sourceServer}`,
      category: transactionData.category || 'sync',
      balance_before: user.points,
      balance_after: user.points + (transactionData.amount || 0),
      currency: 'points',
      sync_source: sourceServer,
      sync_timestamp: Date.now()
    });

    await walletTransaction.save();
    
    // Update user points
    user.points += transactionData.amount || 0;
    user.total_earned += transactionData.amount || 0;
    await user.save();
    
    console.log(`✅ Transaction synced from ${sourceServer}`);
    
    // Broadcast to admin clients
    broadcastNewTransaction({
      userId: transactionData.userId,
      type: transactionData.type || 'earning',
      amount: transactionData.amount || 0,
      description: `Synced from ${sourceServer}: ${transactionData.description}`,
      category: 'server_sync',
      timestamp: new Date(),
      source: sourceServer
    });
  } catch (error) {
    console.error(`❌ Error syncing transaction from ${sourceServer}:`, error);
  }
}

// Send local data to requesting server
async function sendLocalDataToServer(targetServer) {
  try {
    const connection = serverConnections[targetServer];
    if (!connection || connection.readyState !== WebSocket.OPEN) {
      console.log(`⚠️ Cannot send data to ${targetServer}: Connection not open`);
      return;
    }

    console.log(`📤 Sending local data to ${targetServer}...`);
    
    // Get recent users (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentUsers = await User.find({
      registration_date: { $gte: oneDayAgo }
    }).limit(50);
    
    // Get recent transactions (last 24 hours)
    const recentTransactions = await WalletTransaction.find({
      transaction_date: { $gte: oneDayAgo }
    }).limit(100);
    
    // Send users
    connection.send(JSON.stringify({
      type: 'sync_users',
      server: isReplit ? 'replit' : isRender ? 'render' : 'localhost',
      data: {
        users: recentUsers.map(user => ({
          email: user.email,
          username: user.username,
          points: user.points,
          total_earned: user.total_earned,
          registration_date: user.registration_date,
          source: user.source
        }))
      },
      timestamp: Date.now()
    }));
    
    // Send transactions
    connection.send(JSON.stringify({
      type: 'sync_transactions',
      server: isReplit ? 'replit' : isRender ? 'render' : 'localhost',
      data: {
        transactions: recentTransactions.map(transaction => ({
          userId: transaction.user_id,
          type: transaction.transaction_type,
          amount: transaction.amount,
          description: transaction.description,
          category: transaction.category,
          transaction_date: transaction.transaction_date
        }))
      },
      timestamp: Date.now()
    }));
    
    console.log(`✅ Sent ${recentUsers.length} users and ${recentTransactions.length} transactions to ${targetServer}`);
  } catch (error) {
    console.error(`❌ Error sending data to ${targetServer}:`, error);
  }
}

// Sync multiple users from server
async function syncUsersFromServer(users, sourceServer) {
  try {
    console.log(`🔄 Syncing ${users.length} users from ${sourceServer}`);
    
    let syncedCount = 0;
    for (const userData of users) {
      await syncUserFromServer(userData, sourceServer);
      syncedCount++;
    }
    
    console.log(`✅ Synced ${syncedCount} users from ${sourceServer}`);
  } catch (error) {
    console.error(`❌ Error syncing users from ${sourceServer}:`, error);
  }
}

// Sync multiple transactions from server
async function syncTransactionsFromServer(transactions, sourceServer) {
  try {
    console.log(`🔄 Syncing ${transactions.length} transactions from ${sourceServer}`);
    
    let syncedCount = 0;
    for (const transactionData of transactions) {
      await syncTransactionFromServer(transactionData, sourceServer);
      syncedCount++;
    }
    
    console.log(`✅ Synced ${syncedCount} transactions from ${sourceServer}`);
  } catch (error) {
    console.error(`❌ Error syncing transactions from ${sourceServer}:`, error);
  }
}

// Broadcast to all connected servers
function broadcastToServers(message) {
  const messageStr = JSON.stringify(message);
  
  Object.keys(serverConnections).forEach(serverName => {
    const connection = serverConnections[serverName];
    if (connection && connection.readyState === WebSocket.OPEN) {
      try {
        connection.send(messageStr);
      } catch (error) {
        console.error(`Error broadcasting to ${serverName}:`, error);
      }
    }
  });
}

// ==========================================
// ✅ REPLIT WEBSOCKET SERVER SETUP
// ==========================================

const wss = new WebSocket.Server({ 
    server,
    path: '/ws',
    clientTracking: true
});

// Store connected admin clients
const connectedAdmins = new Map();

wss.on('connection', (ws, req) => {
    const clientId = Date.now().toString();
    console.log(`🟢 New WebSocket connection: ${clientId}`);
    
    connectedAdmins.set(clientId, ws);
    
    // Send welcome message
    ws.send(JSON.stringify({
        type: 'connected',
        message: 'Connected to TapEarn Admin WebSocket',
        timestamp: Date.now(),
        clientId: clientId,
        serverType: isReplit ? 'replit' : isRender ? 'render' : 'localhost'
    }));
    
    // Handle incoming messages
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('📨 WebSocket message:', data.type);
            
            switch(data.type) {
                case 'admin_auth':
                    ws.send(JSON.stringify({
                        type: 'admin_authenticated',
                        message: 'Admin authenticated successfully',
                        timestamp: Date.now(),
                        serverType: isReplit ? 'replit' : isRender ? 'render' : 'localhost'
                    }));
                    break;
                    
                case 'ping':
                    ws.send(JSON.stringify({
                        type: 'pong',
                        timestamp: Date.now()
                    }));
                    break;
                    
                case 'request_sync':
                    // Broadcast sync request to all admins
                    broadcastToAdmins({
                        type: 'sync_requested',
                        from: data.adminId || 'unknown',
                        timestamp: Date.now()
                    });
                    break;
                    
                case 'server_sync_request':
                    // Request sync from other servers
                    Object.keys(serverConnections).forEach(serverName => {
                        const connection = serverConnections[serverName];
                        if (connection && connection.readyState === WebSocket.OPEN) {
                            connection.send(JSON.stringify({
                                type: 'sync_request',
                                server: isReplit ? 'replit' : isRender ? 'render' : 'localhost',
                                timestamp: Date.now()
                            }));
                        }
                    });
                    ws.send(JSON.stringify({
                        type: 'server_sync_started',
                        message: 'Server sync requested',
                        timestamp: Date.now()
                    }));
                    break;
                    
                default:
                    console.log('Unknown WS message type:', data.type);
            }
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    });
    
    // Handle disconnection
    ws.on('close', () => {
        console.log(`🔴 WebSocket disconnected: ${clientId}`);
        connectedAdmins.delete(clientId);
    });
    
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

// Broadcast function to send messages to all connected admins
function broadcastToAdmins(message) {
    const data = JSON.stringify(message);
    connectedAdmins.forEach((ws, clientId) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(data);
        }
    });
}

// Function to broadcast new user registration
function broadcastNewUser(userData) {
    broadcastToAdmins({
        type: 'user_registered',
        data: userData,
        timestamp: Date.now(),
        serverType: isReplit ? 'replit' : isRender ? 'render' : 'localhost'
    });
    
    // Also broadcast to other servers
    broadcastToServers({
        type: 'user_registered',
        data: userData,
        timestamp: Date.now(),
        server: isReplit ? 'replit' : isRender ? 'render' : 'localhost'
    });
}

// Function to broadcast new transaction
function broadcastNewTransaction(transactionData) {
    broadcastToAdmins({
        type: 'transaction_added',
        data: transactionData,
        timestamp: Date.now(),
        serverType: isReplit ? 'replit' : isRender ? 'render' : 'localhost'
    });
    
    // Also broadcast to other servers
    broadcastToServers({
        type: 'transaction_added',
        data: transactionData,
        timestamp: Date.now(),
        server: isReplit ? 'replit' : isRender ? 'render' : 'localhost'
    });
}

// ==========================================
// ✅ EXPRESS MIDDLEWARE CONFIGURATION
// ==========================================

// ✅ REPLIT COMPATIBLE CORS CONFIGURATION
const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://*.repl.co',
    'https://*.replit.dev',
    'https://*.replit.app',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://localhost:3001',
    'http://127.0.0.1:3001'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.some(allowed => origin.includes(allowed.replace('*.', '')))) {
            callback(null, true);
        } else if (process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
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

// ✅ Static files (Replit compatible)
app.use(express.static(__dirname, {
    setHeaders: (res, filepath) => {
        if (filepath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
        if (filepath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
        if (filepath.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html');
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

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://tapearn_admin:Admin123456@cluster0.ivp6m5c.mongodb.net/tapearn_db?retryWrites=true&w=majority&appName=Cluster0';

const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
        });
        
        console.log('✅ Connected to MongoDB Atlas successfully!');
        console.log('📊 Database:', mongoose.connection.name);
        
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
    sync_source: String,
    sync_timestamp: Date,
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
    reference_type: String,
    sync_source: String,
    sync_timestamp: Date
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
// ✅ BASIC ENDPOINTS
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

// ==========================================
// ✅ HEALTH & STATUS ENDPOINTS
// ==========================================

app.get('/ping', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        platform: 'Replit',
        serverType: isReplit ? 'replit' : isRender ? 'render' : 'localhost',
        websocket: {
            connected: connectedAdmins.size,
            status: 'active'
        },
        serverConnections: {
            replit: serverConnections.replit ? serverConnections.replit.readyState : 'disconnected',
            render: serverConnections.render ? serverConnections.render.readyState : 'disconnected',
            localhost: serverConnections.localhost ? serverConnections.localhost.readyState : 'disconnected'
        }
    });
});

app.get('/api/keep-alive', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Server is awake',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        serverType: isReplit ? 'replit' : isRender ? 'render' : 'localhost'
    });
});

app.get('/api/health-fast', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        serverType: isReplit ? 'replit' : isRender ? 'render' : 'localhost'
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
            websocket: {
                connected: connectedAdmins.size,
                status: 'active'
            },
            totalUsers: await User.countDocuments(),
            totalTransactions: await WalletTransaction.countDocuments(),
            platform: isReplit ? 'Replit' : isRender ? 'Render' : 'Local',
            serverType: isReplit ? 'replit' : isRender ? 'render' : 'localhost',
            url: req.hostname,
            serverConnections: {
                replit: serverConnections.replit ? (serverConnections.replit.readyState === WebSocket.OPEN ? 'connected' : 'disconnected') : 'not_connected',
                render: serverConnections.render ? (serverConnections.render.readyState === WebSocket.OPEN ? 'connected' : 'disconnected') : 'not_connected',
                localhost: serverConnections.localhost ? (serverConnections.localhost.readyState === WebSocket.OPEN ? 'connected' : 'disconnected') : 'not_connected'
            }
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
                serverTime: new Date().toISOString(),
                serverType: isReplit ? 'replit' : isRender ? 'render' : 'localhost',
                serverConnections: {
                    replit: serverConnections.replit ? serverConnections.replit.readyState : 'disconnected',
                    render: serverConnections.render ? serverConnections.render.readyState : 'disconnected',
                    localhost: serverConnections.localhost ? serverConnections.localhost.readyState : 'disconnected'
                }
            }
        });
    } catch (error) {
        console.error('Error fetching server stats:', error);
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
                source: user.source,
                sync_source: user.sync_source
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
                source: user.source,
                sync_source: user.sync_source
            }))
        });
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({ success: false, message: 'Server error' });
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
            
            // 🔥 Broadcast new user via WebSocket
            broadcastNewUser({
                user: {
                    id: user._id,
                    email: user.email,
                    username: user.username,
                    points: user.points,
                    source: user.source,
                    registration_date: user.registration_date
                },
                source: 'web_registration'
            });
            
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
                    
                    // 🔥 Broadcast referral commission
                    broadcastNewTransaction({
                        type: 'referral_commission',
                        userId: referrer._id,
                        amount: 50,
                        description: `Referral from ${user.username}`
                    });
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
            
            // 🔥 Broadcast new user via WebSocket
            broadcastNewUser({
                user: {
                    id: user._id,
                    email: user.email,
                    username: user.username,
                    points: user.points,
                    source: 'web_sync',
                    registration_date: user.registration_date
                },
                source: 'web_sync'
            });
            
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

// ==========================================
// ✅ WALLET AND TRANSACTIONS ENDPOINTS
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
        
        // 🔥 Broadcast new transaction via WebSocket
        broadcastNewTransaction({
            userId: userId,
            type: transactionType,
            amount: amount,
            description: description,
            category: category,
            timestamp: new Date()
        });
        
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
// ✅ MOBILE SYNC ENDPOINTS
// ==========================================

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
            
            // 🔥 Broadcast new mobile user via WebSocket
            broadcastNewUser({
                user: {
                    id: user._id,
                    email: user.email,
                    username: user.username,
                    points: user.points,
                    source: 'mobile_app',
                    registration_date: user.registration_date
                },
                source: 'mobile_app'
            });
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
// ✅ UNIVERSAL SYNC ENDPOINTS
// ==========================================

app.post('/api/universal/user-registered', async (req, res) => {
    try {
        const userData = req.body;
        console.log('📱 Universal user registered:', userData.email);
        
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
            source: 'universal_sync'
        });
        
        await newUser.save();
        
        console.log(`✅ Universal user saved: ${userData.email}`);
        
        // 🔥 Broadcast new user via WebSocket
        broadcastNewUser({
            user: {
                id: newUser._id,
                email: newUser.email,
                username: newUser.username,
                points: newUser.points,
                source: 'universal_sync',
                registration_date: newUser.registration_date
            },
            source: 'universal_sync'
        });
        
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
// ✅ SERVER SYNC ENDPOINTS
// ==========================================

app.get('/api/servers/status', (req, res) => {
    res.json({
        success: true,
        serverType: isReplit ? 'replit' : isRender ? 'render' : 'localhost',
        connections: {
            replit: {
                connected: serverConnections.replit ? serverConnections.replit.readyState === WebSocket.OPEN : false,
                state: serverConnections.replit ? serverConnections.replit.readyState : 'disconnected'
            },
            render: {
                connected: serverConnections.render ? serverConnections.render.readyState === WebSocket.OPEN : false,
                state: serverConnections.render ? serverConnections.render.readyState : 'disconnected'
            },
            localhost: {
                connected: serverConnections.localhost ? serverConnections.localhost.readyState === WebSocket.OPEN : false,
                state: serverConnections.localhost ? serverConnections.localhost.readyState : 'disconnected'
            }
        },
        timestamp: Date.now()
    });
});

app.post('/api/servers/sync-now', async (req, res) => {
    try {
        // Connect to all servers
        connectToOtherServers();
        
        // Send sync request to all connected servers
        Object.keys(serverConnections).forEach(serverName => {
            const connection = serverConnections[serverName];
            if (connection && connection.readyState === WebSocket.OPEN) {
                connection.send(JSON.stringify({
                    type: 'sync_request',
                    server: isReplit ? 'replit' : isRender ? 'render' : 'localhost',
                    timestamp: Date.now()
                }));
            }
        });
        
        res.json({
            success: true,
            message: 'Server sync initiated',
            timestamp: Date.now()
        });
    } catch (error) {
        console.error('Error initiating server sync:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/servers/get-synced-data', async (req, res) => {
    try {
        const syncedUsers = await User.find({ 
            sync_source: { $exists: true, $ne: null }
        }).select('email username points sync_source sync_timestamp').sort({ sync_timestamp: -1 }).limit(100);
        
        const syncedTransactions = await WalletTransaction.find({
            sync_source: { $exists: true, $ne: null }
        }).select('transaction_type amount description sync_source sync_timestamp').sort({ sync_timestamp: -1 }).limit(100);
        
        res.json({
            success: true,
            syncedUsers: syncedUsers,
            syncedTransactions: syncedTransactions,
            counts: {
                users: syncedUsers.length,
                transactions: syncedTransactions.length
            },
            timestamp: Date.now()
        });
    } catch (error) {
        console.error('Error getting synced data:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==========================================
// ✅ REAL-TIME SYNC ENDPOINTS
// ==========================================

app.post('/api/notify-admin', (req, res) => {
    const notification = req.body;
    console.log('📢 Admin notification:', notification);
    
    // 🔥 Broadcast notification via WebSocket
    broadcastToAdmins({
        type: 'admin_notification',
        notification: notification,
        timestamp: Date.now()
    });
    
    res.json({ success: true, message: 'Notification received and broadcasted' });
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
// ✅ WEBSOCKET TEST ENDPOINTS
// ==========================================

app.post('/api/websocket/test-broadcast', async (req, res) => {
    try {
        const { message, type } = req.body;
        
        broadcastToAdmins({
            type: type || 'test_message',
            message: message || 'Test broadcast from server',
            timestamp: Date.now(),
            source: 'server'
        });
        
        res.json({
            success: true,
            message: 'Broadcast sent to all connected admins',
            connectedAdmins: connectedAdmins.size
        });
    } catch (error) {
        console.error('WebSocket broadcast error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/websocket/status', (req, res) => {
    res.json({
        success: true,
        connectedAdmins: connectedAdmins.size,
        status: 'active',
        timestamp: Date.now(),
        serverConnections: {
            replit: serverConnections.replit ? serverConnections.replit.readyState : 'disconnected',
            render: serverConnections.render ? serverConnections.render.readyState : 'disconnected',
            localhost: serverConnections.localhost ? serverConnections.localhost.readyState : 'disconnected'
        }
    });
});

// ==========================================
// ✅ OTHER ENDPOINTS (TASKS, MINING, REFERRALS)
// ==========================================

// ✅ Task Endpoints
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

// ✅ Mining Pool Endpoints
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

// ✅ Referral Endpoints
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
// ✅ REPLIT SPECIFIC ENDPOINTS
// ==========================================

app.get('/api/replit/info', (req, res) => {
    res.json({
        success: true,
        platform: 'Replit',
        websocket: {
            enabled: true,
            path: '/ws',
            connectedClients: connectedAdmins.size
        },
        endpoints: {
            admin: '/admin.html',
            health: '/api/health',
            websocket: 'wss://' + req.hostname + '/ws',
            serverSync: '/api/servers/status'
        },
        timestamp: new Date().toISOString()
    });
});

// ==========================================
// ✅ ERROR HANDLING
// ==========================================

app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        message: 'Endpoint not found',
        availableEndpoints: [
            '/api/health',
            '/api/get-all-users',
            '/api/save-user',
            '/api/mobile/register',
            '/admin.html',
            '/api/websocket/status',
            '/api/servers/status'
        ]
    });
});

app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: err.message 
    });
});

// ==========================================
// ✅ SERVER START
// ==========================================

server.listen(PORT, '0.0.0.0', () => {
    console.log(`
    🚀 TapEarn Server v3.0 (Replit Optimized with Multi-Server WebSocket)
    ==========================================
    ✅ Platform: ${isReplit ? 'Replit.com' : isRender ? 'Render.com' : 'Local'}
    ✅ Server Type: ${isReplit ? 'replit' : isRender ? 'render' : 'localhost'}
    ✅ WebSocket: Active (${connectedAdmins.size} admin connections)
    ✅ Server running on: http://localhost:${PORT}
    ✅ MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}
    
    🔗 Important URLs:
    - Main App: http://localhost:${PORT}/
    - Admin Panel: http://localhost:${PORT}/admin.html
    - Health Check: http://localhost:${PORT}/api/health
    - WebSocket: ws://localhost:${PORT}/ws
    - Server Status: http://localhost:${PORT}/api/servers/status
    
    🔄 Multi-Server Features:
    - Server-to-Server WebSocket ✅
    - Real-time data synchronization ✅
    - Auto-reconnect mechanism ✅
    - Conflict resolution (max points) ✅
    
    📊 Server started at: ${new Date().toLocaleString()}
    `);
    
    // Connect to other servers after 3 seconds
    setTimeout(() => {
        connectToOtherServers();
    }, 3000);
    
    // Auto-ping to keep WebSocket alive
    setInterval(() => {
        broadcastToAdmins({
            type: 'heartbeat',
            timestamp: Date.now(),
            message: 'Server heartbeat',
            serverType: isReplit ? 'replit' : isRender ? 'render' : 'localhost'
        });
        
        // Ping other servers
        Object.keys(serverConnections).forEach(serverName => {
            const connection = serverConnections[serverName];
            if (connection && connection.readyState === WebSocket.OPEN) {
                connection.send(JSON.stringify({
                    type: 'ping',
                    server: isReplit ? 'replit' : isRender ? 'render' : 'localhost',
                    timestamp: Date.now()
                }));
            }
        });
    }, 30000);
});

process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    
    // Close all server connections
    Object.keys(serverConnections).forEach(serverName => {
        const connection = serverConnections[serverName];
        if (connection && connection.readyState === WebSocket.OPEN) {
            connection.close();
        }
    });
    
    server.close(() => {
        console.log('HTTP Server closed');
        mongoose.connection.close();
        process.exit(0);
    });
});
