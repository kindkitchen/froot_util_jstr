import { is_json_curly_braced_object as test_target } from "./is_json_curly_braced_object.ts";
import { expect } from "@std/expect";

const test_name = `Check ${test_target.name} function`;

Deno.test(test_name, async (t) => {
  await positive_case(t);
  await negative_case(t);
});

async function positive_case(t: Deno.TestContext) {
  await t.step("Should be a json-object", async (t) => {
    for (
      const value of [
        {},
        { ok: true },
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
  await t.step("Should NOT be a json-object", async (t) => {
    for (
      const value of [
        null,
        true,
        false,
        undefined,
        "hello world",
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
