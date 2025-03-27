import browser from "webextension-polyfill";
import { TMessage, TResponse } from "./type";


// Below this line is the code for initiating the popup
//-------------------------------------------------------------------------

// Log when service worker starts
console.log("Service worker initializing");

browser.runtime.onInstalled.addListener(() => {
  console.log("Service worker: Extension installed/updated");
});

// Add listener for the browser action click (popup trigger)
browser.action.onClicked.addListener(async (tab) => {
  console.log("Service worker: Browser action clicked", tab);
  
  if (!tab.id || !tab.url) {
    console.error("Service worker: Invalid tab", tab);
    return;
  }
  
  // Skip chrome:// URLs as they are protected
  if (tab.url.startsWith('chrome://')) {
    console.error("Service worker: Cannot inject into chrome:// URLs - please navigate to a regular webpage");
    return;
  }
  
  try {
    console.log("Service worker: Injecting popup script into tab", tab.id);
    
    // Get the logo as a data URL to avoid chrome-extension:// URL issues
    let logoDataUrl = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48c3R5bGU+LnN0MHtmaWxsOiNmZmZ9PC9zdHlsZT48cGF0aCBjbGFzcz0ic3QwIiBkPSJNMjUgMjVsNTAgNTBNNzUgMjVsLTUwIDUwIi8+PHBhdGggZD0iTTIyIDIzbDUgMiA1MCA1MC01IDJNNzggMjNsLTUgMi01MCA1MCA1IDIiIGNsYXNzPSJzdDAiLz48L3N2Zz4='; // Fallback
    
    try {
      // We can't directly pass chrome-extension:// URLs to content scripts
      // So we need to fetch the image ourselves and convert it to a data URL
      const logoUrl = browser.runtime.getURL('xxlogo.png');
      console.log("Service worker: Fetching logo from", logoUrl);
      
      const response = await fetch(logoUrl);
      const blob = await response.blob();
      
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = async () => {
          logoDataUrl = reader.result as string;
          console.log("Service worker: Logo converted to data URL");
          
          try {
            // Ensure tab.id exists before using it
            if (tab.id) {
              await browser.scripting.executeScript({
                target: { tabId: tab.id },
                func: createRoundedPopup,
                args: [logoDataUrl]
              });
              console.log("Service worker: Successfully injected inline function");
            } else {
              console.error("Service worker: Tab ID is undefined");
            }
            resolve(undefined);
          } catch (err) {
            console.error("Service worker: Failed to inject inline function", err);
            resolve(undefined);
          }
        };
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.error("Service worker: Failed to load logo", err);
      
      // Try with fallback logo
      try {
        // Ensure tab.id exists before using it
        if (tab.id) {
          await browser.scripting.executeScript({
            target: { tabId: tab.id },
            func: createRoundedPopup,
            args: [logoDataUrl]
          });
          console.log("Service worker: Successfully injected inline function with fallback logo");
        } else {
          console.error("Service worker: Tab ID is undefined for fallback");
        }
        return;
      } catch (err) {
        console.error("Service worker: Failed to inject inline function with fallback", err);
      }
    }
    
    console.error("Service worker: All injection methods failed");
  } catch (error) {
    console.error("Service worker: Error during injection", error);
  }
});

// Below this line is the code for the UI of the popup
//-------------------------------------------------------------------------

