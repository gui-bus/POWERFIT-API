import { EventEmitter } from "events";

export const notificationEvents = new EventEmitter();

notificationEvents.setMaxListeners(100);
