"use strict";

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

  test("assertion error has a nice output", () => {
    expect(() =>
      expect(json).toMatchJSON({ foo: "baz" })
    ).toThrowErrorMatchingSnapshot();
    expect(() =>
      expect(json).not.toMatchJSON({ foo: "bar", spam: "eggs" })
    ).toThrowErrorMatchingSnapshot();
    expect(() =>
      expect(json).not.toMatchJSON({ foo: expect.anything(), spam: "eggs" })
    ).toThrowErrorMatchingSnapshot();
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
