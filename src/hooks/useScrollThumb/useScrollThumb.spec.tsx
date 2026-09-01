import { PointerEvent as ReactPointerEvent, RefObject } from 'react';
import { act, renderHook } from '@testing-library/react';

// hooks
import { useScrollThumb } from './useScrollThumb';

const createScrollElement = (clientHeight: number, scrollHeight: number, scrollTop = 0): HTMLDivElement => {
  const element = document.createElement('div');

  Object.defineProperty(element, 'clientHeight', { configurable: true, value: clientHeight });
  Object.defineProperty(element, 'scrollHeight', { configurable: true, value: scrollHeight });
  element.scrollTop = scrollTop;

  return element;
};

const createHorizontalScrollElement = (clientWidth: number, scrollWidth: number, scrollLeft = 0): HTMLDivElement => {
  const element = document.createElement('div');

  Object.defineProperty(element, 'clientWidth', { configurable: true, value: clientWidth });
  Object.defineProperty(element, 'scrollWidth', { configurable: true, value: scrollWidth });
  element.scrollLeft = scrollLeft;

  return element;
};

const createEvent = (clientY: number, buttons = 1): ReactPointerEvent<HTMLDivElement> =>
  ({
    buttons,
    clientY,
    currentTarget: { releasePointerCapture: vi.fn(), setPointerCapture: vi.fn() },
    pointerId: 1,
  }) as unknown as ReactPointerEvent<HTMLDivElement>;

const createHorizontalEvent = (clientX: number, buttons = 1): ReactPointerEvent<HTMLDivElement> =>
  ({
    buttons,
    clientX,
    currentTarget: { releasePointerCapture: vi.fn(), setPointerCapture: vi.fn() },
    pointerId: 1,
  }) as unknown as ReactPointerEvent<HTMLDivElement>;

