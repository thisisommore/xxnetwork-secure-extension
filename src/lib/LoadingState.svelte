<script lang="ts">
  import XxNetworkPopup from "./XXNetworkPopup.svelte";

  const {
    fakeButtonText,
    hintText,
  }: { fakeButtonText: string; hintText: string } = $props();
</script>

<XxNetworkPopup style="gradient">
  <div class="spinner-container">
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
  <div class="loading-container">
    <div class="fake-button">
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
    {#if hintText}
      <div class="hint">{hintText}</div>
    {/if}
  </div>
</XxNetworkPopup>

<style>
  .spinner-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 250px;
  }
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 30px;
  }
  .fake-button {
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
  }
  .hint {
    text-align: center;
    margin-top: 15px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
  }
</style>
