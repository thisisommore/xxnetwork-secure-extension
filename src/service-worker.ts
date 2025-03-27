// Add type declarations at the top
declare const chrome: {
  runtime: {
    sendMessage: (message: any, callback?: (response: any) => void) => void;
    lastError?: { message: string };
  };
  storage: {
    local: {
      set: (items: { [key: string]: any }, callback?: () => void) => void;
    };
  };
};

// Create hidden file input for JSON import
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = '.json';
fileInput.style.display = 'none';

fileInput.onchange = (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const reader = new FileReader();
  
  reader.onload = (event) => {
    try {
      const fileContent = event.target?.result as string;
      
      // Validate JSON content
      if (!fileContent || typeof fileContent !== 'string') {
        throw new Error('Invalid file content');
      }

      // Try to parse the JSON
      let data;
      try {
        data = JSON.parse(fileContent);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        throw new Error('Invalid JSON format');
      }

      // Validate the parsed data
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid JSON structure');
      }
      
      // Send message to service worker
      chrome.runtime.sendMessage({
        api: "LocalStorage",
        action: "setItem",
        key: "imported_keys",
        value: data,
        requestId: Date.now().toString()
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error:', chrome.runtime.lastError);
          showError('Failed to import keys');
          return;
        }
        
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.textContent = 'Keys imported successfully!';
        successMessage.style.cssText = `
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: #4CAF50;
          color: white;
          padding: 10px 20px;
          border-radius: 4px;
          z-index: 1000;
          font-size: 14px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(successMessage);
        setTimeout(() => successMessage.remove(), 3000);
      });
    } catch (error) {
      console.error('Error:', error);
      showError(error instanceof Error ? error.message : 'Invalid JSON file');
    }
  };

  reader.onerror = () => {
    showError('Failed to read file');
  };

  reader.readAsText(file);
};

// Helper function to show error message
function showError(message: string) {
  const errorMessage = document.createElement('div');
  errorMessage.textContent = message;
  errorMessage.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #f44336;
    color: white;
    padding: 10px 20px;
    border-radius: 4px;
    z-index: 1000;
    font-size: 14px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  `;
  document.body.appendChild(errorMessage);
  setTimeout(() => errorMessage.remove(), 3000);
}

// Function to export local storage to JSON file
function exportLocalStorage() {
  // Send message to service worker to get all local storage data
  chrome.runtime.sendMessage({
    api: "LocalStorage",
    action: "getItem",
    key: "imported_keys", // Using the same key as import
    requestId: Date.now().toString()
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Error:', chrome.runtime.lastError);
      showError('Failed to export keys');
      return;
    }
    
    try {
      // Create blob from stringified JSON data
      const data = response.result || {};
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      // Create download link
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = 'exported_keys.json';
      downloadLink.style.display = 'none';
      
      // Trigger download
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.textContent = 'Keys exported successfully!';
      successMessage.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #4CAF50;
        color: white;
        padding: 10px 20px;
        border-radius: 4px;
        z-index: 1000;
        font-size: 14px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      `;
      document.body.appendChild(successMessage);
      setTimeout(() => successMessage.remove(), 3000);
      
    } catch (error) {
      console.error('Export error:', error);
      showError(error instanceof Error ? error.message : 'Failed to export data');
    }
  });
}

document.body.appendChild(fileInput); 