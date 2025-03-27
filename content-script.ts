import browser from "webextension-polyfill";
import { TMessage, TResponse } from "./type";

const processMessage = async (message: any) => {
  console.debug("svw received");

  //TODO: validation usign zod? check zod size or do custom validation
  const msg = message as TMessage;
  if (msg.api === "LocalStorage") {
    if (msg.action === "clear") {
      await browser.storage.local.clear();
      // browser.storage.local
      const response: TResponse = {
        api: "LocalStorage:Response",
        action: "clear",
        requestId: msg.requestId,
      };
      return response;
    }

    // TODO: make it(type) narrow such that api should be same? Might be invalid issue
    if (msg.action === "getItem") {
      const result = await browser.storage.local.get(msg.key);
      const response: TResponse = {
        api: "LocalStorage:Response",
        action: "getItem",
        result: result[msg.key] ?? null,
        requestId: msg.requestId,
      };

      return response;
    }

    if (msg.action === "removeItem") {
      await browser.storage.local.remove(msg.key);
      const response: TResponse = {
        api: "LocalStorage:Response",
        action: "removeItem",
        requestId: msg.requestId,
      };
      return response;
    }
    if (msg.action === "setItem") {
      //TODO: some storage local promise might not fail
      await browser.storage.local.set({ [msg.key]: msg.value });

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
  // return true;
};
//TODO type
window.addEventListener("message", async (e) => {
  console.log("got msg", e.data);
  const msg = e.data as TMessage;
  if (msg.api === "LocalStorage") {
    //TODO:validate
    const res = await processMessage(msg);
    window.postMessage(res);
  }
});
