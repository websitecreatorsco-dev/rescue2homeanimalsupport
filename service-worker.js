/* =========================================================
   RESCUE 2 HOME ANIMAL SUPPORT
   SERVICE WORKER
   PWA / OFFLINE SUPPORT
========================================================= */

const CACHE_NAME = "rescue2home-v1";

const APP_SHELL = [
    "./",
    "./index.html",
    "./style.css",
    "./manifest.json",
    "./service-worker.js"
];


/* =========================================================
   INSTALL
========================================================= */

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)

            .then(cache => {

                return cache.addAll(APP_SHELL);

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
                        .filter(name => name !== CACHE_NAME)
                        .map(name => caches.delete(name))

                );

            })

            .then(() => {

                return self.clients.claim();

            })

    );

});


/* =========================================================
   FETCH
========================================================= */

self.addEventListener("fetch", event => {

    /*
       Only handle normal GET requests.
    */

    if (event.request.method !== "GET") {
        return;
    }


    /*
       Ignore external websites such as:
       Facebook
       WhatsApp
       Google hosted images
       external booking/contact services
    */

    const requestURL =
        new URL(event.request.url);


    if (
        requestURL.origin !== self.location.origin
    ) {

        return;

    }


    /*
       Network first for the main website.

       This means visitors get the latest version
       whenever they have internet.

       If they are offline, the cached version is used.
    */

    event.respondWith(

        fetch(event.request)

            .then(response => {

                /*
                   Save successful responses.
                */

                if (
                    response &&
                    response.status === 200 &&
                    response.type === "basic"
                ) {

                    const responseClone =
                        response.clone();


                    caches.open(CACHE_NAME)
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

                /*
                   Offline fallback.
                */

                return caches.match(event.request)

                    .then(cachedResponse => {

                        if (cachedResponse) {

                            return cachedResponse;

                        }


                        /*
                           If a page isn't cached,
                           return the cached home page.
                        */

                        return caches.match(
                            "./index.html"
                        );

                    });

            })

    );

});
