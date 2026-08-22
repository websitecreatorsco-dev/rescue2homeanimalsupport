const CACHE_NAME = "rescue2home-v2";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./manifest.json"
];


/* =========================================================
   INSTALL
========================================================= */

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => {

                return cache.addAll(FILES_TO_CACHE);

            })

    );

    self.skipWaiting();

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
                        .filter(name => name !== CACHE_NAME)
                        .map(name => caches.delete(name))

                );

            })

    );

    self.clients.claim();

});



/* =========================================================
   FETCH
========================================================= */

self.addEventListener("fetch", event => {

    const request = event.request;


    /*
       Only handle normal GET requests.
    */

    if (request.method !== "GET") {
        return;
    }


    event.respondWith(

        fetch(request)

            .then(response => {

                /*
                   Save a fresh copy of the file.
                */

                const responseClone =
                    response.clone();


                caches.open(CACHE_NAME)
                    .then(cache => {

                        cache.put(
                            request,
                            responseClone
                        );

                    });


                return response;

            })

            .catch(() => {

                /*
                   Internet unavailable.

                   Return the cached version instead
                   of showing an offline page.
                */

                return caches.match(request)
                    .then(cachedResponse => {

                        if (cachedResponse) {

                            return cachedResponse;

                        }


                        /*
                           If the browser requested a page
                           that isn't cached, fall back to
                           the cached homepage.
                        */

                        if (
                            request.mode === "navigate"
                        ) {

                            return caches.match(
                                "./index.html"
                            );

                        }

                    });

            })

    );

});
