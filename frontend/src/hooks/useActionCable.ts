import { useEffect, useRef } from "react";
import { createConsumer } from "@rails/actioncable";
import type { Consumer } from "@rails/actioncable";

const CABLE_URL = import.meta.env.VITE_CABLE_URL ?? 'ws://localhost:3000/cable';

// SIngleton consumer - one Websocket for the hole app
let consumer: Consumer | null = null;

const getConsumer = (): Consumer => {
  if (!consumer) {
    consumer = createConsumer(CABLE_URL);
  }
  return consumer;
};

export const disconnectConsumer = (): void => {
  consumer?.disconnect();
  consumer = null;
};

export const useActionCable = () => {
  const consumerRef = useRef<Consumer>(getConsumer());
  return { cable: consumerRef.current };
};