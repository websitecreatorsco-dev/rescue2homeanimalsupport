/* =========================================================
   RESCUE 2 HOME ANIMAL SUPPORT
   PWA SERVICE WORKER

   IMPORTANT:
   This service worker contains NO visible online/offline
   functionality.

   It simply caches the website so the PWA can continue
   loading when an internet connection is unavailable.
========================================================= */

const CACHE_NAME = "rescue2home-pwa-v2";


const FILES_TO_CACHE = [

    "./",

    "./index.html",

    "./style.css",

    "./manifest.json",

    "./r2hasmainlogo.png",

    "./roundr2haslogohome.png",

    "./rescue2homebanner.png",

    "./radiusmap.png"

];



/* =========================================================
   INSTALL
========================================================= */

self.addEventListener(
    "install",
    event => {

        event.waitUntil(

            caches
                .open(CACHE_NAME)
                .then(cache => {

                    return cache.addAll(
                        FILES_TO_CACHE
                    );

                })

        );

        self.skipWaiting();

    }
);



/* =========================================================
   ACTIVATE
========================================================= */

self.addEventListener(
    "activate",
    event => {

        event.waitUntil(

            caches
                .keys()
                .then(cacheNames => {

                    return Promise.all(

                        cacheNames
                            .filter(
                                cacheName =>
                                    cacheName !== CACHE_NAME
                            )
                            .map(
                                cacheName =>
                                    caches.delete(cacheName)
                            )

                    );

                })

        );

        self.clients.claim();

    }
);



/* =========================================================
   FETCH

   Network first.
   If the network is unavailable, use the cached version.

   There is NO offline message.
   There is NO online/offline detection.
   There is NO visual status indicator.
========================================================= */

self.addEventListener(
    "fetch",
    event => {

        if (
            event.request.method !== "GET"
        ) {

            return;

        }


        event.respondWith(

            fetch(event.request)

                .then(response => {

                    if (
                        response &&
                        response.status === 200 &&
                        response.type !== "opaque"
                    ) {

                        const responseClone =
                            response.clone();

                        caches
                            .open(CACHE_NAME)
                            .then(cache => {

                                cache.put(
                                    event.request,
                                    responseClone
                                );

                            });

                    }

                    return response;

                })

                .catch(() => {

                    return caches
                        .match(event.request)
                        .then(cachedResponse => {

                            if (cachedResponse) {

                                return cachedResponse;

                            }


                            if (
                                event.request.mode === "navigate"
                            ) {

                                return caches.match(
                                    "./index.html"
                                );

                            }

                        });

                })

        );

    }
);
