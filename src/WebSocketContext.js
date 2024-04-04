import React, { createContext, useContext, useEffect, useState } from "react";
import SockJS from "sockjs-client";
import { over } from "stompjs";

const WebSocketContext = createContext(null);

export const useWebSocketContext = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
  const [stompClient, setStompClient] = useState(null);
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const connect = () => {
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

    const socket = new SockJS(`${BACKEND_URL}/ws-message?token=${token}`);
    const client = over(socket);

    client.connect(headers,
      {},
      () => {
        setStompClient(client);

        setInterval(() => {
          if (client && client.connected) {
            client.send(
              "/topic/ping",
              {},
              JSON.stringify({ ping: "keepalive" })
            );
          }
        }, 10000); // 10 seconds interval
      },
      onError
    );
  };

  const onError = (err) => {
    console.error("WebSocket Error:", err);
    if (!err.headers || err.headers['message'] !== 'Unauthorized') {
      setTimeout(connect, 5000); // Reconnect after 5 seconds
    }
    setTimeout(connect, 1000); // Reconnect after 1 second
  };

  useEffect(() => {
    connect();

    return () => {
      if (stompClient && stompClient.connected) {
        stompClient.disconnect();
      }
    };
  }, []);

  const value = { stompClient };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};


// import React, { createContext, useContext, useEffect, useState } from "react";
// import SockJS from "sockjs-client";
// import { over } from "stompjs";

// const WebSocketContext = createContext(null);

// export const useWebSocketContext = () => useContext(WebSocketContext);

// export const WebSocketProvider = ({ children }) => {
//   const [stompClient, setStompClient] = useState(null);
//   const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

//   const connect = () => {
//     const token = localStorage.getItem('userToken');
//     // Correct the template literal to use backticks and the proper syntax for embedding the token.
//     const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

//     const socket = new SockJS(`${BACKEND_URL}/ws-message`);
//     const client = over(socket);

//     // The second parameter to client.connect should be a function that is called on successful connection.
//     client.connect(headers, () => {
//       setStompClient(client);

//       // Subscribe or send messages after successful connection
//       // ...

//       // The keepalive message logic could be moved here as well
//       setInterval(() => {
//         if (client && client.connected) {
//           client.send("/topic/ping", {}, JSON.stringify({ ping: "keepalive" }));
//         }
//       }, 10000); // 10 seconds interval

//     }, onError);
//   };

//   const onError = (err) => {
//     console.error("WebSocket Error:", err);
//     // Only reconnect if not unauthorized. Remove the duplicate setTimeout outside of this condition.
//     if (!err.headers || err.headers['message'] !== 'Unauthorized') {
//       setTimeout(connect, 5000); // Reconnect after 5 seconds
//     }
//   };

//   useEffect(() => {
//     connect();

//     return () => {
//       if (stompClient && stompClient.connected) {
//         stompClient.disconnect();
//       }
//     };
//   }, []);

//   const value = { stompClient };

//   return (
//     <WebSocketContext.Provider value={value}>
//       {children}
//     </WebSocketContext.Provider>
//   );
// };
