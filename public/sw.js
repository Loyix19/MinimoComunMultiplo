// Manejador del evento 'push'
self.addEventListener('push', function (event) {
    if (!(self.Notification && self.Notification.permission === 'granted')) {
        return;
    }

    // Datos que enviamos desde server.js
    const data = event.data.json();
    const title = 'MCM Quest - Nuevo Desafío';
    
    const options = {
        body: data.msg || '¡Es hora de un nuevo desafío de matemáticas!',
        icon: data.icon || './images/homescreen.png', 
        badge: './images/homescreen.png', // Badge para móviles
        vibrate: [200, 100, 200],
        data: {
            url: data.url || '/' // URL a abrir al hacer clic
        }
    };

    // Muestra la notificación
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Manejador del evento 'notificationclick'
self.addEventListener('notificationclick', function (event) {
    console.log('[Service Worker] Notification click received.');

    // Cierra la notificación
    event.notification.close();

    // Obtiene la URL a la que debe redirigir
    const targetUrl = event.notification.data.url;

    // Define la acción a realizar
    event.waitUntil(
        // Busca todas las ventanas abiertas del cliente
        clients.matchAll({
            type: 'window'
        })
        .then(function (clientList) {
            // Si hay una ventana abierta, enfócala y redirige
            for (var i = 0; i < clientList.length; i++) {
                var client = clientList[i];
                if (client.url && 'focus' in client) {
                    return client.focus().then(() => client.navigate(targetUrl));
                }
            }
            // Si no hay ventanas abiertas, abre una nueva
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});

// Opcional: Lógica básica de Service Worker para instalación y activación (no esencial para Push)
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Install');
});

self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activate');
});