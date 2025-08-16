// ===== SERVICE WORKER FOR JOOCOURSES =====

const CACHE_NAME = 'joocourses-v1.0.0';
const STATIC_CACHE = 'joocourses-static-v1.0.0';
const DYNAMIC_CACHE = 'joocourses-dynamic-v1.0.0';
const IMAGE_CACHE = 'joocourses-images-v1.0.0';
const CLOUDINARY_CACHE = 'joocourses-cloudinary-v1.0.0';

// Files to cache immediately
const STATIC_ASSETS = [
    '/',
    '/css/main.css',
    '/css/variables.css',
    '/css/base.css',
    '/css/components.css',
    '/css/forms.css',
    '/css/utilities.css',
    '/css/responsive.css',
    '/js/main.js',
    '/js/api.js',
    '/js/ui.js',
    '/js/validation.js',
    '/images/logo.png',
    '/images/hero-bg.jpg',
    '/manifest.json',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// Routes that should always be fetched from network
const NETWORK_FIRST_ROUTES = [
    '/api/',
    '/auth/',
    '/admin/'
];

// Routes that can be cached
const CACHE_FIRST_ROUTES = [
    '/courses',
    '/instructors',
    '/about',
    '/contact'
];

// Image patterns for caching
const IMAGE_PATTERNS = [
    /\.(jpg|jpeg|png|gif|webp|svg)$/i,
    /\/uploads\//,
    /\/images\//,
    /cloudinary\.com/
];

// Cache configuration
const CACHE_CONFIG = {
    images: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        maxEntries: 200
    },
    cloudinary: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        maxEntries: 100
    },
    static: {
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        maxEntries: 50
    }
};

// ===== INSTALL EVENT =====
self.addEventListener('install', function(event) {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(function(cache) {
                console.log('Caching static assets...');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(function() {
                console.log('Static assets cached successfully');
                return self.skipWaiting();
            })
            .catch(function(error) {
                console.error('Error caching static assets:', error);
            })
    );
});

// ===== ACTIVATE EVENT =====
self.addEventListener('activate', function(event) {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        caches.keys()
            .then(function(cacheNames) {
                return Promise.all(
                    cacheNames.map(function(cacheName) {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(function() {
                console.log('Service Worker activated');
                return self.clients.claim();
            })
    );
});

// ===== FETCH EVENT =====
self.addEventListener('fetch', function(event) {
    const request = event.request;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip chrome-extension and other non-http requests
    if (!url.protocol.startsWith('http')) {
        return;
    }
    
    // Determine caching strategy based on URL
    if (isImageRequest(request)) {
        event.respondWith(handleImageRequest(request));
    } else if (isNetworkFirstRoute(url.pathname)) {
        event.respondWith(networkFirst(request));
    } else if (isCacheFirstRoute(url.pathname)) {
        event.respondWith(cacheFirst(request));
    } else if (isStaticAsset(url.pathname)) {
        event.respondWith(cacheFirst(request));
    } else {
        event.respondWith(staleWhileRevalidate(request));
    }
});

// ===== CACHING STRATEGIES =====

// Network First - for API calls and dynamic content
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('Network failed, trying cache:', request.url);
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
            return caches.match('/offline.html');
        }
        
        throw error;
    }
}

// Cache First - for static assets and rarely changing content
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('Cache first failed:', error);
        throw error;
    }
}

// Stale While Revalidate - for content that can be stale
async function staleWhileRevalidate(request) {
    const cachedResponse = await caches.match(request);
    
    const fetchPromise = fetch(request).then(function(networkResponse) {
        if (networkResponse.ok) {
            const cache = caches.open(DYNAMIC_CACHE);
            cache.then(function(cache) {
                cache.put(request, networkResponse.clone());
            });
        }
        return networkResponse;
    }).catch(function(error) {
        console.log('Network request failed:', error);
        return cachedResponse;
    });
    
    return cachedResponse || fetchPromise;
}

// ===== IMAGE HANDLING =====

// Handle image requests with optimized caching
async function handleImageRequest(request) {
    const url = new URL(request.url);

    // Determine cache based on image source
    const cacheName = url.hostname.includes('cloudinary.com') ? CLOUDINARY_CACHE : IMAGE_CACHE;
    const config = url.hostname.includes('cloudinary.com') ? CACHE_CONFIG.cloudinary : CACHE_CONFIG.images;

    try {
        // Try cache first for images
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
            // Check if cached image is still fresh
            const cachedDate = new Date(cachedResponse.headers.get('date') || 0);
            const now = new Date();

            if (now - cachedDate < config.maxAge) {
                return cachedResponse;
            }
        }

        // Fetch from network
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            // Clone response for caching
            const responseToCache = networkResponse.clone();

            // Cache the image
            const cache = await caches.open(cacheName);
            await cache.put(request, responseToCache);

            // Clean up old entries
            await cleanupImageCache(cacheName, config.maxEntries);
        }

        return networkResponse;

    } catch (error) {
        console.log('Image fetch failed, trying cache:', request.url);

        // Return cached version if available
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // Return default image if available
        return await getDefaultImage(request);
    }
}

