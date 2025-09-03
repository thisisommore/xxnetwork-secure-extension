<script lang="ts">
  import browser from "webextension-polyfill";
  import { lockState } from "./extension/lockState.svelte";
  import { to } from "./routes.svelte";
  if (lockState.isLocked) {
    to("lock");
  } else {
    browser.storage.session.get("redirectTo").then((result) => {
      if (result.redirectTo) {
        browser.storage.session.remove("redirectTo");
        to(result.redirectTo as string);
      } else {
        to("home");
      }
    });
  }
</script>
