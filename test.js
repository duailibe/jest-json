"use strict";

const hasAnsi = require("has-ansi");
const stripAnsi = require("strip-ansi");

expect.addSnapshotSerializer({
  test: value => typeof value === "string" && hasAnsi(value),
  print: stripAnsi
});

require(".");

describe("toMatchJSON", () => {
  const json = JSON.stringify({ foo: "bar", spam: "eggs" });

  test("matches", () => {
    expect(json).toMatchJSON({ foo: "bar", spam: "eggs" });
    expect(json).toMatchJSON({ spam: "eggs", foo: "bar" });
  });

  test(".not doesn't match", () => {
    expect(json).not.toMatchJSON({ foo: "baz", spam: "eggs" });
  });

  test("throws on invalid JSON", () => {
    expect(() => expect(null).toMatchJSON()).toThrowErrorMatchingSnapshot();
    expect(() => expect("").toMatchJSON()).toThrowErrorMatchingSnapshot();
    expect(() => expect("fals").toMatchJSON()).toThrowErrorMatchingSnapshot();
    expect(() => expect("falsr").toMatchJSON()).toThrowErrorMatchingSnapshot();
    expect(() => expect("fals'").toMatchJSON()).toThrowErrorMatchingSnapshot();
    expect(() => expect("fals9").toMatchJSON()).toThrowErrorMatchingSnapshot();
  });
});

describe("jsonMatching", () => {
  test("matches object", () => {
    expect(JSON.stringify({ foo: "bar" })).toEqual(
      expect.jsonMatching({
        foo: expect.any(String)
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

  test("throws for non-strings", () => {
    expect(() => {
      expect({}).toEqual(expect.jsonMatching(expect.anything()));
    }).toThrow(/You must provide a string/);
  });

  test("throws for invalid JSON", () => {
    expect(() => {
      expect("not json").toEqual(expect.jsonMatching(expect.anything()));
    }).toThrow(/Actual is not valid JSON/);
  });
});
