/* ========================================
   STEP 11: MOBILE APP INTEGRATION
   - PWA installation ✅
   - Mobile navigation ✅
   - Touch gestures ✅
   - Offline detection ✅
   - Push notifications ✅
======================================== */

// Mobile App State
let mobileAppState = {
    isInstalled: false,
    isOnline: navigator.onLine,
    deferredPrompt: null,
    notificationsEnabled: false,
    touchStartX: 0,
    touchStartY: 0,
    touchEndX: 0,
    touchEndY: 0
};

// ⭐ Initialize Mobile App
function initMobileApp() {
    console.log('📱 Initializing Mobile App...');
    
    // Register service worker
    registerServiceWorker();
    
    // Setup PWA install prompt
    setupPWAInstall();
    
    // Setup mobile navigation
    setupMobileNavigation();
    
    // Setup touch gestures
    setupTouchGestures();
    
    // Setup offline detection
    setupOfflineDetection();
    
    // Setup push notifications
    setupPushNotifications();
    
    // Setup mobile-specific UI
    setupMobileUI();
    
    // Check if running as PWA
    checkPWAMode();
    
    console.log('✅ Mobile App initialized');
}

// ⭐ Register Service Worker
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/service-worker.js');
            console.log('✅ Service Worker registered:', registration.scope);
            
            // Check for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                console.log('🔄 Service Worker: Update found');
                
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New service worker available
                        showUpdateNotification();
                    }
                });
            });
            
            // Handle controller change
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('🔄 Service Worker: Controller changed');
                window.location.reload();
            });
            
        } catch (error) {
            console.error('❌ Service Worker registration failed:', error);
        }
    } else {
        console.log('⚠️ Service Worker not supported');
    }
}

// ⭐ Setup PWA Install
function setupPWAInstall() {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('📱 PWA: Install prompt available');
        
        // Prevent default prompt
        e.preventDefault();
        
        // Store the event
        mobileAppState.deferredPrompt = e;
        
        // Show custom install button
        showInstallButton();
    });
    
    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
        console.log('✅ PWA: App installed');
        mobileAppState.isInstalled = true;
        mobileAppState.deferredPrompt = null;
        hideInstallButton();
        
        if (window.showAlert) {
            window.showAlert('AgriSense installed successfully! 🎉', 'success');
        }
    });
}

// ⭐ Show Install Button
function showInstallButton() {
    const installBtn = document.getElementById('pwaInstallBtn');
    if (installBtn) {
        installBtn.style.display = 'flex';
        installBtn.onclick = installPWA;
    } else {
        // Create install button if it doesn't exist
        const btn = document.createElement('button');
        btn.id = 'pwaInstallBtn';
        btn.className = 'pwa-install-btn';
        btn.innerHTML = '<i class="fa-solid fa-download"></i> Install App';
        btn.onclick = installPWA;
        document.body.appendChild(btn);
    }
}

// ⭐ Hide Install Button
function hideInstallButton() {
    const installBtn = document.getElementById('pwaInstallBtn');
    if (installBtn) {
        installBtn.style.display = 'none';
    }
}

// ⭐ Install PWA
async function installPWA() {
    if (!mobileAppState.deferredPrompt) {
        console.log('⚠️ PWA: No install prompt available');
        return;
    }
    
    // Show the install prompt
    mobileAppState.deferredPrompt.prompt();
    
    // Wait for user response
    const { outcome } = await mobileAppState.deferredPrompt.userChoice;
    console.log(`📱 PWA: User response: ${outcome}`);
    
    // Clear the deferred prompt
    mobileAppState.deferredPrompt = null;
    hideInstallButton();
}

