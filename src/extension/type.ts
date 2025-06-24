type BaseLocalStorageMessage = {
  api: "LocalStorage";
  key: string;
  requestId: string;
};

export type TMessage =
  | (BaseLocalStorageMessage & {
      action: "getItem" | "removeItem" | "clear" | "keys";
    })
  | (BaseLocalStorageMessage & {
      action: "setItem";
      value: string;
    });

export type TResponse = {
  api: "LocalStorage:Response";
  action: "getItem" | "removeItem" | "clear" | "setItem" | "keys";
  result?: unknown;
  requestId: string;
};
