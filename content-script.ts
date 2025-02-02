import browser from "webextension-polyfill";
import { TMessage } from "./type";

console.log("hello");

//TODO type
window.addEventListener("message", async (e) => {
  console.log("got msg", e.data);
  const msg = e.data as TMessage;
  if (msg.api === "LocalStorage") {
    //TODO:validate
    const res = await browser.runtime.sendMessage(msg);
    window.postMessage(res);
  }
});
