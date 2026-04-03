import { JsonObject } from "../types.ts";

export function is_json_curly_braced_object<T extends JsonObject>(
  v: unknown,
): v is T {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
