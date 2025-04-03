<script lang="ts">
  import Router from "./lib/Router.svelte";
  import Home from "./routes/home/+page.svelte";

  // Define routes for the router as an object with path keys and component values
  const routes = {
    "": Home,
    // Add more routes here as needed
  };
</script>

<main style="width: 100%; height: 100%;">
  <Router {routes} />
</main>
