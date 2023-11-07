console.log("service worker :D");

const bd_to_str = (str, withTags = false) =>{
    if(str == null){ str = ""; }
    try{
        if(!str){return str;}
        str = ("" + str);
        str = decodeURI(str);

        str = str.replace(/_1@@/g, "'");
        str = str.replace(/_2@@/g, '"');
        if(withTags === true){
            str = str.replace(/_3@@/g, "<");
            str = str.replace(/_4@@/g, '>');
        }
    }catch(ex){
        console.log(str, ex);
    }
    return str;
}

//para notificaciones
self.addEventListener("push", e=>{
    const noti = e.data.json();
    self.registration.showNotification( bd_to_str(noti.title), {
        body: bd_to_str(noti.body),
        icon: "/images/favicon.png",
        image: noti.image ? "/images/subidas/" + noti.image : "",
        vibrate: [200, 100, 200, 100, 200, 100, 200],
        data: {
            url: "https://roqueperezhoy.com.ar/" + noti.url
        }
    })
    //console.log("notificacion", noti);
})

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    //console.log(event.notification);
    const url = event.notification.data.url;
    event.waitUntil(
        clients.openWindow('https://google.com')
    );
});

// Paso 1: Asigna un nombre y una versión al cache
let CACHE_NAME = 'noticias-v8';


// Paso 2: Lista los archivos que deseas cachear
const urlsToCache = [
    
    "/favicon.ico",
    "/images/favicon.png",
    "/images/favicon2.png",
    "/images/roque-perez-hoy-2.png",
    "/images/roque-perez-hoy-3.png",
    "/images/roque-perez-hoy-5.png",
    "/images/roque-perez-hoy-6.png",
    "/images/roque-perez-hoy-7.png",
    "/images/roque-perez-hoy-8.png",
    "/images/sin_imagen.jpg",
    "/images/user.jpg",

    "/resources/LOGORPHOY.png",

    "/resources/cdns/all.min.css",
    "/resources/cdns/bootstrap.min.css",
    "/resources/cdns/bootstrap.min.js",
    "/resources/cdns/brands.min.css",
    "/resources/cdns/jquery-3.6.1.min.js",
    "/resources/cdns/popper.min.js",
    "/resources/cdns/swiper.min.js",
];

// Paso 3: Instalación del Service Worker
self.addEventListener('install', event => {
// Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            return cache.addAll(urlsToCache)
            .then(() => self.skipWaiting()); // Agrega esta línea para activar el Service Worker inmediatamente
        })
    );
});

// Paso 4: Activación del Service Worker
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cacheName => {
                    // Elimina los cachés antiguos si existen
                    return cacheName !== CACHE_NAME;
                }).map(cacheName => {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});

// Paso 5: Intercepta las solicitudes y busca en el caché primero
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
        .then(response => {
            // Devuelve la respuesta del caché si está disponible
            if (response) {
                return response;
            }
    
            // De lo contrario, realiza una solicitud a la red
            return fetch(event.request);
        })
    );
});