describe('useScrollThumb behaviors', () => {
  let observedElements: Element[];
  let triggerResize: () => void;

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

  it('should default to a full-height thumb before the scroll element is attached', () => {
    // mock
    const scrollRef: RefObject<HTMLDivElement | null> = { current: null };

    // before
    const { result } = renderHook(() => useScrollThumb(scrollRef));

    // result
    expect(result.current.thumbSizeRatio).toBe(1);
    expect(result.current.thumbStartRatio).toBe(0);
  });

  it('should derive the thumb height and position ratios from the scroll element metrics', () => {
    // mock
    const scrollRef: RefObject<HTMLDivElement | null> = { current: createScrollElement(84, 336, 63) };

    // before
    const { result } = renderHook(() => useScrollThumb(scrollRef));

    // result — 84/336 height ratio, 63/(336-84) top ratio
    expect(result.current.thumbSizeRatio).toBeCloseTo(0.25);
    expect(result.current.thumbStartRatio).toBeCloseTo(0.25);
  });

  it('should update the ratios when the scroll element scrolls', () => {
    // mock
    const scrollElement = createScrollElement(84, 336, 0);
    const scrollRef: RefObject<HTMLDivElement | null> = { current: scrollElement };

    // before
    const { result } = renderHook(() => useScrollThumb(scrollRef));

    // action
    scrollElement.scrollTop = 126;
    act(() => scrollElement.dispatchEvent(new Event('scroll')));

    // result
    expect(result.current.thumbStartRatio).toBeCloseTo(0.5);
  });

  it('should re-measure when the scroll container is resized (no scroll event fires)', () => {
    // mock
    const scrollElement = createScrollElement(84, 336, 0);
    const scrollRef: RefObject<HTMLDivElement | null> = { current: scrollElement };

    // before
    const { result } = renderHook(() => useScrollThumb(scrollRef));
    expect(result.current.thumbSizeRatio).toBeCloseTo(0.25);

    // action — the panel is dragged taller so all content now fits, without any scroll
    Object.defineProperty(scrollElement, 'clientHeight', { configurable: true, value: 336 });
    act(() => triggerResize());

    // result
    expect(result.current.thumbSizeRatio).toBe(1);
  });

  it('should also observe the content wrapper so the thumb tracks content that grows', () => {
    // mock
    const scrollElement = createScrollElement(84, 336, 0);

    scrollElement.appendChild(document.createElement('div'));
    const scrollRef: RefObject<HTMLDivElement | null> = { current: scrollElement };

    // before
    renderHook(() => useScrollThumb(scrollRef));

    // result
    expect(observedElements).toContain(scrollElement);
    expect(observedElements).toContain(scrollElement.firstElementChild);
  });

  it('should drag the scroll position proportionally to the pointer movement', () => {
    // mock
    const scrollElement = createScrollElement(84, 336, 0);
    const scrollRef: RefObject<HTMLDivElement | null> = { current: scrollElement };

    // before
    const { result } = renderHook(() => useScrollThumb(scrollRef));

    // action
    result.current.onPointerDown(createEvent(0));
    result.current.onPointerMove(createEvent(21));

    // result — 21px of drag over an 84px track scrolls a quarter of the 336px content
    expect(scrollElement.scrollTop).toBeCloseTo(84);
  });

  it('should not scroll on pointer move when the button is released', () => {
    // mock
    const scrollElement = createScrollElement(84, 336, 0);
    const scrollRef: RefObject<HTMLDivElement | null> = { current: scrollElement };

    // before
    const { result } = renderHook(() => useScrollThumb(scrollRef));

    // action
    result.current.onPointerDown(createEvent(0));
    result.current.onPointerMove(createEvent(21, 0));

    // result
    expect(scrollElement.scrollTop).toBe(0);
  });

  it('should do nothing on pointer down before the scroll element is attached', () => {
    // mock
    const scrollRef: RefObject<HTMLDivElement | null> = { current: null };

    // before
    const { result } = renderHook(() => useScrollThumb(scrollRef));
    const event = createEvent(0);

    // action
    result.current.onPointerDown(event);

    // result
    expect(event.currentTarget.setPointerCapture).not.toHaveBeenCalled();
  });

  it('should release the pointer capture on pointer up', () => {
    // mock
    const scrollRef: RefObject<HTMLDivElement | null> = { current: null };

    // before
    const { result } = renderHook(() => useScrollThumb(scrollRef));
    const event = createEvent(0);

    // action
    result.current.onPointerUp(event);

    // result
    expect(event.currentTarget.releasePointerCapture).toHaveBeenCalledWith(1);
  });

  describe('horizontal axis', () => {
    it('should derive the thumb ratios from the width metrics', () => {
      // mock
      const scrollRef: RefObject<HTMLDivElement | null> = { current: createHorizontalScrollElement(84, 336, 63) };

      // before
      const { result } = renderHook(() => useScrollThumb(scrollRef, 'x'));

      // result — 84/336 size ratio, 63/(336-84) start ratio
      expect(result.current.thumbSizeRatio).toBeCloseTo(0.25);
      expect(result.current.thumbStartRatio).toBeCloseTo(0.25);
    });

    it('should track the horizontal scroll position', () => {
      // mock
      const scrollElement = createHorizontalScrollElement(84, 336, 0);
      const scrollRef: RefObject<HTMLDivElement | null> = { current: scrollElement };

      // before
      const { result } = renderHook(() => useScrollThumb(scrollRef, 'x'));

      // action
      scrollElement.scrollLeft = 126;
      act(() => scrollElement.dispatchEvent(new Event('scroll')));

      // result
      expect(result.current.thumbStartRatio).toBeCloseTo(0.5);
    });

    it('should drag the horizontal scroll position proportionally to the pointer movement', () => {
      // mock
      const scrollElement = createHorizontalScrollElement(84, 336, 0);
      const scrollRef: RefObject<HTMLDivElement | null> = { current: scrollElement };

      // before
      const { result } = renderHook(() => useScrollThumb(scrollRef, 'x'));

      // action
      result.current.onPointerDown(createHorizontalEvent(0));
      result.current.onPointerMove(createHorizontalEvent(21));

      // result — 21px of drag over an 84px track scrolls a quarter of the 336px content
      expect(scrollElement.scrollLeft).toBeCloseTo(84);
    });

    it('should not scroll horizontally on pointer move when the button is released', () => {
      // mock
      const scrollElement = createHorizontalScrollElement(84, 336, 0);
      const scrollRef: RefObject<HTMLDivElement | null> = { current: scrollElement };

      // before
      const { result } = renderHook(() => useScrollThumb(scrollRef, 'x'));

      // action
      result.current.onPointerDown(createHorizontalEvent(0));
      result.current.onPointerMove(createHorizontalEvent(21, 0));

      // result
      expect(scrollElement.scrollLeft).toBe(0);
    });
  });
});
