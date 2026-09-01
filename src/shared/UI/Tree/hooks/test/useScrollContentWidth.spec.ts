import { RefObject } from 'react';
import { act, renderHook } from '@testing-library/react';

// hooks
import { useScrollContentWidth } from '../useScrollContentWidth';

const createScrollElement = (scrollWidth: number): HTMLDivElement => {
  const element = document.createElement('div');

  Object.defineProperty(element, 'scrollWidth', { configurable: true, value: scrollWidth });

  return element;
};

describe('useScrollContentWidth', () => {
  let triggerResize: () => void;
  let observedElements: Element[];

  beforeEach(() => {
    observedElements = [];

    window.ResizeObserver = class {
      constructor(callback: ResizeObserverCallback) {
        triggerResize = (): void => callback([], this as unknown as ResizeObserver);
      }

      disconnect(): void {}

      observe(element: Element): void {
        observedElements.push(element);
      }

      unobserve(): void {}
    } as unknown as typeof ResizeObserver;
  });

  it('should return undefined before the scroll element is attached', () => {
    // mock
    const scrollRef: RefObject<HTMLDivElement | null> = { current: null };

    // before
    const { result } = renderHook(() => useScrollContentWidth(scrollRef, undefined));

    // result
    expect(result.current).toBeUndefined();
  });

  it('should measure the scroll width once mounted', () => {
    // mock
    const scrollRef: RefObject<HTMLDivElement | null> = { current: createScrollElement(640) };

    // before
    const { result } = renderHook(() => useScrollContentWidth(scrollRef, undefined));

    // result
    expect(result.current).toBe(640);
    expect(observedElements).toContain(scrollRef.current);
  });

  it('should re-measure when the container is resized', () => {
    // mock
    const scrollElement = createScrollElement(640);
    const scrollRef: RefObject<HTMLDivElement | null> = { current: scrollElement };

    // before
    const { result } = renderHook(() => useScrollContentWidth(scrollRef, undefined));
    expect(result.current).toBe(640);

    // action — content grew wider (e.g. a group expanded, revealing a deeper row)
    Object.defineProperty(scrollElement, 'scrollWidth', { configurable: true, value: 900 });
    act(() => triggerResize());

    // result
    expect(result.current).toBe(900);
  });

  it('should re-measure when the watched value changes, even without a resize', () => {
    // mock
    const scrollElement = createScrollElement(640);
    const scrollRef: RefObject<HTMLDivElement | null> = { current: scrollElement };

    // before
    const { rerender, result } = renderHook(({ watch }) => useScrollContentWidth(scrollRef, watch), {
      initialProps: { watch: 'a' },
    });
    expect(result.current).toBe(640);

    // action — a row was renamed to something longer, widening the content
    Object.defineProperty(scrollElement, 'scrollWidth', { configurable: true, value: 720 });
    rerender({ watch: 'b' });

    // result
    expect(result.current).toBe(720);
  });
});
