# `jest-json`

[![npm](https://img.shields.io/npm/v/jest-json.svg)](https://npmjs.org/jest-json)
[![CI](https://github.com/duailibe/jest-json/actions/workflows/ci.yaml/badge.svg)](https://github.com/duailibe/jest-json/actions/workflows/ci.yaml)
[![codecov](https://codecov.io/gh/duailibe/jest-json/branch/main/graph/badge.svg?token=uUQIzDROrx)](https://codecov.io/gh/duailibe/jest-json)

Jest matchers to work with JSON strings.

## Setup

**Note:** If you're using Jest < 27.2.5, you should stick to `jest-json@^1.0`.

Add `jest-json` to your Jest config:

```json
{
  "setupTestFrameworkScriptFile": "jest-json"
}
```

Or if you're already using another test framework, create a setup file and require each of them:

```js
require("jest-json");
// require("some-jest-library);
```

## Motivation

Say you have a function `fetchData` the calls `fetch` with a JSON body and you want to assert that `fetchData` is building the JSON string correctly.

_See this [repl.it](https://repl.it/@duailibe/jest-json-example) for a working example of this problem._

```js
function fetchData(userId, fields = []) {
  if (!fields.includes("profilePicture")) {
    fields = fields.concat(["profilePicture"]);
  }

  return fetch("/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      params: { id: userId },
      fields,
    }),
  });
}
```

One option to write the test would be to check the final string:

```js
test("fetchData", () => {
  fetchData("ab394js", ["name", "website"]);

  expect(fetch).toHaveBeenCalledWith("/users", {
    method: "POST",
    headers: expect.anything(),
    body: JSON.stringify({
      params: { id: "ab394js" },
      fields: ["name", "website", "profilePicture"],
    }),
  });
});
```

Ok, this works, but that has a few problems:

- you are testing that `"profilePicture"` will be added to the end of the `fields` list,
- you are testing the exact orders the keys of the body JSON are added.

If someone changes the test to insert `"profilePicture"` in the beginning of the list, or change the JSON to `JSON.stringify({ fields, params })`, your test will now fail because the JSON string changed, even though it's equivalent to the one in the test. That means we have a flaky test. One way to fix it would be:

```js
global.fetch = jest.fn();

test("fetchData", () => {
  fetchData("ab394js", ["name", "website"]);

  expect(fetch).toHaveBeenCalledWith("/users", {
    method: "POST",
    headers: expect.anything(),
    body: expect.anything(),
  });

  expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({
    params: { id: "ab394js" },
    fields: expect.arrayContaining(["name", "website", "profilePicture"]),
  });
});
```

That's better, and now we can even use `expect.arrayContaining()` to make sure we assert that the values are present, but don't care about the order.

But that's a really inconvenient way to get the string we're interested (`fetch.mock.calls[0][1].body`).

Now compare that test to this:

```js
global.fetch = jest.fn();

test("fetchData", () => {
  fetchData("ab394js", ["name", "website"]);

  expect(fetch).toHaveBeenCalledWith("/users", {
    method: "POST",
    headers: expect.anything(),
    body: expect.jsonMatching({
      params: { id: "ab394js" },
      fields: expect.arrayContaining(["name", "website", "profilePicture"]),
    }),
  });
});
```

Now that's a very neat test.

## API

### `expect.jsonMatching`

In the example above, you can use the `expect.jsonMatching` asymmetric matcher:

```js
expect(foo).toHaveBeenCalledWith(
  "url",
  expect.jsonMatching({
    foo: "bar",
    spam: "eggs",
  })
);
```

You can include other asymmetric matchers inside like:

<!-- prettier-ignore -->
```js
expect.jsonMatching(
  expect.objectContaining({
    foo: expect.stringMatching("bar")
  })
)
```

### `expect().toMatchJSON()`

It's just sugar for calling `JSON.parse()` and then `expect().toEqual()`:

```js
expect(json).toMatchJSON(expected);
// equivalent to:
const tmp = JSON.parse(json);
expect(tmp).toEqual(expected);
```

## License

[MIT](./LICENSE)
