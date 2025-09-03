<script lang="ts">
  import { lockState } from "./extension/lockState.svelte";
  import { to } from "./routes.svelte";
  if (lockState.isLocked) {
    to("lock");
  } else {
    to("home");
  }
</script>
