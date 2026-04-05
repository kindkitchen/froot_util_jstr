import { json_to_splitted_string_with_meta as test_target } from "./json_to_splitted_string_with_meta.ts";

const test_name = `Check ${test_target.name} function`;

Deno.test(test_name, async (t) => {
  await t.step(
    "Should correctly parse object",
    () => {
      const user = {
        name: "nik",
        age: 34,
      };
      const result = test_target(user);
      result.map((r) => r);
    },
  );
});
