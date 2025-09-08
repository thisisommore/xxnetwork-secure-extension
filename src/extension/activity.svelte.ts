import { liveQuery } from "dexie";
import { db, type ActivityEntry, type ActivityDirection } from "./db";
import type { TAction } from "./schema";

export type { ActivityEntry };

// Debounce removed: live queries emit immediately

// Dexie liveQuery complies with Svelte store spec; return it directly.

const MAX_ENTRIES = 200;

export async function appendActivity(
  direction: ActivityDirection,
  params: {
    api: string;
    action: TAction;
    requestId?: string;
    key?: string;
    keys?: string[];
    count?: number;
  },
): Promise<void> {
  const entry: ActivityEntry = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    direction,
    api: params.api,
    action: params.action,
    requestId: params.requestId,
    key: params.key,
    keys: params.keys,
    count: params.count,
  };

  await db.activities.add(entry);

  // Keep only the latest MAX_ENTRIES
  const count = await db.activities.count();
  if (count > MAX_ENTRIES) {
    const excess = count - MAX_ENTRIES;
    const oldestEntries = await db.activities
      .orderBy("timestamp")
      .limit(excess)
      .primaryKeys();
    await db.activities.bulkDelete(oldestEntries);
  }
}

export async function clearActivities(): Promise<void> {
  await db.activities.clear();
}

export function getActivitiesLivePaginated(limit: number = 50) {
  return liveQuery(() =>
    db.activities.orderBy("timestamp").reverse().limit(limit).toArray(),
  );
}

export async function getActivitiesPaginated(
  offset: number = 0,
  limit: number = 50,
): Promise<ActivityEntry[]> {
  return await db.activities
    .orderBy("timestamp")
    .reverse()
    .offset(offset)
    .limit(limit)
    .toArray();
}

export function getActivitiesCountLive() {
  return liveQuery(() => db.activities.count());
}

export function createRequestEntry(params: {
  api: string;
  action: TAction;
  requestId?: string;
  key?: string;
}): ActivityEntry {
  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    direction: "request",
    api: params.api,
    action: params.action,
    requestId: params.requestId,
    key: params.key,
  };
}

export function createResponseEntry(params: {
  api: string;
  action: TAction;
  requestId?: string;
  key?: string;
  keys?: string[];
  count?: number;
}): ActivityEntry {
  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    direction: "response",
    api: params.api,
    action: params.action,
    requestId: params.requestId,
    key: params.key,
    keys: params.keys,
    count: params.count,
  };
}

// createEventEntry is no longer needed; use appendActivity("event", params)
