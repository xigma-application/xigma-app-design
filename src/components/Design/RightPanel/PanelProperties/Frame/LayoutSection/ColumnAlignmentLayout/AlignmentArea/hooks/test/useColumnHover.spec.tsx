import { act, renderHook } from '@testing-library/react';

// hooks
import { useColumnHover } from '../useColumnHover';

// types
import { AlignmentLayout } from 'types/design/enums';

describe('useColumnHover', () => {
  it('should not highlight any column before hovering', () => {
    // before
    const { result } = renderHook(() => useColumnHover(true, false, false));

    // result
    expect(result.current.isColumnHighlighted(AlignmentLayout.topLeft)).toBe(false);
  });

  it('should highlight the whole column on hover when isGapAutoVertical is true on a vertical frame', () => {
    // before
    const { result } = renderHook(() => useColumnHover(true, false, false));

    // action
    act(() => result.current.onMouseEnterOption(AlignmentLayout.topLeft));

    // result
    expect(result.current.isColumnHighlighted(AlignmentLayout.left)).toBe(true);
    expect(result.current.isColumnHighlighted(AlignmentLayout.bottomLeft)).toBe(true);
    expect(result.current.isColumnHighlighted(AlignmentLayout.center)).toBe(false);
  });

  it('should clear the highlighted column on mouse leave', () => {
    // before
    const { result } = renderHook(() => useColumnHover(true, false, false));

    // action
    act(() => result.current.onMouseEnterOption(AlignmentLayout.topLeft));
    act(() => result.current.onMouseLeaveOption());

    // result
    expect(result.current.isColumnHighlighted(AlignmentLayout.topLeft)).toBe(false);
  });

  it('should never highlight when the relevant gap-auto flag is off', () => {
    // before
    const { result: notGapAutoVertical } = renderHook(() => useColumnHover(false, false, false));
    const { result: verticalFlagOnHorizontalFrame } = renderHook(() => useColumnHover(true, false, true));

    // action
    act(() => notGapAutoVertical.current.onMouseEnterOption(AlignmentLayout.topLeft));
    act(() => verticalFlagOnHorizontalFrame.current.onMouseEnterOption(AlignmentLayout.topLeft));

    // result
    expect(notGapAutoVertical.current.isColumnHighlighted(AlignmentLayout.topLeft)).toBe(false);
    expect(verticalFlagOnHorizontalFrame.current.isColumnHighlighted(AlignmentLayout.topLeft)).toBe(false);
  });

  it('should highlight the whole row on hover when isGapAutoHorizontal is true on a horizontal frame', () => {
    // before
    const { result } = renderHook(() => useColumnHover(false, true, true));

    // action
    act(() => result.current.onMouseEnterOption(AlignmentLayout.topLeft));

    // result
    expect(result.current.isColumnHighlighted(AlignmentLayout.topCenter)).toBe(true);
    expect(result.current.isColumnHighlighted(AlignmentLayout.topRight)).toBe(true);
    expect(result.current.isColumnHighlighted(AlignmentLayout.left)).toBe(false);
  });
});
