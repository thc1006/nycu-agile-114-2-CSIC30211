import 'vitest'

interface CustomMatchers<R = unknown> {
  /** Asserts the given DOM subtree has no axe-core accessibility violations. */
  toHaveNoViolations(): Promise<R>
}

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Assertion<T = unknown> extends CustomMatchers<T> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
