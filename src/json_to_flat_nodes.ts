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
       */
      root: JsonArray | JsonObject | undefined,
      /**
       * Type clarification for root.
       * object | array
       * (undefined if no root)
       */
      root_type: "[]" | "{}" | undefined,
    ) => JNode;
  }> = {},
) {
  const {
    traverse_strategy = "DFS (depth-first-search)",
    compute_node = (value, type, path, has_root, root, root_type) => ({
      value,
      path,
      type,
      has_root,
      root,
      root_type,
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
    ),
  ];

  if (traverse_strategy === "DFS (depth-first-search)") {
    const non_primitive_stack = [] as Array<[
      (JsonArray | JsonObject),
      Key[],
      (JsonArray | JsonObject),
    ]>;
    for (const [k, v] of unknown_to_kv_pairs(something)) {
      const path = [k];
      if (is_json_non_primitive(v)) {
        non_primitive_stack.push([v, path, something]);
      } else if (is_json_primitive(v)) {
        result.push(
          compute_node(
            v,
            typeof v as "string" | "number" | "boolean" | "null",
            path,
            true,
            something,
            Array.isArray(something) ? "[]" : "{}",
          ),
        );
      }
    }
    while (non_primitive_stack.length) {
      const [value, prev_path, root] = non_primitive_stack.pop()!;

      result.push(
        compute_node(
          value,
          Array.isArray(value) ? "[]" : "{}",
          prev_path,
          true,
          root,
          Array.isArray(root) ? "[]" : "{}",
        ),
      );
      for (const [k, v] of unknown_to_kv_pairs(value)) {
        const path = [...prev_path, k];
        if (is_json_non_primitive(v)) {
          non_primitive_stack.push([v, path, value]);
        } else if (is_json_primitive(v)) {
          result.push(
            compute_node(
              v,
              typeof v as "string" | "number" | "boolean" | "null",
              path,
              true,
              value,
              Array.isArray(value) ? "[]" : "{}",
            ),
          );
        }
      }
    }

    return result;
  } else if (traverse_strategy === "level-by-level") {
    const iteration = unknown_to_kv_pairs(something).map(([k, v]) =>
      [v, [k], something] as [JsonValue, Key[], JsonArray | JsonObject]
    );
    for (const [value, path, root] of iteration) {
      if (is_json_primitive(value)) {
        result.push(
          compute_node(
            value,
            typeof value as "string" | "number" | "boolean" | "null",
            path,
            true,
            root,
            Array.isArray(root) ? "[]" : "{}",
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
          ),
        );
        const next_level = unknown_to_kv_pairs(value)
          .map(([k, v]) =>
            [v, [...path, k], value] as [
              JsonValue,
              Key[],
              JsonArray | JsonObject,
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
