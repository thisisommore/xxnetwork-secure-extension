import Lockscreen from "./routes/lockscreen/+page.svelte";
import Home from "./routes/home/+page.svelte";
import Index from "./+page.svelte";
const routes = {
  lock: Lockscreen,
  home: Home,
  "": Index,
} as const;

export const to = (route: string) => {
  window.location.hash = `#${route}`;
};

export default routes;