// ⭐ Setup Mobile Navigation
function setupMobileNavigation() {
    // Create mobile bottom navigation
    const bottomNav = document.createElement('div');
    bottomNav.id = 'mobileBottomNav';
    bottomNav.className = 'mobile-bottom-nav';
    bottomNav.innerHTML = `
        <button class="nav-item" data-target="#dashboardSection">
            <i class="fa-solid fa-gauge"></i>
            <span>Dashboard</span>
        </button>
        <button class="nav-item" data-target="#analyticsSection">
            <i class="fa-solid fa-chart-line"></i>
            <span>Analytics</span>
        </button>
        <button class="nav-item" data-target="#aiSection">
            <i class="fa-solid fa-robot"></i>
            <span>AI Chat</span>
        </button>
        <button class="nav-item" data-target="#mapSection">
            <i class="fa-solid fa-map"></i>
            <span>Map</span>
        </button>
        <button class="nav-item" onclick="toggleMobileMenu()">
            <i class="fa-solid fa-bars"></i>
            <span>More</span>
        </button>
    `;
    
    // Add to body if mobile
    if (window.innerWidth <= 768) {
        document.body.appendChild(bottomNav);
        
        // Add click handlers
        bottomNav.querySelectorAll('.nav-item[data-target]').forEach(btn => {
            btn.addEventListener('click', () => {
                const target = document.querySelector(btn.dataset.target);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    
                    // Update active state
                    bottomNav.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                }
            });
        });
    }
}

// ⭐ Toggle Mobile Menu
window.toggleMobileMenu = function() {
    const menu = document.getElementById('mobileMenu');
    if (!menu) {
        createMobileMenu();
    } else {
        menu.classList.toggle('active');
    }
};

// ⭐ Create Mobile Menu
function createMobileMenu() {
    const menu = document.createElement('div');
    menu.id = 'mobileMenu';
    menu.className = 'mobile-menu active';
    menu.innerHTML = `
        <div class="mobile-menu-header">
            <h3>Menu</h3>
            <button onclick="toggleMobileMenu()" class="close-btn">
                <i class="fa-solid fa-times"></i>
            </button>
        </div>
        <div class="mobile-menu-content">
            <a href="#dashboardSection" class="menu-link">
                <i class="fa-solid fa-gauge"></i> Dashboard
            </a>
            <a href="#analyticsSection" class="menu-link">
                <i class="fa-solid fa-chart-line"></i> Analytics
            </a>
            <a href="#aiSection" class="menu-link">
                <i class="fa-solid fa-robot"></i> AI Assistant
            </a>
            <a href="#mapSection" class="menu-link">
                <i class="fa-solid fa-map"></i> Map
            </a>
            <a href="#forecastSection" class="menu-link">
                <i class="fa-solid fa-cloud-sun"></i> Weather
            </a>
            <button onclick="requestNotificationPermission()" class="menu-btn">
                <i class="fa-solid fa-bell"></i> Enable Notifications
            </button>
            <button onclick="clearAppCache()" class="menu-btn">
                <i class="fa-solid fa-trash"></i> Clear Cache
            </button>
            <button onclick="shareApp()" class="menu-btn">
                <i class="fa-solid fa-share"></i> Share App
            </button>
        </div>
    `;
    document.body.appendChild(menu);
    
    // Close menu when clicking links
    menu.querySelectorAll('.menu-link').forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.remove('active');
        });
    });
}

// ⭐ Setup Touch Gestures
function setupTouchGestures() {
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
}

function handleTouchStart(e) {
    mobileAppState.touchStartX = e.changedTouches[0].screenX;
    mobileAppState.touchStartY = e.changedTouches[0].screenY;
}

function handleTouchEnd(e) {
    mobileAppState.touchEndX = e.changedTouches[0].screenX;
    mobileAppState.touchEndY = e.changedTouches[0].screenY;
    handleSwipeGesture();
}

function handleSwipeGesture() {
    const deltaX = mobileAppState.touchEndX - mobileAppState.touchStartX;
    const deltaY = mobileAppState.touchEndY - mobileAppState.touchStartY;
    
    // Horizontal swipe
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
            console.log('👉 Swipe right');
            // Handle swipe right
        } else {
            console.log('👈 Swipe left');
            // Handle swipe left
        }
    }
    
    // Vertical swipe
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
        if (deltaY > 0) {
            console.log('👇 Swipe down');
            // Handle swipe down - refresh
            if (window.scrollY === 0) {
                refreshData();
            }
        } else {
            console.log('👆 Swipe up');
            // Handle swipe up
        }
    }
}

