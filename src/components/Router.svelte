<script lang="ts">
  import { onMount } from "svelte";
  import NotFound from "./NotFound.svelte";
  import type { Component } from "svelte";
  type Props = {
    routes?: Record<string, Component | undefined>;
    NotFoundComponent?: Component;
  };
  // Accept routes as a prop with path keys and component values
  const { routes = {}, NotFoundComponent = NotFound }: Props = $props();

  // --- Hash Router Implementation ---
  // Initialize with the current route or default to the first route if no hash is provided.
  const routePaths = $derived(Object.keys(routes));
  let currentRoute: string = $state(window.location.hash.slice(1) || "");

  // Update the currentRoute whenever the hash changes.
  const updateRoute = () => {
    currentRoute = window.location.hash.slice(1) || routePaths[0] || "";
  };

  // Find the component for the current route
  const ActiveComponent = $derived(routes[currentRoute]);

  onMount(() => {
    window.addEventListener("hashchange", updateRoute);
    return () => window.removeEventListener("hashchange", updateRoute);
  });
</script>

<div style="width: 100%; height: 100%;">
  <!-- Hash Router Content -->
  {#if ActiveComponent}
    <ActiveComponent />
  {:else}
    <NotFoundComponent />
  {/if}
</div>
