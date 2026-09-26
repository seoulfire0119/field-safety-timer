// 서비스 워커 - 오프라인 지원 및 캐싱
const CACHE_NAME = 'field-safety-timer-v1.0.5';
const CACHE_URLS = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/intro.js',
    '/image/intro-1.jpg',
    '/firebase-config.js',
    '/manifest.json',
    '/icon-192x192.png',
    '/icon-144x144.png',
    '/favicon.ico'
];

// 설치 이벤트 - 캐시 생성
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching app shell...');
                return cache.addAll(CACHE_URLS);
            })
            .catch((error) => {
                console.error('Cache installation failed:', error);
            })
    );
    self.skipWaiting();
});

// 활성화 이벤트 - 이전 캐시 정리
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// 페치 이벤트 - 네트워크 요청 처리 (Cache First 전략)
self.addEventListener('fetch', (event) => {
    // chrome-extension, moz-extension 등 지원하지 않는 스키마는 무시
    if (!event.request.url.startsWith('http')) {
        return;
    }

    // Firebase API 요청은 네트워크 우선
    if (event.request.url.includes('firestore.googleapis.com') ||
        event.request.url.includes('firebase')) {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    // 네트워크 실패시 오프라인 응답
                    return new Response(JSON.stringify({
                        error: 'offline',
                        message: 'Firebase 연결 불가 - 오프라인 모드'
                    }), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                })
        );
        return;
    }

    // 일반 리소스는 캐시 우선
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // 캐시에 있으면 반환
                if (response) {
                    return response;
                }

                // 캐시에 없으면 네트워크 요청
                return fetch(event.request)
                    .then((response) => {
                        // 응답이 유효하지 않으면 그대로 반환
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // HTTP 요청만 캐시에 저장
                        if (event.request.url.startsWith('http')) {
                            const responseToCache = response.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseToCache);
                                })
                                .catch((error) => {
                                    console.warn('Cache put failed:', error);
                                });
                        }

                        return response;
                    })
                    .catch(() => {
                        // 네트워크 요청 실패시 기본 오프라인 페이지 반환
                        if (event.request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});

// 백그라운드 동기화 (선택사항)
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        console.log('Background sync triggered');
        event.waitUntil(
            // 여기서 Firebase와 로컬 데이터 동기화 수행
            syncData()
        );
    }
});

// 푸시 알림 처리
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body || '소방관 현장 진입 타이머 알림',
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            vibrate: [200, 100, 200],
            requireInteraction: true,
            actions: [
                {
                    action: 'view',
                    title: '확인',
                    icon: '/icon-192x192.png'
                },
                {
                    action: 'dismiss',
                    title: '닫기'
                }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(data.title || '현장 진입 타이머', options)
        );
    }
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'view' || !event.action) {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// 메시지 이벤트 처리 (앱과 서비스 워커 간 통신)
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// 데이터 동기화 함수
async function syncData() {
    try {
        // 여기서 로컬 스토리지와 Firebase 간 데이터 동기화 로직 구현
        console.log('Syncing data in background...');

        // 실제 구현에서는 Firebase와 로컬 데이터 비교 및 동기화
        // 예: 로컬에만 있는 데이터를 Firebase에 업로드
        // 예: Firebase에 새로운 데이터가 있으면 로컬에 다운로드

        return Promise.resolve();
    } catch (error) {
        console.error('Background sync failed:', error);
        return Promise.reject(error);
    }
}

// 에러 이벤트 처리
self.addEventListener('error', (event) => {
    console.error('Service Worker error:', event.error);
});

// 처리되지 않은 Promise 거부 처리
self.addEventListener('unhandledrejection', (event) => {
    console.error('Service Worker unhandled rejection:', event.reason);
});

console.log('Service Worker loaded successfully');