"use strict";

const diff = require("jest-diff");
const { equals } = require("expect/build/jasmine_utils");
const { isOneline } = require("expect/build/utils");
const {
  RECEIVED_COLOR,
  matcherHint,
  printExpected,
  printReceived,
  printWithType
} = require("jest-matcher-utils");

/**
 * Jest matcher that receives a JSON string and matches to a value.
 *
 *   expect(fooJson).toMatchJSON(expected)
 */
function toMatchJSON(actual, expected) {
  const hint = matcherHint(".toMatchJSON", "string", "expected", {
    isNot: this.isNot
  });
  const prefix = hint + "\n\n" + RECEIVED_COLOR("string") + " ";

  if (typeof actual !== "string") {
    throwError(
      prefix +
        "value must be a string.\n" +
        printWithType("Received", actual, printReceived)
    );
  }

  if (!actual) {
    throwError(
      prefix +
        "value must be a valid JSON.\nReceived:\n  " +
        printReceived(actual)
    );
  }

  try {
    actual = JSON.parse(actual);
  } catch (err) {
    throwError(
      prefix +
        "value must be a valid JSON.\n" +
        printInvalid(actual, err.message)
    );
  }
  const pass = equals(actual, expected);
  const message = pass
    ? () =>
        matcherHint(".not.toMatchJSON") +
        "\n\nExpected value not to match:\n   " +
        printExpected(expected) +
        "\nReceived:\n   " +
        printReceived(actual)
    : () => {
        const oneline = isOneline(expected, actual);
        const diffString =
          !oneline && diff(expected, actual, { expand: this.expand });

        return (
          matcherHint(".toMatchJSON") +
          "\n\nExpected value to match:\n   " +
          printExpected(expected) +
          "\nReceived:\n   " +
          printReceived(actual) +
          (diffString && !oneline ? "\n\nDifference: \n\n" + diffString : "")
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
function jsonMatching(actual, expected) {
  const _this = expect.jsonMatching();
  if (typeof actual !== "string") {
    throw Error(
      `You must provide a string to ${_this.toString()}, not '${typeof actual}'.`
    );
  }
  try {
    actual = JSON.parse(actual);
  } catch (err) {
    throw Error("Actual is not valid JSON");
  }
  return { pass: equals(actual, expected) };
}

function jsonMatchingNoParseError(actual, expected) {
  const _this = expect.jsonMatchingNoParseError();
  if (typeof actual !== "string") {
    throw Error(
      `You must provide a string to ${_this.toString()}, not '${typeof actual}'.`
    );
  }
  try {
    actual = JSON.parse(actual);
    return { pass: equals(actual, expected) };
  } catch (err) {
    return { pass: equals(false, true) };
  }
}

expect.extend({ jsonMatchingNoParseError, jsonMatching, toMatchJSON });

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
