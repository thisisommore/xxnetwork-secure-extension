import browser from "webextension-polyfill";
import type { TRequest, TResponse } from "./type";

import { lockState, loadInitialState } from "./lockState.svelte";
console.log("service-worker ready");

type Route = "clear";
const processMessage = async (
  msg: TRequest,
): Promise<TResponse | undefined> => {
  if (lockState.isLocked && msg.api !== "Lock:Request") {
    return {
      action: "locked",
      api: "LocalStorage:Response",
      requestId: msg.requestId,
    };
  }
  switch (msg.action) {
    case "unlock":
      await browser.action.openPopup();
      break;
    case "clear":
      await browser.storage.session.set({ redirectTo: "clear" } satisfies {
        redirectTo: Route;
      });
      await browser.action.openPopup();
      return {
        api: "LocalStorage:Response",
        action: "clear-requested",
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
loadInitialState().then(() => {
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

  // Accept messages from web pages (externally_connectable) without a Port
  browser.runtime.onMessageExternal.addListener(async (message: unknown) => {
    const msg = message as TRequest;
    return await processMessage(msg);
  });
});
