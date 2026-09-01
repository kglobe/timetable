// Service Worker：通知 + 離線快取（stale-while-revalidate）
// 頁面 JS 每次載入都用 new Date() 算即時課表，快取的 HTML/JS 跑出來一樣是最新狀態。
// 唯一「過時」情境是程式碼更新，下一次載入就會拿到新版，學期制的課表完全可以接受。

const CACHE = 'tt-v1';
const PRECACHE = ['./', 'index.html', 'events.js', 'calendar.html'];

// 安裝時預快取關鍵檔案，避免長時間閒置被瀏覽器回收後 reload 無東西可回
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(
      ks.filter(k => k !== CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

// 只快取同源的頁面與腳本；CDN 資源（Google Fonts、GSAP）靠瀏覽器自己的 HTTP cache
self.addEventListener('fetch', e => {
  const u = e.request.url;
  if (!u.startsWith(self.location.origin)) return;
  const d = e.request.destination;
  if (d !== 'document' && d !== 'script') return;

  // 立刻發網路請求（不等開快取），拿到就更新快取
  const net = fetch(e.request).then(async r => {
    if (r.ok) { const c = await caches.open(CACHE); await c.put(e.request, r.clone()); }
    return r;
  });
  e.waitUntil(net.catch(() => {}));   // 讓 SW 活到快取寫完

  e.respondWith(
    caches.open(CACHE).then(c => c.match(e.request)).then(hit =>
      hit || net.catch(() =>          // 快取空＋網路掛→給離線提示而非 undefined
        new Response('<!doctype html><meta charset=utf-8><title>離線</title><p style="text-align:center;margin-top:40vh;font-family:sans-serif">無法連線，請重新整理</p>',
          {headers:{'Content-Type':'text/html;charset=utf-8'}}))
    )
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
