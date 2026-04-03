import { expect } from "@std/expect";
import { follow_key_path as test_target } from "./follow_key_path.ts";

const test_name = `Check ${test_target.name} function`;

Deno.test(test_name, async (t) => {
  await t.step(
    "Should correctly worked with objects (even with getters)",
    () => {
      const user = {
        name: "nik",
        age: 34,
        get myself() {
          return user;
        },
      };
      const actual = test_target(["myself", "age"], user);
      expect(actual).toBe(34);
    },
  );

  await t.step("Should correctly worked with arrays", () => {
    const bingo = "bingo";
    const arr = [[[[bingo]]]];
    const actual = test_target([0, 0, 0, 0], arr);
    expect(actual).toBe(bingo);
  });
});
