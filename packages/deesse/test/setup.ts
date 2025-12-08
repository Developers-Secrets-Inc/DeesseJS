import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { z } from "zod";

// Configure global test functions only if they don't exist
if (typeof global.describe === "undefined") {
  global.describe = describe;
  global.it = it;
  global.expect = expect;
  global.beforeEach = beforeEach;
  global.afterEach = afterEach;
  global.vi = vi;
}

// Add custom matchers for testing
declare global {
  namespace Viest {
    interface Assertion<T = any> {
      toBeSuccess(): void;
      toBeFailure(): void;
    }
  }
}

expect.extend({
  toBeSuccess(received: any) {
    const pass = received?._tag === "Success";
    return {
      pass,
      message: () =>
        `Expected ${received} to be a Success, but got ${received?._tag}`,
    };
  },
  toBeFailure(received: any) {
    const pass = received?._tag === "Failure";
    return {
      pass,
      message: () =>
        `Expected ${received} to be a Failure, but got ${received?._tag}`,
    };
  },
});

// Console mocking for tests
global.console = {
  ...console,
  // Suppress specific logs during tests
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};
