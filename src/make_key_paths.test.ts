import { expect } from "@std/expect";
import { make_key_paths as test_target } from "./make_key_paths.ts";

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
