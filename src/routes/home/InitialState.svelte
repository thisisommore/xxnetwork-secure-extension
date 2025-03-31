<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
  
    function handleSecureConnection() {
      dispatch('secure');
    }
  </script>
  
  <style>
    .initial-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 30px;
    }
    .logo {
      max-width: 250px;
      height: auto;
      margin: 30px 0;
    }
    .secure-button {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 10px 20px;
      background-color: transparent;
      border: 2px solid white;
      border-radius: 8px;
      color: white;
      font-size: 25px;
      cursor: pointer;
      transition: all 0.3s ease;
      width: fit-content;
    }
    .secure-button:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
    .icon {
      margin-left: 8px;
    }
  </style>
  
  <div class="initial-container">
    <img class="logo" src="xxlogo.png" alt="XX Network Logo" />
    <button class="secure-button" on:click={handleSecureConnection}>
      Secure Connection
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="4"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="icon"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
      </svg>
    </button>
  </div>