<script lang="ts">
  import { onMount } from "svelte";
  import Root from "./routes/+page.svelte";

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

<main>
  <div>
    <!-- Hash Router Content -->
    {#if currentRoute === ""}
      <Root />
    {:else if currentRoute === "home"}
      <section>
        <h2>Home</h2>
        <p>Welcome to the Home Page!</p>
      </section>
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