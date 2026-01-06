// ==============================================
// ADMIN PANEL INTEGRATION - OPTIMIZED VERSION 2.0
// ✅ FIXED: All duplication and spam issues resolved
// ✅ OPTIMIZED: Proper throttling and debouncing implemented
// ✅ SPONSOR SYSTEM: Fully integrated
// ==============================================

// ✅ Check if already loaded to prevent duplicate declaration
if (typeof window.ADMIN_INTEGRATION_LOADED === 'undefined') {
    window.ADMIN_INTEGRATION_LOADED = true;
    
    console.log('🔧 Admin Panel Integration Loading (Optimized)...');

    // ✅ ADMIN AUTHORIZED USERS LIST
    const ADMIN_AUTHORIZED_USERS = [
        'admin@tapearn.com',
        'admin@example.com', 
        'superuser@tapearn.com',
        'system_admin',
        'developer',
        'admin'
    ];

    // ✅ OPTIMIZED: Throttling configuration
    const SYNC_CONFIG = {
        broadcastInterval: 30000,      // 30 seconds
        syncInterval: 45000,           // 45 seconds
        throttleTime: 8000,            // 8 seconds minimum between syncs
        notificationCooldown: 3000,    // 3 seconds between notifications
        maxBroadcasts: 3,              // Max broadcasts per minute
        maxNotifications: 3            // Max notifications to show
    };

    // ✅ Performance tracking
    let performance = {
        lastBroadcast: 0,
        lastSync: 0,
        broadcastCount: 0,
        syncCount: 0,
        notificationCount: 0,
        resetTimer: null
    };

    // Reset performance counters every minute
    function resetPerformanceCounters() {
        performance.broadcastCount = 0;
        performance.syncCount = 0;
        performance.notificationCount = 0;
        console.log('🔄 Performance counters reset');
    }

    // Start performance reset timer
    setInterval(resetPerformanceCounters, 60000);

    // ✅ Check if user is authorized to ACCESS admin panel
    function isUserAuthorizedForAdminAccess() {
        const currentUser = getFromStorage('currentUser', {});
        
        if (!currentUser || Object.keys(currentUser).length === 0) {
            return false;
        }
        
        const userIdentifiers = [
            currentUser.email,
            currentUser.username,
            currentUser.id,
            currentUser.userId
        ].filter(Boolean).map(id => id.toLowerCase());
        
        // Check if any identifier is in authorized list
        for (const identifier of userIdentifiers) {
            if (ADMIN_AUTHORIZED_USERS.some(authorized => 
                authorized.toLowerCase() === identifier)) {
                return true;
            }
        }
        
        return false;
    }

    // ✅ Check if user data should be synced to admin panel (ALL USERS)
    function shouldSyncUserData() {
        const currentUser = getFromStorage('currentUser', {});
        return currentUser && Object.keys(currentUser).length > 0;
    }

    // ✅ OPEN ADMIN PANEL IN NEW WINDOW (ONLY FOR AUTHORIZED ADMINS)
    function openAdminPanel() {
        // Check authorization
        if (!isUserAuthorizedForAdminAccess()) {
            showNotification('❌ Unauthorized: Admin access restricted!', 'error');
            return;
        }
        
        const currentUser = getFromStorage('currentUser', {});
        
        // Prepare admin session data
        const adminSessionData = {
            adminUser: currentUser.email || currentUser.username || currentUser.id,
            adminName: currentUser.username || currentUser.email || 'Admin',
            adminToken: generateAdminToken(),
            timestamp: Date.now(),
            authorized: true,
            permissions: ['users', 'transactions', 'mining', 'wallet', 'referrals', 'sponsors', 'server', 'settings']
        };
        
        saveToStorage('adminSession', adminSessionData);
        
        // Open admin.html in a new window
        const adminWindow = window.open(
            'admin.html', 
            '_blank',
            'width=1400,height=800,toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes'
        );
        
        if (!adminWindow) {
            showNotification('❌ Please allow popups for admin panel', 'warning');
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1500);
        } else {
            showNotification('✅ Admin panel opened', 'success');
        }
    }

    // ✅ GENERATE ADMIN TOKEN
    function generateAdminToken() {
        const currentUser = getFromStorage('currentUser', {});
        return 'ADMIN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9) + '_' + (currentUser.id || 'unknown');
    }

    // ✅ INJECT ADMIN BUTTON IN MAIN APP (ONLY FOR AUTHORIZED ADMINS)
    let adminButtonInjected = false;
    
    function injectAdminButton() {
        // Prevent duplicate injection
        if (adminButtonInjected) return;
        
        // Check if user is authorized for admin access
        if (!isUserAuthorizedForAdminAccess()) return;
        
        // Remove any existing admin button
        const existingBtn = document.querySelector('.admin-header-btn');
        if (existingBtn) existingBtn.remove();
        
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
            width: 45px;
            height: 45px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(255,0,0,0.6);
            transition: all 0.3s;
            border: 2px solid #fff;
            animation: adminPulse 2s infinite;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes adminPulse {
                0% { box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7); }
                70% { box-shadow: 0 0 0 10px rgba(255, 0, 0, 0); }
                100% { box-shadow: 0 0 0 0 rgba(255, 0, 0, 0); }
            }
        `;
        document.head.appendChild(style);
        
        adminBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            openAdminPanel();
        };
        
        adminBtn.onmouseenter = function() {
            this.style.transform = 'scale(1.15) rotate(15deg)';
            this.style.boxShadow = '0 6px 25px rgba(255,0,0,0.8)';
            this.style.borderColor = '#FFD700';
        };
        
        adminBtn.onmouseleave = function() {
            this.style.transform = 'scale(1) rotate(0deg)';
            this.style.boxShadow = '0 4px 20px rgba(255,0,0,0.6)';
            this.style.borderColor = '#fff';
        };
        
        document.body.appendChild(adminBtn);
        adminButtonInjected = true;
        console.log('✅ Admin button injected');
    }

    // ✅ Debounced function to check and inject admin button
    let checkAdminButtonTimeout = null;
    function checkAndInjectAdminButton() {
        if (checkAdminButtonTimeout) clearTimeout(checkAdminButtonTimeout);
        
        checkAdminButtonTimeout = setTimeout(() => {
            if (isUserAuthorizedForAdminAccess() && !adminButtonInjected) {
                injectAdminButton();
            }
        }, 2000);
    }

    // ✅ OPTIMIZED: Save data with cross-browser sync
    function saveWithMultiBrowserSync(key, data, silent = false) {
        try {
            // Save to localStorage
            localStorage.setItem(key, JSON.stringify(data));
            
            // Broadcast to other tabs/windows (only if not silent)
            if (!silent) {
                broadcastStorageChange(key, data);
            }
            
            return true;
        } catch (error) {
            console.error('Error saving with sync:', error);
            return false;
        }
    }

    // ✅ Broadcast storage changes to other tabs
    function broadcastStorageChange(key, data) {
        try {
            // Limit broadcasts per minute
            if (performance.broadcastCount >= SYNC_CONFIG.maxBroadcasts) {
                return;
            }
            
            // Create a custom event
            const event = new CustomEvent('crossStorageChange', {
                detail: {
                    key: key,
                    data: data,
                    timestamp: Date.now(),
                    source: 'optimized_sync'
                }
            });
            
            // Dispatch the event
            window.dispatchEvent(event);
            
            // Use localStorage as a cross-tab communication channel
            localStorage.setItem('optimized_storage_sync', JSON.stringify({
                key: key,
                data: data,
                timestamp: Date.now(),
                source: 'broadcast'
            }));
            
            // Remove after short delay to prevent buildup
            setTimeout(() => {
                localStorage.removeItem('optimized_storage_sync');
            }, 100);
            
            performance.broadcastCount++;
            performance.lastBroadcast = Date.now();
            
        } catch (error) {
            console.error('Error broadcasting storage change:', error);
        }
    }

    // ✅ OPTIMIZED: Broadcast all users data with throttling
    let lastBroadcastTime = 0;
    function broadcastAllUsersData(silent = false) {
        if (!shouldSyncUserData()) return;
        
        const now = Date.now();
        
        // Throttle broadcasts
        if (now - lastBroadcastTime < SYNC_CONFIG.throttleTime) {
            return;
        }
        
        // Limit broadcasts per minute
        if (performance.broadcastCount >= SYNC_CONFIG.maxBroadcasts) {
            return;
        }
        
        lastBroadcastTime = now;
        
        try {
            const registeredUsers = getFromStorage('registeredUsers', []);
            const allTransactions = getFromStorage('allUsersTransactions', []);
            const allReferrals = getFromStorage('allReferrals', []);
            
            // Get sponsor data
            const sponsorAssignments = registeredUsers.map(u => ({
                userId: u.email || u.id,
                sponsorId: u.sponsorId,
                username: u.username
            })).filter(a => a.sponsorId);
            
            const sponsorCommissionSettings = getFromStorage('sponsorCommissionSettings', {});
            const sponsorChangeLog = getFromStorage('sponsorChangeLog', []);
            
            // Calculate sponsor stats
            const usersWithSponsor = registeredUsers.filter(u => u.sponsorId && u.sponsorId !== 'none' && u.sponsorId !== '');
            const uniqueSponsors = [...new Set(usersWithSponsor.map(u => u.sponsorId))];
            
            const commissionEarnings = allTransactions
                .filter(tx => tx.category === 'referral' && tx.type === 'earning')
                .reduce((sum, tx) => sum + (tx.amount || 0), 0);
            
            const sponsorStats = {
                totalSponsors: uniqueSponsors.length,
                sponsoredUsers: usersWithSponsor.length,
                commissionEarnings: commissionEarnings,
                sponsorConversionRate: registeredUsers.length > 0 ? 
                    ((usersWithSponsor.length / registeredUsers.length) * 100).toFixed(1) : 0,
                updatedAt: new Date().toISOString()
            };
            
            if (registeredUsers.length > 0) {
                const syncPacket = {
                    type: 'optimized_users_data',
                    registeredUsers: registeredUsers,
                    allTransactions: allTransactions,
                    allReferrals: allReferrals,
                    sponsorData: {
                        sponsorAssignments: sponsorAssignments,
                        sponsorStats: sponsorStats,
                        sponsorCommissionSettings: sponsorCommissionSettings,
                        sponsorChangeLog: sponsorChangeLog
                    },
                    timestamp: Date.now(),
                    source: 'optimized_broadcast',
                    silent: silent
                };
                
                // Save to localStorage for other tabs to pick up
                localStorage.setItem('optimized_users_data_sync', JSON.stringify(syncPacket));
                
                // Also save sponsor stats separately
                localStorage.setItem('sponsorStats', JSON.stringify(sponsorStats));
                
                // Broadcast via custom event
                const event = new CustomEvent('optimizedUsersDataSync', {
                    detail: syncPacket
                });
                window.dispatchEvent(event);
                
                performance.broadcastCount++;
            }
            
        } catch (error) {
            console.error('Error broadcasting all users data:', error);
        }
    }

    // ✅ OPTIMIZED: Sync all users data with throttling
    let lastSyncTime = 0;
    let isSyncing = false;
    
    async function syncAllUsersData(silent = false) {
        if (!shouldSyncUserData()) return;
        
        const now = Date.now();
        
        // Throttle syncs
        if (now - lastSyncTime < SYNC_CONFIG.throttleTime) {
            return;
        }
        
        // Prevent concurrent syncs
        if (isSyncing) {
            return;
        }
        
        isSyncing = true;
        lastSyncTime = now;
        
        try {
            const registeredUsers = getFromStorage('registeredUsers', []);
            const allTransactions = getFromStorage('allUsersTransactions', []);
            const allReferrals = getFromStorage('allReferrals', []);
            
            // Get sponsor data
            const sponsorAssignments = registeredUsers.map(u => ({
                userId: u.email || u.id,
                sponsorId: u.sponsorId,
                username: u.username
            })).filter(a => a.sponsorId);
            
            const sponsorCommissionSettings = getFromStorage('sponsorCommissionSettings', {});
            const sponsorChangeLog = getFromStorage('sponsorChangeLog', []);
            
            // Calculate sponsor stats
            const usersWithSponsor = registeredUsers.filter(u => u.sponsorId && u.sponsorId !== 'none' && u.sponsorId !== '');
            const uniqueSponsors = [...new Set(usersWithSponsor.map(u => u.sponsorId))];
            
            const commissionEarnings = allTransactions
                .filter(tx => tx.category === 'referral' && tx.type === 'earning')
                .reduce((sum, tx) => sum + (tx.amount || 0), 0);
            
            const sponsorStats = {
                totalSponsors: uniqueSponsors.length,
                sponsoredUsers: usersWithSponsor.length,
                commissionEarnings: commissionEarnings,
                sponsorConversionRate: registeredUsers.length > 0 ? 
                    ((usersWithSponsor.length / registeredUsers.length) * 100).toFixed(1) : 0,
                updatedAt: new Date().toISOString()
            };
            
            // Save to localStorage with sync (silent if specified)
            saveWithMultiBrowserSync('registeredUsers', registeredUsers, silent);
            saveWithMultiBrowserSync('allUsersTransactions', allTransactions, silent);
            saveWithMultiBrowserSync('allReferrals', allReferrals, silent);
            saveWithMultiBrowserSync('sponsorStats', sponsorStats, silent);
            saveWithMultiBrowserSync('sponsorAssignments', sponsorAssignments, silent);
            saveWithMultiBrowserSync('sponsorCommissionSettings', sponsorCommissionSettings, silent);
            
            // Also save to server if available (throttled)
            try {
                if (registeredUsers.length > 0) {
                    const response = await fetch('http://localhost:3000/api/admin/sync-all', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            users: registeredUsers,
                            sponsorData: {
                                sponsorAssignments: sponsorAssignments,
                                sponsorStats: sponsorStats,
                                sponsorCommissionSettings: sponsorCommissionSettings,
                                sponsorChangeLog: sponsorChangeLog
                            }
                        })
                    });
                    
                    if (response.ok) {
                        if (!silent) {
                            console.log('✅ Data synced to server');
                        }
                    }
                }
            } catch (serverError) {
                if (!silent) {
                    console.log('⚠️ Server sync failed, using local sync only');
                }
            }
            
            performance.syncCount++;
            
            return {
                users: registeredUsers,
                transactions: allTransactions,
                referrals: allReferrals,
                sponsorStats: sponsorStats,
                sponsorAssignments: sponsorAssignments
            };
        } catch (error) {
            console.error('Error syncing all users data:', error);
            return null;
        } finally {
            isSyncing = false;
        }
    }

    // ✅ OPTIMIZED: Cross-browser sync with proper throttling
    function setupCrossBrowserDataSync() {
        let lastEventTimes = {};
        let processingEvent = false;
        
        // Listen for storage events (other tabs)
        window.addEventListener('storage', function(event) {
            // Prevent concurrent processing
            if (processingEvent) return;
            processingEvent = true;
            
            const syncKeys = [
                'registeredUsers', 
                'allUsersTransactions',
                'allReferrals',
                'miningPools',
                'miningPoolInstances',
                'sponsorStats',
                'sponsorAssignments',
                'sponsorCommissionSettings',
                'sponsorChangeLog'
            ];
            
            if (syncKeys.includes(event.key)) {
                const now = Date.now();
                const lastTime = lastEventTimes[event.key] || 0;
                
                // Throttle events for the same key
                if (now - lastTime < SYNC_CONFIG.throttleTime) {
                    processingEvent = false;
                    return;
                }
                lastEventTimes[event.key] = now;
                
                try {
                    const newData = JSON.parse(event.newValue || '[]');
                    
                    // Update local storage
                    localStorage.setItem(event.key, event.newValue);
                    
                    // Trigger sponsor system update if sponsor data changed
                    if (event.key.includes('sponsor')) {
                        window.dispatchEvent(new CustomEvent('sponsorDataUpdated', {
                            detail: { key: event.key, data: newData }
                        }));
                    }
                    
                } catch (error) {
                    console.error('Error processing data sync:', error);
                }
            }
            
            processingEvent = false;
        });
        
        // Listen for custom cross-storage events with throttling
        let lastCrossStorageTime = 0;
        window.addEventListener('crossStorageChange', function(event) {
            const { key, data, source, silent } = event.detail;
            
            if (source === 'optimized_sync') {
                const now = Date.now();
                if (now - lastCrossStorageTime < SYNC_CONFIG.throttleTime) {
                    return;
                }
                lastCrossStorageTime = now;
                
                // Update local storage
                localStorage.setItem(key, JSON.stringify(data));
                
                // Update in-memory data if available
                if (window.adminData) {
                    if (key === 'registeredUsers') {
                        window.adminData.users = data;
                    } else if (key === 'sponsorStats') {
                        window.adminData.sponsorStats = data;
                    }
                }
                
                // Trigger sponsor update event
                if (key.includes('sponsor')) {
                    window.dispatchEvent(new CustomEvent('sponsorSystemUpdated', {
                        detail: { key, data }
                    }));
                }
            }
        });
        
        // Listen for sponsor-specific events
        window.addEventListener('sponsorDataUpdated', function(event) {
            // Recalculate sponsor stats
            const registeredUsers = getFromStorage('registeredUsers', []);
            const allTransactions = getFromStorage('allUsersTransactions', []);
            
            const usersWithSponsor = registeredUsers.filter(u => u.sponsorId && u.sponsorId !== 'none' && u.sponsorId !== '');
            const uniqueSponsors = [...new Set(usersWithSponsor.map(u => u.sponsorId))];
            
            const commissionEarnings = allTransactions
                .filter(tx => tx.category === 'referral' && tx.type === 'earning')
                .reduce((sum, tx) => sum + (tx.amount || 0), 0);
            
            const sponsorStats = {
                totalSponsors: uniqueSponsors.length,
                sponsoredUsers: usersWithSponsor.length,
                commissionEarnings: commissionEarnings,
                sponsorConversionRate: registeredUsers.length > 0 ? 
                    ((usersWithSponsor.length / registeredUsers.length) * 100).toFixed(1) : 0,
                updatedAt: new Date().toISOString()
            };
            
            // Update sponsor stats
            localStorage.setItem('sponsorStats', JSON.stringify(sponsorStats));
            
            // Broadcast updated sponsor stats
            broadcastStorageChange('sponsorStats', sponsorStats);
        });
        
        // Optimized broadcast interval
        setInterval(() => {
            broadcastAllUsersData(true); // Silent broadcast
        }, SYNC_CONFIG.broadcastInterval);
    }

    // ✅ SETUP DATA SYNC FOR ALL USERS WITH SPONSOR SYSTEM
    function setupAllUsersDataSync() {
        setupCrossBrowserDataSync();
        
        // Throttled event listeners
        let lastStorageEventTime = 0;
        window.addEventListener('storage', function(event) {
            const now = Date.now();
            if (now - lastStorageEventTime < SYNC_CONFIG.throttleTime) return;
            lastStorageEventTime = now;
            
            if (event.key === 'registeredUsers' || event.key === 'allUsersTransactions') {
                if (shouldSyncUserData()) {
                    syncAllUsersData(true); // Silent sync
                }
            }
            
            if (event.key.includes('sponsor')) {
                syncAllUsersData(true); // Silent sync
            }
        });
        
        window.addEventListener('optimizedUsersDataSync', function(event) {
            const data = event.detail;
            
            // Update local storage
            if (data.registeredUsers) {
                localStorage.setItem('registeredUsers', JSON.stringify(data.registeredUsers));
            }
            if (data.allTransactions) {
                localStorage.setItem('allUsersTransactions', JSON.stringify(data.allTransactions));
            }
            if (data.sponsorData) {
                localStorage.setItem('sponsorStats', JSON.stringify(data.sponsorData.sponsorStats || {}));
                localStorage.setItem('sponsorAssignments', JSON.stringify(data.sponsorData.sponsorAssignments || []));
                localStorage.setItem('sponsorCommissionSettings', JSON.stringify(data.sponsorData.sponsorCommissionSettings || {}));
            }
        });
        
        // Listen for sponsor system events
        window.addEventListener('sponsorAssigned', function(event) {
            syncAllUsersData(true); // Silent sync
        });
        
        window.addEventListener('sponsorRemoved', function(event) {
            syncAllUsersData(true); // Silent sync
        });
        
        // Initial sync
        setTimeout(() => {
            if (shouldSyncUserData()) {
                syncAllUsersData();
                broadcastAllUsersData();
            }
        }, 3000);
        
        // Optimized periodic sync
        setInterval(() => {
            if (shouldSyncUserData()) {
                syncAllUsersData(true); // Silent sync
                broadcastAllUsersData(true); // Silent broadcast
            }
        }, SYNC_CONFIG.syncInterval);
    }

    // ✅ Initialize sponsor system data
    function initializeSponsorSystemData() {
        // Setup sponsor commission settings if not exists
        if (!localStorage.getItem('sponsorCommissionSettings')) {
            const defaultSettings = {
                level1: 10,
                level2: 5,
                level3: 2,
                minCommission: 100,
                payoutSchedule: 'daily',
                maxDaily: 10000,
                createdAt: new Date().toISOString()
            };
            localStorage.setItem('sponsorCommissionSettings', JSON.stringify(defaultSettings));
        }
        
        // Setup sponsor change log if not exists
        if (!localStorage.getItem('sponsorChangeLog')) {
            localStorage.setItem('sponsorChangeLog', JSON.stringify([]));
        }
        
        // Setup sponsor stats if not exists
        if (!localStorage.getItem('sponsorStats')) {
            const registeredUsers = getFromStorage('registeredUsers', []);
            const allTransactions = getFromStorage('allUsersTransactions', []);
            
            const usersWithSponsor = registeredUsers.filter(u => u.sponsorId && u.sponsorId !== 'none' && u.sponsorId !== '');
            const uniqueSponsors = [...new Set(usersWithSponsor.map(u => u.sponsorId))];
            
            const commissionEarnings = allTransactions
                .filter(tx => tx.category === 'referral' && tx.type === 'earning')
                .reduce((sum, tx) => sum + (tx.amount || 0), 0);
            
            const sponsorStats = {
                totalSponsors: uniqueSponsors.length,
                sponsoredUsers: usersWithSponsor.length,
                commissionEarnings: commissionEarnings,
                sponsorConversionRate: registeredUsers.length > 0 ? 
                    ((usersWithSponsor.length / registeredUsers.length) * 100).toFixed(1) : 0,
                updatedAt: new Date().toISOString()
            };
            
            localStorage.setItem('sponsorStats', JSON.stringify(sponsorStats));
        }
    }

    // ✅ INITIALIZE ADMIN PANEL INTEGRATION WITH SPONSOR SYSTEM
    function initializeAdminPanelIntegration() {
        console.log('🚀 Initializing optimized admin panel integration...');
        
        // Step 1: Setup data sync for ALL USERS with sponsor system
        setupAllUsersDataSync();
        
        // Step 2: Check and inject admin button (ONLY for authorized admins)
        checkAndInjectAdminButton();
        
        // Step 3: Initialize sponsor system data
        initializeSponsorSystemData();
        
        // Step 4: Perform initial data sync (delayed)
        setTimeout(() => {
            if (shouldSyncUserData()) {
                syncAllUsersData();
            }
        }, 5000);
        
        console.log('✅ Admin panel integration initialized successfully');
    }

    // ✅ EXPORT FUNCTIONS FOR GLOBAL ACCESS
    if (typeof window !== 'undefined') {
        window.openAdminPanel = openAdminPanel;
        window.isUserAuthorizedForAdminAccess = isUserAuthorizedForAdminAccess;
        window.syncAllUsersData = syncAllUsersData;
        window.injectAdminButton = injectAdminButton;
        window.broadcastAllUsersData = broadcastAllUsersData;
        window.initializeSponsorSystemData = initializeSponsorSystemData;
    }

    // ✅ WAIT FOR APP TO BE READY (Optimized)
    function waitForAppReady() {
        let readyChecks = 0;
        const maxChecks = 30; // 30 seconds max
        
        const checkAppReady = setInterval(() => {
            readyChecks++;
            
            if (typeof getFromStorage === 'function') {
                const currentUser = getFromStorage('currentUser', {});
                
                if (currentUser && Object.keys(currentUser).length > 0) {
                    clearInterval(checkAppReady);
                    initializeAdminPanelIntegration();
                    return;
                }
            }
            
            if (readyChecks >= maxChecks) {
                clearInterval(checkAppReady);
                console.log('⚠️ App ready check timeout, initializing anyway...');
                initializeAdminPanelIntegration();
            }
        }, 1000);
    }

    // ✅ START INITIALIZATION WHEN PAGE LOADS
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(waitForAppReady, 1000);
        });
    } else {
        setTimeout(waitForAppReady, 1000);
    }
}