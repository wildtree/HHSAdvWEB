// Service Woker
//  Copyright(c)2024 Hiroyuki Araki <hiro@zob.jp>

// cache
var CACHE_NAME = 'hhsadv-caches-v3.8';
var urlsToCache = [
	'ending.html',
	'game.html',
	'index.html',
	'opening.html',
	'css/default-style.css',
	'data/data.dat',
	'data/highd.com',
	'data/map.dat',
	'data/rule.dat',
	'data/thin.dat',
	'data/acid.mp3',
	'data/charumera.mp3',
	'data/explosion.mp3',
	'data/highschool.mp3',
	'data/in_toilet.mp3',
	'js/UserData.js',
	'js/dictionary.js',
	'js/graphics.js',
	'js/message.js',
	'js/zSystem.js',
	'js/database.js',
	'js/engine.js',
	'js/global.js',
	'js/map.js',
	'js/audio.js',
	'sw.js'
];

// install
self.addEventListener('install', (event) => 
	event.waitUntil(
		caches.open(CACHE_NAME)
		.then((cache) => cache.addAll(urlsToCache))
	)
);

// refresh
self.addEventListener('fetch', (event) => {
	event.respondWith(
		caches.match(event.request)
		.then((res) => {
			return res ? res : fetch(event.request);
		})
	);
});

// update
self.addEventListener('activate', (event) => {
  const cacheWhitelist = []; // 現在有効なキャッシュ名

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // 現在のバージョンに含まれていない（古い）キャッシュを削除
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('古いキャッシュを削除:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    // すべてのキャッシュ削除が完了したら、クライアントへの制御を引き継ぐ
    .then(() => self.clients.claim())
  );
  
  event.waitUntil(
    // すべてのクライアントに更新完了を通知
    self.clients.claim().then(() => {
      self.clients.matchAll().then((clients) => {
        clients.forEach(client => {
          client.postMessage({ type: 'UPDATE_AVAILABLE' });
        });
      });
    })
  );
});
