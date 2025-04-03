<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import browser from "webextension-polyfill";
  import InitialState from "./InitialState.svelte";
  import LoadingState from "./LoadingState.svelte";
  import FinalState from "./FinalState.svelte";
  import Toast from "./Toast.svelte";
  import MysticalBackground from "../../lib/MysticalBackground.svelte";

  // Define popup states
  type PopupState = "initial" | "loading" | "final";
  let state: PopupState = "initial";
  let visible = true;
  let logoUrl = "/xxlogo.png";

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
    // Close the extension popup
    window.close();
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
          console.log("Transitioning to final state");
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
        console.error("Import failed: No file selected");
        showToast("No file selected", "error");
        return;
      }
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (!e.target?.result) {
          console.error("Import failed: Could not read file content");
          showToast("Failed to read file content", "error");
          return;
        }
        let jsonData;
        try {
          jsonData = JSON.parse(e.target.result as string);
          console.log(
            `Parsed JSON data with ${Object.keys(jsonData).length} keys`
          );
        } catch (err) {
          console.error("Import failed: Invalid JSON format", err);
          showToast("Invalid JSON file format", "error");
          return;
        }
        try {
          let importedCount = 0;
          for (const [key, value] of Object.entries(jsonData)) {
            console.log(`Importing key: ${key}`);
            try {
              await browser.storage.local.set({ [key]: value });
              importedCount++;
            } catch (keyError) {
              console.error(`Failed to import key: ${key}`, keyError);
              showToast(`Error importing key: ${key}`, "warning");
            }
          }
          console.log(
            `Successfully imported ${importedCount} of ${Object.keys(jsonData).length} keys`
          );
          showToast(`${importedCount} keys imported successfully!`, "success");
        } catch (error) {
          console.error("Error during import process:", error);
          showToast("Error importing keys", "error");
        }
      };
      reader.readAsText(file);
    };
    fileInput.click();
  }

  async function exportKeys() {
    try {
      console.log("Starting keys export process");
      let allData = {};
      if (browser && browser.storage && browser.storage.local) {
        allData = await browser.storage.local.get(null);
        const keyCount = Object.keys(allData).length;
        console.log(`Retrieved ${keyCount} keys from storage`);
        if (keyCount === 0) {
          console.warn("No keys found to export");
          showToast("No keys found to export", "warning");
          return;
        }
      } else {
        console.error("Export failed: Extension storage API not available");
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
      console.log(`Successfully exported ${Object.keys(allData).length} keys`);
      showToast("Keys exported successfully!", "success");
    } catch (error) {
      console.error("Error exporting keys:", error);
      showToast("Error exporting keys", "error");
    }
  }

  async function clearKeys() {
    console.log("Clear keys requested - waiting for user confirmation");
    if (
      confirm(
        "Are you sure you want to clear all keys? This action cannot be undone."
      )
    ) {
      console.log("User confirmed clearing all keys");
      try {
        // Get current key count before clearing for logging purposes
        const allData = await browser.storage.local.get(null);
        const keyCount = Object.keys(allData).length;

        await browser.storage.local.clear();

        console.log(`Successfully cleared ${keyCount} keys from storage`);
        showToast("Keys cleared successfully!", "success");
      } catch (error) {
        console.error("Error clearing keys:", error);
        showToast("Error clearing keys", "error");
      }
    } else {
      console.log("User cancelled clearing keys");
    }
  }

  function getBackgroundStyle(state: PopupState): string {
    return state === "final"
      ? "linear-gradient(180deg, #B5EDF3 0%, #FFFFFF 100%)"
      : "transparent";
  }
</script>

{#if visible}
  <div id="xx-network-popup" style="background: {getBackgroundStyle(state)};">
    <MysticalBackground />
    <!-- Close Button -->
    <div class="close-button" onclick={closePopup}>✕</div>
    <div style="padding: 20px; height: calc(100% - 40px);">
      {#if state === "initial"}
        <InitialState secure={handleSecure} />
      {:else if state === "loading"}
        <LoadingState {fakeButtonText} {hintText} />
      {:else if state === "final"}
        <FinalState {importKeys} {exportKeys} {clearKeys} />
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
    position: relative;
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
