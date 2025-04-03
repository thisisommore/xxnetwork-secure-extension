<script lang="ts">
  import LoadingState from "../../lib/LoadingState.svelte";

  // Global keydown handler (for the loading state)
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      window.location.hash = "#home";
    }
  }

  $effect(() => {
    window.addEventListener("keydown", handleKeydown);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  });
</script>

<LoadingState actionText="Extracting KV" hintText="Press Enter to continue" />
