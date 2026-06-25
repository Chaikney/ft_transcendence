import { useEffect, useRef } from "react";
import { createConsumer } from "@rails/actioncable";
import type { Consumer } from "@rails/actioncable";

const CABLE_URL = import.meta.env.VITE_CABLE_URL ?? 'ws://localhost:3000/cable';

let consumer: Consumer | null = null;

export const getConsumer = (): Consumer => {
  if (!consumer) {
    // 1. Buscamos el token en el almacenamiento
    const token = localStorage.getItem('auth_token');
    
    // 2. Si hay token, lo concatenamos a la URL
    const urlWithToken = token ? `${CABLE_URL}?token=${token}` : CABLE_URL;
    
    // 3. Creamos el consumidor con la URL autenticada
    consumer = createConsumer(urlWithToken);
  }
  return consumer;
};

export const useActionCable = () => {
  const consumerRef = useRef<Consumer>(getConsumer());
  
  useEffect(() => {
    const cable = consumerRef.current;
    
    // Esto es solo para depurar en consola
    cable.connection.events.error = (err) => console.error("WebSocket Error:", err);
    cable.connection.events.open = () => console.log("WebSocket Connected!");
  }, []);

  return { cable: consumerRef.current };
};