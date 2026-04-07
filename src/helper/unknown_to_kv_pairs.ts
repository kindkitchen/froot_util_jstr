import type { JsonValue } from "../types.ts";
import { is_json_non_primitive } from "./is_json_non_primitive.ts";

export function unknown_to_kv_pairs(value: unknown) {
  if (is_json_non_primitive(value)) {
    return Array.isArray(value)
      ? value.map((v, i) => [i, v]) as [number, JsonValue][]
      : Object.entries(value) as [string, JsonValue][];
  }

  return [];
}
