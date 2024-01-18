// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing the generated config
var firebaseConfig = {
    apiKey: "AIzaSyCEJ0a-ZiE_rOd84eCbdvMVoDuzjru5kXA",
    authDomain: "tournament-app-v1.firebaseapp.com",
    projectId: "tournament-app-v1",
    storageBucket: "tournament-app-v1.appspot.com",
    messagingSenderId: "1037747053191",
    appId: "1:1037747053191:web:349b74062d736d98a0ce22",
    measurementId: "G-M8XSM7M77B"
};

firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});