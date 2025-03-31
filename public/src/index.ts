function generateRequestId(): string {
  return Math.random().toString(36).slice(2, 11);
}

function sendMessage<T>(action: string, key?: string, value?: any): Promise<T> {
  const requestId = generateRequestId();
  return new Promise((resolve) => {
    const handler = (event: MessageEvent) => {
      if (event.data?.requestId === requestId) {
        window.removeEventListener("message", handler);
        resolve(event.data.result);
      }
    };
    window.addEventListener("message", handler);

    window.postMessage({
      api: "LocalStorage",
      action,
      key,
      value,
      requestId,
    });
  });
}

const windowStorage = {
  getItem: function (key: string): Promise<string | null> {
    return sendMessage("getItem", key);
  },

  setItem: function (key: string, value: any): Promise<void> {
    return sendMessage("setItem", key, value);
  },

  removeItem: function (key: string): Promise<void> {
    return sendMessage("removeItem", key);
  },

  clear: function (): Promise<void> {
    return sendMessage("clear");
  },
};

// Initialize the global instance
(window as any).windowStorage = windowStorage;
