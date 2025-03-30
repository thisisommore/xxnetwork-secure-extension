<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import browser from 'webextension-polyfill';
  // Define popup states
  type PopupState = 'initial' | 'loading' | 'final';
  let state: PopupState = 'initial';

  // Fallback logo (from your original code)
  let logoUrl: string =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48c3R5bGU+LnN0MHtmaWxsOiNmZmZ9PC9zdHlsZT48cGF0aCBjbGFzcz0ic3QwIiBkPSJNMjUgMjVsNTAgNTBNNzUgMjVsLTUwIDUwIi8+PHBhdGggZD0iTTIyIDIzbDUgMiA1MCA1MC01IDJNNzggMjNsLTUgMi01MCA1MCA1IDIiIGNsYXNzPSJzdDAiLz48L3N2Zz4=';

  // Blue logo used in the final state
  let blueLogoUrl: string =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAAH0CAYAAADL1t+KAAAACXBIWXMAABYlAAAWJQFJUiTwAAAgAElEQVR4nO3dT3JTV9oH4JuvMhbZgckKcKo0x5loCllBYAUhKwBWAFlBYAVxpprEzFUVs4KGFTRoA3x1yKu0ANtY1pF0z3uep0pFutOtXF05/t3z533PNx8+fBgAgLb9n+8PANon0AEgAYEOAAkIdABIQKADQAICHQASEOgAkIBAB4AEBDoAJCDQASABgQ4ACQh0AEhAoANAAgIdABIQ6ACQgEAHgAQEOgAkINABIAGBDgAJCHQASECgA0ACAh0AEhDoAJCAQAeABAQ6ACQg0AEgAYEOAAkIdABIQKADQAICHQASEOgAkIBAB4AEBDoAJCDQASABgQ4ACQh0AEhAoANAAgIdABIQ6ACQgEAHgAQEOgAkINABIAGBDgAJCHQASECgA0ACAh0AEhDoAJCAQAeABAQ6ACQg0AEgAYEOAAkIdABIQKADQAICHQASEOgAkIBAB4AEBDoAJCDQASABgY2UJe0AAAAmSURBVA4ACQh0AEhAoANAAgIdABIQ6ACQgEAHgAQEOgC0bhiG/wdWIXUe2xKaIgAAAABJRU5ErkJggg==';

  // State for the “loading” sequence:
  // fakeButtonText shows the current message (e.g. “Extracting KV”)
  // hintText instructs the user (e.g. “Press Enter to continue”)
  let fakeButtonText: string = 'Extracting KV';
  let hintText: string = 'Press Enter to continue';
  let enterCount = 0;

  // Toast notification state
  type ToastType = 'info' | 'success' | 'error' | 'warning';
  let toast: { message: string; type: ToastType } | null = null;
  let toastTimeout: ReturnType<typeof setTimeout>;

  function showToast(message: string, type: ToastType = 'info', duration = 3000) {
    toast = { message, type };
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast = null;
    }, duration);
  }

  // Close popup (you could also dispatch an event to remove the component)
  let visible = true;
  function closePopup() {
    visible = false;
  }

  // When the "Secure Connection" button is clicked, move to the loading state.
  function handleSecureConnection() {
    state = 'loading';
    enterCount = 0;
    fakeButtonText = 'Extracting KV';
    hintText = 'Press Enter to continue';
  }

  // Listen for keydown events while in loading state.
  function handleKeydown(event: KeyboardEvent) {
    if (state === 'loading' && event.key === 'Enter') {
      enterCount++;
      if (enterCount === 1) {
        fakeButtonText = 'Clearing Local Storage';
        hintText = 'Press Enter to continue';
      } else if (enterCount === 2) {
        fakeButtonText = 'Successful';
        hintText = '';
        setTimeout(() => {
          state = 'final';
        }, 2000);
      }
    }
  }

  // Final state actions

  async function importKeys() {
    // Create a file input to select a JSON file
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/json';
    fileInput.onchange = async (event: Event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) {
        showToast('No file selected', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (!e.target?.result) {
          showToast('Failed to read file content', 'error');
          return;
        }
        let jsonData;
        try {
          jsonData = JSON.parse(e.target.result as string);
        } catch (err) {
          showToast('Invalid JSON file format', 'error');
          return;
        }
        try {
          // Example: send each key/value to the extension via runtime messaging
          for (const [key, value] of Object.entries(jsonData)) {
            await browser.runtime.sendMessage({
              api: 'LocalStorage',
              action: 'setItem',
              key,
              value,
              requestId: Date.now().toString()
            });
          }
          showToast('Keys imported successfully!', 'success');
        } catch (error) {
          console.error('Error importing keys:', error);
          showToast('Error importing keys', 'error');
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
        throw new Error('Extension storage API not available');
      }
      const jsonString = JSON.stringify(allData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const now = new Date();
      const dateStr = now
        .toISOString()
        .replace(/[:.]/g, '-')
        .replace('T', '_')
        .split('Z')[0];
      link.download = `xx-network-keys-${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Keys exported successfully!', 'success');
    } catch (error) {
      console.error('Error exporting keys:', error);
      showToast('Error exporting keys', 'error');
    }
  }

  async function clearKeys() {
    if (confirm('Are you sure you want to clear all keys? This action cannot be undone.')) {
      try {
        await browser.runtime.sendMessage({
          api: 'LocalStorage',
          action: 'clear',
          requestId: Date.now().toString()
        });
        showToast('Keys cleared successfully!', 'success');
      } catch (error) {
        console.error('Error clearing keys:', error);
        showToast('Error clearing keys', 'error');
      }
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
  });

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeydown);
  });
</script>

<style>
  #xx-network-popup {
    width: 100%;
    height: 100%;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    z-index: 9999999;
    overflow-y: auto; /* Allow scrolling if content overflows */
    font-family: Arial, sans-serif;
    color: #ffffff;
  }
</style>
{#if visible}
  <div
    id="xx-network-popup"
    style="
     background: {state === 'final'
      ? 'linear-gradient(180deg, #B5EDF3 0%, #FFFFFF 100%)'
      : 'linear-gradient(180deg, #0DB9CB 0%, #88DCE5 67%)'};
  "
  >
    <!-- Close Button -->
    <div
      style="
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
      "
      on:click={closePopup}
    >
      ✕
    </div>

    <div style="padding: 20px; height: calc(100% - 40px);">
      {#if state === 'initial'}
        <!-- Initial state: Logo and Secure Connection button -->
        <div
          style="
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 30px 0;
            height: 250px;
          "
        >
          <img src={logoUrl} alt="XX Network Logo" style="max-width: 250px; height: auto;" />
        </div>
        <div style="display: flex; justify-content: center; margin-top: 30px;">
          <button
            on:click={handleSecureConnection}
            style="
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 10px 20px;
              background-color: transparent;
              border: 2px solid white;
              border-radius: 8px;
              color: white;
              font-size: 25px;
              cursor: pointer;
              transition: all 0.3s ease;
              width: fit-content;
            "
            on:mouseover="{(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)')}"
            on:mouseout="{(e) => (e.currentTarget.style.backgroundColor = 'transparent')}"
          >
            Secure Connection
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
              style="margin-left: 8px;"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
            </svg>
          </button>
        </div>
      {:else if state === 'loading'}
        <!-- Loading state: Spinner, fake button and hint -->
        <div
          style="
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 30px 0;
            height: 250px;
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid"
            style="shape-rendering: auto; display: block; background: transparent;"
            width="250"
            height="250"
          >
            <g>
              <path
                style="transform:scale(0.8);transform-origin:50px 50px"
                stroke-linecap="round"
                d="M24.3 30C11.4 30 5 43.3 5 50s6.4 20 19.3 20c19.3 0 32.1-40 51.4-40 C88.6 30 95 43.3 95 50s-6.4 20-19.3 20C56.4 70 43.6 30 24.3 30z"
                stroke-dasharray="42.76 42.76"
                stroke-width="8"
                stroke="#ffffff"
                fill="none"
              >
                <animate
                  values="0;256.58892822265625"
                  keyTimes="0;1"
                  dur="7.69s"
                  repeatCount="indefinite"
                  attributeName="stroke-dashoffset"
                />
              </path>
            </g>
          </svg>
        </div>
        <div style="display: flex; justify-content: center; margin-top: 30px;">
          <div
            style="
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 10px 20px;
              background-color: transparent;
              border: 2px solid white;
              border-radius: 8px;
              color: white;
              font-size: 25px;
              width: fit-content;
            "
          >
            {fakeButtonText}
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
              style="margin-left: 8px;"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
            </svg>
          </div>
        </div>
        {#if hintText}
          <div style="text-align: center; margin-top: 15px; font-size: 14px; color: rgba(255, 255, 255, 0.7);">
            {hintText}
          </div>
        {/if}
      {:else if state === 'final'}
        <!-- Final state: Blue logo and action buttons -->
        <div
          style="
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            margin: 30px 0;
          "
        >
          <img src={blueLogoUrl} alt="XX Network Blue Logo" style="width: 92px; height: 92px; object-fit: contain;" />
        </div>
        <div
          style="
            display: flex;
            flex-direction: column;
            justify-content: space-evenly;
            align-items: center;
            height: calc(100% - 152px);
            padding: 20px 0 50px;
          "
        >
          <div style="margin: 15px 0;">
            <button
              on:click={importKeys}
              style="
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 10px 20px;
                background-color: transparent;
                border: 2px solid #0DB9CB;
                border-radius: 8px;
                color: #0DB9CB;
                font-size: 22px;
                cursor: pointer;
                transition: all 0.3s ease;
                width: 200px;
              "
              on:mouseover="{(e) => (e.currentTarget.style.backgroundColor = 'rgba(13, 185, 203, 0.1)')}"
              on:mouseout="{(e) => (e.currentTarget.style.backgroundColor = 'transparent')}"
            >
              Import Keys
            </button>
          </div>
          <div style="margin: 15px 0;">
            <button
              on:click={exportKeys}
              style="
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 10px 20px;
                background-color: transparent;
                border: 2px solid #0DB9CB;
                border-radius: 8px;
                color: #0DB9CB;
                font-size: 22px;
                cursor: pointer;
                transition: all 0.3s ease;
                width: 200px;
              "
              on:mouseover="{(e) => (e.currentTarget.style.backgroundColor = 'rgba(13, 185, 203, 0.1)')}"
              on:mouseout="{(e) => (e.currentTarget.style.backgroundColor = 'transparent')}"
            >
              Export Keys
            </button>
          </div>
          <div style="margin: 15px 0;">
            <button
              on:click={clearKeys}
              style="
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 10px 20px;
                background-color: transparent;
                border: 2px solid #0DB9CB;
                border-radius: 8px;
                color: #0DB9CB;
                font-size: 22px;
                cursor: pointer;
                transition: all 0.3s ease;
                width: 200px;
              "
              on:mouseover="{(e) => (e.currentTarget.style.backgroundColor = 'rgba(13, 185, 203, 0.1)')}"
              on:mouseout="{(e) => (e.currentTarget.style.backgroundColor = 'transparent')}"
            >
              Clear Keys
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}

<!-- Global key listener -->
<svelte:window on:keydown={handleKeydown} />

<!-- Toast Notification -->
{#if toast}
  <div
    style="
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      padding: 10px 20px;
      border-radius: 4px;
      font-size: 14px;
      z-index: 10000000;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      background-color: {toast.type === 'success'
        ? '#4CAF50'
        : toast.type === 'error'
        ? '#F44336'
        : toast.type === 'warning'
        ? '#FF9800'
        : '#2196F3'};
      color: white;
    "
  >
    {toast.message}
  </div>
{/if}