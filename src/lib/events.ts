import { EventEmitter } from "events";

export const notificationEvents = new EventEmitter();

// Aumentar o limite de listeners para evitar avisos conforme o número de usuários online cresce
notificationEvents.setMaxListeners(100);
