<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import browser from "webextension-polyfill";
  import InitialState from "./InitialState.svelte";
  import LoadingState from "./LoadingState.svelte";
  import FinalState from "./FinalState.svelte";
  import Toast from "./Toast.svelte";

  // Define popup states
  type PopupState = "initial" | "loading" | "final";
  let state: PopupState = "initial";
  let visible = true;

  // Logo URLs
  let logoUrl: string =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48c3R5bGU+LnN0MHtmaWxsOiNmZmZ9PC9zdHlsZT48cGF0aCBjbGFzcz0ic3QwIiBkPSJNMjUgMjVsNTAgNTBNNzUgMjVsLTUwIDUwIi8+PHBhdGggZD0iTTIyIDIzbDUgMiA1MCA1MC01IDJNNzggMjNsLTUgMi01MCA1MC41IDIiIGNsYXNzPSJzdDAiLz48L3N2Zz4=";
  let blueLogoUrl: string =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAAH0CAYAAADL1t+KAAAACXBIWXMAABYlAAAWJQFJUiTwAAAgAElEQVR4nO3dT3JTV9oH4JuvMhbZgckKcKo0x5loCllBYAUhKwBWAFlBYAVxpprEzFUVs4KGFTRoA3x1yKu0ANtY1pF0z3uep0pFutOtXF05/t3z533PNx8+fBgAgLb9n+8PANon0AEgAYEOAAkIdABIQKADQAICHQASEOgAkIBAB4AEBDoAJCDQASABgQ4ACQh0AEhAoANAAgIdABIQ6ACQgEAHgAQEOgAkINABIAGBDgAJCHQASECgA0ACAh0AEhDoAJCAQAeABAQ6ACQg0AEgAYEOAAkIdABIQKADQAICHQASEOgAkIBAB4AEBDoAJCDQASABgQ4ACQh0AEhAoANAAgIdABIQ6ACQgEAHgAQEOgAkINABIAGBDgAJCHQASECgA0ACAh0AEhDoAJCAQAeABAQ6ACQg0AEgAYEOAAkIdABIQKADQAICHQASEOgAkIBAB4AEBDoAJCDQASABgY2UJe0AAAAmSURBVA4ACQh0AEhAoANAAgIdABIQ6ACQgEAHgAQEOgC0bhiG/wdWIXUe2xKaIgAAAABJRU5ErkJggg==";

  // Loading state variables
  let fakeButtonText: string = "Extracting KV";
  let hintText: string = "Press Enter to continue";
  let enterCount = 0;

  // Toast state
  type ToastType = "info" | "success" | "error" | "warning";
  let toast: { message: string; type: ToastType } | null = null;
  let toastTimeout: ReturnType<typeof setTimeout>;

  function showToast(
    message: string,
    type: ToastType = "info",
    duration = 3000
  ) {
    toast = { message, type };
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast = null;
    }, duration);
  }

  function closePopup() {
    visible = false;
  }

  // Handle event dispatched from InitialState.svelte
  function handleSecure() {
    state = "loading";
    enterCount = 0;
    fakeButtonText = "Extracting KV";
    hintText = "Press Enter to continue";
  }

  // Global keydown handler (for the loading state)
  function handleKeydown(event: KeyboardEvent) {
    if (state === "loading" && event.key === "Enter") {
      enterCount++;
      if (enterCount === 1) {
        fakeButtonText = "Clearing Local Storage";
        hintText = "Press Enter to continue";
      } else if (enterCount === 2) {
        fakeButtonText = "Successful";
        hintText = "";
        setTimeout(() => {
          state = "final";
        }, 2000);
      }
    }
  }

  onMount(() => {
    window.addEventListener("keydown", handleKeydown);
  });

  onDestroy(() => {
    window.removeEventListener("keydown", handleKeydown);
  });

  // Final state functions
  async function importKeys() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "application/json";
    fileInput.onchange = async (event: Event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) {
        showToast("No file selected", "error");
        return;
      }
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (!e.target?.result) {
          showToast("Failed to read file content", "error");
          return;
        }
        let jsonData;
        try {
          jsonData = JSON.parse(e.target.result as string);
        } catch (err) {
          showToast("Invalid JSON file format", "error");
          return;
        }
        try {
          for (const [key, value] of Object.entries(jsonData)) {
            await browser.runtime.sendMessage({
              api: "LocalStorage",
              action: "setItem",
              key,
              value,
              requestId: Date.now().toString(),
            });
          }
          showToast("Keys imported successfully!", "success");
        } catch (error) {
          console.error("Error importing keys:", error);
          showToast("Error importing keys", "error");
        }
      };
      reader.readAsText(file);
    };
    fileInput.click();
  }

  async function exportKeys() {
    try {
      let allData = {};
      if (browser && browser.storage && browser.storage.local) {
        allData = await browser.storage.local.get(null);
      } else {
        throw new Error("Extension storage API not available");
      }
      const jsonString = JSON.stringify(allData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const now = new Date();
      const dateStr = now
        .toISOString()
        .replace(/[:.]/g, "-")
        .replace("T", "_")
        .split("Z")[0];
      link.download = `xx-network-keys-${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast("Keys exported successfully!", "success");
    } catch (error) {
      console.error("Error exporting keys:", error);
      showToast("Error exporting keys", "error");
    }
  }

  async function clearKeys() {
    if (
      confirm(
        "Are you sure you want to clear all keys? This action cannot be undone."
      )
    ) {
      try {
        await browser.runtime.sendMessage({
          api: "LocalStorage",
          action: "clear",
          requestId: Date.now().toString(),
        });
        showToast("Keys cleared successfully!", "success");
      } catch (error) {
        console.error("Error clearing keys:", error);
        showToast("Error clearing keys", "error");
      }
    }
  }

  function getBackgroundStyle(state: PopupState): string {
    return state === "final"
      ? "linear-gradient(180deg, #B5EDF3 0%, #FFFFFF 100%)"
      : "linear-gradient(180deg, #0DB9CB 0%, #88DCE5 67%)";
  }
</script>

{#if visible}
  <div id="xx-network-popup" style="background: {getBackgroundStyle(state)};">
    <!-- Close Button -->
    <div class="close-button" on:click={closePopup}>✕</div>
    <div style="padding: 20px; height: calc(100% - 40px);">
      {#if state === "initial"}
        <InitialState {logoUrl} on:secure={handleSecure} />
      {:else if state === "loading"}
        <LoadingState {fakeButtonText} {hintText} />
      {:else if state === "final"}
        <FinalState {blueLogoUrl} {importKeys} {exportKeys} {clearKeys} />
      {/if}
    </div>
  </div>
{/if}

<svelte:window on:keydown={handleKeydown} />

{#if toast}
  <Toast {toast} />
{/if}

<style>
  #xx-network-popup {
    width: 100%;
    height: 100%;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    z-index: 9999999;
    overflow-y: auto;
    font-family: Arial, sans-serif;
    color: #ffffff;
  }
  .close-button {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.1);
    text-align: center;
    line-height: 24px;
    cursor: pointer;
    z-index: 10000000;
  }
</style>
