import browser from "webextension-polyfill";
import { TMessage, TResponse } from "./type";

browser.runtime.onInstalled.addListener(() => {
  console.log("sw-startedsvv");
});

browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log("svw received");

  //TODO: validation usign zod? check zod size or do custom validation
  const msg = message as TMessage;
  if (msg.api === "LocalStorage") {
    if (msg.action === "clear") {
      await browser.storage.local.clear();
      const response: TResponse = {
        api: "LocalStorage:Response",
        action: "clear",
        requestId: msg.requestId,
      };
      sendResponse(response);
    }

    // TODO: make it(type) narrow such that api should be same? Might be invalid issue
    if (msg.action === "getItem") {
      const result = await browser.storage.local.get(msg.key);
      const response: TResponse = {
        api: "LocalStorage:Response",
        action: "getItem",
        result: result[msg.key],
        requestId: msg.requestId,
      };

      return response;
    }

    if (msg.action === "removeItem") {
      const response: TResponse = {
        api: "LocalStorage:Response",
        action: "removeItem",
        result: localStorage.removeItem(msg.key),
        requestId: msg.requestId,
      };
      return response;
    }
    if (msg.action === "setItem") {
      //TODO: some storage local promise might not fail
      await browser.storage.local.set({ [msg.key]: msg.value });
      browser.storage.local.onChanged.addListener((changes) => {
        console.log("changes", changes);
      });
      console.log("setting item", msg.key, msg.value);

      const response: TResponse = {
        api: "LocalStorage:Response",
        action: "setItem",
        requestId: msg.requestId,
      };
      return response;
    }

    if (msg.action === "clear") {
      //TODO: some storage local promise might not fail
      await browser.storage.local.clear();
      const response: TResponse = {
        api: "LocalStorage:Response",
        action: "clear",
        requestId: msg.requestId,
      };
      return response;
    }
  }
  //TODO add domain check
  //TODO xss
  //TODO
  return true;
});
