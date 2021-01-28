declare namespace jest {
  interface Matchers<R> {
    toMatchJSON(expected: Record<string, unknown>): R;
  }

  interface Expect {
    jsonMatching(inner: any): any;
  }
}
