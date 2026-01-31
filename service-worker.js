// ==========================================
// Service Worker for 漢字テストジェネレーター
// Version: 2.7.34
// PWA対応・オフライン動作・自動更新通知
// ==========================================

const VERSION = '2.7.34';
const CACHE_NAME = `kanji-practice-v${VERSION}`;

// キャッシュするファイルリスト
const STATIC_CACHE_FILES = [
  '/',
  '/index.html',
  '/practice.html',
  '/editor.html',
  '/app.js',
  '/practice.js',
  '/editor.js',
  '/style.css',
  '/practice.css',
  '/manifest.json'
];

// データファイル（JSONファイル）
const DATA_CACHE_FILES = [
  '/data/grade1_kanji.json',
  '/data/grade2_kanji.json',
  '/data/grade3_kanji.json',
  '/data/grade4_kanji.json',
  '/data/grade5_kanji.json',
  '/data/grade6_kanji.json'
];

// アイコンファイル
const ICON_CACHE_FILES = [
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png'
];

// 全キャッシュファイル
const ALL_CACHE_FILES = [
  ...STATIC_CACHE_FILES,
  ...DATA_CACHE_FILES,
  ...ICON_CACHE_FILES
];

// ==========================================
// インストール：キャッシュを作成
// ==========================================
self.addEventListener('install', (event) => {
  console.log(`[Service Worker] インストール中... (v${VERSION})`);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] キャッシュを作成');
        return cache.addAll(ALL_CACHE_FILES);
      })
      .then(() => {
        console.log('[Service Worker] インストール完了');
        return self.skipWaiting(); // 即座にアクティブ化
      })
      .catch((error) => {
        console.error('[Service Worker] インストールエラー:', error);
      })
  );
});

// ==========================================
// アクティベート：古いキャッシュを削除
// ==========================================
self.addEventListener('activate', (event) => {
  console.log(`[Service Worker] アクティベート中... (v${VERSION})`);
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[Service Worker] 古いキャッシュを削除:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] アクティベート完了');
        return self.clients.claim(); // すべてのクライアントを即座に制御
      })
  );
});

// ==========================================
// フェッチ：キャッシュ優先（オフライン対応）
// ==========================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Chrome拡張機能のリクエストは無視
  if (url.protocol === 'chrome-extension:') {
    return;
  }
  
  // Google Fonts などの外部リソースは常にネットワークから取得
  if (!url.origin.includes(self.location.origin)) {
    event.respondWith(fetch(request));
    return;
  }
  
  // キャッシュ優先戦略（Cache First）
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log('[Service Worker] キャッシュから取得:', request.url);
          
          // バックグラウンドでネットワークから更新を試みる
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(request, networkResponse.clone());
                });
              }
            })
            .catch(() => {
              // ネットワークエラーは無視（キャッシュを返す）
            });
          
          return cachedResponse;
        }
        
        // キャッシュになければネットワークから取得
        console.log('[Service Worker] ネットワークから取得:', request.url);
        return fetch(request)
          .then((networkResponse) => {
            // 成功したらキャッシュに保存
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // オフライン時のフォールバック
            if (request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            return new Response('オフラインです', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain; charset=UTF-8'
              })
            });
          });
      })
  );
});

// ==========================================
// メッセージ受信：アップデート処理
// ==========================================
self.addEventListener('message', (event) => {
  console.log('[Service Worker] メッセージ受信:', event.data);
  
  // 即座にアクティブ化
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[Service Worker] 即座にアクティブ化');
    self.skipWaiting();
  }
  
  // キャッシュをクリア
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => caches.delete(cacheName))
          );
        })
        .then(() => {
          console.log('[Service Worker] すべてのキャッシュをクリアしました');
          return self.clients.claim();
        })
    );
  }
  
  // バージョン情報を返す
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: VERSION });
  }
});

// ==========================================
// プッシュ通知（将来の拡張用）
// ==========================================
self.addEventListener('push', (event) => {
  console.log('[Service Worker] プッシュ通知受信:', event);
  
  if (event.data) {
    const data = event.data.json();
    const title = data.title || '漢字テストジェネレーター';
    const options = {
      body: data.body || '新しい通知があります',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [200, 100, 200],
      data: {
        url: data.url || '/'
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  }
});

// ==========================================
// 通知クリック
// ==========================================
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] 通知クリック:', event);
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // 既に開いているタブがあればフォーカス
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // なければ新しいタブを開く
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

console.log(`[Service Worker] 読み込み完了 (v${VERSION})`);
