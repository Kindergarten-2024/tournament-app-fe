import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCEJ0a-ZiE_rOd84eCbdvMVoDuzjru5kXA",
  authDomain: "tournament-app-v1.firebaseapp.com",
  projectId: "tournament-app-v1",
  storageBucket: "tournament-app-v1.appspot.com",
  messagingSenderId: "1037747053191",
  appId: "1:1037747053191:web:349b74062d736d98a0ce22",
  measurementId: "G-M8XSM7M77B"
};

const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);

initializeApp(firebaseConfig);

export const getFirebaseToken = (setTokenFound) => {
  return getToken(messaging, {vapidKey: 'BNAu2gEHYKsq2_fINmVIwu1s5ZBPgvklzdS8czdz-kTG-i3KC1V5PdFyAbvWIivsUMTQ-cb36wBPFcjK0XzEAMQ'}).then((currentToken) => {
    if (currentToken) {
      console.log('Current FCM token for client: ', currentToken);
      setTokenFound(true);
    } else {
      console.log('No registration token available. Request permission to generate one.');
      setTokenFound(false);
    }
  }).catch((err) => {
    console.log('An error occurred while retrieving token. ', err);
  });
}

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
});