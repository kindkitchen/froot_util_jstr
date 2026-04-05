import { is_json_curly_braced_object } from "@kindkitchen/util-jstr";
import { is_json_non_primitive } from "./helper/is_json_non_primitive.ts";
import { is_json_primitive } from "./helper/is_json_primitive.ts";
import type {
  JsonArray,
  JsonObject,
  JsonPrimitive,
  JsonValue,
} from "./types.ts";

/**
 * Collect all possible paths in a value.
 */
export function json_to_flat_nodes(
  original: JsonObject | JsonArray,
): _Result {
  const meta_nodes = [] as _Result;
  const iteration: _El[] = Array.isArray(original)
    ? original.map((v, i) => [i, v, []])
    : Object.entries(original).map(([k, v]) => [k, v, []]);

  const root_path = is_json_curly_braced_object(original)
    ? {
      path: [],
      type: "object" as const,
      value: undefined,
      len: iteration.length,
    }
    : {
      path: [],
      type: "array" as const,
      value: undefined,
      len: iteration.length,
    } as _Result[number];
  meta_nodes.push(root_path);

  for (const item of iteration) {
    const [k, value, up_level_paths] = item;
    const is_non_primitive = is_json_non_primitive(value);

    if (!is_json_primitive(value) && !is_non_primitive) {
      continue;
    }

    const type = Array.isArray(value)
      ? "array"
      : value === null
      ? "null"
      : typeof value === "object"
      ? "object"
      : typeof value as "string" | "number" | "boolean";
    const meta: _Result[number] = {
      path: [...up_level_paths, k],
      len: undefined,
      type,
      value: type !== "object" && type !== "array"
        ? value as JsonPrimitive
        : undefined,
    };

    if (is_non_primitive) {
      const p = [...up_level_paths, k];
      const tail = Array.isArray(value)
        ? value.map((v, i) => [i, v, p] as _El)
        : Object.entries(value).map((
          [k, v],
        ) => [k, v, p] as _El);
      iteration.push(...tail);
      meta.len = tail.length;
    }

    meta_nodes.push(meta);
  }
  return meta_nodes.sort((a, b) => {
    const i_diff = a.path.findIndex((p, i) => p !== b.path[i]);
    const i_a = a.path[i_diff];
    const i_b = b.path[i_diff];
    if (typeof i_a === "number" && typeof i_b === "number") {
      return 0;
    }
    return i_a > i_b ? -1 : 1;
  });
}

type _Result = {
  value: JsonPrimitive | undefined;
  len: undefined | number;
  type: "array" | "object" | "null" | "string" | "number" | "boolean";
  path: (string | number)[];
}[];
type _El = [string | number, JsonValue, (string | number)[]];
