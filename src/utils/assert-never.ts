/**
 * Compile-time exhaustiveness guard for TypeScript unions.
 * Throws a runtime error if called.
 */
export function assertNever(value: never): never {
  throw new Error(`Unhandled union value reached: ${JSON.stringify(value)}`);
}
