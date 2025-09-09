import browser from "webextension-polyfill";
console.log("Secyre Extension Content Script Loaded");

// Extension (runtime) -> Page
browser.runtime.onMessage.addListener((message) => {
  try {
    window.postMessage(message, "*");
  } catch (e) {
    console.error(e);
  }
  return undefined;
});
