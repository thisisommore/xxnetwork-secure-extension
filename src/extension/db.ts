import Dexie, { type EntityTable } from "dexie";
import type { TAction } from "./type";

export interface ActivityEntry {
  id: string;
  timestamp: number; // epoch ms
  direction: "request" | "response" | "event";
  api: string; // e.g., LocalStorage:Request/Response or UI
  action: TAction; // action name
  requestId?: string;
  key?: string; // for single-key ops
  keys?: string[]; // for multi-key ops (e.g., keys)
  count?: number; // count of keys/items when relevant
}

const db = new Dexie("SecureExtensionDB") as Dexie & {
  activities: EntityTable<
    ActivityEntry,
    "id" // primary key "id" (for the typings only)
  >;
};

// Schema
db.version(1).stores({
  activities: "id, timestamp, direction, api, action, requestId, key",
});

export type ActivityDirection = ActivityEntry["direction"];

export { db };
