/// <reference types="jest" />

declare namespace jest {
  interface Matchers<R> {
    toMatchJSON(expected: any): R;
  }

  interface Expect {
    jsonMatching(inner: any): any;
  }
}
