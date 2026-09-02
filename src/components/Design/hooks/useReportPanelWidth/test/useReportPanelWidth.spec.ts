import { renderHook } from '@testing-library/react';
import { RefObject } from 'react';

// hooks
import { useReportPanelWidth } from '../useReportPanelWidth';

describe('useReportPanelWidth', () => {
  it('should write the width into the ref while visible', () => {
    // mock
    const widthRef: RefObject<number> = { current: 0 };

    // before
    renderHook(() => useReportPanelWidth(widthRef, 400, true));

    // result
    expect(widthRef.current).toBe(400);
  });

  it('should write 0 while not visible, regardless of width', () => {
    // mock
    const widthRef: RefObject<number> = { current: 0 };

    // before
    renderHook(() => useReportPanelWidth(widthRef, 400, false));

    // result
    expect(widthRef.current).toBe(0);
  });

  it('should update the ref again when the width changes', () => {
    // mock
    const widthRef: RefObject<number> = { current: 0 };

    // before
    const { rerender } = renderHook(({ isVisible, width }) => useReportPanelWidth(widthRef, width, isVisible), {
      initialProps: { isVisible: true, width: 400 },
    });

    // action
    rerender({ isVisible: true, width: 320 });

    // result
    expect(widthRef.current).toBe(320);
  });

  it('should reset the ref to 0 once visibility turns off', () => {
    // mock
    const widthRef: RefObject<number> = { current: 0 };

    // before
    const { rerender } = renderHook(({ isVisible, width }) => useReportPanelWidth(widthRef, width, isVisible), {
      initialProps: { isVisible: true, width: 400 },
    });

    // action
    rerender({ isVisible: false, width: 400 });

    // result
    expect(widthRef.current).toBe(0);
  });
});
