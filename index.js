"use strict";

const { equals } = require("expect/build/jasmineUtils");
const {
  RECEIVED_COLOR,
  matcherHint,
  printExpected,
  printReceived,
  printWithType,
  printDiffOrStringify
} = require("jest-matcher-utils");

/**
 * Jest matcher that receives a JSON string and matches to a value.
 *
 *   expect(fooJson).toMatchJSON(expected)
 */
function toMatchJSON(received, expected) {
  const hint = matcherHint(".toMatchJSON", "string", "expected", {
    isNot: this.isNot
  });
  const prefix = hint + "\n\n" + RECEIVED_COLOR("string") + " ";

  if (typeof received !== "string") {
    throwError(
      prefix +
        "value must be a string.\n" +
        printWithType("Received", received, printReceived)
    );
  }

  if (!received) {
    throwError(
      prefix +
        "value must be a valid JSON.\nReceived:\n  " +
        printReceived(received)
    );
  }

  try {
    received = JSON.parse(received);
  } catch (err) {
    throwError(
      prefix +
        "value must be a valid JSON.\n" +
        printInvalid(received, err.message)
    );
  }
  const pass = equals(received, expected);
  const message = pass
    ? () =>
        matcherHint(".not.toMatchJSON") +
        "\n\nExpected value not to match:\n   " +
        printExpected(expected) +
        "\nReceived:\n   " +
        printReceived(received)
    : () => {
        return (
          matcherHint(".toMatchJSON") +
          "\n\n" +
          printDiffOrStringify(
            expected,
            received,
            "Expected",
            "Received",
            this.expand !== false
          )
        );
      };

  return { pass, message };
}

/**
 * Asymmetric matcher to check the format of a JSON string.
 *
 *   expect({ foo: fooJson }).toEqual({
 *     foo: expect.jsonMatching(expected),
 *   })
 */
function jsonMatching(received, expected) {
  let pass = false;
  try {
    received = JSON.parse(received);
    pass = equals(received, expected);
  } catch (err) {} // eslint-disable-line no-empty
  return { pass };
}

expect.extend({ jsonMatching, toMatchJSON });

/**
 * Formats the JSON.parse error message
 */
function printInvalid(received, error) {
  const match = error.match(
    /Unexpected (\w+)(?: .)? in JSON at position (\d+)/
  );
  const message = "Received:\n  " + printReceived(received) + "\n";
  if (match) {
    const pos = parseInt(match[2], 10);
    return (
      message +
      " ".repeat(pos + 3) +
      "^\nUnexpected " +
      match[1] +
      ": " +
      RECEIVED_COLOR(received[pos])
    );
  }
  return (
    message +
    " ".repeat(received.length + 3) +
    "^\n" +
    "Unexpected end of string\n"
  );
}

/**
 * Throws the errors removing the matcher from stack trace
 */
function throwError(message) {
  try {
    throw Error(message);
  } catch (err) {
    message = message || "Error";
    const stack = err.stack.slice(message.length).split("\n");
    stack.splice(0, 4, message);
    err.stack = stack.join("\n");
    throw err;
  }
}