// ⭐ Setup Offline Detection
function setupOfflineDetection() {
    window.addEventListener('online', () => {
        console.log('✅ Back online');
        mobileAppState.isOnline = true;
        showOnlineStatus();
        syncOfflineData();
    });
    
    window.addEventListener('offline', () => {
        console.log('⚠️ Gone offline');
        mobileAppState.isOnline = false;
        showOfflineStatus();
    });
    
    // Initial status
    if (!navigator.onLine) {
        showOfflineStatus();
    }
}

// ⭐ Show Online Status
function showOnlineStatus() {
    if (window.showAlert) {
        window.showAlert('Back online! Data syncing...', 'success');
    }
    
    // Remove offline indicator
    const indicator = document.getElementById('offlineIndicator');
    if (indicator) {
        indicator.remove();
    }
}

// ⭐ Show Offline Status
function showOfflineStatus() {
    if (window.showAlert) {
        window.showAlert('You are offline. Some features may be limited.', 'warning');
    }
    
    // Add offline indicator
    if (!document.getElementById('offlineIndicator')) {
        const indicator = document.createElement('div');
        indicator.id = 'offlineIndicator';
        indicator.className = 'offline-indicator';
        indicator.innerHTML = '<i class="fa-solid fa-wifi-slash"></i> Offline Mode';
        document.body.appendChild(indicator);
    }
}

// ⭐ Sync Offline Data
async function syncOfflineData() {
    if ('serviceWorker' in navigator && 'sync' in self.registration) {
        try {
            const registration = await navigator.serviceWorker.ready;
            await registration.sync.register('sync-sensor-data');
            console.log('🔄 Background sync registered');
        } catch (error) {
            console.error('❌ Background sync failed:', error);
        }
    }
}

// ⭐ Setup Push Notifications
async function setupPushNotifications() {
    if (!('Notification' in window)) {
        console.log('⚠️ Notifications not supported');
        return;
    }
    
    // Check current permission
    if (Notification.permission === 'granted') {
        mobileAppState.notificationsEnabled = true;
        console.log('✅ Notifications already enabled');
    }
}

// ⭐ Request Notification Permission
window.requestNotificationPermission = async function() {
    if (!('Notification' in window)) {
        alert('Notifications are not supported on this device');
        return;
    }
    
    try {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            mobileAppState.notificationsEnabled = true;
            console.log('✅ Notification permission granted');
            
            if (window.showAlert) {
                window.showAlert('Notifications enabled! You will receive alerts.', 'success');
            }
            
            // Subscribe to push notifications
            subscribeToPushNotifications();
        } else {
            console.log('⚠️ Notification permission denied');
            if (window.showAlert) {
                window.showAlert('Notification permission denied', 'warning');
            }
        }
    } catch (error) {
        console.error('❌ Notification permission error:', error);
    }
};

// ⭐ Subscribe to Push Notifications
async function subscribeToPushNotifications() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
            const registration = await navigator.serviceWorker.ready;
            
            // Check if already subscribed
            const existingSubscription = await registration.pushManager.getSubscription();
            if (existingSubscription) {
                console.log('✅ Already subscribed to push notifications');
                return;
            }
            
            // Subscribe
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array('YOUR_PUBLIC_VAPID_KEY_HERE')
            });
            
            console.log('✅ Subscribed to push notifications:', subscription);
            
            // Send subscription to server
            await sendSubscriptionToServer(subscription);
            
        } catch (error) {
            console.error('❌ Push subscription failed:', error);
        }
    }
}

// ⭐ Send Subscription to Server
async function sendSubscriptionToServer(subscription) {
    try {
        const response = await fetch('/api/push-subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subscription)
        });
        
        if (response.ok) {
            console.log('✅ Subscription sent to server');
        }
    } catch (error) {
        console.error('❌ Failed to send subscription:', error);
    }
}

