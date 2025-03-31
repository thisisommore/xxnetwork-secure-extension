<script lang="ts">
  const { importKeys, exportKeys, clearKeys, xxlogo } = $props();
</script>

<div class="final-container">
  <div class="logo-container">
    <img class="white-logo" src="xxlogo.png" alt="XX Network  Logo" />
  </div>
  <button class="action-button" on:click={importKeys}> Import Keys </button>
  <button class="action-button" on:click={exportKeys}> Export Keys </button>
  <button class="action-button" on:click={clearKeys}> Clear Keys </button>
</div>

<style>
  .final-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: calc(100% - 152px);
    padding: 20px 0 50px;
  }
  .logo-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin: 30px 0;
  }
  .white-logo {
    width: 120px;
    height: 120px;
    object-fit: contain;
  }
  .action-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px 20px;
    background-color: transparent;
    border: 2px solid #ffffff;
    border-radius: 8px;
    color: #ffffff;
    font-size: 22px;
    cursor: pointer;
    transition: all 0.3s ease;
    width: 200px;
    margin: 15px 0;
  }
  .action-button:hover {
    background-color: rgba(13, 185, 203, 0.1);
  }
</style>
