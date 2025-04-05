type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

//TODO extract functions from localStorage - type
//TODO TMessage uses duplicate for type props
export type TMessage =
  | {
      api: "LocalStorage";
      action: "getItem" | "removeItem" | "clear";
      key: string;
      requestId: string;
    }
  | {
      api: "LocalStorage";
      action: "setItem";
      key: string;
      value: string;
      requestId: string;
    };

//TODO: maybe req id to track?
export type TResponse = {
  api: "LocalStorage:Response";
  action: "getItem" | "removeItem" | "clear" | "setItem";
  result?: unknown;
  requestId: string;
};
