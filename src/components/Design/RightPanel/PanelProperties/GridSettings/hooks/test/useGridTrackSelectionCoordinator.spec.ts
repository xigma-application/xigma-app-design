import { act, renderHook } from '@testing-library/react';

// hooks
import { useGridTrackSelectionCoordinator } from '../useGridTrackSelectionCoordinator';

describe('useGridTrackSelectionCoordinator', () => {
  it('should default to columns as the active axis', () => {
    const { result } = renderHook(() => useGridTrackSelectionCoordinator());

    expect(result.current.isSuppressed('column')).toBe(false);
    expect(result.current.isSuppressed('row')).toBe(true);
  });

  it('should switch the active axis when the other axis reports a selection', () => {
    const { result } = renderHook(() => useGridTrackSelectionCoordinator());

    act(() => result.current.onSelectionChange('row', true));

    expect(result.current.isSuppressed('row')).toBe(false);
    expect(result.current.isSuppressed('column')).toBe(true);
  });

  it('should ignore a cleared-selection report from an axis that is not the active one', () => {
    const { result } = renderHook(() => useGridTrackSelectionCoordinator());

    act(() => result.current.onSelectionChange('row', true));
    act(() => result.current.onSelectionChange('column', false));

    // row is still active — a stray clear from the already-inactive column axis changes nothing
    expect(result.current.isSuppressed('row')).toBe(false);
    expect(result.current.isSuppressed('column')).toBe(true);
  });

  it('should release the active axis once it reports its own selection cleared', () => {
    const { result } = renderHook(() => useGridTrackSelectionCoordinator());

    act(() => result.current.onSelectionChange('row', true));
    act(() => result.current.onSelectionChange('row', false));

    expect(result.current.isSuppressed('row')).toBe(false);
    expect(result.current.isSuppressed('column')).toBe(false);
  });
});
