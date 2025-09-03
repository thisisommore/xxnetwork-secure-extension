// Simple in-memory lock state for the extension.
// Default is locked and state is not persisted (auto-locks on process reload).
// Persists lock status in chrome.storage.session and loads on startup.
import browser from "webextension-polyfill";
import type { TResponse } from "./type";

export const lockState: { isLocked: boolean } = $state({ isLocked: true });

const AUTO_LOCK_ENABLED: boolean = false;
export const AUTO_LOCK_MS: number = 5 * 60 * 1000; // fixed auto-lock duration
let autoLockTimer: ReturnType<typeof setTimeout> | null = null;

const STORAGE_KEY = "lock:isLocked";

function clearAutoLockTimer(): void {
  if (autoLockTimer && AUTO_LOCK_ENABLED) {
    clearTimeout(autoLockTimer);
    autoLockTimer = null;
  }
}

function lockAfterTimeout(): void {
  if (!AUTO_LOCK_ENABLED) return;
  clearAutoLockTimer();
  autoLockTimer = setTimeout(() => {
    lock();
  }, AUTO_LOCK_MS);
}

async function persistLockState() {
  await browser.storage.session.set({ [STORAGE_KEY]: lockState.isLocked });
}

export async function lock() {
  lockState.isLocked = true;
  clearAutoLockTimer();
  await persistLockState();
  // only route if running in extension ui
  // to check this we use window, service worker doesn't have window object
  if (typeof window !== "undefined") {
    window.location.hash = "#lock";
  }
}

export async function unlock() {
  lockState.isLocked = false;
  lockAfterTimeout();
  await persistLockState();
  const response: TResponse = {
    api: "Lock:Response",
    action: "unlocked",
    requestId: crypto.randomUUID(),
  };

  try {
    const tabs = await browser.tabs.query({});
    await Promise.all(
      tabs
        .filter((t) => typeof t.id === "number")
        .map((t) => browser.tabs.sendMessage(t.id!, response)),
    );
  } catch (e) {
    console.error("error sending unlock response", e);
  }
}

export async function loadInitialState() {
  browser.storage.onChanged.addListener((changes) => {
    if (changes[STORAGE_KEY] != undefined) {
      const stored = changes[STORAGE_KEY].newValue;
      if (typeof stored === "boolean") {
        lockState.isLocked = stored;
      }
    }
  });
  const result = await browser.storage.session.get(STORAGE_KEY);
  const stored = result[STORAGE_KEY];

  if (!result || stored === undefined) {
    lock();
    return;
  }
  if (typeof stored === "boolean") {
    lockState.isLocked = stored;
    if (!stored) {
      lockAfterTimeout();
    } else {
      clearAutoLockTimer();
    }
  } else {
    // default locked
    lock();
  }
}

export default {
  lockState,
  lock,
  unlock,
};
