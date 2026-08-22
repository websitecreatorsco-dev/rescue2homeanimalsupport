/* =========================================================
   RESCUE 2 HOME ANIMAL SUPPORT
   PWA SERVICE WORKER
========================================================= */

const CACHE_NAME =
    "rescue2home-animal-support-v3";


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
                                    caches.delete(
                                        cacheName
                                    )
                            )

                    );

                })

        );

        self.clients.claim();

    }
);



/* =========================================================
   FETCH
   Network first, cached fallback
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
                        response.status === 200
                    ) {

                        const copy =
                            response.clone();

                        caches
                            .open(CACHE_NAME)
                            .then(cache => {

                                cache.put(
                                    event.request,
                                    copy
                                );

                            });

                    }

                    return response;

                })

                .catch(() => {

                    return caches
                        .match(event.request)
                        .then(cached => {

                            if (cached) {

                                return cached;

                            }

                            return caches.match(
                                "./index.html"
                            );

                        });

                })

        );

    }
);



/* =========================================================
   MESSAGE
========================================================= */

self.addEventListener(
    "message",
    event => {

        if (
            event.data &&
            event.data.type === "SKIP_WAITING"
        ) {

            self.skipWaiting();

        }

    }
);
