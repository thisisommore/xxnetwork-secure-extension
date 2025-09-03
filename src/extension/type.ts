// type from Extension
type BaseMessage<Api extends `${string}:${"Request" | "Response"}`> = {
  api: Api;
  requestId: string;
};

type TLSRequest = BaseMessage<"LocalStorage:Request"> &
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

type TLockRequest = BaseMessage<"Lock:Request"> & {
  action: "unlock";
};

type TLockResponse = BaseMessage<"Lock:Response"> & {
  action: "unlocked";
};

type TLSResponse = BaseMessage<"LocalStorage:Response"> &
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
        action: "removeItem" | "clear" | "setItem" | "locked";
      }
  );

export type TResponse = TLSResponse | TLockResponse;
export type TRequest = TLSRequest | TLockRequest;
