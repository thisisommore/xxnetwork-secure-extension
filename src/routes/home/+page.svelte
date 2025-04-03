<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import browser from "webextension-polyfill";
  import InitialState from "../../Index.svelte";
  import LoadingState from "../../lib/LoadingState.svelte";
  import FinalState from "./FinalState.svelte";
  import Toast from "./Toast.svelte";
  import MysticalBackground from "../../lib/MysticalBackground.svelte";
  import XxNetworkPopup from "../../lib/XXNetworkPopup.svelte";

  // Loading state variables
  let actionText:
    | "Extracting KV"
    | "Clearing Local Storage"
    | "Exporting Keys"
    | "Importing Keys"
    | "" = $state("");

  const stopLoading = () => {
    setTimeout(() => {
      actionText = "";
    }, 1000);
  };

  // Toast state
  type ToastType = "info" | "success" | "error" | "warning";
  let toast: { message: string; type: ToastType } | null = $state(null);
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

  // Final state functions
  async function importKeys() {
    actionText = "Importing Keys";
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
          stopLoading();
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
          stopLoading();
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
        } finally {
          stopLoading();
        }
      };
      reader.readAsText(file);
    };

    fileInput.oncancel = () => {
      stopLoading();
    };
    fileInput.click();
  }

  async function exportKeys() {
    actionText = "Exporting Keys";
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
          stopLoading();
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
    stopLoading();
  }

  async function clearKeys() {
    actionText = "Clearing Local Storage";
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
    stopLoading();
  }
</script>

{#if actionText !== ""}
  <LoadingState {actionText} />
{:else}
  <XxNetworkPopup style={"gradient"}>
    <MysticalBackground />

    <div style="padding: 20px; height: calc(100% - 40px);">
      <FinalState {importKeys} {exportKeys} {clearKeys} />
    </div>
  </XxNetworkPopup>
{/if}

{#if toast}
  <Toast {toast} />
{/if}
