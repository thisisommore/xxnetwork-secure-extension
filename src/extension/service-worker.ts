// src/extension/service-worker.ts
import browser from "webextension-polyfill";
import type { TRequest, TResponse } from "./type";

console.log("service-worker ready");

const processMessage = async (msg: TRequest): Promise<TResponse> => {
  switch (msg.action) {
    case "clear":
      await browser.storage.local.clear();
      return {
        api: "LocalStorage:Response",
        action: "clear",
        requestId: msg.requestId,
      };

    case "getItem": {
      const result =
        (await browser.storage.local.get(msg.key))[msg.key] ?? null;
      return {
        api: "LocalStorage:Response",
        action: "getItem",
        result,
        requestId: msg.requestId,
      };
    }

    case "removeItem":
      await browser.storage.local.remove(msg.key);
      return {
        api: "LocalStorage:Response",
        action: "removeItem",
        requestId: msg.requestId,
      };

    case "setItem":
      await browser.storage.local.set({ [msg.key!]: msg.value });
      return {
        api: "LocalStorage:Response",
        action: "setItem",
        requestId: msg.requestId,
      };

    case "keys": {
      const all = await browser.storage.local.get(null);
      const keys = Object.keys(all);
      return {
        api: "LocalStorage:Response",
        action: "keys",
        result: keys,
        requestId: msg.requestId,
      };
    }

    default:
      throw new Error(`Don't know how to handle: ${JSON.stringify(msg)}`);
  }
};

// accept Ports from your page (externally_connectable must include your origin)
browser.runtime.onConnectExternal.addListener((port) => {
  if (port.name !== "LocalStorageChannel") return;

  console.log("Port connected:", port.name);

  port.onMessage.addListener(async (message: unknown) => {
    const msg = message as TRequest;
    const response = await processMessage(msg);
    port.postMessage(response);
  });

  port.onDisconnect.addListener(() => {
    console.log("Port disconnected:", port.name);
  });
});
