// Service Worker for 漢字テストジェネレーター
// Version 1.1.0 - 細長い画面対応

const CACHE_NAME = 'kanji-test-v1.1.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/practice.html',
  '/editor.html',
  '/app.js',
  '/practice.js',
  '/style.css',
  '/practice.css',
  '/data/grade1_kanji.json',
  '/data/grade2_kanji.json',
  '/data/grade3_kanji.json',
  '/data/grade4_kanji.json',
  '/data/grade5_kanji.json',
  '/data/grade6_kanji.json',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap'
];

// インストール時：キャッシュを作成
self.addEventListener('install', event => {
  console.log('[Service Worker] インストール中...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] キャッシュを作成');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// アクティベート時：古いキャッシュを削除
self.addEventListener('activate', event => {
  console.log('[Service Worker] アクティベート中...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] 古いキャッシュを削除:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// フェッチ時：ネットワーク優先（常に最新を取得）、失敗したらキャッシュ
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // ネットワークから取得できたら、キャッシュに保存
        if (response && response.status === 200) {
          console.log('[Service Worker] ネットワークから取得:', event.request.url);
          
          // Chrome拡張機能のリクエストはキャッシュしない
          if (!event.request.url.startsWith('chrome-extension://')) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
        }
        return response;
      })
      .catch(() => {
        // ネットワークエラーの場合はキャッシュから取得
        return caches.match(event.request).then(response => {
          if (response) {
            console.log('[Service Worker] キャッシュから取得（オフライン）:', event.request.url);
            return response;
          }
          // オフライン時のフォールバック
          return caches.match('/index.html');
        });
      })
  );
});

// メッセージ受信時：キャッシュをクリア
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }).then(() => {
        console.log('[Service Worker] すべてのキャッシュをクリアしました');
        return self.clients.claim();
      })
    );
  }
});
