import { groupCollapsed } from "node:console";
import { JsonPrimitive, make_key_paths } from "../mod.ts";
import { stat } from "node:fs";
import { follow_key_path } from "../src/follow_key_path.ts";

const log = (...values: any[]) => {
  console.log(...values);
};
const example = {
  ok: "google",
  arr: [1, 2],
  hello: "world",
  arr2: [[], [], 100, 200],
  user: {
    name: {
      first: {
        long: "nikita",
        short: "nik",
      },
      last: "moiseienko",
    },
  },
  // user_2: {
  //   name: {
  //     first: {
  //       long: "aleksey",
  //       short: "alex",
  //     },
  //     last: "borisov",
  //   },
  // },
  // user: {
  //   name: "nik",
  //   ami: true,
  //   age: 34,
  //   brother: {
  //     name: "matvii",
  //     ami: false,
  //     age: 23,
  //   },
  //   friends: [
  //     {
  //       name: "alex",
  //       ami: false,
  //       age: 23,
  //       brother: null,
  //     },
  //   ],
  // },
};
const data = make_key_paths(example);
const result = [] as any[];
let prev_path = data.at(0)?.path!;
let navigation = [];
for (const node of data) {
  console.log("navigation", navigation);
  console.log("result    ", result);
  console.log("\n");
  console.log("next node");
  console.log(node);
  console.log("\n\n\n");

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
    const [open, close] = generate_open_close_brackets(node.type!);
    result.push(key + open);
    const childs = Array.from({ length: node.len! }).map(() => []);
    result.push(...childs);
    result.push(close);
    navigation.push(0);
  } /// <<<<

  else if (node.path.length === prev_path.length) {
    ++navigation[navigation.length - 1];
    const container = navigation.reduce((acc, i) => {
      return acc.filter((el) => Array.isArray(el))[i];
    }, result);
    if (node.value !== undefined) {
      container.push(`${key}${JSON.stringify(node.value)}`);
    } else {
      const [open, close] = generate_open_close_brackets(node.type);
      container.push(key + open);
      const childs = Array.from({ length: node.len! }).map(() => []);
      container.push(...childs);
      container.push(close);
      if (childs.length) {
        navigation.push(0);
      }
    }
  } else if (node.path.length > prev_path.length) {
    const container = navigation.reduce((acc, i) => {
      return acc.filter((el) => Array.isArray(el))[i];
    }, result);
    if (node.value !== undefined) {
      container.push(`${key}${JSON.stringify(node.value)}`);
    } else {
      const [open, close] = generate_open_close_brackets(node.type);
      container.push(key + open);
      const childs = Array.from({ length: node.len! }).map(() => []);
      container.push(...childs);
      container.push(close);
      if (childs.length) {
        navigation.push(0);
      }
    }
  } else if (node.path.length < prev_path.length) {
    for (let i = 0; i < prev_path.length - node.path.length; ++i) {
      navigation.pop();
    }
    ++navigation[navigation.length - 1];
    console.log(navigation);
    console.log(JSON.stringify(result, null, 0));
    const container = navigation.reduce((acc, i) => {
      console.log(acc);
      console.log(i);
      const segment = acc.filter((el) => Array.isArray(el))[i];

      console.log(segment);

      return segment;
    }, result);
    console.log(container);
    if (node.value !== undefined) {
      container.push(`${key}${JSON.stringify(node.value)}`);
    } else {
      const [open, close] = generate_open_close_brackets(node.type);
      container.push(key + open);
      const childs = Array.from({ length: node.len! }).map(() => []);
      container.push(...childs);
      container.push(close);
      if (childs.length) {
        navigation.push(0);
      }
    }
  } else {
    ////
  }

  prev_path = node.path;
}

log(example, "example");
log(data, "data");
log(result, "result");

function generate_open_close_brackets(type: string): [string, string] {
  if (type === "array") {
    return ["[", "]"];
  } else if (type === "object") {
    return ["{", "}"];
  }

  throw new Error(
    "Incorect usage: should work only for type <array> or <object>",
  );
}


