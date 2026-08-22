/* =========================================================
   RESCUE 2 HOME ANIMAL SUPPORT
   PWA SERVICE WORKER
   FINAL VERSION
========================================================= */

const CACHE_NAME = "rescue2home-v2.0.0";

const CORE_FILES = [
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

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => {

                return cache.addAll(CORE_FILES);

            })
            .then(() => {

                return self.skipWaiting();

            })

    );

});


/* =========================================================
   ACTIVATE
========================================================= */

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys()
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
            .then(() => {

                return self.clients.claim();

            })

    );

});


/* =========================================================
   FETCH
=========================================================

   NETWORK FIRST

   When online:
   → Always use the latest website from GitHub.

   When genuinely offline:
   → Use the cached version.

   This means updating the website does not leave users
   permanently stuck with an old cached version.
========================================================= */

self.addEventListener("fetch", event => {

    if (event.request.method !== "GET") {
        return;
    }


    event.respondWith(

        fetch(event.request)

            .then(response => {

                /*
                 * Only cache successful responses.
                 */

                if (
                    response &&
                    response.status === 200 &&
                    response.type !== "opaque"
                ) {

                    const responseToCache =
                        response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {

                            cache.put(
                                event.request,
                                responseToCache
                            );

                        });

                }


                return response;

            })

            .catch(() => {

                /*
                 * Internet genuinely unavailable.
                 *
                 * Try the cached version instead.
                 */

                return caches.match(event.request)

                    .then(cachedResponse => {

                        if (cachedResponse) {

                            return cachedResponse;

                        }


                        /*
                         * If the user is navigating to a page
                         * that isn't cached, give them the
                         * cached homepage instead.
                         */

                        if (
                            event.request.mode === "navigate"
                        ) {

                            return caches.match(
                                "./index.html"
                            );

                        }


                        /*
                         * Nothing cached.
                         */

                        return new Response(
                            "",
                            {
                                status: 503,
                                statusText: "Offline"
                            }
                        );

                    });

            })

    );

});
