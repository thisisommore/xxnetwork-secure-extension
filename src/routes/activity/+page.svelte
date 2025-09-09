<script lang="ts">
  import XXNetworkPopup from "$components/XXNetworkPopup.svelte";
  import MysticalBackground from "$components/MysticalBackground.svelte";
  import { to } from "../../routes.svelte";
  import {
    getActivitiesLivePaginated,
    getActivitiesPaginated,
    getActivitiesCountLive,
    clearActivities,
    type ActivityEntry,
  } from "../../extension/activity.svelte";
  import type { TAction } from "../../extension/schema";
  const pageSize = 20;

  let liveActivities = getActivitiesLivePaginated(pageSize);
  let liveCount = getActivitiesCountLive();
  let olderActivities: ActivityEntry[] = $state([]);
  let isLoadingMore = $state(false);
  let currentOffset = $state(pageSize); // Start loading from after live items

  // Computed: combine live activities with older paginated ones
  let activities = $derived([...($liveActivities || []), ...olderActivities]);

  // Computed: check if there are more activities to load
  let hasMore = $derived(activities.length < ($liveCount || 0));

  // Show loading until first live page arrives (debounced)
  let isInitialLoading = $derived($liveActivities === undefined);

  const ACTION_LABELS = {
    getItem: "Read",
    setItem: "Write",
    removeItem: "Delete",
    keys: "List Keys",
    "clear-requested": "Clear Requested",
    locked: "Locked",
    import_keys: "Import Keys",
    export_keys: "Export Keys",
    clear_keys: "Clear Keys",
    started: "Started",
    clear: "Clear",
    unlock: "Unlock",
    unlocked: "Unlocked",
    lock: "Lock",
  } as const satisfies Record<TAction, string>;

  function sourceLabel(item: ActivityEntry): string {
    if (item.api.startsWith("LocalStorage")) {
      return `Storage ${item.direction}`;
    }
    if (item.api.startsWith("Lock")) {
      if (item.api.includes("Request")) return "Lock Request";
      if (item.api.includes("Response")) return "Lock Response";
      return "Lock";
    }
    // hide explicit UI tag for cleaner UX
    if (item.api === "Keys") return "";
    if (item.api === "Storage") return "Storage";
    if (item.api === "ServiceWorker") return "Service Worker";
    return item.api.replace(":", " ");
  }

  async function loadMoreOlderActivities() {
    if (isLoadingMore || !hasMore) return;

    isLoadingMore = true;
    try {
      const moreOlderActivities = await getActivitiesPaginated(
        currentOffset,
        pageSize,
      );

      olderActivities = [...olderActivities, ...moreOlderActivities];
      currentOffset += moreOlderActivities.length;
    } catch (error) {
      console.error("Error loading older activities:", error);
    } finally {
      isLoadingMore = false;
    }
  }

  async function loadInitialData() {
    // Reset pagination state
    currentOffset = pageSize; // Skip first (handled by live query)
    olderActivities = [];
  }

  function handleScroll(event: Event) {
    const target = event.target as HTMLElement;
    if (target.scrollTop + target.clientHeight >= target.scrollHeight - 100) {
      loadMoreOlderActivities();
    }
  }

  loadInitialData();

  function goHome() {
    to("home");
  }

  async function clear() {
    await clearActivities();
    await loadInitialData(); // Reload after clearing
  }
</script>

<XXNetworkPopup style="gradient">
  <MysticalBackground />
  <div class="container">
    <div class="header">
      <h2 class="title">Activity Logs</h2>
      <div class="stats">
        {#if $liveCount && $liveCount > 0}
          <span class="count">Showing {activities.length} of {$liveCount}</span>
        {/if}
      </div>
      <div class="actions">
        <button class="button" onclick={clear}>Clear</button>
        <button class="button" onclick={goHome}>Back</button>
      </div>
    </div>

    {#if isInitialLoading}
      <div class="empty">Loading...</div>
    {:else if activities.length === 0}
      <div class="empty">No activity yet.</div>
    {:else}
      <ul class="list" onscroll={handleScroll}>
        {#each activities as item (item.id)}
          <li class="row">
            <div class="left">
              <div class="action">
                {ACTION_LABELS[item.action] ?? "unknown"}
              </div>
              <div class="detail">
                {sourceLabel(item)}
                {#if item.key}
                  &nbsp;|&nbsp;key: {item.key}
                {/if}
                {#if item.keys}
                  &nbsp;|&nbsp;keys: {item.keys.length}
                {/if}
                {#if item.count != undefined}
                  &nbsp;|&nbsp;count: {item.count}
                {/if}
              </div>
            </div>
            <div class="time">{new Date(item.timestamp).toLocaleString()}</div>
          </li>
        {/each}

        {#if isLoadingMore}
          <li class="loading-indicator">
            <div class="loading-text">Loading more...</div>
          </li>
        {/if}

        {#if !hasMore && activities.length > 0}
          <li class="end-indicator">
            <div class="end-text">No more activities</div>
          </li>
        {/if}
      </ul>
    {/if}
  </div>
</XXNetworkPopup>

<style>
  .container {
    padding: 40px 20px 20px 20px;
    height: calc(100% - 40px);
    box-sizing: border-box;
  }
  .header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
    flex-wrap: wrap;
  }
  .title {
    margin: 0;
    color: #0d99a8;
    font-size: 18px;
    white-space: nowrap;
  }
  .stats {
    flex: 0 1 auto;
    margin-left: auto;
    text-align: right;
    order: 3;
  }
  .count {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
    background: rgba(255, 255, 255, 0.1);
    padding: 4px 8px;
    border-radius: 4px;
    display: inline-block;
    white-space: nowrap;
  }
  .actions {
    display: flex;
    gap: 8px;
    order: 2;
  }
  .button {
    padding: 8px 14px;
    background: transparent;
    border: 2px solid #ffffff;
    color: #ffffff;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;
  }
  .button:hover {
    background-color: rgba(13, 185, 203, 0.1);
  }
  .empty {
    padding: 30px 0;
    text-align: center;
    color: #ffffff;
    opacity: 0.8;
  }
  .list {
    list-style: none;
    padding: 0;
    margin: 10px 0 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: calc(100% - 60px);
    overflow-y: auto;
    /* Firefox */
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.35) transparent;
  }
  /* Chrome/Safari */
  .list::-webkit-scrollbar {
    width: 3px;
  }
  .list::-webkit-scrollbar-track {
    background: transparent;
  }
  .list::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.35);
    border-radius: 8px;
  }
  .list:hover::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.55);
  }
  .row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 10px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.06);
  }
  .left {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-width: 60%;
  }
  .action {
    font-weight: 600;
  }
  .detail {
    font-size: 12px;
    opacity: 0.9;
  }
  .time {
    font-size: 12px;
    opacity: 0.85;
    text-align: right;
    white-space: nowrap;
  }
  .loading-indicator,
  .end-indicator {
    display: flex;
    justify-content: center;
    padding: 15px 10px;
    border: none;
    background: transparent;
  }
  .loading-text,
  .end-text {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    font-style: italic;
  }
  .loading-text {
    animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse {
    0%,
    100% {
      opacity: 0.6;
    }
    50% {
      opacity: 1;
    }
  }
</style>
