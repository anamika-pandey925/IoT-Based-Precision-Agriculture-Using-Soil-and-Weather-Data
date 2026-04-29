/* ========================================
   STEP 11: SERVICE WORKER FOR PWA
   - Offline functionality ✅
   - Cache management ✅
   - Background sync ✅
   - Push notifications ✅
======================================== */

const CACHE_NAME = 'agrisense-v1.0.0';
const RUNTIME_CACHE = 'agrisense-runtime-v1.0.0';

// Assets to cache on install
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/motor_control.css',
    '/script.js',
    '/sensor_integration.js',
    '/motor_control.js',
    '/alert_system.js',
    '/animal_detection.js',
    '/weather_farming.js',
    '/profit_market.js',
    '/overflow_recovery.js',
    '/manifest.json',
    '/images/soil.png',
    '/images/temp.png',
    '/images/humidity.png',
    '/images/motor.png',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Service Worker: Caching app shell');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .then(() => {
                console.log('✅ Service Worker: Installed successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Service Worker: Install failed', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('🚀 Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
                            console.log('🗑️ Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker: Activated successfully');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }
    
    // API requests - network first, cache fallback
    if (event.request.url.includes('/data') || 
        event.request.url.includes('/api/') ||
        event.request.url.includes('/motor/') ||
        event.request.url.includes('/buzzer/')) {
        
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Clone response and cache it
                    const responseClone = response.clone();
                    caches.open(RUNTIME_CACHE).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    // Return cached response if network fails
                    return caches.match(event.request);
                })
        );
        return;
    }
    
    // Static assets - cache first, network fallback
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                return fetch(event.request)
                    .then((response) => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type === 'error') {
                            return response;
                        }
                        
                        // Clone and cache the response
                        const responseClone = response.clone();
                        caches.open(RUNTIME_CACHE).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                        
                        return response;
                    });
            })
            .catch((error) => {
                console.error('❌ Service Worker: Fetch failed', error);
                
                // Return offline page for navigation requests
                if (event.request.mode === 'navigate') {
                    return caches.match('/index.html');
                }
            })
    );
});

// Background sync event
self.addEventListener('sync', (event) => {
    console.log('🔄 Service Worker: Background sync', event.tag);
    
    if (event.tag === 'sync-sensor-data') {
        event.waitUntil(syncSensorData());
    }
});

// Push notification event
self.addEventListener('push', (event) => {
    console.log('🔔 Service Worker: Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'New update from AgriSense',
        icon: '/images/soil.png',
        badge: '/images/soil.png',
        vibrate: [200, 100, 200],
        tag: 'agrisense-notification',
        requireInteraction: false,
        actions: [
            {
                action: 'view',
                title: 'View Dashboard',
                icon: '/images/soil.png'
            },
            {
                action: 'dismiss',
                title: 'Dismiss',
                icon: '/images/soil.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('AgriSense Alert', options)
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    console.log('👆 Service Worker: Notification clicked', event.action);
    
    event.notification.close();
    
    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Message event - communicate with main app
self.addEventListener('message', (event) => {
    console.log('💬 Service Worker: Message received', event.data);
    
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
    
    if (event.data.action === 'clearCache') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => caches.delete(cacheName))
                );
            })
        );
    }
});

// Helper function to sync sensor data
async function syncSensorData() {
    try {
        const response = await fetch('/data');
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Service Worker: Sensor data synced', data);
            
            // Send notification if critical values detected
            if (data.moisture < 30) {
                await self.registration.showNotification('Low Soil Moisture', {
                    body: `Soil moisture is ${data.moisture}%. Consider irrigation.`,
                    icon: '/images/soil.png',
                    badge: '/images/soil.png',
                    vibrate: [200, 100, 200]
                });
            }
        }
    } catch (error) {
        console.error('❌ Service Worker: Sync failed', error);
    }
}

console.log('✅ Service Worker: Script loaded');
