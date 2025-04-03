<script lang="ts">
  import type { Component } from "svelte";
  import MysticalBackground from "./MysticalBackground.svelte";
  const {
    children: Children,
    style,
  }: { children: Component; style: "gradient" | "transparent" } = $props();

  function closePopup() {
    // Close the extension popup
    window.close();
  }
</script>

<div
  id="xx-network-popup"
  style="background: {style === 'gradient'
    ? 'linear-gradient(180deg, #B5EDF3 0%, #FFFFFF 100%)'
    : 'transparent'};"
>
  <MysticalBackground />
  <Children />
  <!-- Close Button -->
  <div class="close-button" onclick={closePopup}>✕</div>
</div>

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