// Clean up old cache entries
async function cleanupImageCache(cacheName, maxEntries) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();

    if (keys.length > maxEntries) {
        // Sort by date and remove oldest entries
        const entries = await Promise.all(
            keys.map(async (key) => {
                const response = await cache.match(key);
                const date = new Date(response.headers.get('date') || 0);
                return { key, date };
            })
        );

        entries.sort((a, b) => a.date - b.date);
        const toDelete = entries.slice(0, keys.length - maxEntries);

        await Promise.all(
            toDelete.map(entry => cache.delete(entry.key))
        );
    }
}

// Get default image for failed requests
async function getDefaultImage(request) {
    const url = new URL(request.url);
    const pathname = url.pathname.toLowerCase();

    let defaultPath = '/images/defaults/course-placeholder.svg';

    if (pathname.includes('user') || pathname.includes('profile') || pathname.includes('avatar')) {
        defaultPath = '/images/defaults/user-placeholder.svg';
    } else if (pathname.includes('video') || pathname.includes('thumbnail')) {
        defaultPath = '/images/defaults/video-placeholder.svg';
    }

    try {
        const defaultRequest = new Request(defaultPath);
        const cachedDefault = await caches.match(defaultRequest);

        if (cachedDefault) {
            return cachedDefault;
        }

        const defaultResponse = await fetch(defaultRequest);
        if (defaultResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(defaultRequest, defaultResponse.clone());
            return defaultResponse;
        }
    } catch (error) {
        console.warn('Failed to load default image:', error);
    }

    // Return empty response if all else fails
    return new Response('', { status: 404 });
}

// Check if request is for an image
function isImageRequest(request) {
    const url = new URL(request.url);
    return IMAGE_PATTERNS.some(pattern => {
        if (pattern instanceof RegExp) {
            return pattern.test(url.pathname) || pattern.test(url.hostname);
        }
        return url.pathname.includes(pattern);
    });
}

// ===== HELPER FUNCTIONS =====
function isNetworkFirstRoute(pathname) {
    return NETWORK_FIRST_ROUTES.some(route => pathname.startsWith(route));
}

function isCacheFirstRoute(pathname) {
    return CACHE_FIRST_ROUTES.some(route => pathname.startsWith(route));
}

function isStaticAsset(pathname) {
    const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2'];
    return staticExtensions.some(ext => pathname.endsWith(ext));
}

// ===== BACKGROUND SYNC =====
self.addEventListener('sync', function(event) {
    console.log('Background sync triggered:', event.tag);
    
    if (event.tag === 'course-progress-sync') {
        event.waitUntil(syncCourseProgress());
    } else if (event.tag === 'analytics-sync') {
        event.waitUntil(syncAnalytics());
    }
});

async function syncCourseProgress() {
    try {
        // Get stored progress data
        const progressData = await getStoredData('course-progress');
        
        if (progressData && progressData.length > 0) {
            for (const progress of progressData) {
                await fetch('/api/courses/progress', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(progress)
                });
            }
            
            // Clear stored data after successful sync
            await clearStoredData('course-progress');
            console.log('Course progress synced successfully');
        }
    } catch (error) {
        console.error('Error syncing course progress:', error);
    }
}

async function syncAnalytics() {
    try {
        const analyticsData = await getStoredData('analytics');
        
        if (analyticsData && analyticsData.length > 0) {
            await fetch('/api/analytics/batch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ events: analyticsData })
            });
            
            await clearStoredData('analytics');
            console.log('Analytics data synced successfully');
        }
    } catch (error) {
        console.error('Error syncing analytics:', error);
    }
}

// ===== PUSH NOTIFICATIONS =====
self.addEventListener('push', function(event) {
    console.log('Push notification received');
    
    const options = {
        body: 'You have new updates on JooCourses',
        icon: '/images/icon-192x192.png',
        badge: '/images/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View Updates',
                icon: '/images/checkmark.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/images/xmark.png'
            }
        ]
    };
    
    if (event.data) {
        const data = event.data.json();
        options.body = data.body || options.body;
        options.title = data.title || 'JooCourses';
        options.data = { ...options.data, ...data };
    }
    
    event.waitUntil(
        self.registration.showNotification('JooCourses', options)
    );
});

// ===== NOTIFICATION CLICK =====
self.addEventListener('notificationclick', function(event) {
    console.log('Notification clicked:', event.notification.tag);
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/dashboard')
        );
    } else if (event.action === 'close') {
        // Just close the notification
    } else {
        // Default action - open the app
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// ===== INDEXEDDB HELPERS =====
async function getStoredData(storeName) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('JooCoursesDB', 1);
        
        request.onerror = () => reject(request.error);
        
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const getAllRequest = store.getAll();
            
            getAllRequest.onsuccess = () => resolve(getAllRequest.result);
            getAllRequest.onerror = () => reject(getAllRequest.error);
        };
        
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
            }
        };
    });
}

async function clearStoredData(storeName) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('JooCoursesDB', 1);
        
        request.onerror = () => reject(request.error);
        
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const clearRequest = store.clear();
            
            clearRequest.onsuccess = () => resolve();
            clearRequest.onerror = () => reject(clearRequest.error);
        };
    });
}

// ===== MESSAGE HANDLING =====
self.addEventListener('message', function(event) {
    console.log('Service Worker received message:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// ===== ERROR HANDLING =====
self.addEventListener('error', function(event) {
    console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', function(event) {
    console.error('Service Worker unhandled rejection:', event.reason);
});
