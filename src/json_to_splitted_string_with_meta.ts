import { json_to_flat_nodes } from "../mod.ts";
import type { JsonArray, JsonObject } from "./types.ts";

export function json_to_splitted_string_with_meta(
  target: JsonArray | JsonObject,
) {
  const data = json_to_flat_nodes(target);
  const result = [] as any[];
  let prev_path = data.at(0)?.path!;
  const navigation = [];

  for (const node of data) {
    /**
     * >>>>
     * Compute key of the current node
     * - "key from object":
     * - "" (skip because it is array's index)
     * - "" (skip because this is a root node)
     */
    const key = typeof node.path.at(-1) === "string"
      ? JSON.stringify(node.path.at(-1)) + ":"
      : "";
    /// <<<<

    /**
     * >>>>
     * First iteration (root node)
     */
    if (result.length === 0) {
      /// TODO - partially ducplicated code... (it is simple to explicitly handle first ever case but... ugly)
      const [open, close] = node.type === "array" ? ["[", "]"] : ["{", "}"];
      result.push(key + open);
      const childs = Array.from({ length: node.len! }).map(() => []);
      result.push(...childs);
      result.push(close);
      navigation.push(0);
      prev_path = node.path; /// duplicate because of <continue usage>
      continue;
    }
    /// <<<<

    /**
     * >>>>
     * Compute navigation for current node
     */
    if (node.path.length === prev_path.length) {
      /**
       * Continue traverse over the same level
       * - move cursor to next container
       */
      ++navigation[navigation.length - 1];
    } else if (node.path.length > prev_path.length) {
      /**
       * Go one level deeper - nothing to do now,
       * the new containers will be created.
       */
    } else if (node.path.length < prev_path.length) {
      /**
       * Back to upper tree's part (probably some level at once)
       */
      for (let i = 0; i < prev_path.length - node.path.length; ++i) {
        navigation.pop();
      }
      ++navigation[navigation.length - 1];
    }
    //// <<<<

    const container = navigation.reduce((acc, i) => {
      return acc.filter((el) => Array.isArray(el))[i];
    }, result);

    if (node.value !== undefined) {
      container.push(`${key}${JSON.stringify(node.value)}`);
    } else {
      const [open, close] = node.type === "array" ? ["[", "]"] : ["{", "}"];
      container.push(key + open);
      const childs = Array.from({ length: node.len! }).map(() => []);
      container.push(...childs);
      container.push(close);
      if (childs.length) {
        navigation.push(0);
      }
    }

    prev_path = node.path;
  }

  return result;
}
