<script lang="ts">
  import Router from "$components/Router.svelte";
  import { loadInitialState } from "./extension/lockState.svelte";
  // Define routes for the router as an object with path keys and component values
  import routes from "./routes.svelte";
  let isLoading = $state(true);

  loadInitialState().then(() => {
    isLoading = false;
  });
</script>

<main style="width: 100%; height: 100%;">
  {#if isLoading}
    <p>Loading...</p>
  {:else}
    <Router {routes} />
  {/if}
</main>
