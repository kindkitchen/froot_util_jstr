import { JsonArray, JsonObject } from "../types.ts";

export function is_json_non_primitive<T extends JsonObject | JsonArray>(
  v: unknown,
): v is T {
  /// {...} or [...] only
  return typeof v === "object" && v !== null;
}
