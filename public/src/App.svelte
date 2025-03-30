<script lang="ts">
  import { onMount } from "svelte";
  import Root from "./routes/+page.svelte";
  import Home from "./routes/home/+page.svelte";
  // --- Hash Router Implementation ---
  // Initialize with the current route or default to "home" if no hash is provided.
  let currentRoute: string = $state(window.location.hash.slice(1) || "");

  // Update the currentRoute whenever the hash changes.
  const updateRoute = () => {
    currentRoute = window.location.hash.slice(1) || "home";
  };

  onMount(() => {
    window.addEventListener("hashchange", updateRoute);
    return () => window.removeEventListener("hashchange", updateRoute);
  });
</script>

<main style="width: 100%; height: 100%;">
  <div style="width: 100%; height: 100%;">
    <!-- Hash Router Content -->
    {#if currentRoute === ""}
      <Root />
    {:else if currentRoute === "home"}
     <Home />
    {:else if currentRoute === "about"}
      <section>
        <h2>About</h2>
        <p>This is the About Page.</p>
      </section>
    {:else}
      <section>
        <h2>404</h2>
        <p>Page not found.</p>
      </section>
    {/if}
  </div>
</main>