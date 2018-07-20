# `jest-json`

[![Travis](https://api.travis-ci.com/duailibe/jest-json.svg)](https://travis-ci.com/duailibe/jest-json)
[![Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![npm](https://img.shields.io/npm/v/jest-json.svg)](https://npmjs.org/jest-json)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Jest matchers to work with JSON strings.

## Setup

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

Say you need to assert `foo` was called with `foo("url", "{'foo': 'bar', 'spam': 'eggs'}")`:

```js
// option 1
expect(foo).toHaveBeenCalledWith(
  "url",
  JSON.stringify({
    foo: "bar",
    spam: "eggs"
  })
);
```

This test may fail depending on how the second argument was created:

```js
// this will pass the test:
foo(
  "url",
  JSON.stringify({
    foo: "bar",
    spam: "eggs"
  })
);

// this will fail the test:
foo(
  "url",
  JSON.stringify({
    spam: "eggs",
    foo: "bar"
  })
);
```

_See this [repl.it](https://repl.it/@duailibe/jest-json-example) for a working example._

To fix the test you'd have to find in `foo.mock.calls` the call you want, parse the JSON and call `expect().toEqual({ spam: "eggs", foo: "bar" })`.

## Matchers

### `expect.jsonMatching`

In the example above, you can use the `expect.jsonMatching` asymmetric matcher:

```js
expect(foo).toHaveBeenCalledWith(
  "url",
  expect.jsonMatching({
    foo: "bar",
    spam: "eggs"
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
