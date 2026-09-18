import { act, renderHook } from '@testing-library/react';

// hooks
import { useContrastChecker } from '../useContrastChecker';

// others
import { contrastCheckerStateCache } from '../../utils/contrastCheckerStateCache';
import { DEFAULT_CONTRAST_CHECKER_STATE } from '../../constants';

// types
import { ContrastCategory, ContrastLevel } from '../../enums';

describe('useContrastChecker', () => {
  beforeEach(() => {
    contrastCheckerStateCache.current = DEFAULT_CONTRAST_CHECKER_STATE;
  });

  it('should restore the active state, category and level after the hook is unmounted and mounted again', () => {
    // before
    const first = renderHook(() => useContrastChecker({ h: 0, s: 0, v: 0 }, '#ffffff', vi.fn()));

    act(() => first.result.current.onToggleActive());
    act(() => first.result.current.onSetCategory(ContrastCategory.normalText));
    first.unmount();

    // action
    const { result } = renderHook(() => useContrastChecker({ h: 0, s: 0, v: 0 }, '#ffffff', vi.fn()));

    // result
    expect(result.current.isActive).toBe(true);
    expect(result.current.category).toBe(ContrastCategory.normalText);
  });

  it('should default to inactive, Auto category, and AA level', () => {
    // before
    const { result } = renderHook(() => useContrastChecker({ h: 0, s: 0, v: 0 }, '#ffffff', vi.fn()));

    // result
    expect(result.current.isActive).toBe(false);
    expect(result.current.category).toBe(ContrastCategory.auto);
    expect(result.current.level).toBe(ContrastLevel.aa);
  });

  it('should toggle isActive', () => {
    // before
    const { result } = renderHook(() => useContrastChecker({ h: 0, s: 0, v: 0 }, '#ffffff', vi.fn()));

    // action
    act(() => result.current.onToggleActive());

    // result
    expect(result.current.isActive).toBe(true);
  });

  it('should compute the truncated contrast ratio between the current color and the given background', () => {
    // before — black (v=0) against white background is exactly 21:1
    const { result } = renderHook(() => useContrastChecker({ h: 0, s: 0, v: 0 }, '#ffffff', vi.fn()));

    // result
    expect(result.current.ratio).toBeCloseTo(21, 0);
  });

  it('should report passes=true when the ratio clears the active threshold', () => {
    // before
    const { result } = renderHook(() => useContrastChecker({ h: 0, s: 0, v: 0 }, '#ffffff', vi.fn()));

    // result — black on white passes every threshold
    expect(result.current.passes).toBe(true);
  });

  it('should report passes=false when the ratio falls short of the active threshold', () => {
    // before — a light gray on white background has very low contrast
    const { result } = renderHook(() => useContrastChecker({ h: 0, s: 0, v: 95 }, '#ffffff', vi.fn()));

    // result
    expect(result.current.passes).toBe(false);
  });

  it('should return a null ratio and passes=false when no background color is resolvable', () => {
    // before
    const { result } = renderHook(() => useContrastChecker({ h: 0, s: 0, v: 0 }, null, vi.fn()));

    // result
    expect(result.current.ratio).toBeNull();
    expect(result.current.passes).toBe(false);
  });

  it('should switch category and recompute the threshold-derived pass state', () => {
    // before — a color that passes the Graphics (3:1) threshold but not Normal text (4.5:1)
    const { result } = renderHook(() => useContrastChecker({ h: 0, s: 0, v: 55 }, '#ffffff', vi.fn()));

    expect(result.current.passes).toBe(true);

    // action
    act(() => result.current.onSetCategory(ContrastCategory.normalText));

    // result
    expect(result.current.passes).toBe(false);
  });

  it('should disallow AAA for Graphics and Auto, and allow it for text categories', () => {
    // before
    const { result } = renderHook(() => useContrastChecker({ h: 0, s: 0, v: 0 }, '#ffffff', vi.fn()));

    expect(result.current.canShowAAA).toBe(false);

    // action
    act(() => result.current.onSetCategory(ContrastCategory.graphics));

    expect(result.current.canShowAAA).toBe(false);

    // action
    act(() => result.current.onSetCategory(ContrastCategory.normalText));

    // result
    expect(result.current.canShowAAA).toBe(true);
  });

  it('should call onCorrect with a passing color when auto-correcting a failing color', () => {
    // mock
    const onCorrect = vi.fn();

    // before — near-white, fails against a white background
    const { result } = renderHook(() => useContrastChecker({ h: 0, s: 0, v: 95 }, '#ffffff', onCorrect));

    // action
    act(() => result.current.onAutoCorrect());

    // result
    expect(onCorrect).toHaveBeenCalledTimes(1);
    expect(onCorrect.mock.calls[0][0].v).toBeLessThan(95);
  });

  it('should not call onCorrect when there is no background to correct against', () => {
    // mock
    const onCorrect = vi.fn();

    // before
    const { result } = renderHook(() => useContrastChecker({ h: 0, s: 0, v: 95 }, null, onCorrect));

    // action
    act(() => result.current.onAutoCorrect());

    // result
    expect(onCorrect).not.toHaveBeenCalled();
  });

  it('should expose the unsupported reason and report no ratio or boundaries while unsupported', () => {
    // before
    const { result } = renderHook(() => useContrastChecker({ h: 0, s: 0, v: 0 }, '#ffffff', vi.fn(), 'foreground'));

    // result
    expect(result.current.unsupportedReason).toBe('foreground');
    expect(result.current.ratio).toBeNull();
    expect(result.current.boundaries).toEqual([]);
    expect(result.current.passes).toBe(false);
  });

  it('should have no unsupported reason by default', () => {
    // before
    const { result } = renderHook(() => useContrastChecker({ h: 0, s: 0, v: 0 }, '#ffffff', vi.fn()));

    // result
    expect(result.current.unsupportedReason).toBeNull();
  });
});
