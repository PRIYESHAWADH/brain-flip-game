/// <reference types="jest" />

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeDefined(): R;
      toBeGreaterThan(expected: number): R;
      toBeLessThan(expected: number): R;
      toHaveLength(expected: number): R;
      toContain(expected: any): R;
      toMatch(expected: string | RegExp): R;
      not: Matchers<R>;
    }
  }
}

export {};