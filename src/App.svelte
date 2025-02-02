<script lang="ts">
  import svelteLogo from "./assets/svelte.svg";
  import viteLogo from "/vite.svg";
  import Counter from "./lib/Counter.svelte";

  const allKeys = $state<Record<string, string | null>>(
    Object.keys(localStorage)
      .map((key) => ({
        [key]: localStorage.getItem(key),
      }))
      .reduce((acc, curr) => ({ ...acc, ...curr }), {})
  );

  setInterval(() => {
    Object.keys(localStorage).forEach((key) => {
      allKeys[key] = localStorage.getItem(key);
    });
  }, 1000);
</script>

<main>
  <div>
    <p>Local Storage:</p>
    {#each Object.keys(allKeys) as key}
      <div>{key}: {allKeys[key]}</div>
    {/each}
  </div>
</main>

<style>
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00aa);
  }
  .read-the-docs {
    color: #888;
  }
</style>
