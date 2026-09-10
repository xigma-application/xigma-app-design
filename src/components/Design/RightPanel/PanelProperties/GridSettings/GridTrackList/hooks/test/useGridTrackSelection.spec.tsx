import { act, renderHook } from '@testing-library/react';

// hooks
import { useGridTrackSelection } from '../useGridTrackSelection';

const noMods = { meta: false, shift: false };

describe('useGridTrackSelection', () => {
  it('should start with an empty selection', () => {
    const { result } = renderHook(() => useGridTrackSelection(4));

    expect(result.current.selectedIndices).toEqual([]);
  });

  it('should replace the selection on a plain click', () => {
    const { result } = renderHook(() => useGridTrackSelection(4));

    act(() => result.current.onSelectRow(2, noMods));

    expect(result.current.selectedIndices).toEqual([2]);
  });

  it('should toggle an index with the meta modifier', () => {
    const { result } = renderHook(() => useGridTrackSelection(4));

    act(() => result.current.onSelectRow(1, { meta: true, shift: false }));
    act(() => result.current.onSelectRow(3, { meta: true, shift: false }));

    expect(result.current.selectedIndices).toEqual([1, 3]);

    act(() => result.current.onSelectRow(1, { meta: true, shift: false }));

    expect(result.current.selectedIndices).toEqual([3]);
  });

  it('should select an inclusive range with the shift modifier once an anchor exists', () => {
    const { result } = renderHook(() => useGridTrackSelection(6));

    act(() => result.current.onSelectRow(1, noMods));
    act(() => result.current.onSelectRow(4, { meta: false, shift: true }));

    expect(result.current.selectedIndices).toEqual([1, 2, 3, 4]);
  });

  it('should fall back to a plain select when shift is held with no anchor', () => {
    const { result } = renderHook(() => useGridTrackSelection(4));

    act(() => result.current.onSelectRow(2, { meta: false, shift: true }));

    expect(result.current.selectedIndices).toEqual([2]);
  });

  it('should clear the selection', () => {
    const { result } = renderHook(() => useGridTrackSelection(4));

    act(() => result.current.onSelectRow(2, noMods));
    act(() => result.current.clearSelection());

    expect(result.current.selectedIndices).toEqual([]);
  });

  it('should drop indices that fall outside a shrunken track count', () => {
    const { result, rerender } = renderHook(({ count }) => useGridTrackSelection(count), { initialProps: { count: 4 } });

    act(() => result.current.onSelectRow(3, { meta: true, shift: false }));
    act(() => result.current.onSelectRow(1, { meta: true, shift: false }));
    rerender({ count: 2 });

    expect(result.current.selectedIndices).toEqual([1]);
  });
});
