import React, { createContext, useContext, useEffect, useState } from "react";
import SockJS from "sockjs-client";
import { over } from "stompjs";

const WebSocketContext = createContext(null);

export const useWebSocketContext = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
  const [stompClient, setStompClient] = useState(null);
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const connect = () => {
    const socket = new SockJS(`${BACKEND_URL}/ws-message`);
    const client = over(socket);
    client.connect(
      {},
      () => {
        setStompClient(client);
      },
      onError
    );
  };

  const onError = (err) => {
    console.error("WebSocket Error:", err);
    setTimeout(connect, 3000); // Reconnect after 3 seconds
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
