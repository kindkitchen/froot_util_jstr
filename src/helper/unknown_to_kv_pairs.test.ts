import { unknown_to_kv_pairs as test_target } from "./unknown_to_kv_pairs.ts";
import { expect } from "@std/expect";

const test_name = `Check ${test_target.name} function`;

Deno.test(test_name, async (t) => {
  await first_case(t);
  await second_case(t);
});

async function first_case(t: Deno.TestContext) {
  await t.step("Should return empty array", async (t) => {
    for (
      const value of [
        1,
        null,
        true,
        false,
        "ok",
        "",
        {},
        [],
        Symbol("hi!"),
        class {},
        () => {},
        NaN,
        undefined,
      ]
    ) {
      await t.step(`Case: ${String(value)}`, () => {
        const actual = test_target(value);
        expect(actual).toEqual([]);
      });
    }
  });
}
async function second_case(t: Deno.TestContext) {
  await t.step("Should return key value pairs", async (t) => {
    for (
      const value of [
        { hello: "world", ok: "google", foo: "bar" },
        [1, 2, 3],
      ]
    ) {
      await t.step(`Case: ${String(value)}`, () => {
        const actual = test_target(value);
        expect(actual).toBeInstanceOf(Array);
        expect(actual.length).toBe(
          Array.isArray(value) ? value.length : Object.entries(value).length,
        );
      });
    }
  });
}
