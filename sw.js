// Service Woker
//  Copyright(c)2024 Hiroyuki Araki <hiro@zob.jp>

// cache
var CACHE_NAME = 'hhsadv-caches';
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
