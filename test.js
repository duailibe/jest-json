"use strict";

require(".");

// https://github.com/chalk/ansi-regex/blob/94983fc6ba00e1e9657f72c07eb7b9c75e4011a2/index.js
const ANSI_REGEX = (function ansiRegex() {
  // Valid string terminator sequences are BEL, ESC\, and 0x9c
  const ST = '(?:\\u0007|\\u001B\\u005C|\\u009C)';

  // OSC sequences only: ESC ] ... ST (non-greedy until the first ST)
  const osc = `(?:\\u001B\\][\\s\\S]*?${ST})`;

  // CSI and related: ESC/C1, optional intermediates, optional params (supports ; and :) then final byte
  const csi = '[\\u001B\\u009B][[\\]()#;?]*(?:\\d{1,4}(?:[;:]\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]';

  return new RegExp(`${osc}|${csi}`, 'g');
})()

expect.addSnapshotSerializer({
  test: val => typeof val === "string",
  print: val => val.replace(ANSI_REGEX, ""),
});

describe("toMatchJSON", () => {
  const json = JSON.stringify({ foo: "bar", spam: "eggs" });

  test("matches", () => {
    expect(json).toMatchJSON({ foo: "bar", spam: "eggs" });
    expect(json).toMatchJSON({ spam: "eggs", foo: "bar" });
  });

  test(".not doesn't match", () => {
    expect(json).not.toMatchJSON({ foo: "baz", spam: "eggs" });
  });

  test("assertion error has a nice output", () => {
    expect(() =>
      expect(json).toMatchJSON({ foo: "baz" })
    ).toThrowErrorMatchingInlineSnapshot(`
expect(received).toMatchJSON(expected) 

- Expected  - 1
+ Received  + 2

  Object {
-   "foo": "baz",
+   "foo": "bar",
+   "spam": "eggs",
  }
`);
    expect(() =>
      expect(json).not.toMatchJSON({ foo: "bar", spam: "eggs" })
    ).toThrowErrorMatchingInlineSnapshot(`
expect(received).not.toMatchJSON(expected) 

Expected: not {"foo": "bar", "spam": "eggs"}
`);
    expect(() =>
      expect(json).not.toMatchJSON({ foo: expect.anything(), spam: "eggs" })
    ).toThrowErrorMatchingInlineSnapshot(`
expect(received).not.toMatchJSON(expected) 

Expected: not {"foo": Anything, "spam": "eggs"}
Received:     {"foo": "bar", "spam": "eggs"}
`);
  });

  test("throws on invalid JSON", () => {
    expect(() => expect(null).toMatchJSON()).toThrowErrorMatchingInlineSnapshot(`
expect(received).toMatchJSON(expected)

Matcher error: received value must be a valid JSON string

Received has value: null
`);
    expect(() => expect("").toMatchJSON()).toThrowErrorMatchingInlineSnapshot(`
expect(received).toMatchJSON(expected)

Matcher error: received value must be a valid JSON string. 

Received: ""
`);
    expect(() => expect("fals").toMatchJSON()).toThrowErrorMatchingInlineSnapshot(`
expect(received).toMatchJSON(expected)

Matcher error: received value must be a valid JSON string. Unexpected end of string

Received: "fals"
               ^

`);
    expect(() => expect("falsr").toMatchJSON()).toThrowErrorMatchingInlineSnapshot(`
expect(received).toMatchJSON(expected)

Matcher error: received value must be a valid JSON string. Unexpected end of string

Received: "falsr"
                ^

`);
    expect(() => expect("fals'").toMatchJSON()).toThrowErrorMatchingInlineSnapshot(`
expect(received).toMatchJSON(expected)

Matcher error: received value must be a valid JSON string. Unexpected end of string

Received: "fals'"
                ^

`);
    expect(() => expect("fals9").toMatchJSON()).toThrowErrorMatchingInlineSnapshot(`
expect(received).toMatchJSON(expected)

Matcher error: received value must be a valid JSON string. Unexpected number: 9

Received: "fals9"
               ^

`);
  });
});

describe("jsonMatching", () => {
  test("matches object", () => {
    expect(JSON.stringify({ foo: "bar" })).toEqual(
      expect.jsonMatching({
        foo: expect.any(String),
      })
    );

    expect(JSON.stringify({ foo: "bar", bar: "baz" })).toEqual(
      expect.jsonMatching(expect.objectContaining({ foo: "bar" }))
    );
  });

  test("matches array", () => {
    expect(JSON.stringify(["foo", "bar"])).toEqual(
      expect.jsonMatching(expect.arrayContaining(["bar", "foo"]))
    );
  });

  test("works inside arrayContaining()", () => {
    expect([1, JSON.stringify({ foo: "bar" })]).toEqual(
      expect.arrayContaining([expect.jsonMatching({ foo: "bar" })])
    );
  });
});
