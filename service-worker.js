/* =========================================================
   RESCUE 2 HOME ANIMAL SUPPORT
   PWA SERVICE WORKER
========================================================= */

const CACHE_NAME = "rescue2home-pwa-v2";


const STATIC_FILES = [
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

                return cache.addAll(STATIC_FILES);

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

    if (event.request.method !== "GET") {
        return;
    }


    const requestURL =
        new URL(event.request.url);


    /*
       Only handle files belonging to this website.
       External Facebook, WhatsApp etc. remain untouched.
    */

    if (
        requestURL.origin !== self.location.origin
    ) {
        return;
    }


    event.respondWith(

        fetch(event.request)

            .then(response => {

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

                return caches.match(
                    event.request
                );

            })

    );

});
