type BaseLocalStorageMessage = {
  api: "LocalStorage";
  key: string;
  requestId: string;
};

export type TMessage =
  | (BaseLocalStorageMessage & {
      action: "getItem" | "removeItem" | "clear";
    })
  | (BaseLocalStorageMessage & {
      action: "setItem";
      value: string;
    });

export type TResponse = {
  api: "LocalStorage:Response";
  action: "getItem" | "removeItem" | "clear" | "setItem";
  result?: unknown;
  requestId: string;
};
