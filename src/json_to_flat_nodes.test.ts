import { expect } from "@std/expect/expect";
import { follow_key_path } from "./helper/mod.ts";
import { json_to_flat_nodes as test_target } from "./json_to_flat_nodes.ts";

const test_name = `Check ${test_target.name} function`;

Deno.test(test_name, async (t) => {
  await t.step(
    "Should correctly worked with objects",
    () => {
      const user = {
        name: "nik",
        age: 34,
      };
      const actual = test_target(user, {
        compute_node(value, type, path, has_root, root, root_type) {
          return type;
        },
      });
      expect(actual).toEqual(["{}", "string", "number"]);
    },
  );

  await t.step("Should correctly worked with arrays", () => {
    const bingo = "bingo";
    const arr = [[[[bingo]]]];
    const actual = test_target(arr);
    console.log(actual);
  });

  await t.step("Should work with difficult exmple", async (t) => {
    const compute_node = (...[v, tv, p, is, root, troot]: any[]) => {
      try {
        if (root) {
          return follow_key_path([p.pop()!], root) === v;
        }

        return "not a root";
      } catch (_err) {
        expect("Not happen(((").toBe(
          "value === root[keys.pop()]",
        );
      }
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
      user_2: {
        name: {
          first: {
            long: "aleksey",
            short: "alex",
          },
          last: "borisov",
        },
      },
      user3: {
        name: "nik",
        ami: true,
        age: 34,
        brother: {
          name: "matvii",
          ami: false,
          age: 23,
        },
        friends: [
          {
            name: "alex",
            ami: false,
            age: 23,
            brother: null,
          },
        ],
      },
    };
    const data = test_target(example, {
      traverse_strategy: "DFS (depth-first-search)",
      compute_node,
    });

    const data2 = test_target(example, {
      traverse_strategy: "level-by-level",
      compute_node,
    });

    expect(data.length).toBe(data2.length);
  });
});
