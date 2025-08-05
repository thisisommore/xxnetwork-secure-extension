// type from Extension
type BaseMessage<Api extends string> = {
  api: Api;
  requestId: string;
};

export type TRequest = BaseMessage<"LocalStorage:Request"> &
  (
    | {
        action: "clear" | "keys";
      }
    | {
        action: "getItem" | "removeItem";
        key: string;
      }
    | {
        action: "setItem";
        key: string;
        value: string;
      }
  );

export type TResponse = BaseMessage<"LocalStorage:Response"> &
  (
    | {
        action: "getItem";
        result: unknown;
      }
    | {
        action: "keys";
        result: string[];
      }
    | {
        action: "removeItem" | "clear" | "setItem";
      }
  );
