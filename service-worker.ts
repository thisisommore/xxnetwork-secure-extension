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
    button.innerHTML = `Secure Connection <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 8px;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>`;
    
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
      
      fakeButton.innerHTML = `Extracting KV <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 8px;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>`;
      
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
          fakeButton.innerHTML = `Clearing Local Storage <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 8px;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>`;
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
