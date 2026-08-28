import '@testing-library/jest-dom/vitest';

// others
import { DEFAULT_LANGUAGE, initI18n } from 'translations';

// force macOS regardless of the machine/CI running the suite, so modifier-key symbols/matching stay deterministic
vi.mock('react-device-detect', () => ({ isMacOs: true }));

// force English regardless of the machine/CI locale, so snapshots stay deterministic
await initI18n(DEFAULT_LANGUAGE);

// jsdom doesn't implement matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: (query: string) => ({
    addEventListener: (): void => {},
    addListener: (): void => {},
    dispatchEvent: (): boolean => false,
    matches: false,
    media: query,
    onchange: null,
    removeEventListener: (): void => {},
    removeListener: (): void => {},
  }),
  writable: true,
});

// jsdom doesn't implement ResizeObserver
class ResizeObserverMock {
  disconnect(): void {}
  observe(): void {}
  unobserve(): void {}
}

window.ResizeObserver = window.ResizeObserver ?? ResizeObserverMock;

// jsdom doesn't implement HTMLCanvasElement's 2D context (needs the "canvas" npm package)
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: (): null => null,
  writable: true,
});

// jsdom doesn't implement pointer capture
Object.defineProperty(HTMLElement.prototype, 'hasPointerCapture', {
  value: (): boolean => false,
  writable: true,
});

Object.defineProperty(HTMLElement.prototype, 'releasePointerCapture', {
  value: (): void => {},
  writable: true,
});

Object.defineProperty(HTMLElement.prototype, 'setPointerCapture', {
  value: (): void => {},
  writable: true,
});

// jsdom doesn't implement the pointer lock API
Object.defineProperty(HTMLElement.prototype, 'requestPointerLock', {
  value: (): void => {},
  writable: true,
});

Object.defineProperty(Document.prototype, 'exitPointerLock', {
  value: (): void => {},
  writable: true,
});
