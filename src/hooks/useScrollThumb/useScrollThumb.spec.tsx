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

const createEvent = (clientY: number, buttons = 1): ReactPointerEvent<HTMLDivElement> =>
  ({
    buttons,
    clientY,
    currentTarget: { releasePointerCapture: vi.fn(), setPointerCapture: vi.fn() },
    pointerId: 1,
  }) as unknown as ReactPointerEvent<HTMLDivElement>;

describe('useScrollThumb behaviors', () => {
  it('should default to a full-height thumb before the scroll element is attached', () => {
    // mock
    const scrollRef: RefObject<HTMLDivElement | null> = { current: null };

    // before
    const { result } = renderHook(() => useScrollThumb(scrollRef));

    // result
    expect(result.current.thumbHeightRatio).toBe(1);
    expect(result.current.thumbTopRatio).toBe(0);
  });

  it('should derive the thumb height and position ratios from the scroll element metrics', () => {
    // mock
    const scrollRef: RefObject<HTMLDivElement | null> = { current: createScrollElement(84, 336, 63) };

    // before
    const { result } = renderHook(() => useScrollThumb(scrollRef));

    // result — 84/336 height ratio, 63/(336-84) top ratio
    expect(result.current.thumbHeightRatio).toBeCloseTo(0.25);
    expect(result.current.thumbTopRatio).toBeCloseTo(0.25);
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
    expect(result.current.thumbTopRatio).toBeCloseTo(0.5);
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
});
