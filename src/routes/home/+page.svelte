<script>
  // Function to clear local storage when the text is clicked
  function clearLocalStorage() {
    alert('Not implemented');
  }
</script>

<main>
  <p on:click={clearLocalStorage}>Clear LS</p>
</main>

<style>
  p {
    cursor: pointer;
    color: #0066cc;
    text-decoration: underline;
  }
  
  p:hover {
    color: #004080;
  }
  
  main {
    padding: 1rem;
  }
</style> 