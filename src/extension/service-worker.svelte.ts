import browser from "webextension-polyfill";
import type { TRequest, TResponse } from "./schema";
import { appendActivity } from "./activity.svelte";

import { lockState, loadInitialState } from "./lockState.svelte";
import { TRequestSchema } from "./schema";
import { consume, requestsDone } from "./rateLimiter";
console.log("service-worker ready");

type Route = "clear";
const processMessage = async (
  msg: TRequest,
): Promise<TResponse | undefined> => {
  // Log request (only metadata)
  appendActivity("request", {
    api: msg.api,
    action: msg.action,
    requestId: msg.requestId,
    key: "key" in msg ? msg.key : undefined,
  });

  if (lockState.isLocked && msg.api !== "Lock:Request") {
    const response = {
      action: "locked",
      api: "LocalStorage:Response",
      requestId: msg.requestId,
    } satisfies TResponse;
    appendActivity("response", response);

    return response;
  }
  // Rate-limit all actions (including unlock)
  try {
    await consume();
  } catch (e) {
    console.error("error:", msg.api, msg.action, e);
    requestsDone();
    return undefined;
  }

  try {
    switch (msg.action) {
      case "unlock":
        await browser.action.openPopup();
        break;
      case "clear":
        await browser.storage.session.set({ redirectTo: "clear" } satisfies {
          redirectTo: Route;
        });
        await browser.action.openPopup();
        {
          const response: TResponse = {
            api: "LocalStorage:Response",
            action: "clear-requested",
            requestId: msg.requestId,
          };
          appendActivity("response", response);

          return response;
        }

      case "getItem": {
        const result =
          (await browser.storage.local.get(msg.key))[msg.key] ?? null;
        const response: TResponse = {
          api: "LocalStorage:Response",
          action: "getItem",
          result,
          requestId: msg.requestId,
        };
        appendActivity("response", {
          api: response.api,
          action: response.action,
          requestId: response.requestId,
          key: msg.key,
        });

        return response;
      }

      case "removeItem":
        await browser.storage.local.remove(msg.key);
        {
          const response: TResponse = {
            api: "LocalStorage:Response",
            action: "removeItem",
            requestId: msg.requestId,
          };
          appendActivity("response", {
            ...response,
            key: msg.key,
          });

          return response;
        }

      case "setItem":
        await browser.storage.local.set({ [msg.key!]: msg.value });
        {
          const response: TResponse = {
            api: "LocalStorage:Response",
            action: "setItem",
            requestId: msg.requestId,
          };
          appendActivity("response", {
            ...response,
            key: msg.key,
          });

          return response;
        }

      case "keys": {
        const all = await browser.storage.local.get(null);
        const keys = Object.keys(all);
        const response: TResponse = {
          api: "LocalStorage:Response",
          action: "keys",
          result: keys,
          requestId: msg.requestId,
        };
        appendActivity("response", {
          api: response.api,
          action: response.action,
          requestId: response.requestId,
          keys,
          count: keys.length,
        });

        return response;
      }

      default:
        throw new Error(`Don't know how to handle: ${JSON.stringify(msg)}`);
    }
  } catch (e) {
    console.error("processMessage error", e);
    throw e;
  } finally {
    requestsDone();
  }
};
loadInitialState().then(async () => {
  console.log("starting listing on port");

  browser.runtime.onConnectExternal.addListener((port) => {
    if (port.name !== "LocalStorageChannel") return;

    console.log("Port connected:", port.name);

    port.onMessage.addListener(async (message: unknown) => {
      const parsed = TRequestSchema.safeParse(message);
      if (!parsed.success) {
        console.error("Invalid message received", message, parsed.error);
        return;
      }

      const msg = parsed.data;
      const response = await processMessage(msg);

      port.postMessage(response);
    });

    port.onDisconnect.addListener(() => {
      console.log("Port disconnected:", port.name);
    });
  });

  // Accept messages from web pages (externally_connectable) without a Port
  browser.runtime.onMessageExternal.addListener(async (message: unknown) => {
    const parsed = TRequestSchema.safeParse(message);
    if (!parsed.success) {
      console.error("Invalid message received", message, parsed.error);
      return undefined;
    }
    const msg = parsed.data as TRequest;
    return await processMessage(msg);
  });
});
