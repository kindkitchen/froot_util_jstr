import { is_json_non_primitive } from "./helper/is_json_non_primitive.ts";
import { is_json_primitive } from "./helper/is_json_primitive.ts";
import { JsonArray, JsonObject, JsonValue } from "./types.ts";

/**
 * Collect all possible paths in a value.
 */
export function make_key_paths(
  original: JsonObject | JsonArray,
): (string | number)[][] {
  type _El = [string | number, JsonValue, (string | number)[]];
  const paths = [] as (string | number)[][];
  const iteration: _El[] = Array.isArray(original)
    ? original.map((v, i) => [i, v, []])
    : Object.entries(original).map(([k, v]) => [k, v, []]);

  for (const item of iteration) {
    const [k, value, up_level_paths] = item;
    const is_non_primitive = is_json_non_primitive(value);

    if (!is_json_primitive(value) && !is_non_primitive) {
      continue;
    }

    paths.push(
      [
        ...up_level_paths,
        k,
      ],
    );

    if (is_non_primitive) {
      const p = [...up_level_paths, k];
      const tail = Array.isArray(value)
        ? value.map((v, i) => [i, v, p] as _El)
        : Object.entries(value).map((
          [k, v],
        ) => [k, v, p] as _El);
      iteration.push(...tail);
    }
  }

  return paths;
}
