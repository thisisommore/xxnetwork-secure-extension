<script lang="ts">
  import XXNetworkPopup from "$components/XXNetworkPopup.svelte";
  import browser from "webextension-polyfill";
  import { to } from "../../routes.svelte";
  import type { TResponse } from "src/extension/type";
  const clear = async () => {
    await browser.storage.local.clear();

    const response: TResponse = {
      api: "LocalStorage:Response",
      action: "clear",
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
      console.error("error sending clear response", e);
    }
    to("home");
  };
</script>

<XXNetworkPopup style="gradient">
  <div class="initial-container">
    <img class="logo" src="xxlogo.png" alt="XX Network Logo" />
    <button class="secure-button" onclick={clear}>
      Clear
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="4"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="icon"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
      </svg>
    </button>
  </div>
</XXNetworkPopup>

<style>
  .initial-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 30px;
    padding-bottom: 20px;
  }
  .logo {
    max-width: 250px;
    height: auto;
    margin: 30px 0;
  }
  .status {
    color: white;
    font-size: 16px;
    margin-bottom: 10px;
  }
  .secure-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px 25px;
    margin: 10px 20px;
    background-color: transparent;
    border: 2px solid white;
    border-radius: 8px;
    color: white;
    font-size: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
    width: fit-content;
    min-width: 240px;
    min-height: 60px;
    box-sizing: border-box;
    text-align: center;
    word-wrap: break-word;
  }
  .secure-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  .icon {
    margin-left: 8px;
  }
</style>
