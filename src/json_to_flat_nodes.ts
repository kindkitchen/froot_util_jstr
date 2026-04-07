import type { JsonArray, JsonObject, JsonValue } from "./types.ts";
import {
  is_json_non_primitive,
  is_json_primitive,
  unknown_to_kv_pairs,
} from "./helper/mod.ts";

export function json_to_flat_nodes<
  JNode = {
    value: JsonValue;
    path: Key[];
    type: JType;
    has_root: boolean;
    root: JsonArray | JsonObject | undefined;
    root_type: "{}" | "[]" | undefined;
    total_root_items: number | undefined;
    index_in_root: number | undefined;
  },
>(
  something: unknown,
  options: Partial<{
    /**
     * How to iterate over nodes
     * - DPS means go deeper whenever possible
     * - Level by level - go deeper after exploring siblings
     *
     * DPS is a default value
     */
    traverse_strategy: TraverseStrategy;
    compute_node: (
      /**
       * Strict-Json value
       * - string | number | boolean | null
       * - array
       * - object (like {} literal)
       */
      value: JsonValue,
      /**
       * Type clarification for value
       */
      type: JType,
      /**
       * Array of path to this node
       * > number for index in array
       * > string for key in object
       */
      path: Key[],
      /**
       * Obviously any value except origin itself will have `true`
       */
      has_root: boolean,
      /**
       * That's why root is alway non-undefined except first ever case
       * So `has_root` is a sugar to `root !== undefined`
       * P.S.
       * In case <has_root> is <false> - all rest parameters will have <undefined>.
       * And again - in practice this is happen for first initial value only.
       */
      root: JsonArray | JsonObject | undefined,
      /**
       * Type clarification for root.
       * object | array
       * (undefined if no root)
       */
      root_type: "[]" | "{}" | undefined,
      /**
       * The number of items (actual both for array or object)
       * among which current value is placed
       */
      total_root_items: number | undefined,
      /**
       * The index of the value in the root, where it was placed during iteration.
       * For array-roots this is simple index of value, for object-roots - this is
       * the index, under which this key=value is placed
       */
      index_in_root: number | undefined,
    ) => JNode;
  }> = {},
) {
  const {
    traverse_strategy = "DFS (depth-first-search)",
    compute_node = (
      value,
      type,
      path,
      has_root,
      root,
      root_type,
      total_root_items,
      index_in_root,
    ) => ({
      value,
      path,
      type,
      has_root,
      root,
      root_type,
      total_root_items,
      index_in_root,
    }),
  } = options;

  if (is_json_primitive(something)) {
    return [
      compute_node(
        something,
        typeof something as "string" | "number" | "boolean" | "null",
        [],
        false,
        undefined,
        undefined,
        undefined,
        undefined,
      ),
    ];
  } else if (!is_json_non_primitive(something)) {
    return [];
  }

  const result = [
    compute_node(
      something,
      Array.isArray(something) ? "[]" : "{}",
      [],
      false,
      undefined,
      undefined,
      undefined,
      undefined,
    ),
  ];

  if (traverse_strategy === "DFS (depth-first-search)") {
    const non_primitive_stack = [] as Array<[
      value: (JsonArray | JsonObject),
      path_to_value_from_root: Key[],
      root: (JsonArray | JsonObject),
      self_index_in_root: number,
    ]>;
    const children = unknown_to_kv_pairs(something);
    children.forEach(([k, v], i) => {
      const path = [k];
      if (is_json_non_primitive(v)) {
        non_primitive_stack.push([v, path, something, i]);
      } else if (is_json_primitive(v)) {
        result.push(
          compute_node(
            v,
            typeof v as "string" | "number" | "boolean" | "null",
            path,
            true,
            something,
            Array.isArray(something) ? "[]" : "{}",
            children.length,
            i,
          ),
        );
      }
    });
    while (non_primitive_stack.length) {
      const [value, prev_path, root, i] = non_primitive_stack.pop()!;
      const children = unknown_to_kv_pairs(value);
      result.push(
        compute_node(
          value,
          Array.isArray(value) ? "[]" : "{}",
          prev_path,
          true,
          root,
          Array.isArray(root) ? "[]" : "{}",
          Array.isArray(root) ? root.length : Object.values(root).length,
          i,
        ),
      );
      children.forEach(([k, v], i) => {
        const path = [...prev_path, k];
        if (is_json_non_primitive(v)) {
          non_primitive_stack.push([v, path, value, i]);
        } else if (is_json_primitive(v)) {
          result.push(
            compute_node(
              v,
              typeof v as "string" | "number" | "boolean" | "null",
              path,
              true,
              value,
              Array.isArray(value) ? "[]" : "{}",
              children.length,
              i,
            ),
          );
        }
      });
    }

    return result;
  } else if (traverse_strategy === "level-by-level") {
    const iteration = unknown_to_kv_pairs(something).map(([k, v], i) =>
      [v, [k], something, i] as [
        value: (JsonArray | JsonObject),
        path_to_value_from_root: Key[],
        root: (JsonArray | JsonObject),
        self_index_in_root: number,
      ]
    );
    for (const [value, path, root, index] of iteration) {
      if (is_json_primitive(value)) {
        result.push(
          compute_node(
            value,
            typeof value as "string" | "number" | "boolean" | "null",
            path,
            true,
            root,
            Array.isArray(root) ? "[]" : "{}",
            Array.isArray(root) ? root.length : Object.values(root).length,
            index,
          ),
        );
        continue;
      } else if (is_json_non_primitive(value)) {
        result.push(
          compute_node(
            value,
            Array.isArray(value) ? "[]" : "{}",
            path,
            true,
            root,
            Array.isArray(root) ? "[]" : "{}",
            Array.isArray(root) ? root.length : Object.values(root).length,
            index,
          ),
        );
        const next_level = unknown_to_kv_pairs(value)
          .map(([k, v], i) =>
            [v, [...path, k], value, i] as [
              JsonArray | JsonObject,
              Key[],
              JsonArray | JsonObject,
              number,
            ]
          );
        iteration.push(...next_level);
      }
    }

    return result;
  }

  throw new Error(
    `Unknown value for <traverse_strategy> option! (possible values are ${[
      "DFS (depth-first-search)",
      "level-by-level",
    ] satisfies TraverseStrategy[]})`,
  );
}

type TraverseStrategy = "DFS (depth-first-search)" | "level-by-level";
type Key = string | number;
type JType = "{}" | "[]" | "string" | "number" | "boolean" | "null";
