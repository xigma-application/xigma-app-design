import { act, renderHook } from '@testing-library/react';
import { RefObject } from 'react';

// hooks
import { useScrollEdges } from '../useScrollEdges';

const createScrollElement = (clientHeight: number, scrollHeight: number, scrollTop = 0): HTMLDivElement => {
  const element = document.createElement('div');

  Object.defineProperty(element, 'clientHeight', { configurable: true, value: clientHeight });
  Object.defineProperty(element, 'scrollHeight', { configurable: true, value: scrollHeight });
  element.scrollTop = scrollTop;

  return element;
};

describe('useScrollEdges', () => {
  it('should report no scrollable edges for a null ref', () => {
    // before
    const ref = { current: null } as RefObject<HTMLDivElement | null>;
    const { result } = renderHook(() => useScrollEdges(ref));

    // result
    expect(result.current).toEqual({ canScrollDown: false, canScrollUp: false });
  });

  it('should report only canScrollDown when scrolled to the top of overflowing content', () => {
    // before
    const element = createScrollElement(100, 300, 0);
    const ref = { current: element } as RefObject<HTMLDivElement | null>;
    const { result } = renderHook(() => useScrollEdges(ref));

    // result
    expect(result.current).toEqual({ canScrollDown: true, canScrollUp: false });
  });

  it('should report both edges when scrolled to the middle of overflowing content', () => {
    // before
    const element = createScrollElement(100, 300, 100);
    const ref = { current: element } as RefObject<HTMLDivElement | null>;
    const { result } = renderHook(() => useScrollEdges(ref));

    // result
    expect(result.current).toEqual({ canScrollDown: true, canScrollUp: true });
  });

  it('should report only canScrollUp when scrolled to the bottom of overflowing content', () => {
    // before
    const element = createScrollElement(100, 300, 200);
    const ref = { current: element } as RefObject<HTMLDivElement | null>;
    const { result } = renderHook(() => useScrollEdges(ref));

    // result
    expect(result.current).toEqual({ canScrollDown: false, canScrollUp: true });
  });

  it('should report no edges when content does not overflow', () => {
    // before
    const element = createScrollElement(300, 300, 0);
    const ref = { current: element } as RefObject<HTMLDivElement | null>;
    const { result } = renderHook(() => useScrollEdges(ref));

    // result
    expect(result.current).toEqual({ canScrollDown: false, canScrollUp: false });
  });

  it('should recompute edges on scroll', () => {
    // before
    const element = createScrollElement(100, 300, 0);
    const ref = { current: element } as RefObject<HTMLDivElement | null>;
    const { result } = renderHook(() => useScrollEdges(ref));

    // action
    act(() => {
      element.scrollTop = 200;
      element.dispatchEvent(new Event('scroll'));
    });

    // result
    expect(result.current).toEqual({ canScrollDown: false, canScrollUp: true });
  });
});
