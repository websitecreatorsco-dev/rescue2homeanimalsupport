/* =========================================================
   RESCUE 2 HOME ANIMAL SUPPORT
   SERVICE WORKER

   Purpose:
   - Cache the website after first visit
   - Allow the existing website to continue working offline
   - Do NOT redirect users to an offline page
   - Update cached files when a new version is published
========================================================= */


const CACHE_NAME =
    "rescue2home-v1.0.0";


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

self.addEventListener(
    "install",
    function(event) {

        event.waitUntil(

            caches
                .open(CACHE_NAME)
                .then(function(cache) {

                    return cache.addAll(
                        CORE_FILES
                    );

                })
                .then(function() {

                    return self.skipWaiting();

                })

        );

    }
);



/* =========================================================
   ACTIVATE
========================================================= */

self.addEventListener(
    "activate",
    function(event) {

        event.waitUntil(

            caches
                .keys()
                .then(function(cacheNames) {

                    return Promise.all(

                        cacheNames
                            .filter(function(name) {

                                return (
                                    name.startsWith(
                                        "rescue2home-"
                                    ) &&
                                    name !== CACHE_NAME
                                );

                            })
                            .map(function(name) {

                                return caches.delete(
                                    name
                                );

                            })

                    );

                })
                .then(function() {

                    return self.clients.claim();

                })

        );

    }
);



/* =========================================================
   FETCH
========================================================= */

self.addEventListener(
    "fetch",
    function(event) {


        /*
           Only handle GET requests.
        */

        if (
            event.request.method !== "GET"
        ) {

            return;

        }


        /*
           Ignore external requests.

           This prevents the service worker from trying
           to cache Facebook, WhatsApp or other websites.
        */

        const requestUrl =
            new URL(event.request.url);


        if (
            requestUrl.origin !==
            self.location.origin
        ) {

            return;

        }


        /*
           For navigation requests:

           Try the internet first.

           If there is no internet, use the
           cached version of index.html.

           This means the website itself remains visible
           rather than showing an "Offline" page.
        */

        if (
            event.request.mode ===
            "navigate"
        ) {

            event.respondWith(

                fetch(event.request)
                    .then(function(response) {

                        /*
                           Save the newest page.
                        */

                        const responseClone =
                            response.clone();

                        caches
                            .open(CACHE_NAME)
                            .then(function(cache) {

                                cache.put(
                                    "./index.html",
                                    responseClone
                                );

                            });

                        return response;

                    })
                    .catch(function() {

                        return caches.match(
                            "./index.html"
                        );

                    })

            );

            return;

        }


        /*
           For CSS, images, manifest and other
           local assets:

           Cache first.

           If not cached, go to the network and
           store the result for next time.
        */

        event.respondWith(

            caches
                .match(event.request)
                .then(function(cachedResponse) {

                    if (cachedResponse) {

                        return cachedResponse;

                    }


                    return fetch(event.request)
                        .then(function(response) {


                            /*
                               Only cache successful
                               responses.
                            */

                            if (
                                !response ||
                                response.status !== 200 ||
                                response.type === "opaque"
                            ) {

                                return response;

                            }


                            const responseClone =
                                response.clone();


                            caches
                                .open(CACHE_NAME)
                                .then(function(cache) {

                                    cache.put(
                                        event.request,
                                        responseClone
                                    );

                                });


                            return response;

                        });

                })

        );

    }
);



/* =========================================================
   MESSAGE HANDLING
========================================================= */

self.addEventListener(
    "message",
    function(event) {

        if (
            event.data &&
            event.data.type ===
            "SKIP_WAITING"
        ) {

            self.skipWaiting();

        }

    }
);
