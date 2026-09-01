// Service Worker：通知 + 離線快取（stale-while-revalidate）
// 頁面 JS 每次載入都用 new Date() 算即時課表，快取的 HTML/JS 跑出來一樣是最新狀態。
// 唯一「過時」情境是程式碼更新，下一次載入就會拿到新版，學期制的課表完全可以接受。

const CACHE = 'tt-v1';
// 只快取同源的頁面與腳本；CDN 資源（Google Fonts、GSAP）靠瀏覽器自己的 HTTP cache
self.addEventListener('fetch', e => {
  const u = e.request.url;
  if (!u.startsWith(self.location.origin)) return;            // 跨域不攔
  const dest = e.request.destination;
  if (dest !== 'document' && dest !== 'script') return;       // 只管 HTML + JS

  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(e.request).then(cached => {
        // 不管有沒有快取都發網路請求更新
        const fresh = fetch(e.request).then(res => {
          if (res.ok) cache.put(e.request, res.clone());
          return res;
        }).catch(() => cached);                                // 離線 fallback
        return cached || fresh;                                // 有快取→秒回；沒有→等網路
      })
    )
  );
});

// 新 SW 裝好直接接管，不等舊頁面關閉
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => {
  // 清掉舊版快取（改 CACHE 名稱時生效）
  e.waitUntil(
    caches.keys().then(ks => Promise.all(
      ks.filter(k => k !== CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

// Android Chrome 通知點擊
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({type:'window'}).then(cl => {
    if (cl.length) return cl[0].focus();
    return clients.openWindow('/');
  }));
});
