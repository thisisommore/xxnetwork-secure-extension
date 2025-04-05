<script lang="ts">
  import Index from "./+page.svelte";
  import Router from "./lib/Router.svelte";
  import Home from "./routes/home/+page.svelte";
  import Loading from "./routes/loading/+page.svelte";
  // Define routes for the router as an object with path keys and component values
  const routes = {
    "": Index,
    loading: Loading,
    home: Home,
    // Add more routes here as needed
  };
</script>

<main style="width: 100%; height: 100%;">
  <Router {routes} />
</main>
