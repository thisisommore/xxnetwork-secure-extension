import type { ZodObject } from "zod";
import { z, type ZodRawShape } from "zod";
import { MAX_KEY_LENGTH, MAX_VALUE_LENGTH } from "../constants";
const keyType = z.string().max(MAX_KEY_LENGTH);
const valueType = z.string().max(MAX_VALUE_LENGTH);
// Helper: base message with fixed `api` literal
const baseMessage = <A extends string>(api: A) =>
  z.object({
    api: z.literal(api),
    requestId: z.string(),
  });

const baseLSMessage = <T extends ZodRawShape>(schema: ZodObject<T>) => {
  return z
    .object({
      ...baseMessage("LocalStorage:Request").shape,
      ...schema.shape,
    })
    .strict();
};
// ---------- Requests ----------
export const TLSRequestSchema = z.discriminatedUnion("action", [
  baseLSMessage(z.object({ action: z.literal("clear") })),
  baseLSMessage(z.object({ action: z.literal("keys") })),
  baseLSMessage(z.object({ action: z.literal("getItem"), key: keyType })),
  baseLSMessage(z.object({ action: z.literal("removeItem"), key: keyType })),
  baseLSMessage(
    z.object({
      action: z.literal("setItem"),
      key: keyType,
      value: valueType,
    }),
  ),
]);

export const TLockRequestSchema = baseMessage("Lock:Request").and(
  z.object({ action: z.literal("unlock") }),
);

const baseLSResponse = <T extends ZodRawShape>(schema: ZodObject<T>) => {
  return z
    .object({
      ...baseMessage("LocalStorage:Response").shape,
      ...schema.shape,
    })
    .strict();
};
// ---------- Responses ----------
export const TLSResponseSchema = z.discriminatedUnion("action", [
  baseLSResponse(
    z.object({ action: z.literal("getItem"), result: z.unknown() }),
  ),
  baseLSResponse(
    z.object({
      action: z.literal("keys"),
      result: z.array(z.string()),
    }),
  ),
  baseLSResponse(z.object({ action: z.literal("removeItem") })),
  baseLSResponse(z.object({ action: z.literal("clear-requested") })),
  baseLSResponse(z.object({ action: z.literal("setItem") })),
  baseLSResponse(z.object({ action: z.literal("locked") })),
  baseLSResponse(z.object({ action: z.literal("clear") })),
]);

export const TLockResponseSchema = baseMessage("Lock:Response").and(
  z.object({ action: z.literal("unlocked") }),
);

// ---------- Top-level unions ----------
export const TRequestSchema = z.union([TLSRequestSchema, TLockRequestSchema]);

export const TResponseSchema = z.union([
  TLSResponseSchema,
  TLockResponseSchema,
]);

// ---------- Inferred types (optional, if you want Zod-driven TS types) ----------
export type TLSRequest = z.infer<typeof TLSRequestSchema>;
export type TLockRequest = z.infer<typeof TLockRequestSchema>;
export type TLSResponse = z.infer<typeof TLSResponseSchema>;
export type TLockResponse = z.infer<typeof TLockResponseSchema>;
export type TRequest = z.infer<typeof TRequestSchema>;
export type TResponse = z.infer<typeof TResponseSchema>;
export type TAction =
  | TRequest["action"]
  | TResponse["action"]
  | "import_keys"
  | "export_keys"
  | "clear_keys"
  | "started"
  | "lock";
