/* =========================================================
   RESCUE 2 HOME ANIMAL SUPPORT
   PWA SERVICE WORKER
   NO OFFLINE UI
========================================================= */

const CACHE_NAME = "rescue2home-v2";


const ASSETS = [

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
                        ASSETS
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
                                name =>
                                    name !== CACHE_NAME
                            )
                            .map(
                                name =>
                                    caches.delete(name)
                            )

                    );

                })

        );

        self.clients.claim();

    }
);


/* =========================================================
   FETCH
========================================================= */

self.addEventListener(
    "fetch",
    event => {

        if (
            event.request.method !== "GET"
        ) {

            return;

        }


        /*
         * Navigation requests:
         * Try the live website first.
         * If unavailable, use the cached page.
         */

        if (
            event.request.mode === "navigate"
        ) {

            event.respondWith(

                fetch(event.request)

                    .then(response => {

                        return response;

                    })

                    .catch(() => {

                        return caches.match(
                            "./index.html"
                        );

                    })

            );

            return;

        }


        /*
         * Images, CSS, JS and other assets:
         * Try network first.
         * Fall back to cache.
         */

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

                    return caches.match(
                        event.request
                    );

                })

        );

    }
);