// Function to create the popup directly
function createRoundedPopup(logoUrl) {
  console.log("Popup function: Creating popup");
  
  try {
    // Check if popup already exists and remove it
    const existingPopup = document.getElementById('xx-network-popup');
    if (existingPopup) {
      document.body.removeChild(existingPopup);
      return;
    }
    
    //  popup container with rounded corners
    const popup = document.createElement('div');
    popup.id = 'xx-network-popup';
    popup.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 380px;
      height: 480px;
      background: linear-gradient(180deg, #0DB9CB 0%, #88DCE5 67%);
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
      z-index: 9999999;
      overflow: hidden;
      font-family: Arial, sans-serif;
      color: #ffffff;
    `;
    
    // close button
    const closeButton = document.createElement('div');
    closeButton.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      text-align: center;
      line-height: 24px;
      cursor: pointer;
      z-index: 10000000;
    `;
    closeButton.innerHTML = '✕';
    closeButton.onclick = function() {
      document.body.removeChild(popup);
    };
    
    // Create content
    const content = document.createElement('div');
    content.style.cssText = `
      padding: 20px;
      height: calc(100% - 40px);
    `;
    
    // Add logo in the middle
    const logoContainer = document.createElement('div');
    logoContainer.style.cssText = `
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 30px 0;
      height: 250px; /* Match the spinner height */
    `;
    
    // Use the logo URL passed from the background script
    const logo = document.createElement('img');
    logo.src = logoUrl || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48c3R5bGU+LnN0MHtmaWxsOiNmZmZ9PC9zdHlsZT48cGF0aCBjbGFzcz0ic3QwIiBkPSJNMjUgMjVsNTAgNTBNNzUgMjVsLTUwIDUwIi8+PHBhdGggZD0iTTIyIDIzbDUgMiA1MCA1MC01IDJNNzggMjNsLTUgMi01MCA1MCA1IDIiIGNsYXNzPSJzdDAiLz48L3N2Zz4=';
    logo.alt = 'XX Network Logo';
    logo.style.cssText = `
      max-width: 250px;
      height: auto;
    `;
    logoContainer.appendChild(logo);
    
    // Add button with lock SVG
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      display: flex;
      justify-content: center;
      margin-top: 30px;
    `;
    
    const button = document.createElement('button');
    button.style.cssText = `
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
    `;
    button.innerHTML = `Secure Connection <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 8px;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>`;
    
    button.onmouseover = function() {
      button.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    };
    
    button.onmouseout = function() {
      button.style.backgroundColor = 'transparent';
    };
    
    // Add click handler to switch to loading screen
    button.onclick = function() {
     
      // remove the logo container
      content.removeChild(logoContainer);
      
      // Create SVG infinite spinner container with identical dimensions/margins as logo container
      const loadingGif = document.createElement('div');
      loadingGif.style.cssText = `
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 30px 0;
        height: 250px; /* Match exactly the logo container height */
      `;
      
      // Add the SVG
      loadingGif.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100" 
          preserveAspectRatio="xMidYMid" style="shape-rendering: auto; display: block; background: transparent;" 
          width="250" height="250">
          <g>
            <path style="transform:scale(0.8);transform-origin:50px 50px" stroke-linecap="round" 
              d="M24.3 30C11.4 30 5 43.3 5 50s6.4 20 19.3 20c19.3 0 32.1-40 51.4-40 C88.6 30 95 43.3 95 50s-6.4 20-19.3 20C56.4 70 43.6 30 24.3 30z" 
              stroke-dasharray="42.76482137044271 42.76482137044271" stroke-width="8" stroke="#ffffff" fill="none">
              <animate values="0;256.58892822265625" keyTimes="0;1" dur="7.692307692307692s" 
                repeatCount="indefinite" attributeName="stroke-dashoffset"/>
            </path>
            <g/>
          </g>
        </svg>
      `;
      
      // Insert the spinner in place of the logo
      content.insertBefore(loadingGif, buttonContainer);
      
      // replace the button with a non-clickable version
      content.removeChild(buttonContainer);
      
      // Create identical button container
      const fakeButtonContainer = document.createElement('div');
      fakeButtonContainer.style.cssText = buttonContainer.style.cssText;
      
      // Create the fake button with identical styling
      const fakeButton = document.createElement('div');
      // Use the exact same style but remove click behavior
      fakeButton.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 10px 20px;
        background-color: transparent;
        border: 2px solid white;
        border-radius: 8px;
        color: white;
        font-size: 25px;
        transition: all 0.3s ease;
        width: fit-content;
      `;
      
      fakeButton.innerHTML = `Extracting KV <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 8px;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>`;
      
      // Add the fake button to its container
      fakeButtonContainer.appendChild(fakeButton);
      
      // Add the fake button container to the content
      content.appendChild(fakeButtonContainer);
      
      // Add a subtle hint for pressing Enter
      const hintText = document.createElement('div');
      hintText.style.cssText = `
        text-align: center;
        margin-top: 15px;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.7);
      `;
      hintText.textContent = 'Press Enter to continue';
      content.appendChild(hintText);
      
      // Add keyboard event listener for Enter key
      const enterKeyHandler = function(event) {
        if (event.key === 'Enter') {
          // Remove the hint text
          content.removeChild(hintText);
          
          // Remove this event listener to prevent multiple triggers
          window.removeEventListener('keydown', enterKeyHandler);
          
          // Update the fake button text to "clearing local storage"
          fakeButton.innerHTML = `Clearing Local Storage <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 8px;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>`;
          
          // Add a new hint for the next screen
          const nextHintText = document.createElement('div');
          nextHintText.style.cssText = `
            text-align: center;
            margin-top: 15px;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.7);
          `;
          nextHintText.textContent = 'Press Enter to continue';
          content.appendChild(nextHintText);
          
          // Add keyboard event listener for the next Enter key press
          const successKeyHandler = function(event) {
            if (event.key === 'Enter') {
              // Remove the hint text
              content.removeChild(nextHintText);
              
              // Remove this event listener to prevent multiple triggers
              window.removeEventListener('keydown', successKeyHandler);
              
              // Update the fake button text to "Successful" with closed lock icon
              fakeButton.innerHTML = `Successful <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 8px;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`;
              
              // After 2 seconds, transition to the final screen
              setTimeout(() => {
                // Change the background gradient
                popup.style.background = 'linear-gradient(180deg, #B5EDF3 0%, #FFFFFF 100%)';
                
                // Clear the content
                content.innerHTML = '';
                
                // Add blue logo at the top
                const blueLogoContainer = document.createElement('div');
                blueLogoContainer.style.cssText = `
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  width: 100%;
                  margin: 30px 0;
                `;
                
                // Create the blue logo image with direct base64 encoding to avoid path issues
                const blueLogo = document.createElement('img');
                // Use base64 encoded version of the XX Network logo in turquoise/blue color
                blueLogo.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAAH0CAYAAADL1t+KAAAACXBIWXMAABYlAAAWJQFJUiTwAAAgAElEQVR4nO3dT3JTV9oH4JuvMhbZgckKcKo0x5loCllBYAUhKwBWAFlBYAVxpprEzFUVs4KGFTRoA3x1yKu0ANtY1pF0z3uep0pFutOtXF05/t3z533PNx8+fBgAgLb9n+8PANon0AEgAYEOAAkIdABIQKADQAICHQASEOgAkIBAB4AEBDoAJCDQASABgQ4ACQh0AEhAoANAAgIdABIQ6ACQgEAHgAQEOgAkINABIAGBDgAJCHQASECgA0ACAh0AEhDoAJCAQAeABAQ6ACQg0AEgAYEOAAkIdABIQKADQAICHQASEOgAkIBAB4AEBDoAJCDQASABgQ4ACQh0AEhAoANAAgIdABIQ6ACQgEAHgAQEOgAkINABIAGBDgAJCHQASECgA0ACAh0AEhDoAJCAQAeABAQ6ACQg0AEgAYEOAAkIdABIQKADQAICHQASEOgAkIBAB4AEBDoAJCDQASABgY2UJe0AAAAmSURBVA4ACQh0AEhAoANAAgIdABIQ6ACQgEAHgAQEOgC0bhiG/wdWIXUe2xKaIgAAAABJRU5ErkJggg==';                blueLogo.alt = 'XX Network Blue Logo';
                blueLogo.style.cssText = `
                  width: 92px;
                  height: 92px;
                  object-fit: contain;
                `;
                
                blueLogoContainer.appendChild(blueLogo);
                content.appendChild(blueLogoContainer);
                
                // Create three equally spaced buttons container
                const buttonsContainer = document.createElement('div');
                buttonsContainer.style.cssText = `
                  display: flex;
                  flex-direction: column;
                  justify-content: space-evenly;
                  align-items: center;
                  height: calc(100% - 152px); /* Adjust for logo height + margin */
                  padding: 20px 0 50px;
                `;
                
                // Create the three buttons
                const buttonLabels = ['Import Keys', 'Export Keys', 'Clear Keys'];
                
                // Helper function to show a toast notification in the popup
                function showToast(message, type = 'info', duration = 3000) {
                  const toast = document.createElement('div');
                  toast.textContent = message;
                  toast.style.cssText = `
                    position: fixed;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    padding: 10px 20px;
                    border-radius: 4px;
                    color: white;
                    font-size: 14px;
                    z-index: 10000000;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                  `;
                  
                  // Set background color based on type
                  if (type === 'success') {
                    toast.style.backgroundColor = '#4CAF50'; // Green
                  } else if (type === 'error') {
                    toast.style.backgroundColor = '#F44336'; // Red
                  } else if (type === 'warning') {
                    toast.style.backgroundColor = '#FF9800'; // Orange
                  } else {
                    toast.style.backgroundColor = '#2196F3'; // Blue
                  }
                  
                  document.body.appendChild(toast);
                  
                  // Remove toast after specified duration
                  setTimeout(() => {
                    if (document.body.contains(toast)) {
                      document.body.removeChild(toast);
                    }
                  }, duration);
                }
                
                buttonLabels.forEach(label => {
                  const buttonWrap = document.createElement('div');
                  buttonWrap.style.cssText = `
                    margin: 15px 0;
                  `;
                  
                  const actionButton = document.createElement('button');
                  actionButton.style.cssText = `
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 10px 20px;
                    background-color: transparent;
                    border: 2px solid #0DB9CB;
                    border-radius: 8px;
                    color: #0DB9CB;
                    font-size: 22px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    width: 200px;
                  `;
                  actionButton.textContent = label;
                  
                  // Add hover effect
                  actionButton.onmouseover = function() {
                    actionButton.style.backgroundColor = 'rgba(13, 185, 203, 0.1)';
                  };
                  
                  actionButton.onmouseout = function() {
                    actionButton.style.backgroundColor = 'transparent';
                  };

                  // Add click functionality for each button
                  if (label === 'Import Keys') {
                    actionButton.onclick = function() {
                      // Create a file input element
                      const fileInput = document.createElement('input');
                      fileInput.type = 'file';
                      fileInput.accept = 'application/json';
                      
                      fileInput.onchange = function(event) {
                        try {
                          const target = event.target as HTMLInputElement;
                          const file = target.files?.[0];
                          
                          if (!file) {
                            showToast('No file selected', 'error');
                            return;
                          }
                          
                          const reader = new FileReader();
                          
                          reader.onload = function(e) {
                            try {
                              if (!e.target || e.target.result === null) {
                                showToast('Failed to read file content', 'error');
                                return;
                              }

                              const fileContent = e.target.result as string;
                              let jsonData;
                              
                              try {
                                jsonData = JSON.parse(fileContent);
                              } catch (error) {
                                showToast('Invalid JSON file format', 'error');
                                return;
                              }
                              
                              if (typeof jsonData !== 'object' || jsonData === null) {
                                showToast('Invalid JSON structure', 'error');
                                return;
                              }

                              // Store each key-value pair individually
                              console.log('Importing keys, total count:', Object.keys(jsonData).length);
                              
                              // Progress tracking
                              let totalKeys = Object.keys(jsonData).length;
                              let successCount = 0;
                              let failedCount = 0;
                              
                              // Show progress indicator
                              const progressToast = document.createElement('div');
                              progressToast.textContent = `Processing 0/${totalKeys} keys...`;
                              progressToast.style.cssText = `
                                position: fixed;
                                bottom: 60px;
                                left: 50%;
                                transform: translateX(-50%);
                                padding: 10px 20px;
                                border-radius: 4px;
                                background-color: #2196F3;
                                color: white;
                                font-size: 14px;
                                z-index: 10000000;
                                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                              `;
                              document.body.appendChild(progressToast);
                              
                              // Process each entry and send to extension storage
                              const entries = Object.entries(jsonData);
                              const batchSize = 10; // Process in batches to avoid overwhelming the message system
                              const updateInterval = Math.max(1, Math.floor(totalKeys / 10));
                              let processedCount = 0;
                              
                              // Try to access the extension API directly first
                              (async function() {
                                try {
                                  if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.sendMessage) {
                                    console.log('Using browser.runtime.sendMessage for import');
                                    
                                    // Process each entry individually
                                    for (const [key, value] of entries) {
                                      try {
                                        await browser.runtime.sendMessage({
                                          api: "LocalStorage",
                                          action: "setItem",
                                          key: key,
                                          value: value,
                                          requestId: Date.now().toString()
                                        });
                                        successCount++;
                                      } catch (error) {
                                        console.error(`Failed to import key "${key}":`, error);
                                        failedCount++;
                                      }
                                      
                                      processedCount++;
                                      if (processedCount % updateInterval === 0 || processedCount === totalKeys) {
                                        progressToast.textContent = `Processing ${processedCount}/${totalKeys} keys...`;
                                      }
                                    }
                                    
                                    // Remove progress toast when done
                                    if (document.body.contains(progressToast)) {
                                      document.body.removeChild(progressToast);
                                    }
                                    
                                    // Show final result
                                    if (failedCount === 0) {
                                      showToast(`Successfully imported all keys to extension storage!`, 'success');
                                    } else {
                                      showToast(`Imported ${successCount} keys with ${failedCount} errors`, 'warning');
                                    }
                                  } else if (typeof window['chrome'] !== 'undefined' && window['chrome'].runtime && window['chrome'].runtime.sendMessage) {
                                    console.log('Using chrome.runtime.sendMessage for import');
                                    const chromeAPI = window['chrome'];
                                    
                                    // Process each entry individually with Chrome API
                                    for (const [key, value] of entries) {
                                      try {
                                        chromeAPI.runtime.sendMessage({
                                          api: "LocalStorage",
                                          action: "setItem",
                                          key: key,
                                          value: value,
                                          requestId: Date.now().toString()
                                        }, function(response) {
                                          if (chromeAPI.runtime.lastError) {
                                            console.error(`Failed to import key "${key}":`, chromeAPI.runtime.lastError);
                                            failedCount++;
                                          } else {
                                            successCount++;
                                          }
                                        });
                                        
                                        processedCount++;
                                        if (processedCount % updateInterval === 0 || processedCount === totalKeys) {
                                          progressToast.textContent = `Processing ${processedCount}/${totalKeys} keys...`;
                                        }
                                      } catch (error) {
                                        console.error(`Failed to import key "${key}":`, error);
                                        failedCount++;
                                        processedCount++;
                                      }
                                    }
                                    
                                    // Handle Chrome async callbacks
                                    setTimeout(() => {
                                      // Remove progress toast when done
                                      if (document.body.contains(progressToast)) {
                                        document.body.removeChild(progressToast);
                                      }
                                      
                                      // Show final result
                                      if (failedCount === 0) {
                                        showToast(`Successfully imported all keys to extension storage!`, 'success');
                                      } else {
                                        showToast(`Imported ${successCount} keys with ${failedCount} errors`, 'warning');
                                      }
                                    }, 1000);
                                  } else {
                                    // Extension API not available
                                    throw new Error('Extension storage APIs are not available');
                                  }
                                } catch (error) {
                                  console.error('Failed to access extension storage:', error);
                                  
                                  // Remove progress toast
                                  if (document.body.contains(progressToast)) {
                                    document.body.removeChild(progressToast);
                                  }
                                  
                                  // Show error message - never fall back to website localStorage
                                  showToast('Cannot access extension storage. Please try again or report this issue.', 'error', 5000);
                                }
                              })();
                              
                              // Create a custom communication channel from page to extension
                              const channel = new BroadcastChannel('xx-network-secure-extension');
                              
                              // Set up a response listener
                              channel.onmessage = function(event) {
                                const response = event.data;
                                if (response.action === 'importResult') {
                                  if (response.success) {
                                    successCount += response.count;
                                  } else {
                                    failedCount += response.count;
                                    console.error('Failed to import keys:', response.error);
                                  }
                                  
                                  // Update progress
                                  processedCount += response.count;
                                  progressToast.textContent = `Processing ${processedCount}/${totalKeys} keys...`;
                                  
                                  // If all done, show final result
                                  if (processedCount >= totalKeys) {
                                    // Remove progress toast when done
                                    if (document.body.contains(progressToast)) {
                                      document.body.removeChild(progressToast);
                                    }
                                    
                                    // Show final result
                                    if (failedCount === 0) {
                                      showToast(`Successfully imported all ${successCount} keys to extension storage!`, 'success');
                                    } else {
                                      showToast(`Imported ${successCount} keys with ${failedCount} errors`, 'warning');
                                    }
                                    
                                    // Close the channel
                                    channel.close();
                                  }
                                }
                              };
                              
                              // Process in smaller batches to avoid message size limits
                              for (let i = 0; i < entries.length; i += batchSize) {
                                const batch = entries.slice(i, i + batchSize);
                                const batchData = {};
                                
                                // Convert array of pairs back to object
                                for (const [key, value] of batch) {
                                  batchData[key] = value;
                                }
                                
                                // Send to extension via postMessage
                                channel.postMessage({
                                  action: 'importKeys',
                                  keys: batchData,
                                  batchNumber: Math.floor(i / batchSize) + 1,
                                  totalBatches: Math.ceil(entries.length / batchSize)
                                });
                              }
                              
                              // Fallback in case extension messaging fails after 5 seconds
                              setTimeout(() => {
                                if (processedCount === 0) {
                                  // Remove progress toast
                                  if (document.body.contains(progressToast)) {
                                    document.body.removeChild(progressToast);
                                  }
                                  
                                  channel.close();
                                  
                                  // Show error message - never fall back to website localStorage
                                  showToast('Cannot connect to extension storage. Please try again or report this issue.', 'error', 5000);
                                }
                              }, 5000);
                            } catch (error) {
                              console.error('Error processing file:', error);
                              showToast(`Error processing file: ${error.message || 'Unknown error'}`, 'error');
                            }
                          };
                          
                          reader.onerror = function() {
                            showToast('Error reading file', 'error');
                          };
                          
                          reader.readAsText(file);
                        } catch (error) {
                          console.error('Exception during import:', error);
                          showToast(`Error during import: ${error.message || 'Unknown error'}`, 'error');
                        }
                      };
                      
                      fileInput.click();
                    };
                  } else if (label === 'Export Keys') {
                    actionButton.onclick = function() {
                      // Show loading toast
                      showToast('Exporting keys, please wait...', 'info');
                      
                      try {
                        // Try to use the extension API directly
                        const exportKeys = async () => {
                          try {
                            let allData = {};
                            let itemsExported = 0;
                            
                            if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) {
                              // Firefox API
                              const data = await browser.storage.local.get(null); // null gets all items
                              allData = data;
                              itemsExported = Object.keys(allData).length;
                            } else if (typeof window['chrome'] !== 'undefined' && window['chrome'].storage && window['chrome'].storage.local) {
                              // Chrome API
                              await new Promise((resolve) => {
                                const chromeAPI = window['chrome'];
                                chromeAPI.storage.local.get(null, (data) => {
                                  allData = data;
                                  itemsExported = Object.keys(allData).length;
                                  resolve(null);
                                });
                              });
                            } else {
                              throw new Error('Extension storage API not available');
                            }
                            
                            // Create a JSON string from the data
                            const jsonString = JSON.stringify(allData, null, 2);
                            
                            // Create a Blob with the JSON data
                            const blob = new Blob([jsonString], { type: 'application/json' });
                            
                            // Create a download URL for the Blob
                            const url = URL.createObjectURL(blob);
                            
                            // Create a temporary link element to trigger the download
                            const link = document.createElement('a');
                            link.href = url;
                            
                            // Generate a filename with the current date/time
                            const now = new Date();
                            const dateStr = now.toISOString().replace(/[:.]/g, '-').replace('T', '_').split('Z')[0];
                            link.download = `xx-network-keys-${dateStr}.json`;
                            
                            // Append to body, click and remove
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            
                            // Clean up the URL object
                            URL.revokeObjectURL(url);
                            
                            // Show success message
                            showToast(`Successfully exported ${itemsExported} keys!`, 'success');
                          } catch (error) {
                            console.error('Error exporting keys:', error);
                            showToast(`Error exporting keys: ${error.message || 'Unknown error'}`, 'error');
                            
                            // Try using the BroadcastChannel as fallback
                            tryBroadcastChannelExport();
                          }
                        };
                        
                        // Try using BroadcastChannel if direct access fails
                        const tryBroadcastChannelExport = () => {
                          try {
                            const channel = new BroadcastChannel('xx-network-secure-extension');
                            
                            // Set up a timeout to handle no response
                            const timeout = setTimeout(() => {
                              channel.close();
                              showToast('Export failed: No response from extension', 'error');
                            }, 5000);
                            
                            // Listen for response
                            channel.onmessage = function(event) {
                              clearTimeout(timeout);
                              
                              const message = event.data;
                              if (message.action === 'exportResult') {
                                if (message.success) {
                                  // Create a Blob with the JSON data
                                  const jsonString = JSON.stringify(message.data, null, 2);
                                  const blob = new Blob([jsonString], { type: 'application/json' });
                                  
                                  // Create a download URL for the Blob
                                  const url = URL.createObjectURL(blob);
                                  
                                  // Create a temporary link element to trigger the download
                                  const link = document.createElement('a');
                                  link.href = url;
                                  
                                  // Generate a filename with the current date/time
                                  const now = new Date();
                                  const dateStr = now.toISOString().replace(/[:.]/g, '-').replace('T', '_').split('Z')[0];
                                  link.download = `xx-network-keys-${dateStr}.json`;
                                  
                                  // Append to body, click and remove
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                  
                                  // Clean up the URL object
                                  URL.revokeObjectURL(url);
                                  
                                  // Show success message
                                  showToast(`Successfully exported ${Object.keys(message.data).length} keys!`, 'success');
                                } else {
                                  // Show error message
                                  showToast(`Export failed: ${message.error || 'Unknown error'}`, 'error');
                                }
                                
                                // Close the channel
                                channel.close();
                              }
                            };
                            
                            // Send export request
                            channel.postMessage({
                              action: 'exportKeys'
                            });
                          } catch (error) {
                            console.error('Failed to use BroadcastChannel:', error);
                            showToast('Export failed: Cannot access extension storage', 'error');
                          }
                        };
                        
                        // Start the export process
                        exportKeys();
                      } catch (error) {
                        console.error('Exception during export:', error);
                        showToast(`Error during export: ${error.message || 'Unknown error'}`, 'error');
                      }
                    };
                  } else if (label === 'Clear Keys') {
                    actionButton.onclick = function() {
                      // Ask for confirmation
                      if (confirm('Are you sure you want to clear all keys? This action cannot be undone.')) {
                        // Show loading toast
                        showToast('Clearing keys, please wait...', 'info');
                        
                        const clearKeys = async () => {
                          try {
                            if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.sendMessage) {
                              // Firefox API
                              await browser.runtime.sendMessage({
                                api: "LocalStorage",
                                action: "clear",
                                requestId: Date.now().toString()
                              });
                              showToast('All keys cleared successfully!', 'success');
                            } else if (typeof window['chrome'] !== 'undefined' && window['chrome'].runtime && window['chrome'].runtime.sendMessage) {
                              // Chrome API
                              const chromeAPI = window['chrome'];
                              chromeAPI.runtime.sendMessage({
                                api: "LocalStorage",
                                action: "clear",
                                requestId: Date.now().toString()
                              }, function(response) {
                                if (chromeAPI.runtime.lastError) {
                                  console.error('Error clearing keys:', chromeAPI.runtime.lastError);
                                  showToast('Failed to clear keys: ' + (chromeAPI.runtime.lastError.message || 'Unknown error'), 'error');
                                } else {
                                  showToast('All keys cleared successfully!', 'success');
                                }
                              });
                            } else {
                              // Extension API not available, try BroadcastChannel
                              tryBroadcastChannelClear();
                            }
                          } catch (error) {
                            console.error('Error clearing keys:', error);
                            showToast(`Failed to clear keys: ${error.message || 'Unknown error'}`, 'error');
                            
                            // Try using BroadcastChannel as fallback
                            tryBroadcastChannelClear();
                          }
                        };
                        
                        // Try using BroadcastChannel if direct access fails
                        const tryBroadcastChannelClear = () => {
                          try {
                            const channel = new BroadcastChannel('xx-network-secure-extension');
                            
                            // Set up a timeout to handle no response
                            const timeout = setTimeout(() => {
                              channel.close();
                              showToast('Failed to clear keys: No response from extension', 'error');
                            }, 5000);
                            
                            // Listen for response
                            channel.onmessage = function(event) {
                              clearTimeout(timeout);
                              
                              const message = event.data;
                              if (message.action === 'clearResult') {
                                if (message.success) {
                                  showToast('All keys cleared successfully!', 'success');
                                } else {
                                  showToast(`Failed to clear keys: ${message.error || 'Unknown error'}`, 'error');
                                }
                                
                                // Close the channel
                                channel.close();
                              }
                            };
                            
                            // Send clear request
                            channel.postMessage({
                              action: 'clearKeys'
                            });
                          } catch (error) {
                            console.error('Failed to use BroadcastChannel:', error);
                            showToast('Failed to clear keys: Cannot connect to extension', 'error');
                          }
                        };
                        
                        // Start the clearing process
                        clearKeys();
                      }
                    };
                  }
                  
                  buttonWrap.appendChild(actionButton);
                  buttonsContainer.appendChild(buttonWrap);
                });
                
                // Add the buttons container to the content
                content.appendChild(buttonsContainer);
                
              }, 2000); // 2 second delay
            }
          };
          
          // Add the event listener to the window
          window.addEventListener('keydown', successKeyHandler);
        }
      };
      
      // Add the event listener to the window
      window.addEventListener('keydown', enterKeyHandler);
    };
    
    buttonContainer.appendChild(button);

    // Hide current iframe
    /* const iframe = document.createElement('iframe');
    iframe.src = 'http://localhost:5173';
    iframe.style.cssText = `
      border: none;
      width: 100%;
      height: 350px;
      border-radius: 8px;
    `;
    */


    // Below this is the code to assemble the UI of the popup
    //-------------------------------------------------------------------------

    // Assemble the popup
 
    content.appendChild(logoContainer);
    content.appendChild(buttonContainer);
    //content.appendChild(iframe);
  
    popup.appendChild(closeButton);
    popup.appendChild(content);
    
    // Add to page
    document.body.appendChild(popup);
    
    console.log("Popup function: Popup created successfully");
  } catch(error) {
    console.error("Popup function: Error creating popup", error);
  }
}

//Below this line is the code for the background script that deals with the local storage
//-------------------------------------------------------------------------

// Handle messages from content script
browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log("Service worker: Message received", message);

  //TODO: validation usign zod? check zod size or do custom validation
  const msg = message as TMessage;
  if (msg.api === "LocalStorage") {
    if (msg.action === "clear") {
      await browser.storage.local.clear();
      const response: TResponse = {
        api: "LocalStorage:Response",
        action: "clear",
        requestId: msg.requestId,
      };
      sendResponse(response);
    }

    if (msg.action === "getItem") {
      const result = await browser.storage.local.get(msg.key);
      const response: TResponse = {
        api: "LocalStorage:Response",
        action: "getItem",
        result: result[msg.key],
        requestId: msg.requestId,
      };

      return response;
    }

    if (msg.action === "removeItem") {
      const response: TResponse = {
        api: "LocalStorage:Response",
        action: "removeItem",
        result: localStorage.removeItem(msg.key),
        requestId: msg.requestId,
      };
      return response;
    }
    if (msg.action === "setItem") {
      //TODO: some storage local promise might not fail
      await browser.storage.local.set({ [msg.key]: msg.value });
      browser.storage.local.onChanged.addListener((changes) => {
        console.log("changes", changes);
      });
      console.log("setting item", msg.key, msg.value);

      const response: TResponse = {
        api: "LocalStorage:Response",
        action: "setItem",
        requestId: msg.requestId,
      };
      return response;
    }

    if (msg.action === "clear") {
      //TODO: some storage local promise might not fail
      await browser.storage.local.clear();
      const response: TResponse = {
        api: "LocalStorage:Response",
        action: "clear",
        requestId: msg.requestId,
      };
      return response;
    }
  }
  
  return true;
});

// Set up a BroadcastChannel to communicate with the popup window
try {
  const channel = new BroadcastChannel('xx-network-secure-extension');
  
  channel.onmessage = async function(event) {
    console.log('Service worker received broadcast message:', event.data);
    
    const message = event.data;
    
    if (message.action === 'importKeys') {
      try {
        // Store the batch of keys in the extension's storage
        const keys = message.keys;
        const entries = Object.entries(keys);
        let successCount = 0;
        
        for (const [key, value] of entries) {
          try {
            await browser.storage.local.set({ [key]: value });
            successCount++;
          } catch (error) {
            console.error(`Failed to store key in extension storage: ${key}`, error);
          }
        }
        
        // Send back result
        channel.postMessage({
          action: 'importResult',
          success: true,
          count: successCount,
          batchNumber: message.batchNumber,
          totalBatches: message.totalBatches
        });
      } catch (error) {
        console.error('Error processing import batch:', error);
        
        // Send error result
        channel.postMessage({
          action: 'importResult',
          success: false,
          count: Object.keys(message.keys).length,
          error: error.message || 'Unknown error',
          batchNumber: message.batchNumber,
          totalBatches: message.totalBatches
        });
      }
    } else if (message.action === 'exportKeys') {
      try {
        // Retrieve all keys from the extension's storage
        const data = await browser.storage.local.get(null); // null gets all items
        
        // Send back the data
        channel.postMessage({
          action: 'exportResult',
          success: true,
          data: data
        });
      } catch (error) {
        console.error('Error exporting keys:', error);
        
        // Send error result
        channel.postMessage({
          action: 'exportResult',
          success: false,
          error: error.message || 'Unknown error'
        });
      }
    } else if (message.action === 'clearKeys') {
      try {
        // Clear all keys from the extension's storage
        await browser.storage.local.clear();
        
        // Send back success result
        channel.postMessage({
          action: 'clearResult',
          success: true
        });
      } catch (error) {
        console.error('Error clearing keys:', error);
        
        // Send error result
        channel.postMessage({
          action: 'clearResult',
          success: false,
          error: error.message || 'Unknown error'
        });
      }
    }
  };
  
  console.log('Service worker: BroadcastChannel initialized');
} catch (error) {
  console.error('Service worker: Failed to initialize BroadcastChannel:', error);
}

// Function to process keys from imported JSON
async function processKeys(jsonData) {
  let successCount = 0;
  let failedCount = 0;
  let totalKeys = Object.entries(jsonData).length;
  let processedCount = 0;
  
  // Show initial progress toast
  const progressToast = document.createElement('div');
  progressToast.textContent = `Processing 0/${totalKeys} keys...`;
  progressToast.style.cssText = `
    position: fixed;
    bottom: 60px;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px 20px;
    border-radius: 4px;
    background-color: #2196F3;
    color: white;
    font-size: 14px;
    z-index: 10000000;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  `;
  document.body.appendChild(progressToast);
  
  // Process keys in batches to avoid overwhelming the message system
  const entries = Object.entries(jsonData);
  const updateInterval = Math.max(1, Math.floor(totalKeys / 10)); // Update progress every 10% or for each key if less than 10
  
  try {
    // First try using the extension API methods
    if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.sendMessage) {
      console.log('Using Firefox extension API for import');
      // Use Firefox extension API
      for (const [key, value] of entries) {
        try {
          await browser.runtime.sendMessage({
            api: "LocalStorage",
            action: "setItem",
            key: key,
            value: value,
            requestId: Date.now().toString()
          });
          successCount++;
        } catch (error) {
          console.error(`Failed to import key "${key}":`, error);
          failedCount++;
        }
        
        processedCount++;
        if (processedCount % updateInterval === 0 || processedCount === totalKeys) {
          progressToast.textContent = `Processing ${processedCount}/${totalKeys} keys...`;
        }
      }
    } else if (typeof window['chrome'] !== 'undefined' && window['chrome'].runtime && window['chrome'].runtime.sendMessage) {
      console.log('Using Chrome extension API for import');
      // Use Chrome extension API (with window['chrome'] to avoid TypeScript errors)
      const chromeAPI = window['chrome'];
      for (const [key, value] of entries) {
        try {
          chromeAPI.runtime.sendMessage({
            api: "LocalStorage",
            action: "setItem",
            key: key,
            value: value,
            requestId: Date.now().toString()
          }, function(response) {
            if (chromeAPI.runtime.lastError) {
              console.error(`Failed to import key "${key}":`, chromeAPI.runtime.lastError);
              failedCount++;
            } else {
              successCount++;
            }
          });
          
          // We need to manually count here because the callback is asynchronous
          processedCount++;
          if (processedCount % updateInterval === 0 || processedCount === totalKeys) {
            progressToast.textContent = `Processing ${processedCount}/${totalKeys} keys...`;
          }
        } catch (error) {
          console.error(`Failed to import key "${key}":`, error);
          failedCount++;
          processedCount++;
        }
      }
    } else {
      console.log('No extension APIs found, using localStorage fallback');
      // Fallback to localStorage if extension APIs are not available
      for (const [key, value] of entries) {
        try {
          // For localStorage, we need to stringify objects
          localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
          successCount++;
        } catch (error) {
          console.error(`Failed to import key "${key}":`, error);
          failedCount++;
        }
        
        processedCount++;
        if (processedCount % updateInterval === 0 || processedCount === totalKeys) {
          progressToast.textContent = `Processing ${processedCount}/${totalKeys} keys...`;
        }
      }
    }
  } catch (error) {
    console.error('Error during key processing:', error);
    
    // If there was a global error, try localStorage as a last resort
    console.log('Trying localStorage as a last resort');
    for (const [key, value] of entries) {
      try {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        successCount++;
      } catch (storageError) {
        console.error(`Failed to store key in localStorage: ${key}`, storageError);
        failedCount++;
      }
      
      processedCount++;
      if (processedCount % updateInterval === 0 || processedCount === totalKeys) {
        progressToast.textContent = `Processing ${processedCount}/${totalKeys} keys...`;
      }
    }
  }
  
  // Remove progress toast
  if (document.body.contains(progressToast)) {
    document.body.removeChild(progressToast);
  }
  
  return {
    success: successCount,
    failed: failedCount,
    total: totalKeys
  };
}
