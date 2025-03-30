<script lang="ts">
  export let toast: {
    message: string;
    type: "info" | "success" | "error" | "warning";
  };
</script>

<div class="toast {toast.type}">
  {toast.message}
</div>

<style>
  .toast {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px 20px;
    border-radius: 4px;
    font-size: 14px;
    z-index: 10000000;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    color: white;
  }
  .info {
    background-color: #2196f3;
  }
  .success {
    background-color: #4caf50;
  }
  .error {
    background-color: #f44336;
  }
  .warning {
    background-color: #ff9800;
  }
</style>