// ⭐ Helper: Convert VAPID key
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// ⭐ Setup Mobile UI
function setupMobileUI() {
    // Add mobile-specific classes
    if (window.innerWidth <= 768) {
        document.body.classList.add('mobile-view');
        
        // Adjust viewport for mobile
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }
        
        // Add pull-to-refresh indicator
        addPullToRefresh();
    }
}

// ⭐ Add Pull to Refresh
function addPullToRefresh() {
    let startY = 0;
    let pulling = false;
    
    document.addEventListener('touchstart', (e) => {
        if (window.scrollY === 0) {
            startY = e.touches[0].pageY;
            pulling = true;
        }
    }, { passive: true });
    
    document.addEventListener('touchmove', (e) => {
        if (pulling && window.scrollY === 0) {
            const currentY = e.touches[0].pageY;
            const pullDistance = currentY - startY;
            
            if (pullDistance > 80) {
                showRefreshIndicator();
            }
        }
    }, { passive: true });
    
    document.addEventListener('touchend', () => {
        if (pulling) {
            pulling = false;
            const indicator = document.getElementById('refreshIndicator');
            if (indicator) {
                refreshData();
                setTimeout(() => {
                    indicator.remove();
                }, 1000);
            }
        }
    }, { passive: true });
}

// ⭐ Show Refresh Indicator
function showRefreshIndicator() {
    if (!document.getElementById('refreshIndicator')) {
        const indicator = document.createElement('div');
        indicator.id = 'refreshIndicator';
        indicator.className = 'refresh-indicator';
        indicator.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Refreshing...';
        document.body.insertBefore(indicator, document.body.firstChild);
    }
}

// ⭐ Refresh Data
function refreshData() {
    console.log('🔄 Refreshing data...');
    
    // Refresh sensor data
    if (window.fetchSensorData) {
        window.fetchSensorData();
    }
    
    // Refresh weather data
    if (window.refreshWeather) {
        window.refreshWeather();
    }
    
    // Refresh market data
    if (window.refreshMarketData) {
        window.refreshMarketData();
    }
    
    if (window.showAlert) {
        window.showAlert('Data refreshed!', 'success');
    }
}

// ⭐ Check PWA Mode
function checkPWAMode() {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        window.navigator.standalone ||
                        document.referrer.includes('android-app://');
    
    if (isStandalone) {
        console.log('✅ Running as PWA');
        document.body.classList.add('pwa-mode');
        mobileAppState.isInstalled = true;
    } else {
        console.log('📱 Running in browser');
    }
}

// ⭐ Clear App Cache
window.clearAppCache = async function() {
    if (confirm('Clear all cached data? This will reload the app.')) {
        try {
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(cacheNames.map(name => caches.delete(name)));
                console.log('✅ Cache cleared');
            }
            
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.ready;
                await registration.unregister();
                console.log('✅ Service worker unregistered');
            }
            
            window.location.reload();
        } catch (error) {
            console.error('❌ Failed to clear cache:', error);
        }
    }
};

// ⭐ Share App
window.shareApp = async function() {
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'AgriSense - Smart Farming',
                text: 'Check out this amazing IoT precision agriculture system!',
                url: window.location.href
            });
            console.log('✅ App shared successfully');
        } catch (error) {
            console.log('⚠️ Share cancelled or failed:', error);
        }
    } else {
        // Fallback - copy link
        navigator.clipboard.writeText(window.location.href);
        if (window.showAlert) {
            window.showAlert('Link copied to clipboard!', 'success');
        }
    }
};

// ⭐ Show Update Notification
function showUpdateNotification() {
    if (window.showAlert) {
        const updateBtn = document.createElement('button');
        updateBtn.textContent = 'Update Now';
        updateBtn.onclick = () => {
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({ action: 'skipWaiting' });
            }
        };
        
        window.showAlert('New version available! Click to update.', 'info');
    }
}

// ⭐ Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initMobileApp();
});

// Export for global access
window.mobileApp = {
    getState: () => mobileAppState,
    installPWA,
    requestNotificationPermission: window.requestNotificationPermission,
    clearCache: window.clearAppCache,
    shareApp: window.shareApp,
    refreshData
};

console.log('✅ Mobile App Module Loaded');
