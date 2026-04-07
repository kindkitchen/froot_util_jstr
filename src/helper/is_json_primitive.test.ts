import { is_json_primitive as test_target } from "./is_json_primitive.ts";
import { expect } from "@std/expect";

const test_name = `Check ${test_target.name} function`;

Deno.test(test_name, async (t) => {
  await positive_case(t);
  await negative_case(t);
});

async function positive_case(t: Deno.TestContext) {
  await t.step("Should be a json primitive", async (t) => {
    for (
      const value of [
        1,
        null,
        true,
        false,
        "ok",
        "",
      ]
    ) {
      await t.step(`Case: ${String(value)}`, () => {
        const actual = test_target(value);
        expect(actual).toBe(true);
      });
    }
  });
}
async function negative_case(t: Deno.TestContext) {
  await t.step("Should NOT be a json primitive", async (t) => {
    for (
      const value of [
        {},
        [],
        Symbol("oops"),
        class {},
        () => {},
      ]
    ) {
      await t.step(`Case: ${String(value)}`, () => {
        const actual = test_target(value);
        expect(actual).toBe(false);
      });
    }
  });
}
