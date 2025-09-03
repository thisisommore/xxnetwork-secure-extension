import Lockscreen from "./routes/lockscreen/+page.svelte";
import Home from "./routes/home/+page.svelte";
import Index from "./+page.svelte";
import Clear from "./routes/clear/+page.svelte";
const routes = {
  lock: Lockscreen,
  home: Home,
  clear: Clear,
  "": Index,
} as const;

export const to = (route: string) => {
  window.location.hash = `#${route}`;
};

export default routes;
