// 最小 Service Worker：只為 Android Chrome 通知所需
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({type:'window'}).then(cl => {
    if (cl.length) return cl[0].focus();
    return clients.openWindow('/');
  }));
});
