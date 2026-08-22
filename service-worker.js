/* =========================================================
   RESCUE 2 HOME ANIMAL SUPPORT
   Progressive Web App Service Worker
========================================================= */


const CACHE_NAME = "rescue2home-v2";


/*
    Files required for the basic website.

    These are cached so the site can still open when
    there is genuinely no internet connection.
*/

const CORE_FILES = [
    "./",
    "./index.html",
    "./style.css",
    "./manifest.json"
];


/* =========================================================
   INSTALL
========================================================= */

self.addEventListener("install", function (event) {

    event.waitUntil(

        caches.open(CACHE_NAME)

            .then(function (cache) {

                return cache.addAll(CORE_FILES);

            })

            .catch(function (error) {

                console.error(
                    "Rescue 2 Home: Cache installation failed",
                    error
                );

            })

    );


    /*
        Activate the new service worker immediately.
    */

    self.skipWaiting();

});


/* =========================================================
   ACTIVATE
========================================================= */

self.addEventListener("activate", function (event) {

    event.waitUntil(

        caches.keys()

            .then(function (cacheNames) {

                return Promise.all(

                    cacheNames

                        .filter(function (cacheName) {

                            return (
                                cacheName !== CACHE_NAME
                            );

                        })

                        .map(function (cacheName) {

                            return caches.delete(
                                cacheName
                            );

                        })

                );

            })

    );


    /*
        Take control of open pages immediately.
    */

    self.clients.claim();

});


/* =========================================================
   FETCH
========================================================= */

self.addEventListener("fetch", function (event) {


    /*
        Only deal with GET requests.

        POST requests, forms, booking systems etc.
        are left completely alone.
    */

    if (event.request.method !== "GET") {

        return;

    }


    event.respondWith(

        fetch(event.request)

            .then(function (response) {


                /*
                    If the internet is available,
                    return the real live response.

                    At the same time save a copy for
                    possible future offline use.
                */

                if (
                    response &&
                    response.status === 200 &&
                    response.type !== "opaque"
                ) {

                    const responseClone =
                        response.clone();


                    caches.open(CACHE_NAME)

                        .then(function (cache) {

                            cache.put(
                                event.request,
                                responseClone
                            );

                        });

                }


                return response;

            })


            .catch(function () {


                /*
                    The network request failed.

                    Now try the cached version.
                */

                return caches.match(
                    event.request
                )

                    .then(function (cachedResponse) {


                        if (cachedResponse) {

                            return cachedResponse;

                        }


                        /*
                            If someone is trying to
                            navigate to the website while
                            genuinely offline, load the
                            cached homepage instead.
                        */

                        if (
                            event.request.mode ===
                            "navigate"
                        ) {

                            return caches.match(
                                "./index.html"
                            );

                        }


                        /*
                            Nothing is cached for this
                            particular request.

                            Return a simple empty response
                            rather than replacing the site
                            with an offline page.
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
