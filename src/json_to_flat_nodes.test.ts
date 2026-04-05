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
      const actual = test_target(user);
      console.log(actual);
    },
  );

  await t.step("Should correctly worked with arrays", () => {
    const bingo = "bingo";
    const arr = [[[[bingo]]]];
    const actual = test_target(arr);
    console.log(actual);
  });
});
