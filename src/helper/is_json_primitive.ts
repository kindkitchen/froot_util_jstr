import { JsonPrimitive } from "../types.ts";

export function is_json_primitive<T extends JsonPrimitive>(v: unknown): v is T {
  return v === null || typeof v === "string" || typeof v === "number" ||
    typeof v === "boolean";
}
