/**
 * Common type representation of JSON.parse/stringify
 * friendly values in javascript.
 */

export type JsonValue = JsonPrimitive | JsonArray | JsonObject;

export type JsonPrimitive = string | number | boolean | null;

export type JsonArray = JsonValue[];

export type JsonObject = { [key: string]: JsonValue };
