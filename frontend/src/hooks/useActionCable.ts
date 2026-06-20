import { useEffect, useRef } from "react";
import { createConsumer } from "@rails/actioncable";
import type { Consumer } from "@rails/actioncable";

// Asegúrate de que esta URL sea accesible desde el navegador (localhost:3000)
const CABLE_URL = import.meta.env.VITE_CABLE_URL ?? 'ws://localhost:3000/cable';

let consumer: Consumer | null = null;

export const getConsumer = (): Consumer => {
  if (!consumer) {
    consumer = createConsumer(CABLE_URL);
  }
  return consumer;
};

export const useActionCable = () => {
  const consumerRef = useRef<Consumer>(getConsumer());
  
  // OPCIONAL: Escuchar errores de conexión en el log del navegador
  useEffect(() => {
    const cable = consumerRef.current;
    
    // Esto es solo para depurar en consola
    cable.connection.events.error = (err) => console.error("WebSocket Error:", err);
    cable.connection.events.open = () => console.log("WebSocket Connected!");
  }, []);

  return { cable: consumerRef.current };
};