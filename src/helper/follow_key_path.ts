import { JsonArray, JsonObject, JsonValue } from "../types.ts";

export function follow_key_path(
  path: (string | number)[],
  value: JsonObject | JsonArray,
) {
  return path.reduce((acc, key) => {
    acc = (acc as any)[key];
    return acc;
  }, value as JsonValue);
}
