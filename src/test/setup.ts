import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

// jsdom does not implement scrolling; ScrollRestoration calls it on navigation.
Object.defineProperty(window, 'scrollTo', { value: () => undefined, writable: true });
