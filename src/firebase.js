import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

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
  return getToken(messaging, {vapidKey: 'BN3NkGNbmGzZLcfz8J1lTQb07d5je6gTm0DBLctlsGS__2nyjz_ALlqAG6PV2ZOelS1S_fDvkr3fchx6_KncV3c'}).then((currentToken) => {
    if (currentToken) {
      sendTokenToBackend(currentToken);
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

const sendTokenToBackend = async (token) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/admin/notifications/fcm-token/receive`, {
      body: token
    });
    console.log('Data sent successfully:', response.data);
  } catch (error) {
    console.error('Error sending data:', error);
  }
};

export const onMessageListener = () =>
    new Promise((resolve) => {
      onMessage(messaging, (payload) => {
        resolve(payload);
      });
    });