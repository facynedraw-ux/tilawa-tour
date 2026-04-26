// Service Worker — Tilawa Tour
// Handles: periodicSync check-lecture + notificationclick

const DB_NAME = 'tilawa_sw';

function openDB() {
  return new Promise(function(resolve, reject) {
    var req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = function(e) { e.target.result.createObjectStore('state'); };
    req.onsuccess = function(e) { resolve(e.target.result); };
    req.onerror = reject;
  });
}

async function getState(key) {
  try {
    var db = await openDB();
    return new Promise(function(resolve) {
      var req = db.transaction('state', 'readonly').objectStore('state').get(key);
      req.onsuccess = function() { resolve(req.result); };
      req.onerror = function() { resolve(null); };
    });
  } catch(e) { return null; }
}

async function checkAndNotify() {
  var enabled = await getState('notif_enabled');
  if (!enabled) return;

  var notifTime = (await getState('notif_time')) || '09:00';
  var doneDays  = (await getState('done_days'))  || {};

  var now = new Date();
  var pad = function(n) { return String(n).padStart(2, '0'); };
  var todayStr = now.getFullYear() + '-' + pad(now.getMonth()+1) + '-' + pad(now.getDate());
  if (doneDays[todayStr]) return;

  var parts = notifTime.split(':');
  var h = parseInt(parts[0]), m = parseInt(parts[1] || 0);
  if (now.getHours() * 60 + now.getMinutes() < h * 60 + m) return;

  await self.registration.showNotification('Tilawa Tour 📚', {
    body: "Tu n'as pas encore lu aujourd'hui — BarakAllahu fik !",
    icon: '/Images/logo_ok.svg',
    badge: '/Images/logo_ok.svg',
    tag: 'tilawa-rappel',
    renotify: false,
    data: { url: self.registration.scope }
  });
}

self.addEventListener('periodicsync', function(event) {
  if (event.tag === 'check-lecture') {
    event.waitUntil(checkAndNotify());
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(list) {
      for (var i = 0; i < list.length; i++) {
        var c = list[i];
        if (c.url.indexOf('dashboard') !== -1 && 'focus' in c) return c.focus();
      }
      return clients.openWindow((event.notification.data && event.notification.data.url) || '/');
    })
  );
});

self.addEventListener('install', function() { self.skipWaiting(); });
self.addEventListener('activate', function(e) { e.waitUntil(self.clients.claim()); });
