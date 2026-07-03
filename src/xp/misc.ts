export const iife = <T,>(fn: () => T): T => fn();

export function exhaustiveCheck(param: never): never {
  throw new Error(`Exhaustive check failed: ${param}`);
}
