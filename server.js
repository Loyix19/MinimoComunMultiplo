const webpush = require('web-push');
const express = require('express');
const schedule = require('node-schedule');
var bodyParser = require('body-parser');
var path = require('path');
const app = express();

// Express setup
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ 
  extended: true
}));

// Placeholder para guardar detalles de la suscripción (en un proyecto real, usarías una DB)
function saveRegistrationDetails(endpoint, key, authSecret) {
  console.log('Saving subscription details...');
  // Aquí deberías guardar endpoint, key, y authSecret en una base de datos.
  // Por ahora, solo lo mostramos en consola.
  global.pushSubscriptionDetails = { endpoint, key, authSecret };
}

webpush.setVapidDetails(
  'mailto:nocarlosma4@gmail.com', // Cambia este email por el tuyo
  'BAyb_WgaR0L0pODaR7wWkxJi__tWbM1MPBymyRDFEGjtDCWeRYS9EF7yGoCHLdHJi6hikYdg4MuYaK0XoD0qnoY', // Clave pública VAPID
  'p6YVD7t8HkABoez1CvVJ5bl7BnEdKUu5bSyVjyxMBh0' // Clave privada VAPID
);

// ===========================================
// TAREA PROGRAMADA: DESAFÍO DIARIO (10:00 AM)
// ===========================================

const dailyChallengeJob = schedule.scheduleJob('0 10 * * *', function(){
    console.log('--- Tarea programada: Enviar desafío diario (10:00 AM) ---');
    
    // Solo envía si tenemos una suscripción guardada
    if (subscriptionData) {
        
        // El payload debe ser coherente con el Service Worker (sw.js)
        const payload = JSON.stringify({
            title: 'MCM Quest - Desafío Diario',
            body: '¡Tu mente matemática te espera! Resuelve el Desafío MCM de hoy. 💡',
            // Puedes añadir un 'url' si quieres que el navegador abra directamente la sección de ejercicios
            url: '/ejercicios' 
        });

        webpush.sendNotification(
            subscriptionData,
            payload
        )
        .then(() => console.log('Notificación diaria enviada con éxito.'))
        .catch(error => {
            // Un error 410 (Gone) significa que la suscripción ya no es válida
            console.error('Error al enviar la notificación diaria. Posiblemente el endpoint haya expirado:', error.statusCode);
            // Idealmente, aquí borrarías la suscripción de la base de datos.
        });
    } else {
        console.log('No hay datos de suscripción guardados para enviar la notificación.');
    }
});

// ===========================================
// FIN DE LA TAREA PROGRAMADA
// ===========================================

// Home page
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

// Send a message (simulación de envío de desafío)
app.post('/sendMessage', function (req, res) {

  // Usamos los detalles guardados globalmente para la demostración
  const subscription = global.pushSubscriptionDetails;

  if (!subscription) {
    return res.status(404).send('No subscription found.');
  }

  const pushSubscription = {
    endpoint: subscription.endpoint,
    keys: {
      auth: subscription.authSecret,
      p256dh: subscription.key
    }
  };

  var body = '¡Tienes un nuevo Desafío MCM esperando! 🎮';
  var iconUrl = 'https://raw.githubusercontent.com/deanhume/progressive-web-apps-book/master/chapter-6/push-notifications/public/images/homescreen.png'; // Usar un icono local

  webpush.sendNotification(pushSubscription,
    JSON.stringify({
      msg: body,
      url: 'http://localhost:3111/#ejercicios', // Redirige a la sección de ejercicios
      icon: iconUrl,
      type: 'challenge'
    }))
    .then(result => {
      console.log('Notificación enviada:', result);
      res.sendStatus(201);
    })
    .catch(err => {
      console.log('Error al enviar notificación:', err);
      res.sendStatus(500);
    });
});

// Register the user
app.post('/register', function (req, res) {

  var endpoint = req.body.endpoint;
  var authSecret = req.body.authSecret;
  var key = req.body.key;

  // Store the users registration details
  saveRegistrationDetails(endpoint, key, authSecret);

  // Opcional: Envía una notificación de bienvenida inmediata
  const pushSubscription = {
    endpoint: endpoint,
    keys: {
      auth: authSecret,
      p256dh: key
    }
  };

  var body = '¡Gracias por unirte a MCM Quest!';
  var iconUrl = 'https://raw.githubusercontent.com/deanhume/progressive-web-apps-book/master/chapter-6/push-notifications/public/images/homescreen.png';

  webpush.sendNotification(pushSubscription,
    JSON.stringify({
      msg: body,
      url: 'http://localhost:3111',
      icon: iconUrl,
      type: 'register'
    }))
    .then(result => {
      console.log('Notificación de bienvenida enviada:', result);
      res.sendStatus(201);
    })
    .catch(err => {
      console.log('Error en registro/bienvenida:', err);
    });

});

// The server
app.listen(3111, function () {
  console.log('MCM Quest server running on http://localhost:3111')
});