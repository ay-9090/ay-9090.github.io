/* 홈 화면 추가용 최소 서비스워커 — 저장(캐시)은 하지 않음 (늘 최신 화면) */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function () {});
