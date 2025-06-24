// import browser from "webextension-polyfill";
// import type { TMessage, TResponse } from "./type";

console.log("content-script");

// const processMessage = async (msg: TMessage) => {
//   if (msg.api === "LocalStorage") {
//     if (msg.action === "clear") {
//       await browser.storage.local.clear();
//       // browser.storage.local
//       const response: TResponse = {
//         api: "LocalStorage:Response",
//         action: "clear",
//         requestId: msg.requestId,
//       };
//       return response;
//     }

//     if (msg.action === "getItem") {
//       const result = await browser.storage.local.get(msg.key);
//       const response: TResponse = {
//         api: "LocalStorage:Response",
//         action: "getItem",
//         result: result[msg.key] ?? null,
//         requestId: msg.requestId,
//       };

//       return response;
//     }

//     if (msg.action === "removeItem") {
//       await browser.storage.local.remove(msg.key);
//       const response: TResponse = {
//         api: "LocalStorage:Response",
//         action: "removeItem",
//         requestId: msg.requestId,
//       };
//       return response;
//     }
//     if (msg.action === "setItem") {
//       await browser.storage.local.set({ [msg.key]: msg.value });

//       const response: TResponse = {
//         api: "LocalStorage:Response",
//         action: "setItem",
//         requestId: msg.requestId,
//       };
//       return response;
//     }

//     if (msg.action === "clear") {
//       await browser.storage.local.clear();
//       const response: TResponse = {
//         api: "LocalStorage:Response",
//         action: "clear",
//         requestId: msg.requestId,
//       };
//       return response;
//     }
//   }
//   //TODO xss
// };
// window.addEventListener("message", async (e) => {
//   const msg = e.data as TMessage;
//   if (msg.api === "LocalStorage") {
//     const res = await processMessage(msg);
//     window.postMessage(res);
//   }
// });
