type Message<T extends string> = {
  api: T;
  requestId: string;
};

type BaseLocalStorageRequest = Message<"LocalStorage:Request">;

export type TRequest =
  | (BaseLocalStorageRequest & {
      action: "clear" | "keys";
    })
  | (BaseLocalStorageRequest & {
      action: "getItem" | "removeItem";
      key: string;
    })
  | (BaseLocalStorageRequest & {
      action: "setItem";
      key: string;
      value: string;
    });

type BaseLocalStorageResponse = Message<"LocalStorage:Response">;

export type TResponse =
  | (BaseLocalStorageResponse & {
      action: "getItem";
      result: unknown;
    })
  | (BaseLocalStorageResponse & {
      action: "keys";
      result: string[];
    })
  | (BaseLocalStorageResponse & {
      action: "removeItem" | "clear" | "setItem";
    });
